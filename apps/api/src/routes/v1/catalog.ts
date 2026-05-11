import { Hono } from 'hono';
import { apiKeyAuth, type AppEnv } from '../../lib/middleware.js';
import { rateLimit } from '../../lib/rateLimit.js';
import { products, pillars, getProductPillars } from '../../domain/products.js';
import {
  individualTariffs,
  businessBaseTariffs,
  businessEmploymentTariffs,
  contractDisputeTariffs,
  vehicleTariffs,
  driverTariffs,
  vehicleVolumeDiscount,
  MANAGER_RATE,
  MANAGER_MIN_YEARLY,
  EXTRA_BUILDING_PLOT_PER_SQM,
  EXTRA_LAND_PLOT_PER_SQM,
  PREMISES_BUILDING_BASE,
  PREMISES_BUILDING_PER_100,
  PREMISES_BUILDING_BASE_SQM,
  PREMISES_BUILD_PLOT_BASE,
  PREMISES_BUILD_PLOT_PER_2500,
  PREMISES_BUILD_PLOT_BASE_SQM,
  PREMISES_LAND_PLOT_BASE,
  PREMISES_LAND_PLOT_PER_10K,
  PREMISES_LAND_PLOT_BASE_SQM,
} from '../../domain/tariffs.js';

export const v1CatalogRoutes = new Hono<AppEnv>();

const TARIFFS_VERSION = '2026/04';
const VEHICLE_TYPES = [
  { code: 'car_under_3_5t', label: 'Osobní vozidlo do 3,5 t' },
  { code: 'truck_under_3_5t', label: 'Nákladní vozidlo do 3,5 t' },
  { code: 'truck_over_3_5t', label: 'Nákladní vozidlo nad 3,5 t' },
  { code: 'bus', label: 'Autobus' },
  { code: 'motorcycle', label: 'Motocykl, tříkolka, čtyřkolka' },
  { code: 'tractor', label: 'Traktory a ostatní stroje' },
  { code: 'trailer_under_750', label: 'Přípojné vozidlo do 750 kg' },
  { code: 'trailer_over_750', label: 'Přípojné vozidlo nad 750 kg' },
];

v1CatalogRoutes.use('*', apiKeyAuth(['calculator:read']));
v1CatalogRoutes.use(
  '*',
  rateLimit({ routeKey: 'v1.catalog.minute', windowSeconds: 60, max: 3600 }),
);

v1CatalogRoutes.get('/products', (c) => {
  const productCode = c.req.query('productCode');
  if (productCode) {
    const p = products.find((x) => x.code === productCode);
    if (!p) return c.json({ error: { code: 'not_found', message: `Product ${productCode} not found.` } }, 404);
    return c.json({ tariffsVersion: TARIFFS_VERSION, product: p });
  }
  return c.json({ tariffsVersion: TARIFFS_VERSION, products });
});

v1CatalogRoutes.get('/pillars', (c) => {
  const productCode = c.req.query('productCode');
  const list = productCode ? getProductPillars(productCode) : pillars;
  return c.json({ tariffsVersion: TARIFFS_VERSION, pillars: list });
});

v1CatalogRoutes.get('/vehicle-types', (c) => {
  return c.json({ tariffsVersion: TARIFFS_VERSION, vehicleTypes: VEHICLE_TYPES });
});

v1CatalogRoutes.get('/tariffs', (c) => {
  const version = c.req.query('version') ?? TARIFFS_VERSION;
  if (version !== TARIFFS_VERSION) {
    return c.json(
      { error: { code: 'tariff_version_not_found', message: `Only version ${TARIFFS_VERSION} is currently supported.` } },
      400,
    );
  }
  return c.json({
    version: TARIFFS_VERSION,
    individual: individualTariffs,
    businessBase: businessBaseTariffs,
    businessEmployment: businessEmploymentTariffs,
    contractDisputes: contractDisputeTariffs,
    vehicles: vehicleTariffs,
    drivers: driverTariffs,
    volumeDiscount: vehicleVolumeDiscount,
    constants: {
      managerRate: MANAGER_RATE,
      managerMinYearly: MANAGER_MIN_YEARLY,
      extraBuildingPlotPerSqm: EXTRA_BUILDING_PLOT_PER_SQM,
      extraLandPlotPerSqm: EXTRA_LAND_PLOT_PER_SQM,
      premisesBuildingBase: PREMISES_BUILDING_BASE,
      premisesBuildingPer100: PREMISES_BUILDING_PER_100,
      premisesBuildingBaseSqm: PREMISES_BUILDING_BASE_SQM,
      premisesBuildPlotBase: PREMISES_BUILD_PLOT_BASE,
      premisesBuildPlotPer2500: PREMISES_BUILD_PLOT_PER_2500,
      premisesBuildPlotBaseSqm: PREMISES_BUILD_PLOT_BASE_SQM,
      premisesLandPlotBase: PREMISES_LAND_PLOT_BASE,
      premisesLandPlotPer10k: PREMISES_LAND_PLOT_PER_10K,
      premisesLandPlotBaseSqm: PREMISES_LAND_PLOT_BASE_SQM,
    },
  });
});
