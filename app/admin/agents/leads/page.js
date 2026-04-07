import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "Lead Funnel Agent — Admin", robots: { index: false, follow: false } };

const stages = [
  { name: "New Inbound", count: 14, note: "Form submissions and first-touch chat leads" },
  { name: "Qualified", count: 8, note: "Meets budget/timeline/fit thresholds" },
  { name: "Booked", count: 4, note: "Calendar booked with decision-maker" },
  { name: "Proposal", count: 2, note: "Active scope and commercial review" },
];

export default function AdminLeadsAgentPage() {
  requireAdmin("/admin/agents/leads");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Lead Funnel Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Built-In Lead Funnel Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">This is your base funnel page to grow into full routing, scoring, and SLA tracking.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => (
            <article key={stage.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{stage.name}</p>
              <p className="mt-2 text-3xl font-bold text-cyan-200">{stage.count}</p>
              <p className="mt-2 text-sm text-slate-300">{stage.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Funnel Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/contact#blueprint" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white">Open Blueprint CTA</Link>
            <a href="https://cal.read.ai/ghost-ai-solutions" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/15 px-4 py-2 text-slate-200 hover:border-cyan-300/40 hover:text-white">Open Booking Funnel</a>
            <Link href="/chatbot" className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-cyan-200 hover:bg-cyan-300/20">Audit Ghostbot Intake</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
