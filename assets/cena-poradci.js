/**
 * Cena na stránkách pro finanční poradce a realitní zprostředkovatele.
 *
 * PROČ. Obě stránky měly cenu napsanou natvrdo (299 Kč/měsíc, 3 289 Kč/rok).
 * Dneska to číslo sedí — produkt má dva povinné pilíře, 199 + 100 — ale je
 * opsané. Jakmile se kterýkoli z nich pohne, stránky prodávají cenu, která
 * neplatí, a nikdo si toho nevšimne. Bereme ji proto z téhož oceňovacího
 * enginu, který ji určí i při sjednání.
 *
 * Když API nedopoví, zůstane hodnota z HTML. Marketingová stránka nesmí
 * ukázat prázdno ani „—"; raději starší číslo než rozbitá nabídka.
 *
 * Škrtnutá cena a „SLEVA 41 %" u měsíční platby jsou marketingová kotva bez
 * protějšku v systému, takže zůstávají v HTML. U roční platby je škrtnutá
 * částka technická cena, kterou API vrací.
 */
(function () {
  'use strict';

  var API = window.LEXIA_API_BASE || 'https://portal.lexia.cz/api';
  var PRODUKT = 'pojisteni_pravni_ochrany_pro_financni_poradce_a_realitni_zprostredkovatele';

  var buttons = document.querySelectorAll('[data-fp-period]');
  var price = document.querySelector('[data-fp-price]');
  var unit = document.querySelector('[data-fp-unit]');
  var cta = document.querySelector('[data-fp-cta]');
  if (!buttons.length || !price || !unit || !cta) return;

  var old = document.querySelector('[data-fp-old]');
  var disc = document.querySelector('[data-fp-disc]');

  function czk(n) { return Math.round(n).toLocaleString('cs-CZ'); }

  // Výchozí hodnoty z HTML — použijí se, dokud (nebo když) API neodpoví.
  var values = {
    month: { price: price.textContent.trim(), unit: 'Kč/měsíc', old: old ? old.textContent : '',
             disc: disc ? disc.textContent : '', cta: cta.textContent.trim() },
    year: null,
  };
  var aktivni = 'month';

  function vykresli() {
    var v = values[aktivni];
    if (!v) return;
    price.textContent = v.price;
    unit.textContent = v.unit;
    cta.textContent = v.cta;
    if (old && v.old) old.textContent = v.old;
    if (disc && v.disc) disc.textContent = v.disc;
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var period = btn.getAttribute('data-fp-period');
      if (!values[period]) return;
      aktivni = period;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      vykresli();
    });
  });

  fetch(API + '/public/v1/quote?tenant=lexia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ product: PRODUKT, segment: 'FOP' }),
  })
    .then(function (r) {
      var typ = r.headers.get('content-type') || '';
      // Bez /api spadne cesta na frontend a vrátí 200 s HTML; kontrolovat jen
      // stavový kód by znamenalo naparsovat stránku jako cenu.
      if (!r.ok || typ.indexOf('application/json') < 0) throw new Error('nedostupné');
      return r.json();
    })
    .then(function (q) {
      values.month.price = czk(q.monthlyCzk);
      values.month.cta = 'Sjednat za ' + czk(q.monthlyCzk) + ' Kč/měsíc';
      values.year = {
        price: czk(q.payableAnnualCzk),
        unit: 'Kč/rok',
        // Škrtnutá je technická roční cena; rozdíl proti splatné je měsíc zdarma.
        old: czk(q.annualCzk) + ' Kč',
        disc: 'MĚSÍC ZDARMA',
        cta: 'Sjednat za ' + czk(q.payableAnnualCzk) + ' Kč/rok',
      };
      // Roční cena se objevuje i ve větě pod nabídkou.
      var vText = document.querySelector('[data-fp-year-inline]');
      if (vText) vText.textContent = czk(q.payableAnnualCzk) + ' Kč';
      vykresli();
    })
    .catch(function () {
      // Ticho záměrně: na stránce zůstane cena z HTML. Chyba patří do konzole,
      // ne před klienta.
      if (window.console) console.warn('Cenu se nepodařilo načíst, zůstává hodnota ze stránky.');
    });
})();
