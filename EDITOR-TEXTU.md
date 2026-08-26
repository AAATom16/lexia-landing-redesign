# Editor textů — návod

Editor umožňuje přepisovat texty přímo ve stránce, bez zásahu do kódu.
Je schovaný za heslem. Kdo heslo nemá, vidí web úplně normálně.

---

## 1. Jak se to používá (pro člověka, který bude texty upravovat)

1. Otevřít adresu **`https://<adresa-webu>/editor`**
2. Vyplnit **jméno** (nepovinné — objeví se u úprav v historii), zadat heslo
   a kliknout na **Přihlásit se**
3. Objeví se seznam stránek. U vybrané stránky kliknout na **Otevřít a upravit**
4. Stránka se otevře jako normální web, ale dole se ukáže bílý pruh
   **„Editor textů"**. Kliknout v něm na **Upravit texty**
5. Všechny texty, které jdou měnit, dostanou tečkovaný rámeček.
   Kliknout do textu a přepsat ho jako ve Wordu
6. Upravený text zezelená. Dole se objeví počet změn
7. Kliknout na **Uložit** (nebo Ctrl+S / Cmd+S). Stránka se znovu načte
   a změna je hned vidět i pro návštěvníky webu

### Co ještě pruh umí

- **Zahodit** — zruší rozepsané změny, které ještě nebyly uloženy
- **Vrátit původní text** — malá černá bublinka u textu, do kterého se zrovna
  klikne. Vrátí znění, které je v původní verzi webu
- **Přehled** — seznam všech stránek a kolik má která upravených textů.
  U každé je i tlačítko **Vrátit vše**
- **Odhlásit** — konec práce. Přihlášení jinak vyprší samo po 12 hodinách

### Dobré vědět

- Enter uvnitř textu udělá **zalomení řádku**, ne nový odstavec
- Vložení textu ze schránky (Ctrl+V) vloží jen čistý text, bez cizího formátování
- Nejdou měnit: obrázky, ceny počítané kalkulačkou, čísla smluv a další údaje,
  které dopočítává skript. Ty rámeček nedostanou
- Odkazy v režimu úprav nepřepínají stránku — klik do nich jen postaví kurzor,
  aby šel text odkazu přepsat. Když je potřeba odkaz přesto otevřít, stačí
  při kliknutí držet **Ctrl** (na Macu **Cmd**)
- Režim úprav zůstane zapnutý i po přechodu na jinou stránku, takže jde
  web procházet a průběžně opravovat texty
- Texty jsou vedené zvlášť pro každou stránku. Když se stejný text opakuje
  (třeba v patičce), úprava se projeví jen na té stránce, kde se udělala
- Úpravy **nemění soubory webu**. Ukládají se zvlášť a při zobrazení se do stránky
  jen doplní. Kdykoliv jdou vrátit zpátky

---

## 1b. Historie úprav (pro správce)

Každé uložení se zapíše. Nic se nedá nenávratně rozbít.

1. V editoru kliknout vpravo nahoře na **Historie úprav**
   (nebo rovnou na `https://<adresa-webu>/editor/historie`)
2. Je tam seznam: **kdy**, **kdo**, **která stránka**, **kolik textů** se změnilo
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

### Krok B — místo pro uložené texty

Bez tohoto kroku by se úpravy ztratily při každém novém nasazení webu.

1. Ve stejné službě přepnout na záložku **Settings**
2. Najít sekci **Volumes** a kliknout na **+ New Volume** / **Add Volume**
   (v některých verzích Railway je volba i po kliknutí pravým tlačítkem
   na dlaždici služby → **Attach Volume**)
3. Do pole **Mount path** napsat `/data`
4. Potvrdit

### Krok C — propojení

1. Zpátky na záložku **Variables**
2. **+ New Variable**
3. Název `DATA_DIR`, hodnota `/data`
4. Uložit

Railway po uložení proměnných web sám znovu nasadí. Za minutu až dvě
je editor dostupný na `https://<adresa-webu>/editor`.

### Kontrola, že to sedí

- `https://<adresa-webu>/editor` ukáže přihlašovací okno → hotovo
- Hlásí „Editor není zapnutý" → chybí krok A
- Přihlášení projde, ale po nasazení nové verze webu jsou úpravy pryč
  → chybí krok B nebo C

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
