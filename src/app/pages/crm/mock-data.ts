export type ClientType = 'individual' | 'company' | 'self_employed';

export type Client = {
  id: string;
  name: string;
  type: ClientType;
  ico?: string;
  email: string;
  phone: string;
  city: string;
  segment: 'Retail' | 'SME' | 'Korporát' | 'VIP';
  product: string;
  manager: string;
  contractsCount: number;
  documentsOpen: number;
  tasksOverdue: number;
  status: 'Aktivní' | 'V jednání' | 'Pozastaveno' | 'Ukončeno';
  createdAt: string;
};

export const clients: Client[] = [
  {
    id: 'cl-001',
    name: 'Petr Novák',
    type: 'individual',
    email: 'petr.novak@email.cz',
    phone: '+420 602 111 222',
    city: 'Praha',
    segment: 'Retail',
    product: 'Životní pojištění Plus',
    manager: 'Jana Dvořáková',
    contractsCount: 2,
    documentsOpen: 0,
    tasksOverdue: 0,
    status: 'Aktivní',
    createdAt: '2024-08-12',
  },
  {
    id: 'cl-002',
    name: 'AGRO MORAVA s.r.o.',
    type: 'company',
    ico: '27182634',
    email: 'reditel@agromorava.cz',
    phone: '+420 543 218 765',
    city: 'Brno',
    segment: 'SME',
    product: 'Pojištění majetku',
    manager: 'Tomáš Procházka',
    contractsCount: 4,
    documentsOpen: 2,
    tasksOverdue: 1,
    status: 'Aktivní',
    createdAt: '2023-05-04',
  },
  {
    id: 'cl-003',
    name: 'Ing. Marie Svobodová',
    type: 'self_employed',
    ico: '87651234',
    email: 'm.svobodova@konzult.cz',
    phone: '+420 777 333 444',
    city: 'Ostrava',
    segment: 'SME',
    product: 'Profesní odpovědnost',
    manager: 'Jana Dvořáková',
    contractsCount: 1,
    documentsOpen: 1,
    tasksOverdue: 0,
    status: 'V jednání',
    createdAt: '2026-02-19',
  },
  {
    id: 'cl-004',
    name: 'STEEL FACTORY a.s.',
    type: 'company',
    ico: '45678912',
    email: 'pojisteni@steelfactory.cz',
    phone: '+420 724 909 808',
    city: 'Plzeň',
    segment: 'Korporát',
    product: 'Pojištění odpovědnosti',
    manager: 'Lukáš Veselý',
    contractsCount: 8,
    documentsOpen: 0,
    tasksOverdue: 0,
    status: 'Aktivní',
    createdAt: '2021-11-30',
  },
  {
    id: 'cl-005',
    name: 'Jakub Černý',
    type: 'individual',
    email: 'jakub.cerny@gmail.com',
    phone: '+420 608 121 314',
    city: 'Liberec',
    segment: 'VIP',
    product: 'Investiční pojištění',
    manager: 'Lukáš Veselý',
    contractsCount: 3,
    documentsOpen: 1,
    tasksOverdue: 0,
    status: 'Aktivní',
    createdAt: '2022-03-15',
  },
  {
    id: 'cl-006',
    name: 'KARLA TRADE s.r.o.',
    type: 'company',
    ico: '67891234',
    email: 'office@karlatrade.cz',
    phone: '+420 597 333 222',
    city: 'Ostrava',
    segment: 'SME',
    product: 'Pojištění vozového parku',
    manager: 'Tomáš Procházka',
    contractsCount: 2,
    documentsOpen: 3,
    tasksOverdue: 2,
    status: 'V jednání',
    createdAt: '2026-04-02',
  },
  {
    id: 'cl-007',
    name: 'Mgr. Tereza Horáková',
    type: 'individual',
    email: 'tereza.horakova@advokat.cz',
    phone: '+420 731 555 666',
    city: 'Praha',
    segment: 'VIP',
    product: 'Životní pojištění Premium',
    manager: 'Jana Dvořáková',
    contractsCount: 1,
    documentsOpen: 0,
    tasksOverdue: 0,
    status: 'Aktivní',
    createdAt: '2025-09-22',
  },
  {
    id: 'cl-008',
    name: 'BIOFARMA Šumava družstvo',
    type: 'company',
    ico: '23456781',
    email: 'pojisteni@biofarma-sumava.cz',
    phone: '+420 388 412 213',
    city: 'Vimperk',
    segment: 'SME',
    product: 'Pojištění zemědělské techniky',
    manager: 'Lukáš Veselý',
    contractsCount: 3,
    documentsOpen: 0,
    tasksOverdue: 0,
    status: 'Aktivní',
    createdAt: '2024-01-08',
  },
];

export type Contract = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  product: string;
  insurer: string;
  premium: number;
  start: string;
  end: string;
  status: 'Aktivní' | 'Návrh' | 'Vypovězená' | 'Ukončená';
  hasMeetingRecord: boolean;
};

export const contracts: Contract[] = [
  {
    id: 'co-1001',
    number: '2026-LX-001',
    clientId: 'cl-001',
    clientName: 'Petr Novák',
    product: 'Životní pojištění Plus',
    insurer: 'Generali Česká pojišťovna',
    premium: 18400,
    start: '2024-08-15',
    end: '2034-08-14',
    status: 'Aktivní',
    hasMeetingRecord: true,
  },
  {
    id: 'co-1002',
    number: '2026-LX-002',
    clientId: 'cl-002',
    clientName: 'AGRO MORAVA s.r.o.',
    product: 'Pojištění majetku',
    insurer: 'Kooperativa pojišťovna',
    premium: 124900,
    start: '2023-05-10',
    end: '2027-05-09',
    status: 'Aktivní',
    hasMeetingRecord: true,
  },
  {
    id: 'co-1003',
    number: '2026-LX-003',
    clientId: 'cl-002',
    clientName: 'AGRO MORAVA s.r.o.',
    product: 'Pojištění vozového parku',
    insurer: 'Allianz pojišťovna',
    premium: 87600,
    start: '2024-01-01',
    end: '2026-12-31',
    status: 'Aktivní',
    hasMeetingRecord: false,
  },
  {
    id: 'co-1004',
    number: '2026-LX-004',
    clientId: 'cl-003',
    clientName: 'Ing. Marie Svobodová',
    product: 'Profesní odpovědnost',
    insurer: 'ČSOB pojišťovna',
    premium: 9800,
    start: '2026-03-01',
    end: '2027-02-28',
    status: 'Návrh',
    hasMeetingRecord: false,
  },
  {
    id: 'co-1005',
    number: '2026-LX-005',
    clientId: 'cl-004',
    clientName: 'STEEL FACTORY a.s.',
    product: 'Pojištění odpovědnosti',
    insurer: 'UNIQA pojišťovna',
    premium: 412000,
    start: '2025-01-01',
    end: '2027-12-31',
    status: 'Aktivní',
    hasMeetingRecord: true,
  },
  {
    id: 'co-1006',
    number: '2026-LX-006',
    clientId: 'cl-005',
    clientName: 'Jakub Černý',
    product: 'Investiční pojištění',
    insurer: 'NN Životní pojišťovna',
    premium: 36000,
    start: '2022-03-20',
    end: '2042-03-19',
    status: 'Aktivní',
    hasMeetingRecord: true,
  },
  {
    id: 'co-1007',
    number: '2026-LX-007',
    clientId: 'cl-006',
    clientName: 'KARLA TRADE s.r.o.',
    product: 'Pojištění vozového parku',
    insurer: 'Allianz pojišťovna',
    premium: 56400,
    start: '2026-04-15',
    end: '2027-04-14',
    status: 'Návrh',
    hasMeetingRecord: false,
  },
  {
    id: 'co-1008',
    number: '2026-LX-008',
    clientId: 'cl-008',
    clientName: 'BIOFARMA Šumava družstvo',
    product: 'Pojištění zemědělské techniky',
    insurer: 'Kooperativa pojišťovna',
    premium: 73200,
    start: '2024-01-15',
    end: '2027-01-14',
    status: 'Aktivní',
    hasMeetingRecord: true,
  },
];

export type Document = {
  id: string;
  name: string;
  type: 'Smlouva' | 'Záznam z jednání' | 'Občanský průkaz' | 'Výpis z OR' | 'GDPR souhlas' | 'Pojistná událost';
  clientId: string;
  clientName: string;
  contractId?: string;
  status: 'Vyplněno' | 'Čeká na nahrání' | 'Po termínu' | 'Schváleno';
  uploadedAt: string;
  size: string;
};

export const documents: Document[] = [
  {
    id: 'd-9001',
    name: 'Smlouva 2026-LX-001 - životní pojištění.pdf',
    type: 'Smlouva',
    clientId: 'cl-001',
    clientName: 'Petr Novák',
    contractId: 'co-1001',
    status: 'Schváleno',
    uploadedAt: '2024-08-15',
    size: '482 kB',
  },
  {
    id: 'd-9002',
    name: 'Záznam z jednání - AGRO MORAVA.docx',
    type: 'Záznam z jednání',
    clientId: 'cl-002',
    clientName: 'AGRO MORAVA s.r.o.',
    contractId: 'co-1002',
    status: 'Schváleno',
    uploadedAt: '2023-05-04',
    size: '124 kB',
  },
  {
    id: 'd-9003',
    name: 'Záznam z jednání - vozový park.docx',
    type: 'Záznam z jednání',
    clientId: 'cl-002',
    clientName: 'AGRO MORAVA s.r.o.',
    contractId: 'co-1003',
    status: 'Po termínu',
    uploadedAt: '—',
    size: '—',
  },
  {
    id: 'd-9004',
    name: 'Výpis z OR - KARLA TRADE.pdf',
    type: 'Výpis z OR',
    clientId: 'cl-006',
    clientName: 'KARLA TRADE s.r.o.',
    status: 'Čeká na nahrání',
    uploadedAt: '—',
    size: '—',
  },
  {
    id: 'd-9005',
    name: 'GDPR souhlas - Svobodová.pdf',
    type: 'GDPR souhlas',
    clientId: 'cl-003',
    clientName: 'Ing. Marie Svobodová',
    status: 'Vyplněno',
    uploadedAt: '2026-04-25',
    size: '64 kB',
  },
  {
    id: 'd-9006',
    name: 'Občanský průkaz - Černý J..jpg',
    type: 'Občanský průkaz',
    clientId: 'cl-005',
    clientName: 'Jakub Černý',
    status: 'Schváleno',
    uploadedAt: '2022-03-15',
    size: '1.2 MB',
  },
  {
    id: 'd-9007',
    name: 'Pojistná událost #PE-2026-018.pdf',
    type: 'Pojistná událost',
    clientId: 'cl-004',
    clientName: 'STEEL FACTORY a.s.',
    contractId: 'co-1005',
    status: 'Vyplněno',
    uploadedAt: '2026-04-21',
    size: '892 kB',
  },
];

export type Task = {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  assignee: string;
  dueDate: string;
  priority: 'Nízká' | 'Střední' | 'Vysoká';
  status: 'Nová' | 'V řešení' | 'Hotovo';
};

export const tasks: Task[] = [
  {
    id: 't-501',
    title: 'Doplnit záznam z jednání - vozový park',
    clientId: 'cl-002',
    clientName: 'AGRO MORAVA s.r.o.',
    assignee: 'Tomáš Procházka',
    dueDate: '2026-04-25',
    priority: 'Vysoká',
    status: 'V řešení',
  },
  {
    id: 't-502',
    title: 'Vyžádat výpis z OR od klienta',
    clientId: 'cl-006',
    clientName: 'KARLA TRADE s.r.o.',
    assignee: 'Tomáš Procházka',
    dueDate: '2026-04-22',
    priority: 'Vysoká',
    status: 'Nová',
  },
  {
    id: 't-503',
    title: 'Připravit nabídku - profesní odpovědnost',
    clientId: 'cl-003',
    clientName: 'Ing. Marie Svobodová',
    assignee: 'Jana Dvořáková',
    dueDate: '2026-05-02',
    priority: 'Střední',
    status: 'V řešení',
  },
  {
    id: 't-504',
    title: 'Schůzka s klientem - revize portfolia',
    clientId: 'cl-005',
    clientName: 'Jakub Černý',
    assignee: 'Lukáš Veselý',
    dueDate: '2026-05-06',
    priority: 'Střední',
    status: 'Nová',
  },
  {
    id: 't-505',
    title: 'Obnova smlouvy 2026-LX-008',
    clientId: 'cl-008',
    clientName: 'BIOFARMA Šumava družstvo',
    assignee: 'Lukáš Veselý',
    dueDate: '2026-12-15',
    priority: 'Nízká',
    status: 'Nová',
  },
  {
    id: 't-506',
    title: 'Doložit GDPR souhlas u nového klienta',
    clientId: 'cl-003',
    clientName: 'Ing. Marie Svobodová',
    assignee: 'Jana Dvořáková',
    dueDate: '2026-04-30',
    priority: 'Střední',
    status: 'Hotovo',
  },
];

export type Lead = {
  id: string;
  name: string;
  source: 'Web formulář' | 'Doporučení' | 'Kampaň' | 'Telefon' | 'Partner';
  product: string;
  estimatedPremium: number;
  owner: string;
  stage: 'Nový' | 'Kontaktováno' | 'Nabídka' | 'Vyhráno' | 'Prohráno';
  createdAt: string;
};

export const leads: Lead[] = [
  {
    id: 'l-7001',
    name: 'Pavel Kratochvíl',
    source: 'Web formulář',
    product: 'Životní pojištění',
    estimatedPremium: 22000,
    owner: 'Jana Dvořáková',
    stage: 'Nový',
    createdAt: '2026-04-27',
  },
  {
    id: 'l-7002',
    name: 'TRANSPORT VYSOČINA s.r.o.',
    source: 'Doporučení',
    product: 'Pojištění vozového parku',
    estimatedPremium: 240000,
    owner: 'Tomáš Procházka',
    stage: 'Nabídka',
    createdAt: '2026-04-15',
  },
  {
    id: 'l-7003',
    name: 'Hana Vaníčková',
    source: 'Kampaň',
    product: 'Cestovní pojištění',
    estimatedPremium: 1800,
    owner: 'Jana Dvořáková',
    stage: 'Kontaktováno',
    createdAt: '2026-04-23',
  },
  {
    id: 'l-7004',
    name: 'CLOUDLINE s.r.o.',
    source: 'Partner',
    product: 'Pojištění odpovědnosti IT',
    estimatedPremium: 84000,
    owner: 'Lukáš Veselý',
    stage: 'Nabídka',
    createdAt: '2026-04-10',
  },
  {
    id: 'l-7005',
    name: 'David Marek',
    source: 'Telefon',
    product: 'Pojištění nemovitosti',
    estimatedPremium: 7200,
    owner: 'Jana Dvořáková',
    stage: 'Vyhráno',
    createdAt: '2026-03-28',
  },
];

export const dashboardKpi = {
  premiumYtd: 1842300,
  premiumYtdGrowth: 0.184,
  activeContracts: 247,
  activeContractsGrowth: 0.062,
  newClientsMonth: 18,
  newClientsGrowth: 0.12,
  pipelineValue: 1245000,
  pipelineGrowth: 0.21,
};

export const monthlyPremium = [
  { month: 'Lis', value: 124000 },
  { month: 'Pro', value: 168000 },
  { month: 'Led', value: 142000 },
  { month: 'Úno', value: 189000 },
  { month: 'Bře', value: 215000 },
  { month: 'Dub', value: 248000 },
];

export const productMix = [
  { name: 'Životní', value: 38, color: '#0045BF' },
  { name: 'Majetek', value: 27, color: '#0057F0' },
  { name: 'Vozidla', value: 18, color: '#008EA5' },
  { name: 'Odpovědnost', value: 11, color: '#003799' },
  { name: 'Ostatní', value: 6, color: '#7da0dc' },
];

export const recentActivity = [
  { id: 'a1', when: 'před 8 min', who: 'Jana Dvořáková', what: 'uzavřela smlouvu', target: 'Petr Novák — Životní Plus', kind: 'contract' as const },
  { id: 'a2', when: 'před 32 min', who: 'Tomáš Procházka', what: 'nahrál dokument', target: 'AGRO MORAVA s.r.o.', kind: 'document' as const },
  { id: 'a3', when: 'před 1 h', who: 'Lukáš Veselý', what: 'vytvořil úkol', target: 'Schůzka s Jakubem Černým', kind: 'task' as const },
  { id: 'a4', when: 'před 3 h', who: 'Jana Dvořáková', what: 'přijala lead', target: 'Pavel Kratochvíl', kind: 'lead' as const },
  { id: 'a5', when: 'včera', who: 'Tomáš Procházka', what: 'aktualizoval klienta', target: 'KARLA TRADE s.r.o.', kind: 'client' as const },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function clientTypeLabel(type: ClientType): string {
  return type === 'individual' ? 'Fyzická osoba' : type === 'company' ? 'Právnická osoba' : 'OSVČ';
}
