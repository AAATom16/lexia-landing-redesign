import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileSignature, FileText, Sparkles, X, ArrowRight } from 'lucide-react';

const KEY = 'lexia_onboarding_dismissed';

export type OnboardingStep = {
  icon: React.ElementType;
  title: string;
  body: string;
  cta: { label: string; to: string };
};

export type OnboardingBannerProps = {
  surface: 'portal' | 'crm';
  storageKey?: string;
  steps?: OnboardingStep[];
};

const PORTAL_STEPS: OnboardingStep[] = [
  {
    icon: Calculator,
    title: '1. Spočítej pojistné',
    body: 'V kalkulačce vyber produkt, pilíře a parametry — cena se počítá živě podle oficiálních tarifů 2026/04.',
    cta: { label: 'Otevřít kalkulačku', to: '/portal/kalkulacka' },
  },
  {
    icon: FileSignature,
    title: '2. Ulož návrh smlouvy',
    body: 'Doplň jméno klienta a uloží se nový návrh. Vidíš v něm rozpis pojistného i náhled provize (model 1 nebo 2).',
    cta: { label: 'Moje návrhy', to: '/portal/sjednani' },
  },
  {
    icon: FileText,
    title: '3. Pošli klientovi a podepiš',
    body: 'V detailu návrhu posuneš stav: Návrh → Odesláno klientovi → Podepsáno. Klient pak figuruje v CRM jako aktivní smlouva.',
    cta: { label: 'Klienti', to: '/portal/klienti' },
  },
];

const CRM_STEPS: OnboardingStep[] = [
  {
    icon: Calculator,
    title: '1. Interní kalkulace',
    body: 'Stejný engine jako pro partnery + náhled provize včetně startovací (30/20/10 %). Slouží i pro inbound leady.',
    cta: { label: 'Otevřít kalkulačku', to: '/crm/kalkulacka' },
  },
  {
    icon: FileSignature,
    title: '2. Návrhy smluv (Sjednávání)',
    body: 'Sekce „Smlouvy“ obsahuje všechny návrhy ze všech zdrojů — public web, partneři i interní CRM. Detailem projdeš celý lifecycle.',
    cta: { label: 'CRM smlouvy', to: '/crm/smlouvy' },
  },
  {
    icon: FileText,
    title: '3. Podepsáno → klient',
    body: 'Po podpisu se z návrhu stane aktivní smlouva. Klient se objeví v CRM klientech, dokumenty + provizní vyúčtování v jeho detailu.',
    cta: { label: 'Klienti', to: '/crm/klienti' },
  },
];

export function OnboardingBanner({ surface, storageKey, steps }: OnboardingBannerProps) {
  const key = storageKey ?? `${KEY}_${surface}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(key) === '1';
  });

  if (dismissed) return null;

  const list = steps ?? (surface === 'portal' ? PORTAL_STEPS : CRM_STEPS);

  function dismiss() {
    localStorage.setItem(key, '1');
    setDismissed(true);
  }

  return (
    <div className="bg-gradient-to-br from-[#001843] to-[#0045BF] text-white rounded-2xl p-6 lg:p-8 mb-8 relative overflow-hidden">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white"
        aria-label="Schovat průvodce"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/70 mb-3">
        <Sparkles className="w-4 h-4" /> Jak to funguje
      </div>
      <h2 className="text-2xl lg:text-3xl tracking-tight mb-6 max-w-3xl">
        Od kalkulace k podepsané smlouvě ve třech krocích
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {list.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-5 flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-medium mb-1">{step.title}</div>
              <p className="text-sm text-white/80 mb-4 flex-1">{step.body}</p>
              <Link
                to={step.cta.to}
                className="inline-flex items-center gap-1.5 text-sm text-white hover:underline"
              >
                {step.cta.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
