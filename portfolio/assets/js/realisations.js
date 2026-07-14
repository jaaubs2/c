/* ==========================================================================
   REALISATIONS.JS — Source de données unique
   --------------------------------------------------------------------------
   L'index (liste) ET la vue détail (overlay) sont générés à partir de ce
   tableau. Pour ajouter/retirer une pièce, il suffit de modifier ici.

   Champs :
     id       identifiant unique (sert d'ancre et de préfixe d'images)
     nom      nom de la pièce (affiché en grand, Fraunces)
     type     nature de l'ouvrage
     essence  bois / matériaux principaux
     annee    année de réalisation
     lieu     localisation
     desc     description (à affiner — 1 à 2 phrases)
     images   chemins des photos (la 1re sert d'aperçu / vignette)

   NB : les descriptions ci-dessous sont des PLACEHOLDERS crédibles, à
   remplacer par les vrais textes de l'atelier. Les images pointent vers
   assets/img/realisations/ — déposez-y les vraies photos (mêmes noms).
   ========================================================================== */

window.REALISATIONS = [
  {
    id: "leon",
    nom: "Léon",
    type: "Bibliothèque sur-mesure",
    essence: "Noyer",
    annee: 2024,
    lieu: "Lyon 6",
    desc:
      "Une bibliothèque toute hauteur en noyer, montée à tenons-mortaises chevillés. " +
      "Les tablettes filent sans quincaillerie apparente ; finition huile-cire mate qui révèle le fil du bois.",
    images: [
      "assets/img/realisations/leon-01.jpg",
      "assets/img/realisations/leon-02.jpg",
      "assets/img/realisations/leon-03.jpg",
    ],
  },
  {
    id: "marius",
    nom: "Marius",
    type: "Table de salle à manger",
    essence: "Chêne massif",
    annee: 2024,
    lieu: "Lyon",
    desc:
      "Une table de six couverts en chêne massif, plateau assemblé à plats-joints et piètement en trapèze. " +
      "Chants adoucis à la main, finition savon pour un toucher soyeux et clair.",
    images: [
      "assets/img/realisations/marius-01.jpg",
      "assets/img/realisations/marius-02.jpg",
      "assets/img/realisations/marius-03.jpg",
    ],
  },
  {
    id: "halle-grenette",
    nom: "Halle Grenette",
    type: "Agencement boutique",
    essence: "Frêne & laiton",
    annee: 2023,
    lieu: "Lyon 1",
    desc:
      "Agencement complet d'une boutique : rayonnages, comptoir et vitrines en frêne, rehaussés de laiton patiné. " +
      "Modules démontables, pensés pour évoluer avec le lieu.",
    images: [
      "assets/img/realisations/halle-grenette-01.jpg",
      "assets/img/realisations/halle-grenette-02.jpg",
      "assets/img/realisations/halle-grenette-03.jpg",
      "assets/img/realisations/halle-grenette-04.jpg",
    ],
  },
  {
    id: "suzanne",
    nom: "Suzanne",
    type: "Buffet cannelé",
    essence: "Noyer",
    annee: 2023,
    lieu: "Lyon 2",
    desc:
      "Un buffet bas à façades cannelées en noyer, portes à recouvrement et charnières invisibles. " +
      "Le cannelage, taillé à la main, capte la lumière rasante du matin.",
    images: [
      "assets/img/realisations/suzanne-01.jpg",
      "assets/img/realisations/suzanne-02.jpg",
      "assets/img/realisations/suzanne-03.jpg",
    ],
  },
  {
    id: "cellier",
    nom: "Cellier",
    type: "Cave à vin sur-mesure",
    essence: "Chêne",
    annee: 2023,
    lieu: "Caluire",
    desc:
      "Une cave à vin intégrée en chêne, casiers à bouteilles et claies coulissantes. " +
      "Ventilation naturelle ménagée dans la structure, finition brute cirée qui vieillira avec les crus.",
    images: [
      "assets/img/realisations/cellier-01.jpg",
      "assets/img/realisations/cellier-02.jpg",
      "assets/img/realisations/cellier-03.jpg",
      "assets/img/realisations/cellier-04.jpg",
    ],
  },
  {
    id: "aria",
    nom: "Aria",
    type: "Bureau & bibliothèque",
    essence: "Frêne olivier",
    annee: 2022,
    lieu: "Lyon 6",
    desc:
      "Un ensemble bureau et bibliothèque en frêne olivier, plateau en porte-à-faux et rangements suspendus. " +
      "Assemblages à queues-d'aronde apparentes, comme une signature.",
    images: [
      "assets/img/realisations/aria-01.jpg",
      "assets/img/realisations/aria-02.jpg",
      "assets/img/realisations/aria-03.jpg",
    ],
  },
  {
    id: "comptoir-merciere",
    nom: "Comptoir Mercière",
    type: "Agencement café",
    essence: "Chêne fumé",
    annee: 2022,
    lieu: "Lyon 2",
    desc:
      "Le comptoir et les banquettes d'un café en chêne fumé, plateau massif d'un seul tenant. " +
      "Arêtes vives, patine anticipée aux endroits de passage : une pièce faite pour servir.",
    images: [
      "assets/img/realisations/comptoir-merciere-01.jpg",
      "assets/img/realisations/comptoir-merciere-02.jpg",
      "assets/img/realisations/comptoir-merciere-03.jpg",
      "assets/img/realisations/comptoir-merciere-04.jpg",
    ],
  },
  {
    id: "camille",
    nom: "Tête de lit Camille",
    type: "Tête de lit & chevets",
    essence: "Noyer",
    annee: 2021,
    lieu: "Villeurbanne",
    desc:
      "Une tête de lit et ses deux chevets en noyer, lignes tendues et poignées creusées dans la masse. " +
      "Placage tranché en fil suivi, pour une continuité parfaite du veinage.",
    images: [
      "assets/img/realisations/camille-01.jpg",
      "assets/img/realisations/camille-02.jpg",
      "assets/img/realisations/camille-03.jpg",
    ],
  },
];
