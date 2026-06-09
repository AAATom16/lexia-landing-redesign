/* =========================================================
   LEXIA — Vlastní select (rozbalovací seznam v brand designu)
   Nahrazuje nativní <select class="form-select">. Nativní pole
   zůstává skryté jako nositel hodnoty pro odeslání formuláře;
   výběr se propisuje přes 'input'/'change' eventy, takže
   existující logika (výpočet ceny apod.) funguje dál.
   Sdílí vizuální jazyk s datepickerem (.dp).
   ========================================================= */
(function () {
  'use strict';

  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

  function CustomSelect(select) {
    this.select = select;
    this.options = [];   // { el: button, index: nativeIndex }
    this.active = null;  // index do this.options (klávesová navigace)
    this.build();
  }

  CustomSelect.prototype.build = function () {
    var self = this;
    var select = this.select;

    // Skryj nativní pole, ale zachovej hodnotu pro form
    select.classList.add('ds-native-hidden');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    var wrap = document.createElement('div');
    wrap.className = 'ds';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    var display = document.createElement('button');
    display.type = 'button';
    display.className = 'ds-display';
    display.setAttribute('aria-haspopup', 'listbox');
    wrap.appendChild(display);

    var icon = document.createElement('span');
    icon.className = 'ds-icon';
    icon.innerHTML = CHEVRON;
    wrap.appendChild(icon);

    var pop = document.createElement('div');
    pop.className = 'ds-pop';
    pop.setAttribute('role', 'listbox');
    wrap.appendChild(pop);

    this.wrap = wrap;
    this.display = display;
    this.pop = pop;

    this.renderOptions();
    this.renderDisplay();

    display.addEventListener('click', function (e) {
      e.preventDefault();
      self.toggle();
    });
    display.addEventListener('keydown', function (e) { self.onKey(e); });

    document.addEventListener('click', function (e) {
      if (self.isOpen && !wrap.contains(e.target)) self.close();
    });
  };

  CustomSelect.prototype.renderOptions = function () {
    var self = this;
    this.pop.innerHTML = '';
    this.options = [];
    Array.prototype.forEach.call(this.select.children, function (child) {
      if (child.tagName === 'OPTGROUP') {
        var label = document.createElement('div');
        label.className = 'ds-group-label';
        label.textContent = child.label;
        self.pop.appendChild(label);
        Array.prototype.forEach.call(child.children, function (opt) {
          if (opt.tagName === 'OPTION') self.addOption(opt, true);
        });
      } else if (child.tagName === 'OPTION') {
        self.addOption(child, false);
      }
    });
  };

  CustomSelect.prototype.addOption = function (opt, grouped) {
    var self = this;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ds-option' + (grouped ? ' ds-option--grouped' : '');
    btn.setAttribute('role', 'option');
    btn.textContent = opt.textContent;
    if (opt.disabled) btn.disabled = true;
    var idx = opt.index;
    var item = { el: btn, index: idx };
    btn.addEventListener('click', function () { if (!opt.disabled) self.pick(idx); });
    btn.addEventListener('mouseenter', function () { self.setActive(self.options.indexOf(item)); });
    this.options.push(item);
    this.pop.appendChild(btn);
  };

  CustomSelect.prototype.renderDisplay = function () {
    var sel = this.select.options[this.select.selectedIndex];
    this.display.textContent = sel ? sel.textContent : '';
    this.display.classList.toggle('is-placeholder', !sel || sel.value === '');
    var selIdx = this.select.selectedIndex;
    this.options.forEach(function (it) {
      it.el.classList.toggle('is-selected', it.index === selIdx);
    });
  };

  CustomSelect.prototype.toggle = function () { this.isOpen ? this.close() : this.open(); };

  CustomSelect.prototype.open = function () {
    this.wrap.classList.add('is-open');
    this.isOpen = true;
    var selIdx = this.select.selectedIndex;
    var activeI = -1;
    this.options.forEach(function (it, i) { if (it.index === selIdx) activeI = i; });
    this.setActive(activeI);
    if (this.active != null && this.active >= 0 && this.options[this.active]) {
      this.options[this.active].el.scrollIntoView({ block: 'nearest' });
    }
  };

  CustomSelect.prototype.close = function () {
    this.wrap.classList.remove('is-open');
    this.isOpen = false;
  };

  CustomSelect.prototype.setActive = function (i) {
    if (this.active != null && this.options[this.active]) {
      this.options[this.active].el.classList.remove('is-active');
    }
    this.active = i;
    if (i != null && i >= 0 && this.options[i]) {
      this.options[i].el.classList.add('is-active');
    }
  };

  CustomSelect.prototype.pick = function (idx) {
    this.select.selectedIndex = idx;
    this.renderDisplay();
    this.select.dispatchEvent(new Event('input', { bubbles: true }));
    this.select.dispatchEvent(new Event('change', { bubbles: true }));
    this.close();
    this.display.focus();
  };

  CustomSelect.prototype.moveActive = function (dir) {
    var i = (this.active == null ? -1 : this.active);
    do {
      i += dir;
      if (i < 0) { i = 0; break; }
      if (i > this.options.length - 1) { i = this.options.length - 1; break; }
    } while (this.options[i] && this.options[i].el.disabled);
    // přeskoč disabled v platném rozsahu
    while (this.options[i] && this.options[i].el.disabled && i > 0 && i < this.options.length - 1) {
      i += dir;
    }
    this.setActive(i);
    if (this.options[i]) this.options[i].el.scrollIntoView({ block: 'nearest' });
  };

  CustomSelect.prototype.onKey = function (e) {
    if (e.key === 'Escape') { if (this.isOpen) this.close(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.isOpen) { this.open(); return; }
      this.moveActive(e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!this.isOpen) { this.open(); return; }
      if (this.active != null && this.options[this.active] && !this.options[this.active].el.disabled) {
        this.pick(this.options[this.active].index);
      }
      return;
    }
  };

  function init(root) {
    var scope = root || document;
    var selects = scope.querySelectorAll('select.form-select:not([data-ds-ready])');
    Array.prototype.forEach.call(selects, function (sel) {
      sel.setAttribute('data-ds-ready', '1');
      try { new CustomSelect(sel); } catch (e) { /* fallback: nativní select zůstává funkční */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  window.LexiaSelect = { init: init };
})();
