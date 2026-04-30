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

export function login(email: string, role: AuthRole = 'customer', extra?: Partial<AuthUser>): AuthUser {
  const user: AuthUser = {
    email,
    name: extra?.name ?? deriveName(email),
    role,
    distributorType: extra?.distributorType,
    ico: extra?.ico,
  };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('lexia-auth-change'));
  return user;
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('lexia-auth-change'));
}

export function hasRole(roles: AuthRole | AuthRole[]): boolean {
  const u = getUser();
  if (!u) return false;
  const list = Array.isArray(roles) ? roles : [roles];
  return list.includes(u.role);
}
