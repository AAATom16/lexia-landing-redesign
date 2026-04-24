export function CaseStudiesSection() {
  const cases = [
    {
      icon: '🏠',
      category: 'Rodina',
      problem: 'Majitel bytu nevrátil kauci 25 000 Kč',
      withoutLexia: {
        label: 'Bez Lexie',
        price: '25 000 – 40 000 Kč',
        details: 'Právník 2 500 Kč/hod'
      },
      withLexia: {
        label: 'S Lexií',
        price: '2 000 – 4 000 Kč',
        details: 'Roční pojištění'
      },
      savings: '10x levnější'
    },
    {
      icon: '🚗',
      category: 'Auto',
      problem: 'Spor o vinu po nehodě',
      withoutLexia: {
        label: 'Bez Lexie',
        price: '30 000 – 80 000 Kč',
        details: 'Právník + soudní poplatky'
      },
      withLexia: {
        label: 'S Lexií',
        price: 'cca 3 000 Kč',
        details: 'Roční pojištění'
      },
      savings: 'až 20x levnější'
    },
    {
      icon: '💼',
      category: 'Podnikatel',
      problem: 'Nezaplacená faktura 120 000 Kč',
      withoutLexia: {
        label: 'Bez Lexie',
        price: '20 000 – 60 000 Kč',
        details: 'Vymáhání + právní služby'
      },
      withLexia: {
        label: 'S Lexií',
        price: '5 000 – 10 000 Kč',
        details: 'Roční pojištění'
      },
      savings: 'až 6x levnější'
    }
  ];

  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Kolik vás může stát jeden právní problém?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Porovnání skutečných nákladů s a bez právní ochrany
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7F9FC] to-white flex items-center justify-center text-2xl border border-border">
                    {caseItem.icon}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{caseItem.category}</div>
                    <div className="text-xs text-green-600 font-medium">{caseItem.savings}</div>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">
                  {caseItem.problem}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-red-900">{caseItem.withoutLexia.label}</span>
                  </div>
                  <div className="text-2xl text-red-900 mb-1">{caseItem.withoutLexia.price}</div>
                  <div className="text-xs text-red-700">{caseItem.withoutLexia.details}</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-900">{caseItem.withLexia.label}</span>
                  </div>
                  <div className="text-2xl text-green-900 mb-1">{caseItem.withLexia.price}</div>
                  <div className="text-xs text-green-700">{caseItem.withLexia.details}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-white rounded-2xl border border-border max-w-3xl mx-auto text-center">
          <div className="text-lg text-foreground mb-2">
            💡 Jeden problém = několikanásobek ročního pojistného
          </div>
          <p className="text-muted-foreground">
            S Lexií platíte jednou ročně a řešíte neomezené množství případů
          </p>
        </div>
      </div>
    </section>
  );
}
