/* ==========================================================================
   MAIN.JS — Point d'entrée JavaScript
   --------------------------------------------------------------------------
   Rôle : orchestrer l'initialisation à l'ouverture de la page.
     1. Enregistrer les plugins GSAP (ScrollTrigger).
     2. Initialiser Lenis (via initLenis() de lenis.js).
     3. Synchroniser Lenis ⇄ GSAP ticker ⇄ ScrollTrigger.

   Dépendances (chargées via CDN dans le <head>, ordre : GSAP → ScrollTrigger
   → Lenis → lenis.js → main.js) :
     - window.gsap
     - window.ScrollTrigger
     - window.initLenis   (défini dans lenis.js)

   Les animations de sections viendront plus tard : ce fichier ne pose
   pour l'instant que la "plomberie" scroll + une garde d'accessibilité.
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------
   * Détection : mouvement réduit ?
   * ------------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* --------------------------------------------------------------------
   * 1. GSAP — enregistrement des plugins
   * ------------------------------------------------------------------ */
  const hasGSAP =
    typeof window.gsap !== "undefined" &&
    typeof window.ScrollTrigger !== "undefined";

  if (hasGSAP) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  } else {
    console.warn("[main] GSAP ou ScrollTrigger manquant — animations désactivées.");
  }

  /* --------------------------------------------------------------------
   * 2. Smooth scroll (Lenis) + synchronisation avec GSAP
   * --------------------------------------------------------------------
   * Le principe : on coupe le RAF interne de Lenis et on le pilote depuis
   * le ticker GSAP. Ainsi scroll lissé et animations partagent la même
   * horloge → zéro décalage, ScrollTrigger reste parfaitement calé.
   * ------------------------------------------------------------------ */
  function setupSmoothScroll() {
    // initLenis() renvoie null si mouvement réduit ou lib absente.
    const lenis =
      typeof window.initLenis === "function" ? window.initLenis() : null;

    if (!lenis || !hasGSAP) return;

    // À chaque scroll de Lenis, on demande à ScrollTrigger de se mettre à jour.
    lenis.on("scroll", window.ScrollTrigger.update);

    // On fait avancer Lenis depuis le ticker GSAP (temps en secondes → ms).
    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // GSAP applique par défaut un lissage au ticker : inutile ici puisque
    // Lenis gère déjà l'inertie.
    window.gsap.ticker.lagSmoothing(0);
  }

  /* --------------------------------------------------------------------
   * 3. Démarrage
   * ------------------------------------------------------------------ */
  function init() {
    setupSmoothScroll();

    // Point d'accroche pour les prochaines étapes :
    // ici viendront les inits de sections (hero, réalisations, savoir-faire…).
    // Ex. : if (hasGSAP && !prefersReducedMotion) initHero();

    // Marque la page comme "prête" — utile pour d'éventuelles transitions
    // d'entrée pilotées en CSS (ex. .is-ready { … }).
    document.documentElement.classList.add("is-ready");

    if (prefersReducedMotion) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  // Le script est chargé en fin de <body> (ou en defer) : le DOM est prêt,
  // mais on protège tout de même le cas où il serait chargé plus tôt.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
