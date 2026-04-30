import type {
  BusinessBaseTariff,
  BusinessEmploymentTariff,
  ContractDisputeTariff,
  DriverTariff,
  IndividualPillarTariff,
  VehicleTariff,
  VolumeDiscountStep,
} from './types';

// Source: Lexia_tarify_pojistneho_202604.pdf (verze 2026/04)

export const individualTariffs: IndividualPillarTariff[] = [
  { pillarCode: 'IND_BASIC', segment: 'individual', monthly: 179, yearly: 2148 },
  { pillarCode: 'IND_BASIC', segment: 'household', monthly: 269, yearly: 3228 },
  { pillarCode: 'IND_HOUSING', segment: 'individual', monthly: 139, yearly: 1668 },
  { pillarCode: 'IND_HOUSING', segment: 'household', monthly: 159, yearly: 1908 },
  { pillarCode: 'IND_HOUSING_2ND', segment: 'individual', monthly: 79, yearly: 948 },
  { pillarCode: 'IND_HOUSING_2ND', segment: 'household', monthly: 89, yearly: 1068 },
  { pillarCode: 'IND_HOUSING_RENTAL', segment: 'individual', monthly: 179, yearly: 2148 },
  { pillarCode: 'IND_HOUSING_RENTAL', segment: 'household', monthly: 179, yearly: 2148 },
  { pillarCode: 'IND_HOUSING_CONSTRUCTION', segment: 'individual', monthly: 819, yearly: 9828 },
  { pillarCode: 'IND_HOUSING_CONSTRUCTION', segment: 'household', monthly: 819, yearly: 9828 },
  { pillarCode: 'IND_EMPLOYMENT', segment: 'individual', monthly: 79, yearly: 948 },
  { pillarCode: 'IND_EMPLOYMENT', segment: 'household', monthly: 99, yearly: 1188 },
  { pillarCode: 'IND_VEHICLES', segment: 'individual', monthly: 79, yearly: 948 },
  { pillarCode: 'IND_VEHICLES', segment: 'household', monthly: 99, yearly: 1188 },
  { pillarCode: 'IND_DRIVERS', segment: 'individual', monthly: 59, yearly: 708 },
  { pillarCode: 'IND_DRIVERS', segment: 'household', monthly: 79, yearly: 948 },
];

// Manager's legal protection (individual product, additional coverage):
// roční pojistné = 0.0025 z roční odměny, min. 4 788 Kč
export const MANAGER_RATE = 0.0025;
export const MANAGER_MIN_YEARLY = 4788;

// Extra parcel rates (Kč/m² monthly)
export const EXTRA_BUILDING_PLOT_PER_SQM = 0.04;
export const EXTRA_LAND_PLOT_PER_SQM = 0.02;

// Business — Pillar I (revenue × employees) — měsíční pojistné Kč
// columns = revenueMaxMillions, rows = employeeMax
const BIZ_REV_BUCKETS = [2.5, 5, 10, 25, 50, 100, 250, 500];
const BIZ_EMP_BUCKETS: { max: number }[] = [
  { max: 0 }, { max: 5 }, { max: 10 }, { max: 20 }, { max: 50 },
  { max: 100 }, { max: 150 }, { max: 200 }, { max: 250 }, { max: 300 },
  { max: 350 }, { max: 400 }, { max: 450 }, { max: 500 },
];
const BIZ_BASIC_MATRIX: number[][] = [
  [399, 499, 599, 698, 798, 898, 994, 1097],
  [499, 619, 744, 868, 993, 1118, 1238, 1367],
  [599, 737, 887, 1036, 1186, 1336, 1480, 1635],
  [798, 974, 1173, 1373, 1572, 1772, 1963, 2171],
  [1197, 1448, 1748, 2047, 2346, 2645, 2933, 3244],
  [1995, 2394, 2893, 3392, 3890, 4389, 4868, 5387],
  [2394, 2849, 3447, 4046, 4644, 5243, 5817, 6440],
  [2793, 3296, 3994, 4692, 5391, 6089, 6759, 7485],
  [3192, 3735, 4533, 5331, 6129, 6927, 7693, 8523],
  [3591, 4166, 5063, 5961, 6859, 7757, 8618, 9552],
  [3990, 4589, 5586, 6584, 7581, 8579, 9536, 10574],
  [4389, 5004, 6101, 7198, 8295, 9393, 10446, 11587],
  [4788, 5410, 6607, 7804, 9001, 10198, 11348, 12592],
  [5187, 5861, 7106, 8403, 9700, 10996, 12241, 13590],
];

export const businessBaseTariffs: BusinessBaseTariff[] = (() => {
  const out: BusinessBaseTariff[] = [];
  BIZ_EMP_BUCKETS.forEach((emp, ei) => {
    BIZ_REV_BUCKETS.forEach((rev, ri) => {
      out.push({
        revenueRangeMaxMillions: rev,
        employeeRangeMax: emp.max,
        monthly: BIZ_BASIC_MATRIX[ei][ri],
      });
    });
  });
  return out;
})();

export function lookupBusinessBase(revenueMillions: number, employees: number): number {
  if (revenueMillions > 500 || employees > 500) return 0; // individuální úpis
  const ri = BIZ_REV_BUCKETS.findIndex((r) => revenueMillions <= r);
  const ei = BIZ_EMP_BUCKETS.findIndex((e) => employees <= e.max);
  const rIdx = ri === -1 ? BIZ_REV_BUCKETS.length - 1 : ri;
  const eIdx = ei === -1 ? BIZ_EMP_BUCKETS.length - 1 : ei;
  return BIZ_BASIC_MATRIX[eIdx][rIdx];
}

// Business — Pillar II — pracovněprávní spory (per employees)
export const businessEmploymentTariffs: BusinessEmploymentTariff[] = [
  { employeeRangeMax: 0, monthly: 0 },
  { employeeRangeMax: 5, monthly: 42 },
  { employeeRangeMax: 10, monthly: 125 },
  { employeeRangeMax: 20, monthly: 250 },
  { employeeRangeMax: 50, monthly: 583 },
  { employeeRangeMax: 100, monthly: 1250 },
  { employeeRangeMax: 150, monthly: 2083 },
  { employeeRangeMax: 200, monthly: 2917 },
  { employeeRangeMax: 250, monthly: 3750 },
  { employeeRangeMax: 300, monthly: 4583 },
  { employeeRangeMax: 350, monthly: 5417 },
  { employeeRangeMax: 400, monthly: 6250 },
  { employeeRangeMax: 450, monthly: 7083 },
  { employeeRangeMax: 500, monthly: 7917 },
];

export function lookupBusinessEmployment(employees: number): number {
  if (employees > 500) return 0;
  const found = businessEmploymentTariffs.find((t) => employees <= t.employeeRangeMax);
  return found ? found.monthly : 0;
}

// Business — Pillar III — komerční prostory
export const PREMISES_BUILDING_BASE = 119; // do 250 m²
export const PREMISES_BUILDING_PER_100 = 49;
export const PREMISES_BUILDING_BASE_SQM = 250;

export const PREMISES_BUILD_PLOT_BASE = 99; // do 5000 m²
export const PREMISES_BUILD_PLOT_PER_2500 = 39;
export const PREMISES_BUILD_PLOT_BASE_SQM = 5000;

export const PREMISES_LAND_PLOT_BASE = 119; // do 10000 m²
export const PREMISES_LAND_PLOT_PER_10K = 59;
export const PREMISES_LAND_PLOT_BASE_SQM = 10000;

export function calculatePremises(
  buildingSqm: number,
  buildingPlotSqm: number,
  landPlotSqm: number,
): number {
  let total = 0;
  if (buildingSqm > 0) {
    total += PREMISES_BUILDING_BASE;
    if (buildingSqm > PREMISES_BUILDING_BASE_SQM) {
      const extra = Math.ceil((buildingSqm - PREMISES_BUILDING_BASE_SQM) / 100);
      total += extra * PREMISES_BUILDING_PER_100;
    }
  }
  if (buildingPlotSqm > 0) {
    total += PREMISES_BUILD_PLOT_BASE;
    if (buildingPlotSqm > PREMISES_BUILD_PLOT_BASE_SQM) {
      const extra = Math.ceil((buildingPlotSqm - PREMISES_BUILD_PLOT_BASE_SQM) / 2500);
      total += extra * PREMISES_BUILD_PLOT_PER_2500;
    }
  }
  if (landPlotSqm > 0) {
    total += PREMISES_LAND_PLOT_BASE;
    if (landPlotSqm > PREMISES_LAND_PLOT_BASE_SQM) {
      const extra = Math.ceil((landPlotSqm - PREMISES_LAND_PLOT_BASE_SQM) / 10000);
      total += extra * PREMISES_LAND_PLOT_PER_10K;
    }
  }
  return total;
}

// Business — Pillar IV — smluvní spory
export const contractDisputeTariffs: ContractDisputeTariff[] = [
  { disputeCount: 1, maxAmount: 100000, monthly: 249 },
  { disputeCount: 5, maxAmount: 100000, monthly: 499 },
  { disputeCount: 10, maxAmount: 100000, monthly: 749 },
  { disputeCount: 1, maxAmount: 250000, monthly: 669 },
  { disputeCount: 5, maxAmount: 250000, monthly: 1169 },
  { disputeCount: 10, maxAmount: 250000, monthly: 1749 },
  { disputeCount: 1, maxAmount: 500000, monthly: 999 },
  { disputeCount: 5, maxAmount: 500000, monthly: 1749 },
  { disputeCount: 10, maxAmount: 500000, monthly: 2629 },
  { disputeCount: 1, maxAmount: 1000000, monthly: 1499 },
  { disputeCount: 5, maxAmount: 1000000, monthly: 2629 },
  { disputeCount: 10, maxAmount: 1000000, monthly: 3639 },
  { disputeCount: 1, maxAmount: 2500000, monthly: 2249 },
  { disputeCount: 5, maxAmount: 2500000, monthly: 3939 },
  { disputeCount: 10, maxAmount: 2500000, monthly: 5909 },
  { disputeCount: 1, maxAmount: 5000000, monthly: 3359 },
  { disputeCount: 5, maxAmount: 5000000, monthly: 5909 },
  { disputeCount: 10, maxAmount: 5000000, monthly: 8859 },
];

export function lookupContractDispute(count: 1 | 5 | 10, maxAmount: number): number {
  const t = contractDisputeTariffs.find((x) => x.disputeCount === count && x.maxAmount === maxAmount);
  return t ? t.monthly : 0;
}

// Vehicles + drivers
export const vehicleTariffs: VehicleTariff[] = [
  { vehicleType: 'car_under_3_5t', variant: 1, monthlyInBusiness: 149, monthlyStandalone: 159, label: 'Osobní vozidlo do 3,5 t' },
  { vehicleType: 'car_under_3_5t', variant: 2, monthlyInBusiness: 129, monthlyStandalone: 139, label: 'Osobní vozidlo do 3,5 t' },
  { vehicleType: 'truck_under_3_5t', variant: 1, monthlyInBusiness: 169, monthlyStandalone: 179, label: 'Nákladní vozidlo do 3,5 t' },
  { vehicleType: 'truck_under_3_5t', variant: 2, monthlyInBusiness: 149, monthlyStandalone: 159, label: 'Nákladní vozidlo do 3,5 t' },
  { vehicleType: 'truck_over_3_5t', variant: 1, monthlyInBusiness: 239, monthlyStandalone: 249, label: 'Nákladní vozidlo nad 3,5 t' },
  { vehicleType: 'truck_over_3_5t', variant: 2, monthlyInBusiness: 209, monthlyStandalone: 219, label: 'Nákladní vozidlo nad 3,5 t' },
  { vehicleType: 'bus', variant: 1, monthlyInBusiness: 259, monthlyStandalone: 269, label: 'Autobus' },
  { vehicleType: 'bus', variant: 2, monthlyInBusiness: 229, monthlyStandalone: 239, label: 'Autobus' },
  { vehicleType: 'motorcycle', variant: 1, monthlyInBusiness: 79, monthlyStandalone: 89, label: 'Motocykl, tříkolka, čtyřkolka' },
  { vehicleType: 'motorcycle', variant: 2, monthlyInBusiness: 69, monthlyStandalone: 79, label: 'Motocykl, tříkolka, čtyřkolka' },
  { vehicleType: 'tractor', variant: 1, monthlyInBusiness: 89, monthlyStandalone: 99, label: 'Traktory a ostatní stroje' },
  { vehicleType: 'tractor', variant: 2, monthlyInBusiness: 79, monthlyStandalone: 89, label: 'Traktory a ostatní stroje' },
  { vehicleType: 'trailer_under_750', variant: 1, monthlyInBusiness: 49, monthlyStandalone: 59, label: 'Přípojné vozidlo do 750 kg' },
  { vehicleType: 'trailer_under_750', variant: 2, monthlyInBusiness: 39, monthlyStandalone: 49, label: 'Přípojné vozidlo do 750 kg' },
  { vehicleType: 'trailer_over_750', variant: 1, monthlyInBusiness: 119, monthlyStandalone: 129, label: 'Přípojné vozidlo nad 750 kg' },
  { vehicleType: 'trailer_over_750', variant: 2, monthlyInBusiness: 109, monthlyStandalone: 119, label: 'Přípojné vozidlo nad 750 kg' },
];

export const driverTariffs: DriverTariff[] = [
  { variant: 1, monthlyInBusiness: 119, monthlyStandalone: 129 },
  { variant: 2, monthlyInBusiness: 109, monthlyStandalone: 119 },
];

export const vehicleVolumeDiscount: VolumeDiscountStep[] = [
  { countMax: 5, discountPct: 0 },
  { countMax: 10, discountPct: 4 },
  { countMax: 20, discountPct: 8 },
  { countMax: 50, discountPct: 12 },
  { countMax: 100, discountPct: 16 },
  { countMax: 150, discountPct: 20 },
  { countMax: 200, discountPct: 24 },
  { countMax: 250, discountPct: 28 },
  { countMax: 300, discountPct: 32 },
  { countMax: 350, discountPct: 36 },
  { countMax: 400, discountPct: 40 },
  { countMax: 450, discountPct: 44 },
  { countMax: 500, discountPct: 48 },
];

export function lookupVolumeDiscount(count: number): number {
  if (count > 500) return 48;
  const found = vehicleVolumeDiscount.find((s) => count <= s.countMax);
  return found ? found.discountPct : 0;
}
