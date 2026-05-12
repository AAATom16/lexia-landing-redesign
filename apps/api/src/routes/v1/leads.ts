import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DraftSource, DraftStatus, DiscountStatus, DiscountKind } from '@prisma/client';
import { prisma } from '../../lib/db.js';
import { apiKeyAuth, type AppEnv } from '../../lib/middleware.js';
import { sha256 } from '../../lib/apiKeys.js';
import { onDraftCreated } from '../../lib/draftLifecycle.js';
import { rateLimitMulti } from '../../lib/rateLimit.js';

export const v1LeadsRoutes = new Hono<AppEnv>();

const PUBLIC_SYSTEM_EMAIL = 'system-public@lexia.cz';
const IDEMPOTENCY_TTL_HOURS = 24;

const v1LeadSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  clientIco: z.string().optional(),
  productCode: z.enum(['INDIVIDUAL', 'BUSINESS', 'DRIVERS_VEHICLES']),
  pillars: z.array(z.string()).min(1),
  segment: z.enum(['individual', 'household']).optional(),
  territorialScope: z.enum(['CZ', 'EUROPE']).optional(),
  premiumMonthly: z.number().int().nonnegative(),
  premiumYearly: z.number().int().nonnegative(),
  inputJson: z.unknown(),
  resultJson: z.unknown(),
  notes: z.string().optional(),
  salespersonCode: z.string().optional(),
  discountCode: z.string().optional(),
  partnerRefId: z.string().optional(),
});

async function ensureSystemUser() {
  return prisma.user.upsert({
    where: { email: PUBLIC_SYSTEM_EMAIL },
    create: {
      email: PUBLIC_SYSTEM_EMAIL,
      name: 'Veřejný web',
      passwordHash: 'no-login',
      role: 'ADMIN',
    },
    update: {},
  });
}

v1LeadsRoutes.use('*', apiKeyAuth(['leads:write']));

const leadsWriteLimit = rateLimitMulti([
  { routeKey: 'v1.leads.write.minute', windowSeconds: 60, max: 60 },
  { routeKey: 'v1.leads.write.day', windowSeconds: 86400, max: 5000 },
]);

const leadsReadLimit = rateLimitMulti([
  { routeKey: 'v1.leads.read.minute', windowSeconds: 60, max: 300 },
]);

v1LeadsRoutes.post('/', leadsWriteLimit, zValidator('json', v1LeadSchema), async (c) => {
  const body = c.req.valid('json');
  const partner = c.get('partner');
  const apiKey = c.get('apiKey');
  const idempotencyKey = c.req.header('idempotency-key') ?? null;
  const payloadHash = sha256(JSON.stringify(body));

  // Idempotency: replay the original response when the same key + payload is seen.
  if (idempotencyKey) {
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { apiKeyId_key: { apiKeyId: apiKey.id, key: idempotencyKey } },
    });
    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        return c.json(
          { error: { code: 'idempotency_conflict', message: 'Idempotency-Key was used with a different payload.' } },
          409,
        );
      }
      return c.json(existing.responseBody as object, existing.responseStatus as 200 | 201);
    }
  }

  // Salesperson validation: must belong to this partner.
  let salespersonId: string | null = null;
  if (body.salespersonCode) {
    const sp = await prisma.salesperson.findUnique({ where: { salespersonCode: body.salespersonCode } });
    if (!sp || sp.partnerId !== partner.id) {
      return c.json(
        { error: { code: 'salesperson_not_found', message: `Salesperson ${body.salespersonCode} does not belong to partner ${partner.brokerCode}.` } },
        400,
      );
    }
    if (sp.status !== 'ACTIVE') {
      return c.json(
        { error: { code: 'salesperson_inactive', message: `Salesperson ${body.salespersonCode} is INACTIVE.` } },
        400,
      );
    }
    salespersonId = sp.id;
  }

  // Discount validation: must belong to this partner, ACTIVE, within validity, not exhausted.
  let discountCodeId: string | null = null;
  let discountSnapshot: { code: string; percent: number; amountMonthly: number; amountYearly: number } | null = null;
  let discountedMonthly = body.premiumMonthly;
  let discountedYearly = body.premiumYearly;

  if (body.discountCode) {
    const dc = await prisma.discountCode.findUnique({ where: { code: body.discountCode } });
    if (!dc || dc.partnerId !== partner.id) {
      return c.json(
        { error: { code: 'discount_not_found', message: `Discount code ${body.discountCode} does not belong to partner ${partner.brokerCode}.` } },
        400,
      );
    }
    const now = new Date();
    if (dc.status !== DiscountStatus.ACTIVE) {
      return c.json(
        { error: { code: 'discount_inactive', message: `Discount code is ${dc.status}.` } },
        400,
      );
    }
    if (dc.validFrom && dc.validFrom > now) {
      return c.json(
        { error: { code: 'discount_not_yet_valid', message: `Discount code valid from ${dc.validFrom.toISOString()}.` } },
        400,
      );
    }
    if (dc.validUntil && dc.validUntil < now) {
      return c.json(
        { error: { code: 'discount_expired', message: `Discount code expired on ${dc.validUntil.toISOString()}.` } },
        400,
      );
    }
    if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) {
      return c.json(
        { error: { code: 'discount_exhausted', message: 'Discount code has been fully used.' } },
        409,
      );
    }
    const amountMonthly = Math.round((body.premiumMonthly * dc.percent) / 100);
    const amountYearly = amountMonthly * 12;
    discountedMonthly = Math.max(0, body.premiumMonthly - amountMonthly);
    discountedYearly = Math.max(0, body.premiumYearly - amountYearly);
    discountSnapshot = { code: dc.code, percent: dc.percent, amountMonthly, amountYearly };
    discountCodeId = dc.id;
  }

  const sysUser = await ensureSystemUser();
  const isTestKey = apiKey.prefix.startsWith('lxa_test_');
  const testTag = isTestKey ? '[TEST] ' : '';
  const phone = body.clientPhone ? `Telefon: ${body.clientPhone}\n` : '';
  const partnerTag = `${testTag}Partner: ${partner.brokerCode}${body.salespersonCode ? ` / ${body.salespersonCode}` : ''}\n`;
  const refTag = body.partnerRefId ? `PartnerRef: ${body.partnerRefId}\n` : '';
  const noteCombined = [partnerTag + refTag + phone, body.notes].filter(Boolean).join('').trim();

  const draft = await prisma.contractDraft.create({
    data: {
      createdById: sysUser.id,
      source: DraftSource.PARTNER_API,
      status: DraftStatus.DRAFT,
      productCode: body.productCode,
      pillars: body.pillars,
      segment: body.segment,
      territorialScope: body.territorialScope ?? 'CZ',
      clientName: body.clientName,
      clientEmail: body.clientEmail.toLowerCase(),
      clientIco: body.clientIco,
      premiumMonthly: discountedMonthly,
      premiumYearly: discountedYearly,
      inputJson: body.inputJson as object,
      resultJson: body.resultJson as object,
      notes: noteCombined || null,
      partnerId: partner.id,
      salespersonId,
      discountCodeId,
      discountSnapshot: discountSnapshot ?? undefined,
      partnerRefId: body.partnerRefId,
    },
  });

  // Increment discount usedCount (and exhaust ONE_TIME) atomically after draft is created.
  if (discountCodeId) {
    await prisma.$transaction(async (tx) => {
      const dc = await tx.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      });
      if (dc.kind === DiscountKind.ONE_TIME && dc.maxUses !== null && dc.usedCount >= dc.maxUses) {
        await tx.discountCode.update({
          where: { id: discountCodeId },
          data: { status: DiscountStatus.EXHAUSTED },
        });
      }
    });
  }

  await prisma.auditLog.create({
    data: {
      action: 'lead.partner_create',
      entityType: 'ContractDraft',
      entityId: draft.id,
      payload: {
        partnerId: partner.id,
        brokerCode: partner.brokerCode,
        apiKeyId: apiKey.id,
        environment: isTestKey ? 'test' : 'live',
        salespersonCode: body.salespersonCode ?? null,
        discountCode: body.discountCode ?? null,
        partnerRefId: body.partnerRefId ?? null,
      },
    },
  });

  const responseBody = {
    ok: true,
    id: draft.id,
    referenceCode: draft.id, // proper LX-YYYY-MM-NNNNNN sequence comes in PR #6
    status: draft.status,
    premiumMonthly: draft.premiumMonthly,
    premiumYearly: draft.premiumYearly,
    discount: discountSnapshot,
    createdAt: draft.createdAt.toISOString(),
  };

  if (idempotencyKey) {
    await prisma.idempotencyRecord.create({
      data: {
        apiKeyId: apiKey.id,
        key: idempotencyKey,
        payloadHash,
        responseStatus: 201,
        responseBody,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_HOURS * 3600 * 1000),
      },
    });
  }

  // Fire DRAFT_CREATED webhook (best-effort, non-blocking).
  onDraftCreated(draft).catch((e) => console.error('[lead.lifecycle]', e));

  return c.json(responseBody, 201);
});

v1LeadsRoutes.get('/:id', leadsReadLimit, async (c) => {
  const partner = c.get('partner');
  const id = c.req.param('id');
  const draft = await prisma.contractDraft.findUnique({ where: { id } });
  if (!draft || draft.partnerId !== partner.id) {
    return c.json({ error: { code: 'not_found', message: 'Lead not found or not owned by this partner.' } }, 404);
  }
  return c.json({
    id: draft.id,
    status: draft.status,
    productCode: draft.productCode,
    pillars: draft.pillars,
    premiumMonthly: draft.premiumMonthly,
    premiumYearly: draft.premiumYearly,
    discount: draft.discountSnapshot,
    partnerRefId: draft.partnerRefId,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  });
});
