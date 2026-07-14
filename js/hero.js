/* =============================================================
   CAMAÏEU — hero.js  (étape 2)
   Élément signature du hero : un canvas 2D « pigment révélé »
   qui se peint à l'entrée et coule sous le curseur, + la timeline
   d'entrée du hero orchestrée avec window.motion.

   RÉUTILISE les fondations :
     - window.motion.splitTextReveal / fadeUp / brushReveal
     - tokens CSS (--prussian-*, --ease-brush, --dur-*) lus via
       getComputedStyle (aucune couleur/durée en dur ici)
     - window.REDUCED_MOTION, window.lenis, GSAP
     - évènement 'camaieu:preloaded' émis par preloader.js

   Charger APRÈS motion.js (defer).

   Robustesse : si le canvas échoue (contexte 2D indisponible,
   exception), on retombe sur le dégradé CSS + fondu du texte.
   ============================================================= */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  if (!hero) return;

  var canvas = hero.querySelector('.hero__canvas');
  var img = hero.querySelector('.hero__img');
  var gsap = window.gsap || null;
  var reduced = window.REDUCED_MOTION === true;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ---------------------------------------------------------
     Lecture tokens (pigments) → palette du canvas
     --------------------------------------------------------- */
  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim();
    return v || fallback;
  }
  var PALETTE = {
    deep: token('--prussian-700', '#0e1726'),
    mid: token('--prussian-500', '#16233b'),
    light: token('--prussian-300', '#3c5876')
  };

  /* ---------------------------------------------------------
     Image pigment optionnelle ([PLACEHOLDER]) : révélée si elle
     charge, sinon on garde le dégradé de fallback.
     --------------------------------------------------------- */
  if (img) {
    if (img.complete && img.naturalWidth > 0) hero.classList.add('has-hero-img');
    else {
      img.addEventListener('load', function () { hero.classList.add('has-hero-img'); });
      img.addEventListener('error', function () { /* fallback dégradé conservé */ });
    }
  }

  /* =========================================================
     TIMELINE D'ENTRÉE (indépendante du canvas)
     ========================================================= */
  var entered = false;
  function playEntrance() {
    if (entered) return;
    entered = true;

    var kicker = hero.querySelector('.hero__kicker');
    var title = hero.querySelector('.hero__title');
    var subtitle = hero.querySelector('.hero__subtitle');
    var actions = hero.querySelector('.hero__actions');
    var scroll = hero.querySelector('.hero__scroll');
    var M = window.motion;

    if (!M) return; // sans motion.js, le CSS laisse tout visible

    if (reduced || !gsap) {
      // Fondus simples, aucune translation notable.
      [kicker, title, subtitle, actions, scroll].forEach(function (el, i) {
        if (!el) return;
        el.style.opacity = '0';
        if (gsap) gsap.to(el, { opacity: 1, duration: 0.4, delay: i * 0.06 });
        else { el.style.transition = 'opacity .4s'; el.style.opacity = '1'; }
      });
      return;
    }

    // Orchestration « coup de pinceau » : kicker → titre peint → reste décalé.
    if (kicker) M.fadeUp(kicker, { y: 16, delay: 0.05 });
    if (title) M.splitTextReveal(title, { delay: 0.15 });
    if (subtitle) M.fadeUp(subtitle, { y: 22, delay: 0.5 });
    if (actions) M.fadeUp(actions, { y: 22, delay: 0.62 });
    if (scroll) M.fadeUp(scroll, { y: 12, delay: 0.8 });

    // Révélation du pigment (canvas) synchronisée
    revealPigment();
  }

  // Attend la fin du préchargeur ; garde-fou si l'évènement a déjà eu lieu.
  if (window.CAMAIEU_PRELOADED) playEntrance();
  else window.addEventListener('camaieu:preloaded', playEntrance);
  // Filet de sécurité : si le preloader n'existe pas, on démarre au DOM prêt.
  window.addEventListener('load', function () { setTimeout(playEntrance, 100); });

  /* =========================================================
     CANVAS SIGNATURE
     - reduced-motion → PAS de canvas animé (rien ici).
     - sinon : révélation en taches molles + coulure au curseur.
     ========================================================= */
  var ctx = null, dpr = 1, W = 0, H = 0;
  var running = false, rafId = null;
  var revealProgress = 0, revealTarget = 0;
  var pointer = { x: -1, y: -1, active: false };
  var lerpPointer = { x: -1, y: -1 };
  var trail = [];              // dépôts de pigment qui s'estompent
  var blobs = [];              // taches de révélation (positions fixes)
  var resizeTimer = null;

  function initCanvas() {
    if (reduced || !canvas) return false;
    try {
      ctx = canvas.getContext('2d');
      if (!ctx) return false;
    } catch (e) { return false; }
    sizeCanvas();
    seedBlobs();
    observeVisibility();
    bindPointer();
    window.addEventListener('resize', onResize, { passive: true });
    return true;
  }

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);  // dpr plafonné à 2
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!ctx) return;
      sizeCanvas();
      seedBlobs();
    }, 180);   // resize débouncé
  }

  // Taches molles de révélation, réparties (bords irréguliers via variance).
  function seedBlobs() {
    blobs = [];
    var count = Math.round((W * H) / 90000);   // densité ~ surface
    count = Math.max(10, Math.min(count, 34));
    for (var i = 0; i < count; i++) {
      // Déterministe (pas de Math.random interdit ici) : semis pseudo-aléatoire
      var a = pseudo(i * 12.9898) ;
      var b = pseudo(i * 78.233);
      var c = pseudo(i * 43.123);
      blobs.push({
        x: a * W,
        y: b * H,
        r: (0.16 + c * 0.22) * Math.max(W, H) * 0.5,
        // ordre d'apparition : de la droite (là où le pigment est dense) vers la gauche
        order: (a * 0.6 + b * 0.4)
      });
    }
  }

  // Générateur pseudo-aléatoire déterministe (Math.random est indisponible).
  function pseudo(seed) {
    var s = Math.sin(seed) * 43758.5453;
    return s - Math.floor(s);
  }

  function revealPigment() {
    revealTarget = 1;
    if (initCanvas()) start();
  }

  /* --- Interaction curseur ----------------------------------- */
  function bindPointer() {
    if (!fine) return;   // tactile : pas d'interaction curseur
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
      if (lerpPointer.x < 0) { lerpPointer.x = pointer.x; lerpPointer.y = pointer.y; }
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { pointer.active = false; });
  }

  /* --- Visibilité : pause du rAF hors-vue -------------------- */
  function observeVisibility() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0.01 });
    io.observe(hero);
  }

  function start() { if (!running && ctx) { running = true; rafId = requestAnimationFrame(frame); } }
  function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  /* --- Boucle de rendu --------------------------------------- */
  function frame() {
    if (!running) return;
    // Progression de la révélation (ease vers la cible)
    revealProgress += (revealTarget - revealProgress) * 0.045;

    // Lerp du pointeur (douceur)
    if (pointer.active) {
      lerpPointer.x += (pointer.x - lerpPointer.x) * 0.12;
      lerpPointer.y += (pointer.y - lerpPointer.y) * 0.12;
      // Dépôt d'une trace molle
      trail.push({ x: lerpPointer.x, y: lerpPointer.y, life: 1, r: 60 + 40 * pseudo(trail.length) });
      if (trail.length > 60) trail.shift();
    }

    draw();

    // S'estompe : baisse la vie des traces
    for (var i = trail.length - 1; i >= 0; i--) {
      trail[i].life -= 0.012;      // estompe lentement
      if (trail[i].life <= 0) trail.splice(i, 1);
    }

    rafId = requestAnimationFrame(frame);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 1. Couche de pigment révélée par les taches molles.
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    blobs.forEach(function (bl) {
      // chaque tache s'ouvre quand revealProgress dépasse son 'order'
      var local = clamp((revealProgress - bl.order * 0.5) / 0.5, 0, 1);
      if (local <= 0) return;
      var r = bl.r * easeOut(local);
      var g = ctx.createRadialGradient(bl.x, bl.y, 0, bl.x, bl.y, r);
      g.addColorStop(0, withAlpha(PALETTE.mid, 0.55 * local));
      g.addColorStop(0.6, withAlpha(PALETTE.deep, 0.4 * local));
      g.addColorStop(1, withAlpha(PALETTE.deep, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bl.x, bl.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Coulure/dépôt sous le curseur (traînée molle, éclaircit légèrement).
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    trail.forEach(function (t) {
      var alpha = 0.06 * t.life;    // subtil, jamais clignotant
      var g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r);
      g.addColorStop(0, withAlpha(PALETTE.light, alpha));
      g.addColorStop(1, withAlpha(PALETTE.light, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  /* --- Utils math/couleur ------------------------------------ */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function withAlpha(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* --- Section motion générique (data-motion des enfants) ----- */
  if (window.motion && window.motion.registerSection) {
    window.motion.registerSection(hero);
  }
})();
