/* =========================================================
   ATELIER VERSO — Interactions
   - Révélations au scroll (IntersectionObserver, 85 % viewport)
   - Compteurs animés (une seule fois)
   - Parallaxe sur les grands visuels
   - Boutons magnétiques + curseur « Voir »
   - Respect de prefers-reduced-motion
   ========================================================= */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------
     1 · RÉVÉLATIONS AU SCROLL
     Déclenchées quand l'élément atteint 85 % du viewport,
     avec cascade de 0,1 s entre éléments frères.
  ------------------------------------------------------ */
  function setupReveals() {
    var targets = document.querySelectorAll(
      ".reveal, [data-lines], .reveal-img, [data-rule]"
    );

    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    // Cascade automatique entre frères directs porteurs d'une révélation.
    document.querySelectorAll(".stats__grid, .projects__grid").forEach(function (group) {
      var i = 0;
      Array.prototype.forEach.call(group.children, function (child) {
        if (child.classList.contains("reveal") && !child.hasAttribute("data-delay")) {
          child.style.setProperty("--d", (i * 0.1) + "s");
          i++;
        }
      });
    });

    // Délais explicites (data-delay) → variable CSS --d
    targets.forEach(function (el) {
      var d = el.getAttribute("data-delay");
      if (d) el.style.setProperty("--d", d + "s");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, {
      // 85 % du viewport → l'élément est révélé lorsqu'il a franchi
      // les 15 % inférieurs de l'écran.
      rootMargin: "0px 0px -15% 0px",
      threshold: 0.01
    });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------
     2 · COMPTEURS ANIMÉS (0 → valeur, une seule fois)
  ------------------------------------------------------ */
  function setupCounters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach(function (n) { n.textContent = n.getAttribute("data-count"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 0.01 });

    nums.forEach(function (n) { io.observe(n); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easing cubic-bezier(0.16,1,0.3,1) approximé (easeOutExpo)
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(eased * target).toString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------
     3 · PARALLAXE (grands visuels : 10–15 %)
  ------------------------------------------------------ */
  function setupParallax() {
    if (reduce) return;
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;

    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var amount = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        // Position relative du centre de l'élément dans le viewport (-1 → 1)
        var center = rect.top + rect.height / 2;
        var progress = (center - vh / 2) / vh;
        var shift = -progress * amount * 100; // px
        el.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0) scale(1.06)";
      });
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------
     4 · BOUTONS MAGNÉTIQUES
  ------------------------------------------------------ */
  function setupMagnetic() {
    if (reduce || !finePointer) return;
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      var label = btn.querySelector(".btn__label") || btn;
      var strength = 0.35;

      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (x * strength) + "px," + (y * strength) + "px)";
        label.style.transform = "translate(" + (x * strength * 0.4) + "px," + (y * strength * 0.4) + "px)";
      });

      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
        label.style.transform = "";
      });
    });
  }

  /* ------------------------------------------------------
     5 · CURSEUR « Voir » (survol des projets)
  ------------------------------------------------------ */
  function setupCursor() {
    if (reduce || !finePointer) return;
    var cursor = document.querySelector(".cursor");
    var zone = document.querySelector("[data-cursor-zone]");
    if (!cursor || !zone) return;

    var x = 0, y = 0, cx = 0, cy = 0;
    var running = false;

    function render() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      if (running) requestAnimationFrame(render);
    }

    document.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });

    zone.querySelectorAll("[data-project]").forEach(function (p) {
      p.addEventListener("mouseenter", function () {
        cursor.classList.add("is-active");
        if (!running) { running = true; cx = x; cy = y; render(); }
      });
      p.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-active");
        running = false;
      });
    });
  }

  /* ------------------------------------------------------
     Init
  ------------------------------------------------------ */
  function init() {
    setupReveals();
    setupCounters();
    setupParallax();
    setupMagnetic();
    setupCursor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
