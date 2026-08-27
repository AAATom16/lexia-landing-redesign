'use strict';
/**
 * Očista HTML, které přišlo z editoru.
 * Editor je za heslem, takže jde o pojistku, ne o hlavní obranu — ale cizí
 * značky (script, style, on* atributy) se do stránky nedostanou ani omylem.
 */

const { parse } = require('node-html-parser');

const ALLOWED = {
  a: ['href', 'target', 'rel', 'title', 'class', 'aria-label', 'download', 'style'],
  b: ['class', 'style'],
  strong: ['class', 'style'],
  i: ['class', 'data-icon', 'aria-hidden', 'style'],
  em: ['class', 'style'],
  u: ['class', 'style'],
  br: [],
  wbr: [],
  span: ['class', 'data-icon', 'aria-hidden', 'title', 'style'],
  small: ['class', 'style'],
  sup: ['class', 'style'],
  sub: ['class', 'style'],
  mark: ['class', 'style'],
  code: ['class', 'style'],
  abbr: ['class', 'title', 'style'],
  time: ['class', 'datetime', 'style'],
};

/**
 * Barevná a typografická úprava přímo v textu (style="color: var(--primary)")
 * se na webu používá ve zvýrazněných slovech v nadpisech. Kdybychom ji při
 * uložení zahodili, klientovi by pouhé přepsání nadpisu shodilo barvu.
 * Pouštíme proto jen vzhledové vlastnosti — nic, čím jde překrýt stránku
 * nebo něco načíst (position, z-index, url(), @import, expression()).
 */
const STYLE_PROPS = new Set([
  'color', 'background', 'background-color', 'border-color', 'border-radius',
  'font-weight', 'font-style', 'font-size',
  'font-family', 'font-variant', 'text-decoration', 'text-transform',
  'letter-spacing', 'word-spacing', 'line-height', 'white-space',
  'text-align', 'vertical-align', 'width', 'height', 'opacity',
]);

const STYLE_ZAKAZ = /url\s*\(|expression\s*\(|javascript:|@import|binding|[<>"'\\]/;

function safeStyle(value) {
  const out = [];
  for (const kus of String(value).split(';')) {
    const idx = kus.indexOf(':');
    if (idx < 1) continue;
    const prop = kus.slice(0, idx).trim().toLowerCase();
    const val = kus.slice(idx + 1).trim();
    if (!STYLE_PROPS.has(prop) || !val || STYLE_ZAKAZ.test(val)) continue;
    out.push(prop + ': ' + val);
  }
  return out.length ? out.join('; ') : null;
}

const VOID = new Set(['br', 'wbr']);
/** U těchto značek zahodíme i obsah, nejen obal. */
const DROP_CONTENT = new Set(['script', 'style', 'template', 'iframe', 'object', 'noscript']);
const MAX_LEN = 6000;

/**
 * Vykreslené ikony (<svg> přímo v textu) necháváme projít, jinak by se
 * z odrážek a tlačítek s ikonou nedal text upravit vůbec. Pouštíme jen
 * kreslicí značky a kreslicí atributy — nic, čím by šlo spustit kód:
 * žádné on*, href/xlink, <script>, <style>, <foreignObject> ani animace.
 */
const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
  'defs', 'clippath', 'mask', 'lineargradient', 'radialgradient', 'stop',
  'title', 'desc', 'symbol',
]);

const SVG_ATTRS = new Set([
  'viewbox', 'width', 'height', 'fill', 'fill-rule', 'fill-opacity', 'stroke',
  'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-opacity', 'stroke-miterlimit', 'opacity',
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points',
  'transform', 'class', 'aria-hidden', 'focusable', 'role', 'offset',
  'stop-color', 'stop-opacity', 'gradientunits', 'clip-rule', 'vector-effect',
  'preserveaspectratio', 'xmlns',
]);

const escapeText = (s) =>
  s.replace(/&(?!(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeAttr = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Serializace uvnitř ikony — vlastní, přísnější seznam značek i atributů. */
function serializeSvg(node) {
  if (node.nodeType === 3) return escapeText(node.rawText || '');
  if (node.nodeType !== 1) return '';
  const tag = (node.rawTagName || '').toLowerCase();
  if (!SVG_TAGS.has(tag)) return '';           // i s obsahem — cizí značka do ikony nepatří
  const attrs = [];
  for (const [name, value] of Object.entries(node.attributes || {})) {
    if (!SVG_ATTRS.has(name.toLowerCase())) continue;
    attrs.push(` ${name}="${escapeAttr(value)}"`);
  }
  const inner = node.childNodes.map(serializeSvg).join('');
  return `<${tag}${attrs.join('')}>${inner}</${tag}>`;
}

function safeHref(value) {
  const v = String(value).trim();
  if (/^\s*(javascript|data|vbscript):/i.test(v)) return null;
  return v;
}

function serialize(node) {
  // textový uzel
  if (node.nodeType === 3) return escapeText(node.rawText || '');
  // komentář zahodíme
  if (node.nodeType === 8) return '';
  if (node.nodeType !== 1) return '';

  const tag = (node.rawTagName || '').toLowerCase();
  if (DROP_CONTENT.has(tag)) return '';
  if (tag === 'svg') return serializeSvg(node);
  const inner = node.childNodes.map(serialize).join('');

  if (!Object.prototype.hasOwnProperty.call(ALLOWED, tag)) {
    // nepovolená značka — text uvnitř zachováme, obal zahodíme
    return inner;
  }

  const attrs = [];
  for (const [name, rawValue] of Object.entries(node.attributes || {})) {
    const lower = name.toLowerCase();
    if (!ALLOWED[tag].includes(lower)) continue;
    let value = rawValue;
    if (lower === 'href') {
      value = safeHref(value);
      if (value === null) continue;
    }
    if (lower === 'style') {
      value = safeStyle(value);
      if (value === null) continue;
    }
    attrs.push(` ${lower}="${escapeAttr(value)}"`);
  }

  const open = `<${tag}${attrs.join('')}>`;
  return VOID.has(tag) ? open : `${open}${inner}</${tag}>`;
}

/** @returns {string} očištěné HTML */
function sanitize(html) {
  const input = String(html == null ? '' : html).slice(0, MAX_LEN);
  const root = parse(input, { comment: false });
  return root.childNodes.map(serialize).join('');
}

module.exports = { sanitize };
