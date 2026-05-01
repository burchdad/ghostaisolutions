import { requireAdmin } from "@/lib/adminGuard";
import { getAllPosts } from "@/lib/allPosts";
import { listGeneratedImages } from "@/lib/imageGen";
import ImageGenClient from "./ImageGenClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Image Generator - Admin",
  robots: { index: false, follow: false },
};

export default function AdminImageGenPage() {
  requireAdmin("/admin/agents/image-gen");

  const images = listGeneratedImages();
  const posts = getAllPosts()
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      hasImage: images.some((img) => img.filename.startsWith(p.slug?.slice(0, 20))),
    }));

  return <ImageGenClient initialImages={images} posts={posts} />;
}
