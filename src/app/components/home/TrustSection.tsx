export function TrustSection() {
  const stats = [
    { value: '15+', label: 'let zkušeností' },
    { value: '50 000+', label: 'spokojených klientů' },
    { value: '120 000+', label: 'vyřešených případů' },
    { value: '99%', label: 'úspěšnost' }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl mb-4 text-foreground">
            Partner, na kterého se můžete spolehnout
          </h2>
          <p className="text-xl text-muted-foreground">
            Zkušenosti a důvěra tisíců klientů
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6">
              <div className="text-5xl lg:text-6xl bg-gradient-to-r from-[#0066CC] to-[#0052A3] bg-clip-text text-transparent mb-3">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: '🏆',
              title: 'Certifikovaní právníci',
              description: 'Tým zkušených právních expertů s licencí ČAK'
            },
            {
              icon: '🔒',
              title: 'Bezpečnost dat',
              description: 'Nejvyšší standardy ochrany vašich osobních údajů'
            },
            {
              icon: '⚡',
              title: 'Rychlá reakce',
              description: 'Průměrná doba odpovědi méně než 2 hodiny'
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-[#F7F9FC] rounded-2xl border border-border">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
