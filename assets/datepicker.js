/* =========================================================
   LEXIA — Vlastní datepicker (kalendář v brand designu)
   Nahrazuje nativní <input type="date">. Nativní pole zůstává
   skryté jako nositel ISO hodnoty (YYYY-MM-DD) pro odeslání
   formuláře; změny se propisují přes 'input'/'change' eventy,
   takže existující logika (výpočet ceny apod.) funguje dál.
   ========================================================= */
(function () {
  'use strict';

  var MONTHS = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
    'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
  var WEEKDAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  var CHEVRON_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  var CHEVRON_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  var CAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) {
    if (!s) return null;
    var p = s.split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }
  function fmtCZ(d) { return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear(); }
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

  function DatePicker(input) {
    this.input = input;
    this.min = parseISO(input.getAttribute('min'));
    this.max = parseISO(input.getAttribute('max'));
    this.selected = parseISO(input.value);
    var today = startOfDay(new Date());
    var base = this.selected || this.min || today;
    this.viewYear = base.getFullYear();
    this.viewMonth = base.getMonth();
    this.mode = 'days';
    this.build();
  }

  DatePicker.prototype.build = function () {
    var self = this;
    var input = this.input;

    // Skryj nativní pole, ale zachovej name/hodnotu pro form
    input.classList.add('dp-native-hidden');
    input.setAttribute('tabindex', '-1');
    input.setAttribute('aria-hidden', 'true');

    var wrap = document.createElement('div');
    wrap.className = 'dp';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var display = document.createElement('button');
    display.type = 'button';
    display.className = 'dp-display';
    display.setAttribute('aria-haspopup', 'dialog');
    wrap.appendChild(display);

    var icon = document.createElement('span');
    icon.className = 'dp-icon';
    icon.innerHTML = CAL_ICON;
    wrap.appendChild(icon);

    var pop = document.createElement('div');
    pop.className = 'dp-pop';
    pop.setAttribute('role', 'dialog');
    wrap.appendChild(pop);

    this.wrap = wrap;
    this.display = display;
    this.pop = pop;
    this.placeholder = input.getAttribute('data-placeholder') || 'Vyberte datum';

    this.renderDisplay();
    this.renderPop();

    display.addEventListener('click', function (e) {
      e.preventDefault();
      self.toggle();
    });

    document.addEventListener('click', function (e) {
      if (self.isOpen && !wrap.contains(e.target)) self.close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.isOpen) { self.close(); display.focus(); }
    });
  };

  DatePicker.prototype.renderDisplay = function () {
    if (this.selected) {
      this.display.textContent = fmtCZ(this.selected);
      this.display.classList.remove('is-placeholder');
    } else {
      this.display.textContent = this.placeholder;
      this.display.classList.add('is-placeholder');
    }
  };

  DatePicker.prototype.toggle = function () { this.isOpen ? this.close() : this.open(); };

  DatePicker.prototype.open = function () {
    if (this.selected) { this.viewYear = this.selected.getFullYear(); this.viewMonth = this.selected.getMonth(); }
    this.mode = 'days';
    this.renderPop();
    this.wrap.classList.add('is-open');
    this.isOpen = true;
  };

  DatePicker.prototype.close = function () {
    this.wrap.classList.remove('is-open');
    this.isOpen = false;
  };

  DatePicker.prototype.disabled = function (d) {
    if (this.min && d < startOfDay(this.min)) return true;
    if (this.max && d > startOfDay(this.max)) return true;
    return false;
  };

  DatePicker.prototype.pick = function (d) {
    this.selected = d;
    this.input.value = toISO(d);
    this.renderDisplay();
    // propiš změnu do existující logiky
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    this.close();
  };

  DatePicker.prototype.renderPop = function () {
    if (this.mode === 'years') { this.renderYears(); return; }
    var self = this;
    var pop = this.pop;
    pop.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'dp-head';

    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'dp-nav'; prev.innerHTML = CHEVRON_L;
    prev.setAttribute('aria-label', 'Předchozí měsíc');
    prev.addEventListener('click', function () { self.shiftMonth(-1); });

    var title = document.createElement('button');
    title.type = 'button'; title.className = 'dp-title';
    title.textContent = MONTHS[this.viewMonth] + ' ' + this.viewYear;
    title.addEventListener('click', function () { self.mode = 'years'; self.renderPop(); });

    var next = document.createElement('button');
    next.type = 'button'; next.className = 'dp-nav'; next.innerHTML = CHEVRON_R;
    next.setAttribute('aria-label', 'Další měsíc');
    next.addEventListener('click', function () { self.shiftMonth(1); });

    head.appendChild(prev); head.appendChild(title); head.appendChild(next);
    pop.appendChild(head);

    var week = document.createElement('div');
    week.className = 'dp-week';
    WEEKDAYS.forEach(function (w) { var s = document.createElement('span'); s.textContent = w; week.appendChild(s); });
    pop.appendChild(week);

    var grid = document.createElement('div');
    grid.className = 'dp-grid';

    var first = new Date(this.viewYear, this.viewMonth, 1);
    var offset = (first.getDay() + 6) % 7; // pondělí = 0
    var daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    var prevDays = new Date(this.viewYear, this.viewMonth, 0).getDate();
    var today = startOfDay(new Date());

    for (var i = 0; i < 42; i++) {
      var dayNum, mShift;
      if (i < offset) { dayNum = prevDays - offset + 1 + i; mShift = -1; }
      else if (i >= offset + daysInMonth) { dayNum = i - offset - daysInMonth + 1; mShift = 1; }
      else { dayNum = i - offset + 1; mShift = 0; }

      var d = new Date(this.viewYear, this.viewMonth + mShift, dayNum);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-day';
      btn.textContent = dayNum;
      if (mShift !== 0) btn.classList.add('is-muted');
      if (sameDay(d, today)) btn.classList.add('is-today');
      if (sameDay(d, this.selected)) btn.classList.add('is-selected');
      if (this.disabled(d)) {
        btn.classList.add('is-disabled');
        btn.disabled = true;
      } else {
        (function (dd) {
          btn.addEventListener('click', function () { self.pick(dd); });
        })(d);
      }
      grid.appendChild(btn);
    }
    pop.appendChild(grid);

    // Patička — Dnes
    var foot = document.createElement('div');
    foot.className = 'dp-foot';
    var todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.textContent = 'Dnes';
    todayBtn.addEventListener('click', function () {
      if (!self.disabled(today)) self.pick(today);
      else { self.viewYear = today.getFullYear(); self.viewMonth = today.getMonth(); self.renderPop(); }
    });
    foot.appendChild(todayBtn);
    if (this.selected) {
      var clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.textContent = 'Vymazat';
      clearBtn.addEventListener('click', function () {
        self.selected = null; self.input.value = '';
        self.renderDisplay();
        self.input.dispatchEvent(new Event('change', { bubbles: true }));
        self.renderPop();
      });
      foot.appendChild(clearBtn);
    }
    pop.appendChild(foot);
  };

  DatePicker.prototype.renderYears = function () {
    var self = this;
    var pop = this.pop;
    pop.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'dp-head';
    var prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'dp-nav'; prev.innerHTML = CHEVRON_L;
    prev.addEventListener('click', function () { self.yearPage -= 24; self.renderYears(); });
    var title = document.createElement('button');
    title.type = 'button'; title.className = 'dp-title';
    var next = document.createElement('button');
    next.type = 'button'; next.className = 'dp-nav'; next.innerHTML = CHEVRON_R;
    next.addEventListener('click', function () { self.yearPage += 24; self.renderYears(); });
    head.appendChild(prev); head.appendChild(title); head.appendChild(next);
    pop.appendChild(head);

    if (this.yearPage == null) this.yearPage = this.viewYear;
    var start = this.yearPage - 11;
    var maxY = this.max ? this.max.getFullYear() : 2100;
    var minY = this.min ? this.min.getFullYear() : 1900;
    title.textContent = start + ' – ' + (start + 23);

    var years = document.createElement('div');
    years.className = 'dp-years';
    for (var y = start; y < start + 24; y++) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dp-year'; b.textContent = y;
      if (y === this.viewYear) b.classList.add('is-selected');
      if (y < minY || y > maxY) { b.disabled = true; b.style.opacity = 0.4; b.style.cursor = 'not-allowed'; }
      else {
        (function (yy) {
          b.addEventListener('click', function () {
            self.viewYear = yy; self.mode = 'days'; self.renderPop();
          });
        })(y);
      }
      years.appendChild(b);
    }
    pop.appendChild(years);
  };

  DatePicker.prototype.shiftMonth = function (delta) {
    this.viewMonth += delta;
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
    else if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
    this.renderPop();
  };

  function init(root) {
    var scope = root || document;
    var inputs = scope.querySelectorAll('input[type="date"]:not([data-dp-ready])');
    Array.prototype.forEach.call(inputs, function (inp) {
      inp.setAttribute('data-dp-ready', '1');
      try { new DatePicker(inp); } catch (e) { /* fallback: nativní pole zůstává funkční */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.LexiaDatePicker = { init: init };
})();
