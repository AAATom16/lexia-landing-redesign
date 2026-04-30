# @lexia/api

Backend service for Lexia: auth + contract drafts persistence.

Stack: Hono · Prisma · Postgres · JWT (jose) · bcryptjs · Zod.

## Local development

```bash
# 1. Install workspace deps from repo root
pnpm install

# 2. Provision a local Postgres (one option: docker)
docker run -d --name lexia-pg -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lexia postgres:16

# 3. Configure env
cp apps/api/.env.example apps/api/.env
# edit apps/api/.env: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lexia
#                    JWT_SECRET=$(openssl rand -hex 32)

# 4. Migrate + seed
cd apps/api
pnpm db:migrate:dev
pnpm db:seed

# 5. Run
pnpm dev
# -> http://localhost:3001/healthz
```

## Endpoints

| Method | Path             | Auth                | Notes                           |
|--------|------------------|---------------------|---------------------------------|
| GET    | `/healthz`       | —                   | Liveness probe                  |
| POST   | `/auth/login`    | —                   | Returns JWT + user              |
| POST   | `/auth/register` | —                   | Creates customer (default role) |
| GET    | `/auth/me`       | Bearer              | Current session profile         |
| GET    | `/drafts`        | Bearer              | Own drafts (admin sees all)     |
| GET    | `/drafts/:id`    | Bearer              | Owner or admin                  |
| POST   | `/drafts`        | Bearer              | Create draft                    |
| PATCH  | `/drafts/:id`    | Bearer              | Update                          |
| DELETE | `/drafts/:id`    | Bearer              | Delete                          |

JWT TTL = 7 days. Send as `Authorization: Bearer <token>`.

## Railway deploy

The web SPA already deploys from the repo root using the root `railway.json`.
For the API, create a **second service** in the same Railway project:

1. **New Service → GitHub Repo** → pick this repo.
2. **Settings → Service → Root Directory** = `apps/api`.
   This makes Railway pick up `apps/api/railway.json` and only watch that subtree.
3. **Variables**:
   - `DATABASE_URL` — auto-injected when you add the Postgres plugin and link it.
   - `JWT_SECRET` — paste output of `openssl rand -hex 32`.
   - `CORS_ORIGINS` — `https://<your-web-domain>`, comma-separated for multiple.
   - `NODE_ENV=production`.
4. **Add Plugin → PostgreSQL** to the project; it gives you `DATABASE_URL`. Link it
   to this service (Variables tab → "Add Reference" → pick the Postgres plugin).
5. The build command runs `prisma generate` + `tsc`; the start command runs
   `prisma migrate deploy` then boots the server. Migrations apply automatically
   on every deploy.
6. **Healthcheck** is wired to `/healthz` in `railway.json`.

Once the API is up, set the web service variable `VITE_API_URL=https://<api-domain>`
and redeploy the web — the SPA will start hitting the real backend (currently
gated behind `import.meta.env.VITE_API_URL` in `src/app/lib/api.ts`).

## Seeded accounts (after `pnpm db:seed`)

| Email                          | Password    | Role        |
|--------------------------------|-------------|-------------|
| jana.dvorakova@lexia.cz        | lexia123    | ADMIN       |
| tomas.prochazka@lexia.cz       | lexia123    | ADMIN       |
| lukas.vesely@lexia.cz          | lexia123    | ADMIN       |
| info@frenkee.cz                | partner123  | DISTRIBUTOR |
| broker@example.cz              | partner123  | DISTRIBUTOR |
| demo@lexia.cz                  | demo123     | CUSTOMER    |
