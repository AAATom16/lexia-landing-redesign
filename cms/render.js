'use strict';
/**
 * Poskládá výslednou stránku: původní HTML + uložené úpravy textů
 * (+ výbava editoru, když je uživatel přihlášený).
 */

const { extract } = require('./extract');

const ASSET_VERSION = '16';

const escAttr = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const editorStyles = () =>
  `\n<link rel="stylesheet" href="/editor/assets/cms-editor.css?v=${ASSET_VERSION}">\n`;

function editorScripts(page, stats) {
  const data = JSON.stringify({ page, ...stats }).replace(/</g, '\\u003c');
  return `
<script>window.__LEXIA_CMS__ = ${data};</script>
<script src="/editor/assets/cms-editor.js?v=${ASSET_VERSION}" defer></script>
`;
}

/**
 * @param {string} html   původní obsah .html souboru
 * @param {object} opts   { overrides, editMode, page, items }
 * @returns {{ html: string, items: Array, applied: number }}
 */
function render(html, {
  overrides = {}, editMode = false, page = '', items = null, storageError = false,
} = {}) {
  if (!items) {
    try {
      items = extract(html);
    } catch (err) {
      console.error('[cms] stránku nelze rozparsovat:', page, err.message);
      return { html, items: [], applied: 0 };
    }
  }

  const patches = [];
  let applied = 0;
  let stale = 0;

  const seenKeys = new Set();
  for (const item of items) {
    seenKeys.add(item.key);
    const override = overrides[item.key];
    const isOverridden = override && typeof override.html === 'string' && override.html !== item.html;
    if (isOverridden) {
      patches.push({ start: item.innerStart, end: item.innerEnd, text: override.html });
      applied++;
    }
    if (editMode) {
      // u upravených míst si neseme i původní znění, ať jde vrátit zpět
      const orig = isOverridden ? ` data-cms-orig="${escAttr(item.html)}"` : '';
      patches.push({ start: item.tagNameEnd, end: item.tagNameEnd, text: ` data-cms-key="${item.key}"${orig}` });
    }
  }
  for (const key of Object.keys(overrides)) if (!seenKeys.has(key)) stale++;

  // od konce dopředu, ať se nerozhodí pozice
  patches.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = html;
  for (const p of patches) out = out.slice(0, p.start) + p.text + out.slice(p.end);

  if (editMode) {
    // styl do <head> (v <body> by ho mohl spolknout rozbitý tag),
    // skripty na konec <body>
    const head = out.toLowerCase().indexOf('</head>');
    if (head !== -1) out = out.slice(0, head) + editorStyles() + out.slice(head);

    const scripts = editorScripts(page, { editable: items.length, applied, stale, storageError });
    const body = out.toLowerCase().lastIndexOf('</body>');
    out = body === -1 ? out + scripts : out.slice(0, body) + scripts + out.slice(body);
  }

  return { html: out, items, applied, stale };
}

module.exports = { render };
