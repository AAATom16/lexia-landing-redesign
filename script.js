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

  // Calculator
  initCalculator();

  // Calculator wizard (multi-step)
  initCalcWizard();

  // Scroll companion - life ring se postupně sestavuje
  initScrollCompanion();
});

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
    syncEcho();
    // Smooth scroll to top of step
    window.scrollTo({ top: stepper.offsetTop - 100, behavior: 'smooth' });
  }

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
      const houseNum = get('houseNum');
      const city = get('city');
      const zip = get('zip');

      const fullName = [firstName, lastName].filter(Boolean).join(' ') || '—';
      const fullAddress = [
        [street, houseNum].filter(Boolean).join(' '),
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

    // Sync vybraných pilířů do rekapitulace
    if (sumPillars) {
      document.querySelectorAll('[data-echo="pillars-list"]').forEach(el => {
        el.innerHTML = sumPillars.innerHTML;
      });
    }

    // Vypočítej měsíční/roční (roční = 11× měsíční → 12. měsíc zdarma)
    if (total) {
      const YEARLY_MONTHS = 11;
      const num = parseInt(totalText.replace(/\D/g, ''), 10) || 0;
      const monthly = periodValue === 'rocni' ? Math.round(num / YEARLY_MONTHS) : num;
      const yearly = periodValue === 'rocni' ? num : num * YEARLY_MONTHS;
      document.querySelectorAll('[data-echo="month-total"]').forEach(el => el.textContent = monthly.toLocaleString('cs-CZ') + ' Kč');
      document.querySelectorAll('[data-echo="year-total"]').forEach(el => el.textContent = yearly.toLocaleString('cs-CZ') + ' Kč');
    }
  }

  // Sync při změně v kalkulačce i contact formu
  document.querySelectorAll('#calc-form input, #calc-form select, #contract-form input, #contract-form select').forEach(el => {
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
      sub: 'Základní právní ochrana, bydlení i řidiči v jednom — nejvýhodnější kombinace. Vyplňte své údaje a sjednejte si pojištění online. Rozsah krytí i cenu můžete kdykoliv upravit přes <strong>Zpět ke kalkulaci</strong>.',
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
   KALKULAČKA - Lexia Jednotlivci a domácnosti
   Měsíční ceny v Kč dle excelu
   ============================================ */

// Ceny pilířů: [jednotlivec, domacnost]
const PILLAR_PRICES = {
  zakladni:    { j: 179, d: 269, label: 'Základní právní ochrana' },
  vozidla:     { j: 129, d: 169, label: 'Vozidla a řidiči' },
  prace:       { j:  79, d:  99, label: 'Pracovněprávní ochrana' },
  nemovitost:  { j: 139, d: 159, label: 'Dům, byt, chata' },
};

// Doplňkové pilíře - pevná sazba
const ADDON_VYSTAVBA = 819; // měsíčně, stejné pro J i D

// Samostatné objekty - sazby měsíčně
const OBJEKTY_PRICES = {
  '100':     { j:  49, d:  59, label: 'Samostatné objekty do 100 m²' },
  '500':     { j: 139, d: 159, label: 'Samostatné objekty do 500 m²' },
  '500plus': { j:   0, d:   0, label: 'Samostatné objekty nad 500 m² (individuální)' },
};

const NAJEMCI_SURCHARGE = 0.20; // +20%

function initCalculator() {
  const form = document.getElementById('calc-form');
  if (!form) return;

  // Toggle .selected class on calc-options pomocí native 'change' eventu
  // (browser sám handluje toggle checkboxu/radia, my jen aktualizujeme styly)
  form.querySelectorAll('.calc-option input').forEach(input => {
    input.addEventListener('change', () => {
      if (input.disabled) return;
      const opt = input.closest('.calc-option');
      if (!opt) return;

      if (input.type === 'radio') {
        form.querySelectorAll(`.calc-option input[name="${input.name}"]`).forEach(i => {
          const sib = i.closest('.calc-option');
          if (sib) sib.classList.toggle('selected', i.checked);
        });
      } else if (input.type === 'checkbox') {
        opt.classList.toggle('selected', input.checked);
      }
      updateCalculator();
    });
  });

  // Toggle detail sections
  const toggleDetail = (checkboxId, detailId) => {
    const cb = document.getElementById(checkboxId);
    const detail = document.getElementById(detailId);
    if (cb && detail) {
      cb.addEventListener('change', () => {
        detail.style.display = cb.checked ? 'block' : 'none';
        updateCalculator();
      });
    }
  };
  toggleDetail('addon-vykon', 'vykon-detail');
  toggleDetail('addon-objekty', 'objekty-detail');
  toggleDetail('addon-parcely', 'parcely-detail');

  // Show/hide spory s nájemci box based on pillar_nemovitost
  const nemoCheckbox = document.querySelector('input[name="pillar_nemovitost"]');
  const najemciBox = document.getElementById('najemci-box');
  if (nemoCheckbox && najemciBox) {
    nemoCheckbox.addEventListener('change', () => {
      najemciBox.style.display = nemoCheckbox.checked ? 'block' : 'none';
      if (!nemoCheckbox.checked) document.getElementById('najemci-check').checked = false;
      updateCalculator();
    });
  }

  // Listen to all inputs/selects for changes
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', updateCalculator);
    if (el.type === 'number') el.addEventListener('input', updateCalculator);
  });

  // Addon options (sekce 3) - klik na label přepne checkbox (label sám už to umí, ale syncujeme update)
  form.querySelectorAll('.addon-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateCalculator);
  });

  // Update price labels when variant changes
  form.querySelectorAll('input[name="variant"]').forEach(r => {
    r.addEventListener('change', updateVariantLabels);
  });

  updateVariantLabels();
  updateCalculator();
}

function updateVariantLabels() {
  const variant = document.querySelector('input[name="variant"]:checked')?.value || 'jednotlivec';
  document.querySelectorAll('.px-label').forEach(el => {
    el.textContent = variant === 'domacnost' ? el.dataset.d : el.dataset.j;
  });
}

function updateCalculator() {
  const variant = document.querySelector('input[name="variant"]:checked')?.value || 'jednotlivec';
  const v = variant === 'domacnost' ? 'd' : 'j';
  const period = document.querySelector('input[name="period"]:checked')?.value || 'mesicni';

  let total = 0;
  const lines = [];

  // === ZÁKLADNÍ PILÍŘE ===
  // Základní (povinný)
  total += PILLAR_PRICES.zakladni[v];
  lines.push({ name: PILLAR_PRICES.zakladni.label, price: PILLAR_PRICES.zakladni[v] });

  // Vozidla
  if (document.querySelector('input[name="pillar_vozidla"]')?.checked) {
    total += PILLAR_PRICES.vozidla[v];
    lines.push({ name: PILLAR_PRICES.vozidla.label, price: PILLAR_PRICES.vozidla[v] });
  }
  // Práce
  if (document.querySelector('input[name="pillar_prace"]')?.checked) {
    total += PILLAR_PRICES.prace[v];
    lines.push({ name: PILLAR_PRICES.prace.label, price: PILLAR_PRICES.prace[v] });
  }
  // Nemovitost
  let nemoPrice = 0;
  if (document.querySelector('input[name="pillar_nemovitost"]')?.checked) {
    nemoPrice = PILLAR_PRICES.nemovitost[v];
    total += nemoPrice;
    lines.push({ name: PILLAR_PRICES.nemovitost.label, price: nemoPrice });
    // Spory s nájemci - příplatek 20% z nemovitosti
    if (document.getElementById('najemci-check')?.checked) {
      const surcharge = Math.round(nemoPrice * NAJEMCI_SURCHARGE);
      total += surcharge;
      lines.push({ name: '↳ Spory s nájemci (+20 %)', price: surcharge });
    }
  }

  // === DOPLŇKOVÉ PILÍŘE ===
  // Výkon funkce
  if (document.getElementById('addon-vykon')?.checked) {
    const funkceMin = parseFloat(document.getElementById('vykon-funkce')?.value || 0);
    const odmena = parseFloat(document.getElementById('vykon-odmena')?.value || 0);
    if (funkceMin > 0) {
      // 0,25 % z roční odměny / 12 = měsíční sazba ze sporné částky
      const calcMonthly = Math.round((odmena * 0.0025) / 12);
      const finalMonthly = Math.max(funkceMin, calcMonthly);
      total += finalMonthly;
      lines.push({ name: 'Výkon funkce', price: finalMonthly });
    }
  }

  // Nemovitost ve výstavbě
  if (document.querySelector('input[name="addon_vystavba"]')?.checked) {
    total += ADDON_VYSTAVBA;
    lines.push({ name: 'Nemovitost ve výstavbě', price: ADDON_VYSTAVBA });
  }

  // Samostatné objekty
  if (document.getElementById('addon-objekty')?.checked) {
    const size = document.querySelector('input[name="objekty_size"]:checked')?.value;
    if (size && OBJEKTY_PRICES[size]) {
      let objPrice = OBJEKTY_PRICES[size][v];
      if (size === '500plus') {
        lines.push({ name: OBJEKTY_PRICES[size].label, price: null });
      } else {
        total += objPrice;
        lines.push({ name: OBJEKTY_PRICES[size].label, price: objPrice });
        if (document.querySelector('input[name="objekty_najemci"]')?.checked) {
          const surcharge = Math.round(objPrice * NAJEMCI_SURCHARGE);
          total += surcharge;
          lines.push({ name: '↳ Spory s nájemci (+20 %)', price: surcharge });
        }
      }
    }
  }

  // Samostatné parcely
  if (document.getElementById('addon-parcely')?.checked) {
    const rate = parseFloat(document.getElementById('parcela-typ')?.value || 0);
    const m2 = parseFloat(document.getElementById('parcela-m2')?.value || 0);
    if (rate > 0 && m2 > 0) {
      let parcelyPrice = Math.round(rate * m2);
      total += parcelyPrice;
      const typLabel = rate === 0.04 ? 'Stavební parcela' : 'Pozemková parcela';
      lines.push({ name: `${typLabel} (${m2.toLocaleString('cs-CZ')} m²)`, price: parcelyPrice });
      if (document.querySelector('input[name="parcely_najemci"]')?.checked) {
        const surcharge = Math.round(parcelyPrice * NAJEMCI_SURCHARGE);
        total += surcharge;
        lines.push({ name: '↳ Spory s nájemci (+20 %)', price: surcharge });
      }
    }
  }

  // === FREKVENCE PLATBY ===
  // Roční pojistné = 11 × měsíční → 12. měsíc zdarma (sleva ~8,3 %), dle ceníku LEXIA.
  const YEARLY_MONTHS = 11;
  const periodMultiplier = period === 'rocni' ? YEARLY_MONTHS : 1;
  const finalTotal = total * periodMultiplier;
  const yearlySaving = total;             // ušetřená 1 měsíční platba při roční úhradě
  const periodLabel = period === 'rocni' ? 'ročně' : 'měsíčně';

  // === RENDER SOUHRNU ===
  document.getElementById('sum-variant').textContent = variant === 'domacnost' ? 'Domácnost' : 'Jednotlivec';
  document.getElementById('sum-period').textContent = periodLabel;
  document.getElementById('sum-period-label').textContent = periodLabel;
  document.getElementById('sum-total').textContent = finalTotal.toLocaleString('cs-CZ') + ' Kč';

  // Řádek s roční úsporou — viditelný jen při roční platbě
  const savingEl = document.getElementById('sum-saving');
  if (savingEl) {
    savingEl.hidden = period !== 'rocni';
    const amt = savingEl.querySelector('strong');
    if (amt) amt.textContent = yearlySaving.toLocaleString('cs-CZ') + ' Kč';
  }

  // Render seznamu pilířů
  const pillarsList = document.getElementById('sum-pillars');
  if (pillarsList) {
    pillarsList.innerHTML = lines.map(l => {
      const priceText = l.price === null
        ? '<span style="float: right; opacity: 0.9; font-size: 0.85rem;">indiv.</span>'
        : `<span style="float: right; opacity: 0.9;">${l.price.toLocaleString('cs-CZ')} Kč</span>`;
      return `<li style="padding: 4px 0;">${l.name} ${priceText}</li>`;
    }).join('');
  }
}
