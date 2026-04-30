-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'DISTRIBUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "DistributorType" AS ENUM ('SZ_PM', 'SZ_PA', 'DJ', 'VZ', 'DPZ', 'TIPAR');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'SENT_TO_CLIENT', 'SIGNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DraftSource" AS ENUM ('PUBLIC', 'DISTRIBUTOR', 'CRM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "distributorType" "DistributorType",
    "ico" TEXT,
    "parentId" TEXT,
    "inheritCommissions" BOOLEAN NOT NULL DEFAULT false,
    "brokerPool" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractDraft" (
    "id" TEXT NOT NULL,
    "number" TEXT,
    "createdById" TEXT NOT NULL,
    "source" "DraftSource" NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "productCode" TEXT NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientIco" TEXT,
    "pillars" TEXT[],
    "segment" TEXT,
    "territorialScope" TEXT NOT NULL DEFAULT 'CZ',
    "commissionModel" INTEGER,
    "premiumMonthly" INTEGER NOT NULL,
    "premiumYearly" INTEGER NOT NULL,
    "inputJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_parentId_idx" ON "User"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ContractDraft_number_key" ON "ContractDraft"("number");

-- CreateIndex
CREATE INDEX "ContractDraft_createdById_idx" ON "ContractDraft"("createdById");

-- CreateIndex
CREATE INDEX "ContractDraft_status_idx" ON "ContractDraft"("status");

-- CreateIndex
CREATE INDEX "ContractDraft_source_idx" ON "ContractDraft"("source");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractDraft" ADD CONSTRAINT "ContractDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

