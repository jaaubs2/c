/* ==========================================================================
   MOTION.JS — Helpers d'animation réutilisables
   --------------------------------------------------------------------------
   Petite boîte à outils au-dessus de GSAP, exposée en `window.motion`.
     - splitWords(el)          → découpe un texte en mots masqués
     - revealWords(el, opts)   → révélation mot par mot (montée + fondu)
     - revealUp(el, opts)      → montée + fondu d'un bloc
     - parallax(el, opts)      → parallaxe verticale au scroll (ScrollTrigger)
     - easeQuiet               → courbe "quiet" cubic-bezier(.22,1,.36,1)

   Dépendances : window.gsap (+ window.ScrollTrigger pour parallax), via CDN.
   Accessibilité : si prefers-reduced-motion, les helpers posent l'ÉTAT FINAL
   (contenu visible, pas de transform) et ne lancent aucune animation.
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var hasGSAP = typeof gsap !== "undefined";

  /* ------------------------------------------------------------------ *
   * Easing "quiet" — équivalent JS de cubic-bezier(.22, 1, .36, 1),
   * la même courbe que --ease-quiet côté CSS. Utilisable comme ease GSAP.
   * ------------------------------------------------------------------ */
  function cubicBezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sampleX(t) { return ((ax * t + bx) * t + cx) * t; }
    function sampleY(t) { return ((ay * t + by) * t + cy) * t; }
    function slopeX(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (p) {
      // Newton-Raphson : on inverse x(t) = p, puis on renvoie y(t)
      var t = p;
      for (var i = 0; i < 6; i++) {
        var x = sampleX(t) - p;
        var d = slopeX(t);
        if (Math.abs(x) < 1e-4 || d === 0) break;
        t -= x / d;
      }
      return sampleY(t);
    };
  }
  var easeQuiet = cubicBezier(0.22, 1, 0.36, 1);

  /* ------------------------------------------------------------------ *
   * splitWords — enveloppe chaque mot dans un masque (overflow hidden)
   * pour permettre une révélation "montée depuis le bas".
   * Le texte reste lisible par les lecteurs d'écran (mots + espaces).
   * Renvoie le tableau des éléments intérieurs (à animer).
   * ------------------------------------------------------------------ */
  function splitWords(el) {
    if (!el || el.dataset.split === "done") {
      return el ? Array.prototype.slice.call(el.querySelectorAll(".word__inner")) : [];
    }
    var text = (el.textContent || "").trim();
    var words = text.split(/\s+/);
    el.textContent = "";
    var inners = [];
    words.forEach(function (w, i) {
      var mask = document.createElement("span");
      mask.className = "word";
      var inner = document.createElement("span");
      inner.className = "word__inner";
      inner.textContent = w;
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      inners.push(inner);
    });
    el.dataset.split = "done";
    return inners;
  }

  /* ------------------------------------------------------------------ *
   * revealWords — révélation mot par mot (montée + fondu, en stagger).
   * Renvoie le tween GSAP (composable dans une timeline via tl.add()).
   * ------------------------------------------------------------------ */
  function revealWords(el, opts) {
    opts = opts || {};
    var inners = splitWords(el);
    if (reduced || !hasGSAP || !inners.length) return null; // état final naturel
    return gsap.from(inners, {
      yPercent: 120,
      opacity: 0,
      duration: opts.duration || 0.9,
      ease: opts.ease || easeQuiet,
      stagger: opts.stagger != null ? opts.stagger : 0.08,
      delay: opts.delay || 0,
      scrollTrigger: opts.scrollTrigger || undefined,
    });
  }

  /* ------------------------------------------------------------------ *
   * revealUp — montée + fondu d'un (ou plusieurs) bloc(s).
   * ------------------------------------------------------------------ */
  function revealUp(el, opts) {
    opts = opts || {};
    if (reduced || !hasGSAP || !el) return null;
    return gsap.from(el, {
      y: opts.y != null ? opts.y : 24,
      opacity: 0,
      duration: opts.duration || 0.9,
      ease: opts.ease || easeQuiet,
      delay: opts.delay || 0,
      stagger: opts.stagger || 0,
      scrollTrigger: opts.scrollTrigger || undefined,
    });
  }

  /* ------------------------------------------------------------------ *
   * parallax — décalage vertical doux piloté par le scroll (scrub).
   * ------------------------------------------------------------------ */
  function parallax(el, opts) {
    opts = opts || {};
    if (reduced || !hasGSAP || typeof window.ScrollTrigger === "undefined" || !el) {
      return null;
    }
    return gsap.to(el, {
      y: opts.amount != null ? opts.amount : 80,
      ease: "none",
      scrollTrigger: {
        trigger: opts.trigger || el,
        start: opts.start || "top bottom",
        end: opts.end || "bottom top",
        scrub: opts.scrub != null ? opts.scrub : true,
      },
    });
  }

  window.motion = {
    reduced: reduced,
    hasGSAP: hasGSAP,
    easeQuiet: easeQuiet,
    splitWords: splitWords,
    revealWords: revealWords,
    revealUp: revealUp,
    parallax: parallax,
  };
})();
