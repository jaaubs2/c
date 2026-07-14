/* ==========================================================================
   SAVOIRFAIRE-UI.JS — Rendu & interactions de la section #savoir-faire
   --------------------------------------------------------------------------
   - Génère les panneaux d'essences, la liste d'assemblages et le marquee.
   - Galerie d'essences en défilement horizontal épinglé (ScrollTrigger pin +
     scrub) sur desktop ; repli en grille verticale sur mobile / reduced-motion.
   - Parallax (démarche, atelier), reveals (revealWords / revealUp), marquee.
   Réutilise window.motion et window.ScrollTrigger.
   ========================================================================== */

(function () {
  "use strict";

  var data = window.SAVOIRFAIRE;
  var section = document.getElementById("savoir-faire");
  if (!data || !section) return;

  var motion = window.motion || {};
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduced = motion.reduced === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = motion.hasGSAP === true || typeof gsap !== "undefined";
  if (typeof gsap !== "undefined" && ST) gsap.registerPlugin(ST);

  var WOOD_FALLBACK = "linear-gradient(135deg, var(--wood-oak), var(--wood-walnut))";
  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function coverBg(node, src) {
    node.style.backgroundImage = 'url("' + src + '"), ' + WOOD_FALLBACK;
  }
  function lazyImg(src, alt) {
    var img = document.createElement("img");
    img.src = src; img.alt = alt || "";
    img.loading = "lazy"; img.decoding = "async";
    img.addEventListener("error", function () { img.style.display = "none"; });
    return img;
  }

  /* ---- 1. Panneaux d'essences ---- */
  var track = document.getElementById("sfEssencesTrack");
  data.essences.forEach(function (e) {
    var panel = make("article", "sf-panel");
    coverBg(panel, e.img);
    var body = make("div", "sf-panel__body");
    body.appendChild(make("h3", "sf-panel__name", e.nom));
    body.appendChild(make("p", "sf-panel__note", e.note));
    panel.appendChild(body);
    track.appendChild(panel);
  });

  /* ---- 2. Liste d'assemblages ---- */
  var asmList = document.getElementById("sfAssemblages");
  var asmItems = [];
  data.assemblages.forEach(function (a, i) {
    var li = make("li", "sf-asm");
    li.appendChild(make("span", "sf-asm__num", "0" + (i + 1)));
    var body = make("div", "sf-asm__body");
    body.appendChild(make("h3", "sf-asm__name", a.nom));
    body.appendChild(make("p", "sf-asm__note", a.note));
    li.appendChild(body);
    var fig = make("figure", "sf-asm__media");
    fig.appendChild(lazyImg(a.img, a.nom + " — détail d'un assemblage en bois"));
    li.appendChild(fig);
    asmList.appendChild(li);
    asmItems.push(li);
  });

  /* ---- 3. Marquee (termes du métier) ---- */
  var mqTrack = document.getElementById("sfMarquee");
  if (mqTrack) {
    data.termes.forEach(function (t) {
      mqTrack.appendChild(make("span", "sf-marquee__item", t));
    });
  }

  /* ---- 4. Reveals ---- */
  var title = section.querySelector(".sf__title");
  if (motion.revealWords && title) {
    motion.revealWords(title, {
      stagger: 0.05,
      scrollTrigger: !reduced && hasGSAP ? { trigger: title, start: "top 85%" } : undefined,
    });
  }
  var lead = section.querySelector(".sf__lead");
  if (motion.revealUp && lead && !reduced && hasGSAP) {
    motion.revealUp(lead, { y: 24, scrollTrigger: { trigger: lead, start: "top 88%" } });
  }
  if (motion.revealUp && asmItems.length && !reduced && hasGSAP) {
    motion.revealUp(asmItems, {
      y: 24, stagger: 0.08,
      scrollTrigger: { trigger: asmList, start: "top 82%" },
    });
  }

  /* ---- 5. Parallax (démarche + atelier) ---- */
  if (motion.parallax && !reduced && hasGSAP) {
    var dImg = section.querySelector(".sf-demarche__media img");
    if (dImg) motion.parallax(dImg, { amount: -48, trigger: section.querySelector(".sf-demarche") });
    var aImg = section.querySelector(".sf-atelier__media img");
    if (aImg) motion.parallax(aImg, { amount: 70, trigger: section.querySelector(".sf-atelier") });
  }

  /* ---- 6. Essences : défilement horizontal épinglé (desktop) ---- */
  var essences = document.getElementById("sfEssences");
  var enableHorizontal =
    !reduced && hasGSAP && window.matchMedia("(min-width: 801px)").matches;

  if (enableHorizontal && essences && track) {
    essences.classList.add("is-horizontal");
    var pinEl = essences.querySelector(".sf-essences__pin");
    // Attendre le layout pour mesurer la largeur réelle de la piste.
    requestAnimationFrame(function () {
      var distance = track.scrollWidth - window.innerWidth + (window.innerWidth * 0.08);
      if (distance < 40) { essences.classList.remove("is-horizontal"); return; }
      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: essences,
          start: "top top",
          end: "+=" + distance,
          pin: pinEl,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });
  }

  /* ---- 7. Marquee ---- */
  if (motion.marquee && mqTrack) motion.marquee(mqTrack, { speed: 50 });
})();
