import { useState } from 'react';
import { Calculator, ChevronRight, FileSignature, FileText, HelpCircle, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export type HelpSurface = 'portal' | 'crm';

const SECTIONS: Record<HelpSurface, { title: string; items: { icon: React.ElementType; title: string; body: string; to?: string }[] }[]> = {
  portal: [
    {
      title: 'Hlavní flow',
      items: [
        { icon: Calculator, title: 'Kalkulačka', body: 'Vyber produkt a pilíře, doplň parametry. Cena se počítá živě podle tarifů 2026/04.', to: '/portal/kalkulacka' },
        { icon: FileSignature, title: 'Sjednání', body: 'Po uložení návrhu se otevře detail. Tam posunuješ stav: Návrh → Odesláno → Podepsáno.', to: '/portal/sjednani' },
        { icon: Users, title: 'Klienti', body: 'Z návrhů s vyplněným jménem se automaticky agregují klienti.', to: '/portal/klienti' },
      ],
    },
    {
      title: 'Provize',
      items: [
        { icon: FileText, title: 'Model 1 — Získatelská + následná', body: '45 % z 1. ročního pojistného + 10 % z každé další splátky. Storno závazek 1 rok lineárně.' },
        { icon: FileText, title: 'Model 2 — Průběžná', body: '23 % z přijatého pojistného. Vyplácí se po 1. ročním pojistném.' },
        { icon: FileText, title: 'Startovací (Model 1)', body: 'Bonus 30 / 20 / 10 % v 1.–3. měsíci po podpisu obchodního zastoupení.' },
      ],
    },
  ],
  crm: [
    {
      title: 'Hlavní flow',
      items: [
        { icon: Calculator, title: 'Interní kalkulačka', body: 'Stejný engine + náhled provize včetně startovací. Slouží pro inbound leady i přímé sjednávání.', to: '/crm/kalkulacka' },
        { icon: FileSignature, title: 'Smlouvy', body: 'Sekce „Smlouvy“ obsahuje všechny návrhy ze všech zdrojů (public, partner, CRM). Detail návrhu → posun stavu.', to: '/crm/smlouvy' },
        { icon: Users, title: 'Klienti', body: 'Klienti zatím z mock dat — po S6 cleanupu přejdou na reálné z API.', to: '/crm/klienti' },
      ],
    },
    {
      title: 'Datový model',
      items: [
        { icon: FileText, title: 'Produkty + Pilíře', body: '3 produkty (Jednotlivci, Podnikatelé, Řidiči), 11 pilířů, oblasti s limity a územím dle PDF 2026-03.' },
        { icon: FileText, title: 'Tarify', body: 'Verze 2026/04 — matrix obrat × zaměstnanci, vozidla v1/v2, množstevní sleva atd.' },
        { icon: FileText, title: 'Distribuční strom', body: 'Schéma připraveno (parent / inheritCommissions / brokerPool). UI modul je v plánu (S5).' },
      ],
    },
  ],
};

export function HelpButton({ surface }: { surface: HelpSurface }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-[#0045BF] hover:bg-[#F7F9FC]"
        aria-label="Nápověda"
      >
        <HelpCircle className="w-4 h-4" /> Jak na to
      </button>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-[#F7F9FC]"
        aria-label="Nápověda"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
          <div
            className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0045BF]" /> Jak na to
              </h2>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F7F9FC]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {SECTIONS[surface].map((section) => (
                <div key={section.title}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{section.title}</div>
                  <div className="space-y-3">
                    {section.items.map((item, i) => {
                      const Icon = item.icon;
                      const Body = (
                        <div className="flex gap-3 p-3 rounded-xl border border-border hover:border-[#0045BF]/30 transition-all">
                          <div className="w-9 h-9 rounded-lg bg-[#0045BF]/10 text-[#0045BF] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.title}</div>
                            <p className="text-xs text-muted-foreground">{item.body}</p>
                          </div>
                          {item.to && <ChevronRight className="w-4 h-4 text-muted-foreground self-center shrink-0" />}
                        </div>
                      );
                      return item.to ? (
                        <Link key={i} to={item.to} onClick={() => setOpen(false)}>{Body}</Link>
                      ) : (
                        <div key={i}>{Body}</div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-5 text-xs text-muted-foreground space-y-1.5">
                <div>Plná uživatelská příručka: <code className="px-1 py-0.5 rounded bg-[#F7F9FC]">docs/uzivatelska-prirucka.md</code> v repu.</div>
                <div>Otázky / chyby: tomas.hajek (admin).</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
