import { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Bell,
  MessageSquare,
  Upload,
  Check,
  Clock,
  Download,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Capability = { icon: LucideIcon; title: string; description: string };

const seePoints: Capability[] = [
  { icon: ShieldCheck, title: 'Smlouvy a krytí', description: 'Detail balíčku, limity, doba platnosti — vše na jednom místě.' },
  { icon: AlertCircle, title: 'Pojistné události', description: 'Stav řešení v reálném čase, bez telefonování na pobočku.' },
  { icon: CreditCard, title: 'Platby a faktury', description: 'Přehled úhrad, splatnosti a dokladů ke stažení.' },
  { icon: FileText, title: 'Dokumenty', description: 'Smlouvy, podmínky a posudky kdykoliv k dispozici.' },
];

const doPoints: Capability[] = [
  { icon: Bell, title: 'Nahlásit událost', description: 'Online formulář vás provede několika kroky.' },
  { icon: Upload, title: 'Doplnit dokumenty', description: 'Drag & drop přímo do případu, žádné e-maily.' },
  { icon: Clock, title: 'Sledovat průběh', description: 'Časová osa a notifikace u každého kroku.' },
  { icon: MessageSquare, title: 'Komunikovat s právníkem', description: 'Vlastní chat s historií ke každému případu.' },
];

type Tab = 'smlouvy' | 'udalosti' | 'platby' | 'dokumenty';

const tabs: { id: Tab; label: string }[] = [
  { id: 'smlouvy', label: 'Smlouvy' },
  { id: 'udalosti', label: 'Události' },
  { id: 'platby', label: 'Platby' },
  { id: 'dokumenty', label: 'Dokumenty' },
];

export function CustomerPortalSection() {
  const [activeTab, setActiveTab] = useState<Tab>('udalosti');

  return (
    <section id="ucet" className="py-24 bg-gradient-to-b from-[#F7F9FC] to-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] bg-[#0045BF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] bg-[#001843]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-border shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#0045BF]" />
            <span className="text-sm text-[#0045BF]">Zákaznický účet</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground tracking-tight text-balance">
            Vaše právní ochrana, kterou máte plně pod kontrolou
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Smlouvy, události, platby i dokumenty na jednom místě.
            Bez čekání na pobočku, bez papírování.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-10">
            <div>
              <div className="text-sm uppercase tracking-wider text-[#0045BF] mb-4">Co uvidíte</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {seePoints.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-5 bg-white border border-border rounded-2xl hover:border-[#0045BF]/30 hover:shadow-md transition-all">
                      <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#0045BF]/10 to-[#001843]/10 items-center justify-center text-[#0045BF] mb-3">
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div className="text-foreground mb-1 tracking-tight">{item.title}</div>
                      <div className="text-sm text-muted-foreground text-pretty">{item.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm uppercase tracking-wider text-[#0045BF] mb-4">Co můžete</div>
              <div className="space-y-3">
                {doPoints.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white border border-border rounded-xl hover:border-[#0045BF]/30 transition-all">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#F7F9FC] flex items-center justify-center text-[#0045BF]">
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground tracking-tight">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative lg:sticky lg:top-28">
            <div className="absolute -inset-6 bg-gradient-to-tr from-[#0045BF]/15 to-[#001843]/15 rounded-[2rem] blur-2xl" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-[#0045BF] to-[#001843] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-xs">Můj účet</div>
                    <div className="text-white text-lg tracking-tight">Jana Nováková</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full text-white text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Aktivní ochrana
                  </div>
                </div>
              </div>

              <div className="px-6 pt-4 border-b border-border">
                <div className="flex gap-1 -mb-px overflow-x-auto">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === t.id
                          ? 'border-[#0045BF] text-[#0045BF]'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'smlouvy' && <PoliciesPanel />}
                {activeTab === 'udalosti' && <ClaimsPanel />}
                {activeTab === 'platby' && <PaymentsPanel />}
                {activeTab === 'dokumenty' && <DocumentsPanel />}
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl border border-border p-4 max-w-[15rem] hidden md:block">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-sm text-foreground">Případ schválen</div>
                  <div className="text-xs text-muted-foreground">Právník zahájil řešení</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PoliciesPanel() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl border border-[#0045BF]/30 bg-gradient-to-br from-[#0045BF]/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground">Smlouva č. LX-2026-04812</div>
            <div className="text-foreground tracking-tight">Domácnost Premium</div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs">Aktivní</div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          <Stat label="Krytí" value="500 000 Kč" />
          <Stat label="Frekvence" value="Roční" />
          <Stat label="Platnost do" value="14. 3. 2027" />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Smlouva č. LX-2025-29104</div>
            <div className="text-foreground tracking-tight">Auto Standard</div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">Končí 30 dní</div>
        </div>
      </div>
    </div>
  );
}

function ClaimsPanel() {
  const claims = [
    { id: 'CL-2026-1042', title: 'Spor o kauci', step: 3, total: 5, status: 'Řeší se', tone: 'blue' as const, date: '15. 4. 2026' },
    { id: 'CL-2026-0987', title: 'Reklamace spotřebiče', step: 5, total: 5, status: 'Vyřešeno', tone: 'green' as const, date: '02. 4. 2026' },
    { id: 'CL-2026-0901', title: 'Sousedský spor', step: 1, total: 5, status: 'Doplňte info', tone: 'amber' as const, date: '28. 3. 2026' },
  ];

  const toneMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  const barTone = {
    blue: 'bg-[#0045BF]',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
  };

  return (
    <div className="space-y-3">
      {claims.map((c) => (
        <div key={c.id} className="p-4 rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">{c.id} · {c.date}</div>
              <div className="text-foreground tracking-tight">{c.title}</div>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs ${toneMap[c.tone]}`}>{c.status}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#F7F9FC] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barTone[c.tone]}`} style={{ width: `${(c.step / c.total) * 100}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{c.step}/{c.total}</span>
          </div>
        </div>
      ))}

      <button className="w-full py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2">
        <Bell className="w-4 h-4" />
        Nahlásit novou událost
      </button>
    </div>
  );
}

function PaymentsPanel() {
  const rows = [
    { label: 'Domácnost Premium 2026', amount: '4 800 Kč', status: 'Uhrazeno', tone: 'green' as const, date: '14. 3. 2026' },
    { label: 'Auto Standard 2025', amount: '2 400 Kč', status: 'Uhrazeno', tone: 'green' as const, date: '20. 6. 2025' },
    { label: 'Domácnost Premium 2027', amount: '4 800 Kč', status: 'Splatnost 14. 3. 2027', tone: 'muted' as const, date: '—' },
  ];

  const toneMap = {
    green: 'bg-green-100 text-green-700',
    muted: 'bg-[#F7F9FC] text-muted-foreground border border-border',
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/40 border border-green-200">
          <div className="text-xs text-green-700 mb-1">Uhrazeno celkem</div>
          <div className="text-xl text-green-900 tracking-tight">7 200 Kč</div>
        </div>
        <div className="p-4 rounded-xl bg-[#F7F9FC] border border-border">
          <div className="text-xs text-muted-foreground mb-1">Další platba</div>
          <div className="text-xl text-foreground tracking-tight">14. 3. 2027</div>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {rows.map((r, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i !== rows.length - 1 ? 'border-b border-border' : ''} bg-white`}>
            <div>
              <div className="text-sm text-foreground">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground tabular-nums">{r.amount}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${toneMap[r.tone]}`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentsPanel() {
  const docs = [
    { name: 'Pojistná smlouva LX-2026-04812.pdf', size: '320 kB', date: '14. 3. 2026' },
    { name: 'Všeobecné podmínky v3.2.pdf', size: '1.1 MB', date: '14. 3. 2026' },
    { name: 'Vyjádření právníka — kauce.pdf', size: '86 kB', date: '17. 4. 2026' },
  ];

  return (
    <div className="space-y-2">
      {docs.map((d, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border hover:border-[#0045BF]/30 transition-all">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-[#F7F9FC] flex items-center justify-center text-[#0045BF] border border-border">
            <FileText className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-foreground truncate">{d.name}</div>
            <div className="text-xs text-muted-foreground">{d.size} · {d.date}</div>
          </div>
          <button className="shrink-0 w-9 h-9 rounded-lg text-muted-foreground hover:text-[#0045BF] hover:bg-[#F7F9FC] flex items-center justify-center transition-colors" aria-label="Stáhnout">
            <Download className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button className="w-full py-3 mt-2 border-2 border-dashed border-border text-muted-foreground rounded-xl text-sm hover:border-[#0045BF]/40 hover:text-[#0045BF] transition-all flex items-center justify-center gap-2">
        <Upload className="w-4 h-4" />
        Nahrát dokument
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm text-foreground tracking-tight">{value}</div>
    </div>
  );
}
