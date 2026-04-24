export function ToolsSection() {
  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border mb-6">
            <span className="text-sm text-[#0066CC]">Platforma</span>
          </div>
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">Vše, co potřebujete na jednom místě</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pokročilé nástroje pro správu portfolia a maximalizaci příjmů
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="p-6 bg-gradient-to-br from-[#0066CC] to-[#0052A3]">
              <div className="text-white/80 text-sm mb-2">Rychlé sjednání</div>
              <div className="text-white text-2xl mb-4">3 minuty</div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-xs">1</div>
                  <div className="flex-1 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-full bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-xs">2</div>
                  <div className="flex-1 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-full bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0066CC] text-xs">3</div>
                  <div className="flex-1 h-2 bg-white/30 rounded-full">
                    <div className="h-full w-2/3 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl mb-3 text-foreground">Streamlined onboarding</h3>
              <p className="text-muted-foreground mb-4">
                Klient vyplní údaje, systém vytvoří smlouvu, vše podepíše online. Hotovo.
              </p>
              <div className="text-sm text-[#0066CC]">→ Bez papírování</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="p-6">
              <div className="text-muted-foreground text-sm mb-2">Analytics Dashboard</div>
              <div className="text-foreground text-2xl mb-4">Real-time data</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-lg">
                  <span className="text-sm text-foreground">Dnešní smlouvy</span>
                  <span className="text-lg text-[#0066CC]">8</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-lg">
                  <span className="text-sm text-foreground">Tento měsíc</span>
                  <span className="text-lg text-green-600">127</span>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg border border-green-200">
                  <div className="text-xs text-green-700 mb-1">Měsíční provize</div>
                  <div className="text-xl text-green-900">48 750 Kč</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-green-600 rounded-full" />
                    </div>
                    <span className="text-xs text-green-700">75%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#F7F9FC] border-t border-border">
              <h3 className="text-xl mb-3 text-foreground">Komplexní přehled</h3>
              <p className="text-muted-foreground mb-4">
                Sledujte všechny smlouvy, provize a statistiky v reálném čase.
              </p>
              <div className="text-sm text-[#0066CC]">→ Živá data</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="p-6">
              <div className="text-muted-foreground text-sm mb-2">Provizní modely</div>
              <div className="text-foreground text-2xl mb-4">Flexibilní nastavení</div>
              <div className="space-y-3">
                <div className="p-4 border-2 border-[#0066CC] rounded-lg bg-[#0066CC]/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Model A</span>
                    <div className="w-5 h-5 rounded-full bg-[#0066CC] flex items-center justify-center text-white text-xs">✓</div>
                  </div>
                  <div className="text-lg text-[#0066CC] mb-1">850-1200 Kč</div>
                  <div className="text-xs text-muted-foreground">Za smlouvu</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Model B</span>
                  </div>
                  <div className="text-lg text-foreground mb-1">8-12%</div>
                  <div className="text-xs text-muted-foreground">Z ročního pojistného</div>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Custom</span>
                  </div>
                  <div className="text-lg text-foreground mb-1">Kombinace</div>
                  <div className="text-xs text-muted-foreground">Dle dohody</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[#F7F9FC] border-t border-border">
              <h3 className="text-xl mb-3 text-foreground">Váš model</h3>
              <p className="text-muted-foreground mb-4">
                Vyberte si provizní model, který nejlépe sedí vašemu byznysu.
              </p>
              <div className="text-sm text-[#0066CC]">→ Plná kontrola</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
