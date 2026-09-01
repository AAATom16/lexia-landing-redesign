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
    // Roman 1. 9. 2026 (LEX-24) — produkt dokončil a aktivoval v konfigurátoru.
    ridic: 'pojisteni_pravni_ochrany_ridice',
  };

  /**
   * Odškrtnutá podmínka pojistitelnosti (Roman 1. 9. 2026, LEX-26): pojištění
   * NEJDE sjednat online. Dřív se pilíř poslal na individuální úpis a klient
   * pokračoval s cenou „potvrdíme individuálně" — Roman to zrušil: bez
   * splněných podmínek se má klient ozvat, ne sjednávat.
   */
  const PODMINKA_BLOKUJE =
    'Ke sjednání pojištění je nutné individuální posouzení. Kontaktujte nás, prosím. ' +
    'Pojištění není možné sjednat online.';

  const czk = (n) => `${Math.round(n).toLocaleString('cs-CZ')} Kč`;
  const el = (sel, root) => (root || document).querySelector(sel);

  const stav = {
    produkt: null,
    katalog: null,
    vybrane: new Set(),
    /**
     * klíč pilíře → pole instancí. Objektový pilíř: `{ typeKey, mnozstvi,
     * ulice, obec, psc, addrSameAsHolder, custom: {} }` — jedna instance je
     * jeden objekt (u parcel `mnozstvi` = výměra v m²). Manažerský pilíř:
     * `{ grossMonthlyCzk, functionTitle, organizationName, insuredName }`.
     * Tytéž klíče, jaké k instanci ukládá portál, takže návrh smlouvy tiskne
     * z obou cest totéž.
     */
    vstupy: {},
    /** klíč pilíře → texty podmínek, které klient ODŠKRTL (tedy nesplňuje) */
    nesplnene: {},
    /** rozpracovaný koncept: `{ contractId, previewToken }` */
    koncept: null,
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
  /** Adresa pojistníka z kroku 2 — pro objekty se stejnou adresou. */
  function adresaPojistnika() {
    const v = (jmeno) => document.querySelector(`[name="${jmeno}"]`)?.value?.trim() || '';
    return { ulice: v('street'), obec: v('city'), psc: v('zip') };
  }

  /**
   * Detaily instance objektu, jak je ukládá portál (`PropertyInstance`).
   * Objekt se „stejnou adresou" nese adresu pojistníka opsanou, ne jen
   * příznak — návrh smlouvy tiskne to, co je v instanci.
   */
  function detailyObjektu(inst) {
    const stejna = inst.addrSameAsHolder === true;
    const adr = stejna ? adresaPojistnika() : inst;
    const out = { typeKey: inst.typeKey };
    if (adr.ulice) out.ulice = adr.ulice;
    if (adr.obec) out.obec = adr.obec;
    if (adr.psc) out.psc = adr.psc;
    if (stejna) out.addrSameAsHolder = true;
    const custom = Object.fromEntries(
      Object.entries(inst.custom || {}).filter(([, v]) => String(v || '').trim() !== ''),
    );
    if (Object.keys(custom).length) out.custom = custom;
    return out;
  }

  function sestavParametry() {
    const parameters = {};
    for (const [klic, hodnota] of Object.entries(stav.vstupy)) {
      const pilir = stav.katalog.pillars.find((p) => p.key === klic);
      if (!pilir || !pilir.input || !stav.vybrane.has(klic)) continue;
      if (pilir.input.kind === 'objects') {
        // Engine počítá POLOŽKY seznamu: jedna instance = jeden objekt. U výměry
        // nese každá položka svou plochu v `areaParam`, takže dvě parcely
        // různého druhu jsou dvě položky s vlastní výměrou. Detaily (adresa,
        // číslo bytu…) jedou v téže položce — tak je ukládá portál a tak je
        // čte návrh smlouvy (LEX-30/34).
        const radky = (Array.isArray(hodnota) ? hodnota : []).filter(
          (r) => r.typeKey && (pilir.input.unit !== 'sqm' || r.mnozstvi > 0),
        );
        if (!radky.length) continue;
        parameters[pilir.input.param] = radky.map((r) =>
          pilir.input.unit === 'sqm'
            ? { ...detailyObjektu(r), [pilir.input.areaParam || 'area_m2']: r.mnozstvi }
            : detailyObjektu(r),
        );
      } else if (pilir.input.kind === 'salary') {
        // Odměna musí být UVNITŘ položky funkce. Engine dává seznamu funkcí
        // přednost před samostatnou hodnotou, a položka bez odměny spadne na
        // minimální pojistné — pak je jedno, co člověk zadá, vyjde pořád
        // minimum. Klíč je `grossMonthlyCzk`, tedy odměna MĚSÍČNÍ.
        //
        // Posílá se JEN seznam. Samostatná hodnota by u víc funkcí stejně
        // prohrála a nesla by jen odměnu té první, což by v požadavku vypadalo
        // jako rozpor sama se sebou.
        const funkce = funkceManazera(pilir).filter((f) => Number(f.grossMonthlyCzk) > 0);
        if (funkce.length) {
          parameters[pilir.input.itemsParam] = funkce.map((f) => {
            const out = { grossMonthlyCzk: Number(f.grossMonthlyCzk) };
            (pilir.input.itemDetails || []).forEach((d) => {
              if (String(f[d.key] || '').trim()) out[d.key] = String(f[d.key]).trim();
            });
            return out;
          });
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
        unmetConditions: stav.nesplnene,
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
        // Roman 29. 8. 2026 — doplňky se rozbalují, místo aby v dlaždici
        // visely všechny naráz (u bydlení jsou tři a blok byl přes celou
        // obrazovku). Titulek je tlačítko; tělo s dlaždicemi je zabalené,
        // dokud není některý doplněk vybraný.
        //
        // Text tlačítka se mění za běhu (počet vybraných), takže nese
        // `aria-controls` — editor textů prvky s ním přeskakuje a uložená
        // úprava se nemá k čemu připnout ani co rozbít (cms/extract.js,
        // DYNAMIC_SELECTOR).
        const vybranychDoplnku = doplnky.filter((d) => stav.vybrane.has(d.key)).length;
        const teloId = 'addons-' + p.key;
        const nadpis = document.createElement('button');
        nadpis.type = 'button';
        nadpis.className = 'calc-addons-title calc-addons-toggle';
        nadpis.dataset.addonsToggle = p.key;
        nadpis.setAttribute('aria-controls', teloId);
        nadpis.setAttribute('aria-expanded', String(vybranychDoplnku > 0));
        wrap.appendChild(nadpis);

        const telo = document.createElement('div');
        telo.className = 'calc-addons-body';
        telo.id = teloId;
        telo.hidden = vybranychDoplnku === 0;
        doplnky.forEach((d) => telo.appendChild(dlazdice(d, true)));
        wrap.appendChild(telo);
        popisToggle(nadpis, doplnky, vybranychDoplnku, !telo.hidden);
        skupina.appendChild(wrap);
      }
      box.appendChild(skupina);
    }
  }

  /**
   * Dlaždice pilíře.
   *
   * Rám je `<div>`, zaškrtávátko sedí ve vnitřním `<label class="calc-pillar-head">`
   * a vstupy pilíře visí vedle něj, ne uvnitř. Dokud byla dlaždice celá jeden
   * `<label>`, patřil k zaškrtávátku i každý select, popisek a mezera uvnitř,
   * takže klik do prázdna ve vyplňovacím bloku pilíř odškrtl i s vyplněnými
   * údaji — a každý nový prvek se musel ručně vyvazovat přes stopPropagation.
   * Interní kalkulačka to má stejně: `<label>` obaluje jen hlavičku.
   */
  /**
   * Popisek rozbalovátka doplňků. Počet vybraných je vidět i v zabaleném
   * stavu, aby cena nikdy nezahrnovala něco, o čem dlaždice mlčí.
   */
  function popisToggle(btn, doplnky, vybranych, rozbaleno) {
    // Roman 1. 9. 2026 (LEX-27): samotné „(3)" nikoho nezláká — v zabaleném
    // stavu musí být vidět aspoň názvy, ať má klient důvod se podívat.
    const nazvy = doplnky.map((d) => d.name).join(', ');
    const zaklad =
      doplnky.length === 1
        ? 'Doplněk k tomuto pilíři: ' + nazvy
        : 'Doplňky k tomuto pilíři (' + doplnky.length + '): ' + nazvy;
    const stavova = vybranych > 0 ? ' · vybráno ' + vybranych : '';
    btn.textContent = zaklad + stavova + (rozbaleno ? ' ▴' : ' ▾');
    btn.setAttribute('aria-expanded', String(rozbaleno));
  }

  function prepniDoplnky(klic) {
    const btn = document.querySelector('[data-addons-toggle="' + klic + '"]');
    const telo = document.getElementById('addons-' + klic);
    if (!btn || !telo) return;
    telo.hidden = !telo.hidden;
    const doplnky = (stav.katalog?.pillars || []).filter((x) => x.requiresPillarKey === klic);
    const vybranych = doplnky.filter((d) => stav.vybrane.has(d.key)).length;
    popisToggle(btn, doplnky, vybranych, !telo.hidden);
    // Zabalení schová i pole vybraného doplňku — musí se vypnout, jinak by
    // skryté povinné pole neviditelně zastavilo „Pokračovat".
    synchronizujSkryta();
  }

  function dlazdice(p, jeDoplnek) {
    const label = document.createElement('div');
    label.className = 'calc-option' + (stav.vybrane.has(p.key) ? ' selected' : '');
    if (jeDoplnek) label.classList.add('is-addon');

    const hlavicka = document.createElement('label');
    hlavicka.className = 'calc-pillar-head';

    const vstup = document.createElement('input');
    vstup.type = 'checkbox';
    vstup.dataset.pillar = p.key;
    vstup.checked = stav.vybrane.has(p.key);
    if (p.mandatory) {
      vstup.checked = true;
      vstup.disabled = true;
      // Kurzor patří hlavičce, ne rámu: klikacím prvkem je od přestavby ona.
      hlavicka.style.cursor = 'not-allowed';
    }
    hlavicka.appendChild(vstup);

    const nazev = document.createElement('strong');
    nazev.textContent = p.name;
    hlavicka.appendChild(nazev);

    const cena = document.createElement('span');
    cena.className = 'px-label';
    // U proměnlivé ceny žádné číslo neexistuje — ukázat nejnižší variantu by
    // znamenalo slíbit cenu, která po zadání objektů neplatí.
    cena.textContent =
      p.priceKind === 'fixed' && p.monthlyCzk != null
        ? `${czk(p.monthlyCzk)}/měsíc`
        : p.priceLabel;
    hlavicka.appendChild(cena);

    if (p.mandatory) {
      const znak = document.createElement('span');
      znak.className = 'calc-vzdy';
      // Roman 29. 8. 2026 — „POVINNÝ" verzálkami působilo jako varování; jde
      // přitom o samozřejmost, ne o podmínku, kterou musí klient řešit.
      znak.textContent = 'sjednává se vždy';
      hlavicka.appendChild(znak);
    }

    if (maDetail(p)) hlavicka.appendChild(odkazPodrobnosti(p));
    label.appendChild(hlavicka);
    // Podmínky se ukazují i u pilíře, který jinak nemá co vyplňovat.
    if (p.input || (p.conditions || []).length) label.appendChild(vstupyPilire(p));
    return label;
  }

  /** Má pilíř co ukázat v Podrobnostech? Bez obsahu odkaz nevznikne. */
  function maDetail(p) {
    return Boolean(
      (p.coverage || []).length || (p.conditions || []).length || p.info || p.insuredPersons,
    );
  }

  const ROZSAH = { europe: 'Evropa', world: 'celý svět', cz: 'Česko' };

  /**
   * Odkaz „Podrobnosti" u dlaždice.
   *
   * Stejný prvek i stejné jméno jako v portálu: poradce klikne na „Podrobnosti"
   * a klient taky, takže si o tomtéž otvírají totéž. Předchůdcem byla ikona „i"
   * ukotvená absolutně do rohu dlaždice — nesdílela účaří s ničím kolem a při
   * jednosloupcové mřížce skončila na opačném konci řádku než název, ke kterému
   * patřila.
   *
   * `type="button"`, aby odkaz neodesílal formulář. Sedí uvnitř hlavičkového
   * `<label>`, takže klik hlídáme dvakrát: tlačítko je sice interaktivní obsah
   * a aktivace popisku se podle specifikace nespustí, ale spoléhat se na to
   * u prvku, který má JEDINOU úlohu neodškrtnout pilíř, nestojí za to. Portál
   * to dělá stejně.
   */
  function odkazPodrobnosti(p) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calc-detail';
    btn.textContent = 'Podrobnosti';
    btn.setAttribute('aria-label', `Podrobnosti k pilíři ${p.name}`);
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      otevriInfo(p);
    });
    return btn;
  }

  /**
   * Odstavcová rubrika v okně Podrobnosti. Prázdnou hodnotu vynechá i s
   * nadpisem — katalog posílá `null`, ne prázdný řetězec, právě proto, aby
   * nadpis nezůstal viset nad ničím.
   */
  function rubrika(dlg, nadpis, text) {
    if (!text) return;
    const h = document.createElement('strong');
    h.className = 'calc-info-rubrika';
    h.textContent = nadpis;
    dlg.appendChild(h);
    const p = document.createElement('p');
    p.className = 'calc-info-text';
    p.textContent = text;
    dlg.appendChild(p);
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
        'Pokud některá z podmínek neplatí, pojištění online sjednat nelze. Ozvěte se nám, posoudíme případ individuálně.';
      box.appendChild(pozn);
      dlg.appendChild(box);
    }

    // Rubriky, které v Podrobnostech čte poradce v portálu. Katalog je publikuje
    // od 31. 8. 2026 (`info` = „Příklad využití", `insuredPersons`); do té doby
    // tu žádný souvislý popis nebyl, protože `description` je u pilířů prázdný,
    // a okno vystačilo s tabulkou limitů — poradce a klient tak nad stejným
    // pilířem četli jiný text. Pořadí ctí Romanovo zadání z 29. 8.: podmínky
    // pojistitelnosti zůstávají první, ostatní se řadí za ně.
    rubrika(dlg, 'K čemu pilíř je', p.info);
    rubrika(dlg, 'Pojištěné osoby', p.insuredPersons);

    const nadpisKryti = document.createElement('strong');
    nadpisKryti.className = 'calc-info-rubrika';
    nadpisKryti.textContent = 'Co pilíř kryje';
    if (p.coverage.length) dlg.appendChild(nadpisKryti);

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

  /**
   * Podmínky pojistitelnosti k odsouhlasení (Roman 29. 8. 2026).
   *
   * Začínají zaškrtnuté, klient je ODŠKRTÁVÁ — stejně jako operátor v interní
   * kalkulačce. Odškrtnutá podmínka pošle pilíř na individuální úpis a jeho
   * cena spadne na nulu; bez toho by si klient s domem nad 500 m² koupil
   * standardní sazbu, která na jeho případ nesedí.
   */
  /**
   * Podmínky, které se u pilíře ukazují: jen ty, jejichž typ objektu je mezi
   * zadanými instancemi (Roman 1. 9. 2026, LEX-26: „u domu nemá co dělat
   * podmínka o podlahové ploše bytu"). Podmínka bez vazby na typ platí vždy.
   */
  function platnePodminky(p) {
    const vsechny = Array.isArray(p.conditionsByType) && p.conditionsByType.length
      ? p.conditionsByType
      : (p.conditions || []).map((text) => ({ text, objectTypeKey: null }));
    if (!p.input || p.input.kind !== 'objects') return vsechny.map((c) => c.text);
    const typy = new Set(instanceObjektu(p).map((i) => i.typeKey).filter(Boolean));
    return vsechny
      .filter((c) => !c.objectTypeKey || typy.has(c.objectTypeKey))
      .map((c) => c.text);
  }

  function podminkyPilire(p) {
    const box = document.createElement('div');
    box.className = 'calc-podminky';
    box.dataset.podminkyFor = p.key;
    const h = document.createElement('p');
    h.className = 'calc-podminky-title';
    h.textContent = 'Potvrďte prosím, že platí:';
    box.appendChild(h);
    const texty = platnePodminky(p);
    // Podmínka, která zmizela se svým typem objektu, nesmí dál blokovat.
    const zbyle = (stav.nesplnene[p.key] || []).filter((t) => texty.includes(t));
    if (zbyle.length) stav.nesplnene[p.key] = zbyle;
    else delete stav.nesplnene[p.key];
    texty.forEach((text, i) => {
      const l = document.createElement('label');
      l.className = 'calc-podminka';
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = !zbyle.includes(text);
      c.dataset.conditionFor = p.key;
      c.dataset.conditionText = text;
      c.id = `podm-${p.key}-${i}`;
      // Odškrtnutí zastaví krok stejnou cestou jako prázdné povinné pole.
      c.setCustomValidity(c.checked ? '' : PODMINKA_BLOKUJE);
      l.appendChild(c);
      const s = document.createElement('span');
      s.textContent = text;
      l.appendChild(s);
      box.appendChild(l);
    });
    const chyba = document.createElement('p');
    chyba.className = 'calc-podminky-chyba';
    chyba.setAttribute('role', 'alert');
    chyba.hidden = zbyle.length === 0;
    chyba.append(PODMINKA_BLOKUJE + ' ');
    const odkaz = document.createElement('a');
    odkaz.href = 'kontakt.html';
    odkaz.textContent = 'Kontaktovat Lexii';
    chyba.appendChild(odkaz);
    box.appendChild(chyba);
    if (!texty.length) box.hidden = true;
    return box;
  }

  /** Překreslí podmínky pilíře (po změně typu objektu) na místě. */
  function prekresliPodminky(p) {
    const stare = document.querySelector(`.calc-podminky[data-podminky-for="${p.key}"]`);
    if (!stare) return;
    stare.replaceWith(podminkyPilire(p));
  }

  function vstupyPilire(p) {
    const box = document.createElement('div');
    box.className = 'calc-pillar-input';
    box.hidden = !stav.vybrane.has(p.key);
    box.dataset.for = p.key;
    // Pilíř může mít podmínky a přitom nic k vyplnění.
    if (!p.input) {
      if ((p.conditions || []).length) box.appendChild(podminkyPilire(p));
      return box;
    }

    if (p.input.kind === 'salary') {
      // MĚSÍČNÍ, ne roční: engine počítá procento z hrubé měsíční odměny.
      // Roční hodnota by pojistné nadsadila dvanáctkrát. Roman to 31. 8. 2026
      // potvrdil.
      box.appendChild(
        popisek(
          'Hrubá měsíční odměna za výkon funkce (Kč). Vykonáváte-li funkcí víc, ' +
            'přidejte každou zvlášť.',
        ),
      );
      const seznam = document.createElement('div');
      seznam.className = 'calc-object-list';
      seznam.dataset.listFor = p.key;
      box.appendChild(seznam);
      prekresliFunkce(p, seznam);

      const pridat = document.createElement('button');
      pridat.type = 'button';
      pridat.className = 'btn btn-outline btn-sm calc-pridat';
      pridat.dataset.addFor = p.key;
      pridat.textContent = '+ Přidat funkci';
      box.appendChild(pridat);
      if ((p.conditions || []).length) box.appendChild(podminkyPilire(p));
      return box;
    }

    const jeVymera = p.input.unit === 'sqm';
    // Roman 1. 9. 2026 (LEX-26): jako v portálu — každý objekt zvlášť, detaily
    // až v dalším kroku. Dřív nesl pilíř jeden řádek s typem a počtem, takže
    // dům a byt dohromady zadat nešlo.
    box.appendChild(
      popisek(
        jeVymera
          ? 'Typ pozemku a výměra v m². Každou parcelu přidejte zvlášť.'
          : 'Typ objektu. Každý pojišťovaný objekt přidejte zvlášť, druhý a další je cenově zvýhodněný. Adresu a další údaje doplníte v dalším kroku.',
      ),
    );

    const seznam = document.createElement('div');
    seznam.className = 'calc-object-list';
    seznam.dataset.listFor = p.key;
    box.appendChild(seznam);
    prekresliInstance(p, seznam);

    const pridat = document.createElement('button');
    pridat.type = 'button';
    pridat.className = 'btn btn-outline btn-sm calc-pridat';
    pridat.dataset.addFor = p.key;
    pridat.textContent = jeVymera ? '+ Přidat parcelu' : '+ Přidat další objekt';
    box.appendChild(pridat);
    // Podmínky až pod objekty: které platí, se řídí zadanými typy.
    if ((p.conditions || []).length) box.appendChild(podminkyPilire(p));
    return box;
  }

  /**
   * Instance objektů pilíře. Do 31. 8. 2026 měl pilíř jediný řádek a stav byl
   * plochý objekt `{ typeKey, mnozstvi }`, takže všechny objekty musely být
   * téhož druhu — a u výměrových pilířů se druhá parcela nedala zadat vůbec,
   * protože číslo znamenalo výměru té jediné. Portál drží seznam instancí,
   * kde má každá parcela svůj druh i svou výměru; tohle je totéž.
   */
  function instanceObjektu(p) {
    const v = stav.vstupy[p.key];
    if (Array.isArray(v) && v.length) return v;
    return [vychoziInstance(p, true)];
  }

  /**
   * Nová instance objektu. Roman 1. 9. 2026: první objekt HLAVNÍHO pilíře
   * (typicky bydlení) má „adresa stejná jako pojistník" rovnou zaškrtnutou —
   * je to nejčastější případ a klient adresu nepřepisuje. U doplňků
   * (pronajímaná nemovitost, výstavba, parcela) se nezaškrtává: tam jde
   * o jinou nemovitost, než ve které pojistník bydlí.
   */
  function vychoziInstance(p, prvni) {
    return {
      typeKey: (p.input.types || [])[0]?.key || '',
      mnozstvi: p.input.unit === 'sqm' ? 1000 : 1,
      custom: {},
      ...(prvni && !p.requiresPillarKey ? { addrSameAsHolder: true } : {}),
    };
  }

  function prekresliInstance(p, seznam) {
    const box = seznam || document.querySelector(`.calc-object-list[data-list-for="${p.key}"]`);
    if (!box) return;
    box.innerHTML = '';
    const radky = instanceObjektu(p);
    radky.forEach((inst, i) => box.appendChild(radekObjektu(p, inst, i, radky.length)));
  }

  /**
   * Manažerské funkce. Roman 31. 8. 2026: „Každá funkce má vlastní odměnu
   * i vlastní minimum 399 Kč a sčítají se." Dosud šlo zadat jedinou odměnu,
   * takže klient se dvěma funkcemi dostal na webu nižší cenu, než mu pak
   * spočítal poradce. Funkce je objekt jako v portálu: odměna + popis funkce,
   * instituce a pojištěná osoba (doplní se v kroku 2).
   */
  function funkceManazera(p) {
    const v = stav.vstupy[p.key];
    if (Array.isArray(v) && v.length) {
      return v.map((f) => (typeof f === 'object' && f ? f : { grossMonthlyCzk: Number(f) || 0 }));
    }
    return [{ grossMonthlyCzk: 0 }];
  }

  function prekresliFunkce(p, seznam) {
    const box = seznam || document.querySelector(`.calc-object-list[data-list-for="${p.key}"]`);
    if (!box) return;
    box.innerHTML = '';
    const funkce = funkceManazera(p);
    funkce.forEach((f, i) => box.appendChild(radekFunkce(p, f.grossMonthlyCzk, i, funkce.length)));
  }

  function radekFunkce(p, castka, poradi, celkem) {
    const rada = document.createElement('div');
    rada.className = 'calc-object-row calc-funkce-row';
    const i = document.createElement('input');
    i.type = 'number';
    i.min = '1';
    // Roman 1. 9. 2026 (LEX-29): `step="1000"` odmítalo 200 000 („nejbližší
    // hodnoty 199 001 a 200 001"), protože krok běžel od minima 1. Odměna
    // je celé koruny.
    i.step = '1';
    i.required = true;
    i.dataset.salaryFor = p.key;
    i.value = castka || '';
    i.setAttribute('aria-label', celkem > 1 ? `Funkce č. ${poradi + 1} — hrubá měsíční odměna` : 'Hrubá měsíční odměna');
    rada.appendChild(i);
    if (celkem > 1) {
      const pryc = document.createElement('button');
      pryc.type = 'button';
      pryc.className = 'calc-odebrat';
      pryc.dataset.removeFor = p.key;
      pryc.dataset.index = String(poradi);
      pryc.textContent = 'Odebrat';
      rada.appendChild(pryc);
    }
    return rada;
  }

  function radekObjektu(p, inst, poradi, celkem) {
    const jeVymera = p.input.unit === 'sqm';
    const rada = document.createElement('div');
    rada.className = 'calc-object-row';

    const vyber = document.createElement('select');
    vyber.dataset.typeFor = p.key;
    (p.input.types || []).forEach((t) => {
      const o = document.createElement('option');
      o.value = t.key;
      o.textContent = t.label;
      if (t.key === inst.typeKey) o.selected = true;
      vyber.appendChild(o);
    });
    vyber.setAttribute(
      'aria-label',
      jeVymera ? `Parcela č. ${poradi + 1} — druh` : `Objekt č. ${poradi + 1} — typ`,
    );
    rada.appendChild(vyber);

    if (jeVymera) {
      const pocet = document.createElement('input');
      pocet.type = 'number';
      pocet.min = '1';
      pocet.step = '1';
      // Povinné, ať prázdné pole zastaví „Pokračovat" místo aby pilíř tiše
      // vypadl z ceny. Skrytá pole vyřazuje `synchronizujSkryta`, jinak by
      // nevybraný pilíř blokoval krok neviditelným polem.
      pocet.required = true;
      pocet.value = inst.mnozstvi || '';
      pocet.dataset.qtyFor = p.key;
      pocet.setAttribute('aria-label', `Parcela č. ${poradi + 1} — výměra v m²`);
      rada.appendChild(pocet);
    }

    if (celkem > 1) {
      const pryc = document.createElement('button');
      pryc.type = 'button';
      pryc.className = 'calc-odebrat';
      pryc.dataset.removeFor = p.key;
      pryc.dataset.index = String(poradi);
      pryc.textContent = 'Odebrat';
      rada.appendChild(pryc);
    }
    return rada;
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

    if (q.requiresUnderwriting || Object.keys(stav.nesplnene).length) {
      // Odškrtnutá podmínka = online se nesjednává (LEX-26). Cenu tu nemá
      // smysl slibovat, souhrn říká totéž co dlaždice.
      const li = document.createElement('li');
      li.className = 'calc-error';
      li.textContent = PODMINKA_BLOKUJE;
      seznam.appendChild(li);
      celkem.textContent = '—';
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
      if (t.dataset.conditionFor) {
        const klic = t.dataset.conditionFor;
        const text = t.dataset.conditionText;
        const seznam = new Set(stav.nesplnene[klic] || []);
        // Zaškrtnuto = podmínka platí. Odškrtnutá blokuje sjednání online
        // (LEX-26): zastaví krok jako nevyplněné povinné pole a dlaždice to
        // řekne nahlas.
        if (t.checked) seznam.delete(text);
        else seznam.add(text);
        if (seznam.size) stav.nesplnene[klic] = [...seznam];
        else delete stav.nesplnene[klic];
        t.setCustomValidity(t.checked ? '' : PODMINKA_BLOKUJE);
        const chyba = t.closest('.calc-podminky')?.querySelector('.calc-podminky-chyba');
        if (chyba) chyba.hidden = seznam.size === 0;
        prepocitej();
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
        else {
          delete stav.vstupy[klic];
          // Podmínky nevybraného pilíře nemají co ovlivňovat.
          delete stav.nesplnene[klic];
        }

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
        // Zaškrtnutí či odškrtnutí DOPLŇKU se musí propsat do popisku
        // rozbalovátka jeho rodiče, ať počet vybraných nelže.
        const rodicDoplnku = stav.katalog?.pillars.find((x) => x.key === klic)?.requiresPillarKey;
        if (rodicDoplnku) {
          const btnT = form.querySelector('[data-addons-toggle="' + rodicDoplnku + '"]');
          const teloT = document.getElementById('addons-' + rodicDoplnku);
          if (btnT && teloT) {
            const sourozenci = stav.katalog.pillars.filter((x) => x.requiresPillarKey === rodicDoplnku);
            const vybranychT = sourozenci.filter((d) => stav.vybrane.has(d.key)).length;
            popisToggle(btnT, sourozenci, vybranychT, !teloT.hidden);
          }
        }
        // Až za skrytím doplňků: pole odkryté dlaždice musí být zase povolená
        // (kontrola kroku při neúspěchu vypnula všechna skrytá, jinak by do
        // nich po zaškrtnutí pilíře nešlo psát) a pole schovaného doplňku
        // naopak vypnutá, ať krok neblokuje neviditelným `required`.
        synchronizujSkryta();
        prepocitej();
        return;
      }
      if (t.dataset.typeFor || t.dataset.qtyFor) {
        const klic = t.dataset.typeFor || t.dataset.qtyFor;
        nactiVstupZFormulare(form, klic);
        // Jiný typ objektu = jiné podmínky pojistitelnosti (LEX-26).
        const pilir = stav.katalog?.pillars.find((x) => x.key === klic);
        if (pilir && t.dataset.typeFor) prekresliPodminky(pilir);
        prepocitej();
        return;
      }
      if (t.dataset.salaryFor) {
        nactiVstupZFormulare(form, t.dataset.salaryFor);
        prepocitej();
      }
    });
    form.addEventListener('input', (ev) => {
      if (ev.target.type === 'number') ev.target.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Přidání a odebrání instance. Tlačítka `change` neposílají, proto vlastní
    // posluchač; stav se předtím načte z formuláře, ať se nepřepíšou hodnoty,
    // které člověk zrovna napsal.
    form.addEventListener('click', (ev) => {
      const toggle = ev.target.closest('[data-addons-toggle]');
      if (toggle) {
        ev.preventDefault();
        prepniDoplnky(toggle.dataset.addonsToggle);
        return;
      }
      obsluzPridatOdebrat(ev, form);
    });

    // Krok 2 (LEX-30): detaily objektů, „Přidat" i „Odebrat" jsou i tady, ať se
    // člověk nemusí vracet o krok zpět.
    const smlouva = el('#contract-form');
    if (smlouva) {
      smlouva.addEventListener('click', (ev) => obsluzPridatOdebrat(ev, form));
      smlouva.addEventListener('change', (ev) => {
        const t = ev.target;
        if (!t.dataset.detailFor) return;
        zapisDetail(t);
        // Typ a výměra mění cenu; adresa a vlastní pole ne.
        if (t.dataset.detailKey === 'typeKey' || t.dataset.detailKey === 'mnozstvi') {
          const pilir = stav.katalog?.pillars.find((x) => x.key === t.dataset.detailFor);
          if (pilir) {
            if (pilir.input?.kind === 'salary') prekresliFunkce(pilir);
            else {
              prekresliInstance(pilir);
              prekresliPodminky(pilir);
            }
          }
          prepocitej();
        }
      });
      smlouva.addEventListener('input', (ev) => {
        const t = ev.target;
        if (t.dataset.detailFor && t.type !== 'checkbox' && t.tagName !== 'SELECT') zapisDetail(t);
      });
    }
  }

  function obsluzPridatOdebrat(ev, form) {
    const pridat = ev.target.closest('[data-add-for]');
    const odebrat = ev.target.closest('[data-remove-for]');
    if (!pridat && !odebrat) return;
    ev.preventDefault();
    const klic = (pridat || odebrat).dataset.addFor || (pridat || odebrat).dataset.removeFor;
    const pilir = stav.katalog?.pillars.find((x) => x.key === klic);
    if (!pilir) return;
    const jeFunkce = pilir.input?.kind === 'salary';
    if (ev.currentTarget === form) nactiVstupZFormulare(form, klic);
    const radky = Array.isArray(stav.vstupy[klic]) ? [...stav.vstupy[klic]] : [];
    if (pridat) radky.push(jeFunkce ? { grossMonthlyCzk: 0 } : vychoziInstance(pilir, false));
    else radky.splice(Number(odebrat.dataset.index), 1);
    // Poslední řádek nemizí: pilíř bez jediné položky by neměl co nacenit.
    const vychozi = jeFunkce ? { grossMonthlyCzk: 0 } : vychoziInstance(pilir, true);
    stav.vstupy[klic] = radky.length ? radky : [vychozi];
    if (jeFunkce) prekresliFunkce(pilir);
    else {
      prekresliInstance(pilir);
      prekresliPodminky(pilir);
    }
    vykresliUdaje(true);
    prepocitej();
  }

  /** Zápis pole z kroku 2 do instance (`data-detail-for` + `data-detail-index` + `data-detail-key`). */
  function zapisDetail(pole) {
    const klic = pole.dataset.detailFor;
    const i = Number(pole.dataset.detailIndex);
    const k = pole.dataset.detailKey;
    const pilir = stav.katalog?.pillars.find((x) => x.key === klic);
    if (!pilir || !k) return;
    const radky = pilir.input?.kind === 'salary' ? funkceManazera(pilir) : instanceObjektu(pilir);
    const inst = radky[i];
    if (!inst) return;
    if (k.startsWith('custom.')) {
      inst.custom = inst.custom || {};
      inst.custom[k.slice(7)] = pole.value;
    } else if (pole.type === 'checkbox') {
      inst[k] = pole.checked;
      // Stejná adresa: pole se zamknou a opíšou z pojistníka.
      if (k === 'addrSameAsHolder') vykresliUdaje(true);
    } else if (k === 'mnozstvi' || k === 'grossMonthlyCzk') {
      inst[k] = Number(pole.value || 0);
    } else {
      inst[k] = pole.value;
    }
    stav.vstupy[klic] = radky;
  }

  function nactiVstupZFormulare(form, klic) {
    const box = form.querySelector(`.calc-pillar-input[data-for="${klic}"]`);
    if (!box) return;
    const odmeny = [...box.querySelectorAll('[data-salary-for]')];
    if (odmeny.length) {
      // Detaily funkce (název, instituce, osoba) z kroku 2 přežijí — mění se
      // jen odměna.
      const puvodni = Array.isArray(stav.vstupy[klic]) ? stav.vstupy[klic] : [];
      stav.vstupy[klic] = odmeny.map((i, idx) => ({
        ...(typeof puvodni[idx] === 'object' && puvodni[idx] ? puvodni[idx] : {}),
        grossMonthlyCzk: Number(i.value || 0),
      }));
      return;
    }
    const puvodni = Array.isArray(stav.vstupy[klic]) ? stav.vstupy[klic] : [];
    const radky = [...box.querySelectorAll('.calc-object-row')].map((r, idx) => {
      const pilir = stav.katalog?.pillars.find((x) => x.key === klic);
      const jeVymera = pilir?.input?.unit === 'sqm';
      return {
        // Nový řádek zdědí výchozí nastavení instance (u prvního objektu
        // hlavního pilíře i „adresa stejná jako pojistník"), jinak by se
        // předvolba ztratila, jakmile se stav načte z formuláře kroku 1.
        ...(puvodni[idx] || (pilir ? vychoziInstance(pilir, idx === 0) : { custom: {} })),
        typeKey: r.querySelector('[data-type-for]')?.value || '',
        mnozstvi: jeVymera ? Number(r.querySelector('[data-qty-for]')?.value || 0) : 1,
      };
    });
    stav.vstupy[klic] = radky.length ? radky : null;
  }

  async function prepniProdukt(varianta) {
    // Zruš rozpracované nacenění: běželo by s pilíři starého produktu proti
    // novému, což API odmítne (a v konzoli by na veřejné stránce svítilo 400).
    clearTimeout(cekani);
    poradi += 1;
    stav.produkt = PRODUKTY[varianta] || PRODUKTY.jednotlivec;
    prepniPodnikatele(varianta);
    synchronizujNadpis();
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
  // ── pojistník podnikatel ──────────────────────────────────────────────────

  /** Varianty, u kterých je pojistníkem vždy podnikatel identifikovaný IČO. */
  const PODNIKATELSKE = new Set(['poradce']);

  /**
   * Blok podnikatele podle zvolené varianty (Roman 31. 8. 2026).
   *
   * Skrytý blok má pole VYPNUTÁ, ne jen neviditelná. Povinné pole, které není
   * vidět, umlčí odeslání a člověk nemá jak zjistit proč — na tom se to už
   * jednou zaseklo u data narození.
   */

  /**
   * Nadpis stránky podle zvoleného produktu a rozdělaného kroku.
   *
   * Roman 1. 9. 2026: jeden nadpis pro všechno říkal na každém místě průchodu
   * totéž. Stránka proto nese dvanáct dvojic nadpis + podtitulek (tři produkty
   * krát čtyři kroky) a tady se vybírá ta, která sedí.
   *
   * Krok se čte z toho, který panel je zrovna vidět, ne z vlastního počítadla:
   * kroky přepíná stepper ve `script.js` a druhá evidence téhož by se s ním
   * dřív nebo později rozešla.
   */
  function synchronizujNadpis() {
    const sloty = [...document.querySelectorAll("[data-nadpis]")];
    if (!sloty.length) return;
    const produkt =
      document.querySelector('input[name="variant"]:checked')?.value || "jednotlivec";
    const krok =
      document.querySelector("[data-step-panel]:not([hidden])")?.dataset.stepPanel || "1";
    const sedi = (e) => e.dataset.produkt === produkt && e.dataset.krok === krok;
    // Když by kombinace chyběla, ukáže se první slot daného kroku, ať nezůstane
    // stránka bez nadpisu.
    const nahrada = sloty.find((e) => e.dataset.krok === krok) || sloty[0];
    const vybrany = sloty.find(sedi) || nahrada;
    sloty.forEach((e) => { e.hidden = e !== vybrany; });
  }

  /** Kroky přepíná cizí skript, takže se hlídá změna viditelnosti panelů. */
  function sledujKroky() {
    const panely = [...document.querySelectorAll("[data-step-panel]")];
    if (!panely.length) return;
    const pozorovatel = new MutationObserver(() => synchronizujNadpis());
    panely.forEach((p) => pozorovatel.observe(p, { attributes: true, attributeFilter: ["hidden"] }));
    synchronizujNadpis();
  }

  function prepniPodnikatele(varianta) {
    const blok = el('#podnikatel-blok');
    if (!blok) return;
    const podnikatel = PODNIKATELSKE.has(varianta);
    blok.hidden = !podnikatel;
    blok.querySelectorAll('input').forEach((pole) => {
      pole.disabled = !podnikatel;
      if (pole.type !== 'radio') pole.required = podnikatel;
    });
    // Roman 1. 9. 2026 — u podnikatele pryč jméno, příjmení i rodné číslo,
    // stejně jako je má portál schované ve větvi pro fyzickou osobu. Pole se
    // musí i vypnout: skryté povinné pole by neviditelně zastavilo krok.
    const osobni = el('#osobni-blok');
    if (osobni) {
      osobni.hidden = podnikatel;
      osobni.querySelectorAll('input').forEach((pole) => {
        pole.disabled = podnikatel;
      });
      if (!podnikatel) pripojIdentifikaci.obnov?.();
    }
    // U podnikatele je adresou pojistníka sídlo podnikání, ne bydliště.
    const nadpis = el('#nadpis-adresa');
    if (nadpis) nadpis.textContent = podnikatel ? '2. Sídlo podnikání' : '2. Trvalá adresa';
    // Rekapitulace musí pojmenovat údaje stejně jako formulář krok předtím
    // (Roman 1. 9. 2026), jinak si klient čte o „jménu a příjmení" tam, kde
    // vyplňoval název firmy.
    const pj = el('#popisek-jmeno');
    if (pj) pj.textContent = podnikatel ? 'Název / jméno' : 'Jméno a příjmení';
    const pa = el('#popisek-adresa');
    if (pa) pa.textContent = podnikatel ? 'Sídlo / adresa' : 'Trvalá adresa';
    zobrazUpozorneniPO();
  }

  function zobrazUpozorneniPO() {
    const po = document.querySelector('input[name="legalForm"]:checked')?.value === 'PO';
    const upoz = el('#po-upozorneni');
    if (upoz) upoz.hidden = !po;
  }

  /**
   * Dotažení údajů z ARESu. Je to týž veřejný endpoint, jaký používá
   * registrační brána portálu, takže se název ani sídlo nemůžou rozejít.
   * Sídlo z ARESu se rovnou propíše do adresních polí — u podnikatele je
   * adresou pojistníka sídlo podnikání, ne bydliště.
   */
  async function dotahniZAres() {
    const pole = document.querySelector('[name="ico"]');
    const chyba = el('#ico-chyba');
    const btn = el('#ico-dotahnout');
    if (!pole || !btn) return;
    const ico = (pole.value || '').replace(/\D/g, '');
    const rekni = (t) => {
      if (chyba) {
        chyba.textContent = t;
        chyba.hidden = !t;
      }
    };
    if (ico.length < 8) return rekni('Zadejte prosím osmimístné IČO.');
    rekni('');
    const puvodni = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Načítám…';
    try {
      const res = await fetch(`${API}/registrace/ares?tenant=${TENANT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ico }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d || !d.found) {
        return rekni('IČO se v ARESu nenašlo. Zkontrolujte ho prosím, nebo údaje vyplňte ručně.');
      }
      const set = (jmeno, hodnota) => {
        const e = document.querySelector(`[name="${jmeno}"]`);
        if (!e || !hodnota) return;
        e.value = hodnota;
        e.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set('businessName', d.businessName);
      vyplnJednajici(d);
      const a = d.registeredAddress || {};
      // `line1` z ARESu nese ulici i číslo dohromady a pole je teď taky jedno,
      // takže se nic nedělí a nemá se co uříznout špatně.
      set('street', a.line1);
      set('city', a.city);
      set('zip', String(a.postalCode || '').replace(/\s+/g, ''));
    } catch {
      rekni('ARES se teď nepodařilo dotázat. Vyplňte prosím údaje ručně.');
    } finally {
      btn.disabled = false;
      btn.textContent = puvodni;
    }
  }

  /**
   * Jednající osoba z ARESu (Roman 1. 9. 2026).
   *
   * U OSVČ jedná za sebe sama, takže se předvyplní jménem z rejstříku.
   * U právnické osoby se vypíšou statutáři ve tvaru „Jméno (funkce)".
   *
   * Když jich ARES najde víc než jednoho, přestává jít o vyplnění a začíná
   * překážka: pojistníkem smí být jen s. r. o., jejímž jediným společníkem
   * a jednatelem je jedna a tatáž osoba. Upozornění se proto zvýrazní a IČO
   * dostane vlastní chybu, takže krok neprojde — kontrola kroku už na
   * `checkValidity()` stojí, není potřeba druhá cesta, která by se s ní
   * mohla rozejít.
   */
  function vyplnJednajici(d) {
    const pole = document.querySelector('[name="jednajici"]');
    const ico = document.querySelector('[name="ico"]');
    const upoz = el('#po-upozorneni');
    if (!pole) return;
    const jePO = document.querySelector('input[name="legalForm"]:checked')?.value === 'PO';
    const lide = Array.isArray(d.statutoryPersons) ? d.statutoryPersons : [];

    if (!jePO) {
      // OSVČ: v rejstříku je pod svým jménem a jedná sama za sebe.
      pole.value = (lide[0] && lide[0].name) || d.businessName || pole.value;
    } else {
      pole.value = lide
        .map((o) => [o.name, o.role ? '(' + o.role + ')' : ''].filter(Boolean).join(' '))
        .join('; ');
    }
    pole.dispatchEvent(new Event('change', { bubbles: true }));

    const prekazka = jePO && lide.length > 1;
    if (upoz) {
      upoz.hidden = !jePO;
      upoz.classList.toggle('je-prekazka', prekazka);
    }
    if (ico) {
      ico.setCustomValidity(
        prekazka
          ? 'Pojistníkem, právnickou osobou, může být pouze společnost s ručením omezeným, jejímž jediným společníkem a jednatelem je jedna a tatáž fyzická osoba.'
          : '',
      );
    }
  }

  /** Překážku sundej, jakmile člověk změní IČO nebo právní formu. */
  function zrusPrekazkuPO() {
    const ico = document.querySelector('[name="ico"]');
    ico?.setCustomValidity('');
    el('#po-upozorneni')?.classList.remove('je-prekazka');
  }

  function pripojPodnikatele() {
    el('#ico-dotahnout')?.addEventListener('click', () => void dotahniZAres());
    document.querySelector('[name="ico"]')?.addEventListener('input', zrusPrekazkuPO);
    document.querySelectorAll('input[name="legalForm"]').forEach((r) =>
      r.addEventListener('change', () => {
        document
          .querySelectorAll('input[name="legalForm"]')
          .forEach((i) => i.closest('.calc-option')?.classList.toggle('selected', i.checked));
        zrusPrekazkuPO();
        zobrazUpozorneniPO();
      }),
    );
  }

  // ── validace ──────────────────────────────────────────────────────────────

  /**
   * Pole ve skrytém bloku nesmí být povinné.
   *
   * Předmět pojištění se zobrazuje podle vybraných pilířů; kdo nemá vozidla,
   * nevidí SPZ. Povinné pole, které není vidět, umlčí odeslání a člověk nemá
   * jak zjistit proč (přesně na tom se to zaseklo u data narození). Skryté
   * bloky proto svá pole VYPÍNÁME — vypnuté pole se nevaliduje ani neodesílá.
   */
  function synchronizujSkryta() {
    const sekce = el('#subject-section');
    if (sekce) {
      // Zamčená adresa (stejná jako pojistník) zůstává vypnutá i v otevřené sekci.
      sekce.querySelectorAll('input, select, textarea').forEach((pole) => {
        pole.disabled = !!sekce.hidden || pole.dataset.zamceno === '1';
      });
    }
    // Vstupy nevybraného pilíře jsou skryté, ale prohlížeč je pořád validuje.
    // Bez tohohle by od chvíle, kdy je počet objektů `required`, blokovalo
    // „Pokračovat" pole, které není vidět — a `focus()` na skryté pole nic
    // neudělá, takže by člověk zůstal stát bez vysvětlení. Tatáž past už
    // jednou zastavila sjednání kvůli skrytému rodnému číslu.
    document.querySelectorAll('.calc-pillar-input').forEach((blok) => {
      // Doplňkový pilíř má vlastní blok nezakrytý, schovaný je až kontejner
      // doplňků nad ním — bez téhle větve by nevybraný doplněk blokoval krok.
      // Schválně se nekouká na libovolného skrytého předka: panely neaktivních
      // kroků jsou taky `hidden` a vypnout kvůli nim pilíře by bylo špatně.
      const skryty =
        blok.hidden ||
        blok.closest('.calc-addons')?.hidden === true ||
        // Zabalené tělo rozbalovátka (Roman 29. 8.) schovává i dlaždice
        // vybraných doplňků — jejich pole nesmí blokovat krok naslepo.
        blok.closest('.calc-addons-body')?.hidden === true;
      blok.querySelectorAll('input, select, textarea').forEach((pole) => {
        pole.disabled = !!skryty;
      });
    });
  }

  /**
   * Kontrola kroku při „Pokračovat".
   *
   * Bez ní se dalo projít až na rekapitulaci s prázdnými údaji a chyba se
   * ukázala až u odeslání. Kontroluje se jen právě zobrazený krok, aby člověka
   * nezdržovalo pole, ke kterému se ještě nedostal.
   */
  function krokJeVyplneny(cislo) {
    const panel = document.querySelector(`[data-step-panel="${cislo}"]`);
    if (!panel) return true;
    synchronizujSkryta();
    const spatne = [...panel.querySelectorAll('input, select, textarea')].find(
      (e) => !e.disabled && !e.checkValidity(),
    );
    if (!spatne) return true;
    spatne.focus();
    spatne.reportValidity();
    return false;
  }

  function pripojValidaciKroku() {
    document.querySelectorAll('[data-step-next]').forEach((btn) => {
      const cil = Number(btn.dataset.stepNext);
      // Zachytávací fáze: musíme rozhodnout dřív, než stepper překlopí panel.
      btn.addEventListener(
        'click',
        (ev) => {
          const panel = btn.closest('[data-step-panel]');
          const ted = Number(panel?.dataset.stepPanel);
          // Zpět se nikdy nevaliduje a poslední krok si hlídá odesílání samo.
          if (!ted || cil <= ted || btn.id === 'btn-sjednat') return;
          if (!krokJeVyplneny(ted)) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
          }
        },
        true,
      );
    });
  }

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
  /**
   * Adresa pojistníka se v kroku 2 opisuje do objektů se zaškrtnutým
   * „adresa stejná jako pojistník". Když ji člověk (nebo našeptávač) změní,
   * musí se překreslit i ty karty — jinak by v nich zůstala prázdná pole,
   * přestože se odesílá adresa pojistníka.
   */
  function pripojAdresuPojistnika() {
    // Jen přepiš hodnoty zamčených polí, NEPŘEKRESLUJ karty: překreslení
    // uprostřed psaní odpojí právě editovaný input z DOM a rozepsaný text
    // spadne do prázdna.
    const dopln = () => {
      const adr = adresaPojistnika();
      document.querySelectorAll('#subject-dynamic [data-zamceno="1"]').forEach((pole) => {
        const k = pole.dataset.detailKey;
        if (k in adr) pole.value = adr[k] || '';
      });
    };
    ['street', 'city', 'zip'].forEach((jmeno) => {
      const pole = document.querySelector(`[name="${jmeno}"]`);
      pole?.addEventListener('change', dopln);
      pole?.addEventListener('blur', dopln);
    });
  }

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
      // Ulice i číslo do jednoho pole — tak, jak je našeptávač vrací.
      set('street', a.streetAndNumber || [a.street, a.number].filter(Boolean).join(' '));
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

  /**
   * Návrh smlouvy do seznamu dokumentů (Roman 31. 8. 2026).
   *
   * Vzniká z rozpracovaného konceptu, takže jde o skutečný dokument, ne
   * o ukázku — je to týž soubor, který pak dorazí v příloze. Číslo smlouvy
   * v něm ještě není, to se přidělí až odesláním.
   */
  async function pridejNavrhSmlouvy() {
    const box = el('#doc-list');
    if (!box) return;
    // Klient se mezi kroky vrací a mění výběr; starý náhled by ukazoval nabídku,
    // která už neplatí.
    el('#doc-navrh')?.remove();
    const radek = document.createElement('div');
    radek.className = 'doc-item';
    radek.id = 'doc-navrh';
    const popis = document.createElement('div');
    const nazev = document.createElement('strong');
    nazev.textContent = 'Návrh pojistné smlouvy';
    popis.appendChild(nazev);
    const stavRadku = document.createElement('span');
    stavRadku.textContent = ' · připravujeme…';
    popis.appendChild(stavRadku);
    radek.appendChild(popis);
    box.prepend(radek);

    try {
      const k = await pripravKoncept();
      stavRadku.textContent = ' · PDF, zatím bez čísla smlouvy';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = 'Zobrazit';
      btn.addEventListener('click', () =>
        zobrazUrl(
          'Návrh pojistné smlouvy',
          `${API}/public/v1/contracts/${encodeURIComponent(k.contractId)}/proposal` +
            `?tenant=${TENANT}&token=${encodeURIComponent(k.previewToken)}`,
        ),
      );
      radek.appendChild(btn);
    } catch (e) {
      // Náhled je služba navíc; když se nepovede, sjednání to nesmí zastavit.
      stavRadku.textContent = ' · náhled se teď nepodařilo připravit';
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

  function zobrazUrl(titul, url) {
    const box = el('#doc-preview');
    const ramec = el('#doc-preview-frame');
    const titulek = el('#doc-preview-title');
    if (!box || !ramec) return;
    if (titulek) titulek.textContent = titul;
    ramec.src = url;
    box.hidden = false;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function zobrazDokument(d) {
    zobrazUrl(
      d.title,
      `${API}/public/v1/products/${encodeURIComponent(stav.produkt)}/documents/` +
        `${encodeURIComponent(d.key)}?tenant=${TENANT}`,
    );
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
      b.addEventListener('click', () => {
        // Pořadí je podstatné: seznam oficiálních dokumentů přepisuje obsah
        // boxu, takže návrh se smí přidat až po něm. Jinak ho dorazivší
        // seznam smaže. Návrh se obnovuje pokaždé, seznam stačí jednou
        // za produkt.
        vykresliRekapitulaciUdaju();
        void nactiDokumenty().then(() => pridejNavrhSmlouvy());
      }),
    );
  }

  // ── krok 2: doplnění údajů k pilířům ──────────────────────────────────────

  /**
   * Karty objektů podle vybraných pilířů (Roman 1. 9. 2026, LEX-30: „krok 2
   * replikovat 1:1 z kalkulačky v portálu"). Jedna karta na objekt, pole podle
   * specifikace pilíře z katalogu: typ, výměra (u parcel), ulice/obec/PSČ,
   * „adresa stejná jako pojistník", vlastní pole podle typu (číslo bytu,
   * číslo parcely, katastrální území…). Manažerská funkce má odměnu, název
   * funkce, instituci a pojištěnou osobu. Pilíř bez vstupu (vozidla, řízení)
   * nic nepotřebuje — v produktu jsou pojištěna všechna vozidla i řidiči.
   *
   * Překresluje se jen při změně struktury (pilíře, počet a typy objektů);
   * jinak by každé písmeno do adresy shodilo fokus.
   */
  let podpisUdaju = '';

  function vykresliUdaje(vynutit) {
    const sekce = el('#subject-section');
    const box = el('#subject-dynamic');
    const fallbackNav = el('#subject-fallback-nav');
    if (!sekce || !box) return;
    const pilire = (stav.katalog?.pillars || []).filter(
      (p) => stav.vybrane.has(p.key) && p.input && ['objects', 'salary'].includes(p.input.kind),
    );
    const podpis = pilire
      .map((p) => {
        const radky = p.input.kind === 'salary' ? funkceManazera(p) : instanceObjektu(p);
        return p.key + ':' + radky.map((r) => (r.typeKey || 'f') + (r.addrSameAsHolder ? '=' : '')).join(',');
      })
      .join('|');
    if (!vynutit && podpis === podpisUdaju && box.children.length) {
      sekce.hidden = pilire.length === 0;
      if (fallbackNav) fallbackNav.hidden = pilire.length > 0;
      // Struktura sedí, ale hodnoty se mohly změnit v konfiguraci (typicky
      // odměna funkce nebo výměra parcely). Přepiš je na místě — překreslení
      // by uprostřed psaní odpojilo editované pole.
      srovnejHodnoty(pilire);
      return;
    }
    podpisUdaju = podpis;
    box.innerHTML = '';
    pilire.forEach((p) => box.appendChild(kartaPilire(p)));
    sekce.hidden = pilire.length === 0;
    if (fallbackNav) fallbackNav.hidden = pilire.length > 0;
    synchronizujSkryta();
  }

  /** Hodnoty polí kroku 2 podle stavu; fokusované pole se nechává být. */
  function srovnejHodnoty(pilire) {
    const adr = adresaPojistnika();
    pilire.forEach((p) => {
      const radky = p.input.kind === 'salary' ? funkceManazera(p) : instanceObjektu(p);
      document
        .querySelectorAll(`#subject-dynamic [data-detail-for="${p.key}"]`)
        .forEach((pole) => {
          if (pole === document.activeElement) return;
          const inst = radky[Number(pole.dataset.detailIndex)];
          if (!inst) return;
          const k = pole.dataset.detailKey;
          if (pole.type === 'checkbox') {
            pole.checked = inst[k] === true;
            return;
          }
          const zamceno = pole.dataset.zamceno === '1';
          const hodnota = zamceno && k in adr
            ? adr[k]
            : k.startsWith('custom.')
              ? (inst.custom || {})[k.slice(7)]
              : inst[k];
          const text = hodnota == null || hodnota === 0 ? '' : String(hodnota);
          if (pole.value !== text) pole.value = text;
        });
    });
  }

  function kartaPilire(p) {
    const karta = document.createElement('div');
    karta.className = 'udaje-pilir';
    karta.dataset.udajePro = p.key;
    const h = document.createElement('strong');
    h.className = 'udaje-pilir-title';
    h.textContent = p.name;
    karta.appendChild(h);
    const jeFunkce = p.input.kind === 'salary';
    const radky = jeFunkce ? funkceManazera(p) : instanceObjektu(p);
    radky.forEach((inst, i) =>
      karta.appendChild(jeFunkce ? kartaFunkce(p, inst, i, radky.length) : kartaObjektu(p, inst, i, radky.length)),
    );
    const pridat = document.createElement('button');
    pridat.type = 'button';
    pridat.className = 'btn btn-outline btn-sm udaje-pridat';
    pridat.dataset.addFor = p.key;
    pridat.textContent = jeFunkce
      ? '+ Přidat funkci'
      : p.input.unit === 'sqm'
        ? '+ Přidat parcelu'
        : '+ Přidat další objekt';
    karta.appendChild(pridat);
    return karta;
  }

  function poleDetailu(p, i, klic, popis, hodnota, volby) {
    const skupina = document.createElement('div');
    skupina.className = 'form-group';
    const label = document.createElement('label');
    label.textContent = popis.text;
    if (popis.povinne) {
      const req = document.createElement('span');
      req.className = 'req';
      req.textContent = ' *';
      label.appendChild(req);
    }
    skupina.appendChild(label);
    let pole;
    if (volby && volby.select) {
      pole = document.createElement('select');
      pole.className = 'form-input';
      volby.select.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.key;
        opt.textContent = o.label;
        if (o.key === hodnota) opt.selected = true;
        pole.appendChild(opt);
      });
    } else {
      pole = document.createElement('input');
      pole.className = 'form-input';
      pole.type = volby && volby.cislo ? 'number' : 'text';
      if (volby && volby.cislo) {
        pole.min = '1';
        pole.step = '1';
      }
      pole.value = hodnota == null ? '' : String(hodnota);
      if (volby && volby.placeholder) pole.placeholder = volby.placeholder;
    }
    pole.dataset.detailFor = p.key;
    pole.dataset.detailIndex = String(i);
    pole.dataset.detailKey = klic;
    pole.required = !!popis.povinne;
    if (volby && volby.zamceno) pole.dataset.zamceno = '1';
    skupina.appendChild(pole);
    return skupina;
  }

  function kartaObjektu(p, inst, i, celkem) {
    const f = p.input.fields || { requiredByType: {}, hiddenByType: {}, custom: [] };
    const povinne = new Set(f.requiredByType?.[inst.typeKey] || []);
    const skryte = new Set(f.hiddenByType?.[inst.typeKey] || []);
    const jeVymera = p.input.unit === 'sqm';
    const typ = (p.input.types || []).find((t) => t.key === inst.typeKey);

    const karta = document.createElement('div');
    karta.className = 'udaje-objekt';
    const hlava = document.createElement('div');
    hlava.className = 'udaje-objekt-head';
    const titul = document.createElement('span');
    titul.textContent = `${jeVymera ? 'Parcela' : 'Objekt'} č. ${i + 1}${typ ? ' · ' + typ.label : ''}`;
    hlava.appendChild(titul);
    if (celkem > 1) {
      const pryc = document.createElement('button');
      pryc.type = 'button';
      pryc.className = 'calc-odebrat';
      pryc.dataset.removeFor = p.key;
      pryc.dataset.index = String(i);
      pryc.textContent = 'Odebrat';
      hlava.appendChild(pryc);
    }
    karta.appendChild(hlava);

    const rada1 = document.createElement('div');
    rada1.className = 'form-row';
    rada1.appendChild(
      poleDetailu(p, i, 'typeKey', { text: 'Typ', povinne: true }, inst.typeKey, { select: p.input.types || [] }),
    );
    if (jeVymera || povinne.has('area_m2')) {
      rada1.appendChild(
        poleDetailu(p, i, 'mnozstvi', { text: 'Plocha (m²)', povinne: true }, inst.mnozstvi, { cislo: true }),
      );
    }
    karta.appendChild(rada1);

    // Adresa — jako v portálu, s možností opsat adresu pojistníka.
    const adresniPole = ['ulice', 'obec', 'psc'].filter((k) => !skryte.has(k));
    if (adresniPole.length) {
      const stejna = document.createElement('label');
      stejna.className = 'form-checkbox';
      stejna.style.margin = '0 0 10px';
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = inst.addrSameAsHolder === true;
      c.dataset.detailFor = p.key;
      c.dataset.detailIndex = String(i);
      c.dataset.detailKey = 'addrSameAsHolder';
      stejna.appendChild(c);
      const s = document.createElement('span');
      s.textContent = 'Adresa stejná jako adresa pojistníka';
      stejna.appendChild(s);
      karta.appendChild(stejna);

      const zamceno = inst.addrSameAsHolder === true;
      const zdroj = zamceno ? adresaPojistnika() : inst;
      const rada2 = document.createElement('div');
      rada2.className = 'form-row';
      const POPISKY = { ulice: 'Ulice a č. p.', obec: 'Obec', psc: 'PSČ' };
      const NAPOVEDY = { ulice: 'Želetavská 1525/1', obec: 'Praha', psc: '140 00' };
      adresniPole.forEach((k) => {
        const g = poleDetailu(
          p,
          i,
          k,
          { text: POPISKY[k], povinne: !zamceno && (povinne.has(k) || k !== 'psc' || povinne.size === 0) },
          zdroj[k] || '',
          { placeholder: NAPOVEDY[k], zamceno },
        );
        if (k === 'ulice') g.style.flex = '2';
        rada2.appendChild(g);
      });
      karta.appendChild(rada2);
    }

    // Vlastní pole podle typu (číslo bytu, číslo parcely, katastrální území…).
    const vlastni = (f.custom || []).filter((cf) => !cf.types?.length || cf.types.includes(inst.typeKey));
    if (vlastni.length) {
      const rada3 = document.createElement('div');
      rada3.className = 'form-row';
      vlastni.forEach((cf) => {
        rada3.appendChild(
          poleDetailu(p, i, 'custom.' + cf.key, { text: cf.label, povinne: povinne.has(cf.key) }, (inst.custom || {})[cf.key] || '', {}),
        );
      });
      karta.appendChild(rada3);
    }
    return karta;
  }

  function kartaFunkce(p, f, i, celkem) {
    const karta = document.createElement('div');
    karta.className = 'udaje-objekt';
    const hlava = document.createElement('div');
    hlava.className = 'udaje-objekt-head';
    const titul = document.createElement('span');
    titul.textContent = `Funkce č. ${i + 1}`;
    hlava.appendChild(titul);
    if (celkem > 1) {
      const pryc = document.createElement('button');
      pryc.type = 'button';
      pryc.className = 'calc-odebrat';
      pryc.dataset.removeFor = p.key;
      pryc.dataset.index = String(i);
      pryc.textContent = 'Odebrat';
      hlava.appendChild(pryc);
    }
    karta.appendChild(hlava);
    const rada1 = document.createElement('div');
    rada1.className = 'form-row';
    rada1.appendChild(
      poleDetailu(p, i, 'grossMonthlyCzk', { text: 'Hrubá měsíční odměna (Kč)', povinne: true }, f.grossMonthlyCzk || '', { cislo: true }),
    );
    (p.input.itemDetails || []).forEach((d) => {
      rada1.appendChild(poleDetailu(p, i, d.key, { text: d.label, povinne: false }, f[d.key] || '', {}));
    });
    karta.appendChild(rada1);
    return karta;
  }

  // ── rekapitulace údajů po pilířích (LEX-33) ───────────────────────────────

  function vykresliRekapitulaciUdaju() {
    const karta = el('#recap-udaje');
    const box = el('#recap-udaje-obsah');
    if (!karta || !box) return;
    box.innerHTML = '';
    const pilire = (stav.katalog?.pillars || []).filter(
      (p) => stav.vybrane.has(p.key) && p.input && ['objects', 'salary'].includes(p.input.kind),
    );
    pilire.forEach((p) => {
      const blok = document.createElement('div');
      blok.className = 'recap-udaje-pilir';
      const h = document.createElement('strong');
      h.textContent = p.name;
      blok.appendChild(h);
      if (p.input.kind === 'salary') {
        funkceManazera(p).forEach((f, i) => {
          const r = document.createElement('div');
          r.className = 'recap-udaje-objekt';
          const casti = [`Funkce č. ${i + 1}`, f.functionTitle, f.organizationName, f.insuredName].filter(Boolean);
          r.textContent = casti.join(' · ') + ' — odměna ' + czk(Number(f.grossMonthlyCzk) || 0) + '/měs.';
          blok.appendChild(r);
        });
      } else {
        const jeVymera = p.input.unit === 'sqm';
        instanceObjektu(p).forEach((inst, i) => {
          const d = detailyObjektu(inst);
          const typ = (p.input.types || []).find((t) => t.key === inst.typeKey);
          const r = document.createElement('div');
          r.className = 'recap-udaje-objekt';
          const nazev = document.createElement('span');
          nazev.textContent = `${typ ? typ.label : jeVymera ? 'Parcela' : 'Objekt'} č. ${i + 1}`;
          r.appendChild(nazev);
          const detail = [];
          if (jeVymera) detail.push(`${inst.mnozstvi} m²`);
          const adresa = [d.ulice, [d.psc, d.obec].filter(Boolean).join(' ')].filter(Boolean).join(', ');
          if (adresa) detail.push(adresa);
          (p.input.fields?.custom || []).forEach((cf) => {
            const v = d.custom?.[cf.key];
            if (v) detail.push(`${cf.label}: ${v}`);
          });
          if (detail.length) {
            const em = document.createElement('em');
            em.textContent = ' · ' + detail.join(' · ');
            r.appendChild(em);
          }
          blok.appendChild(r);
        });
      }
      box.appendChild(blok);
    });
    karta.hidden = pilire.length === 0;
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
  function teloSjednani() {
    const jeFirma = !el('#podnikatel-blok')?.hidden;
    const osobniJmeno = [pole('firstName'), pole('lastName')].filter(Boolean).join(' ');
    // U podnikatele nese jméno pojistníka název firmy — osobní pole na stránce
    // nejsou. API `name` vyžaduje, takže bez tohohle by sjednání spadlo na
    // validaci s prázdným jménem.
    const jmeno = jeFirma ? pole('businessName') || osobniJmeno : osobniJmeno;
    return {
      product: stav.produkt,
      segment: 'FO',
      pillars: [...stav.vybrane],
      parameters: sestavParametry(),
      unmetConditions: stav.nesplnene,
      paymentFrequency:
        document.querySelector('input[name="period"]:checked')?.value === 'rocni'
          ? 'annual'
          : 'monthly',
      client: {
        name: jmeno,
        ...(pole('ico') ? { ico: pole('ico') } : {}),
        ...(document.querySelector('input[name="legalForm"]:checked') &&
        !el('#podnikatel-blok')?.hidden
          ? {
              legalForm: document.querySelector('input[name="legalForm"]:checked').value,
              businessName: pole('businessName') || undefined,
              // „Za pojistníka jedná" má od 1. 9. 2026 vlastní pole, stejně jako
              // v portálu. Dřív se sem dosazoval ten, kdo formulář vyplňuje, což
              // u firmy nemusí být tatáž osoba.
              representedBy: pole('jednajici') || jmeno,
            }
          : {}),
        email: pole('email'),
        phone: pole('phone'),
        birthNumber: pole('rc') ? normalizujRc(pole('rc')) : undefined,
        identityDocumentNumber: pole('dokladCislo') || undefined,
        street: pole('street') || undefined,
        city: pole('city') || undefined,
        postalCode: pole('zip') || undefined,
      },
      consents: {
        // Roman 1. 9. 2026 (po poradě s Petrem Čepou): zaškrtávátko marketingu
        // i text o zpracování osobních údajů jsou ze stránky pryč, takže není
        // co číst ani co doložit. Souhlas se zpracováním se dál dává odesláním
        // a server ho u klienta zaznamená; jen už k němu neuloží znění.
        marketing: false,
      },
      ...(stav.posledni ? { expectedMonthlyCzk: stav.posledni.monthlyCzk } : {}),
    };
  }

  async function poslat(cesta, telo) {
    const res = await fetch(`${API}/public/v1/${cesta}?tenant=${TENANT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(telo),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || 'Něco se nepovedlo.');
    return data;
  }

  /**
   * Rozpracovaný koncept pro náhled návrhu.
   *
   * Zakládá se až v rekapitulaci a při návratu se týž koncept PŘEPISUJE, ne
   * zakládá znovu — jinak by po jednom sjednání zůstala v přehledu hromada
   * nedodělků. Číslo smlouvy koncept ještě nemá, přidělí se až potvrzením.
   */
  async function pripravKoncept() {
    const telo = teloSjednani();
    if (stav.koncept) {
      telo.draftId = stav.koncept.contractId;
      telo.previewToken = stav.koncept.previewToken;
    }
    const data = await poslat('contracts/draft', telo);
    stav.koncept = { contractId: data.contractId, previewToken: data.previewToken };
    return stav.koncept;
  }

  async function odesliSjednani() {
    const k = stav.koncept || (await pripravKoncept());
    return poslat(`contracts/${encodeURIComponent(k.contractId)}/confirm`, {
      previewToken: k.previewToken,
    });
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
  /** Rodné číslo s lomítkem po šesté číslici; jiný vstup vrací beze změny. */
  function normalizujRc(hodnota) {
    const cislice = String(hodnota || '').replace(/\D/g, '');
    if (cislice.length === 9 || cislice.length === 10) {
      return cislice.slice(0, 6) + '/' + cislice.slice(6);
    }
    return String(hodnota || '').trim();
  }

  function pripojIdentifikaci() {
    const prepinac = el('#bez-rc');
    const rc = el('[name="rc"]');
    const doklad = el('[name="dokladCislo"]');
    if (!prepinac || !rc || !doklad) return;
    // Roman 1. 9. 2026 (LEX-31): lomítko doplníme sami; kdo ho nenapíše, nesmí
    // narazit na nevysvětlené „neplatný formát".
    rc.addEventListener('blur', () => {
      const s = normalizujRc(rc.value);
      if (s !== rc.value) {
        rc.value = s;
        rc.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
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
    // Vystaveno ven: po přepnutí z podnikatele zpět na fyzickou osobu se
    // všechna pole osobního bloku povolí naráz, což by zapnulo i doklad
    // cizince. Tímhle se stav dorovná podle zaškrtávátka.
    pripojIdentifikaci.obnov = prepni;
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
        synchronizujSkryta();
        const spatne = form
          ? [...form.querySelectorAll('input, select, textarea')].find(
              (x) => !x.disabled && !x.checkValidity(),
            )
          : null;
        if (spatne) {
          const krok = spatne.closest('[data-step-panel]')?.dataset.stepPanel;
          if (krok) el(`[data-step-back="${krok}"]`)?.click();
          setTimeout(() => {
            spatne.focus();
            spatne.reportValidity();
          }, 350);
          if (chyba) {
            chyba.textContent = 'Zkontrolujte prosím vyplněné údaje, něco ještě chybí.';
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

  window.LEXIA_CALC = {
    selected: () => [...stav.vybrane],
    quote: () => stav.posledni,
    renderSubject: () => vykresliUdaje(false),
  };

  /**
   * Varianta z adresy (`?varianta=poradce`). Odsud na kalkulačku míří microsity
   * /reality a /financniporadci, které prodávají jiný produkt než výchozí
   * jednotlivce. Neznámou hodnotu ignorujeme — jinak by stačil překlep v odkazu
   * a katalog by se načetl pro neexistující produkt. Starší odkazy z „Pro koho"
   * nesly `?profil=`; berou se stejně.
   *
   * Týž parametr předvolí přepínač i ve `script.js` (starší deep-link z karet
   * na úvodní stránce), ale jen pro jednotlivce a domácnost. Nezdvojí se to:
   * `script.js` běží dřív, než katalogová kalkulačka připojí posluchače, takže
   * jeho `change` nikdo nechytí. Produkt si tak řídí jedno místo — tohle.
   */
  function variantaZAdresy() {
    const q = new URLSearchParams(window.location.search);
    const v = q.get('varianta') || q.get('profil');
    return v && Object.prototype.hasOwnProperty.call(PRODUKTY, v) ? v : null;
  }

  /**
   * Vstup z konkrétní produktové stránky (Roman 31. 8. 2026).
   *
   * Kdo na kalkulačku přijde přes „Sjednat pojištění" z microsity poradců, už
   * si produkt vybral — ostatní dlaždice by ho jen zvaly pryč od toho, o co
   * přišel. Zůstane proto jen ta jeho a nadpis to řekne.
   *
   * Ostatní varianty se odstraňují z DOM, ne jen skrývají: skryté zaškrtávátko
   * v `<label>` by šlo pořád přepnout klávesnicí a člověk by skončil na
   * produktu, který nikde nevidí.
   */
  function zuzNaVariantu(varianta) {
    const zvolena = el(`input[name="variant"][value="${varianta}"]`);
    if (!zvolena) return;
    document.querySelectorAll('input[name="variant"]').forEach((i) => {
      if (i.value !== varianta) i.closest('.calc-option')?.remove();
    });
    const nadpis = el('#nadpis-varianta');
    if (nadpis) nadpis.textContent = '1. Zvolené pojištění';
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!el('#calc-pillars')) return;
    // Roman 1. 9. 2026 (LEX-25): volba produktu je samostatná stránka. Kdo
    // přijde bez produktu, patří tam — kromě editoru textů, který stránku
    // otevírá v rámu a produkt nepotřebuje.
    if (!variantaZAdresy() && window.self === window.top) {
      window.location.replace('sjednat.html');
      return;
    }
    pripojUdalosti();
    pripojSjednani();
    pripojIdentifikaci();
    pripojDokumenty();
    pripojNaseptavac();
    pripojAdresuPojistnika();
    pripojValidaciKroku();
    pripojPodnikatele();
    sledujKroky();
    const zAdresy = variantaZAdresy();
    if (zAdresy) {
      const prepinac = el(`input[name="variant"][value="${zAdresy}"]`);
      if (prepinac) {
        prepinac.checked = true;
        document
          .querySelectorAll('input[name="variant"]')
          .forEach((i) => i.closest('.calc-option')?.classList.toggle('selected', i.checked));
      }
      zuzNaVariantu(zAdresy);
    }
    const varianta = zAdresy || el('input[name="variant"]:checked')?.value || 'jednotlivec';
    void prepniProdukt(varianta);
  });
})();
