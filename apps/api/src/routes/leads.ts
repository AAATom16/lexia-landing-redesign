import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { DraftSource, DraftStatus } from '@prisma/client';
import { prisma } from '../lib/db.js';

export const leadRoutes = new Hono();

const PUBLIC_SYSTEM_EMAIL = 'system-public@lexia.cz';

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

const leadSchema = z.object({
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
  productCode: z.enum(['INDIVIDUAL', 'BUSINESS', 'DRIVERS_VEHICLES']),
  pillars: z.array(z.string()).min(1),
  segment: z.string().optional(),
  premiumMonthly: z.number().int().nonnegative(),
  premiumYearly: z.number().int().nonnegative(),
  inputJson: z.unknown(),
  resultJson: z.unknown(),
  notes: z.string().optional(),
});

leadRoutes.post('/', zValidator('json', leadSchema), async (c) => {
  const body = c.req.valid('json');
  const sysUser = await ensureSystemUser();
  const phone = body.clientPhone ? `Telefon: ${body.clientPhone}` : '';
  const note = [phone, body.notes].filter(Boolean).join('\n');

  const draft = await prisma.contractDraft.create({
    data: {
      createdById: sysUser.id,
      source: DraftSource.PUBLIC,
      status: DraftStatus.DRAFT,
      productCode: body.productCode,
      pillars: body.pillars,
      segment: body.segment,
      territorialScope: 'CZ',
      clientName: body.clientName,
      clientEmail: body.clientEmail.toLowerCase(),
      premiumMonthly: body.premiumMonthly,
      premiumYearly: body.premiumYearly,
      inputJson: body.inputJson as object,
      resultJson: body.resultJson as object,
      notes: note || null,
    },
  });
  await prisma.auditLog.create({
    data: {
      action: 'lead.public_create',
      entityType: 'ContractDraft',
      entityId: draft.id,
      payload: { email: body.clientEmail, name: body.clientName },
    },
  });
  return c.json({ ok: true, id: draft.id }, 201);
});
