# Lexia web — pokyny pro práci na projektu

## Komunikace s uživatelkou

- Barbora není vývojářka. Všechny postupy mimo kód piš **krok za krokem, klikací**:
  kam kliknout, co tam uvidí, co má udělat dál. Žádné "zkontroluj konfiguraci",
  ale "otevři Railway → vlevo klikni na projekt → záložka Settings → sekce Source".
- Nezadávej jí úkoly, které umím udělat sám. Commit a push dělám sama, když je práce hotová.
- Ptej se jen tehdy, když odpověď opravdu mění výsledek práce.

## Projekt

- Statický web (HTML + `styles.css` + `script.js`), bez build kroku.
- Nasazení: Railway, auto-deploy z GitHub repa `AAATom16/lexia-landing-redesign`, branch `main`.
  Push na `main` = nasazení na produkci.
- Lokální náhled: `npx serve . -l 8767` (konfigurace v `.claude/launch.json`).
- Kalkulačka: logika v `script.js` (`initCalculator`, `updateCalculator`, `updateSubjectBlocks`),
  markup v `kalkulacka.html`, ceník zrcadlí `admin.html`.
