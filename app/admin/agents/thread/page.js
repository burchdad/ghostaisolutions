import { requireAdmin } from "@/lib/adminGuard";
import { getAllPosts } from "@/lib/allPosts";
import ThreadAgentClient from "./ThreadAgentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thread Agent - Admin", robots: { index: false, follow: false } };

export default function AdminThreadPage() {
  requireAdmin("/admin/agents/thread");

  const recentPosts = getAllPosts().slice(0, 20).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    content: p.sections?.map((s) => (typeof s === "string" ? s : s.text || (s.items || []).join(" ") || "")).join(" ") || "",
  }));

  return <ThreadAgentClient posts={recentPosts} />;
}
