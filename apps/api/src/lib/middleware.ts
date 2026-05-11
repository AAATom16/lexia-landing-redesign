import type { Context, Next } from 'hono';
import type { ApiKey, Partner, UserRole } from '@prisma/client';
import { verifyToken, type SessionClaims } from './auth.js';
import { hashApiKey, parseApiKey, timingSafeEqualHex } from './apiKeys.js';
import { prisma } from './db.js';

export type AppEnv = {
  Variables: {
    user: SessionClaims;
    partner: Partner;
    apiKey: ApiKey;
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

export function apiKeyAuth(requiredScopes: string[] = []) {
  return async (c: Context<AppEnv>, next: Next) => {
    const header = c.req.header('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return c.json({ error: { code: 'unauthorized', message: 'Missing Authorization header.' } }, 401);
    }
    const parsed = parseApiKey(match[1]);
    if (!parsed) {
      return c.json({ error: { code: 'invalid_key_format', message: 'Expected format: lxa_(live|test)_<8hex>_<secret>.' } }, 401);
    }

    const key = await prisma.apiKey.findUnique({
      where: { prefix: parsed.prefix },
      include: { partner: true },
    });
    if (!key) {
      return c.json({ error: { code: 'invalid_key', message: 'API key not recognized.' } }, 401);
    }

    if (!timingSafeEqualHex(hashApiKey(parsed.full), key.hash)) {
      return c.json({ error: { code: 'invalid_key', message: 'API key not recognized.' } }, 401);
    }
    if (key.revokedAt) {
      return c.json({ error: { code: 'key_revoked', message: 'API key has been revoked.' } }, 401);
    }
    if (key.expiresAt && key.expiresAt < new Date()) {
      return c.json({ error: { code: 'key_expired', message: 'API key has expired.' } }, 401);
    }
    if (key.partner.status !== 'ACTIVE') {
      return c.json({ error: { code: 'partner_inactive', message: `Partner status: ${key.partner.status}.` } }, 403);
    }

    for (const scope of requiredScopes) {
      if (!key.scopes.includes(scope)) {
        return c.json({ error: { code: 'insufficient_scope', message: `Missing scope: ${scope}.` } }, 403);
      }
    }

    // Fire-and-forget update of lastUsedAt (don't block request).
    prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

    c.set('partner', key.partner);
    c.set('apiKey', key);
    await next();
  };
}
