'use strict';
/**
 * Lexia web — statický server + editor textů.
 *
 * Bez nastaveného hesla (LEXIA_EDITOR_PASSWORD) se chová přesně jako dosavadní
 * `serve`: jen rozdává soubory. S heslem navíc umí přihlášení a úpravy textů
 * přímo ve stránce.
 */

require('./cms/env').loadEnv();

const express = require('express');
const fs = require('fs');
const path = require('path');

const auth = require('./cms/auth');
const store = require('./cms/store');
const history = require('./cms/history');
const { render } = require('./cms/render');
const { extract } = require('./cms/extract');
const { sanitize } = require('./cms/sanitize');

const ROOT = __dirname;
const PORT = process.env.PORT || 8767;
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

// ---------------------------------------------------------------- pomocné

/** Soubory, které nemají co dělat na veřejném webu. */
const DENY = [
  /^\./, /(^|\/)node_modules(\/|$)/, /^cms(\/|$)/, /^data(\/|$)/,
  /^server\.js$/, /^package(-lock)?\.json$/, /\.md$/i, /\.tgz$/i,
  /^_to_delete(\/|$)/, /^_sablona-microsite(\/|$)/,
];

/**
 * Stránky, které na ostrém webu být nesmí, ale mají zůstat dostupné pro práci
 * na novém webu.
 *
 * Roman 3. 9. 2026: „to vidím úplně poprvé… zatím nijak, asi nápady/invence
 * během přípravy nového webu… může to prosím zůstat někde na railway ale na
 * ostrém webu nikoliv."
 *
 * Jde o:
 *
 *  - `akce.html` — slibuje slevu 50 %, bonus 500 Kč za doporučení a soutěž
 *    o iPhone, což nikdo neschválil. Z webu na ni nevedl jediný odkaz, ale byla
 *    veřejně dostupná, takže se na ty sliby šlo odvolat.
 *  - `sluzby.html` (Roman 3. 9. 2026: „prosím tuhle stránku z webu úplně skrýt,
 *    je zjevně nedodělaná") a její detail `nabidka.html`. Na `sluzby.html`
 *    mířila položka „Ceník" v hlavní navigaci všech stránek — ta proto ze
 *    stránek mizí spolu s tímhle záznamem, protože odkaz na 404 je horší než
 *    žádný odkaz. `nabidka.html` je detail balíčku pod ní: nevede na ni odkaz
 *    odnikud a sama odkazuje zpátky na skrytý ceník, takže veřejně zůstat
 *    nemůže — přesně to byl případ `akce.html`.
 *
 * Ostrý web i náhled na Railway jsou TÁŽ aplikace (www.lexia.cz je CNAME na
 * *.up.railway.app), takže je nejde oddělit nasazením — jen hostitelem. Na
 * lexia.cz vrací 404, na railwayové adrese se servírují dál.
 */
const OSTRE_HOSTY = new Set(['lexia.cz', 'www.lexia.cz']);
const JEN_MIMO_OSTRY_WEB = [
  /^\/akce(\.html)?\/?$/i,
  /^\/sluzby(\.html)?\/?$/i,
  /^\/nabidka(\.html)?\/?$/i,
];

/**
 * Měření návštěvnosti a souhlas s ním.
 *
 * ID měření od Adme (Ladislav Šmíd, 3. 9. 2026, stream „www" pro
 * https://www.lexia.cz). Není to tajemství — v hotové stránce ho vidí každý,
 * kdo se podívá do zdroje; proto je rovnou tady a ne v proměnné prostředí.
 *
 * Vkládá se AŽ PŘI ODESLÁNÍ stránky, ne do souborů, ze dvou důvodů:
 *
 *  1. Web má pětadvacet samostatných HTML stránek bez společné hlavičky. Kód
 *     nalepený do každé z nich je pětadvacet kopií, které se časem rozejdou,
 *     a nová stránka by měření tiše minula. Vkládáním cestou ven jsou zdarma
 *     pokryté i mikrostránky /reality a /financniporadci.
 *  2. Ostrý web a náhled na Railway jsou TÁŽ aplikace (www.lexia.cz je CNAME
 *     na *.up.railway.app). Kód natvrdo ve stránce by počítal každý náš test
 *     a každý náhled jako návštěvu lexia.cz. Proto se měří jen na ostrých
 *     hostech — a při práci v editoru vůbec, ať si redaktor nezaměřuje sám
 *     sebe.
 *
 * --- Souhlas ---------------------------------------------------------------
 *
 * Analytická cookies jsou v ČR na výslovný souhlas od 1. 1. 2022 (§ 89 odst. 3
 * zákona č. 127/2005 Sb.). Nestačí tedy lišta, která jen oznamuje, že se měří.
 *
 * Zvolili jsme nejpřísnější variantu, jaká jde: dokud návštěvník nesouhlasí,
 * NEODEJDE na Google ani jeden požadavek — skript gtag.js se do stránky vloží
 * teprve po kliknutí na „Přijmout". Google nabízí i mírnější Consent Mode, kde
 * se skript načte hned a jen nesmí ukládat; ten by nám dal víc dat, ale zároveň
 * by prohlížeč návštěvníka kontaktoval Google dřív, než k tomu dal svolení.
 * U firmy, která prodává právní ochranu, to nestojí za tu diskuzi. Consent Mode
 * nastavujeme i tak, jako druhou pojistku pro případ, že by se skript někdy
 * načetl jinudy.
 *
 * „Odmítnout" a „Přijmout" jsou stejně velké, stejně tučné a na stejné úrovni —
 * odmítnutí musí být stejně snadné jako souhlas. Volba se pamatuje v
 * localStorage (uložit vlastní rozhodnutí je „nezbytně nutné", tedy bez
 * souhlasu přípustné) a dá se kdykoli změnit odkazem „Nastavení cookies"
 * v patičce.
 */
const GA_ID = 'G-LW56283YF2';

const SOUHLAS_BLOK = `
<style>
.lx-ck{position:fixed;left:0;right:0;bottom:0;z-index:9999;padding:0 16px 16px;
  font-family:var(--font-base,'Poppins',Arial,sans-serif)}
.lx-ck[hidden]{display:none}
.lx-ck-in{max-width:1080px;margin:0 auto;background:var(--white,#fff);
  border:1px solid var(--border,#e5e9f0);border-radius:var(--radius,12px);
  box-shadow:0 10px 34px -6px rgba(0,26,77,.28);padding:20px 24px;
  display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.lx-ck-txt{flex:1 1 420px;min-width:0}
.lx-ck-txt strong{display:block;font-family:var(--font-heading,'Nunito',Arial,sans-serif);
  font-weight:800;color:var(--heading,#001a4d);font-size:16px;margin-bottom:4px}
.lx-ck-txt p{margin:0;font-size:14px;line-height:1.55;color:var(--text-muted,#4a5468)}
.lx-ck-txt a{color:var(--primary,#0045bf);text-decoration:underline}
.lx-ck-btns{display:flex;gap:12px;flex:0 0 auto}
.lx-ck-b{font-family:inherit;font-size:15px;font-weight:600;line-height:1;
  padding:12px 26px;min-height:44px;min-width:148px;border-radius:999px;
  cursor:pointer;border:1.5px solid transparent;transition:background .15s,border-color .15s}
.lx-ck-b:focus-visible{outline:3px solid var(--accent,#00a5bf);outline-offset:2px}
.lx-ck-no{background:var(--white,#fff);color:var(--heading,#001a4d);
  border-color:var(--border-strong,#cfd6e2)}
.lx-ck-no:hover{background:var(--bg-light,#f0f5ff);border-color:var(--primary-light,#7da0dc)}
.lx-ck-yes{background:var(--primary,#0045bf);color:#fff;border-color:var(--primary,#0045bf)}
.lx-ck-yes:hover{background:var(--primary-dark,#003599);border-color:var(--primary-dark,#003599)}
.lx-ck-open{background:none;border:0;padding:0;font:inherit;color:inherit;
  text-decoration:underline;cursor:pointer}
@media (max-width:720px){
  .lx-ck-in{padding:18px;gap:16px}
  .lx-ck-btns{width:100%}
  .lx-ck-b{flex:1 1 0;min-width:0;padding:12px 12px}
}
</style>
<div class="lx-ck" id="lx-ck" role="region" aria-label="Souhlas s měřením návštěvnosti" hidden>
  <div class="lx-ck-in">
    <div class="lx-ck-txt">
      <strong>Měření návštěvnosti</strong>
      <p>Rádi bychom sledovali, jak se vám web používá, abychom ho mohli zlepšovat.
        Dokud nám to nedovolíte, nic neukládáme a na Google neodchází žádný požadavek.
        Podrobnosti najdete v <a href="/assets/dokumenty/informace-o-zpracovani-osobnich-udaju.pdf" target="_blank" rel="noopener">informacích ke zpracování osobních údajů</a>.</p>
    </div>
    <div class="lx-ck-btns">
      <button type="button" class="lx-ck-b lx-ck-no" data-ck="denied">Odmítnout</button>
      <button type="button" class="lx-ck-b lx-ck-yes" data-ck="granted">Přijmout</button>
    </div>
  </div>
</div>
<script>
(function () {
  var KLIC = 'lexia-souhlas-mereni';
  var ID = '${GA_ID}';
  var lista = document.getElementById('lx-ck');
  if (!lista) return;

  function precti() {
    try { return localStorage.getItem(KLIC); } catch (e) { return null; }
  }
  function uloz(v) {
    try { localStorage.setItem(KLIC, v); } catch (e) { /* soukromé okno */ }
  }

  // Skript Googlu se vkládá teprve tady, po souhlasu.
  function zapniMereni() {
    if (window.__lxMereni) return;
    window.__lxMereni = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied',
      ad_personalization: 'denied', analytics_storage: 'denied'
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ID);
  }

  function ukaz() { lista.hidden = false; }
  function skryj() { lista.hidden = true; }

  lista.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ck]');
    if (!b) return;
    var volba = b.getAttribute('data-ck');
    uloz(volba);
    skryj();
    if (volba === 'granted') zapniMereni();
  });

  // Odkaz na změnu rozhodnutí. Patří do patičky vedle GDPR; na stránkách bez
  // patičky (vyskakovací okna produktů) se prostě nezobrazí.
  var paticka = document.querySelector('.footer-bottom span:last-child')
    || document.querySelector('.footer-bottom');
  if (paticka) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lx-ck-open';
    b.textContent = 'Nastavení cookies';
    b.addEventListener('click', ukaz);
    paticka.append(' • ', b);
  }

  var volba = precti();
  if (volba === 'granted') zapniMereni();
  else if (volba !== 'denied') ukaz();
})();
</script>
`;

/** Vloží lištu souhlasu (a s ní měření) těsně před `</body>`. */
function vlozMereni(html) {
  const i = html.search(/<\/body>/i);
  if (i < 0) return html;
  return html.slice(0, i) + SOUHLAS_BLOK + html.slice(i);
}

const REWRITES = { '/financniporadci': '/financni-poradci/index.html' };
// Klientská zóna a administrace nikdy nebyly funkční — statické atrapy
// duplikovaly portál (klient.html dokonce ukazoval vymyšlený počet klientů).
// Skutečné obojí žije na portálu; staré adresy tam posíláme, ať nepadají na 404.
const PORTAL_LOGIN = 'https://portal.lexia.cz/login';
const REDIRECTS = {
  '/financni-poradci': '/financniporadci',
  '/financni-poradci/': '/financniporadci',
  '/klient': PORTAL_LOGIN,
  '/klient.html': PORTAL_LOGIN,
  '/admin': PORTAL_LOGIN,
  '/admin.html': PORTAL_LOGIN,
};

function safeRelative(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const rel = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  if (rel.includes('\0')) return null;
  const abs = path.resolve(ROOT, rel);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return rel;
}

const isDenied = (rel) => DENY.some((re) => re.test(rel));
const fileExists = (rel) => {
  try {
    return fs.statSync(path.join(ROOT, rel)).isFile();
  } catch {
    return false;
  }
};

/** Z URL udělá cestu k .html souboru, nebo vrátí null. */
function resolveHtml(urlPath) {
  const rewritten = REWRITES[urlPath] || urlPath;
  let rel = safeRelative(rewritten);
  if (rel === null) return null;
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  const candidates = rel.endsWith('.html') ? [rel] : [rel + '.html', path.posix.join(rel, 'index.html')];
  for (const candidate of candidates) {
    if (!isDenied(candidate) && fileExists(candidate)) return candidate;
  }
  return null;
}

/** Všechny stránky webu, pro přehled v editoru. */
function listPages() {
  const out = [];
  const skipDirs = new Set(['node_modules', 'cms', 'data', 'assets', '_to_delete', '_sablona-microsite', '.git', '.claude']);
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name), rel);
      } else if (entry.name.endsWith('.html') && !entry.name.startsWith('_')) {
        out.push(rel);
      }
    }
  };
  walk(ROOT, '');
  return out.sort((a, b) => a.localeCompare(b, 'cs'));
}

/** Rozbor stránky je drahý, držíme ho v paměti dokud se soubor nezmění. */
const pageCache = new Map();

function readPage(rel) {
  const abs = path.join(ROOT, rel);
  const { mtimeMs } = fs.statSync(abs);
  const cached = pageCache.get(rel);
  if (cached && cached.mtimeMs === mtimeMs) return cached;
  const source = fs.readFileSync(abs, 'utf8');
  const entry = { mtimeMs, source, items: extract(source) };
  pageCache.set(rel, entry);
  return entry;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------ editor: UI

const shell = (title, body) => `<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} | Lexia</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/editor/assets/cms-admin.css">
</head><body>${body}</body></html>`;

function loginPage(error, next) {
  return shell('Přihlášení do editoru', `
<div class="lx-auth">
  <form class="lx-card" method="post" action="/editor/prihlaseni">
    <img src="/assets/lexia-logo.svg" alt="Lexia" class="lx-logo">
    <h1>Editor textů</h1>
    <p class="lx-muted">Zadejte heslo, které jste dostali od správce webu.</p>
    ${error ? `<p class="lx-error">${esc(error)}</p>` : ''}
    <input type="hidden" name="next" value="${esc(next || '/?edit=1')}">
    <label for="heslo">Heslo</label>
    <input id="heslo" name="heslo" type="password" autocomplete="current-password" autofocus required>
    <button type="submit" class="lx-btn">Přihlásit se</button>
  </form>
</div>`);
}

function overviewPage() {
  const edits = Object.fromEntries(store.summary().map((s) => [s.page, s]));
  const rows = listPages().map((page) => {
    const info = edits[page];
    const url = '/' + page + '?edit=1';
    return `<tr>
      <td><a href="${esc(url)}" class="lx-page">${esc(page)}</a></td>
      <td class="lx-num">${info ? `<span class="lx-badge">${info.count}</span>` : '<span class="lx-dash">—</span>'}</td>
      <td class="lx-when">${info && info.updatedAt ? esc(new Date(info.updatedAt).toLocaleString('cs-CZ')) : ''}</td>
      <td class="lx-actions">
        <a class="lx-btn lx-btn-sm" href="${esc(url)}">Otevřít a upravit</a>
        ${info ? `<a class="lx-btn lx-btn-sm lx-btn-ghost" href="/editor/historie?stranka=${encodeURIComponent(page)}">Historie</a>
        <button class="lx-btn lx-btn-sm lx-btn-ghost" data-reset="${esc(page)}">Vrátit vše</button>` : ''}
      </td>
    </tr>`;
  }).join('');

  const total = Object.values(edits).reduce((a, e) => a + e.count, 0);
  const warning = store.isWritable() ? '' : `
  <div class="lx-alert">
    <strong>Úpravy se teď neuloží.</strong>
    Server nemůže zapisovat do <code>${esc(store.DATA_DIR)}</code>.
    Na Railway to znamená, že službě chybí <strong>Volume</strong> připojený na <code>/data</code>.
    <span class="lx-alert-detail">${esc(store.writableError())}</span>
  </div>`;

  return shell('Editor textů', `
<div class="lx-wrap">
  <header class="lx-head">
    <div>
      <h1>Editor textů</h1>
      <p class="lx-muted">Otevřete stránku a přepisujte texty přímo v ní. Web se dá normálně proklikávat.</p>
    </div>
    <div class="lx-head-actions">
      <a class="lx-btn lx-btn-ghost" href="/editor/historie">Historie úprav</a>
      <form method="post" action="/editor/odhlasit"><button class="lx-btn lx-btn-ghost">Odhlásit se</button></form>
    </div>
  </header>
  ${warning}
  <p class="lx-summary">Upravených textů celkem: <strong>${total}</strong></p>
  <table class="lx-table">
    <thead><tr><th>Stránka</th><th>Úprav</th><th>Naposledy</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
<script>
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-reset]');
  if (!btn) return;
  const page = btn.getAttribute('data-reset');
  if (!confirm('Opravdu vrátit všechny texty na stránce ' + page + ' do původní podoby?')) return;
  const res = await fetch('/editor/api/reset', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page })
  });
  if (res.ok) location.reload(); else alert('Nepodařilo se vrátit texty.');
});
</script>`);
}

const KIND_LABEL = { edit: 'Úprava textů', reset: 'Vrácení celé stránky', restore: 'Návrat ke starší verzi' };

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const shorten = (html, max = 160) => {
  const text = String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
};

function historyPage(page) {
  const entries = history.list({ page, limit: 150 });
  const rows = entries.map((e) => `<tr>
      <td class="lx-when">${esc(formatTime(e.at))}</td>
      <td>${esc(KIND_LABEL[e.kind] || e.kind)}${e.author ? ` <span class="lx-muted">· ${esc(e.author)}</span>` : ''}</td>
      <td><a href="/${esc(e.page)}" class="lx-page">${esc(e.page)}</a></td>
      <td class="lx-num">${e.count ? `<span class="lx-badge">${e.count}</span>` : '<span class="lx-dash">—</span>'}</td>
      <td class="lx-actions">
        <a class="lx-btn lx-btn-sm lx-btn-ghost" href="/editor/historie/${e.id}">Co se změnilo</a>
        <button class="lx-btn lx-btn-sm" data-restore="${e.id}">Vrátit zpět</button>
      </td>
    </tr>`).join('');

  return shell('Historie úprav', `
<div class="lx-wrap">
  <header class="lx-head">
    <div>
      <h1>Historie úprav</h1>
      <p class="lx-muted">${page ? `Jen stránka <strong>${esc(page)}</strong>.` : 'Každé uložení textů je tu zapsané.'}
      Tlačítko <strong>Vrátit zpět</strong> vrátí celý web do podoby těsně před danou úpravou.</p>
    </div>
    <a class="lx-btn lx-btn-ghost" href="/editor/stranky">Zpět na stránky</a>
  </header>
  ${entries.length ? `<table class="lx-table">
    <thead><tr><th>Kdy</th><th>Co</th><th>Stránka</th><th>Textů</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>` : '<p class="lx-empty">Zatím tu nic není — historie se začne plnit prvním uložením textu.</p>'}
</div>
${restoreScript()}`);
}

function historyDetailPage(entry) {
  const { meta, changes } = entry;
  const items = changes.map((c) => `<div class="lx-change">
      <div class="lx-change-label">${esc(c.label || 'Text')}</div>
      <div class="lx-diff">
        <div class="lx-diff-col lx-diff-before"><span class="lx-diff-tag">Před</span>${esc(shorten(c.before, 600))}</div>
        <div class="lx-diff-col lx-diff-after"><span class="lx-diff-tag">Po</span>${esc(shorten(c.after, 600))}</div>
      </div>
    </div>`).join('');

  return shell('Co se změnilo', `
<div class="lx-wrap">
  <header class="lx-head">
    <div>
      <h1>${esc(KIND_LABEL[meta.kind] || meta.kind)}</h1>
      <p class="lx-muted">${esc(formatTime(meta.at))}${meta.author ? ` · ${esc(meta.author)}` : ''} ·
      stránka <a href="/${esc(meta.page)}">${esc(meta.page)}</a></p>
    </div>
    <a class="lx-btn lx-btn-ghost" href="/editor/historie">Zpět na historii</a>
  </header>
  <p class="lx-summary">Změněných textů: <strong>${changes.length}</strong></p>
  ${items || '<p class="lx-empty">Žádné podrobnosti.</p>'}
  <p style="margin-top:26px">
    <button class="lx-btn" data-restore="${meta.id}">Vrátit web do stavu před touto úpravou</button>
  </p>
</div>
${restoreScript()}`);
}

const restoreScript = () => `<script>
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-restore]');
  if (!btn) return;
  if (!confirm('Opravdu vrátit texty na celém webu do podoby těsně před touto úpravou?')) return;
  btn.disabled = true;
  const res = await fetch('/editor/api/restore', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(btn.getAttribute('data-restore')) })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.ok) location.href = '/editor/historie';
  else { btn.disabled = false; alert('Vrácení se nepovedlo: ' + (data.error || 'neznámá chyba')); }
});
</script>`;

// -------------------------------------------------------- editor: routy

const editor = express.Router();
editor.use(express.json({ limit: '2mb' }));
editor.use(express.urlencoded({ extended: false, limit: '256kb' }));

editor.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!auth.isEnabled()) {
    return res.status(503).type('text/plain; charset=utf-8')
      .send('Editor není zapnutý. Chybí proměnná prostředí LEXIA_EDITOR_PASSWORD.');
  }
  next();
});

editor.use('/assets', express.static(path.join(ROOT, 'cms', 'assets'), {
  maxAge: '5m',
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
}));

editor.get('/prihlaseni', (req, res) => {
  if (auth.isAuthed(req)) return res.redirect('/?edit=1');
  res.type('html').send(loginPage(null, req.query.next));
});

editor.post('/prihlaseni', (req, res) => {
  const ip = req.ip || 'neznámá';
  const next = typeof req.body.next === 'string' && req.body.next.startsWith('/') ? req.body.next : '/?edit=1';
  if (auth.tooManyAttempts(ip)) {
    return res.status(429).type('html')
      .send(loginPage('Příliš mnoho pokusů. Zkuste to prosím za 15 minut.', next));
  }
  if (!auth.checkPassword(req.body.heslo)) {
    auth.noteFailure(ip);
    return res.status(401).type('html').send(loginPage('Nesprávné heslo.', next));
  }
  auth.clearAttempts(ip);
  auth.setCookie(req, res);
  res.redirect(next);
});

/**
 * Přihlášení z rozdělané stránky (JSON). Editor ho volá, když při ukládání
 * zjistí, že relace vypršela — uživatel tak nepřijde o neuložené texty.
 */
editor.post('/api/prihlaseni', (req, res) => {
  const ip = req.ip || 'neznámá';
  if (auth.tooManyAttempts(ip)) {
    return res.status(429).json({ ok: false, error: 'Příliš mnoho pokusů. Zkuste to prosím za 15 minut.' });
  }
  if (!auth.checkPassword((req.body || {}).heslo)) {
    auth.noteFailure(ip);
    return res.status(401).json({ ok: false, error: 'Nesprávné heslo.' });
  }
  auth.clearAttempts(ip);
  auth.setCookie(req, res);
  res.json({ ok: true });
});

editor.post('/odhlasit', (req, res) => {
  auth.clearCookie(res);
  res.redirect('/editor/prihlaseni');
});

const requireAuth = (req, res, next) => {
  if (auth.isAuthed(req)) {
    auth.refreshCookie(req, res); // práce v editoru přihlášení sama prodlužuje
    return next();
  }
  if (req.method === 'POST') {
    return res.status(401).json({ ok: false, error: 'Přihlášení vypršelo.', login: true });
  }
  res.redirect('/editor/prihlaseni?next=' + encodeURIComponent(req.originalUrl));
};

editor.get('/', requireAuth, (req, res) => res.redirect('/?edit=1'));

editor.get('/stranky', requireAuth, (req, res) => res.type('html').send(overviewPage()));

editor.get('/historie', requireAuth, (req, res) =>
  res.type('html').send(historyPage(typeof req.query.stranka === 'string' ? req.query.stranka : '')));

editor.get('/historie/:id', requireAuth, (req, res) => {
  const entry = history.detail(req.params.id);
  if (!entry) return res.status(404).type('html').send(shell('Nenalezeno', '<div class="lx-wrap"><h1>Záznam nenalezen</h1><p><a href="/editor/historie">Zpět na historii</a></p></div>'));
  res.type('html').send(historyDetailPage(entry));
});

editor.post('/api/restore', requireAuth, async (req, res) => {
  const id = Number((req.body || {}).id);
  const entry = history.detail(id);
  if (!entry) return res.status(404).json({ ok: false, error: 'Záznam nenalezen.' });
  try {
    const before = store.snapshot();
    await store.replaceAll(entry.before);
    await history.record({
      kind: 'restore',
      page: entry.meta.page,
      author: auth.authorOf(req),
      changes: [{ key: '', label: `Návrat do stavu před úpravou z ${formatTime(entry.meta.at)}`, before: '', after: '' }],
    }, before);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

editor.get('/api/stav', (req, res) => res.json({
  authed: auth.isAuthed(req),
  ulozisteFunguje: store.isWritable(),
  uloziste: store.DATA_DIR,
  chyba: store.isWritable() ? '' : store.writableError(),
  pages: auth.isAuthed(req) ? store.summary() : [],
}));

editor.post('/api/save', requireAuth, async (req, res) => {
  const { page, changes } = req.body || {};
  if (typeof page !== 'string' || !changes || typeof changes !== 'object') {
    return res.status(400).json({ ok: false, error: 'Chybná data.' });
  }
  const rel = safeRelative(page);
  if (!rel || !rel.endsWith('.html') || isDenied(rel) || !fileExists(rel)) {
    return res.status(400).json({ ok: false, error: 'Neznámá stránka.' });
  }

  // klíče ověříme proti skutečné stránce, ať se neuloží nesmysl
  const known = new Map(readPage(rel).items.map((i) => [i.key, i]));
  const current = store.getPage(rel);
  const prepared = {};
  const logged = [];
  let unknown = 0;
  for (const [key, value] of Object.entries(changes)) {
    const item = known.get(key);
    if (!item) {
      unknown++;
      continue;
    }
    const before = (current[key] && current[key].html) || item.html;
    if (value === null) {
      prepared[key] = null;
      logged.push({ key, label: item.label, before, after: item.html });
      continue;
    }
    const clean = sanitize(typeof value === 'string' ? value : value && value.html);
    prepared[key] = clean === item.html ? null : { html: clean, orig: item.html };
    if (clean !== before) logged.push({ key, label: item.label, before, after: clean });
  }

  try {
    const before = store.snapshot();
    const touched = await store.applyChanges(rel, prepared);
    if (logged.length) {
      await history.record(
        { kind: 'edit', page: rel, author: auth.authorOf(req), changes: logged },
        before,
      );
    }
    // původní znění ze zdroje — editor podle něj umí nabídnout návrat zpět
    const orig = {};
    for (const key of Object.keys(prepared)) {
      const item = known.get(key);
      if (item) orig[key] = prepared[key] === null ? null : item.html;
    }
    res.json({ ok: true, saved: touched, unknown, orig });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Uložení selhalo: ' + err.message });
  }
});

editor.post('/api/reset', requireAuth, async (req, res) => {
  const rel = safeRelative((req.body || {}).page || '');
  if (!rel) return res.status(400).json({ ok: false, error: 'Neznámá stránka.' });
  try {
    const bucket = store.getPage(rel);
    const labels = new Map(fileExists(rel) ? readPage(rel).items.map((i) => [i.key, i]) : []);
    const logged = Object.entries(bucket).map(([key, entry]) => ({
      key,
      label: (labels.get(key) && labels.get(key).label) || '',
      before: entry.html,
      after: entry.orig || '',
    }));
    const before = store.snapshot();
    const removed = await store.resetPage(rel);
    if (removed) {
      await history.record(
        { kind: 'reset', page: rel, author: auth.authorOf(req), changes: logged },
        before,
      );
    }
    res.json({ ok: true, removed });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Formuláře z webu → drAIve.
 *
 * Tom 4. 9. 2026: pět formulářů na ostrém webu mělo `data-demo`, takže se jen
 * schovaly a poděkovaly. Nic nikam nešlo, včetně oznamovacího kanálu podle
 * zákona 171/2023 Sb.
 *
 * Proč přes vlastní server a ne rovnou z prohlížeče: drAIve pouští přes CORS
 * jen *.lexia.cz. Přímé volání by tedy fungovalo na ostrém webu a mlčky padalo
 * na railwayovém náhledu i na localhostu, tedy přesně tam, kde se to před
 * nasazením zkouší. Tělo se přeposílá beze změny včetně hranice multipartu,
 * takže přílohy projdou.
 */
/**
 * Kam se formuláře posílají.
 *
 * NE na `api.draive.cz`. Ten host míří na SDÍLENÝ `draive-backend`, kdežto
 * LEXIA má vlastní deployment `draive-backend-lexia` za `portal.lexia.cz/api`.
 * Sdílený backend běží na jiné verzi obrazu, takže endpoint pro formuláře na
 * něm nemusí existovat — a `api.draive.cz` na něj 4. 9. 2026 opravdu vracelo
 * 404, zatímco přes portal.lexia.cz odpovídal. Adresa `.cz` vypadá jako ta
 * správná veřejná, ale patří někomu jinému.
 */
const DRAIVE_FORM_URL =
  process.env.LEXIA_FORMULAR_URL || 'https://portal.lexia.cz/api/public/lexia/web-form';
const DRAIVE_PRIPAD_URL =
  process.env.LEXIA_ZADOST_URL || 'https://portal.lexia.cz/api/public/lexia/legal-aid-request';

function preposliDoDraive(cilovaAdresa) {
  return (req, res) => {
  const cil = new URL(cilovaAdresa);
  const client = cil.protocol === 'http:' ? require('http') : require('https');
  const proxy = client.request(
    {
      hostname: cil.hostname,
      port: cil.port || (cil.protocol === 'http:' ? 80 : 443),
      path: cil.pathname + cil.search,
      method: 'POST',
      headers: {
        // Content-Type nese hranici multipartu — musí projít nedotčený.
        'content-type': req.headers['content-type'] || 'application/octet-stream',
        'content-length': req.headers['content-length'],
        'x-tenant-slug': 'lexia',
      },
      timeout: 30_000,
    },
    (r) => {
      res.status(r.statusCode || 502);
      r.pipe(res);
    },
  );
  proxy.on('timeout', () => {
    proxy.destroy();
    if (!res.headersSent) res.status(504).json({ error: 'Server pro příjem formulářů neodpovídá.' });
  });
  proxy.on('error', (e) => {
    console.error('[lexia] přeposlání formuláře selhalo:', e.message);
    if (!res.headersSent) res.status(502).json({ error: 'Odeslání se nezdařilo.' });
  });
  req.pipe(proxy);
  };
}

app.post('/api/formular', preposliDoDraive(DRAIVE_FORM_URL));
// Hlášení pojistné události — zakládá v drAIve případ, proto jiný endpoint.
app.post('/api/zadost-o-pravni-pomoc', preposliDoDraive(DRAIVE_PRIPAD_URL));

app.use('/editor', editor);

// ------------------------------------------------------- veřejné stránky

/**
 * Skryté na ostrém webu, dostupné na Railway. Musí běžet PŘED servírováním
 * stránek i statiky, jinak by ji `express.static` vydal dřív, než se sem
 * dostaneme. `trust proxy` je zapnuté, takže `req.hostname` nese doménu
 * návštěvníka, ne interní adresu.
 */
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (OSTRE_HOSTY.has(host) && JEN_MIMO_OSTRY_WEB.some((re) => re.test(req.path))) {
    const notFound = path.join(ROOT, '404.html');
    res.status(404).setHeader('Cache-Control', 'no-cache');
    if (fs.existsSync(notFound)) return res.type('html').send(fs.readFileSync(notFound, 'utf8'));
    return res.type('text/plain; charset=utf-8').send('Stránka nenalezena.');
  }
  next();
});


app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const redirect = REDIRECTS[req.path];
  if (redirect) return res.redirect(301, redirect);

  const rel = safeRelative(req.path);
  if (rel === null) return res.status(400).type('text/plain; charset=utf-8').send('Chybná adresa.');
  if (rel && isDenied(rel)) return next();

  const page = resolveHtml(req.path);
  if (!page) return next();

  let entry;
  try {
    entry = readPage(page);
  } catch {
    return next();
  }

  const editMode = auth.isEnabled() && auth.isAuthed(req);
  const overrides = store.getPage(page);
  const hasWork = editMode || Object.keys(overrides).length > 0;
  const html = hasWork
    ? render(entry.source, {
      overrides, editMode, page, items: entry.items, storageError: editMode && !store.isWritable(),
    }).html
    : entry.source;

  const ostryHost = OSTRE_HOSTY.has(String(req.hostname || '').toLowerCase());
  const merit = ostryHost && !editMode;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  if (editMode) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    auth.refreshCookie(req, res);
  }
  res.send(merit ? vlozMereni(html) : html);
});

app.use((req, res, next) => {
  const rel = safeRelative(req.path);
  if (rel && isDenied(rel)) return res.status(404).type('text/plain; charset=utf-8').send('Nenalezeno.');
  next();
});

/**
 * Vzhled a chování webu (.css, .js) se mění při každé opravě, a většina
 * stránek je načítá bez čísla verze v adrese. Kdyby je prohlížeč držel
 * v paměti hodinu jako obrázky, návštěvník by po nasazení viděl starou
 * verzi a oprava by "nefungovala". Necháváme je proto pokaždé ověřit
 * u serveru — když se soubor nezměnil, odpoví krátkým 304 a nic se
 * nepřenáší. Obrázky a dokumenty se nemění, ty držíme hodinu dál.
 */
const REVALIDATE = /\.(css|js|mjs)$/i;

app.use(express.static(ROOT, {
  index: false,
  dotfiles: 'ignore',
  redirect: false,
  setHeaders: (res, filePath) => res.setHeader(
    'Cache-Control',
    REVALIDATE.test(filePath) ? 'no-cache' : 'public, max-age=3600',
  ),
}));

app.use((req, res) => {
  const notFound = path.join(ROOT, '404.html');
  if (fs.existsSync(notFound)) {
    res.status(404).setHeader('Cache-Control', 'no-cache');
    return res.type('html').send(fs.readFileSync(notFound, 'utf8'));
  }
  res.status(404).type('text/plain; charset=utf-8').send('Stránka nenalezena.');
});

// ------------------------------------------------------------------ start

store.load();
history.load();
const server = app.listen(PORT, () => {
  console.log(`[lexia] web běží na http://localhost:${PORT}`);
  console.log(auth.isEnabled()
    ? `[lexia] editor textů: http://localhost:${PORT}/editor (data v ${store.FILE})`
    : '[lexia] editor textů je VYPNUTÝ — nastavte LEXIA_EDITOR_PASSWORD');
  // jen jednou — dvě souběžné kontroly si dřív mazaly zkušební soubor
  // navzájem a hlásily, že do úložiště nejde zapisovat
  store.checkWritable().then((state) => {
    console.log(state.ok
      ? '[lexia] úložiště textů je zapisovatelné'
      : '[lexia] úložiště textů NENÍ zapisovatelné — editor neuloží nic');
  });
});

/**
 * Ukončení na povel.
 *
 * Railway při každém novém nasazení pošle běžícímu kontejneru SIGTERM. Když ho
 * nikdo neodchytí, Node na ten signál zemře a npm to zapíše jako chybu
 * ("npm error signal SIGTERM"), takže staré nasazení v Railway vypadá, jako by
 * spadlo — i když jen řádně skončilo, protože ho nahradilo novější.
 *
 * Tady se přestanou přijímat nová spojení, rozpracované odpovědi doběhnou
 * a proces skončí návratovým kódem 0. Pojistka po deseti vteřinách je pro
 * případ, že by některé spojení odmítlo skončit — Railway čeká omezenou dobu
 * a pak posílá SIGKILL, tak ať odejdeme po svých dřív.
 */
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`[lexia] ${signal} — ukončuji, čekám na doběhnutí požadavků`);
    server.close(() => {
      console.log('[lexia] hotovo, končím');
      process.exit(0);
    });
    setTimeout(() => {
      console.log('[lexia] spojení nedoběhla do 10 s, končím i tak');
      process.exit(0);
    }, 10_000).unref();
  });
}
