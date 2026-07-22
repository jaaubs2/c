/**
 * ATELIER VERSO — Page d'accueil (composant de code Framer)
 * =========================================================
 * Cabinet d'architecture fictif · Annecy, Haute-Savoie.
 *
 * COMMENT L'UTILISER DANS FRAMER
 * 1. Dans ton projet Framer : menu Insert (+) → « Code » → « New Code File ».
 * 2. Colle TOUT ce fichier, nomme-le « AtelierVerso ».
 * 3. Reviens sur ta page, ouvre l'onglet « Assets / Code » à gauche,
 *    et fais glisser le composant « AtelierVerso » sur la page.
 * 4. Sélectionne-le et mets sa largeur en « Fill » (100 %). La hauteur
 *    s'ajuste au contenu — la page défile normalement.
 * 5. Aperçu (bouton Play en haut à droite) pour voir les animations au scroll.
 *
 * Les images sont des aplats duotone « à compléter ». Pour poser une vraie
 * photo, remplace le `background-image` de la classe .ph--xxx correspondante
 * dans le bloc CSS ci-dessous (ex. .ph--hero { background-image: url("...") }).
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

import { useEffect, useRef } from "react"

const CSS = `
.av-root {
  --paper: #F2F0EB;
  --ink: #1C1B18;
  --accent: #46554E;
  --ink-60: rgba(28,27,24,0.6);
  --ink-30: rgba(28,27,24,0.28);
  --ink-12: rgba(28,27,24,0.12);
  --serif: "Fraunces", Georgia, serif;
  --sans: "Space Grotesk", "Helvetica Neue", Arial, sans-serif;
  --margin: 72px; --gap: 24px; --section: 140px; --maxw: 1440px;
  --ease-out: cubic-bezier(0.16,1,0.3,1); --dur: 0.9s;

  position: relative;
  width: 100%;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-weight: 300;
  font-size: 17px;
  line-height: 1.6;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.av-root *, .av-root *::before, .av-root *::after { box-sizing: border-box; }
.av-root h1, .av-root h2, .av-root h3, .av-root p,
.av-root blockquote, .av-root figure, .av-root ul { margin: 0; padding: 0; }
.av-root ul { list-style: none; }
.av-root a { color: inherit; text-decoration: none; }
.av-root em { font-style: italic; }

.av-root .wrap {
  width: 100%; max-width: var(--maxw); margin-inline: auto;
  padding-inline: var(--margin);
}
.av-root .visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.av-root .caption {
  font-family: var(--sans); font-weight: 400; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.2em; color: var(--ink-60);
}

/* Boutons & liens */
.av-root .btn {
  display: inline-flex; align-items: center; gap: 0.6em;
  padding: 16px 30px; border: 1px solid var(--ink); border-radius: 100px;
  font-family: var(--sans); font-size: 14px; font-weight: 400;
  letter-spacing: 0.04em; color: var(--ink); background: transparent;
  cursor: pointer; will-change: transform;
  transition: background 0.5s var(--ease-out), color 0.5s var(--ease-out), border-color 0.5s var(--ease-out);
}
.av-root .btn__label { display: inline-block; will-change: transform; }
.av-root .btn:hover { background: var(--accent); border-color: var(--accent); color: var(--paper); }
.av-root .btn--ghost { border-color: var(--ink-30); }
.av-root .link-underline { position: relative; display: inline-block; padding-bottom: 2px; }
.av-root .link-underline::after {
  content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px;
  background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform 0.5s var(--ease-out);
}
.av-root .link-underline:hover { color: var(--accent); }
.av-root .link-underline:hover::after { transform: scaleX(1); }

/* En-tête */
.av-root .site-header {
  position: absolute; top: 0; left: 0; right: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 32px var(--margin); mix-blend-mode: difference; color: #EDEBE4;
}
.av-root .site-header__brand { font-family: var(--serif); font-weight: 400; font-size: 20px; letter-spacing: 0.01em; }
.av-root .site-header__nav { display: flex; gap: 34px; font-size: 14px; }

/* Hero */
.av-root .hero {
  position: relative; height: 100vh; min-height: 620px;
  display: flex; align-items: flex-end; overflow: hidden; color: #F4F2ED;
}
.av-root .hero__media { position: absolute; inset: 0; z-index: 0; }
.av-root .hero__inner { position: absolute; inset: -8% 0; width: 100%; height: 116%; }
.av-root .hero::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(20,22,20,0.35) 0%, rgba(20,22,20,0.12) 40%, rgba(20,22,20,0.55) 100%);
}
.av-root .hero__content { position: relative; z-index: 2; padding: 0 var(--margin) 132px; max-width: 1100px; }
.av-root .hero__title {
  font-family: var(--serif); font-weight: 300; font-size: clamp(44px, 7.2vw, 100px);
  line-height: 1.02; letter-spacing: -0.015em; margin-bottom: 30px;
}
.av-root .hero__subtitle { font-size: 18px; line-height: 1.55; max-width: 40ch; color: rgba(244,242,237,0.86); margin-bottom: 34px; }
.av-root .hero .btn { border-color: rgba(244,242,237,0.6); color: #F4F2ED; }
.av-root .hero .btn:hover { background: var(--accent); border-color: var(--accent); }
.av-root .hero__foot {
  position: absolute; z-index: 2; left: var(--margin); right: var(--margin); bottom: 40px;
  display: flex; align-items: center; gap: 20px;
}
.av-root .hero__foot .caption { color: rgba(244,242,237,0.8); white-space: nowrap; }
.av-root .hero__rule { flex: 1; height: 1px; background: rgba(244,242,237,0.4); transform: scaleX(0); transform-origin: left; }

/* Bandeau */
.av-root .marquee { padding: 46px var(--margin); border-bottom: 1px solid var(--ink-12); text-align: center; }
.av-root .marquee__text {
  font-family: var(--serif); font-weight: 300; font-size: clamp(18px, 2.4vw, 28px);
  letter-spacing: 0.01em; display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 0.6em;
}
.av-root .marquee__dot { color: var(--accent); }

/* Chiffres */
.av-root .stats { padding-block: var(--section); }
.av-root .stats__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap); }
.av-root .stats__item { display: flex; flex-direction: column; gap: 14px; padding-top: 22px; border-top: 1px solid var(--ink-12); }
.av-root .stats__num {
  font-family: var(--serif); font-weight: 300; font-size: clamp(52px, 6vw, 84px);
  line-height: 1; letter-spacing: -0.02em; color: var(--accent); font-variant-numeric: tabular-nums;
}

/* Manifeste */
.av-root .manifesto { padding-block: var(--section); }
.av-root .manifesto__text {
  font-family: var(--serif); font-weight: 300; font-size: clamp(26px, 3.4vw, 46px);
  line-height: 1.28; letter-spacing: -0.01em; max-width: 20ch;
}
.av-root .manifesto .btn { margin-top: 54px; }

/* Savoir-faire */
.av-root .skills { padding-block: var(--section); }
.av-root .skill {
  position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center;
  gap: var(--gap); padding: 46px 0; transition: background 0.6s var(--ease-out);
}
.av-root .skill__rule, .av-root .skill__rule--last {
  position: absolute; top: 0; left: 0; width: 100%; height: 1px; background: var(--ink-12);
  transform: scaleX(0); transform-origin: left;
}
.av-root .skill__rule--last { top: auto; bottom: 0; }
.av-root .skill__title {
  font-family: var(--serif); font-weight: 300; font-size: clamp(34px, 4vw, 56px);
  line-height: 1; letter-spacing: -0.02em;
  transition: color 0.5s var(--ease-out), transform 0.6s var(--ease-out);
}
.av-root .skill__desc { font-size: 17px; max-width: 34ch; color: var(--ink-60); }
.av-root .skill__media {
  position: absolute; right: 0; top: 50%; width: 240px; height: 150px;
  transform: translateY(-50%) scale(0.96); opacity: 0; pointer-events: none;
  transition: opacity 0.55s var(--ease-out), transform 0.6s var(--ease-out); z-index: 3; border-radius: 2px;
}
@media (hover: hover) {
  .av-root .skill:hover { background: rgba(70,85,78,0.05); }
  .av-root .skill:hover .skill__title { color: var(--accent); transform: translateX(14px); }
  .av-root .skill:hover .skill__media { opacity: 1; transform: translateY(-50%) scale(1); }
}

/* Projets */
.av-root .projects { padding-block: var(--section); }
.av-root .projects__head { display: flex; flex-direction: column; gap: 16px; margin-bottom: 72px; }
.av-root .projects__heading {
  font-family: var(--serif); font-weight: 300; font-size: clamp(34px, 4vw, 56px);
  line-height: 1.05; letter-spacing: -0.02em;
}
.av-root .projects__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px var(--gap); }
.av-root .project--b, .av-root .project--d { transform: translateY(64px); }
.av-root .project { display: block; }
.av-root .project__figure { position: relative; overflow: hidden; aspect-ratio: 4 / 5; margin-bottom: 22px; border-radius: 2px; }
.av-root .project__img { position: absolute; inset: -6% 0; width: 100%; height: 112%; transition: transform 0.7s var(--ease-out); transform-origin: center; }
.av-root .project__plus {
  position: absolute; top: 20px; right: 22px; z-index: 4; font-family: var(--sans);
  font-size: 24px; line-height: 1; color: var(--paper); opacity: 0; transform: translateY(-6px);
  transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out), color 0.5s var(--ease-out);
}
.av-root .project__meta { display: flex; flex-direction: column; gap: 6px; }
.av-root .project__name { font-family: var(--serif); font-weight: 400; font-size: 22px; letter-spacing: 0.005em; transition: color 0.4s var(--ease-out); }
@media (hover: hover) {
  .av-root .project:hover .project__img { transform: scale(1.04); }
  .av-root .project:hover .project__plus { opacity: 1; transform: translateY(0); color: var(--accent); }
  .av-root .project:hover .project__name { color: var(--accent); }
}

/* Citation */
.av-root .quote { padding-block: var(--section); }
.av-root .quote__text {
  font-family: var(--serif); font-weight: 300; font-size: clamp(28px, 4.2vw, 58px);
  line-height: 1.22; letter-spacing: -0.015em; max-width: 22ch;
}
.av-root .quote__text em { color: var(--accent); font-style: italic; }
.av-root .quote__author { margin-top: 40px; }

/* CTA */
.av-root .cta { min-height: 80vh; display: flex; align-items: center; padding-block: var(--section); border-top: 1px solid var(--ink-12); }
.av-root .cta .wrap { display: flex; flex-direction: column; align-items: flex-start; }
.av-root .cta__title { font-family: var(--serif); font-weight: 300; font-size: clamp(44px, 6.4vw, 92px); line-height: 1.02; letter-spacing: -0.02em; }
.av-root .cta__sub { font-size: 18px; color: var(--ink-60); margin: 28px 0 40px; max-width: 40ch; }
.av-root .cta__mail { margin-top: 26px; font-family: var(--serif); font-size: clamp(20px, 2.4vw, 30px); color: var(--accent); }

/* Footer */
.av-root .site-footer { padding-top: 90px; padding-bottom: 34px; border-top: 1px solid var(--ink-12); }
.av-root .site-footer__grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: var(--gap); padding-bottom: 80px; }
.av-root .site-footer__col { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.av-root .site-footer__brand { font-family: var(--serif); font-size: 26px; font-weight: 400; }
.av-root .site-footer__label { margin-bottom: 6px; }
.av-root .site-footer__bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 26px; border-top: 1px solid var(--ink-12); }

/* Placeholders images */
.av-root .ph { background-color: #DED9CE; background-repeat: no-repeat; background-position: center; background-size: cover; position: relative; }
.av-root .ph::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(28,27,24,0.05) 1px, transparent 1px); background-size: 4px 4px; opacity: 0.5; }
.av-root .ph--hero { background-image: linear-gradient(180deg, rgba(28,32,30,0.28), rgba(28,32,30,0.5)), linear-gradient(120deg, #8a8b82 0%, #6f746b 42%, #4c534c 72%, #333a35 100%); }
.av-root .ph--s1 { background-image: linear-gradient(135deg, #9aa094 0%, #6d746a 100%); }
.av-root .ph--s2 { background-image: linear-gradient(135deg, #b3ac9d 0%, #7c8177 100%); }
.av-root .ph--s3 { background-image: linear-gradient(135deg, #8f9488 0%, #565f56 100%); }
.av-root .ph--p1 { background-image: linear-gradient(160deg, #a7a597 0%, #6a706a 55%, #454b46 100%); }
.av-root .ph--p2 { background-image: linear-gradient(160deg, #c2bcae 0%, #878b80 60%, #545a52 100%); }
.av-root .ph--p3 { background-image: linear-gradient(160deg, #9ba090 0%, #626962 100%); }
.av-root .ph--p4 { background-image: linear-gradient(160deg, #b0a89a 0%, #767b70 60%, #4a514a 100%); }

/* Animations — états initiaux & révélés */
.av-root .reveal { opacity: 0; transform: translateY(40px); transition: opacity var(--dur) var(--ease-out), transform var(--dur) var(--ease-out); transition-delay: var(--d, 0s); will-change: opacity, transform; }
.av-root .reveal.is-in { opacity: 1; transform: translateY(0); }
.av-root [data-lines] .line { display: block; overflow: hidden; }
.av-root [data-lines] .line > span { display: block; transform: translateY(112%); transition: transform 1s var(--ease-out); transition-delay: var(--d, 0s); will-change: transform; }
.av-root [data-lines].is-in .line > span { transform: translateY(0); }
.av-root .reveal-img { clip-path: inset(100% 0 0 0); transition: clip-path 1s var(--ease-out); }
.av-root .reveal-img > * { transform: scale(1.1); transition: transform 1.2s var(--ease-out); }
.av-root .reveal-img.is-in { clip-path: inset(0 0 0 0); }
.av-root .reveal-img.is-in > * { transform: scale(1); }
.av-root .hero__media.is-in .hero__inner { transform: scale(1); }
.av-root [data-parallax] { transition: none !important; }
.av-root [data-rule] { transition: transform 0.8s var(--ease-out); }
.av-root [data-rule].is-in { transform: scaleX(1); }

/* Curseur « Voir » */
.av-root .cursor {
  position: fixed; top: 0; left: 0; z-index: 90; width: 74px; height: 74px; border-radius: 50%;
  background: var(--accent); color: var(--paper); display: grid; place-items: center;
  pointer-events: none; transform: translate(-50%, -50%) scale(0);
  transition: transform 0.35s var(--ease-out), opacity 0.35s var(--ease-out); opacity: 0;
}
.av-root .cursor span { font-family: var(--sans); font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; }
.av-root .cursor.is-active { transform: translate(-50%, -50%) scale(1); opacity: 1; }

/* Responsive */
@media (max-width: 1024px) {
  .av-root { --margin: 40px; --section: 100px; }
  .av-root .stats__grid { grid-template-columns: repeat(2, 1fr); gap: 40px var(--gap); }
  .av-root .skill__media { display: none; }
}
@media (max-width: 720px) {
  .av-root { --margin: 20px; --section: 72px; --gap: 16px; font-size: 16px; }
  .av-root .site-header { padding: 20px var(--margin); }
  .av-root .site-header__nav { display: none; }
  .av-root .hero { min-height: 560px; }
  .av-root .hero__content { padding: 0 var(--margin) 120px; }
  .av-root .hero__title { font-size: clamp(44px, 12vw, 52px); }
  .av-root .hero__subtitle { font-size: 16px; }
  .av-root .hero__foot { bottom: 26px; }
  .av-root .marquee__text { flex-direction: column; gap: 0.2em; }
  .av-root .marquee__dot { display: none; }
  .av-root .stats__grid { grid-template-columns: 1fr 1fr; gap: 34px var(--gap); }
  .av-root .skill { grid-template-columns: 1fr; gap: 12px; padding: 30px 0; }
  .av-root .skill__desc { max-width: none; }
  .av-root .projects__grid { grid-template-columns: 1fr; gap: 44px; }
  .av-root .project--b, .av-root .project--d { transform: none; }
  .av-root .project__figure { aspect-ratio: 3 / 4; }
  .av-root .site-footer__grid { grid-template-columns: 1fr; gap: 40px; padding-bottom: 56px; }
}
@media (prefers-reduced-motion: reduce) {
  .av-root *, .av-root *::before, .av-root *::after {
    transition-duration: 0.001ms !important; animation-duration: 0.001ms !important;
  }
  .av-root .reveal { opacity: 1; transform: none; }
  .av-root [data-lines] .line > span { transform: none; }
  .av-root .reveal-img { clip-path: none; }
  .av-root .reveal-img > * { transform: none; }
  .av-root [data-rule] { transform: scaleX(1); }
  .av-root .cursor { display: none; }
}
`

export function AtelierVerso() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // Chargement des polices (Fraunces + Space Grotesk) une seule fois.
    const FONT_ID = "av-fonts"
    if (!document.getElementById(FONT_ID)) {
      const link = document.createElement("link")
      link.id = FONT_ID
      link.rel = "stylesheet"
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Space+Grotesk:wght@300;400;500&display=swap"
      document.head.appendChild(link)
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const observers: IntersectionObserver[] = []
    const cleanups: Array<() => void> = []

    const $$ = (sel: string) =>
      Array.prototype.slice.call(root.querySelectorAll(sel)) as HTMLElement[]

    /* 1 · Révélations au scroll */
    const targets = $$(".reveal, [data-lines], .reveal-img, [data-rule]")
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"))
    } else {
      $$(".stats__grid, .projects__grid").forEach((group) => {
        let i = 0
        Array.prototype.forEach.call(group.children, (child: HTMLElement) => {
          if (child.classList.contains("reveal") && !child.hasAttribute("data-delay")) {
            child.style.setProperty("--d", i * 0.1 + "s")
            i++
          }
        })
      })
      targets.forEach((el) => {
        const d = el.getAttribute("data-delay")
        if (d) el.style.setProperty("--d", d + "s")
      })
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in")
              io.unobserve(entry.target)
            }
          })
        },
        { rootMargin: "0px 0px -15% 0px", threshold: 0.01 }
      )
      targets.forEach((el) => io.observe(el))
      observers.push(io)
    }

    /* 2 · Compteurs animés */
    const animateCount = (el: HTMLElement) => {
      const target = parseInt(el.getAttribute("data-count") || "0", 10) || 0
      const duration = 1400
      let start: number | null = null
      const step = (ts: number) => {
        if (start === null) start = ts
        const p = Math.min((ts - start) / duration, 1)
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
        el.textContent = Math.round(eased * target).toString()
        if (p < 1) requestAnimationFrame(step)
        else el.textContent = target.toString()
      }
      requestAnimationFrame(step)
    }
    const nums = $$("[data-count]")
    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach((n) => (n.textContent = n.getAttribute("data-count") || ""))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            animateCount(entry.target as HTMLElement)
            io.unobserve(entry.target)
          })
        },
        { rootMargin: "0px 0px -15% 0px", threshold: 0.01 }
      )
      nums.forEach((n) => io.observe(n))
      observers.push(io)
    }

    /* 3 · Parallaxe */
    if (!reduce) {
      const items = $$("[data-parallax]")
      if (items.length) {
        let ticking = false
        const update = () => {
          const vh = window.innerHeight
          items.forEach((el) => {
            const rect = el.getBoundingClientRect()
            if (rect.bottom < -200 || rect.top > vh + 200) return
            const amount = parseFloat(el.getAttribute("data-parallax") || "0.1") || 0.1
            const center = rect.top + rect.height / 2
            const progress = (center - vh / 2) / vh
            const shift = -progress * amount * 100
            el.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0) scale(1.06)"
          })
          ticking = false
        }
        const onScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(update)
            ticking = true
          }
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll, { passive: true })
        update()
        cleanups.push(() => {
          window.removeEventListener("scroll", onScroll)
          window.removeEventListener("resize", onScroll)
        })
      }
    }

    /* 4 · Boutons magnétiques */
    if (!reduce && finePointer) {
      $$(".magnetic").forEach((btn) => {
        const label = (btn.querySelector(".btn__label") as HTMLElement) || btn
        const strength = 0.35
        const move = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect()
          const x = e.clientX - (r.left + r.width / 2)
          const y = e.clientY - (r.top + r.height / 2)
          btn.style.transform = "translate(" + x * strength + "px," + y * strength + "px)"
          label.style.transform = "translate(" + x * strength * 0.4 + "px," + y * strength * 0.4 + "px)"
        }
        const leave = () => {
          btn.style.transform = ""
          label.style.transform = ""
        }
        btn.addEventListener("mousemove", move)
        btn.addEventListener("mouseleave", leave)
        cleanups.push(() => {
          btn.removeEventListener("mousemove", move)
          btn.removeEventListener("mouseleave", leave)
        })
      })
    }

    /* 5 · Curseur « Voir » */
    if (!reduce && finePointer) {
      const cursor = root.querySelector(".cursor") as HTMLElement | null
      const zone = root.querySelector("[data-cursor-zone]") as HTMLElement | null
      if (cursor && zone) {
        let x = 0, y = 0, cx = 0, cy = 0, running = false
        const render = () => {
          cx += (x - cx) * 0.18
          cy += (y - cy) * 0.18
          cursor.style.left = cx + "px"
          cursor.style.top = cy + "px"
          if (running) requestAnimationFrame(render)
        }
        const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY }
        document.addEventListener("mousemove", onMove)
        cleanups.push(() => document.removeEventListener("mousemove", onMove))
        zone.querySelectorAll("[data-project]").forEach((p) => {
          const enter = () => {
            cursor.classList.add("is-active")
            if (!running) { running = true; cx = x; cy = y; render() }
          }
          const leave = () => { cursor.classList.remove("is-active"); running = false }
          p.addEventListener("mouseenter", enter)
          p.addEventListener("mouseleave", leave)
          cleanups.push(() => {
            p.removeEventListener("mouseenter", enter)
            p.removeEventListener("mouseleave", leave)
          })
        })
      }
    }

    return () => {
      observers.forEach((o) => o.disconnect())
      cleanups.forEach((fn) => fn())
    }
  }, [])

  return (
    <div className="av-root" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Curseur personnalisé */}
      <div className="cursor" aria-hidden="true"><span>Voir</span></div>

      {/* En-tête */}
      <header className="site-header" id="top">
        <a className="site-header__brand" href="#top" aria-label="Atelier Verso — accueil">Atelier&nbsp;Verso</a>
        <nav className="site-header__nav" aria-label="Navigation principale">
          <a className="link-underline" href="#projets">Réalisations</a>
          <a className="link-underline" href="#atelier">Atelier</a>
          <a className="link-underline" href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        {/* 1 · Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__media reveal-img">
            <div className="hero__inner ph ph--hero" data-parallax="0.12" role="img" aria-label="Maison contemporaine en bois et béton clair dans un paysage de montagne, lumière de fin de journée" />
          </div>
          <div className="hero__content">
            <h1 id="hero-title" className="hero__title" data-lines>
              <span className="line"><span>Bâtir juste,</span></span>
              <span className="line"><span>dans un paysage</span></span>
              <span className="line"><span>qui préexiste.</span></span>
            </h1>
            <p className="hero__subtitle reveal" data-delay="0.5">
              Atelier Verso — maisons contemporaines et lieux singuliers.<br />
              Annecy et Haute-Savoie.
            </p>
            <a className="btn magnetic reveal" data-delay="0.6" href="#projets">
              <span className="btn__label">Voir nos réalisations</span>
            </a>
          </div>
          <div className="hero__foot">
            <span className="caption">(Le cabinet)</span>
            <span className="hero__rule" data-rule />
            <span className="caption">Depuis 2014</span>
          </div>
        </section>

        {/* 2 · Bandeau */}
        <section className="marquee" aria-label="Domaines d'intervention">
          <p className="marquee__text reveal">
            <span>Maisons d'architecte</span>
            <span className="marquee__dot" aria-hidden="true">·</span>
            <span>Chalets contemporains</span>
            <span className="marquee__dot" aria-hidden="true">·</span>
            <span>Petits programmes tertiaires</span>
          </p>
        </section>

        {/* 3 · Chiffres */}
        <section className="stats" aria-label="Le cabinet en chiffres">
          <div className="wrap">
            <ul className="stats__grid">
              <li className="stats__item reveal"><span className="stats__num" data-count="34">0</span><span className="caption">projets livrés</span></li>
              <li className="stats__item reveal"><span className="stats__num" data-count="11">0</span><span className="caption">ans de pratique</span></li>
              <li className="stats__item reveal"><span className="stats__num" data-count="2">0</span><span className="caption">associés</span></li>
              <li className="stats__item reveal"><span className="stats__num" data-count="74">0</span><span className="caption">Haute-Savoie</span></li>
            </ul>
          </div>
        </section>

        {/* 4 · Manifeste */}
        <section className="manifesto" id="atelier" aria-labelledby="manifesto-title">
          <div className="wrap">
            <h2 id="manifesto-title" className="manifesto__text" data-lines>
              <span className="line"><span>Ici, le paysage est déjà écrit.</span></span>
              <span className="line"><span>La montagne, le lac, la lumière du soir :</span></span>
              <span className="line"><span>rien de tout cela ne nous attendait.</span></span>
              <span className="line"><span>Notre travail commence par accepter ce qui existe,</span></span>
              <span className="line"><span>puis chercher le geste le plus court</span></span>
              <span className="line"><span>pour y ajouter un lieu de vie.</span></span>
              <span className="line"><span>Construire peu, mais construire juste.</span></span>
            </h2>
            <a className="btn btn--ghost magnetic reveal" href="#contact"><span className="btn__label">À propos de l'atelier</span></a>
          </div>
        </section>

        {/* 5 · Savoir-faire */}
        <section className="skills" aria-labelledby="skills-title">
          <div className="wrap">
            <h2 id="skills-title" className="visually-hidden">Nos savoir-faire</h2>
            <div className="skill reveal" data-skill>
              <span className="skill__rule" data-rule />
              <h3 className="skill__title">Implanter</h3>
              <p className="skill__desc">Poser une maison sur un terrain sans jamais l'écraser.</p>
              <div className="skill__media ph ph--s1" aria-hidden="true" />
            </div>
            <div className="skill reveal" data-skill>
              <span className="skill__rule" data-rule />
              <h3 className="skill__title">Composer</h3>
              <p className="skill__desc">Des volumes simples, des matériaux durables, une lumière pensée heure par heure.</p>
              <div className="skill__media ph ph--s2" aria-hidden="true" />
            </div>
            <div className="skill reveal" data-skill>
              <span className="skill__rule" data-rule />
              <h3 className="skill__title">Transformer</h3>
              <p className="skill__desc">Réhabiliter chalets et bâtis anciens pour les usages d'aujourd'hui.</p>
              <div className="skill__media ph ph--s3" aria-hidden="true" />
            </div>
            <span className="skill__rule skill__rule--last" data-rule />
          </div>
        </section>

        {/* 6 · Projets */}
        <section className="projects" id="projets" aria-labelledby="projects-title">
          <div className="wrap">
            <div className="projects__head reveal">
              <span className="caption">Sélection</span>
              <h2 id="projects-title" className="projects__heading">Réalisations récentes</h2>
            </div>
            <div className="projects__grid" data-cursor-zone>
              <a className="project project--a reveal" href="#" data-project>
                <figure className="project__figure reveal-img">
                  <div className="project__img ph ph--p1" role="img" aria-label="Maison Talloires, maison contemporaine au bord du lac d'Annecy" />
                  <span className="project__plus" aria-hidden="true">+</span>
                </figure>
                <figcaption className="project__meta">
                  <span className="project__name">Maison Talloires</span>
                  <span className="project__info caption">Maison contemporaine · Lac d'Annecy · 2024</span>
                </figcaption>
              </a>
              <a className="project project--b reveal" href="#" data-project>
                <figure className="project__figure reveal-img">
                  <div className="project__img ph ph--p2" role="img" aria-label="Chalet Roc Blanc, chalet d'architecte à La Clusaz" />
                  <span className="project__plus" aria-hidden="true">+</span>
                </figure>
                <figcaption className="project__meta">
                  <span className="project__name">Chalet Roc Blanc</span>
                  <span className="project__info caption">Chalet d'architecte · La Clusaz · 2023</span>
                </figcaption>
              </a>
              <a className="project project--c reveal" href="#" data-project>
                <figure className="project__figure reveal-img">
                  <div className="project__img ph ph--p3" role="img" aria-label="Atelier Semnoz, réhabilitation à Annecy" />
                  <span className="project__plus" aria-hidden="true">+</span>
                </figure>
                <figcaption className="project__meta">
                  <span className="project__name">Atelier Semnoz</span>
                  <span className="project__info caption">Réhabilitation · Annecy · 2024</span>
                </figcaption>
              </a>
              <a className="project project--d reveal" href="#" data-project>
                <figure className="project__figure reveal-img">
                  <div className="project__img ph ph--p4" role="img" aria-label="Villa Perrière, maison neuve à Veyrier-du-Lac" />
                  <span className="project__plus" aria-hidden="true">+</span>
                </figure>
                <figcaption className="project__meta">
                  <span className="project__name">Villa Perrière</span>
                  <span className="project__info caption">Maison neuve · Veyrier-du-Lac · 2022</span>
                </figcaption>
              </a>
            </div>
          </div>
        </section>

        {/* 7 · Citation */}
        <section className="quote" aria-label="Citation du fondateur">
          <div className="wrap">
            <blockquote className="quote__text reveal">
              « On ne construit pas <em>contre</em> un site, on construit <em>avec</em> lui.
              Le reste — la matière, la lumière, le détail — découle de cette première décision. »
            </blockquote>
            <p className="quote__author reveal">
              <span className="caption">— [Nom à compléter], architecte associé</span>
            </p>
          </div>
        </section>

        {/* 8 · CTA final */}
        <section className="cta" id="contact" aria-labelledby="cta-title">
          <div className="wrap">
            <h2 id="cta-title" className="cta__title" data-lines>
              <span className="line"><span>Un terrain, une idée ?</span></span>
              <span className="line"><span>Parlons-en.</span></span>
            </h2>
            <p className="cta__sub reveal" data-delay="0.4">Premier échange sans engagement, sur place ou à distance.</p>
            <a className="btn magnetic reveal" data-delay="0.5" href="mailto:contact@atelierverso.fr"><span className="btn__label">Nous contacter</span></a>
            <a className="cta__mail link-underline reveal" data-delay="0.6" href="mailto:contact@atelierverso.fr">contact@atelierverso.fr</a>
          </div>
        </section>
      </main>

      {/* 9 · Footer */}
      <footer className="site-footer">
        <div className="wrap site-footer__grid">
          <div className="site-footer__col">
            <p className="site-footer__brand">Atelier Verso</p>
            <p className="caption">Architecture · Annecy</p>
          </div>
          <nav className="site-footer__col" aria-label="Plan du site">
            <p className="caption site-footer__label">Plan du site</p>
            <a className="link-underline" href="#projets">Réalisations</a>
            <a className="link-underline" href="#atelier">Atelier</a>
            <a className="link-underline" href="#contact">Contact</a>
          </nav>
          <nav className="site-footer__col" aria-label="Réseaux sociaux">
            <p className="caption site-footer__label">Réseaux</p>
            <a className="link-underline" href="#" rel="noopener">Instagram</a>
            <a className="link-underline" href="#" rel="noopener">LinkedIn</a>
          </nav>
        </div>
        <div className="wrap site-footer__bottom">
          <span className="caption">© 2026 Atelier Verso</span>
          <a className="caption link-underline" href="#top">↑ Haut de page</a>
        </div>
      </footer>
    </div>
  )
}

export default AtelierVerso
