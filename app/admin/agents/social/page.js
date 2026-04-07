import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "Social Agent — Admin", robots: { index: false, follow: false } };

function latestQueue(posts, limit = 5) {
  return posts
    .filter((post) => post.auto)
    .slice(0, limit)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      channels: ["LinkedIn", "X", "Facebook"],
    }));
}

export default function AdminSocialAgentPage() {
  requireAdmin("/admin/agents/social");
  const queue = latestQueue(getAllPosts());

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Social Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Repurposing Queue Dashboard</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Queue</h2>
          <div className="mt-4 space-y-3">
            {queue.length ? (
              queue.map((item) => (
                <article key={item.slug} className="rounded-xl border border-white/10 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">Channels</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.channels.map((channel) => (
                      <span key={channel} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-200">{channel}</span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-300">No auto posts available to repurpose yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
