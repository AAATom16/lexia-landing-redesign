import { Clock, TrendingUp, Zap, BarChart } from 'lucide-react';

const metrics = [
  {
    icon: Clock,
    value: '3 minuty',
    label: 'Průměrná doba sjednání',
    description: 'Kompletní proces od vstupu po podpis',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: TrendingUp,
    value: '850-1200 Kč',
    label: 'Provize za smlouvu',
    description: 'Podle zvoleného provizního modelu',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Zap,
    value: '100%',
    label: 'Digitální proces',
    description: 'Bez papírování, podpis online',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: BarChart,
    value: 'Realtime',
    label: 'Sledování výkonu',
    description: 'Provize, smlouvy, statistiky živě',
    color: 'from-orange-500 to-orange-600'
  }
];

export function ValueSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#F7F9FC] to-transparent" />

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0066CC]/10 rounded-full mb-6">
            <span className="text-sm text-[#0066CC]">Produktová hodnota</span>
          </div>
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Čísla, která mluví za vše
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rychlost, výdělek a jednoduchost v jedné platformě
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"
                   style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />

              <div className="relative p-8 bg-white border border-border rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="w-7 h-7 text-white" />
                </div>

                <div className="text-3xl lg:text-4xl mb-2 text-foreground">
                  {metric.value}
                </div>
                <div className="text-base mb-3 text-foreground">
                  {metric.label}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 lg:p-12 bg-gradient-to-br from-[#F7F9FC] to-white rounded-3xl border border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl mb-4 text-foreground">
                Jak to funguje v praxi?
              </h3>
              <div className="space-y-4">
                {[
                  { step: '01', text: 'Klient vyplní základní údaje v online formuláři', time: '1 min' },
                  { step: '02', text: 'Systém automaticky vypočítá cenu a vytvoří smlouvu', time: '30 sec' },
                  { step: '03', text: 'Klient podepíše online, vy vidíte provizi okamžitě', time: '1 min' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center text-white">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground mb-1">{item.text}</p>
                      <p className="text-sm text-[#0066CC]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-muted-foreground">Nové sjednání</div>
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-[#0066CC] rounded-full" />
                    <div className="w-8 h-1 bg-[#0066CC] rounded-full" />
                    <div className="w-8 h-1 bg-[#E5E9F0] rounded-full" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Klient</div>
                    <div className="p-3 bg-[#F7F9FC] rounded-lg text-sm text-foreground">
                      Jan Novák, 35 let
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Balíček</div>
                    <div className="p-3 bg-[#F7F9FC] rounded-lg text-sm text-foreground">
                      Kompletní ochrana
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-700 mb-1">Vaše provize</div>
                        <div className="text-2xl text-green-900">950 Kč</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                        ✓
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-lg text-sm">
                    Dokončit sjednání
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
