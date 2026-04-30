import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Phone,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { api, isApiEnabled, type ApiLegalCase, type LegalCaseStatus } from '../../lib/api';
import { formatCurrency, formatDate } from './mock-data';
import { getPillar, getProduct } from '../../domain/products';
import { CaseCreateModal } from '../../components/legalCases/CaseCreateModal';

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

const STATUS_ACCENTS: Record<LegalCaseStatus, string> = {
  REGISTROVANO: 'border-t-blue-400',
  V_SETRENI: 'border-t-amber-400',
  KRYTO: 'border-t-emerald-400',
  ZAMITNUTO: 'border-t-red-400',
  UKONCENO: 'border-t-slate-400',
};

const KANBAN_ORDER: LegalCaseStatus[] = ['REGISTROVANO', 'V_SETRENI', 'KRYTO', 'ZAMITNUTO', 'UKONCENO'];

const MODEL_LABELS = {
  TELEFONICKA_PORADA: 'Telefonická porada',
  SAMOREGULACE: 'Samoregulace',
  EXTERNI_LIKVIDACE: 'Externí likvidace',
} as const;

export function CrmLegalCasesPage() {
  const [cases, setCases] = useState<ApiLegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LegalCaseStatus | 'all'>('all');
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApiLegalCase | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!isApiEnabled()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      try {
        const data = await api.legalCases.list();
        if (!cancelled) setCases(data);
      } catch {
        if (!cancelled) setCases([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    refresh();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = cases;
    if (filter !== 'all') list = list.filter((c) => c.status === filter);
    if (search.trim().length >= 2) {
      const s = search.toLowerCase();
      list = list.filter((c) =>
        [c.caseNumber, c.policyholderName, c.policyholderEmail, c.policyholderIco, c.claimType, c.legalAreaCode, c.description]
          .filter(Boolean)
          .some((v) => (v ?? '').toLowerCase().includes(s)),
      );
    }
    return list;
  }, [cases, filter, search]);

  const stats = {
    open: cases.filter((c) => ['REGISTROVANO', 'V_SETRENI'].includes(c.status)).length,
    paid: cases.reduce((s, c) => s + c.paidExternal + c.paidInternal, 0),
    reserved: cases.reduce((s, c) => s + c.reserveExternal + c.reserveInternal, 0),
    total: cases.length,
  };

  function handleCreated(lc: ApiLegalCase) {
    setCases((prev) => [lc, ...prev]);
    setSelected(lc);
  }

  function handleUpdated(lc: ApiLegalCase) {
    setCases((prev) => prev.map((x) => (x.id === lc.id ? lc : x)));
    setSelected(lc);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">Právní případy</h1>
          <span className="px-2 py-0.5 rounded-full bg-[#0045BF]/10 text-[#0045BF] text-xs">{stats.total}</span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nový případ
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Briefcase} label="Celkem případů" value={stats.total.toString()} accent="#0045BF" />
        <KpiCard icon={Clock} label="Otevřené" value={stats.open.toString()} accent="#f59e0b" />
        <KpiCard icon={Wallet} label="Zaplaceno" value={formatCurrency(stats.paid)} accent="#10b981" />
        <KpiCard icon={ShieldCheck} label="Rezervy" value={formatCurrency(stats.reserved)} accent="#0057F0" />
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border flex-1">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat podle čísla, pojistníka, IČO, typu nároku, popisu…"
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-muted-foreground hover:text-foreground">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
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

          <div className="inline-flex p-1 rounded-lg bg-[#F7F9FC] border border-border">
            <button
              onClick={() => setView('list')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                view === 'list' ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'
              }`}
              title="Seznam"
            >
              <List className="w-3.5 h-3.5" /> Seznam
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors ${
                view === 'kanban' ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'
              }`}
              title="Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Načítám…</div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} apiOff={!isApiEnabled()} onCreate={() => setCreateOpen(true)} />
        ) : view === 'list' ? (
          <ListView cases={filtered} onSelect={setSelected} />
        ) : (
          <KanbanView cases={filtered} onSelect={setSelected} />
        )}
      </div>

      {selected && (
        <CaseDetailModal
          lc={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}

      <CaseCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}

function EmptyState({ search, apiOff, onCreate }: { search: string; apiOff: boolean; onCreate: () => void }) {
  return (
    <div className="p-12 text-center">
      <Briefcase className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
      <p className="text-foreground mb-1">
        {search ? 'Nic neodpovídá hledání' : 'Žádné případy'}
      </p>
      <p className="text-sm text-muted-foreground mb-5">
        {apiOff
          ? 'API není dostupné v lokálním režimu — propojte VITE_API_URL.'
          : search
          ? 'Zkuste jiný výraz nebo zrušit filtr.'
          : 'Vytvoř první případ tlačítkem výše nebo z karty smlouvy.'}
      </p>
      {!search && !apiOff && (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0045BF] text-white text-sm hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Nový případ
        </button>
      )}
    </div>
  );
}

function ListView({ cases, onSelect }: { cases: ApiLegalCase[]; onSelect: (c: ApiLegalCase) => void }) {
  return (
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
          {cases.map((c) => {
            const product = getProduct(c.productCode);
            const pillar = getPillar(c.pillarCode);
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c)}
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
  );
}

function KanbanView({ cases, onSelect }: { cases: ApiLegalCase[]; onSelect: (c: ApiLegalCase) => void }) {
  const columns = KANBAN_ORDER.map((status) => ({
    status,
    cases: cases.filter((c) => c.status === status),
  }));

  return (
    <div className="p-3 overflow-x-auto">
      <div className="grid grid-cols-5 gap-3 min-w-[1000px]">
        {columns.map((col) => (
          <div key={col.status} className="flex flex-col">
            <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg bg-[#F7F9FC] border-t-2 ${STATUS_ACCENTS[col.status]}`}>
              <span className="text-xs font-medium text-foreground">{STATUS_LABELS[col.status]}</span>
              <span className="text-xs text-muted-foreground">{col.cases.length}</span>
            </div>
            <div className="flex-1 bg-[#F7F9FC]/60 p-2 rounded-b-lg min-h-[200px] space-y-2">
              {col.cases.length === 0 ? (
                <div className="text-xs text-muted-foreground/60 text-center py-4">—</div>
              ) : (
                col.cases.map((c) => {
                  const pillar = getPillar(c.pillarCode);
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c)}
                      className="w-full bg-white border border-border rounded-lg p-3 text-left hover:shadow-md hover:border-[#0045BF]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-xs font-medium text-[#0045BF]">{c.caseNumber}</div>
                        {c.isVip && <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-800">VIP</span>}
                      </div>
                      <div className="text-sm font-medium line-clamp-2 mb-1">
                        {c.claimType ?? 'Právní případ'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <UserIcon className="w-3 h-3 shrink-0" /> {c.policyholderName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {pillar?.shortName ?? c.pillarCode}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(c.caseDate).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <span className="tabular-nums text-foreground">
                          {formatCurrency(c.reserveExternal + c.reserveInternal)}
                        </span>
                      </div>
                      {c.isTelefonicka && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#008EA5]">
                          <Phone className="w-2.5 h-2.5" /> Telefonická
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
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

function CaseDetailModal({
  lc,
  onClose,
  onUpdated,
}: {
  lc: ApiLegalCase;
  onClose: () => void;
  onUpdated: (lc: ApiLegalCase) => void;
}) {
  const product = getProduct(lc.productCode);
  const pillar = getPillar(lc.pillarCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dwell = Math.max(
    0,
    Math.round(
      (new Date().getTime() - new Date(lc.reportedDate).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  async function changeStatus(next: LegalCaseStatus) {
    if (!isApiEnabled()) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.legalCases.update(lc.id, { status: next });
      onUpdated(updated);
    } catch {
      setError('Změna stavu selhala (jen ADMIN může měnit).');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#001843]/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className={`px-6 py-5 border-b border-border flex items-start justify-between bg-gradient-to-r from-[#F7F9FC] to-white`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl tracking-tight">{lc.caseNumber}</h2>
              <span className={`px-2.5 py-1 rounded-full border text-xs ${STATUS_STYLES[lc.status]}`}>
                {STATUS_LABELS[lc.status]}
              </span>
              {lc.isTelefonicka && (
                <span className="px-2.5 py-1 rounded-full bg-[#008EA5]/10 text-[#008EA5] text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Telefonická
                </span>
              )}
              {lc.isVip && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">VIP</span>
              )}
            </div>
            <div className="text-base text-foreground mt-1 truncate">{lc.claimType ?? 'Právní případ'}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {product?.shortName ?? lc.productCode} · {pillar?.shortName ?? lc.pillarCode}
              {lc.legalAreaCode ? ` · ${lc.legalAreaCode}` : ''}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 shrink-0">
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_280px]">
          <div className="p-6 space-y-5 border-r border-border">
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
              <KV k="Doba v řešení" v={`${dwell} dní`} />
            </Section>

            <Section title="Rezervy a platby">
              <div className="grid grid-cols-2 gap-3">
                <Box label="Externí — rezerva" value={formatCurrency(lc.reserveExternal)} />
                <Box label="Externí — zaplaceno" value={formatCurrency(lc.paidExternal)} />
                <Box label="Interní — rezerva" value={formatCurrency(lc.reserveInternal)} hint="Lexia odměna" />
                <Box label="Interní — zaplaceno" value={formatCurrency(lc.paidInternal)} />
              </div>
              <div className="mt-3 px-4 py-2 rounded-lg bg-[#0045BF]/5 border border-[#0045BF]/15 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Odhad rezervy celkem</span>
                <span className="text-lg tracking-tight tabular-nums">
                  {formatCurrency(lc.reserveExternal + lc.reserveInternal)}
                </span>
              </div>
            </Section>

            {lc.description && (
              <Section title="Popis případu">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{lc.description}</p>
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

          <div className="p-5 bg-[#F7F9FC] space-y-5">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Model</div>
              <div className="px-3 py-2 rounded-lg bg-white border border-border text-sm flex items-center gap-2">
                {lc.isTelefonicka ? <Phone className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                {MODEL_LABELS[lc.model]}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Změnit stav</div>
              <div className="space-y-1.5">
                {KANBAN_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={busy || s === lc.status}
                    className={`w-full px-3 py-1.5 text-left text-xs rounded-lg border transition-all ${
                      s === lc.status
                        ? `${STATUS_STYLES[s]} font-medium cursor-default`
                        : 'border-border bg-white hover:border-[#0045BF]/30 hover:bg-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Audit</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Vytvořeno: {formatDate(lc.createdAt)}</div>
                <div>Naposledy: {formatDate(lc.updatedAt)}</div>
                <div className="opacity-60">Plný change-log v audit modulu (TBD).</div>
              </div>
            </div>
          </div>
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

function Box({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-[#F7F9FC] border border-border">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground/70">{hint}</div>}
    </div>
  );
}
