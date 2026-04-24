import { ArrowRight, Check, GraduationCap, Wallet, Zap, TrendingUp } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0066CC] via-[#0052A3] to-[#003d7a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white">Registrace otevřené</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-balance">
              Nový zdroj příjmů{' '}
              <span className="text-white/80 whitespace-nowrap">za 48 hodin</span>
            </h2>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed text-pretty">
              Vyplňte formulář, absolvujte rychlé online školení a začněte vydělávat.
              Žádné investice, žádné riziko.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-[#0066CC] rounded-xl hover:bg-white/95 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                Začít vydělávat
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200">
                Demo platformy
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl md:text-3xl mb-1 tracking-tight">0 Kč</div>
                <div className="text-sm text-white/70">Vstupní investice</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl mb-1 tracking-tight">48 h</div>
                <div className="text-sm text-white/70">Do první smlouvy</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl mb-1 tracking-tight">24/7</div>
                <div className="text-sm text-white/70">Platforma online</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Rychlá aktivace', desc: 'Přístup do platformy během 24 h' },
                  { icon: GraduationCap, title: 'Online školení', desc: 'Vše, co potřebujete vědět' },
                  { icon: Wallet, title: 'První provize', desc: 'Okamžitě po první smlouvě' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0">
                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-white mb-1">{item.title}</div>
                        <div className="text-sm text-white/70">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Průměrný měsíční výdělek nových partnerů</span>
                  </div>
                  <div className="text-3xl md:text-4xl text-white mb-2 tracking-tight">28 500 Kč</div>
                  <div className="text-sm text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Po 3 měsících spolupráce
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500">
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-white text-sm">Nová provize</div>
                  <div className="text-white/90 text-xs">+1 200 Kč</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
