/* ==========================================================================
   LENIS.JS — Initialisation du smooth scroll
   --------------------------------------------------------------------------
   Lenis est chargé via CDN dans le <head> (voir index.html / styleguide.html)
   et expose un global `Lenis`. Ce module se contente de créer et configurer
   l'instance, puis de l'exposer. La synchronisation avec la boucle GSAP
   (ticker) se fait dans main.js — c'est là qu'on branche tout ensemble.

   Respect de l'accessibilité : si l'utilisateur préfère un mouvement réduit,
   on N'initialise PAS Lenis (le scroll natif reste en place).
   ========================================================================== */

/**
 * Crée et retourne une instance Lenis, ou `null` si le smooth scroll doit
 * être désactivé (mouvement réduit, lib absente, ou API indisponible).
 *
 * @returns {import('lenis').default | null}
 */
function initLenis() {
  // 1. Respecter la préférence système "mouvement réduit".
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    console.info("[lenis] Mouvement réduit détecté — smooth scroll désactivé.");
    return null;
  }

  // 2. Vérifier que la lib CDN est bien chargée.
  if (typeof window.Lenis === "undefined") {
    console.warn("[lenis] Lib Lenis introuvable — scroll natif conservé.");
    return null;
  }

  // 3. Instancier avec un profil "quiet luxury" : glisse longue et douce.
  const lenis = new window.Lenis({
    duration: 1.1,                         // inertie du défilement (s)
    easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic — sortie retenue
    smoothWheel: true,                     // molette lissée
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    // Sur tactile, on laisse le défilement natif (plus fluide sur mobile) :
    // Lenis lisse molette/trackpad, le doigt reste natif.
    syncTouch: false,
  });

  // 4. Exposer l'instance globalement pour le reste de l'app (main.js,
  //    liens d'ancre, futurs composants).
  window.lenis = lenis;

  return lenis;
}

// Exposer la fonction d'init pour main.js.
window.initLenis = initLenis;
