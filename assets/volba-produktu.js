/**
 * Volba produktu — ceny „již od…" z katalogu.
 *
 * Dlaždice nenesou žádnou částku v HTML. Cena „již od" je součet pilířů, které
 * se sjednávají vždy, a čte se z téhož katalogu, ze kterého kalkulačka skládá
 * nabídku — takže nemůže lhát o tom, co se prodává. Když katalog mlčí, dlaždice
 * řekne „podle výběru" a nic si nevymýšlí.
 */
(function () {
  'use strict';

  const API = window.LEXIA_API_BASE || 'https://portal.lexia.cz/api';
  const TENANT = 'lexia';
  const PRODUKTY = {
    ridic: 'pojisteni_pravni_ochrany_ridice',
    jednotlivec: 'pojisteni_pravni_ochrany_pro_jednotlivce',
    domacnost: 'pojisteni_pravni_ochrany_pro_domacnosti',
    poradce: 'pojisteni_pravni_ochrany_pro_financni_poradce_a_realitni_zprostredkovatele',
  };

  const czk = (n) => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;

  async function cenaOd(produkt) {
    const res = await fetch(`${API}/public/v1/catalog/${produkt}?tenant=${TENANT}`, {
      headers: { Accept: 'application/json' },
    });
    const typ = res.headers.get('content-type') || '';
    if (!res.ok || !typ.includes('application/json')) throw new Error('katalog');
    const katalog = await res.json();
    const povinne = (katalog.pillars || []).filter((p) => p.mandatory && p.monthlyCzk != null);
    if (!povinne.length) return null;
    return povinne.reduce((s, p) => s + p.monthlyCzk, 0);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-produkt]').forEach(async (karta) => {
      const cena = karta.querySelector('[data-cena]');
      const klic = PRODUKTY[karta.dataset.produkt];
      if (!cena || !klic) return;
      try {
        const od = await cenaOd(klic);
        if (od == null) throw new Error('bez pevné ceny');
        cena.textContent = czk(od);
      } catch {
        // Bez čísla, ne s vymyšleným: obal „již od … /měs." se nahradí větou.
        const obal = cena.closest('.volba-price');
        if (obal) obal.textContent = 'cena podle výběru pilířů';
      }
    });
  });
})();
