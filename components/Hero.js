export default function Hero(){
  return (
    <section className="relative gradient-hero text-white">
      <div className="absolute inset-0 bg-grid bg-grid-size opacity-20 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 items-center gap-10">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Automate Smarter. <span className="text-brand-300">Scale Faster.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-200 max-w-2xl">
              We design and deploy <strong>AI agents</strong> that answer customers, qualify leads, and streamline operations — with ethical safeguards and measurable ROI.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://calendly.com/YOUR-SLUG/intro-call" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-ink shadow hover:shadow-lg">
                <span>Get a Strategy Call</span>
              </a>
              <a href="/work" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
                <span>See Results</span>
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 opacity-90">
              <Stat k="Avg. admin time saved" v="42%"/>
              <Stat k="Lead conversion" v="+28%"/>
              <Stat k="Agent coverage" v="24/7"/>
              <Stat k="Governance baked in" v="⩚ Risk"/>
            </div>
          </div>
          <HeroDemo />
        </div>
        <Marquee />
      </div>
    </section>
  );
}

function Stat({k,v}){
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold">{v}</p>
      <p className="text-sm text-slate-300">{k}</p>
    </div>
  );
}

function HeroDemo(){
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
        <div className="aspect-[16/10] rounded-xl bg-slate-900/70 ring-1 ring-white/10 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-4 p-6 w-full">
            {['Lead Qualifier','Inbox Agent','Ops Agent','Analytics Agent'].map((t,i)=> (
              <div key={t} className="rounded-xl p-4 bg-slate-800/70 ring-1 ring-white/10">
                <p className="text-sm text-slate-300">{t}</p>
                <p className="mt-2 text-2xl font-bold">{['Booking demo…','Reply drafted ✓','Invoice matched ✓','KPI updated ✓'][i]}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-300">Demo UI — your agent mix is tailored to your workflows.</p>
      </div>
    </div>
  );
}

function Marquee(){
  const brands=['Acme Bank','Shoply','Nimbus Cloud','HealthCore','Luma','Northstar'];
  return (
    <div className="mt-16 opacity-80">
      <p className="text-center text-sm text-slate-300">Trusted by modern teams</p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center text-white/70">
        {brands.map(b=> <div key={b} className="text-center text-sm">{b}</div>)}
      </div>
    </div>
  );
}
