import { Wallet, Zap, Scale, FileText, Smartphone, Globe2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Value = { icon: LucideIcon; title: string; description: string };

export function ValueSection() {
  const values: Value[] = [
    {
      icon: Wallet,
      title: 'Šetří čas, peníze a nervy',
      description: 'Žádné hodinové sazby právníka. Žádné soudní poplatky z vlastní kapsy. Vše v ceně pojištění.'
    },
    {
      icon: Zap,
      title: 'Právník 24/7 na telefonu',
      description: 'Specialisté po celé republice. Zavoláte, popíšete situaci, my dál vyřešíme za vás.'
    },
    {
      icon: Scale,
      title: 'Zastoupení až k soudu',
      description: 'Mediace, mimosoudní jednání i právní zastoupení v civilním a trestním řízení.'
    },
    {
      icon: FileText,
      title: 'Úhrada celých nákladů',
      description: 'Soudní poplatky, znalecké posudky, exekuce — limit až 2,5 mil. Kč na každý případ.'
    },
    {
      icon: Globe2,
      title: 'Územní platnost EU',
      description: 'Spor v zahraničí? Pomáháme vám i při nehodách a sporech kdekoli v Evropě.'
    },
    {
      icon: Smartphone,
      title: 'Vše online ve vašem účtu',
      description: 'Časová osa případu, chat s právníkem, dokumenty ke stažení. Bez čekání na pobočku.'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-[#0045BF]/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
            <span className="w-2 h-2 rounded-full bg-[#008EA5]" />
            <span className="text-sm text-[#0045BF]">Proč Lexia</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Když přijde právní problém, nemusíte ho řešit sami
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hodíme vám záchranný kruh. Vyřešíme to za vás — bez papírování, bez běhání po úřadech.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group p-8 bg-white border border-border rounded-2xl hover:shadow-xl hover:border-[#0045BF]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#0045BF]/10 to-[#008EA5]/10 items-center justify-center text-[#0045BF] mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg md:text-xl mb-3 text-foreground tracking-tight">{value.title}</h3>
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
