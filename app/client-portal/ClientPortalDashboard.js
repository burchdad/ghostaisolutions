"use client";

import { useMemo, useState } from "react";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "money", label: "Money Made" },
  { id: "progress", label: "Progress" },
  { id: "support", label: "Support" },
  { id: "recommendations", label: "Next Moves" },
];

const overviewStats = [
  { label: "Growth Score", value: "92", detail: "Strong momentum", tone: "cyan" },
  { label: "Revenue Influenced", value: "$18.4k", detail: "This month", tone: "emerald" },
  { label: "Leads Generated", value: "43", detail: "Across tracked channels", tone: "amber" },
  { label: "Active Services", value: "6", detail: "Managed by Ghost", tone: "violet" },
];

const highlights = [
  "Website generated 4 leads overnight",
  "Google visibility improved across 7 priority terms",
  "AI Lead Assistant answered 31 visitor questions",
  "CRM follow-up speed improved to under 6 minutes",
];

const services = [
  {
    name: "Website Build",
    status: "Live",
    result: "14 form submissions",
    description: "Conversion pages, service sections, tracking, and monthly improvements.",
    metrics: ["Traffic +18%", "Forms 14", "Updates 6"],
    accent: "cyan",
  },
  {
    name: "Ghost Engine Optimization",
    status: "Growing",
    result: "Visibility score 88",
    description: "SEO, AEO, and GEO signals for search engines and AI answer surfaces.",
    metrics: ["Keywords +11", "Citations 18", "Mentions 4"],
    accent: "emerald",
  },
  {
    name: "CRM Pipeline",
    status: "Active",
    result: "9 booked calls",
    description: "Lead routing, pipeline tracking, speed-to-lead, and won-deal visibility.",
    metrics: ["Leads 43", "Booked 9", "Won 3"],
    accent: "amber",
  },
  {
    name: "AI Lead Assistant",
    status: "Answering",
    result: "31 conversations",
    description: "Website helper that answers questions, qualifies interest, and escalates leads.",
    metrics: ["Chats 31", "Handoffs 8", "After-hours 12"],
    accent: "violet",
  },
  {
    name: "Social Media Management",
    status: "Publishing",
    result: "18.2k reach",
    description: "Content output, campaign rhythm, audience growth, and DM lead capture.",
    metrics: ["Posts 16", "Reach 18.2k", "DMs 5"],
    accent: "rose",
  },
  {
    name: "Monthly Growth Support",
    status: "Ongoing",
    result: "Next sprint planned",
    description: "Strategy, reporting, updates, and execution support across the growth system.",
    metrics: ["Tasks 12", "Done 8", "Planned 4"],
    accent: "blue",
  },
];

const moneyRows = [
  { source: "Website forms", leads: 14, won: 2, value: "$7,800", note: "Fastest path to quote requests" },
  { source: "Google Business", leads: 11, won: 1, value: "$4,200", note: "Local discovery is improving" },
  { source: "AI Assistant", leads: 8, won: 0, value: "$2,600", note: "Needs stronger booking handoff" },
  { source: "Social + DMs", leads: 5, won: 0, value: "$1,400", note: "Useful warm lead channel" },
  { source: "Referral follow-up", leads: 5, won: 0, value: "$2,400", note: "Track response time closely" },
];

const projectItems = [
  { title: "Homepage conversion refresh", status: "Complete", percent: 100 },
  { title: "Google profile service expansion", status: "In review", percent: 78 },
  { title: "CRM missed-call follow-up", status: "Building", percent: 62 },
  { title: "AI assistant knowledge refresh", status: "Queued", percent: 35 },
  { title: "Monthly growth report", status: "Scheduled", percent: 25 },
];

const recommendations = [
  {
    title: "Add Local Service Ads",
    impact: "Estimated 18-25% more monthly lead volume",
    reason: "Search intent is already converting. Paid local demand can compound the organic gains.",
  },
  {
    title: "Tighten AI assistant booking handoff",
    impact: "Recover 3-5 missed opportunities monthly",
    reason: "Conversations are happening after hours, but more of them should become booked calls.",
  },
  {
    title: "Create service-specific landing pages",
    impact: "Higher quality score and clearer buyer paths",
    reason: "The current website is working. Dedicated pages can sharpen conversion by service line.",
  },
];

const supportActions = [
  "Request a website update",
  "Ask for a campaign change",
  "Send a new offer or service",
  "Request a monthly report",
  "Book a growth review",
  "Ask the AI helper",
];

const toneClasses = {
  amber: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  blue: "border-blue-300/25 bg-blue-300/10 text-blue-100",
  cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  emerald: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  rose: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
};

function Panel({ title, eyebrow, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_28px_90px_rgba(2,6,23,0.35)] ${className}`}>
      <div className="mb-5">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ metric }) {
  return (
    <article className={`rounded-2xl border p-4 ${toneClasses[metric.tone] || toneClasses.cyan}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{metric.label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{metric.value}</p>
      <p className="mt-2 text-sm opacity-90">{metric.detail}</p>
    </article>
  );
}

function ServiceCard({ service }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{service.name}</p>
          <p className="mt-1 text-sm text-slate-400">{service.description}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] ${toneClasses[service.accent]}`}>
          {service.status}
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-cyan-100">{service.result}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {service.metrics.map((metric) => (
          <div key={metric} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-center text-xs font-semibold text-slate-200">
            {metric}
          </div>
        ))}
      </div>
    </article>
  );
}

function OverviewTab() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.74fr]">
        <Panel eyebrow="Today's Highlights" title="What Ghost Is Moving">
          <div className="grid gap-3">
            {highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </Panel>
        <Panel eyebrow="Nova Recommendation" title="Next Best Move">
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-5">
            <p className="text-lg font-semibold text-white">Add Local Service Ads</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Organic and website leads are converting. A small local ads sprint could increase monthly lead volume by an estimated 18-25%.
            </p>
            <button className="mt-5 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200" type="button">
              Review Recommendation
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ServicesTab() {
  return (
    <Panel eyebrow="Purchased Services" title="What Ghost Is Managing">
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.name} service={service} />
        ))}
      </div>
    </Panel>
  );
}

function MoneyTab() {
  const totalLeads = moneyRows.reduce((sum, row) => sum + row.leads, 0);
  const totalWon = moneyRows.reduce((sum, row) => sum + row.won, 0);

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard metric={{ label: "Tracked Leads", value: String(totalLeads), detail: "This month", tone: "cyan" }} />
        <MetricCard metric={{ label: "Won Deals", value: String(totalWon), detail: "Attributed in CRM", tone: "emerald" }} />
        <MetricCard metric={{ label: "Estimated ROI", value: "3.6x", detail: "Based on tracked value", tone: "amber" }} />
      </div>
      <Panel eyebrow="Revenue Story" title="Where Momentum Is Coming From">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr] bg-slate-900/90 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            <span>Source</span>
            <span>Leads</span>
            <span>Won</span>
            <span>Value</span>
          </div>
          {moneyRows.map((row) => (
            <div key={row.source} className="grid grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr] border-t border-white/10 px-4 py-4 text-sm text-slate-200">
              <div>
                <p className="font-semibold text-white">{row.source}</p>
                <p className="mt-1 text-xs text-slate-400">{row.note}</p>
              </div>
              <span>{row.leads}</span>
              <span>{row.won}</span>
              <span className="font-semibold text-emerald-200">{row.value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ProgressTab() {
  return (
    <Panel eyebrow="Project Progress" title="Deliverables And Open Work">
      <div className="grid gap-4">
        {projectItems.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.status}</p>
              </div>
              <span className="text-sm font-semibold text-cyan-100">{item.percent}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300" style={{ width: `${item.percent}%` }} />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SupportTab() {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel eyebrow="Support" title="What Do You Need?">
        <div className="grid gap-3">
          {supportActions.map((action) => (
            <button
              key={action}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
              type="button"
            >
              {action}
            </button>
          ))}
        </div>
      </Panel>
      <Panel eyebrow="Open Requests" title="Client Action Queue">
        <div className="grid gap-3 text-sm">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="font-semibold text-white">Need new team photos</p>
            <p className="mt-1 text-slate-300">Used for homepage trust section and Google profile updates.</p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="font-semibold text-white">Approve service page copy</p>
            <p className="mt-1 text-slate-300">Ready for review before publishing next website update.</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="font-semibold text-white">CRM pipeline audit complete</p>
            <p className="mt-1 text-slate-300">Ghost will recommend one follow-up improvement this week.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function RecommendationsTab() {
  return (
    <Panel eyebrow="Recommendations" title="Next Growth Moves">
      <div className="grid gap-4">
        {recommendations.map((item, index) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Move {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
              </div>
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100">
                High fit
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-amber-100">{item.impact}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.reason}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

export default function ClientPortalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const ActivePanel = useMemo(() => {
    if (activeTab === "services") return ServicesTab;
    if (activeTab === "money") return MoneyTab;
    if (activeTab === "progress") return ProgressTab;
    if (activeTab === "support") return SupportTab;
    if (activeTab === "recommendations") return RecommendationsTab;
    return OverviewTab;
  }, [activeTab]);

  return (
    <div className="rounded-[1.75rem] border border-cyan-300/20 bg-slate-950/80 p-3 shadow-[0_35px_110px_rgba(8,145,178,0.14)]">
      <div className="rounded-[1.35rem] border border-white/10 bg-slate-900/80 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Client Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Good Morning, Gray Matters</h2>
            <p className="mt-2 text-sm text-slate-400">Demo data showing how a connected client portal will feel.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">This Month</p>
            <p className="mt-1 text-xl font-bold text-emerald-200">$18,420</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                activeTab === tab.id
                  ? "bg-cyan-300 text-slate-950 shadow-[0_0_26px_rgba(103,232,249,0.25)]"
                  : "border border-white/10 bg-slate-950/70 text-slate-300 hover:border-cyan-300/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <ActivePanel />
      </div>
    </div>
  );
}
