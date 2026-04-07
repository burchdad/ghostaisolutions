import fs from "fs";
import path from "path";
import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Dashboard — Ghost AI Solutions",
  robots: { index: false, follow: false },
};

function countPostsLastDays(posts, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return posts.filter((post) => new Date(post.date).getTime() >= cutoff).length;
}

export default function AdminDashboardPage() {
  requireAdmin("/admin");

  const allPosts = getAllPosts();
  const autoPosts = allPosts.filter((post) => post.auto);
  const latestAutoPost = autoPosts[0] || null;
  const autoIn7Days = countPostsLastDays(autoPosts, 7);

  const byCategory = autoPosts.reduce((acc, post) => {
    const key = post.category || "uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const workflowPath = path.join(process.cwd(), ".github", "workflows", "daily-blog.yml");
  const hasWorkflow = fs.existsSync(workflowPath);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const hasAdminPassword = Boolean(process.env.ADMIN_DASHBOARD_PASSWORD);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Operations Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">Monitor blog automation, growth content output, and SEO/feed readiness.</p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
            >
              Log Out
            </button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Auto Blog Posts</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{autoPosts.length}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Published (7 Days)</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{autoIn7Days}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Latest Post</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {latestAutoPost ? latestAutoPost.title : "No auto post yet"}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Latest Date</p>
            <p className="mt-2 text-sm font-semibold text-white">
              {latestAutoPost ? new Date(latestAutoPost.date).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Automation + Agent Health</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Daily blog workflow file: {hasWorkflow ? "Ready" : "Missing"}</li>
              <li>OpenAI API key present: {hasOpenAIKey ? "Ready" : "Missing"}</li>
              <li>Admin password configured: {hasAdminPassword ? "Ready" : "Missing"}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Content Mix</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {Object.keys(byCategory).length ? (
                Object.entries(byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, count]) => (
                    <li key={key} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                      <span className="capitalize">{key.replaceAll("-", " ")}</span>
                      <span className="font-semibold text-cyan-200">{count}</span>
                    </li>
                  ))
              ) : (
                <li>No auto-post categories yet.</li>
              )}
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Agent Dashboard Pages</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <Link href="/admin/agents/content" className="rounded-xl border border-white/15 px-4 py-3 text-slate-200 hover:border-cyan-300/40 hover:text-white">Content Agent</Link>
            <Link href="/admin/agents/seo" className="rounded-xl border border-white/15 px-4 py-3 text-slate-200 hover:border-cyan-300/40 hover:text-white">SEO Agent</Link>
            <Link href="/admin/agents/social" className="rounded-xl border border-white/15 px-4 py-3 text-slate-200 hover:border-cyan-300/40 hover:text-white">Social Agent</Link>
            <Link href="/admin/agents/cro" className="rounded-xl border border-white/15 px-4 py-3 text-slate-200 hover:border-cyan-300/40 hover:text-white">CRO Agent</Link>
            <Link href="/admin/agents/leads" className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 text-cyan-200 hover:bg-cyan-300/20">Lead Funnel Agent</Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/blog" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white">
              View Blog Index
            </Link>
            <Link href="/feed" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white">
              Check RSS Feed
            </Link>
            <a
              href="https://github.com/burchdad/ghostaisolutions/actions/workflows/daily-blog.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white"
            >
              Open Daily Blog Workflow
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
