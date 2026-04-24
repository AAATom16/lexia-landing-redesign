import { Hero } from '../components/home/Hero';
import { SegmentSection } from '../components/home/SegmentSection';
import { CaseStudiesSection } from '../components/home/CaseStudiesSection';
import { ValueSection } from '../components/home/ValueSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { DigitalSection } from '../components/home/DigitalSection';
import { ProductsSection } from '../components/home/ProductsSection';
import { TrustSection } from '../components/home/TrustSection';
import { FinalCTASection } from '../components/home/FinalCTASection';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <SegmentSection />
      <CaseStudiesSection />
      <ValueSection />
      <HowItWorksSection />
      <DigitalSection />
      <ProductsSection />
      <TrustSection />
      <FinalCTASection />
    </div>
  );
}
