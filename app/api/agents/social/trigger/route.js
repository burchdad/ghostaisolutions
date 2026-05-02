import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";
import { repurposeBlogPost } from "@/lib/socialRepurpose";
import { createSocialDraft, listSocialDrafts } from "@/lib/socialDraftStore";
import { publishVariants } from "@/lib/socialPublish";

export const maxDuration = 60; // Allow up to 60 seconds for this endpoint

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
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

    // Get already-processed slugs so cron never re-posts or re-queues the same content
    const existingDrafts = await listSocialDrafts().catch(() => []);
    const processedSlugs = new Set(existingDrafts.map((d) => d.slug).filter(Boolean));

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

        if (moderation.status !== "approved") {
          const draft = await createSocialDraft({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            sourceType: "ai-moderator-review",
            status: moderation.status === "blocked" ? "rejected" : "review",
            platformVariants: variants,
          });

          postResult.draftId = draft.id;
          postResult.status = moderation.status === "blocked" ? "blocked_by_moderator" : "queued_for_review";
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
        postResult.status = publishAll.success ? "published" : "publish_partial";

        const draft = await createSocialDraft({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt || "",
          sourceType: "automation-audit",
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
