export function WhySection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
            <span className="text-sm text-[#0066CC]">Features</span>
          </div>
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">Produktové výhody platformy</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Moderní nástroje, které skutečně fungují
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-[#0066CC] mb-2">Smart Contracts</div>
                  <h3 className="text-2xl text-foreground mb-2">Automatické generování smluv</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Systém automaticky vytvoří smlouvu podle zadaných údajů. Zero chyb, instant PDF.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm">📝</div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Smlouva_JanNovak_2026.pdf</div>
                    <div className="text-xs text-muted-foreground">Vygenerováno před 2 sekundami</div>
                  </div>
                  <div className="text-green-600 text-sm">✓</div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-green-600 mb-2">Real-time Tracking</div>
                  <h3 className="text-2xl text-foreground mb-2">Live sledování provizí</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Každá nová smlouva okamžitě přičte provizi. Vidíte earnings v reálném čase.
              </p>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Dnes</span>
                  <span className="text-2xl text-green-900">6 840 Kč</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-600 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs text-green-700">+18%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-purple-600 mb-2">E-Signature</div>
                  <h3 className="text-2xl text-foreground mb-2">Kvalifikovaný e-podpis</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Klient podepíše online z mobilu nebo PC. Právně platné, instant aktivace.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">✍️</div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground mb-1">Čeká na podpis</div>
                    <div className="text-xs text-muted-foreground">Klient dostal SMS s odkazem</div>
                  </div>
                  <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-orange-600 mb-2">Client Portal</div>
                  <h3 className="text-2xl text-foreground mb-2">Přehled všech klientů</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Centralizovaný seznam všech klientů, smluv, žádostí a historií komunikace.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border space-y-2">
                {[
                  { name: 'Jan Novák', status: 'active', value: '950 Kč' },
                  { name: 'Eva Malá', status: 'pending', value: '1200 Kč' }
                ].map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white text-xs flex items-center justify-center">
                        {client.name[0]}
                      </div>
                      <span className="text-sm text-foreground">{client.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{client.value}</span>
                      <div className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
