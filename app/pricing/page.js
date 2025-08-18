export const metadata = { title: 'Pricing — Ghost AI Solutions' };
export default function Pricing(){
  const tiers=[
    {name:'Starter', price:'$2,500', points:['Discovery workshop','1 AI agent','Email & Slack integration','Basic dashboard'], cta:'Get Started'},
    {name:'Growth', price:'$6,500', points:['Everything in Starter','Up to 5 agents','CRM/ERP integrations','KPI dashboard & audit logs'], cta:'Scale Up', highlight:true},
    {name:'Enterprise', price:'Custom', points:['Private deployment options','Advanced guardrails','24/7 support & training','Custom SLAs'], cta:'Talk to Sales'},
  ];
  return (
    <section className="py-20 bg-slate-50 dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Simple plans</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((t)=> (
            <div key={t.name} className={`rounded-2xl border p-6 shadow-sm bg-white dark:bg-slate-900 ${t.highlight? 'ring-2 ring-brand-500':''}`}>
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-4 text-3xl font-extrabold">{t.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                {t.points.map(p=> <li key={p}>{p}</li>)}
              </ul>
              <a href="https://calendly.com/stephen-burch-ghostdefenses/strategy-call" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">{t.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}