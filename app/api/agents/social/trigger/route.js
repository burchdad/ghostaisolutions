import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";

export const maxDuration = 60; // Allow up to 60 seconds for this endpoint

function resolveBaseUrl(request) {
  const preferred = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (preferred) return preferred.replace(/\/$/, "");
  if (request?.nextUrl?.origin) return request.nextUrl.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

// Helper to call repurpose API
async function repurposeContent(baseUrl, slug, title, excerpt, content) {
  try {
    const response = await fetch(`${baseUrl}/api/agents/social/repurpose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, excerpt, content }),
    });

    if (!response.ok) {
      return { error: "Repurpose failed" };
    }

    const data = await response.json();
    return data.variants || { error: "No variants returned" };
  } catch (err) {
    return { error: err.message };
  }
}

// Helper to call publish API
async function publishContent(baseUrl, platform, variants) {
  try {
    const response = await fetch(`${baseUrl}/api/agents/social/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        content: variants.linkedin?.text || variants.x?.text || variants.facebook?.text || "",
        linkedinContent: variants.linkedin?.text,
        xContent: variants.x?.text,
        facebookContent: variants.facebook?.text,
      }),
    });

    if (!response.ok) {
      return { error: "Publish failed" };
    }

    const data = await response.json();
    return data.results || { error: "No results" };
  } catch (err) {
    return { error: err.message };
  }
}

async function runTrigger(request) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get("Authorization");
    const cronSecret = getCronSecret();
    const baseUrl = resolveBaseUrl(request);

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret (CRON_SECRET or SOCIAL_AGENT_CRON_SECRET)" },
        { status: 401 }
      );
    }

    // Get queue of auto posts
    const allPosts = getAllPosts();
    const autoPosts = allPosts.filter((p) => p.auto).slice(0, 3); // Get up to 3 recent auto posts

    if (autoPosts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No auto posts in queue to process",
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
        publish: {},
        status: "pending",
      };

      try {
        // Step 1: Repurpose for all platforms
        const variants = await repurposeContent(baseUrl, post.slug, post.title, post.excerpt || "", post.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || "");

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

        // Step 2: Publish to all platforms
        const publishAll = await publishContent(baseUrl, "all", variants);

        if (publishAll.error) {
          postResult.status = "publish_failed";
          postResult.error = publishAll.error;
        } else {
          postResult.publish = publishAll;
          postResult.status = "published";
        }
      } catch (err) {
        postResult.status = "error";
        postResult.error = err.message;
      }

      results.push(postResult);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${results.length} post(s)`,
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
