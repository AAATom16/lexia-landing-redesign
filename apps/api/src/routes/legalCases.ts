import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DenialReason, LegalCaseModel, LegalCaseStatus, UserRole } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { authRequired, type AppEnv } from '../lib/middleware.js';

export const legalCaseRoutes = new Hono<AppEnv>();

legalCaseRoutes.use('*', authRequired());

const baseSchema = z.object({
  policyholderName: z.string().min(2),
  policyholderEmail: z.string().email().optional().or(z.literal('')),
  policyholderIco: z.string().optional(),
  isVip: z.boolean().optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  productCode: z.enum(['INDIVIDUAL', 'BUSINESS', 'DRIVERS_VEHICLES']),
  pillarCode: z.string(),
  legalAreaCode: z.string().optional(),
  claimType: z.string().optional(),
  caseDate: z.string().or(z.date()).transform((v) => new Date(v)),
  reportedDate: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
  policyStart: z.string().or(z.date()).transform((v) => new Date(v)).optional(),
  status: z.nativeEnum(LegalCaseStatus).optional(),
  model: z.nativeEnum(LegalCaseModel).optional(),
  isTelefonicka: z.boolean().optional(),
  reserveExternal: z.number().int().nonnegative().optional(),
  reserveInternal: z.number().int().nonnegative().optional(),
  paidExternal: z.number().int().nonnegative().optional(),
  paidInternal: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
  denialReason: z.nativeEnum(DenialReason).optional(),
  denialNote: z.string().optional(),
  contractDraftId: z.string().optional(),
  assigneeId: z.string().optional(),
});

async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.legalCase.count({
    where: {
      caseNumber: { startsWith: `LX-PP-${year}-` },
    },
  });
  return `LX-PP-${year}-${String(count + 1).padStart(4, '0')}`;
}

legalCaseRoutes.get('/', async (c) => {
  const claims = c.get('user');
  const where =
    claims.role === UserRole.CUSTOMER
      ? { policyholderEmail: claims.email.toLowerCase() }
      : {};
  const cases = await prisma.legalCase.findMany({
    where,
    orderBy: { reportedDate: 'desc' },
    take: 200,
  });
  return c.json(cases);
});

legalCaseRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const claims = c.get('user');
  const lc = await prisma.legalCase.findUnique({ where: { id } });
  if (!lc) return c.json({ error: 'not_found' }, 404);
  if (claims.role === UserRole.CUSTOMER && lc.policyholderEmail !== claims.email.toLowerCase()) {
    return c.json({ error: 'forbidden' }, 403);
  }
  return c.json(lc);
});

legalCaseRoutes.post('/', zValidator('json', baseSchema), async (c) => {
  const body = c.req.valid('json');
  const claims = c.get('user');
  if (claims.role === UserRole.DISTRIBUTOR) {
    return c.json({ error: 'forbidden' }, 403);
  }

  const caseNumber = await generateCaseNumber();
  const isTelefonicka = body.isTelefonicka ?? false;
  const reserveInternal = isTelefonicka
    ? 0
    : body.reserveInternal ?? (body.model === 'EXTERNI_LIKVIDACE' ? 8775 + 3150 : 3150);
  const reserveExternal = isTelefonicka ? 0 : body.reserveExternal ?? 0;

  const lc = await prisma.legalCase.create({
    data: {
      caseNumber,
      policyholderName: body.policyholderName,
      policyholderEmail: body.policyholderEmail ? body.policyholderEmail.toLowerCase() : null,
      policyholderIco: body.policyholderIco,
      isVip: body.isVip ?? false,
      reporterName: body.reporterName,
      reporterPhone: body.reporterPhone,
      productCode: body.productCode,
      pillarCode: body.pillarCode,
      legalAreaCode: body.legalAreaCode,
      claimType: body.claimType,
      caseDate: body.caseDate,
      reportedDate: body.reportedDate ?? new Date(),
      policyStart: body.policyStart,
      status: body.status ?? 'REGISTROVANO',
      model: body.model ?? (isTelefonicka ? 'TELEFONICKA_PORADA' : 'SAMOREGULACE'),
      isTelefonicka,
      reserveExternal,
      reserveInternal,
      paidExternal: body.paidExternal ?? 0,
      paidInternal: body.paidInternal ?? 0,
      description: body.description,
      denialReason: body.denialReason,
      denialNote: body.denialNote,
      contractDraftId: body.contractDraftId,
      assigneeId: body.assigneeId,
      createdById: claims.sub,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: claims.sub,
      action: 'legal_case.create',
      entityType: 'LegalCase',
      entityId: lc.id,
      payload: { caseNumber },
    },
  });

  return c.json(lc, 201);
});

legalCaseRoutes.patch('/:id', zValidator('json', baseSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const claims = c.get('user');
  if (claims.role !== UserRole.ADMIN) {
    return c.json({ error: 'forbidden' }, 403);
  }
  const existing = await prisma.legalCase.findUnique({ where: { id } });
  if (!existing) return c.json({ error: 'not_found' }, 404);

  const lc = await prisma.legalCase.update({
    where: { id },
    data: {
      ...body,
      policyholderEmail:
        body.policyholderEmail === '' ? null : body.policyholderEmail?.toLowerCase(),
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: claims.sub,
      action: 'legal_case.update',
      entityType: 'LegalCase',
      entityId: id,
      payload: body as object,
    },
  });
  return c.json(lc);
});
