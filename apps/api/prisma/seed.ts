import { PrismaClient, UserRole, DistributorType, LegalCaseStatus, LegalCaseModel } from '@prisma/client';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

const users = [
  // Admins (CRM)
  { email: 'jana.dvorakova@lexia.cz', name: 'Jana Dvořáková', role: UserRole.ADMIN, password: 'lexia123' },
  { email: 'tomas.prochazka@lexia.cz', name: 'Tomáš Procházka', role: UserRole.ADMIN, password: 'lexia123' },
  { email: 'lukas.vesely@lexia.cz', name: 'Lukáš Veselý', role: UserRole.ADMIN, password: 'lexia123' },

  // Distributors (Partner portal)
  {
    email: 'info@frenkee.cz', name: 'Frenkee s.r.o.',
    role: UserRole.DISTRIBUTOR, password: 'partner123',
    distributorType: DistributorType.VZ, ico: '12345678',
  },
  {
    email: 'broker@example.cz', name: 'Demo broker',
    role: UserRole.DISTRIBUTOR, password: 'partner123',
    distributorType: DistributorType.SZ_PM, ico: '87654321',
  },

  // Customer
  { email: 'demo@lexia.cz', name: 'Demo Klient', role: UserRole.CUSTOMER, password: 'demo123' },
];

const sampleCases = [
  {
    caseNumber: 'LX-PP-2026-0001',
    policyholderName: 'Demo Klient',
    policyholderEmail: 'demo@lexia.cz',
    isVip: false,
    productCode: 'INDIVIDUAL',
    pillarCode: 'IND_HOUSING',
    legalAreaCode: 'spory_s_pronajimateli',
    claimType: 'Vymáhání pohledávky / sporné vyúčtování',
    description: 'Pronajímatel zadržuje vratnou kauci po skončení nájmu. Dohoda nedosažena, klient žádá zastoupení.',
    caseDate: new Date('2026-04-12'),
    reportedDate: new Date('2026-04-14'),
    status: LegalCaseStatus.V_SETRENI,
    model: LegalCaseModel.EXTERNI_LIKVIDACE,
    reserveExternal: 25000,
    reserveInternal: 11925,
  },
  {
    caseNumber: 'LX-PP-2026-0002',
    policyholderName: 'Demo Klient',
    policyholderEmail: 'demo@lexia.cz',
    isVip: false,
    productCode: 'INDIVIDUAL',
    pillarCode: 'IND_BASIC',
    legalAreaCode: 'kontrola_smluv',
    claimType: 'Telefonická porada — kontrola smlouvy',
    description: 'Konzultace ke smlouvě o dílo (rekonstrukce kuchyně). Doporučení úprav před podpisem.',
    caseDate: new Date('2026-03-20'),
    reportedDate: new Date('2026-03-20'),
    status: LegalCaseStatus.UKONCENO,
    model: LegalCaseModel.TELEFONICKA_PORADA,
    isTelefonicka: true,
    reserveExternal: 0,
    reserveInternal: 0,
  },
  {
    caseNumber: 'LX-PP-2026-0003',
    policyholderName: 'AGRO MORAVA s.r.o.',
    policyholderEmail: 'reditel@agromorava.cz',
    policyholderIco: '27182634',
    isVip: false,
    productCode: 'BUSINESS',
    pillarCode: 'BIZ_EMPLOYMENT',
    legalAreaCode: 'spory_se_zamestnanci',
    claimType: 'Pracovněprávní spor — výpověď ze strany zaměstnavatele',
    description: 'Zaměstnanec napadl výpověď, podáno k soudu. Lexia zajistí zastoupení v 1. stupni.',
    caseDate: new Date('2026-02-08'),
    reportedDate: new Date('2026-02-15'),
    status: LegalCaseStatus.KRYTO,
    model: LegalCaseModel.EXTERNI_LIKVIDACE,
    reserveExternal: 95000,
    reserveInternal: 11925,
    paidExternal: 32000,
    paidInternal: 11925,
  },
];

async function main() {
  console.log('Seeding users...');
  for (const u of users) {
    const passwordHash = await hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        distributorType: u.distributorType,
        ico: u.ico,
      },
    });
    console.log(`  ✓ ${u.email} (${u.role})`);
  }

  console.log('Seeding sample legal cases...');
  for (const lc of sampleCases) {
    await prisma.legalCase.upsert({
      where: { caseNumber: lc.caseNumber },
      update: {},
      create: lc,
    });
    console.log(`  ✓ ${lc.caseNumber} — ${lc.claimType}`);
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
