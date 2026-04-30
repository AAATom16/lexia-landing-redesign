import { PrismaClient, UserRole, DistributorType } from '@prisma/client';
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
  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
