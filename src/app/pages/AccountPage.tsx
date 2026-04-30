import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Bell,
  MessageSquare,
  Upload,
  Check,
  Clock,
  Download,
  AlertCircle,
  LogOut,
  Plus
} from 'lucide-react';
import { getUser, logout } from '../lib/auth';
import { api, isApiEnabled, type ApiDraft, type ApiLegalCase, type LegalCaseStatus } from '../lib/api';
import { getPillar, getProduct } from '../domain/products';
import { formatCzk } from '../domain/calculator';

type Tab = 'smlouvy' | 'pripady' | 'platby' | 'dokumenty';

export function AccountPage() {
  const user = getUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('smlouvy');
  const [showReport, setShowReport] = useState(false);
  const [contracts, setContracts] = useState<ApiDraft[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [cases, setCases] = useState<ApiLegalCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);

  useEffect(() => {
    document.title = 'Můj účet — Lexia';
    if (!isApiEnabled() || !user) return;
    let cancelled = false;
    setLoadingContracts(true);
    setLoadingCases(true);
    api.customer.contracts()
      .then((data) => { if (!cancelled) setContracts(data); })
      .catch(() => { /* keep empty */ })
      .finally(() => { if (!cancelled) setLoadingContracts(false); });
    api.legalCases.list()
      .then((data) => { if (!cancelled) setCases(data); })
      .catch(() => { /* keep empty */ })
      .finally(() => { if (!cancelled) setLoadingCases(false); });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!user) return <Navigate to="/prihlaseni" replace />;

  const activeContracts = contracts.filter((c) => c.status === 'SIGNED');
  const pendingContracts = contracts.filter((c) => c.status === 'SENT_TO_CLIENT');
  const monthlyTotal = activeContracts.reduce((s, c) => s + c.premiumMonthly, 0);
  const openCases = cases.filter((c) => ['REGISTROVANO', 'V_SETRENI'].includes(c.status)).length;
  const resolvedCases = cases.filter((c) => ['UKONCENO', 'KRYTO'].includes(c.status)).length;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[#F7F9FC] py-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Vítejte zpět</div>
            <h1 className="text-2xl md:text-3xl text-foreground tracking-tight">{user.name}</h1>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReport(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} /> Nahlásit událost
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-border bg-white text-foreground rounded-xl hover:bg-[#F7F9FC] transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" strokeWidth={2} /> Odhlásit
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Stat icon={ShieldCheck} label="Aktivní smlouvy" value={activeContracts.length.toString()} tone="blue" />
          <Stat icon={Clock} label="Otevřené případy" value={openCases.toString()} tone="amber" />
          <Stat icon={Check} label="Vyřešené případy" value={resolvedCases.toString()} tone="green" />
          <Stat icon={CreditCard} label="Měsíční pojistné" value={monthlyTotal > 0 ? formatCzk(monthlyTotal) : '—'} tone="slate" />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            <TabBtn id="smlouvy" active={activeTab} onClick={setActiveTab} icon={FileText} label="Smlouvy" />
            <TabBtn id="pripady" active={activeTab} onClick={setActiveTab} icon={Bell} label="Právní případy" />
            <TabBtn id="platby" active={activeTab} onClick={setActiveTab} icon={CreditCard} label="Platby" />
            <TabBtn id="dokumenty" active={activeTab} onClick={setActiveTab} icon={FileText} label="Dokumenty" />
          </div>
          <div className="p-6 md:p-8">
            {activeTab === 'smlouvy' && <PoliciesPanel contracts={contracts} loading={loadingContracts} />}
            {activeTab === 'pripady' && <CasesPanel cases={cases} loading={loadingCases} onReport={() => setShowReport(true)} />}
            {activeTab === 'platby' && <PaymentsPanel />}
            {activeTab === 'dokumenty' && <DocumentsPanel contracts={contracts} />}
          </div>
        </div>
      </div>

      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof FileText; label: string; value: string; tone: 'blue' | 'amber' | 'green' | 'slate' }) {
  const tones = {
    blue: 'bg-[#0045BF]/10 text-[#0045BF]',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    slate: 'bg-slate-100 text-slate-700'
  };
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl text-foreground">{value}</div>
      </div>
    </div>
  );
}

function TabBtn({ id, active, onClick, icon: Icon, label }: { id: Tab; active: Tab; onClick: (t: Tab) => void; icon: typeof FileText; label: string }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-5 py-4 text-sm whitespace-nowrap transition-colors border-b-2 ${
        isActive ? 'border-[#0045BF] text-[#0045BF]' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function PoliciesPanel({ contracts, loading }: { contracts: ApiDraft[]; loading: boolean }) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Načítám smlouvy…</div>;
  }
  if (contracts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
        <p className="text-foreground mb-2">Zatím nemáte žádné aktivní smlouvy ani návrhy.</p>
        <p className="text-sm text-muted-foreground">
          Až vám partner nebo Lexia odešle návrh, objeví se zde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((p) => {
        const product = getProduct(p.productCode);
        const signed = p.status === 'SIGNED';
        return (
          <div key={p.id} className="p-5 rounded-xl border border-border hover:border-[#0045BF]/40 transition-all">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{p.number ?? p.id.slice(0, 12)}</div>
                <div className="text-lg text-foreground truncate">{product?.shortName ?? p.productCode}</div>
                <div className="text-sm text-muted-foreground">
                  Platná od {new Date(p.createdAt).toLocaleDateString('cs-CZ')} · Územní rozsah {p.territorialScope}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
                  signed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {signed ? <><Check className="w-3 h-3" strokeWidth={3} /> Aktivní</> : <><Clock className="w-3 h-3" strokeWidth={2} /> Návrh k podpisu</>}
                </span>
                <span className="text-foreground tabular-nums">{formatCzk(p.premiumMonthly)}/měs</span>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sjednané pilíře</div>
              <div className="flex flex-wrap gap-1.5">
                {p.pillars.map((code) => {
                  const pp = getPillar(code);
                  return (
                    <span key={code} className="px-2.5 py-1 rounded-full bg-[#0045BF]/10 text-[#0045BF] text-xs">
                      {pp?.shortName ?? code}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CASE_STATUS_LABELS: Record<LegalCaseStatus, string> = {
  REGISTROVANO: 'Registrováno',
  V_SETRENI: 'V šetření',
  KRYTO: 'Kryto',
  ZAMITNUTO: 'Zamítnuto',
  UKONCENO: 'Ukončeno',
};

const CASE_PROGRESS: Record<LegalCaseStatus, number> = {
  REGISTROVANO: 20,
  V_SETRENI: 50,
  KRYTO: 75,
  ZAMITNUTO: 100,
  UKONCENO: 100,
};

function CasesPanel({ cases, loading, onReport }: { cases: ApiLegalCase[]; loading: boolean; onReport: () => void }) {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Načítám případy…</div>;
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          Forma plnění: telefonická porada (10 000 Kč) nebo právní zastoupení (až 50 000 Kč) dle pojistné smlouvy.
        </div>
        <button onClick={onReport} className="text-sm text-[#0045BF] hover:underline inline-flex items-center gap-1">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nahlásit nový případ
        </button>
      </div>
      {cases.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xl">
          <Bell className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
          <p className="text-foreground mb-1">Zatím žádné právní případy</p>
          <p className="text-sm text-muted-foreground">Pokud nastane situace, na kterou se vztahuje vaše smlouva, klikněte na „Nahlásit nový případ".</p>
        </div>
      ) : (
        cases.map((c) => {
          const progress = CASE_PROGRESS[c.status];
          const isResolved = c.status === 'UKONCENO' || c.status === 'KRYTO';
          return (
            <div key={c.id} className="p-5 rounded-xl border border-border">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{c.caseNumber}</div>
                  <div className="text-lg text-foreground truncate">{c.claimType ?? 'Právní případ'}</div>
                  {c.description && <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</div>}
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs ${
                    c.status === 'ZAMITNUTO' ? 'bg-red-100 text-red-700' :
                    isResolved ? 'bg-green-100 text-green-700' :
                    'bg-amber-100 text-amber-700'
                  }`}
                >
                  {CASE_STATUS_LABELS[c.status]}
                </span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${c.status === 'ZAMITNUTO' ? 'bg-red-500' : 'bg-gradient-to-r from-[#0045BF] to-[#001843]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Vznik {new Date(c.caseDate).toLocaleDateString('cs-CZ')} · Nahlášeno {new Date(c.reportedDate).toLocaleDateString('cs-CZ')}</span>
                <button className="text-[#0045BF] hover:underline inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" strokeWidth={1.75} /> Komunikovat
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function PaymentsPanel() {
  const rows = [
    { date: '15. 04. 2026', label: 'Domácnost Premium', amount: '349 Kč', state: 'Zaplaceno' },
    { date: '14. 04. 2026', label: 'Auto Komplet', amount: '599 Kč', state: 'Zaplaceno' },
    { date: '15. 03. 2026', label: 'Domácnost Premium', amount: '349 Kč', state: 'Zaplaceno' }
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-border">
            <th className="py-3 pr-4">Datum</th>
            <th className="py-3 pr-4">Smlouva</th>
            <th className="py-3 pr-4">Částka</th>
            <th className="py-3">Stav</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 text-foreground">{r.date}</td>
              <td className="py-3 pr-4 text-foreground">{r.label}</td>
              <td className="py-3 pr-4 text-foreground">{r.amount}</td>
              <td className="py-3">
                <span className="px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700 inline-flex items-center gap-1">
                  <Check className="w-3 h-3" strokeWidth={3} /> {r.state}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsPanel({ contracts }: { contracts: ApiDraft[] }) {
  const contractDocs = contracts.map((c) => ({
    name: `Pojistná smlouva ${c.number ?? c.id.slice(0, 12)}.pdf`,
    size: '— kB',
  }));
  const docs = [
    ...contractDocs,
    { name: 'Lexia VPP — pojistné podmínky 2026/03.pdf', size: '412 kB' },
    { name: 'Lexia tarify 2026/04.pdf', size: '210 kB' },
  ];
  return (
    <div className="space-y-3">
      {docs.map((d) => (
        <div key={d.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-[#F7F9FC] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0045BF]/10 text-[#0045BF] flex items-center justify-center">
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-foreground">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.size}</div>
            </div>
          </div>
          <button className="text-[#0045BF] hover:underline inline-flex items-center gap-1 text-sm">
            <Download className="w-4 h-4" strokeWidth={1.75} /> Stáhnout
          </button>
        </div>
      ))}
      <button className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-[#0045BF]/50 hover:bg-[#F7F9FC] text-muted-foreground hover:text-foreground transition-all inline-flex items-center justify-center gap-2">
        <Upload className="w-4 h-4" strokeWidth={1.75} /> Nahrát dokument
      </button>
    </div>
  );
}

function ReportModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl text-foreground">Nahlásit pojistnou událost</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-foreground mb-2">Smlouva</label>
                <select className="w-full px-4 py-3 rounded-xl border border-border focus:border-[#0045BF] outline-none">
                  <option>LX-2026-04812 — Domácnost Premium</option>
                  <option>LX-2025-11203 — Auto Komplet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground mb-2">Popis situace</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="Stručně popište, co se stalo…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 px-5 py-3 border border-border rounded-xl hover:bg-[#F7F9FC]">
                  Zrušit
                </button>
                <button type="submit" className="flex-1 px-5 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg">
                  Nahlásit
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 inline-flex items-center justify-center mb-4">
              <Check className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl text-foreground mb-2">Událost přijata</h2>
            <p className="text-muted-foreground mb-6">Právník se vám ozve do 2 hodin.</p>
            <button onClick={onClose} className="px-6 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg">
              Zavřít
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
