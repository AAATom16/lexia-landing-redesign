export function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0066CC] via-[#0052A3] to-[#003d7a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] tracking-tight text-balance">
            Jeden právní problém vás může stát víc než roční pojištění
          </h2>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto text-pretty">
            S Lexií máte právní pomoc vždy po ruce. Bez starostí, bez nečekaných výdajů.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-10 py-5 bg-white text-[#0066CC] rounded-xl hover:bg-white/95 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.05] text-lg">
              Sjednat právní ochranu
            </button>
            <button className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl hover:bg-white/20 transition-all duration-200 text-lg">
              Porovnat balíčky
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/20 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl md:text-3xl mb-2 tracking-tight">5 min</div>
              <div className="text-sm text-white/70">Sjednání online</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl mb-2 tracking-tight">24/7</div>
              <div className="text-sm text-white/70">Právní pomoc</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl mb-2 tracking-tight">0 Kč</div>
              <div className="text-sm text-white/70">Skryté poplatky</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
