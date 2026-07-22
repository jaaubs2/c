# Atelier Neige

Site vitrine **type Awwwards** pour une maison de soin & rituels de bien-être.
Éditorial, palette neige/glacier, grande typographie serif, animations douces au
scroll, curseur custom et grain.

## Aperçu

- **Hero** plein écran avec typo cinétique et halo lumineux
- **Marquee** défilant, **compteurs** animés, **reveals** au scroll (IntersectionObserver)
- Liste de **soins** avec hover pleine surface
- Galerie **Le lieu** en grille asymétrique
- **Témoignages** en carrousel
- Bloc **rendez-vous** contrasté + footer typographique
- **Curseur personnalisé**, overlay **grain**, `prefers-reduced-motion` respecté

## Stack

100 % statique, zéro dépendance de build :

```
index.html
css/style.css
js/main.js
```

Seule ressource externe : Google Fonts (Fraunces + Inter).

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer

Compatible tel quel avec **GitHub Pages**, **Netlify** ou **Vercel**
(déploiement d'un site statique, dossier racine).

## Personnaliser

- Couleurs & typos : variables `:root` dans `css/style.css`
- Textes & sections : `index.html`
- Les visuels du bloc « Le lieu » sont des dégradés CSS à remplacer par de
  vraies photographies (`.lieu__img`).

---

> Note : ce dépôt est une base **en code**. Le projet Framer d'origine étant
> privé, il n'a pas pu être importé directement — ce site reprend l'esprit
> « Atelier Neige » et sert de référence / point de départ déployable.
