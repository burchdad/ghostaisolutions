import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: 'Process — Ghost AI Solutions' };

export default function Process(){
  const steps = [
    ['Discover','Deep-dive workshops to pick high-impact workflows & define safety requirements.'],
    ['Design','Agent spec, data mapping, guardrails, and KPI plan. You sign off.'],
    ['Build','Implement, integrate, and test. Human-in-the-loop where needed.'],
    ['Launch & Improve','Deploy with dashboards, audit trails, and continuous optimization.'],
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
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