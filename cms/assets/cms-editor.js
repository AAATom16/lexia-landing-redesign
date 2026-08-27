/* Editor textů — klientská část. Načítá se jen přihlášenému uživateli.
 *
 * V režimu úprav se web nikam nepřepíná — klik do textu jen postaví kurzor,
 * i když je ten text odkaz nebo tlačítko. Web se zase rozchodí po kliknutí
 * na "Ukončit úpravy". Contenteditable dostane vždy jen ten jeden text,
 * do kterého se kliklo. */
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
  var bar, countEl, saveBtn, discardBtn, pop, toastEl, authBox;

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
      '<a class="lxe-btn lxe-btn--ghost" href="/editor/stranky">Přehled</a>' +
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
    if (!on) stopEditing();
    bar.querySelector('[data-act="toggle"]').textContent = on ? 'Ukončit úpravy' : 'Upravit texty';
    if (on && !quiet) toast('Klikněte na text a přepište ho. Na jinou stránku přes Ukončit úpravy.');
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

  const inEditorUi = (el) => !!(el.closest && el.closest('.lxe-bar, .lxe-pop, .lxe-toast, .lxe-auth'));

  /** Přepínače rozbalovacích detailů musí fungovat i při úpravách. */
  const isToggle = (el) => !!(el.closest && el.closest('[aria-controls],[data-detail-toggle]'));

  /**
   * Id panelů, které nějaké tlačítko na stránce rozbaluje.
   * Stránky si detaily zavírají klikem "někam vedle" — jenže při úpravách
   * je takovým klikem i postavení kurzoru do textu uvnitř panelu. Klik
   * uvnitř panelu proto dál nepouštíme a detail zůstane otevřený.
   */
  var panelIds = null;

  function detailPanelIds() {
    if (panelIds) return panelIds;
    panelIds = Object.create(null);
    document.querySelectorAll('[aria-controls],[data-detail-toggle]').forEach(function (btn) {
      var ids = btn.getAttribute('aria-controls') || btn.getAttribute('data-detail-toggle') || '';
      ids.split(/\s+/).forEach(function (id) { if (id) panelIds[id] = true; });
    });
    return panelIds;
  }

  function inDetailPanel(el) {
    var ids = detailPanelIds();
    for (var node = el; node && node.nodeType === 1; node = node.parentElement) {
      if (node.id && ids[node.id]) return true;
    }
    return false;
  }

  /**
   * Otázka v často kladených otázkách je sama editovatelný text, ale dokud je
   * odpověď sbalená (max-height: 0), nejde na její text kliknout. První klik
   * proto necháme projít a odpověď se rozbalí; u rozbalené otázky už klik
   * staví kurzor a jde přepsat i samotná otázka.
   */
  function isCollapsedFaq(el) {
    var q = el.closest && el.closest('.faq-question');
    return !!(q && q.parentElement && !q.parentElement.classList.contains('active'));
  }

  /** Ovládací prvky uvnitř panelu (třeba "Skrýt detail") musí zůstat funkční. */
  const isControl = (el) => !!(el.closest && el.closest('button, a, input, label, select, summary, [role="button"]'));

  // v režimu úprav klik do textu jen postaví kurzor
  document.addEventListener('mousedown', function (e) {
    if (!editing || e.button !== 0 || e.ctrlKey || e.metaKey) return;
    if (inEditorUi(e.target) || isToggle(e.target) || isCollapsedFaq(e.target)) return;

    var el = e.target.closest('[data-cms-key]');
    if (!el) return stopEditing();
    if (el === active) return;

    e.preventDefault();
    startEditing(el, e.clientX, e.clientY);
  }, true);

  // ...a stránka se nikam nepřepne, ani se nespustí tlačítko pod textem
  document.addEventListener('click', function (e) {
    if (!editing || e.ctrlKey || e.metaKey) return;
    if (inEditorUi(e.target) || isToggle(e.target) || isCollapsedFaq(e.target)) return;
    if (!e.target.closest('[data-cms-key]')) {
      // klik vedle textu uvnitř rozbaleného detailu ho nesmí zavřít,
      // tlačítka a odkazy uvnitř panelu ale musí dál fungovat
      if (!inDetailPanel(e.target) || isControl(e.target)) return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, true);

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
    if (active) placePop(active);
  });

  window.addEventListener('scroll', function () {
    if (active) placePop(active);
  }, { passive: true });

  // ------------------------------------------- přihlášení nad rozdělanou prací

  /**
   * Když přihlášení mezitím vypršelo, nesmíme uživatele poslat na
   * přihlašovací stránku — přišel by o neuložené texty. Zeptáme se na heslo
   * rovnou tady a po přihlášení plynule dokončíme, co dělal.
   */
  function askLogin(message, afterLogin) {
    if (!authBox) buildAuthBox();
    authBox.__after = afterLogin;
    authBox.querySelector('.lxe-auth__msg').textContent = message;
    authBox.querySelector('.lxe-auth__err').textContent = '';
    authBox.hidden = false;
    var input = authBox.querySelector('input');
    input.value = '';
    input.focus();
  }

  function buildAuthBox() {
    authBox = document.createElement('div');
    authBox.className = 'lxe-auth';
    authBox.hidden = true;
    authBox.innerHTML =
      '<div class="lxe-auth__card">' +
      '<strong class="lxe-auth__title">Přihlášení vypršelo</strong>' +
      '<p class="lxe-auth__msg"></p>' +
      '<p class="lxe-auth__note">Vaše rozepsané texty zůstávají na stránce, nikam se neztratily.</p>' +
      '<label class="lxe-auth__label">Heslo do editoru' +
      '<input type="password" autocomplete="current-password"></label>' +
      '<p class="lxe-auth__err"></p>' +
      '<div class="lxe-auth__row">' +
      '<button type="button" class="lxe-btn" data-auth="ok">Přihlásit a pokračovat</button>' +
      '<button type="button" class="lxe-btn lxe-btn--ghost" data-auth="cancel">Zavřít</button>' +
      '</div></div>';
    document.body.appendChild(authBox);

    var input = authBox.querySelector('input');
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitLogin(); }
      if (e.key === 'Escape') { e.preventDefault(); authBox.hidden = true; }
    });
    authBox.addEventListener('click', function (e) {
      if (e.target.closest('[data-auth="cancel"]')) authBox.hidden = true;
      else if (e.target.closest('[data-auth="ok"]')) submitLogin();
    });
  }

  function submitLogin() {
    var input = authBox.querySelector('input');
    var err = authBox.querySelector('.lxe-auth__err');
    var btn = authBox.querySelector('[data-auth="ok"]');
    if (!input.value) { err.textContent = 'Zadejte heslo.'; return; }
    btn.disabled = true;
    btn.textContent = 'Přihlašuji…';

    postJson('/editor/api/prihlaseni', { heslo: input.value }).then(function (r) {
      btn.disabled = false;
      btn.textContent = 'Přihlásit a pokračovat';
      if (!r.ok || !r.data.ok) {
        err.textContent = (r.data && r.data.error) || 'Přihlášení se nepovedlo.';
        input.select();
        return;
      }
      authBox.hidden = true;
      var after = authBox.__after;
      authBox.__after = null;
      if (after) after();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Přihlásit a pokračovat';
      err.textContent = 'Server neodpovídá. Zkuste to prosím znovu.';
    });
  }

  /** POST s JSON tělem; odpověď vrátíme i tehdy, když to JSON není. */
  function postJson(url, body) {
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text); } catch (err) { data = { error: text.slice(0, 200) }; }
        return { ok: res.ok, status: res.status, data: data };
      });
    });
  }

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

    postJson('/editor/api/save', { page: PAGE, changes: payload }).then(function (r) {
      saveBtn.textContent = 'Uložit';

      // relace vypršela — texty na stránce necháme být a po přihlášení uložíme
      if (r.status === 401) {
        saveBtn.disabled = false;
        askLogin('Přihlášení do editoru vypršelo, proto se texty neuložily. Zadejte heslo a uložíme je hned teď.', save);
        return;
      }
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

    if (CFG.storageError) {
      toast('Pozor: úpravy se neuloží — serveru chybí úložiště. Podrobnosti v Přehledu.', true);
      saveBtn.title = 'Server nemůže ukládat — chybí úložiště (na Railway Volume na /data)';
    }

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
