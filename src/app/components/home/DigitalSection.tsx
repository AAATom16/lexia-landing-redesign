import { Zap, BarChart3, MessageSquare, FileX, Home, Car } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = { icon: LucideIcon; title: string; description: string };

export function DigitalSection() {
  const features: Feature[] = [
    {
      icon: Zap,
      title: 'Nahlášení případu během pár minut',
      description: 'Rychlý formulář s inteligentním asistentem'
    },
    {
      icon: BarChart3,
      title: 'Přehled případů v aplikaci',
      description: 'Sledujte stav všech vašich právních věcí'
    },
    {
      icon: MessageSquare,
      title: 'Rychlá komunikace',
      description: 'Chat s právníkem přímo v aplikaci'
    },
    {
      icon: FileX,
      title: 'Bez papírování',
      description: 'Vše digitálně, včetně dokumentů a podpisů'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
                <span className="text-sm text-[#0066CC]">Digitální platforma</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
                Vše vyřídíte online
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                Moderní platforma pro správu vašich právních záležitostí
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 flex items-center justify-center text-[#0066CC]">
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="text-lg text-foreground mb-1 tracking-tight">{feature.title}</h3>
                      <p className="text-muted-foreground text-pretty">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#0066CC]/20 to-[#0052A3]/20 rounded-3xl blur-2xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] px-6 py-4">
                <div className="text-white/80 text-sm">Vaše případy</div>
                <div className="text-white text-xl">Dashboard</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="text-2xl text-green-900 mb-1">3</div>
                    <div className="text-xs text-green-700">Vyřešeno</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                    <div className="text-2xl text-blue-900 mb-1">1</div>
                    <div className="text-xs text-blue-700">Probíhá</div>
                  </div>
                  <div className="p-4 bg-[#F7F9FC] rounded-xl border border-border">
                    <div className="text-2xl text-foreground mb-1">0</div>
                    <div className="text-xs text-muted-foreground">Čeká</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-foreground mb-2">Aktivní případy</div>

                  <div className="p-4 bg-[#F7F9FC] rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center text-white">
                          <Home className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="text-sm text-foreground">Spor o kauci</div>
                          <div className="text-xs text-muted-foreground">Nahlášeno 15. 4. 2026</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Probíhá
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-blue-600 rounded-full" />
                      </div>
                      <span className="text-xs text-muted-foreground">66%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                          <Car className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="text-sm text-foreground">Dopravní nehoda</div>
                          <div className="text-xs text-muted-foreground">Vyřešeno 10. 4. 2026</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Vyřešeno
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-lg text-sm">
                  + Nahlásit nový případ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
