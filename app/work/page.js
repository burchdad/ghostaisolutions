import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";

export const metadata = {
  title: "Case Studies - Ghost AI Solutions",
  description: "Structured case studies showing how custom AI infrastructure improves revenue operations, process throughput, and executive visibility.",
};

export default function Work() {
  const topStats = [
    ["Average Response Speed Improvement", "43%"],
    ["Manual Throughput Lift", "30-70%"],
    ["Implementations", "Custom Only"],
  ];

  const items = [
    {
      client: "Multi-Location Service Business",
      industry: "Field Operations",
      problem: "Leads were inconsistently handled across phone, web forms, and dispatch inboxes.",
      solution: "Built a unified qualification, routing, and follow-up engine connected to CRM and operations workflows.",
      outcome: "Reduced lead response time by 43% and improved conversion consistency across locations.",
      bullets: [
        ["Lead response time", "-43%"],
        ["Pipeline visibility", "Unified"],
        ["Follow-up consistency", "Improved"],
      ],
    },
    {
      client: "B2B Sales Team",
      industry: "Revenue Operations",
      problem: "Sales follow-up execution depended on manual reps and fragmented lifecycle ownership.",
      solution: "Implemented an automated multi-step sales workflow with stage-triggered tasks and escalation controls.",
      outcome: "Increased pipeline progression velocity with measurable execution discipline across the team.",
      bullets: [
        ["Manual touchpoints", "Reduced"],
        ["Follow-up coverage", "Expanded"],
        ["Stage progression", "Faster"],
      ],
    },
    {
      client: "Enterprise Operations Group",
      industry: "Multi-Department Reporting",
      problem: "Executive reporting was delayed and spread across disconnected systems.",
      solution: "Deployed a centralized intelligence layer integrating ops, service, and revenue metrics.",
      outcome: "Enabled faster executive decision-making with consolidated KPI visibility across teams.",
      bullets: [
        ["Reporting latency", "Lower"],
        ["Data fragmentation", "Resolved"],
        ["Decision confidence", "Higher"],
      ],
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Proof</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Case Studies Built Around Business Outcomes</h1>
          <p className="mt-5 text-slate-300 sm:text-lg">
            Structured engagements with clear problem framing, custom solution design, and measurable operational results.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {topStats.map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-amber-300/20 bg-slate-950/65 p-5 text-center">
              <p className="text-2xl font-bold text-amber-100">{value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-300">{label}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.client} className="rounded-2xl border border-white/12 bg-slate-950/70 p-6 shadow-sm hover:shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">{it.client}</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{it.industry}</h2>
              <p className="mt-4 text-sm text-slate-300"><span className="font-semibold text-white">Problem:</span> {it.problem}</p>
              <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-white">Solution:</span> {it.solution}</p>
              <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-white">Outcome:</span> {it.outcome}</p>
              <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
                {it.bullets.map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                    <dt className="text-xs text-slate-400">{k}</dt>
                    <dd className="text-base font-bold text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-amber-300/20 bg-slate-950/70 p-8 text-center sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Want Results Like These In Your Operations?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Book a strategy call to review your highest-friction workflow and map a custom implementation plan.
          </p>
          <TrackCTA
            href="/contact"
            event="work_page_book_strategy_call"
            section="work"
            placement="primary"
            label="Book Strategy Call"
            className="mt-7 inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Book Strategy Call
          </TrackCTA>
        </div>
      </div>
    </section>
  );
}
