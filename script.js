/* ============================================
   LEXIA - Interactive scripts
   Kalkulačka odpovídá produktu Jednotlivci a domácnosti
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => btn.parentElement.classList.toggle('active'));
  });

  // Rozbalovací detail produktu (pro-koho.html) — "Zobrazit detail"
  document.querySelectorAll('[data-detail-toggle]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('data-detail-toggle'));
    if (!panel) return;

    // Jednorázová úprava struktury panelu: obsah obalíme do __body
    // a nahoru vložíme lepkavou titulní lištu s tlačítkem pro skrytí.
    if (!panel.dataset.enhanced) {
      const card = btn.closest('.product-card');
      const label = card ? (card.querySelector('h2')?.textContent || 'Detail produktu') : 'Detail produktu';

      const body = document.createElement('div');
      body.className = 'product-detail__body';
      while (panel.firstChild) body.appendChild(panel.firstChild);

      const bar = document.createElement('div');
      bar.className = 'product-detail__bar';
      bar.innerHTML =
        '<span class="product-detail__bar-label"><i class="icon" data-icon="document"></i>' + label + '</span>' +
        '<button type="button" class="product-detail__bar-close">' +
        '<span class="product-detail__bar-x" aria-hidden="true">&times;</span> Skrýt detail</button>';

      panel.appendChild(bar);
      panel.appendChild(body);
      panel.dataset.enhanced = '1';

      bar.querySelector('.product-detail__bar-close').addEventListener('click', () => closeDetail(btn, panel));
    }

    btn.addEventListener('click', () => {
      if (panel.hasAttribute('hidden')) {
        openDetail(btn, panel);
      } else {
        closeDetail(btn, panel);
      }
    });
  });

  function openDetail(btn, panel) {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = 'Skrýt detail';
    const card = btn.closest('.product-card');
    if (card) card.classList.add('is-open');
    // Scroll na úplný začátek (úvod) panelu. Odsazení pod lepkavou hlavičku
    // řeší CSS vlastnost scroll-margin-top na .product-detail, aby uživatel
    // vždy viděl úvodní věty detailu.
    requestAnimationFrame(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closeDetail(btn, panel) {
    panel.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Zobrazit detail';
    const card = btn.closest('.product-card');
    if (card) card.classList.remove('is-open');
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Validace povinných polí — zvýraznění a odskok na první nevyplněné
  initFormValidation();

  // Form submit demo
  document.querySelectorAll('form[data-demo]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const wrapper = form.parentElement;
      const success = document.createElement('div');
      success.style.cssText = 'background: #D1FAE5; color: #065F46; padding: 18px; border-radius: 12px; text-align: center; font-weight: 600;';
      success.innerHTML = 'Děkujeme! Vaši poptávku jsme přijali, ozveme se do 24 hodin.';
      form.style.display = 'none';
      wrapper.appendChild(success);
    });
  });

  // Scroll reveal animations
  initScrollReveal();

  // Header shadow on scroll
  initHeaderScroll();

  // Subtle parallax on hero dot patterns
  initParallax();

  // Kalkulačku řeší assets/kalkulacka-katalog.js — sama se naváže na DOM.

  // Calculator wizard (multi-step)
  initCalcWizard();

  // Scroll companion - life ring se postupně sestavuje
  initScrollCompanion();

  // Carousel sekce "Lidé Lexia"
  initTestimonialsCarousel();

  // Šipky pro horizontální posouvání tabulek na mobilu (srovnání balíčků)
  initTableScroller();
});

/* ============================================
   TABLE SCROLLER - šipky pro posun široké tabulky
   Aktivuje se jen když tabulka horizontálně přetéká (mobil).
   ============================================ */
function initTableScroller() {
  document.querySelectorAll('.table-wrapper').forEach(wrapper => {
    // obal pro absolutně pozicované šipky
    const shell = document.createElement('div');
    shell.className = 'table-scroller';
    wrapper.parentNode.insertBefore(shell, wrapper);
    shell.appendChild(wrapper);

    const mkBtn = (dir) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'table-scroll-btn table-scroll-btn--' + dir + ' is-hidden';
      b.setAttribute('aria-label', dir === 'left' ? 'Posunout tabulku vlevo' : 'Posunout tabulku vpravo');
      const d = dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6';
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
      return b;
    };
    const left = mkBtn('left');
    const right = mkBtn('right');
    shell.appendChild(left);
    shell.appendChild(right);

    const step = () => Math.max(160, Math.round(wrapper.clientWidth * 0.7));
    const update = () => {
      const max = wrapper.scrollWidth - wrapper.clientWidth;
      const canScroll = max > 4;
      left.classList.toggle('is-hidden', !canScroll || wrapper.scrollLeft <= 4);
      right.classList.toggle('is-hidden', !canScroll || wrapper.scrollLeft >= max - 4);
    };

    const scrollByStep = (delta) => {
      const max = wrapper.scrollWidth - wrapper.clientWidth;
      const target = Math.max(0, Math.min(max, wrapper.scrollLeft + delta));
      // Plynulost řeší CSS (scroll-behavior: smooth na .table-wrapper);
      // přímé nastavení scrollLeft zaručí posun i tam, kde smooth není.
      wrapper.scrollLeft = target;
      update();
    };

    left.addEventListener('click', () => scrollByStep(-step()));
    right.addEventListener('click', () => scrollByStep(step()));
    wrapper.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // přepočet i po načtení fontů/obrázků (mění šířku tabulky) a s drobným zpožděním
    window.addEventListener('load', update);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
    setTimeout(update, 300);
    update();
  });
}

/* ============================================
   CALCULATOR WIZARD - kroky 1-5
   Switching mezi panely, stepper sync, sticky-summary echo
   ============================================ */
function initCalcWizard() {
  const stepper = document.querySelector('.calc-stepper');
  const panels = document.querySelectorAll('[data-step-panel]');
  if (!stepper || !panels.length) return;

  const nextBtns = document.querySelectorAll('[data-step-next]');
  const backBtns = document.querySelectorAll('[data-step-back]');
  const stateBtns = document.querySelectorAll('[data-state-show]');

  function showStep(num) {
    num = parseInt(num, 10);
    panels.forEach(p => {
      const panelN = parseInt(p.dataset.stepPanel, 10);
      p.hidden = panelN !== num;
    });
    stepper.querySelectorAll('.step').forEach(s => {
      const stepN = parseInt(s.dataset.step, 10);
      s.classList.toggle('is-active', stepN === num);
      s.classList.toggle('is-completed', stepN < num);
    });
    // Sync echo data from current calc state
    if (typeof updateSubjectBlocks === 'function') updateSubjectBlocks();
    syncEcho();
    // Poslední krok — založ smlouvu (číslo, VS) a vyber stav (platba / individuální nacenění)
    if (num === 4) finalizeContract();
    // Tom 1. 9. 2026: plynulý scroll se v prohlížeči přerušil, jakmile se
    // přepnutím panelu změnila výška stránky, a člověk zůstal u patičky
    // místo u začátku kroku. Skočit hned, až po překreslení layoutu.
    requestAnimationFrame(() => {
      const cil = stepper.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, cil), behavior: 'auto' });
    });
  }

  // Poslední krok kalkulačky NEZAKLÁDÁ smlouvu — žádný backend za tím zatím
  // není. Dřív se tu číslo smlouvy i variabilní symbol vyráběly `Math.random()`
  // a stránka pak vybírala platbu do 24 hodin na skutečný účet. Peníze tedy
  // mohly dorazit pod symbolem, který neodpovídal žádné smlouvě. Do doby, než
  // sjednání pojede přes API, tu nesmí vzniknout žádné číslo.
  function finalizeContract() {}

  nextBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showStep(btn.dataset.stepNext);
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      showStep(btn.dataset.stepBack);
    });
  });

  // State switcher in step 5 (success / pending / custom)
  stateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.stateShow;
      document.querySelectorAll('[data-state]').forEach(card => {
        card.hidden = card.dataset.state !== target;
      });
    });
  });

  // Korespondenční adresa toggle
  const diffAddrCheck = document.getElementById('diff-address-check');
  const corrFields = document.getElementById('corr-address-fields');
  if (diffAddrCheck && corrFields) {
    diffAddrCheck.addEventListener('change', () => {
      corrFields.hidden = !diffAddrCheck.checked;
    });
  }

  // DEEP-LINK Z LANDING PAGE — ?varianta=jednotlivec|domacnost
  // Karty produktů v hero sekci na index.html předvolí variantu kalkulačky.
  const variantKey = new URLSearchParams(window.location.search).get('varianta');
  if (variantKey === 'jednotlivec' || variantKey === 'domacnost') {
    const variantRadio = document.querySelector(`input[name="variant"][value="${variantKey}"]`);
    if (variantRadio && !variantRadio.checked) {
      variantRadio.checked = true;
      variantRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // Domácnost confirm (visible only when variant = domacnost)
  function updateHouseholdConfirm() {
    const variant = document.querySelector('input[name="variant"]:checked');
    const householdBox = document.getElementById('household-confirm');
    if (variant && householdBox) {
      householdBox.hidden = variant.value !== 'domacnost';
    }
  }
  document.querySelectorAll('input[name="variant"]').forEach(r => {
    r.addEventListener('change', updateHouseholdConfirm);
  });
  updateHouseholdConfirm();

  // Adresa nemovitosti shodná s trvalou — schová pole a přebírá adresu pojistníka
  const nemoSame = document.getElementById('nemo-same-address');
  const nemoFields = document.getElementById('nemo-address-fields');
  if (nemoSame && nemoFields) {
    nemoSame.addEventListener('change', () => {
      nemoFields.hidden = nemoSame.checked;
      syncEcho();
    });
  }

  // Adresa pojistníka v jednom řádku — používá se i u předmětu pojištění
  function fullAddressForSubject() {
    const form = document.getElementById('contract-form');
    if (!form) return '—';
    const get = name => form.querySelector(`[name="${name}"]`)?.value.trim() || '';
    const line = [
      get('street'),
      [get('zip'), get('city')].filter(Boolean).join(' ')
    ].filter(Boolean).join(', ');
    return line || '—';
  }

  // Echo: sync všechny [data-echo] elementy s aktuálním stavem kalkulačky
  function syncEcho() {
    const variant = document.querySelector('input[name="variant"]:checked');
    const period = document.querySelector('input[name="period"]:checked');
    const startDate = document.getElementById('start-date');
    const total = document.getElementById('sum-total');
    const sumPillars = document.getElementById('sum-pillars');

    const variantLabel = variant ? (variant.dataset.label || 'Jednotlivec') : 'Jednotlivec';
    const periodValue = period ? period.value : 'mesicni';
    const periodLabel = periodValue === 'rocni' ? 'ročně' : 'měsíčně';
    const totalText = total ? total.textContent : '179 Kč';

    document.querySelectorAll('[data-echo="variant"]').forEach(el => el.textContent = variantLabel);
    document.querySelectorAll('[data-echo="period"]').forEach(el => el.textContent = periodLabel);
    document.querySelectorAll('[data-echo="period-label"]').forEach(el => el.textContent = periodLabel);
    document.querySelectorAll('[data-echo="total"]').forEach(el => el.textContent = totalText);

    if (startDate) {
      const dateText = startDate.value
        ? new Date(startDate.value).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Bude doplněno';
      document.querySelectorAll('[data-echo="startDate"]').forEach(el => el.textContent = dateText);
    }

    // Echo z contact form — osobní údaje
    const contactForm = document.getElementById('contract-form');
    if (contactForm) {
      const get = name => {
        const el = contactForm.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : '';
      };
      const firstName = get('firstName');
      const lastName = get('lastName');
      const email = get('email');
      const phone = get('phone');
      const birth = get('birthDate');
      const street = get('street');
      const city = get('city');
      const zip = get('zip');

      // U podnikatele jméno a příjmení ve formuláři nejsou (Roman 1. 9. 2026),
      // pojistníka pojmenovává firma. Bez tohohle ukazovala rekapitulace pomlčku.
      const fullName =
        [firstName, lastName].filter(Boolean).join(' ') || get('businessName') || '—';
      const fullAddress = [
        street,
        [zip, city].filter(Boolean).join(' ')
      ].filter(Boolean).join(', ') || '—';
      const birthFormatted = birth
        ? new Date(birth).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

      document.querySelectorAll('[data-echo="fullName"]').forEach(el => el.textContent = fullName);
      document.querySelectorAll('[data-echo="email"]').forEach(el => el.textContent = email || '—');
      document.querySelectorAll('[data-echo="phone"]').forEach(el => el.textContent = phone || '—');
      document.querySelectorAll('[data-echo="birthDate"]').forEach(el => el.textContent = birthFormatted);
      document.querySelectorAll('[data-echo="fullAddress"]').forEach(el => el.textContent = fullAddress);
    }

    // Rekapitulace předmětu pojištění — jen vyplněné údaje z viditelných bloků
    const subjectCard = document.getElementById('recap-subject');
    const subjectGrid = document.querySelector('[data-echo="subject-grid"]');
    if (subjectCard && subjectGrid) {
      const items = [];
      document.querySelectorAll('#subject-section .subject-block').forEach(block => {
        if (block.hidden) return;
        block.querySelectorAll('[data-subject-label]').forEach(field => {
          // Skryté vnořené bloky přeskoč; hledáme jen po hranici bloku,
          // protože celý panel kroku 2 je při rekapitulaci hidden.
          let node = field;
          while (node && node !== block) {
            if (node.hidden) return;
            node = node.parentElement;
          }
          const value = field.value.trim();
          if (value) items.push({ label: field.dataset.subjectLabel, value });
        });
      });
      // Adresa nemovitosti shodná s trvalou — doplň adresu pojistníka
      const sameAddr = document.getElementById('nemo-same-address');
      const nemoBlock = document.getElementById('subj-nemovitost');
      if (sameAddr?.checked && nemoBlock && !nemoBlock.hidden) {
        items.push({ label: 'Adresa nemovitosti', value: fullAddressForSubject() });
      }
      subjectCard.hidden = items.length === 0;
      subjectGrid.innerHTML = items.map(i => `
        <div class="recap-data-item">
          <span class="label">${i.label}</span>
          <strong>${i.value.replace(/\n/g, ', ')}</strong>
        </div>`).join('');
    }

    // Sync vybraných pilířů do rekapitulace
    if (sumPillars) {
      document.querySelectorAll('[data-echo="pillars-list"]').forEach(el => {
        el.innerHTML = sumPillars.innerHTML;
      });
    }

    // Měsíční a roční částka do rekapitulace.
    //
    // Dopočet „roční = 11× měsíční" platil, dokud byla jediná sleva „měsíc
    // zdarma". Slevový voucher (LEX-38) se u roční a měsíční platby uplatňuje
    // různě — strop celkové slevy ukusuje jen tam, kde je i měsíc zdarma —
    // takže se ta dvě čísla na sebe přepočítat nedají. Když kalkulačka zná
    // obojí ze serveru, bereme je odtud; dopočet zůstává jen jako záloha pro
    // stránky bez katalogu.
    if (total) {
      const YEARLY_MONTHS = 11;
      const num = parseInt(totalText.replace(/\D/g, ''), 10) || 0;
      const q = window.LEXIA_CALC && typeof window.LEXIA_CALC.quote === 'function'
        ? window.LEXIA_CALC.quote()
        : null;
      const monthly = q && typeof q.payableMonthlyCzk === 'number'
        ? q.payableMonthlyCzk
        : (periodValue === 'rocni' ? Math.round(num / YEARLY_MONTHS) : num);
      const yearly = q && typeof q.payableAnnualCzk === 'number'
        ? q.payableAnnualCzk
        : (periodValue === 'rocni' ? num : num * YEARLY_MONTHS);
      document.querySelectorAll('[data-echo="month-total"]').forEach(el => el.textContent = monthly.toLocaleString('cs-CZ') + ' Kč');
      document.querySelectorAll('[data-echo="year-total"]').forEach(el => el.textContent = yearly.toLocaleString('cs-CZ') + ' Kč');
    }
  }

  // Sync při změně v kalkulačce i contact formu
  document.querySelectorAll('#calc-form input, #calc-form select, #contract-form input, #contract-form select, #contract-form textarea').forEach(el => {
    el.addEventListener('change', syncEcho);
    el.addEventListener('input', syncEcho);
  });
  syncEcho();

  // ============================================
  // DEEP-LINK Z LANDING PAGE — ?produkt=...
  // Předvybere pilíře pro daný produkt a skočí rovnou na krok 2 (Vaše údaje).
  // Zákazník už jen vyplní svoje údaje; rozsah a cenu může upravit přes "Zpět ke kalkulaci".
  // ============================================
  const PRODUCTS = {
    vozidlo: {
      name: 'Právní ochrana vozidla',
      title: 'Sjednání právní ochrany vozidla',
      sub: 'Ochrana řidiče i posádky, doplněk k povinnému ručení a havarijnímu pojištění. Vyplňte své údaje a sjednejte si pojištění online. Rozsah krytí i cenu můžete kdykoliv upravit přes <strong>Zpět ke kalkulaci</strong>.',
      pillars: ['pillar_vozidla'],
    },
    bydleni: {
      name: 'Právní ochrana bydlení',
      title: 'Sjednání právní ochrany bydlení',
      sub: 'Doplněk k pojištění domácnosti i nemovitosti. Vyplňte své údaje a sjednejte si pojištění online. Rozsah krytí i cenu můžete kdykoliv upravit přes <strong>Zpět ke kalkulaci</strong>.',
      pillars: ['pillar_nemovitost'],
    },
    balicek: {
      name: 'Kompletní balíček',
      title: 'Sjednání kompletního balíčku',
      sub: 'Základní právní ochrana, bydlení i řidiči v jednom, nejvýhodnější kombinace. Vyplňte své údaje a sjednejte si pojištění online. Rozsah krytí i cenu můžete kdykoliv upravit přes <strong>Zpět ke kalkulaci</strong>.',
      pillars: ['pillar_vozidla', 'pillar_nemovitost'],
    },
  };

  const productKey = new URLSearchParams(window.location.search).get('produkt');
  const product = productKey ? PRODUCTS[productKey] : null;
  if (product) {
    // Předvyber relevantní pilíře (vyvolá přepočet ceny i .selected styly)
    product.pillars.forEach(name => {
      const cb = document.querySelector(`#calc-form input[name="${name}"]`);
      if (cb && !cb.checked) {
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Přepiš název produktu v rekapitulaci, platbě i dokončení
    document.querySelectorAll('[data-echo="product"]').forEach(el => { el.textContent = product.name; });

    // Přizpůsob hero kalkulačky
    const heroTitle = document.querySelector('.page-hero h1');
    const heroSub = document.querySelector('.page-hero p');
    if (heroTitle) heroTitle.textContent = product.title;
    if (heroSub) heroSub.innerHTML = product.sub;

    // Skoč rovnou na krok 2 — Vaše údaje
    showStep(2);
  }
}

/* ============================================
   SCROLL COMPANION — Záchranný kruh
   Postupně se "sestaví" (vyplní brand modrou) podle scroll progress
   Na konci → check + label POJIŠTĚNO
   ============================================ */
function initScrollCompanion() {
  const companion = document.querySelector('.scroll-companion');
  if (!companion) return;

  const progressRing = companion.querySelector('.progress-ring');
  const checkMark = companion.querySelector('.check-mark');
  const CIRCUMFERENCE = 251.3; // 2 * PI * 40 (poloměr 40)

  let ticking = false;

  function update() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollY / (docHeight * 0.88), 0), 1) : 0;

    // Zobrazit po prvním scrollu
    if (scrollY > 240) {
      companion.classList.add('visible');
    } else {
      companion.classList.remove('visible');
    }

    // Vyplnit ring proporčně k progressu
    if (progressRing) {
      progressRing.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
    }

    // Check mark + label na ≥ 90 %
    if (progress >= 0.9) {
      if (checkMark) checkMark.style.strokeDashoffset = '0';
      companion.classList.add('complete');
    } else {
      if (checkMark) checkMark.style.strokeDashoffset = '40';
      companion.classList.remove('complete');
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ============================================
   TESTIMONIALS CAROUSEL — sekce "Lidé Lexia"
   Proklikávání mezi jednotlivými lidmi
   ============================================ */
function initTestimonialsCarousel() {
  const carousel = document.querySelector('[data-testimonials]');
  if (!carousel) return;

  const track = carousel.querySelector('.testimonials-track');
  const slides = Array.from(carousel.querySelectorAll('.testimonial'));
  const dotsWrap = carousel.querySelector('[data-testimonials-dots]');
  const prevBtn = carousel.querySelector('[data-testimonials-prev]');
  const nextBtn = carousel.querySelector('[data-testimonials-next]');
  if (!track || slides.length === 0) return;

  let index = 0;

  // Vytvoř tečky podle počtu lidí
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonials-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Osoba ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => {
      const active = di === index;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    slides.forEach((s, si) => s.setAttribute('aria-hidden', si === index ? 'false' : 'true'));
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(index + 1));

  goTo(0);
}

/* ============================================
   VALIDACE FORMULÁŘŮ
   Prohlížeč sám odeslání zablokuje, my navíc pole zčervenáme
   a odscrollujeme na první nevyplněné.
   ============================================ */
function initFormValidation() {
  // Obal pole, který se má zvýraznit (kvůli radiům a checkboxům v kartách)
  function fieldWrap(el) {
    return el.closest('.form-group, .claim-field, .claim-card, .report-file, .form-row') || el.parentElement;
  }

  function mark(el) {
    el.classList.add('is-invalid');
    const wrap = fieldWrap(el);
    if (wrap) wrap.classList.add('is-invalid');
  }

  function clear(el) {
    if (!el || !el.classList) return;
    el.classList.remove('is-invalid');
    const wrap = fieldWrap(el);
    if (wrap && !wrap.querySelector('.is-invalid')) wrap.classList.remove('is-invalid');
  }

  document.querySelectorAll('form').forEach(form => {
    let first = null;

    // 'invalid' se v prohlížeči spustí pro každé neprošlé pole při odeslání
    form.addEventListener('invalid', e => {
      const el = e.target;
      mark(el);
      if (!first) {
        first = el;
        // Odskok pod sticky hlavičku, ať je pole opravdu vidět
        const header = document.querySelector('.header');
        const offset = (header ? header.offsetHeight : 0) + 24;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        setTimeout(() => el.focus({ preventScroll: true }), 320);
      }
      // Po doběhnutí série 'invalid' událostí se počítadlo resetuje
      setTimeout(() => { first = null; }, 0);
    }, true);

    // Jakmile uživatel pole opraví, červená zmizí
    ['input', 'change'].forEach(evt => {
      form.addEventListener(evt, e => {
        const el = e.target;
        if (el.checkValidity && el.checkValidity()) clear(el);
        // radia sdílí jméno — vyčistit celou skupinu
        if (el.type === 'radio' && el.name) {
          form.querySelectorAll(`input[name="${el.name}"]`).forEach(r => clear(r));
        }
      }, true);
    });
  });
}

/* ============================================
   SCROLL REVEAL — IntersectionObserver
   Auto-tagne hlavní bloky a postupně je odhaluje
   ============================================ */
function initScrollReveal() {
  // Selektory které dostanou .reveal automaticky
  const autoSelectors = [
    '.section-header',
    '.card',
    '.target-card',
    '.testimonial',
    '.step',
    '.price-card',
    '.faq-item',
    '.cta-banner',
    '.stat-card',
    '.steps',
    '.hero-stats',
    '.hero-card',
  ];

  autoSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, idx) => {
      if (el.classList.contains('reveal') || el.classList.contains('reveal-left') || el.classList.contains('reveal-right')) return;
      // Workflow steps mají vlastní reveal logiku (step--workflow / steps--workflow)
      if (el.classList.contains('step--workflow') || el.classList.contains('steps--workflow')) return;
      // Carousel slides (Lidé Lexia) jsou off-screen — reveal by je nechal skryté
      if (el.closest('.testimonials-track')) return;
      el.classList.add('reveal');
      // Stagger pro sourozence ve stejném rodiči
      const delayIdx = Math.min((idx % 6) + 1, 6);
      el.classList.add(`reveal-d${delayIdx}`);
    });
  });

  // Hero text - jemný slide z leva, vizuál z prava
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid) {
    const cols = heroGrid.children;
    if (cols[0] && !cols[0].classList.contains('reveal-left')) cols[0].classList.add('reveal-left');
    if (cols[1] && !cols[1].classList.contains('reveal-right')) cols[1].classList.add('reveal-right');
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .step--workflow, .steps--workflow').forEach(el => el.classList.add('in-view'));
    return;
  }

  // Triggeruje DŘÍVE — element se zobrazí ještě před tím, než plně najede do viewportu
  // rootMargin: '0px 0px 200px 0px' = trigger 200px PŘED vstupem do viewportu (zdola)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .step--workflow, .steps--workflow').forEach(el => observer.observe(el));
}

/* ============================================
   HEADER SCROLL — shadow & background change
   ============================================ */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================
   PARALLAX — jemný pohyb dot patternu v hero
   ============================================ */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const heroRect = hero.getBoundingClientRect();
      // Aktivuje se jen dokud je hero viditelné
      if (heroRect.bottom > 0) {
        const offset = y * 0.18;
        hero.style.setProperty('--parallax-y', `${offset}px`);
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================
   KALKULAČKA
   Pilíře i ceny řeší assets/kalkulacka-katalog.js — ptá se katalogu
   a oceňovacího enginu LEXIA. Ceník se sem NEVRACÍ: dokud tu byl,
   rozešel se s tím, co se prodává (vozidla 129 vs 79 Kč, „další
   nemovitost" pevnou sazbou místo slevy 40 %).
   ============================================ */

/* ============================================
   PŘEDMĚT POJIŠTĚNÍ (krok 2)
   Bloky se zobrazují podle pilířů a doplňků vybraných v kroku 1.
   ============================================ */
window.updateSubjectBlocks = updateSubjectBlocks;
function updateSubjectBlocks() {
  // Roman 1. 9. 2026 (LEX-30): krok 2 vykresluje kalkulačka z katalogu —
  // karty objektů podle vybraných pilířů a specifikace polí, ne natvrdo psané
  // bloky. Tady se jen předá slovo; bez katalogové kalkulačky sekce zůstane
  // schovaná a navigace přejde na rekapitulaci rovnou.
  if (window.LEXIA_CALC && typeof window.LEXIA_CALC.renderSubject === 'function') {
    window.LEXIA_CALC.renderSubject();
    return;
  }
  const section = document.getElementById('subject-section');
  if (section) section.hidden = true;
  const fallbackNav = document.getElementById('subject-fallback-nav');
  if (fallbackNav) fallbackNav.hidden = false;
}
