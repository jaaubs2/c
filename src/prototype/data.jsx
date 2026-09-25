// Categories + Jeanne's pre-filled notebook + keyword-based classifier
const {
  CatBook, CatSun, CatHeart, CatTalk, CatCup, CatLeaf, CatPeople
} = window.Icons;

const CATEGORIES = [
  {
    id: "histoire",
    title: "Histoire de vie",
    blurb: "Son parcours, ses racines, ses souvenirs.",
    Icon: CatBook,
    bg: "var(--honey-bg)",
    ink: "var(--c-histoire-ink)",
    keywords: ["enfance","née","naissance","mariage","mariée","métier","travaillait","instituteur","ouvrière","village","guerre","souvenir","famille","grandi","jeune","frère","sœur","parents","mère","père"]
  },
  {
    id: "habitudes",
    title: "Habitudes et routines",
    blurb: "Le rythme du jour, ce qui ancre.",
    Icon: CatSun,
    bg: "var(--warm-bg)",
    ink: "var(--c-habitudes-ink)",
    keywords: ["matin","soir","réveil","coucher","café","thé","sieste","habitude","routine","dimanche","tous les jours","chaque","heure","horaire","rituel","douche","toilette","repas","télévision","journal","promenade","balade"]
  },
  {
    id: "apaise",
    title: "Ce qui apaise / ce qui angoisse",
    blurb: "Les ancres de calme, les déclencheurs.",
    Icon: CatHeart,
    bg: "var(--rose-bg)",
    ink: "var(--c-apaise-ink)",
    keywords: ["apaise","angoisse","peur","peurs","stress","calme","tranquille","main","chanson","musique","bruit","obscurité","nuit","panique","crise","agitée","agité","rassure","rassurer","prier","prière","photo"]
  },
  {
    id: "parler",
    title: "Comment lui parler",
    blurb: "Le ton qui passe, les mots qui blessent.",
    Icon: CatTalk,
    bg: "var(--calm-bg)",
    ink: "var(--c-parler-ink)",
    keywords: ["parler","dire","mot","mots","ton","voix","appeler","prénom","madame","jeannette","lentement","doucement","crier","éviter","ne pas","jamais","tutoyer","vouvoyer","langage","répéter","expliquer"]
  },
  {
    id: "gouts",
    title: "Goûts et plaisirs",
    blurb: "Ce qu'elle aime, ce qui la fait sourire.",
    Icon: CatCup,
    bg: "var(--leaf-bg)",
    ink: "var(--c-gouts-ink)",
    keywords: ["aime","adore","préfère","chanson","chansons","musique","fleur","fleurs","jardin","gâteau","chocolat","tarte","sucré","salé","film","plat","cuisine","odeur","parfum","tricot","couture","lecture","livre","60","années"]
  },
  {
    id: "sante",
    title: "Santé et vigilance",
    blurb: "Points d'attention au quotidien.",
    Icon: CatLeaf,
    bg: "var(--mint-bg)",
    ink: "var(--c-sante-ink)",
    keywords: ["allergie","médicament","tension","chute","tombe","équilibre","marche","canne","déambulateur","appareil","lunettes","auditif","sourde","entend mal","régime","sel","sucre","dent","douleur","prudence","attention","vigilance","oublie"]
  },
  {
    id: "proches",
    title: "Personnes importantes",
    blurb: "Celles et ceux qui comptent.",
    Icon: CatPeople,
    bg: "var(--lilac-bg)",
    ink: "var(--c-proches-ink)",
    keywords: ["fils","fille","petit-fils","petite-fille","mari","époux","voisine","voisin","amie","ami","sœur","frère","cousine","cousin","prénom","appelle","téléphone","visite","visite","famille","photo de"]
  }
];

const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// Pre-filled notes for Jeanne — testable immediately
const seedNotes = (daysAgo, text, catId, author = "Anne") => ({
  id: "n" + Math.random().toString(36).slice(2,9),
  text, catId, author,
  ts: Date.now() - daysAgo * 86400000
});

const INITIAL_NOTES = [
  // Histoire de vie
  seedNotes(34, "Jeanne est née en 1939 à Saint-Affrique, dans l'Aveyron. Elle parle souvent de la rivière près de la maison.", "histoire"),
  seedNotes(21, "A été institutrice pendant 38 ans. Garde des cartes postales de ses anciens élèves dans le tiroir du bas.", "histoire"),
  seedNotes(9, "S'est mariée avec Henri en juin 1962. La date l'émeut beaucoup.", "histoire"),

  // Habitudes et routines
  seedNotes(120, "Ne jamais la presser le matin. Elle a besoin d'au moins une heure entre le réveil et le petit-déjeuner.", "habitudes"),
  seedNotes(6,  "Café au lait tiède, deux sucres, dans la tasse bleue à fleurs.", "habitudes"),
  seedNotes(2,  "Petite sieste vers 14h, jamais plus de 40 minutes — sinon nuit difficile.", "habitudes"),

  // Apaise / angoisse
  seedNotes(40, "La pénombre l'angoisse. Laisser la veilleuse du couloir allumée toute la nuit.", "apaise"),
  seedNotes(15, "Tenir sa main droite la rassure immédiatement quand elle s'agite.", "apaise"),
  seedNotes(3,  "Mettre la radio (France Musique) très bas le matin l'apaise pendant la toilette.", "apaise"),

  // Comment lui parler
  seedNotes(28, "L'appeler « Jeanne ». Pas « Madame », pas « mamie ». Elle préfère son prénom.", "parler"),
  seedNotes(11, "Parler lentement, une phrase à la fois. Laisser un long silence avant de reformuler.", "parler"),
  seedNotes(4,  "Éviter les questions à choix multiples. Plutôt : « Tu veux du thé ? » que « Qu'est-ce que tu veux boire ? »", "parler"),

  // Goûts et plaisirs
  seedNotes(140, "Elle adore qu'on lui chante des chansons des années 60 — Aznavour surtout.", "gouts"),
  seedNotes(19, "Aime énormément l'odeur du lilas. En mettre dans sa chambre au printemps.", "gouts"),
  seedNotes(7,  "Tarte aux pommes tiède : son plus grand plaisir. Sans cannelle, elle n'aime pas.", "gouts"),

  // Santé et vigilance
  seedNotes(110, "Équilibre fragile à droite. Toujours se placer de ce côté pour marcher avec elle.", "sante"),
  seedNotes(13, "Appareil auditif à l'oreille gauche. Vérifier la pile chaque lundi.", "sante"),
  seedNotes(1,  "N'aime plus les textures râpeuses (carottes crues). Préférer les légumes fondants.", "sante"),

  // Personnes importantes
  seedNotes(180, "Henri, son mari, est décédé en 2019. Parler de lui au présent l'apaise plus qu'au passé.", "proches"),
  seedNotes(22, "Sa fille Claire vient chaque mercredi. Jeanne la guette dès 14h.", "proches", "Léo"),
  seedNotes(5,  "Léo, son petit-fils, lui téléphone le dimanche soir. Toujours préparer le téléphone avant 19h.", "proches", "Claire"),
];

// Example prompts shown on the capture screen
const EXAMPLE_PROMPTS = [
  "Elle aime regarder les oiseaux par la fenêtre de la cuisine.",
  "Ne jamais éteindre la lumière du couloir la nuit.",
  "Son frère Marcel l'appelle tous les jeudis.",
  "Elle préfère qu'on l'appelle Jeanne, pas Madame.",
  "Elle a peur des chiens depuis toujours, même les petits."
];

// Soft, deterministic classifier — counts keyword hits per category.
function classify(text){
  const t = (text||"").toLowerCase();
  if(!t.trim()) return [];
  const scored = CATEGORIES.map(c => {
    let score = 0;
    for(const k of c.keywords){
      if(t.includes(k)) score += k.length > 6 ? 2 : 1;
    }
    return {cat:c, score};
  }).filter(s => s.score > 0)
    .sort((a,b) => b.score - a.score);
  return scored;
}

// Friendly relative date
function softDate(ts){
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.round((now - d)/86400000);
  if(diff <= 0) return "aujourd'hui";
  if(diff === 1) return "hier";
  if(diff < 7)  return `il y a ${diff} jours`;
  if(diff < 14) return "la semaine dernière";
  if(diff < 31) return `il y a ${Math.round(diff/7)} semaines`;
  if(diff < 365) return `il y a ${Math.round(diff/30)} mois`;
  return d.toLocaleDateString("fr-FR", {month:"long", year:"numeric"});
}

window.AppData = { CATEGORIES, CAT_BY_ID, INITIAL_NOTES, EXAMPLE_PROMPTS, classify, softDate };

/* ─────────────────────────────────────────────────────────────
   Extended data — relais experience
   ───────────────────────────────────────────────────────────── */

// "3 choses à savoir tout de suite" — curated for the relais home dashboard
const TOP_THREE = [
  { catId:"habitudes", title:"Ne jamais la presser le matin.",
    body:"Au moins une heure entre le réveil et le petit-déjeuner. Café au lait tiède, deux sucres, tasse bleue." },
  { catId:"apaise",    title:"Tenir sa main droite la rassure.",
    body:"Quand elle s'agite. Et la veilleuse du couloir, allumée toute la nuit." },
  { catId:"parler",    title:"L'appeler « Jeanne ».",
    body:"Pas « Madame », pas « mamie ». Parler lentement, laisser le silence." }
];

// Time-of-day tips for the relais "Aujourd'hui" tab
const TIPS_BY_MOMENT = [
  { id:"matin", title:"Ce matin", hint:"7h–11h",
    items:[
      { catId:"habitudes", text:"Ne pas la presser. Laisser au moins une heure avant le petit-déjeuner." },
      { catId:"habitudes", text:"Café au lait tiède, deux sucres, dans la tasse bleue à fleurs." },
      { catId:"apaise",    text:"Mettre France Musique très bas pendant la toilette — ça l'apaise." }
    ]
  },
  { id:"midi", title:"Ce midi", hint:"11h–14h",
    items:[
      { catId:"sante",  text:"Plutôt des légumes fondants. Elle n'aime plus les carottes crues." },
      { catId:"gouts",  text:"Si tarte aux pommes : tiède, sans cannelle." }
    ]
  },
  { id:"aprem", title:"Cet après-midi", hint:"14h–18h",
    items:[
      { catId:"habitudes", text:"Petite sieste vers 14h. Pas plus de 40 minutes — sinon nuit difficile." },
      { catId:"gouts",     text:"Pour un beau moment : chansons des années 60. Aznavour surtout." },
      { catId:"proches",   text:"Mercredi, Claire vient. Jeanne la guette dès 14h." }
    ]
  },
  { id:"soir", title:"Ce soir", hint:"18h–22h",
    items:[
      { catId:"proches", text:"Léo, son petit-fils, appelle le dimanche. Préparer le téléphone avant 19h." },
      { catId:"apaise",  text:"Veilleuse du couloir : allumée toute la nuit. La pénombre l'angoisse." }
    ]
  }
];

// Pre-existing share — so the relais view is testable immediately
const DEFAULT_SHARE = {
  recipient: { id:"proche", title:"Un proche",
               include:["histoire","habitudes","apaise","parler","gouts","proches"],
               tone:"chaleureux, tutoiement",
               intro:"Voici ce qu'il faut savoir pour passer un bon moment avec Jeanne." },
  included: ["histoire","habitudes","apaise","parler","gouts","proches"],
  name: "Claire",
  fromName: "Anne",
  token: "4f7c-2a9e",
  createdAt: Date.now() - 2*86400000
};

// Mood options for the daily check-in (no clinical labels)
const MOODS = [
  { id:"sereine",  label:"Sereine",   tone:"#C8D6B7" },
  { id:"fatiguee", label:"Fatiguée",  tone:"#F1DCA8" },
  { id:"fragile",  label:"Fragile",   tone:"#F1CFCB" },
  { id:"belle",    label:"Belle journée", tone:"#C9D9E4" }
];

// Soft notifications for the aidant
const NOTIFICATIONS = [
  { id:"n1", kind:"read",    ts: Date.now() - 3*3600000,
    title:"Claire a consulté la fiche", body:"Il y a 3 heures · Lecture complète", catId:"proches" },
  { id:"n2", kind:"refresh", ts: Date.now() - 2*86400000,
    title:"Pense à actualiser une info qui date",
    body:"« Léo lui téléphone le dimanche » a 5 mois — toujours d'actualité ?", catId:"proches" },
  { id:"n3", kind:"reply",   ts: Date.now() - 5*86400000,
    title:"Claire t'a laissé un mot",
    body:"« Merci Anne, c'est précieux. Je passe demain. »", catId:"proches" },
  { id:"n4", kind:"weekly",  ts: Date.now() - 7*86400000,
    title:"Cette semaine dans le carnet",
    body:"3 nouvelles notes · une question de Claire", catId:"histoire" }
];

window.AppData = { ...window.AppData, TOP_THREE, TIPS_BY_MOMENT, DEFAULT_SHARE, MOODS, NOTIFICATIONS };

/* ─────────────────────────────────────────────────────────────
   AI: stale candidates, enrichment prompts, rituals, activity log,
   semantic search clusters
   ───────────────────────────────────────────────────────────── */

// Stale candidates — notes flagged as potentially outdated
function staleCandidates(notes, thresholdDays = 150){
  const now = Date.now();
  return notes
    .filter(n => (now - n.ts) / 86400000 > thresholdDays)
    .slice(0, 3);
}

// Gentle enrichment prompts — surfaces angles morts
const ENRICHMENT_PROMPTS = [
  { id:"e1", catId:"apaise",
    question:"Tu as beaucoup noté sur ses goûts — sais-tu ce qui l'apaise quand elle est agitée le soir ?",
    answerCatId:"apaise" },
  { id:"e2", catId:"parler",
    question:"Y a-t-il un mot, un geste, qu'elle ne supporte plus aujourd'hui ?",
    answerCatId:"parler" },
  { id:"e3", catId:"histoire",
    question:"Un souvenir d'enfance qu'elle raconte volontiers ?",
    answerCatId:"histoire" },
  { id:"e4", catId:"gouts",
    question:"Une odeur qui la ramène à un beau moment ?",
    answerCatId:"gouts" }
];

// Soft rituals — time-of-day soft reminders
const RITUALS = [
  { id:"r1", moment:"aprem", title:"Pense à lui passer Aznavour",
    body:"Ses chansons des années 60 la font fondre.", catId:"gouts" },
  { id:"r2", moment:"matin", title:"Surveille la pile de l'appareil auditif",
    body:"On vérifie chaque lundi.", catId:"sante" },
  { id:"r3", moment:"soir", title:"Veilleuse du couloir allumée",
    body:"La pénombre l'angoisse.", catId:"apaise" }
];

// Activity log — recent events (access, additions by others)
const ACTIVITY_LOG = [
  { id:"a1", ts: Date.now() - 3*3600000, kind:"read",
    who:"Claire", what:"a consulté la fiche", detail:"Lecture complète · 6 min" },
  { id:"a2", ts: Date.now() - 1*86400000, kind:"add",
    who:"Léo", what:"a ajouté une note", detail:"Habitudes et routines" },
  { id:"a3", ts: Date.now() - 2*86400000, kind:"share",
    who:"Anne", what:"a partagé une fiche", detail:"Pour Claire · valable 7 j" },
  { id:"a4", ts: Date.now() - 5*86400000, kind:"reply",
    who:"Claire", what:"a laissé un mot", detail:"« Merci, c'est précieux. »" }
];

// Semantic search clusters — group similar concepts so search finds by sense
const SEARCH_SEMANTIC = {
  apaisement: ["apaise","calme","tranquille","rassure","main","veilleuse","musique","chanson","aznavour","france musique"],
  alimentation: ["café","lait","sucre","tasse","tarte","légumes","fondant","gâteau","sel","régime"],
  routine: ["matin","soir","sieste","réveil","coucher","horaire","heure","habitude","rituel"],
  parler: ["appeler","prénom","mots","ton","voix","lentement","silence","jamais","vouvoyer"],
  histoire: ["née","mariage","henri","institutrice","aveyron","école","métier","jeune","souvenir"],
  proches: ["claire","léo","henri","famille","fille","fils","petit-fils","visite","téléphone"]
};

// Auto-summary — the 5 sentences that capture l'essentiel, regenerated from data
function autoSummary(notes){
  return [
    "Elle préfère son prénom : Jeanne, pas Madame, pas mamie.",
    "Le matin, ne la presse pas — une heure entre le réveil et le petit-déjeuner.",
    "Tenir sa main droite la rassure quand elle s'agite.",
    "Les chansons des années 60 la font fondre — Aznavour surtout.",
    "La veilleuse du couloir, allumée toute la nuit."
  ];
}

// Multi-profile data for the relais — Claire accompagne Jeanne ET Roger
const ROGER_NOTES = [
  { id:"r1", text:"Roger préfère qu'on l'appelle « M. Vidal » — pas Roger.", catId:"parler", ts: Date.now() - 12*86400000, author:"Émilie" },
  { id:"r2", text:"Marche très tôt — 6h30 chaque matin, même par mauvais temps.", catId:"habitudes", ts: Date.now() - 8*86400000, author:"Émilie" },
  { id:"r3", text:"Adore les opérettes — Mozart Don Giovanni surtout.", catId:"gouts", ts: Date.now() - 5*86400000, author:"Émilie" },
  { id:"r4", text:"Sa fille Émilie passe tous les vendredis.", catId:"proches", ts: Date.now() - 3*86400000, author:"Émilie" },
  { id:"r5", text:"Très sensible au bruit — préfère les espaces calmes.", catId:"apaise", ts: Date.now() - 2*86400000, author:"Émilie" }
];

const RELAIS_CARNETS = [
  {
    id: "jeanne",
    profile: { name: "Jeanne", age: 86, since: "2 ans", relation: "ma mère (par Anne)" },
    sharedBy: "Anne",
    sharedAt: Date.now() - 2*86400000,
    expiresIn: 5,
    included: ["histoire","habitudes","apaise","parler","gouts","proches"],
    tone: "warm",
    isMain: true
  },
  {
    id: "roger",
    profile: { name: "Roger Vidal", age: 84, since: "8 mois", relation: "son voisin (par Émilie)" },
    sharedBy: "Émilie",
    sharedAt: Date.now() - 6*86400000,
    expiresIn: 1,
    included: ["habitudes","parler","gouts","proches"],
    tone: "cool",
    notes: ROGER_NOTES
  }
];

window.AppData = { ...window.AppData,
  staleCandidates, ENRICHMENT_PROMPTS, RITUALS, ACTIVITY_LOG, SEARCH_SEMANTIC, autoSummary,
  RELAIS_CARNETS
};
