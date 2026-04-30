import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DraftSource, DraftStatus, UserRole } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { authRequired, type AppEnv } from '../lib/middleware.js';

export const draftRoutes = new Hono<AppEnv>();

const draftCreateSchema = z.object({
  productCode: z.enum(['INDIVIDUAL', 'BUSINESS', 'DRIVERS_VEHICLES']),
  pillars: z.array(z.string()).min(1),
  segment: z.string().optional(),
  territorialScope: z.enum(['CZ', 'EUROPE']).default('CZ'),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientIco: z.string().optional(),
  commissionModel: z.union([z.literal(1), z.literal(2)]).optional(),
  premiumMonthly: z.number().int().nonnegative(),
  premiumYearly: z.number().int().nonnegative(),
  inputJson: z.unknown(),
  resultJson: z.unknown(),
  source: z.nativeEnum(DraftSource),
  status: z.nativeEnum(DraftStatus).default(DraftStatus.DRAFT),
  notes: z.string().optional(),
});

const draftUpdateSchema = draftCreateSchema.partial();

draftRoutes.use('*', authRequired());

draftRoutes.get('/', async (c) => {
  const claims = c.get('user');
  const where = claims.role === UserRole.ADMIN ? {} : { createdById: claims.sub };
  const drafts = await prisma.contractDraft.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return c.json(drafts);
});

draftRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const claims = c.get('user');
  const draft = await prisma.contractDraft.findUnique({ where: { id } });
  if (!draft) return c.json({ error: 'not_found' }, 404);
  if (claims.role !== UserRole.ADMIN && draft.createdById !== claims.sub) {
    return c.json({ error: 'forbidden' }, 403);
  }
  return c.json(draft);
});

draftRoutes.post('/', zValidator('json', draftCreateSchema), async (c) => {
  const body = c.req.valid('json');
  const claims = c.get('user');
  const draft = await prisma.contractDraft.create({
    data: {
      ...body,
      inputJson: body.inputJson as object,
      resultJson: body.resultJson as object,
      clientEmail: body.clientEmail || null,
      createdById: claims.sub,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: claims.sub,
      action: 'draft.create',
      entityType: 'ContractDraft',
      entityId: draft.id,
    },
  });
  return c.json(draft, 201);
});

draftRoutes.patch('/:id', zValidator('json', draftUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const claims = c.get('user');
  const existing = await prisma.contractDraft.findUnique({ where: { id } });
  if (!existing) return c.json({ error: 'not_found' }, 404);
  if (claims.role !== UserRole.ADMIN && existing.createdById !== claims.sub) {
    return c.json({ error: 'forbidden' }, 403);
  }
  const draft = await prisma.contractDraft.update({
    where: { id },
    data: {
      ...body,
      inputJson: body.inputJson as object | undefined,
      resultJson: body.resultJson as object | undefined,
      clientEmail: body.clientEmail === '' ? null : body.clientEmail,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: claims.sub,
      action: 'draft.update',
      entityType: 'ContractDraft',
      entityId: id,
      payload: body as object,
    },
  });
  return c.json(draft);
});

draftRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const claims = c.get('user');
  const existing = await prisma.contractDraft.findUnique({ where: { id } });
  if (!existing) return c.json({ error: 'not_found' }, 404);
  if (claims.role !== UserRole.ADMIN && existing.createdById !== claims.sub) {
    return c.json({ error: 'forbidden' }, 403);
  }
  await prisma.contractDraft.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      actorId: claims.sub,
      action: 'draft.delete',
      entityType: 'ContractDraft',
      entityId: id,
    },
  });
  return c.json({ ok: true });
});
