export function ValueSection() {
  const values = [
    {
      icon: '💰',
      title: 'Právník bez nečekaných nákladů',
      description: 'Právní pomoc bez starostí o hodinové sazby'
    },
    {
      icon: '⚡',
      title: 'Okamžitá pomoc',
      description: 'Dostupní 24/7, když právníka potřebujete'
    },
    {
      icon: '⚖️',
      title: 'Zastoupení ve sporu',
      description: 'Profesionální právní zastoupení v ceně'
    },
    {
      icon: '📋',
      title: 'Úhrada právních výdajů',
      description: 'Soudní poplatky a náklady řízení hrazeny'
    },
    {
      icon: '📱',
      title: 'Online přehled případů',
      description: 'Sledujte průběh vašich případů v aplikaci'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Když nastane problém, nejste na to sami
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Komplexní právní ochrana pro klid ve vašem životě
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-8 bg-white border border-border rounded-2xl hover:shadow-xl hover:border-[#0066CC]/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl mb-3 text-foreground">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
