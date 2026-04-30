import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { SegmentSection } from '../components/home/SegmentSection';
import { ValueSection } from '../components/home/ValueSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { ComparisonSection } from '../components/home/ComparisonSection';
import { ProductsSection } from '../components/home/ProductsSection';
import { CalculatorSection } from '../components/home/CalculatorSection';
import { CustomerPortalSection } from '../components/home/CustomerPortalSection';
import { CaseStudiesSection } from '../components/home/CaseStudiesSection';
import { DigitalSection } from '../components/home/DigitalSection';
import { TrustSection } from '../components/home/TrustSection';
import { FinalCTASection } from '../components/home/FinalCTASection';

export function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempt < 10) {
        setTimeout(() => tryScroll(attempt + 1), 50);
      }
    };
    tryScroll();
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <SegmentSection />
      <ValueSection />
      <HowItWorksSection />
      <ComparisonSection />
      <ProductsSection />
      <CalculatorSection />
      <CustomerPortalSection />
      <CaseStudiesSection />
      <DigitalSection />
      <TrustSection />
      <FinalCTASection />
    </div>
  );
}
