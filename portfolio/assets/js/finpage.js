/* ==========================================================================
   FINPAGE.JS — Interactions de fin de page (#a-propos, #contact, footer)
   --------------------------------------------------------------------------
   - Formulaire de contact : validation client + composition d'un lien mailto
     (site 100% statique) + confirmation inline. (Brancher Formspree/Netlify
     plus tard — voir commentaire dans setupForm.)
   - Modale mentions légales (dialog, focus trap, Échap).
   - Clôture typographique : glissement du grain de bois au scroll.
   - Reveals (revealWords / revealUp) et parallax du portrait.
   ========================================================================== */

(function () {
  "use strict";

  var motion = window.motion || {};
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduced = motion.reduced === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = motion.hasGSAP === true || typeof gsap !== "undefined";
  if (typeof gsap !== "undefined" && ST) gsap.registerPlugin(ST);
  var html = document.documentElement;

  /* ================================================================
   * 1. Année du footer
   * ============================================================== */
  var yearEl = document.getElementById("ftYear");
  if (yearEl) {
    try { yearEl.textContent = String(new Date().getFullYear()); } catch (e) {}
  }

  /* ================================================================
   * 2. Formulaire de contact
   * ============================================================== */
  function setupForm() {
    var form = document.getElementById("ctForm");
    if (!form) return;
    var confirm = document.getElementById("ctConfirm");
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function fieldOf(input) { return input.closest(".ct__field"); }
    function setError(input, msg) {
      var field = fieldOf(input);
      var err = field.querySelector(".ct__error");
      if (msg) {
        field.classList.add("is-invalid");
        input.setAttribute("aria-invalid", "true");
        if (err) err.textContent = msg;
      } else {
        field.classList.remove("is-invalid");
        input.removeAttribute("aria-invalid");
        if (err) err.textContent = "";
      }
    }

    var nom = form.elements["nom"];
    var email = form.elements["email"];
    var message = form.elements["message"];

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;

      if (!nom.value.trim()) { setError(nom, "Merci d'indiquer votre nom."); firstInvalid = firstInvalid || nom; }
      else setError(nom, "");

      if (!email.value.trim()) { setError(email, "Merci d'indiquer votre email."); firstInvalid = firstInvalid || email; }
      else if (!EMAIL.test(email.value.trim())) { setError(email, "Format d'email invalide."); firstInvalid = firstInvalid || email; }
      else setError(email, "");

      if (!message.value.trim()) { setError(message, "Décrivez votre projet en quelques mots."); firstInvalid = firstInvalid || message; }
      else setError(message, "");

      if (firstInvalid) { firstInvalid.focus(); return; }

      // --- Site statique : on compose un mailto pré-rempli. ---
      // Pour une vraie réception en boîte mail plus tard, remplacer ce bloc
      // par un POST vers Formspree (action="https://formspree.io/f/XXXX")
      // ou Netlify Forms (attribut netlify sur le <form>).
      var subject = encodeURIComponent("Projet sur-mesure — " + nom.value.trim());
      var body = encodeURIComponent(
        message.value.trim() + "\n\n— " + nom.value.trim() + " (" + email.value.trim() + ")"
      );
      window.location.href =
        "mailto:bonjour@ateliercormier.fr?subject=" + subject + "&body=" + body;

      if (confirm) {
        confirm.hidden = false;
        confirm.textContent =
          "Merci " + nom.value.trim() + " — votre logiciel de messagerie s'ouvre avec le message pré-rempli. À très vite.";
      }
      form.reset();
    });
  }

  /* ================================================================
   * 3. Modale mentions légales
   * ============================================================== */
  function setupLegal() {
    var openBtn = document.getElementById("legalOpen");
    var modal = document.getElementById("legal");
    if (!openBtn || !modal) return;
    var closeBtn = modal.querySelector(".legal__close");
    var lastFocused = null;

    function focusables() {
      return Array.prototype.slice.call(
        modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
      ).filter(function (n) { return n.offsetParent !== null || n === closeBtn; });
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var f = focusables();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    function open() {
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      html.classList.add("rea-lock");
      if (window.lenis) window.lenis.stop();
      document.addEventListener("keydown", onKey);
      window.setTimeout(function () { closeBtn.focus(); }, 40);
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      html.classList.remove("rea-lock");
      if (window.lenis && !html.classList.contains("is-loading")) window.lenis.start();
      document.removeEventListener("keydown", onKey);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  }

  /* ================================================================
   * 4. Clôture typographique — glissement du grain au scroll
   * ============================================================== */
  function setupClosing() {
    var word = document.querySelector(".closing__word");
    if (!word || reduced || !hasGSAP) return;
    gsap.fromTo(
      word,
      { backgroundPosition: "50% 22%" },
      {
        backgroundPosition: "50% 78%",
        ease: "none",
        scrollTrigger: { trigger: ".closing", start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  }

  /* ================================================================
   * 5. Reveals + parallax
   * ============================================================== */
  function setupReveals() {
    var apTitle = document.querySelector(".ap__title");
    if (motion.revealWords && apTitle) {
      motion.revealWords(apTitle, {
        stagger: 0.05,
        scrollTrigger: !reduced && hasGSAP ? { trigger: apTitle, start: "top 85%" } : undefined,
      });
    }
    var ctTitle = document.querySelector(".ct__title");
    if (motion.revealWords && ctTitle) {
      motion.revealWords(ctTitle, {
        stagger: 0.05,
        scrollTrigger: !reduced && hasGSAP ? { trigger: ctTitle, start: "top 85%" } : undefined,
      });
    }
    if (!reduced && hasGSAP) {
      var bio = document.querySelector(".ap__bio");
      if (motion.revealUp && bio) motion.revealUp(bio, { y: 24, scrollTrigger: { trigger: bio, start: "top 88%" } });
      var portrait = document.querySelector(".ap__portrait img");
      if (motion.parallax && portrait) motion.parallax(portrait, { amount: -40, trigger: document.querySelector(".ap__portrait") });
    }
  }

  setupForm();
  setupLegal();
  setupClosing();
  setupReveals();
})();
