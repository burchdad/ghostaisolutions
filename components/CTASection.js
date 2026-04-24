import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-300/25 bg-slate-950/70 p-8 text-center shadow-[0_20px_80px_rgba(8,145,178,0.16)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Final CTA</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">Ready To Design Your AI Transformation Roadmap?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-300 sm:text-lg">Book a strategy call to align business goals, system architecture, and delivery scope.</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.35)] transition hover:bg-amber-200"
          >
            Book Strategy Call
          </Link>
        </div>
      </div>
    </section>
  );
}
