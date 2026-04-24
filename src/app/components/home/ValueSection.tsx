import { Wallet, Zap, Scale, FileText, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Value = { icon: LucideIcon; title: string; description: string };

export function ValueSection() {
  const values: Value[] = [
    {
      icon: Wallet,
      title: 'Právník bez nečekaných nákladů',
      description: 'Právní pomoc bez starostí o hodinové sazby'
    },
    {
      icon: Zap,
      title: 'Okamžitá pomoc',
      description: 'Dostupní 24/7, když právníka potřebujete'
    },
    {
      icon: Scale,
      title: 'Zastoupení ve sporu',
      description: 'Profesionální právní zastoupení v ceně'
    },
    {
      icon: FileText,
      title: 'Úhrada právních výdajů',
      description: 'Soudní poplatky a náklady řízení hrazeny'
    },
    {
      icon: Smartphone,
      title: 'Online přehled případů',
      description: 'Sledujte průběh vašich případů v aplikaci'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Když nastane problém, nejste na to sami
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Komplexní právní ochrana pro klid ve vašem životě
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-white border border-border rounded-2xl hover:shadow-xl hover:border-[#0066CC]/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 items-center justify-center text-[#0066CC] mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg md:text-xl mb-3 text-foreground tracking-tight">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
