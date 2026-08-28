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

const REWRITES = { '/financniporadci': '/financni-poradci/index.html' };
const REDIRECTS = { '/financni-poradci': '/financniporadci', '/financni-poradci/': '/financniporadci' };

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

app.use('/editor', editor);

// ------------------------------------------------------- veřejné stránky

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

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  if (editMode) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    auth.refreshCookie(req, res);
  }
  res.send(html);
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
