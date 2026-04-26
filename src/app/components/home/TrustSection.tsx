import { Award, ShieldCheck, Zap, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = { icon: LucideIcon; title: string; description: string };

export function TrustSection() {
  const stats = [
    { value: '20+', label: 'let zkušeností zakladatelů', sub: 'Bývalí experti D.A.S.' },
    { value: '2,5 mil.', label: 'Kč pojistný limit', sub: 'Nejvyšší na trhu' },
    { value: '24/7', label: 'právní pomoc', sub: 'Telefon i online chat' },
    { value: '< 2 h', label: 'průměrná reakce', sub: 'Bez čekání na pobočce' }
  ];

  const features: Feature[] = [
    {
      icon: Building2,
      title: 'Pojistitel: Colonnade Insurance S.A.',
      description: 'Lucemburská pojišťovna ze skupiny Fairfax Financial Holdings. Stabilita a mezinárodní zázemí.'
    },
    {
      icon: Award,
      title: 'Nezávislí, bez korporátu',
      description: 'Nejsme součástí žádného velkého korporátu. Klient na prvním místě, ne kvartální KPI.'
    },
    {
      icon: ShieldCheck,
      title: 'ALL-RISK garance',
      description: 'Minimum výluk. Pokrýváme to, co ostatní vylučují drobným písmem ve smlouvě.'
    },
    {
      icon: Zap,
      title: 'Specialisté po celé ČR',
      description: 'Síť právníků s licencí ČAK ve všech krajích. Plus partneři po celé Evropě.'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[40rem] bg-gradient-to-r from-[#0057F0]/3 to-[#008EA5]/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
            <ShieldCheck className="w-4 h-4 text-[#0045BF]" strokeWidth={2} />
            <span className="text-sm text-[#0045BF]">Důvěryhodný partner</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Jdeme svou cestou. Pro vás, ne pro akcionáře
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Zakladatelé Lexia mají 20+ let zkušeností v právní ochraně.
            Postavili jsme produkt, jaký bychom sami chtěli mít.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-5 bg-gradient-to-br from-white to-[#F7F9FC] rounded-2xl border border-border">
              <div className="font-display text-2xl md:text-3xl bg-gradient-to-r from-[#0057F0] to-[#001843] bg-clip-text text-transparent mb-2 tracking-tight whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-sm text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 bg-[#F7F9FC] rounded-2xl border border-border hover:border-[#0045BF]/30 hover:shadow-lg transition-all">
                <div className="inline-flex w-12 h-12 rounded-xl bg-white items-center justify-center text-[#0045BF] mb-4 border border-border">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-base text-foreground mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
