/* =============================================================
   ATELIER NEIGE — interactions
   ============================================================= */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- Preloader ---------- */
  const loader = document.getElementById("loader");
  const fill = document.getElementById("loaderFill");
  const count = document.getElementById("loaderCount");

  function startHero() {
    document.querySelectorAll(".hero__title .word").forEach((w, i) => {
      w.animate(
        [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
        { duration: 900, delay: 80 * i, easing: "cubic-bezier(.19,1,.22,1)", fill: "forwards" }
      );
    });
  }

  function runLoader() {
    if (reduce) { loader.classList.add("is-done"); startHero(); return; }
    let p = 0;
    const tick = setInterval(() => {
      p += Math.max(1, Math.round((100 - p) * 0.12));
      if (p >= 100) { p = 100; clearInterval(tick); finish(); }
      fill.style.width = p + "%";
      count.textContent = p;
    }, 90);
    function finish() {
      setTimeout(() => {
        loader.classList.add("is-done");
        setTimeout(startHero, 250);
      }, 250);
    }
  }
  window.addEventListener("load", runLoader);

  /* ---------- Custom cursor ---------- */
  if (canHover) {
    const cursor = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor-dot");
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;

    addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("[data-cursor]").forEach((el) => {
      const type = el.getAttribute("data-cursor");
      el.addEventListener("mouseenter", () => cursor.classList.add(type === "view" ? "is-view" : "is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-view", "is-hover"));
    });
  }

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", scrollY > 40);
  }, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  document.querySelectorAll(".reveal-line").forEach((el, i) => {
    el.querySelector("span").style.transitionDelay = (i % 4) * 80 + "ms";
    io.observe(el);
  });

  /* ---------- Count up ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const dur = 1600; let t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        const prog = Math.min((ts - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.round(end * eased).toLocaleString("fr-FR") + suffix;
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".stat__num").forEach((el) => countIO.observe(el));

  /* ---------- Témoignages ---------- */
  const quotes = [
    { t: "Je suis entrée essoufflée par une année entière. Je suis ressortie avec, enfin, de la place à l'intérieur.", n: "Camille R.", s: "Rituel Neige" },
    { t: "On ne parle pas, et pourtant on est profondément entendu. Un lieu rare, tenu par des mains justes.", n: "Adrien M.", s: "Le grand silence" },
    { t: "Chaque geste semble pensé pour votre corps du jour. Je repars plus léger, plus clair, sans exception.", n: "Salomé T.", s: "Givre & feu" },
  ];
  const qEl = document.getElementById("voixQuote");
  const idxEl = document.getElementById("voixIndex");
  document.getElementById("voixTotal").textContent = quotes.length;
  let qi = 0;
  function renderQuote(dir) {
    qEl.classList.add("is-fading");
    setTimeout(() => {
      const q = quotes[qi];
      qEl.querySelector("p").textContent = "« " + q.t + " »";
      qEl.querySelector("footer").innerHTML = `<span>${q.n}</span> — ${q.s}`;
      idxEl.textContent = qi + 1;
      qEl.classList.remove("is-fading");
    }, 350);
  }
  document.getElementById("voixNext").addEventListener("click", () => { qi = (qi + 1) % quotes.length; renderQuote(); });
  document.getElementById("voixPrev").addEventListener("click", () => { qi = (qi - 1 + quotes.length) % quotes.length; renderQuote(); });

  /* ---------- Smooth anchor scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });
})();
