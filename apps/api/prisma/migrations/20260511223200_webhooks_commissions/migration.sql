-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('DRAFT_CREATED', 'DRAFT_SENT_TO_CLIENT', 'DRAFT_SIGNED', 'DRAFT_CANCELLED');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'DEAD');

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" "WebhookEvent"[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" "WebhookEvent" NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastResponseStatus" INTEGER,
    "lastResponseBody" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionEntry" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "contractDraftId" TEXT NOT NULL,
    "model" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "yearlyPremium" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionEntry_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ContractDraft"
    ADD COLUMN "signedAt" TIMESTAMP(3),
    ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Webhook_partnerId_idx" ON "Webhook"("partnerId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_scheduledAt_idx" ON "WebhookDelivery"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "CommissionEntry_partnerId_idx" ON "CommissionEntry"("partnerId");

-- CreateIndex
CREATE INDEX "CommissionEntry_contractDraftId_idx" ON "CommissionEntry"("contractDraftId");

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionEntry" ADD CONSTRAINT "CommissionEntry_contractDraftId_fkey" FOREIGN KEY ("contractDraftId") REFERENCES "ContractDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
