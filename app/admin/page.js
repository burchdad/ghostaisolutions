import fs from "fs";
import path from "path";
import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";
import { getProviderConnection } from "@/lib/tokenStore";
import { listSocialDrafts } from "@/lib/socialDraftStore";
import { getTrendStats } from "@/lib/trendStore";
import { getCampaignStats, getSubscriberStats } from "@/lib/newsletterStore";
import { getCompetitorStats } from "@/lib/competitorStore";
import { listLeads } from "@/lib/leadsStore";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Dashboard — Ghost AI Solutions",
  robots: { index: false, follow: false },
};

function countPostsLastDays(posts, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return posts.filter((post) => new Date(post.date).getTime() >= cutoff).length;
}

function inLastDays(value, days) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function relativeTime(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "-";
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "<1h ago";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default async function AdminDashboardPage() {
  requireAdmin("/admin");

  const allPosts = getAllPosts();
  const autoPosts = allPosts.filter((post) => post.auto);
  const latestAutoPost = autoPosts[0] || null;
  const autoIn7Days = countPostsLastDays(autoPosts, 7);
  const autoIn30Days = countPostsLastDays(autoPosts, 30);
  const postsWithImages = autoPosts.filter((post) => Boolean(post.coverImage)).length;
  const coverImageRate = percent(postsWithImages, autoPosts.length);

  const [socialDrafts, leads] = await Promise.all([
    listSocialDrafts().catch(() => []),
    listLeads().catch(() => []),
  ]);

  const socialLast30 = socialDrafts.filter((d) => inLastDays(d.lastPublishedAt || d.updatedAt || d.createdAt, 30));
  const socialPublished30 = socialLast30.filter((d) => d.status === "published").length;
  const socialQueued30 = socialLast30.filter((d) => d.status === "review").length;
  const socialBlocked30 = socialLast30.filter((d) => d.status === "rejected").length;
  const socialReviewedAuto30 = socialLast30.filter((d) => d.sourceType === "automation-audit-reviewed").length;
  const socialLatestAt = socialDrafts.find((d) => d.lastPublishedAt || d.updatedAt || d.createdAt)?.lastPublishedAt
    || socialDrafts.find((d) => d.lastPublishedAt || d.updatedAt || d.createdAt)?.updatedAt
    || socialDrafts.find((d) => d.lastPublishedAt || d.updatedAt || d.createdAt)?.createdAt
    || null;

  const platformSuccess = socialLast30.reduce(
    (acc, d) => {
      if (d.publishResults?.linkedin?.success) acc.linkedin += 1;
      if (d.publishResults?.x?.success) acc.x += 1;
      if (d.publishResults?.facebook?.success) acc.facebook += 1;
      return acc;
    },
    { linkedin: 0, x: 0, facebook: 0 }
  );

  const leadReady = leads.filter((lead) => ["ready_outreach", "contacted", "replied", "won"].includes(lead.status)).length;
  const leadWon = leads.filter((lead) => lead.status === "won").length;

  const trendStats = getTrendStats();
  const campaignStats = getCampaignStats();
  const subscriberStats = getSubscriberStats();
  const competitorStats = getCompetitorStats();

  const byCategory = autoPosts.reduce((acc, post) => {
    const key = post.category || "uncategorized";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const workflowPath = path.join(process.cwd(), ".github", "workflows", "daily-blog.yml");
  const hasWorkflow = fs.existsSync(workflowPath);
  const hasSocialWorkflow = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "social-publish.yml"));
  const hasMonthlyReportWorkflow = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "monthly-ops-report.yml"));
  const hasSmokeMonitorWorkflow = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "production-smoke-monitor.yml"));
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
  const hasAdminPassword = Boolean(process.env.ADMIN_DASHBOARD_PASSWORD);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasCronSecret = Boolean(process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET);
  const metaConnection = getProviderConnection("meta", { orgId: "default" });
  const facebookFallback = getProviderConnection("facebook", { orgId: "default" });
  const isMetaConnected = Boolean(metaConnection?.accessToken || facebookFallback?.accessToken);
  const assetCounts = {
    pages: metaConnection?.assets?.pages?.length || (facebookFallback?.pageId ? 1 : 0),
    instagram: metaConnection?.assets?.instagramAccounts?.length || 0,
    adAccounts: metaConnection?.assets?.adAccounts?.length || 0,
    businesses: metaConnection?.assets?.businessManagers?.length || 0,
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Operations Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">Live control center for content velocity, social distribution, lead flow, and automation health.</p>
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">Snapshot: {new Date().toLocaleString()} · Dynamic runtime data</p>
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
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Content Velocity (30D)</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{autoIn30Days}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Social Published (30D)</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{socialPublished30}</p>
            <p className="mt-1 text-xs text-slate-400">Latest: {relativeTime(socialLatestAt)}</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Leads Ready / Won</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{leadReady} / {leadWon}</p>
            <p className="mt-1 text-xs text-slate-400">Total leads: {leads.length}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Automation + Agent Health</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Daily blog workflow: {hasWorkflow ? "Ready" : "Missing"}</li>
              <li>Social publish workflow: {hasSocialWorkflow ? "Ready" : "Missing"}</li>
              <li>Monthly report workflow: {hasMonthlyReportWorkflow ? "Ready" : "Missing"}</li>
              <li>Smoke monitor workflow: {hasSmokeMonitorWorkflow ? "Ready" : "Missing"}</li>
              <li>OpenAI key configured: {hasOpenAIKey ? "Ready" : "Missing"}</li>
              <li>Resend key configured: {hasResend ? "Ready" : "Missing"}</li>
              <li>Cron secret configured: {hasCronSecret ? "Ready" : "Missing"}</li>
              <li>Admin auth configured: {hasAdminPassword ? "Ready" : "Missing"}</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Content + Distribution Snapshot</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Latest Auto Post</span>
                <span className="max-w-[60%] truncate text-right font-semibold text-cyan-200">{latestAutoPost ? latestAutoPost.title : "No auto post yet"}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Published (7D)</span>
                <span className="font-semibold text-cyan-200">{autoIn7Days}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Posts with Cover Images</span>
                <span className="font-semibold text-cyan-200">{postsWithImages} ({coverImageRate}%)</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Social Review-tier Auto Published (30D)</span>
                <span className="font-semibold text-cyan-200">{socialReviewedAuto30}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Social Queued / Blocked (30D)</span>
                <span className="font-semibold text-cyan-200">{socialQueued30} / {socialBlocked30}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Platform Success (30D)</span>
                <span className="font-semibold text-cyan-200">LI {platformSuccess.linkedin} · X {platformSuccess.x} · FB {platformSuccess.facebook}</span>
              </li>
            </ul>
          </article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Trend + Newsletter + Competitor Intelligence</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Trend Store Total</span>
                <span className="font-semibold text-cyan-200">{trendStats.total}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>High-score Trends</span>
                <span className="font-semibold text-cyan-200">{trendStats.highScore}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Undrafted Trends</span>
                <span className="font-semibold text-cyan-200">{trendStats.undrafted}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Newsletter Active Subs</span>
                <span className="font-semibold text-cyan-200">{subscriberStats.active}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Newsletter Campaigns Sent</span>
                <span className="font-semibold text-cyan-200">{campaignStats.sent}</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                <span>Competitors / Scans</span>
                <span className="font-semibold text-cyan-200">{competitorStats.total} / {competitorStats.scans}</span>
              </li>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
            <Link href="/admin/agents/social/facebook" className="rounded-xl border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 hover:border-cyan-300/40 hover:text-white">
              Manage Meta Connection
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Meta Status</p>
              <p className="mt-2 text-sm font-semibold text-white">{isMetaConnected ? "Connected" : "Not Connected"}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Pages</p>
              <p className="mt-2 text-2xl font-bold text-cyan-200">{assetCounts.pages}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Instagram</p>
              <p className="mt-2 text-2xl font-bold text-cyan-200">{assetCounts.instagram}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Ad Accounts</p>
              <p className="mt-2 text-2xl font-bold text-cyan-200">{assetCounts.adAccounts}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Business Managers</p>
              <p className="mt-2 text-2xl font-bold text-cyan-200">{assetCounts.businesses}</p>
            </article>
          </div>
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
            <a
              href="https://github.com/burchdad/ghostaisolutions/actions/workflows/monthly-ops-report.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white"
            >
              Open Monthly Report Workflow
            </a>
            <a
              href="https://github.com/burchdad/ghostaisolutions/actions/workflows/production-smoke-monitor.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white"
            >
              Open Smoke Monitor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
