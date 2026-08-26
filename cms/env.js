'use strict';
/**
 * Načte proměnné ze souboru .env (jen pro místní spouštění).
 * Na Railway se proměnné nastavují v administraci a .env tam není.
 */

const fs = require('fs');
const path = require('path');

function loadEnv(file = path.join(__dirname, '..', '.env')) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return false;
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match || line.trim().startsWith('#')) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
  return true;
}

/**
 * Kam ukládat texty a historii.
 * Railway nastaví RAILWAY_VOLUME_MOUNT_PATH sám při připojení Volume,
 * takže stačí Volume připojit a nic dalšího vyplňovat netřeba.
 */
const dataDir = () =>
  process.env.DATA_DIR
  || process.env.RAILWAY_VOLUME_MOUNT_PATH
  || path.join(__dirname, '..', 'data');

module.exports = { loadEnv, dataDir };
