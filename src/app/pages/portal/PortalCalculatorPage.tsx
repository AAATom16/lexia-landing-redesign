import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileSignature, Wallet, Check } from 'lucide-react';
import { CalculatorWidget } from '../../components/calculator/CalculatorWidget';
import { previewCommission, formatCzk } from '../../domain/calculator';
import type { CalculationResult, CalculatorInput, CommissionModel } from '../../domain/types';
import { saveDraft } from '../../lib/drafts';
import { getUser } from '../../lib/auth';

export function PortalCalculatorPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [snapshot, setSnapshot] = useState<{ result: CalculationResult; input: CalculatorInput } | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [commissionModel, setCommissionModel] = useState<CommissionModel>(1);
  const [savedId, setSavedId] = useState<string | null>(null);

  const commission = snapshot ? previewCommission(snapshot.result.yearly, commissionModel, true) : null;

  async function handleSave() {
    if (!snapshot || !user) return;
    const draft = await saveDraft({
      createdBy: user.email,
      source: 'distributor',
      status: 'Návrh',
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
      input: snapshot.input,
      result: snapshot.result,
      commissionModel,
    });
    setSavedId(draft.id);
  }

  async function handleSendToClient() {
    if (!snapshot || !user) return;
    await saveDraft({
      createdBy: user.email,
      source: 'distributor',
      status: 'Odesláno klientovi',
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
      input: snapshot.input,
      result: snapshot.result,
      commissionModel,
    });
    navigate('/portal/sjednani');
  }

  return (
    <div className="container mx-auto px-6 lg:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight">Kalkulačka pojistného</h1>
        <p className="text-muted-foreground">Sestavte návrh smlouvy. Cena se počítá živě dle tarifů 2026/04.</p>
      </div>

      <CalculatorWidget
        variant="distributor"
        onCalculation={(result, input) => setSnapshot({ result, input })}
      />

      {snapshot && snapshot.result.monthly > 0 && (
        <div className="mt-8 grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-[#0045BF]" /> Údaje klienta a uložení návrhu
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <label className="block text-sm">
                <span className="text-muted-foreground">Jméno klienta</span>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                  placeholder="např. Jan Novák"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Email klienta</span>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                  placeholder="email@klient.cz"
                />
              </label>
            </div>
            <div className="mb-4">
              <span className="text-sm text-muted-foreground block mb-2">Provizní model</span>
              <div className="inline-flex p-1 rounded-xl bg-[#F7F9FC] border border-border">
                {[1, 2].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCommissionModel(m as CommissionModel)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      commissionModel === m ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'
                    }`}
                  >
                    Model {m} {m === 1 ? '(získatelská)' : '(průběžná)'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-[#0045BF]/10 text-[#0045BF] rounded-xl flex items-center gap-2 hover:bg-[#0045BF]/15"
              >
                <Save className="w-4 h-4" /> Uložit jako návrh
              </button>
              <button
                onClick={handleSendToClient}
                className="px-4 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center gap-2 hover:shadow-lg"
              >
                <FileSignature className="w-4 h-4" /> Odeslat ke klientovi
              </button>
            </div>
            {savedId && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-center gap-2">
                <Check className="w-4 h-4" /> Návrh uložen ({savedId}). Najdete jej v sekci Sjednání.
              </div>
            )}
          </div>

          {commission && (
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#008EA5]" /> Náhled provize
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roční pojistné</span>
                  <span className="tabular-nums">{formatCzk(commission.yearlyPremium)}</span>
                </div>
                {commission.model === 1 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Získatelská (45 %)</span>
                      <span className="tabular-nums text-[#0045BF]">{formatCzk(commission.ziskatelska ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Následná z roční (10 %)</span>
                      <span className="tabular-nums">{formatCzk(commission.nasledna ?? 0)}</span>
                    </div>
                    {commission.startup && (
                      <>
                        <div className="border-t border-border my-2 pt-2 text-xs uppercase text-muted-foreground">Startovací (1.–3. měsíc)</div>
                        <div className="flex justify-between text-xs">
                          <span>Měsíc 1 (30 %)</span>
                          <span className="tabular-nums">{formatCzk(commission.startup.month1)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Měsíc 2 (20 %)</span>
                          <span className="tabular-nums">{formatCzk(commission.startup.month2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Měsíc 3 (10 %)</span>
                          <span className="tabular-nums">{formatCzk(commission.startup.month3)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Průběžná (23 %)</span>
                    <span className="tabular-nums text-[#0045BF]">{formatCzk(commission.prubezna ?? 0)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Indikativní výpočet při výchozích procentech. Skutečná provize dle přiřazeného schématu.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
