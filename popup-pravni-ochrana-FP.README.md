# Pop-up: Pojištění právní ochrany pro finanční poradce

Předloha pop-up okna pro implementaci mimo web Lexia. Design odpovídá
brand manuálu Lexia 2025 (barvy, fonty Nunito ExtraBold + Poppins).

## Soubor

- `popup-pravni-ochrana-FP.html` — vše v jednom souboru (HTML + CSS + ikony
  jako inline SVG). Externí závislost je jen načtení fontů z Google Fonts
  (`Nunito` 700/800, `Poppins` 400–700).
- Šedomodré bloky v pozadí jsou jen demo kulisa pro náhled — do produkce
  se přebírá pouze blok označený `<!-- ══ POP-UP — tato část se přebírá ══ -->`
  (element `.popup-backdrop` a k němu příslušné CSS).

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

## Co doplnit při implementaci

- `href` u tlačítka **Sjednat** — odkaz na sjednání pojištění (v předloze
  je zatím `#`).
- Křížek (`.popup-close`) v demu jen skryje okno přes inline `onclick` —
  při implementaci napojte na vlastní logiku zavírání.

## Použité brand barvy

| Token | Hex | Použití |
|---|---|---|
| Cobalt Blue | `#0045bf` | štítek, nadpisek, CTA gradient |
| Deep Navy | `#001a4d` | hlavní nadpis, ztmavené pozadí (overlay) |
| Blue Teal | `#00a5bf` | ikony odrážek (fajfky) |
| Deep Teal | `#005f72` | zvýhodněná cena |
| Yellow | `#f2d800` | jiskra ve štítku |
| Brand Red | `#ef463f` | přeškrtnutá původní cena |
| Light Blue | `#f0f5ff` | podklad cenového pruhu |
