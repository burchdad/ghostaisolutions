import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import { BOOKING_URL } from "@/lib/constants";

export const metadata = {
  title: "AI-Native Growth Engine — Ghost AI Solutions",
  description:
    "A focused AI-native sprint to deploy revenue and ops agents in 14-30 days with governance built in.",
};

export default function AINativePage() {
  const bullets = [
    "Lead response and qualification in minutes, not hours",
    "Inbox + CRM + ops workflow orchestration with approval gates",
    "Audit-friendly governance layer with escalation paths",
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/75 p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Campaign Landing Page</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl">
            AI-native sprint for teams that need outcomes now.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-300">
            Bring one high-friction workflow. We ship a production AI system in 14-30 days with clear controls, measurable lift, and a scale roadmap.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric k="Time to first deployment" v="14-30 days" />
            <Metric k="Coverage" v="24/7" />
            <Metric k="Model" v="Human + AI" />
          </div>

          <ul className="mt-8 space-y-3 text-slate-200">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <TrackCTA
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              event="start_project_ai_native"
              section="ai_native"
              placement="primary"
              label="Start a Project"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start a Project
            </TrackCTA>
            <TrackCTA
              href="/demo"
              event="landing_ai_native_view_demo"
              section="ai_native"
              placement="secondary"
              label="See Live Demo"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              See Live Demo
            </TrackCTA>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ k, v }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-300">{k}</p>
      <p className="mt-1 text-2xl font-black text-white">{v}</p>
    </div>
  );
}
