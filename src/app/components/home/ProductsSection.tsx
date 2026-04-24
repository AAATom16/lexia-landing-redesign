export function ProductsSection() {
  const products = [
    {
      icon: '🏠',
      title: 'Pro domácnosti',
      price: 'Od 2 400 Kč/rok',
      features: [
        'Právní poradenství 24/7',
        'Smlouvy a dokumenty',
        'Spotřebitelské spory',
        'Dopravní právo',
        'Sousedské spory'
      ],
      popular: false
    },
    {
      icon: '💼',
      title: 'Pro podnikatele',
      price: 'Od 5 000 Kč/rok',
      features: [
        'Vše z domácností +',
        'Obchodní smlouvy',
        'Vymáhání pohledávek',
        'Pracovněprávní věci',
        'Online konzultace'
      ],
      popular: true
    },
    {
      icon: '🏢',
      title: 'Pro firmy',
      price: 'Na míru',
      features: [
        'Komplexní ochrana',
        'Dedikovaný právník',
        'Prioritní podpora',
        'Compliance audit',
        'Školení zaměstnanců'
      ],
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Vyberte si řešení podle své situace
          </h2>
          <p className="text-xl text-muted-foreground">
            Jasné ceny, komplexní ochrana
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 ${
                product.popular
                  ? 'border-[#0066CC] shadow-2xl scale-105'
                  : 'border-border hover:border-[#0066CC]/30 hover:shadow-xl'
              }`}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-full text-sm">
                  Nejoblíbenější
                </div>
              )}

              <div className="text-center mb-8">
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-2xl mb-2 text-foreground">{product.title}</h3>
                <div className="text-3xl text-[#0066CC] mb-1">{product.price}</div>
                <div className="text-sm text-muted-foreground">Roční pojištění</div>
              </div>

              <div className="space-y-4 mb-8">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-xl transition-all ${
                  product.popular
                    ? 'bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white hover:shadow-lg'
                    : 'bg-white text-[#0066CC] border-2 border-[#0066CC]/20 hover:bg-[#0066CC] hover:text-white'
                }`}
              >
                Sjednat online
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
