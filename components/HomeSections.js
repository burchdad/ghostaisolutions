// components/HomeSections.js
import { siteConfig } from "@/lib/siteConfig";
import ROICalculator from "@/components/ROICalculator";
import TrackCTA from "@/components/TrackCTA";

export default function HomeSections(){
  return (
    <>
      <ServicesPreview />
      <Tracks />
      <ProcessPreview />
      <CaseStudies />
      <ROICalculator />
      <CTA />
    </>
  );
}

function ServicesPreview(){
  const cards = [
    ["Revenue Agents", "Qualify, route, and follow up on leads instantly so your pipeline stops leaking opportunities."],
    ["Operations Agents", "Automate repetitive execution across inbox, spreadsheets, and task queues with approval checkpoints."],
    ["Control Layer", "Human-in-the-loop approvals, audit logs, and escalation paths to keep automation accountable."],
  ];

  return (
    <section className="py-20" data-track-section="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">What we build</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">AI systems that create measurable business lift</h2>
          <p className="mt-4 text-slate-300">
            End-to-end from workflow blueprint to production deployment, with performance checkpoints in every sprint.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map(([title, desc]) => (
            <article key={title} className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-6 shadow-[0_15px_50px_rgba(8,145,178,0.12)] transition hover:-translate-y-1">
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm text-slate-300">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tracks(){
  const tracks = [
    ["Real Estate Teams", "Instant lead follow-up, showing coordination, and deal-stage nudges.", "Lead speed-to-contact", "+40-70%"],
    ["Service Businesses", "Auto-qualify inbound requests and route jobs without manual triage.", "Admin hours reduced", "10-30 hrs/week"],
    ["Ecommerce Brands", "Support triage, return workflows, and post-purchase upsell sequences.", "Response SLA", "Under 5 min"],
  ];

  return (
    <section className="py-8 sm:py-12" data-track-section="industry_tracks">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-10">
          <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Deployment tracks by industry</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {tracks.map(([title, desc, metricLabel, metricValue]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                <p className="text-lg font-semibold text-cyan-200">{title}</p>
                <p className="mt-2 text-sm text-slate-300">{desc}</p>
                <div className="mt-5 rounded-xl border border-orange-300/20 bg-orange-300/10 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-orange-200">{metricLabel}</p>
                  <p className="mt-1 text-xl font-black text-white">{metricValue}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessPreview(){
  const steps = [
    ["Discover", "Map your highest-leverage workflow and define business guardrails."],
    ["Architect", "Design prompts, data connectors, escalation logic, and success metrics."],
    ["Ship", "Deploy a production-grade v1 with real users and monitored outcomes."],
    ["Scale", "Expand to adjacent workflows with shared controls and model improvements."],
  ];

  return (
    <section className="py-20" data-track-section="process">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">How your first AI system goes live</h2>
          <p className="mt-4 text-slate-300">A focused 4-step sprint model with clear checkpoints and no vague experimentation.</p>
        </div>

        <ol className="mt-12 relative pl-12">
          <span className="pointer-events-none absolute left-5 top-2 bottom-2 w-px bg-cyan-200/30" />
          {steps.map(([title,desc], i) => (
            <li key={title} className="relative mb-10 rounded-2xl border border-white/10 bg-slate-900/60 p-5 pl-10 last:mb-0">
              <span className="absolute left-2 top-6 inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-slate-900 text-xs font-black">
                {i+1}
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-1 text-slate-300">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CaseStudies(){
  const studies = [
    ["Ghost Investor AI", "Investor workflow intelligence system", "Pipeline triage and summary generation", "4.3x faster analysis loops", "https://github.com/burchdad/ghost-investor-ai"],
    ["Ghost CRM", "Custom relationship and follow-up tooling", "Lead lifecycle automation", "Higher follow-up consistency", "https://github.com/burchdad/ghostcrm"],
    ["Ghost Voice TTS", "Voice stack for conversational automation", "Voice response workflows", "Faster human handoff", "https://github.com/burchdad/ghost-voice-tts"],
  ];

  return (
    <section className="py-20" data-track-section="case_studies">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Proof from the Ghost build ecosystem</h2>
          <p className="mt-4 text-slate-300">
            Real products and experiments already shipped, not just pitch-deck promises.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {studies.map(([title, subtitle, challenge, impact, href]) => (
            <article key={title} className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-300">Case Snapshot</p>
              <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
              <p className="mt-4 text-sm text-slate-300"><span className="font-semibold text-white">Use case:</span> {challenge}</p>
              <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-white">Result:</span> {impact}</p>
              <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                View Repository
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA(){
  return (
    <section className="py-20" data-track-section="final_cta">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/70 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Ready to launch your first AI revenue engine?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Bring one workflow. We will turn it into a production agent stack with measurable lift, clean oversight, and a roadmap to scale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <TrackCTA
              href={siteConfig.calendlyUrl}
              event="homepage_final_book_call"
              section="final_cta"
              placement="primary"
              label="Start a Project"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start a Project
            </TrackCTA>
            <TrackCTA
              href="/work"
              event="homepage_final_case_studies"
              section="final_cta"
              placement="secondary"
              label="Explore Case Studies"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Explore Case Studies
            </TrackCTA>
            <TrackCTA
              href="/contact"
              event="homepage_final_contact"
              section="final_cta"
              placement="tertiary"
              label="Contact Team"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Team
            </TrackCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
