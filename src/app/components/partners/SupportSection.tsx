import { Check } from 'lucide-react';

export function SupportSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F9FC] rounded-full border border-border mb-6">
                <span className="text-sm text-[#0045BF]">Onboarding & podpora</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
                Vše nastavíme za vás
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground text-pretty">
                Od registrace po první smlouvu během 48 hodin. Včetně školení.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Aktivace účtu',
                  desc: 'Nastavíme vám přístup do platformy a provizní model',
                  time: '24h'
                },
                {
                  step: '2',
                  title: 'Online školení',
                  desc: 'Živý webinář + e-learning materiály k produktu',
                  time: '1-2h'
                },
                {
                  step: '3',
                  title: 'První smlouva',
                  desc: 'Společné sjednání s naším specialistou',
                  time: '30 min'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-[#F7F9FC] rounded-xl border border-border hover:shadow-lg transition-all duration-200">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center text-white text-xl">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg text-foreground">{item.title}</h3>
                      <span className="text-sm text-[#0045BF] bg-white px-3 py-1 rounded-full">{item.time}</span>
                    </div>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-200 flex items-center justify-center text-green-700 shrink-0">
                  <Check className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg text-green-900 mb-1">Kontinuální podpora</h4>
                  <p className="text-sm text-green-700">
                    Váš osobní partner manažer dostupný kdykoliv pro konzultace, nové materiály, řešení případů.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#0045BF]/20 to-[#001843]/20 rounded-3xl blur-2xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0045BF] to-[#001843] px-6 py-4">
                <div className="text-white/80 text-sm">Vzdělávací centrum</div>
                <div className="text-white text-xl">Partner Academy</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F7F9FC] rounded-xl">
                    <div className="text-3xl mb-1">24</div>
                    <div className="text-sm text-muted-foreground">E-learning kurzů</div>
                  </div>
                  <div className="p-4 bg-[#F7F9FC] rounded-xl">
                    <div className="text-3xl mb-1">12</div>
                    <div className="text-sm text-muted-foreground">Živých webinářů/rok</div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-foreground">Aktuální kurzy</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Úvod do právní ochrany', progress: 100, status: 'Dokončeno' },
                      { title: 'Technika prodeje', progress: 60, status: 'Probíhá' },
                      { title: 'Specifické případy', progress: 0, status: 'Nový' }
                    ].map((course, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-foreground">{course.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            course.status === 'Dokončeno' ? 'bg-green-100 text-green-700' :
                            course.status === 'Probíhá' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="h-2 bg-[#E5E9F0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              course.status === 'Dokončeno' ? 'bg-green-500' :
                              course.status === 'Probíhá' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-lg text-sm">
                    Pokračovat v kurzu
                  </button>
                  <button className="px-4 py-3 bg-[#F7F9FC] text-foreground rounded-lg text-sm border border-border">
                    Materiály
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
