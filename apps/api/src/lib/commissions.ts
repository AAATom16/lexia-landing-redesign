import type { Partner, ContractDraft } from '@prisma/client';
import { prisma } from './db.js';

const DEFAULT_RATE_ZISKATELSKA = 45;
const DEFAULT_RATE_NASLEDNA = 10;
const DEFAULT_RATE_PRUBEZNA = 23;

export type CommissionResult = {
  model: number;
  entries: { kind: string; percent: number; amount: number }[];
  totalAmount: number;
};

export function previewCommission(partner: Partner, yearlyPremium: number): CommissionResult {
  if (partner.commissionModel === 1) {
    const ziskPct = partner.commissionRateZiskatelska ?? DEFAULT_RATE_ZISKATELSKA;
    const naslPct = partner.commissionRateNasledna ?? DEFAULT_RATE_NASLEDNA;
    const ziskatelska = Math.round((yearlyPremium * ziskPct) / 100);
    const nasledna = Math.round((yearlyPremium * naslPct) / 100);
    return {
      model: 1,
      entries: [
        { kind: 'ziskatelska', percent: ziskPct, amount: ziskatelska },
        { kind: 'nasledna', percent: naslPct, amount: nasledna },
      ],
      totalAmount: ziskatelska + nasledna,
    };
  }
  const prubPct = partner.commissionRatePrubezna ?? DEFAULT_RATE_PRUBEZNA;
  const prubezna = Math.round((yearlyPremium * prubPct) / 100);
  return {
    model: 2,
    entries: [{ kind: 'prubezna', percent: prubPct, amount: prubezna }],
    totalAmount: prubezna,
  };
}

export async function createCommissionForSignedDraft(draft: ContractDraft): Promise<void> {
  if (!draft.partnerId) return; // not a partner-attributed draft
  const existing = await prisma.commissionEntry.findFirst({ where: { contractDraftId: draft.id } });
  if (existing) return; // idempotent

  const partner = await prisma.partner.findUnique({ where: { id: draft.partnerId } });
  if (!partner) return;

  const result = previewCommission(partner, draft.premiumYearly);

  await prisma.$transaction(
    result.entries.map((e) =>
      prisma.commissionEntry.create({
        data: {
          partnerId: partner.id,
          contractDraftId: draft.id,
          model: result.model,
          kind: e.kind,
          yearlyPremium: draft.premiumYearly,
          percent: e.percent,
          amount: e.amount,
          notes: `Auto-generated on draft.signed (${draft.id})`,
        },
      }),
    ),
  );
}
