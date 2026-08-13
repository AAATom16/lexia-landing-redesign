# Lexia web — finální plán úprav + zadání pro Claude Code

Zdroj: `Lexiaweb_feedback_úpravy.pdf` (verze webu z 29.07.2026)
Projekt: statický web (HTML/CSS/JS) — `~/Documents/Development/Lexia web page`
Aktualizováno: 03.08.2026 (cenové rozhodnutí 159/179 zapracováno)

---

## 1. Shrnutí požadavků
Ve formuláři byly reálně vyplněné **4 připomínky** (ostatní sekce prázdné):

1. **Hero microbenefit:** „Hotovo do 2 minut, žádné dokumenty" → **„Už za minutu můžete mít právní ochranu"**
2. **Hero limit:** „2,5 mil. Kč" → „5 mil. Kč" — *„dáme pokyn"* → **ČEKÁ, teď NEMĚNIT**
3. **Hero produkty:** místo TRIO dát **Individual od 179 Kč/měs.** + text „Sestavte si pojištění právní ochrany přesně podle Vašich potřeb." + pravidlo **bez mezery kolem lomítka**
4. **Formulace:** nepoužívat **„Nejvyšší"** → **„Vysoké"** (ve správném tvaru)

## 2. Rozhodnutá nastavení
- **Cena Individual/základní ochrana:** sjednotit na **179 Kč** všude (viz úkol 5). Katalog i kalkulačka teď mají 159 → srovnat s adminem (ten už 179 má).
- **DRIVE zůstává 159 Kč** (jiný produkt).
- **Obecný slogan „Od 159 Kč měsíčně" zůstává 159** (odkazuje na DRIVE).
- **Homepage karta TRIO → Individual:** odkaz `kalkulacka.html`, odznak „Na míru", podnadpis „Volba jednotlivec / domácnost".
- **„Nejvyšší" na o-nas.html:** měnit jen „nejvyšší → vysoké", ostatní superlativy nechat.

---

## 3. Detailní mapa změn

### Úkol 1 — Hero microbenefit
`index.html:71`: `Hotovo do 2 minut, žádné dokumenty` → `Už za minutu můžete mít právní ochranu`

### Úkol 2 — Limit 2,5 → 5 mil. — **ČEKÁ NA POKYN, teď neměnit**
Až přijde pokyn: `index.html:6`, `index.html:77`, `kalkulacka.html:634`, `kalkulacka.html:692`.

### Úkol 3 — Homepage karta TRIO → Individual (`index.html:129–142`)
| Prvek | Ř. | Nyní | Nově |
|---|---|---|---|
| odkaz | 130 | `objednavka?produkt=trio` | `kalkulacka.html` |
| odznak | 131 | `Bestseller` | `Na míru` |
| ikona | 132 | `shield` | `users` |
| název | 135 | `TRIO` | `INDIVIDUAL` |
| cena | 136 | `499 Kč </span>/měs.` | `od 179 Kč` bez mezery: `<strong>od 179 Kč</strong><span>/měs.</span>` |
| podnadpis | 138 | `Kompletní balíček` | `Volba jednotlivec / domácnost` |
| popis | 139 | `Základní ochrana domácnosti...` | `Sestavte si pojištění právní ochrany přesně podle Vašich potřeb.` |

(TRIO jako produkt na sluzby/nabidka/objednavka zůstává.)

### Úkol 4 — Bez mezery kolem lomítka (ceny napříč webem)
Sjednotit na `Kč/měs.`, `Kč/měsíc`, `Kč/rok`:
- `index.html:107,121,136` — mezera mezi `</strong>` a `<span>/měs.` → odstranit
- `sluzby.html:70,90,110,131,151,172` — `Kč&nbsp;/&nbsp;měs.` → `Kč/měs.`; roční `71,91,111,132,152,173` `Kč / rok` → `Kč/rok`
- `nabidka.html:45,46,167,174,181,188,195,202` — `Kč / měsíc` → `Kč/měsíc`, `Kč / rok` → `Kč/rok`
- `objednavka.html:65` (mezera + `Kč / rok`), `:74` `+40 Kč /měs.`, `:468` JS ` /měs.`
- **NEMĚNIT:** `24/7`, `Kč/m²/měsíc`, přepínače „Měsíčně/Ročně"

### Úkol 5 — Cena 159 → 179 (základní ochrana jednotlivec + Individual)
**Měnit (159 → 179):**
- `script.js:644` `zakladni: { j: 159 → 179 }` — jádro kalkulačky
- `script.js:301` fallback `'159 Kč' → '179 Kč'`
- `kalkulacka.html:103` `data-j` i text `159 → 179` (pilíř Základní ochrana)
- `kalkulacka.html:302,311,315,457,465,554,593` — výchozí součty/rekapitulace 159 → 179
- `nabidka.html:202` `od 159 → od 179`
- `sluzby.html:172` `od 159 → od 179`
- `sluzby.html:229` **poslední** buňka `od 159 Kč → od 179 Kč`

**Roční přepočet (11× = od 1 969 Kč):**
- `nabidka.html:202` year `od 1 749 → od 1 969`
- `sluzby.html:173` `od 1 749 Kč / rok → od 1 969 Kč/rok`
- `sluzby.html:233` **poslední** buňka `od 1 749 Kč → od 1 969 Kč`

**NEMĚNIT (zůstává 159):** DRIVE — `index.html:107`, `objednavka.html:364`, `nabidka.html:167`, `sluzby.html:70`, `sluzby.html:229` (1. buňka); „Dům, byt, chata" domácnost — `kalkulacka.html:119,225`, `script.js:647,656`, `admin.html:367`; slogan „Od 159 Kč" — `index.html:7,62,65,454,482`.

### Úkol 6 — „Nejvyšší" → „Vysoké" (správný tvar)
| Soubor | Ř. | Nyní | Nově |
|---|---|---|---|
| index.html | 7 | `s nejvyššími limity` | `s vysokými limity` |
| index.html | 78 | `nejvyšší limit na trhu` | `vysoký limit na trhu` |
| index.html | 162 | `Nejvyšší pojistné limity...` | `Vysoké pojistné limity...` |
| kalkulacka.html | 693 | `Nejvyšší na českém trhu` | `Vysoké na českém trhu` |
| pro-koho.html | 380 | `nejvyššího možného plnění` | `vysokého možného plnění` |
| o-nas.html | 108 | `nejvyšší limity pojistného plnění` | `vysoké limity pojistného plnění` |

Neměnit „Nejlepší".

---

## 4. ZADÁNÍ PRO CLAUDE CODE
```
Projekt: statický web Lexia (HTML/CSS/JS, čeština). Proveď úpravy níže. Neměň nic jiného, zachovej strukturu a formátování. Čísla řádků jsou orientační — ověř podle textu.

ÚKOL 1 — index.html (~71): "Hotovo do 2 minut, žádné dokumenty" → "Už za minutu můžete mít právní ochranu".

ÚKOL 2 — index.html, karta "PRODUKT 3: TRIO" (~129–142) → Individual:
- název TRIO → INDIVIDUAL
- cena "499 Kč" → "od 179 Kč" (bez mezery před lomítkem: <strong>od 179 Kč</strong><span>/měs.</span>)
- popis (hero-product-desc) → "Sestavte si pojištění právní ochrany přesně podle Vašich potřeb."
- podnadpis (hero-product-sub) "Kompletní balíček" → "Volba jednotlivec / domácnost"
- ikona data-icon="shield" → "users"
- odkaz href="objednavka?produkt=trio" → "kalkulacka.html"
- odznak "Bestseller" → "Na míru"
(Produkt TRIO na sluzby/nabidka/objednavka NECH být.)

ÚKOL 3 — bez mezery kolem lomítka u cen napříč webem ("159 Kč/měs.", "Kč/měsíc", "Kč/rok"):
- index.html ~107,121,136: odstraň mezeru mezi </strong> a <span>/měs.
- sluzby.html: "Kč&nbsp;/&nbsp;měs." → "Kč/měs."; "... Kč / rok" → "... Kč/rok"
- nabidka.html: "Kč / měsíc" → "Kč/měsíc"; "Kč / rok" → "Kč/rok"
- objednavka.html ~65 (mezera před /měsíc + "5 489 Kč / rok"→"Kč/rok"), ~74 "+40 Kč /měs."→"+40 Kč/měs.", ~468 v JS " /měs."→"/měs."
NEMĚŇ: "24/7", "Kč/m²/měsíc", přepínače "Měsíčně/Ročně".

ÚKOL 4 — cena základní ochrany (jednotlivec) a produktu Individual: 159 → 179 Kč:
- script.js ~644: zakladni { j: 159 } → j: 179
- script.js ~301: fallback '159 Kč' → '179 Kč'
- kalkulacka.html ~103: data-j i text pilíře "Základní právní ochrana" 159 → 179
- kalkulacka.html ~302,311,315,457,465,554,593: výchozí součty a rekapitulace 159 Kč → 179 Kč
- nabidka.html ~202: 'od 159' → 'od 179'; year 'od 1 749 Kč / rok' → 'od 1 969 Kč / rok'
- sluzby.html ~172: 'od 159' → 'od 179'; ~173: 'od 1 749 Kč / rok' → 'od 1 969 Kč/rok'
- sluzby.html ~229: POSLEDNÍ buňka 'od 159 Kč' → 'od 179 Kč'; ~233: POSLEDNÍ buňka 'od 1 749 Kč' → 'od 1 969 Kč'
NEMĚŇ (zůstává 159): produkt DRIVE (index.html ~107, objednavka.html ~364, nabidka.html ~167, sluzby.html ~70, sluzby.html ~229 PRVNÍ buňka); pilíř "Dům, byt, chata" domácnost (kalkulacka.html ~119,225; script.js ~647,656; admin.html ~367); slogan "Od 159 Kč měsíčně" (index.html ~7,62,65,454,482).

ÚKOL 5 — "Nejvyšší"/"nejvyšší" → "Vysoké" ve správném českém tvaru (ne slepý replace):
- index.html ~7: "s nejvyššími limity" → "s vysokými limity"
- index.html ~78: "nejvyšší limit na trhu" → "vysoký limit na trhu"
- index.html ~162: "Nejvyšší pojistné limity na českém trhu." → "Vysoké pojistné limity na českém trhu."
- kalkulacka.html ~693: "Nejvyšší na českém trhu" → "Vysoké na českém trhu"
- pro-koho.html ~380: "nejvyššího možného plnění" → "vysokého možného plnění"
- o-nas.html ~108: "nejvyšší limity pojistného plnění" → "vysoké limity pojistného plnění"
NEMĚŇ "Nejlepší".

NEDĚLEJ (čeká na pokyn): limit "2,5 mil. Kč" → "5 mil. Kč".

KONTROLA na závěr:
- Kalkulačka s výchozím nastavením (jen povinná Základní ochrana, jednotlivec) ukazuje 179 Kč / ročně 1 969 Kč.
- Individual je všude "od 179 Kč" / "od 1 969 Kč"; DRIVE zůstává "159 Kč" / "1 749 Kč".
- Fulltext: "Nejvyšší"/"nejvyšší" už nikde (kromě "Nejlepší"); žádná cena nemá mezeru kolem lomítka.
```

---
*Otevřený je už jen úkol 2 (limit 5 mil.) — čeká na tvůj pokyn. Zbytek je kompletní a spustitelný.*
