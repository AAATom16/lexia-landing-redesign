import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Phone, Save, Search, ShieldCheck, X } from 'lucide-react';
import { ApiError, api, isApiEnabled, type ApiDraft, type ApiLegalCase, type LegalCaseModel } from '../../lib/api';
import { getProductPillars, products } from '../../domain/products';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (lc: ApiLegalCase) => void;
};

export function CaseCreateModal({ open, onClose, onCreated }: Props) {
  const [drafts, setDrafts] = useState<ApiDraft[]>([]);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);

  const [policyholderName, setPolicyholderName] = useState('');
  const [policyholderEmail, setPolicyholderEmail] = useState('');
  const [policyholderIco, setPolicyholderIco] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [productCode, setProductCode] = useState<'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES'>('INDIVIDUAL');
  const [pillarCode, setPillarCode] = useState('IND_BASIC');
  const [legalAreaCode, setLegalAreaCode] = useState('');
  const [claimType, setClaimType] = useState('');
  const [caseDate, setCaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportedDate, setReportedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [model, setModel] = useState<LegalCaseModel>('SAMOREGULACE');
  const [isTelefonicka, setIsTelefonicka] = useState(false);
  const [reserveExternal, setReserveExternal] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !isApiEnabled()) return;
    api.drafts.list().then((d) => setDrafts(d)).catch(() => setDrafts([]));
  }, [open]);

  const productPillars = useMemo(() => getProductPillars(productCode), [productCode]);

  // When pillar code parent changes (productCode), reset pillar
  useEffect(() => {
    const first = productPillars[0]?.code;
    if (first && !productPillars.some((p) => p.code === pillarCode)) {
      setPillarCode(first);
    }
  }, [productCode, productPillars, pillarCode]);

  const filteredDrafts = useMemo(() => {
    if (!draftSearch) return drafts.slice(0, 20);
    const s = draftSearch.toLowerCase();
    return drafts.filter((d) =>
      [d.clientName, d.clientEmail, d.number, d.id]
        .filter(Boolean)
        .some((v) => (v ?? '').toLowerCase().includes(s)),
    ).slice(0, 20);
  }, [draftSearch, drafts]);

  function applyDraft(d: ApiDraft) {
    setDraftId(d.id);
    if (d.clientName) setPolicyholderName(d.clientName);
    if (d.clientEmail) setPolicyholderEmail(d.clientEmail);
    if (d.clientIco) setPolicyholderIco(d.clientIco);
    if (d.productCode === 'INDIVIDUAL' || d.productCode === 'BUSINESS' || d.productCode === 'DRIVERS_VEHICLES') {
      setProductCode(d.productCode);
    }
    if (d.pillars[0]) setPillarCode(d.pillars[0]);
  }

  function clearDraft() {
    setDraftId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!policyholderName.trim()) {
      setError('Vyplň pojistníka.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.legalCases.create({
        policyholderName,
        policyholderEmail: policyholderEmail || undefined,
        policyholderIco: policyholderIco || undefined,
        isVip,
        productCode,
        pillarCode,
        legalAreaCode: legalAreaCode || undefined,
        claimType: claimType || undefined,
        caseDate: new Date(caseDate).toISOString(),
        reportedDate: new Date(reportedDate).toISOString(),
        model: isTelefonicka ? 'TELEFONICKA_PORADA' : model,
        isTelefonicka,
        reserveExternal: isTelefonicka ? 0 : reserveExternal,
        description: description || undefined,
        contractDraftId: draftId ?? undefined,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Vytvoření selhalo (${err.status} ${err.code}). Pravděpodobně chybí oprávnění nebo API neběží.`);
      } else {
        setError('Vytvoření selhalo.');
      }
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#001843]/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-xl tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0045BF]" /> Nový právní případ
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Vyhledej smlouvu nebo zadej pojistníka ručně. Vyplnění zbylých polí proběhne podle smlouvy.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Section title="Smlouva / pojistník">
            {draftId ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#0045BF]/30 bg-[#0045BF]/5">
                <div className="text-sm">
                  Vybraná smlouva: <span className="font-medium">{drafts.find((d) => d.id === draftId)?.number ?? draftId.slice(0, 12)}</span> · {drafts.find((d) => d.id === draftId)?.clientName ?? '—'}
                </div>
                <button type="button" onClick={clearDraft} className="text-xs text-muted-foreground hover:text-foreground">
                  Změnit
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={draftSearch}
                    onChange={(e) => setDraftSearch(e.target.value)}
                    placeholder="Hledat smlouvu (číslo, jméno, email)…"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  />
                </div>
                {filteredDrafts.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border">
                    {filteredDrafts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => applyDraft(d)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#F7F9FC] text-left text-sm border-b border-border last:border-0"
                      >
                        <div className="min-w-0">
                          <div className="truncate">{d.clientName ?? 'Bez klienta'} · {d.number ?? d.id.slice(0, 12)}</div>
                          <div className="text-xs text-muted-foreground truncate">{d.clientEmail ?? ''} · {d.productCode}</div>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0">{d.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="Pojistník">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Jméno / název *">
                <input
                  type="text"
                  value={policyholderName}
                  onChange={(e) => setPolicyholderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border"
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={policyholderEmail}
                  onChange={(e) => setPolicyholderEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border"
                />
              </Field>
              <Field label="IČO">
                <input
                  type="text"
                  value={policyholderIco}
                  onChange={(e) => setPolicyholderIco(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border"
                />
              </Field>
              <label className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} className="accent-[#0045BF]" />
                <span className="text-sm">VIP klient</span>
              </label>
            </div>
          </Section>

          <Section title="Pojistné krytí">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Produkt">
                <select
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value as typeof productCode)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                >
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>{p.shortName}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pilíř">
                <select
                  value={pillarCode}
                  onChange={(e) => setPillarCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                >
                  {productPillars.map((p) => (
                    <option key={p.code} value={p.code}>{p.shortName}</option>
                  ))}
                </select>
              </Field>
              <Field label="Pojištěná oblast">
                <input
                  type="text"
                  value={legalAreaCode}
                  onChange={(e) => setLegalAreaCode(e.target.value)}
                  placeholder="např. spory_s_pronajimateli"
                  className="w-full px-3 py-2 rounded-lg border border-border"
                />
              </Field>
              <Field label="Typ nároku">
                <input
                  type="text"
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value)}
                  placeholder="např. Vymáhání pohledávky"
                  className="w-full px-3 py-2 rounded-lg border border-border"
                />
              </Field>
            </div>
          </Section>

          <Section title="Časové údaje">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Datum vzniku případu *">
                <input type="date" value={caseDate} onChange={(e) => setCaseDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border" required />
              </Field>
              <Field label="Datum nahlášení">
                <input type="date" value={reportedDate} onChange={(e) => setReportedDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border" />
              </Field>
            </div>
          </Section>

          <Section title="Model likvidace + rezervy">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isTelefonicka}
                onChange={(e) => setIsTelefonicka(e.target.checked)}
                className="accent-[#0045BF]"
              />
              <span className="text-sm flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Telefonická porada (rezervy nulové)
              </span>
            </label>
            {!isTelefonicka && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Model">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as LegalCaseModel)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                  >
                    <option value="SAMOREGULACE">Samoregulace</option>
                    <option value="EXTERNI_LIKVIDACE">Externí likvidace</option>
                  </select>
                </Field>
                <Field label="Externí rezerva (Kč)">
                  <input
                    type="number"
                    min={0}
                    value={reserveExternal}
                    onChange={(e) => setReserveExternal(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-border"
                  />
                </Field>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Interní rezerva (Lexia odměna) se vyplní automaticky podle modelu — Samoregulace 3 150 Kč, Externí likvidace 11 925 Kč.
            </p>
          </Section>

          <Section title="Popis případu">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stručně popište situaci, podklady, důkazy…"
              className="w-full px-3 py-2 rounded-lg border border-border"
            />
          </Section>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t border-border -mx-6 px-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-border rounded-xl hover:bg-[#F7F9FC] text-sm"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center gap-2 hover:shadow-lg disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Vytvářím…' : 'Vytvořit případ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
