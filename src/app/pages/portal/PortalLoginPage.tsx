import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, ShieldCheck, Users } from 'lucide-react';
import { authenticate, LoginError } from '../../lib/auth';

const DEMO_PARTNERS = [
  { email: 'info@frenkee.cz', name: 'Frenkee s.r.o.', type: 'VZ' as const, ico: '12345678' },
  { email: 'broker@example.cz', name: 'Demo broker', type: 'SZ_PM' as const, ico: '87654321' },
];

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('info@frenkee.cz');
  const [password, setPassword] = useState('partner123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: string })?.from ?? '/portal';

  async function handleSubmit(e: React.FormEvent) {
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
    try {
      const known = DEMO_PARTNERS.find((p) => p.email === email);
      await authenticate(email, password, {
        expectedRole: 'distributor',
        fallback: {
          role: 'distributor',
          name: known?.name,
          distributorType: known?.type ?? 'VZ',
          ico: known?.ico,
        },
      });
      navigate(redirectTo);
    } catch (err) {
      if (err instanceof LoginError) {
        if (err.code === 'invalid_credentials') setError('Špatný email nebo heslo');
        else if (err.code === 'forbidden_role') setError('Účet není v roli partnera');
        else setError('Server nedostupný');
      } else {
        setError('Přihlášení selhalo');
      }
      setLoading(false);
    }
  }

  async function quickLogin(p: typeof DEMO_PARTNERS[number]) {
    setError('');
    setLoading(true);
    try {
      await authenticate(p.email, 'partner123', {
        expectedRole: 'distributor',
        fallback: { role: 'distributor', name: p.name, distributorType: p.type, ico: p.ico },
      });
      navigate('/portal');
    } catch (err) {
      if (err instanceof LoginError && err.code === 'invalid_credentials') {
        setError('Demo účet zatím není seedovaný v API');
      } else {
        setError('Přihlášení selhalo');
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001843] via-[#0045BF] to-[#0057F0] flex items-center justify-center p-6">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-[#001843] to-[#0045BF] text-white p-10 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white/90 hover:text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-xl">Lexia Partner</span>
          </Link>
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl tracking-tight">Distribuční portál</h1>
            <p className="text-white/80 leading-relaxed">
              Přístup pro vázané zástupce, agenty a makléře. Sjednávání smluv, kalkulačka pojistného,
              správa klientského kmene.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Users className="w-4 h-4" /> Strom distribuce a OM</div>
              <div className="flex items-center gap-3"><Building2 className="w-4 h-4" /> Provize 1 vs 2 + startovací</div>
              <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> All-risk garance Lexia / Colonnade</div>
            </div>
          </div>
          <div className="text-xs text-white/60">
            LEXIA Legal Protection a.s. · IČO 22189432
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-2xl tracking-tight mb-1">Přihlášení partnera</h2>
          <p className="text-sm text-muted-foreground mb-8">Zadejte přihlašovací údaje vázaného zástupce nebo agenta.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-muted-foreground">Email partnera</span>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm text-muted-foreground">Heslo</span>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                />
              </div>
            </label>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Přihlašuji…' : 'Přihlásit se do portálu'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Demo přístupy</div>
            <div className="space-y-2">
              {DEMO_PARTNERS.map((p) => (
                <button
                  key={p.email}
                  onClick={() => quickLogin(p)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-[#0045BF]/40 hover:bg-[#F7F9FC] transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.email} · {p.type}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0045BF]" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            Nejste partner? <Link to="/partnerstvi" className="text-[#0045BF] hover:underline">Stát se VZ →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
