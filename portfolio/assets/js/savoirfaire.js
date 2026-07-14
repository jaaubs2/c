/* ==========================================================================
   SAVOIRFAIRE.JS — Données de la section #savoir-faire
   --------------------------------------------------------------------------
   Essences de bois et assemblages. La galerie horizontale et la liste des
   assemblages sont générées à partir d'ici.
   Images → assets/img/essences/ et assets/img/assemblages/ (déposer les
   vraies photos/textures ; repli dégradé bois si absentes).
   ========================================================================== */

window.SAVOIRFAIRE = {
  essences: [
    { nom: "Chêne",         note: "Robuste et franc, veine ouverte",  img: "assets/img/essences/chene.jpg" },
    { nom: "Noyer",         note: "Profond et chaleureux, grain fin",  img: "assets/img/essences/noyer.jpg" },
    { nom: "Frêne",         note: "Clair et nerveux, veinage marqué",  img: "assets/img/essences/frene.jpg" },
    { nom: "Cormier",       note: "Dense et satiné, rare",             img: "assets/img/essences/cormier.jpg" },
    { nom: "Chêne fumé",    note: "Sombre et fumé, du caractère",      img: "assets/img/essences/chene-fume.jpg" },
    { nom: "Frêne olivier", note: "Contrasté et vivant",               img: "assets/img/essences/frene-olivier.jpg" },
  ],
  assemblages: [
    { nom: "Tenon-mortaise", note: "L'assemblage fondateur — solide et invisible", img: "assets/img/assemblages/tenon-mortaise.jpg" },
    { nom: "Queue d'aronde", note: "L'emblème de l'ébénisterie — tenue mécanique",  img: "assets/img/assemblages/queue-daronde.jpg" },
    { nom: "Tourillon",      note: "Discret, précis, sans quincaillerie",           img: "assets/img/assemblages/tourillon.jpg" },
  ],
  // Termes du métier pour le bandeau marquee
  termes: [
    "Tenon-mortaise", "Queue d'aronde", "Huile-cire", "Chêne", "Noyer",
    "Frêne", "Sur-mesure", "Bois massif", "Cannelage", "Placage tranché",
  ],
};
