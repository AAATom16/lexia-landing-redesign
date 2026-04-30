import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { ApiError, api, isApiEnabled, setToken } from '../../lib/api';
import { login } from '../../lib/auth';

const TYPES = [
  { value: 'VZ', label: 'Vázaný zástupce (VZ)' },
  { value: 'DPZ', label: 'Doplňkový pojišťovací zprostředkovatel (DPZ)' },
  { value: 'TIPAR', label: 'Tipař' },
  { value: 'SZ_PA', label: 'Pojišťovací agent (SZ/PA)' },
  { value: 'SZ_PM', label: 'Pojišťovací makléř (SZ/PM)' },
] as const;

type DistType = typeof TYPES[number]['value'];

export function PortalRegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState<DistType>('VZ');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !email.includes('@') || password.length < 6) {
      setError('Vyplň jméno, email a heslo (min. 6 znaků).');
      return;
    }
    setLoading(true);

    if (!isApiEnabled()) {
      // Mock — straight to portal
      login(email, 'distributor', { name, distributorType: type, ico: ico || undefined });
      navigate('/portal');
      return;
    }

    try {
      const { token, user } = await api.register({
        email,
        password,
        name,
        role: 'DISTRIBUTOR',
        distributorType: type,
        ico: ico || undefined,
      });
      setToken(token);
      login(user.email, 'distributor', {
        name: user.name,
        distributorType: type,
        ico: ico || undefined,
      });
      navigate('/portal');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Účet s tímto emailem už existuje. Přihlas se v Partner portálu.');
      } else {
        setError('Registrace selhala. Zkus to znovu nebo se ozvi na partneri@lexia.cz.');
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
            <h1 className="text-3xl lg:text-4xl tracking-tight">Sjednávejte právní ochranu Lexia</h1>
            <p className="text-white/80 leading-relaxed">
              Po registraci dostanete přístup do partnerského portálu s kalkulačkou, sjednáním a evidencí klientů.
              Před prvním sjednaným klientem vás kontaktuje Lexia kvůli aktivaci provizního schématu.
            </p>
            <div className="space-y-3 text-sm">
              <div>• Provizní modely 1 (45 % + 10 %) i 2 (23 % průběžná)</div>
              <div>• Startovací bonus 30 / 20 / 10 % (Model 1)</div>
              <div>• Distribuční strom: SZ/PM, SZ/PA, DJ, VZ, DPZ, Tipař</div>
            </div>
          </div>
          <div className="text-xs text-white/60">
            LEXIA Legal Protection a.s. · IČO 22189432
          </div>
        </div>

        <div className="p-10">
          <h2 className="text-2xl tracking-tight mb-1">Registrace partnera</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Už máš účet? <Link to="/portal/prihlaseni" className="text-[#0045BF] hover:underline">Přihlásit se</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="text-muted-foreground">Obchodní jméno</span>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="Frenkee s.r.o."
                  autoComplete="organization"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">IČO (volitelné)</span>
              <div className="relative mt-1">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={ico}
                  onChange={(e) => setIco(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="12345678"
                  autoComplete="off"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Typ distributora</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DistType)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-white focus:border-[#0045BF] outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Heslo (min. 6 znaků)</span>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  autoComplete="new-password"
                />
              </div>
            </label>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Registruji…' : 'Vytvořit účet partnera'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center text-xs text-muted-foreground">
              Registrací souhlasíte se zpracováním údajů a budoucím podpisem smlouvy o obchodním zastoupení.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
