import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import SectionWrapper from '@/components/SectionWrapper';
import CardGrid from '@/components/CardGrid';
import IndustryGrid from '@/components/IndustryGrid';
import ProcessSteps from '@/components/ProcessSteps';
import CTASection from '@/components/CTASection';
import ScrollDepthTracker from '@/components/ScrollDepthTracker';
import SectionViewTracker from '@/components/SectionViewTracker';

const valuePoints = [
  'Build full platforms',
  'Create internal systems',
  'Replace manual workflows',
  'Engineer automation + intelligence layers',
  'Design and deploy from scratch',
];

const builtSystems = [
  {
    title: 'AI Voice Systems',
    description: 'Production-ready voice stacks for inbound, outbound, and operational call handling.',
    href: '/projects',
    tag: 'System Build',
  },
  {
    title: 'CRM + Lead Systems',
    description: 'Custom lead lifecycle and pipeline control systems for teams that outgrow off-the-shelf CRM flows.',
    href: '/projects',
    tag: 'Revenue Operations',
  },
  {
    title: 'Investigative Intelligence Platforms',
    description: 'Data-enriched intelligence surfaces for field teams that need speed, confidence, and traceability.',
    href: '/projects',
    tag: 'Intelligence',
  },
  {
    title: 'Sales Funnels',
    description: 'Conversion-focused funnels connected directly to automation layers and internal handoff systems.',
    href: '/projects',
    tag: 'Growth Systems',
  },
  {
    title: 'Restaurant / POS Systems',
    description: 'Purpose-built ordering, routing, and reporting tools for high-speed service environments.',
    href: '/projects',
    tag: 'Operations',
  },
  {
    title: 'Data Scrapers / Pipelines',
    description: 'Resilient ingestion pipelines that turn scattered data into usable business signals.',
    href: '/projects',
    tag: 'Data Engineering',
  },
  {
    title: 'Dialers / Communication Systems',
    description: 'Integrated communication engines for outreach, dispatch, and multi-channel follow-up.',
    href: '/projects',
    tag: 'Communications',
  },
];

const industries = [
  'Real Estate',
  'Oil & Gas',
  'Electric / Utilities',
  'Communications / Fiber',
  'Restaurants / Food Trucks',
  'Construction',
  'Landscaping',
  'HVAC / Refrigeration',
  'Law Enforcement / Investigations',
];

const processSteps = [
  { title: 'Understand the Problem', description: 'We map operational bottlenecks, constraints, and desired outcomes before writing a line of code.' },
  { title: 'Design the System', description: 'Architecture is tailored to your workflow, data model, team structure, and growth horizon.' },
  { title: 'Build From Scratch', description: 'We engineer the software, AI, and automation layers in-house for total control and adaptability.' },
  { title: 'Deploy + Optimize', description: 'Real-world launch, performance monitoring, and iterative improvement keep the system compounding value.' },
];

const differentiators = [
  'Everything is built in-house',
  'No reliance on rigid third-party tools',
  'Fully customizable architecture',
  'Faster iteration and lower long-term cost',
];

export default function Page(){
  return (
    <>
      <ScrollDepthTracker />
      <SectionViewTracker />
      <HeroSection />

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

      <CTASection />
    </>
  );
}
