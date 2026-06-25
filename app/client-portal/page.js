import Link from "next/link";
import TrackCTA from "@/components/TrackCTA";

export const metadata = {
  title: "Client Portal - Ghost AI Solutions",
  description:
    "Ghost Growth Portal is the client-facing command center for services, project progress, metrics, support, and next growth moves.",
};

const portalMetrics = [
  { label: "Active Services", value: "Purchased work", detail: "See what Ghost is managing for your business." },
  { label: "Growth Signals", value: "Leads + visibility", detail: "Track where momentum is coming from." },
  { label: "Project Progress", value: "Open work", detail: "Review deliverables, requests, and next steps." },
  { label: "Support", value: "One place", detail: "Request updates, changes, and help without hunting through threads." },
];

const portalAreas = [
  "Website performance, updates, form submissions, and lead capture",
  "SEO, AEO, GEO visibility, keyword movement, and AI-search mentions",
  "CRM pipeline, booked calls, won deals, and follow-up speed",
  "Social media output, engagement, DM leads, and campaign performance",
  "AI assistants, automations, workflows, and operational recommendations",
  "Revenue influenced, missed opportunities, and next recommended moves",
];

export default function ClientPortalPage() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_35%_10%,rgba(251,191,36,0.14),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Ghost Growth Portal</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your Growth Command Center
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              A client-facing portal for seeing what Ghost AI Solutions is managing, what is producing results,
              and what your next growth move should be.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <TrackCTA
                href="/start"
                event="client_portal_request_access"
                section="client_portal"
                placement="hero"
                label="Request Portal Access"
                className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Request Portal Access
              </TrackCTA>
              <Link
                href="/process"
                className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
              >
                See How Ghost Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Current clients can use this page as the portal entry point while the full V2 dashboard is prepared.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/75 p-5 shadow-[0_30px_90px_rgba(8,145,178,0.16)]">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Overview</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Business Health</h2>
                </div>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                  Portal V2
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {portalMetrics.map((metric) => (
                  <article key={metric.label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-slate-300">{metric.detail}</p>
                  </article>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Nova Recommendation</p>
                <p className="mt-2 text-sm text-slate-200">
                  Your next best move will appear here once Ghost connects your services, lead sources, and project milestones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">What This Becomes</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Proof of what you bought, what it is doing, and where it made you money.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {portalAreas.map((area) => (
              <div key={area} className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-sm text-slate-200">
                {area}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
