# Lexia — technologický background, architektura, zálohování

**Verze:** 0.1 (2026-04-30)
**Repo:** [`AAATom16/lexia-landing-redesign`](https://github.com/AAATom16/lexia-landing-redesign)

Tenhle dokument slouží jako tech-overview pro klienta (LEXIA Legal Protection a.s.) a jeho potenciální oponenturu. Není kompletní engineering spec, ale ukazuje, na čem celé řešení stojí, jak je to nasazené, jak to chráníme a kam se to dá škálovat.

---

## 1. Stack přehledem

### Frontend (web + portály)
- **React 18.3** s **TypeScript 5.7** v [strict módu](https://www.typescriptlang.org/tsconfig#strict). Žádné `any` v naší doméně.
- **Vite 6** jako build tool — velmi rychlý dev server (HMR < 100 ms), produkční build do statického SPA.
- **React Router 7** pro routing. Tři logická prostředí v jedné aplikaci (web / `/portal/*` / `/crm/*`) sdílí komponenty + design system.
- **Tailwind CSS 4** + **Radix UI primitivy** (accordion, dialog, dropdown, select, tooltip…) pro accessibility a konzistentní UX.
- **lucide-react** ikony, **recharts** pro grafy, **date-fns** pro datumy, **canvas-confetti** pro mikro-animace.
- Validace: **react-hook-form** + **zod** schémata (sdílené se serverem přes `@hono/zod-validator`).

### Backend API (`apps/api/`)
- **Hono 4** — moderní, rychlý webový framework (Edge-ready, malý footprint).
- **Node.js 22** s ES Modules, runtime přes `@hono/node-server`.
- **Prisma 5** ORM se striktně typovanými modely. Schema v `apps/api/prisma/schema.prisma`.
- **PostgreSQL 18** jako primární datastore (Railway managed plugin).
- **JWT auth** — token podepsaný pomocí **HS256** přes `jose`, životnost 7 dní, audience/issuer claims pro defense-in-depth.
- **bcryptjs** pro hashování hesel (10 rounds, cost faktor je rozumný kompromis pro server-side login).
- **CORS** přes `hono/cors` s allowlistem domén; v dev `localhost:5173`, v produkci jen `https://lexia-web-production.up.railway.app` (v jedné variable, snadno se přidá další doména).
- Logging přes `hono/logger` — přístupový log + chyby do stdout.

### Hosting + DevOps
- **Railway** — celá platforma na jednom účtu. Tři služby + jedna databáze:
  - `lexia-web` (web SPA, `serve -s dist`)
  - `lexia-api` (Hono API)
  - `Postgres` (managed plugin, automatické backupy)
- **Nixpacks** (Railway default) staví obě služby z monorepa. API má vlastní `apps/api/railway.json` s `migrate deploy` na startu.
- **Public domény** přes Railway:
  - https://lexia-web-production.up.railway.app
  - https://lexia-api-production-aac2.up.railway.app
  - Po vyladění lze přidat custom domain (`portal.lexia.cz`, `crm.lexia.cz`).
- **Deploy z Gitu** — push do `main` ⇒ Railway autodeploy. Pro mezikroky se používá `railway up` (CLI, ~30 s build).
- Kanonický flow: feature branch → PR → squash do `main` → autodeploy.

### Repo struktura
```
.
├── src/                      # Web SPA (root package "@figma/my-make-file")
│   └── app/
│       ├── components/       # Sdílené UI (calculator, drafts, help, onboarding, partners, …)
│       ├── domain/           # Doménový model — produkty, pilíře, tarify, calculator engine
│       ├── lib/              # auth.ts, drafts.ts, api.ts (klient pro API)
│       └── pages/            # HomePage, LoginPage, AccountPage, /portal/*, /crm/*
├── apps/
│   └── api/                  # Backend (`@lexia/api`)
│       ├── src/
│       │   ├── lib/          # db, auth, middleware
│       │   ├── routes/       # auth, drafts, leads, customer, legalCases
│       │   └── server.ts
│       └── prisma/
│           ├── schema.prisma
│           ├── migrations/   # SQL migrace pod git
│           └── seed.ts
├── docs/                     # uzivatelska-prirucka.md, architektura.md, zadani-vyvoj.md
├── pnpm-workspace.yaml       # `.` + `apps/*`
└── railway.json              # web service config
```

Monorepo přes **pnpm workspaces**. Jeden `pnpm-lock.yaml` pro celé řešení.

---

## 2. Architektura aplikace

### Logické vrstvy

```
┌────────────────────────────────────────────────────────────────────┐
│  Web SPA (lexia-web-production)                                    │
│  · Veřejná část: kalkulačka → /leads → CRM lead                    │
│  · /prihlaseni + /ucet  — zákazník (role CUSTOMER)                 │
│  · /portal/*           — externí distributor (role DISTRIBUTOR)    │
│  · /crm/*              — interní zaměstnanec Lexia (role ADMIN)    │
└──────────────────────────────┬─────────────────────────────────────┘
                  HTTPS  +  Bearer JWT (Authorization)
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  Hono API (lexia-api-production)                                   │
│  · /auth (login, register, me)                                     │
│  · /leads (public POST — anonymous, ostatní authn)                 │
│  · /drafts (návrhy smluv, owner / admin authz)                     │
│  · /customer/contracts (zákazník vidí jen své)                     │
│  · /legal-cases (právní případy, role-aware)                       │
└──────────────────────────────┬─────────────────────────────────────┘
                       Prisma (TLS, internal network)
                               │
┌──────────────────────────────▼─────────────────────────────────────┐
│  PostgreSQL 18 (Railway managed)                                   │
│  Tables: User, ContractDraft, LegalCase, AuditLog                  │
│  Daily snapshots + WAL backup (Railway)                            │
└────────────────────────────────────────────────────────────────────┘
```

### Doménový model (klíčové entity)

- **`User`** — pojistník / distributor / admin. Pole: `email` (unique), `passwordHash`, `role`, `distributorType` (VZ / DPZ / DJ / SZ-PA / SZ-PM / Tipař), `parentId` (distribuční strom — připraveno pro S5), `inheritCommissions`, `brokerPool`.
- **`ContractDraft`** — návrh smlouvy ze všech zdrojů (web public, partner portal, CRM). Pole: `productCode`, `pillars[]`, `segment`, `clientName`, `clientEmail`, `premiumMonthly`, `premiumYearly`, `inputJson` + `resultJson` (celý snapshot kalkulačky), `commissionModel`, `status` (`DRAFT` → `SENT_TO_CLIENT` → `SIGNED` / `CANCELLED`), `source` (`PUBLIC` / `DISTRIBUTOR` / `CRM`).
- **`LegalCase`** ("Právní případ" — Lexia terminologie) — obdoba pojistné události. Pole dle [zadání 2026-01-16](file:///Users/tomashajek/Downloads/2026-01-16%20claim_modul_zadani_lexia.docx): `caseNumber` (LX-PP-YYYY-NNNN), `policyholderName/Email/Ico`, `isVip`, `productCode`, `pillarCode`, `legalAreaCode`, `claimType`, `caseDate`, `reportedDate`, `policyStart`, `status` (Registrováno / V šetření / Kryto / Zamítnuto / Ukončeno), `model` (Telefonická porada / Samoregulace / Externí likvidace), `reserveExternal` + `reserveInternal`, `paidExternal` + `paidInternal`, `denialReason` (číselník), `denialNote`, vazba na `ContractDraft` přes `contractDraftId`.
- **`AuditLog`** — append-only log: `actorId`, `action`, `entityType`, `entityId`, `payload` (JSON), `createdAt`. Loguje se každá změna návrhu i případu.

### Doménová logika produktu

Jádro produktu — kalkulace pojistného — žije čistě na klientu (`src/app/domain/`). Důvody:

- **Kalkulační engine je deterministický a auditovatelný.** Pure function `calculatePremium(input) → result` bez side-effectů. Stejný input = stejný output. Tarify 2026/04 jsou v `tariffs.ts` a jsou verzovatelné; budoucí změna sazebníku znamená novou verzi `2026/10` se stejnou strukturou.
- **Engine sdílí kód mezi třemi UI surfacy** (web, portal, CRM) — `CalculatorWidget` se chová identicky, jen mění `variant` (public / distributor / admin).
- **Validace pilířů a územního rozsahu** dle PDF Lexia 2026-03 (Pilíř I povinný, doplňky bydlení vyžadují Pilíř II atd.). Validace probíhá při výpočtu i při ukládání.

### Rozdíly mezi prostředími

| | Web (`/`) | Klientská zóna (`/ucet`) | Partner portal (`/portal`) | CRM (`/crm`) |
|---|---|---|---|---|
| Login | ne | role `customer` | role `distributor` | role `admin` |
| Kalkulačka | ano (veřejná) | — | ano (s provizí) | ano (interní) |
| Návrhy smluv | — | jen vlastní podepsané | vlastní | všechny zdroje |
| Lifecycle smlouvy | — | náhled | Návrh → Odesláno → Podepsáno | Návrh → Odesláno → Podepsáno |
| Právní případy | — | jen vlastní (čte) | — | full list + detail |
| Distribuční modul | — | — | (S5 plán) | (S5 plán) |
| KPI dashboard | — | — | portfolio partnera | global obchod |

---

## 3. Bezpečnost

### Autentizace + autorizace
- **Hashování hesel** — `bcryptjs` s 10 rounds. Žádné heslo neopouští server v cleartext.
- **JWT tokeny** — HS256, 7 denní expirace, audience `lexia-clients`, issuer `lexia-api`. Token je v `localStorage` (kompromis mezi UX a bezpečností; pro vyšší tier lze přejít na httpOnly cookie + CSRF tokeny).
- **Role-aware authz** — middleware `authRequired([roles])` na každém chráněném endpointu. CRM-only operace vyžadují `ADMIN`. Customer endpoint `/customer/contracts` vrací jen řádky kde `clientEmail = JWT.email`.
- **Privilege escalation defense** — `/auth/register` ignoruje `role: ADMIN` v request body a falls back na `CUSTOMER`. Admin se vytváří jen seed scriptem.

### Síťová vrstva
- **HTTPS-only.** Railway auto-zajištěné Let's Encrypt + HSTS přes Cloudflare CDN.
- **CORS allowlist** — origin musí být na seznamu, jinak `null`. Wildcard `*` se nepoužívá.
- **Rate limiting** — zatím není explicit, Railway edge má základní DDoS mitigaci. Pro produkční tier doporučujeme přidat `hono-rate-limiter` na `/auth/login` a `/leads`.

### Citlivá data
- **Hesla** v DB jen jako hash. Plaintext neexistuje nikde, ani v lozích.
- **JWT_SECRET** je 32-byte náhodný klíč (`openssl rand -hex 32`), uložený jako Railway environment variable, nikdy v gitu.
- **`DATABASE_URL`** s heslem je injectovaná Railway pluginem, mezi službami chodí přes interní private network (`postgres.railway.internal:5432`), ne veřejný internet.
- **Audit log** zachycuje kdo + kdy + co. Pro GDPR audit (právo na výpis / vymazání) je log dohledatelný přes `entityId`.

### Compliance
- **GDPR** — rámec respektován, k dotažení zbývá: explicitní consent management, mechanismus pro „právo být zapomenut" (delete cascade na User), data retention policy. Tohle pošleme jako samostatný soft-launch krok.
- **ČNB — provoz zprostředkovatele** — Lexia je MGA pro Colonnade Insurance S.A., stávající vnitřní procesy stačí; aplikace pouze digitalizuje workflow.
- **PCI DSS** — neaplikuje se, nepracujeme s kartami; platby jsou mimo aplikaci (Lexia účet).

---

## 4. Datové úložiště + zálohování

### PostgreSQL na Railway
- Managed plugin, **PostgreSQL 18**, primary instance v regionu `us-east4`.
- Disk je perzistentní volume; failover při hardwarové chybě je automatický (Railway SLA).
- **Spojení je TLS-only** (vyžadováno připojovacím stringem `?sslmode=require`).

### Migrace
- **Prisma migrations** verzované v gitu (`apps/api/prisma/migrations/`).
- Při každém deployi API běží `prisma migrate deploy` — aplikuje pending migrace, neaplikuje stejnou dvakrát (idempotentní).
- Schema změny → lokálně `prisma migrate dev --name <name>` → commit → PR → autodeploy aplikuje na prod.
- Datové změny (refactor klientských dat) by se řešily samostatným seed-style skriptem, ne migrací.

### Backupy
- **Automatické daily snapshots** (Railway managed, retence 7 dní v Hobby tieru, lze prodloužit na Pro).
- **Point-in-time recovery (PITR)** přes WAL archive — Railway Pro tier umožňuje obnovu na libovolný okamžik za posledních 7 dní.
- **Manuální export** kdykoli z dashboardu (`pg_dump` přes Railway proxy):
  ```bash
  pg_dump "$DATABASE_PUBLIC_URL" > lexia-backup-$(date +%F).sql
  ```
- **Restore** — z dashboardu (1-click rollback na snapshot) nebo `pg_restore`.

Pro zvýšenou redundanci doporučujeme přidat **off-site backup**:
1. Cron job (Railway scheduled) každou noc spustí `pg_dump` a uploadne šifrovaný dump do Cloudflare R2 / AWS S3 (mimo Railway).
2. Retence 30 dní, weekly + monthly long-term.

Tohle nasadíme jakmile dáme green-light na produkční start.

### Soubory (PDF, dokumenty)
- Aktuálně **placeholder** — PDF generátor zatím není napojen.
- Plán: **MinIO** (self-hosted S3) jako Railway service NEBO **Cloudflare R2** (lacinější egress). Vrstva přístupu přes pre-signed URL z API (TTL např. 5 min), žádný přímý přístup z prohlížeče bez podpisu.

---

## 5. Provoz, monitoring, observability

### Co teď funguje
- **Healthcheck** API na `/healthz` — Railway na něj poke každých 30 s, při výpadku auto-restart.
- **Logy** v Railway dashboardu (build + runtime), keypress search, retence ~30 dní.
- **Error tracking** — zatím jen `console.error`. Připravit `Sentry` pro frontend i backend je 2-hodinová práce.

### Co je nutné dotáhnout pro produkci

| Vrstva | Stav | Poznámka |
|---|---|---|
| Healthcheck | ✓ | `/healthz` |
| Auto-restart | ✓ | Railway `restartPolicyType: ON_FAILURE` |
| Logy | ✓ | Railway logging |
| Error tracking | TODO | Sentry (FE + BE) |
| Performance monitoring | TODO | Sentry / Vercel Analytics |
| Rate limiting | TODO | `/auth/login`, `/leads` |
| Alerting (Slack / email) | TODO | Railway → Slack webhook |
| Off-site backup | TODO | Cron `pg_dump` → S3 |
| Penetration test | TODO | Před produkčním launchem |
| Audit DPO / GDPR | TODO | Spec retention + export endpoint |

---

## 6. CI / CD

- **Lint + typecheck** — TS strict v editoru; CI pipeline zatím není explicitní (lze přidat `tsc --noEmit` + `eslint` jako GitHub Action, 30 minut práce).
- **Tests** — Vitest pro doménovou logiku (kalkulace, validace stromu) je v plánu. Playwright pro E2E happy-path.
- **Deploy** — push do `main` ⇒ Railway autodeploy obou služeb. Migrace DB poběží automaticky díky `migrate deploy` v startCommand.
- **Rollback** — Railway dashboard 1-click rollback na předchozí deployment. DB rollback přes Prisma `migrate resolve` + manuální revert SQL.

---

## 7. Budoucí škálování

### Krátkodobě (MVP → 1.0)
- Off-site DB backup do S3.
- Sentry pro error tracking.
- Rate limit + bot ochrana na public endpointech.
- E2E testy (Playwright happy-path: registrace partner → kalkulace → uložení → podpis → výpis v CRM).

### Střednědobě (S5 — distribuční modul)
- Distribuční strom + provize jsou v Prisma schématu připravené (parent/children, inheritCommissions, brokerPool).
- Audit log struktury (převody) — `transferLog` table.
- Server-side PDF generátor (puppeteer) v samostatném service (z důvodu memory).

### Při růstu
- **Frontend**: code-splitting per route (CRM, Portal, Web) — současný bundle 240 kB gzipped, dělitelný snadno.
- **Backend**: Hono je stateless, horizontální škálování je lineární. PostgreSQL replication + read replicas v Railway Pro tier.
- **CDN**: Railway už používá Fastly; pro statiku z R2 jde přes Cloudflare CDN.
- **Multi-region**: Railway umí multi-region, momentálně `us-east4`. Pro CZ traffic by stálo za to přesunout na `europe-west4` (latence z FRA cca 8 ms vs. 100 ms US).

---

## 8. Co si od nás můžete převzít / auditovat

- **Repo na GitHubu** (private/internal). Pull requesty s historií změn, každý feature dohledatelný.
- **Prisma schema + migrace** — auditovatelný change log databáze.
- **Audit log** v DB — kdo + co + kdy.
- **Architecture decision records** — TODO, doporučujeme začít psát při přechodu z MVP na 1.0.
- **Documentation v repu** — `docs/uzivatelska-prirucka.md` (česky pro uživatele Lexie), `docs/architektura.md` (tento dokument), `docs/zadani-vyvoj.md` (sprintový plán).

---

## 9. Kontaktní info

- **Tech-lead / vývoj:** Tomáš Hájek (tomas.hajek)
- **Repo:** github.com/AAATom16/lexia-landing-redesign
- **Railway projekt:** lexia-landing-redesign (`af7c02d6-30fc-4393-9106-08b3b664dea1`)
- **Preview prostředí:** https://lexia-web-production.up.railway.app · https://lexia-api-production-aac2.up.railway.app
