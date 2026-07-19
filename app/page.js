import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SectionWrapper from "@/components/SectionWrapper";
import CTASection from "@/components/CTASection";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import ScrollDepthTracker from "@/components/ScrollDepthTracker";
import SectionViewTracker from "@/components/SectionViewTracker";
import TrackCTA from "@/components/TrackCTA";

export const metadata = {
  title: "Ghost AI Solutions | Websites, Automation, and AI Systems",
  description:
    "Ghost AI Solutions builds custom websites, lead funnels, workflow automation, and AI systems for businesses that need cleaner operations and measurable growth.",
  alternates: {
    canonical: "https://www.ghostai.solutions/",
  },
};

const homepageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Ghost AI Solutions build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ghost AI Solutions builds custom websites, lead funnels, workflow automation, AI agents, and operational systems for businesses that need clearer growth and execution workflows.",
      },
    },
    {
      "@type": "Question",
      name: "Who is Ghost AI Solutions best for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ghost AI Solutions is best for growing businesses with repeatable workflows, lead capture needs, operational complexity, or teams outgrowing disconnected tools and spreadsheets.",
      },
    },
    {
      "@type": "Question",
      name: "How does a project start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A project starts with discovery, strategy, and a clear read on the website or workflow before Ghost AI Solutions designs the right website, automation, or AI build path.",
      },
    },
  ],
};

const stageSolutions = [
  {
    title: "Launch A Website That Builds Trust",
    audience: "New Sites / Redesigns",
    description: "For businesses that need a sharper online presence, clearer message, and better first impression.",
    href: "/start",
    cta: "Start Website Intake",
  },
  {
    title: "Turn Visitors Into Calls, Leads, and Bookings",
    audience: "Growth / Lead Generation",
    description: "Improve the conversion path with stronger calls-to-action, forms, follow-up, and tracking.",
    href: "/for-growth",
    cta: "Explore Growth Systems",
  },
  {
    title: "Add Automation and AI Where It Saves Time",
    audience: "Automation / AI Systems",
    description: "Connect the website to intake, CRM, content, reporting, chat, and workflow automation.",
    href: "/services",
    cta: "Explore AI Capabilities",
  },
];

const capabilityCategories = [
  {
    title: "Growth & Revenue Systems",
    value: "Capture more qualified leads from the website and move them into the right follow-up path.",
    technology: "Landing pages, lead forms, booking flows, CRM routing, and conversion intelligence.",
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
    value: "Make it easier for customers to ask questions, book, request quotes, or get routed quickly.",
    technology: "Chat, voice, messaging workflows, qualification logic, and human handoff controls.",
  },
  {
    title: "Custom AI Platforms",
    value: "Build durable, business-specific infrastructure instead of stitching together generic tools.",
    technology: "Full-stack application engineering, secure architecture, and AI-native product components.",
  },
];

const proofStats = [
  { label: "Live Website Builds", value: "8" },
  { label: "Average Implementation Window", value: "2-8 weeks" },
  { label: "Custom Client Fit", value: "100%" },
  { label: "Template-Only Builds", value: "0" },
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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd) }}
      />
      <HeroSection />

      <SectionWrapper
        id="recent-builds"
        eyebrow="Recent Builds"
        title="Real Websites And Systems Already Shipped"
        description="A few public examples of the websites, product surfaces, and digital experiences built through GhostAI Solutions."
      >
        <PortfolioShowcase limit={4} compact />
      </SectionWrapper>

      <SectionWrapper
        id="segmentation"
        eyebrow="Where To Start"
        title="Choose The Track That Matches What You Need Next"
        description="Start simple with a website audit or go deeper into automation, AI, and custom systems when the business is ready."
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
        title="Websites, Automation, And AI Under One Roof"
        description="We lead with the business outcome first, then build the digital system that makes it easier to get leads, serve customers, and operate."
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
        title="Proof Should Be Visible, Not Just Claimed"
        description="Visitors should be able to see the quality of the work quickly. These signals show delivery, range, and real project momentum."
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
        description="We are best aligned with businesses that want their website and systems to create trust, capture leads, and reduce manual work."
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
        title="Want A Clear Read On Your Website First?"
        description="Start with a free website audit. If there is a fit, we will map the right website, automation, or AI build path from there."
      >
        <div className="flex flex-wrap justify-center gap-4">
          <TrackCTA
            href="/start"
            event="homepage_start_audit"
            section="next_step"
            placement="primary"
            label="Get Free Website Audit"
            className="inline-flex rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            Get Free Website Audit
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
