/**
 * Kalkulačka — pilíře i ceny z backendu LEXIA.
 *
 * PROČ. Do 28. 8. 2026 měla kalkulačka ceník opsaný v `script.js`. Rozešel se:
 * vozidla účtovala 129/169 Kč, zatímco se prodává 79/99; „další nemovitost"
 * měla pevnou sazbu, zatímco ceník dává na druhý a další objekt slevu 40 %;
 * a nabízela volby (samostatné objekty podle výměry, množstevní slevy na
 * vozidla), které v prodávaném produktu vůbec nejsou.
 *
 * Kalkulačka se proto nikde neptá na ceník, ale rovnou na cenu: pilíře si
 * vytáhne z katalogu a částku spočítá tentýž engine, který cenu určí i při
 * sjednání. Rozejít se to nemůže, protože je jen jedno místo, kde cena vzniká.
 */
(function () {
  'use strict';

  const API = window.LEXIA_API_BASE || 'https://portal.lexia.cz/api';
  const TENANT = 'lexia';
  const PRODUKTY = {
    jednotlivec: 'pojisteni_pravni_ochrany_pro_jednotlivce',
    domacnost: 'pojisteni_pravni_ochrany_pro_domacnosti',
    poradce: 'pojisteni_pravni_ochrany_pro_financni_poradce_a_realitni_zprostredkovatele',
  };

  const czk = (n) => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
  const el = (sel, root) => (root || document).querySelector(sel);

  const stav = {
    produkt: null,
    katalog: null,
    vybrane: new Set(),
    /** klíč pilíře → pole objektů `{ typeKey, quantity }` nebo `{ gross_salary }` */
    vstupy: {},
    posledni: null,
  };

  // ── načtení katalogu ──────────────────────────────────────────────────────
  async function nactiKatalog(produkt) {
    const res = await fetch(`${API}/public/v1/catalog/${produkt}?tenant=${TENANT}`, {
      headers: { Accept: 'application/json' },
    });
    // Bez /api spadne cesta na frontend a vrátí 200 s HTML. Kontrolovat jen
    // stavový kód by znamenalo naparsovat stránku jako prázdný ceník.
    const typ = res.headers.get('content-type') || '';
    if (!res.ok || !typ.includes('application/json')) {
      throw new Error('Katalog produktů se nepodařilo načíst.');
    }
    return res.json();
  }

  /**
   * Vstupy pilířů → parametry pro engine. Sdílí je nacenění i sjednání: kdyby
   * si je sjednání skládalo po svém, mohla by smlouva vzniknout s jinými
   * objekty, než na kterých stála ukázaná cena.
   */
  function sestavParametry() {
    const parameters = {};
    for (const [klic, hodnota] of Object.entries(stav.vstupy)) {
      const pilir = stav.katalog.pillars.find((p) => p.key === klic);
      if (!pilir || !pilir.input || !stav.vybrane.has(klic)) continue;
      if (pilir.input.kind === 'objects') {
        // Engine počítá POLOŽKY seznamu, ne pole `quantity`: tři objekty jsou
        // tři položky. U výměry je to jedna položka s plochou v `areaParam`.
        const { typeKey, mnozstvi } = hodnota || {};
        if (!typeKey || !(mnozstvi > 0)) continue;
        parameters[pilir.input.param] =
          pilir.input.unit === 'sqm'
            ? [{ typeKey, [pilir.input.areaParam || 'area_m2']: mnozstvi }]
            : Array.from({ length: Math.min(mnozstvi, 20) }, () => ({ typeKey }));
      } else if (pilir.input.kind === 'salary') {
        if (Number(hodnota) > 0) {
          // Odměna musí být UVNITŘ položky funkce. Engine dává seznamu funkcí
          // přednost před samostatnou hodnotou, a položka bez odměny spadne na
          // minimální pojistné — pak je jedno, co člověk zadá, vyjde pořád
          // minimum. Klíč je `grossMonthlyCzk`, tedy odměna MĚSÍČNÍ.
          parameters[pilir.input.salaryParam] = Number(hodnota);
          parameters[pilir.input.itemsParam] = [{ grossMonthlyCzk: Number(hodnota) }];
        }
      }
    }
    return parameters;
  }

  async function nacenit() {
    const parameters = sestavParametry();
    const res = await fetch(`${API}/public/v1/quote?tenant=${TENANT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        product: stav.produkt,
        segment: 'FO',
        pillars: [...stav.vybrane],
        parameters,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.message) || 'Cenu se nepodařilo spočítat.');
    }
    return data;
  }

  // ── vykreslení pilířů ─────────────────────────────────────────────────────
  function vykresliPilire() {
    const box = el('#calc-pillars');
    if (!box) return;
    box.innerHTML = '';

    const hlavni = stav.katalog.pillars.filter((p) => !p.requiresPillarKey);
    for (const p of hlavni) {
      // Pilíř i jeho doplňky drží jeden obal. Dřív se doplňky vykreslovaly jako
      // pruh přes celou šířku mřížky, takže se vizuálně odtrhly od pilíře, ke
      // kterému patří, a jejich rozbalení odsunulo všechno pod nimi. Roman
      // 29. 8. 2026: „nepřehledné". Uvnitř obalu je vazba vidět ze struktury
      // a nic jiného se nehne.
      const skupina = document.createElement('div');
      skupina.className = 'calc-pillar-group';
      skupina.appendChild(dlazdice(p));

      const doplnky = stav.katalog.pillars.filter((d) => d.requiresPillarKey === p.key);
      if (doplnky.length) {
        const wrap = document.createElement('div');
        wrap.className = 'calc-addons';
        wrap.dataset.parent = p.key;
        // Doplněk jde sjednat jen s rodičem — dokud není vybraný, nemá smysl
        // ho ani ukazovat.
        wrap.hidden = !stav.vybrane.has(p.key);
        const nadpis = document.createElement('p');
        nadpis.className = 'calc-addons-title';
        nadpis.textContent =
          doplnky.length === 1 ? 'Doplněk k tomuto pilíři' : 'Doplňky k tomuto pilíři';
        wrap.appendChild(nadpis);
        doplnky.forEach((d) => wrap.appendChild(dlazdice(d, true)));
        skupina.appendChild(wrap);
      }
      box.appendChild(skupina);
    }
  }

  function dlazdice(p, jeDoplnek) {
    const label = document.createElement('label');
    label.className = 'calc-option' + (stav.vybrane.has(p.key) ? ' selected' : '');
    if (jeDoplnek) label.classList.add('is-addon');

    const vstup = document.createElement('input');
    vstup.type = 'checkbox';
    vstup.dataset.pillar = p.key;
    vstup.checked = stav.vybrane.has(p.key);
    if (p.mandatory) {
      vstup.checked = true;
      vstup.disabled = true;
      label.style.cursor = 'not-allowed';
    }
    label.appendChild(vstup);

    const nazev = document.createElement('strong');
    nazev.textContent = p.name;
    label.appendChild(nazev);

    const cena = document.createElement('span');
    cena.className = 'px-label';
    // U proměnlivé ceny žádné číslo neexistuje — ukázat nejnižší variantu by
    // znamenalo slíbit cenu, která po zadání objektů neplatí.
    cena.textContent =
      p.priceKind === 'fixed' && p.monthlyCzk != null
        ? `${czk(p.monthlyCzk)}/měsíc`
        : p.priceLabel;
    label.appendChild(cena);

    if (p.mandatory) {
      const znak = document.createElement('span');
      znak.className = 'calc-badge';
      // Roman 29. 8. 2026 — „POVINNÝ" verzálkami působilo jako varování; jde
      // přitom o samozřejmost, ne o podmínku, kterou musí klient řešit.
      znak.textContent = 'sjednává se vždy';
      label.appendChild(znak);
    }

    if ((p.coverage || []).length) label.appendChild(infoIkona(p));
    if (p.input) label.appendChild(vstupyPilire(p));
    return label;
  }

  const ROZSAH = { europe: 'Evropa', world: 'celý svět', cz: 'Česko' };

  /**
   * „i" u dlaždice (Roman 29. 8. 2026) — co pilíř kryje, s limity.
   *
   * Obsah se bere z oblastí krytí, které katalog stejně publikuje, ne z ručně
   * psaného textu. Psaný popis by se dřív nebo později rozešel s produktem;
   * tohle se změní samo, jakmile se změní krytí.
   *
   * Tlačítko je `type="button"` a klik nesmí probublat — dlaždice je `<label>`
   * se zaškrtávátkem, takže bez toho by otevření detailu pilíř zároveň
   * odškrtlo.
   */
  function infoIkona(p) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calc-info';
    btn.textContent = 'i';
    btn.setAttribute('aria-label', `Co kryje ${p.name}`);
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      otevriInfo(p);
    });
    return btn;
  }

  function otevriInfo(p) {
    el('#calc-info-dialog')?.remove();
    const dlg = document.createElement('dialog');
    dlg.id = 'calc-info-dialog';
    dlg.className = 'calc-info-dialog';

    const h = document.createElement('h3');
    h.textContent = p.name;
    dlg.appendChild(h);

    const shrnuti = document.createElement('p');
    shrnuti.className = 'calc-info-sub';
    shrnuti.textContent =
      p.priceKind === 'fixed' && p.monthlyCzk != null
        ? `${czk(p.monthlyCzk)} měsíčně · ${p.coverage.length} pojištěných oblastí`
        : `${p.priceLabel} · ${p.coverage.length} pojištěných oblastí`;
    dlg.appendChild(shrnuti);

    // Podmínky pojistitelnosti nahoru, před výčet krytí. Je to jediná část,
    // kterou klient musí o sobě ověřit; když je přehlédne, koupí si cenu, která
    // pro jeho případ neplatí. Interní kalkulačka je ukazuje operátorovi taky.
    if ((p.conditions || []).length) {
      const box = document.createElement('div');
      box.className = 'calc-info-podminky';
      const h = document.createElement('strong');
      h.textContent = 'Za jakých podmínek platí tato cena';
      box.appendChild(h);
      const ol = document.createElement('ul');
      p.conditions.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        ol.appendChild(li);
      });
      box.appendChild(ol);
      const pozn = document.createElement('em');
      pozn.textContent =
        'Pokud některá neplatí, pojištění sjednat jde, ale cenu vám potvrdíme individuálně.';
      box.appendChild(pozn);
      dlg.appendChild(box);
    }

    const ul = document.createElement('ul');
    ul.className = 'calc-info-list';
    p.coverage.forEach((o) => {
      const li = document.createElement('li');
      const nazev = document.createElement('span');
      nazev.textContent = o.name;
      li.appendChild(nazev);
      const detail = [];
      if (o.limitCzk != null) detail.push(`limit ${czk(o.limitCzk)}`);
      if (o.territorialScope) detail.push(ROZSAH[o.territorialScope] || o.territorialScope);
      // Čekací doba je jediný údaj, kvůli kterému může klient odejít s pocitem,
      // že kryto je hned — proto se ukazuje, i když je nula dní běžnější.
      if (o.waitingPeriodDays) detail.push(`čekací doba ${o.waitingPeriodDays} dní`);
      if (detail.length) {
        const meta = document.createElement('em');
        meta.textContent = detail.join(' · ');
        li.appendChild(meta);
      }
      ul.appendChild(li);
    });
    dlg.appendChild(ul);

    const zavri = document.createElement('button');
    zavri.type = 'button';
    zavri.className = 'btn btn-outline';
    zavri.textContent = 'Zavřít';
    zavri.addEventListener('click', () => dlg.close());
    dlg.appendChild(zavri);

    dlg.addEventListener('close', () => dlg.remove());
    // Klik mimo obsah zavírá — u `dialog` je to klik na samotný backdrop.
    dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
    document.body.appendChild(dlg);
    dlg.showModal();
  }

  function vstupyPilire(p) {
    const box = document.createElement('div');
    box.className = 'calc-pillar-input';
    box.hidden = !stav.vybrane.has(p.key);
    box.dataset.for = p.key;

    if (p.input.kind === 'salary') {
      // MĚSÍČNÍ, ne roční: engine počítá procento z hrubé měsíční odměny.
      // Roční hodnota by pojistné nadsadila dvanáctkrát.
      box.appendChild(popisek('Hrubá měsíční odměna za výkon funkce (Kč)'));
      const i = document.createElement('input');
      i.type = 'number';
      i.min = '0';
      i.step = '1000';
      i.dataset.salaryFor = p.key;
      i.value = stav.vstupy[p.key] || '';
      box.appendChild(i);
      return box;
    }

    const jeVymera = p.input.unit === 'sqm';
    box.appendChild(popisek(jeVymera ? 'Typ pozemku a výměra v m²' : 'Typ objektu a počet'));
    const rada = document.createElement('div');
    rada.className = 'calc-object-row';

    const vyber = document.createElement('select');
    vyber.dataset.typeFor = p.key;
    p.input.types.forEach((t) => {
      const o = document.createElement('option');
      o.value = t.key;
      o.textContent = t.label;
      vyber.appendChild(o);
    });
    rada.appendChild(vyber);

    const pocet = document.createElement('input');
    pocet.type = 'number';
    pocet.min = jeVymera ? '1' : '1';
    pocet.step = '1';
    pocet.value = (stav.vstupy[p.key] && stav.vstupy[p.key].mnozstvi) || (jeVymera ? 1000 : 1);
    pocet.dataset.qtyFor = p.key;
    pocet.setAttribute('aria-label', jeVymera ? 'Výměra v m²' : 'Počet objektů');
    rada.appendChild(pocet);

    box.appendChild(rada);
    return box;
  }

  function popisek(text) {
    const s = document.createElement('span');
    s.className = 'calc-input-label';
    s.textContent = text;
    return s;
  }

  // ── shrnutí ───────────────────────────────────────────────────────────────
  function vykresliShrnuti(q, chyba) {
    const seznam = el('#sum-pillars');
    const celkem = el('#sum-total');
    const uspora = el('#sum-saving');
    if (!seznam || !celkem) return;

    if (chyba) {
      seznam.innerHTML = `<li class="calc-error">${chyba}</li>`;
      celkem.textContent = '—';
      if (uspora) uspora.hidden = true;
      return;
    }

    const rocne = el('input[name="period"]:checked')?.value === 'rocni';
    seznam.innerHTML = '';
    q.lines.forEach((l) => {
      const li = document.createElement('li');
      li.textContent = l.label;
      const c = document.createElement('span');
      c.style.cssText = 'float: right; opacity: 0.9;';
      c.textContent = czk(rocne ? l.annualCzk : l.monthlyCzk);
      li.appendChild(c);
      seznam.appendChild(li);
    });

    celkem.textContent = czk(rocne ? q.payableAnnualCzk : q.monthlyCzk);
    const popisekObdobi = el('#sum-period-label');
    if (popisekObdobi) popisekObdobi.textContent = rocne ? 'ročně' : 'měsíčně';

    if (uspora) {
      // Sleva „měsíc zdarma" je rozdíl technické a splatné roční ceny; u měsíční
      // platby neplatí, tak ji tam neslibujeme.
      const rozdil = q.annualCzk - q.payableAnnualCzk;
      uspora.hidden = !rocne || rozdil <= 0;
      const castka = uspora.querySelector('strong');
      if (castka) castka.textContent = czk(rozdil);
    }

    if (q.requiresUnderwriting) {
      const li = document.createElement('li');
      li.className = 'calc-note';
      li.textContent = 'Cena je orientační, případ posoudíme individuálně.';
      seznam.appendChild(li);
    }
  }

  // ── přepočet ──────────────────────────────────────────────────────────────
  let cekani = null;
  let poradi = 0;

  function prepocitej() {
    clearTimeout(cekani);
    cekani = setTimeout(async () => {
      // Odpovědi se můžou vrátit v jiném pořadí, než odešly. Bez tohohle by
      // pomalejší starší odpověď přepsala novější a kalkulačka by ukazovala
      // cenu, která neodpovídá zaškrtnutému.
      const moje = ++poradi;
      try {
        const q = await nacenit();
        if (moje !== poradi) return;
        stav.posledni = q;
        vykresliShrnuti(q, null);
        // Krok 2 („předmět pojištění") se řídí vybranými pilíři.
        if (typeof window.updateSubjectBlocks === 'function') window.updateSubjectBlocks();
      } catch (e) {
        if (moje !== poradi) return;
        vykresliShrnuti(null, e.message);
      }
    }, 250);
  }

  // ── události ──────────────────────────────────────────────────────────────
  function pripojUdalosti() {
    const form = el('#calc-form');
    if (!form) return;

    form.addEventListener('change', (ev) => {
      const t = ev.target;

      if (t.name === 'variant' || t.name === 'period') {
        // Zvýraznění dlaždice dělal starý kód kalkulačky; bez něj souhrn tvrdil
        // něco jiného, než co bylo vidět jako vybrané.
        form.querySelectorAll(`input[name="${t.name}"]`).forEach((i) =>
          i.closest('.calc-option')?.classList.toggle('selected', i.checked),
        );
      }
      if (t.name === 'variant') {
        void prepniProdukt(t.value);
        return;
      }
      if (t.name === 'period') {
        const rocne = t.value === 'rocni';
        const bunka = el('#sum-period');
        if (bunka) bunka.textContent = rocne ? 'ročně' : 'měsíčně';
        if (stav.posledni) vykresliShrnuti(stav.posledni, null);
        return;
      }
      if (t.dataset.pillar) {
        const klic = t.dataset.pillar;
        if (t.checked) stav.vybrane.add(klic);
        else stav.vybrane.delete(klic);
        t.closest('.calc-option')?.classList.toggle('selected', t.checked);

        const vstupy = form.querySelector(`.calc-pillar-input[data-for="${klic}"]`);
        if (vstupy) vstupy.hidden = !t.checked;
        // Formulář ukazuje výchozí hodnoty (první typ, 1 kus) — musí je poslat
        // i bez ruční změny, jinak by zaškrtnutí pilíře rovnou hlásilo, že
        // objekty chybí.
        if (t.checked) nactiVstupZFormulare(form, klic);
        else delete stav.vstupy[klic];

        // Odebráním rodiče musí zmizet i jeho doplňky, jinak by se poslaly
        // pilíře, které spolu nejdou sjednat.
        const doplnky = form.querySelector(`.calc-addons[data-parent="${klic}"]`);
        if (doplnky) {
          doplnky.hidden = !t.checked;
          if (!t.checked) {
            doplnky.querySelectorAll('input[data-pillar]').forEach((d) => {
              d.checked = false;
              stav.vybrane.delete(d.dataset.pillar);
              d.closest('.calc-option')?.classList.remove('selected');
            });
          }
        }
        prepocitej();
        return;
      }
      if (t.dataset.typeFor || t.dataset.qtyFor) {
        nactiVstupZFormulare(form, t.dataset.typeFor || t.dataset.qtyFor);
        prepocitej();
        return;
      }
      if (t.dataset.salaryFor) {
        stav.vstupy[t.dataset.salaryFor] = Number(t.value || 0);
        prepocitej();
      }
    });
    form.addEventListener('input', (ev) => {
      if (ev.target.type === 'number') ev.target.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function nactiVstupZFormulare(form, klic) {
    const box = form.querySelector(`.calc-pillar-input[data-for="${klic}"]`);
    if (!box) return;
    const odmena = box.querySelector('[data-salary-for]');
    if (odmena) { stav.vstupy[klic] = Number(odmena.value || 0); return; }
    const typ = box.querySelector('[data-type-for]')?.value;
    const mnozstvi = Number(box.querySelector('[data-qty-for]')?.value || 0);
    stav.vstupy[klic] = typ ? { typeKey: typ, mnozstvi } : null;
  }

  async function prepniProdukt(varianta) {
    // Zruš rozpracované nacenění: běželo by s pilíři starého produktu proti
    // novému, což API odmítne (a v konzoli by na veřejné stránce svítilo 400).
    clearTimeout(cekani);
    poradi += 1;
    stav.produkt = PRODUKTY[varianta] || PRODUKTY.jednotlivec;
    const popisek = el('#sum-variant');
    const prepinac = el(`input[name="variant"][value="${varianta}"]`);
    if (popisek) popisek.textContent = prepinac?.dataset.label || 'Jednotlivec';
    try {
      stav.katalog = await nactiKatalog(stav.produkt);
    } catch (e) {
      vykresliShrnuti(null, e.message);
      return;
    }
    // Povinné pilíře jsou ve smlouvě vždycky; předvybrané doporučujeme.
    stav.vybrane = new Set(
      stav.katalog.pillars.filter((p) => p.mandatory || p.defaultSelected).map((p) => p.key),
    );
    stav.vstupy = {};
    vykresliPilire();
    const form = el('#calc-form');
    if (form) stav.vybrane.forEach((k) => nactiVstupZFormulare(form, k));
    prepocitej();
  }

  // Krok 2 wizardu potřebuje vědět, co je vybrané; jinak by si to musel číst
  // z názvů políček, která už neexistují.
  // ── našeptávač adresy ─────────────────────────────────────────────────────

  /**
   * Našeptávač adresy nad `/address/autocomplete` (Roman 29. 8. 2026: „čekal
   * jsem našeptávač, jako v kalkulačce v Portálu").
   *
   * Je to týž veřejný endpoint a týž zdroj (SmartForm), jaký používá portál
   * i kalkulačky frenkee, takže se adresy nemůžou rozejít. Odpověď nese celou
   * strukturu, takže se vyplní ulice, číslo, obec i PSČ najednou a nikdo je
   * nemusí opisovat.
   *
   * Když upstream mlčí nebo spadne, seznam se prostě neukáže a adresa se
   * vyplní ručně. Sjednání to nesmí blokovat.
   */
  function pripojNaseptavac() {
    const pole = document.querySelector('[name="street"]');
    const seznam = el('#adr-navrhy');
    if (!pole || !seznam) return;

    let cekani = null;
    let porad = 0;
    let navrhy = [];
    // Vyplnění pole ulice vyvolá `input`, což by spustilo nový dotaz a seznam
    // by se hned po výběru otevřel znovu. Po dobu vyplňování ho umlčíme.
    let vyplnuji = false;

    const zavri = () => {
      seznam.hidden = true;
      seznam.innerHTML = '';
    };

    const vyplnAdresu = (a) => {
      const set = (jmeno, hodnota) => {
        const e = document.querySelector(`[name="${jmeno}"]`);
        if (!e || !hodnota) return;
        e.value = hodnota;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true }));
      };
      // `street` bez čísla; číslo popisné má vlastní pole, jinak by se
      // v návrhu smlouvy objevilo dvakrát.
      set('street', a.street || a.streetAndNumber || '');
      set('houseNum', a.number || '');
      set('city', a.city || a.cityExtended || '');
      set('zip', (a.zip || '').replace(/\s+/g, ''));
      zavri();
    };

    const vyplnAdresuBezSpusteni = (a) => {
      vyplnuji = true;
      try {
        vyplnAdresu(a);
      } finally {
        // Až po doběhnutí událostí, které vyplnění vyvolalo.
        setTimeout(() => {
          vyplnuji = false;
        }, 0);
      }
    };

    const vykresli = () => {
      seznam.innerHTML = '';
      if (!navrhy.length) return zavri();
      navrhy.slice(0, 8).forEach((a) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.textContent = a.streetAndNumber || a.street || '';
        const mesto = document.createElement('span');
        mesto.textContent = [a.zip, a.city].filter(Boolean).join(' ');
        li.appendChild(mesto);
        // `mousedown`, ne `click`: `blur` pole by seznam zavřel dřív, než by
        // klik stihl dojít, a výběr by nešel provést myší.
        li.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          vyplnAdresuBezSpusteni(a);
        });
        seznam.appendChild(li);
      });
      seznam.hidden = false;
    };

    pole.addEventListener('input', () => {
      if (vyplnuji) return;
      clearTimeout(cekani);
      const dotaz = pole.value.trim();
      if (dotaz.length < 3) return zavri();
      const moje = ++porad;
      cekani = setTimeout(async () => {
        try {
          const res = await fetch(
            `${API}/address/autocomplete?query=${encodeURIComponent(dotaz)}`,
            { headers: { Accept: 'application/json' } },
          );
          if (!res.ok) return zavri();
          const data = await res.json();
          // Odpovědi se můžou vrátit v jiném pořadí, než odešly; starší
          // výsledek nesmí přepsat novější.
          if (moje !== porad) return;
          navrhy = Array.isArray(data) ? data : [];
          vykresli();
        } catch {
          zavri();
        }
      }, 250);
    });

    pole.addEventListener('blur', () => setTimeout(zavri, 120));
    pole.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') zavri();
    });
  }

  // ── dokumenty k pojištění ─────────────────────────────────────────────────

  const kb = (b) => `${Math.round(b / 1024)} kB`;

  /**
   * Předsmluvní dokumenty v rekapitulaci (Roman 29. 8. 2026).
   *
   * Seznam i obsah dává backend — jsou to tytéž oficiální soubory, které pak
   * chodí jako příloha návrhu, takže se náhled nemůže rozejít s tím, co klient
   * dostane. Zobrazuje se v `<iframe>`, ne ke stažení.
   *
   * Načítá se až při prvním zobrazení rekapitulace a jen jednou za produkt —
   * klient se mezi kroky vrací a stahovat seznam pokaždé je zbytečné.
   */
  let dokumentyProProdukt = null;

  async function nactiDokumenty() {
    const box = el('#doc-list');
    if (!box || !stav.produkt || dokumentyProProdukt === stav.produkt) return;
    dokumentyProProdukt = stav.produkt;
    box.innerHTML = '<p class="doc-hint">Načítáme dokumenty…</p>';
    try {
      const res = await fetch(
        `${API}/public/v1/products/${encodeURIComponent(stav.produkt)}/documents?tenant=${TENANT}`,
        { headers: { Accept: 'application/json' } },
      );
      if (!res.ok) throw new Error('nedostupné');
      const data = await res.json();
      vykresliDokumenty(data.documents || []);
    } catch {
      dokumentyProProdukt = null; // ať to jde zkusit znovu
      box.innerHTML =
        '<p class="doc-hint">Dokumenty se teď nepodařilo načíst. Pošleme vám je e-mailem spolu s návrhem smlouvy.</p>';
    }
  }

  function vykresliDokumenty(seznam) {
    const box = el('#doc-list');
    if (!box) return;
    box.innerHTML = '';
    if (!seznam.length) {
      box.innerHTML = '<p class="doc-hint">Dokumenty vám pošleme e-mailem spolu s návrhem smlouvy.</p>';
      return;
    }
    seznam.forEach((d) => {
      const radek = document.createElement('div');
      radek.className = 'doc-item';
      const popis = document.createElement('div');
      const nazev = document.createElement('strong');
      nazev.textContent = d.title;
      popis.appendChild(nazev);
      if (d.sizeBytes) {
        const velikost = document.createElement('span');
        velikost.textContent = ` · PDF, ${kb(d.sizeBytes)}`;
        popis.appendChild(velikost);
      }
      radek.appendChild(popis);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = 'Zobrazit';
      btn.addEventListener('click', () => zobrazDokument(d));
      radek.appendChild(btn);
      box.appendChild(radek);
    });
  }

  function zobrazDokument(d) {
    const box = el('#doc-preview');
    const ramec = el('#doc-preview-frame');
    const titulek = el('#doc-preview-title');
    if (!box || !ramec) return;
    if (titulek) titulek.textContent = d.title;
    ramec.src =
      `${API}/public/v1/products/${encodeURIComponent(stav.produkt)}/documents/` +
      `${encodeURIComponent(d.key)}?tenant=${TENANT}`;
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function pripojDokumenty() {
    el('#doc-preview-close')?.addEventListener('click', () => {
      const box = el('#doc-preview');
      const ramec = el('#doc-preview-frame');
      if (ramec) ramec.src = 'about:blank';
      if (box) box.hidden = true;
    });
    // Rekapitulace je krok 3; seznam načítáme, až se na něj klient dostane.
    document.querySelectorAll('[data-step-next="3"]').forEach((b) =>
      b.addEventListener('click', () => void nactiDokumenty()),
    );
  }

  // ── sjednání ──────────────────────────────────────────────────────────────

  const pole = (jmeno) => document.querySelector(`[name="${jmeno}"]`)?.value?.trim() || '';
  const zaskrtnuto = (jmeno) => !!document.querySelector(`[name="${jmeno}"]`)?.checked;

  /**
   * Odeslání žádosti o sjednání. Vzniká KONCEPT smlouvy, ne platné pojištění —
   * proto stránka po odeslání nesmí tvrdit, že krytí běží, ani vybírat platbu.
   *
   * Cenu si backend počítá znovu; `expectedMonthlyCzk` posíláme jen jako
   * kontrolu, že se mezi nacenením a odesláním nerozešel ceník. Když se
   * rozejde, vrátí 409 a klient musí novou cenu vidět, ne ji dostat podstrčenou.
   */
  async function odesliSjednani() {
    const jmeno = [pole('firstName'), pole('lastName')].filter(Boolean).join(' ');
    const telo = {
      product: stav.produkt,
      segment: 'FO',
      pillars: [...stav.vybrane],
      parameters: sestavParametry(),
      paymentFrequency:
        document.querySelector('input[name="period"]:checked')?.value === 'rocni'
          ? 'annual'
          : 'monthly',
      client: {
        name: jmeno,
        email: pole('email'),
        phone: pole('phone'),
        birthNumber: pole('rc') || undefined,
        identityDocumentNumber: pole('dokladCislo') || undefined,
        street: [pole('street'), pole('houseNum')].filter(Boolean).join(' ') || undefined,
        city: pole('city') || undefined,
        postalCode: pole('zip') || undefined,
      },
      consents: {
        recap: zaskrtnuto('consent-recap'),
        truthfulness: zaskrtnuto('consent-truthfulness'),
        terms: zaskrtnuto('consent-terms'),
        dataProcessing: zaskrtnuto('consent-data'),
        marketing: zaskrtnuto('consent-marketing'),
      },
      ...(stav.posledni ? { expectedMonthlyCzk: stav.posledni.monthlyCzk } : {}),
    };

    const res = await fetch(`${API}/public/v1/contracts?tenant=${TENANT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(telo),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.message) || 'Žádost se nepodařilo odeslat.');
    }
    return data;
  }

  /**
   * Odeslání visí na tlačítku kroku 3 v ZACHYTÁVACÍ fázi, aby proběhlo dřív,
   * než `script.js` překlopí stepper na krok 4. Bez toho by se poslední krok
   * ukázal i tehdy, když by žádost spadla, a klient by odešel s dojmem, že
   * pojištění zařídil.
   */
  /**
   * Cizinec bez rodného čísla uvede číslo pasu nebo povolení k pobytu.
   * Skryté pole musí být `disabled`, jinak by ho prohlížeč pořád validoval
   * jako povinné a odeslání by se zaseklo na políčku, které není vidět.
   */
  function pripojIdentifikaci() {
    const prepinac = el('#bez-rc');
    const rc = el('[name="rc"]');
    const doklad = el('[name="dokladCislo"]');
    if (!prepinac || !rc || !doklad) return;
    const prepni = () => {
      const cizinec = prepinac.checked;
      rc.required = !cizinec;
      rc.disabled = cizinec;
      if (cizinec) rc.value = '';
      doklad.closest('.form-group')?.toggleAttribute('hidden', !cizinec);
      doklad.required = cizinec;
      doklad.disabled = !cizinec;
      if (!cizinec) doklad.value = '';
    };
    prepinac.addEventListener('change', prepni);
    prepni();
  }

  function pripojSjednani() {
    const btn = el('#btn-sjednat');
    if (!btn) return;
    const chyba = el('#sjednani-chyba');
    let hotovo = false;

    btn.addEventListener(
      'click',
      (ev) => {
        if (hotovo) return; // druhý průchod už jen pustí navigaci dál
        ev.preventDefault();
        ev.stopImmediatePropagation();

        // Nevyplněné povinné pole bývá v kroku 2, jehož panel je teď skrytý —
        // prohlížeč na skrytý prvek bublinu ukázat neumí, takže samotné
        // `reportValidity()` by tlačítko umlčelo a člověk by nevěděl proč.
        // Proto na to pole skočíme zpátky sami.
        const form = el('#contract-form');
        const spatne = form
          ? [...form.querySelectorAll('input, select, textarea')].find((x) => !x.checkValidity())
          : null;
        if (spatne) {
          const krok = spatne.closest('[data-step-panel]')?.dataset.stepPanel;
          if (krok) el(`[data-step-back="${krok}"]`)?.click();
          setTimeout(() => {
            spatne.focus();
            spatne.reportValidity();
          }, 350);
          if (chyba) {
            chyba.textContent = 'Zkontrolujte prosím vyplněné údaje — něco ještě chybí.';
            chyba.hidden = false;
          }
          return;
        }
        if (chyba) chyba.hidden = true;

        const puvodni = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Odesíláme…';

        odesliSjednani()
          .then((data) => {
            // Koncept číslo smlouvy ještě nemá — přiděluje se až při aktivaci.
            // Ukázat místo něj interní UUID by klientovi nepomohlo a vypadalo
            // by to jako číslo smlouvy, které žádné není. Radši řádek skrýt.
            const cislo = data.contractNumber || null;
            document.querySelectorAll('[data-echo="contractNo"]').forEach((x) => {
              if (cislo) x.textContent = cislo;
              else x.closest('.recap-row')?.setAttribute('hidden', '');
            });
            // Nesmíme tvrdit, že e-mail dorazil, když backend hlásí opak —
            // člověk by pak marně čekal na platební údaje ve schránce.
            const odesel = data.proposalSent !== false;
            el('[data-stav="mail-odesel"]')?.toggleAttribute('hidden', !odesel);
            el('[data-stav="mail-neodesel"]')?.toggleAttribute('hidden', odesel);
            // Potvrzení odkrývá JEN úspěšná odpověď; jinak zůstane viset karta
            // „nepodařilo se odeslat". Bez toho by rozbité odesílání zase
            // ohlásilo úspěch, který nenastal.
            el('[data-state="odeslano"]')?.removeAttribute('hidden');
            el('[data-state="neodeslano"]')?.setAttribute('hidden', '');
            hotovo = true;
            // Tlačítko je po dobu odesílání `disabled` a na zakázaný prvek se
            // klik nedoručí — bez tohohle by se krok 4 nikdy neukázal.
            btn.disabled = false;
            btn.textContent = puvodni;
            btn.click(); // teď už projde na krok 4
          })
          .catch((e) => {
            if (chyba) {
              chyba.textContent = e.message;
              chyba.hidden = false;
            }
          })
          .finally(() => {
            // Po úspěchu je tlačítko obnovené už výš, aby se dal doručit klik.
            if (!hotovo) {
              btn.disabled = false;
              btn.textContent = puvodni;
            }
          });
      },
      true,
    );
  }

  window.LEXIA_CALC = { selected: () => [...stav.vybrane], quote: () => stav.posledni };

  /**
   * Varianta z adresy (`?varianta=poradce`). Odsud na kalkulačku míří microsity
   * /reality a /financniporadci, které prodávají jiný produkt než výchozí
   * jednotlivce. Neznámou hodnotu ignorujeme — jinak by stačil překlep v odkazu
   * a katalog by se načetl pro neexistující produkt.
   *
   * Týž parametr předvolí přepínač i ve `script.js` (starší deep-link z karet
   * na úvodní stránce), ale jen pro jednotlivce a domácnost. Nezdvojí se to:
   * `script.js` běží dřív, než katalogová kalkulačka připojí posluchače, takže
   * jeho `change` nikdo nechytí. Produkt si tak řídí jedno místo — tohle.
   */
  function variantaZAdresy() {
    const v = new URLSearchParams(window.location.search).get('varianta');
    return v && Object.prototype.hasOwnProperty.call(PRODUKTY, v) ? v : null;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!el('#calc-pillars')) return;
    pripojUdalosti();
    pripojSjednani();
    pripojIdentifikaci();
    pripojDokumenty();
    pripojNaseptavac();
    const zAdresy = variantaZAdresy();
    if (zAdresy) {
      const prepinac = el(`input[name="variant"][value="${zAdresy}"]`);
      if (prepinac) {
        prepinac.checked = true;
        document
          .querySelectorAll('input[name="variant"]')
          .forEach((i) => i.closest('.calc-option')?.classList.toggle('selected', i.checked));
      }
    }
    const varianta = zAdresy || el('input[name="variant"]:checked')?.value || 'jednotlivec';
    void prepniProdukt(varianta);
  });
})();
