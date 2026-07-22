# Atelier Verso — intégration dans Framer

Ce dossier contient la page d'accueil **prête à coller dans Framer**, sous
forme d'un composant de code React (`AtelierVerso.tsx`).

> ⚠️ Rappel : personne ne peut « pousser » automatiquement ce design dans ton
> projet Framer à ta place — Framer est un éditeur en ligne. Les étapes
> ci-dessous sont à faire **toi-même**, elles prennent 2 minutes.

## Étapes

1. **Ouvre ton projet Framer** (le lien du template, une fois dupliqué dans ton
   compte).
2. Menu **Insert (+)** en haut → **Code** → **New Code File**.
3. **Colle tout le contenu** de `AtelierVerso.tsx`. Nomme le fichier
   `AtelierVerso`.
4. Reviens sur ta page. Dans le panneau de gauche, onglet **Assets** (ou la
   section Code), tu vois le composant **AtelierVerso** : **glisse-le** sur la
   page (ou sur un cadre « Desktop »).
5. Sélectionne le composant → dans le panneau de droite, mets la **largeur sur
   « Fill »** (100 %). La hauteur suit le contenu ; la page défile normalement.
6. Clique sur **Play / Preview** (en haut à droite) pour voir les animations au
   scroll (elles ne se déclenchent qu'en aperçu, pas dans l'éditeur figé).

## Polices

Le composant charge automatiquement **Fraunces** et **Space Grotesk** depuis
Google Fonts. Tu peux aussi les ajouter via le gestionnaire de polices de
Framer si tu préfères les gérer nativement.

## Images

Les visuels sont des **aplats duotone « à compléter »**. Pour poser une vraie
photo, ouvre `AtelierVerso.tsx`, trouve la classe `.ph--xxx` concernée dans le
bloc `CSS` et remplace son `background-image`, par exemple :

```css
.av-root .ph--hero { background-image: url("https://…/hero.jpg"); }
.av-root .ph--p1   { background-image: url("https://…/talloires.jpg"); }
```

Correspondance : `ph--hero` (hero), `ph--s1/s2/s3` (Implanter / Composer /
Transformer), `ph--p1…p4` (Talloires, Roc Blanc, Semnoz, Perrière).

## Alternative : version HTML autonome

Si tu préfères ne pas passer par Framer, le même site existe en HTML/CSS/JS
classique à la racine du dépôt (`index.html`) — ouvrable directement dans un
navigateur ou hébergeable tel quel.
