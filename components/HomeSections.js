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
  const cards=[
    ['AI Strategy & Roadmap','Identify high‑ROI use cases, quantify impact, and deliver a phased plan with clear success metrics.'],
    ['Custom AI Agents','Inbox responders, lead qualifiers, ops assistants — integrated with your tools and data.'],
    ['Ethics & Governance','Privacy, audit logs, human‑in‑the‑loop, bias testing, and robust security practices.'],
  ];
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What we do</h2>
          <p className="mt-4 text-slate-600">End‑to‑end delivery — from roadmap to reliable, governed AI agents in production.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map(([title,desc])=> (
            <div key={title} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessPreview(){
  const steps=['Discover','Design','Build','Launch & Improve'];
  const desc=['Deep‑dive workshops to pick high‑impact workflows & define safety requirements.','Agent spec, data mapping, guardrails, and KPI plan. You sign off.','Implement, integrate, and test. Human‑in‑the‑loop where needed.','Deploy with dashboards, audit trails, and continuous optimization.'];
  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How we deliver</h2>
          <p className="mt-4 text-slate-600">A proven 4‑step method with measurable checkpoints.</p>
        </div>
        <ol className="mt-12 relative border-l pl-6 space-y-10">
          {steps.map((s,i)=> (
            <li key={s} className="relative">
              <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full bg-brand-500"/>
              <h3 className="text-lg font-semibold">{i+1}. {s}</h3>
              <p className="text-slate-600">{desc[i]}</p>
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
        <p className="mt-4 text-slate-600">Get your first agent live in weeks — not months. We’ll help you pick the highest‑ROI workflow.</p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a href="https://calendly.com/YOUR-SLUG/intro-call" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-glow hover:bg-brand-700">Book a Call</a>
          <a href="/contact" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-semibold hover:bg-slate-50">Contact Us</a>
        </div>
      </div>
    </section>
  );
}
