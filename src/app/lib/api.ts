import type { CalculatorInput, CalculationResult, CommissionModel } from '@lexia/domain';

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

export type ApiPartner = {
  id: string;
  brokerCode: string;
  name: string;
  ico: string | null;
  contactEmail: string;
  contactPhone: string | null;
  commissionModel: number;
  commissionRateZiskatelska: number | null;
  commissionRateNasledna: number | null;
  commissionRatePrubezna: number | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  contractedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { salespeople: number; apiKeys: number; discountCodes: number; drafts: number };
};

export type ApiSalesperson = {
  id: string;
  partnerId: string;
  salespersonCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  cnbReg: string | null;
  cnbCategory: 'SZ_PM' | 'SZ_PA' | 'DJ' | 'VZ' | 'DPZ' | 'TIPAR' | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type ApiKey = {
  id: string;
  prefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type ApiDiscountCode = {
  id: string;
  partnerId: string;
  code: string;
  label: string;
  kind: 'PERMANENT' | 'ONE_TIME';
  percent: number;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  usedCount: number;
  status: 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
  updatedAt: string;
};

export type ApiPartnerDetail = ApiPartner & {
  salespeople: ApiSalesperson[];
  apiKeys: ApiKey[];
  discountCodes: ApiDiscountCode[];
};

export type ApiKeyCreated = ApiKey & { plainKey: string };

export type WebhookEvent = 'DRAFT_CREATED' | 'DRAFT_SENT_TO_CLIENT' | 'DRAFT_SIGNED' | 'DRAFT_CANCELLED';

export type ApiWebhook = {
  id: string;
  partnerId: string;
  url: string;
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiWebhookCreated = ApiWebhook & { secret: string };

export type ApiWebhookDelivery = {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'DEAD';
  attempts: number;
  lastResponseStatus: number | null;
  lastResponseBody: string | null;
  scheduledAt: string;
  deliveredAt: string | null;
  createdAt: string;
};

export type CommissionStatus = 'PENDING_PAYOUT' | 'INCLUDED_IN_PAYOUT' | 'PAID' | 'CANCELLED';

export type ApiCommissionEntry = {
  id: string;
  partnerId: string;
  contractDraftId: string;
  model: number;
  kind: string;
  yearlyPremium: number;
  percent: number;
  amount: number;
  notes: string | null;
  status: CommissionStatus;
  payoutId: string | null;
  createdAt: string;
  contractDraft?: {
    id: string;
    productCode: string;
    clientName: string | null;
    premiumYearly: number;
    signedAt: string | null;
  };
};

export type PayoutStatus = 'DRAFT' | 'READY_TO_PAY' | 'PAID' | 'CANCELLED';

export type ApiPayout = {
  id: string;
  partnerId: string;
  reference: string;
  periodFrom: string;
  periodTo: string;
  totalAmount: number;
  entriesCount: number;
  status: PayoutStatus;
  paidAt: string | null;
  paymentNote: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
};

export type ApiPayoutDetail = ApiPayout & { entries: ApiCommissionEntry[] };

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
  partners: {
    list: (status?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED') =>
      request<ApiPartner[]>(`/crm/partners${status ? `?status=${status}` : ''}`),
    get: (id: string) => request<ApiPartnerDetail>(`/crm/partners/${id}`),
    create: (body: {
      name: string;
      contactEmail: string;
      contactPhone?: string;
      ico?: string;
      commissionModel?: 1 | 2;
    }) =>
      request<ApiPartner>('/crm/partners', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<ApiPartner>) =>
      request<ApiPartner>(`/crm/partners/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    createApiKey: (
      partnerId: string,
      body: { label: string; environment?: 'live' | 'test'; scopes?: string[]; expiresAt?: string },
    ) =>
      request<ApiKeyCreated>(`/crm/partners/${partnerId}/api-keys`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    revokeApiKey: (partnerId: string, keyId: string) =>
      request<{ ok: true; revokedAt: string }>(`/crm/partners/${partnerId}/api-keys/${keyId}`, {
        method: 'DELETE',
      }),
    createSalesperson: (
      partnerId: string,
      body: { name: string; email?: string; phone?: string; cnbReg?: string; cnbCategory?: string },
    ) =>
      request<ApiSalesperson>(`/crm/partners/${partnerId}/salespeople`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateSalesperson: (partnerId: string, spId: string, body: Partial<ApiSalesperson>) =>
      request<ApiSalesperson>(`/crm/partners/${partnerId}/salespeople/${spId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    createDiscount: (
      partnerId: string,
      body: {
        code: string;
        label: string;
        kind: 'PERMANENT' | 'ONE_TIME';
        percent: number;
        validFrom?: string;
        validUntil?: string;
        maxUses?: number;
      },
    ) =>
      request<ApiDiscountCode>(`/crm/partners/${partnerId}/discount-codes`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateDiscount: (partnerId: string, dcId: string, body: Partial<ApiDiscountCode>) =>
      request<ApiDiscountCode>(`/crm/partners/${partnerId}/discount-codes/${dcId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    listWebhooks: (partnerId: string) =>
      request<ApiWebhook[]>(`/crm/partners/${partnerId}/webhooks`),
    createWebhook: (partnerId: string, body: { url: string; events: WebhookEvent[]; enabled?: boolean }) =>
      request<ApiWebhookCreated>(`/crm/partners/${partnerId}/webhooks`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateWebhook: (partnerId: string, whId: string, body: Partial<ApiWebhook>) =>
      request<ApiWebhook>(`/crm/partners/${partnerId}/webhooks/${whId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteWebhook: (partnerId: string, whId: string) =>
      request<{ ok: true }>(`/crm/partners/${partnerId}/webhooks/${whId}`, { method: 'DELETE' }),
    listDeliveries: (partnerId: string, whId: string) =>
      request<ApiWebhookDelivery[]>(`/crm/partners/${partnerId}/webhooks/${whId}/deliveries`),
    listCommissions: (partnerId: string, status?: CommissionStatus) =>
      request<{ total: number; totalsByStatus: Record<string, number>; entries: ApiCommissionEntry[] }>(
        `/crm/partners/${partnerId}/commissions${status ? `?status=${status}` : ''}`,
      ),
    listPayouts: (partnerId: string) =>
      request<ApiPayout[]>(`/crm/partners/${partnerId}/payouts`),
    createPayout: (partnerId: string, body: { periodFrom: string; periodTo: string; paymentNote?: string }) =>
      request<ApiPayout>(`/crm/partners/${partnerId}/payouts`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    getPayout: (partnerId: string, pid: string) =>
      request<ApiPayoutDetail>(`/crm/partners/${partnerId}/payouts/${pid}`),
    markPayoutPaid: (partnerId: string, pid: string) =>
      request<ApiPayout>(`/crm/partners/${partnerId}/payouts/${pid}/mark-paid`, { method: 'POST' }),
    cancelPayout: (partnerId: string, pid: string) =>
      request<ApiPayout>(`/crm/partners/${partnerId}/payouts/${pid}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      }),
  },
};
