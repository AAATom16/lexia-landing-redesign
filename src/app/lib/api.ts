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

export type LeadInput = {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  productCode: string;
  pillars: string[];
  segment?: string;
  premiumMonthly: number;
  premiumYearly: number;
  inputJson: CalculatorInput;
  resultJson: CalculationResult;
  notes?: string;
};

export type LegalCaseStatus = 'REGISTROVANO' | 'V_SETRENI' | 'KRYTO' | 'ZAMITNUTO' | 'UKONCENO';
export type LegalCaseModel = 'TELEFONICKA_PORADA' | 'SAMOREGULACE' | 'EXTERNI_LIKVIDACE';
export type DenialReason = 'PRED_POJISTENIM' | 'CEKACI_DOBA' | 'PROMLCENO' | 'MIMO_VECNY_ROZSAH' | 'VYLUKA' | 'NESPADA_DO_PILIRE' | 'JINE';

export type ApiLegalCase = {
  id: string;
  caseNumber: string;
  contractDraftId: string | null;
  policyholderName: string;
  policyholderEmail: string | null;
  policyholderIco: string | null;
  isVip: boolean;
  reporterName: string | null;
  reporterPhone: string | null;
  productCode: string;
  pillarCode: string;
  legalAreaCode: string | null;
  claimType: string | null;
  caseDate: string;
  reportedDate: string;
  policyStart: string | null;
  status: LegalCaseStatus;
  model: LegalCaseModel;
  isTelefonicka: boolean;
  reserveExternal: number;
  reserveInternal: number;
  paidExternal: number;
  paidInternal: number;
  description: string | null;
  denialReason: DenialReason | null;
  denialNote: string | null;
  createdById: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LegalCaseInput = {
  policyholderName: string;
  policyholderEmail?: string;
  policyholderIco?: string;
  isVip?: boolean;
  reporterName?: string;
  reporterPhone?: string;
  productCode: 'INDIVIDUAL' | 'BUSINESS' | 'DRIVERS_VEHICLES';
  pillarCode: string;
  legalAreaCode?: string;
  claimType?: string;
  caseDate: string;
  reportedDate?: string;
  policyStart?: string;
  status?: LegalCaseStatus;
  model?: LegalCaseModel;
  isTelefonicka?: boolean;
  reserveExternal?: number;
  reserveInternal?: number;
  paidExternal?: number;
  paidInternal?: number;
  description?: string;
  denialReason?: DenialReason;
  denialNote?: string;
  contractDraftId?: string;
  assigneeId?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  role?: 'CUSTOMER' | 'DISTRIBUTOR';
  distributorType?: 'SZ_PM' | 'SZ_PA' | 'DJ' | 'VZ' | 'DPZ' | 'TIPAR';
  ico?: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (body: RegisterInput) =>
    request<{ token: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => request<ApiUser>('/auth/me'),
  leads: {
    create: (body: LeadInput) =>
      request<{ ok: true; id: string }>('/leads', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
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
  customer: {
    contracts: () => request<ApiDraft[]>('/customer/contracts'),
  },
  legalCases: {
    list: () => request<ApiLegalCase[]>('/legal-cases'),
    get: (id: string) => request<ApiLegalCase>(`/legal-cases/${id}`),
    create: (body: LegalCaseInput) =>
      request<ApiLegalCase>('/legal-cases', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<LegalCaseInput>) =>
      request<ApiLegalCase>(`/legal-cases/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};
