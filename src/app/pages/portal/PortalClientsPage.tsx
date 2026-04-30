import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, User } from 'lucide-react';
import { listDrafts, type ContractDraft } from '../../lib/drafts';
import { getUser } from '../../lib/auth';
import { formatCzk } from '../../domain/calculator';

export function PortalClientsPage() {
  const user = getUser();
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);

  useEffect(() => {
    const refresh = () => setDrafts(listDrafts({ source: 'distributor', createdBy: user?.email }));
    refresh();
    window.addEventListener('lexia-drafts-change', refresh);
    return () => window.removeEventListener('lexia-drafts-change', refresh);
  }, [user?.email]);

  const clients = useMemo(() => {
    const byKey = new Map<string, { name: string; email?: string; drafts: ContractDraft[] }>();
    for (const d of drafts) {
      if (!d.clientName) continue;
      const key = d.clientEmail ?? d.clientName;
      const entry = byKey.get(key);
      if (entry) entry.drafts.push(d);
      else byKey.set(key, { name: d.clientName, email: d.clientEmail, drafts: [d] });
    }
    return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [drafts]);

  return (
    <div className="container mx-auto px-6 lg:px-12 py-8">
      <div className="mb-8">
        <h1 className="text-3xl tracking-tight">Klienti</h1>
        <p className="text-muted-foreground">Klienti vytvoření v rámci sjednávání.</p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <User className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
          <p>Klienti se zde zobrazí po vytvoření prvního návrhu s vyplněnými údaji.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {clients.map((c) => {
            const totalYearly = c.drafts.reduce((s, d) => s + d.result.yearly, 0);
            return (
              <div key={c.name} className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-base font-medium">{c.name}</div>
                    {c.email && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm tabular-nums">{formatCzk(totalYearly)}</div>
                    <div className="text-xs text-muted-foreground">{c.drafts.length} návrhů</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Naposledy: {new Date(c.drafts[0].createdAt).toLocaleString('cs-CZ')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
