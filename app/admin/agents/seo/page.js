import fs from "fs";
import path from "path";
import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "SEO Agent — Admin", robots: { index: false, follow: false } };

export default function AdminSeoAgentPage() {
  requireAdmin("/admin/agents/seo");

  const workflowExists = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "daily-blog.yml"));
  const posts = getAllPosts();
  const missingExcerpt = posts.filter((post) => !post.excerpt).length;
  const missingDate = posts.filter((post) => !post.date).length;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">SEO Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Technical SEO Dashboard</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Workflow File</p><p className="mt-2 text-xl font-bold text-cyan-200">{workflowExists ? "Ready" : "Missing"}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Posts Missing Excerpt</p><p className="mt-2 text-3xl font-bold text-cyan-200">{missingExcerpt}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Posts Missing Date</p><p className="mt-2 text-3xl font-bold text-cyan-200">{missingDate}</p></div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Quick Checks</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/sitemap.xml" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200">Open Sitemap</Link>
            <Link href="/feed" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200">Open RSS Feed</Link>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200">Google Search Console</a>
          </div>
        </div>
      </div>
    </section>
  );
}
