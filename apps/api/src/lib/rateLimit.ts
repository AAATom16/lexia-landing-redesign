import type { Context, Next } from 'hono';
import type { AppEnv } from './middleware.js';

type Bucket = { count: number; resetAt: number };
type RouteBuckets = Map<string, Bucket>; // keyed by apiKey.id

// Each route group has its own buckets map so windows don't bleed across routes.
const stores: Record<string, RouteBuckets> = {};

function getStore(routeKey: string): RouteBuckets {
  if (!stores[routeKey]) stores[routeKey] = new Map();
  return stores[routeKey];
}

// Best-effort cleanup of expired buckets — runs lazily on each request.
function pruneExpired(store: RouteBuckets, now: number) {
  if (store.size < 1000) return;
  for (const [k, b] of store) {
    if (b.resetAt <= now) store.delete(k);
  }
}

export type RateLimitConfig = {
  routeKey: string; // unique identifier for this route+window
  windowSeconds: number;
  max: number;
};

export function rateLimit(config: RateLimitConfig) {
  return async (c: Context<AppEnv>, next: Next) => {
    const apiKey = c.get('apiKey');
    if (!apiKey) return next(); // unauthenticated routes are unrate-limited (or guarded elsewhere)

    const store = getStore(config.routeKey);
    const now = Date.now();
    pruneExpired(store, now);

    const bucket = store.get(apiKey.id);
    if (!bucket || bucket.resetAt <= now) {
      store.set(apiKey.id, { count: 1, resetAt: now + config.windowSeconds * 1000 });
      c.header('X-RateLimit-Limit', String(config.max));
      c.header('X-RateLimit-Remaining', String(config.max - 1));
      return next();
    }

    if (bucket.count >= config.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfterSec));
      c.header('X-RateLimit-Limit', String(config.max));
      c.header('X-RateLimit-Remaining', '0');
      return c.json(
        {
          error: {
            code: 'rate_limited',
            message: `Rate limit exceeded. Retry after ${retryAfterSec}s.`,
          },
        },
        429,
      );
    }

    bucket.count++;
    c.header('X-RateLimit-Limit', String(config.max));
    c.header('X-RateLimit-Remaining', String(config.max - bucket.count));
    await next();
  };
}

// Compose multiple limits (e.g. 60/min AND 5000/day).
export function rateLimitMulti(configs: RateLimitConfig[]) {
  const middlewares = configs.map((c) => rateLimit(c));
  return async (c: Context<AppEnv>, next: Next) => {
    let idx = 0;
    const run = async (): Promise<void> => {
      if (idx >= middlewares.length) return next();
      const mw = middlewares[idx++];
      await mw(c, run);
    };
    await run();
  };
}
