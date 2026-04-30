import type { Context, Next } from 'hono';
import type { UserRole } from '@prisma/client';
import { verifyToken, type SessionClaims } from './auth.js';

export type AppEnv = {
  Variables: {
    user: SessionClaims;
  };
};

export function authRequired(roles?: UserRole[]) {
  return async (c: Context<AppEnv>, next: Next) => {
    const header = c.req.header('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return c.json({ error: 'unauthorized' }, 401);

    try {
      const claims = await verifyToken(match[1]);
      if (roles && roles.length > 0 && !roles.includes(claims.role)) {
        return c.json({ error: 'forbidden' }, 403);
      }
      c.set('user', claims);
      await next();
    } catch {
      return c.json({ error: 'invalid_token' }, 401);
    }
  };
}
