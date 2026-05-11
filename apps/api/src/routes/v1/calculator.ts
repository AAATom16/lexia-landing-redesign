import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { apiKeyAuth, type AppEnv } from '../../lib/middleware.js';
import { calculatePremium } from '../../domain/calculator.js';
import type { CalculatorInput } from '../../domain/types.js';

export const v1CalculatorRoutes = new Hono<AppEnv>();

const TARIFFS_VERSION = '2026/04';

const vehicleSchema = z.object({
  type: z.enum([
    'car_under_3_5t',
    'truck_under_3_5t',
    'truck_over_3_5t',
    'bus',
    'motorcycle',
    'tractor',
    'trailer_under_750',
    'trailer_over_750',
  ]),
  count: z.number().int().nonnegative(),
});

const inputSchema = z.object({
  productCode: z.enum(['INDIVIDUAL', 'BUSINESS', 'DRIVERS_VEHICLES']),
  segment: z.enum(['individual', 'household']).optional(),
  pillars: z.array(z.string()).min(1),
  business: z
    .object({
      revenueMillions: z.number().nonnegative(),
      employees: z.number().int().nonnegative(),
      premises: z
        .object({
          buildingSqm: z.number().nonnegative(),
          buildingPlotSqm: z.number().nonnegative(),
          landPlotSqm: z.number().nonnegative(),
        })
        .optional(),
      contractDisputes: z
        .object({
          count: z.union([z.literal(1), z.literal(5), z.literal(10)]),
          maxAmount: z.number().int().positive(),
        })
        .optional(),
      managerSalary: z.number().nonnegative().optional(),
    })
    .optional(),
  vehicles: z.array(vehicleSchema).optional(),
  vehicleVariant: z.union([z.literal(1), z.literal(2)]).optional(),
  drivers: z.object({ count: z.number().int().nonnegative() }).optional(),
  driverVariant: z.union([z.literal(1), z.literal(2)]).optional(),
  housing: z
    .object({
      extraProperties: z.number().int().nonnegative().optional(),
      rental: z.boolean().optional(),
      construction: z.boolean().optional(),
      extraBuildingPlotSqm: z.number().nonnegative().optional(),
      extraLandPlotSqm: z.number().nonnegative().optional(),
    })
    .optional(),
});

const previewSchema = z.object({
  input: inputSchema,
  tariffsVersion: z.string().optional(),
});

v1CalculatorRoutes.use('*', apiKeyAuth(['calculator:read']));

v1CalculatorRoutes.post('/preview', zValidator('json', previewSchema), async (c) => {
  const { input, tariffsVersion } = c.req.valid('json');
  if (tariffsVersion && tariffsVersion !== TARIFFS_VERSION) {
    return c.json(
      { error: { code: 'tariff_version_not_found', message: `Only version ${TARIFFS_VERSION} is currently supported.` } },
      400,
    );
  }
  const result = calculatePremium(input as CalculatorInput);
  return c.json({ tariffsVersion: TARIFFS_VERSION, result });
});
