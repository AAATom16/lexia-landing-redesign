import { ApiError, api, isApiEnabled, setToken } from './api';

const KEY = 'lexia_auth';

export type AuthRole = 'customer' | 'distributor' | 'admin';

export type AuthUser = {
  email: string;
  name: string;
  role: AuthRole;
  distributorType?: 'SZ_PM' | 'SZ_PA' | 'DJ' | 'VZ' | 'DPZ' | 'TIPAR';
  ico?: string;
};

function deriveName(email: string): string {
  return (
    email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Klient'
  );
}

function roleFromApi(role: 'CUSTOMER' | 'DISTRIBUTOR' | 'ADMIN'): AuthRole {
  if (role === 'ADMIN') return 'admin';
  if (role === 'DISTRIBUTOR') return 'distributor';
  return 'customer';
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.email) return null;
    return {
      email: parsed.email,
      name: parsed.name ?? deriveName(parsed.email),
      role: (parsed.role as AuthRole | undefined) ?? 'customer',
      distributorType: parsed.distributorType,
      ico: parsed.ico,
    };
  } catch {
    return null;
  }
}

function persist(user: AuthUser): AuthUser {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('lexia-auth-change'));
  return user;
}

/**
 * Mock login (no password verification). Used as fallback when no API is configured.
 * Backwards-compatible signature: `login(email)` still works.
 */
export function login(email: string, role: AuthRole = 'customer', extra?: Partial<AuthUser>): AuthUser {
  return persist({
    email,
    name: extra?.name ?? deriveName(email),
    role,
    distributorType: extra?.distributorType,
    ico: extra?.ico,
  });
}

export type LoginOptions = {
  expectedRole?: AuthRole;
  /** Distributor type / ICO to set when no API is enabled (mock fallback). */
  fallback?: Partial<AuthUser> & { role?: AuthRole };
};

export class LoginError extends Error {
  constructor(public code: 'invalid_credentials' | 'forbidden_role' | 'network') {
    super(code);
  }
}

/**
 * Auth flow that prefers the real API when `VITE_API_URL` is set, falling
 * back to mock localStorage login otherwise. Throws LoginError on failure.
 */
export async function authenticate(
  email: string,
  password: string,
  options: LoginOptions = {},
): Promise<AuthUser> {
  if (isApiEnabled()) {
    try {
      const { token, user } = await api.login(email, password);
      const mapped: AuthUser = {
        email: user.email,
        name: user.name,
        role: roleFromApi(user.role),
        distributorType: (user.distributorType ?? undefined) as AuthUser['distributorType'],
        ico: user.ico ?? undefined,
      };
      if (options.expectedRole && mapped.role !== options.expectedRole) {
        throw new LoginError('forbidden_role');
      }
      setToken(token);
      return persist(mapped);
    } catch (err) {
      if (err instanceof LoginError) throw err;
      if (err instanceof ApiError && err.status === 401) {
        throw new LoginError('invalid_credentials');
      }
      throw new LoginError('network');
    }
  }

  // Mock fallback (no API)
  return login(email, options.fallback?.role ?? options.expectedRole ?? 'customer', options.fallback);
}

export function logout() {
  localStorage.removeItem(KEY);
  setToken(null);
  window.dispatchEvent(new Event('lexia-auth-change'));
}

export function hasRole(roles: AuthRole | AuthRole[]): boolean {
  const u = getUser();
  if (!u) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  return list.includes(u.role);
}
