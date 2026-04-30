import { Hono } from 'hono';
import { prisma } from '../lib/db.js';
import { authRequired, type AppEnv } from '../lib/middleware.js';
import { UserRole } from '@prisma/client';

export const customerRoutes = new Hono<AppEnv>();

customerRoutes.use('*', authRequired([UserRole.CUSTOMER, UserRole.ADMIN]));

/**
 * GET /customer/contracts — drafts where the logged-in user is the
 * insured client (matched by email) and status >= SENT_TO_CLIENT.
 */
customerRoutes.get('/contracts', async (c) => {
  const claims = c.get('user');
  const drafts = await prisma.contractDraft.findMany({
    where: {
      clientEmail: claims.email.toLowerCase(),
      status: { in: ['SENT_TO_CLIENT', 'SIGNED'] },
    },
    orderBy: { createdAt: 'desc' },
  });
  return c.json(drafts);
});
