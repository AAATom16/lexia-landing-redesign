'use strict';
/**
 * Úložiště upravených textů.
 *
 * Vše je v jednom JSON souboru. Na Railway ukazuje DATA_DIR na připojený
 * Volume, takže texty přežijí i nové nasazení webu.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'content.json');
const BACKUP = path.join(DATA_DIR, 'content.backup.json');

let db = { version: 1, pages: {} };
let writeQueue = Promise.resolve();

function load() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('[cms] nelze vytvořit složku pro data:', DATA_DIR, err.message);
  }
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.pages) db = parsed;
    console.log(`[cms] načteno ${Object.keys(db.pages).length} stránek z ${FILE}`);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[cms] content.json nelze přečíst:', err.message);
    else console.log(`[cms] zatím žádné úpravy (${FILE} neexistuje)`);
  }
}

function persist() {
  const snapshot = JSON.stringify(db, null, 2);
  writeQueue = writeQueue.then(async () => {
    const tmp = FILE + '.tmp';
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    // jednoduchá záloha předchozího stavu
    try {
      await fs.promises.copyFile(FILE, BACKUP);
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('[cms] zálohu se nepodařilo uložit:', err.message);
    }
    await fs.promises.writeFile(tmp, snapshot, 'utf8');
    await fs.promises.rename(tmp, FILE);
  }).catch((err) => {
    console.error('[cms] ULOŽENÍ SELHALO:', err.message);
    throw err;
  });
  return writeQueue;
}

const getPage = (page) => db.pages[page] || {};

/** Kopie celého stavu — podklad pro historii verzí. */
const snapshot = () => JSON.parse(JSON.stringify(db.pages));

/** Přepíše celý stav (použije se při vracení starší verze). */
async function replaceAll(pages) {
  db.pages = JSON.parse(JSON.stringify(pages || {}));
  await persist();
  return Object.keys(db.pages).length;
}

/** Zapíše změny jedné stránky. Hodnota null/'' = vrátit původní text. */
async function applyChanges(page, changes, meta = {}) {
  const bucket = db.pages[page] || (db.pages[page] = {});
  let touched = 0;
  for (const [key, entry] of Object.entries(changes)) {
    if (entry === null) {
      if (bucket[key]) {
        delete bucket[key];
        touched++;
      }
      continue;
    }
    bucket[key] = {
      html: entry.html,
      orig: entry.orig != null ? entry.orig : (bucket[key] && bucket[key].orig) || '',
      at: meta.at || new Date().toISOString(),
    };
    touched++;
  }
  if (!Object.keys(bucket).length) delete db.pages[page];
  await persist();
  return touched;
}

async function resetPage(page) {
  if (!db.pages[page]) return 0;
  const n = Object.keys(db.pages[page]).length;
  delete db.pages[page];
  await persist();
  return n;
}

const summary = () =>
  Object.entries(db.pages).map(([page, bucket]) => ({
    page,
    count: Object.keys(bucket).length,
    updatedAt: Object.values(bucket).reduce((a, e) => (e.at > a ? e.at : a), ''),
  })).sort((a, b) => a.page.localeCompare(b.page, 'cs'));

module.exports = {
  load, getPage, applyChanges, resetPage, summary, snapshot, replaceAll, FILE, DATA_DIR,
};
