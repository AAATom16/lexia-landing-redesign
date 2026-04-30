export type ProductCode = 'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES';

export type PillarCode =
  | 'IND_BASIC'
  | 'IND_HOUSING'
  | 'IND_HOUSING_2ND'
  | 'IND_HOUSING_RENTAL'
  | 'IND_HOUSING_CONSTRUCTION'
  | 'IND_EMPLOYMENT'
  | 'IND_EMPLOYMENT_MANAGER'
  | 'IND_VEHICLES'
  | 'IND_DRIVERS'
  | 'BIZ_BASIC'
  | 'BIZ_EMPLOYMENT'
  | 'BIZ_PREMISES'
  | 'BIZ_CONTRACT_DISPUTES'
  | 'BIZ_VEHICLES'
  | 'BIZ_DRIVERS'
  | 'DV_VEHICLES'
  | 'DV_DRIVERS';

export type Segment = 'individual' | 'household';
export type Variant = 1 | 2;
export type TerritorialScope = 'CZ' | 'EUROPE';

export type Pillar = {
  code: PillarCode;
  productCode: ProductCode;
  name: string;
  shortName: string;
  description: string;
  isMandatory: boolean;
  requiresPillar?: PillarCode;
};

export type Product = {
  code: ProductCode;
  name: string;
  shortName: string;
  description: string;
  audience: string;
  pillars: PillarCode[];
};

export type LegalArea = {
  code: string;
  name: string;
  limit: number;
  scope: TerritorialScope;
  appliesToPillars: PillarCode[];
};

export type VehicleType =
  | 'car_under_3_5t'
  | 'truck_under_3_5t'
  | 'truck_over_3_5t'
  | 'bus'
  | 'motorcycle'
  | 'tractor'
  | 'trailer_under_750'
  | 'trailer_over_750';

export type IndividualPillarTariff = {
  pillarCode: PillarCode;
  segment: Segment;
  monthly: number;
  yearly: number;
};

export type BusinessBaseTariff = {
  revenueRangeMaxMillions: number;
  employeeRangeMax: number;
  monthly: number;
};

export type BusinessEmploymentTariff = {
  employeeRangeMax: number;
  monthly: number;
};

export type ContractDisputeTariff = {
  disputeCount: 1 | 5 | 10;
  maxAmount: number;
  monthly: number;
};

export type VehicleTariff = {
  vehicleType: VehicleType;
  variant: Variant;
  monthlyInBusiness: number;
  monthlyStandalone: number;
  label: string;
};

export type DriverTariff = {
  variant: Variant;
  monthlyInBusiness: number;
  monthlyStandalone: number;
};

export type VolumeDiscountStep = {
  countMax: number;
  discountPct: number;
};

export type CalculatorInput = {
  productCode: ProductCode;
  segment?: Segment;
  pillars: PillarCode[];
  business?: {
    revenueMillions: number;
    employees: number;
    premises?: {
      buildingSqm: number;
      buildingPlotSqm: number;
      landPlotSqm: number;
    };
    contractDisputes?: {
      count: 1 | 5 | 10;
      maxAmount: number;
    };
    managerSalary?: number;
  };
  vehicles?: { type: VehicleType; count: number }[];
  vehicleVariant?: Variant;
  drivers?: { count: number };
  driverVariant?: Variant;
  housing?: {
    extraProperties?: number;
    rental?: boolean;
    construction?: boolean;
    extraBuildingPlotSqm?: number;
    extraLandPlotSqm?: number;
  };
};

export type LineItem = {
  label: string;
  monthly: number;
  detail?: string;
};

export type CalculationResult = {
  productCode: ProductCode;
  monthly: number;
  yearly: number;
  lineItems: LineItem[];
  warnings: string[];
  discount?: { pct: number; amount: number; reason: string };
};

export type CommissionModel = 1 | 2;

export type CommissionPreview = {
  model: CommissionModel;
  yearlyPremium: number;
  ziskatelska?: number;
  nasledna?: number;
  prubezna?: number;
  startup?: { month1: number; month2: number; month3: number };
};
