import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: "Live Demo — Ghost AI Solutions" };

export default function Demo() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">Live Demo</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          See an AI agent qualify leads, draft replies, and update your tools — end‑to‑end with guardrails.
        </p>

        {/* Loom / video embed (replace src with your own) */}
        <div className="mt-8 aspect-video rounded-2xl overflow-hidden border bg-black">
          <iframe
            src="https://www.loom.com/embed/your-looom-id"
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        {/* Calendly CTA */}
        <div className="mt-8">
          <a
            href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
          >
            Book a Live Walkthrough
          </a>
        </div>
      </div>
    </section>
  );
}
