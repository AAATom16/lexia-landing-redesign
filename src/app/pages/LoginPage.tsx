import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { login } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@lexia.cz');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.includes('@')) {
      setError('Zadejte platný email');
      return;
    }
    if (password.length < 4) {
      setError('Heslo musí mít alespoň 4 znaky');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email);
      navigate('/ucet');
    }, 600);
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] py-16 bg-gradient-to-br from-[#F7F9FC] to-white flex items-center">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066CC] to-[#0052A3] items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl md:text-4xl mb-2 text-foreground tracking-tight">Přihlášení do účtu</h1>
            <p className="text-muted-foreground">Vstup do zákaznické sekce Lexia</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-border shadow-lg p-8 space-y-5"
          >
            <div>
              <label className="block text-sm text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 outline-none transition-all"
                  placeholder="vas@email.cz"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Heslo</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/20 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Přihlašuji…' : 'Přihlásit se'}
              {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
            </button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Demo: jakýkoli email a heslo (4+ znaků)
            </div>
          </form>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Nemáte účet?{' '}
            <Link to="/" className="text-[#0066CC] hover:underline">
              Sjednat online
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
