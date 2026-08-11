# Šablona microsite pro segment

Kostra samostatné stránky pro jeden segment (finanční poradci, realitní makléři, …).
Žije na vlastní URL typu `lexia.cz/nazev-segmentu` a dědí design z hlavního `styles.css`.

První hotová instance: [`../financni-poradci/index.html`](../financni-poradci/index.html) — když si nejsi jistá, jak má
výsledek vypadat, otevři ji vedle šablony a porovnej.

---

## Postup: nová microsite za 5 minut

```bash
cp -r _sablona-microsite realitni-makleri
```

1. **Zkopíruj složku** a přejmenuj ji na slug segmentu.
   Slug **bez diakritiky**, slova oddělená pomlčkou: `realitni-makleri`, ne `realitní-makléři`.
   Diakritika se v URL zakóduje na `%C3%A1%C4%8D…` a rozbije sdílení odkazu, QR kódy i analytiku.
2. **Otevři `index.html`** a přepiš všechna místa se značkou `✎`. Nic jiného měnit nemusíš.
3. **Smaž `README.md`** z nové složky — patří jen k šabloně.
4. **Přidej odkaz** z `pro-koho.html` (viz „Napojení na Pro koho" níže).
5. **Zkontroluj** v prohlížeči na `http://localhost:8767/realitni-makleri`.

```bash
npm start
```

---

## Dvě pravidla, která to rozbijí

**Složka musí být přímo v kořeni projektu.** Všechny cesty v šabloně vedou přes `../`
(`../styles.css`, `../assets/…`). Zanoření o úroveň hlouběj (`segmenty/realitni-makleri/`)
způsobí, že se nenačte CSS ani obrázky a stránka bude vypadat jako holý text.

**Nezakládej vlastní CSS soubor.** Design drží pohromadě jen díky sdílenému `../styles.css`.
Pokud potřebuješ něco, co v přehledu tříd níže není, přidej pravidlo do `../styles.css`
k ostatním `pd-*` komponentám — ne do nové stránky.

---

## Co jde v šabloně použít

### Bloky (třídy z `../styles.css`)

| Třída | K čemu |
|---|---|
| `page-hero` | Úvodní pruh s `<h1>` a podtitulem |
| `container` | Obal držící obsah v maximální šířce, uvnitř `<section>` |
| `image-frame` + `image-frame--3x2` | Rámeček fotky se zaoblením. Poměry: `--16x9`, `--4x3`, `--3x2`, `--square`, `--portrait` |
| `image-frame--tinted` | Modrý nádech přes fotku, aby na ní byl čitelný štítek |
| `image-tag` | Bílý štítek přes fotku (uvnitř `image-frame`) |
| `pd-intro` + `pd-intro__title` | Nadpis sekce s odstavcem. Text v `<span>` uvnitř nadpisu zmodrá |
| `pd-checklist` + `pd-check` | Odrážky s modrým odškrtnutím |
| `pd-note-inline` | Drobná poznámka kurzívou |
| `pd-cta` | Vycentrovaná patička sekce s tlačítky |
| `hero-actions` | Obal tlačítek — sám řeší mezery a zalomení na mobilu |
| `product-block__badge` | Modrý štítek (např. „Nově v nabídce") |
| `product-block__badge--soft` | Tlumená šedá varianta štítku (např. „Připravujeme") |

### Tlačítka

| Třída | Vzhled |
|---|---|
| `btn btn-primary` | Modré plné — hlavní akce, na stránce jen jedno |
| `btn btn-outline` | Obrysové — vedlejší akce |
| `btn-lg` | Zvětšení, přidává se k oběma |

Šipku do tlačítka: `<i class="icon" data-icon="arrow_right"></i>` za text.

### Ikony

Zapisují se jako `<i class="icon" data-icon="NAZEV"></i>`. Dostupné názvy
(zdroj: [`../assets/icons.js`](../assets/icons.js)):

```
shield  car  briefcase  house  scales  construction  building  tree  user  users
bank  school  phone  mail  chat  location  clock  emergency  book  lock  warning
star  star_outline  clipboard  bolt  target  check  check_circle  trophy
handshake  graduation  road  monitor  arrow_right  chart  lifebuoy  umbrella
document  settings  logout  edit  trash  plus  arrow_down  sparkle
play_circle  question_mark
```

Jiný název než z tohoto seznamu se vykreslí jako prázdné místo — bez chybové hlášky.

### Fotky

Ukládej do `../assets/` s prefixem `lx-`. Poměr stran nejméně 3:2 (ideálně 1400×933 px),
formát `.jpg`. Stránka fotku ořízne na poměr rámečku přes `object-fit: cover` —
důležitý motiv patří doprostřed, kraje se můžou uříznout.

---

## Napojení na „Pro koho"

Aby se na novou microsite někdo dostal, přidej do příslušného detailu v `pro-koho.html`
blok `pd-row` s tlačítkem. Vzor je hotový u finančních poradců — vyhledej
`Finanční poradci a realitní makléři` a zkopíruj celý `<div class="pd-row …">`.

Dvě věci u zkopírovaného bloku ohlídej:

- **Střídání stran.** Bloky se pravidelně střídají obrázek vlevo / vpravo.
  Sudý zleva = `class="pd-row"`, lichý zprava = `class="pd-row pd-row--reverse"`.
  Když vkládáš doprostřed, překlop všechny bloky pod sebou.
- **Odkaz.** `href="/nazev-segmentu"` — s lomítkem na začátku, bez `.html` na konci.

---

## Nasazení

Složka `_sablona-microsite` je v `.railwayignore`, takže se **nenasazuje na produkci** —
šablona zůstává jen v repozitáři. Nová složka se slugem se nasazuje normálně,
žádnou konfiguraci pro ni přidávat nemusíš: `serve` obslouží `index.html`
na adrese `/nazev-slozky` sám.
