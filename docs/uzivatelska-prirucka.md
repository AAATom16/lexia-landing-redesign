# Lexia — uživatelská příručka

**Verze:** 0.2 (2026-04-30)

Tahle příručka popisuje, **kde co je** a **jak na to** v aktuálním demu Lexia (web + partner portál + CRM).

---

## 1. Tři prostředí, tři role

Lexia běží jako jedna aplikace s třemi vstupy. Každý má jinou roli a jiný účel:

| Vstup | URL (produkce) | Pro koho | Login? |
|---|---|---|---|
| **Web** | `https://lexia-web-production.up.railway.app/` | Veřejnost, koncoví klienti | Volně přístupný; klientská zóna `/prihlaseni` |
| **Klientská zóna** | `/ucet` | Pojistník (zákazník) | Ano (role `customer`) |
| **Partner portál** | `/portal` | Vázaný zástupce, agent, makléř | Ano (role `distributor`) |
| **CRM** | `/crm` | Interní zaměstnanec Lexia | Ano (role `admin`, jen `@lexia.cz`) |

Role je uložená v JWT tokenu, který API vystavuje při přihlášení. Bez tokenu se nedostaneš ani do `/portal`, ani do `/crm` — guard tě přesměruje na příslušný login.

### Demo přístupy (po `pnpm db:seed`)

| Email | Heslo | Role | Prostředí |
|---|---|---|---|
| `jana.dvorakova@lexia.cz` | `lexia123` | ADMIN | `/crm` |
| `tomas.prochazka@lexia.cz` | `lexia123` | ADMIN | `/crm` |
| `lukas.vesely@lexia.cz` | `lexia123` | ADMIN | `/crm` |
| `info@frenkee.cz` | `partner123` | DISTRIBUTOR | `/portal` |
| `broker@example.cz` | `partner123` | DISTRIBUTOR | `/portal` |
| `demo@lexia.cz` | `demo123` | CUSTOMER | `/ucet` |

---

## 2. Hlavní flow — od kalkulace k podepsané smlouvě

Funguje stejně v partnerském portále i v CRM. Tři kroky:

```
[1] Kalkulačka      →   [2] Návrh smlouvy   →   [3] Podpis
    /kalkulacka          /sjednani/:id           /sjednani/:id (status = Podepsáno)
```

### Krok 1 — Kalkulačka

**Kde:**
- Partner: `/portal/kalkulacka`
- CRM: `/crm/kalkulacka`
- Veřejně (jen pro orientaci): `/` → sekce **Kalkulačka pojistného**

**Co děláš:**
1. Vyber **produkt** (Jednotlivci & domácnosti / Podnikatelé & firmy / Řidiči & vozidla)
2. U jednotlivců nastav **segment** (Jednotlivec / Domácnost)
3. U firem zvol **roční obrat** + **počet zaměstnanců** (matrix tarifu)
4. Zaškrtni **pilíře** — Pilíř I (Základní právní ochrana) je vždy povinný a zamknutý
5. Doplň parametry pro vybrané pilíře (stavby pro komerční prostory, počet sporů × max. částka pro smluvní spory, vozidla v1/v2 atd.)
6. Cena se počítá **živě**, dle tarifů 2026/04. Vpravo vidíš měsíční + roční pojistné, rozpis a varování.

**Provize (jen v partnerském portálu / CRM):**
- Po zadání pojistného se zobrazí **Náhled provize** — Model 1 (45 % získatelská + 10 % následná) nebo Model 2 (23 % průběžná).
- V CRM si můžeš zapnout i náhled **startovací provize** (30 / 20 / 10 % v 1.–3. měsíci).

### Krok 2 — Uložit jako návrh smlouvy

V partnerském portálu i v CRM:

1. Doplň **jméno klienta** a (volitelně) email
2. Vyber **provizní model** (Model 1 / Model 2)
3. Klikni **Uložit návrh** (zůstane jako draft) **nebo** **Odeslat ke klientovi** (skočí rovnou na status `Odesláno`)
4. Po uložení se otevře **detail návrhu** (`/portal/sjednani/:id` nebo `/crm/smlouvy/:id`)

**Detail obsahuje:**
- Stav (Návrh / Odesláno klientovi / Podepsáno) s vizuálním stepper
- Údaje klienta + pojištění (produkt, pilíře, územní rozsah)
- Měsíční + roční pojistné s rozpisem
- Náhled provize podle zvoleného modelu
- Placeholder PDF (server-side generátor je TODO)
- Tlačítko pro **další krok** v lifecyclu
- Tlačítko **Smazat návrh** (nevratné)

### Krok 3 — Podpis

Z detailu návrhu klikni postupně:

- **Návrh** → klik **„Odeslat klientovi"** → status `Odesláno klientovi`
- **Odesláno klientovi** → klik **„Označit jako podepsané"** → status `Podepsáno`

Až bude napojen reálný email, odeslání pošle klientovi link na podpis. Aktuálně jen mění stav v DB.

**Po podepsání** se z návrhu stává **aktivní smlouva**. V CRM ji uvidíš v `/crm/smlouvy` nahoře v sekci „Sjednávání".

---

## 3. Kde co najdeš

### Partner portál `/portal/*`

| Cesta | Co tam je |
|---|---|
| `/portal` | Dashboard — KPI tvého portfolia, posledních 6 návrhů, modely provizí |
| `/portal/kalkulacka` | Kalkulačka + ukládání návrhů |
| `/portal/sjednani` | Seznam tvých návrhů (filtrované jen na tvůj email) |
| `/portal/sjednani/:id` | Detail návrhu + lifecycle |
| `/portal/klienti` | Agregace klientů z návrhů |

### CRM `/crm/*`

| Cesta | Co tam je |
|---|---|
| `/crm` | Dashboard — globální KPI, mock data |
| `/crm/leady` | Leady (mock) |
| `/crm/klienti` | Klienti (mock — bude propojeno s API v dalším sprintu) |
| `/crm/smlouvy` | Smlouvy: nahoře **živé návrhy z kalkulačky**, pod tím legacy mock smlouvy |
| `/crm/smlouvy/:id` | Detail návrhu (stejná komponenta jako v portálu) |
| `/crm/kalkulacka` | Interní kalkulačka + tabulka **všech** návrhů ze všech zdrojů |
| `/crm/dokumenty` | Dokumenty (mock) |
| `/crm/ukoly` | Úkoly (mock) |

### V hlavičce máš tyto pomocníky

- **„Jak na to"** — otevře side panel s kontextovou nápovědou (steps + provize + datový model)
- **Banner Onboardingu na dashboardech** — tři kroky 1-2-3 s odkazy. Lze schovat křížkem (uloží se do localStorage).

---

## 4. Datový model — co se ukládá kam

### Co bydlí v Postgres (Railway)

- **Users** — login + role + (pro distributory) typ a IČO
- **ContractDraft** — uložené návrhy z kalkulačky včetně celého inputu a výsledku (JSON)
- **AuditLog** — co kdo udělal (vytvoření/úprava/smazání návrhu)

### Co bydlí v localStorage (zatím)

- **JWT token** (`lexia_token`) — vystaví ho API po loginu, přidává se do `Authorization` hlavičky
- **Auth user info** (`lexia_auth`) — pro UI pohodlí, autoritou je server
- **Onboarding dismissed** (`lexia_onboarding_*`) — schovaný banner

### Mock fallback (lokální dev)

Pokud není nastavený `VITE_API_URL`, aplikace **automaticky** přepne na localStorage-only režim. Login je mock (neověřuje heslo), drafty se ukládají do `lexia_drafts`. Hodí se pro demo bez backendu.

---

## 5. Provize — krátký reference

**Model 1 (Získatelská + následná)**

- 45 % z 1. ročního pojistného splatné jednorázově po počátku
- +10 % z každé následné splátky
- Storno závazek 1 rok lineárně

**Model 2 (Průběžná)**

- 23 % ze skutečně uhrazeného pojistného
- Vyplácí se po 1. ročním pojistném

**Startovací provize (Model 1)**

- Měsíc 1 po podpisu obchodního zastoupení: +30 %
- Měsíc 2: +20 %
- Měsíc 3: +10 %
- Pravidla = jako získatelská

Po podpisu smlouvy už **provizní model nelze změnit**.

---

## 6. Časté otázky

**Kde se ukládá to, co spočítám v kalkulačce?**
Až klikneš **Uložit návrh** (nebo **Odeslat klientovi**), uloží se to do databáze jako `ContractDraft`. Bez kliknutí se drží jen v session — refresh ho zahodí.

**Jak udělám reálnou smlouvu?**
Aktuálně tím, že posuneš stav návrhu na **Podepsáno** v jeho detailu. Po dokončení S6 cleanupu se z toho stane plnohodnotná `Contract` entita s číslem smlouvy a vazbou na klienta.

**Jak schovám onboarding banner?**
Klikni na X v pravém horním rohu banneru — uloží se do localStorage. Vrátit ho můžeš vymazáním klíče `lexia_onboarding_portal` / `lexia_onboarding_crm` v DevTools.

**Proč mi v kalkulačce vyskakují varování?**
- „Pilíř I je povinný" — bez něj nejde sjednat smlouvu (validace dle PDF Lexia 2026-03)
- „Obrat > 500 mil. Kč → individuální úpis" — matrix tarif končí, nutný individuální výpočet

**Vidím jiné KPI než kolega?**
Aktuálně CRM dashboard běží na mock datech (zděděných z dema). Po S6 cleanupu se KPI přepočítají z reálných smluv.

**Něco nefunguje jak má?**
1. Otevři DevTools → Console
2. V `/crm` nebo `/portal` se vyloguj a přihlas znovu (možná expirace JWT)
3. Zkontroluj `https://lexia-api-production-aac2.up.railway.app/healthz` — má vrátit `{"ok":true}`
4. Pokud nic nepomáhá → ozvi se devu (`tomas.hajek`) s `lexia_token` z localStorage smazaným

---

## 7. Co je TODO (z doc/zadani-vyvoj.md)

- **S4** — plnohodnotný wizard `/sjednani` s vícekrokovým UI a PDF generátorem
- **S5** — distribuční modul: strom distributorů, OM s vahami, převody kmene, audit
- **S6** — cleanup CRM mock dat (nahradit cizí pojišťovny LEXIA / Colonnade, refactor Contract na pilíře)
- **S7** — `/ucet` zobrazí aktivní smlouvy s pilíři, oblastmi, limity, čekacími dobami
- MinIO bucket pro PDF storage (až bude PDF generátor)
- Real email service pro odesílání návrhů klientovi

---

## 8. Pro vývojáře — quick reference

- API: `apps/api/` (Hono + Prisma + Postgres)
- Web: `src/` (Vite + React + React Router 7 + Tailwind 4 + Radix UI)
- Doménový model + tarify: `src/app/domain/`
- Auth: `src/app/lib/auth.ts` (`authenticate(email, password, { expectedRole, fallback })`)
- Drafts: `src/app/lib/drafts.ts` (async `listDrafts` / `saveDraft` / `updateDraft` / `deleteDraft` / `nextStatus`)
- API client: `src/app/lib/api.ts` (gated by `VITE_API_URL`)
- Detail page: `src/app/components/drafts/DraftDetail.tsx` (sdílený mezi portálem a CRM)
