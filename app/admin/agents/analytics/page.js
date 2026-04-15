import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { listSocialDrafts } from "@/lib/socialDraftStore";
import { requireAdmin } from "@/lib/adminGuard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics Agent — Admin", robots: { index: false, follow: false } };

function daysAgo(days) {
  return Date.now() - days * 86400000;
}

function relativeTime(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-200">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Bar({ label, count, max, color = "bg-cyan-500" }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-slate-300 truncate">{label}</span>
      <div className="flex-1 rounded-full bg-slate-800 h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-slate-200">{count}</span>
    </div>
  );
}

export default async function AnalyticsAgentPage() {
  requireAdmin("/admin/agents/analytics");

  const allPosts = getAllPosts();
  const autoPosts = allPosts.filter((p) => p.auto);
  const drafts = await listSocialDrafts().catch(() => []);

  // ── Content metrics ──────────────────────────────────────────────────────
  const postsLast7  = autoPosts.filter((p) => new Date(p.date).getTime() >= daysAgo(7)).length;
  const postsLast30 = autoPosts.filter((p) => new Date(p.date).getTime() >= daysAgo(30)).length;

  const byCategory = autoPosts.reduce((acc, p) => {
    const k = p.category || "uncategorized";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(...Object.values(byCategory), 1);

  // Source frequency across all auto-posts
  const bySource = autoPosts.flatMap((p) => p.sources || []).reduce((acc, s) => {
    if (s.source) acc[s.source] = (acc[s.source] || 0) + 1;
    return acc;
  }, {});
  const sortedSources = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSource = sortedSources[0]?.[1] || 1;

  // ── Social draft metrics ──────────────────────────────────────────────────
  const published   = drafts.filter((d) => d.status === "published");
  const inReview    = drafts.filter((d) => d.status === "review");
  const blocked     = drafts.filter((d) => d.status === "rejected");
  const lastPublish = published.sort((a, b) => new Date(b.lastPublishedAt || b.updatedAt) - new Date(a.lastPublishedAt || a.updatedAt))[0];

  // Per-platform publish success
  const platformStats = { linkedin: { ok: 0, fail: 0 }, x: { ok: 0, fail: 0 }, facebook: { ok: 0, fail: 0 } };
  for (const d of published) {
    const r = d.publishResults;
    if (!r) continue;
    for (const [platform, stat] of Object.entries(platformStats)) {
      if (r[platform]?.success) stat.ok++;
      else if (r[platform] !== undefined) stat.fail++;
    }
  }

  // ── Content → Social funnel ───────────────────────────────────────────────
  const draftedSlugs = new Set(drafts.map((d) => d.slug).filter(Boolean));
  const postsWithDraft = autoPosts.filter((p) => draftedSlugs.has(p.slug)).length;
  const funnelPct = autoPosts.length > 0 ? Math.round((postsWithDraft / autoPosts.length) * 100) : 0;
  const publishPct = drafts.length > 0 ? Math.round((published.length / drafts.length) * 100) : 0;

  // Source performance in *published* drafts
  const publishedSlugs = new Set(published.map((d) => d.slug).filter(Boolean));
  const publishedPosts = autoPosts.filter((p) => publishedSlugs.has(p.slug));
  const sourcesByPublished = publishedPosts.flatMap((p) => p.sources || []).reduce((acc, s) => {
    if (s.source) acc[s.source] = (acc[s.source] || 0) + 1;
    return acc;
  }, {});
  const sortedPublishedSources = Object.entries(sourcesByPublished).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxPS = sortedPublishedSources[0]?.[1] || 1;

  const CATEGORY_COLORS = {
    "ai-agents":     "bg-indigo-500",
    automation:      "bg-emerald-500",
    tools:           "bg-amber-500",
    strategy:        "bg-rose-500",
    uncategorized:   "bg-slate-500",
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Analytics Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Content &amp; Social Performance</h1>
            <p className="mt-2 text-sm text-slate-300">End-to-end view from blog generation to social distribution.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            Back to Agent Hub
          </Link>
        </div>

        {/* Top-line stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <Stat label="Auto Posts Total" value={autoPosts.length} sub={`${postsLast7} this week · ${postsLast30} this month`} />
          <Stat label="Socially Published" value={published.length} sub={`Last: ${relativeTime(lastPublish?.lastPublishedAt || lastPublish?.updatedAt)}`} />
          <Stat label="Pending Review" value={inReview.length} sub={inReview.length > 0 ? "Action needed" : "Queue clear"} />
          <Stat label="Publish Rate" value={drafts.length ? `${publishPct}%` : "—"} sub={`${published.length} of ${drafts.length} drafted`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">

          {/* Content → Social Funnel */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Content → Social Funnel</h2>
            <p className="mt-1 text-sm text-slate-400">How many posts make it through each stage</p>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Posts Generated</span><span>{autoPosts.length}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-cyan-600" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Entered Draft Store</span><span>{postsWithDraft} ({funnelPct}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-indigo-500" style={{ width: `${funnelPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Moderator Approved → Published</span><span>{published.length} ({publishPct}%)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${publishPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Queued for Review</span><span>{inReview.length}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-amber-500" style={{ width: drafts.length ? `${Math.round((inReview.length / drafts.length) * 100)}%` : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Blocked by Moderator</span><span>{blocked.length}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className="h-3 rounded-full bg-red-500" style={{ width: drafts.length ? `${Math.round((blocked.length / drafts.length) * 100)}%` : "0%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Publish Success */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Platform Publish Success</h2>
            <p className="mt-1 text-sm text-slate-400">Successful vs. failed API calls per platform</p>
            <div className="mt-5 space-y-5">
              {[
                { key: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-sky-500" },
                { key: "x", label: "X (Twitter)", icon: "𝕏", color: "bg-slate-300" },
                { key: "facebook", label: "Facebook", icon: "f", color: "bg-blue-500" },
              ].map(({ key, label, icon, color }) => {
                const { ok, fail } = platformStats[key];
                const total = ok + fail;
                const rate = total > 0 ? Math.round((ok / total) * 100) : null;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-200 font-medium">{icon} {label}</span>
                      <span className="text-slate-400 text-xs">
                        {rate !== null ? `${ok}/${total} (${rate}%)` : "No data yet"}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800">
                      <div className={`h-2.5 rounded-full ${color}`} style={{ width: rate !== null ? `${rate}%` : "0%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {published.length === 0 && (
              <p className="mt-4 text-xs text-slate-500">Data populates after first automated publish run.</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">

          {/* Category Distribution */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Posts by Category</h2>
            <p className="mt-1 text-sm text-slate-400">Content mix across all auto-generated posts</p>
            <div className="mt-5 space-y-3">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <Bar key={cat} label={cat} count={count} max={maxCat} color={CATEGORY_COLORS[cat] || "bg-slate-500"} />
              ))}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-sm text-slate-500">No posts generated yet.</p>
              )}
            </div>
          </div>

          {/* Source Frequency */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Story Sources</h2>
            <p className="mt-1 text-sm text-slate-400">Which sources feed the content pipeline most</p>
            <div className="mt-5 space-y-3">
              {sortedSources.map(([source, count]) => (
                <Bar key={source} label={source} count={count} max={maxSource} />
              ))}
              {sortedSources.length === 0 && (
                <p className="text-sm text-slate-500">Source data populates after first post run.</p>
              )}
            </div>
            {sortedPublishedSources.length > 0 && (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Sources in Published Posts</p>
                <div className="mt-3 space-y-3">
                  {sortedPublishedSources.map(([source, count]) => (
                    <Bar key={source} label={source} count={count} max={maxPS} color="bg-emerald-500" />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Review Queue */}
        {inReview.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
            <h2 className="text-lg font-semibold text-white">Review Queue <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-sm text-amber-300">{inReview.length}</span></h2>
            <p className="mt-1 text-sm text-slate-400">These drafts were flagged by the AI moderator and need human approval before publishing.</p>
            <div className="mt-4 space-y-3">
              {inReview.slice(0, 10).map((draft) => (
                <div key={draft.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{draft.title || draft.slug}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Queued {relativeTime(draft.createdAt)} · ID: {draft.id}</p>
                    </div>
                    <Link href="/admin/agents/social" className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-300/20">
                      Review in Social Agent →
                    </Link>
                  </div>
                  {draft.platformVariants?.linkedin?.text && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">{draft.platformVariants.linkedin.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Published Posts */}
        {published.length > 0 && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Recent Social Publishes</h2>
            <p className="mt-1 text-sm text-slate-400">Last {Math.min(published.length, 8)} posts distributed to social platforms</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-slate-400">
                    <th className="pb-3 pr-4 font-medium">Post</th>
                    <th className="pb-3 pr-4 font-medium">Published</th>
                    <th className="pb-3 pr-4 font-medium">LinkedIn</th>
                    <th className="pb-3 pr-4 font-medium">X</th>
                    <th className="pb-3 font-medium">Facebook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {published
                    .sort((a, b) => new Date(b.lastPublishedAt || b.updatedAt) - new Date(a.lastPublishedAt || a.updatedAt))
                    .slice(0, 8)
                    .map((draft) => {
                      const r = draft.publishResults || {};
                      const check = (ok) => ok ? <span className="text-emerald-400">✓</span> : <span className="text-slate-600">—</span>;
                      return (
                        <tr key={draft.id} className="text-slate-300">
                          <td className="py-3 pr-4 font-medium text-white truncate max-w-[220px]">{draft.title || draft.slug}</td>
                          <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{relativeTime(draft.lastPublishedAt || draft.updatedAt)}</td>
                          <td className="py-3 pr-4">{check(r.linkedin?.success)}</td>
                          <td className="py-3 pr-4">{check(r.x?.success)}</td>
                          <td className="py-3">{check(r.facebook?.success)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* External Analytics Links */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Live Analytics Dashboards</h2>
          <p className="mt-1 text-sm text-slate-400">Behavioral data, traffic sources, and audience growth tracked externally</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Vercel Analytics",
                description: "Page views, unique visitors, top blog posts, scroll depth events",
                href: "https://vercel.com/burchdad/ghostaisolutions/analytics",
                badge: "Traffic",
                color: "border-cyan-300/30 bg-cyan-300/5",
              },
              {
                name: "LinkedIn Page Analytics",
                description: "Post impressions, follower growth, engagement rate per post",
                href: "https://www.linkedin.com/company/ghost-ai-solutions/admin/analytics/",
                badge: "Social",
                color: "border-sky-300/30 bg-sky-300/5",
              },
              {
                name: "Google Search Console",
                description: "Organic impressions, click-through rate, keyword rankings for /blog/",
                href: "https://search.google.com/search-console",
                badge: "SEO",
                color: "border-emerald-300/30 bg-emerald-300/5",
              },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group rounded-xl border p-4 transition-all hover:brightness-110 ${link.color}`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-white group-hover:text-cyan-200">{link.name}</p>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">{link.badge}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{link.description}</p>
                <p className="mt-3 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">Open Dashboard →</p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
