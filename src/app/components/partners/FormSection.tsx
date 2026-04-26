import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function FormSection() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    motivation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <section className="py-24 bg-[#F7F9FC]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-border p-8 lg:p-12">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl">Registrace partnera</h2>
                <div className="flex gap-2">
                  <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? 'bg-[#0045BF]' : 'bg-[#E5E9F0]'}`} />
                  <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? 'bg-[#0045BF]' : 'bg-[#E5E9F0]'}`} />
                </div>
              </div>
              <p className="text-muted-foreground">
                Ozveme se vám do 24 hodin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm">Jméno</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#0045BF] transition-all"
                        placeholder="Jan"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm">Příjmení</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#0045BF] transition-all"
                        placeholder="Novák"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">E-mail</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#0045BF] transition-all"
                      placeholder="jan.novak@email.cz"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#0045BF] transition-all"
                      placeholder="+420 123 456 789"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className="w-full py-4 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Pokračovat
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block mb-2 text-sm">Proč chcete spolupracovat s Lexií?</label>
                    <textarea
                      value={formData.motivation}
                      onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-[#0045BF] transition-all min-h-[150px] resize-none"
                      placeholder="Sdělte nám vaši motivaci..."
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-white border-2 border-border text-foreground rounded-xl hover:bg-[#F7F9FC] transition-all duration-200"
                    >
                      Zpět
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Odeslat žádost
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
