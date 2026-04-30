import { TrendingUp, TrendingDown, FileText, Users, Sparkles, Target, ArrowUpRight, AlertTriangle, CheckCircle2, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import {
  dashboardKpi,
  monthlyPremium,
  productMix,
  recentActivity,
  tasks,
  contracts,
  formatCurrency,
} from './mock-data';
import { OnboardingBanner } from '../../components/onboarding/OnboardingBanner';

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  delta: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: string;
}) {
  const positive = delta >= 0;
  return (
    <div className="rounded-2xl bg-white border border-border p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${positive ? 'bg-[#008EA5]/10 text-[#008EA5]' : 'bg-[#df1929]/10 text-[#df1929]'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? '+' : ''}{(delta * 100).toFixed(1)}%
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold text-[#1a1a2e]">{value}</div>
    </div>
  );
}

export function CrmDashboardPage() {
  const overdueTasks = tasks.filter((t) => t.status !== 'Hotovo' && new Date(t.dueDate) < new Date('2026-04-28'));
  const draftContracts = contracts.filter((c) => c.status === 'Návrh');

  return (
    <div className="space-y-8">
      <OnboardingBanner surface="crm" />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Vítej zpět, Jano</div>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">Přehled obchodu</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white transition-colors">
            Export
          </button>
          <Link
            to="/crm/kalkulacka"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0045BF] to-[#001843] text-white text-sm hover:shadow-md transition-all"
          >
            + Nová smlouva
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Předepsané pojistné YTD" value={formatCurrency(dashboardKpi.premiumYtd)} delta={dashboardKpi.premiumYtdGrowth} icon={Target} accent="bg-gradient-to-br from-[#0045BF] to-[#001843]" />
        <KpiCard label="Aktivní smlouvy" value={dashboardKpi.activeContracts.toString()} delta={dashboardKpi.activeContractsGrowth} icon={FileText} accent="bg-gradient-to-br from-[#0057F0] to-[#0045BF]" />
        <KpiCard label="Noví klienti / měsíc" value={dashboardKpi.newClientsMonth.toString()} delta={dashboardKpi.newClientsGrowth} icon={Users} accent="bg-gradient-to-br from-[#008EA5] to-[#003799]" />
        <KpiCard label="Pipeline value" value={formatCurrency(dashboardKpi.pipelineValue)} delta={dashboardKpi.pipelineGrowth} icon={Sparkles} accent="bg-gradient-to-br from-[#003799] to-[#001843]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Vývoj předepsaného pojistného</h2>
              <div className="text-sm text-muted-foreground">Posledních 6 měsíců</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs rounded-lg bg-[#0045BF] text-white">6M</button>
              <button className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-[#F7F9FC]">YTD</button>
              <button className="px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:bg-[#F7F9FC]">12M</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPremium} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }}
                  formatter={(v: number) => [formatCurrency(v), 'Pojistné']}
                />
                <Area type="monotone" dataKey="value" stroke="#0045BF" strokeWidth={2.5} fill="#0045BF" fillOpacity={0.18} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-border p-6">
          <h2 className="text-lg font-semibold mb-1">Mix produktů</h2>
          <div className="text-sm text-muted-foreground mb-4">Podle počtu smluv</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productMix} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} isAnimationActive={false}>
                  {productMix.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {productMix.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </div>
                <span className="text-muted-foreground">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Poslední aktivita</h2>
            <Link to="/crm/klienti" className="text-sm text-[#0045BF] hover:underline flex items-center gap-1">
              Vše <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentActivity.map((a) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  a.kind === 'contract' ? 'bg-[#0045BF]/10 text-[#0045BF]'
                  : a.kind === 'document' ? 'bg-[#008EA5]/10 text-[#008EA5]'
                  : a.kind === 'task' ? 'bg-[#0057F0]/10 text-[#0057F0]'
                  : a.kind === 'lead' ? 'bg-[#003799]/10 text-[#003799]'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {a.kind === 'contract' ? <FileText className="w-4 h-4" strokeWidth={1.75} />
                    : a.kind === 'document' ? <FolderOpen className="w-4 h-4" strokeWidth={1.75} />
                    : a.kind === 'task' ? <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                    : a.kind === 'lead' ? <Sparkles className="w-4 h-4" strokeWidth={1.75} />
                    : <Users className="w-4 h-4" strokeWidth={1.75} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{a.who}</span>{' '}
                    <span className="text-muted-foreground">{a.what}</span>{' '}
                    <span className="font-medium">{a.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Vyžaduje pozornost</h2>
          <div className="space-y-3">
            <div className="rounded-xl border border-[#df1929]/20 bg-[#df1929]/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#df1929] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="font-medium text-sm">Úkoly po termínu</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{overdueTasks.length} úkolů přeteklo termín</div>
                  <Link to="/crm/ukoly" className="text-xs text-[#0045BF] hover:underline mt-2 inline-block">Zobrazit →</Link>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#0057F0]/20 bg-[#0057F0]/5 p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#0057F0] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="font-medium text-sm">Smlouvy v návrhu</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{draftContracts.length} čeká na podpis</div>
                  <Link to="/crm/smlouvy" className="text-xs text-[#0045BF] hover:underline mt-2 inline-block">Zobrazit →</Link>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#008EA5]/20 bg-[#008EA5]/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#008EA5] shrink-0 mt-0.5" strokeWidth={1.75} />
                <div className="flex-1">
                  <div className="font-medium text-sm">Nové leady</div>
                  <div className="text-xs text-muted-foreground mt-0.5">3 leady čekají na první kontakt</div>
                  <Link to="/crm/leady" className="text-xs text-[#0045BF] hover:underline mt-2 inline-block">Zobrazit →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
