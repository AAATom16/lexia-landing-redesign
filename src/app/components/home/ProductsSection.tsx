import { Home, Briefcase, Building2, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Product = {
  icon: LucideIcon;
  title: string;
  price: string;
  features: string[];
  popular: boolean;
};

export function ProductsSection() {
  const products: Product[] = [
    {
      icon: Home,
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
      icon: Briefcase,
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
      icon: Building2,
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Vyberte si řešení podle své situace
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Jasné ceny, komplexní ochrana
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 flex flex-col ${
                  product.popular
                    ? 'border-[#0066CC] shadow-2xl md:scale-105'
                    : 'border-border hover:border-[#0066CC]/30 hover:shadow-xl'
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-full text-sm whitespace-nowrap shadow-lg">
                    Nejoblíbenější
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066CC]/10 to-[#0052A3]/10 items-center justify-center text-[#0066CC] mb-4">
                    <Icon className="w-7 h-7" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-2xl mb-2 text-foreground tracking-tight">{product.title}</h3>
                  <div className="text-2xl md:text-3xl text-[#0066CC] mb-1 tracking-tight">{product.price}</div>
                  <div className="text-sm text-muted-foreground">Roční pojištění</div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" strokeWidth={2.5} />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
