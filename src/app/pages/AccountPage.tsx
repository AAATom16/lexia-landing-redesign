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

type Tab = 'smlouvy' | 'udalosti' | 'platby' | 'dokumenty';

export function AccountPage() {
  const user = getUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('udalosti');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    document.title = 'Můj účet — Lexia';
  }, []);

  if (!user) return <Navigate to="/prihlaseni" replace />;

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
          <Stat icon={ShieldCheck} label="Aktivní smlouvy" value="2" tone="blue" />
          <Stat icon={Clock} label="Otevřené případy" value="1" tone="amber" />
          <Stat icon={Check} label="Vyřešeno (12m)" value="4" tone="green" />
          <Stat icon={CreditCard} label="Příští platba" value="15. 5." tone="slate" />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex border-b border-border overflow-x-auto">
            <TabBtn id="smlouvy" active={activeTab} onClick={setActiveTab} icon={FileText} label="Smlouvy" />
            <TabBtn id="udalosti" active={activeTab} onClick={setActiveTab} icon={Bell} label="Pojistné události" />
            <TabBtn id="platby" active={activeTab} onClick={setActiveTab} icon={CreditCard} label="Platby" />
            <TabBtn id="dokumenty" active={activeTab} onClick={setActiveTab} icon={FileText} label="Dokumenty" />
          </div>
          <div className="p-6 md:p-8">
            {activeTab === 'smlouvy' && <PoliciesPanel />}
            {activeTab === 'udalosti' && <ClaimsPanel onReport={() => setShowReport(true)} />}
            {activeTab === 'platby' && <PaymentsPanel />}
            {activeTab === 'dokumenty' && <DocumentsPanel />}
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

function PoliciesPanel() {
  const policies = [
    { id: 'LX-2026-04812', name: 'Domácnost Premium', status: 'Aktivní', from: '01. 02. 2026', price: '349 Kč/měsíc' },
    { id: 'LX-2025-11203', name: 'Auto Komplet', status: 'Aktivní', from: '14. 11. 2025', price: '599 Kč/měsíc' }
  ];
  return (
    <div className="space-y-4">
      {policies.map((p) => (
        <div key={p.id} className="p-5 rounded-xl border border-border hover:border-[#0045BF]/40 transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">{p.id}</div>
              <div className="text-lg text-foreground">{p.name}</div>
              <div className="text-sm text-muted-foreground">Platná od {p.from}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 inline-flex items-center gap-1">
                <Check className="w-3 h-3" strokeWidth={3} /> {p.status}
              </span>
              <span className="text-foreground">{p.price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClaimsPanel({ onReport }: { onReport: () => void }) {
  const claims = [
    { id: 'PU-2026-0142', title: 'Spor s pronajímatelem', status: 'V řešení', progress: 60, updated: 'Před 2 hodinami' },
    { id: 'PU-2026-0098', title: 'Reklamace zboží', status: 'Vyřešeno', progress: 100, updated: 'Před 3 dny' }
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onReport} className="text-sm text-[#0045BF] hover:underline inline-flex items-center gap-1">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nová událost
        </button>
      </div>
      {claims.map((c) => (
        <div key={c.id} className="p-5 rounded-xl border border-border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">{c.id}</div>
              <div className="text-lg text-foreground">{c.title}</div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                c.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {c.status}
            </span>
          </div>
          <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-[#0045BF] to-[#001843]" style={{ width: `${c.progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Aktualizováno: {c.updated}</span>
            <button className="text-[#0045BF] hover:underline inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" strokeWidth={1.75} /> Komunikovat
            </button>
          </div>
        </div>
      ))}
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

function DocumentsPanel() {
  const docs = [
    { name: 'Smlouva LX-2026-04812.pdf', size: '184 kB' },
    { name: 'VPP Domácnost Premium.pdf', size: '412 kB' },
    { name: 'Potvrzení o platbě 04/2026.pdf', size: '92 kB' }
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
