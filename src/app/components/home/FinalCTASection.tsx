import { ArrowRight, Phone } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section id="kontakt" className="py-24 bg-gradient-to-br from-[#0057F0] via-[#0045BF] to-[#001843] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-[#00A5BF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#00A5BF] animate-pulse" />
            <span className="text-sm text-white">Ochrana začíná dnes</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] tracking-tight text-balance">
            Jeden právní spor stojí víc{' '}
            <span className="bg-gradient-to-r from-white to-[#7da0dc] bg-clip-text text-transparent">
              než 10 let pojištění
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto text-pretty">
            Hodíme vám záchranný kruh, když ho budete potřebovat.
            Sjednání 5 minut, aktivace ihned, smlouva na dvě strany.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="group px-8 py-4 bg-white text-[#0045BF] rounded-xl hover:bg-white/95 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-[1.03] inline-flex items-center justify-center gap-2 text-lg">
              Sjednat od 179 Kč/měs
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </button>
            <a
              href="tel:+420465465465"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2 text-lg"
            >
              <Phone className="w-5 h-5" strokeWidth={2} />
              +420 465 465 465
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-12 border-t border-white/20 max-w-2xl mx-auto">
            <div>
              <div className="font-display text-2xl md:text-3xl mb-1 tracking-tight">5 min</div>
              <div className="text-sm text-white/70">Sjednání online</div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl mb-1 tracking-tight">2,5M</div>
              <div className="text-sm text-white/70">Limit na případ</div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl mb-1 tracking-tight">0 Kč</div>
              <div className="text-sm text-white/70">Skryté poplatky</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
