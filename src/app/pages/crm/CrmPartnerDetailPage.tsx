import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Copy,
  Key,
  Loader2,
  Plus,
  Tag,
  Trash2,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Webhook as WebhookIcon,
  Coins,
  X,
} from 'lucide-react';
import {
  api,
  isApiEnabled,
  type ApiDiscountCode,
  type ApiKey,
  type ApiKeyCreated,
  type ApiPartnerDetail,
  type ApiSalesperson,
  type ApiWebhook,
  type ApiWebhookCreated,
  type ApiCommissionEntry,
  type WebhookEvent,
} from '../../lib/api';

type Tab = 'profile' | 'salespeople' | 'keys' | 'discounts' | 'webhooks' | 'commissions';

export function CrmPartnerDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [data, setData] = useState<ApiPartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('profile');

  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [spModalOpen, setSpModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);

  async function load() {
    if (!isApiEnabled()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const detail = await api.partners.get(id);
      setData(detail);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Načítání…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Partner nenalezen nebo API není připojené.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/crm/partneri"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0045BF]"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na seznam
      </Link>

      <div className="rounded-2xl bg-white border border-border p-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 flex items-center justify-center">
          <Building2 className="w-7 h-7 text-[#0045BF]" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Partner</div>
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            <span className="font-mono">{data.brokerCode}</span>
            {data.ico && <span> · IČO {data.ico}</span>}
            {' · '}
            {data.contactEmail}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-md text-xs ${
              data.status === 'ACTIVE'
                ? 'bg-[#008EA5]/10 text-[#008EA5]'
                : data.status === 'SUSPENDED'
                ? 'bg-amber-500/10 text-amber-700'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {data.status}
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {([
          ['profile', 'Profil'],
          ['salespeople', `Obchodníci (${data.salespeople.length})`],
          ['keys', `API klíče (${data.apiKeys.filter((k) => !k.revokedAt).length})`],
          ['discounts', `Slevové kódy (${data.discountCodes.length})`],
          ['webhooks', 'Webhooky'],
          ['commissions', 'Provize'],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              tab === k
                ? 'border-[#0045BF] text-[#0045BF]'
                : 'border-transparent text-muted-foreground hover:text-[#1a1a2e]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab data={data} />}
      {tab === 'salespeople' && (
        <SalespeopleTab
          data={data}
          onAdd={() => setSpModalOpen(true)}
          onChange={load}
        />
      )}
      {tab === 'keys' && (
        <KeysTab
          data={data}
          onCreate={() => {
            setCreatedKey(null);
            setKeyModalOpen(true);
          }}
          onChange={load}
        />
      )}
      {tab === 'discounts' && (
        <DiscountsTab data={data} onAdd={() => setDiscountModalOpen(true)} onChange={load} />
      )}
      {tab === 'webhooks' && <WebhooksTab partnerId={data.id} />}
      {tab === 'commissions' && <CommissionsTab partnerId={data.id} />}

      {keyModalOpen && (
        <ApiKeyCreateModal
          partnerId={data.id}
          createdKey={createdKey}
          onCreated={(k) => {
            setCreatedKey(k);
            load();
          }}
          onClose={() => {
            setKeyModalOpen(false);
            setCreatedKey(null);
          }}
        />
      )}
      {spModalOpen && (
        <SalespersonCreateModal
          partnerId={data.id}
          onClose={() => setSpModalOpen(false)}
          onCreated={() => {
            setSpModalOpen(false);
            load();
          }}
        />
      )}
      {discountModalOpen && (
        <DiscountCreateModal
          partnerId={data.id}
          onClose={() => setDiscountModalOpen(false)}
          onCreated={() => {
            setDiscountModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProfileTab({ data }: { data: ApiPartnerDetail }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white border border-border p-6 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Kontakt</h3>
        <Field label="E-mail" value={data.contactEmail} />
        <Field label="Telefon" value={data.contactPhone ?? '—'} />
        <Field label="IČO" value={data.ico ?? '—'} />
        <Field label="Smlouva uzavřena" value={data.contractedAt ? new Date(data.contractedAt).toLocaleDateString('cs-CZ') : '—'} />
      </div>
      <div className="rounded-2xl bg-white border border-border p-6 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Provize</h3>
        <Field label="Model" value={data.commissionModel === 1 ? 'Model 1 (získatelská + následná)' : 'Model 2 (průběžná)'} />
        {data.commissionModel === 1 && (
          <>
            <Field label="Získatelská %" value={data.commissionRateZiskatelska?.toString() ?? 'default 45'} />
            <Field label="Následná %" value={data.commissionRateNasledna?.toString() ?? 'default 10'} />
          </>
        )}
        {data.commissionModel === 2 && (
          <Field label="Průběžná %" value={data.commissionRatePrubezna?.toString() ?? 'default 23'} />
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SalespeopleTab({
  data,
  onAdd,
  onChange,
}: {
  data: ApiPartnerDetail;
  onAdd: () => void;
  onChange: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">Obchodníci pod tímto partnerem</div>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-xs flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" /> Přidat obchodníka
        </button>
      </div>
      {data.salespeople.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Žádní obchodníci.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground text-left">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Sjednatelské číslo</th>
              <th className="px-4 py-3 font-medium">Jméno</th>
              <th className="px-4 py-3 font-medium">ČNB reg.</th>
              <th className="px-4 py-3 font-medium">Kategorie</th>
              <th className="px-4 py-3 font-medium">Stav</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.salespeople.map((sp) => (
              <SalespersonRow key={sp.id} sp={sp} partnerId={data.id} onChange={onChange} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SalespersonRow({
  sp,
  partnerId,
  onChange,
}: {
  sp: ApiSalesperson;
  partnerId: string;
  onChange: () => void;
}) {
  async function toggle() {
    await api.partners.updateSalesperson(partnerId, sp.id, {
      status: sp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    onChange();
  }
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
      <td className="px-4 py-3 font-mono text-xs">{sp.salespersonCode}</td>
      <td className="px-4 py-3">
        <div className="font-medium">{sp.name}</div>
        {sp.email && <div className="text-xs text-muted-foreground">{sp.email}</div>}
      </td>
      <td className="px-4 py-3 text-xs">{sp.cnbReg ?? '—'}</td>
      <td className="px-4 py-3 text-xs">{sp.cnbCategory ?? '—'}</td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded-md text-xs ${
            sp.status === 'ACTIVE' ? 'bg-[#008EA5]/10 text-[#008EA5]' : 'bg-muted text-muted-foreground'
          }`}
        >
          {sp.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={toggle} className="text-xs text-[#0045BF] hover:underline">
          {sp.status === 'ACTIVE' ? 'Deaktivovat' : 'Aktivovat'}
        </button>
      </td>
    </tr>
  );
}

function KeysTab({
  data,
  onCreate,
  onChange,
}: {
  data: ApiPartnerDetail;
  onCreate: () => void;
  onChange: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          Klíč se zobrazí jen jednou při generování. Uložte ho hned do tajného úložiště partnera.
        </div>
        <button
          onClick={onCreate}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Vygenerovat klíč
        </button>
      </div>
      {data.apiKeys.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Žádné API klíče.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground text-left">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Prefix</th>
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Scopes</th>
              <th className="px-4 py-3 font-medium">Naposledy použit</th>
              <th className="px-4 py-3 font-medium">Stav</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.apiKeys.map((k) => (
              <KeyRow key={k.id} k={k} partnerId={data.id} onChange={onChange} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function KeyRow({
  k,
  partnerId,
  onChange,
}: {
  k: ApiKey;
  partnerId: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function revoke() {
    if (!confirm(`Opravdu revokovat klíč ${k.prefix}? Tato akce je nevratná.`)) return;
    setBusy(true);
    try {
      await api.partners.revokeApiKey(partnerId, k.id);
      onChange();
    } finally {
      setBusy(false);
    }
  }
  const isLive = k.prefix.startsWith('lxa_live_');
  const revoked = !!k.revokedAt;
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
      <td className="px-4 py-3 font-mono text-xs">
        <span className={`px-1.5 py-0.5 rounded-md mr-1.5 text-[10px] ${isLive ? 'bg-[#0045BF]/10 text-[#0045BF]' : 'bg-amber-500/10 text-amber-700'}`}>
          {isLive ? 'LIVE' : 'TEST'}
        </span>
        {k.prefix}…
      </td>
      <td className="px-4 py-3">{k.label}</td>
      <td className="px-4 py-3 text-xs">{k.scopes.join(', ')}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString('cs-CZ') : 'Nepoužit'}
      </td>
      <td className="px-4 py-3">
        {revoked ? (
          <span className="px-2 py-0.5 rounded-md text-xs bg-red-100 text-red-700">Revokovaný</span>
        ) : (
          <span className="px-2 py-0.5 rounded-md text-xs bg-[#008EA5]/10 text-[#008EA5]">Aktivní</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {!revoked && (
          <button
            onClick={revoke}
            disabled={busy}
            className="text-xs text-red-600 hover:underline flex items-center gap-1 ml-auto"
          >
            <Trash2 className="w-3 h-3" /> Revokovat
          </button>
        )}
      </td>
    </tr>
  );
}

function DiscountsTab({
  data,
  onAdd,
  onChange,
}: {
  data: ApiPartnerDetail;
  onAdd: () => void;
  onChange: () => void;
}) {
  void onChange;
  return (
    <div className="rounded-2xl bg-white border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          Slevy se aplikují na celé měsíční pojistné. ONE_TIME se po vyčerpání zamkne.
        </div>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Nová sleva
        </button>
      </div>
      {data.discountCodes.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Žádné slevové kódy.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground text-left">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Kód</th>
              <th className="px-4 py-3 font-medium">Popis</th>
              <th className="px-4 py-3 font-medium">Typ</th>
              <th className="px-4 py-3 font-medium text-right">Sleva</th>
              <th className="px-4 py-3 font-medium text-right">Použito</th>
              <th className="px-4 py-3 font-medium">Platnost</th>
              <th className="px-4 py-3 font-medium">Stav</th>
            </tr>
          </thead>
          <tbody>
            {data.discountCodes.map((d) => (
              <DiscountRow key={d.id} d={d} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DiscountRow({ d }: { d: ApiDiscountCode }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
      <td className="px-4 py-3 font-mono text-xs">
        <Tag className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
        {d.code}
      </td>
      <td className="px-4 py-3">{d.label}</td>
      <td className="px-4 py-3 text-xs">{d.kind === 'PERMANENT' ? 'Trvalá' : 'Jednorázová'}</td>
      <td className="px-4 py-3 text-right font-medium">{d.percent} %</td>
      <td className="px-4 py-3 text-right text-xs">
        {d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ''}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {d.validUntil ? `do ${new Date(d.validUntil).toLocaleDateString('cs-CZ')}` : 'bez limitu'}
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded-md text-xs ${
            d.status === 'ACTIVE'
              ? 'bg-[#008EA5]/10 text-[#008EA5]'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {d.status}
        </span>
      </td>
    </tr>
  );
}

// ---- Modals ----

function ApiKeyCreateModal({
  partnerId,
  createdKey,
  onCreated,
  onClose,
}: {
  partnerId: string;
  createdKey: ApiKeyCreated | null;
  onCreated: (k: ApiKeyCreated) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState('');
  const [environment, setEnvironment] = useState<'live' | 'test'>('live');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!label) {
      setErr('Pojmenuj klíč (např. „Frenkee — produkce").');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const k = await api.partners.createApiKey(partnerId, { label, environment });
      onCreated(k);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Generování selhalo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.plainKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {createdKey ? (
          <div className="p-7 space-y-4">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-2xl tracking-tight">Klíč vygenerován</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Tento klíč už nikdy neuvidíte.</strong> Uložte ho do tajného úložiště partnera nebo
              ho rovnou pošlete bezpečným kanálem (ne email v plain textu — použijte šifrovaný kanál).
            </p>

            <div className="rounded-xl bg-[#001843] p-4 font-mono text-xs text-white break-all">
              {createdKey.plainKey}
            </div>

            <button
              onClick={copyKey}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-[#F7F9FC] flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#008EA5]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Zkopírováno' : 'Zkopírovat do schránky'}
            </button>

            <div className="text-xs text-muted-foreground space-y-1 pt-2">
              <div>Prefix: <span className="font-mono">{createdKey.prefix}</span></div>
              <div>Scopes: {createdKey.scopes.join(', ')}</div>
              <div>Vytvořen: {new Date(createdKey.createdAt).toLocaleString('cs-CZ')}</div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md mt-2"
            >
              Hotovo
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-7 space-y-4">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-[#0045BF]/10 items-center justify-center">
              <Key className="w-6 h-6 text-[#0045BF]" />
            </div>
            <h3 className="text-2xl tracking-tight">Vygenerovat API klíč</h3>

            <label className="block text-sm">
              <span className="text-muted-foreground">Label (popisný název)</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Frenkee — produkce"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Prostředí</span>
              <div className="mt-1 flex gap-2">
                {(['live', 'test'] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                      environment === env
                        ? 'border-[#0045BF] bg-[#0045BF]/5 text-[#0045BF]'
                        : 'border-border hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {env === 'live' ? 'LIVE (produkce)' : 'TEST (sandbox)'}
                  </button>
                ))}
              </div>
            </label>

            {err && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{err}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md disabled:opacity-60"
            >
              {submitting ? 'Generuji…' : 'Vygenerovat'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function SalespersonCreateModal({
  partnerId,
  onCreated,
  onClose,
}: {
  partnerId: string;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cnbReg, setCnbReg] = useState('');
  const [cnbCategory, setCnbCategory] = useState<string>('VZ');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return setErr('Vyplň jméno obchodníka.');
    setSubmitting(true);
    setErr(null);
    try {
      await api.partners.createSalesperson(partnerId, {
        name,
        email: email || undefined,
        phone: phone || undefined,
        cnbReg: cnbReg || undefined,
        cnbCategory: cnbCategory || undefined,
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Vytvoření selhalo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10">
          <X className="w-4 h-4" />
        </button>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <h3 className="text-2xl tracking-tight">Nový obchodník</h3>
          <p className="text-sm text-muted-foreground">
            Sjednatelské číslo se vygeneruje automaticky podle pořadí (např. -OB03).
          </p>

          <label className="block text-sm">
            <span className="text-muted-foreground">Jméno a příjmení</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              placeholder="Petr Novotný"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Telefon</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">ČNB registrace</span>
              <input
                type="text"
                value={cnbReg}
                onChange={(e) => setCnbReg(e.target.value)}
                placeholder="178421"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">ČNB kategorie</span>
              <select
                value={cnbCategory}
                onChange={(e) => setCnbCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none bg-white"
              >
                <option value="VZ">VZ — Vázaný zástupce</option>
                <option value="SZ_PA">SZ_PA — Pojišťovací agent</option>
                <option value="SZ_PM">SZ_PM — Pojišťovací makléř</option>
                <option value="DJ">DJ — Doplňkový</option>
                <option value="DPZ">DPZ — Pojišťovací zprostředkovatel</option>
                <option value="TIPAR">TIPAR — Tipař</option>
              </select>
            </label>
          </div>

          {err && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{err}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-[#F7F9FC]"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md disabled:opacity-60"
            >
              {submitting ? 'Vytvářím…' : 'Vytvořit obchodníka'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Webhooks tab ----

const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: 'DRAFT_CREATED', label: 'Lead vytvořen' },
  { value: 'DRAFT_SENT_TO_CLIENT', label: 'Návrh odeslán klientovi' },
  { value: 'DRAFT_SIGNED', label: 'Smlouva podepsaná' },
  { value: 'DRAFT_CANCELLED', label: 'Návrh stornován' },
];

function WebhooksTab({ partnerId }: { partnerId: string }) {
  const [items, setItems] = useState<ApiWebhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState<ApiWebhookCreated | null>(null);

  async function load() {
    setLoading(true);
    try {
      setItems(await api.partners.listWebhooks(partnerId));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  async function remove(id: string) {
    if (!confirm('Opravdu smazat webhook?')) return;
    await api.partners.deleteWebhook(partnerId, id);
    load();
  }

  return (
    <div className="rounded-2xl bg-white border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="text-sm text-muted-foreground">
          Lexia POSTuje JSON na partnerovu URL při změně životního cyklu draftu. HMAC-SHA256 podpis v
          hlavičce <code className="px-1 py-0.5 rounded bg-[#F7F9FC] font-mono text-xs">X-Lexia-Signature</code>.
        </div>
        <button
          onClick={() => {
            setCreated(null);
            setCreateOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Přidat webhook
        </button>
      </div>
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Načítání…
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Žádné webhooky.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground text-left">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3 font-medium">Eventy</th>
              <th className="px-4 py-3 font-medium">Stav</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((wh) => (
              <tr key={wh.id} className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
                <td className="px-4 py-3 font-mono text-xs break-all max-w-md">
                  <WebhookIcon className="w-3.5 h-3.5 inline mr-1.5 text-muted-foreground" />
                  {wh.url}
                </td>
                <td className="px-4 py-3 text-xs">
                  {wh.events.map((e) => (
                    <span key={e} className="inline-block px-1.5 py-0.5 mr-1 mb-1 rounded bg-[#0045BF]/10 text-[#0045BF]">
                      {e}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs ${
                      wh.enabled ? 'bg-[#008EA5]/10 text-[#008EA5]' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {wh.enabled ? 'Aktivní' : 'Vypnutý'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(wh.id)} className="text-xs text-red-600 hover:underline">
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {createOpen && (
        <WebhookCreateModal
          partnerId={partnerId}
          created={created}
          onCreated={(w) => {
            setCreated(w);
            load();
          }}
          onClose={() => {
            setCreateOpen(false);
            setCreated(null);
          }}
        />
      )}
    </div>
  );
}

function WebhookCreateModal({
  partnerId,
  created,
  onCreated,
  onClose,
}: {
  partnerId: string;
  created: ApiWebhookCreated | null;
  onCreated: (w: ApiWebhookCreated) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<WebhookEvent[]>(['DRAFT_SIGNED']);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggle(e: WebhookEvent) {
    setEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url || events.length === 0) return setErr('Vyplň URL a vyber alespoň jeden event.');
    setSubmitting(true);
    setErr(null);
    try {
      const w = await api.partners.createWebhook(partnerId, { url, events });
      onCreated(w);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Vytvoření selhalo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10">
          <X className="w-4 h-4" />
        </button>
        {created ? (
          <div className="p-7 space-y-4">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-2xl tracking-tight">Webhook vytvořen</h3>
            <p className="text-sm text-muted-foreground">
              Tento secret už nikdy neuvidíte. Předejte ho partnerovi bezpečným kanálem — bude potřeba pro
              ověření HMAC podpisu na příchozím requestu.
            </p>
            <div className="rounded-xl bg-[#001843] p-4 font-mono text-xs text-white break-all">
              {created.secret}
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(created.secret);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-[#F7F9FC] flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#008EA5]" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Zkopírováno' : 'Zkopírovat secret'}
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md mt-2"
            >
              Hotovo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-[#0045BF]/10 items-center justify-center">
              <WebhookIcon className="w-6 h-6 text-[#0045BF]" />
            </div>
            <h3 className="text-2xl tracking-tight">Nový webhook</h3>
            <label className="block text-sm">
              <span className="text-muted-foreground">Cílová URL (HTTPS)</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.partner.cz/lexia/webhook"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none font-mono text-xs"
              />
            </label>
            <div className="block text-sm">
              <span className="text-muted-foreground">Eventy (alespoň jeden)</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((e) => (
                  <label
                    key={e.value}
                    className={`px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      events.includes(e.value)
                        ? 'border-[#0045BF] bg-[#0045BF]/5'
                        : 'border-border hover:bg-[#F7F9FC]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={events.includes(e.value)}
                      onChange={() => toggle(e.value)}
                      className="mr-2 accent-[#0045BF]"
                    />
                    {e.label}
                  </label>
                ))}
              </div>
            </div>
            {err && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{err}</div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-[#F7F9FC]"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md disabled:opacity-60"
              >
                {submitting ? 'Vytvářím…' : 'Vytvořit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ---- Commissions tab ----

function CommissionsTab({ partnerId }: { partnerId: string }) {
  const [data, setData] = useState<{ total: number; entries: ApiCommissionEntry[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setData(await api.partners.listCommissions(partnerId));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Načítání…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-border p-6 flex items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#008EA5]/10 to-[#0045BF]/10 flex items-center justify-center">
          <Coins className="w-6 h-6 text-[#008EA5]" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Celková provize</div>
          <div className="text-3xl font-semibold">
            {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(data.total)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{data.entries.length} záznamů</div>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-border">
        {data.entries.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Žádné provize. Vznikají automaticky po podpisu smlouvy (status = SIGNED).
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground text-left">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Typ</th>
                <th className="px-4 py-3 font-medium text-right">Roční pojistné</th>
                <th className="px-4 py-3 font-medium text-right">%</th>
                <th className="px-4 py-3 font-medium text-right">Provize</th>
                <th className="px-4 py-3 font-medium">Datum</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
                  <td className="px-4 py-3">{e.contractDraft?.clientName ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{e.contractDraft?.productCode ?? '—'}</td>
                  <td className="px-4 py-3 text-xs">{e.kind}</td>
                  <td className="px-4 py-3 text-right">
                    {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(e.yearlyPremium)}
                  </td>
                  <td className="px-4 py-3 text-right">{e.percent} %</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function DiscountCreateModal({
  partnerId,
  onCreated,
  onClose,
}: {
  partnerId: string;
  onCreated: () => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'PERMANENT' | 'ONE_TIME'>('PERMANENT');
  const [percent, setPercent] = useState(10);
  const [validUntil, setValidUntil] = useState('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code || !label) return setErr('Vyplň kód a popis.');
    if (percent < 1 || percent > 100) return setErr('Sleva musí být 1–100 %.');
    setSubmitting(true);
    setErr(null);
    try {
      await api.partners.createDiscount(partnerId, {
        code,
        label,
        kind,
        percent,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        maxUses: typeof maxUses === 'number' ? maxUses : undefined,
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Vytvoření selhalo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10">
          <X className="w-4 h-4" />
        </button>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <h3 className="text-2xl tracking-tight">Nový slevový kód</h3>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Kód</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FRENKEE-FRIENDS-26"
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none font-mono text-xs"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Sleva %</span>
              <input
                type="number"
                value={percent}
                onChange={(e) => setPercent(parseInt(e.target.value) || 0)}
                min={1}
                max={100}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">Popis</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Trvalá sleva pro klienty Frenkee — 10 %"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
            />
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Typ</span>
            <div className="mt-1 flex gap-2">
              {(['PERMANENT', 'ONE_TIME'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    kind === k
                      ? 'border-[#0045BF] bg-[#0045BF]/5 text-[#0045BF]'
                      : 'border-border hover:bg-[#F7F9FC]'
                  }`}
                >
                  {k === 'PERMANENT' ? 'Trvalá' : 'Jednorázová'}
                </button>
              ))}
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Platí do (volitelné)</span>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Max. použití</span>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : '')}
                placeholder={kind === 'ONE_TIME' ? '1' : 'bez limitu'}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              />
            </label>
          </div>

          {err && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{err}</div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-[#F7F9FC]"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md disabled:opacity-60"
            >
              {submitting ? 'Vytvářím…' : 'Vytvořit slevu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
