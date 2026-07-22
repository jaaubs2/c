# Images — à compléter

Ce dossier est prévu pour les photographies définitives du site. En l'absence
de visuels, la page affiche des **aplats duotone** (classes `.ph--*` dans
`assets/css/styles.css`) qui respectent la charte chromatique.

## Remplacer un placeholder par une vraie photo

Chaque zone image porte une classe `.ph--xxx`. Pour poser une photo, il suffit
de surcharger le `background-image` correspondant :

```css
.ph--hero { background-image: linear-gradient(180deg, rgba(28,32,30,.28), rgba(28,32,30,.5)), url("../img/hero.jpg"); }
.ph--p1   { background-image: url("../img/talloires.jpg"); }
```

## Visuels attendus

| Classe      | Section        | Sujet indicatif                                                        |
|-------------|----------------|------------------------------------------------------------------------|
| `.ph--hero` | Hero           | Maison contemporaine bois + béton clair, montagne, lumière de fin de journée, légèrement assombrie |
| `.ph--s1`   | Implanter      | Maison posée sur un terrain en pente                                   |
| `.ph--s2`   | Composer       | Détail de volumes / lumière / matière                                  |
| `.ph--s3`   | Transformer    | Réhabilitation de chalet / bâti ancien                                 |
| `.ph--p1`   | Maison Talloires | Maison contemporaine, lac d'Annecy                                   |
| `.ph--p2`   | Chalet Roc Blanc | Chalet d'architecte, La Clusaz                                       |
| `.ph--p3`   | Atelier Semnoz | Réhabilitation, Annecy                                                 |
| `.ph--p4`   | Villa Perrière | Maison neuve, Veyrier-du-Lac                                           |

## Recommandations

- Formats optimisés (WebP/AVIF), largeur ~1600–2000 px pour les grands visuels.
- Poids visé : chargement complet < 3 s.
- **Aucun crédit photographe nominatif** tant que les droits ne sont pas
  confirmés — laisser la mention « à compléter ».
