import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = { title: 'FAQ — Ghost AI Solutions' };
export default function FAQ(){
  const faqs=[
    ['What is an AI agent?','Software that can perceive input, reason with context, and act in your tools with safeguards.'],
    ['How do you keep data safe?','Least‑privilege access, encryption, audit logs, human‑in‑the‑loop for critical actions, and vendor due‑diligence.'],
    ['When do we see results?','Most teams see measurable impact in 2–4 weeks after discovery, starting with 1–2 high‑ROI workflows.'],
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight text-center">FAQ</h1>
        <div className="mt-10 divide-y rounded-2xl border">
          {faqs.map(([q,a],i)=> (
            <details key={q} className="group p-6" open={i===0}>
              <summary className="flex cursor-pointer items-center justify-between text-left font-medium">
                <span>{q}</span>
                <svg className="h-5 w-5 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd"/></svg>
              </summary>
              <p className="mt-3 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
