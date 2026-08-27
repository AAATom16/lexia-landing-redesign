'use strict';
/**
 * Nalezení editovatelných textů v HTML stránce.
 *
 * Princip: stránku rozparsujeme jen kvůli tomu, abychom zjistili PŘESNÉ pozice
 * (byte ranges) textového obsahu jednotlivých prvků. Výsledné HTML pak skládáme
 * řezáním původního řetězce — mimo editované texty zůstane soubor bajt po bajtu
 * stejný, žádné přeformátování.
 */

const { parse } = require('node-html-parser');
const crypto = require('crypto');

/** Bloky, které samy o sobě drží text a jdou editovat jako celek. */
const BLOCK_EDITABLE = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'li', 'blockquote', 'figcaption', 'summary',
  'dt', 'dd', 'td', 'th', 'caption', 'legend', 'label',
]);

/** Řádkové prvky — editovatelné jen když stojí samostatně mimo blok výše. */
const INLINE_EDITABLE = new Set(['a', 'button', 'span', 'strong', 'em', 'small', 'b', 'i']);

/**
 * <div> je skoro vždycky jen obal, ne text. Pouštíme k úpravám proto jen ten,
 * který nemá uvnitř žádný další prvek — čistý text (odpověď v často kladených
 * otázkách, popisek nad nabídkou). Kdybychom pustili i obaly, dala by se
 * jedním přepsáním smazat celá skupina tlačítek.
 */
const isTextOnlyDiv = (el, tag) => tag === 'div' && el.querySelectorAll('*').length === 0;

/** Prvky, které uvnitř editovatelného textu smí zůstat (nevadí, jsou řádkové). */
const INLINE_OK = new Set([
  'a', 'b', 'strong', 'i', 'em', 'u', 'br', 'span', 'small',
  'sup', 'sub', 'mark', 'code', 'abbr', 'wbr', 'time', 'nobr',
]);

/** Do těchto prvků vůbec nelezeme. */
const SKIP_TAGS = new Set([
  'script', 'style', 'template', 'svg', 'head', 'noscript', 'iframe',
  'select', 'option', 'textarea', 'input', 'canvas', 'video', 'audio',
  'picture', 'source', 'map', 'object', 'math',
]);

const MAX_LEN = 6000;

/**
 * Místa, která přepisuje skript za běhu — dopočítané ceny, jména, data
 * a přepínače rozbalovacích detailů (jejich popisek se sám mění na
 * "Zobrazit detail" / "Skrýt detail"). Editovat je nemá smysl a klik na ně
 * musí zůstat klikem, aby šel detail v editoru otevřít.
 */
const DYNAMIC_SELECTOR =
  '[data-echo],[data-d],[data-j],[data-detail-toggle],[aria-controls],[id^="sum-"]';

const isDynamic = (el) =>
  el.hasAttribute('data-echo') || el.hasAttribute('data-d') || el.hasAttribute('data-j') ||
  el.hasAttribute('data-detail-toggle') || el.hasAttribute('aria-controls') ||
  (el.id && el.id.startsWith('sum-'));

const normalize = (s) => s.replace(/\s+/g, ' ').trim();

function hashKey(tag, innerHtml) {
  return crypto
    .createHash('sha1')
    .update(tag + '|' + normalize(innerHtml))
    .digest('hex')
    .slice(0, 10);
}

/** Obsahuje prvek jen řádkové potomky? (jinak je to kontejner, ne text) */
function hasOnlyInlineChildren(el) {
  for (const child of el.querySelectorAll('*')) {
    if (!INLINE_OK.has((child.rawTagName || '').toLowerCase())) return false;
  }
  return true;
}

/** Brzdí prvek jen vykreslená ikona (<svg> přímo v textu), nebo i něco jiného? */
function blockedOnlyByIcon(el) {
  const inIcon = new Set();
  for (const svg of el.querySelectorAll('svg')) {
    inIcon.add(svg);
    for (const node of svg.querySelectorAll('*')) inIcon.add(node);
  }
  if (!inIcon.size) return false;
  for (const child of el.querySelectorAll('*')) {
    if (inIcon.has(child)) continue;
    if (!INLINE_OK.has((child.rawTagName || '').toLowerCase())) return false;
  }
  return true;
}

/** Je uvnitř menší kus textu, který jde upravit samostatně? */
function hasEditableDescendant(el) {
  for (const child of el.querySelectorAll('*')) {
    const tag = (child.rawTagName || '').toLowerCase();
    if (!tag || SKIP_TAGS.has(tag)) continue;
    if (!BLOCK_EDITABLE.has(tag) && !INLINE_EDITABLE.has(tag) && !isTextOnlyDiv(child, tag)) continue;
    if (child.hasAttribute('data-no-edit')) continue;
    if (isDynamic(child) || child.querySelector(DYNAMIC_SELECTOR)) continue;
    if (!child.childNodes.length || !normalize(child.text)) continue;
    const inner = child.innerHTML;
    if (!inner || inner.length > MAX_LEN) continue;
    if (hasOnlyInlineChildren(child)) return true;
  }
  return false;
}

/** Obsluha kliku (onclick apod.) uložení nikdy nepřežije — čistička ji zahodí. */
function maObsluhuUdalosti(el) {
  const test = (node) => Object.keys(node.attributes || {}).some((a) => /^on/i.test(a));
  if (test(el)) return true;
  return el.querySelectorAll('*').some(test);
}

function isEditable(el, tag) {
  if (el.hasAttribute('data-no-edit')) return false;
  // text s obsluhou kliku nenabízíme — uložení by ji sebralo a tlačítko
  // by přestalo fungovat
  if (maObsluhuUdalosti(el)) return false;
  if (isDynamic(el) || el.querySelector(DYNAMIC_SELECTOR)) return false;
  if (!BLOCK_EDITABLE.has(tag) && !INLINE_EDITABLE.has(tag) && !isTextOnlyDiv(el, tag)) return false;
  const childNodes = el.childNodes;
  if (!childNodes.length) return false;
  const inner = el.innerHTML;
  if (!inner || inner.length > MAX_LEN) return false;
  if (!normalize(el.text)) return false;
  if (hasOnlyInlineChildren(el)) return true;
  // Vykreslená ikona (<svg>) přímo v textu editaci nebrání — jinak by nešly
  // upravit odrážky a tlačítka, která ikonu mají v sobě. Ale jen tehdy, když
  // uvnitř není menší text k úpravě; jinak by se z odkazu stal jeden velký
  // blok i s ikonou a šipkou.
  return blockedOnlyByIcon(el) && !hasEditableDescendant(el);
}

/** Popisek pro přehled v administraci. */
function labelOf(el) {
  const txt = normalize(el.text);
  return txt.length > 90 ? txt.slice(0, 89) + '…' : txt;
}

/**
 * Projde stránku a vrátí seznam editovatelných míst.
 * @returns {Array<{key,tag,label,section,heading,innerStart,innerEnd,tagNameEnd,html}>}
 */
function extract(html) {
  const root = parse(html, { comment: true });
  const found = [];
  const seen = new Map(); // hash -> počet výskytů
  let section = '';
  let heading = '';

  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeType !== 1) continue; // jen prvky
      const tag = (child.rawTagName || '').toLowerCase();
      if (!tag || SKIP_TAGS.has(tag)) continue;
      if (child.id === '__bundler_thumbnail') continue;
      if (child.hasAttribute && child.hasAttribute('data-no-edit')) continue;

      // kontext pro přehled: nejbližší sekce s id, případně poslední nadpis
      const prevSection = section;
      if (child.id && (tag === 'section' || tag === 'main' || tag === 'article')) {
        section = child.id;
      }

      // Do míst, která přepisuje skript za běhu, vůbec nelezeme — ani k jejich
      // vnitřkům. Jinak by editor nabídl text, který se po načtení stránky
      // stejně přepíše, a úprava klienta by beze stopy zmizela.
      if (isDynamic(child)) { section = prevSection; continue; }

      if (isEditable(child, tag)) {
        const inner = child.innerHTML;
        const base = hashKey(tag, inner);
        const n = seen.get(base) || 0;
        seen.set(base, n + 1);
        const cn = child.childNodes;
        found.push({
          key: `${base}-${n}`,
          tag,
          label: labelOf(child),
          section: section || '',
          heading,
          innerStart: cn[0].range[0],
          innerEnd: cn[cn.length - 1].range[1],
          tagNameEnd: child.range[0] + 1 + tag.length,
          html: inner,
        });
        if (/^h[1-6]$/.test(tag)) heading = labelOf(child);
      } else {
        walk(child);
      }
      section = prevSection;
    }
  };

  walk(root);
  return found;
}

module.exports = { extract, normalize };
