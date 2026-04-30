import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { CalculatorWidget } from '../calculator/CalculatorWidget';
import { PublicLeadForm } from '../calculator/PublicLeadForm';
import type { CalculationResult, CalculatorInput } from '../../domain/types';

export function CalculatorSection() {
  const [snapshot, setSnapshot] = useState<{ result: CalculationResult; input: CalculatorInput } | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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
            Po výpočtu vám rádi pošleme nezávaznou nabídku na míru.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <CalculatorWidget
            variant="public"
            ctaLabel="Chci nezávaznou nabídku"
            onCalculation={(result, input) => setSnapshot({ result, input })}
            onCta={(result, input) => { setSnapshot({ result, input }); setFormOpen(true); }}
          />
        </div>

        {snapshot && (
          <PublicLeadForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            result={snapshot.result}
            input={snapshot.input}
          />
        )}
      </div>
    </section>
  );
}
