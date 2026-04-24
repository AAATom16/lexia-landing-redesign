export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F9FC]">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0066CC]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0052A3]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#0066CC]/20 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-foreground">Plně digitální platforma</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl leading-tight text-foreground">
                Právní ochrana,
                <br />
                <span className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] bg-clip-text text-transparent">
                  kterou prodáte během minut
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Digitální platforma pro partnery. Sjednejte smlouvu za 3 minuty,
                sledujte provize v reálném čase a spravujte celé portfolio online.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button className="px-8 py-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                Začít vydělávat
              </button>
              <button className="px-8 py-4 bg-white text-foreground rounded-xl border border-border hover:shadow-lg transition-all duration-200">
                Ukázka platformy
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl text-foreground mb-1">3 min</div>
                <div className="text-sm text-muted-foreground">Průměrná doba sjednání</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-3xl text-foreground mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Přístup do platformy</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-3xl text-foreground mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Online proces</div>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-12">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#0066CC]/20 to-[#0052A3]/20 rounded-3xl blur-2xl" />

              <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded" />
                    </div>
                    <span className="text-white">Partner Dashboard</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                      <div className="text-sm text-green-700 mb-1">Měsíční provize</div>
                      <div className="text-2xl text-green-900">48 750 Kč</div>
                      <div className="text-xs text-green-600 mt-1">↗ +23% vs minulý měsíc</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                      <div className="text-sm text-blue-700 mb-1">Aktivní smlouvy</div>
                      <div className="text-2xl text-blue-900">127</div>
                      <div className="text-xs text-blue-600 mt-1">+8 tento týden</div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F7F9FC] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-foreground">Poslední smlouvy</span>
                      <span className="text-xs text-muted-foreground">Dnes</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Jan Novák', amount: '850 Kč', time: '10:23' },
                        { name: 'Marie Svobodová', amount: '1 200 Kč', time: '09:15' },
                        { name: 'Petr Dvořák', amount: '950 Kč', time: '08:47' }
                      ].map((contract, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center text-white text-xs">
                              {contract.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm text-foreground">{contract.name}</div>
                              <div className="text-xs text-muted-foreground">{contract.time}</div>
                            </div>
                          </div>
                          <div className="text-sm text-green-600">{contract.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-lg text-sm hover:shadow-lg transition-all">
                    + Nová smlouva
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl border border-border p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    ✓
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Smlouva sjednána</div>
                    <div className="text-xs text-muted-foreground">Právě teď</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
