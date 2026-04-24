import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "For Growth Businesses - Ghost AI Solutions",
  description:
    "Custom AI systems for established businesses that need to remove bottlenecks, improve visibility, and scale operations.",
};

const growthOutcomes = [
  {
    title: "Remove Operational Bottlenecks",
    description:
      "Automate repetitive execution and reduce dependency on manual handoffs across teams.",
  },
  {
    title: "Increase Efficiency",
    description:
      "Improve workflow throughput, reduce cycle times, and free leadership bandwidth for strategic work.",
  },
  {
    title: "Improve Visibility",
    description:
      "Consolidate fragmented systems into executive-ready reporting and decision surfaces.",
  },
];

const systemExamples = [
  "Revenue operations and sales workflow automation",
  "Cross-functional routing and approvals",
  "Internal dashboards and KPI intelligence",
  "Lifecycle automation across CRM, support, and fulfillment",
  "Data pipelines for real-time operational reporting",
  "Custom systems that replace brittle spreadsheet processes",
];

export default function ForGrowthPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">For Growth Businesses</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">Scale Without Operational Bottlenecks</h1>
          <p className="mt-5 text-lg text-slate-300">
            We help scaling teams convert complexity into structured systems that support faster execution and sustainable growth.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {growthOutcomes.map((item) => (
            <article key={item.title} className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-6">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white">High-Impact Build Areas</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {systemExamples.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackCTA
              href="/contact"
              event="growth_page_book_strategy_call"
              section="for_growth"
              placement="primary"
              label="Book Growth Strategy Call"
              className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Book Growth Strategy Call
            </TrackCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
