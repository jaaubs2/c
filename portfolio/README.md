# Portfolio — Ébéniste · Mobilier & agencements sur-mesure

Site portfolio **one-page** pour un **artisan ébéniste** — créateur de mobilier
et d'agencements sur-mesure en bois massif (chêne, noyer, frêne).

**Direction artistique** — *quiet luxury* éditorial & matière
(inspiration : [mersi-architecture.com](https://www.mersi-architecture.com/)).
Fond greige chaud, quasi-monochrome, beaucoup de vide, typographie raffinée,
et le **bois** en héros — matière, assemblages, atelier — qui raconte l'artisanat.

> **État du projet : FONDATIONS.**
> Seul le socle est en place (design system, base, smooth scroll, structure
> sémantique). Les sections (hero, réalisations, savoir-faire, à propos,
> contact) seront construites une par une dans les étapes suivantes.

---

## Lancer le site

Aucune installation, aucun build, aucune dépendance locale.

- **Le plus simple** : double-cliquer sur `index.html` — il s'ouvre dans le navigateur.
- La **style guide** (référence visuelle du design system) : ouvrir `styleguide.html`.

> Les librairies (Lenis, GSAP, ScrollTrigger) et les polices Google Fonts sont
> chargées via CDN : **une connexion internet est nécessaire** au premier chargement.

### Option : petit serveur local
Certains navigateurs sont plus stricts en `file://`. Pour un rendu 1:1, on peut
servir le dossier :

```bash
# Python 3
cd portfolio
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

---

## Structure

```
portfolio/
├─ index.html            # Page principale (structure sémantique, sections à venir)
├─ styleguide.html       # Référence vivante du design system
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css      # Variables : couleurs, typo, espacements, durées… (source de vérité)
│  │  └─ base.css        # Reset moderne, styles globaux, utilitaires
│  ├─ js/
│  │  ├─ lenis.js        # Init du smooth scroll (Lenis)
│  │  └─ main.js         # Point d'entrée : GSAP + synchro Lenis/ScrollTrigger
│  └─ img/               # Visuels (voir assets/img/NOTES.md)
└─ README.md
```

---

## Stack & librairies

| Rôle              | Outil                       | Chargement |
|-------------------|-----------------------------|------------|
| Smooth scroll     | **Lenis** 1.1.x             | CDN (unpkg) |
| Animation         | **GSAP** 3.12 + ScrollTrigger | CDN (cdnjs) |
| Typo display      | **Fraunces** (serif variable) | Google Fonts |
| Typo sans / corps | **Inter Tight**             | Google Fonts |
| Typo mono / méta  | **Space Mono**              | Google Fonts |

HTML / CSS / JS purs. Zéro build, zéro `node_modules`.

---

## Conventions

- **Tokens d'abord.** Toutes les valeurs (couleurs, tailles, espacements, durées)
  vivent dans `assets/css/tokens.css`, sous `:root`. On n'écrit jamais une valeur
  en dur ailleurs : on référence un token (`var(--…)`).
- **Ordre CSS** : `tokens.css` → `base.css` → composants (à venir).
- **Typo fluide** : échelle en `clamp()` (`--step--1` … `--step-5`).
- **Espacements** : échelle modulaire `--space-1` … `--space-12`.
- **Accessibilité** :
  - focus clavier visible (`:focus-visible`),
  - lien d'évitement (`.skip-link`),
  - `prefers-reduced-motion` respecté — les animations ET le smooth scroll
    sont neutralisés si l'utilisateur préfère un mouvement réduit
    (côté CSS *et* côté JS, Lenis n'est alors pas initialisé).
- **Nommage** : classes en minuscules-tirets ; utilitaires génériques (`.wrap`,
  `.eyebrow`, `.meta`) ; préfixe `.sg-` réservé à la style guide.
- **Variante sombre** : préparée en commentaire dans `tokens.css` (à activer plus tard).

---

## Design system en bref

**Couleurs** — `--bg` #EAE5DD · `--surface` #F2EDE4 · `--ink` #1E1A15 ·
`--muted` #8A8175 · `--line` #D8D0C4 · `--wood-oak` #B79A6E ·
`--wood-walnut` #6B4E34 · `--stone` #A08B6F.

**Typo** — Fraunces (titres) · Inter Tight (corps/nav) · Space Mono (méta/légendes).

Voir **`styleguide.html`** pour la référence visuelle complète.

---

## Prochaines étapes

1. Header / navigation
2. Section **Hero**
3. Section **Réalisations** (mobilier & agencements)
4. Section **Savoir-faire** (essences, assemblages, atelier)
5. Section **À propos** (bio de l'ébéniste)
6. Section **Contact** + footer

*(Chaque section sera ajoutée et validée l'une après l'autre.)*
