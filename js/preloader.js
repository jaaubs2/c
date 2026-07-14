/* =============================================================
   CAMAÏEU — preloader.js
   Overlay plein écran (--plaster) avec le mot « CAMAÏEU » en
   Fraunces qui se « peint » (clip-path) pendant le chargement,
   puis wipe pinceau vers le haut à la fin (window load).

   - Bloque le scroll pendant le preload (Lenis.stop + overflow).
   - Reduced-motion → simple fondu de sortie (pas de wipe).
   - Durée max plafonnée (~1.6s, token --dur-preload-max) même si
     les assets sont lents.

   Charger APRÈS motion.js (utilise window.lenis / tokens).
   Émet l'évènement 'camaieu:preloaded' sur window quand terminé
   → hero.js s'y accroche pour lancer sa timeline d'entrée.
   ============================================================= */
(function () {
  'use strict';

  var overlay = document.getElementById('preloader');
  if (!overlay) { dispatchDone(); return; }

  var word = overlay.querySelector('.preloader__word');
  var gsap = window.gsap || null;
  var reduced = window.REDUCED_MOTION === true;
  var done = false;

  // Bloque le scroll
  lockScroll(true);

  // 1. Animation d'attente : le mot se « peint » de gauche à droite (clip)
  if (!reduced && gsap && word) {
    gsap.set(word, { clipPath: 'inset(0 100% 0 0)' });
    gsap.to(word, {
      clipPath: 'inset(0 0% 0 0)',
      duration: cssDur('--dur-slow', 1.2),
      ease: cssEase('--ease-brush', 'power3.inOut')
    });
  } else if (word) {
    word.style.opacity = '1';
  }

  // 2. Sortie : au load OU au plafond de durée, on prend le premier.
  var maxMs = cssDur('--dur-preload-max', 1.6) * 1000;
  var capReached = false;
  var loaded = false;

  var capTimer = setTimeout(function () {
    capReached = true;
    maybeExit();
  }, maxMs);

  if (document.readyState === 'complete') {
    loaded = true;
    // Laisse au moins un souffle pour voir la révélation du mot.
    setTimeout(maybeExit, 300);
  } else {
    window.addEventListener('load', function () {
      loaded = true;
      maybeExit();
    });
  }

  function maybeExit() {
    if (done) return;
    if (!loaded && !capReached) return;
    done = true;
    clearTimeout(capTimer);
    exit();
  }

  function exit() {
    if (!reduced && gsap) {
      // Wipe pinceau vers le haut
      gsap.to(overlay, {
        clipPath: 'inset(0 0 100% 0)',
        duration: cssDur('--dur-med', 0.8),
        ease: cssEase('--ease-brush', 'power3.inOut'),
        onComplete: finish
      });
    } else if (gsap) {
      gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: finish });
    } else {
      overlay.style.transition = 'opacity .4s';
      overlay.style.opacity = '0';
      setTimeout(finish, 420);
    }
  }

  function finish() {
    overlay.setAttribute('hidden', '');
    overlay.style.display = 'none';
    lockScroll(false);
    dispatchDone();
  }

  /* --- Helpers ------------------------------------------------ */
  function lockScroll(on) {
    if (window.lenis) { on ? window.lenis.stop() : window.lenis.start(); }
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  }

  function dispatchDone() {
    window.CAMAIEU_PRELOADED = true;
    window.dispatchEvent(new CustomEvent('camaieu:preloaded'));
  }

  function cssEase(name, fallback) {
    // GSAP ne lit pas le cubic-bezier CSS directement : on renvoie un
    // easing GSAP proche pour --ease-brush, sinon le fallback fourni.
    if (name.indexOf('brush') > -1) return 'power3.inOut';
    return fallback;
  }
  function cssDur(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) return fallback;
    if (v.indexOf('ms') > -1) return parseFloat(v) / 1000;
    return parseFloat(v);
  }
})();
