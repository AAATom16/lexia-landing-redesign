import { PrismaClient, UserRole, DistributorType, LegalCaseStatus, LegalCaseModel, PartnerStatus, SalespersonStatus, DiscountKind, DiscountStatus } from '@prisma/client';
import crypto from 'node:crypto';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

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

  console.log('Seeding partner system...');

  const partner = await prisma.partner.upsert({
    where: { brokerCode: 'LX-BR-00001' },
    update: {},
    create: {
      brokerCode: 'LX-BR-00001',
      name: 'Frenkee s.r.o.',
      ico: '12345678',
      contactEmail: 'info@frenkee.cz',
      contactPhone: '+420 777 000 001',
      commissionModel: 1,
      status: PartnerStatus.ACTIVE,
      contractedAt: new Date('2026-04-01'),
    },
  });
  console.log(`  ✓ Partner ${partner.brokerCode} (${partner.name})`);

  const salespeople = [
    {
      salespersonCode: 'LX-BR-00001-OB01',
      name: 'Petr Novotný',
      email: 'petr.novotny@frenkee.cz',
      phone: '+420 777 000 011',
      cnbReg: '178421',
      cnbCategory: DistributorType.VZ,
    },
    {
      salespersonCode: 'LX-BR-00001-OB02',
      name: 'Markéta Krátká',
      email: 'marketa.kratka@frenkee.cz',
      phone: '+420 777 000 012',
      cnbReg: '184902',
      cnbCategory: DistributorType.SZ_PA,
    },
  ];
  for (const sp of salespeople) {
    await prisma.salesperson.upsert({
      where: { salespersonCode: sp.salespersonCode },
      update: {},
      create: { ...sp, partnerId: partner.id, status: SalespersonStatus.ACTIVE },
    });
    console.log(`  ✓ Salesperson ${sp.salespersonCode} — ${sp.name}`);
  }

  // Deterministic dev API key — DO NOT use in production.
  // Plain key is printed below; only sha256 hash is stored.
  const DEV_API_KEY_PLAIN = 'lxa_live_deadbeef_FrenkeeDevTestKey0000000000000000';
  const DEV_API_KEY_PREFIX = 'lxa_live_deadbeef';
  const existingKey = await prisma.apiKey.findUnique({ where: { prefix: DEV_API_KEY_PREFIX } });
  if (!existingKey) {
    await prisma.apiKey.create({
      data: {
        partnerId: partner.id,
        prefix: DEV_API_KEY_PREFIX,
        hash: sha256(DEV_API_KEY_PLAIN),
        label: 'Dev test key (seeded)',
        scopes: ['leads:write', 'calculator:read', 'account:read'],
      },
    });
    console.log(`  ✓ ApiKey ${DEV_API_KEY_PREFIX}`);
    console.log(`    PLAIN KEY (only printed at first seed): ${DEV_API_KEY_PLAIN}`);
  } else {
    console.log(`  ✓ ApiKey ${DEV_API_KEY_PREFIX} (already seeded, plain key not re-shown)`);
  }

  const discounts = [
    {
      code: 'FRENKEE-FRIENDS-26',
      label: 'Trvalá sleva pro klienty Frenkee — 10 %',
      kind: DiscountKind.PERMANENT,
      percent: 10,
      validFrom: new Date('2026-04-01'),
      validUntil: null,
      maxUses: null,
    },
    {
      code: 'FRENKEE-WELCOME-A8K2P3',
      label: 'Jednorázový uvítací bonus — 15 %',
      kind: DiscountKind.ONE_TIME,
      percent: 15,
      validFrom: new Date('2026-05-01'),
      validUntil: new Date('2026-08-31'),
      maxUses: 1,
    },
  ];
  for (const d of discounts) {
    await prisma.discountCode.upsert({
      where: { code: d.code },
      update: {},
      create: { ...d, partnerId: partner.id, status: DiscountStatus.ACTIVE },
    });
    console.log(`  ✓ DiscountCode ${d.code} (${d.kind}, ${d.percent}%)`);
  }

  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
