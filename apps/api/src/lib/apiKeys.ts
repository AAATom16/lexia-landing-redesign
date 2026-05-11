import crypto from 'node:crypto';

export type ParsedApiKey = {
  environment: 'live' | 'test';
  prefix: string; // e.g. "lxa_live_3f2c8a91"
  full: string;
};

const KEY_PATTERN = /^lxa_(live|test)_([a-f0-9]{8})_([A-Za-z0-9_-]{16,64})$/;

export function parseApiKey(raw: string): ParsedApiKey | null {
  const m = raw.match(KEY_PATTERN);
  if (!m) return null;
  return {
    environment: m[1] as 'live' | 'test',
    prefix: `lxa_${m[1]}_${m[2]}`,
    full: raw,
  };
}

export function hashApiKey(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  if (aHex.length !== bHex.length) return false;
  return crypto.timingSafeEqual(Buffer.from(aHex, 'hex'), Buffer.from(bHex, 'hex'));
}

export function generateApiKey(environment: 'live' | 'test' = 'live'): { plain: string; prefix: string; hash: string } {
  const prefixHex = crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(24).toString('base64url');
  const plain = `lxa_${environment}_${prefixHex}_${secret}`;
  const prefix = `lxa_${environment}_${prefixHex}`;
  return { plain, prefix, hash: hashApiKey(plain) };
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
