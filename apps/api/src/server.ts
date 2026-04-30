import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth.js';
import { draftRoutes } from './routes/drafts.js';
import { leadRoutes } from './routes/leads.js';
import { customerRoutes } from './routes/customer.js';
import { legalCaseRoutes } from './routes/legalCases.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((s) => s.trim());
      if (!origin) return allowed[0];
      return allowed.includes(origin) ? origin : null;
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.get('/healthz', (c) => c.json({ ok: true, service: 'lexia-api', version: '0.0.1' }));

app.route('/auth', authRoutes);
app.route('/drafts', draftRoutes);
app.route('/leads', leadRoutes);
app.route('/customer', customerRoutes);
app.route('/legal-cases', legalCaseRoutes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));
app.onError((err, c) => {
  console.error('[api] unhandled', err);
  return c.json({ error: 'internal_error' }, 500);
});

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[lexia-api] listening on http://localhost:${info.port}`);
});
