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

            <h2 className="text-4xl lg:text-5xl leading-tight">
              Nový zdroj příjmů
              <br />
              <span className="text-white/80">za 48 hodin</span>
            </h2>

            <p className="text-xl text-white/90 leading-relaxed">
              Vyplňte formulář, absolvujte rychlé online školení a začněte vydělávat.
              Žádné investice, žádné riziko.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 bg-white text-[#0066CC] rounded-xl hover:bg-white/95 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                Začít vydělávat
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200">
                Demo platformy
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl mb-1">0 Kč</div>
                <div className="text-sm text-white/70">Vstupní investice</div>
              </div>
              <div>
                <div className="text-3xl mb-1">48h</div>
                <div className="text-sm text-white/70">Do první smlouvy</div>
              </div>
              <div>
                <div className="text-3xl mb-1">24/7</div>
                <div className="text-sm text-white/70">Platforma online</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    ✓
                  </div>
                  <div>
                    <div className="text-white mb-1">Rychlá aktivace</div>
                    <div className="text-sm text-white/70">Přístup do platformy během 24h</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    ✓
                  </div>
                  <div>
                    <div className="text-white mb-1">Online školení</div>
                    <div className="text-sm text-white/70">Vše co potřebujete vědět</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    ✓
                  </div>
                  <div>
                    <div className="text-white mb-1">První provize</div>
                    <div className="text-sm text-white/70">Okamžitě po první smlouvě</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Průměrný měsíční výdělek nových partnerů</span>
                  </div>
                  <div className="text-4xl text-white mb-2">28 500 Kč</div>
                  <div className="text-sm text-green-400">↗ Po 3 měsících spolupráce</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-xl shadow-xl p-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500">
                  💰
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
