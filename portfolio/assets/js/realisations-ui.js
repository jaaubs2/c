/* ==========================================================================
   REALISATIONS-UI.JS — Rendu & interactions de la section #realisations
   --------------------------------------------------------------------------
   Génère l'index et la vue détail à partir de window.REALISATIONS.
     - Index : lignes-boutons (numéro · nom · méta), vignette en repli.
     - Desktop (survol) : aperçu image qui suit le curseur (GSAP quickTo).
     - Mobile / reduced-motion : vignette inline, pas de suivi de curseur.
     - Vue détail : overlay dialog (focus trap, Échap, précédent/suivant).
   Réutilise window.motion (revealWords/revealUp) et window.lenis.
   ========================================================================== */

(function () {
  "use strict";

  var data = window.REALISATIONS || [];
  var section = document.getElementById("realisations");
  if (!section || !data.length) return;

  var motion = window.motion || {};
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduced = motion.reduced === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = motion.hasGSAP === true || typeof gsap !== "undefined";
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var cursorMode = canHover && !reduced && hasGSAP;

  // Inscription idempotente de ScrollTrigger (indépendante de l'ordre des scripts)
  if (typeof gsap !== "undefined" && ST) gsap.registerPlugin(ST);

  var html = document.documentElement;
  var WOOD_FALLBACK =
    "linear-gradient(135deg, var(--wood-oak), var(--wood-walnut))";

  /* ------------------------------------------------------------------ *
   * Petites fabriques DOM
   * ------------------------------------------------------------------ */
  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // fond image + repli dégradé bois (si le .jpg manque, le dégradé reste)
  function coverBg(node, src) {
    node.style.backgroundImage = 'url("' + src + '"), ' + WOOD_FALLBACK;
    node.style.backgroundSize = "cover";
    node.style.backgroundPosition = "center";
  }

  /* ==================================================================
   * 1. RENDU DE L'INDEX
   * ================================================================ */
  var root = document.getElementById("reaRoot") || section;

  // En-tête de section
  var head = make("div", "rea__head");
  var eyebrow = make("p", "eyebrow rea__eyebrow");
  eyebrow.appendChild(make("span", null, "Réalisations"));
  eyebrow.appendChild(make("span", "rea__count", "(" + pad(data.length) + ")"));
  var title = make("h2", "rea__title");
  title.id = "rea-title";
  title.textContent = "Des pièces uniques, pensées pour durer.";
  head.appendChild(eyebrow);
  head.appendChild(title);
  root.appendChild(head);

  // Liste
  var list = make("ul", "rea__list");
  list.setAttribute("role", "list");
  if (!cursorMode) section.classList.add("rea--static");

  var rows = [];
  data.forEach(function (p, i) {
    var li = make("li", "rea__item");
    var row = make("button", "rea__row");
    row.type = "button";
    row.setAttribute("aria-haspopup", "dialog");
    row.setAttribute(
      "aria-label",
      p.nom + " — " + p.type + ", " + p.essence + ", " + p.annee + ". Voir le détail."
    );

    var num = make("span", "rea__num", pad(i + 1));
    var thumb = make("span", "rea__thumb");
    thumb.setAttribute("aria-hidden", "true");
    coverBg(thumb, p.images[0]);

    var name = make("span", "rea__name", p.nom);

    var meta = make("span", "rea__meta");
    meta.appendChild(make("span", null, p.type));
    meta.appendChild(make("span", null, p.essence));
    meta.appendChild(make("span", null, String(p.annee)));

    row.appendChild(num);
    row.appendChild(thumb);
    row.appendChild(name);
    row.appendChild(meta);

    row.addEventListener("click", function () { openDetail(i); });
    li.appendChild(row);
    list.appendChild(li);
    rows.push(row);
  });
  root.appendChild(list);

  /* ==================================================================
   * 2. APERÇU QUI SUIT LE CURSEUR (desktop, mode survol)
   * ================================================================ */
  if (cursorMode) {
    var preview = make("div", "rea__preview");
    preview.setAttribute("aria-hidden", "true");
    document.body.appendChild(preview);

    var xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: motion.easeQuiet });
    var yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: motion.easeQuiet });
    gsap.set(preview, { scale: 0.92, transformOrigin: "50% 50%" });

    var moveHandler = function (e) {
      xTo(e.clientX + 24 - preview.offsetWidth / 2);
      yTo(e.clientY - preview.offsetHeight / 2);
    };

    rows.forEach(function (row, i) {
      row.addEventListener("mouseenter", function () {
        coverBg(preview, data[i].images[0]);
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.4, ease: motion.easeQuiet });
        window.addEventListener("mousemove", moveHandler);
      });
      row.addEventListener("mouseleave", function () {
        gsap.to(preview, { autoAlpha: 0, scale: 0.92, duration: 0.3, ease: motion.easeQuiet });
        window.removeEventListener("mousemove", moveHandler);
      });
    });
  }

  /* ==================================================================
   * 3. VUE DÉTAIL — overlay dialog
   * ================================================================ */
  var overlay = make("div", "rea-detail");
  overlay.id = "reaDetail";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "reaDetailTitle");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    '<div class="rea-detail__panel">' +
      '<button class="rea-detail__close" type="button" aria-label="Fermer la vue détail">&#10005;</button>' +
      '<div class="rea-detail__head">' +
        '<h3 class="rea-detail__title" id="reaDetailTitle"></h3>' +
        '<p class="rea-detail__meta"></p>' +
        '<p class="rea-detail__desc"></p>' +
      '</div>' +
      '<div class="rea-detail__gallery"></div>' +
      '<div class="rea-detail__nav">' +
        '<button class="rea-detail__navbtn rea-detail__navbtn--prev" type="button"></button>' +
        '<button class="rea-detail__navbtn rea-detail__navbtn--next" type="button"></button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var panel = overlay.querySelector(".rea-detail__panel");
  var closeBtn = overlay.querySelector(".rea-detail__close");
  var elTitle = overlay.querySelector(".rea-detail__title");
  var elMeta = overlay.querySelector(".rea-detail__meta");
  var elDesc = overlay.querySelector(".rea-detail__desc");
  var elGallery = overlay.querySelector(".rea-detail__gallery");
  var prevBtn = overlay.querySelector(".rea-detail__navbtn--prev");
  var nextBtn = overlay.querySelector(".rea-detail__navbtn--next");

  var currentIndex = 0;
  var lastFocused = null;

  function renderDetail(i) {
    var p = data[i];
    currentIndex = i;
    elTitle.textContent = p.nom;
    elMeta.innerHTML =
      "<b>" + p.type + "</b> · " + p.essence + " · " + p.annee + " · " + p.lieu;
    elDesc.textContent = p.desc;

    // Galerie
    elGallery.innerHTML = "";
    p.images.forEach(function (src, k) {
      var fig = make("figure", "rea-detail__fig");
      fig.setAttribute("data-fallback", p.nom + " · " + pad(k + 1));
      var img = document.createElement("img");
      img.src = src;
      img.alt = p.nom + " — " + p.type + " en " + p.essence + ", photo " + (k + 1);
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", function () { fig.classList.add("is-fallback"); });
      fig.appendChild(img);
      elGallery.appendChild(fig);
    });

    // Précédent / suivant (bouclé)
    var prev = data[(i - 1 + data.length) % data.length];
    var next = data[(i + 1) % data.length];
    prevBtn.innerHTML = "&larr; Précédent<small>" + prev.nom + "</small>";
    nextBtn.innerHTML = "Suivant &rarr;<small>" + next.nom + "</small>";

    // recale le scroll du panneau en haut à chaque changement
    overlay.scrollTop = 0;
    panel.scrollTop = 0;
  }

  function focusables() {
    return [closeBtn, prevBtn, nextBtn];
  }

  function onKey(e) {
    if (e.key === "Escape") { closeDetail(); return; }
    if (e.key === "ArrowLeft") { renderDetail((currentIndex - 1 + data.length) % data.length); return; }
    if (e.key === "ArrowRight") { renderDetail((currentIndex + 1) % data.length); return; }
    if (e.key === "Tab") {
      // piège de focus simple
      var f = focusables();
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function openDetail(i) {
    lastFocused = document.activeElement;
    renderDetail(i);
    html.classList.add("rea-lock");
    if (window.lenis) window.lenis.stop();
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    document.addEventListener("keydown", onKey);
    // focus après le début de la transition
    window.setTimeout(function () { closeBtn.focus(); }, 40);
  }

  function closeDetail() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    html.classList.remove("rea-lock");
    if (window.lenis && !html.classList.contains("is-loading")) window.lenis.start();
    document.removeEventListener("keydown", onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  closeBtn.addEventListener("click", closeDetail);
  prevBtn.addEventListener("click", function () {
    renderDetail((currentIndex - 1 + data.length) % data.length);
  });
  nextBtn.addEventListener("click", function () {
    renderDetail((currentIndex + 1) % data.length);
  });
  // clic sur le fond (hors panneau) → fermeture
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeDetail();
  });

  /* ==================================================================
   * 4. RÉVÉLATIONS AU SCROLL
   * ================================================================ */
  if (motion.revealWords) {
    motion.revealWords(title, {
      stagger: 0.05,
      scrollTrigger: !reduced && hasGSAP
        ? { trigger: title, start: "top 85%" }
        : undefined,
    });
  }
  if (motion.revealUp && !reduced && hasGSAP) {
    motion.revealUp(rows, {
      y: 28,
      stagger: 0.06,
      scrollTrigger: { trigger: list, start: "top 80%" },
    });
  }
})();
