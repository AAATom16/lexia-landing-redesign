'use strict';
/**
 * Přihlášení do editoru: jedno heslo z proměnné prostředí, podepsaná cookie.
 * Bez nastaveného hesla je editor úplně vypnutý (nic se nikam neinjektuje).
 */

const crypto = require('crypto');

const COOKIE = 'lexia_editor';
// Přihlášení drží 30 dní a při každé práci v editoru se samo prodlužuje
// (viz refreshCookie). Dřív platilo 12 hodin a uživatelce uprostřed práce
// vypršelo — editor pak u Uložit hlásil "Nejste přihlášeni".
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dní

// čte se až za běhu, aby nezáleželo na pořadí načtení souborů
const password = () => process.env.LEXIA_EDITOR_PASSWORD || '';

const secret = () => process.env.LEXIA_SESSION_SECRET
  || (password() ? crypto.createHash('sha256').update('lexia-cms::' + password()).digest('hex') : '');

const isEnabled = () => password().length > 0;

function checkPassword(input) {
  if (!isEnabled()) return false;
  const a = Buffer.from(String(input || ''), 'utf8');
  const b = Buffer.from(password(), 'utf8');
  // timingSafeEqual vyžaduje stejnou délku — porovnáme otisky
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

const b64 = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');

function issueToken(name) {
  const payload = b64({
    exp: Date.now() + MAX_AGE_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
    name: String(name || '').slice(0, 60),
  });
  return `${payload}.${sign(payload)}`;
}

/** @returns {object|null} obsah cookie, pokud je podpis i platnost v pořádku */
function readToken(token) {
  if (!isEnabled() || !token) return null;
  const idx = String(token).lastIndexOf('.');
  if (idx < 1) return null;
  const payload = String(token).slice(0, idx);
  const mac = String(token).slice(idx + 1);
  const expected = sign(payload);
  const a = Buffer.from(mac, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  return Number(data.exp) > Date.now() ? data : null;
}

const verifyToken = (token) => readToken(token) !== null;

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

const tokenOf = (req) => readToken(parseCookies(req.headers.cookie)[COOKIE]);
const isAuthed = (req) => tokenOf(req) !== null;

/** Jméno, které uživatel zadal při přihlášení (nepovinné). */
function authorOf(req) {
  const data = tokenOf(req);
  return (data && data.name) || '';
}

function setCookie(req, res, name) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
  res.setHeader('Set-Cookie',
    `${COOKIE}=${issueToken(name)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_MS / 1000}${secure ? '; Secure' : ''}`);
}

/**
 * Posuvné přihlášení: kdo v editoru pracuje, tomu se platnost sama obnovuje.
 * Přepisujeme až ve druhé půlce platnosti, ať se hlavička neposílá pořád.
 */
function refreshCookie(req, res) {
  const data = tokenOf(req);
  if (!data) return false;
  const remaining = Number(data.exp) - Date.now();
  if (remaining > MAX_AGE_MS / 2) return false;
  if (res.headersSent || res.getHeader('Set-Cookie')) return false;
  setCookie(req, res, data.name || '');
  return true;
}

function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

// --- brzda na hádání hesla ---
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function tooManyAttempts(ip) {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function noteFailure(ip) {
  const rec = attempts.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) attempts.set(ip, { first: Date.now(), count: 1 });
  else rec.count++;
}

const clearAttempts = (ip) => attempts.delete(ip);

module.exports = {
  COOKIE, isEnabled, checkPassword, isAuthed, authorOf, setCookie, refreshCookie, clearCookie,
  tooManyAttempts, noteFailure, clearAttempts,
};
