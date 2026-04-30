-- CreateEnum
CREATE TYPE "LegalCaseStatus" AS ENUM ('REGISTROVANO', 'V_SETRENI', 'KRYTO', 'ZAMITNUTO', 'UKONCENO');

-- CreateEnum
CREATE TYPE "LegalCaseModel" AS ENUM ('TELEFONICKA_PORADA', 'SAMOREGULACE', 'EXTERNI_LIKVIDACE');

-- CreateEnum
CREATE TYPE "DenialReason" AS ENUM ('PRED_POJISTENIM', 'CEKACI_DOBA', 'PROMLCENO', 'MIMO_VECNY_ROZSAH', 'VYLUKA', 'NESPADA_DO_PILIRE', 'JINE');

-- CreateTable
CREATE TABLE "LegalCase" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "contractDraftId" TEXT,
    "policyholderName" TEXT NOT NULL,
    "policyholderEmail" TEXT,
    "policyholderIco" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "productCode" TEXT NOT NULL,
    "pillarCode" TEXT NOT NULL,
    "legalAreaCode" TEXT,
    "claimType" TEXT,
    "caseDate" TIMESTAMP(3) NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "policyStart" TIMESTAMP(3),
    "status" "LegalCaseStatus" NOT NULL DEFAULT 'REGISTROVANO',
    "model" "LegalCaseModel" NOT NULL DEFAULT 'SAMOREGULACE',
    "isTelefonicka" BOOLEAN NOT NULL DEFAULT false,
    "reserveExternal" INTEGER NOT NULL DEFAULT 0,
    "reserveInternal" INTEGER NOT NULL DEFAULT 0,
    "paidExternal" INTEGER NOT NULL DEFAULT 0,
    "paidInternal" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "denialReason" "DenialReason",
    "denialNote" TEXT,
    "createdById" TEXT,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalCase_caseNumber_key" ON "LegalCase"("caseNumber");

-- CreateIndex
CREATE INDEX "LegalCase_policyholderEmail_idx" ON "LegalCase"("policyholderEmail");

-- CreateIndex
CREATE INDEX "LegalCase_status_idx" ON "LegalCase"("status");

-- CreateIndex
CREATE INDEX "LegalCase_contractDraftId_idx" ON "LegalCase"("contractDraftId");

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_contractDraftId_fkey" FOREIGN KEY ("contractDraftId") REFERENCES "ContractDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

