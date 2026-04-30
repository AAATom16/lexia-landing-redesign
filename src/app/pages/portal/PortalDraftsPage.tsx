import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Trash2, FileText, Mail } from 'lucide-react';
import { deleteDraft, listDrafts, type ContractDraft } from '../../lib/drafts';
import { getUser } from '../../lib/auth';
import { formatCzk } from '../../domain/calculator';
import { getProduct } from '../../domain/products';

export function PortalDraftsPage() {
  const user = getUser();
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);

  useEffect(() => {
    const refresh = () => setDrafts(listDrafts({ source: 'distributor', createdBy: user?.email }));
    refresh();
    window.addEventListener('lexia-drafts-change', refresh);
    return () => window.removeEventListener('lexia-drafts-change', refresh);
  }, [user?.email]);

  return (
    <div className="container mx-auto px-6 lg:px-12 py-8">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl tracking-tight">Sjednávání</h1>
          <p className="text-muted-foreground">Návrhy a rozpracované smlouvy.</p>
        </div>
        <Link
          to="/portal/kalkulacka"
          className="px-4 py-2.5 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl flex items-center gap-2 hover:shadow-lg"
        >
          <Calculator className="w-4 h-4" /> Nový návrh
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[#0045BF]/40" />
          <p className="mb-4">Zatím tu není žádný návrh.</p>
          <Link
            to="/portal/kalkulacka"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0045BF]/10 text-[#0045BF] rounded-lg text-sm"
          >
            <Calculator className="w-4 h-4" /> Vytvořit první návrh
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F7F9FC]">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Vytvořeno</th>
                <th className="px-4 py-3">Klient</th>
                <th className="px-4 py-3">Produkt</th>
                <th className="px-4 py-3">Pilíře</th>
                <th className="px-4 py-3 text-right">Měs.</th>
                <th className="px-4 py-3 text-right">Roč.</th>
                <th className="px-4 py-3">Stav</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-[#F7F9FC]/50">
                  <td className="px-4 py-3 text-sm">{new Date(d.createdAt).toLocaleString('cs-CZ')}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>{d.clientName ?? '—'}</div>
                    {d.clientEmail && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {d.clientEmail}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{getProduct(d.input.productCode)?.shortName}</td>
                  <td className="px-4 py-3 text-sm">{d.input.pillars.length}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">{formatCzk(d.result.monthly)}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-right">{formatCzk(d.result.yearly)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      d.status === 'Návrh' ? 'bg-blue-50 text-blue-700' :
                      d.status === 'Odesláno klientovi' ? 'bg-amber-50 text-amber-700' :
                      'bg-green-50 text-green-700'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm('Smazat návrh?')) deleteDraft(d.id);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Smazat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
