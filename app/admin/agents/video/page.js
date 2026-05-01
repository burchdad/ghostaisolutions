import { requireAdmin } from "@/lib/adminGuard";
import { getAllPosts } from "@/lib/allPosts";
import VideoScriptClient from "./VideoScriptClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Video Script Agent - Admin",
  robots: { index: false, follow: false },
};

export default function AdminVideoAgentPage() {
  requireAdmin("/admin/agents/video");

  const posts = getAllPosts()
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      content: p.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || "",
      date: p.date,
    }));

  return <VideoScriptClient posts={posts} />;
}
