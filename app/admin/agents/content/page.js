import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";

function countWithinDays(posts, days) {
  const cutoff = Date.now() - days * 86400000;
  return posts.filter((post) => new Date(post.date).getTime() >= cutoff).length;
}

export const metadata = { title: "Content Agent — Admin", robots: { index: false, follow: false } };

export default function AdminContentAgentPage() {
  requireAdmin("/admin/agents/content");

  const posts = getAllPosts();
  const autoPosts = posts.filter((post) => post.auto);
  const published7Days = countWithinDays(autoPosts, 7);
  const draftBacklogEstimate = Math.max(0, 5 - published7Days);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Content Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Content Pipeline Dashboard</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Auto Posts</p><p className="mt-2 text-3xl font-bold text-cyan-200">{autoPosts.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Published 7 Days</p><p className="mt-2 text-3xl font-bold text-cyan-200">{published7Days}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs text-slate-400 uppercase tracking-[0.14em]">Backlog Estimate</p><p className="mt-2 text-3xl font-bold text-cyan-200">{draftBacklogEstimate}</p></div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Next Actions</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Prioritize one automation post and one case-study style post this week.</li>
            <li>Keep category mix balanced: automation + strategy + tools.</li>
            <li>Add one internal link target per new post to strengthen cluster depth.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
