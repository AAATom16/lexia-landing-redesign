import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building2, User as UserIcon, Briefcase, Edit, FileText, FolderOpen, CheckSquare, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { clients, contracts, documents, tasks, formatCurrency, formatDate, clientTypeLabel } from './mock-data';

const statusColors: Record<string, string> = {
  Aktivní: 'bg-[#008EA5]/10 text-[#008EA5]',
  'V jednání': 'bg-[#0057F0]/10 text-[#0057F0]',
  Pozastaveno: 'bg-amber-500/10 text-amber-700',
  Ukončeno: 'bg-muted text-muted-foreground',
  Návrh: 'bg-[#0057F0]/10 text-[#0057F0]',
  Vyplněno: 'bg-[#0045BF]/10 text-[#0045BF]',
  Schváleno: 'bg-[#008EA5]/10 text-[#008EA5]',
  'Po termínu': 'bg-[#df1929]/10 text-[#df1929]',
  'Čeká na nahrání': 'bg-amber-500/10 text-amber-700',
  Nová: 'bg-[#0045BF]/10 text-[#0045BF]',
  'V řešení': 'bg-[#0057F0]/10 text-[#0057F0]',
  Hotovo: 'bg-[#008EA5]/10 text-[#008EA5]',
};

const tabs = [
  { id: 'overview', label: 'Přehled', icon: UserIcon },
  { id: 'contracts', label: 'Smlouvy', icon: FileText },
  { id: 'documents', label: 'Dokumenty', icon: FolderOpen },
  { id: 'tasks', label: 'Úkoly', icon: CheckSquare },
  { id: 'notes', label: 'Komunikace', icon: MessageSquare },
] as const;

export function CrmClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('overview');
  const client = clients.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="rounded-2xl bg-white border border-border p-8 text-center">
        <div className="text-muted-foreground">Klient nenalezen</div>
        <Link to="/crm/klienti" className="text-[#0045BF] hover:underline text-sm mt-2 inline-block">← Zpět na seznam</Link>
      </div>
    );
  }

  const clientContracts = contracts.filter((c) => c.clientId === client.id);
  const clientDocuments = documents.filter((d) => d.clientId === client.id);
  const clientTasks = tasks.filter((t) => t.clientId === client.id);

  const TypeIcon = client.type === 'individual' ? UserIcon : client.type === 'company' ? Building2 : Briefcase;

  return (
    <div className="space-y-6">
      <Link to="/crm/klienti" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#0045BF] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zpět na klienty
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-[#0045BF] to-[#001843] text-white p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <TypeIcon className="w-7 h-7 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-white/60 mb-1">{clientTypeLabel(client.type)}{client.ico && ` · IČO ${client.ico}`}</div>
              <h1 className="text-3xl font-semibold">{client.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/80">
                <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{client.email}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{client.phone}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{client.city}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/15">
              <Edit className="w-4 h-4" strokeWidth={1.75} /> Upravit
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-white text-[#0045BF] text-sm font-medium hover:shadow-lg transition-all">
              + Nová smlouva
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Smluv celkem</div>
            <div className="text-2xl font-semibold">{client.contractsCount}</div>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Roční pojistné</div>
            <div className="text-2xl font-semibold">{formatCurrency(clientContracts.reduce((s, c) => s + c.premium, 0))}</div>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Otevřené dokumenty</div>
            <div className="text-2xl font-semibold">{client.documentsOpen}</div>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
            <div className="text-xs text-white/60 mb-1">Segment</div>
            <div className="text-2xl font-semibold">{client.segment}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-border">
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors whitespace-nowrap ${
                  isActive ? 'bg-[#F7F9FC] text-[#0045BF] font-medium' : 'text-muted-foreground hover:bg-[#F7F9FC]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                {t.label}
                {(t.id === 'contracts' && clientContracts.length > 0) ||
                 (t.id === 'documents' && clientDocuments.length > 0) ||
                 (t.id === 'tasks' && clientTasks.length > 0) ? (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-[#0045BF] text-white' : 'bg-muted text-muted-foreground'}`}>
                    {t.id === 'contracts' ? clientContracts.length : t.id === 'documents' ? clientDocuments.length : clientTasks.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Kontaktní údaje</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">E-mail</dt><dd>{client.email}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Telefon</dt><dd>{client.phone}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Město</dt><dd>{client.city}</dd></div>
                  {client.ico && <div className="flex justify-between"><dt className="text-muted-foreground">IČO</dt><dd>{client.ico}</dd></div>}
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Obchodní údaje</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Hlavní produkt</dt><dd>{client.product}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Poradce</dt><dd>{client.manager}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><span className={`px-2 py-0.5 rounded-md text-xs ${statusColors[client.status]}`}>{client.status}</span></dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Vytvořeno</dt><dd>{formatDate(client.createdAt)}</dd></div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Číslo</th>
                  <th className="pb-3 font-medium">Produkt</th>
                  <th className="pb-3 font-medium">Pojišťovna</th>
                  <th className="pb-3 font-medium">Roční pojistné</th>
                  <th className="pb-3 font-medium">Trvání</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {clientContracts.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{c.number}</td>
                    <td className="py-3">{c.product}</td>
                    <td className="py-3 text-muted-foreground">{c.insurer}</td>
                    <td className="py-3">{formatCurrency(c.premium)}</td>
                    <td className="py-3 text-muted-foreground text-xs">{formatDate(c.start)} – {formatDate(c.end)}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded-md text-xs ${statusColors[c.status]}`}>{c.status}</span></td>
                  </tr>
                ))}
                {clientContracts.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Žádné smlouvy</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'documents' && (
            <ul className="space-y-2">
              {clientDocuments.map((d) => (
                <li key={d.id} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-[#F7F9FC] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#0045BF]/10 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-[#0045BF]" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.type} · {d.size} · {formatDate(d.uploadedAt)}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs ${statusColors[d.status]}`}>{d.status}</span>
                </li>
              ))}
              {clientDocuments.length === 0 && <div className="py-8 text-center text-muted-foreground text-sm">Žádné dokumenty</div>}
            </ul>
          )}

          {activeTab === 'tasks' && (
            <ul className="space-y-2">
              {clientTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-xl bg-[#0057F0]/10 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5 text-[#0057F0]" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.assignee} · termín {formatDate(t.dueDate)} · priorita {t.priority}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs ${statusColors[t.status]}`}>{t.status}</span>
                </li>
              ))}
              {clientTasks.length === 0 && <div className="py-8 text-center text-muted-foreground text-sm">Žádné úkoly</div>}
            </ul>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0045BF] to-[#001843] flex items-center justify-center text-white text-xs font-medium">JD</div>
                  <div className="text-sm font-medium">Jana Dvořáková</div>
                  <div className="text-xs text-muted-foreground">před 2 dny</div>
                </div>
                <div className="text-sm text-muted-foreground pl-10">Klient potvrdil zájem o rozšíření smlouvy. Schůzka domluvena na příští úterý.</div>
              </div>
              <textarea placeholder="Přidat poznámku…" className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-[#F7F9FC] outline-none focus:bg-white focus:border-[#0045BF] transition-colors text-sm resize-none" />
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm">Přidat poznámku</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
