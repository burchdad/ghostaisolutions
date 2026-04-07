import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "CRO Agent — Admin", robots: { index: false, follow: false } };

const experiments = [
  { name: "Hero CTA Label", hypothesis: "Use outcome language to improve click quality", status: "Ready" },
  { name: "Proof Strip Position", hypothesis: "Move proof above supporting links to improve trust", status: "Running" },
  { name: "Blueprint Offer Copy", hypothesis: "Specific time promise improves opt-in rate", status: "Backlog" },
];

export default function AdminCroAgentPage() {
  requireAdmin("/admin/agents/cro");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">CRO Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Conversion Optimization Dashboard</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Primary CTA Priority</p><p className="mt-2 text-xl font-bold text-cyan-200">Enabled</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Experiment Cadence</p><p className="mt-2 text-xl font-bold text-cyan-200">Weekly</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Current Focus</p><p className="mt-2 text-xl font-bold text-cyan-200">Hero + Blueprint</p></div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Experiment Queue</h2>
          <div className="mt-4 space-y-3">
            {experiments.map((exp) => (
              <article key={exp.name} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{exp.name}</p>
                  <span className="rounded-full border border-cyan-300/30 px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-cyan-200">{exp.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{exp.hypothesis}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
