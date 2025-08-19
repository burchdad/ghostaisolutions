import Breadcrumbs from "@/components/Breadcrumbs";
import TrackCTA from "@/components/TrackCTA";
import DemoPlayer from "@/components/DemoPlayer";

export const metadata = { title: "Live Demo — Ghost AI Solutions" };

export default function Demo() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        <h1 className="text-4xl font-extrabold tracking-tight">Live Demo</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl">
          See an agent qualify leads, draft replies, and update tools — end‑to‑end with guardrails.
        </p>

        <DemoPlayer />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Lead Qualifier", "Auto-scores & books demos from inbound."],
            ["Inbox Agent", "Drafts answers with tone controls & approvals."],
            ["Ops Agent", "Matches invoices & updates sheets/ERP."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border p-4 bg-white dark:bg-slate-900">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <TrackCTA
            href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
            event="demo_book_call_click"
          >
            Book a Live Walkthrough
          </TrackCTA>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
