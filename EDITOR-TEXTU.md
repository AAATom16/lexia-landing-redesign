# Editor textů — návod

Editor umožňuje přepisovat texty přímo ve stránce, bez zásahu do kódu.
Je schovaný za heslem. Kdo heslo nemá, vidí web úplně normálně.

---

## 1. Jak se to používá (pro člověka, který bude texty upravovat)

1. Otevřít adresu **`https://<adresa-webu>/editor`**
2. Zadat heslo a kliknout na **Přihlásit se**
3. Otevře se rovnou úvodní stránka webu, dole s bílým pruhem **„Editor textů"**
   a už zapnutými úpravami
4. Texty, které jdou měnit, mají tečkovaný rámeček. Kliknout do textu
   a přepsat ho jako ve Wordu
5. Upravený text zezelená, v pruhu dole naskočí počet změn
6. Kliknout na **Uložit** (nebo Ctrl+S / Cmd+S). Stránka nikam neuskočí
   a změna je hned vidět i pro návštěvníky webu

**Web se dá normálně proklikávat** — odkazy i menu fungují jako obvykle,
takže se dá jít na další stránku a pokračovat tam. Režim úprav zůstává
zapnutý. Jen pozor: než odejdete ze stránky, uložte, jinak se rozepsaná
změna ztratí (prohlížeč na to upozorní).

### Co ještě pruh umí

- **Ukončit úpravy** — vypne rámečky, web se chová úplně normálně
- **Zahodit** — zruší rozepsané změny, které ještě nebyly uloženy
- **Přehled** — seznam všech stránek a kolik má která upravených textů
  (`/editor/stranky`). U každé je i tlačítko **Vrátit vše**
- **Odhlásit** — konec práce. Přihlášení jinak vyprší samo po 12 hodinách

U textu, do kterého se zrovna píše, se nahoře objeví černá bublinka:

- **Vrátit původní text** — vrátí znění z původní verze webu
- **Hotovo** — ukončí psaní do tohoto textu

### Dobré vědět

- Enter uvnitř textu udělá **zalomení řádku**, ne nový odstavec
- Vložení textu ze schránky (Ctrl+V) vloží jen čistý text, bez cizího formátování
- Nejdou měnit: obrázky, ceny počítané kalkulačkou, čísla smluv a další údaje,
  které dopočítává skript. Ty rámeček nedostanou
- Kliknutí na odkaz stránku normálně přepne. U textů, které jsou **celé
  odkazem** (položky v menu, tlačítka), se při najetí myší objeví modré
  kolečko s tužkou — kliknutím na něj se text začne upravovat
- Režim úprav zůstane zapnutý i po přechodu na jinou stránku
- Texty jsou vedené zvlášť pro každou stránku. Když se stejný text opakuje
  (třeba v patičce), úprava se projeví jen na té stránce, kde se udělala
- Úpravy **nemění soubory webu**. Ukládají se zvlášť a při zobrazení se do stránky
  jen doplní. Kdykoliv jdou vrátit zpátky

---

## 1b. Historie úprav (pro správce)

Každé uložení se zapíše. Nic se nedá nenávratně rozbít.

1. V pruhu dole kliknout na **Přehled** a tam vpravo nahoře na **Historie úprav**
   (nebo rovnou na `https://<adresa-webu>/editor/historie`)
2. Je tam seznam: **kdy**, **co se dělo**, **která stránka**, **kolik textů**
   se změnilo
3. **Co se změnilo** ukáže u každého textu vedle sebe červeně **PŘED**
   a zeleně **PO**
4. **Vrátit zpět** vrátí texty na celém webu do podoby těsně před tou úpravou

Dobré vědět:

- I samotné vrácení se zapíše do historie, takže jde vrátit i to vrácení.
  Nic se neztratí
- Historie si pamatuje posledních **150 uložení**, starší se postupně mažou
- U každé stránky v přehledu je i tlačítko **Historie** — ukáže jen úpravy
  té jedné stránky

---

## 2. Jednorázové nastavení na Railway

Bez těchto tří kroků editor **není zapnutý** — web funguje dál normálně,
jen adresa `/editor` hlásí, že editor není nastavený.

### Krok A — heslo

1. Otevřít [railway.app](https://railway.app) a přihlásit se
2. Kliknout na projekt s webem Lexia
3. Kliknout na službu (dlaždice s názvem webu)
4. Nahoře přepnout na záložku **Variables**
5. Kliknout na **+ New Variable**
6. Do pole názvu napsat `LEXIA_EDITOR_PASSWORD`
7. Do pole hodnoty napsat vymyšlené heslo — ideálně dlouhé, aspoň 16 znaků,
   něco jako `pravni-ochrana-2026-Lexia!` (toto konkrétní nepoužívat)
8. Kliknout na **Add** / **Save**

### Krok B — místo pro uložené texty (Volume)

Bez tohoto kroku by se úpravy i historie ztratily při každém novém nasazení webu.

**Volume se nezakládá v Settings služby** — tam ho marně hledáte. Dělá se
na hlavní ploše projektu:

1. Zavřít panel služby (křížek vpravo nahoře), ať je vidět plocha projektu
   s dlaždicí webu
2. Vpravo nahoře kliknout na **+ Create** (nebo stisknout **Cmd + K**
   a napsat `volume`)
3. Ze seznamu vybrat **Volume**
4. Railway se zeptá, ke které službě ho připojit — vybrat službu s webem
   (`lexia-web`)
5. Do pole **Mount path** napsat `/data`
6. Potvrdit

Jde to i takto: najet myší na dlaždici služby → tři tečky → **Attach Volume**.

Nic dalšího vyplňovat netřeba — server si cestu k Volume přečte od Railway sám.
(Kdyby bylo někdy potřeba jiné umístění, dá se přebít proměnnou `DATA_DIR`.)

Railway po uložení web sám znovu nasadí. Za minutu až dvě
je editor dostupný na `https://<adresa-webu>/editor`.

### Kontrola, že to sedí

- `https://<adresa-webu>/editor` ukáže přihlašovací okno → hotovo
- Hlásí „Editor není zapnutý" → chybí krok A
- Přihlášení projde, ale po nasazení nové verze webu jsou úpravy pryč
  → chybí krok B (Volume)

---

## 3. Bezpečnost

- Heslo zná jen ten, kdo má texty upravovat. Kdo ho nemá, o editoru vůbec neví
- Po 10 chybných pokusech se přihlašování na 15 minut zablokuje
- Přihlášení platí 12 hodin, pak je potřeba zadat heslo znovu
- Stránky editoru se neindexují ve vyhledávačích
- Heslo se mění v Railway → Variables → `LEXIA_EDITOR_PASSWORD`.
  Změna hesla zároveň odhlásí všechny přihlášené

---

## 4. Pro vývoj na vlastním počítači

Heslo se bere ze souboru `.env` v kořeni projektu (do gitu se neukládá):

```
LEXIA_EDITOR_PASSWORD=lexia-test
```

Spuštění webu:

```bash
npm start
```

Web běží na `http://localhost:8767`, editor na `http://localhost:8767/editor`.
Upravené texty jsou v `data/content.json` (také mimo git).

---

## 5. Kde co je (technická poznámka)

| Soubor | K čemu |
|---|---|
| `server.js` | server webu + routy editoru |
| `cms/extract.js` | najde ve stránce texty, které jdou upravovat |
| `cms/render.js` | složí stránku z původního HTML a uložených úprav |
| `cms/sanitize.js` | očistí text přicházející z editoru |
| `cms/store.js` | čtení a zápis `content.json` |
| `cms/auth.js` | heslo a přihlašovací cookie |
| `cms/history.js` | historie úprav a vracení starších verzí |
| `cms/assets/` | vzhled a chování editoru v prohlížeči |
| `data/content.json` | uložené úpravy textů |
| `data/history.jsonl` | seznam všech uložení |
| `data/versions/` | stav webu před každou úpravou (pro vracení zpět) |

Původní `.html` soubory se needitují. Každý text má klíč odvozený z jeho
původního znění — když se text ve zdrojovém souboru změní, uložená úprava
se pro jistotu přestane používat a zobrazí se nové znění ze souboru.
