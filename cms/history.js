'use strict';
/**
 * Historie úprav textů.
 *
 * Ke každému uložení se zapíše záznam: kdo, kdy, na které stránce, co se změnilo
 * (původní i nové znění) a hlavně kompletní stav webu TĚSNĚ PŘED tou úpravou.
 * Díky tomu jde web kdykoliv vrátit do stavu před libovolnou úpravou.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const INDEX = path.join(DATA_DIR, 'history.jsonl');
const VERSIONS_DIR = path.join(DATA_DIR, 'versions');

/** Kolik verzí držíme. Starší se postupně mažou. */
const KEEP = 150;

let index = [];          // novější na začátku
let nextId = 1;
let queue = Promise.resolve();

function load() {
  try {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  } catch (err) {
    console.error('[cms] složku pro historii nelze vytvořit:', err.message);
  }
  try {
    const lines = fs.readFileSync(INDEX, 'utf8').split('\n').filter(Boolean);
    index = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean).reverse();
    nextId = index.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    console.log(`[cms] historie: ${index.length} záznamů`);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[cms] historii nelze načíst:', err.message);
  }
}

const versionFile = (id) => path.join(VERSIONS_DIR, String(id).padStart(5, '0') + '.json');

async function prune() {
  if (index.length <= KEEP) return;
  const removed = index.slice(KEEP);
  index = index.slice(0, KEEP);
  for (const entry of removed) {
    try {
      await fs.promises.unlink(versionFile(entry.id));
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('[cms] starou verzi nelze smazat:', err.message);
    }
  }
  const rewritten = index.slice().reverse().map((e) => JSON.stringify(e)).join('\n') + '\n';
  await fs.promises.writeFile(INDEX, rewritten, 'utf8');
}

/**
 * Zapíše jeden záznam do historie.
 * @param {object} entry { kind, page, author, changes:[{key,label,before,after}] }
 * @param {object} before kompletní stav webu před úpravou
 */
function record(entry, before) {
  const meta = {
    id: nextId++,
    at: new Date().toISOString(),
    kind: entry.kind || 'edit',
    page: entry.page || '',
    author: entry.author || '',
    count: (entry.changes || []).length,
    summary: (entry.changes || []).slice(0, 3).map((c) => c.label).filter(Boolean),
  };
  index.unshift(meta);

  queue = queue.then(async () => {
    await fs.promises.mkdir(VERSIONS_DIR, { recursive: true });
    await fs.promises.writeFile(
      versionFile(meta.id),
      JSON.stringify({ meta, changes: entry.changes || [], before: before || {} }, null, 2),
      'utf8',
    );
    await fs.promises.appendFile(INDEX, JSON.stringify(meta) + '\n', 'utf8');
    await prune();
  }).catch((err) => {
    console.error('[cms] historii nelze zapsat:', err.message);
  });

  return queue.then(() => meta);
}

/** Seznam záznamů, případně jen pro jednu stránku. */
function list({ page = '', limit = 100 } = {}) {
  const filtered = page ? index.filter((e) => e.page === page) : index;
  return filtered.slice(0, limit);
}

/** Detail jednoho záznamu včetně stavu před úpravou. */
function detail(id) {
  try {
    return JSON.parse(fs.readFileSync(versionFile(Number(id)), 'utf8'));
  } catch {
    return null;
  }
}

const has = (id) => index.some((e) => e.id === Number(id));

module.exports = { load, record, list, detail, has, INDEX, VERSIONS_DIR };
