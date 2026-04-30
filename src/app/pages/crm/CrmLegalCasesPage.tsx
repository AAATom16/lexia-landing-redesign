import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Phone, ShieldCheck, Sparkles, Clock, AlertTriangle, CheckCircle2, Wallet, Plus, ExternalLink } from 'lucide-react';
import { api, isApiEnabled, type ApiLegalCase, type LegalCaseStatus } from '../../lib/api';
import { formatCurrency, formatDate } from './mock-data';
import { getPillar, getProduct } from '../../domain/products';

const STATUS_LABELS: Record<LegalCaseStatus, string> = {
  REGISTROVANO: 'Registrováno',
  V_SETRENI: 'V šetření',
  KRYTO: 'Kryto',
  ZAMITNUTO: 'Zamítnuto',
  UKONCENO: 'Ukončeno',
};

const STATUS_STYLES: Record<LegalCaseStatus, string> = {
  REGISTROVANO: 'bg-blue-50 text-blue-700 border-blue-200',
  V_SETRENI: 'bg-amber-50 text-amber-700 border-amber-200',
  KRYTO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ZAMITNUTO: 'bg-red-50 text-red-700 border-red-200',
  UKONCENO: 'bg-slate-100 text-slate-700 border-slate-200',
};

const MODEL_LABELS = {
  TELEFONICKA_PORADA: 'Telefonická porada',
  SAMOREGULACE: 'Samoregulace',
  EXTERNI_LIKVIDACE: 'Externí likvidace',
} as const;

export function CrmLegalCasesPage() {
  const [cases, setCases] = useState<ApiLegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LegalCaseStatus | 'all'>('all');
  const [selected, setSelected] = useState<ApiLegalCase | null>(null);

  useEffect(() => {
    if (!isApiEnabled()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api.legalCases.list()
      .then((data) => { if (!cancelled) setCases(data); })
      .catch(() => { if (!cancelled) setCases([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.status === filter);

  const stats = {
    open: cases.filter((c) => ['REGISTROVANO', 'V_SETRENI'].includes(c.status)).length,
    paid: cases.reduce((s, c) => s + c.paidExternal + c.paidInternal, 0),
    reserved: cases.reduce((s, c) => s + c.reserveExternal + c.reserveInternal, 0),
    total: cases.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-semibold">Právní případy</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#0045BF]/10 text-[#0045BF] text-xs">teaser</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Modul evidence pojistných událostí — v Lexia terminologii „Právní případy".
            Plný UX dle zadání 2026-01-16 v dalších iteracích.
          </p>
        </div>
        <button
          disabled
          title="Plné UX vytvoření případu navazuje v dalším sprintu"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Nový případ
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#001843] to-[#0045BF] text-white p-5 lg:p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/70 mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Co tu zatím je
        </div>
        <p className="text-sm text-white/85 max-w-3xl">
          Datový model dle zadání (smlouva → produkt → pilíř → pojištěná oblast → typ nároku → rezervy + interní/externí náklady, model likvidace
          (Telefonická porada / Samoregulace / Externí likvidace), stav workflow a důvody zamítnutí). API endpoint <code className="px-1 py-0.5 rounded bg-white/15">/legal-cases</code>
          (list + detail + create + update), audit log každé změny. Zákazník v <Link to="/ucet" className="underline">/ucet</Link> vidí pouze své případy.
        </p>
        <p className="text-xs text-white/70 mt-3">
          Nestaví se zatím: full UX záložky Náklady (Underwriting year, číselník druhů plateb), záložka Další osoby s rolemi,
          výpočty čekací doby + promlčení automatizovaně, online hlášení formulář pro zákazníka.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard icon={Briefcase} label="Celkem případů" value={stats.total.toString()} accent="#0045BF" />
        <KpiCard icon={Clock} label="Otevřené" value={stats.open.toString()} accent="#f59e0b" />
        <KpiCard icon={Wallet} label="Zaplaceno" value={formatCurrency(stats.paid)} accent="#10b981" />
        <KpiCard icon={ShieldCheck} label="Rezervy" value={formatCurrency(stats.reserved)} accent="#0057F0" />
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex items-center gap-1.5 p-3 border-b border-border flex-wrap">
          {(['all', 'REGISTROVANO', 'V_SETRENI', 'KRYTO', 'ZAMITNUTO', 'UKONCENO'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === s ? 'bg-[#0045BF] text-white' : 'text-muted-foreground hover:bg-[#F7F9FC]'
              }`}
            >
              {s === 'all' ? 'Vše' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Načítám…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
            <p className="text-foreground mb-1">Žádné případy</p>
            <p className="text-sm text-muted-foreground">
              {!isApiEnabled() ? 'API není dostupné v lokálním režimu.' : 'Po napojení online hlášení se zde objeví reálné případy.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F9FC] border-b border-border">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Číslo</th>
                  <th className="px-4 py-3 font-medium">Pojistník</th>
                  <th className="px-4 py-3 font-medium">Pilíř / oblast</th>
                  <th className="px-4 py-3 font-medium">Datum vzniku</th>
                  <th className="px-4 py-3 font-medium text-right">Rezervy</th>
                  <th className="px-4 py-3 font-medium">Stav</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const product = getProduct(c.productCode);
                  const pillar = getPillar(c.pillarCode);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="border-b border-border last:border-0 hover:bg-[#F7F9FC]/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{c.caseNumber}</div>
                        <div className="text-xs text-muted-foreground">{product?.shortName ?? c.productCode}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {c.policyholderName}
                        {c.isVip && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">VIP</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>{pillar?.shortName ?? c.pillarCode}</div>
                        {c.legalAreaCode && <div className="text-xs text-muted-foreground">{c.legalAreaCode}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(c.caseDate)}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-right">
                        {formatCurrency(c.reserveExternal + c.reserveInternal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full border text-xs ${STATUS_STYLES[c.status]}`}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <CaseDetailModal lc={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl bg-white border border-border p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="text-2xl tracking-tight">{value}</div>
    </div>
  );
}

function CaseDetailModal({ lc, onClose }: { lc: ApiLegalCase; onClose: () => void }) {
  const product = getProduct(lc.productCode);
  const pillar = getPillar(lc.pillarCode);
  return (
    <div className="fixed inset-0 z-50 bg-[#001843]/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl tracking-tight">{lc.caseNumber}</h2>
              <span className={`px-2.5 py-1 rounded-full border text-xs ${STATUS_STYLES[lc.status]}`}>{STATUS_LABELS[lc.status]}</span>
              {lc.isTelefonicka && (
                <span className="px-2.5 py-1 rounded-full bg-[#008EA5]/10 text-[#008EA5] text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Telefonická porada
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{lc.claimType ?? '—'}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Section title="Pojistné krytí">
            <KV k="Produkt" v={product?.shortName ?? lc.productCode} />
            <KV k="Pilíř" v={pillar?.shortName ?? lc.pillarCode} />
            <KV k="Pojištěná oblast" v={lc.legalAreaCode ?? '—'} />
            <KV k="Typ nároku" v={lc.claimType ?? '—'} />
            <KV k="Model likvidace" v={MODEL_LABELS[lc.model]} />
          </Section>

          <Section title="Pojistník / nahlašovatel">
            <KV k="Pojistník" v={lc.policyholderName + (lc.isVip ? ' (VIP)' : '')} />
            <KV k="Email" v={lc.policyholderEmail ?? '—'} />
            <KV k="IČO" v={lc.policyholderIco ?? '—'} />
            <KV k="Nahlašovatel" v={lc.reporterName ?? lc.policyholderName} />
          </Section>

          <Section title="Časové údaje">
            <KV k="Datum vzniku případu" v={formatDate(lc.caseDate)} />
            <KV k="Datum nahlášení" v={formatDate(lc.reportedDate)} />
            <KV k="Počátek pojištění" v={lc.policyStart ? formatDate(lc.policyStart) : '—'} />
          </Section>

          <Section title="Rezervy a platby">
            <KV k="Externí — rezerva" v={formatCurrency(lc.reserveExternal)} />
            <KV k="Externí — zaplaceno" v={formatCurrency(lc.paidExternal)} />
            <KV k="Interní — rezerva (Lexia odměna)" v={formatCurrency(lc.reserveInternal)} />
            <KV k="Interní — zaplaceno" v={formatCurrency(lc.paidInternal)} />
            <div className="border-t border-border pt-2 mt-2">
              <KV k="Odhad rezervy celkem" v={formatCurrency(lc.reserveExternal + lc.reserveInternal)} />
            </div>
          </Section>

          {lc.description && (
            <Section title="Popis případu">
              <p className="text-sm whitespace-pre-wrap">{lc.description}</p>
            </Section>
          )}

          {lc.status === 'ZAMITNUTO' && lc.denialReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-red-800 font-medium">Zamítnuto: {lc.denialReason}</div>
                {lc.denialNote && <div className="text-red-700 text-xs mt-1">{lc.denialNote}</div>}
              </div>
            </div>
          )}

          {lc.status === 'KRYTO' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-emerald-800">
                Případ je krytý — Lexia hradí externí likvidaci dle pojistných podmínek.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-sm gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
