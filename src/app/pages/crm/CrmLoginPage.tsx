import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { authenticate, LoginError } from '../../lib/auth';

const DEMO_USERS = [
  { email: 'jana.dvorakova@lexia.cz', name: 'Jana Dvořáková' },
  { email: 'tomas.prochazka@lexia.cz', name: 'Tomáš Procházka' },
  { email: 'lukas.vesely@lexia.cz', name: 'Lukáš Veselý' },
];

export function CrmLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('jana.dvorakova@lexia.cz');
  const [password, setPassword] = useState('lexia123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: string })?.from ?? '/crm';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@lexia.cz')) {
      setError('Pouze interní účty Lexia (@lexia.cz)');
      return;
    }
    if (password.length < 4) {
      setError('Heslo musí mít alespoň 4 znaky');
      return;
    }
    setLoading(true);
    try {
      const known = DEMO_USERS.find((u) => u.email === email);
      await authenticate(email, password, {
        expectedRole: 'admin',
        fallback: { role: 'admin', name: known?.name },
      });
      navigate(redirectTo);
    } catch (err) {
      if (err instanceof LoginError) {
        if (err.code === 'invalid_credentials') setError('Špatný email nebo heslo');
        else if (err.code === 'forbidden_role') setError('Účet není v roli admina');
        else setError('Server nedostupný');
      } else {
        setError('Přihlášení selhalo');
      }
      setLoading(false);
    }
  }

  async function quick(u: typeof DEMO_USERS[number]) {
    setError('');
    setLoading(true);
    try {
      await authenticate(u.email, 'lexia123', {
        expectedRole: 'admin',
        fallback: { role: 'admin', name: u.name },
      });
      navigate('/crm');
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
    <div className="min-h-screen bg-[#0a1430] flex items-center justify-center p-6">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-[#001843] to-[#0045BF] text-white p-10 flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white/90 hover:text-white">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-xl">Lexia CRM</span>
          </Link>
          <div className="space-y-6">
            <h1 className="text-3xl lg:text-4xl tracking-tight">Interní platforma</h1>
            <p className="text-white/80 leading-relaxed">
              Správa klientů, smluv, leadů, dokumentů a sjednávání. Pouze pro zaměstnance LEXIA Legal Protection.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Sparkles className="w-4 h-4" /> Distribuční modul a provize</div>
              <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4" /> Audit log a převody kmene</div>
            </div>
          </div>
          <div className="text-xs text-white/60">
            LEXIA Legal Protection a.s. · Demo prostředí
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-2xl tracking-tight mb-1">Přihlášení do CRM</h2>
          <p className="text-sm text-muted-foreground mb-8">Použijte pracovní email @lexia.cz.</p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-muted-foreground">Pracovní email</span>
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
              {loading ? 'Přihlašuji…' : 'Vstup do CRM'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Demo účty</div>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  onClick={() => quick(u)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-[#0045BF]/40 hover:bg-[#F7F9FC] transition-all text-left"
                >
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0045BF]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
