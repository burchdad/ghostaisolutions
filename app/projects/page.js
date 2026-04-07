import SectionWrapper from '@/components/SectionWrapper';
import CardGrid from '@/components/CardGrid';

const projects = [
  {
    title: 'Field Dispatch Intelligence Platform',
    description: 'Industry: Electric / Utilities\nProblem solved: Delayed dispatch and fragmented job data\nSystem built: Real-time routing and triage platform\nOutcome: Faster response windows and lower scheduling friction.',
    href: '/contact',
    tag: 'Case Study',
  },
  {
    title: 'Lead Velocity Operating System',
    description: 'Industry: Real Estate\nProblem solved: Slow lead response and inconsistent follow-up\nSystem built: CRM + automation + communication stack\nOutcome: Better conversion speed and cleaner pipeline control.',
    href: '/contact',
    tag: 'Case Study',
  },
  {
    title: 'Investigation Workflow Intelligence',
    description: 'Industry: Law Enforcement / Investigations\nProblem solved: Manual evidence indexing and delayed retrieval\nSystem built: Intelligence platform with scoring and search\nOutcome: Reduced analysis cycle time and improved confidence.',
    href: '/contact',
    tag: 'Case Study',
  },
  {
    title: 'Restaurant Throughput Control Layer',
    description: 'Industry: Restaurants / Food Trucks\nProblem solved: Order handoff bottlenecks across channels\nSystem built: POS integration with operations dashboard\nOutcome: Higher service speed and better order visibility.',
    href: '/contact',
    tag: 'Case Study',
  },
  {
    title: 'Communication Engine for Service Teams',
    description: 'Industry: HVAC / Refrigeration\nProblem solved: Missed callbacks and poor outbound consistency\nSystem built: Dialer and communication workflow system\nOutcome: More completed contact loops and reduced no-shows.',
    href: '/contact',
    tag: 'Case Study',
  },
  {
    title: 'Cross-Source Data Pipeline Hub',
    description: 'Industry: Construction\nProblem solved: Data spread across disconnected sources\nSystem built: Custom scraper and ETL pipeline stack\nOutcome: Unified reporting and faster operational decisions.',
    href: '/contact',
    tag: 'Case Study',
  },
];

export const metadata = {
  title: 'Projects | Ghost AI Solutions',
  description: 'Case-study structured projects showing custom systems built for real-world outcomes.',
};

export default function ProjectsPage() {
  return (
    <>
      <SectionWrapper
        eyebrow="Projects"
        title="Built From Scratch. Delivered for the Real World."
        description="Each project is structured around business constraints, engineered systems, and measurable outcomes."
      >
        <CardGrid items={projects} />
      </SectionWrapper>
    </>
  );
}
