# /assets — images & textures CAMAÏEU

Dossier des médias du site. Rien n'est encore fourni (étape fondations).
Cette note documente les **formats attendus** et les **conventions**.

## Conventions générales

- **Formats** : `.webp` en priorité (photo/texture), `.avif` en variante si
  disponible, `.jpg` en fallback. `.svg` pour le pictural vectoriel (filets,
  pictos). Pas de PNG lourd pour les photos.
- **Espaces colorimétriques** : sRGB.
- **Dimensions explicites** : chaque `<img>` DOIT porter `width` et `height`
  (ratio réservé → zéro CLS).
- **Lazy-load** : `loading="lazy"` + `decoding="async"` pour tout ce qui est
  sous la ligne de flottaison.
  **Exception : l'image du hero est above-the-fold → PAS de lazy-load**
  (utiliser `fetchpriority="high"` et un `<link rel="preload">` éventuel).
- **Poids cible** : hero ≤ 300 Ko (webp qualité ~78), vignettes ≤ 120 Ko.
- **Nommage** : `kebab-case`, préfixe par section (`hero-…`, `realisation-01-…`).

## Fichiers attendus (à fournir par un humain)

| Fichier                     | Usage                          | Dimensions conseillées | Notes |
|-----------------------------|--------------------------------|------------------------|-------|
| `hero-pigment.jpg` / `.webp`| Texture pigment/chaux du hero  | 2400 × 1500 (3:2)      | [PLACEHOLDER] — fallback dégradé Bleu de Prusse si absent |
| `texture-chaux.webp`        | Grain de fond réutilisable     | 1600 × 1600            | Optionnel, subtil |
| `realisation-01..NN.webp`   | Réalisations (étape 4)         | 1600 × 2000 (4:5)      | À venir |
| `atelier-portrait.webp`     | Section atelier (étape 5)      | 1600 × 2000            | À venir |
| `og-cover.jpg`              | Open Graph / partage social    | 1200 × 630             | À venir |
| `favicon.svg` + `.ico`      | Favicon                        | 32/180                 | À venir |

> Tant que `hero-pigment.jpg` est absent, le hero affiche un **dégradé de
> camaïeu Bleu de Prusse** généré en canvas/CSS — le rendu reste digne.
