import Hero from '@/components/Hero';
import HomeSections from '@/components/HomeSections';
import ScrollDepthTracker from '@/components/ScrollDepthTracker';
import SectionViewTracker from '@/components/SectionViewTracker';

export default function Page(){
  return (
    <>
      <ScrollDepthTracker />
      <SectionViewTracker />
      <Hero />
      <HomeSections />
    </>
  );
}
