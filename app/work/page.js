import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import PortfolioShowcase from "@/components/PortfolioShowcase";

export const metadata = {
  title: "Work - Ghost AI Solutions",
  description: "Live website builds, product surfaces, and digital systems created by Ghost AI Solutions.",
};

export default function Work() {
  const topStats = [
    ["Live Website Builds", "8"],
    ["Industries Served", "6+"],
    ["Approach", "Custom Only"],
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Proof</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Recent Websites And Digital Systems</h1>
          <p className="mt-5 text-slate-300 sm:text-lg">
            Real public builds across service businesses, restaurants, beauty, construction, technology, and GhostAI product surfaces.
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

        <div className="mt-10">
          <PortfolioShowcase />
        </div>

        <div className="mt-12 rounded-3xl border border-amber-300/20 bg-slate-950/70 p-8 text-center sm:p-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Want Your Website To Look And Convert Better?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Start with a free audit. We will look at your current website, your offer, and your next best conversion path.
          </p>
          <TrackCTA
            href="/start"
            event="work_page_start_audit"
            section="work"
            placement="primary"
            label="Get Free Website Audit"
            className="mt-7 inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Get Free Website Audit
          </TrackCTA>
        </div>
      </div>
    </section>
  );
}
