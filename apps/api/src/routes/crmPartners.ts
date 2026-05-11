import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'node:crypto';
import { DiscountKind, DiscountStatus, PartnerStatus, SalespersonStatus, UserRole, WebhookEvent } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { authRequired, type AppEnv } from '../lib/middleware.js';
import { generateApiKey } from '../lib/apiKeys.js';

export const crmPartnerRoutes = new Hono<AppEnv>();

crmPartnerRoutes.use('*', authRequired([UserRole.ADMIN]));

// --- Partner CRUD ---

const partnerCreateSchema = z.object({
  name: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  ico: z.string().optional(),
  commissionModel: z.union([z.literal(1), z.literal(2)]).default(1),
  commissionRateZiskatelska: z.number().int().min(0).max(100).optional(),
  commissionRateNasledna: z.number().int().min(0).max(100).optional(),
  commissionRatePrubezna: z.number().int().min(0).max(100).optional(),
  contractedAt: z.string().datetime().optional(),
});

const partnerUpdateSchema = partnerCreateSchema.partial().extend({
  status: z.nativeEnum(PartnerStatus).optional(),
});

async function nextBrokerCode(): Promise<string> {
  const latest = await prisma.partner.findFirst({
    where: { brokerCode: { startsWith: 'LX-BR-' } },
    orderBy: { brokerCode: 'desc' },
    select: { brokerCode: true },
  });
  const lastNum = latest ? parseInt(latest.brokerCode.split('-')[2], 10) : 0;
  return `LX-BR-${String(lastNum + 1).padStart(5, '0')}`;
}

crmPartnerRoutes.get('/', async (c) => {
  const status = c.req.query('status') as PartnerStatus | undefined;
  const partners = await prisma.partner.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { salespeople: true, apiKeys: true, discountCodes: true, drafts: true } },
    },
  });
  return c.json(partners);
});

crmPartnerRoutes.post('/', zValidator('json', partnerCreateSchema), async (c) => {
  const body = c.req.valid('json');
  const brokerCode = await nextBrokerCode();
  const partner = await prisma.partner.create({
    data: {
      ...body,
      brokerCode,
      contractedAt: body.contractedAt ? new Date(body.contractedAt) : null,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'partner.create',
      entityType: 'Partner',
      entityId: partner.id,
      payload: { brokerCode },
    },
  });
  return c.json(partner, 201);
});

crmPartnerRoutes.get('/:id', async (c) => {
  const partner = await prisma.partner.findUnique({
    where: { id: c.req.param('id') },
    include: {
      salespeople: { orderBy: { salespersonCode: 'asc' } },
      apiKeys: { orderBy: { createdAt: 'desc' } },
      discountCodes: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!partner) return c.json({ error: 'not_found' }, 404);
  // Never expose hashes.
  const apiKeys = partner.apiKeys.map(({ hash: _h, ...rest }) => rest);
  return c.json({ ...partner, apiKeys });
});

crmPartnerRoutes.patch('/:id', zValidator('json', partnerUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const partner = await prisma.partner.update({
    where: { id },
    data: {
      ...body,
      contractedAt: body.contractedAt ? new Date(body.contractedAt) : undefined,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'partner.update',
      entityType: 'Partner',
      entityId: id,
      payload: body as object,
    },
  });
  return c.json(partner);
});

// --- API key management ---

const apiKeyCreateSchema = z.object({
  label: z.string().min(2),
  environment: z.enum(['live', 'test']).default('live'),
  scopes: z.array(z.string()).default(['leads:write', 'calculator:read']),
  expiresAt: z.string().datetime().optional(),
});

crmPartnerRoutes.post('/:id/api-keys', zValidator('json', apiKeyCreateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const body = c.req.valid('json');
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return c.json({ error: 'not_found' }, 404);

  const generated = generateApiKey(body.environment);
  const key = await prisma.apiKey.create({
    data: {
      partnerId,
      prefix: generated.prefix,
      hash: generated.hash,
      label: body.label,
      scopes: body.scopes,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'apiKey.create',
      entityType: 'ApiKey',
      entityId: key.id,
      payload: { partnerId, prefix: generated.prefix, label: body.label },
    },
  });
  // Plain key returned only here, never persisted.
  return c.json({
    id: key.id,
    prefix: key.prefix,
    label: key.label,
    scopes: key.scopes,
    expiresAt: key.expiresAt,
    createdAt: key.createdAt,
    plainKey: generated.plain,
  }, 201);
});

crmPartnerRoutes.delete('/:id/api-keys/:keyId', async (c) => {
  const partnerId = c.req.param('id');
  const keyId = c.req.param('keyId');
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key || key.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  if (key.revokedAt) return c.json({ error: 'already_revoked' }, 409);
  const revoked = await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'apiKey.revoke',
      entityType: 'ApiKey',
      entityId: keyId,
    },
  });
  return c.json({ ok: true, revokedAt: revoked.revokedAt });
});

// --- Salesperson management ---

const salespersonCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  cnbReg: z.string().optional(),
  cnbCategory: z.enum(['SZ_PM', 'SZ_PA', 'DJ', 'VZ', 'DPZ', 'TIPAR']).optional(),
});

const salespersonUpdateSchema = salespersonCreateSchema.partial().extend({
  status: z.nativeEnum(SalespersonStatus).optional(),
});

async function nextSalespersonCode(partnerBrokerCode: string, partnerId: string): Promise<string> {
  const latest = await prisma.salesperson.findFirst({
    where: { partnerId },
    orderBy: { salespersonCode: 'desc' },
    select: { salespersonCode: true },
  });
  const lastNum = latest ? parseInt(latest.salespersonCode.split('-OB')[1] ?? '0', 10) : 0;
  return `${partnerBrokerCode}-OB${String(lastNum + 1).padStart(2, '0')}`;
}

crmPartnerRoutes.post('/:id/salespeople', zValidator('json', salespersonCreateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const body = c.req.valid('json');
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return c.json({ error: 'not_found' }, 404);

  const salespersonCode = await nextSalespersonCode(partner.brokerCode, partner.id);
  const sp = await prisma.salesperson.create({
    data: {
      partnerId,
      salespersonCode,
      ...body,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'salesperson.create',
      entityType: 'Salesperson',
      entityId: sp.id,
      payload: { partnerId, salespersonCode },
    },
  });
  return c.json(sp, 201);
});

crmPartnerRoutes.patch('/:id/salespeople/:spId', zValidator('json', salespersonUpdateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const spId = c.req.param('spId');
  const sp = await prisma.salesperson.findUnique({ where: { id: spId } });
  if (!sp || sp.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  const updated = await prisma.salesperson.update({ where: { id: spId }, data: c.req.valid('json') });
  return c.json(updated);
});

// --- Discount code management ---

const discountCreateSchema = z.object({
  code: z.string().min(3),
  label: z.string().min(2),
  kind: z.nativeEnum(DiscountKind),
  percent: z.number().int().min(1).max(100),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  maxUses: z.number().int().positive().optional(),
});

const discountUpdateSchema = z.object({
  label: z.string().min(2).optional(),
  status: z.nativeEnum(DiscountStatus).optional(),
  validUntil: z.string().datetime().optional(),
});

crmPartnerRoutes.post('/:id/discount-codes', zValidator('json', discountCreateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const body = c.req.valid('json');
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return c.json({ error: 'not_found' }, 404);

  const existing = await prisma.discountCode.findUnique({ where: { code: body.code } });
  if (existing) return c.json({ error: 'code_taken' }, 409);

  const dc = await prisma.discountCode.create({
    data: {
      partnerId,
      code: body.code,
      label: body.label,
      kind: body.kind,
      percent: body.percent,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      maxUses: body.maxUses ?? (body.kind === DiscountKind.ONE_TIME ? 1 : null),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'discount.create',
      entityType: 'DiscountCode',
      entityId: dc.id,
      payload: { partnerId, code: dc.code, percent: dc.percent },
    },
  });
  return c.json(dc, 201);
});

crmPartnerRoutes.patch('/:id/discount-codes/:dcId', zValidator('json', discountUpdateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const dcId = c.req.param('dcId');
  const body = c.req.valid('json');
  const dc = await prisma.discountCode.findUnique({ where: { id: dcId } });
  if (!dc || dc.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  const updated = await prisma.discountCode.update({
    where: { id: dcId },
    data: {
      ...body,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    },
  });
  return c.json(updated);
});

// --- Webhook management ---

const webhookCreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.nativeEnum(WebhookEvent)).min(1),
  enabled: z.boolean().default(true),
});

const webhookUpdateSchema = webhookCreateSchema.partial();

crmPartnerRoutes.get('/:id/webhooks', async (c) => {
  const partnerId = c.req.param('id');
  const webhooks = await prisma.webhook.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
  });
  // Never expose secret again after creation.
  return c.json(webhooks.map(({ secret: _s, ...rest }) => rest));
});

crmPartnerRoutes.post('/:id/webhooks', zValidator('json', webhookCreateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const body = c.req.valid('json');
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner) return c.json({ error: 'not_found' }, 404);

  const secret = `whsec_${crypto.randomBytes(24).toString('base64url')}`;
  const wh = await prisma.webhook.create({
    data: {
      partnerId,
      url: body.url,
      events: body.events,
      enabled: body.enabled,
      secret,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: c.get('user').sub,
      action: 'webhook.create',
      entityType: 'Webhook',
      entityId: wh.id,
      payload: { partnerId, url: body.url, events: body.events },
    },
  });
  return c.json({ ...wh, secret }, 201);
});

crmPartnerRoutes.patch('/:id/webhooks/:whId', zValidator('json', webhookUpdateSchema), async (c) => {
  const partnerId = c.req.param('id');
  const whId = c.req.param('whId');
  const wh = await prisma.webhook.findUnique({ where: { id: whId } });
  if (!wh || wh.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  const updated = await prisma.webhook.update({ where: { id: whId }, data: c.req.valid('json') });
  const { secret: _s, ...rest } = updated;
  return c.json(rest);
});

crmPartnerRoutes.delete('/:id/webhooks/:whId', async (c) => {
  const partnerId = c.req.param('id');
  const whId = c.req.param('whId');
  const wh = await prisma.webhook.findUnique({ where: { id: whId } });
  if (!wh || wh.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  await prisma.webhook.delete({ where: { id: whId } });
  return c.json({ ok: true });
});

crmPartnerRoutes.get('/:id/webhooks/:whId/deliveries', async (c) => {
  const partnerId = c.req.param('id');
  const whId = c.req.param('whId');
  const wh = await prisma.webhook.findUnique({ where: { id: whId } });
  if (!wh || wh.partnerId !== partnerId) return c.json({ error: 'not_found' }, 404);
  const deliveries = await prisma.webhookDelivery.findMany({
    where: { webhookId: whId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return c.json(deliveries);
});

// --- Commission listing ---

crmPartnerRoutes.get('/:id/commissions', async (c) => {
  const partnerId = c.req.param('id');
  const commissions = await prisma.commissionEntry.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      contractDraft: {
        select: { id: true, productCode: true, clientName: true, premiumYearly: true, signedAt: true },
      },
    },
  });
  const total = commissions.reduce((s, e) => s + e.amount, 0);
  return c.json({ total, entries: commissions });
});
