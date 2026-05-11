import crypto from 'node:crypto';
import { WebhookDeliveryStatus, WebhookEvent } from '@prisma/client';
import { prisma } from './db.js';

const MAX_ATTEMPTS = 5;
const BACKOFF_MINUTES = [1, 5, 25, 120, 720];

export function signWebhookPayload(secret: string, body: string, timestampSeconds: number): string {
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${timestampSeconds}.${body}`)
    .digest('hex');
  return `t=${timestampSeconds},v1=${hmac}`;
}

export async function enqueueEvent(partnerId: string, event: WebhookEvent, data: object): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { partnerId, enabled: true, events: { has: event } },
  });
  if (webhooks.length === 0) return;

  const occurredAt = new Date().toISOString();
  const payload = { event, occurredAt, data };
  const body = JSON.stringify(payload);
  const ts = Math.floor(Date.now() / 1000);

  for (const wh of webhooks) {
    await prisma.webhookDelivery.create({
      data: {
        webhookId: wh.id,
        event,
        payload,
        signature: signWebhookPayload(wh.secret, body, ts),
      },
    });
  }
}

export async function processPendingDeliveries(limit = 10): Promise<{ processed: number; failed: number }> {
  const due = await prisma.webhookDelivery.findMany({
    where: { status: WebhookDeliveryStatus.PENDING, scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
    include: { webhook: true },
  });

  let processed = 0;
  let failed = 0;

  for (const d of due) {
    const body = JSON.stringify(d.payload);
    let ok = false;
    let status = 0;
    let respBody = '';
    try {
      const res = await fetch(d.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Lexia-Event': d.event,
          'X-Lexia-Signature': d.signature,
          'X-Lexia-Delivery': d.id,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      status = res.status;
      respBody = (await res.text()).slice(0, 1000);
      ok = res.ok;
    } catch (e) {
      respBody = e instanceof Error ? e.message.slice(0, 1000) : 'unknown_error';
    }

    const attempts = d.attempts + 1;
    if (ok) {
      await prisma.webhookDelivery.update({
        where: { id: d.id },
        data: {
          status: WebhookDeliveryStatus.SUCCESS,
          attempts,
          lastResponseStatus: status,
          lastResponseBody: respBody,
          deliveredAt: new Date(),
        },
      });
      processed++;
    } else if (attempts >= MAX_ATTEMPTS) {
      await prisma.webhookDelivery.update({
        where: { id: d.id },
        data: {
          status: WebhookDeliveryStatus.DEAD,
          attempts,
          lastResponseStatus: status || null,
          lastResponseBody: respBody,
        },
      });
      failed++;
    } else {
      const next = new Date(Date.now() + BACKOFF_MINUTES[attempts - 1] * 60_000);
      await prisma.webhookDelivery.update({
        where: { id: d.id },
        data: {
          status: WebhookDeliveryStatus.PENDING,
          attempts,
          lastResponseStatus: status || null,
          lastResponseBody: respBody,
          scheduledAt: next,
        },
      });
      failed++;
    }
  }
  return { processed, failed };
}

export function startWebhookWorker(intervalMs = 30_000): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      await processPendingDeliveries();
    } catch (e) {
      console.error('[webhook-worker] error', e);
    }
  }, intervalMs);
}
