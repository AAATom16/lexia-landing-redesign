-- AlterEnum
ALTER TYPE "DraftSource" ADD VALUE 'PARTNER_API';

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "SalespersonStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DiscountKind" AS ENUM ('PERMANENT', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'EXHAUSTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "brokerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ico" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "commissionModel" INTEGER NOT NULL DEFAULT 1,
    "commissionRateZiskatelska" INTEGER,
    "commissionRateNasledna" INTEGER,
    "commissionRatePrubezna" INTEGER,
    "status" "PartnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "contractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salesperson" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "salespersonCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cnbReg" TEXT,
    "cnbCategory" "DistributorType",
    "status" "SalespersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salesperson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scopes" TEXT[],
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "DiscountKind" NOT NULL,
    "percent" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ContractDraft"
    ADD COLUMN "partnerId" TEXT,
    ADD COLUMN "salespersonId" TEXT,
    ADD COLUMN "discountCodeId" TEXT,
    ADD COLUMN "discountSnapshot" JSONB,
    ADD COLUMN "partnerRefId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Partner_brokerCode_key" ON "Partner"("brokerCode");

-- CreateIndex
CREATE INDEX "Partner_brokerCode_idx" ON "Partner"("brokerCode");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_salespersonCode_key" ON "Salesperson"("salespersonCode");

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_partnerId_salespersonCode_key" ON "Salesperson"("partnerId", "salespersonCode");

-- CreateIndex
CREATE INDEX "Salesperson_partnerId_idx" ON "Salesperson"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_prefix_key" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "ApiKey_partnerId_idx" ON "ApiKey"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_code_idx" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_partnerId_idx" ON "DiscountCode"("partnerId");

-- CreateIndex
CREATE INDEX "ContractDraft_partnerId_idx" ON "ContractDraft"("partnerId");

-- CreateIndex
CREATE INDEX "ContractDraft_salespersonId_idx" ON "ContractDraft"("salespersonId");

-- AddForeignKey
ALTER TABLE "Salesperson" ADD CONSTRAINT "Salesperson_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "Salesperson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
