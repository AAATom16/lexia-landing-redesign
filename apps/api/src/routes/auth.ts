import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { hashPassword, signToken, verifyPassword } from '../lib/auth.js';
import { authRequired, type AppEnv } from '../lib/middleware.js';

export const authRoutes = new Hono<AppEnv>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).optional(),
  ico: z.string().optional(),
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return c.json({ error: 'invalid_credentials' }, 401);

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return c.json({ error: 'invalid_credentials' }, 401);

  const token = await signToken({ sub: user.id, email: user.email, role: user.role });
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      distributorType: user.distributorType,
      ico: user.ico,
    },
  });
});

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json');
  const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (exists) return c.json({ error: 'email_taken' }, 409);

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash,
      role: body.role ?? UserRole.CUSTOMER,
      ico: body.ico,
    },
  });

  const token = await signToken({ sub: user.id, email: user.email, role: user.role });
  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  }, 201);
});

authRoutes.get('/me', authRequired(), async (c) => {
  const claims = c.get('user');
  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      id: true, email: true, name: true, role: true,
      distributorType: true, ico: true, parentId: true,
    },
  });
  if (!user) return c.json({ error: 'not_found' }, 404);
  return c.json(user);
});
