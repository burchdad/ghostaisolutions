export const metadata = { title: 'Process — Ghost AI Solutions' };
export default function Process(){
  const steps = [
    ['Discover','Deep‑dive workshops to pick high‑impact workflows & define safety requirements.'],
    ['Design','Agent spec, data mapping, guardrails, and KPI plan. You sign off.'],
    ['Build','Implement, integrate, and test. Human‑in‑the‑loop where needed.'],
    ['Launch & Improve','Deploy with dashboards, audit trails, and continuous optimization.'],
  ];
  return (
    <section className="py-20 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Process</h1>
        <ol className="mt-10 relative border-l pl-6 space-y-10">
          {steps.map(([title,desc],i)=> (
            <li key={title} className="relative">
              <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full bg-brand-500"/>
              <h3 className="text-lg font-semibold">{i+1}. {title}</h3>
              <p className="text-slate-600">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
