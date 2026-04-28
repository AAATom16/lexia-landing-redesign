import { Filter, Plus, Search, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contracts, formatCurrency, formatDate } from './mock-data';

const statusColors: Record<string, string> = {
  Aktivní: 'bg-[#008EA5]/10 text-[#008EA5]',
  Návrh: 'bg-[#0057F0]/10 text-[#0057F0]',
  Vypovězená: 'bg-amber-500/10 text-amber-700',
  Ukončená: 'bg-muted text-muted-foreground',
};

export function CrmContractsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = contracts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!c.number.toLowerCase().includes(s) && !c.clientName.toLowerCase().includes(s) && !c.product.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalPremium = filtered.filter((c) => c.status === 'Aktivní').reduce((s, c) => s + c.premium, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Smlouvy</h1>
          <div className="text-sm text-muted-foreground mt-1">{contracts.length} smluv · roční pojistné {formatCurrency(totalPremium)}</div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" strokeWidth={1.75} /> Filtry
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2} /> Nová smlouva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Aktivní', value: contracts.filter((c) => c.status === 'Aktivní').length, color: '#008EA5' },
          { label: 'Návrhy', value: contracts.filter((c) => c.status === 'Návrh').length, color: '#0057F0' },
          { label: 'Bez záznamu', value: contracts.filter((c) => !c.hasMeetingRecord).length, color: '#df1929' },
          { label: 'Roční pojistné', value: formatCurrency(totalPremium), color: '#0045BF' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white border border-border p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Hledat dle čísla, klienta, produktu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5">
            {['all', 'Aktivní', 'Návrh', 'Ukončená'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  statusFilter === s ? 'bg-[#0045BF] text-white' : 'text-muted-foreground hover:bg-[#F7F9FC]'
                }`}
              >
                {s === 'all' ? 'Vše' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F9FC] border-b border-border">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Číslo smlouvy</th>
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Pojišťovna</th>
                <th className="px-4 py-3 font-medium text-right">Roční pojistné</th>
                <th className="px-4 py-3 font-medium">Platnost</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-[#F7F9FC]/60 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#0045BF]/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#0045BF]" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{c.number}</div>
                        {!c.hasMeetingRecord && (
                          <div className="flex items-center gap-1 text-xs text-[#df1929] mt-0.5">
                            <AlertCircle className="w-3 h-3" /> Chybí záznam z jednání
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link to={`/crm/klienti/${c.clientId}`} className="text-sm hover:text-[#0045BF] transition-colors">{c.clientName}</Link>
                  </td>
                  <td className="px-4 py-4 text-sm">{c.product}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{c.insurer}</td>
                  <td className="px-4 py-4 text-sm font-medium text-right">{formatCurrency(c.premium)}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(c.start)} – {formatDate(c.end)}</td>
                  <td className="px-4 py-4"><span className={`px-2 py-1 rounded-md text-xs ${statusColors[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
