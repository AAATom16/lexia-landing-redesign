import type { CalculationResult, CalculatorInput, CommissionModel } from '../domain/types';

const KEY = 'lexia_drafts';

export type ContractDraft = {
  id: string;
  createdAt: string;
  createdBy: string;
  source: 'public' | 'distributor' | 'crm';
  status: 'Návrh' | 'Odesláno klientovi' | 'Podepsáno';
  clientName?: string;
  clientEmail?: string;
  input: CalculatorInput;
  result: CalculationResult;
  commissionModel?: CommissionModel;
  notes?: string;
};

function read(): ContractDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContractDraft[]) : [];
  } catch {
    return [];
  }
}

function write(list: ContractDraft[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('lexia-drafts-change'));
}

export function listDrafts(filter?: { source?: ContractDraft['source']; createdBy?: string }): ContractDraft[] {
  let list = read();
  if (filter?.source) list = list.filter((d) => d.source === filter.source);
  if (filter?.createdBy) list = list.filter((d) => d.createdBy === filter.createdBy);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveDraft(draft: Omit<ContractDraft, 'id' | 'createdAt'>): ContractDraft {
  const id = `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const created: ContractDraft = { ...draft, id, createdAt: new Date().toISOString() };
  const list = read();
  list.push(created);
  write(list);
  return created;
}

export function deleteDraft(id: string) {
  write(read().filter((d) => d.id !== id));
}

export function getDraft(id: string): ContractDraft | undefined {
  return read().find((d) => d.id === id);
}
