import type { CalculationResult, CalculatorInput, CommissionModel } from '../domain/types';
import { ApiError, api, getToken, isApiEnabled, type ApiDraft } from './api';

const KEY = 'lexia_drafts';

export type DraftSource = 'public' | 'distributor' | 'crm';
export type DraftStatus = 'Návrh' | 'Odesláno klientovi' | 'Podepsáno';

export type ContractDraft = {
  id: string;
  createdAt: string;
  createdBy: string;
  source: DraftSource;
  status: DraftStatus;
  clientName?: string;
  clientEmail?: string;
  input: CalculatorInput;
  result: CalculationResult;
  commissionModel?: CommissionModel;
  notes?: string;
};

export type DraftFilter = { source?: DraftSource; createdBy?: string };

const STATUS_TO_API: Record<DraftStatus, ApiDraft['status']> = {
  'Návrh': 'DRAFT',
  'Odesláno klientovi': 'SENT_TO_CLIENT',
  'Podepsáno': 'SIGNED',
};
const STATUS_FROM_API: Record<ApiDraft['status'], DraftStatus> = {
  DRAFT: 'Návrh',
  SENT_TO_CLIENT: 'Odesláno klientovi',
  SIGNED: 'Podepsáno',
  CANCELLED: 'Návrh',
};
const SOURCE_TO_API: Record<DraftSource, ApiDraft['source']> = {
  public: 'PUBLIC',
  distributor: 'DISTRIBUTOR',
  crm: 'CRM',
};
const SOURCE_FROM_API: Record<ApiDraft['source'], DraftSource> = {
  PUBLIC: 'public',
  DISTRIBUTOR: 'distributor',
  CRM: 'crm',
};

function fromApi(d: ApiDraft, ownerEmail: string): ContractDraft {
  return {
    id: d.id,
    createdAt: d.createdAt,
    createdBy: ownerEmail,
    source: SOURCE_FROM_API[d.source],
    status: STATUS_FROM_API[d.status],
    clientName: d.clientName ?? undefined,
    clientEmail: d.clientEmail ?? undefined,
    input: d.inputJson,
    result: d.resultJson,
    commissionModel: (d.commissionModel ?? undefined) as CommissionModel | undefined,
    notes: d.notes ?? undefined,
  };
}

function readLocal(filter?: DraftFilter): ContractDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    let list = raw ? (JSON.parse(raw) as ContractDraft[]) : [];
    if (filter?.source) list = list.filter((d) => d.source === filter.source);
    if (filter?.createdBy) list = list.filter((d) => d.createdBy === filter.createdBy);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function writeLocal(list: ContractDraft[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('lexia-drafts-change'));
}

function emitChange() {
  window.dispatchEvent(new Event('lexia-drafts-change'));
}

function backendIsApi(): boolean {
  return isApiEnabled() && !!getToken();
}

export async function listDrafts(filter?: DraftFilter): Promise<ContractDraft[]> {
  if (backendIsApi()) {
    try {
      const drafts = await api.drafts.list();
      const owner = filter?.createdBy ?? '';
      let mapped = drafts.map((d) => fromApi(d, owner));
      if (filter?.source) mapped = mapped.filter((d) => d.source === filter.source);
      mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return mapped;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Token expired/invalid — fall back to local cache
        return readLocal(filter);
      }
      throw err;
    }
  }
  return readLocal(filter);
}

export async function saveDraft(draft: Omit<ContractDraft, 'id' | 'createdAt'>): Promise<ContractDraft> {
  if (backendIsApi()) {
    const created = await api.drafts.create({
      productCode: draft.input.productCode,
      pillars: draft.input.pillars,
      segment: draft.input.segment,
      territorialScope: 'CZ',
      clientName: draft.clientName,
      clientEmail: draft.clientEmail,
      commissionModel: draft.commissionModel,
      premiumMonthly: draft.result.monthly,
      premiumYearly: draft.result.yearly,
      inputJson: draft.input,
      resultJson: draft.result,
      source: SOURCE_TO_API[draft.source],
      status: STATUS_TO_API[draft.status],
      notes: draft.notes,
    });
    emitChange();
    return fromApi(created, draft.createdBy);
  }

  const id = `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const created: ContractDraft = { ...draft, id, createdAt: new Date().toISOString() };
  const list = readLocal();
  list.push(created);
  writeLocal(list);
  return created;
}

export async function deleteDraft(id: string): Promise<void> {
  if (backendIsApi()) {
    await api.drafts.remove(id);
    emitChange();
    return;
  }
  writeLocal(readLocal().filter((d) => d.id !== id));
}

export async function updateDraft(
  id: string,
  patch: Partial<Pick<ContractDraft, 'status' | 'clientName' | 'clientEmail' | 'notes' | 'commissionModel'>>,
): Promise<ContractDraft | undefined> {
  if (backendIsApi()) {
    const updated = await api.drafts.update(id, {
      status: patch.status ? STATUS_TO_API[patch.status] : undefined,
      clientName: patch.clientName,
      clientEmail: patch.clientEmail,
      notes: patch.notes,
      commissionModel: patch.commissionModel,
    });
    emitChange();
    return fromApi(updated, '');
  }
  const list = readLocal();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...patch };
  writeLocal(list);
  return list[idx];
}

export const DRAFT_STATUSES: DraftStatus[] = ['Návrh', 'Odesláno klientovi', 'Podepsáno'];

export function nextStatus(current: DraftStatus): DraftStatus | null {
  const i = DRAFT_STATUSES.indexOf(current);
  if (i === -1 || i >= DRAFT_STATUSES.length - 1) return null;
  return DRAFT_STATUSES[i + 1];
}

export async function getDraft(id: string): Promise<ContractDraft | undefined> {
  if (backendIsApi()) {
    try {
      const d = await api.drafts.get(id);
      return fromApi(d, '');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined;
      throw err;
    }
  }
  return readLocal().find((d) => d.id === id);
}
