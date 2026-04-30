import { useState } from 'react';
import { Check, Mail, Phone, Send, ShieldCheck, User, X } from 'lucide-react';
import { api, isApiEnabled } from '../../lib/api';
import type { CalculationResult, CalculatorInput } from '../../domain/types';
import { formatCzk } from '../../domain/calculator';

export type PublicLeadFormProps = {
  result: CalculationResult;
  input: CalculatorInput;
  open: boolean;
  onClose: () => void;
};

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'sent'; id?: string }
  | { kind: 'error'; message: string };

export function PublicLeadForm({ result, input, open, onClose }: PublicLeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === 'submitting') return;
    if (!name || !email.includes('@') || !consent) {
      setState({ kind: 'error', message: 'Vyplň jméno, email a souhlas se zpracováním údajů.' });
      return;
    }

    setState({ kind: 'submitting' });

    if (!isApiEnabled()) {
      // Local dev fallback — pretend it was sent
      setTimeout(() => setState({ kind: 'sent', id: 'mock-' + Date.now().toString(36) }), 400);
      return;
    }

    try {
      const res = await api.leads.create({
        clientName: name,
        clientEmail: email,
        clientPhone: phone || undefined,
        productCode: input.productCode,
        pillars: input.pillars,
        segment: input.segment,
        premiumMonthly: result.monthly,
        premiumYearly: result.yearly,
        inputJson: input,
        resultJson: result,
      });
      setState({ kind: 'sent', id: res.id });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Odeslání selhalo' });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-[#001843]/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#F7F9FC] z-10"
          aria-label="Zavřít"
        >
          <X className="w-4 h-4" />
        </button>

        {state.kind === 'sent' ? (
          <div className="p-8 text-center">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-green-100 items-center justify-center mb-4">
              <Check className="w-7 h-7 text-green-600" strokeWidth={2} />
            </div>
            <h3 className="text-2xl tracking-tight mb-2">Hotovo, ozveme se vám.</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Vaši kalkulaci jsme předali týmu Lexia. Specialista vás kontaktuje do dvou pracovních dnů
              s konkrétní nabídkou. Reference: <code className="px-1.5 py-0.5 rounded bg-[#F7F9FC] text-xs">{state.id}</code>
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#0045BF] text-white rounded-xl hover:shadow-lg"
            >
              Zavřít
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0045BF]/10 text-[#0045BF] text-xs mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Pojistné dle tarifů 2026/04
              </div>
              <h3 className="text-2xl tracking-tight">Pošleme vám nabídku na míru</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCzk(result.monthly)}/měs · {formatCzk(result.yearly)}/rok ·
                {' '}{input.pillars.length} {input.pillars.length === 1 ? 'pilíř' : 'pilíře'}
              </p>
            </div>

            <label className="block text-sm">
              <span className="text-muted-foreground">Jméno a příjmení</span>
              <div className="relative mt-1">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="např. Jan Novák"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Email</span>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="vas@email.cz"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-muted-foreground">Telefon (volitelné)</span>
              <div className="relative mt-1">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border focus:border-[#0045BF] outline-none"
                  placeholder="+420 …"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#0045BF]"
              />
              <span>
                Souhlasím se zpracováním osobních údajů za účelem kontaktu od Lexia Legal Protection a.s.
                Údaje neukládáme déle než je potřeba k vyhodnocení vaší poptávky.
              </span>
            </label>

            {state.kind === 'error' && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={state.kind === 'submitting'}
              className="w-full px-5 py-3 bg-gradient-to-r from-[#0045BF] to-[#001843] text-white rounded-xl hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {state.kind === 'submitting' ? 'Odesílám…' : 'Odeslat poptávku'}
            </button>

            <div className="text-center text-xs text-muted-foreground">
              Bez závazku. Na základě údajů vás kontaktujeme s konkrétní nabídkou.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
