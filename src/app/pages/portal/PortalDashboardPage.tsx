import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileText, TrendingUp, Wallet, Users, ArrowRight, Sparkles } from 'lucide-react';
import { listDrafts, type ContractDraft } from '../../lib/drafts';
import { getUser } from '../../lib/auth';
import { previewCommission, formatCzk } from '../../domain/calculator';

export function PortalDashboardPage() {
  const user = getUser();
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const data = await listDrafts({ source: 'distributor', createdBy: user?.email });
      if (!cancelled) setDrafts(data);
    };
    refresh();
    window.addEventListener('lexia-drafts-change', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('lexia-drafts-change', refresh);
    };
  }, [user?.email]);

  const totalYearly = drafts.reduce((s, d) => s + d.result.yearly, 0);
  const totalCommission1 = drafts.reduce((s, d) => s + (previewCommission(d.result.yearly, 1).ziskatelska ?? 0), 0);

  return (
    <div className="container mx-auto px-6 lg:px-12 py-8">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Vítejte zpět</div>
          <h1 className="text-3xl tracking-tight">{user?.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/portal/kalkulacka"
            className="px-4 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center gap-2 hover:shadow-lg"
          >
            <Calculator className="w-4 h-4" /> Nová kalkulace
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={FileText} label="Návrhy v portfoliu" value={drafts.length.toString()} hint="Sjednávání rozpracovaná" />
        <KpiCard icon={TrendingUp} label="Roční pojistné" value={formatCzk(totalYearly)} hint="Suma návrhů" />
        <KpiCard icon={Wallet} label="Potenciál získatelská" value={formatCzk(totalCommission1)} hint="Model 1 (45 %)" />
        <KpiCard icon={Users} label="Klienti" value="—" hint="Po přiřazení smluv" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Nedávné návrhy</h2>
            <Link to="/portal/sjednani" className="text-sm text-[#0045BF] hover:underline flex items-center gap-1">
              Vše <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#0045BF]/40" />
              <p className="mb-3">Zatím žádné návrhy.</p>
              <Link
                to="/portal/kalkulacka"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0045BF]/10 text-[#0045BF] rounded-lg text-sm"
              >
                Spustit kalkulačku <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.slice(0, 6).map((d) => (
                <Link
                  key={d.id}
                  to={`/portal/sjednani`}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-[#0045BF]/30 transition-all"
                >
                  <div>
                    <div className="text-sm font-medium">{d.clientName ?? 'Bez klienta'} · {d.input.productCode}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(d.createdAt).toLocaleString('cs-CZ')} · {d.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm tabular-nums">{formatCzk(d.result.monthly)}/měs</div>
                    <div className="text-xs text-muted-foreground">{formatCzk(d.result.yearly)}/rok</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[#001843] to-[#0045BF] text-white rounded-2xl p-6 space-y-4">
          <h2 className="text-lg">Provizní modely</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-white/70 uppercase text-xs tracking-wide">Model 1</div>
              <div>Získatelská 45 % + následná 10 %</div>
            </div>
            <div>
              <div className="text-white/70 uppercase text-xs tracking-wide">Model 2</div>
              <div>Průběžná 23 % z přijatého pojistného</div>
            </div>
            <div>
              <div className="text-white/70 uppercase text-xs tracking-wide">Startovací</div>
              <div>30 / 20 / 10 % v 1.–3. měsíci po podpisu</div>
            </div>
          </div>
          <Link to="/partnerstvi" className="inline-flex items-center gap-2 text-sm text-white hover:underline">
            Detail systému provizí <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, hint,
}: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-[#0045BF]" strokeWidth={1.75} />
      </div>
      <div className="text-2xl tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
