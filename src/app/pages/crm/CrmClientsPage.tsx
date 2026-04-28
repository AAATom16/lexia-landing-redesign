import { Link } from 'react-router-dom';
import { Filter, Plus, Search, Building2, User as UserIcon, Briefcase, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { clients, clientTypeLabel, formatDate, type ClientType } from './mock-data';

const typeIcon: Record<ClientType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  individual: UserIcon,
  company: Building2,
  self_employed: Briefcase,
};

const statusColors: Record<string, string> = {
  Aktivní: 'bg-[#008EA5]/10 text-[#008EA5]',
  'V jednání': 'bg-[#0057F0]/10 text-[#0057F0]',
  Pozastaveno: 'bg-amber-500/10 text-amber-700',
  Ukončeno: 'bg-muted text-muted-foreground',
};

const segmentColors: Record<string, string> = {
  Retail: 'bg-muted text-muted-foreground',
  SME: 'bg-[#0045BF]/10 text-[#0045BF]',
  Korporát: 'bg-[#001843]/10 text-[#001843]',
  VIP: 'bg-gradient-to-r from-[#0045BF]/10 to-[#008EA5]/10 text-[#0045BF]',
};

export function CrmClientsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ClientType>('all');

  const filtered = clients.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Klienti</h1>
          <div className="text-sm text-muted-foreground mt-1">{clients.length} klientů celkem · {clients.filter((c) => c.status === 'Aktivní').length} aktivních</div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" strokeWidth={1.75} /> Filtry
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2} /> Nový klient
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Hledat podle jména, IČO, e-mailu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5">
            {([
              ['all', 'Vše'],
              ['individual', 'Fyzické osoby'],
              ['company', 'Firmy'],
              ['self_employed', 'OSVČ'],
            ] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTypeFilter(k as 'all' | ClientType)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  typeFilter === k ? 'bg-[#0045BF] text-white' : 'text-muted-foreground hover:bg-[#F7F9FC]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F9FC] border-b border-border">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Klient</th>
                <th className="px-4 py-3 font-medium">Typ</th>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Produkt</th>
                <th className="px-4 py-3 font-medium">Poradce</th>
                <th className="px-4 py-3 font-medium text-center">Smluv</th>
                <th className="px-4 py-3 font-medium text-center">Pozornost</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Vytvořeno</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const TypeIcon = typeIcon[c.type];
                const attentionCount = c.documentsOpen + c.tasksOverdue;
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-[#F7F9FC]/60 transition-colors">
                    <td className="px-4 py-4">
                      <Link to={`/crm/klienti/${c.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 flex items-center justify-center shrink-0">
                          <TypeIcon className="w-4 h-4 text-[#0045BF]" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm group-hover:text-[#0045BF] transition-colors truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.email} · {c.city}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <div>{clientTypeLabel(c.type)}</div>
                      {c.ico && <div className="text-xs">IČO {c.ico}</div>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${segmentColors[c.segment]}`}>{c.segment}</span>
                    </td>
                    <td className="px-4 py-4 text-sm">{c.product}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{c.manager}</td>
                    <td className="px-4 py-4 text-center text-sm font-medium">{c.contractsCount}</td>
                    <td className="px-4 py-4 text-center">
                      {attentionCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#df1929]/10 text-[#df1929]">
                          <AlertTriangle className="w-3 h-3" /> {attentionCount}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${statusColors[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <div>Zobrazeno {filtered.length} z {clients.length}</div>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs rounded-lg border border-border bg-white">1</button>
            <button className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-[#F7F9FC]">2</button>
            <button className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-[#F7F9FC]">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
