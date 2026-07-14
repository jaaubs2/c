/* ==========================================================================
   MAIN.JS — Point d'entrée JavaScript
   --------------------------------------------------------------------------
   Orchestre l'ouverture et les comportements de la page :
     1. GSAP + plugins, smooth scroll (Lenis) synchronisé au ticker.
     2. Header : fond au scroll, masquage/réapparition, menu mobile.
     3. Liens d'ancre pilotés par Lenis.
     4. Hero : scrub "matière bois", estompe de l'indice de scroll.
     5. Séquence d'entrée : retrait du préchargeur → révélation du hero.

   Dépendances (CDN, ordre garanti par `defer`) : gsap, ScrollTrigger,
   Lenis, puis lenis.js (initLenis) et motion.js (window.motion).
   Accessibilité : prefers-reduced-motion → aucun scrub/stagger/masquage,
   tout est affiché en état final.
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var hasGSAP = typeof gsap !== "undefined" && typeof ST !== "undefined";
  var motion = window.motion || {};
  var html = document.documentElement;

  if (hasGSAP) gsap.registerPlugin(ST);

  /* ====================================================================
   * 1. SMOOTH SCROLL — Lenis piloté par le ticker GSAP
   * ================================================================== */
  function setupSmoothScroll() {
    var lenis =
      typeof window.initLenis === "function" ? window.initLenis() : null;
    if (!lenis || !hasGSAP) return;

    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ====================================================================
   * 2. HEADER — fond au scroll + masquage/réapparition
   * ================================================================== */
  function setupHeader() {
    var header = document.getElementById("siteHeader");
    var hero = document.querySelector(".hero");
    if (!header) return;

    var lastY = 0;
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var heroH = hero ? hero.offsetHeight : window.innerHeight;

      // Fond subtil une fois le hero (presque) dépassé
      header.classList.toggle("is-scrolled", y > heroH - 80);

      // Masquage au scroll vers le bas / réapparition vers le haut.
      // Désactivé en mouvement réduit (pas de masquage animé).
      if (!reduced) {
        if (y > lastY && y > heroH * 0.9) {
          header.classList.add("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ====================================================================
   * 3. MENU MOBILE — overlay plein écran
   * ================================================================== */
  function setupMobileNav() {
    var btn = document.getElementById("navToggle");
    var overlay = document.getElementById("mobileNav");
    if (!btn || !overlay) return;

    function open() {
      html.classList.add("nav-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fermer le menu");
      overlay.setAttribute("aria-hidden", "false");
      if (window.lenis) window.lenis.stop();
    }
    function close() {
      html.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Ouvrir le menu");
      overlay.setAttribute("aria-hidden", "true");
      // On ne relance pas le scroll si le préchargeur est encore actif
      if (window.lenis && !html.classList.contains("is-loading")) window.lenis.start();
    }

    btn.addEventListener("click", function () {
      html.classList.contains("nav-open") ? close() : open();
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && html.classList.contains("nav-open")) close();
    });
  }

  /* ====================================================================
   * 4. LIENS D'ANCRE — défilement doux via Lenis
   * ================================================================== */
  function setupAnchors() {
    if (!window.lenis) return;
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.lenis.scrollTo(target, { offset: 0 });
      });
    });
  }

  /* ====================================================================
   * 5. HERO — scrub "matière bois" + estompe de l'indice de scroll
   * ================================================================== */
  function setupHero() {
    var word = document.querySelector(".hero__word");
    var hero = document.querySelector(".hero");
    var scroll = document.querySelector(".hero__scroll");
    if (!hero) return;

    // Le grain de bois "remonte" doucement dans les lettres au scroll.
    if (!reduced && hasGSAP && word) {
      gsap.fromTo(
        word,
        { backgroundPosition: "50% 18%" },
        {
          backgroundPosition: "50% 72%",
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // L'indice de scroll s'estompe dès le premier défilement.
    if (scroll) {
      var onScroll = function () {
        if ((window.scrollY || window.pageYOffset) > 30) {
          scroll.classList.add("is-gone");
          window.removeEventListener("scroll", onScroll);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  /* ====================================================================
   * 6. SÉQUENCE D'ENTRÉE — préchargeur puis révélation du hero
   * ================================================================== */

  // Attend polices + un court délai, avec filet de sécurité.
  function whenReady(cb) {
    var done = false;
    var go = function () {
      if (done) return;
      done = true;
      cb();
    };
    var fonts = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();
    fonts.then(function () { window.setTimeout(go, 120); });
    window.setTimeout(go, 1600); // sécurité si les polices tardent
  }

  function runIntro() {
    var pre = document.getElementById("preloader");
    var eyebrow = document.querySelector(".hero__eyebrow");
    var capL = document.querySelector(".hero__caption--left");
    var capR = document.querySelector(".hero__caption--right");
    var word = document.querySelector(".hero__word");
    var lede = document.querySelector(".hero__lede");
    var scroll = document.querySelector(".hero__scroll");

    // Chemin sans animation : tout visible, préchargeur retiré.
    if (reduced || !hasGSAP) {
      if (motion.splitWords && lede) motion.splitWords(lede); // découpe inerte (lisible)
      if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
      html.classList.remove("is-loading");
      if (window.lenis) window.lenis.start();
      return;
    }

    // Verrou du scroll pendant l'ouverture.
    html.classList.add("is-loading");
    if (window.lenis) window.lenis.stop();

    // États cachés posés IMMÉDIATEMENT (le préchargeur masque de toute façon).
    gsap.set([eyebrow, capL, capR], { autoAlpha: 0, y: 12 });
    gsap.set(scroll, { autoAlpha: 0 });
    if (word) {
      // Le mot se révèle par le bas via un clip-path qui s'ouvre vers le haut.
      gsap.set(word, { clipPath: "inset(115% 0% -15% 0%)", y: "0.06em" });
    }

    // Compteur de progression fluide 0 → 100. L'entrée du hero n'est déclenchée
    // qu'une fois le compteur ARRIVÉ à 100 ET les polices prêtes.
    var countEl = document.getElementById("preloaderCount");
    var progress = { v: 0 };
    var counterDone = false, fontsReady = false, started = false;

    function startReveal() {
      if (started || !counterDone || !fontsReady) return;
      started = true;

      var tl = gsap.timeline({ defaults: { ease: motion.easeQuiet } });

      // (0) retrait du préchargeur
      tl.to(pre, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 0.2)
        .add(function () {
          if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
          html.classList.remove("is-loading");
          if (window.lenis) window.lenis.start();
        });

      // (1) eyebrow + légendes latérales : fondu doux
      tl.to([eyebrow, capL, capR], { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, "-=0.35");

      // (2) mot géant : révélation clip du bas vers le haut
      if (word) {
        tl.to(word, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.2 }, "-=0.55");
      }

      // (3) accroche : révélation mot par mot (motion.revealWords)
      var ledeTween = motion.revealWords
        ? motion.revealWords(lede, { stagger: 0.06, duration: 0.8 })
        : null;
      if (ledeTween) tl.add(ledeTween, "-=0.6");

      // (4) indice de scroll : apparition
      tl.to(scroll, { autoAlpha: 1, duration: 0.6 }, "-=0.25");

      // Recalage des ScrollTrigger une fois tout en place (positions correctes).
      tl.add(function () { if (ST) ST.refresh(); });
    }

    gsap.to(progress, {
      v: 100,
      duration: 1.15,
      ease: "power1.inOut",
      onUpdate: function () { if (countEl) countEl.textContent = Math.round(progress.v); },
      onComplete: function () { counterDone = true; startReveal(); },
    });

    whenReady(function () { fontsReady = true; startReveal(); });
  }

  /* ====================================================================
   * DÉMARRAGE
   * ================================================================== */
  function init() {
    setupSmoothScroll();
    setupHeader();
    setupMobileNav();
    setupAnchors();
    setupHero();
    runIntro();

    html.classList.add("is-ready");
    if (reduced) html.classList.add("reduced-motion");

    // Recalage des ScrollTrigger après chargement complet (images/polices),
    // en plus du refresh de fin d'intro : évite les positions décalées.
    if (hasGSAP && ST) {
      window.addEventListener("load", function () { ST.refresh(); });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
