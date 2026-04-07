import SectionWrapper from '@/components/SectionWrapper';
import CardGrid from '@/components/CardGrid';

const technologies = [
  {
    title: 'Ghost Voice',
    description: 'Voice automation stack for inbound handling, outbound engagement, and operational call workflows.',
    href: '/projects',
    tag: 'Voice',
  },
  {
    title: 'Ghost CRM',
    description: 'Custom relationship and lead lifecycle platform engineered for your process, not generic pipeline templates.',
    href: '/projects',
    tag: 'CRM',
  },
  {
    title: 'Ghost Underwriter',
    description: 'Decision-support engine that scores scenarios and surfaces risk signals from fragmented data streams.',
    href: '/projects',
    tag: 'Intelligence',
  },
  {
    title: 'Ghost Rescue',
    description: 'Operational recovery tooling for incident workflows, escalations, and process continuity under pressure.',
    href: '/projects',
    tag: 'Operations',
  },
  {
    title: 'Ghost Score',
    description: 'Custom scoring framework that normalizes inputs and drives action priorities for your internal teams.',
    href: '/projects',
    tag: 'Scoring',
  },
  {
    title: 'Dialer System',
    description: 'Integrated dialer and communication orchestration layer for outreach, callbacks, and response routing.',
    href: '/projects',
    tag: 'Communications',
  },
  {
    title: 'Scraper Systems',
    description: 'Targeted data extraction and processing pipelines built for durable, repeatable intelligence gathering.',
    href: '/projects',
    tag: 'Data',
  },
];

export const metadata = {
  title: 'Technology | Ghost AI Solutions',
  description: 'Explore the Ghost ecosystem of custom-built systems and internal platforms.',
};

export default function TechnologyPage() {
  return (
    <>
      <SectionWrapper
        eyebrow="Technology"
        title="The Ghost Ecosystem"
        description="Core systems engineered in-house for speed, flexibility, and real-world deployment."
      >
        <CardGrid items={technologies} />
      </SectionWrapper>
    </>
  );
}
