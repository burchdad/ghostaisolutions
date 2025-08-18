// components/HomeSections.js
export default function HomeSections(){
  return (
    <>
      <ServicesPreview />
      <ProcessPreview />
      <CTA />
    </>
  );
}

function ServicesPreview(){
  const cards = [
    ['AI Strategy & Roadmap','Identify high-ROI use cases, quantify impact, and deliver a phased plan with clear success metrics.'],
    ['Custom AI Agents','Inbox responders, lead qualifiers, ops assistants — integrated with your tools and data.'],
    ['Ethics & Governance','Privacy, audit logs, human-in-the-loop, bias testing, and robust security practices.'],
  ];

  return (
    <section className="py-20 bg-white dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What we do</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            End-to-end delivery — from roadmap to reliable, governed AI agents in production.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map(([title, desc]) => (
            <div key={title} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-shadow bg-white dark:bg-slate-900">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessPreview(){
  const steps = [
    ['Discover','Deep-dive workshops to pick high-impact workflows & define safety requirements.'],
    ['Design','Agent spec, data mapping, guardrails, and KPI plan. You sign off.'],
    ['Build','Implement, integrate, and test. Human-in-the-loop where needed.'],
    ['Launch & Improve','Deploy with dashboards, audit trails, and continuous optimization.'],
  ];
  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How we deliver</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300">A proven 4-step method with measurable checkpoints.</p>
        </div>
        {/* Timeline */}
        <ol className="mt-12 relative pl-12">
          <span className="pointer-events-none absolute left-5 top-2 bottom-2 w-px bg-white/10 dark:bg-white/10" />
          {steps.map(([title,desc], i) => (
            <li key={title} className="relative mb-10 last:mb-0 pl-10">
              <span className="absolute left-2 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold">
                {i+1}
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CTA(){
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to automate the busywork?</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Get your first agent live in weeks — not months. We’ll help you pick the highest-ROI workflow.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700"
          >
            Book a Call
          </a>
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
