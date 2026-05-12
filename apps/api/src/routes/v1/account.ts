import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { DraftStatus } from '@prisma/client';
import { prisma } from '../../lib/db.js';
import { apiKeyAuth, type AppEnv } from '../../lib/middleware.js';
import { rateLimit } from '../../lib/rateLimit.js';

export const v1AccountRoutes = new Hono<AppEnv>();

const lookupSchema = z.object({
  email: z.string().email(),
  includeStatuses: z
    .string()
    .optional()
    .transform((v) =>
      v ? (v.split(',') as DraftStatus[]) : [DraftStatus.SIGNED, DraftStatus.SENT_TO_CLIENT],
    ),
});

v1AccountRoutes.use('*', apiKeyAuth(['account:read']));
v1AccountRoutes.use(
  '*',
  rateLimit({ routeKey: 'v1.account.minute', windowSeconds: 60, max: 120 }),
);

// GET /v1/account?email=client@example.cz[&includeStatuses=SIGNED,SENT_TO_CLIENT]
//
// Server-to-server lookup: returns the contracts/drafts the partner has on file
// for the given client email. Lexia trusts the partner's API key — the partner
// is responsible for verifying the client's identity on their side before
// calling this endpoint (e.g. magic link, OTP, signed-in account).
v1AccountRoutes.get('/', zValidator('query', lookupSchema), async (c) => {
  const partner = c.get('partner');
  const apiKey = c.get('apiKey');
  const { email, includeStatuses } = c.req.valid('query');
  const isTestKey = apiKey.prefix.startsWith('lxa_test_');

  // Test keys see only test-attributed drafts; live keys see only live drafts.
  // Test drafts are tagged with the "[TEST]" notes prefix at /v1/leads creation time.
  const envFilter = isTestKey
    ? { notes: { startsWith: '[TEST]' } }
    : { NOT: { notes: { startsWith: '[TEST]' } } };
  const drafts = await prisma.contractDraft.findMany({
    where: {
      partnerId: partner.id,
      clientEmail: email.toLowerCase(),
      status: { in: includeStatuses },
      ...envFilter,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return c.json({
    email,
    partnerBrokerCode: partner.brokerCode,
    contracts: drafts.map((d) => ({
      id: d.id,
      productCode: d.productCode,
      pillars: d.pillars,
      segment: d.segment,
      territorialScope: d.territorialScope,
      premiumMonthly: d.premiumMonthly,
      premiumYearly: d.premiumYearly,
      status: d.status,
      discount: d.discountSnapshot,
      signedAt: d.signedAt?.toISOString() ?? null,
      cancelledAt: d.cancelledAt?.toISOString() ?? null,
      createdAt: d.createdAt.toISOString(),
    })),
  });
});
