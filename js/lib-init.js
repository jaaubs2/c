/* =============================================================
   CAMAÏEU — lib-init.js
   Initialise le smooth scroll (Lenis) et le moteur d'animation
   (GSAP + ScrollTrigger), et fait le pont entre les deux.

   Ordre de chargement : CE SCRIPT EN PREMIER (defer), avant
   motion.js / preloader.js / cursor.js / hero.js.

   Expose :
     window.lenis            → instance Lenis (ou null si reduced-motion)
     window.REDUCED_MOTION   → true si l'utilisateur préfère moins d'animation
     window.gsap / window.ScrollTrigger (via les CDN chargés en <head>)
   ============================================================= */
(function () {
  'use strict';

  // 1. Détection reduced-motion (exposée globalement, lue par tous les modules)
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  window.REDUCED_MOTION = mq.matches;

  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

  // 2. Enregistrement du plugin ScrollTrigger
  if (hasGSAP && hasScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  // 3. Lenis — UNIQUEMENT hors reduced-motion
  window.lenis = null;

  if (!window.REDUCED_MOTION && typeof window.Lenis !== 'undefined') {
    var lenis = new window.Lenis({
      lerp: 0.1,                 // lissage doux demandé (~0.1)
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      // Le smooth ne s'applique pas au tactile natif (confort mobile) :
      smoothTouch: false
    });

    window.lenis = lenis;

    // 3a. Pont Lenis ↔ ScrollTrigger : chaque scroll met ScrollTrigger à jour
    if (hasScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
    }

    // 3b. On branche Lenis sur le ticker rAF de GSAP (une seule boucle rAF)
    //     et on désactive le lissage de lag natif de GSAP.
    if (hasGSAP) {
      window.gsap.ticker.add(function (time) {
        // gsap.ticker donne un temps en secondes → Lenis attend des ms
        lenis.raf(time * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback : rAF autonome si GSAP absent
      var raf = function (t) {
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  // 4. Petit utilitaire partagé : rafraîchir ScrollTrigger après layout
  window.refreshScroll = function () {
    if (hasScrollTrigger) window.ScrollTrigger.refresh();
  };

  // 5. Réagir à un changement de préférence en cours de session (rare mais propre)
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', function (e) {
      // On ne « rallume » pas Lenis à chaud (nécessiterait un reload propre) :
      // on met simplement le flag à jour et on stoppe le smooth s'il tourne.
      window.REDUCED_MOTION = e.matches;
      if (e.matches && window.lenis) {
        window.lenis.stop();
      }
    });
  }
})();
