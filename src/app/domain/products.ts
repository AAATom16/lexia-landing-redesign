import type { Pillar, Product } from './types';

export const products: Product[] = [
  {
    code: 'INDIVIDUAL',
    name: 'Právní ochrana — Jednotlivci & domácnosti',
    shortName: 'Jednotlivci & domácnosti',
    description: 'Pojistné krytí pro běžný soukromý život jednotlivce nebo celé domácnosti.',
    audience: 'B2C, rodiny',
    pillars: [
      'IND_BASIC',
      'IND_HOUSING',
      'IND_EMPLOYMENT',
      'IND_VEHICLES',
      'IND_DRIVERS',
    ],
  },
  {
    code: 'BUSINESS',
    name: 'Právní ochrana — Podnikatelé & firmy',
    shortName: 'Podnikatelé & firmy',
    description: 'Komplexní právní ochrana pro OSVČ, malé firmy, korporace.',
    audience: 'B2B, OSVČ → korporáty',
    pillars: [
      'BIZ_BASIC',
      'BIZ_EMPLOYMENT',
      'BIZ_PREMISES',
      'BIZ_CONTRACT_DISPUTES',
      'BIZ_VEHICLES',
      'BIZ_DRIVERS',
    ],
  },
  {
    code: 'DRIVERS_VEHICLES',
    name: 'Právní ochrana — Řidiči & vozidla',
    shortName: 'Řidiči & vozidla',
    description: 'Samostatné pojištění pro vozidla a řidiče bez nutnosti dalších produktů.',
    audience: 'flotily, samostatné vozy',
    pillars: ['DV_VEHICLES', 'DV_DRIVERS'],
  },
];

export const pillars: Pillar[] = [
  {
    code: 'IND_BASIC',
    productCode: 'INDIVIDUAL',
    name: 'Pilíř I. — Základní právní ochrana',
    shortName: 'Základní právní ochrana',
    description: 'Základ pro běžný soukromý život. Obsahuje All-risk garanci. Povinný pro každou smlouvu.',
    isMandatory: true,
  },
  {
    code: 'IND_HOUSING',
    productCode: 'INDIVIDUAL',
    name: 'Pilíř II. — Právní ochrana bydlení',
    shortName: 'Bydlení',
    description: 'Právní ochrana pro nemovitost využívanou k bydlení nebo rekreaci.',
    isMandatory: false,
    requiresPillar: 'IND_BASIC',
  },
  {
    code: 'IND_EMPLOYMENT',
    productCode: 'INDIVIDUAL',
    name: 'Pilíř III. — Pracovněprávní ochrana',
    shortName: 'Pracovněprávní',
    description: 'Krytí sporů ze zaměstnaneckých vztahů.',
    isMandatory: false,
    requiresPillar: 'IND_BASIC',
  },
  {
    code: 'IND_VEHICLES',
    productCode: 'INDIVIDUAL',
    name: 'Pilíř IV. — Právní ochrana vozidel',
    shortName: 'Vozidla',
    description: 'Krytí pro vozidla, kde je třeba zvláštní povolení/průkaz.',
    isMandatory: false,
    requiresPillar: 'IND_BASIC',
  },
  {
    code: 'IND_DRIVERS',
    productCode: 'INDIVIDUAL',
    name: 'Pilíř V. — Právní ochrana řidičů',
    shortName: 'Řidiči',
    description: 'Krytí situací při řízení vozidel s povolením.',
    isMandatory: false,
    requiresPillar: 'IND_BASIC',
  },
  {
    code: 'BIZ_BASIC',
    productCode: 'BUSINESS',
    name: 'Pilíř I. — Základní právní ochrana',
    shortName: 'Základní právní ochrana',
    description: 'Základ podnikatelské činnosti. Obsahuje All-risk garanci, 1 smluvní spor do 100k. Povinný.',
    isMandatory: true,
  },
  {
    code: 'BIZ_EMPLOYMENT',
    productCode: 'BUSINESS',
    name: 'Pilíř II. — Pojištění pracovněprávních sporů',
    shortName: 'Pracovněprávní spory',
    description: 'Spory mezi pojištěným podnikatelem a zaměstnanci.',
    isMandatory: false,
    requiresPillar: 'BIZ_BASIC',
  },
  {
    code: 'BIZ_PREMISES',
    productCode: 'BUSINESS',
    name: 'Pilíř III. — Pojištění komerčních prostor',
    shortName: 'Komerční prostory',
    description: 'Stavby, jednotky, parcely využívané k podnikání. Včetně sporů s pronajímateli/nájemci.',
    isMandatory: false,
    requiresPillar: 'BIZ_BASIC',
  },
  {
    code: 'BIZ_CONTRACT_DISPUTES',
    productCode: 'BUSINESS',
    name: 'Pilíř IV. — Pojištění smluvních sporů',
    shortName: 'Smluvní spory',
    description: 'Krytí sporů ze smluv. Volba počtu sporů (1–10) a max. sporné částky.',
    isMandatory: false,
    requiresPillar: 'BIZ_BASIC',
  },
  {
    code: 'BIZ_VEHICLES',
    productCode: 'BUSINESS',
    name: 'Pilíř V. — Pojištění vozidel',
    shortName: 'Vozidla',
    description: 'Krytí vozidel firmy. Flotilové i jednotlivé pojištění.',
    isMandatory: false,
    requiresPillar: 'BIZ_BASIC',
  },
  {
    code: 'BIZ_DRIVERS',
    productCode: 'BUSINESS',
    name: 'Pilíř VI. — Pojištění řidičů',
    shortName: 'Řidiči',
    description: 'Krytí situací při řízení dopravního prostředku, kde je třeba povolení.',
    isMandatory: false,
    requiresPillar: 'BIZ_BASIC',
  },
  {
    code: 'DV_VEHICLES',
    productCode: 'DRIVERS_VEHICLES',
    name: 'Pojištění vozidel (samostatně)',
    shortName: 'Vozidla',
    description: 'Samostatné pojištění vozidel. Mírně vyšší pojistné než v rámci produktu Podnikatelé.',
    isMandatory: false,
  },
  {
    code: 'DV_DRIVERS',
    productCode: 'DRIVERS_VEHICLES',
    name: 'Pojištění řidičů (samostatně)',
    shortName: 'Řidiči',
    description: 'Samostatné pojištění řidičů.',
    isMandatory: false,
  },
];

export function getProduct(code: string): Product | undefined {
  return products.find((p) => p.code === code);
}

export function getPillar(code: string): Pillar | undefined {
  return pillars.find((p) => p.code === code);
}

export function getProductPillars(code: string): Pillar[] {
  return pillars.filter((p) => p.productCode === code);
}
