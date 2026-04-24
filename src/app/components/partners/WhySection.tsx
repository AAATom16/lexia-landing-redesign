import { FileText, TrendingUp, PenLine, Users, Check, FileCheck } from 'lucide-react';

export function WhySection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
            <span className="text-sm text-[#0066CC]">Funkce</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">Produktové výhody platformy</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Moderní nástroje, které skutečně fungují
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-[#0066CC] mb-2">Smart Contracts</div>
                  <h3 className="text-xl md:text-2xl text-foreground mb-2 tracking-tight">Automatické generování smluv</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                  <FileText className="w-6 h-6" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-pretty">
                Systém automaticky vytvoří smlouvu podle zadaných údajů. Nulové chyby, okamžité PDF.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0066CC] border border-border">
                    <FileCheck className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">Smlouva_JanNovak_2026.pdf</div>
                    <div className="text-xs text-muted-foreground">Vygenerováno před 2 sekundami</div>
                  </div>
                  <Check className="w-5 h-5 text-green-600 shrink-0" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-green-600 mb-2">Sledování v reálném čase</div>
                  <h3 className="text-xl md:text-2xl text-foreground mb-2 tracking-tight">Živé sledování provizí</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-500/20">
                  <TrendingUp className="w-6 h-6" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-pretty">
                Každá nová smlouva okamžitě přičte provizi. Vidíte výdělek v reálném čase.
              </p>
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-700">Dnes</span>
                  <span className="text-2xl text-green-900 tracking-tight">6 840 Kč</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-600 rounded-full animate-pulse" />
                  </div>
                  <span className="text-xs text-green-700">+18 %</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-purple-600 mb-2">E-podpis</div>
                  <h3 className="text-xl md:text-2xl text-foreground mb-2 tracking-tight">Kvalifikovaný elektronický podpis</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                  <PenLine className="w-6 h-6" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-pretty">
                Klient podepíše online z mobilu nebo PC. Právně platné, okamžitá aktivace.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <PenLine className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground mb-1">Čeká na podpis</div>
                    <div className="text-xs text-muted-foreground">Klient dostal SMS s odkazem</div>
                  </div>
                  <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-white border border-border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-orange-600 mb-2">Klientský portál</div>
                  <h3 className="text-xl md:text-2xl text-foreground mb-2 tracking-tight">Přehled všech klientů</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                  <Users className="w-6 h-6" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-pretty">
                Centralizovaný seznam všech klientů, smluv, žádostí a historie komunikace.
              </p>
              <div className="bg-[#F7F9FC] rounded-xl p-4 border border-border space-y-2">
                {[
                  { name: 'Jan Novák', status: 'active', value: '950 Kč' },
                  { name: 'Eva Malá', status: 'pending', value: '1 200 Kč' }
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
