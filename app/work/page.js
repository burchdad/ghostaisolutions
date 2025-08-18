export const metadata = { title: 'Case Studies — Ghost AI Solutions' };
export default function Work(){
  const items=[
    {title:'E‑commerce: Lead Qualifier', bullets:[['Time to first response','−93%'],['Demo bookings','+31%'],['CSAT','4.6/5']], desc:'An inbox agent scored and routed 4k monthly inquiries.'},
    {title:'Operations: Invoice Agent', bullets:[['Processing time','−58%'],['Exception rate','−37%'],['Accuracy','99.2%']], desc:'Automated matching & escalation for 12k invoices/mo.'},
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Case Studies</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((it)=> (
            <article key={it.title} className="rounded-2xl border p-6 shadow-sm hover:shadow-lg">
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{it.desc}</p>
              <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
                {it.bullets.map(([k,v])=> (
                  <div key={k} className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
