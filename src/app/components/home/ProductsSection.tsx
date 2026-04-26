import { Home, Briefcase, Building2, Check, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Product = {
  icon: LucideIcon;
  title: string;
  audience: string;
  monthly: string;
  yearly: string;
  limit: string;
  features: string[];
  popular: boolean;
};

export function ProductsSection() {
  const products: Product[] = [
    {
      icon: Home,
      title: 'Domácnost',
      audience: 'Jednotlivec a rodina',
      monthly: '179 Kč',
      yearly: '1 932 Kč/rok',
      limit: 'Pojistný limit 1 mil. Kč',
      features: [
        'Právník 24/7 telefonem i online',
        'Spory s nájemcem, sousedem, firmou',
        'Spotřebitelské reklamace',
        'Dopravní přestupky a nehody',
        'Pracovní spory zaměstnance',
        'ALL-RISK garance, minimum výluk'
      ],
      popular: false
    },
    {
      icon: Briefcase,
      title: 'Domácnost Premium',
      audience: 'Pro celou rodinu',
      monthly: '349 Kč',
      yearly: '3 768 Kč/rok',
      limit: 'Pojistný limit 2,5 mil. Kč',
      features: [
        'Vše z balíčku Domácnost',
        'Územní platnost celá Evropa',
        'Trestní obhajoba — daňové i dopravní',
        'Mediace a expertní posudky',
        'Insolvenční a dědické řízení',
        'Dedikovaný specialista na váš případ'
      ],
      popular: true
    },
    {
      icon: Building2,
      title: 'Podnikatel & Firma',
      audience: 'OSVČ, SRO, korporace',
      monthly: 'Od 590 Kč',
      yearly: 'Cena na míru',
      limit: 'Limit dle obratu, max 5 mil. Kč',
      features: [
        'Vymáhání B2B pohledávek',
        'Pracovněprávní spory',
        'Smluvní agenda a kontroly',
        'Compliance a GDPR audit',
        'Daňové a správní řízení',
        'SLA reakce do 1 hodiny'
      ],
      popular: false
    }
  ];

  return (
    <section id="produkty" className="py-24 bg-[#F7F9FC] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] bg-[#0057F0]/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-[#008EA5]/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#0045BF]" strokeWidth={2} />
            <span className="text-sm text-[#0045BF]">Transparentní ceník bez hvězdiček</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Vyberte si balíček podle svého života
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Žádné poznámky pod čarou. Žádné skryté poplatky. Zrušení online kdykoliv.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col ${
                  product.popular
                    ? 'border-2 border-[#0045BF] shadow-2xl md:scale-105 md:-translate-y-2'
                    : 'border border-border hover:border-[#0045BF]/30 hover:shadow-xl'
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#0057F0] to-[#0045BF] text-white rounded-full text-sm whitespace-nowrap shadow-lg inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} /> Nejvolenější
                  </div>
                )}

                <div className="mb-6">
                  <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 items-center justify-center text-[#0045BF] mb-4">
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-2xl text-foreground tracking-tight">{product.title}</h3>
                  <div className="text-sm text-muted-foreground">{product.audience}</div>
                </div>

                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl text-foreground tracking-tight">{product.monthly}</span>
                    <span className="text-sm text-muted-foreground">/měs</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{product.yearly}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#008EA5]/10 text-[#008EA5] rounded-full text-xs">
                    <ShieldCheck className="w-3 h-3" strokeWidth={2.5} /> {product.limit}
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="shrink-0 w-4 h-4 rounded-full bg-[#008EA5] flex items-center justify-center mt-1">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3.5 rounded-xl transition-all ${
                    product.popular
                      ? 'bg-gradient-to-r from-[#0057F0] to-[#0045BF] text-white hover:shadow-lg'
                      : 'bg-[#F7F9FC] text-[#0045BF] border border-[#0045BF]/20 hover:bg-[#0045BF] hover:text-white hover:border-[#0045BF]'
                  }`}
                >
                  Sjednat online
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          Pojistitel: Colonnade Insurance S.A. · Nezávislý český provider · Sjednání 5 minut · Aktivace ihned
        </div>
      </div>
    </section>
  );
}
