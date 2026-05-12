import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, X, Loader2 } from 'lucide-react';
import { api, isApiEnabled, type ApiPartner } from '../../lib/api';

const statusBadge: Record<ApiPartner['status'], string> = {
  ACTIVE: 'bg-[#008EA5]/10 text-[#008EA5]',
  SUSPENDED: 'bg-amber-500/10 text-amber-700',
  TERMINATED: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<ApiPartner['status'], string> = {
  ACTIVE: 'Aktivní',
  SUSPENDED: 'Pozastavený',
  TERMINATED: 'Ukončený',
};

export function CrmPartnersPage() {
  const [partners, setPartners] = useState<ApiPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  async function load() {
    if (!isApiEnabled()) {
      setPartners([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.partners.list();
      setPartners(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = partners.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brokerCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.ico ?? '').includes(search),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Partneři</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {partners.length} partnerů · {partners.filter((p) => p.status === 'ACTIVE').length} aktivních
          </div>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Nový partner
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Hledat podle jména, broker code, IČO…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Načítání…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isApiEnabled()
              ? 'Žádní partneři neodpovídají filtru.'
              : 'API není připojené. Nastavte VITE_API_URL.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Partner</th>
                  <th className="px-4 py-3 font-medium">Broker code</th>
                  <th className="px-4 py-3 font-medium">IČO</th>
                  <th className="px-4 py-3 font-medium text-right">Obchodníci</th>
                  <th className="px-4 py-3 font-medium text-right">API klíče</th>
                  <th className="px-4 py-3 font-medium text-right">Leady</th>
                  <th className="px-4 py-3 font-medium">Stav</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-[#F7F9FC]">
                    <td className="px-4 py-3">
                      <Link to={`/crm/partneri/${p.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-[#0045BF]" strokeWidth={1.75} />
                        </div>
                        <div>
                          <div className="font-medium group-hover:text-[#0045BF]">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.contactEmail}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.brokerCode}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.ico ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{p._count?.salespeople ?? 0}</td>
                    <td className="px-4 py-3 text-right">{p._count?.apiKeys ?? 0}</td>
                    <td className="px-4 py-3 text-right">{p._count?.drafts ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs ${statusBadge[p.status]}`}>
                        {statusLabel[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createOpen && (
        <CreatePartnerModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreatePartnerModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [ico, setIco] = useState('');
  const [commissionModel, setCommissionModel] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !contactEmail) {
      setErr('Vyplň název a kontaktní e-mail.');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await api.partners.create({
        name,
        contactEmail,
        contactPhone: contactPhone || undefined,
        ico: ico || undefined,
        commissionModel,
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10"
          aria-label="Zavřít"
        >
          <X className="w-4 h-4" />
        </button>
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div>
            <h3 className="text-2xl tracking-tight">Nový partner</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Broker code se vygeneruje automaticky podle pořadí.
            </p>
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">Název partnera</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              placeholder="Frenkee s.r.o."
            />
          </label>

          <label className="block text-sm">
            <span className="text-muted-foreground">Kontaktní e-mail</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
              placeholder="info@partner.cz"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-muted-foreground">Telefon</span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                placeholder="+420 …"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">IČO</span>
              <input
                type="text"
                value={ico}
                onChange={(e) => setIco(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                placeholder="12345678"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-muted-foreground">Provizní model</span>
            <select
              value={commissionModel}
              onChange={(e) => setCommissionModel(Number(e.target.value) as 1 | 2)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none bg-white"
            >
              <option value={1}>Model 1 — Získatelská + následná</option>
              <option value={2}>Model 2 — Průběžná</option>
            </select>
          </label>

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
              {submitting ? 'Vytvářím…' : 'Vytvořit partnera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
