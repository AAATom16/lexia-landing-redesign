import { Home, Briefcase, ArrowRight } from 'lucide-react';

export function SegmentSection() {
  function scrollToProducts() {
    const el = document.getElementById('produkty');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">Pro koho je Lexia</h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Právní ochrana pro každou životní situaci
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group relative bg-gradient-to-br from-[#F7F9FC] to-white rounded-3xl border-2 border-border hover:border-[#0045BF]/30 p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#0045BF]/20">
                <Home className="w-7 h-7" strokeWidth={1.75} />
              </div>

              <h3 className="text-2xl md:text-3xl mb-4 text-foreground tracking-tight">Rodiny a jednotlivci</h3>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
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
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0045BF]" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={scrollToProducts} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0045BF] rounded-xl border-2 border-[#0045BF]/20 hover:bg-[#0045BF] hover:text-white transition-all group-hover:shadow-lg">
                Zjistit více
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-[#F7F9FC] to-white rounded-3xl border-2 border-border hover:border-[#0045BF]/30 p-10 hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-slate-500/10 to-slate-700/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white mb-6 shadow-lg shadow-slate-900/20">
                <Briefcase className="w-7 h-7" strokeWidth={1.75} />
              </div>

              <h3 className="text-2xl md:text-3xl mb-4 text-foreground tracking-tight">Podnikatelé a firmy</h3>
              <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
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
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={scrollToProducts} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl border-2 border-slate-300 hover:bg-slate-900 hover:text-white transition-all group-hover:shadow-lg">
                Zjistit více
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
