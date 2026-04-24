import { Hero } from '../components/partners/Hero';
import { ValueSection } from '../components/partners/ValueSection';
import { WhySection } from '../components/partners/WhySection';
import { ToolsSection } from '../components/partners/ToolsSection';
import { SupportSection } from '../components/partners/SupportSection';
import { CTASection } from '../components/partners/CTASection';
import { FormSection } from '../components/partners/FormSection';

export function PartnersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <ValueSection />
      <WhySection />
      <ToolsSection />
      <SupportSection />
      <CTASection />
      <FormSection />
    </div>
  );
}
