/* =============================================================
   CAMAÏEU — cursor.js
   Curseur custom discret « trace de pigment » : un petit disque
   qui suit le pointeur avec un léger retard (lerp) et laisse une
   traînée courte qui s'estompe.

   Actif UNIQUEMENT si (pointer:fine) ET !window.REDUCED_MOTION.
   - Ne masque JAMAIS le curseur système sur les éléments
     interactifs sans alternative : le curseur natif reste visible
     (on ne fait qu'AJOUTER un disque décoratif, aria-hidden).
   - Focus clavier pleinement fonctionnel (rien ne dépend de la souris).
   - Fallback : si non applicable → n'injecte rien du tout.

   Charger APRÈS motion.js. Aucun impact sur le DOM sémantique.
   ============================================================= */
(function () {
  'use strict';

  var fine = window.matchMedia('(pointer:fine)').matches;
  if (!fine || window.REDUCED_MOTION) return;  // fallback : rien injecté

  // --- Éléments décoratifs (aria-hidden) ---------------------
  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // --- État ---------------------------------------------------
  var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var dotPos = { x: target.x, y: target.y };
  var ringPos = { x: target.x, y: target.y };
  var visible = false;
  var rafId = null;

  // --- Suivi pointeur ----------------------------------------
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    target.x = e.clientX;
    target.y = e.clientY;
    if (!visible) { show(); start(); }
  }, { passive: true });

  window.addEventListener('pointerdown', function () {
    document.body.classList.add('is-cursor-down');
  });
  window.addEventListener('pointerup', function () {
    document.body.classList.remove('is-cursor-down');
  });

  // État « survol interactif » (le disque grossit légèrement,
  // le curseur système reste présent → accessibilité préservée).
  var interactiveSel = 'a, button, [role="button"], input, textarea, select, label, summary, .btn';
  document.addEventListener('pointerover', function (e) {
    if (e.target.closest && e.target.closest(interactiveSel)) {
      document.body.classList.add('is-cursor-hover');
    }
  }, true);
  document.addEventListener('pointerout', function (e) {
    if (e.target.closest && e.target.closest(interactiveSel)) {
      document.body.classList.remove('is-cursor-hover');
    }
  }, true);

  window.addEventListener('blur', hide);
  document.addEventListener('mouseleave', hide);

  function show() { visible = true; dot.style.opacity = ''; ring.style.opacity = ''; document.body.classList.add('has-custom-cursor'); }
  function hide() { visible = false; dot.style.opacity = '0'; ring.style.opacity = '0'; }

  // --- Boucle rAF (lerp) -------------------------------------
  function start() { if (!rafId) rafId = requestAnimationFrame(loop); }
  function loop() {
    // disque : suivi quasi immédiat ; anneau/traînée : plus lent (dépôt)
    dotPos.x += (target.x - dotPos.x) * 0.35;
    dotPos.y += (target.y - dotPos.y) * 0.35;
    ringPos.x += (target.x - ringPos.x) * 0.13;
    ringPos.y += (target.y - ringPos.y) * 0.13;

    dot.style.transform = 'translate3d(' + dotPos.x + 'px,' + dotPos.y + 'px,0) translate(-50%,-50%)';
    ring.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0) translate(-50%,-50%)';

    rafId = requestAnimationFrame(loop);
  }

  // Nettoyage si la préférence change (rare)
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
    if (e.matches) {
      if (rafId) cancelAnimationFrame(rafId);
      dot.remove(); ring.remove();
      document.body.classList.remove('has-custom-cursor');
    }
  });
})();
