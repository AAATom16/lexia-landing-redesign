# Lexia API — Sandbox setup

**Cíl:** oddělené sandbox prostředí pro partnery v procesu integrace, které **nedotýká produkčních dat ani lifecycle webhooků**.

## Stav (2026-05-11)

Dnes Lexia běží **jednoinstančně**: jedna `lexia-api` služba, jedna Postgres DB. `lxa_test_…` API klíče i `lxa_live_…` klíče sdílí stejnou DB. Test data jsou rozpoznatelná notes prefixem `[TEST]`, account lookup je environmentem oddělen serverovou logikou.

Tohle stačí pro vývoj a interní QA. Jakmile partner vstoupí do **produkčního pilotu**, oddělíme sandbox do vlastní Railway služby.

## Cílový stav po nasazení sandboxu

```
Railway projekt: lexia-landing-redesign
├── Postgres (production)         <- live data
├── lexia-api (production)        <- /healthz + /v1/*
├── lexia-web (production)        <- SPA
├── Postgres-sandbox (volitelné)  <- oddělená DB pro test
└── lexia-api-sandbox             <- nová služba
    ├── DATABASE_URL = ${{Postgres-sandbox.DATABASE_URL}}
    ├── JWT_SECRET = <jiný než prod>
    ├── CORS_ORIGINS = https://kalkulacka-test.partner.cz,…
    ├── NODE_ENV = production
    └── WEBHOOKS_DISABLED = 1   ← sandbox nemá doručovat webhooky
```

## Postup nasazení sandbox služby

### 1. Vytvořit novou Postgres DB pro sandbox (doporučeno)

V Railway dashboardu projektu **lexia-landing-redesign**:

1. **+ New → Database → PostgreSQL** — pojmenovat `Postgres-sandbox`.
2. Z tabu **Connect** zkopírovat `DATABASE_URL`.

> Lze nasadit i **bez oddělené DB** (sandbox sdílí stejnou DB s live). V tom případě se test data poznají jen podle `[TEST]` prefixu v `notes`. Pro produkční pilot doporučujeme oddělenou DB — sandbox pak může mít odlišný seed (testovací slevy, fiktivní obchodníky), aniž by to ovlivnilo živé operace.

### 2. Vytvořit novou službu `lexia-api-sandbox`

1. **+ New → GitHub Repo → AAATom16/lexia-landing-redesign**.
2. Settings → **Service → Service Name** = `lexia-api-sandbox`.
3. Settings → **Service → Root Directory** = `apps/api`.
4. Settings → **Service → Watch Paths** = `apps/api/**, packages/lexia-domain/**`.
5. Settings → **Service → Config-as-code path** = `apps/api/railway-sandbox.json`.

### 3. ENV variables

| Klíč | Hodnota |
|---|---|
| `DATABASE_URL` | reference na `Postgres-sandbox.DATABASE_URL` (případně sdílená s prod) |
| `JWT_SECRET` | `openssl rand -hex 32` (jiný než produkční) |
| `CORS_ORIGINS` | URL partnerských sandbox kalkulaček, čárkami |
| `NODE_ENV` | `production` |
| `WEBHOOKS_DISABLED` | `1` — vypne worker, sandbox nedoručuje real webhooky |

### 4. Public domain

Settings → **Networking → Public Networking → Generate Domain** → `lexia-api-sandbox.up.railway.app`.

Update sandbox sekce v [docs/partner-api.md](partner-api.md) na novou URL.

### 5. Vytvoření prvních test API klíčů

Po prvním deploy:

```bash
# Lokálně se přihlásit do CRM (lexia-web prod) jako ADMIN
# Otevřít detail partnera → API klíče → Vygenerovat klíč → environment "TEST"
# Klíč se zobrazí jednou, předat partnerovi šifrovaným kanálem
```

Klíče s prefixem `lxa_test_…` budou v sandbox API plně funkční. V live API stejné klíče také projdou middleware-em (sdílená tabulka `ApiKey`), ale v live prostředí je můžeme buď:
- **Tolerovat** (current state — jen označit notes prefixem `[TEST]`)
- **Blokovat** (přidat env `BLOCK_TEST_KEYS=1` do live API — middleware je odmítne)

Pro produkční pilot doporučujeme **blokovat** test klíče v live API.

## Behavior matrix

| Akce | LIVE klíč v live API | TEST klíč v live API (dnes) | TEST klíč v sandbox API |
|---|---|---|---|
| `POST /v1/leads` | ✅ vytvoří draft, notes bez prefixu | ✅ vytvoří draft, notes `[TEST]` | ✅ |
| `GET /v1/account` | jen ne-test drafty | jen `[TEST]` drafty | jen `[TEST]` drafty |
| Webhook delivery | ✅ produkce | ✅ (sdílí worker) | ❌ (`WEBHOOKS_DISABLED=1`) |
| Commission entries | ✅ | ✅ (smíchané) | ✅ (oddělené když má vlastní DB) |
| CRM viditelnost | normální | filtr `[TEST]` v notes | jiná DB → jiný CRM nepotřebuje |

## Migrace test dat z live → sandbox (pokud zvolíte oddělenou DB)

Před přepnutím partnerů na sandbox URL:

```bash
# Export test drafts z live
psql "$LIVE_DATABASE_URL" -c "
  COPY (SELECT * FROM \"ContractDraft\" WHERE notes LIKE '[TEST]%')
  TO '/tmp/test_drafts.csv' WITH CSV HEADER;
"
# Import do sandbox
psql "$SANDBOX_DATABASE_URL" -c "
  COPY \"ContractDraft\" FROM '/tmp/test_drafts.csv' WITH CSV HEADER;
"
```

Pro produkci: před vyčištěním live DB od `[TEST]` záznamů je nejprve archivujte (audit / dohledatelnost partnerských integračních testů).

## Roadmap k plné izolaci

- [ ] Add `BLOCK_TEST_KEYS` env (block test keys in production API)
- [ ] Add `LIVE_KEYS_REJECTED` env (block live keys in sandbox API — defense in depth)
- [ ] Cron pro **vyčištění starých `[TEST]` dat** v sandboxu (90 dní retence)
- [ ] Status page `status.lexia.cz` se sandbox sekce (nezahrnovaná v prod SLA)
- [ ] Separátní rate limit windows pro test (vyšší — partner experimentuje)
