/* Editor textů — klientská část. Načítá se jen přihlášenému uživateli.
 *
 * Web se v režimu úprav chová jako obyčejný web: odkazy fungují, jde se jím
 * proklikávat. Text se začne upravovat až kliknutím do něj — teprve tehdy
 * dostane ten jeden prvek contenteditable. */
(function () {
  'use strict';

  var CFG = window.__LEXIA_CMS__ || {};
  var PAGE = CFG.page || location.pathname.replace(/^\//, '') || 'index.html';

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-cms-key]'));
  if (!nodes.length) return;

  var original = new Map();   // klíč -> podoba textu při načtení stránky
  var dirty = new Set();      // klíče, do kterých uživatel psal
  var editing = false;        // zapnutý režim úprav
  var active = null;          // prvek, který se právě upravuje
  var bar, countEl, saveBtn, discardBtn, pop, badge, badgeTarget, toastEl;

  // ------------------------------------------------------------- pomocné

  /**
   * Podoba textu k uložení: ikony vrátíme na původní zástupný tvar
   * (assets/icons.js do nich za běhu vloží SVG) a odstraníme pomocné znaky.
   */
  function cleanHtml(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll('[data-icon]').forEach(function (icon) { icon.innerHTML = ''; });
    return clone.innerHTML.replace(/​/g, '');
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

  /** Je celý text prvku schovaný v odkazech? Pak není kam kliknout na úpravu. */
  function isLinkOnly(el) {
    if (el.tagName === 'A') return true;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      if (!node.parentElement.closest('a')) return false;
    }
    return true;
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

    // bublina u právě upravovaného textu
    pop = document.createElement('div');
    pop.className = 'lxe-pop';
    pop.hidden = true;
    pop.innerHTML =
      '<button type="button" data-pop="revert">Vrátit původní text</button>' +
      '<button type="button" data-pop="done">Hotovo</button>';
    document.body.appendChild(pop);
    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pop.addEventListener('click', function (e) {
      if (!active) return;
      if (e.target.closest('[data-pop="done"]')) return stopEditing();
      if (!e.target.closest('[data-pop="revert"]')) return;
      var key = active.getAttribute('data-cms-key');
      if (active.hasAttribute('data-cms-orig')) {
        // text byl někdy dříve upraven — vracíme znění ze zdroje webu
        active.innerHTML = active.getAttribute('data-cms-orig');
        dirty.add(key);
      } else {
        active.innerHTML = original.get(key);
        dirty.delete(key);
      }
      refresh();
      stopEditing();
    });

    // tužka u textů, které jsou celé odkazem (jinak by klik jen přepnul stránku)
    badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'lxe-badge';
    badge.title = 'Upravit tento text';
    badge.textContent = '✎';
    badge.hidden = true;
    document.body.appendChild(badge);
    badge.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (badgeTarget) startEditing(badgeTarget);
      hideBadge();
    });
  }

  function placePop(el) {
    var r = el.getBoundingClientRect();
    pop.hidden = false;
    var top = r.top + window.scrollY - pop.offsetHeight - 8;
    if (top < window.scrollY + 4) top = r.bottom + window.scrollY + 8;
    pop.style.top = top + 'px';
    pop.style.left = Math.max(8, r.left + window.scrollX) + 'px';
  }

  function hidePop() {
    pop.hidden = true;
  }

  function showBadge(el) {
    badgeTarget = el;
    var r = el.getBoundingClientRect();
    badge.hidden = false;
    badge.style.top = (r.top + window.scrollY - 6) + 'px';
    badge.style.left = (r.right + window.scrollX + 4) + 'px';
  }

  function hideBadge() {
    badge.hidden = true;
    badgeTarget = null;
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
    if (!on) {
      stopEditing();
      hideBadge();
    }
    bar.querySelector('[data-act="toggle"]').textContent = on ? 'Ukončit úpravy' : 'Upravit texty';
    if (on && !quiet) toast('Klikněte na text a přepište ho. Odkazy fungují normálně.');
    refresh();
  }

  /** Zapne úpravy jednoho prvku a postaví kurzor tam, kam se kliklo. */
  function startEditing(el, x, y) {
    if (active === el) return;
    stopEditing();
    active = el;
    el.setAttribute('contenteditable', 'true');
    el.focus({ preventScroll: true });

    if (typeof x === 'number' && document.caretRangeFromPoint) {
      var range = document.caretRangeFromPoint(x, y);
      if (range) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    placePop(el);
  }

  function stopEditing() {
    if (!active) return;
    active.removeAttribute('contenteditable');
    active.blur();
    active = null;
    hidePop();
  }

  // klik rozhodne: odkaz = přejít, text = začít upravovat
  document.addEventListener('mousedown', function (e) {
    if (!editing || e.button !== 0) return;
    if (e.target.closest('.lxe-bar, .lxe-pop, .lxe-badge')) return;

    var el = e.target.closest('[data-cms-key]');
    if (!el) return stopEditing();
    if (el === active) return;

    // odkaz uvnitř textu necháme fungovat jako odkaz
    if (e.target.closest('a') && el.contains(e.target.closest('a'))) return stopEditing();

    e.preventDefault();
    startEditing(el, e.clientX, e.clientY);
  }, true);

  // tužka u textů, kam se jinak kliknout nedá
  document.addEventListener('mouseover', function (e) {
    if (!editing) return;
    if (e.target.closest('.lxe-bar, .lxe-pop, .lxe-badge')) return;
    var el = e.target.closest('[data-cms-key]');
    if (!el || el === active || !isLinkOnly(el)) return hideBadge();
    if (el !== badgeTarget) showBadge(el);
  });

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
    if (!editing || !active) return;
    if (e.key === 'Escape') return stopEditing();
    if (e.key === 'Enter') {
      e.preventDefault();
      insertLineBreak();
      markDirty(active);
      refresh();
    }
  });

  document.addEventListener('paste', function (e) {
    if (!active || e.target !== active) return;
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
    markDirty(active);
    refresh();
  });

  document.addEventListener('input', function (e) {
    if (!e.target.hasAttribute || !e.target.hasAttribute('data-cms-key')) return;
    markDirty(e.target);
    refresh();
  });

  window.addEventListener('resize', function () {
    hideBadge();
    if (active) placePop(active);
  });

  window.addEventListener('scroll', function () {
    hideBadge();
    if (active) placePop(active);
  }, { passive: true });

  // ------------------------------------------------------------- ukládání

  function discard() {
    if (!confirm('Zahodit všechny neuložené změny na této stránce?')) return;
    changedNodes().forEach(function (el) {
      el.innerHTML = original.get(el.getAttribute('data-cms-key'));
    });
    dirty.clear();
    stopEditing();
    refresh();
    toast('Neuložené změny zahozeny.');
  }

  function save() {
    var changed = changedNodes();
    if (!changed.length) return;
    stopEditing();

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

      // stránku nepřenačítáme, jen si posuneme "původní podobu"
      var orig = r.data.orig || {};
      changed.forEach(function (el) {
        var key = el.getAttribute('data-cms-key');
        original.set(key, el.innerHTML);
        if (Object.prototype.hasOwnProperty.call(orig, key)) {
          if (orig[key] === null) el.removeAttribute('data-cms-orig');
          else el.setAttribute('data-cms-orig', orig[key]);
        }
      });
      dirty.clear();
      refresh();
      toast('Uloženo. Změny jsou hned na webu.');
    }).catch(function (err) {
      saveBtn.textContent = 'Uložit';
      saveBtn.disabled = false;
      toast(err.message, true);
    });
  }

  function logout() {
    if (changedNodes().length && !confirm('Máte neuložené změny. Opravdu se odhlásit?')) return;
    dirty.clear();
    rememberEditing(false);
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

  // --------------------------------------------------------------- start

  function init() {
    // až po ostatních skriptech webu (icons.js doplňuje SVG do ikon),
    // ať je "původní podoba" opravdu ta, kterou uživatel vidí
    nodes.forEach(function (el) {
      original.set(el.getAttribute('data-cms-key'), el.innerHTML);
    });
    buildBar();
    refresh();

    // ?edit=1 (po přihlášení) nebo pokračování z předchozí stránky
    var wanted = /[?&]edit=1\b/.test(location.search);
    if (wanted) {
      var clean = location.pathname
        + location.search.replace(/([?&])edit=1(&|$)/, '$1').replace(/[?&]$/, '')
        + location.hash;
      history.replaceState(null, '', clean);
    }
    if (wanted || wasEditing()) setEditing(true, true);
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
