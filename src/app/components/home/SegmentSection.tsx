export function SegmentSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">Pro koho je Lexia</h2>
          <p className="text-xl text-muted-foreground">
            Právní ochrana pro každou životní situaci
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group relative bg-gradient-to-br from-[#F7F9FC] to-white rounded-3xl border-2 border-border hover:border-[#0066CC]/30 p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl mb-6">
                🏠
              </div>

              <h3 className="text-3xl mb-4 text-foreground">Rodiny a jednotlivci</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Každodenní situace, které se mohou stát každému.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Problémy s pronájmem',
                  'Spotřebitelské spory',
                  'Dopravní nehody',
                  'Sousedské spory'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <button className="px-6 py-3 bg-white text-[#0066CC] rounded-xl border-2 border-[#0066CC]/20 hover:bg-[#0066CC] hover:text-white transition-all group-hover:shadow-lg">
                Zjistit více →
              </button>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-[#F7F9FC] to-white rounded-3xl border-2 border-border hover:border-[#0066CC]/30 p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl mb-6">
                💼
              </div>

              <h3 className="text-3xl mb-4 text-foreground">Podnikatelé a firmy</h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Ochrana vašeho podnikání před právními riziky.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Nezaplacené faktury',
                  'Smlouvy a obchodní spory',
                  'Pracovněprávní věci',
                  'Ochrana duševního vlastnictví'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <button className="px-6 py-3 bg-white text-purple-600 rounded-xl border-2 border-purple-600/20 hover:bg-purple-600 hover:text-white transition-all group-hover:shadow-lg">
                Zjistit více →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
