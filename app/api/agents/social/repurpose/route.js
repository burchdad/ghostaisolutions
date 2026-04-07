import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";
import { repurposeBlogPost } from "@/lib/socialRepurpose";

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, title, excerpt, content } = body;

    // If slug provided, fetch from posts
    let blogData = { title, excerpt, content };
    if (slug) {
      const allPosts = getAllPosts();
      const post = allPosts.find((p) => p.slug === slug);
      if (post) {
        blogData = {
          title: post.title || title,
          excerpt: post.excerpt || excerpt,
          content: post.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || content,
        };
      }
    }

    if (!blogData.title || !blogData.content) {
      return NextResponse.json(
        { error: "Missing required fields: title and content" },
        { status: 400 }
      );
    }

    const repurposed = await repurposeBlogPost(blogData);

    return NextResponse.json(
      {
        success: true,
        source: { title: blogData.title, slug },
        variants: repurposed.variants,
        moderation: repurposed.moderation,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Repurpose error:", err);
    return NextResponse.json(
      { error: "Failed to repurpose content", details: err.message },
      { status: 500 }
    );
  }
}
