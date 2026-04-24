import { Home, Car, Briefcase, Check, X, Lightbulb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Case = {
  icon: LucideIcon;
  category: string;
  problem: string;
  withoutLexia: { label: string; price: string; details: string };
  withLexia: { label: string; price: string; details: string };
  savings: string;
};

export function CaseStudiesSection() {
  const cases: Case[] = [
    {
      icon: Home,
      category: 'Rodina',
      problem: 'Majitel bytu nevrátil kauci 25 000 Kč',
      withoutLexia: { label: 'Bez Lexie', price: '25 000 – 40 000 Kč', details: 'Právník 2 500 Kč/hod' },
      withLexia: { label: 'S Lexií', price: '2 000 – 4 000 Kč', details: 'Roční pojištění' },
      savings: '10× levnější'
    },
    {
      icon: Car,
      category: 'Auto',
      problem: 'Spor o vinu po nehodě',
      withoutLexia: { label: 'Bez Lexie', price: '30 000 – 80 000 Kč', details: 'Právník + soudní poplatky' },
      withLexia: { label: 'S Lexií', price: 'cca 3 000 Kč', details: 'Roční pojištění' },
      savings: 'až 20× levnější'
    },
    {
      icon: Briefcase,
      category: 'Podnikatel',
      problem: 'Nezaplacená faktura 120 000 Kč',
      withoutLexia: { label: 'Bez Lexie', price: '20 000 – 60 000 Kč', details: 'Vymáhání + právní služby' },
      withLexia: { label: 'S Lexií', price: '5 000 – 10 000 Kč', details: 'Roční pojištění' },
      savings: 'až 6× levnější'
    }
  ];

  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Kolik vás může stát jeden právní problém?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Porovnání skutečných nákladů s právní ochranou a bez ní
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => {
            const Icon = caseItem.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 flex items-center justify-center text-[#0066CC]">
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{caseItem.category}</div>
                      <div className="text-xs text-green-600 font-medium">{caseItem.savings}</div>
                    </div>
                  </div>
                  <p className="text-foreground leading-relaxed text-pretty">
                    {caseItem.problem}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <X className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                      <span className="text-sm text-red-900">{caseItem.withoutLexia.label}</span>
                    </div>
                    <div className="text-xl lg:text-2xl text-red-900 mb-1 tracking-tight">{caseItem.withoutLexia.price}</div>
                    <div className="text-xs text-red-700">{caseItem.withoutLexia.details}</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                      <span className="text-sm text-green-900">{caseItem.withLexia.label}</span>
                    </div>
                    <div className="text-xl lg:text-2xl text-green-900 mb-1 tracking-tight">{caseItem.withLexia.price}</div>
                    <div className="text-xs text-green-700">{caseItem.withLexia.details}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-white rounded-2xl border border-border max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-lg text-foreground mb-2">
            <Lightbulb className="w-5 h-5 text-amber-500" strokeWidth={2} />
            <span>Jeden problém = několikanásobek ročního pojistného</span>
          </div>
          <p className="text-muted-foreground text-pretty">
            S Lexií platíte jednou ročně a řešíte neomezené množství případů
          </p>
        </div>
      </div>
    </section>
  );
}
