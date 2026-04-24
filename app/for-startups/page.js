import TrackCTA from "@/components/TrackCTA";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "For Startups - Ghost AI Solutions",
  description:
    "AI-first startup infrastructure for founders launching revenue, operations, and internal systems without technical debt.",
};

const pillars = [
  {
    title: "Build Smart From Day One",
    description:
      "Design your first systems around actual workflows so growth does not break your backend operations.",
  },
  {
    title: "Avoid Early Technical Debt",
    description:
      "Ship with architecture that supports iteration, integrations, and data visibility as your team scales.",
  },
  {
    title: "Launch Scalable Infrastructure",
    description:
      "Stand up core business systems early instead of rebuilding under pressure after traction arrives.",
  },
];

const startupSystems = [
  "Conversion-focused websites and funnels",
  "CRM and lead lifecycle infrastructure",
  "Automation for onboarding and follow-up",
  "Internal operations tooling for founder and team workflows",
  "MVP builds with AI-native capabilities",
  "Growth foundations for reporting and decision-making",
];

export default function ForStartupsPage() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">For Startups</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">Launch With AI-First Infrastructure</h1>
          <p className="mt-5 text-lg text-slate-300">
            We help founders launch with systems built for speed, operational clarity, and long-term scalability.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-6">
              <h2 className="text-xl font-semibold text-white">{pillar.title}</h2>
              <p className="mt-3 text-sm text-slate-300">{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-slate-950/60 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-white">What We Can Build For Startup Teams</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {startupSystems.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <TrackCTA
              href="/contact"
              event="startup_page_book_strategy_call"
              section="for_startups"
              placement="primary"
              label="Book Startup Strategy Call"
              className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Book Startup Strategy Call
            </TrackCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
