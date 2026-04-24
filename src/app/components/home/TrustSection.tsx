import { Award, ShieldCheck, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = { icon: LucideIcon; title: string; description: string };

export function TrustSection() {
  const stats = [
    { value: '15+', label: 'let zkušeností' },
    { value: '50 000+', label: 'spokojených klientů' },
    { value: '120 000+', label: 'vyřešených případů' },
    { value: '99%', label: 'úspěšnost' }
  ];

  const features: Feature[] = [
    {
      icon: Award,
      title: 'Certifikovaní právníci',
      description: 'Tým zkušených právních expertů s licencí ČAK'
    },
    {
      icon: ShieldCheck,
      title: 'Bezpečnost dat',
      description: 'Nejvyšší standardy ochrany vašich osobních údajů'
    },
    {
      icon: Zap,
      title: 'Rychlá reakce',
      description: 'Průměrná doba odpovědi méně než 2 hodiny'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Partner, na kterého se můžete spolehnout
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Zkušenosti a důvěra tisíců klientů
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 md:p-6">
              <div className="text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-[#0066CC] to-[#0052A3] bg-clip-text text-transparent mb-3 tracking-tight whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 bg-[#F7F9FC] rounded-2xl border border-border">
                <div className="inline-flex w-12 h-12 rounded-xl bg-white items-center justify-center text-[#0066CC] mb-4 border border-border">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg text-foreground mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
