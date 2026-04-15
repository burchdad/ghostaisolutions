import fs from "fs";
import path from "path";
import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";
import { listLeads } from "@/lib/leadsStore";

function countWithinDays(posts, days) {
  const cutoff = Date.now() - days * 86400000;
  return posts.filter((p) => new Date(p.date).getTime() >= cutoff).length;
}

const CRO_EXPERIMENTS = [
  { status: "Ready" },
  { status: "Running" },
  { status: "Backlog" },
];

function statusBadgeClass(status) {
  if (status === "Healthy") return "border-emerald-300/40 bg-emerald-300/15 text-emerald-200";
  if (status === "Needs Review") return "border-amber-300/40 bg-amber-300/15 text-amber-200";
  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Agent Hub — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAgentsHubPage() {
  requireAdmin("/admin/agents");

  // Content Agent
  const posts = getAllPosts();
  const autoPosts = posts.filter((p) => p.auto);
  const published7Days = countWithinDays(autoPosts, 7);
  const contentStatus = autoPosts.length === 0 ? "Building" : published7Days >= 1 ? "Healthy" : "Needs Review";

  // SEO Agent
  const workflowExists = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "daily-blog.yml"));
  const missingExcerpt = posts.filter((p) => !p.excerpt).length;
  const missingDate = posts.filter((p) => !p.date).length;
  const seoStatus = !workflowExists ? "Building" : missingExcerpt === 0 && missingDate === 0 ? "Healthy" : "Needs Review";

  // Social Agent
  const linkedinOk = Boolean(process.env.LINKEDIN_ACCESS_TOKEN);
  const xOk = Boolean(
    (process.env.X_CONSUMER_KEY || process.env.X_API_KEY) &&
      (process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET) &&
      process.env.X_ACCESS_TOKEN &&
      (process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET)
  );
  const facebookOk = Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID);
  const schedulerReady = Boolean(process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET);
  const connectedCount = [linkedinOk, xOk, facebookOk].filter(Boolean).length;
  const socialStatus = connectedCount === 0 ? "Building" : connectedCount === 3 && schedulerReady ? "Healthy" : "Needs Review";

  // CRO Agent
  const hasRunningExperiment = CRO_EXPERIMENTS.some((e) => e.status === "Running");
  const hasReadyExperiment = CRO_EXPERIMENTS.some((e) => e.status === "Ready");
  const croStatus = hasRunningExperiment ? "Healthy" : hasReadyExperiment ? "Needs Review" : "Building";

  // Lead Intelligence Agent
  const leads = await listLeads().catch(() => []);
  const leadsReadyOutreach = leads.filter((lead) => ["ready_outreach", "contacted", "replied", "won"].includes(lead.status)).length;
  const leadsStatus = leads.length === 0 ? "Building" : leadsReadyOutreach > 0 ? "Healthy" : "Needs Review";

  // Analytics Agent — healthy when posts exist and social workflow is running
  const hasSocialWorkflow = fs.existsSync(path.join(process.cwd(), ".github", "workflows", "social-publish.yml"));
  const analyticsStatus = autoPosts.length === 0 ? "Building" : hasSocialWorkflow && published7Days >= 1 ? "Healthy" : "Needs Review";

  const AGENTS = [
    {
      name: "Content Agent",
      href: "/admin/agents/content",
      status: contentStatus,
      mission: "Topic pipeline, draft quality, publishing cadence.",
      kpi: "Posts in last 7 days",
    },
    {
      name: "SEO Agent",
      href: "/admin/agents/seo",
      status: seoStatus,
      mission: "Technical SEO checks, schema coverage, sitemap/feed health.",
      kpi: "Indexability checks",
    },
    {
      name: "Social Agent",
      href: "/admin/agents/social",
      status: socialStatus,
      mission: "Repurpose blog output for LinkedIn/X/Facebook variants.",
      kpi: "Repurposing queue",
    },
    {
      name: "CRO Agent",
      href: "/admin/agents/cro",
      status: croStatus,
      mission: "CTA performance, experiment ideas, conversion friction audits.",
      kpi: "Primary CTA click quality",
    },
    {
      name: "Lead Intelligence Agent",
      href: "/admin/agents/leads",
      status: leadsStatus,
      mission: "Website discovery, enrichment, qualification, and personalized outreach automation.",
      kpi: "Qualified-to-outreach conversion",
    },
    {
      name: "Analytics Agent",
      href: "/admin/agents/analytics",
      status: analyticsStatus,
      mission: "Content pipeline metrics, social publish rates, source performance, and review queue.",
      kpi: "Publish rate & funnel conversion",
    },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Growth Ops Control Center</h1>
            <p className="mt-2 text-sm text-slate-300">Each agent has its own dashboard page so you can scale capability independently.</p>
          </div>
          <Link href="/admin" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            Back to Admin
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {AGENTS.map((agent) => (
            <article key={agent.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${statusBadgeClass(agent.status)}`}>
                  {agent.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-300">{agent.mission}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">KPI Focus: {agent.kpi}</p>
              <Link href={agent.href} className="mt-4 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                Open Agent Page →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
