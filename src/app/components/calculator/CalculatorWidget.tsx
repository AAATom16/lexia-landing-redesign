import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Calculator, Check, ShieldCheck } from 'lucide-react';
import { calculatePremium, formatCzk } from '../../domain/calculator';
import { getProductPillars, products } from '../../domain/products';
import type {
  CalculatorInput,
  PillarCode,
  ProductCode,
  Segment,
  Variant,
  VehicleType,
} from '../../domain/types';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'car_under_3_5t', label: 'Osobní do 3,5 t' },
  { value: 'truck_under_3_5t', label: 'Nákladní do 3,5 t' },
  { value: 'truck_over_3_5t', label: 'Nákladní nad 3,5 t' },
  { value: 'bus', label: 'Autobus' },
  { value: 'motorcycle', label: 'Motocykl/čtyřkolka' },
  { value: 'tractor', label: 'Traktor/stroj' },
  { value: 'trailer_under_750', label: 'Přívěs do 750 kg' },
  { value: 'trailer_over_750', label: 'Přívěs nad 750 kg' },
];

const REVENUE_OPTIONS = [
  { value: 2.5, label: 'do 2,5 mil. Kč' },
  { value: 5, label: '2,5–5 mil.' },
  { value: 10, label: '5–10 mil.' },
  { value: 25, label: '10–25 mil.' },
  { value: 50, label: '25–50 mil.' },
  { value: 100, label: '50–100 mil.' },
  { value: 250, label: '100–250 mil.' },
  { value: 500, label: '250–500 mil.' },
  { value: 999, label: 'nad 500 mil. (úpis)' },
];

const EMPLOYEE_OPTIONS = [
  { value: 0, label: '0 zaměstnanců' },
  { value: 5, label: '1–5' },
  { value: 10, label: '6–10' },
  { value: 20, label: '11–20' },
  { value: 50, label: '21–50' },
  { value: 100, label: '51–100' },
  { value: 200, label: '101–200' },
  { value: 350, label: '201–350' },
  { value: 500, label: '351–500' },
];

const DISPUTE_AMOUNTS = [
  { value: 100000, label: '100 000 Kč' },
  { value: 250000, label: '250 000 Kč' },
  { value: 500000, label: '500 000 Kč' },
  { value: 1000000, label: '1 mil. Kč' },
  { value: 2500000, label: '2,5 mil.' },
  { value: 5000000, label: '5 mil.' },
];

export type CalculatorWidgetProps = {
  variant?: 'public' | 'distributor';
  initialProduct?: ProductCode;
  onCalculation?: (result: ReturnType<typeof calculatePremium>, input: CalculatorInput) => void;
  ctaLabel?: string;
  onCta?: (result: ReturnType<typeof calculatePremium>, input: CalculatorInput) => void;
};

export function CalculatorWidget({
  variant = 'public',
  initialProduct = 'INDIVIDUAL',
  onCalculation,
  ctaLabel,
  onCta,
}: CalculatorWidgetProps) {
  const [productCode, setProductCode] = useState<ProductCode>(initialProduct);
  const [segment, setSegment] = useState<Segment>('individual');
  const [selectedPillars, setSelectedPillars] = useState<PillarCode[]>(() => {
    const productPillars = getProductPillars(initialProduct);
    return productPillars.filter((p) => p.isMandatory).map((p) => p.code);
  });
  const [revenueMillions, setRevenueMillions] = useState(2.5);
  const [employees, setEmployees] = useState(5);
  const [disputeCount, setDisputeCount] = useState<1 | 5 | 10>(1);
  const [disputeMax, setDisputeMax] = useState(100000);
  const [buildingSqm, setBuildingSqm] = useState(0);
  const [buildingPlotSqm, setBuildingPlotSqm] = useState(0);
  const [landPlotSqm, setLandPlotSqm] = useState(0);
  const [vehicleVariant, setVehicleVariant] = useState<Variant>(2);
  const [vehicles, setVehicles] = useState<{ type: VehicleType; count: number }[]>([]);
  const [driverVariant, setDriverVariant] = useState<Variant>(2);
  const [driverCount, setDriverCount] = useState(0);
  const [extraProperties, setExtraProperties] = useState(0);
  const [housingRental, setHousingRental] = useState(false);
  const [housingConstruction, setHousingConstruction] = useState(false);

  const productPillars = useMemo(() => getProductPillars(productCode), [productCode]);

  function handleProductChange(code: ProductCode) {
    setProductCode(code);
    const pp = getProductPillars(code);
    setSelectedPillars(pp.filter((p) => p.isMandatory).map((p) => p.code));
    setVehicles([]);
    setDriverCount(0);
  }

  function togglePillar(code: PillarCode) {
    const pillar = productPillars.find((p) => p.code === code);
    if (!pillar || pillar.isMandatory) return;
    setSelectedPillars((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function setVehicleCount(type: VehicleType, count: number) {
    setVehicles((prev) => {
      const others = prev.filter((v) => v.type !== type);
      if (count > 0) return [...others, { type, count }];
      return others;
    });
  }

  const input: CalculatorInput = useMemo(
    () => ({
      productCode,
      segment,
      pillars: selectedPillars,
      business:
        productCode === 'BUSINESS'
          ? {
              revenueMillions,
              employees,
              premises:
                selectedPillars.includes('BIZ_PREMISES')
                  ? { buildingSqm, buildingPlotSqm, landPlotSqm }
                  : undefined,
              contractDisputes: selectedPillars.includes('BIZ_CONTRACT_DISPUTES')
                ? { count: disputeCount, maxAmount: disputeMax }
                : undefined,
            }
          : undefined,
      housing:
        productCode === 'INDIVIDUAL' && selectedPillars.includes('IND_HOUSING')
          ? {
              extraProperties,
              rental: housingRental,
              construction: housingConstruction,
            }
          : undefined,
      vehicles: vehicles.length > 0 ? vehicles : undefined,
      vehicleVariant,
      drivers: driverCount > 0 ? { count: driverCount } : undefined,
      driverVariant,
    }),
    [productCode, segment, selectedPillars, revenueMillions, employees, buildingSqm, buildingPlotSqm, landPlotSqm, disputeCount, disputeMax, vehicles, vehicleVariant, driverCount, driverVariant, extraProperties, housingRental, housingConstruction],
  );

  const result = useMemo(() => calculatePremium(input), [input]);

  const callbackRef = useRef(onCalculation);
  callbackRef.current = onCalculation;
  useEffect(() => {
    callbackRef.current?.(result, input);
  }, [result, input]);

  const showVehiclesSection =
    selectedPillars.includes('IND_VEHICLES') ||
    selectedPillars.includes('BIZ_VEHICLES') ||
    selectedPillars.includes('DV_VEHICLES');
  const showDriversSection =
    selectedPillars.includes('IND_DRIVERS') ||
    selectedPillars.includes('BIZ_DRIVERS') ||
    selectedPillars.includes('DV_DRIVERS');

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
      <div className="bg-white border border-border rounded-2xl p-6 lg:p-8 space-y-6">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Produkt</div>
          <div className="grid sm:grid-cols-3 gap-2">
            {products.map((p) => (
              <button
                key={p.code}
                onClick={() => handleProductChange(p.code)}
                className={`px-4 py-3 rounded-xl text-sm text-left border transition-all ${
                  productCode === p.code
                    ? 'border-[#0045BF] bg-[#0045BF]/5 text-[#0045BF]'
                    : 'border-border hover:border-[#0045BF]/30'
                }`}
              >
                <div className="font-medium">{p.shortName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.audience}</div>
              </button>
            ))}
          </div>
        </div>

        {productCode === 'INDIVIDUAL' && (
          <div>
            <div className="text-sm text-muted-foreground mb-2">Segment</div>
            <div className="inline-flex p-1 rounded-xl bg-[#F7F9FC] border border-border">
              {(['individual', 'household'] as Segment[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSegment(s)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    segment === s ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'
                  }`}
                >
                  {s === 'individual' ? 'Jednotlivec' : 'Domácnost'}
                </button>
              ))}
            </div>
          </div>
        )}

        {productCode === 'BUSINESS' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Roční obrat</label>
              <select
                value={revenueMillions}
                onChange={(e) => setRevenueMillions(parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white"
              >
                {REVENUE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Počet zaměstnanců</label>
              <select
                value={employees}
                onChange={(e) => setEmployees(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white"
              >
                {EMPLOYEE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-muted-foreground mb-2">Pilíře</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {productPillars.map((pillar) => {
              const checked = selectedPillars.includes(pillar.code);
              const locked = pillar.isMandatory;
              return (
                <label
                  key={pillar.code}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    checked ? 'border-[#0045BF] bg-[#0045BF]/5' : 'border-border hover:border-[#0045BF]/30'
                  } ${locked ? 'cursor-default opacity-90' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    onChange={() => togglePillar(pillar.code)}
                    className="mt-1 accent-[#0045BF]"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {pillar.shortName}
                      {locked && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#0045BF]/10 text-[#0045BF]">povinný</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{pillar.description}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {productCode === 'INDIVIDUAL' && selectedPillars.includes('IND_HOUSING') && (
          <div className="border-t border-border pt-5">
            <div className="text-sm text-muted-foreground mb-3">Doplňky pilíře Bydlení</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">Další nemovitosti</span>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={extraProperties}
                  onChange={(e) => setExtraProperties(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={housingRental}
                  onChange={(e) => setHousingRental(e.target.checked)}
                  className="accent-[#0045BF]"
                />
                <span className="text-sm">Pronajímaná nemovitost</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={housingConstruction}
                  onChange={(e) => setHousingConstruction(e.target.checked)}
                  className="accent-[#0045BF]"
                />
                <span className="text-sm">Nemovitost ve výstavbě</span>
              </label>
            </div>
          </div>
        )}

        {productCode === 'BUSINESS' && selectedPillars.includes('BIZ_PREMISES') && (
          <div className="border-t border-border pt-5">
            <div className="text-sm text-muted-foreground mb-3">Komerční prostory</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">Stavba/jednotka (m²)</span>
                <input
                  type="number" min={0}
                  value={buildingSqm}
                  onChange={(e) => setBuildingSqm(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Stavební parcela (m²)</span>
                <input
                  type="number" min={0}
                  value={buildingPlotSqm}
                  onChange={(e) => setBuildingPlotSqm(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Pozemková parcela (m²)</span>
                <input
                  type="number" min={0}
                  value={landPlotSqm}
                  onChange={(e) => setLandPlotSqm(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border"
                />
              </label>
            </div>
          </div>
        )}

        {productCode === 'BUSINESS' && selectedPillars.includes('BIZ_CONTRACT_DISPUTES') && (
          <div className="border-t border-border pt-5">
            <div className="text-sm text-muted-foreground mb-3">Smluvní spory</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">Počet sporů / rok</span>
                <select
                  value={disputeCount}
                  onChange={(e) => setDisputeCount(parseInt(e.target.value, 10) as 1 | 5 | 10)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-white"
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Max. sporná částka</span>
                <select
                  value={disputeMax}
                  onChange={(e) => setDisputeMax(parseInt(e.target.value, 10))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-white"
                >
                  {DISPUTE_AMOUNTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {showVehiclesSection && (
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Vozidla</div>
              <div className="inline-flex p-1 rounded-lg bg-[#F7F9FC] border border-border">
                {[1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => setVehicleVariant(v as Variant)}
                    className={`px-3 py-1 text-xs rounded ${vehicleVariant === v ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'}`}
                  >
                    Varianta {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {VEHICLE_TYPES.map((vt) => {
                const current = vehicles.find((v) => v.type === vt.value)?.count ?? 0;
                return (
                  <label key={vt.value} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border">
                    <span className="text-sm">{vt.label}</span>
                    <input
                      type="number" min={0}
                      value={current}
                      onChange={(e) => setVehicleCount(vt.value, parseInt(e.target.value, 10) || 0)}
                      className="w-20 px-2 py-1 rounded border border-border text-right"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {showDriversSection && (
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">Řidiči</div>
              <div className="inline-flex p-1 rounded-lg bg-[#F7F9FC] border border-border">
                {[1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDriverVariant(v as Variant)}
                    className={`px-3 py-1 text-xs rounded ${driverVariant === v ? 'bg-white shadow-sm text-[#0045BF]' : 'text-muted-foreground'}`}
                  >
                    Varianta {v}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border">
              <span className="text-sm">Počet pojištěných řidičů</span>
              <input
                type="number" min={0}
                value={driverCount}
                onChange={(e) => setDriverCount(parseInt(e.target.value, 10) || 0)}
                className="w-20 px-2 py-1 rounded border border-border text-right"
              />
            </label>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-[#0045BF] to-[#001843] text-white rounded-2xl p-6 lg:p-8 sticky top-24 self-start">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm uppercase tracking-wide text-white/70">Výpočet</span>
        </div>

        <div className="text-4xl font-display tracking-tight">{formatCzk(result.monthly)}</div>
        <div className="text-sm text-white/70 mb-1">měsíčně</div>
        <div className="text-base">{formatCzk(result.yearly)} <span className="text-white/70 text-sm">/ rok</span></div>

        {result.discount && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 rounded-full text-xs">
            <ShieldCheck className="w-3 h-3" /> {result.discount.reason} (−{formatCzk(result.discount.amount)})
          </div>
        )}

        <div className="my-5 h-px bg-white/15" />

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {result.lineItems.length === 0 && (
            <div className="text-sm text-white/70">Vyberte pilíře a parametry.</div>
          )}
          {result.lineItems.map((li, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <div>{li.label}</div>
                {li.detail && <div className="text-xs text-white/60">{li.detail}</div>}
              </div>
              <div className="shrink-0 tabular-nums">{formatCzk(li.monthly)}</div>
            </div>
          ))}
        </div>

        {result.warnings.length > 0 && (
          <div className="mt-5 space-y-2">
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-yellow-200">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Check className="w-3 h-3" /> All-risk garance: porada 10k / zastoupení 50k
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Check className="w-3 h-3" /> Pojistitel Colonnade Insurance S.A.
          </div>
        </div>

        {ctaLabel && (
          <button
            onClick={() => onCta?.(result, input)}
            className="mt-6 w-full px-6 py-3.5 bg-white text-[#0045BF] rounded-xl hover:bg-white/95 transition-all font-medium"
          >
            {ctaLabel}
          </button>
        )}

        {variant === 'public' && !ctaLabel && (
          <div className="mt-5 text-xs text-white/60">
            Indikativní výpočet dle tarifů 2026/04. Závazná nabídka po sjednání.
          </div>
        )}
      </div>
    </div>
  );
}
