import type { CalculatorInput, CalculationResult, CommissionModel } from '../domain/types';

const TOKEN_KEY = 'lexia_token';

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'DISTRIBUTOR' | 'ADMIN';
  distributorType?: string | null;
  ico?: string | null;
};

export type ApiDraft = {
  id: string;
  number: string | null;
  createdById: string;
  source: 'PUBLIC' | 'DISTRIBUTOR' | 'CRM';
  status: 'DRAFT' | 'SENT_TO_CLIENT' | 'SIGNED' | 'CANCELLED';
  productCode: string;
  pillars: string[];
  segment: string | null;
  territorialScope: string;
  clientName: string | null;
  clientEmail: string | null;
  clientIco: string | null;
  commissionModel: number | null;
  premiumMonthly: number;
  premiumYearly: number;
  inputJson: CalculatorInput;
  resultJson: CalculationResult;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiDraftInput = {
  productCode: string;
  pillars: string[];
  segment?: string;
  territorialScope?: 'CZ' | 'EUROPE';
  clientName?: string;
  clientEmail?: string;
  clientIco?: string;
  commissionModel?: CommissionModel;
  premiumMonthly: number;
  premiumYearly: number;
  inputJson: CalculatorInput;
  resultJson: CalculationResult;
  source: 'PUBLIC' | 'DISTRIBUTOR' | 'CRM';
  status?: 'DRAFT' | 'SENT_TO_CLIENT' | 'SIGNED' | 'CANCELLED';
  notes?: string;
};

const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export function isApiEnabled(): boolean {
  return baseUrl.length > 0;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!baseUrl) throw new Error('VITE_API_URL is not configured');
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error ?? 'request_failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(`API ${status}: ${code}`);
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<ApiUser>('/auth/me'),
  drafts: {
    list: () => request<ApiDraft[]>('/drafts'),
    get: (id: string) => request<ApiDraft>(`/drafts/${id}`),
    create: (body: ApiDraftInput) =>
      request<ApiDraft>('/drafts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<ApiDraftInput>) =>
      request<ApiDraft>(`/drafts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) =>
      request<{ ok: true }>(`/drafts/${id}`, { method: 'DELETE' }),
  },
};
