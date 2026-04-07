import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import SectionWrapper from "@/components/SectionWrapper";
import CardGrid from "@/components/CardGrid";
import IndustryGrid from "@/components/IndustryGrid";
import ProcessSteps from "@/components/ProcessSteps";
import CTASection from "@/components/CTASection";
import ScrollDepthTracker from "@/components/ScrollDepthTracker";
import SectionViewTracker from "@/components/SectionViewTracker";
import TrackCTA from "@/components/TrackCTA";

const valuePoints = [
  "Build full platforms",
  "Create internal systems",
  "Replace manual workflows",
  "Engineer automation + intelligence layers",
  "Design and deploy from scratch",
];

const proofStats = [
  { label: "Pilot To Production", value: "2-6 weeks" },
  { label: "Typical Manual Work Reduced", value: "30-70%" },
  { label: "Sprints With KPI Reporting", value: "100%" },
  { label: "Template Reuse", value: "0" },
];

const testimonials = [
  {
    quote: "Ghost replaced three disconnected tools with one operating system our team actually uses.",
    role: "Operations Director",
    company: "Field Services Group",
  },
  {
    quote: "We moved from reactive lead handling to a controlled pipeline with automation and auditability.",
    role: "Revenue Lead",
    company: "Multi-Location Service Brand",
  },
  {
    quote: "Their team shipped custom infrastructure fast without forcing our process into someone else's platform.",
    role: "Founder",
    company: "B2B Growth Company",
  },
];

const serviceLanes = [
  {
    title: "Custom Platforms",
    fit: "For teams managing complexity across multiple systems and roles.",
    deliverables: "Operator dashboards, internal tooling, data models, permissions, and reporting.",
    notFit: "Not for simple brochure sites or off-the-shelf ecommerce installs.",
  },
  {
    title: "Workflow Automation",
    fit: "For teams losing revenue or time in repetitive handoffs.",
    deliverables: "Automation maps, routing logic, approvals, escalation flows, and audit trails.",
    notFit: "Not for single-task scripts with no business-critical impact.",
  },
  {
    title: "AI Voice + Comms",
    fit: "For call-heavy operations that need 24/7 speed and quality control.",
    deliverables: "Voice agents, qualification logic, CRM sync, and human handoff controls.",
    notFit: "Not for vanity demos without clear workflow outcomes.",
  },
  {
    title: "Data + Intelligence",
    fit: "For teams making decisions with fragmented or stale data.",
    deliverables: "Data pipelines, enrichment workflows, scoring models, and action surfaces.",
    notFit: "Not for one-off exports that do not feed operations.",
  },
];

const builtSystems = [
  {
    title: "AI Voice Systems",
    description: "Production-ready voice stacks for inbound, outbound, and operational call handling.",
    href: "/projects",
    tag: "System Build",
  },
  {
    title: "CRM + Lead Systems",
    description: "Custom lead lifecycle and pipeline control systems for teams that outgrow off-the-shelf CRM flows.",
    href: "/projects",
    tag: "Revenue Operations",
  },
  {
    title: "Investigative Intelligence Platforms",
    description: "Data-enriched intelligence surfaces for field teams that need speed, confidence, and traceability.",
    href: "/projects",
    tag: "Intelligence",
  },
  {
    title: "Sales Funnels",
    description: "Conversion-focused funnels connected directly to automation layers and internal handoff systems.",
    href: "/projects",
    tag: "Growth Systems",
  },
  {
    title: "Restaurant / POS Systems",
    description: "Purpose-built ordering, routing, and reporting tools for high-speed service environments.",
    href: "/projects",
    tag: "Operations",
  },
  {
    title: "Data Scrapers / Pipelines",
    description: "Resilient ingestion pipelines that turn scattered data into usable business signals.",
    href: "/projects",
    tag: "Data Engineering",
  },
  {
    title: "Dialers / Communication Systems",
    description: "Integrated communication engines for outreach, dispatch, and multi-channel follow-up.",
    href: "/projects",
    tag: "Communications",
  },
];

const industries = [
  "Real Estate",
  "Oil & Gas",
  "Electric / Utilities",
  "Communications / Fiber",
  "Restaurants / Food Trucks",
  "Construction",
  "Landscaping",
  "HVAC / Refrigeration",
  "Law Enforcement / Investigations",
];

const processSteps = [
  { title: "Understand the Problem", description: "We map operational bottlenecks, constraints, and desired outcomes before writing a line of code." },
  { title: "Design the System", description: "Architecture is tailored to your workflow, data model, team structure, and growth horizon." },
  { title: "Build From Scratch", description: "We engineer the software, AI, and automation layers in-house for total control and adaptability." },
  { title: "Deploy + Optimize", description: "Real-world launch, performance monitoring, and iterative improvement keep the system compounding value." },
];

const differentiators = [
  "Everything is built in-house",
  "No reliance on rigid third-party tools",
  "Fully customizable architecture",
  "Faster iteration and lower long-term cost",
];

const faqTeasers = [
  {
    q: "How fast can we launch v1?",
    a: "Most first systems ship in 2-6 weeks depending on integrations and approval complexity.",
  },
  {
    q: "Do you replace our current tools?",
    a: "Sometimes yes, sometimes no. We integrate first, then replace only where ROI is clear.",
  },
  {
    q: "Can we start small?",
    a: "Yes. We start with one high-friction workflow and expand once the metrics prove value.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqTeasers.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function Page() {
  return (
    <>
      <ScrollDepthTracker />
      <SectionViewTracker />
      <HeroSection />

      <SectionWrapper
        id="proof"
        eyebrow="Proof"
        title="Built For Outcomes, Not Demos"
        description="Every build is tied to cycle time, response speed, conversion, or operational throughput."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-5 text-center">
              <p className="text-2xl font-bold text-cyan-200">{stat.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.company} className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 text-slate-200">
              <p>&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4 text-xs uppercase tracking-[0.14em] text-cyan-300">
                {item.role} • {item.company}
              </footer>
            </blockquote>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="solutions"
        eyebrow="What We Actually Do"
        title="Not Templates. Not Plug-Ins. Not Guesswork."
        description="We do not resell software. We engineer custom systems that solve high-value business problems from the ground up."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {valuePoints.map((point) => (
            <div key={point} className="rounded-2xl border border-white/15 bg-slate-950/60 p-5 text-slate-200">
              {point}
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="service-lanes"
        eyebrow="Service Lanes"
        title="Pick The Build Lane That Matches Your Bottleneck"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {serviceLanes.map((lane) => (
            <article key={lane.title} className="rounded-2xl border border-white/15 bg-slate-950/65 p-6">
              <h3 className="text-xl font-semibold text-white">{lane.title}</h3>
              <p className="mt-3 text-sm text-slate-300"><span className="font-semibold text-cyan-200">Best fit:</span> {lane.fit}</p>
              <p className="mt-2 text-sm text-slate-300"><span className="font-semibold text-cyan-200">Deliverables:</span> {lane.deliverables}</p>
              <p className="mt-2 text-sm text-amber-200"><span className="font-semibold">Not a fit:</span> {lane.notFit}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="projects-preview"
        eyebrow="Built Systems"
        title="Built From Scratch. Deployed in the Real World."
      >
        <CardGrid items={builtSystems} />
      </SectionWrapper>

      <SectionWrapper
        id="industries"
        eyebrow="Industry Coverage"
        title="We Do Not Niche Down. We Solve Across Industries."
      >
        <IndustryGrid industries={industries} />
      </SectionWrapper>

      <SectionWrapper id="process" eyebrow="Execution" title="How We Build">
        <ProcessSteps steps={processSteps} />
      </SectionWrapper>

      <SectionWrapper
        id="differentiator"
        eyebrow="Competitive Edge"
        title="We Do Not Resell Software. We Engineer It."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {differentiators.map((item) => (
            <div key={item} className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5 text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="blueprint-offer"
        eyebrow="Lead Magnet"
        title="Get The Custom System Blueprint Template"
        description="Use our build-planning template to map your workflow, constraints, integrations, and KPI targets before kickoff."
      >
        <div className="text-center">
          <TrackCTA
            href="/contact#blueprint"
            event="blueprint_template_request"
            section="blueprint_offer"
            placement="primary"
            label="Request Blueprint Template"
            className="inline-flex rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Request Blueprint Template
          </TrackCTA>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="technology"
        eyebrow="In-House Stack"
        title="The Ghost Ecosystem"
        description="Explore the systems behind our builds: voice, CRM, intelligence, scoring, outreach, and data infrastructure."
      >
        <div className="text-center">
          <Link
            href="/technology"
            className="inline-flex rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
          >
            Explore Technology
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper id="faq-teaser" eyebrow="Common Questions" title="Before You Start The Build">
        <div className="grid gap-4 md:grid-cols-3">
          {faqTeasers.map((item) => (
            <article key={item.q} className="rounded-2xl border border-white/15 bg-slate-950/60 p-5">
              <h3 className="text-base font-semibold text-white">{item.q}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.a}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <CTASection />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
