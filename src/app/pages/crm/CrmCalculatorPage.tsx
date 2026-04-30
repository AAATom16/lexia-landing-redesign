import { useEffect, useState } from 'react';
import { Calculator, Wallet, Save, Trash2, Check, ExternalLink } from 'lucide-react';
import { CalculatorWidget } from '../../components/calculator/CalculatorWidget';
import { previewCommission, formatCzk } from '../../domain/calculator';
import { getProduct } from '../../domain/products';
import type { CalculationResult, CalculatorInput, CommissionModel } from '../../domain/types';
import { saveDraft, listDrafts, deleteDraft, type ContractDraft } from '../../lib/drafts';
import { getUser } from '../../lib/auth';

export function CrmCalculatorPage() {
  const user = getUser();
  const [snapshot, setSnapshot] = useState<{ result: CalculationResult; input: CalculatorInput } | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [model, setModel] = useState<CommissionModel>(1);
  const [includeStartup, setIncludeStartup] = useState(true);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);

  useEffect(() => {
    const refresh = () => setDrafts(listDrafts());
    refresh();
    window.addEventListener('lexia-drafts-change', refresh);
    return () => window.removeEventListener('lexia-drafts-change', refresh);
  }, []);

  const commission = snapshot ? previewCommission(snapshot.result.yearly, model, includeStartup) : null;

  function handleSave(status: ContractDraft['status']) {
    if (!snapshot || !user) return;
    const d = saveDraft({
      createdBy: user.email,
      source: 'crm',
      status,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
      input: snapshot.input,
      result: snapshot.result,
      commissionModel: model,
    });
    setSavedToast(`Uloženo jako ${status} (${d.id})`);
    setTimeout(() => setSavedToast(null), 4000);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl tracking-tight flex items-center gap-2">
            <Calculator className="w-7 h-7 text-[#0045BF]" /> Interní kalkulačka
          </h1>
          <p className="text-muted-foreground">Sjednávání pro klienty, výpočet pojistného, náhled provize, uložení návrhu.</p>
        </div>
      </div>

      <CalculatorWidget
        variant="distributor"
        onCalculation={(result, input) => setSnapshot({ result, input })}
      />

      {snapshot && snapshot.result.monthly > 0 && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="text-lg mb-4">Klient & uložení</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Jméno klienta</span>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Email</span>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSave('Návrh')}
                className="px-4 py-2.5 bg-[#0045BF]/10 text-[#0045BF] rounded-xl flex items-center gap-2 hover:bg-[#0045BF]/15"
              >
                <Save className="w-4 h-4" /> Uložit návrh
              </button>
              <button
                onClick={() => handleSave('Odesláno klientovi')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center gap-2 hover:shadow-lg"
              >
                <ExternalLink className="w-4 h-4" /> Uložit + Odeslat klientovi
              </button>
            </div>
            {savedToast && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-center gap-2">
                <Check className="w-4 h-4" /> {savedToast}
              </div>
            )}
          </div>

          {commission && (
            <div className="bg-gradient-to-br from-[#001843] to-[#0045BF] text-white rounded-2xl p-6">
              <h2 className="text-lg mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Náhled provize
              </h2>
              <div className="inline-flex p-1 rounded-xl bg-white/10 mb-4">
                {[1, 2].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m as CommissionModel)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      model === m ? 'bg-white text-[#0045BF]' : 'text-white/80'
                    }`}
                  >
                    Model {m}
                  </button>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Roční pojistné</span><span className="tabular-nums">{formatCzk(commission.yearlyPremium)}</span></div>
                {commission.model === 1 ? (
                  <>
                    <div className="flex justify-between"><span className="text-white/70">Získatelská 45 %</span><span className="tabular-nums">{formatCzk(commission.ziskatelska ?? 0)}</span></div>
                    <div className="flex justify-between"><span className="text-white/70">Následná 10 %</span><span className="tabular-nums">{formatCzk(commission.nasledna ?? 0)}</span></div>
                    <label className="flex items-center gap-2 mt-3 text-xs">
                      <input type="checkbox" checked={includeStartup} onChange={(e) => setIncludeStartup(e.target.checked)} className="accent-white" />
                      <span>Včetně startovací provize</span>
                    </label>
                    {includeStartup && commission.startup && (
                      <div className="mt-2 pt-2 border-t border-white/15 space-y-1 text-xs">
                        <div className="flex justify-between"><span className="text-white/70">M1 (30 %)</span><span className="tabular-nums">{formatCzk(commission.startup.month1)}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">M2 (20 %)</span><span className="tabular-nums">{formatCzk(commission.startup.month2)}</span></div>
                        <div className="flex justify-between"><span className="text-white/70">M3 (10 %)</span><span className="tabular-nums">{formatCzk(commission.startup.month3)}</span></div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between"><span className="text-white/70">Průběžná 23 %</span><span className="tabular-nums">{formatCzk(commission.prubezna ?? 0)}</span></div>
                )}
              </div>
              <div className="mt-4 text-xs text-white/60">
                Indikativní výpočet při výchozích procentech schématu.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="text-lg">Všechny návrhy ({drafts.length})</h2>
        </div>
        {drafts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Zatím žádné návrhy. Uložené návrhy se zobrazí zde.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#F7F9FC]">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Vytvořeno</th>
                <th className="px-4 py-3">Zdroj</th>
                <th className="px-4 py-3">Klient</th>
                <th className="px-4 py-3">Produkt</th>
                <th className="px-4 py-3 text-right">Měs.</th>
                <th className="px-4 py-3 text-right">Roč.</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-[#F7F9FC]/50">
                  <td className="px-4 py-3 text-sm">{new Date(d.createdAt).toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      d.source === 'crm' ? 'bg-blue-50 text-blue-700' :
                      d.source === 'distributor' ? 'bg-purple-50 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{d.source}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{d.clientName ?? '—'}</td>
                  <td className="px-4 py-3 text-sm">{getProduct(d.input.productCode)?.shortName}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">{formatCzk(d.result.monthly)}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">{formatCzk(d.result.yearly)}</td>
                  <td className="px-4 py-3 text-sm">{d.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm('Smazat?')) deleteDraft(d.id); }}
                      className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
