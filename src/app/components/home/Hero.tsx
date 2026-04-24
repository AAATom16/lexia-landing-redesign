export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F9FC] pt-8 pb-24">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0066CC]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#0052A3]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl leading-tight text-foreground">
                Právní problém vás může stát{' '}
                <span className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] bg-clip-text text-transparent">
                  desítky tisíc.
                </span>
                <br />
                Vyřešit ho můžete během pár minut.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sjednejte si právní ochranu online a mějte právníka vždy po ruce –
                pro každodenní situace doma i v podnikání.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                Sjednat online
              </button>
              <button className="px-8 py-4 bg-white text-foreground rounded-xl border border-border hover:shadow-lg transition-all duration-200">
                Jak to funguje
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-4">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bez papírování. Aktivní během pár minut.</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#0066CC]/20 to-[#0052A3]/20 rounded-3xl blur-2xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] px-6 py-4">
                <div className="text-white/80 text-sm">Právní pojištění</div>
                <div className="text-white text-xl">Sjednání online</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Pro koho sjednáváte?</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 border-2 border-[#0066CC] bg-[#0066CC]/5 rounded-xl cursor-pointer">
                        <div className="text-sm text-foreground mb-1">🏠 Domácnost</div>
                        <div className="text-xs text-muted-foreground">Rodina, jednotlivec</div>
                      </div>
                      <div className="p-4 border border-border bg-white rounded-xl cursor-pointer hover:border-[#0066CC]/30">
                        <div className="text-sm text-foreground mb-1">💼 Podnikatel</div>
                        <div className="text-xs text-muted-foreground">OSVČ, firma</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F7F9FC] rounded-xl">
                    <div className="text-xs text-muted-foreground mb-2">Vaše ochrana zahrnuje</div>
                    <div className="space-y-2">
                      {[
                        'Právní poradenství 24/7',
                        'Zastoupení ve sporech',
                        'Úhrada soudních poplatků'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-900">Cena pojištění</span>
                      <span className="text-2xl text-green-900">Od 2 400 Kč/rok</span>
                    </div>
                    <div className="text-xs text-green-700">= 200 Kč měsíčně</div>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-lg hover:shadow-lg transition-all">
                    Pokračovat →
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
