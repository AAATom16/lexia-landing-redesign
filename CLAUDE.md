# Lexia web — pokyny pro práci na projektu

## Komunikace s uživatelkou

- Barbora není vývojářka. Všechny postupy mimo kód piš **krok za krokem, klikací**:
  kam kliknout, co tam uvidí, co má udělat dál. Žádné "zkontroluj konfiguraci",
  ale "otevři Railway → vlevo klikni na projekt → záložka Settings → sekce Source".
- Nezadávej jí úkoly, které umím udělat sám. Commit a push dělám sama, když je práce hotová.
- Ptej se jen tehdy, když odpověď opravdu mění výsledek práce.

## Projekt

- Statický web (HTML + `styles.css` + `script.js`), bez build kroku.
- Servíruje ho `server.js` (Express) — kromě rozdávání souborů umí i editor textů.
- Nasazení: Railway, auto-deploy z GitHub repa `AAATom16/lexia-landing-redesign`, branch `main`.
  Push na `main` = nasazení na produkci.
- Lokální náhled: `npm start` → `http://localhost:8767` (konfigurace v `.claude/launch.json`).
- Kalkulačka: logika v `script.js` (`initCalculator`, `updateCalculator`, `updateSubjectBlocks`),
  markup v `kalkulacka.html`, ceník zrcadlí `admin.html`.

## Editor textů (`/editor`)

- Návod pro uživatele i nastavení na Railway: `EDITOR-TEXTU.md`.
- Kód v `cms/` (`extract` → co jde upravovat, `render` → složení stránky,
  `sanitize`, `store`, `auth`, `history`), klientská část v `cms/assets/`.
- Historie: každé uložení zapíše do `data/history.jsonl` metadata a do
  `data/versions/<id>.json` rozdíly + kompletní stav webu před úpravou.
  `/editor/historie` umí vrátit web do stavu před libovolnou úpravou
  (a vrácení je samo dalším záznamem, takže je vratné). Drží se 150 verzí.
- Úpravy se ukládají do `data/content.json` (mimo git), zdrojové `.html` zůstávají
  nedotčené. Klíč textu je otisk jeho původního znění — **po přepsání textu
  ve zdrojovém `.html` se dřívější úprava tohoto místa přestane používat.**
- Prvky, které přepisuje `script.js` za běhu (`data-echo`, `data-d`/`data-j`,
  `data-detail-toggle`, `id="sum-*"`), jsou z editace vyloučené. Další místa jde vyřadit atributem
  `data-no-edit`.
- Zapíná se proměnnou `LEXIA_EDITOR_PASSWORD`; bez ní je editor vypnutý.
