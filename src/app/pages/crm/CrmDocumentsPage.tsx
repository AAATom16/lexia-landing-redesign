import { Upload, Search, FolderOpen, FileText, FileImage, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { documents, formatDate } from './mock-data';

const statusColors: Record<string, string> = {
  Vyplněno: 'bg-[#0045BF]/10 text-[#0045BF]',
  Schváleno: 'bg-[#008EA5]/10 text-[#008EA5]',
  'Po termínu': 'bg-[#df1929]/10 text-[#df1929]',
  'Čeká na nahrání': 'bg-amber-500/10 text-amber-700',
};

const typeIcon: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Smlouva: FileCheck,
  'Záznam z jednání': FileText,
  'Občanský průkaz': FileImage,
  'Výpis z OR': FileText,
  'GDPR souhlas': FileCheck,
  'Pojistná událost': FileText,
};

export function CrmDocumentsPage() {
  const [search, setSearch] = useState('');

  const filtered = documents.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.name.toLowerCase().includes(s) || d.clientName.toLowerCase().includes(s) || d.type.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Dokumenty</h1>
          <div className="text-sm text-muted-foreground mt-1">{documents.length} dokumentů celkem</div>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2">
          <Upload className="w-4 h-4" strokeWidth={2} /> Nahrát dokument
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Schváleno', value: documents.filter((d) => d.status === 'Schváleno').length, color: '#008EA5' },
          { label: 'Vyplněno', value: documents.filter((d) => d.status === 'Vyplněno').length, color: '#0045BF' },
          { label: 'Čeká na nahrání', value: documents.filter((d) => d.status === 'Čeká na nahrání').length, color: '#f59e0b' },
          { label: 'Po termínu', value: documents.filter((d) => d.status === 'Po termínu').length, color: '#df1929' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white border border-border p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl font-semibold mt-1" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F7F9FC] border border-border flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Hledat dokumenty…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <ul className="divide-y divide-border">
          {filtered.map((d) => {
            const Icon = typeIcon[d.type] ?? FolderOpen;
            return (
              <li key={d.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F7F9FC]/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0045BF]" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {d.type} · <Link to={`/crm/klienti/${d.clientId}`} className="hover:text-[#0045BF]">{d.clientName}</Link>
                    {d.uploadedAt !== '—' && ` · ${formatDate(d.uploadedAt)}`}
                    {d.size !== '—' && ` · ${d.size}`}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs ${statusColors[d.status]}`}>{d.status}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
