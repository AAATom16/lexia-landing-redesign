import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, FileText, Mail, ShieldCheck, Trash2, User, Wallet } from 'lucide-react';
import {
  deleteDraft,
  getDraft,
  nextStatus,
  updateDraft,
  type ContractDraft,
  type DraftStatus,
} from '../../lib/drafts';
import { formatCzk, previewCommission } from '../../domain/calculator';
import { getPillar, getProduct } from '../../domain/products';

const STATUS_STYLES: Record<DraftStatus, string> = {
  'Návrh': 'bg-blue-50 text-blue-700 border-blue-200',
  'Odesláno klientovi': 'bg-amber-50 text-amber-700 border-amber-200',
  'Podepsáno': 'bg-green-50 text-green-700 border-green-200',
};

const NEXT_LABEL: Record<DraftStatus, string> = {
  'Návrh': 'Odeslat klientovi',
  'Odesláno klientovi': 'Označit jako podepsané',
  'Podepsáno': '',
};

export type DraftDetailProps = {
  id: string;
  onBack: () => void;
  homeLabel: string;
};

export function DraftDetail({ id, onBack, homeLabel }: DraftDetailProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ContractDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const d = await getDraft(id);
        if (!cancelled) setDraft(d ?? null);
      } catch {
        if (!cancelled) setError('Nepodařilo se načíst smlouvu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 lg:px-12 py-12 text-muted-foreground text-sm">
        Načítám…
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-[#0045BF] hover:underline mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> {homeLabel}
        </button>
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
          <p className="text-foreground mb-2">Návrh smlouvy nenalezen</p>
          <p className="text-sm text-muted-foreground">{error ?? 'Možná byl smazán nebo nemáte oprávnění.'}</p>
        </div>
      </div>
    );
  }

  const product = getProduct(draft.input.productCode);
  const next = nextStatus(draft.status);
  const commission = draft.commissionModel
    ? previewCommission(draft.result.yearly, draft.commissionModel, draft.commissionModel === 1)
    : null;

  async function handleAdvance() {
    if (!next || !draft) return;
    setBusy(true);
    try {
      const updated = await updateDraft(draft.id, { status: next });
      if (updated) setDraft({ ...updated, createdBy: draft.createdBy, source: draft.source });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!draft) return;
    if (!confirm('Smazat tento návrh smlouvy? Tato akce je nevratná.')) return;
    setBusy(true);
    try {
      await deleteDraft(draft.id);
      onBack();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-[#0045BF] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> {homeLabel}
        </button>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${STATUS_STYLES[draft.status]}`}>
          <ShieldCheck className="w-3.5 h-3.5" /> {draft.status}
        </div>
      </div>

      <div className="mb-8">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">Návrh smlouvy</div>
        <h1 className="text-3xl tracking-tight">{draft.clientName ?? 'Bez klienta'}</h1>
        <div className="text-sm text-muted-foreground">
          ID: {draft.id} · {product?.shortName ?? draft.input.productCode} · vytvořeno {new Date(draft.createdAt).toLocaleString('cs-CZ')}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-6">
          <Section icon={User} title="Klient">
            <KV k="Jméno" v={draft.clientName ?? '—'} />
            <KV k="Email" v={draft.clientEmail ?? '—'} />
          </Section>

          <Section icon={FileText} title="Pojištění">
            <KV k="Produkt" v={product?.name ?? draft.input.productCode} />
            <KV k="Segment" v={draft.input.segment === 'household' ? 'Domácnost' : draft.input.segment === 'individual' ? 'Jednotlivec' : '—'} />
            <KV k="Územní rozsah" v="ČR" />
            <div className="pt-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Pilíře ({draft.input.pillars.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {draft.input.pillars.map((code) => {
                  const p = getPillar(code);
                  return (
                    <span key={code} className="px-2.5 py-1 rounded-full bg-[#0045BF]/10 text-[#0045BF] text-xs">
                      {p?.shortName ?? code}
                    </span>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section icon={Wallet} title="Pojistné">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Měsíčně</div>
                <div className="text-2xl font-display tracking-tight">{formatCzk(draft.result.monthly)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Ročně</div>
                <div className="text-2xl font-display tracking-tight">{formatCzk(draft.result.yearly)}</div>
              </div>
            </div>
            {draft.result.lineItems.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Rozpis</div>
                <div className="space-y-1.5">
                  {draft.result.lineItems.map((li, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{li.label}</span>
                      <span className="tabular-nums">{formatCzk(li.monthly)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <div className="bg-white border border-border rounded-2xl p-6">
            <h3 className="text-base mb-3">PDF náhled smlouvy</h3>
            <div className="aspect-[8.5/11] bg-[#F7F9FC] border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#0045BF]/40" />
                <div>PDF generátor zatím není napojený.</div>
                <div className="text-xs mt-1">V příští iteraci server-side generování přes pdf-lib.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="bg-gradient-to-br from-[#0045BF] to-[#001843] text-white rounded-2xl p-6">
            <div className="text-xs uppercase tracking-wide text-white/70 mb-2">Životní cyklus</div>
            <ol className="space-y-3">
              {(['Návrh', 'Odesláno klientovi', 'Podepsáno'] as DraftStatus[]).map((s, i) => {
                const idx = ['Návrh', 'Odesláno klientovi', 'Podepsáno'].indexOf(draft.status);
                const reached = i <= idx;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${reached ? 'bg-white text-[#0045BF]' : 'bg-white/15 text-white/60'}`}>
                      {reached ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={reached ? '' : 'text-white/60'}>{s}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {next && (
            <button
              onClick={handleAdvance}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg disabled:opacity-60"
            >
              <ArrowRight className="w-4 h-4" /> {NEXT_LABEL[draft.status]}
            </button>
          )}

          {draft.clientEmail && draft.status === 'Návrh' && (
            <div className="text-xs text-muted-foreground bg-[#F7F9FC] border border-border rounded-xl p-3 flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Při odeslání se klientovi v reálu pošle email s odkazem na podpis. Aktuálně jen mock — odešle se interní notifikace.
            </div>
          )}

          {commission && draft.commissionModel && (
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Provize (model {draft.commissionModel})</div>
              <div className="space-y-1 text-sm">
                {commission.model === 1 ? (
                  <>
                    <KV k="Získatelská 45 %" v={formatCzk(commission.ziskatelska ?? 0)} />
                    <KV k="Následná 10 %" v={formatCzk(commission.nasledna ?? 0)} />
                  </>
                ) : (
                  <KV k="Průběžná 23 %" v={formatCzk(commission.prubezna ?? 0)} />
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate(`/${homeLabel.includes('CRM') ? 'crm' : 'portal'}/kalkulacka`)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-[#F7F9FC]"
          >
            Nový návrh z kalkulačky
          </button>

          <button
            onClick={handleDelete}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" /> Smazat návrh
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <h3 className="text-base mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#0045BF]" /> {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
