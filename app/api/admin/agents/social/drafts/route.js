import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { createSocialDraft, listSocialDrafts } from "@/lib/socialDraftStore";
import { repurposeBlogPost } from "@/lib/socialRepurpose";
import { getPostBySlug } from "@/lib/allPosts";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

function getPostContent(post, fallback = "") {
  return post?.sections
    ?.map((section) =>
      typeof section === "string" ? section : section.text || (Array.isArray(section.items) ? section.items.join(" ") : "")
    )
    .join(" ") || fallback;
}

export async function GET() {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drafts = await listSocialDrafts();
  return NextResponse.json({ success: true, drafts });
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const post = body.slug ? getPostBySlug(body.slug) : null;
    const title = post?.title || body.title;
    const excerpt = post?.excerpt || body.excerpt || "";
    const content = getPostContent(post, body.content || "");

    if (!title || !content) {
      return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
    }

    const repurposed = body.platformVariants ? null : await repurposeBlogPost({ title, excerpt, content });
    const platformVariants = body.platformVariants || repurposed?.variants;
    const draft = await createSocialDraft({
      slug: body.slug || post?.slug || "manual",
      title,
      excerpt,
      sourceType: body.sourceType || "manual-review",
      status: "draft",
      platformVariants,
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create draft", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}