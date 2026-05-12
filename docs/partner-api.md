# Lexia Partner API — sjednání pojištění právní ochrany

**Verze dokumentu:** 1.0 (2026-05-11)
**Stav API:** v0 (produkční pro lead capture) · v1 (plán pro plné sjednání)
**Repo:** [`AAATom16/lexia-landing-redesign`](https://github.com/AAATom16/lexia-landing-redesign)
**Kontakt:** Tomáš Hájek — tech-lead, `tomas.hajek@…`

---

## 0. Shrnutí pro netrpělivé

Lexia API umožňuje partnerovi (broker, srovnávač, distributor, B2B platforma) **zapojit sjednání pojištění právní ochrany přímo do vlastní kalkulačky** — partner zobrazí formulář, my dostaneme zaznamenanou poptávku (lead) do CRM Lexia, klienta v ní dotáhneme k podpisu smlouvy.

### Co API umí dnes (v0)

| Schopnost | Endpoint | Stav |
|---|---|---|
| Vytvoření leadu z kalkulačky partnera | `POST /leads` | ✅ produkce |
| Login / register / me (pro distributory s portálem) | `POST /auth/*` | ✅ produkce |
| Klientská zóna (CRUD smluv klienta) | `/customer/*` | ✅ produkce |
| CRUD návrhů smluv (interní, JWT-auth) | `/drafts/*` | ✅ produkce |
| Právní případy (interní CRM) | `/legal-cases/*` | ✅ produkce |

### Co musí být doplněno pro produkční partnerskou integraci (v1)

| Schopnost | Stav | Důvod |
|---|---|---|
| **API klíče pro partnery** (per-partner identita, scoping, revokace) | 🟡 plán | Dnes je `POST /leads` anonymní — nelze rozlišit partnera, atribuovat provizi, nastavit limit, ani revokovat klíč. |
| **Server-side kalkulátor** `POST /calculator/preview` | 🟡 plán | Kalkulační engine + tarify 2026/04 dnes žijí jen v SPA (`src/app/domain/`). Aby partner nemusel přepisovat tarify do své kalkulačky, vystavíme je jako endpoint. |
| **Číselníky jako endpointy** `/products`, `/pillars`, `/tariffs`, `/vehicle-types` | 🟡 plán | Verzování tarifů (2026/04 → 2026/10) bez nasazení nového release partnera. |
| **Lifecycle webhook** (`draft.signed`, `draft.cancelled`) | 🟡 plán | Aby partner věděl, kdy se z leadu stala podepsaná smlouva (provize, status v jeho UI). |
| **Lookup endpoint pro vytvořený lead** `GET /leads/:id` (autentizovaný klíčem) | 🟡 plán | Partner si dnes nemůže ověřit stav leadu, který poslal. |
| **Rate limit + idempotency klíč** | 🟡 plán | Bot ochrana, retry-safe POST. |

Pokud partner potřebuje dnes start, **lze pracovat s v0 endpointem `POST /leads`** — kalkulační logiku v0 partner replikuje podle sekce [§5 Kalkulační pravidla](#5-kalkulační-pravidla-a-tarify-202604), partner se odlišuje stringem v `notes` poli (workaround). Pro plný launch se v1 dotáhne na základě této specifikace.

---

## 1. Glosář pojmů

| Termín | Význam |
|---|---|
| **Produkt** | Jeden ze tří hlavních produktů Lexie: `INDIVIDUAL`, `BUSINESS`, `DRIVERS_VEHICLES`. |
| **Pilíř** | Modul produktu (Pilíř I — základ, Pilíř II — bydlení, …). Pilíř I je vždy povinný. Klient si skládá rozsah z dostupných pilířů. |
| **Segment** | Pouze pro `INDIVIDUAL`: `individual` (jednotlivec) nebo `household` (domácnost). |
| **Pojistné** | Cena pojištění. `premiumMonthly` (měsíční), `premiumYearly` (roční, obvykle = monthly × 12). |
| **Lead** | Poptávka ze strany klienta — má jméno, e-mail, vypočtené pojistné, vybrané pilíře. V CRM Lexia se uloží jako `ContractDraft` se `source = "PUBLIC"`. |
| **Draft** | Návrh smlouvy. Po manuální / automatické proceduře v CRM přechází přes `SENT_TO_CLIENT` na `SIGNED` (klient podepsal) nebo `CANCELLED`. |
| **Distributor** | Lexia partner v rámci jejich portálu (`/portal`). Má JWT identitu. Partner kalkulačky **není distributor**; partner volá API přes API klíč (v1). |
| **Tarify 2026/04** | Verze sazebníku. Plné hodnoty viz [§5](#5-kalkulační-pravidla-a-tarify-202604). |

---

## 2. Prostředí a base URL

| Prostředí | Base URL | Účel |
|---|---|---|
| **Sandbox** | `https://lexia-api-sandbox.up.railway.app` *(plán)* | Volný přístup pro vývoj, testovací data, žádné finanční dopady. |
| **Produkce** | `https://lexia-api-production-aac2.up.railway.app` | Ostrá data — každý lead se předá obchodu Lexia. |

Health-check je vždy dostupný:

```
GET /healthz → 200 { "ok": true, "service": "lexia-api", "version": "0.0.1" }
```

V0 v sandboxu i produkci sdílí jednu URL (rozdíl je v CORS allowlistu a v tom, že produkční leady jdou do CRM). Sandbox URL bude oddělená v v1.

---

## 3. Autentizace

### v0 — anonymní POST /leads

`POST /leads` dnes **nepožaduje autentizaci**. Tělo požadavku obsahuje všechna data potřebná k vytvoření poptávky. Identifikace partnera se v0 řeší **konvencí v poli `notes`**:

```json
"notes": "partner=frenkee.cz; ref=calc-2026-05; userAgent=…"
```

Tohle není dostatečné pro produkční nasazení (kdokoli může POST falšovat) — produkční ostré spuštění čeká na API klíče.

### v1 — API klíče (plán)

```
Authorization: Bearer lxa_live_3f2c…   ← partner key
Authorization: Bearer lxa_test_a8c4…   ← sandbox key
```

**Vlastnosti API klíče:**

- Generuje admin Lexia z CRM (`/crm/partners` → karta partnera → "Vygenerovat API klíč").
- Prefix `lxa_live_` (produkce) / `lxa_test_` (sandbox).
- 32 bajtů náhodných (URL-safe base64), zobrazí se právě jednou při vytvoření.
- Lze revokovat / rotovat. Zneplatnění je okamžité.
- Scoping: každý klíč má atribut `partnerId` + `scopes` (`leads:write`, `calculator:read`, `webhook:receive`).
- Lead vytvořený přes klíč automaticky dostane atribut `partnerId` v audit logu i v draftu.

**Bezpečnost klíčů:**

- Klíč nikdy nedávejte do front-endu / mobilní aplikace partnera — voláte API z back-endu.
- V případě úniku okamžitě rotujte v CRM Lexia.
- Pro browser-side integraci (typicky srovnávač s formulářem) doporučíme variantu **signed payload** přes server-to-server proxy partnera.

---

## 4. Datový model — číselníky

### 4.1 Produkty (`productCode`)

| Kód | Cílová skupina | Pilíře |
|---|---|---|
| `INDIVIDUAL` | B2C, jednotlivci a domácnosti | `IND_BASIC` (povinný), `IND_HOUSING`, `IND_EMPLOYMENT`, `IND_VEHICLES`, `IND_DRIVERS` |
| `BUSINESS` | B2B, OSVČ až korporace | `BIZ_BASIC` (povinný), `BIZ_EMPLOYMENT`, `BIZ_PREMISES`, `BIZ_CONTRACT_DISPUTES`, `BIZ_VEHICLES`, `BIZ_DRIVERS` |
| `DRIVERS_VEHICLES` | Flotily a samostatná vozidla | `DV_VEHICLES`, `DV_DRIVERS` |

### 4.2 Pilíře (`pillarCode`)

#### INDIVIDUAL

| Kód | Název | Povinný | Závislost |
|---|---|---|---|
| `IND_BASIC` | Pilíř I — Základní právní ochrana | ✓ | — |
| `IND_HOUSING` | Pilíř II — Právní ochrana bydlení | — | vyžaduje `IND_BASIC` |
| `IND_EMPLOYMENT` | Pilíř III — Pracovněprávní ochrana | — | vyžaduje `IND_BASIC` |
| `IND_VEHICLES` | Pilíř IV — Právní ochrana vozidel | — | vyžaduje `IND_BASIC` |
| `IND_DRIVERS` | Pilíř V — Právní ochrana řidičů | — | vyžaduje `IND_BASIC` |
| `IND_HOUSING_2ND` | (doplněk) Další nemovitost | — | vyžaduje `IND_HOUSING` |
| `IND_HOUSING_RENTAL` | (doplněk) Pronajímaná nemovitost | — | vyžaduje `IND_HOUSING` |
| `IND_HOUSING_CONSTRUCTION` | (doplněk) Nemovitost ve výstavbě | — | vyžaduje `IND_HOUSING` |
| `IND_EMPLOYMENT_MANAGER` | (doplněk) Manažerská právní ochrana | — | vyžaduje `IND_EMPLOYMENT` |

#### BUSINESS

| Kód | Název | Povinný |
|---|---|---|
| `BIZ_BASIC` | Pilíř I — Základní podnikatelská | ✓ |
| `BIZ_EMPLOYMENT` | Pilíř II — Pracovněprávní spory | — |
| `BIZ_PREMISES` | Pilíř III — Komerční prostory | — |
| `BIZ_CONTRACT_DISPUTES` | Pilíř IV — Smluvní spory | — |
| `BIZ_VEHICLES` | Pilíř V — Vozidla | — |
| `BIZ_DRIVERS` | Pilíř VI — Řidiči | — |

#### DRIVERS_VEHICLES

| Kód | Název |
|---|---|
| `DV_VEHICLES` | Pojištění vozidel (samostatně) |
| `DV_DRIVERS` | Pojištění řidičů (samostatně) |

### 4.3 Segmenty (`segment`)

Pouze pro `INDIVIDUAL`:

| Kód | Popis |
|---|---|
| `individual` | Jednotlivec — nižší sazby. |
| `household` | Domácnost (až 5 osob) — vyšší sazby. |

Pro `BUSINESS` a `DRIVERS_VEHICLES` se pole `segment` nepoužívá.

### 4.4 Územní rozsah (`territorialScope`)

| Kód | Popis |
|---|---|
| `CZ` | Pouze Česká republika (default). |
| `EUROPE` | Rozšířený rozsah na Evropu (+ příplatek, viz tarify produktové verze). |

### 4.5 Typy vozidel (`vehicles[].type`)

| Kód | Popis |
|---|---|
| `car_under_3_5t` | Osobní vozidlo do 3,5 t |
| `truck_under_3_5t` | Nákladní vozidlo do 3,5 t |
| `truck_over_3_5t` | Nákladní vozidlo nad 3,5 t |
| `bus` | Autobus |
| `motorcycle` | Motocykl, tříkolka, čtyřkolka |
| `tractor` | Traktory a ostatní pracovní stroje |
| `trailer_under_750` | Přípojné vozidlo do 750 kg |
| `trailer_over_750` | Přípojné vozidlo nad 750 kg |

### 4.6 Životní cyklus draftu (`status`)

```
DRAFT → SENT_TO_CLIENT → SIGNED
                       ↘ CANCELLED
```

Lead z partnera vždy vzniká ve stavu `DRAFT`. Stav posouvá CRM Lexia nebo klient (podepsání v klientské zóně).

---

## 5. Kalkulační pravidla a tarify 2026/04

> **Zdroj pravdy:** `src/app/domain/tariffs.ts` a `src/app/domain/calculator.ts` v repu. Verze sazebníku: **2026/04**.
> Sazebník je verzovaný — když přijde 2026/10, partneři dostanou minimálně 30 dní předem informaci a v1 endpoint `GET /tariffs?version=2026/10` umožní souběh.

### 5.1 Tarify — INDIVIDUAL (měsíční pojistné v Kč)

| Pilíř | Jednotlivec | Domácnost |
|---|---:|---:|
| `IND_BASIC` | 179 | 269 |
| `IND_HOUSING` | 139 | 159 |
| `IND_HOUSING_2ND` (za každou další nemovitost) | 79 | 89 |
| `IND_HOUSING_RENTAL` | 179 | 179 |
| `IND_HOUSING_CONSTRUCTION` | 819 | 819 |
| `IND_EMPLOYMENT` | 79 | 99 |
| `IND_VEHICLES` (samotný pilíř, vstupní poplatek) | 79 | 99 |
| `IND_DRIVERS` (samotný pilíř, vstupní poplatek) | 59 | 79 |

**Manažerská právní ochrana** (`IND_EMPLOYMENT_MANAGER`) — pokud klient zadá `business.managerSalary` (roční hrubá odměna):
- roční pojistné = `managerSalary × 0.0025`, **minimálně 4 788 Kč/rok**
- měsíční = roční / 12

**Doplňky bydlení** (vyžadují `IND_HOUSING`):
- Stavební parcela: **0,04 Kč/m²/měsíc**
- Pozemková parcela: **0,02 Kč/m²/měsíc**

### 5.2 Tarify — BUSINESS (měsíční pojistné v Kč)

#### Pilíř I (`BIZ_BASIC`) — matice obrat × zaměstnanci

Sloupce = max. roční obrat v mil. Kč. Řádky = max. počet zaměstnanců.

| Zam. \ Obrat | ≤ 2,5 | ≤ 5 | ≤ 10 | ≤ 25 | ≤ 50 | ≤ 100 | ≤ 250 | ≤ 500 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 0 (OSVČ samostatně) | 399 | 499 | 599 | 698 | 798 | 898 | 994 | 1097 |
| ≤ 5 | 499 | 619 | 744 | 868 | 993 | 1118 | 1238 | 1367 |
| ≤ 10 | 599 | 737 | 887 | 1036 | 1186 | 1336 | 1480 | 1635 |
| ≤ 20 | 798 | 974 | 1173 | 1373 | 1572 | 1772 | 1963 | 2171 |
| ≤ 50 | 1197 | 1448 | 1748 | 2047 | 2346 | 2645 | 2933 | 3244 |
| ≤ 100 | 1995 | 2394 | 2893 | 3392 | 3890 | 4389 | 4868 | 5387 |
| ≤ 150 | 2394 | 2849 | 3447 | 4046 | 4644 | 5243 | 5817 | 6440 |
| ≤ 200 | 2793 | 3296 | 3994 | 4692 | 5391 | 6089 | 6759 | 7485 |
| ≤ 250 | 3192 | 3735 | 4533 | 5331 | 6129 | 6927 | 7693 | 8523 |
| ≤ 300 | 3591 | 4166 | 5063 | 5961 | 6859 | 7757 | 8618 | 9552 |
| ≤ 350 | 3990 | 4589 | 5586 | 6584 | 7581 | 8579 | 9536 | 10574 |
| ≤ 400 | 4389 | 5004 | 6101 | 7198 | 8295 | 9393 | 10446 | 11587 |
| ≤ 450 | 4788 | 5410 | 6607 | 7804 | 9001 | 10198 | 11348 | 12592 |
| ≤ 500 | 5187 | 5861 | 7106 | 8403 | 9700 | 10996 | 12241 | 13590 |

> Obrat > 500 mil. Kč **nebo** počet zaměstnanců > 500 → individuální úpis. API vrátí `warning: "individual_underwriting"` a `monthly: 0`. Kalkulačku v takovém případě navedeme klienta na kontakt obchodu Lexia.

#### Pilíř II (`BIZ_EMPLOYMENT`) — měsíční pojistné podle počtu zam.

| Zaměstnanci | Kč/měs |
|---|---:|
| 0 | 0 |
| ≤ 5 | 42 |
| ≤ 10 | 125 |
| ≤ 20 | 250 |
| ≤ 50 | 583 |
| ≤ 100 | 1 250 |
| ≤ 150 | 2 083 |
| ≤ 200 | 2 917 |
| ≤ 250 | 3 750 |
| ≤ 300 | 4 583 |
| ≤ 350 | 5 417 |
| ≤ 400 | 6 250 |
| ≤ 450 | 7 083 |
| ≤ 500 | 7 917 |

#### Pilíř III (`BIZ_PREMISES`) — komerční prostory

Vstup: `buildingSqm`, `buildingPlotSqm`, `landPlotSqm` (m²).

- **Budova:** základ 119 Kč/měs do 250 m², každých dalších započatých 100 m² + 49 Kč
- **Stavební parcela:** základ 99 Kč/měs do 5 000 m², každých dalších započatých 2 500 m² + 39 Kč
- **Pozemková parcela:** základ 119 Kč/měs do 10 000 m², každých dalších započatých 10 000 m² + 59 Kč

Celkový měsíční tarif = součet všech tří složek (klient zadá nenulové).

#### Pilíř IV (`BIZ_CONTRACT_DISPUTES`) — smluvní spory

Vstup: `count` (1 / 5 / 10) × `maxAmount` (Kč).

| Sporů \ Max. částka | 100 000 | 250 000 | 500 000 | 1 000 000 | 2 500 000 | 5 000 000 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 249 | 669 | 999 | 1 499 | 2 249 | 3 359 |
| 5 | 499 | 1 169 | 1 749 | 2 629 | 3 939 | 5 909 |
| 10 | 749 | 1 749 | 2 629 | 3 639 | 5 909 | 8 859 |

### 5.3 Tarify — Vozidla a řidiči

Cena za 1 ks/měsíc v Kč. **„V rámci podniku"** = vozidlo součástí `INDIVIDUAL`/`BUSINESS` smlouvy. **„Samostatně"** = produkt `DRIVERS_VEHICLES`.

| Typ | Var. 1 (podnik / sam.) | Var. 2 (podnik / sam.) |
|---|---|---|
| Osobní do 3,5 t | 149 / 159 | 129 / 139 |
| Nákladní do 3,5 t | 169 / 179 | 149 / 159 |
| Nákladní nad 3,5 t | 239 / 249 | 209 / 219 |
| Autobus | 259 / 269 | 229 / 239 |
| Motocykl, tříkolka, čtyřkolka | 79 / 89 | 69 / 79 |
| Traktory a ostatní stroje | 89 / 99 | 79 / 89 |
| Přípojné do 750 kg | 49 / 59 | 39 / 49 |
| Přípojné nad 750 kg | 119 / 129 | 109 / 119 |

**Řidiči** (`drivers.count` × variant):

| Var. | V rámci podniku | Samostatně |
|---|---:|---:|
| 1 | 119 | 129 |
| 2 | 109 | 119 |

> **Variant** = volba úrovně krytí (1 = vyšší limit / vyšší cena, 2 = nižší limit / nižší cena). Default `1`, partner ji ukáže v UI jako toggle.

### 5.4 Množstevní sleva (vozidla + řidiči)

Aplikuje se na **součet vozidel a řidičů** (počty kusů, ne tarif). Sleva % se odečítá z celkové sumy za vozidla + řidiče:

| Počet kusů | Sleva |
|---|---:|
| ≤ 5 | 0 % |
| ≤ 10 | 4 % |
| ≤ 20 | 8 % |
| ≤ 50 | 12 % |
| ≤ 100 | 16 % |
| ≤ 150 | 20 % |
| ≤ 200 | 24 % |
| ≤ 250 | 28 % |
| ≤ 300 | 32 % |
| ≤ 350 | 36 % |
| ≤ 400 | 40 % |
| ≤ 450 | 44 % |
| ≤ 500 | 48 % |
| > 500 | 48 % (cap) |

### 5.5 Validační pravidla (klient i server)

- Pilíř I produktu je vždy povinný (`IND_BASIC` pro INDIVIDUAL, `BIZ_BASIC` pro BUSINESS).
- Doplňkové pilíře vyžadují svůj parent (např. `IND_HOUSING_2ND` vyžaduje `IND_HOUSING`).
- `premiumYearly` ≈ `premiumMonthly × 12` (povolená odchylka ±5 Kč kvůli zaokrouhlení).
- `premiumMonthly ≥ 0`. Záporné hodnoty server odmítne.
- `clientEmail` musí být validní e-mail (server `email` Zod validator).
- `clientName` minimálně 2 znaky.

---

## 6. Endpoint reference — v0 (produkce)

### 6.1 `POST /leads` — vytvoření poptávky

Veřejný anonymní endpoint. Slouží k zápisu kalkulace z partnerské kalkulačky do CRM Lexia jako `ContractDraft` se `source = "PUBLIC"`.

**Request:**

```http
POST /leads HTTP/1.1
Host: lexia-api-production-aac2.up.railway.app
Content-Type: application/json

{
  "clientName": "Jan Novák",
  "clientEmail": "jan.novak@example.cz",
  "clientPhone": "+420777123456",
  "productCode": "INDIVIDUAL",
  "pillars": ["IND_BASIC", "IND_HOUSING", "IND_EMPLOYMENT"],
  "segment": "individual",
  "premiumMonthly": 397,
  "premiumYearly": 4764,
  "inputJson": { /* viz §6.1.2 */ },
  "resultJson": { /* viz §6.1.3 */ },
  "notes": "partner=frenkee.cz; ref=calc-2026-05-11-9f3a"
}
```

**Validace pole (Zod schema):**

| Pole | Typ | Povinné | Pozn. |
|---|---|---|---|
| `clientName` | string (≥ 2) | ✓ | |
| `clientEmail` | email | ✓ | převede se na lowercase |
| `clientPhone` | string | — | volitelné, doporučené (lepší dohledatelnost) |
| `productCode` | enum | ✓ | `INDIVIDUAL` / `BUSINESS` / `DRIVERS_VEHICLES` |
| `pillars` | string[] (≥ 1) | ✓ | viz §4.2 |
| `segment` | string | — | jen pro `INDIVIDUAL`, viz §4.3 |
| `premiumMonthly` | integer ≥ 0 | ✓ | Kč |
| `premiumYearly` | integer ≥ 0 | ✓ | Kč |
| `inputJson` | object | ✓ | snapshot vstupu kalkulačky — používáme k auditu |
| `resultJson` | object | ✓ | snapshot výsledku kalkulačky |
| `notes` | string | — | identifikace partnera, refID, user-agent |

**Response 201 Created:**

```json
{ "ok": true, "id": "ckxabc123def456" }
```

`id` je CUID `ContractDraft.id`. Uložte ho — později (v1) ho použijete při lookupu / webhook callbacku.

**Response 400 Bad Request:**

```json
{ "error": "request_failed" }
```

(přesný kód viz §8 — v0 vrací jen generický `request_failed`, v1 dotáhneme strukturovaný error model)

#### 6.1.1 Side-efekty vytvoření leadu

Server současně:

1. Vytvoří `ContractDraft` se `status = "DRAFT"`, `source = "PUBLIC"`.
2. Zapíše záznam do `AuditLog` s `action = "lead.public_create"`, `entityId = draft.id`, `payload = { email, name }`.
3. Pole `clientPhone` se uloží do `notes` jako `Telefon: +420…` (CRM operátor vidí v detailu).

#### 6.1.2 Struktura `inputJson`

Snapshot vstupu kalkulačky. Server ho ukládá doslova — partner nemá omezení na klíče. Doporučená struktura (kompatibilní s naším engine):

```ts
type CalculatorInput = {
  productCode: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES';
  segment?: 'individual' | 'household';   // jen INDIVIDUAL
  pillars: PillarCode[];

  // BUSINESS:
  business?: {
    revenueMillions: number;              // roční obrat v mil. Kč
    employees: number;
    premises?: { buildingSqm: number; buildingPlotSqm: number; landPlotSqm: number };
    contractDisputes?: { count: 1 | 5 | 10; maxAmount: number };
    managerSalary?: number;               // pro INDIVIDUAL Manažer
  };

  // INDIVIDUAL (Pilíř II doplňky):
  housing?: {
    extraProperties?: number;             // počet dalších nemovitostí
    rental?: boolean;
    construction?: boolean;
    extraBuildingPlotSqm?: number;
    extraLandPlotSqm?: number;
  };

  // Vozidla + řidiči:
  vehicles?: { type: VehicleType; count: number }[];
  vehicleVariant?: 1 | 2;
  drivers?: { count: number };
  driverVariant?: 1 | 2;
};
```

#### 6.1.3 Struktura `resultJson`

```ts
type CalculationResult = {
  productCode: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES';
  monthly: number;
  yearly: number;
  lineItems: { label: string; monthly: number; detail?: string }[];
  warnings: string[];
  discount?: { pct: number; amount: number; reason: string };
};
```

`lineItems` reprezentuje rozpis kalkulace (každá řádka = jeden pilíř / vozidlo / složka). Partner ho používá k UI (transparentní cena), my k auditu (klient ↔ kalkulace, co viděl).

### 6.2 Ostatní v0 endpointy

Tyto endpointy partner kalkulačky **typicky nepotřebuje** — slouží distributorům v `/portal` a interním uživatelům CRM. Dokumentujeme je pro úplnost.

| Method | Path | Auth | Účel |
|---|---|---|---|
| `GET` | `/healthz` | — | Health-check, pro monitoring. |
| `POST` | `/auth/login` | — | Login distributora — vrací JWT (7 dní). |
| `POST` | `/auth/register` | — | Registrace distributora (`role: "DISTRIBUTOR"`). |
| `GET` | `/auth/me` | Bearer JWT | Profil přihlášeného uživatele. |
| `GET` | `/drafts` | Bearer JWT | Seznam vlastních draftů (admin vidí všechny). |
| `GET` | `/drafts/:id` | Bearer JWT | Detail draftu (owner / admin). |
| `POST` | `/drafts` | Bearer JWT | Vytvoření draftu (distributor — viditelný pod jeho identitou). |
| `PATCH` | `/drafts/:id` | Bearer JWT | Update draftu. |
| `DELETE` | `/drafts/:id` | Bearer JWT | Smazání. |
| `GET` | `/customer/contracts` | Bearer JWT (`CUSTOMER`) | Smlouvy klienta, jen `SIGNED`. |
| `GET` | `/legal-cases` | Bearer JWT (`ADMIN`) | Právní případy v CRM. |

JWT TTL je 7 dní, alg `HS256`, issuer `lexia-api`, audience `lexia-clients`.

---

## 7. Endpoint reference — v1 (plánováno)

> **Tato sekce je RFC.** Schválíme s partnery před implementací — pokud máte připomínku k payloadu, ozvěte se.

### 7.1 `POST /v1/calculator/preview` — server-side kalkulace

Cíl: partner pošle vstupy (vybrané pilíře, počty vozidel, obrat, ...), server vrátí kompletní kalkulaci. Partner zobrazí výsledek bez nutnosti replikovat tarify.

**Request:**

```http
POST /v1/calculator/preview
Authorization: Bearer lxa_test_…
Content-Type: application/json

{
  "input": {
    "productCode": "BUSINESS",
    "pillars": ["BIZ_BASIC", "BIZ_VEHICLES"],
    "business": { "revenueMillions": 10, "employees": 15 },
    "vehicles": [
      { "type": "car_under_3_5t", "count": 3 },
      { "type": "trailer_under_750", "count": 1 }
    ],
    "vehicleVariant": 1
  },
  "tariffsVersion": "2026/04"
}
```

**Response 200:**

```json
{
  "tariffsVersion": "2026/04",
  "result": {
    "productCode": "BUSINESS",
    "monthly": 1635,
    "yearly": 19620,
    "lineItems": [
      { "label": "Základní právní ochrana", "monthly": 1186, "detail": "Obrat 10 mil. Kč, 15 zam." },
      { "label": "Vozidlo: Osobní vozidlo do 3,5 t (×3)", "monthly": 447, "detail": "Varianta 1, 149 Kč/ks" },
      { "label": "Vozidlo: Přípojné vozidlo do 750 kg", "monthly": 49, "detail": "Varianta 1, 49 Kč/ks" }
    ],
    "warnings": [],
    "discount": null
  }
}
```

**Klíčové benefity oproti client-side:**
- Tarify se mění v Lexii, ne v partnerově buildu.
- Validace pilířů a závislostí jen na serveru.
- `tariffsVersion` partner zobrazí pod tlačítkem ("Pojistné dle tarifů 2026/04").

### 7.2 `GET /v1/products` / `GET /v1/pillars` / `GET /v1/tariffs` — číselníky

Idempotentní GET, cachable (24 h). Vrací totéž co tabulky v §4 a §5, ale strojově zpracovatelné.

```json
GET /v1/products
[
  { "code": "INDIVIDUAL", "name": "Právní ochrana — Jednotlivci & domácnosti",
    "audience": "B2C, rodiny", "pillars": ["IND_BASIC", "IND_HOUSING", …] },
  …
]
```

```json
GET /v1/tariffs?productCode=INDIVIDUAL&version=2026/04
{
  "version": "2026/04",
  "individual": [
    { "pillarCode": "IND_BASIC", "segment": "individual", "monthly": 179, "yearly": 2148 },
    …
  ]
}
```

### 7.3 `POST /v1/leads` — autentizované vytvoření leadu

V1 verze `POST /leads`. Změny oproti v0:

- `Authorization: Bearer <API_KEY>` povinný — `partnerId` se odvodí z klíče.
- Volitelný `Idempotency-Key` header (UUID) — retry-safe (server vrátí původní odpověď, pokud klíč už zná za posledních 24 h).
- Strukturovaný error model (viz §8).
- Response obsahuje navíc `referenceCode` pro snadnou komunikaci s klientem.

```http
POST /v1/leads
Authorization: Bearer lxa_live_3f2c…
Idempotency-Key: 7b3a1c8d-2e4f-4a5b-9c0d-1e2f3a4b5c6d
Content-Type: application/json

{ "clientName": "…", "clientEmail": "…", … }
```

Response:

```json
{
  "ok": true,
  "id": "ckxabc123def456",
  "referenceCode": "LX-2026-05-009842",
  "status": "DRAFT",
  "createdAt": "2026-05-11T14:23:11.451Z"
}
```

### 7.4 `GET /v1/leads/:id` — stav leadu

```http
GET /v1/leads/ckxabc123def456
Authorization: Bearer lxa_live_3f2c…
```

Vrátí aktuální `status`, `premiumMonthly`, `signedAt?`, `cancelledAt?`. Partner si může v UI zobrazit "vaše poptávka je v jednání" / "smlouva podepsána".

### 7.5 Webhook — lifecycle událostí

Partner si v CRM Lexia nastaví HTTPS endpoint. Lexia tam posílá POST při změně stavu draftu, který vznikl jeho API klíčem.

```http
POST <partner-webhook-url>
Content-Type: application/json
X-Lexia-Event: draft.signed
X-Lexia-Signature: t=1746999791,v1=3f2c…   ← HMAC-SHA256(secret, t + "." + body)

{
  "event": "draft.signed",
  "occurredAt": "2026-05-11T15:01:23.123Z",
  "data": {
    "id": "ckxabc123def456",
    "referenceCode": "LX-2026-05-009842",
    "productCode": "INDIVIDUAL",
    "premiumMonthly": 397,
    "premiumYearly": 4764,
    "signedAt": "2026-05-11T14:58:00.000Z"
  }
}
```

**Eventy v1:**
- `draft.created` — duplicita confirmation (volitelné, default off).
- `draft.sent_to_client` — návrh odeslán klientovi k podpisu.
- `draft.signed` — klient podepsal → atribuce provize partnera.
- `draft.cancelled` — návrh stažen.

**Ověření podpisu** (partner side, Node TS):

```ts
import crypto from 'node:crypto';

function verify(headerSignature: string, rawBody: string, secret: string): boolean {
  const [tPart, v1Part] = headerSignature.split(',');
  const t = tPart.split('=')[1];
  const v1 = v1Part.split('=')[1];
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'));
}
```

**Retry policy:** webhook se opakuje při HTTP ≥ 500 nebo timeout (10 s) — 5× s exponenciálním backoffem (1m → 5m → 25m → 2h → 12h). Pak deadletter v CRM Lexia.

---

## 8. Error model

### v0 (aktuální)

Všechny chyby vrací `{ "error": "<code>" }` s HTTP statusem:

| Status | `error` kód | Význam |
|---|---|---|
| 400 | `request_failed` | Generický validační error. Detaily v logu serveru, partnerovi nedostupné. |
| 401 | `unauthorized` | Chybí Bearer token (na endpointech, kde je povinný). |
| 401 | `invalid_token` | JWT neplatný / expirovaný. |
| 401 | `invalid_credentials` | Špatný login/heslo. |
| 403 | `forbidden` | Role nepovolena nebo nejste owner zdroje. |
| 404 | `not_found` | Endpoint nebo resource neexistuje. |
| 409 | `email_taken` | Registrace — email už existuje. |
| 500 | `internal_error` | Neočekávaná chyba. Logováno, partner nemá detail. |

### v1 (plán)

Strukturovaný error model s detaily (umožní partnerovi UI s konkrétní zpětnou vazbou pro klienta):

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Pole `clientEmail` není platná e-mailová adresa.",
    "details": [
      { "path": "clientEmail", "code": "invalid_email" },
      { "path": "pillars", "code": "missing_mandatory", "context": { "pillar": "IND_BASIC" } }
    ],
    "requestId": "req_2026-05-11_a8c4f9e2"
  }
}
```

Doménové error kódy v1:
- `validation_failed` — Zod selhalo.
- `missing_mandatory_pillar` — chybí Pilíř I.
- `pillar_dependency_unmet` — pilíř II vyžaduje pilíř I, ad.
- `individual_underwriting_required` — obrat / zaměstnanci nad limit.
- `tariff_version_not_found` — partner požádal o verzi sazebníku, která neexistuje.
- `rate_limited` — viz §9.
- `idempotency_conflict` — `Idempotency-Key` se opakuje s jiným payloadem.

---

## 9. Provoz: limity, CORS, idempotence

### 9.1 Rate limit (v1 plán)

Per API klíč:

| Endpoint | Limit |
|---|---|
| `POST /v1/leads` | 60 / minutu, 5 000 / den |
| `POST /v1/calculator/preview` | 600 / minutu (cache friendly) |
| `GET /v1/products`, `/pillars`, `/tariffs` | 3 600 / minutu (cache 24 h) |
| `GET /v1/leads/:id` | 300 / minutu |

Překročení → `429 Too Many Requests`, header `Retry-After: <s>`.

### 9.2 CORS

API odpovídá pouze na allowlistované originy. Pro produkční integraci nahlaste seznam vašich domén (`https://kalkulacka.partner.cz`, …) — admin Lexia je přidá do `CORS_ORIGINS`.

Pro server-to-server volání (Node back-end partnera) CORS neaplikujeme — CORS se kontroluje jen u `Origin` headeru, který back-endové klienty neposílají.

### 9.3 Idempotency (v1 plán)

`POST /v1/leads` a `POST /v1/calculator/preview` přijímají header `Idempotency-Key: <uuid>`. Retence 24 h, scoped per API klíč. Stejný klíč + stejný payload → původní odpověď. Stejný klíč + jiný payload → `409 idempotency_conflict`.

### 9.4 Verzování

URL prefix `/v1/` — breaking změny → `/v2/`. Aditivní změny (nové optional pole) bez bumpu verze.

`X-API-Version` header je vždy v response, dokumentační reference.

---

## 10. Integrační workflow partnera

Doporučený UX flow v partnerově kalkulačce:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Klient v kalkulačce partnera vybere produkt + pilíře     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Kalkulace pojistného                                     │
│    A) v0: partner spočítá lokálně podle §5 tarifů           │
│    B) v1: POST /v1/calculator/preview → server-side výpočet │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Klient zadá osobní údaje (jméno, email, telefon)         │
│    + souhlas se zpracováním GDPR                            │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. POST /leads (v0) nebo POST /v1/leads (v1)                │
│    → server vrátí { id, referenceCode? }                    │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Partner zobrazí klientovi potvrzení                      │
│    + reference, "do 2 prac. dnů vás kontaktujeme"           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CRM Lexia převezme lead, zpracuje, posílá smlouvu        │
│    klientovi k podpisu                                      │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. (v1) Webhook draft.signed → partner aktualizuje UI       │
│    a vypočte provizi                                        │
└─────────────────────────────────────────────────────────────┘
```

### 10.1 GDPR — souhlas klienta

Partner **musí** před `POST /leads` mít explicitní souhlas klienta se:

1. Zpracováním osobních údajů (jméno, e-mail, telefon) za účelem nabídky pojištění.
2. Předáním údajů společnosti **LEXIA Legal Protection a.s.** jako správci.

Doporučené znění checkboxu:

> Souhlasím se zpracováním osobních údajů a jejich předáním společnosti LEXIA Legal Protection a.s. za účelem nezávazné nabídky pojištění právní ochrany. Údaje se uchovávají max. 12 měsíců.

Lexia má vlastní GDPR memorandum (v1 přibude `consentText` a `consentTimestamp` jako pole leadu — viz roadmap).

### 10.2 Co dělat při výpadku API

`POST /leads` selhal (5xx, timeout)?

1. **Retry max. 3× s exponenciálním backoffem** (500 ms → 2 s → 8 s).
2. Pokud stále selhává, zobrazte klientovi fallback:
   > „Omlouváme se, momentálně se nepodařilo odeslat poptávku. Kontaktujte nás na info@lexia.cz nebo +420 800 …"
3. Pokud máte vlastní DB, **uložte poptávku lokálně** a pošlete asynchronně později. V1 idempotency klíč zaručí, že se nezapočítá dvakrát.

Nikdy neukazujte klientovi nesemantický `request_failed` — partner UX si přebírá zodpovědnost za UI fallback.

---

## 11. Příklady kódu

### 11.1 cURL — vytvoření leadu

```bash
curl -X POST https://lexia-api-production-aac2.up.railway.app/leads \
  -H 'Content-Type: application/json' \
  -d '{
    "clientName": "Jan Novák",
    "clientEmail": "jan.novak@example.cz",
    "clientPhone": "+420777123456",
    "productCode": "INDIVIDUAL",
    "pillars": ["IND_BASIC", "IND_HOUSING"],
    "segment": "household",
    "premiumMonthly": 428,
    "premiumYearly": 5136,
    "inputJson": {
      "productCode": "INDIVIDUAL",
      "segment": "household",
      "pillars": ["IND_BASIC", "IND_HOUSING"]
    },
    "resultJson": {
      "productCode": "INDIVIDUAL",
      "monthly": 428,
      "yearly": 5136,
      "lineItems": [
        {"label": "Základní právní ochrana", "monthly": 269},
        {"label": "Bydlení", "monthly": 159}
      ],
      "warnings": []
    },
    "notes": "partner=frenkee.cz; ref=calc-2026-05-11-9f3a"
  }'
```

### 11.2 TypeScript — Node back-end partnera

```ts
type LeadInput = {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  productCode: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES';
  pillars: string[];
  segment?: 'individual' | 'household';
  premiumMonthly: number;
  premiumYearly: number;
  inputJson: unknown;
  resultJson: unknown;
  notes?: string;
};

type LeadResponse = { ok: true; id: string };

async function submitLeadToLexia(input: LeadInput): Promise<LeadResponse> {
  const url = `${process.env.LEXIA_API_URL}/leads`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // v1: 'Authorization': `Bearer ${process.env.LEXIA_API_KEY}`,
      // v1: 'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Lexia lead failed: ${res.status} ${body?.error ?? 'unknown'}`);
  }
  return res.json() as Promise<LeadResponse>;
}
```

### 11.3 Browser JS — náhled (typicky NEDOPORUČUJEME)

```html
<script>
async function submit(payload) {
  // Pokud kalkulačka volá API přímo z prohlížeče, počítejte s tím, že:
  //  - Origin musí být v CORS allowlistu Lexia (vyžádat předem).
  //  - V0 to lze (anonymní endpoint), v1 doporučíme přes back-end proxy
  //    partnera (API klíč nesmí být v front-endu).
  const res = await fetch('https://lexia-api-production-aac2.up.railway.app/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('lead submit failed');
  return res.json();
}
</script>
```

### 11.4 Příklad — kalkulace BUSINESS na straně partnera (v0)

Implementace ekvivalentní `src/app/domain/calculator.ts`:

```ts
// Tarify viz §5.2 — partner si je drží lokálně nebo v configu.
function lookupBusinessBase(revenueMillions: number, employees: number): number {
  if (revenueMillions > 500 || employees > 500) return 0; // individuální úpis
  const REV = [2.5, 5, 10, 25, 50, 100, 250, 500];
  const EMP = [0, 5, 10, 20, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
  const MATRIX = [
    [399, 499, 599, 698, 798, 898, 994, 1097],
    // … (viz §5.2)
  ];
  const ri = Math.max(0, REV.findIndex((r) => revenueMillions <= r));
  const ei = Math.max(0, EMP.findIndex((e) => employees <= e));
  return MATRIX[ei]?.[ri] ?? 0;
}
```

V1 odpadá — partner zavolá `POST /v1/calculator/preview` a tarify v jeho repu nedrží.

---

## 12. Sandbox a testovací data

### v0 (aktuální)

Sandbox = produkční base URL, ale **leady označené `notes: "test=true"`** se z produkčního CRM filtrují (admin Lexia má filtr v `/crm/leads`).

Testovací příklady:

```json
{
  "clientName": "Test Partner",
  "clientEmail": "test+frenkee@example.cz",
  "productCode": "INDIVIDUAL",
  "pillars": ["IND_BASIC"],
  "segment": "individual",
  "premiumMonthly": 179,
  "premiumYearly": 2148,
  "inputJson": { "productCode": "INDIVIDUAL", "segment": "individual", "pillars": ["IND_BASIC"] },
  "resultJson": { "productCode": "INDIVIDUAL", "monthly": 179, "yearly": 2148, "lineItems": [], "warnings": [] },
  "notes": "test=true; partner=frenkee.cz"
}
```

### v1 (plán)

Oddělená sandbox URL `lexia-api-sandbox.up.railway.app`. API klíče s prefixem `lxa_test_…` fungují **pouze v sandboxu**. Sandbox má seedovaná testovací data, neposílá maily, neposílá data do reálného CRM.

---

## 13. Roadmap a SLA

### Roadmap v1

| Fáze | Obsah | Odhad |
|---|---|---|
| **v1.0** | API klíče + `POST /v1/leads` + error model | 1 sprint |
| **v1.1** | `GET /v1/products`, `/pillars`, `/tariffs` (číselníky) | 1 sprint |
| **v1.2** | `POST /v1/calculator/preview` (server-side kalkulátor) | 2 sprinty |
| **v1.3** | Webhooks (`draft.signed`, …) + retry policy | 2 sprinty |
| **v1.4** | Rate limit + idempotency | 1 sprint |
| **v1.5** | OpenAPI spec + SDK pro Node/PHP | 1 sprint |

Termíny si potvrdíme s konkrétními partnery.

### SLA (cíl pro v1 produkční launch)

- **Dostupnost:** 99,5 % měsíčně (Railway managed Postgres + Hono API + Cloudflare CDN).
- **Latence P95:** < 300 ms pro `POST /leads`, < 500 ms pro `POST /calculator/preview` (cz region).
- **Plánovaná údržba:** vždy v okně po → ne, 02:00–04:00 SEČ, oznámeno 5 dní předem partnerským emailem.
- **Incident response:** P1 (API down) — odezva do 30 min v pracovní době, do 2 h mimo.
- **Status page:** v1 přidáme veřejnou `status.lexia.cz` (komponenta web SPA + API + DB).

---

## 14. Checklist pro integrátora

Před produkčním nasazením:

- [ ] Mám účet v CRM Lexia + API klíč (v1).
- [ ] Doménu mojí kalkulačky jsem nahlásil pro CORS allowlist.
- [ ] V kalkulačce zobrazuji **transparentní rozpis ceny** (`lineItems`) — klient vidí, za co platí.
- [ ] Pod cenovkou je věta „Pojistné dle tarifů 2026/04".
- [ ] Souhlas se zpracováním osobních údajů je explicitní checkbox (nepředšrtnutý).
- [ ] Při selhání API mám fallback UX (kontaktní e-mail / telefon).
- [ ] Při retry používám `Idempotency-Key` (v1).
- [ ] Mám napsaný webhook endpoint, ověřuji signaturu (v1).
- [ ] Testovací leady označuji `notes: "test=true"` (v0) nebo používám sandbox klíč (v1).
- [ ] Mám podepsaný kontrakt s Lexia (provize, GDPR DPA).

---

## 15. Změnový log

| Verze dokumentu | Datum | Změna |
|---|---|---|
| 1.0 | 2026-05-11 | První oficiální verze. Zahrnuje v0 produkční stav `POST /leads` a kompletní RFC pro v1 (API klíče, server-side kalkulátor, číselníky, webhook, rate limit, idempotence). Plné tarify 2026/04. |

---

## 16. Kontakt

- **Tech / API:** Tomáš Hájek — `tomas.hajek@…`
- **Obchod / partnerské smlouvy:** *(doplnit kontakt obchodu Lexia)*
- **CRM admin (klíče, CORS):** *(doplnit kontakt admina Lexia)*
- **Status / incidenty (v1):** `status.lexia.cz`, `noreply@lexia.cz`

GitHub repo (referenční implementace web kalkulačky + API):
[`AAATom16/lexia-landing-redesign`](https://github.com/AAATom16/lexia-landing-redesign)
