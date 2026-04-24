export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Sjednáte online',
      description: 'Vyplníte formulář, vyberte si balíček a zaplatíte. Aktivace během pár minut.',
      time: '5 min'
    },
    {
      number: '02',
      title: 'Nahlásíte problém',
      description: 'Když narazíte na právní problém, jednoduše ho nahlásíte přes aplikaci nebo telefon.',
      time: '2 min'
    },
    {
      number: '03',
      title: 'Lexia řeší za vás',
      description: 'Náš právník situaci vyhodnotí a zajistí vše potřebné - od poradenství po zastoupení.',
      time: 'Automaticky'
    }
  ];

  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">Jak to funguje</h2>
          <p className="text-xl text-muted-foreground">
            Tři jednoduché kroky k právní ochraně
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-border hidden lg:block" style={{ top: '4rem' }} />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 border-2 border-border hover:border-[#0066CC]/30 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center text-white text-2xl relative z-10">
                      {step.number}
                    </div>
                    <div className="px-3 py-1 bg-[#F7F9FC] rounded-full text-sm text-muted-foreground border border-border">
                      {step.time}
                    </div>
                  </div>

                  <h3 className="text-2xl mb-4 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-20">
                    <svg className="w-8 h-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
