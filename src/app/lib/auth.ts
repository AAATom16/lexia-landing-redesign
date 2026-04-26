const KEY = 'lexia_auth';

export type AuthUser = { email: string; name: string };

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function login(email: string): AuthUser {
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Klient';
  const user = { email, name };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('lexia-auth-change'));
  return user;
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('lexia-auth-change'));
}
