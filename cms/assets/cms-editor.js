/* Editor textů — klientská část. Načítá se jen přihlášenému uživateli. */
(function () {
  'use strict';

  var CFG = window.__LEXIA_CMS__ || {};
  var PAGE = CFG.page || location.pathname.replace(/^\//, '') || 'index.html';

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-cms-key]'));
  if (!nodes.length) return;

  var original = new Map();   // klíč -> podoba textu při načtení stránky
  var dirty = new Set();      // klíče, do kterých uživatel opravdu psal
  var editing = false;
  var bar, countEl, saveBtn, discardBtn, pop, popTarget, toastEl;

  // ------------------------------------------------------------- pomocné

  /**
   * Podoba textu k uložení: ikony vrátíme na původní zástupný tvar
   * (assets/icons.js do nich za běhu vloží SVG) a odstraníme pomocné znaky.
   */
  function cleanHtml(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('[data-icon]').forEach(function (icon) { icon.innerHTML = ''; });
    return clone.innerHTML.replace(/\u200b/g, '');
  }

  function isChanged(el) {
    return dirty.has(el.getAttribute('data-cms-key'));
  }

  function markDirty(el) {
    if (el && el.hasAttribute('data-cms-key')) dirty.add(el.getAttribute('data-cms-key'));
  }

  function changedNodes() {
    return nodes.filter(isChanged);
  }

  function refresh() {
    if (!bar) return;
    var changed = changedNodes();
    nodes.forEach(function (el) { el.classList.toggle('lxe-changed', isChanged(el)); });
    countEl.textContent = changed.length ? ' (' + changed.length + ')' : '';
    saveBtn.disabled = changed.length === 0;
    discardBtn.disabled = changed.length === 0;
  }

  function toast(message, isError) {
    toastEl.textContent = message;
    toastEl.className = 'lxe-toast is-on' + (isError ? ' lxe-toast--err' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.className = 'lxe-toast'; }, 3200);
  }

  // ---------------------------------------------------------- ovládací pruh

  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'lxe-bar';
    bar.innerHTML =
      '<span class="lxe-bar__dot"></span>' +
      '<span class="lxe-bar__label">Editor textů<span class="lxe-bar__count"></span></span>' +
      '<button type="button" class="lxe-btn" data-act="toggle">Upravit texty</button>' +
      '<button type="button" class="lxe-btn lxe-btn--save" data-act="save" disabled>Uložit</button>' +
      '<button type="button" class="lxe-btn lxe-btn--ghost" data-act="discard" disabled>Zahodit</button>' +
      '<a class="lxe-btn lxe-btn--ghost" href="/editor">Přehled</a>' +
      '<button type="button" class="lxe-btn lxe-btn--ghost" data-act="logout">Odhlásit</button>';
    document.body.appendChild(bar);

    countEl = bar.querySelector('.lxe-bar__count');
    saveBtn = bar.querySelector('[data-act="save"]');
    discardBtn = bar.querySelector('[data-act="discard"]');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act === 'toggle') setEditing(!editing);
      else if (act === 'save') save();
      else if (act === 'discard') discard();
      else if (act === 'logout') logout();
    });

    toastEl = document.createElement('div');
    toastEl.className = 'lxe-toast';
    document.body.appendChild(toastEl);

    pop = document.createElement('div');
    pop.className = 'lxe-pop';
    pop.hidden = true;
    pop.innerHTML = '<button type="button" data-pop="revert">Vrátit původní text</button>';
    document.body.appendChild(pop);
    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pop.addEventListener('click', function (e) {
      if (!e.target.closest('[data-pop="revert"]') || !popTarget) return;
      var key = popTarget.getAttribute('data-cms-key');
      if (popTarget.hasAttribute('data-cms-orig')) {
        // text byl někdy dříve upraven — vracíme znění ze zdroje webu
        popTarget.innerHTML = popTarget.getAttribute('data-cms-orig');
        dirty.add(key);
      } else {
        popTarget.innerHTML = original.get(key);
        dirty.delete(key);
      }
      refresh();
      hidePop();
    });
  }

  function showPop(el) {
    popTarget = el;
    var r = el.getBoundingClientRect();
    pop.hidden = false;
    var top = r.top + window.scrollY - pop.offsetHeight - 8;
    if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 8;
    pop.style.top = top + 'px';
    pop.style.left = Math.max(8, r.left + window.scrollX) + 'px';
  }

  function hidePop() {
    pop.hidden = true;
    popTarget = null;
  }

  // ---------------------------------------------------------- režim úprav

  function rememberEditing(on) {
    try {
      sessionStorage.setItem('lexia-editing', on ? '1' : '0');
    } catch (err) { /* soukromý režim prohlížeče — nevadí */ }
  }

  function wasEditing() {
    try {
      return sessionStorage.getItem('lexia-editing') === '1';
    } catch (err) {
      return false;
    }
  }

  function setEditing(on, quiet) {
    editing = on;
    rememberEditing(on);
    document.body.classList.toggle('lxe-editing', on);
    nodes.forEach(function (el) {
      if (on) el.setAttribute('contenteditable', 'true');
      else el.removeAttribute('contenteditable');
    });
    bar.querySelector('[data-act="toggle"]').textContent = on ? 'Ukončit úpravy' : 'Upravit texty';
    if (!on) hidePop();
    if (on && !quiet) toast('Klikněte na text a přepište ho. Na jinou stránku přes Přehled.');
    refresh();
  }

  function insertLineBreak() {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    range.deleteContents();
    var br = document.createElement('br');
    range.insertNode(br);
    // za <br> potřebujeme kotvu, jinak kurzor zůstane před ním
    var anchor = document.createTextNode('​');
    br.parentNode.insertBefore(anchor, br.nextSibling);
    range.setStartAfter(anchor);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (editing) save();
      return;
    }
    if (!editing) return;
    if (e.key === 'Escape') { hidePop(); document.activeElement.blur(); return; }
    if (e.key === 'Enter' && e.target.hasAttribute && e.target.hasAttribute('data-cms-key')) {
      e.preventDefault();
      insertLineBreak();
      markDirty(e.target);
      refresh();
    }
  });

  document.addEventListener('paste', function (e) {
    if (!editing || !e.target.hasAttribute || !e.target.hasAttribute('data-cms-key')) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    markDirty(e.target);
    refresh();
  });

  document.addEventListener('input', function (e) {
    if (!e.target.hasAttribute || !e.target.hasAttribute('data-cms-key')) return;
    markDirty(e.target);
    refresh();
  });

  document.addEventListener('focusin', function (e) {
    if (!editing) return;
    var el = e.target.closest && e.target.closest('[data-cms-key]');
    if (el) showPop(el); else hidePop();
  });

  // v režimu úprav klik do odkazu jen postaví kurzor (jinak by se stránka přepnula);
  // s Ctrl/Cmd odkaz normálně funguje, ať jde po webu procházet dál
  document.addEventListener('click', function (e) {
    if (!editing) return;
    if (e.ctrlKey || e.metaKey) return;
    var link = e.target.closest('a');
    if (link && link.closest('[data-cms-key]') && !link.closest('.lxe-bar')) e.preventDefault();
  }, true);

  window.addEventListener('resize', hidePop);

  // ------------------------------------------------------------- ukládání

  function discard() {
    if (!confirm('Zahodit všechny neuložené změny na této stránce?')) return;
    changedNodes().forEach(function (el) {
      el.innerHTML = original.get(el.getAttribute('data-cms-key'));
    });
    dirty.clear();
    hidePop();
    refresh();
    toast('Neuložené změny zahozeny.');
  }

  function save() {
    var changed = changedNodes();
    if (!changed.length) return;
    var payload = {};
    changed.forEach(function (el) {
      payload[el.getAttribute('data-cms-key')] = cleanHtml(el);
    });
    saveBtn.disabled = true;
    saveBtn.textContent = 'Ukládám…';

    fetch('/editor/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: PAGE, changes: payload })
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    }).then(function (r) {
      saveBtn.textContent = 'Uložit';
      if (!r.ok || !r.data.ok) throw new Error((r.data && r.data.error) || 'Uložení selhalo.');
      window.removeEventListener('beforeunload', warnUnsaved);
      toast('Uloženo. Načítám stránku…');
      setTimeout(function () { location.reload(); }, 500);
    }).catch(function (err) {
      saveBtn.textContent = 'Uložit';
      saveBtn.disabled = false;
      toast(err.message, true);
    });
  }

  function logout() {
    var form = document.createElement('form');
    form.method = 'post';
    form.action = '/editor/odhlasit';
    document.body.appendChild(form);
    form.submit();
  }

  function warnUnsaved(e) {
    if (!changedNodes().length) return;
    e.preventDefault();
    e.returnValue = '';
  }
  window.addEventListener('beforeunload', warnUnsaved);

  function init() {
    // až po ostatních skriptech webu (icons.js doplňuje SVG do ikon),
    // ať je "původní podoba" opravdu ta, kterou uživatel vidí
    nodes.forEach(function (el) {
      original.set(el.getAttribute('data-cms-key'), el.innerHTML);
    });
    buildBar();
    refresh();
    // režim úprav přežije proklik na jinou stránku
    if (wasEditing()) setEditing(true, true);
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
