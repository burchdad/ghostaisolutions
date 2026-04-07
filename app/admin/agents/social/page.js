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

  const accountChecks = [
    {
      name: "LinkedIn Company Page",
      env: "LINKEDIN_ACCESS_TOKEN",
      connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
      scope: "w_member_social, r_organization_social",
    },
    {
      name: "X (Twitter) Account",
      env: "X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET",
      connected: Boolean(
        process.env.X_API_KEY &&
          process.env.X_API_SECRET &&
          process.env.X_ACCESS_TOKEN &&
          process.env.X_ACCESS_TOKEN_SECRET
      ),
      scope: "Tweet create/read",
    },
    {
      name: "Facebook Page",
      env: "FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID",
      connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      scope: "pages_manage_posts, pages_read_engagement",
    },
  ];

  const schedulerReady = Boolean(process.env.SOCIAL_AGENT_CRON_SECRET);
  const allConnected = accountChecks.every((item) => item.connected);

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
          <h2 className="text-lg font-semibold text-white">Account Access + API Status</h2>
          <div className="mt-4 space-y-3">
            {accountChecks.map((item) => (
              <article key={item.name} className="rounded-xl border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{item.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                      item.connected
                        ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                        : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                    }`}
                  >
                    {item.connected ? "Connected" : "Missing"}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">Env: {item.env}</p>
                <p className="mt-1 text-sm text-slate-300">Required scope: {item.scope}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm">
            <p className="text-slate-200">Scheduler secret: {schedulerReady ? "Ready" : "Missing"}</p>
            <p className="mt-1 text-slate-300">
              Automation status: {allConnected && schedulerReady ? "Ready to auto-publish" : "Waiting on account access"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
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
