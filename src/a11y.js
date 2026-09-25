// Accessibilité transversale (clavier, lecteur d'écran, préférences).
//
// - Les réglages d'accessibilité (taille du texte, contraste, animations, lecture facilitée)
//   sont appliqués dès l'ouverture de l'app, pas seulement en passant par les Réglages.
// - Quand un nouvel écran s'ouvre, le focus va sur son titre : le lecteur d'écran l'annonce
//   et la navigation au clavier reprend au bon endroit (au lieu de repartir du début).
// - La touche Échap ferme l'écran ou la fenêtre du dessus (bouton « Retour » ou « Fermer »).

const KEY = "lcv-a11y";
const DEFAULTS = { textSize: "regular", highContrast: false, reduceMotion: false, dyslexia: false };

function prefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return DEFAULTS; }
}

function applyPrefs(phone) {
  const a = prefs();
  if (!phone.hasAttribute("data-text")) phone.setAttribute("data-text", a.textSize);
  if (!phone.hasAttribute("data-contrast")) phone.setAttribute("data-contrast", a.highContrast ? "high" : "regular");
  if (!phone.hasAttribute("data-motion")) phone.setAttribute("data-motion", a.reduceMotion ? "reduce" : "regular");
  if (!phone.hasAttribute("data-dys")) phone.setAttribute("data-dys", a.dyslexia ? "1" : "0");
}

// L'écran visible le plus « au-dessus » (les écrans superposés arrivent en dernier dans le DOM).
function topScreen(phone) {
  const dialogs = [...phone.querySelectorAll('[role="dialog"]')].filter(visible);
  if (dialogs.length) return dialogs[dialogs.length - 1];
  const screens = [...phone.querySelectorAll(".screen")].filter(visible);
  return screens[screens.length - 1] || null;
}
function visible(el) { return el.offsetParent !== null || getComputedStyle(el).position === "fixed"; }

function focusTitle(screen) {
  const title = screen.querySelector("h1, h2, [role=dialog] [id]");
  const target = title || screen;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.classList.add("a11y-focus-target");
  target.focus({ preventScroll: true });
}

function watch(phone) {
  applyPrefs(phone);
  let current = topScreen(phone);
  let pending = 0;
  new MutationObserver(() => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
      const top = topScreen(phone);
      const lost = !document.activeElement || document.activeElement === document.body || !phone.contains(document.activeElement);
      if (top && top !== current) {
        current = top;
        // Ne pas voler le focus pendant une saisie (ex. message d'erreur sous un champ).
        const typing = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && top.contains(document.activeElement);
        if (!typing) focusTitle(top);
      } else if (lost && top && document.activeElement !== top) {
        focusTitle(top);
      }
    });
  }).observe(phone, { childList: true, subtree: true });

  phone.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    const top = topScreen(phone);
    if (!top) return;
    const close = top.querySelector('button[aria-label^="Fermer"], button[aria-label^="Retour"], button[aria-label^="Annuler"]');
    if (close) { e.preventDefault(); close.click(); }
  });
}

function start() {
  const phone = document.querySelector(".phone");
  if (phone) return watch(phone);
  const wait = new MutationObserver(() => {
    const p = document.querySelector(".phone");
    if (p) { wait.disconnect(); watch(p); }
  });
  wait.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
