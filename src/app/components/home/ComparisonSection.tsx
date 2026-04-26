import { Check, X, Sparkles } from 'lucide-react';

type Row = { feature: string; lexia: string | true; competitors: string | false };

export function ComparisonSection() {
  const rows: Row[] = [
    { feature: 'Sjednání online za 5 minut', lexia: true, competitors: 'Většinou jen dotaz, volá obchodník' },
    { feature: 'Pojistný limit', lexia: '2,5 mil. Kč', competitors: 'Typicky 250 tis. – 1 mil. Kč' },
    { feature: 'ALL-RISK krytí', lexia: 'Minimum výluk', competitors: 'Dlouhý seznam výluk' },
    { feature: 'Smlouva srozumitelně', lexia: 'Na 2 strany A4', competitors: '20+ stran VPP' },
    { feature: 'Nezávislost', lexia: 'Vlastní brand, žádný korporát', competitors: 'Součást velké pojišťovny' },
    { feature: 'Online portál pro klienty', lexia: 'Časová osa, chat, dokumenty', competitors: 'Často chybí, e-maily' },
    { feature: 'Územní platnost', lexia: 'Celá Evropa', competitors: 'Často jen ČR' },
    { feature: 'Zrušení online', lexia: 'Kdykoli, bez sankce', competitors: 'Papírová výpověď doporučeně' },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#F7F9FC] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-[#0057F0]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#0045BF]" strokeWidth={2} />
            <span className="text-sm text-[#0045BF]">Lexia vs. tradiční pojišťovny</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Stejná ochrana. Jen bez korporátní zátěže
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Co vás čeká u nás vs. u zaběhnutých konkurentů
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] bg-gradient-to-r from-[#F7F9FC] to-white border-b border-border">
            <div className="px-4 md:px-6 py-5 text-sm text-muted-foreground uppercase tracking-wider">Funkce</div>
            <div className="px-4 md:px-6 py-5 bg-gradient-to-br from-[#0057F0] to-[#0045BF] text-white">
              <div className="font-display text-base md:text-lg tracking-tight">Lexia</div>
              <div className="text-xs text-white/80">Nezávislý digital-first</div>
            </div>
            <div className="px-4 md:px-6 py-5">
              <div className="font-display text-base md:text-lg text-foreground tracking-tight">Tradiční</div>
              <div className="text-xs text-muted-foreground">D.A.S., ARAG, Slavia, Generali</div>
            </div>
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] ${
                i % 2 === 0 ? 'bg-white' : 'bg-[#F7F9FC]/50'
              } border-b border-border last:border-0`}
            >
              <div className="px-4 md:px-6 py-4 text-sm md:text-base text-foreground">{row.feature}</div>
              <div className="px-4 md:px-6 py-4 flex items-center gap-2 bg-[#0045BF]/5">
                {row.lexia === true ? (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#008EA5] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#0045BF] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <span className="text-sm md:text-base text-foreground">{row.lexia === true ? 'Ano' : row.lexia}</span>
              </div>
              <div className="px-4 md:px-6 py-4 flex items-center gap-2">
                <div className="shrink-0 w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm md:text-base text-muted-foreground">
                  {row.competitors === false ? 'Ne' : row.competitors}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          Srovnání zpracováno na základě veřejně dostupných sazebníků a VPP konkurence v dubnu 2026.
          Konkrétní podmínky se mohou lišit dle balíčku.
        </div>
      </div>
    </section>
  );
}
