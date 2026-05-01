import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { generateCoverImage, listGeneratedImages } from "@/lib/imageGen";
import { getAllPosts } from "@/lib/allPosts";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = listGeneratedImages();
  const posts = getAllPosts().slice(0, 20).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    hasImage: images.some((img) => img.filename.startsWith(p.slug)),
  }));

  return NextResponse.json({ images, posts });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { title, excerpt, slug, style } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const result = await generateCoverImage({ title, excerpt, slug, style });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, url: result.url, prompt: result.prompt });
}
