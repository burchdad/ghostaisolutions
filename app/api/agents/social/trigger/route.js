import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";
import { repurposeBlogPost } from "@/lib/socialRepurpose";
import { createSocialDraft } from "@/lib/socialDraftStore";
import { publishVariants } from "@/lib/socialPublish";
import { getPublishedSlugs, markSlugsPublished } from "@/lib/publishedSlugsStore";

export const maxDuration = 60; // Allow up to 60 seconds for this endpoint

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

async function notifySlackBlock(slug, title, reasons) {
  const webhook = process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhook) return;
  try {
    const reasonText = Array.isArray(reasons) && reasons.length ? reasons.join("; ") : "No reason provided";
    const blocks = [
      { type: "header", text: { type: "plain_text", text: "🚫 Social Post Blocked by Moderator", emoji: true } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Post:* ${title || slug}` },
          { type: "mrkdwn", text: `*Slug:* \`${slug}\`` },
          { type: "mrkdwn", text: `*Reason:* ${reasonText}` },
          { type: "mrkdwn", text: `*Time:* ${new Date().toISOString()}` },
        ],
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "Review this post in the admin dashboard before publishing." }],
      },
    ];
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (_) {
    // Best-effort — don't break the pipeline
  }
}

async function runTrigger(request) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get("Authorization");
    const cronSecret = getCronSecret();
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret (CRON_SECRET or SOCIAL_AGENT_CRON_SECRET)" },
        { status: 401 }
      );
    }

    // Get already-published slugs from the persistent store — works across Vercel invocations
    const processedSlugs = await getPublishedSlugs();

    // Get queue of recent auto posts, skip any already in the draft store
    const allPosts = getAllPosts();
    const autoPosts = allPosts
      .filter((p) => p.auto && !processedSlugs.has(p.slug))
      .slice(0, 3);

    if (autoPosts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No new auto posts to process",
          skipped: processedSlugs.size,
          processed: [],
        },
        { status: 200 }
      );
    }

    // Process each post
    const results = [];
    for (const post of autoPosts) {
      const postResult = {
        slug: post.slug,
        title: post.title,
        repurpose: null,
        draftId: null,
        status: "pending",
      };

      try {
        const content = post.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || "";
        const repurposed = await repurposeBlogPost({
          title: post.title,
          excerpt: post.excerpt || "",
          content,
          slug: post.slug,
        });
        const variants = repurposed.variants;
        const moderation = repurposed.moderation;

        if (variants.error) {
          postResult.status = "repurpose_failed";
          postResult.error = variants.error;
          results.push(postResult);
          continue;
        }

        postResult.repurpose = {
          linkedin: variants.linkedin?.text?.substring(0, 100) + "..." || "N/A",
          x: variants.x?.text?.substring(0, 50) + "..." || "N/A",
          facebook: variants.facebook?.text?.substring(0, 50) + "..." || "N/A",
        };

        postResult.moderation = moderation;

        if (moderation.status === "blocked") {
          const draft = await createSocialDraft({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            sourceType: "ai-moderator-review",
            status: "rejected",
            platformVariants: variants,
          });

          await notifySlackBlock(post.slug, post.title, moderation.reasons);

          postResult.draftId = draft.id;
          postResult.status = "blocked_by_moderator";
          results.push(postResult);
          continue;
        }

        const publishAll = await publishVariants({
          platform: "all",
          linkedinContent: variants.linkedin?.text,
          xContent: variants.x?.text,
          facebookContent: variants.facebook?.text,
        });

        postResult.publish = publishAll.results;
        postResult.status = publishAll.success
          ? moderation.status === "review"
            ? "published_with_review_flags"
            : "published"
          : "publish_partial";

        const draft = await createSocialDraft({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || "",
          sourceType: moderation.status === "review" ? "automation-audit-reviewed" : "automation-audit",
          status: publishAll.success ? "published" : "review",
          platformVariants: variants,
          publishResults: publishAll.results,
          lastPublishedAt: publishAll.success ? new Date().toISOString() : null,
        });

        postResult.draftId = draft.id;
      } catch (err) {
        postResult.status = "error";
        postResult.error = err.message;
      }

      results.push(postResult);
    }

    // Persist all processed slugs so they're never re-posted across invocations
    const slugsToMark = results.map((r) => r.slug).filter(Boolean);
    await markSlugsPublished(slugsToMark).catch(() => null);

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${results.length} AI-moderated post(s)`,
        skipped: processedSlugs.size,
        processed: results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Trigger error:", err);
    return NextResponse.json(
      { error: "Trigger failed", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return runTrigger(request);
}

export async function POST(request) {
  return runTrigger(request);
}
