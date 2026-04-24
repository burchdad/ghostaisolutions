import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SectionWrapper from "@/components/SectionWrapper";
import CTASection from "@/components/CTASection";
import ScrollDepthTracker from "@/components/ScrollDepthTracker";
import SectionViewTracker from "@/components/SectionViewTracker";
import TrackCTA from "@/components/TrackCTA";

const stageSolutions = [
  {
    title: "Launch With AI-First Infrastructure",
    audience: "Startups / Early-Stage",
    description: "For founders building the right systems from day one.",
    href: "/for-startups",
    cta: "Explore Startup Solutions",
  },
  {
    title: "Scale Without Operational Bottlenecks",
    audience: "Growth / Scaling Businesses",
    description: "Automate operations, improve visibility, and accelerate growth.",
    href: "/for-growth",
    cta: "Explore Growth Solutions",
  },
  {
    title: "Enterprise AI Transformation",
    audience: "Enterprise / Large Organizations",
    description: "Deploy secure, enterprise-grade AI systems across your organization.",
    href: "/enterprise",
    cta: "Explore Enterprise Solutions",
  },
];

const capabilityCategories = [
  {
    title: "Growth & Revenue Systems",
    value: "Increase qualified pipeline flow and speed-to-close through custom sales infrastructure.",
    technology: "CRM architecture, lead orchestration, funnel automation, and conversion intelligence.",
  },
  {
    title: "Operational Automation",
    value: "Eliminate execution bottlenecks and reduce labor-heavy handoffs across teams.",
    technology: "Workflow engines, approvals, routing logic, integrations, and auditability.",
  },
  {
    title: "Executive Intelligence",
    value: "Give leadership real-time visibility into performance, risk, and opportunity.",
    technology: "Unified reporting layers, data pipelines, KPI dashboards, and predictive surfaces.",
  },
  {
    title: "Customer Experience Systems",
    value: "Improve response speed and consistency across high-volume customer interactions.",
    technology: "Voice systems, messaging workflows, qualification logic, and human handoff controls.",
  },
  {
    title: "Custom AI Platforms",
    value: "Build durable, business-specific infrastructure instead of stitching together generic tools.",
    technology: "Full-stack application engineering, secure architecture, and AI-native product components.",
  },
];

const proofStats = [
  { label: "Average Implementation Window", value: "2-8 weeks" },
  { label: "Manual Throughput Improvement", value: "30-70%" },
  { label: "Projects With KPI Dashboards", value: "100%" },
  { label: "Template Reuse", value: "0" },
];

const caseStudies = [
  {
    client: "Multi-Location Services Brand",
    problem: "Lead response was fragmented across inboxes, calls, and field dispatch.",
    solution: "Built a centralized qualification and routing system with automation and escalation controls.",
    outcome: "Reduced lead response time by 43% and improved appointment conversion consistency.",
  },
  {
    client: "B2B Sales Organization",
    problem: "Revenue team depended on manual multi-step follow-up and inconsistent CRM discipline.",
    solution: "Implemented automated multi-step sales follow-up workflows tied to lifecycle stages.",
    outcome: "Standardized follow-up execution and increased pipeline progression velocity.",
  },
  {
    client: "Enterprise Operations Team",
    problem: "Executive reporting was spread across disconnected tools with delayed data visibility.",
    solution: "Deployed a unified reporting layer integrating operations, revenue, and fulfillment data.",
    outcome: "Centralized reporting across fragmented systems for faster executive decision-making.",
  },
];

const bestFit = [
  "Growing businesses with operational complexity and cross-functional workflows",
  "Teams outgrowing spreadsheets or disconnected SaaS tools",
  "Companies pursuing measurable AI transformation and automation",
  "Businesses with repeatable workflows and KPI-driven decision cycles",
];

const notIdealFit = [
  "DIY or low-budget shoppers looking for generic packaged builds",
  "Tiny one-off automation requests without strategic business impact",
  "Teams without process ownership or operational maturity",
];

const processSteps = [
  { title: "Discovery & Strategy", description: "We map business priorities, workflow constraints, and measurable KPIs before architecture begins." },
  { title: "Architecture & Planning", description: "Design a custom solution blueprint with integrations, governance controls, and rollout sequencing." },
  { title: "Build & Deployment", description: "Engineer and deploy production-ready systems aligned to your operational environment." },
  { title: "Optimize & Scale", description: "Iterate based on data, expand proven workflows, and continuously improve system performance." },
];

export default function Page() {
  return (
    <>
      <ScrollDepthTracker />
      <SectionViewTracker />
      <HeroSection />

      <SectionWrapper
        id="segmentation"
        eyebrow="Solutions By Stage"
        title="Choose The Track That Matches Your Business Maturity"
        description="Every engagement is custom-built, but our strategy starts with your current stage and growth constraints."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {stageSolutions.map((item) => (
            <article key={item.title} className="rounded-2xl border border-amber-300/25 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(217,119,6,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">{item.audience}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
              <TrackCTA
                href={item.href}
                event="homepage_stage_solution_click"
                section="segmentation"
                placement={item.audience}
                label={item.cta}
                className="mt-5 inline-flex rounded-xl border border-amber-300/35 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/10"
              >
                {item.cta}
              </TrackCTA>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="capabilities"
        eyebrow="Capabilities"
        title="Business Solution Categories"
        description="We lead with operational and revenue outcomes, then engineer the technology stack that makes them real."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilityCategories.map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/15 bg-slate-950/60 p-6">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-200">{item.value}</p>
              <p className="mt-3 text-sm text-slate-400"><span className="font-semibold text-amber-200">How we deliver:</span> {item.technology}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="founder"
        eyebrow="Founder"
        title="Built By Engineers. Designed For Operators."
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <article className="rounded-2xl border border-white/15 bg-slate-950/65 p-7">
            <h3 className="text-2xl font-semibold text-white">Stephen Burch</h3>
            <p className="mt-2 text-sm uppercase tracking-[0.16em] text-amber-200">Senior Software Engineer / AI Architect</p>
            <p className="mt-4 text-slate-300">
              Founder of Ghost AI Solutions. Stephen has designed and shipped enterprise systems, custom platforms, and automation stacks for teams
              that need reliable infrastructure aligned to real operations.
            </p>
            <p className="mt-3 text-slate-300">
              Ghost operates as a mission-driven boutique consultancy: senior engineering, strategic collaboration, and fully custom builds that compound business value.
            </p>
          </article>
          <article className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Authority Signals</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li>Enterprise systems architecture and integration experience</li>
              <li>Builder of custom AI platforms and operational automation systems</li>
              <li>Hands-on engineering leadership from strategy through deployment</li>
              <li>Boutique delivery model with direct founder involvement</li>
            </ul>
          </article>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="proof"
        eyebrow="Proof"
        title="Structured Case Studies, Not Vague Claims"
        description="We measure outcomes against operational bottlenecks, revenue friction, and decision latency."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-amber-300/20 bg-slate-950/70 p-5 text-center">
              <p className="text-2xl font-bold text-amber-100">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {caseStudies.map((item) => (
            <article key={item.client} className="rounded-2xl border border-white/10 bg-slate-950/55 p-6 text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">{item.client}</p>
              <p className="mt-4 text-sm"><span className="font-semibold text-white">Problem:</span> {item.problem}</p>
              <p className="mt-2 text-sm"><span className="font-semibold text-white">Solution:</span> {item.solution}</p>
              <p className="mt-2 text-sm"><span className="font-semibold text-white">Outcome:</span> {item.outcome}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="fit"
        eyebrow="Qualification"
        title="Who We Work Best With"
        description="We are best aligned with organizations treating AI as strategic infrastructure, not a one-off experiment."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-6">
            <h3 className="text-xl font-semibold text-white">Best Fit</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {bestFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-300/20 bg-slate-950/55 p-6">
            <h3 className="text-xl font-semibold text-white">Not Ideal Fit</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {notIdealFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="process"
        eyebrow="Process"
        title="A Structured Engagement Model For Custom Delivery"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-white/15 bg-slate-950/65 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{step.description}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="next-step"
        eyebrow="Next Step"
        title="Need A Strategic View Before Build?"
        description="Book a strategy call for architecture guidance, timeline planning, and best-fit scope alignment."
      >
        <div className="flex flex-wrap justify-center gap-4">
          <TrackCTA
            href="/contact"
            event="homepage_book_strategy_call"
            section="next_step"
            placement="primary"
            label="Book Strategy Call"
            className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Book Strategy Call
          </TrackCTA>
          <Link
            href="/services"
            className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-amber-300/60 hover:bg-amber-300/10"
          >
            Explore Solutions
          </Link>
        </div>
      </SectionWrapper>

      <CTASection />
    </>
  );
}
