import { useNavigate } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { CalculatorWidget } from '../calculator/CalculatorWidget';

export function CalculatorSection() {
  const navigate = useNavigate();

  return (
    <section id="kalkulacka" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-5">
            <Calculator className="w-4 h-4 text-[#0045BF]" strokeWidth={2} />
            <span className="text-sm text-[#0045BF]">Spočítejte si pojistné</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Kalkulačka pojistného
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Vyberte produkt, pilíře a doplňte parametry. Cena se počítá živě dle oficiálních tarifů 2026/04.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <CalculatorWidget
            variant="public"
            ctaLabel="Pokračovat ke sjednání"
            onCta={() => navigate('/prihlaseni')}
          />
        </div>
      </div>
    </section>
  );
}
