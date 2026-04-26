import { Check, Home, Briefcase, ShieldCheck, Star, ArrowRight } from 'lucide-react';

export function Hero() {
  const limits = [
    { label: 'Pojistný limit', value: '2,5 mil. Kč' },
    { label: 'Sjednání', value: '5 minut' },
    { label: 'Územní platnost', value: 'Celá Evropa' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F7F9FC] via-white to-[#F7F9FC] pt-12 pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-[#0057F0]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[36rem] h-[36rem] bg-[#008EA5]/6 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[20rem] h-[20rem] bg-[#0045BF]/4 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" strokeWidth={0} />
                <Star className="w-4 h-4 fill-amber-500" strokeWidth={0} />
                <Star className="w-4 h-4 fill-amber-500" strokeWidth={0} />
                <Star className="w-4 h-4 fill-amber-500" strokeWidth={0} />
                <Star className="w-4 h-4 fill-amber-500" strokeWidth={0} />
              </span>
              <span className="text-sm text-foreground">Nejvyšší limity na českém trhu</span>
            </div>

            <div className="space-y-6">
              <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl leading-[1.05] tracking-tight text-foreground text-balance">
                Právní ochrana, která má{' '}
                <span className="bg-gradient-to-r from-[#0057F0] via-[#0045BF] to-[#001843] bg-clip-text text-transparent whitespace-nowrap">smysl.</span>{' '}
                Záchranný kruh, když ho potřebujete.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl text-pretty">
                Spor s nájemcem, sousedem, zaměstnavatelem nebo dopravní nehoda?
                Zaplatíme právníka, soudní poplatky i znalecké posudky. Vy jen zavoláte.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="group px-7 py-4 bg-gradient-to-r from-[#0057F0] to-[#0045BF] text-white rounded-xl hover:shadow-xl hover:shadow-[#0045BF]/20 transition-all duration-200 transform hover:scale-[1.02] inline-flex items-center justify-center gap-2">
                Sjednat od 179 Kč/měs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <button className="px-7 py-4 bg-white text-foreground rounded-xl border border-border hover:border-[#0045BF]/30 hover:shadow-lg transition-all duration-200">
                Spočítat moji ochranu
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              {limits.map((l) => (
                <div key={l.label}>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">{l.label}</div>
                  <div className="font-display text-lg md:text-xl text-foreground tracking-tight">{l.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008EA5]" strokeWidth={3} /> ALL-RISK garance
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008EA5]" strokeWidth={3} /> Bez papírování
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#008EA5]" strokeWidth={3} /> Aktivace ihned
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#0057F0]/20 via-[#0045BF]/15 to-[#008EA5]/15 rounded-[2rem] blur-2xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0045BF] via-[#003799] to-[#001843] px-6 py-5 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-xs uppercase tracking-wider">Lexia Online</div>
                    <div className="text-white text-xl font-display">Vaše právní ochrana</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-full text-white text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} /> Krok 1/3
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Pro koho sjednáváte</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border-2 border-[#0045BF] bg-[#0045BF]/5 rounded-xl cursor-pointer relative">
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0045BF] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-[#0045BF]" strokeWidth={2} />
                        <span className="text-sm text-foreground">Domácnost</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rodina, jednotlivec</div>
                    </div>
                    <div className="p-4 border border-border bg-white rounded-xl cursor-pointer hover:border-[#0045BF]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                        <span className="text-sm text-foreground">Podnikatel</span>
                      </div>
                      <div className="text-xs text-muted-foreground">OSVČ, firma</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#F7F9FC] to-[#0045BF]/5 rounded-xl border border-border">
                  <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Co máte v ochraně</div>
                  <div className="space-y-2">
                    {[
                      'Právník 24/7 — telefon i online',
                      'Soudní spory a zastupování',
                      'Úhrada poplatků a posudků až 2,5M Kč',
                      'Mediace a mimosoudní řešení'
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <div className="shrink-0 w-4 h-4 rounded-full bg-[#008EA5] flex items-center justify-center mt-0.5">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#008EA5]/10 to-[#00A5BF]/5 rounded-xl border border-[#008EA5]/20">
                  <div>
                    <div className="text-xs text-[#008EA5] uppercase tracking-wider">Vaše cena</div>
                    <div className="font-display text-2xl text-foreground tracking-tight">179 Kč<span className="text-sm text-muted-foreground">/měs</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground line-through">2 400 Kč/rok</div>
                    <div className="text-xs text-[#008EA5]">Roční sleva −10 %</div>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-gradient-to-r from-[#0057F0] to-[#0045BF] text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 group">
                  Pokračovat
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>

                <div className="text-center text-xs text-muted-foreground">
                  Smlouva 2 strany. Zrušení online kdykoliv.
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden md:flex items-center gap-3 bg-white rounded-xl shadow-xl border border-border p-3 max-w-[15rem]">
              <div className="shrink-0 w-9 h-9 rounded-full bg-[#008EA5]/10 flex items-center justify-center text-[#008EA5]">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Pojistitel</div>
                <div className="text-sm text-foreground">Colonnade Insurance S.A.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
