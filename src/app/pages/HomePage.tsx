import { Hero } from '../components/home/Hero';
import { SegmentSection } from '../components/home/SegmentSection';
import { ValueSection } from '../components/home/ValueSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ComparisonSection } from '../components/home/ComparisonSection';
import { ProductsSection } from '../components/home/ProductsSection';
import { CustomerPortalSection } from '../components/home/CustomerPortalSection';
import { CaseStudiesSection } from '../components/home/CaseStudiesSection';
import { DigitalSection } from '../components/home/DigitalSection';
import { TrustSection } from '../components/home/TrustSection';
import { FinalCTASection } from '../components/home/FinalCTASection';

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <SegmentSection />
      <ValueSection />
      <HowItWorksSection />
      <ComparisonSection />
      <ProductsSection />
      <CustomerPortalSection />
      <CaseStudiesSection />
      <DigitalSection />
      <TrustSection />
      <FinalCTASection />
    </div>
  );
}
