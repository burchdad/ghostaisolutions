import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

const AGENTS = [
  {
    name: "Content Agent",
    href: "/admin/agents/content",
    status: "Healthy",
    mission: "Topic pipeline, draft quality, publishing cadence.",
    kpi: "Posts in last 7 days",
  },
  {
    name: "SEO Agent",
    href: "/admin/agents/seo",
    status: "Healthy",
    mission: "Technical SEO checks, schema coverage, sitemap/feed health.",
    kpi: "Indexability checks",
  },
  {
    name: "Social Agent",
    href: "/admin/agents/social",
    status: "Needs Review",
    mission: "Repurpose blog output for LinkedIn/X/Facebook variants.",
    kpi: "Repurposing queue",
  },
  {
    name: "CRO Agent",
    href: "/admin/agents/cro",
    status: "Healthy",
    mission: "CTA performance, experiment ideas, conversion friction audits.",
    kpi: "Primary CTA click quality",
  },
  {
    name: "Lead Funnel Agent",
    href: "/admin/agents/leads",
    status: "Building",
    mission: "Stage tracking, lead scoring, routing to booking and blueprint follow-ups.",
    kpi: "MQL to booking",
  },
];

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Agent Hub — Admin",
  robots: { index: false, follow: false },
};

export default function AdminAgentsHubPage() {
  requireAdmin("/admin/agents");

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
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-200">
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
