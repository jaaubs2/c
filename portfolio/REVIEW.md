# REVIEW — Passe qualité finale (étape 6)

Audit et corrections sur l'ensemble du portfolio **Atelier Cormier**.
Vérifié **réellement** dans un navigateur headless (Chromium) — le vrai chemin
animé (GSAP + Lenis injectés localement) ET le chemin de repli, à plusieurs
largeurs, en mouvement réduit, avec test des interactions.

---

## (a) Ce qui a été vérifié / corrigé

### Cohérence globale
- **Espacements homogènes** : toutes les sections (`.rea`, `.sf`, `.ap`, `.ct`)
  utilisent le même rythme vertical `--section-space` (token).
- **Langage d'animation unifié** : durées (`--dur-*`) et easing `--ease-quiet`
  centralisés dans `tokens.css` ; l'easing « quiet » est aussi reproduit en JS
  (`motion.easeQuiet`, même courbe de Bézier) et utilisé par défaut par tous les
  helpers (`revealWords`, `revealUp`, `parallax`, timeline d'intro).
- **Aucun `markers` ScrollTrigger** actif ; pas de ScrollTrigger en double.
- **Rythme tonal** : alternance greige (hero, réalisations, savoir-faire clair,
  à propos, contact) / sombre (bandeau atelier, footer) volontaire et régulière.
- **Échelle typographique** cohérente d'une section à l'autre (Fraunces / Inter
  Tight / Space Mono, mêmes `--step-*`).

### Responsive (testé à 375 / 390 / 768 / 1024 / 1440 px)
- **ZÉRO scroll horizontal involontaire** : `overflowX = 0px` à toutes les
  largeurs, **y compris pendant le scroll** (le pin des essences ne déborde pas).
- Défilement horizontal des essences **désactivé** en mobile (< 801px) et en
  mouvement réduit → repli en **grille verticale** (vérifié : `essencesHoriz=false`).
- Mot géant du hero et clôture « Merci. » : `clamp()` → lisibles et cadrés partout.
- Index réalisations : survol → aperçu (desktop) / vignette inline + tap (mobile,
  mode `rea--static`).
- Colonnes qui s'empilent proprement (à propos, contact, footer) ; cibles ≥ 44px.

### Accessibilité (WCAG AA)
- **Landmarks** `<header>` / `<main>` / `<footer role="contentinfo">` ; **un seul
  `<h1>`** (le mot géant du hero) ; titres de section en `<h2>`, sous-éléments `<h3>`.
- **Navigation clavier complète** (vérifiée) : lignes d'index = vrais `<button>`
  (Entrée ouvre), overlay détail avec **focus trap + Échap + ←/→**, modale mentions
  légales (focus trap + Échap), menu mobile, formulaire.
- **Focus visibles** partout (`:focus-visible`, token `--wood-walnut`).
- `role="dialog"` + `aria-modal` sur l'overlay détail et la modale légale ;
  `aria-label` sur les boutons icônes ; **marquee en `aria-hidden`**.
- **Contrastes renforcés** : `--muted` assombri `#8A8175 → #6B6255`
  (≈ 4.8:1 sur le fond greige, AA texte) ; petits accents terracotta en texte
  passés à `--terracotta-deep` (compteur, numéros de chapitre, méta) pour l'AA.
- **Formulaire** : `<label>` associés, erreurs liées (`aria-describedby`,
  `role="alert"`), confirmation en `role="status" aria-live="polite"`.
- **`prefers-reduced-motion` honoré partout** (vérifié) : préchargeur retiré
  instantanément, pas de scrub bois (hero + clôture), pas de revealWords/revealUp,
  pas de parallax, pas de pin horizontal (grille), pas de marquee animé, modales
  en fondu simple, smooth scroll Lenis désactivé.

### Performance
- Images en `loading="lazy"` (sauf le hero, qui n'a pas d'`<img>` : texture bois
  en CSS), `decoding="async"`, et **`aspect-ratio`** sur les conteneurs pour
  éviter le CLS.
- **Préchargement** de la texture bois du hero (`<link rel="preload" as="image">`) ;
  `preconnect` Google Fonts ; `font-display: swap`.
- Tous les scripts en `defer`, dans l'ordre (libs → helpers → data → main → UI).
- `ScrollTrigger.refresh()` appelé **après le retrait du préchargeur** (fin d'intro)
  **et** au `load` (polices/images) → positions de pin correctes.
- **Aucune erreur console** (vérifié sur tous les scénarios).

### Préchargeur
- Fonctionne au (re)chargement, ne bloque jamais l'accès (verrou retiré + `<noscript>`
  qui le masque si JS off), se retire proprement.
- **Compteur % fluide** (0 → 100, Fraunces, `tabular-nums`) : l'entrée du hero
  n'est déclenchée **qu'après** 100 % **ET** polices prêtes.

### Meta / SEO / détails
- `<html lang="fr">`, `<title>` « Atelier Cormier — Ébéniste à Lyon | Mobilier &
  agencements sur-mesure », meta description, viewport, `theme-color`.
- **Open Graph** (`og:type/locale/site_name/title/description/image`) + `twitter:card`.
- **`favicon.svg`** placeholder (monogramme C).
- **Repli du mot bois** vérifié : `background-color: --wood-walnut` sous l'image →
  si la texture manque (404), le texte reste **visible en noyer** (jamais invisible).

---

## (b) CHECKLIST — tâches humaines restantes

### 1. Déposer les vraies photos (remplacer les placeholders générés)
Mêmes noms de fichiers, formats **WebP de préférence** (voir compression ci-dessous) :

- [ ] **Texture bois du hero** — `assets/img/wood-grain.jpg`
      (grain de noyer/chêne haute résolution ; sert aussi à la clôture « Merci. »)
- [ ] **Réalisations** — `assets/img/realisations/` :
      `leon-01…03`, `marius-01…03`, `halle-grenette-01…04`, `suzanne-01…03`,
      `cellier-01…04`, `aria-01…03`, `comptoir-merciere-01…04`, `camille-01…03`
- [ ] **Essences** — `assets/img/essences/` :
      `chene`, `noyer`, `frene`, `cormier`, `chene-fume`, `frene-olivier`
- [ ] **Assemblages** (macros) — `assets/img/assemblages/` :
      `tenon-mortaise`, `queue-daronde`, `tourillon`
- [ ] **Atelier** — `assets/img/atelier/` : `atelier.jpg` (grande, bandeau sombre)
      et `demarche.jpg` (verticale, mains au travail)
- [ ] **Portrait** — `assets/img/apropos/portrait.jpg` (Julien Cormier)
- [ ] **Image de partage Open Graph** — 1200×630 (remplacer `og:image`)
- [ ] **Favicon** — remplacer `assets/img/favicon.svg` par le vrai logo

> Un **repli dégradé bois** s'affiche automatiquement si une image manque :
> le site ne casse jamais, mais pensez à toutes les déposer avant mise en ligne.

### 2. Compléter les textes
- [ ] **Descriptions des réalisations** (`assets/js/realisations.js`) — actuellement
      des placeholders crédibles, à remplacer par les vrais textes.
- [ ] **Mentions légales** (modale, dans `index.html`) : Raison sociale, **SIRET**,
      **TVA intracommunautaire**, Directeur de la publication, **Hébergeur** (nom + adresse).
- [ ] Vérifier email (`bonjour@ateliercormier.fr`) et Instagram (`@ateliercormier`).

### 3. Brancher le formulaire de contact (au moment de l'hébergement)
Le site étant statique, l'envoi compose aujourd'hui un **mailto pré-rempli**.
Pour une vraie réception en boîte mail, dans `assets/js/finpage.js`
(fonction `setupForm`) / `index.html` :
- [ ] **Formspree** : `action="https://formspree.io/f/XXXX"` + POST, ou
- [ ] **Netlify Forms** : attribut `netlify` sur le `<form>`.

### 4. Performance en production
- [ ] **Compresser les images** et servir en **WebP** (voire AVIF) une fois les
      vraies photos déposées ; ajouter des variantes responsives si besoin.
- [ ] Optionnel : héberger les polices en local pour supprimer la dépendance CDN.

---

*Vérifs effectuées : rendu multi-largeurs, mouvement réduit, ouverture/fermeture
overlay & modale au clavier, validation du formulaire, absence d'erreurs console,
absence de scroll horizontal, préchargeur + compteur, chemin animé complet.*
