export const metadata = { title: 'Services — Ghost AI Solutions' };
export default function Services(){
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Services</h1>
        <p className="mt-4 text-slate-600 max-w-2xl">End‑to‑end delivery — from roadmap to reliable, governed AI agents in production.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {title:'AI Strategy & Roadmap',desc:'Identify high‑ROI use cases, quantify impact, and deliver a phased plan with clear success metrics.'},
            {title:'Custom AI Agents',desc:'Inbox responders, lead qualifiers, ops assistants — integrated with your tools and data.'},
            {title:'Ethics & Governance',desc:'Privacy, audit logs, human‑in‑the‑loop, bias testing, and robust security practices.'}
          ].map((c)=> (
            <div key={c.title} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
