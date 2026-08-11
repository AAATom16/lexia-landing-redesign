# PLÁN: Sekce "Finanční poradci a realitní makléři" v „Pro koho → Ostatní"

Cíl: nový `pd-row` blok mezi **Obecní zastupitelé** a **A spousty dalších!** v rozbalovacím detailu
`#ostatni-detail` na stránce `pro-koho.html`. Krátké intro 1:1 z podkladů LP + modré CTA tlačítko
vedoucí na microsite `/financni-poradci`, kde později poběží vlastní web.

---

## FÁZE 0 — Discovery (HOTOVO, nečíst znovu, jen použít)

Zjištěno přímým čtením repa. Zdroje a nálezy:

### Struktura projektu
- Statický web, žádný build. `package.json` → `serve . -l ${PORT:-3000}`, deploy Railway (`railway.json`).
- Žádný framework, žádné šablony. HTML se edituje přímo.

### Cílové místo
Soubor: `pro-koho.html`

| Kotva | Řádky | Obsah |
|---|---|---|
| `<div id="ostatni" class="product-card product-card--bg product-card--reverse">` | 728 | Karta „Ostatní pojištění" |
| `<div id="ostatni-detail" class="product-detail" hidden>` | 748 | Rozbalovací detail |
| `pd-row` Zdravotnická zařízení | 756–771 | obrázek vlevo |
| `pd-row pd-row--reverse` Spolky | 774–789 | obrázek vpravo |
| `pd-row` Odborové organizace | 792–807 | obrázek vlevo |
| `pd-row pd-row--reverse` Profesionální sportovci | 810–824 | obrázek vpravo |
| `pd-row` **Obecní zastupitelé** | 826–841 | obrázek vlevo |
| `pd-row pd-row--reverse` **A spousty dalších!** | 843–856 | obrázek vpravo |
| `<div class="pd-cta">` | 857–859 | tlačítko „Spočítat cenu" |

**Vzor bloku ke ZKOPÍROVÁNÍ** (`pro-koho.html:826-841`) — nekonstruovat nové značky, kopírovat tento tvar:

```html
<div class="pd-row">
  <div class="pd-row__media">
    <img src="assets/lx-ostatni-zastupitele.jpg" alt="Obecní zastupitelé" loading="lazy">
  </div>
  <div class="pd-row__body">
    <h5 class="pd-row__title">Obecní zastupitelé</h5>
    <ul class="pd-checklist">
      <li><span class="pd-check"><i class="icon" data-icon="check"></i></span> …text…</li>
    </ul>
  </div>
</div>
```

### Povolené CSS třídy (existují v `styles.css`, nevymýšlet nové)
| Třída | Řádek v `styles.css` | Poznámka |
|---|---|---|
| `.pd-row` | 6909 | grid 0.92fr / 1.08fr, gap 52px, margin-bottom 56px |
| `.pd-row--reverse` | 6916 | prohodí pořadí (obrázek vpravo) |
| `.pd-row__media` / `img` | 6918 | aspect-ratio 4/3, na desktopu absolutní výplň sloupce |
| `.pd-row__body` | — | textový sloupec |
| `.pd-row__title` | 6936 | h5, `var(--primary)`, clamp 1.5–2.125rem |
| `.pd-checklist` / `.pd-check` | 6866 / 6877 | odrážky s modrým check |
| `.pd-cta` | 7003 | margin-top 28px, text-align center |
| `.btn .btn-primary` | globální | modré plné tlačítko |
| `.btn-lg` | 311 | padding 12px 26px, radius 100px |
| `.pd-note-inline` | 6958 | drobná kurzíva, `--text-muted` |
| responsivní breakpoint | 7008 (`max-width: 900px`) | `.pd-row` → 1 sloupec, media order −1 |

**NEEXISTUJE:** třída pro tlačítko uvnitř `.pd-row__body`. Jediná nová CSS třída v tomto plánu je
`.pd-row__cta` (fáze 3). Nic jiného nepřidávat.

### Ikony
`<i class="icon" data-icon="check">` a `data-icon="arrow_right"` — renderuje `assets/icons.js`.
Použití šipky ověřeno v `index.html:247`, `admin.html:71`, `nabidka.html:37`.

### Obrázky
`assets/` **neobsahuje** fotku pro finanční poradce. Existující řada: `lx-ostatni-zdravotnici.jpg`,
`-spolky`, `-odbory`, `-sportovci`, `-zastupitele`, `-uvod`. Zdrojové JPEG v `assets/foto/`.

### Anti-patterns (co NEDĚLAT)
- ❌ Nepsat vlastní inline `style=""` na nový blok — layout řeší `.pd-row`.
- ❌ Neměnit `.pd-row` ani `.pd-checklist` v `styles.css` (sdílené 6 sekcemi × 6 produktů).
- ❌ Nevkládat blok mimo `#ostatni-detail` — mimo něj se neskrývá/nerozbaluje.
- ❌ Nepoužívat diakritiku v URL.
- ❌ Nedávat na veřejnou `pro-koho.html` cenu 299 Kč — LP ji označuje jako
  „**neveřejná cena**" a „exkluzivní nabídka **pouze pro finanční poradce — partnery LEXIA**".
  Cena patří až na microsite. (Pokud si to zadavatel přeje jinak, je to jeho rozhodnutí — ale
  rozpor s formulací „neveřejná" je vědomý.)

---

## FÁZE 1 — Rozhodnutí před implementací

Tři body, kde doporučuji konkrétní variantu. Pokud nepřijde jiný pokyn, implementuje se doporučení.

### 1.1 URL microsite
Zadání: `lexia.cz/finančníporadci`.

**Doporučení: `lexia.cz/financni-poradci`** — bez diakritiky, s pomlčkou.
Důvod: diakritika v URL se percent-enkóduje (`/finan%C4%8Dn%C3%ADporadci`), rozbíjí sdílení odkazu,
QR kódy, tištěné materiály i čitelnost v analytice. Zbytek webu jede na ASCII (`pro-koho.html`,
`kalkulacka.html`, `o-nas.html`).

Realizace na statickém `serve`: složka `financni-poradci/index.html` → `/financni-poradci` funguje.

Alternativy pokud trvá na diakritice: soubor `financní-poradci/index.html` (funguje, ale viz výše).

### 1.2 Text tlačítka
Zadání: „dozvědět se více" nebo „zjistit víc" — vybrat lepší.

**Doporučení: `Zobrazit nabídku`** (+ šipka `arrow_right`).
Důvod: web používá krátké imperativy s jasným výsledkem — „Spočítat cenu", „Individuální nabídka",
„Zobrazit detail", „Sjednat pojištění". „Zjistit více" je vágní a nesignalizuje, že za tlačítkem
je konkrétní produkt s cenou.

Pořadí dalších voleb: 2) `Zobrazit nabídku pro poradce` (delší, ale nejpřesnější),
3) `Zjistit více` (nejblíže zadání, nejnižší informační hodnota).

### 1.3 Fotka
V `assets/` chybí. **Doporučení: dodat `assets/lx-ostatni-poradci.jpg`** (poměr 4:3, stejný styl
jako ostatní `lx-ostatni-*.jpg`; LP hero fotka „poradce s klienty u stolu" sedí).

Dočasná náhrada, dokud fotka nepřijde: `assets/lx-firmy-uvod.jpg`. V kódu nechat komentář
`<!-- TODO: vyměnit za lx-ostatni-poradci.jpg -->`, ať se na to nezapomene.

**Ověření fáze:** rozhodnutí zapsaná; pokud zadavatel neodpoví, jede se dle doporučení.

---

## FÁZE 2 — Vložení bloku do `pro-koho.html`

### Co udělat
1. **Vložit** nový `pd-row` **mezi** blok „Obecní zastupitelé" (končí `pro-koho.html:841`) a
   komentář `<!-- A spousty dalších (obrázek vpravo) -->` (`pro-koho.html:843`).
2. Nový blok má třídu **`pd-row pd-row--reverse`** (obrázek vpravo — zastupitelé mají vlevo).
3. **Přehodit** následující blok „A spousty dalších!" z `pd-row pd-row--reverse` na **`pd-row`**
   a upravit jeho komentář na `<!-- A spousty dalších (obrázek vlevo) -->`, aby zůstalo střídání
   vlevo/vpravo. Jinak budou dva bloky za sebou se stejnou orientací.

### Texty — přepsat PŘESNĚ 1:1 z podkladů LP

Odstavec pod nadpisem (LP hero, podtitul + tělo):

> Komplexní právní ochrana — podnikání (pojištění, úvěry, investice, reality) i ochrana řidiče v ČR i Evropě.

> Jako finanční poradce a vázaný zástupce odpovídáte za své jednání osobně ať už distribuujete pojištění (**zák. 170/2018 Sb.**), spotřebitelské úvěry a hypotéky (**zák. 257/2016 Sb.**) nebo investiční produkty (**zák. 256/2004 Sb.**). Za škodu klientovi sice odpovídá zastoupený (SZ, banka, obchodník s cennými papíry), ten ji ale může **regresivně vymáhat po vás**. **Odpovědnostní pojištění tu nestačí**, kryje škodu klientovi, ne ale vaši obhajobu, trestní řízení, spor o storno provizí, kontrolu ČNB nebo FÚ. To řeší jen právní ochrana.

Odrážky `pd-checklist` — 1:1 z pásu výhod pod cenou na LP (4 položky):

| # | Text 1:1 |
|---|---|
| 1 | Chrání před regresem samostatného zprostředkovatele dle § 16 zák. 170/2018 Sb. |
| 2 | Limit až 2,5 mil. Kč na každý případ |
| 3 | Tým advokátů a expertů se specializací na finanční trh |
| 4 | Bonus 25 % na domácnost — voucher ke každé smlouvě |

**Pravidlo pro texty:** žádné přeformulování. Pokud je druhý odstavec v layoutu příliš dlouhý,
zkrátit **pouze useknutím na hranici věty** (např. skončit po „…regresivně vymáhat po vás.") —
nikdy neměnit slova, ne slučovat věty, ne měnit interpunkci ani formátování `<strong>`.

### Cílová podoba bloku (šablona, doplnit rozhodnutí z fáze 1)

```html
<!-- Finanční poradci a realitní makléři (obrázek vpravo) -->
<div class="pd-row pd-row--reverse">
  <div class="pd-row__media">
    <!-- TODO: vyměnit za lx-ostatni-poradci.jpg -->
    <img src="assets/lx-firmy-uvod.jpg" alt="Finanční poradci a realitní makléři" loading="lazy">
  </div>
  <div class="pd-row__body">
    <h5 class="pd-row__title">Finanční poradci a realitní makléři</h5>
    <p>Komplexní právní ochrana — podnikání (pojištění, úvěry, investice, reality) i ochrana řidiče v ČR i Evropě.</p>
    <p>Jako finanční poradce a vázaný zástupce odpovídáte za své jednání osobně ať už distribuujete pojištění (<strong>zák. 170/2018 Sb.</strong>), spotřebitelské úvěry a hypotéky (<strong>zák. 257/2016 Sb.</strong>) nebo investiční produkty (<strong>zák. 256/2004 Sb.</strong>). Za škodu klientovi sice odpovídá zastoupený (SZ, banka, obchodník s cennými papíry), ten ji ale může <strong>regresivně vymáhat po vás</strong>. <strong>Odpovědnostní pojištění tu nestačí</strong>, kryje škodu klientovi, ne ale vaši obhajobu, trestní řízení, spor o storno provizí, kontrolu ČNB nebo FÚ. To řeší jen právní ochrana.</p>
    <ul class="pd-checklist">
      <li><span class="pd-check"><i class="icon" data-icon="check"></i></span> Chrání před regresem samostatného zprostředkovatele dle § 16 zák. 170/2018 Sb.</li>
      <li><span class="pd-check"><i class="icon" data-icon="check"></i></span> Limit až 2,5 mil. Kč na každý případ</li>
      <li><span class="pd-check"><i class="icon" data-icon="check"></i></span> Tým advokátů a expertů se specializací na finanční trh</li>
      <li><span class="pd-check"><i class="icon" data-icon="check"></i></span> Bonus 25 % na domácnost — voucher ke každé smlouvě</li>
    </ul>
    <div class="pd-row__cta">
      <a href="/financni-poradci" class="btn btn-primary">Zobrazit nabídku <i class="icon" data-icon="arrow_right"></i></a>
    </div>
  </div>
</div>
```

### Kontrolní seznam fáze 2
- [ ] `grep -n "Finanční poradci a realitní makléři" pro-koho.html` → přesně 1 zásah v `<h5>`
- [ ] Nový blok je uvnitř `#ostatni-detail` (mezi řádky 748 a uzavřením `pd-cta`)
- [ ] Nový blok je **za** „Obecní zastupitelé" a **před** „A spousty dalších!"
- [ ] `grep -c "pd-row" pro-koho.html` vzrostl o 1 blok (3 nové výskyty tříd: `pd-row`, `pd-row__media`, `pd-row__body` + `pd-row__title` + `pd-row__cta`)
- [ ] Orientace se střídá: …zastupitelé (`pd-row`) → poradci (`--reverse`) → spousty dalších (`pd-row`)
- [ ] Texty odpovídají tabulce výše znak po znaku (včetně `—`, `§`, mezer v „2,5 mil. Kč", „25 %")
- [ ] Žádný `style="` na novém bloku
- [ ] Žádná zmínka ceny 299 Kč / 508 Kč / „sleva 41 %" na `pro-koho.html`

---

## FÁZE 3 — CSS pro tlačítko v řádku

### Co udělat
Jediná nová třída. Přidat do `styles.css` **bezprostředně za `.pd-note-inline`** (končí kolem
řádku 6963), tedy do bloku patřícího k `pd-*` komponentám — ne na konec souboru:

```css
/* CTA tlačítko uvnitř řádku pilíře (odkaz na microsite) */
.pd-row__cta { margin-top: 24px; }
```

### Proč jen tohle
`.btn`, `.btn-primary` i ikonu už řeší globální styly. `.pd-cta` (řádek 7003) použít **nelze** —
je `text-align: center` a je určená pro patičku celého detailu, ne pro sloupec.

### Kontrolní seznam fáze 3
- [ ] `grep -n "pd-row__cta" styles.css` → 1 zásah
- [ ] `grep -c "\.pd-row {" styles.css` beze změny (původní pravidla nedotčena)
- [ ] Diff v `styles.css` má ≤ 3 přidané řádky, 0 odebraných

---

## FÁZE 4 — Cíl odkazu: microsite `/financni-poradci`

Microsite se bude stavět zvlášť. Teď jde jen o to, aby tlačítko nevedlo do 404.

### Co udělat
1. Vytvořit `financni-poradci/index.html` — dočasná stránka převzatá ze **struktury existující
   podstránky** (kopírovat `<head>`, `<nav>` a `<footer>` z `pro-koho.html`, ne psát od nuly),
   s upravenými relativními cestami (`../assets/…`, `../styles.css`, `../script.js`).
2. Obsah zatím: hero nadpis 1:1 z LP —
   „**Chráníme vaše podnikání i vaše práva na silnici.**" + podtitul
   „Komplexní právní ochrana — podnikání (pojištění, úvěry, investice, reality) i ochrana řidiče
   v ČR i Evropě." + odkaz zpět na `../pro-koho.html#ostatni`.
3. Ověřit, že `serve` doručí `/financni-poradci` (adresářový index).

### Otevřená otázka pro zadavatele
Zda microsite poběží **v tomto repu** (složka výše) nebo jako **samostatný projekt na subdoméně /
reverse proxy**. Pokud samostatný, fáze 4 se redukuje na „odkaz zatím vede na `kontakt.html`,
přepnout po nasazení". Do vyjasnění jede varianta „v tomto repu" — je vratná jedním smazáním složky.

### Kontrolní seznam fáze 4
- [ ] `financni-poradci/index.html` existuje
- [ ] `npm start` a načtení `http://localhost:3000/financni-poradci` → stav 200, ne 404
- [ ] Stránka má logo, navigaci i patičku (CSS a JS se načte přes `../`)
- [ ] Kliknutí na CTA v `pro-koho.html` skutečně přejde na tuto stránku

---

## FÁZE 5 — Návazné zmínky (drobné, ale patří k tomu)

1. `index.html:231` — dlaždice „Ostatní": text
   `Řešení pro zastupitele, SVJ, bytová družstva, spolky a odbory.`
   → doplnit finanční poradce. Přesné znění potvrdit; návrh:
   `Řešení pro zastupitele, finanční poradce, SVJ, bytová družstva, spolky a odbory.`
2. `pro-koho.html:7` — `<meta name="description">` neobsahuje poradce. Doplnit, pokud jde
   o SEO-relevantní segment.
3. `pro-koho.html:733` — `product-card__lead` u karty „Ostatní pojištění" (badge **„Již brzy"**).
   ⚠ Nová sekce vede na živou nabídku s cenou, ale sedí pod kartou označenou „Již brzy".
   Rozpor k rozhodnutí zadavatele: buď badge upravit, nebo poradce z „Ostatní" vyčlenit výš.
   **Tento bod needitovat bez pokynu** — mění to sdělení celé karty.

### Kontrolní seznam fáze 5
- [ ] Body 1 a 2 hotové (nebo vědomě odloženo)
- [ ] Bod 3 nahlášen zadavateli, needitován bez odpovědi

---

## FÁZE 6 — Ověření (finální)

### Statické kontroly
```bash
grep -n "Finanční poradci a realitní makléři" pro-koho.html
grep -n "financni-poradci" pro-koho.html
grep -n "pd-row__cta" styles.css pro-koho.html
grep -n "299 Kč\|508 Kč\|sleva 41" pro-koho.html   # musí být PRÁZDNÉ
grep -n "style=" pro-koho.html | sed -n '1,50p'     # nový blok tam nesmí figurovat
```

### Vizuální kontrola v prohlížeči (preview tools, ne ruční kontrola zadavatelem)
1. `preview_start` dle `.claude/launch.json`, otevřít `pro-koho.html`.
2. Kliknout „Zobrazit detail" u karty **Ostatní pojištění** → detail se rozbalí.
3. Doscrollovat: pořadí a orientace obrázků
   zdravotníci (L) → spolky (P) → odbory (L) → sportovci (P) → zastupitelé (L) →
   **poradci (P)** → spousty dalších (L).
4. `read_console_messages` → 0 chyb; ikona `check` i `arrow_right` se vykreslily
   (ne prázdný čtvereček → jinak chybí mapování v `assets/icons.js`).
5. `resize_window` preset **mobile** → blok 1 sloupec, obrázek nad textem, tlačítko na plnou
   čitelnost, žádný horizontální scroll.
6. `resize_window` preset **desktop** → obrázek kopíruje výšku textového sloupce (pravidlo
   `min-width: 901px` na `.pd-row__media img`); u delšího textu ověřit, že se fotka nenatáhne
   nepřirozeně — pokud ano, zkrátit 2. odstavec na hranici věty (viz fáze 2).
7. Kliknout CTA → přistane na `/financni-poradci`, stav 200.
8. Screenshot bloku (desktop + mobile) jako doklad.

### Kontrola textů 1:1
Porovnat vykreslený text s tabulkou ve fázi 2 znak po znaku. Nejčastější tichá odchylka:
`—` (em dash) nahrazený `-`, `§` bez mezery, „2,5 mil. Kč" bez pevné mezery, „25 %" bez mezery.

---

## Shrnutí změn

| Soubor | Změna |
|---|---|
| `pro-koho.html` | +1 blok `pd-row--reverse` (~20 řádků) mezi ř. 841 a 843; flip třídy u „A spousty dalších" |
| `styles.css` | +2 řádky: `.pd-row__cta { margin-top: 24px; }` |
| `financni-poradci/index.html` | nový, dočasný stub microsite |
| `assets/lx-ostatni-poradci.jpg` | **dodá zadavatel**, do té doby fallback |
| `index.html` | volitelně: doplnit poradce do textu dlaždice „Ostatní" |

**Čeká na zadavatele:** slug URL (doporučeno `/financni-poradci`), text tlačítka (doporučeno
„Zobrazit nabídku"), fotka, umístění microsite (tento repo × samostatný projekt), rozpor s badge
„Již brzy".
