/* La Gauche Bebew — comportements du thème (sans dépendance). */
(function () {
  'use strict';

  var theme = window.theme || { routes: {}, strings: {} };
  var S = theme.strings || {};
  var routes = theme.routes || {};
  var root = routes.root || '/';

  /* ---------- Utilitaires ---------- */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatMoney(cents) {
    var format = theme.moneyFormat || '{{amount_with_comma_separator}} €';
    var value = (Number(cents) || 0) / 100;
    function fmt(n, decimals, thousands, dec) {
      var parts = n.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return parts.join(dec);
    }
    var out = format.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount': return fmt(value, 2, ',', '.');
        case 'amount_no_decimals': return fmt(value, 0, ',', '.');
        case 'amount_with_comma_separator': return fmt(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return fmt(value, 0, '.', ',');
        case 'amount_with_space_separator': return fmt(value, 2, ' ', ',');
        case 'amount_with_apostrophe_separator': return fmt(value, 2, "'", '.');
        default: return fmt(value, 2, '.', ',');
      }
    });
    // équivalent de money_without_trailing_zeros
    return out.replace(/[.,]00(?!\d)/, '');
  }

  function sectionIds() {
    // header (compteur + barre d'offre) et page panier si on y est
    return $$('[data-header][data-section-id], [data-cart-section][data-section-id]')
      .map(function (el) { return el.getAttribute('data-section-id'); })
      .filter(function (id, i, arr) { return id && arr.indexOf(id) === i; });
  }

  /* Remplace chaque [data-refresh="x"] de la page par sa nouvelle version. */
  function refreshFromSections(sections) {
    if (!sections) return;
    var parser = new DOMParser();
    Object.keys(sections).forEach(function (id) {
      if (!sections[id]) return;
      var doc = parser.parseFromString(sections[id], 'text/html');
      $$('[data-refresh]', doc).forEach(function (fresh) {
        var key = fresh.getAttribute('data-refresh');
        var current = document.querySelector('[data-refresh="' + key + '"]');
        if (current) current.replaceWith(fresh);
      });
    });
    measureHeader();
  }

  function postJSON(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error(data.description || data.message || S.error);
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  function addToCart(variantId, quantity) {
    return postJSON((routes.cartAdd || '/cart/add') + '.js', {
      items: [{ id: Number(variantId), quantity: quantity || 1 }],
      sections: sectionIds().join(','),
      sections_url: window.location.pathname
    }).then(function (data) {
      refreshFromSections(data.sections);
      document.dispatchEvent(new CustomEvent('lgb:cart-updated'));
      return data;
    });
  }

  function changeLine(line, quantity) {
    return postJSON((routes.cartChange || '/cart/change') + '.js', {
      line: Number(line),
      quantity: Math.max(0, Number(quantity) || 0),
      sections: sectionIds().join(','),
      sections_url: window.location.pathname
    }).then(function (data) {
      refreshFromSections(data.sections);
      return data;
    });
  }

  function addedMessage() {
    return escapeHtml(S.added || '') + ' <a href="' + (routes.cart || '/cart') + '">' + escapeHtml(S.viewCart || '') + '</a>';
  }

  /* ---------- Header : menu + hauteur ---------- */

  function measureHeader() {
    var header = $('.section-header');
    if (!header) return;
    var root = document.documentElement.style;
    root.setProperty('--header-h', header.offsetHeight + 'px');
    // bandeau annonce + header : le hero prend exactement le reste de l'écran
    root.setProperty('--chrome-h', (header.offsetTop + header.offsetHeight) + 'px');
    // la colonne d'infos produit ne reste collée que si elle tient dans l'écran
    $$('.product__info').forEach(function (info) {
      info.style.position = info.offsetHeight > window.innerHeight - header.offsetHeight - 24 ? 'static' : '';
    });
  }

  function initMenu() {
    var btn = $('[data-menu-toggle]');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    var nav = document.getElementById(btn.getAttribute('aria-controls'));
    var label = $('[data-menu-label]', btn);
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (nav) nav.hidden = !open;
      if (label) label.textContent = open ? label.dataset.close : label.dataset.open;
      measureHeader();
      if (open && nav) { var first = $('a', nav); if (first) first.focus(); }
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    if (nav) {
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
  }

  /* ---------- Filtres Noir / Blanc / Homme / Femme ---------- */

  function initFilters() {
    $$('[data-filter-scope]').forEach(function (scope) {
      if (scope.dataset.bound) return;
      scope.dataset.bound = '1';
      var state = { color: null, fit: null };
      var chips = $$('[data-filter-chip]', scope);
      var empty = $('[data-filter-empty]', scope);

      function apply() {
        var visible = 0;
        $$('[data-card]', scope).forEach(function (card) {
          var colors = (card.dataset.colors || '').split(' ').filter(Boolean);
          var fits = (card.dataset.fits || '').split(' ').filter(Boolean);
          var okColor = !state.color || colors.length === 0 || colors.indexOf(state.color) > -1;
          var okFit = !state.fit || fits.length === 0 || fits.indexOf(state.fit) > -1 || fits.indexOf('unisexe') > -1;
          var show = okColor && okFit;
          card.hidden = !show;
          if (show) visible++;

          // visuel de la bonne couleur
          var visuals = $$('[data-visual]', card);
          if (visuals.length > 1) {
            var target = state.color && visuals.some(function (v) { return v.dataset.visual === state.color; })
              ? state.color : visuals[0].dataset.visual;
            var shown = false;
            visuals.forEach(function (v) {
              var on = !shown && v.dataset.visual === target;
              if (on) shown = true;
              v.hidden = !on;
            });
          }
          var qa = $('[data-quick-add]', card);
          if (qa) { if (state.color) qa.dataset.prefColor = state.color; else delete qa.dataset.prefColor; }
        });
        if (empty) empty.hidden = visible > 0;

        chips.forEach(function (chip) {
          var g = chip.dataset.group;
          var on = g === 'all' ? (!state.color && !state.fit) : state[g] === chip.dataset.value;
          chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var g = chip.dataset.group;
          if (g === 'all') { state.color = null; state.fit = null; }
          else state[g] = state[g] === chip.dataset.value ? null : chip.dataset.value;
          apply();
        });
      });
    });
  }

  /* ---------- Sélecteur de variantes (fiche produit + ajout rapide) ---------- */

  function normColor(v) {
    var s = String(v || '').toLowerCase();
    if (/noir|black/.test(s)) return 'noir';
    if (/blanc|white/.test(s)) return 'blanc';
    return s;
  }
  function isSizeName(name) { return /taille|size/i.test(name); }
  function isColorName(name) { return /couleur|colou?r|coloris/i.test(name); }

  function optionName(o) { return typeof o === 'string' ? o : o.name; }

  function Picker(container, product, onChange) {
    this.container = container;
    this.product = product;
    this.onChange = onChange;
    var self = this;
    container.addEventListener('change', function (e) {
      if (e.target.matches('input[type="radio"]')) self.update();
    });
    this.update(true);
  }

  Picker.prototype.selected = function () {
    return $$('fieldset[data-option-index]', this.container).map(function (fs) {
      var checked = $('input:checked', fs);
      return checked ? checked.value : null;
    });
  };

  Picker.prototype.variantFor = function (values) {
    return this.product.variants.find(function (v) {
      return v.options.every(function (o, i) { return o === values[i]; });
    }) || null;
  };

  Picker.prototype.update = function (initial) {
    var self = this;
    var values = this.selected();
    $$('fieldset[data-option-index]', this.container).forEach(function (fs) {
      var i = Number(fs.dataset.optionIndex);
      var out = $('[data-option-value]', fs);
      if (out) out.textContent = values[i] || '';
      $$('input[type="radio"]', fs).forEach(function (input) {
        var test = values.slice();
        test[i] = input.value;
        // si une autre option n'est pas encore choisie, on regarde s'il existe au moins une variante dispo
        var ok = self.product.variants.some(function (v) {
          return v.available && v.options.every(function (o, j) { return test[j] === null || o === test[j]; });
        });
        input.classList.toggle('is-unavailable', !ok);
      });
    });
    var complete = values.every(function (v) { return v !== null; });
    var variant = complete ? this.variantFor(values) : null;
    this.onChange && this.onChange(variant, values, complete, initial);
  };

  function buildPickerHtml(product, uid, prefColor) {
    var first = product.variants.find(function (v) { return v.available; }) || product.variants[0];
    var defaults = first.options.slice();
    var html = '';
    product.options.forEach(function (opt, i) {
      var name = optionName(opt);
      var values = opt.values || Array.from(new Set(product.variants.map(function (v) { return v.options[i]; })));
      var size = isSizeName(name) && values.length > 1;
      var color = isColorName(name);
      var pre = size ? null : defaults[i];
      if (color && prefColor) {
        var match = values.find(function (v) { return normColor(v) === prefColor; });
        if (match) pre = match;
      }
      html += '<fieldset class="picker" data-option-index="' + i + '"' + (size ? ' data-size-option' : '') + '>';
      html += '<legend><span class="picker__head"><span class="picker__label">' + escapeHtml(name) +
        '<span class="picker__value" data-option-value></span></span></span></legend><div class="picker__options">';
      values.forEach(function (val, j) {
        var id = uid + '-' + i + '-' + j;
        var sw = '';
        if (color) {
          var c = normColor(val);
          if (c === 'noir' || c === 'blanc') sw = '<span class="swatch swatch--' + c + '" aria-hidden="true"></span>';
        }
        html += '<div class="opt"><input type="radio" id="' + id + '" name="' + uid + '-' + i + '" value="' + escapeHtml(val) + '"' +
          (pre === val ? ' checked' : '') + '><label for="' + id + '">' + sw + escapeHtml(val) + '</label></div>';
      });
      html += '</div></fieldset>';
    });
    return html;
  }

  /* ---------- Fiche produit ---------- */

  function initProduct(section) {
    var jsonEl = $('[data-product-json]', section);
    if (!jsonEl || section.dataset.bound) return;
    section.dataset.bound = '1';
    var product = JSON.parse(jsonEl.textContent);
    var form = $('[data-product-form]', section);
    if (!form) return;
    var idInput = $('[data-variant-id]', form);
    var button = $('[data-add-button]', form);
    var status = $('[data-form-status]', form);
    var priceEl = $('[data-price]', section);
    var gallery = $('[data-gallery]', section);
    var pickerEl = $('[data-variant-picker]', section);
    var current = null;
    var complete = true;

    function setButton(variant) {
      if (!button) return;
      if (variant && !variant.available) {
        button.disabled = true;
        button.textContent = S.soldOut;
      } else if (complete && !variant) {
        button.disabled = true;
        button.textContent = S.unavailable;
      } else {
        button.disabled = false;
        button.textContent = S.addToCart;
      }
    }

    function onChange(variant, values, isComplete, initial) {
      current = variant;
      complete = isComplete;
      if (status && !initial) status.textContent = '';
      // couleur du visuel de remplacement
      product.options.forEach(function (opt, i) {
        if (isColorName(optionName(opt)) && values[i]) {
          var c = normColor(values[i]);
          $$('[data-tee-placeholder] [data-visual]', section).forEach(function (v) { v.hidden = v.dataset.visual !== c; });
          // photo de la couleur choisie, même sans taille
          if (!initial && gallery) {
            var vc = product.variants.find(function (v) { return v.options[i] === values[i] && v.featured_media; });
            if (vc) showMedia(vc.featured_media.id);
          }
        }
      });
      if (variant) {
        idInput.value = variant.id;
        if (priceEl) {
          priceEl.innerHTML = (variant.compare_at_price > variant.price ? '<s>' + formatMoney(variant.compare_at_price) + '</s>' : '') + formatMoney(variant.price);
        }
        if (!initial) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url.toString());
          if (variant.featured_media) showMedia(variant.featured_media.id);
        }
      }
      setButton(variant);
    }

    function showMedia(mediaId) {
      if (!gallery) return;
      var item = $('[data-media-id="' + mediaId + '"]', gallery);
      if (!item) return;
      if (item !== gallery.firstElementChild) gallery.insertBefore(item, gallery.firstElementChild);
      gallery.scrollTo({ left: 0, behavior: 'smooth' });
    }

    if (pickerEl) new Picker(pickerEl, product, onChange);
    else current = product.variants[0];

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!complete) {
        status.textContent = S.chooseSize;
        var sizeFs = pickerEl && $('[data-size-option]', pickerEl);
        if (sizeFs) { sizeFs.scrollIntoView({ behavior: 'smooth', block: 'center' }); var f = $('input', sizeFs); if (f) f.focus({ preventScroll: true }); }
        return;
      }
      if (!current || !current.available) return;
      button.classList.add('is-loading');
      button.textContent = S.adding;
      addToCart(current.id, 1).then(function () {
        status.innerHTML = addedMessage();
      }).catch(function (err) {
        status.textContent = err.message || S.error;
      }).then(function () {
        button.classList.remove('is-loading');
        setButton(current);
      });
    });

    // compteur de photos sur mobile
    var counter = $('[data-gallery-index]', section);
    if (gallery && counter) {
      gallery.addEventListener('scroll', function () {
        var w = gallery.firstElementChild ? gallery.firstElementChild.offsetWidth + 12 : gallery.clientWidth;
        counter.textContent = String(Math.round(gallery.scrollLeft / w) + 1);
      }, { passive: true });
    }
  }

  /* ---------- Ajout rapide depuis une carte ---------- */

  var qaDialog, qaState = {};

  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }

  function initDialogs() {
    $$('dialog').forEach(function (d) {
      d.addEventListener('click', function (e) {
        if (e.target === d || e.target.closest('[data-dialog-close]')) closeDialog(d);
      });
    });
  }

  function quickAdd(btn) {
    var single = btn.dataset.variantId;
    var handle = btn.dataset.handle;
    var label = btn.textContent;

    if (single) {
      btn.classList.add('is-loading');
      btn.textContent = S.adding;
      addToCart(single, 1).then(function () {
        btn.textContent = S.added;
        setTimeout(function () { btn.textContent = label; }, 2200);
      }).catch(function (err) {
        btn.textContent = label;
        window.alert(err.message || S.error);
      }).then(function () { btn.classList.remove('is-loading'); });
      return;
    }

    qaDialog = qaDialog || document.getElementById('QuickAdd');
    if (!qaDialog) { window.location.href = root.replace(/\/$/, '') + '/products/' + handle; return; }
    btn.classList.add('is-loading');

    fetch(root.replace(/\/$/, '') + '/products/' + encodeURIComponent(handle) + '.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (product) {
        qaState = { product: product, variant: null, complete: false, opener: btn };
        $('#QuickAddTitle', qaDialog).textContent = product.title;
        $('[data-qa-price]', qaDialog).textContent = formatMoney(product.price);
        $('[data-qa-link]', qaDialog).href = product.url;
        var pickers = $('[data-qa-pickers]', qaDialog);
        pickers.innerHTML = buildPickerHtml(product, 'qa-' + product.id, btn.dataset.prefColor);
        $('[data-form-status]', qaDialog).textContent = '';
        var submit = $('[data-qa-form] button[type="submit"]', qaDialog);
        new Picker(pickers, product, function (variant, values, complete) {
          qaState.variant = variant;
          qaState.complete = complete;
          if (variant) $('[data-qa-price]', qaDialog).textContent = formatMoney(variant.price);
          submit.disabled = !!(variant && !variant.available) || (complete && !variant);
          submit.textContent = variant && !variant.available ? S.soldOut : (complete && !variant ? S.unavailable : S.addToCart);
        });
        openDialog(qaDialog);
      })
      .catch(function () { window.location.href = root.replace(/\/$/, '') + '/products/' + handle; })
      .then(function () { btn.classList.remove('is-loading'); });
  }

  function initQuickAdd() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-quick-add]');
      if (!btn) return;
      e.preventDefault();
      quickAdd(btn);
    });

    var d = document.getElementById('QuickAdd');
    if (!d) return;
    var form = $('[data-qa-form]', d);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('[data-form-status]', d);
      var submit = $('button[type="submit"]', form);
      if (!qaState.complete) { status.textContent = S.chooseSize; return; }
      if (!qaState.variant || !qaState.variant.available) return;
      submit.classList.add('is-loading');
      submit.textContent = S.adding;
      addToCart(qaState.variant.id, 1).then(function () {
        status.innerHTML = addedMessage();
        submit.textContent = S.addToCart;
        setTimeout(function () { if (d.open) closeDialog(d); }, 1600);
      }).catch(function (err) {
        status.textContent = err.message || S.error;
        submit.textContent = S.addToCart;
      }).then(function () { submit.classList.remove('is-loading'); });
    });
  }

  /* ---------- Guide des tailles en fenêtre ---------- */

  function initSizeGuide() {
    var cache = null;
    document.addEventListener('click', function (e) {
      var link = e.target.closest('[data-size-guide-open]');
      if (!link) return;
      var d = document.getElementById('SizeGuide');
      if (!d) return;
      e.preventDefault();
      var box = $('[data-size-guide-content]', d);
      function show(html) { box.innerHTML = html; openDialog(d); }
      if (cache) return show(cache);
      var url = link.getAttribute('href');
      fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + 'section_id=main')
        .then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
        .then(function (html) { cache = html; show(html); })
        .catch(function () { window.location.href = url; });
    });
  }

  /* ---------- Panier ---------- */

  function initCart() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-cart-change]');
      if (!a) return;
      e.preventDefault();
      var cartEl = $('[data-cart]');
      if (cartEl) cartEl.classList.add('is-busy');
      changeLine(a.dataset.line, a.dataset.quantity).catch(function (err) {
        window.alert(err.message || S.error);
        if (cartEl) cartEl.classList.remove('is-busy');
      });
    });
    document.addEventListener('change', function (e) {
      var input = e.target.closest('[data-cart-qty]');
      if (!input) return;
      var cartEl = $('[data-cart]');
      if (cartEl) cartEl.classList.add('is-busy');
      changeLine(input.dataset.line, input.value).catch(function (err) {
        window.alert(err.message || S.error);
        if (cartEl) cartEl.classList.remove('is-busy');
      });
    });
  }

  /* ---------- Inscription email ---------- */

  function initNewsletter() {
    $$('form[id^="NewsletterForm"]').forEach(function (form) {
      form.noValidate = true;
      var input = $('input[type="email"]', form);
      var error = $('[data-newsletter-error]', form);
      if (!input || !error) return;
      form.addEventListener('submit', function (e) {
        if (!/.+@.+\..+/.test(input.value.trim())) {
          e.preventDefault();
          error.hidden = false;
          input.setAttribute('aria-invalid', 'true');
          input.focus();
        }
      });
      input.addEventListener('input', function () {
        error.hidden = true;
        input.removeAttribute('aria-invalid');
      });
    });
  }

  /* ---------- Démarrage ---------- */

  function init() {
    measureHeader();
    window.addEventListener('resize', measureHeader, { passive: true });
    initMenu();
    initFilters();
    initDialogs();
    initQuickAdd();
    initSizeGuide();
    initCart();
    initNewsletter();
    $$('[data-product]').forEach(initProduct);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Éditeur de thème : réinitialiser une section rechargée
  document.addEventListener('shopify:section:load', function (e) {
    initFilters();
    initMenu();
    $$('[data-product]', e.target).forEach(initProduct);
    measureHeader();
  });
})();
