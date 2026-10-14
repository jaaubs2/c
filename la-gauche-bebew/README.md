# La Gauche Bebew — thème Shopify

Thème Shopify (Online Store 2.0) tiré de la maquette Claude Design « La Gauche Bebew — Site ».
Les sections de l'accueil reprennent la maquette à l'identique (tailles, inclinaisons, scotch, tampon,
grain photocopie, ruban de manif). Les autres pages (boutique, fiche produit, panier, FAQ, contact,
pages légales) sont dessinées dans le même langage.

```
la-gauche-bebew/
├── theme/      ← le thème à mettre en ligne (zip de CE dossier)
└── contenus/   ← textes des pages légales à coller dans Shopify
```

## 1. Mettre le thème en ligne

**Le plus simple :** zippe le **contenu** du dossier `theme/` (les dossiers `assets`, `config`, `layout`…
doivent être à la racine du zip, pas dans un sous-dossier), puis dans Shopify :
**Boutique en ligne > Thèmes > Ajouter un thème > Importer un fichier zip**.

**Avec Shopify CLI :** `cd theme && shopify theme push --unpublished`

Tant qu'il n'y a pas de produit, la grille de l'accueil affiche les slogans d'exemple de la maquette :
le site est montrable tout de suite.

## 2. Créer les produits

Un produit par slogan, avec **3 options** :

| Option   | Valeurs                     |
|----------|-----------------------------|
| Couleur  | Noir, Blanc                 |
| Coupe    | Homme, Femme                |
| Taille   | XS, S, M, L, XL, XXL        |

(24 variantes par slogan, prix 20 €.) Le thème reconnaît aussi « Color », « Fit », « Size ».
Si un slogan n'existe qu'en une couleur, mets une seule valeur à « Couleur ».

**Photos**, dans cet ordre :
1. le t-shirt **à plat**,
2. la photo **portée**,
3. les autres.

Associe la photo à plat de chaque couleur à ses variantes (dans la variante > image) : la carte
change de photo quand on clique sur le filtre Noir / Blanc, et la fiche produit aussi.
Tant qu'un produit n'a pas de photo, le thème dessine le t-shirt à plat avec le slogan (comme la maquette).

**Imprimé dos :** ajoute l'étiquette `imprime-dos` au produit (badge « Imprimé dos »).

**Métachamps facultatifs** (Paramètres > Données personnalisées > Produits) :
- `custom.slogan` (texte multiligne) : le slogan affiché en grand, avec tes retours à la ligne.
  Sinon c'est le titre du produit.
- `custom.impression` (texte) : « Devant » ou « Dos ».

## 3. L'offre 2 pour 35 €

Elle se crée dans **Réductions > Créer une réduction > Achetez X, obtenez Y** :
- Méthode : **Automatique**, titre « 2 pour 35 € » (c'est ce titre qui s'affiche dans le panier)
- Le client achète : **quantité minimum 1** article de « Tous les produits » (ou ta collection t-shirts)
- Le client obtient : **1** article de la même collection, **pourcentage 25 %** (20 € → 15 €)
- Décoche la limite d'utilisations par commande

Résultat : 2 t-shirts = 35 €, 3 = 55 €, 4 = 70 €. Le panier, la barre noire sous le header et
le récapitulatif l'affichent tout seuls.

Les montants dans les textes (20 €, 35 €, 50 €) se règlent dans
**Personnaliser > Paramètres du thème > Offre & livraison**.

## 4. Livraison, paiement

- **Paramètres > Expédition et livraison** : zone **France** uniquement, et un tarif **gratuit à partir de 50 €**.
- **Paramètres > Paiements** : Shopify Payments (CB) + Apple Pay activé.
- **Paramètres > Paiement (checkout)** : mets le logo texte, fond `#F6F5F1`, accent `#111111`, police Archivo
  pour que la page de paiement suive le site.

## 5. Les pages

Dans **Boutique en ligne > Pages**, crée ces pages avec ces adresses (handle) et ces modèles :

| Page                   | Adresse                      | Modèle                 | Contenu                                   |
|------------------------|------------------------------|------------------------|-------------------------------------------|
| FAQ                    | `/pages/faq`                 | `page.faq`             | déjà rempli dans le thème                 |
| Contact                | `/pages/contact`             | `page.contact`         | déjà rempli dans le thème                 |
| Guide des tailles      | `/pages/guide-des-tailles`   | `page.guide-des-tailles` | ⚠ remplace les mesures d'exemple       |
| Mentions légales       | `/pages/mentions-legales`    | `page.legal`           | `contenus/mentions-legales.html`          |
| CGV                    | `/pages/cgv`                 | `page.legal`           | `contenus/cgv.html`                       |
| Confidentialité        | `/pages/confidentialite`     | `page.legal`           | `contenus/confidentialite.html`           |
| Livraison & retours    | `/pages/livraison-retours`   | `page.legal`           | `contenus/livraison-retours.html`         |

Pour coller un fichier `contenus/*.html` : dans l'éditeur de la page, clique sur **`<>` (Afficher le HTML)**,
colle, enregistre. Remplace `[NOM DE L'ENTREPRENEUR]`, `[ADRESSE / DOMICILIATION]`, `[DATE]` et le médiateur.
Colle aussi CGV, confidentialité et retours dans **Paramètres > Politiques** (Shopify les met en lien au paiement).
Ces textes sont des gabarits : fais-les relire avant l'ouverture.

Dans **Paramètres du thème > Pages**, choisis la page « Guide des tailles » : elle s'ouvre en fenêtre
depuis la fiche produit.

## 6. Menus et réseaux

- **Menu principal** (`main-menu`) : Les slogans → `/collections/all`, Manifeste → `/#manifeste`,
  Porte-le en cortège → `/#cortege`, FAQ, Contact. (Si le menu est vide, ces liens s'affichent par défaut.)
- **Footer** : les colonnes Aide et Légal affichent les bons liens par défaut ; tu peux leur attribuer un menu.
- **Paramètres du thème > Réseaux & contact** : liens Instagram et TikTok, email.

## Sections disponibles

Toutes réutilisables dans l'éditeur (Ajouter une section) :

| Section                  | Réglages principaux (repris de la maquette)                                   |
|--------------------------|--------------------------------------------------------------------------------|
| Bandeau annonce          | texte, lien                                                                    |
| Hero slogan              | style Pancarte / Affiche / Noir / Photo, slogan, inclinaison, scotch, tampon   |
| Ruban de manif           | texte, vitesse, inclinaison                                                    |
| Grille de slogans        | collection, 4–10 t-shirts, 3/4/5 colonnes, visuel à plat / porté, badge, tailles, ajout rapide, filtres |
| Bloc offre               | noire / claire, titre, texte, liste, bouton                                    |
| Manifeste                | texte, inclinaison, scotch, collage                                            |
| Porte-le en cortège      | 3 à 6 photos portées avec légende                                              |
| Inscription email        | tous les textes (les inscrit·es arrivent dans Clients, étiquette `newsletter`) |
| Réassurance              | 4 arguments avec icône                                                         |
| FAQ (accordéon)          | questions / réponses                                                           |
| Prends-en un deuxième    | suggestions pour déclencher l'offre                                            |
| Guide des tailles        | une ligne par taille                                                           |

Paramètres globaux (Personnaliser > Paramètres du thème) : couleurs papier / encre, police des titres
(Anton, Archivo Black, Bebas Neue), taille des titres, grain, arrondi, style de bouton (Plein, Contour, Tampon).

## Notes techniques

- Polices auto-hébergées dans `assets/` (pas d'appel à Google Fonts) : Anton, Archivo Black, Bebas Neue,
  Archivo, IBM Plex Mono — toutes sous licence SIL OFL.
- Aucune appli requise : filtres, ajout rapide, mise à jour du panier et guide des tailles sont en JavaScript
  natif (`assets/theme.js`). Le panier et les fiches fonctionnent aussi sans JavaScript.
- La taille n'est jamais pré-sélectionnée sur la fiche produit (évite les commandes en XS par erreur).
- Validé avec Shopify Theme Check (0 erreur).
