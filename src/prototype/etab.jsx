// Établissement — cadre de santé (unités, équipe, droits, validation) + soignant·e (résidents de son unité, note vocale, journal)
(() => {
const { useState, useMemo, useEffect } = React;
const { StatusBar, SearchBar, Avatar, TabBar, momentNow, timeGreeting } = window.UI;
const { CATEGORIES, CAT_BY_ID, RELAIS_CARNETS, TIPS_BY_MOMENT, TOP_THREE, softDate, classify, EXAMPLE_PROMPTS } = window.AppData;
const { IconBack, IconChevron, IconCheck, IconEdit, IconMic, IconClose, IconLock, IconSettings, IconCalendar, IconSwap, JeanneIllustration, CatPeople } = window.Icons;

/* ── Données ─────────────────────────────────────────────── */
const EXTRA = [
  { id:"marthe", profile:{ name:"Marthe Delcourt", age:91, relation:"sa fille Sophie" }, sharedBy:"Sophie", tone:"var(--c-gouts)", ink:"var(--c-gouts-ink)", room:"Ch. 12", unit:"B",
    included:["habitudes","apaise","parler","sante"],
    notes:[
      { id:"m1", text:"Se lève vers 8h30, jamais avant. Un réveil brusque la met en colère pour la matinée.", catId:"habitudes", ts:Date.now()-4*86400000 },
      { id:"m2", text:"Le chapelet dans la poche gauche de son gilet. Le chercher avec elle si elle s'agite.", catId:"apaise", ts:Date.now()-6*86400000 },
      { id:"m3", text:"Vouvoyer. « Madame Delcourt ». Elle a été directrice d'école.", catId:"parler", ts:Date.now()-9*86400000 },
      { id:"m4", text:"Diabète : pas de jus de fruit le matin. Goûter à 16h, pas plus tard.", catId:"sante", ts:Date.now()-2*86400000 },
    ]},
  { id:"henri", profile:{ name:"Henri Bassa", age:79, relation:"son épouse Nadia" }, sharedBy:"Nadia", tone:"var(--c-sante)", ink:"var(--c-sante-ink)", room:"Ch. 4", unit:"A",
    included:["habitudes","gouts","apaise","proches"],
    notes:[
      { id:"h1", text:"Le foot à la télé le soir le calme — surtout l'OM. Sinon RMC en fond sonore.", catId:"gouts", ts:Date.now()-86400000 },
      { id:"h2", text:"Nadia passe chaque jour à 15h. Il la guette dès 14h30 à la fenêtre.", catId:"proches", ts:Date.now()-3*86400000 },
      { id:"h3", text:"N'aime pas être touché par surprise. Se présenter, puis tendre la main.", catId:"apaise", ts:Date.now()-3*86400000 },
    ]},
  { id:"louise", profile:{ name:"Louise Perrin", age:88, relation:"son fils Paul" }, sharedBy:"Paul", tone:"var(--c-histoire)", ink:"var(--c-histoire-ink)", room:"Ch. 21", unit:"C",
    included:["histoire","habitudes","gouts"],
    notes:[
      { id:"l1", text:"Couturière pendant 40 ans. Lui donner un tissu à plier la rassure.", catId:"histoire", ts:Date.now()-5*86400000 },
      { id:"l2", text:"Tisane verveine avant le coucher, jamais de café après 15h.", catId:"habitudes", ts:Date.now()-2*86400000 },
    ]},
  { id:"andre", profile:{ name:"André Kowalski", age:83, relation:"sa fille Hélène" }, sharedBy:"Hélène", tone:"var(--c-proches)", ink:"var(--c-proches-ink)", room:"Ch. 3", unit:"A",
    included:["histoire","habitudes","parler","proches"],
    notes:[
      { id:"an1", text:"Ancien cheminot. Parler de trains, d'horaires, de la gare de Lyon : il s'illumine.", catId:"histoire", ts:Date.now()-7*86400000 },
      { id:"an2", text:"Le tutoiement le vexe. « Monsieur Kowalski », puis André s'il le propose.", catId:"parler", ts:Date.now()-5*86400000 },
      { id:"an3", text:"Journal papier au petit-déjeuner, même s'il ne lit plus vraiment. Le geste compte.", catId:"habitudes", ts:Date.now()-36*3600000 },
      { id:"an4", text:"Hélène appelle le mardi et le samedi vers 18h. Préparer le téléphone.", catId:"proches", ts:Date.now()-4*86400000 },
    ]},
  { id:"simone", profile:{ name:"Simone Aït-Ahmed", age:90, relation:"son petit-fils Yanis" }, sharedBy:"Yanis", tone:"var(--c-apaise)", ink:"var(--c-apaise-ink)", room:"Ch. 15", unit:"B",
    included:["apaise","gouts","parler","sante","proches"],
    notes:[
      { id:"s1", text:"Le bruit des chariots l'angoisse. Fermer la porte pendant la distribution des repas.", catId:"apaise", ts:Date.now()-3*86400000 },
      { id:"s2", text:"Thé à la menthe très sucré à 16h. Refuse tout ce qui est froid.", catId:"gouts", ts:Date.now()-8*86400000 },
      { id:"s3", text:"Mélange français et arabe quand elle est fatiguée. Répondre doucement, ne pas corriger.", catId:"parler", ts:Date.now()-6*86400000 },
      { id:"s4", text:"Appareil auditif gauche : pile à vérifier le lundi. Sans lui, elle se replie.", catId:"sante", ts:Date.now()-20*3600000 },
      { id:"s5", text:"Yanis vient le dimanche avec les enfants. Elle en parle toute la semaine.", catId:"proches", ts:Date.now()-10*86400000 },
    ]},
  { id:"georges", profile:{ name:"Georges Renard", age:77, relation:"son frère Michel" }, sharedBy:"Michel", tone:"var(--c-sante)", ink:"var(--c-sante-ink)", room:"Ch. 24", unit:"C",
    included:["habitudes","gouts","apaise"],
    notes:[
      { id:"g1", text:"Se couche tard, vers 23h. Le forcer plus tôt = nuit agitée.", catId:"habitudes", ts:Date.now()-9*86400000 },
      { id:"g2", text:"Mots croisés et Brassens. Un vieux Télé 7 Jours fait l'affaire.", catId:"gouts", ts:Date.now()-4*86400000 },
      { id:"g3", text:"Quand il tourne en rond, proposer de marcher dehors avec lui. Dix minutes suffisent.", catId:"apaise", ts:Date.now()-30*3600000 },
    ]},
  { id:"yvette", profile:{ name:"Yvette Morel", age:94, relation:"sa nièce Chantal" }, sharedBy:"Chantal", tone:"var(--c-histoire)", ink:"var(--c-histoire-ink)", room:"Ch. 27", unit:"C",
    included:["histoire","apaise","gouts","sante"],
    notes:[
      { id:"y1", text:"Née à Marseille, fille de pêcheur. Les photos du Vieux-Port la font parler longtemps.", catId:"histoire", ts:Date.now()-12*86400000 },
      { id:"y2", text:"Son châle bleu, toujours sur les épaules. Sans lui, elle cherche et s'inquiète.", catId:"apaise", ts:Date.now()-6*86400000 },
      { id:"y3", text:"Adore la soupe de poisson et les navettes à la fleur d'oranger.", catId:"gouts", ts:Date.now()-5*86400000 },
      { id:"y4", text:"Fausse route possible : eau gélifiée, textures mixées, jamais pressée.", catId:"sante", ts:Date.now()-40*3600000 },
    ]},
];
const GEN = [
  ["Paulette Girard",89,"sa fille Nathalie","Nathalie","A","Ch. 1",["habitudes","gouts"],[["Petit-déjeuner à 7h précises, tartines beurrées et chicorée.","habitudes"],["Les chansons de Piaf la font chanter à voix haute.","gouts"]]],
  ["Marcel Lopez",81,"son fils Julien","Julien","A","Ch. 2",["histoire","apaise"],[["Boulanger pendant 45 ans. L'odeur du pain chaud l'apaise instantanément.","histoire"],["Quand il s'agite, lui proposer de pétrir une balle de mousse.","apaise"]]],
  ["Denise Fontaine",92,"sa nièce Agnès","Agnès","A","Ch. 5",["parler","sante"],[["Malentendante : se placer face à elle, articuler, ne pas crier.","parler"],["Chutes fréquentes la nuit. Barrière et veilleuse indispensables.","sante"]]],
  ["Robert Nguyen",78,"son épouse Lan","Lan","A","Ch. 6",["habitudes","proches"],[["Tai-chi au lever du soleil dans le jardin, depuis 30 ans.","habitudes"],["Lan lui apporte du pho le jeudi. Il compte les jours.","proches"]]],
  ["Colette Marchand",87,"son fils Éric","Éric","A","Ch. 8",["gouts","apaise"],[["Aquarelle et pastels : lui laisser du papier et de l'eau.","gouts"],["La télévision allumée sans son la met en colère. Éteindre ou monter le son.","apaise"]]],
  ["Jacques Petit",85,"sa fille Valérie","Valérie","A","Ch. 10",["histoire","parler"],[["Instituteur en Bretagne. Réciter des fables avec lui le rend fier.","histoire"],["Ne jamais dire « on va se calmer ». Poser une question simple à la place.","parler"]]],
  ["Odette Rousseau",93,"sa petite-fille Camille","Camille","B","Ch. 11",["habitudes","gouts"],[["Sieste après le déjeuner, jamais plus d'une heure.","habitudes"],["Confiture de mirabelles. En garder un pot d'avance.","gouts"]]],
  ["Bernard Leroy",80,"son épouse Josiane","Josiane","B","Ch. 13",["apaise","proches"],[["Le chat en peluche sur le lit : ne pas le déplacer.","apaise"],["Josiane vient tous les matins à 10h. L'attendre avec lui à la fenêtre.","proches"]]],
  ["Michèle Garnier",86,"son fils Thomas","Thomas","B","Ch. 14",["parler","sante"],[["Elle répond mieux quand on l'appelle « Michou », comme sa mère.","parler"],["Diabète : surveiller le sucre des goûters, elle en cache dans sa table de nuit.","sante"]]],
  ["Raymond Blanc",88,"sa fille Sylvie","Sylvie","B","Ch. 16",["histoire","habitudes"],[["Ancien viticulteur. Sentir un bouchon de liège le fait sourire.","histoire"],["Il range ses chaussures sous la chaise, toujours dans le même ordre.","habitudes"]]],
  ["Suzanne Mercier",91,"sa nièce Béatrice","Béatrice","B","Ch. 17",["gouts","apaise"],[["Les roses. Une fleur fraîche dans la chambre change sa journée.","gouts"],["Le noir complet l'angoisse. Volet entrouvert la nuit.","apaise"]]],
  ["Lucien Bertrand",84,"son fils Pascal","Pascal","B","Ch. 18",["habitudes","parler"],[["Se rase seul chaque matin. Le laisser faire, même si c'est long.","habitudes"],["Vouvoiement strict. Il a été notaire.","parler"]]],
  ["Ginette Roux",95,"sa fille Monique","Monique","C","Ch. 20",["gouts","proches"],[["Le loto du jeudi : elle ne rate jamais. Lui garder sa place près de la fenêtre.","gouts"],["Monique appelle chaque soir à 19h.","proches"]]],
  ["Pierre Moreau",79,"son épouse Danielle","Danielle","C","Ch. 22",["apaise","sante"],[["Sa montre au poignet, toujours. Il la cherche sinon.","apaise"],["Parkinson : lui laisser le temps pour les gestes, ne pas finir à sa place.","sante"]]],
  ["Thérèse Lambert",90,"son fils Olivier","Olivier","C","Ch. 23",["histoire","habitudes"],[["Couturière à Lyon, canuts dans la famille. Les tissus, la soie : ses mots reviennent.","histoire"],["Messe télévisée le dimanche à 11h. Ne pas déranger.","habitudes"]]],
  ["Albert Simon",82,"sa fille Karine","Karine","C","Ch. 25",["gouts","parler"],[["Le rugby et le pastis sans alcool. Le Top 14 le samedi.","gouts"],["Blagueur : rire avec lui désamorce tout.","parler"]]],
  ["Jeanne Dubois",96,"sa nièce Florence","Florence","C","Ch. 26",["apaise","proches"],[["Le rosaire à 17h, dans le calme. Ne pas interrompre.","apaise"],["Florence vient le mercredi. Elle prépare sa coiffure dès le matin.","proches"]]],
  ["Henriette Vidal",87,"sa fille Anne-Marie","Anne-Marie","C","Ch. 28",["habitudes","sante"],[["Marche dans le couloir après chaque repas, toujours vers la droite.","habitudes"],["Régime sans sel strict. Elle demande souvent la salière.","sante"]]],
  ["Fernand Chevalier",86,"son fils Didier","Didier","A","Ch. 30",["histoire","gouts"],[["Facteur à vélo pendant 35 ans. Connaît encore toutes les rues du village.","histoire"],["Accordéon et bals du samedi. Yvette Horner le fait taper du pied.","gouts"]]],
  ["Madeleine Perrot",89,"sa fille Isabelle","Isabelle","B","Ch. 31",["apaise","habitudes"],[["Sa boîte à boutons : les trier la calme en quelques minutes.","apaise"],["Lait chaud au miel à 20h30, puis extinction des feux.","habitudes"]]],
  ["Roland Gauthier",83,"son épouse Nicole","Nicole","C","Ch. 32",["parler","proches"],[["Parler lentement, une consigne à la fois. Il acquiesce même sans comprendre.","parler"],["Nicole déjeune avec lui le dimanche. Mettre deux couverts.","proches"]]],
];
const TONES = [["var(--c-parler)","var(--c-parler-ink)"],["var(--c-habitudes)","var(--c-habitudes-ink)"],["var(--c-gouts)","var(--c-gouts-ink)"],["var(--c-apaise)","var(--c-apaise-ink)"],["var(--c-sante)","var(--c-sante-ink)"],["var(--c-histoire)","var(--c-histoire-ink)"],["var(--c-proches)","var(--c-proches-ink)"]];
GEN.forEach(([name, age, relation, sharedBy, unit, room, included, notes], i) => {
  const [tone, ink] = TONES[i % TONES.length];
  EXTRA.push({ id:"g"+i, profile:{ name, age, relation }, sharedBy, tone, ink, room, unit, included,
    notes: notes.map(([text, catId], j) => ({ id:`g${i}n${j}`, text, catId, ts: Date.now() - (2 + ((i*3+j*5) % 12)) * 86400000 })) });
});
const RESIDENTS = [
  { ...RELAIS_CARNETS[0], tone:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)", room:"Ch. 7", unit:"B" },
  { ...RELAIS_CARNETS[1], tone:"var(--c-parler)", ink:"var(--c-parler-ink)", room:"Ch. 9", unit:"A" },
  ...EXTRA
];
const UNITS = [
  { id:"A", name:"Unité A", sub:"Rez-de-jardin", tone:"var(--c-parler)", ink:"var(--c-parler-ink)" },
  { id:"B", name:"Unité B", sub:"1er étage · unité protégée", tone:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)" },
  { id:"C", name:"Unité C", sub:"2e étage", tone:"var(--c-gouts)", ink:"var(--c-gouts-ink)" },
];
const PERMS = [
  { id:"read",     label:"Lecture",    short:"Lit",        desc:"Consulte les carnets. N'ajoute rien." },
  { id:"validate", label:"À valider",  short:"Note → visa", desc:"Ajoute des notes, publiées après validation par le cadre." },
  { id:"write",    label:"Notes",      short:"Note",       desc:"Ajoute des notes, visibles tout de suite par l'équipe et la famille." },
];
const SEED_STAFF = [
  { id:"sandra", name:"Sandra Meyer", role:"Aide-soignante", unit:"B", perm:"validate", tone:"warm" },
  { id:"karim",  name:"Karim Haddad", role:"Infirmier",      unit:"A", perm:"write",    tone:"cool" },
  { id:"lucie",  name:"Lucie Faure",  role:"AMP",            unit:"B", perm:"read",     tone:"sage" },
  { id:"theo",   name:"Théo Lambert", role:"Aide-soignant",  unit:"C", perm:"validate", tone:"cool" },
  { id:"ines",   name:"Inès Rocha",   role:"Psychomotricienne", unit:"A", perm:"read",  tone:"warm" },
];
const SEED_ADDED = [
  { id:"a1", residentId:"jeanne", text:"Ce matin, a chanté avec la radio pendant la toilette. France Musique très bas, ça marche.", catId:"apaise", ts:Date.now()-3*3600000, by:"sandra", status:"pending" },
  { id:"a2", residentId:"henri",  text:"Agité vers 14h en attendant Nadia. Le match à la télé l'a apaisé.", catId:"apaise", ts:Date.now()-6*3600000, by:"karim", status:"published" },
  { id:"a3", residentId:"louise", text:"A demandé « son atelier » deux fois. Un tissu à plier a suffi.", catId:"histoire", ts:Date.now()-26*3600000, by:"theo", status:"pending" },
];
const first = n => (n || "").split(" ")[0];
// Établissement affiché (démo ; remplacé par le vrai avec un compte).
const ORG = { name:"Maison des Tilleuls", cadreName:"Marc Aubry", cadreRole:"Cadre de santé", demo:true };
const NO_UNIT = { id:null, name:"Sans unité", sub:"Ton cadre va t'affecter à une unité.", tone:"var(--bg-2)", ink:"var(--ink)" };
const unitOf = (id) => UNITS.find(x => x.id === id) || NO_UNIT;
const MOMENT_LABEL = { matin:"Ce matin", midi:"Ce midi", aprem:"Cet après-midi", soir:"Ce soir" };

/* ── Primitives ──────────────────────────────────────────── */
const Portrait = ({r, size=48}) => (
  <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:r.tone, color:r.ink, overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", flexShrink:0}}>
    <window.Persona name={r.profile.name} seed={r.id === "jeanne" ? "jeanne-bun-2" : r.profile.name} style={r.id === "jeanne" ? "bun" : undefined} size={size} bg="transparent"/>
  </span>
);
const Header = ({left, title, right}) => (
  <div className="topbar" style={{padding:"8px 20px 4px"}}>
    {left || <span style={{width:44}}/>}<span style={{font:"800 16px var(--sans)", letterSpacing:"-.01em"}}>{title}</span>{right || <span style={{width:44}}/>}
  </div>
);
const PageTitle = ({title, sub, right}) => (
  <div className="topbar" style={{padding:"8px 20px 4px"}}>
    <div style={{flex:1, minWidth:0}}><h1 style={{fontSize:28}}>{title}</h1>{sub && <p className="meta" style={{marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{sub}</p>}</div>
    {right}
  </div>
);
const Circle = ({Icon, size=40, bg="var(--ink)", color="#fff", isize=18}) => (
  <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={isize} sw={1.8}/></span>
);
const Pill = ({children, dark, tone, ink}) => (
  <span style={{font:"800 10.5px var(--sans)", letterSpacing:".08em", textTransform:"uppercase", background: dark ? "var(--ink)" : (tone || "rgba(255,255,255,.65)"), color: dark ? "#fff" : (ink || "inherit"), borderRadius:999, padding:"6px 10px", whiteSpace:"nowrap"}}>{children}</span>
);
const Seg = ({options, value, onChange, label}) => (
  <div className="seg" role="radiogroup" aria-label={label}>
    {options.map(o => <button key={o.id} role="radio" aria-checked={value===o.id} className={value===o.id ? "on" : ""} onClick={() => onChange(o.id)} style={{whiteSpace:"nowrap", padding:"0 8px", fontSize:13}}>{o.label}</button>)}
  </div>
);

/* ── Grille résidents (partagée) ─────────────────────────── */
function ResidentGrid({list, notesOf, onOpen}){
  return (
    <ul style={{listStyle:"none", padding:"0 20px", margin:0, display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:12}}>
      {list.map(r => { const ns = notesOf(r); const isNew = ns.some(n => Date.now() - n.ts < 2*86400000); return (
        <li key={r.id} style={{minWidth:0}}>
          <button onClick={() => onOpen(r.id)} className="card-press" aria-label={`Ouvrir le carnet de ${r.profile.name}`}
                  style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", background:r.tone, color:r.ink, borderRadius:"var(--r-lg)", padding:16, minHeight:176, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden"}}>
            <span style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", width:"100%"}}>
              <Portrait r={r} size={48}/>
              {isNew && <Pill dark>Nouveau</Pill>}
            </span>
            <span style={{flex:1}}/>
            <span style={{display:"block", font:"800 17px var(--sans)", letterSpacing:"-.02em", lineHeight:1.1, width:"100%"}}>{r.profile.name}</span>
            <span style={{display:"block", marginTop:5, fontSize:12.5, fontWeight:700, opacity:.8}}>{r.profile.age} ans · {r.room}</span>
            <span style={{display:"block", marginTop:8, fontSize:12.5, fontWeight:700, opacity:.9, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:"100%"}}>{ns.length ? `${ns.length} note${ns.length>1?"s":""}` : "Carnet à ouvrir"}{r.sharedBy ? " · famille" : ""}</span>
          </button>
        </li>
      ); })}
    </ul>
  );
}

/* ══ CADRE ═══════════════════════════════════════════════ */
function CadreUnits({staff, added, notesOf, onOpenUnit, onTab, onSwitchRole, onAddResident}){
  const pending = added.filter(a => a.status === "pending").length;
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1}}>
          <button onClick={onSwitchRole || undefined} aria-label={onSwitchRole ? "Changer de rôle (démo)" : ORG.cadreName} style={{border:"none", background:"none", padding:0, cursor: onSwitchRole ? "pointer" : "default"}}><Avatar name={ORG.cadreName} size={46} tone="sage"/></button>
          <div style={{minWidth:0}}>
            <p style={{font:"800 19px var(--sans)", letterSpacing:"-.02em", lineHeight:1.1}}>{timeGreeting()}, {first(ORG.cadreName)}</p>
            <p className="meta" style={{fontSize:12.5, marginTop:2}}>{ORG.cadreRole} · {ORG.name}</p>
          </div>
        </div>
        <button className="iconbtn" aria-label="Nouveau résident" onClick={onAddResident} style={{background:"var(--ink)", color:"#fff"}}><span style={{font:"800 22px var(--sans)", lineHeight:1}}>+</span></button>
      </div>
      <div className="scroll">
        <div style={{padding:"12px 20px 0"}}>
          <button onClick={() => onTab("validate")} className="card-press" style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", background:"var(--ink)", color:"#fff", borderRadius:"var(--r-xl)", padding:20, display:"flex", gap:14, alignItems:"center"}}>
            <span aria-hidden="true" style={{width:48, height:48, borderRadius:"50%", background:"var(--accent-2)", color:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", font:"800 20px var(--sans)", flexShrink:0}}>{pending}</span>
            <span style={{flex:1, minWidth:0}}>
              <span style={{display:"block", font:"800 16px var(--sans)", letterSpacing:"-.02em"}}>{pending} note{pending>1?"s":""} à valider</span>
              <span style={{display:"block", marginTop:4, fontSize:13, opacity:.7, fontWeight:600}}>Rédigées par l'équipe, en attente de ton visa.</span>
            </span>
            <IconChevron size={18}/>
          </button>
        </div>
        <div style={{padding:"24px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", columnGap:12}}>
          <h2>Unités</h2><span className="meta" style={{fontWeight:700, whiteSpace:"nowrap"}}>{RESIDENTS.length} carnets · {staff.length} soignants</span>
        </div>
        <ul style={{listStyle:"none", padding:"0 20px", margin:0, display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:12}}>
          {UNITS.map(u => {
            const res = RESIDENTS.filter(r => r.unit === u.id), team = staff.filter(s => s.unit === u.id);
            const pend = added.filter(a => a.status === "pending" && res.some(r => r.id === a.residentId)).length;
            return (
              <li key={u.id}>
                <button onClick={() => onOpenUnit(u.id)} className="card-press" style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", background:u.tone, color:u.ink, borderRadius:"var(--r-lg)", padding:18, display:"flex", flexDirection:"column", gap:14, minWidth:0, overflow:"hidden"}}>
                  <span style={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%"}}>
                    <span style={{font:"800 22px var(--sans)", letterSpacing:"-.025em"}}>{u.name}</span>
                    {pend > 0 && <Pill dark>{pend} à valider</Pill>}
                  </span>
                  <span style={{fontSize:13.5, fontWeight:600, opacity:.85}}>{u.sub}</span>
                  <span style={{display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", minWidth:0, gap:10, flexWrap:"wrap"}}>
                    <span style={{display:"flex", flexShrink:0}}>{res.slice(0,4).map((r,i) => <span key={r.id} style={{marginLeft: i ? -10 : 0, borderRadius:"50%", border:"3px solid #fff", background:"#fff", display:"flex"}}><Portrait r={r} size={36}/></span>)}{res.length > 4 && <span aria-hidden="true" style={{marginLeft:-10, width:42, height:42, borderRadius:"50%", background:"var(--ink)", color:"#fff", border:"3px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", font:"800 12px var(--sans)"}}>+{res.length-4}</span>}</span>
                    <span style={{display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end", minWidth:0}}><Pill>{res.length} résident{res.length>1?"s":""}</Pill><Pill>{team.length} soignant{team.length>1?"s":""}</Pill></span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CadreUnit({unitId, staff, notesOf, onBack, onOpenResident, onOpenTeam, onAddResident}){
  const u = UNITS.find(x => x.id === unitId);
  const res = RESIDENTS.filter(r => r.unit === unitId), team = staff.filter(s => s.unit === unitId);
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title={u.name} right={<button className="iconbtn" aria-label="Nouveau résident" onClick={() => onAddResident(unitId)} style={{background:"var(--ink)", color:"#fff"}}><span style={{font:"800 22px var(--sans)", lineHeight:1}}>+</span></button>}/>
      <div className="scroll">
        <div style={{padding:"8px 20px 0"}}>
          <div style={{background:u.tone, color:u.ink, borderRadius:"var(--r-xl)", padding:"20px"}}>
            <h1 style={{fontSize:26}}>{u.name}</h1>
            <p style={{marginTop:6, fontSize:14, fontWeight:600, opacity:.85}}>{u.sub} · {res.length} résidents · {team.length} soignants</p>
          </div>
        </div>
        <p className="kicker" style={{padding:"22px 20px 10px"}}>Équipe affectée</p>
        <ul style={{listStyle:"none", padding:"0 20px", margin:0, display:"grid", gap:8}}>
          {team.map(s => { const p = PERMS.find(x => x.id === s.perm); return (
            <li key={s.id}><button onClick={() => onOpenTeam(s.id)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:14, display:"flex", gap:12, alignItems:"center"}}>
              <Avatar name={s.name} size={40} tone={s.tone}/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14.5px var(--sans)"}}>{s.name}</span><span className="meta" style={{fontSize:12.5}}>{s.role}</span></span>
              <Pill tone="var(--bg)" ink="var(--ink)">{p.label}</Pill>
            </button></li>
          ); })}
          {team.length === 0 && <li className="card" style={{padding:16}}><p className="meta">Personne n'est affecté·e à cette unité.</p></li>}
        </ul>
        <p className="kicker" style={{padding:"22px 20px 10px"}}>Résidents</p>
        <ResidentGrid list={res} notesOf={notesOf} onOpen={onOpenResident}/>
      </div>
    </div>
  );
}

function CadreTeam({staff, setStaff, focusId, onOpen, onAdd, onInvite, invites}){
  const [q, setQ] = useState("");
  const list = staff.filter(s => (s.name + s.role).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <PageTitle title="Équipe" sub={`${staff.length} soignants · affectations et droits`} right={<button className="iconbtn" aria-label="Ajouter un·e soignant·e" onClick={onAdd} style={{background:"var(--ink)", color:"#fff"}}><span style={{font:"800 22px var(--sans)", lineHeight:1}}>+</span></button>}/>
      <div className="scroll" style={{padding:"10px 20px 24px"}}>
        <SearchBar value={q} onChange={setQ} placeholder="Rechercher un·e soignant·e"/>
        <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:8, marginTop:12}}>
          <button onClick={onAdd} className="card-press" style={{border:"none", cursor:"pointer", borderRadius:"var(--r-lg)", padding:14, background:"var(--c-histoire)", color:"var(--c-histoire-ink)", textAlign:"left", display:"flex", flexDirection:"column", gap:8, minHeight:96}}>
            <Circle Icon={CatPeople} size={34} isize={16}/><span style={{font:"800 14px var(--sans)", letterSpacing:"-.02em", lineHeight:1.15, marginTop:"auto"}}>Ajouter un·e soignant·e</span><span style={{fontSize:12, fontWeight:600, opacity:.8}}>Code à 6 chiffres</span>
          </button>
          <button onClick={onInvite} className="card-press" style={{border:"none", cursor:"pointer", borderRadius:"var(--r-lg)", padding:14, background:"var(--c-proches)", color:"var(--c-proches-ink)", textAlign:"left", display:"flex", flexDirection:"column", gap:8, minHeight:96}}>
            <Circle Icon={IconEdit} size={34} isize={16}/><span style={{font:"800 14px var(--sans)", letterSpacing:"-.02em", lineHeight:1.15, marginTop:"auto"}}>Nouveau résident</span><span style={{fontSize:12, fontWeight:600, opacity:.8}}>Ouvrir un carnet</span>
          </button>
        </div>
        <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gap:10}}>
          {list.map(s => { const u = unitOf(s.unit); const p = PERMS.find(x => x.id === s.perm); return (
            <li key={s.id}><button onClick={() => onOpen(s.id)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:16, display:"flex", gap:12, alignItems:"center", outline: focusId === s.id ? "3px solid var(--ink)" : "none"}}>
              <Avatar name={s.name} size={44} tone={s.tone}/>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15px var(--sans)", letterSpacing:"-.01em"}}>{s.name}</span>
                <span className="meta" style={{fontSize:12.5, display:"block", marginTop:2}}>{s.role}</span>
                <span style={{display:"flex", gap:6, marginTop:8}}><Pill tone={u.tone} ink={u.ink}>{u.name}</Pill><Pill tone="var(--bg)" ink="var(--ink)">{p.label}</Pill></span>
              </span>
              <IconChevron size={18}/>
            </button></li>
          ); })}
        </ul>
        {invites && invites.length > 0 && (<>
          <p className="kicker" style={{marginTop:22, marginBottom:10}}>Codes en attente</p>
          <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:8}}>
            {invites.map(i => <li key={i.id} className="card" style={{padding:"12px 16px", display:"flex", justifyContent:"space-between", gap:12}}><span style={{font:"800 14px var(--sans)"}}>{i.display_name}</span><span className="meta" style={{fontSize:12.5}}>valable jusqu'au {new Date(i.expires_at).toLocaleString("fr-FR", {weekday:"short", hour:"2-digit", minute:"2-digit"})}</span></li>)}
          </ul>
        </>)}
      </div>
    </div>
  );
}

function CadreStaff({staffId, staff, setStaff, onUpdate, onBack, onToast}){
  const s = staff.find(x => x.id === staffId);
  const upd = (patch) => onUpdate ? onUpdate(s, {...s, ...patch}) : setStaff(prev => prev.map(x => x.id === staffId ? {...x, ...patch} : x));
  const u = unitOf(s.unit);
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title="Droits d'accès"/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <div style={{background:u.tone, color:u.ink, borderRadius:"var(--r-xl)", padding:20, display:"flex", gap:14, alignItems:"center"}}>
          <Avatar name={s.name} size={56} tone={s.tone}/>
          <div style={{flex:1, minWidth:0}}><p style={{font:"800 20px var(--sans)", letterSpacing:"-.02em"}}>{s.name}</p><p style={{marginTop:4, fontSize:13.5, fontWeight:600, opacity:.85}}>{s.role}</p></div>
        </div>

        <p className="kicker" style={{marginTop:24, marginBottom:10}}>Unité</p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8}}>
          {UNITS.map(x => { const on = s.unit === x.id; return (
            <button key={x.id} onClick={() => { upd({unit:x.id}); onToast(`${first(s.name)} affecté·e à l'${x.name}.`); }} aria-pressed={on}
                    style={{border:"none", cursor:"pointer", borderRadius:"var(--r-md)", padding:"14px 10px", background: on ? "var(--ink)" : x.tone, color: on ? "#fff" : x.ink, textAlign:"left", display:"flex", flexDirection:"column", gap:6, minHeight:84}}>
              <span style={{font:"800 15px var(--sans)"}}>{x.name}</span>
              <span style={{fontSize:11.5, fontWeight:700, opacity:.8}}>{RESIDENTS.filter(r => r.unit === x.id).length} résidents</span>
              {on && <span style={{marginTop:"auto"}}><IconCheck size={16} sw={2.4}/></span>}
            </button>
          ); })}
        </div>

        <p className="kicker" style={{marginTop:24, marginBottom:10}}>Ce qu'elle peut faire</p>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:8}}>
          {PERMS.map(p => { const on = s.perm === p.id; return (
            <li key={p.id}><button onClick={() => { upd({perm:p.id}); onToast(`Droits mis à jour : ${p.label.toLowerCase()}.`); }} role="radio" aria-checked={on} className="card card-press"
                    style={{width:"100%", textAlign:"left", cursor:"pointer", padding:16, display:"flex", gap:12, alignItems:"center", background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)"}}>
              <span aria-hidden="true" style={{width:22, height:22, borderRadius:"50%", border:"2px solid "+(on ? "#fff" : "var(--line-2)"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>{on && <span style={{width:10, height:10, borderRadius:"50%", background:"#fff"}}/>}</span>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15px var(--sans)"}}>{p.label}</span>
                <span style={{display:"block", marginTop:3, fontSize:13, fontWeight:600, opacity: on ? .75 : 1, color: on ? "#fff" : "var(--ink-2)", lineHeight:1.4}}>{p.desc}</span>
              </span>
            </button></li>
          ); })}
        </ul>
        <p className="meta" style={{marginTop:16, fontSize:12.5, textAlign:"center", lineHeight:1.5}}>Chaque note porte le nom de son auteur·e. Les familles invitées voient qui écrit.</p>
      </div>
    </div>
  );
}

function CadreValidate({added, setAdded, staff, onToast, onDecide}){
  const pending = added.filter(a => a.status === "pending");
  const act = (id, status) => {
    if(onDecide) return onDecide(id, status);
    const a = added.find(x => x.id === id);
    setAdded(p => p.map(x => x.id === id ? {...x, status} : x));
    if(status === "published" && a && a.residentId === "jeanne"){ const s = staff.find(x => x.id === a.by); window.FamilyJournal.publish({ text:a.text, catId:a.catId, ts:Date.now(), who: s ? first(s.name) : "L'équipe", role: s ? s.role : "Équipe", unit:"B" }); }
    onToast(status === "published" ? "Note publiée. La famille la reçoit." : "Note refusée. L'auteur·e est prévenu·e.");
  };
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <PageTitle title="À valider" sub={`${pending.length} note${pending.length>1?"s":""} en attente de ton visa`}/>
      <div className="scroll" style={{padding:"10px 20px 24px"}}>
        {pending.length === 0 && <div className="card" style={{padding:"28px 20px", textAlign:"center"}}><h3>Tout est à jour.</h3><p className="meta" style={{marginTop:8}}>Les prochaines notes de l'équipe apparaîtront ici.</p></div>}
        <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:12}}>
          {pending.map(a => { const r = RESIDENTS.find(x => x.id === a.residentId), s = staff.find(x => x.id === a.by), c = CAT_BY_ID[a.catId]; return (
            <li key={a.id} className="card" style={{padding:16}}>
              <div style={{display:"flex", gap:12, alignItems:"center"}}>
                <Portrait r={r} size={40}/>
                <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15px var(--sans)"}}>{r.profile.name}</span><span className="meta" style={{fontSize:12.5}}>{r.room} · {unitOf(r.unit).name}</span></span>
                <span className="meta" style={{fontSize:12, whiteSpace:"nowrap"}}>{softDate(a.ts)}</span>
              </div>
              <p style={{marginTop:12, font:"600 15px var(--sans)", lineHeight:1.5}}>{a.text}</p>
              <div style={{display:"flex", gap:6, marginTop:10, flexWrap:"wrap"}}>
                <Pill tone={c.bg} ink={c.ink}>{c.title}</Pill>
                <Pill tone="var(--bg)" ink="var(--ink)">{s ? `${first(s.name)} · ${s.role}` : a.author ? `${first(a.author)}${a.authorRole ? " · " + a.authorRole : ""}` : "Équipe"}</Pill>
              </div>
              <div style={{display:"flex", gap:8, marginTop:14}}>
                <button className="btn" style={{flex:1, minHeight:46}} onClick={() => act(a.id, "published")}><IconCheck size={18}/> Valider</button>
                <button className="btn soft" style={{minHeight:46}} onClick={() => act(a.id, "rejected")}>Refuser</button>
              </div>
            </li>
          ); })}
        </ul>
      </div>
    </div>
  );
}

function AddStaff({onBack, onDone, onCreateCode}){
  const [f, setF] = useState({ name:"", role:"Aide-soignante", unit: ORG.demo ? "B" : (UNITS[0] || {}).id, perm:"validate" });
  const [code, setCode] = useState(() => String(Math.floor(100000 + Math.random()*900000)));
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function generate(){
    if(!onCreateCode){ setSent(true); return; }
    setBusy(true); setErr("");
    try { const r = await onCreateCode(f); setCode(r.code); setSent(true); }
    catch(e){ setErr(e.message); }
    finally { setBusy(false); }
  }
  const up = (k,v) => setF(p => ({...p, [k]:v}));
  const ROLES = ["Aide-soignante","Infirmier·ère","AMP","ASH","Psychomotricien·ne","Animateur·rice"];
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title="Nouveau membre"/>
      <div className="scroll" style={{padding:"8px 20px 24px", display:"flex", flexDirection:"column"}}>
        {!sent ? (<>
          <label style={{display:"block", marginTop:8}}><span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:6}}>Prénom et nom</span><input value={f.name} onChange={e => up("name", e.target.value)} placeholder="Ex. Lucie Faure" style={{width:"100%", minHeight:52, borderRadius:16, border:"none", background:"#fff", padding:"0 16px", font:"600 16px var(--sans)", color:"var(--ink)", boxShadow:"inset 0 0 0 1.5px var(--line)"}}/></label>
          <p className="kicker" style={{marginTop:18}}>Fonction</p>
          <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:8}}>{ROLES.map(r => <button key={r} className="chip" aria-pressed={f.role === r} onClick={() => up("role", r)}>{r}</button>)}</div>
          <p className="kicker" style={{marginTop:18}}>Unité</p>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8, marginTop:8}}>{UNITS.map(u => { const on = f.unit === u.id; return <button key={u.id} onClick={() => up("unit", u.id)} aria-pressed={on} style={{border:"none", cursor:"pointer", borderRadius:"var(--r-md)", padding:"12px 10px", background: on ? "var(--ink)" : u.tone, color: on ? "#fff" : u.ink, font:"800 14px var(--sans)", minHeight:48}}>{u.name}</button>; })}</div>
          <p className="kicker" style={{marginTop:18}}>Droits</p>
          <ul style={{listStyle:"none", padding:0, margin:"8px 0 0", display:"grid", gap:6}}>{PERMS.map(p => { const on = f.perm === p.id; return <li key={p.id}><button onClick={() => up("perm", p.id)} role="radio" aria-checked={on} className="card" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:"12px 14px", display:"flex", gap:12, alignItems:"center", background: on ? "var(--ink)" : "#fff", color: on ? "#fff" : "var(--ink)"}}><span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14px var(--sans)"}}>{p.label}</span><span style={{display:"block", fontSize:12.5, fontWeight:600, opacity: on ? .75 : 1, color: on ? "#fff" : "var(--ink-2)"}}>{p.desc}</span></span></button></li>; })}</ul>
          <div style={{flex:1}}/>
          {err && <p role="alert" style={{marginTop:14, padding:"12px 14px", borderRadius:14, background:"#FBE3E1", color:"#8C1D18", font:"700 14px var(--sans)"}}>{err}</p>}
          <button className="btn" style={{marginTop:20, width:"100%"}} disabled={!f.name.trim() || busy} onClick={generate}>{busy ? "Création du code…" : "Générer son code"}</button>
        </>) : (<>
          <div className="fade-enter" style={{marginTop:8, background:"var(--c-histoire)", color:"var(--c-histoire-ink)", borderRadius:"var(--r-xl)", padding:22, textAlign:"center"}}>
            <window.UserPersona name={f.name} size={72} bg="rgba(255,255,255,.7)"/>
            <p style={{marginTop:12, font:"800 20px var(--sans)", letterSpacing:"-.02em"}}>{f.name}</p>
            <p style={{marginTop:4, fontSize:13.5, fontWeight:600, opacity:.85}}>{f.role} · {unitOf(f.unit).name} · {PERMS.find(p => p.id === f.perm).label}</p>
            <p className="kicker" style={{marginTop:22, color:"inherit", opacity:.9}}>Son code d'équipe</p>
            <p style={{marginTop:8, font:"800 44px var(--sans)", letterSpacing:".18em"}} aria-label={"Code " + code.split("").join(" ")}>{code}</p>
            <p style={{marginTop:10, fontSize:13, fontWeight:600, opacity:.85, lineHeight:1.45}}>{ORG.demo ? "Valable 48 h. Elle l'entre à sa première ouverture, choisit un PIN, et c'est tout." : "Valable 48 h, une seule fois. Elle crée son compte (profil « soignant·e »), puis entre ce code."}</p>
          </div>
          <button className="btn soft" style={{marginTop:14, width:"100%"}} onClick={() => navigator.clipboard && navigator.clipboard.writeText(code)}>Copier le code</button>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:14, width:"100%"}} onClick={() => onDone({ id:"s"+Date.now(), name:f.name, role:f.role, unit:f.unit, perm:f.perm, tone:"warm" })}><IconCheck size={18}/> Terminé</button>
        </>)}
      </div>
    </div>
  );
}

function AddResident({unit:presetUnit, onBack, onDone}){
  const [f, setF] = useState({ name:"", age:"", room:"", unit:presetUnit || (ORG.demo ? "B" : (UNITS[0] || {}).id), family:"", contact:"", invite:true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [created, setCreated] = useState(null);
  async function submit(){
    if(ORG.demo){ onDone(f); return; }
    setBusy(true); setErr("");
    try { const r = await onDone(f); if(r && r.invite) setCreated(r); }
    catch(e){ setErr(e.message); }
    finally { setBusy(false); }
  }
  if(created) return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={() => created.open()}><IconBack size={20}/></button>} title="Carnet ouvert"/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <h1 style={{fontSize:26, marginTop:8}}>Invitation pour {first(f.family.split(",")[0])}.</h1>
        <p className="meta" style={{marginTop:8, lineHeight:1.5}}>Envoie-lui ce lien (SMS, email). Il ne sert qu'une fois : la famille crée son compte, lit le carnet et y ajoute ce qu'elle seule sait.</p>
        <div style={{marginTop:18}}><window.BUI.LinkBox url={created.invite.url} expiresAt={created.invite.expiresAt} shareText={`${ORG.name} vous invite au carnet de ${first(f.name)}`}/></div>
        <button className="btn" style={{marginTop:20, width:"100%"}} onClick={() => created.open()}><IconCheck size={18}/> Ouvrir le carnet</button>
      </div>
    </div>
  );
  const up = (k,v) => setF(p => ({...p, [k]:v}));
  const In = ({label, k, ...p}) => <label style={{display:"block"}}><span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:6}}>{label}</span><input value={f[k]} onChange={ev => up(k, ev.target.value)} {...p} style={{width:"100%", minHeight:52, borderRadius:16, border:"none", background:"#fff", padding:"0 16px", font:"600 16px var(--sans)", color:"var(--ink)", boxShadow:"inset 0 0 0 1.5px var(--line)"}}/></label>;
  const ok = f.name.trim() && f.room.trim();
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title="Nouveau résident"/>
      <div className="scroll" style={{padding:"8px 20px 24px", display:"flex", flexDirection:"column"}}>
        <h1 style={{fontSize:26, marginTop:8}}>Ouvrir son carnet.</h1>
        <p className="meta" style={{marginTop:6, lineHeight:1.5}}>L'équipe le remplit au fil des jours, à la voix. La famille peut être invitée à y ajouter ce qu'elle seule sait.</p>
        <div style={{display:"grid", gap:14, marginTop:18}}>
          <In label="Prénom et nom" k="name" placeholder="Ex. Germaine Roux"/>
          <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:10}}>
            <In label="Âge" k="age" inputMode="numeric" placeholder="88"/>
            <In label="Chambre" k="room" placeholder="Ch. 33"/>
          </div>
          <div>
            <span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:8}}>Unité</span>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8}}>{UNITS.map(u => { const on = f.unit === u.id; return <button key={u.id} onClick={() => up("unit", u.id)} aria-pressed={on} style={{border:"none", cursor:"pointer", borderRadius:"var(--r-md)", padding:"12px 10px", background: on ? "var(--ink)" : u.tone, color: on ? "#fff" : u.ink, font:"800 14px var(--sans)", minHeight:48}}>{u.name}</button>; })}</div>
          </div>
          <div className="card" style={{padding:14}}>
            <button onClick={() => up("invite", !f.invite)} role="switch" aria-checked={f.invite} style={{width:"100%", border:"none", background:"none", padding:0, cursor:"pointer", display:"flex", gap:12, alignItems:"center", textAlign:"left"}}>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14.5px var(--sans)"}}>Inviter la famille à contribuer</span><span className="meta" style={{fontSize:12.5}}>Elle lit le carnet et ajoute ses propres notes.</span></span>
              <span aria-hidden="true" style={{width:44, height:26, borderRadius:999, background: f.invite ? "var(--ink)" : "var(--line-2)", position:"relative", flexShrink:0, transition:"background .2s"}}><span style={{position:"absolute", top:3, left: f.invite ? 21 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left .2s"}}/></span>
            </button>
            {f.invite && <div className="slide-up" style={{display:"grid", gap:10, marginTop:12}}>
              <In label="Proche référent·e" k="family" placeholder="Prénom, lien (fille, époux…)"/>
              {ORG.demo ? <In label="Email ou téléphone" k="contact" placeholder="Pour lui envoyer l'invitation"/> : <p className="meta" style={{fontSize:12.5, lineHeight:1.45}}>Un lien d'invitation te sera donné, à lui envoyer par SMS ou email.</p>}
            </div>}
          </div>
        </div>
        <div style={{flex:1}}/>
        {err && <p role="alert" style={{marginTop:14, padding:"12px 14px", borderRadius:14, background:"#FBE3E1", color:"#8C1D18", font:"700 14px var(--sans)"}}>{err}</p>}
        <button className="btn" style={{marginTop:20, width:"100%"}} disabled={!ok || busy} onClick={submit}><IconCheck size={18}/> {busy ? "Ouverture…" : "Ouvrir le carnet" + (f.invite && f.family ? " et inviter " + f.family.split(",")[0] : "")}</button>
      </div>
    </div>
  );
}

/* ══ SOIGNANT·E ══════════════════════════════════════════ */
function StaffHome({me, notesOf, added, onOpenResident, onTab, onSwitchRole, onCapture}){
  const u = unitOf(me.unit), p = PERMS.find(x => x.id === me.perm);
  const res = RESIDENTS.filter(r => r.unit === me.unit);
  const mine = added.filter(a => a.by === me.id && a.status === "pending").length;
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1}}>
          <button onClick={onSwitchRole || undefined} aria-label={onSwitchRole ? "Changer de rôle (démo)" : me.name} style={{border:"none", background:"none", padding:0, cursor: onSwitchRole ? "pointer" : "default"}}><Avatar name={me.name} size={46} tone={me.tone}/></button>
          <div style={{minWidth:0}}>
            <p style={{font:"800 19px var(--sans)", letterSpacing:"-.02em", lineHeight:1.1, whiteSpace:"nowrap"}}>Bonjour, {first(me.name)}</p>
            <p className="meta" style={{fontSize:12.5, marginTop:2}}>{me.role} · {u.name}</p>
          </div>
        </div>
      </div>
      {ORG.demo && <window.NetBanner/>}
      <div className="scroll">
        <div style={{padding:"12px 20px 0"}}>
          <div style={{background:u.tone, color:u.ink, borderRadius:"var(--r-xl)", padding:20}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <Circle Icon={CatPeople} size={44} isize={20}/>
              <Pill>{res.length} résidents</Pill>
            </div>
            <h1 style={{fontSize:26, marginTop:16}}>{u.name}</h1>
            <p style={{marginTop:6, fontSize:14, fontWeight:600, opacity:.85}}>{u.sub}. {me.perm === "read" ? "Tu consultes les carnets." : me.perm === "validate" ? "Tes notes sont publiées après visa du cadre." : "Tes notes sont publiées immédiatement."}</p>
            {mine > 0 && <p style={{marginTop:12, fontSize:13, fontWeight:700}}>{mine} de tes notes attend{mine>1?"ent":""} une validation.</p>}
            {onCapture && <button className="btn" onClick={onCapture} style={{marginTop:18, minHeight:50, whiteSpace:"nowrap"}}><IconMic size={18}/> Ajouter une note vocale</button>}
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <button onClick={() => onTab("today")} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:14, alignItems:"center", padding:16}}>
            <Circle Icon={IconCalendar} size={44} isize={20} bg="var(--bg)" color="var(--ink)"/>
            <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Consignes pour {MOMENT_LABEL[momentNow()].toLowerCase()}</span><span className="meta" style={{display:"block", marginTop:4}}>Résident par résident, ce qui compte maintenant.</span></span>
            <IconChevron size={18}/>
          </button>
        </div>
        <div style={{padding:"24px 20px 12px", display:"flex", justifyContent:"space-between", alignItems:"baseline"}}><h2>Mes résidents</h2></div>
        <ResidentGrid list={res} notesOf={notesOf} onOpen={onOpenResident}/>
      </div>
    </div>
  );
}

function Resident({residentId, notesOf, canWrite, onBack, onOpenCat, onAdd}){
  const r = RESIDENTS.find(x => x.id === residentId) || RESIDENTS[0];
  const ns = notesOf(r);
  const cats = CATEGORIES.filter(c => r.included.includes(c.id));
  const essentials = r.id === "jeanne" ? TOP_THREE : ns.slice(0,3).map(n => ({ catId:n.catId, title:n.text }));
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title={`${r.room} · ${unitOf(r.unit).name}`}
              right={canWrite ? <button className="iconbtn" aria-label="Ajouter une note" onClick={onAdd} style={{background:"var(--ink)", color:"#fff"}}><IconMic size={18}/></button> : <span className="iconbtn" role="img" aria-label="Lecture seule" style={{color:"var(--ink-3)"}}><IconLock size={18}/></span>}/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <div style={{background:r.tone, color:r.ink, borderRadius:"var(--r-xl)", padding:"22px 20px", marginTop:6}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}><Portrait r={r} size={64}/><Pill>{ns.length} notes</Pill></div>
          <h1 style={{fontSize:28, marginTop:16}}>{r.profile.name}</h1>
          <p style={{marginTop:6, fontSize:14, fontWeight:600, opacity:.85}}>{r.profile.age} ans · carnet tenu par l'équipe{r.sharedBy ? ` · ${r.sharedBy} (${r.profile.relation.replace(/\s*\(.*\)/, "")}) contribue` : ""}</p>
        </div>
        {canWrite && <button className="btn" style={{marginTop:14, width:"100%"}} onClick={onAdd}><IconMic size={18}/> {ns.length ? "Ajouter une note vocale" : "Première note vocale"}</button>}
        {ns.length === 0 && <div className="card" style={{marginTop:12, padding:16, background:"var(--c-histoire)", color:"var(--c-histoire-ink)"}}><p style={{font:"800 15px var(--sans)"}}>Carnet tout neuf.</p><p style={{marginTop:6, fontSize:13.5, fontWeight:600, lineHeight:1.45}}>Commence par ce qui compte pour l'accueillir : comment lui parler, ce qui l'apaise, ses habitudes du matin.</p></div>}
        <p className="kicker" style={{marginTop:24, marginBottom:10}}>À savoir tout de suite</p>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:8}}>
          {essentials.map((e,i) => { const c = CAT_BY_ID[e.catId]; return (
            <li key={i}><button onClick={() => onOpenCat(e.catId)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:12, alignItems:"center", padding:14}}>
              <span aria-hidden="true" style={{width:32, height:32, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", font:"800 13px var(--sans)", flexShrink:0}}>{i+1}</span>
              <span style={{flex:1, minWidth:0, font:"700 14.5px var(--sans)", lineHeight:1.4, letterSpacing:"-.01em"}}>{e.title}</span>
              <span aria-hidden="true" style={{width:10, height:10, borderRadius:"50%", background:c.bg, flexShrink:0}}/>
            </button></li>
          ); })}
        </ul>
        <p className="kicker" style={{marginTop:24, marginBottom:10}}>Rubriques partagées</p>
        <div style={{display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:10}}>
          {cats.map(c => { const n = ns.filter(x => x.catId === c.id).length; return (
            <button key={c.id} onClick={() => onOpenCat(c.id)} className="card-press" style={{border:"none", cursor:"pointer", textAlign:"left", background:c.bg, color:c.ink, borderRadius:"var(--r-lg)", padding:14, minHeight:120, display:"flex", flexDirection:"column", gap:10, minWidth:0}}>
              <Circle Icon={c.Icon} size={36} isize={17}/><span style={{flex:1}}/>
              <span style={{font:"800 14px var(--sans)", letterSpacing:"-.02em", lineHeight:1.15}}>{c.title}</span>
              <span style={{fontSize:12.5, fontWeight:700, opacity:.9}}>{n} note{n>1?"s":""}</span>
            </button>
          ); })}
        </div>
        <p className="meta" style={{marginTop:16, fontSize:12.5, textAlign:"center"}}>Rien de médical ici. Le dossier de soins reste dans votre logiciel métier.</p>
      </div>
    </div>
  );
}

/* Note vocale — un geste : parler, c'est envoyé */
function AddNote({resident, needsVisa, onClose, onSave}){
  const [text, setText] = useState("");
  const [cat, setCat] = useState(null);
  const [done, setDone] = useState(false);
  const [picking, setPicking] = useState(false);
  const [count, setCount] = useState(3);
  const timer = React.useRef(null);
  const SAMPLES = {
    jeanne:"Ce midi elle a tout mangé, surtout la purée. Elle a demandé deux fois si Claire venait mercredi.",
    roger:"Sortie dans le jardin à 6h45 comme chaque matin. A parlé de son ancien atelier pendant vingt minutes.",
    marthe:"Refus de la toilette à 8h, acceptée à 9h en commençant par les mains. Le chapelet était dans le gilet.",
    henri:"Agité à 14h30 en attendant Nadia. Match de foot en fond, il s'est calmé en dix minutes.",
    louise:"A plié des serviettes avec nous pendant une demi-heure. Très fière, a parlé de son atelier.",
  };
  const sample = SAMPLES[resident.id] || "A bien dormi. Petit-déjeuner complet, de bonne humeur ce matin.";
  useEffect(() => {
    const phone = document.querySelector(".phone"); phone && phone.setAttribute("data-listening","1");
    let i = 0; const id = setInterval(() => {
      i += 2 + Math.floor(Math.random()*3);
      const t = sample.slice(0, i); setText(t); setCat(classify(t)[0]?.cat || null);
      if(i >= sample.length){ clearInterval(id); phone && phone.removeAttribute("data-listening"); setDone(true); }
    }, 40);
    return () => { clearInterval(id); phone && phone.removeAttribute("data-listening"); };
  }, []);
  useEffect(() => {
    if(!done || picking) return;
    setCount(3);
    timer.current = setInterval(() => setCount(c => { if(c <= 1){ clearInterval(timer.current); onSave({text:text.trim(), catId:(cat || CAT_BY_ID.habitudes).id}); return 0; } return c - 1; }), 1000);
    return () => clearInterval(timer.current);
  }, [done, picking]);
  const c = cat || CAT_BY_ID.habitudes;
  return (
    <div className="screen fade-enter" style={{background:"var(--ink)", color:"#fff"}}>
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <button className="iconbtn" aria-label="Annuler" onClick={onClose} style={{background:"rgba(255,255,255,.12)", color:"#fff"}}><IconClose size={20}/></button>
        <span style={{display:"flex", alignItems:"center", gap:8, font:"800 15px var(--sans)"}}><Portrait r={resident} size={28}/>{first(resident.profile.name)}</span>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"8px 22px 28px", display:"flex", flexDirection:"column"}}>
        <div className="wave" role="status" aria-label={done ? "Terminé" : "Enregistrement en cours"} style={{margin:"10px auto 0", opacity: done ? .35 : 1, transition:"opacity .3s"}}>{Array.from({length:12}).map((_,i) => <span key={i} style={{background:"#fff"}}/>)}</div>
        <p aria-live="polite" style={{marginTop:22, font:"700 24px var(--sans)", lineHeight:1.35, letterSpacing:"-.02em", minHeight:130}}>{text}<span aria-hidden="true" style={{display: done ? "none" : "inline-block", width:3, height:26, background:"var(--accent-2)", marginLeft:4, verticalAlign:"-4px", animation:"blink 1s steps(2) infinite"}}/></p>
        <div style={{flex:1}}/>
        <button onClick={() => setPicking(v => !v)} aria-expanded={picking} className="card-press" style={{width:"100%", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:"16px 18px", background:c.bg, color:c.ink, textAlign:"left", display:"flex", gap:14, alignItems:"center", opacity: cat ? 1 : .5, transition:"background .3s"}}>
          <Circle Icon={c.Icon} size={44} isize={20}/>
          <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 17px var(--sans)", letterSpacing:"-.02em"}}>{c.title}</span><span style={{display:"block", marginTop:2, fontSize:13, fontWeight:600, opacity:.8}}>{picking ? "Choisis une autre rubrique" : "Appuie pour changer"}</span></span>
          {done && !picking && <span aria-label={`Envoi dans ${count} secondes`} style={{width:40, height:40, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", font:"800 16px var(--sans)"}}>{count}</span>}
        </button>
        {picking && <div className="slide-up" style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>{CATEGORIES.filter(x => x.id !== c.id).map(x => <button key={x.id} onClick={() => { setCat(x); setPicking(false); }} className="chip" style={{background:x.bg, color:x.ink, boxShadow:"none", minHeight:44}}><x.Icon size={15} sw={1.8}/> {x.title}</button>)}</div>}
        {done && <button className="btn" style={{marginTop:12, width:"100%", background:"#fff", color:"var(--ink)"}} onClick={() => { clearInterval(timer.current); onSave({text:text.trim(), catId:c.id}); }}><IconCheck size={20}/> {needsVisa ? "Envoyer au cadre" : "Publier"}</button>}
        <p style={{marginTop:12, textAlign:"center", fontSize:12.5, fontWeight:600, opacity:.55}}>{needsVisa ? "Publiée après validation par le cadre de santé." : "Visible tout de suite par l'équipe et la famille."}</p>
      </div>
    </div>
  );
}

function Today({units, notesOf, onOpenResident}){
  const [moment, setMoment] = useState(momentNow());
  const labels = {matin:"Matin", midi:"Midi", aprem:"Aprem", soir:"Soir"};
  const block = TIPS_BY_MOMENT.find(b => b.id === moment) || TIPS_BY_MOMENT[0];
  const pool = RESIDENTS.filter(r => units.includes(r.unit));
  const byResident = pool.map(r => {
    const items = r.id === "jeanne" ? block.items
      : notesOf(r).filter(n => ({matin:["habitudes","sante"], midi:["sante","gouts","habitudes"], aprem:["proches","gouts","habitudes"], soir:["apaise","gouts","proches"]}[moment] || []).includes(n.catId)).slice(0,2);
    return { r, items };
  }).filter(x => x.items.length);
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <PageTitle title={MOMENT_LABEL[moment]} sub={`${block.hint} · ${byResident.length} résidents concernés`}/>
      <div className="scroll" style={{padding:"10px 20px 24px"}}>
        <Seg label="Moment de la journée" value={moment} onChange={setMoment} options={TIPS_BY_MOMENT.map(b => ({id:b.id, label:labels[b.id]}))}/>
        <ul style={{listStyle:"none", padding:0, margin:"18px 0 0", display:"grid", gap:12}}>
          {byResident.map(({r, items}) => (
            <li key={r.id}><div style={{background:r.tone, color:r.ink, borderRadius:"var(--r-lg)", padding:16}}>
              <button onClick={() => onOpenResident(r.id)} style={{display:"flex", alignItems:"center", gap:12, width:"100%", border:"none", background:"none", padding:0, cursor:"pointer", color:"inherit", textAlign:"left"}}>
                <Portrait r={r} size={40}/>
                <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 16px var(--sans)", letterSpacing:"-.02em"}}>{r.profile.name}</span><span style={{fontSize:12.5, fontWeight:700, opacity:.8}}>{r.room} · {unitOf(r.unit).name}</span></span>
                <IconChevron size={16}/>
              </button>
              <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:6}}>
                {items.map((it,i) => { const c = CAT_BY_ID[it.catId]; return (
                  <li key={i} style={{background:"rgba(255,255,255,.6)", borderRadius:14, padding:"10px 12px", display:"flex", gap:10, alignItems:"flex-start"}}>
                    <span aria-hidden="true" style={{width:24, height:24, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}><c.Icon size={12} sw={2}/></span>
                    <span style={{font:"600 13.5px var(--sans)", lineHeight:1.45, color:"var(--ink)"}}>{it.text}</span>
                  </li>
                ); })}
              </ul>
            </div></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Journal({me, added, staff, onOpenResident}){
  const [filter, setFilter] = useState("all");
  const pool = RESIDENTS.filter(r => r.unit === me.unit);
  const shown = added.filter(a => pool.some(r => r.id === a.residentId) && a.status !== "rejected" && (filter === "all" || a.residentId === filter));
  const STATUS = { pending:["En attente de visa","var(--c-histoire)","var(--c-histoire-ink)"], published:["Publiée · reçue par la famille","var(--c-sante)","var(--c-sante-ink)"], queued:["Hors ligne · en attente","var(--bg-2)","var(--ink-2)"] };
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <PageTitle title="Journal" sub={`Notes de l'équipe · ${unitOf(me.unit).name}`}/>
      <div className="scroll" style={{padding:"10px 20px 24px"}}>
        <div className="h-scroll" style={{padding:0}} role="group" aria-label="Filtrer par résident">
          <button className="chip" aria-pressed={filter==="all"} onClick={() => setFilter("all")}>Tous</button>
          {pool.map(r => <button key={r.id} className="chip" aria-pressed={filter===r.id} onClick={() => setFilter(filter===r.id ? "all" : r.id)} style={{paddingLeft:8}}><Portrait r={r} size={26}/> {first(r.profile.name)}</button>)}
        </div>
        {shown.length === 0 && <div className="card" style={{marginTop:16, padding:"24px 20px", textAlign:"center"}}><p className="meta">Aucune note pour l'instant. Ouvre un résident pour en ajouter une.</p></div>}
        <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gap:10}}>
          {shown.map(a => { const r = RESIDENTS.find(x => x.id === a.residentId), s = staff.find(x => x.id === a.by), c = CAT_BY_ID[a.catId], st = STATUS[a.status]; return (
            <li key={a.id} className="card" style={{padding:16, display:"flex", gap:12, alignItems:"flex-start"}}>
              <button onClick={() => onOpenResident(r.id)} aria-label={r.profile.name} style={{border:"none", background:"none", padding:0, cursor:"pointer"}}><Portrait r={r} size={40}/></button>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:"flex", justifyContent:"space-between", gap:8, alignItems:"baseline"}}><span style={{font:"800 14.5px var(--sans)"}}>{first(r.profile.name)}</span><span className="meta" style={{fontSize:12, whiteSpace:"nowrap"}}>{softDate(a.ts)}</span></div>
                <p style={{marginTop:6, font:"600 14.5px var(--sans)", lineHeight:1.5}}>{a.text}</p>
                <div style={{display:"flex", gap:6, marginTop:10, flexWrap:"wrap"}}>
                  <Pill tone={c.bg} ink={c.ink}>{c.title}</Pill>
                  <Pill tone="var(--bg)" ink="var(--ink)">{s ? `${first(s.name)} · ${s.role}` : a.author ? `${first(a.author)}${a.authorRole ? " · " + a.authorRole : ""}` : "Équipe"}</Pill>
                  <Pill tone={st[1]} ink={st[2]}>{st[0]}</Pill>
                </div>
              </div>
            </li>
          ); })}
        </ul>
      </div>
    </div>
  );
}

function Settings({role, me, onSwitchRole, onLogout}){
  const [showPicker, setShowPicker] = useState(false);
  const who = role === "cadre" ? ORG.cadreName : me.name;
  const rows = role === "cadre"
    ? [["Établissement",ORG.name],["Unités",UNITS.map(u => u.name).join(" · ")],["Carnets",`${RESIDENTS.length} résidents · tenus par l'équipe`],["Équipe",ORG.demo ? "5 soignants connectés" : `${ORG.staffCount} soignant${ORG.staffCount > 1 ? "s" : ""}`],["Validation","Visa du cadre pour les profils « À valider »"],["Données",ORG.demo ? "Hébergées en France · aucune donnée médicale" : "Hébergées dans l'UE · aucune donnée médicale"]]
    : [["Établissement",ORG.name],["Mon unité",unitOf(me.unit).name],["Mes droits",PERMS.find(p => p.id === me.perm).label],["Cadre référent",ORG.cadreName]];
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <PageTitle title="Réglages"/>
      <div className="scroll" style={{padding:"10px 20px 24px"}}>
        <div style={{background:"var(--c-sante)", color:"var(--c-sante-ink)", borderRadius:"var(--r-xl)", padding:20, display:"flex", gap:14, alignItems:"center"}}>
          <Avatar name={role === "cadre" ? "Marc Aubry" : me.name} size={56} tone={role === "cadre" ? "sage" : me.tone}/>
          <div style={{flex:1, minWidth:0}}><p style={{font:"800 18px var(--sans)", letterSpacing:"-.02em"}}>{who}</p><p style={{marginTop:4, fontSize:13, fontWeight:600, opacity:.85}}>{role === "cadre" ? ORG.cadreRole : me.role}</p></div>
          <button onClick={() => setShowPicker(v => !v)} style={{border:"none", cursor:"pointer", background:"rgba(255,255,255,.65)", color:"inherit", borderRadius:999, padding:"0 14px", minHeight:38, font:"700 13px var(--sans)"}}>Avatar</button>
        </div>
        {showPicker && <div className="card slide-up" style={{marginTop:10, padding:14}}><p className="kicker" style={{marginBottom:10}}>Choisir mon avatar</p><window.AvatarPicker name={who} bg="var(--c-sante)" onPick={() => setShowPicker(false)}/></div>}
        <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gap:8}}>
          {rows.map(([k,v]) => <li key={k} className="card" style={{padding:"14px 16px", display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}><span style={{font:"800 14px var(--sans)", whiteSpace:"nowrap"}}>{k}</span><span className="meta" style={{fontSize:13, textAlign:"right"}}>{v}</span></li>)}
        </ul>
        {onSwitchRole && <button className="card card-press" onClick={onSwitchRole} style={{marginTop:16, width:"100%", textAlign:"left", cursor:"pointer", padding:16, display:"flex", gap:12, alignItems:"center"}}>
          <Circle Icon={IconSwap} size={40} bg="var(--bg)" color="var(--ink)"/>
          <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14.5px var(--sans)"}}>Voir en tant que {role === "cadre" ? "soignante (Sandra)" : "cadre (Marc)"}</span><span className="meta" style={{fontSize:12.5}}>Démo · bascule de rôle</span></span>
          <IconChevron size={18}/>
        </button>}
        <button className="card card-press" onClick={onLogout} style={{marginTop:12, width:"100%", textAlign:"left", cursor:"pointer", padding:"14px 16px", display:"flex", gap:12, alignItems:"center", color:"#B3261E"}}>
          <span aria-hidden="true" style={{width:36, height:36, borderRadius:"50%", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg></span>
          <span style={{font:"800 14.5px var(--sans)"}}>Se déconnecter</span>
        </button>

      </div>
    </div>
  );
}

/* ══ Racine ══════════════════════════════════════════════ */
const CADRE_TABS = [
  { id:"home",     label:"Unités",    Icon: (p) => <CatPeople {...p}/> },
  { id:"team",     label:"Équipe",    Icon: (p) => <window.Icons.IconEye {...p}/> },
  { id:"validate", label:"À valider", Icon: (p) => <IconCheck {...p}/> },
  { id:"settings", label:"Réglages",  Icon: IconSettings }
];
const STAFF_TABS = [
  { id:"home",     label:"Résidents",   Icon: (p) => <CatPeople {...p}/> },
  { id:"today",    label:"Aujourd'hui", Icon: IconCalendar },
  { id:"capture",  label:"Note vocale", Icon: IconMic, kind:"mic" },
  { id:"journal",  label:"Journal",     Icon: IconEdit },
  { id:"settings", label:"Réglages",    Icon: IconSettings }
];

/* Choisir le résident avant la note vocale */
function PickResident({me, notesOf, onPick, onClose}){
  const [q, setQ] = useState("");
  const pool = RESIDENTS.filter(r => r.unit === me.unit && r.profile.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Fermer" onClick={onClose}><IconClose size={20}/></button>} title="Note vocale"/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <h1 style={{fontSize:28, marginTop:8}}>Pour qui&nbsp;?</h1>
        <p className="meta" style={{marginTop:6}}>Choisis le résident, puis parle. Je range dans la bonne rubrique.</p>
        <div style={{marginTop:14}}><SearchBar value={q} onChange={setQ} placeholder="Rechercher un résident"/></div>
        <ul style={{listStyle:"none", padding:0, margin:"14px 0 0", display:"grid", gap:8}}>
          {pool.map(r => (
            <li key={r.id}><button onClick={() => onPick(r.id)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:12, display:"flex", gap:12, alignItems:"center"}}>
              <Portrait r={r} size={44}/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15px var(--sans)", letterSpacing:"-.01em"}}>{r.profile.name}</span><span className="meta" style={{fontSize:12.5}}>{r.room} · {notesOf(r).length} notes</span></span>
              <Circle Icon={IconMic} size={36} isize={16}/>
            </button></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const TONE_LIST = [["var(--c-parler)","var(--c-parler-ink)"],["var(--c-habitudes)","var(--c-habitudes-ink)"],["var(--c-gouts)","var(--c-gouts-ink)"],["var(--c-apaise)","var(--c-apaise-ink)"],["var(--c-sante)","var(--c-sante-ink)"],["var(--c-histoire)","var(--c-histoire-ink)"],["var(--c-proches)","var(--c-proches-ink)"]];
const STAFF_TONES = ["warm", "cool", "sage"];

/* Vrais comptes : charge l'établissement, puis affiche les mêmes écrans avec les vraies données. */
function EtabApp(props){
  if(!props.real) return <EtabAppInner {...props}/>;
  return <EtabLive {...props}/>;
}

function EtabLive({onToast, onLogout}){
  const [snap, setSnap] = useState(null);
  const [failed, setFailed] = useState(false);
  const refresh = () => window.Backend.orgSnapshot().then(x => { setSnap(x); setFailed(false); }).catch(() => setFailed(true));
  useEffect(() => { refresh(); }, []);
  if(failed) return (
    <div className="screen fade-enter"><StatusBar/>
      <div className="scroll" style={{padding:"40px 26px", textAlign:"center"}}>
        <h1 style={{fontSize:26}}>Impossible de charger l'établissement.</h1>
        <p className="meta" style={{marginTop:10}}>Vérifie ta connexion internet.</p>
        <button className="btn" style={{marginTop:22}} onClick={refresh}>Réessayer</button>
      </div>
    </div>
  );
  if(!snap) return <window.BUI.BootScreen label="Ouverture de l'établissement…"/>;

  // Les écrans lisent UNITS, RESIDENTS et ORG : on y place les vraies données.
  const cadre = snap.members.find(m => m.role === "cadre") || snap.me;
  Object.assign(ORG, { demo:false, name:snap.org.name, cadreName:cadre.display_name || "Cadre", cadreRole:cadre.job_title || "Cadre de santé",
                       staffCount:snap.members.filter(m => m.role === "soignant").length });
  UNITS.splice(0, UNITS.length, ...snap.units.map((u, i) => ({ id:u.id, name:u.name, sub:u.subtitle || "", tone:TONE_LIST[i % 7][0], ink:TONE_LIST[i % 7][1] })));
  RESIDENTS.splice(0, RESIDENTS.length, ...snap.residents.map((k, i) => {
    const fam = (k.family || [])[0];
    return { id:k.id, profile:{ name:k.person_name, age:k.person_age ?? "—", relation:fam ? fam.relation : "" },
             sharedBy:fam ? first(fam.display_name) : "", tone:TONE_LIST[i % 7][0], ink:TONE_LIST[i % 7][1],
             room:k.room || "—", unit:k.unit_id, included:CATEGORIES.map(c => c.id), notes:[] };
  }));
  const staff = snap.members.filter(m => m.role === "soignant").map((m, i) => ({ id:m.user_id, name:m.display_name, role:m.job_title, unit:m.unit_id, perm:m.perm, tone:STAFF_TONES[i % 3] }));
  const me = { id:snap.me.user_id, name:snap.me.display_name, role:snap.me.job_title, unit:snap.me.unit_id, perm:snap.me.perm, tone:"warm" };
  const added = snap.notes.map(n => ({ id:n.id, residentId:n.carnetId, text:n.text, catId:n.catId, ts:n.ts, by:n.authorId, status:n.status, author:n.author, authorRole:n.authorRole }));
  const run = async (fn, ok) => { try { const r = await fn(); await refresh(); if(ok) onToast(ok); return r; } catch(e){ onToast(e.message); throw e; } };

  const live = {
    staff, me, added,
    notesOf: (r) => snap.notes.filter(n => n.carnetId === r.id && n.status === "published" && !n.archived).map(n => ({ id:n.id, text:n.text, catId:n.catId, ts:n.ts, author:n.author })),
    updateMember: (s, next) => run(() => window.Backend.updateMember(s.id, { unitId:next.unit, perm:next.perm }), "Droits mis à jour."),
    decide: (id, status) => run(() => window.Backend.validateNote(id, status === "published"), status === "published" ? "Note publiée. La famille la reçoit." : "Note refusée."),
    createCode: (f) => window.Backend.createStaffCode({ name:f.name.trim(), jobTitle:f.role, unitId:f.unit, perm:f.perm }).then(async r => { await refresh(); return r; }),
    addNote: (r, n) => run(() => window.Backend.addNote(r.id, n),
      me.perm === "validate" ? `Envoyée à ${first(ORG.cadreName)} pour validation.` : `Note publiée${r.sharedBy ? `. ${r.sharedBy} la reçoit` : ""}.`),
    createResident: async (f) => {
      const k = await window.Backend.createResident({ name:f.name.trim(), age:f.age, room:f.room.trim(), unitId:f.unit });
      let invite = null;
      if(f.invite && f.family.trim()){
        const [name, ...rest] = f.family.split(",");
        invite = await window.Backend.createInvite(k.id, { name:name.trim(), relation:rest.join(",").trim() });
      }
      await refresh();
      return { carnet:k, invite };
    },
    invites: snap.invites,
  };
  return <EtabAppInner key={snap.me.role} initialRole={snap.me.role === "cadre" ? "cadre" : "staff"} onToast={onToast} onLogout={onLogout} live={live}/>;
}

function EtabAppInner({jeanneNotes, onToast, onLogout, initialRole="cadre", live}){
  const [role, setRole] = useState(initialRole);
  const [inviting, setInviting] = useState(false);
  const [addingResident, setAddingResident] = useState(null); // false | unitId | true
  const [, tick] = useState(0);
  const [addingStaff, setAddingStaff] = useState(false);
  const [tab, setTab] = useState("home");
  const [staffDemo, setStaff] = useState(SEED_STAFF);
  const [addedDemo, setAdded] = useState(SEED_ADDED);
  const staff = live ? live.staff : staffDemo;
  const added = live ? live.added : addedDemo;
  const [unit, setUnit] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [resident, setResident] = useState(null);
  const [cat, setCat] = useState(null);
  const [adding, setAdding] = useState(false);
  const [picking, setPicking] = useState(false);
  const me = live ? live.me : staff.find(s => s.id === "sandra");
  const RelaisCategory = window.Relais.RelaisCategory;

  const notesOf = live ? live.notesOf : (r) => {
    const base = r.id === "jeanne" ? jeanneNotes : (r.notes || []);
    const pub = added.filter(a => a.residentId === r.id && a.status === "published").map(a => ({ id:a.id, text:a.text, catId:a.catId, ts:a.ts }));
    return [...pub, ...base].sort((a,b) => b.ts - a.ts);
  };
  const switchRole = live ? null : () => { const next = role === "cadre" ? "staff" : "cadre"; setRole(next); setTab("home"); setUnit(null); setStaffId(null); setResident(null); setCat(null); onToast(next === "cadre" ? "Vue cadre de santé · Marc" : `Vue soignante · ${first(me.name)}`); };
  const back = () => { if(cat) return setCat(null); if(adding) return setAdding(false); if(resident) return setResident(null); if(staffId) return setStaffId(null); setUnit(null); };
  const r = resident && RESIDENTS.find(x => x.id === resident);
  const canWrite = role === "staff" && me.perm !== "read";

  let screen;
  if(r && cat) screen = <RelaisCategory catId={cat} notes={notesOf(r)} onBack={() => setCat(null)}/>;
  else if(r && adding && live) screen = <window.BUI.NoteComposer subject={`Pour ${first(r.profile.name)}`} needsVisa={me.perm === "validate"} hints={[first(r.profile.name)]}
        onClose={() => setAdding(false)} onSave={async (n) => { await live.addNote(r, n); setAdding(false); }}/>;
  else if(r && adding) screen = <AddNote resident={r} needsVisa={me.perm === "validate"} onClose={() => setAdding(false)}
        onSave={({text, catId}) => {
          const status = me.perm === "validate" ? "pending" : "published";
          const note = { id:"a"+Date.now(), residentId:r.id, text, catId, ts:Date.now(), by:me.id, status };
          const commit = () => { setAdded(p => [note, ...p.filter(x => x.id !== note.id)]); if(status === "published" && r.id === "jeanne") window.FamilyJournal.publish({ text, catId, ts:Date.now(), who:first(me.name), role:me.role, unit:me.unit }); };
          if(window.Net.isOffline()){ setAdded(p => [{...note, status:"queued"}, ...p]); window.Net.enqueue(commit); onToast("Hors ligne. La note partira dès le retour du réseau."); }
          else { commit(); onToast(status === "pending" ? "Envoyée à Marc pour validation." : `Note publiée. ${r.sharedBy || "La famille"} la reçoit.`); }
          setAdding(false);
        }}/>;
  else if(r) screen = <Resident residentId={r.id} notesOf={notesOf} canWrite={canWrite} onBack={() => setResident(null)} onOpenCat={setCat} onAdd={() => setAdding(true)}/>;
  else if(role === "staff" && picking) screen = <PickResident me={me} notesOf={notesOf} onClose={() => setPicking(false)} onPick={(id) => { setPicking(false); setResident(id); setAdding(true); }}/>;
  else if(role === "cadre" && (inviting || addingResident)) screen = <AddResident unit={typeof addingResident === "string" ? addingResident : undefined} onBack={() => { setInviting(false); setAddingResident(null); }}
        onDone={live ? async (f) => {
          const res = await live.createResident(f);
          const open = () => { setInviting(false); setAddingResident(null); setUnit(null); setResident(res.carnet.id); };
          if(res.invite) return { invite:res.invite, open };
          open(); onToast("Carnet ouvert. À l'équipe de le remplir.");
        } : (f) => {
          const tones = [["var(--c-parler)","var(--c-parler-ink)"],["var(--c-habitudes)","var(--c-habitudes-ink)"],["var(--c-gouts)","var(--c-gouts-ink)"],["var(--c-apaise)","var(--c-apaise-ink)"],["var(--c-sante)","var(--c-sante-ink)"],["var(--c-histoire)","var(--c-histoire-ink)"],["var(--c-proches)","var(--c-proches-ink)"]];
          const [tone, ink] = tones[RESIDENTS.length % tones.length];
          const nr = { id:"r"+Date.now(), profile:{ name:f.name.trim(), age:f.age || "—", relation:f.family ? f.family.split(",").slice(1).join(",").trim() || "proche" : "" }, sharedBy: f.invite && f.family ? f.family.split(",")[0].trim() : "", tone, ink, room:f.room.trim(), unit:f.unit, included:CATEGORIES.map(c => c.id), notes:[] };
          RESIDENTS.push(nr); tick(t => t+1);
          setInviting(false); setAddingResident(null); setUnit(null); setResident(nr.id);
          onToast(f.invite && f.family ? `Carnet ouvert. Invitation envoyée à ${nr.sharedBy}.` : "Carnet ouvert. À l'équipe de le remplir.");
        }}/>;
  else if(role === "cadre" && addingStaff) screen = <AddStaff onBack={() => setAddingStaff(false)} onCreateCode={live ? live.createCode : null}
        onDone={(s) => { setAddingStaff(false); if(live){ onToast(`${first(s.name)} apparaîtra dans l'équipe dès qu'il ou elle aura saisi son code.`); return; } setStaff(p => [...p, s]); onToast(`${s.name.split(" ")[0]} ajouté·e à l'Unité ${s.unit}.`); }}/>;
  else if(role === "cadre" && staffId) screen = <CadreStaff staffId={staffId} staff={staff} setStaff={setStaff} onUpdate={live ? live.updateMember : null} onBack={() => setStaffId(null)} onToast={live ? () => {} : onToast}/>;
  else if(role === "cadre" && unit) screen = <CadreUnit unitId={unit} staff={staff} notesOf={notesOf} onBack={() => setUnit(null)} onOpenResident={setResident} onOpenTeam={setStaffId} onAddResident={(u) => setAddingResident(u)}/>;
  else if(role === "cadre"){
    screen = tab === "home" ? <CadreUnits staff={staff} added={added} notesOf={notesOf} onOpenUnit={setUnit} onTab={setTab} onSwitchRole={switchRole} onAddResident={() => setAddingResident(true)}/>
      : tab === "team" ? <CadreTeam staff={staff} setStaff={setStaff} onOpen={setStaffId} onAdd={() => setAddingStaff(true)} onInvite={() => setInviting(true)} invites={live ? live.invites : null}/>
      : tab === "validate" ? <CadreValidate added={added} setAdded={setAdded} staff={staff} onToast={onToast} onDecide={live ? live.decide : null}/>
      : <Settings role={role} me={me} onSwitchRole={switchRole} onLogout={onLogout}/>;
  } else {
    screen = tab === "home" ? <StaffHome me={me} notesOf={notesOf} added={added} onOpenResident={setResident} onTab={setTab} onSwitchRole={switchRole} onCapture={canWrite ? () => setPicking(true) : null}/>
      : tab === "today" ? <Today units={[me.unit]} notesOf={notesOf} onOpenResident={setResident}/>
      : tab === "journal" ? <Journal me={me} added={added} staff={staff} onOpenResident={setResident}/>
      : <Settings role={role} me={me} onSwitchRole={switchRole} onLogout={onLogout}/>;
  }
  const showTabs = !r && !staffId && !unit && !picking && !inviting && !addingStaff && !addingResident;
  const staffTabs = canWrite ? STAFF_TABS : STAFF_TABS.filter(t => t.id !== "capture");
  return (<>
    {screen}
    {showTabs && <TabBar tabs={role === "cadre" ? CADRE_TABS : staffTabs} current={tab} onChange={(t) => t === "capture" ? setPicking(true) : setTab(t)}/>}
  </>);
}

window.Etab = { EtabApp, RESIDENTS };
})();
