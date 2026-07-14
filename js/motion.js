/* =============================================================
   CAMAÏEU — motion.js
   Fonctions de motion réutilisables, exposées sur window.motion.

   Principes communs à TOUTES les fonctions :
     (a) idempotentes  → un élément déjà traité n'est pas re-préparé
                         (marqueur data-motion-ready) ;
     (b) reduced-motion → court-circuit en simple fondu d'opacité
                         (aucune translation / clip animé) ;
     (c) easings via les tokens CSS (--ease-brush, etc.) lus dynamiquement.

   Dépend de : lib-init.js (window.gsap, window.ScrollTrigger,
   window.REDUCED_MOTION). Charger APRÈS lib-init.js.

   ---------------------------------------------------------------
   API PUBLIQUE (window.motion) :

   brushReveal(el, opts)
     Révèle un élément via un clip-path inset qui « peint » de
     gauche à droite. opts = { duration, delay, ease, trigger,
     start, once }. reduced-motion → fondu d'opacité seul.

   fadeUp(el, opts)
     Translation Y douce + opacité, déclenchée au scroll.
     opts = { duration, delay, y, ease, trigger, start, once,
     stagger } (stagger si el est une NodeList/array).

   splitTextReveal(el, opts)
     Découpe le texte en lignes (mesure DOM, sans lib externe) et
     révèle chaque ligne derrière un masque « peint » qui monte.
     opts = { duration, delay, ease, stagger, trigger, start, once }.
     reduced-motion → fondu global de l'élément.

   tonalShift(section, opts)
     Interpole --bg / --fg (et --accent optionnel) d'un camaïeu à
     l'autre au scroll de la section. opts = { from:{bg,fg,accent},
     to:{bg,fg,accent}, scrub, start, end }.
     reduced-motion → bascule instantanée au seuil (50%).

   registerSection(section)
     Parcourt les enfants portant data-motion="fadeUp|brushReveal|
     split" et leur applique la fonction correspondante. Lit aussi
     data-motion-delay / data-motion-stagger.

   Toutes renvoient l'objet gsap/timeline créé (ou null en no-op)
   pour composition éventuelle.
   ============================================================= */
(function () {
  'use strict';

  var gsap = window.gsap || null;
  var READY = 'data-motion-ready';

  /* --- Helpers ------------------------------------------------ */

  function reduced() { return window.REDUCED_MOTION === true; }

  // Lit un easing depuis les tokens CSS (:root). Fallback si absent.
  function cssEase(name, fallback) {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    return v || fallback;
  }

  // Convertit une durée token ("0.8s") en secondes numériques.
  function cssDur(name, fallback) {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.indexOf('ms') > -1) return parseFloat(v) / 1000;
    return parseFloat(v);
  }

  function toArray(elOrList) {
    if (!elOrList) return [];
    if (elOrList instanceof Element) return [elOrList];
    return Array.prototype.slice.call(elOrList);
  }

  function markReady(el) {
    if (!el.setAttribute) return;
    el.setAttribute(READY, '');
  }
  function isReady(el) {
    return el && el.hasAttribute && el.hasAttribute(READY);
  }

  // Anneau easings/durées cohérents avec les tokens « coup de pinceau »
  var EASE = {
    brush: function () { return cssEaseGsap('--ease-brush', '0.6,0.01,0.05,0.95'); },
    outSoft: function () { return cssEaseGsap('--ease-out-soft', '0.22,1,0.36,1'); },
    inOut: function () { return cssEaseGsap('--ease-in-out', '0.65,0,0.35,1'); }
  };

  // GSAP accepte un CustomEase-like via "cubic-bezier(...)" ? Non :
  // on convertit le cubic-bezier token en fonction d'easing GSAP native
  // approximée. Pour rester sans plugin CustomEase, on mappe vers les
  // easings GSAP standards les plus proches, tout en gardant la variable
  // CSS comme source de vérité pour les transitions purement CSS.
  function cssEaseGsap(tokenName, fallbackPoints) {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue(tokenName).trim();
    // Extrait les 4 points du cubic-bezier
    var m = raw.match(/cubic-bezier\(([^)]+)\)/);
    var pts = m ? m[1] : fallbackPoints;
    // Si CustomEase (plugin GSAP) est dispo, on l'utilise pour un rendu fidèle.
    if (window.CustomEase && gsap) {
      try {
        var id = 'ease' + tokenName.replace(/[^a-z0-9]/gi, '');
        if (!gsap.parseEase(id)) {
          window.CustomEase.create(id, 'M0,0 ' + bezierToPath(pts));
        }
        return id;
      } catch (e) { /* tombe sur le mapping standard */ }
    }
    // Mapping standard (sans plugin) : brush ≈ power3.inOut, soft ≈ power2.out
    if (tokenName.indexOf('brush') > -1) return 'power3.inOut';
    if (tokenName.indexOf('out') > -1) return 'power2.out';
    return 'power1.inOut';
  }

  // Convertit "x1,y1,x2,y2" en segment de path pour CustomEase.
  function bezierToPath(pts) {
    var p = pts.split(',').map(function (n) { return parseFloat(n); });
    return 'C' + p[0] + ',' + p[1] + ' ' + p[2] + ',' + p[3] + ' 1,1';
  }

  function defaultTrigger(el, opts) {
    return {
      trigger: (opts && opts.trigger) || el,
      start: (opts && opts.start) || 'top 82%',
      once: opts && opts.once === false ? false : true
    };
  }

  /* --- brushReveal ------------------------------------------- */
  function brushReveal(el, opts) {
    el = el instanceof Element ? el : document.querySelector(el);
    if (!el || isReady(el)) return null;
    opts = opts || {};
    markReady(el);

    // Reduced-motion : simple fondu.
    if (reduced() || !gsap) {
      el.style.opacity = '0';
      var show = function () {
        if (gsap) gsap.to(el, { opacity: 1, duration: 0.4 });
        else el.style.transition = 'opacity .4s', el.style.opacity = '1';
      };
      if (gsap && window.ScrollTrigger) {
        var t = defaultTrigger(el, opts);
        window.ScrollTrigger.create({ trigger: t.trigger, start: t.start, once: t.once, onEnter: show });
      } else { show(); }
      return null;
    }

    var dur = opts.duration || cssDur('--dur-slow', 1.2);
    var t = defaultTrigger(el, opts);

    gsap.set(el, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
    return gsap.to(el, {
      clipPath: 'inset(0 0% 0 0)',
      duration: dur,
      delay: opts.delay || 0,
      ease: opts.ease || EASE.brush(),
      scrollTrigger: window.ScrollTrigger ? { trigger: t.trigger, start: t.start, once: t.once } : undefined
    });
  }

  /* --- fadeUp ------------------------------------------------- */
  function fadeUp(elOrList, opts) {
    opts = opts || {};
    var els = elOrList instanceof Element || typeof elOrList === 'string'
      ? toArray(elOrList instanceof Element ? elOrList : document.querySelectorAll(elOrList))
      : toArray(elOrList);
    if (!els.length) return null;
    // Filtre idempotent
    els = els.filter(function (e) { return !isReady(e); });
    if (!els.length) return null;
    els.forEach(markReady);

    if (reduced() || !gsap) {
      els.forEach(function (e) { e.style.opacity = '0'; });
      var reveal = function () {
        els.forEach(function (e) {
          if (gsap) gsap.to(e, { opacity: 1, duration: 0.4 });
          else { e.style.transition = 'opacity .4s'; e.style.opacity = '1'; }
        });
      };
      var tr = defaultTrigger(els[0], opts);
      if (gsap && window.ScrollTrigger) {
        window.ScrollTrigger.create({ trigger: tr.trigger, start: tr.start, once: tr.once, onEnter: reveal });
      } else { reveal(); }
      return null;
    }

    var dur = opts.duration || cssDur('--dur-med', 0.8);
    var y = opts.y != null ? opts.y : 28;
    var t = defaultTrigger(els[0], opts);

    gsap.set(els, { y: y, opacity: 0 });
    return gsap.to(els, {
      y: 0,
      opacity: 1,
      duration: dur,
      delay: opts.delay || 0,
      ease: opts.ease || EASE.outSoft(),
      stagger: opts.stagger != null ? opts.stagger : 0.08,
      scrollTrigger: window.ScrollTrigger ? { trigger: t.trigger, start: t.start, once: t.once } : undefined
    });
  }

  /* --- splitTextReveal --------------------------------------- */
  // Découpe le contenu texte en lignes selon le rendu réel (offsetTop),
  // enveloppe chaque ligne dans un masque, révèle par translation « peinte ».
  function splitTextReveal(el, opts) {
    el = el instanceof Element ? el : document.querySelector(el);
    if (!el || isReady(el)) return null;
    opts = opts || {};
    markReady(el);

    if (reduced() || !gsap) {
      el.style.opacity = '0';
      var show = function () {
        if (gsap) gsap.to(el, { opacity: 1, duration: 0.4 });
        else { el.style.transition = 'opacity .4s'; el.style.opacity = '1'; }
      };
      if (gsap && window.ScrollTrigger) {
        var tr = defaultTrigger(el, opts);
        window.ScrollTrigger.create({ trigger: tr.trigger, start: tr.start, once: tr.once, onEnter: show });
      } else { show(); }
      return null;
    }

    // 1. Découpe en mots, puis regroupe par ligne selon offsetTop.
    var text = el.textContent;
    el.setAttribute('aria-label', text);   // le texte reste lisible aux AT
    el.textContent = '';
    var words = text.split(/\s+/).filter(Boolean);
    var wordSpans = words.map(function (w) {
      var s = document.createElement('span');
      s.className = 'split-word';
      s.textContent = w;
      s.setAttribute('aria-hidden', 'true');
      s.style.display = 'inline-block';
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
      return s;
    });

    // 2. Regroupe par ligne
    var lines = [];
    var current = [];
    var lastTop = null;
    wordSpans.forEach(function (s) {
      var top = s.offsetTop;
      if (lastTop === null) lastTop = top;
      if (Math.abs(top - lastTop) > 2) {
        lines.push(current);
        current = [];
        lastTop = top;
      }
      current.push(s);
    });
    if (current.length) lines.push(current);

    // 3. Reconstruit avec un masque par ligne
    el.textContent = '';
    var lineInners = [];
    lines.forEach(function (lineWords) {
      var mask = document.createElement('span');
      mask.className = 'split-line';
      mask.setAttribute('aria-hidden', 'true');
      mask.style.display = 'block';
      mask.style.overflow = 'hidden';
      var inner = document.createElement('span');
      inner.className = 'split-line__inner';
      inner.style.display = 'block';
      inner.style.willChange = 'transform';
      inner.textContent = lineWords.map(function (s) { return s.textContent; }).join(' ');
      mask.appendChild(inner);
      el.appendChild(mask);
      lineInners.push(inner);
    });

    var dur = opts.duration || cssDur('--dur-slow', 1.2);
    var t = defaultTrigger(el, opts);

    gsap.set(lineInners, { yPercent: 115 });
    return gsap.to(lineInners, {
      yPercent: 0,
      duration: dur,
      delay: opts.delay || 0,
      ease: opts.ease || EASE.brush(),
      stagger: opts.stagger != null ? opts.stagger : 0.12,
      scrollTrigger: window.ScrollTrigger ? { trigger: t.trigger, start: t.start, once: t.once } : undefined
    });
  }

  /* --- tonalShift -------------------------------------------- */
  // Interpole --bg/--fg/--accent d'un camaïeu à l'autre au scroll.
  function tonalShift(section, opts) {
    section = section instanceof Element ? section : document.querySelector(section);
    if (!section || isReady(section)) return null;
    opts = opts || {};
    var from = opts.from || {};
    var to = opts.to || {};
    markReady(section);

    var apply = function (o) {
      if (o.bg) section.style.setProperty('--bg', o.bg);
      if (o.fg) section.style.setProperty('--fg', o.fg);
      if (o.accent) section.style.setProperty('--accent', o.accent);
    };

    // Reduced-motion : bascule nette à 50 % (pas d'interpolation continue).
    if (reduced() || !gsap || !window.ScrollTrigger) {
      apply(from);
      if (gsap && window.ScrollTrigger) {
        window.ScrollTrigger.create({
          trigger: section, start: 'top center',
          onEnter: function () { apply(to); },
          onLeaveBack: function () { apply(from); }
        });
      }
      return null;
    }

    apply(from);
    var proxy = { t: 0 };
    var resolve = function (a, b, t) {
      // GSAP sait interpoler des couleurs via gsap.utils.interpolate.
      return gsap.utils.interpolate(a, b, t);
    };
    return gsap.to(proxy, {
      t: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: opts.start || 'top 70%',
        end: opts.end || 'bottom 30%',
        scrub: opts.scrub != null ? opts.scrub : true
      },
      onUpdate: function () {
        if (from.bg && to.bg) section.style.setProperty('--bg', resolve(from.bg, to.bg, proxy.t));
        if (from.fg && to.fg) section.style.setProperty('--fg', resolve(from.fg, to.fg, proxy.t));
        if (from.accent && to.accent) section.style.setProperty('--accent', resolve(from.accent, to.accent, proxy.t));
      }
    });
  }

  /* --- registerSection --------------------------------------- */
  // Applique automatiquement les data-motion des enfants.
  function registerSection(section) {
    section = section instanceof Element ? section : document.querySelector(section);
    if (!section) return;
    var nodes = section.querySelectorAll('[data-motion]');
    Array.prototype.forEach.call(nodes, function (el) {
      var kind = el.getAttribute('data-motion');
      var o = {};
      var d = el.getAttribute('data-motion-delay');
      var s = el.getAttribute('data-motion-stagger');
      if (d) o.delay = parseFloat(d);
      if (s) o.stagger = parseFloat(s);
      if (kind === 'fadeUp') fadeUp(el, o);
      else if (kind === 'brushReveal') brushReveal(el, o);
      else if (kind === 'split') splitTextReveal(el, o);
    });
  }

  /* --- Export ------------------------------------------------ */
  window.motion = {
    brushReveal: brushReveal,
    fadeUp: fadeUp,
    splitTextReveal: splitTextReveal,
    tonalShift: tonalShift,
    registerSection: registerSection,
    // Utilitaires exposés pour hero.js et le styleguide
    _ease: EASE,
    _cssDur: cssDur
  };
})();
