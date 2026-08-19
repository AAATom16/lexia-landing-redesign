# Pop-up: Pojištění právní ochrany pro finanční poradce

Předloha pop-up okna pro implementaci mimo web Lexia. Design vychází
z vizuálního stylu Lexia (fonty Nunito ExtraBold + Poppins): tyrkysový
štítek se zvýhodněním, tyrkysová cena a fajfky.

## Soubor

- `popup-pravni-ochrana-FP.html` — vše v jednom souboru (HTML + CSS + ikony
  jako inline SVG). Externí závislost je jen načtení fontů z Google Fonts
  (`Nunito` 700/800, `Poppins` 400–700).
- Šedomodré bloky v pozadí jsou jen demo kulisa pro náhled — do produkce
  se přebírá pouze blok označený `<!-- ══ POP-UP — tato část se přebírá ══ -->`
  (element `.popup-backdrop` a k němu příslušné CSS).
- Responzivní: na mobilu (do 560 px) se okno přilepí k dolní hraně
  a zmenší typografii.

## Kdy pop-up zobrazit (logika zobrazení)

Pop-up se zobrazí **po přihlášení** uživatele, a to pouze pokud platí
obě podmínky současně:

1. přihlášený uživatel je **finanční poradce**, a zároveň
2. **pojištění právní ochrany pro finanční poradce ještě nemá sjednané**.

Ve všech ostatních případech (jiný typ uživatele, nebo poradce s již
sjednaným pojištěním) se pop-up nezobrazuje. Tím je nabídka cílená přímo
na finanční poradce bez tohoto pojištění.

Doporučení navíc (volitelné): zobrazení po přihlášení případně omezit
frekvencí (např. max. 1× denně), ať poradce pop-up neobtěžuje při každém
přihlášení — dle vašeho uvážení.

## Tlačítka

- **Sjednat** (modré, primární) — `href` doplňte, odkaz na sjednání
  pojištění (v předloze je zatím `#`).
- **Chci vědět více** (obrysové, sekundární) — vede na microsite
  pro finanční poradce: `https://lexia.cz/financni-poradci`
  (otevírá se do nové záložky).

## Co doplnit při implementaci

- `href` u tlačítka **Sjednat** (viz výše).
- Křížek (`.popup-close`) v demu jen skryje okno přes inline `onclick` —
  při implementaci napojte na vlastní logiku zavírání.

## Použité barvy

| Barva | Hex | Použití |
|---|---|---|
| Blue Teal | `#00a5bf` | štítek se zvýhodněním, fajfky u výhod |
| Deep Teal | `#005f72` | zvýhodněná cena |
| Cobalt Blue | `#0045bf` | nadpisek, tlačítko Sjednat (gradient) |
| Deep Navy | `#001a4d` | hlavní nadpis, overlay |
| Light Blue | `#f0f5ff` | podklad cenového pruhu |
| Grey (muted) | `#4a5468` | přeškrtnutá původní cena |

Ikona ve štítku: **gift** (dárek) z `assets/icons.js` — vlastní ikonová
sada webu Lexia (Phosphor-style, stroke 1.5 px), stejný styl jako fajfky,
šipka a křížek.
