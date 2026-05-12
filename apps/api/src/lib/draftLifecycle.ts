import { DraftStatus, WebhookEvent, type ContractDraft } from '@prisma/client';
import { prisma } from './db.js';
import { enqueueEvent } from './webhooks.js';
import { createCommissionForSignedDraft } from './commissions.js';

const STATUS_TO_EVENT: Partial<Record<DraftStatus, WebhookEvent>> = {
  [DraftStatus.SENT_TO_CLIENT]: WebhookEvent.DRAFT_SENT_TO_CLIENT,
  [DraftStatus.SIGNED]: WebhookEvent.DRAFT_SIGNED,
  [DraftStatus.CANCELLED]: WebhookEvent.DRAFT_CANCELLED,
};

function buildPayload(draft: ContractDraft) {
  return {
    id: draft.id,
    referenceCode: draft.id,
    productCode: draft.productCode,
    pillars: draft.pillars,
    premiumMonthly: draft.premiumMonthly,
    premiumYearly: draft.premiumYearly,
    status: draft.status,
    discount: draft.discountSnapshot,
    signedAt: draft.signedAt?.toISOString() ?? null,
    cancelledAt: draft.cancelledAt?.toISOString() ?? null,
    partnerRefId: draft.partnerRefId,
  };
}

export async function onDraftCreated(draft: ContractDraft): Promise<void> {
  if (!draft.partnerId) return;
  await enqueueEvent(draft.partnerId, WebhookEvent.DRAFT_CREATED, buildPayload(draft));
}

export async function onDraftStatusChanged(prev: ContractDraft, next: ContractDraft): Promise<void> {
  if (prev.status === next.status) return;
  if (!next.partnerId) return;

  // Stamp signedAt / cancelledAt if not already set.
  const stampUpdate: { signedAt?: Date; cancelledAt?: Date } = {};
  if (next.status === DraftStatus.SIGNED && !next.signedAt) stampUpdate.signedAt = new Date();
  if (next.status === DraftStatus.CANCELLED && !next.cancelledAt) stampUpdate.cancelledAt = new Date();
  let final = next;
  if (Object.keys(stampUpdate).length > 0) {
    final = await prisma.contractDraft.update({ where: { id: next.id }, data: stampUpdate });
  }

  const event = STATUS_TO_EVENT[next.status];
  if (event) {
    await enqueueEvent(final.partnerId!, event, buildPayload(final));
  }

  if (next.status === DraftStatus.SIGNED) {
    await createCommissionForSignedDraft(final);
  }
}
