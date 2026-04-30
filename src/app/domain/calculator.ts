import { getPillar, getProduct } from './products';
import {
  EXTRA_BUILDING_PLOT_PER_SQM,
  EXTRA_LAND_PLOT_PER_SQM,
  MANAGER_MIN_YEARLY,
  MANAGER_RATE,
  calculatePremises,
  driverTariffs,
  individualTariffs,
  lookupBusinessBase,
  lookupBusinessEmployment,
  lookupContractDispute,
  lookupVolumeDiscount,
  vehicleTariffs,
} from './tariffs';
import type {
  CalculationResult,
  CalculatorInput,
  CommissionModel,
  CommissionPreview,
  LineItem,
  PillarCode,
} from './types';

export function calculatePremium(input: CalculatorInput): CalculationResult {
  const product = getProduct(input.productCode);
  const lineItems: LineItem[] = [];
  const warnings: string[] = [];

  if (!product) {
    return {
      productCode: input.productCode,
      monthly: 0,
      yearly: 0,
      lineItems: [],
      warnings: [`Neznámý produkt: ${input.productCode}`],
    };
  }

  const mandatory = product.pillars.find((c) => getPillar(c)?.isMandatory);
  if (mandatory && !input.pillars.includes(mandatory)) {
    warnings.push('Pilíř I je povinný — bez něj nelze sjednat smlouvu.');
  }

  if (input.productCode === 'INDIVIDUAL') {
    calculateIndividual(input, lineItems, warnings);
  } else if (input.productCode === 'BUSINESS') {
    calculateBusiness(input, lineItems, warnings);
  } else if (input.productCode === 'DRIVERS_VEHICLES') {
    calculateDriversVehicles(input, lineItems, warnings);
  }

  let monthly = lineItems.reduce((s, li) => s + li.monthly, 0);

  // Volume discount applies to vehicles + drivers section count
  let discount: CalculationResult['discount'];
  const totalVehicleCount =
    (input.vehicles?.reduce((s, v) => s + v.count, 0) ?? 0) + (input.drivers?.count ?? 0);
  if (totalVehicleCount > 5) {
    const pct = lookupVolumeDiscount(totalVehicleCount);
    if (pct > 0) {
      const vehicleSection = lineItems
        .filter((li) => li.label.startsWith('Vozidlo:') || li.label.startsWith('Řidiči'))
        .reduce((s, li) => s + li.monthly, 0);
      const amount = Math.round((vehicleSection * pct) / 100);
      monthly -= amount;
      discount = {
        pct,
        amount,
        reason: `Množstevní sleva ${pct} % na vozidla a řidiče (${totalVehicleCount} ks)`,
      };
    }
  }

  return {
    productCode: input.productCode,
    monthly: Math.max(0, monthly),
    yearly: Math.max(0, monthly * 12),
    lineItems,
    warnings,
    discount,
  };
}

function calculateIndividual(input: CalculatorInput, items: LineItem[], warnings: string[]) {
  const segment = input.segment ?? 'individual';
  for (const code of input.pillars) {
    const tariff = individualTariffs.find((t) => t.pillarCode === code && t.segment === segment);
    const pillar = getPillar(code);
    if (tariff && pillar) {
      items.push({ label: pillar.shortName, monthly: tariff.monthly });
    }
  }

  const housing = input.housing;
  if (housing && input.pillars.includes('IND_HOUSING')) {
    const extraProps = housing.extraProperties ?? 0;
    if (extraProps > 0) {
      const t = individualTariffs.find((x) => x.pillarCode === 'IND_HOUSING_2ND' && x.segment === segment);
      if (t) {
        items.push({
          label: `Další nemovitost (×${extraProps})`,
          monthly: t.monthly * extraProps,
        });
      }
    }
    if (housing.rental) {
      const t = individualTariffs.find((x) => x.pillarCode === 'IND_HOUSING_RENTAL' && x.segment === segment);
      if (t) items.push({ label: 'Pronajímaná nemovitost', monthly: t.monthly });
    }
    if (housing.construction) {
      const t = individualTariffs.find((x) => x.pillarCode === 'IND_HOUSING_CONSTRUCTION' && x.segment === segment);
      if (t) items.push({ label: 'Nemovitost ve výstavbě', monthly: t.monthly });
    }
    if (housing.extraBuildingPlotSqm && housing.extraBuildingPlotSqm > 0) {
      const monthly = Math.round(housing.extraBuildingPlotSqm * EXTRA_BUILDING_PLOT_PER_SQM);
      items.push({
        label: `Stavební parcela (${housing.extraBuildingPlotSqm} m²)`,
        monthly,
      });
    }
    if (housing.extraLandPlotSqm && housing.extraLandPlotSqm > 0) {
      const monthly = Math.round(housing.extraLandPlotSqm * EXTRA_LAND_PLOT_PER_SQM);
      items.push({
        label: `Pozemková parcela (${housing.extraLandPlotSqm} m²)`,
        monthly,
      });
    }
  }

  if (input.business?.managerSalary && input.pillars.includes('IND_EMPLOYMENT')) {
    const yearly = Math.max(input.business.managerSalary * MANAGER_RATE, MANAGER_MIN_YEARLY);
    const monthly = Math.round(yearly / 12);
    items.push({
      label: 'Manažerská právní ochrana',
      monthly,
      detail: `Min. ${MANAGER_MIN_YEARLY} Kč/rok`,
    });
  }

  // Vehicles + drivers in INDIVIDUAL product use BUSINESS-tier price (in-business column)
  applyVehicles(input, items, false);
  applyDrivers(input, items, false);

  warnPillarDeps(input.pillars, warnings);
}

function calculateBusiness(input: CalculatorInput, items: LineItem[], warnings: string[]) {
  const biz = input.business;
  if (!biz) {
    warnings.push('Pro produkt Podnikatelé je potřeba zadat obrat a zaměstnance.');
    return;
  }

  if (input.pillars.includes('BIZ_BASIC')) {
    const monthly = lookupBusinessBase(biz.revenueMillions, biz.employees);
    if (monthly === 0) {
      warnings.push('Obrat > 500 mil. Kč nebo > 500 zaměstnanců → individuální úpis.');
    } else {
      items.push({
        label: 'Základní právní ochrana',
        monthly,
        detail: `Obrat ${biz.revenueMillions} mil. Kč, ${biz.employees} zam.`,
      });
    }
  }

  if (input.pillars.includes('BIZ_EMPLOYMENT')) {
    const monthly = lookupBusinessEmployment(biz.employees);
    if (monthly === 0 && biz.employees > 500) {
      warnings.push('Pracovněprávní spory > 500 zam. → individuální úpis.');
    } else if (monthly > 0) {
      items.push({ label: 'Pracovněprávní spory', monthly });
    }
  }

  if (input.pillars.includes('BIZ_PREMISES') && biz.premises) {
    const monthly = calculatePremises(
      biz.premises.buildingSqm,
      biz.premises.buildingPlotSqm,
      biz.premises.landPlotSqm,
    );
    if (monthly > 0) {
      items.push({ label: 'Komerční prostory', monthly });
    }
  }

  if (input.pillars.includes('BIZ_CONTRACT_DISPUTES') && biz.contractDisputes) {
    const monthly = lookupContractDispute(biz.contractDisputes.count, biz.contractDisputes.maxAmount);
    if (monthly > 0) {
      items.push({
        label: 'Smluvní spory',
        monthly,
        detail: `${biz.contractDisputes.count} sporů × ${formatCzk(biz.contractDisputes.maxAmount)}`,
      });
    }
  }

  applyVehicles(input, items, false);
  applyDrivers(input, items, false);

  warnPillarDeps(input.pillars, warnings);
}

function calculateDriversVehicles(input: CalculatorInput, items: LineItem[], _warnings: string[]) {
  applyVehicles(input, items, true);
  applyDrivers(input, items, true);
}

function applyVehicles(input: CalculatorInput, items: LineItem[], standalone: boolean) {
  if (!input.vehicles?.length) return;
  const variant = input.vehicleVariant ?? 1;
  for (const v of input.vehicles) {
    if (v.count <= 0) continue;
    const t = vehicleTariffs.find((x) => x.vehicleType === v.type && x.variant === variant);
    if (!t) continue;
    const per = standalone ? t.monthlyStandalone : t.monthlyInBusiness;
    items.push({
      label: `Vozidlo: ${t.label}${v.count > 1 ? ` (×${v.count})` : ''}`,
      monthly: per * v.count,
      detail: `Varianta ${variant}, ${per} Kč/ks`,
    });
  }
}

function applyDrivers(input: CalculatorInput, items: LineItem[], standalone: boolean) {
  if (!input.drivers || input.drivers.count <= 0) return;
  const variant = input.driverVariant ?? 1;
  const t = driverTariffs.find((x) => x.variant === variant);
  if (!t) return;
  const per = standalone ? t.monthlyStandalone : t.monthlyInBusiness;
  items.push({
    label: `Řidiči (×${input.drivers.count})`,
    monthly: per * input.drivers.count,
    detail: `Varianta ${variant}, ${per} Kč/ks`,
  });
}

function warnPillarDeps(selected: PillarCode[], warnings: string[]) {
  for (const code of selected) {
    const p = getPillar(code);
    if (p?.requiresPillar && !selected.includes(p.requiresPillar)) {
      const req = getPillar(p.requiresPillar);
      warnings.push(`${p.shortName} vyžaduje pilíř ${req?.shortName ?? p.requiresPillar}.`);
    }
  }
}

export function formatCzk(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---- Commission preview ----

const DEFAULT_COMMISSION_PERCENTS = {
  ziskatelska: 45, // % z 1. ročního pojistného
  nasledna: 10, // % z každé následné splátky
  prubezna: 23, // % z přijatého pojistného
  startup: [30, 20, 10] as [number, number, number],
};

export function previewCommission(yearlyPremium: number, model: CommissionModel, includeStartup = false): CommissionPreview {
  if (model === 1) {
    const ziskatelska = Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.ziskatelska) / 100);
    const nasledna = Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.nasledna) / 100);
    return {
      model,
      yearlyPremium,
      ziskatelska,
      nasledna,
      startup: includeStartup
        ? {
            month1: Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.startup[0]) / 100),
            month2: Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.startup[1]) / 100),
            month3: Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.startup[2]) / 100),
          }
        : undefined,
    };
  }
  return {
    model: 2,
    yearlyPremium,
    prubezna: Math.round((yearlyPremium * DEFAULT_COMMISSION_PERCENTS.prubezna) / 100),
  };
}
