import { Plus, Globe, Phone, Megaphone, Users as UsersIcon, Handshake } from 'lucide-react';
import { leads, formatCurrency, formatDate, type Lead } from './mock-data';

const stages: Array<{ id: Lead['stage']; label: string; color: string }> = [
  { id: 'Nový', label: 'Noví', color: '#0045BF' },
  { id: 'Kontaktováno', label: 'Kontaktováno', color: '#0057F0' },
  { id: 'Nabídka', label: 'Nabídka', color: '#003799' },
  { id: 'Vyhráno', label: 'Vyhráno', color: '#008EA5' },
  { id: 'Prohráno', label: 'Prohráno', color: '#df1929' },
];

const sourceIcon: Record<Lead['source'], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  'Web formulář': Globe,
  Telefon: Phone,
  Kampaň: Megaphone,
  Doporučení: UsersIcon,
  Partner: Handshake,
};

function LeadCard({ lead }: { lead: Lead }) {
  const Icon = sourceIcon[lead.source];
  const initials = lead.owner.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <div className="rounded-xl bg-white border border-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-sm">{lead.name}</div>
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
      </div>
      <div className="text-xs text-muted-foreground mb-3">{lead.product}</div>
      <div className="text-lg font-semibold text-[#0045BF] mb-3">{formatCurrency(lead.estimatedPremium)}</div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0045BF] to-[#001843] text-white text-[9px] font-medium flex items-center justify-center">{initials}</div>
          <span>{lead.owner.split(' ')[0]}</span>
        </div>
        <span>{formatDate(lead.createdAt)}</span>
      </div>
    </div>
  );
}

export function CrmLeadsPage() {
  const totalValue = leads.reduce((s, l) => s + l.estimatedPremium, 0);
  const wonValue = leads.filter((l) => l.stage === 'Vyhráno').reduce((s, l) => s + l.estimatedPremium, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Leady</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {leads.length} leadů · pipeline {formatCurrency(totalValue)} · vyhráno {formatCurrency(wonValue)}
          </div>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={2} /> Nový lead
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 overflow-x-auto">
        {stages.map((s) => {
          const stageLeads = leads.filter((l) => l.stage === s.id);
          const stageValue = stageLeads.reduce((sum, l) => sum + l.estimatedPremium, 0);
          return (
            <div key={s.id} className="rounded-2xl bg-[#F1F4FA] p-3 min-w-[220px]">
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <h2 className="text-sm font-semibold">{s.label}</h2>
                  <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
                </div>
              </div>
              <div className="px-2 pb-3 text-xs text-muted-foreground">{formatCurrency(stageValue)}</div>
              <div className="space-y-2">
                {stageLeads.map((l) => <LeadCard key={l.id} lead={l} />)}
                {stageLeads.length === 0 && <div className="text-xs text-muted-foreground text-center py-6">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
