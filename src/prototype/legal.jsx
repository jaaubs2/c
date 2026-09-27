// Documents légaux : politique de confidentialité, conditions d'utilisation, mentions légales.
// Ouverts par un lien public (…/#legal=confidentialite), sans compte : c'est l'adresse à donner
// à l'App Store et à Google Play. Les passages [[entre doubles crochets]] sont à compléter
// par l'éditeur (voir docs/MISE-EN-LIGNE.md).
(() => {
const { useState, useEffect } = React;
const { StatusBar } = window.UI;
const { IconBack } = window.Icons;

const VERSION = "2026-09"; // même version que les consentements enregistrés en base

const DOCS = {
  confidentialite: {
    title: "Politique de confidentialité",
    intro: "Le carnet vivant garde et transmet ce qui compte pour une personne accompagnée : ses habitudes, ce qui l'apaise, sa façon d'aimer qu'on lui parle. Ces informations sont précieuses et personnelles. Voici, simplement, ce que nous en faisons.",
    sections: [
      { h: "Qui est responsable", p: [
        "Le responsable du traitement est [[nom de la structure, forme juridique, adresse, numéro SIRET]].",
        "Pour toute question sur vos données : [[adresse email de contact dédiée aux données personnelles]].",
      ]},
      { h: "Un outil non médical", p: [
        "Le carnet n'est pas un dossier médical. Il ne doit contenir ni diagnostic, ni traitement, ni résultat d'examen. La rubrique « Santé et vigilance » sert aux repères du quotidien (par exemple : « appareil auditif à gauche »).",
        "Certaines notes peuvent toutefois laisser deviner des informations sensibles. C'est pourquoi nous vous demandons un consentement explicite à la création du compte, et l'accord de la personne accompagnée (ou de son représentant) lorsqu'il peut être recueilli.",
      ]},
      { h: "Les données que nous traitons", list: [
        "Votre compte : prénom, adresse email, mot de passe (stocké sous forme chiffrée irréversible, nous ne le connaissons pas), rôle choisi.",
        "Le carnet : prénom, âge et pronom de la personne accompagnée, les notes et leur rubrique, qui les a écrites et quand, si elles ont été dictées.",
        "Les partages : destinataire, rubriques visibles, date d'expiration, et la date et l'heure de chaque ouverture d'un lien. Nous n'enregistrons pas l'adresse IP de la personne qui ouvre le lien.",
        "Les établissements : nom, unités, membres de l'équipe, leur fonction et leurs droits.",
        "Vos consentements : lesquels, leur date et la version du texte accepté.",
        "Votre accès : le nom de la mutuelle dont vous avez saisi le code, ou la date de fin de votre période de découverte.",
        "L'aide à la rédaction : le nombre d'utilisations de l'IA par jour (pour limiter les abus), pas le contenu.",
      ]},
      { h: "Pourquoi, et sur quelle base", list: [
        "Faire fonctionner le carnet, les partages et les comptes : exécution du service que vous avez demandé.",
        "Conserver des notes pouvant révéler des informations sensibles : votre consentement explicite, que vous pouvez retirer à tout moment.",
        "Sécuriser le service (journal d'ouverture des liens, limites d'utilisation) : notre intérêt légitime à protéger les personnes accompagnées.",
      ]},
      { h: "Qui y a accès", p: [
        "Seules les personnes que vous invitez voient le carnet, et seulement ce que vous choisissez de leur montrer. Ces règles sont vérifiées par le serveur, pas seulement masquées à l'écran.",
        "Nous ne vendons aucune donnée, ne faisons aucune publicité et n'utilisons pas vos notes pour entraîner une IA.",
        "Nos sous-traitants, tous liés par un accord de traitement des données :",
      ], list: [
        "Supabase : hébergement de la base de données et des comptes, dans l'Union européenne ([[région choisie, par exemple Paris]]).",
        "Votre mutuelle n'est pas un destinataire : elle finance l'accès, mais ne reçoit ni vos carnets, ni vos notes, ni votre nom.",
        "Mistral AI (France) : aide à la rédaction, uniquement quand vous utilisez la dictée, le rangement automatique ou la rédaction de fiche. Seuls le texte utile et le prénom sont transmis, jamais le nom de famille. Serveurs européens.",
        "[[Service d'envoi d'emails, par exemple Brevo (France)]] : envoi des codes de connexion.",
        "[[Hébergeur de la version web]] : mise à disposition de l'application, sans accès aux carnets.",
      ]},
      { h: "Combien de temps", list: [
        "Tant que votre compte existe. Vous pouvez le supprimer à tout moment dans Réglages → Mon compte : vos données sont alors effacées immédiatement, et les liens que vous avez partagés cessent de fonctionner.",
        "Les liens de partage expirent à la date choisie et peuvent être désactivés avant.",
        "Comptes inactifs : [[durée, par exemple suppression après 2 ans sans connexion, avec un email de rappel un mois avant]].",
      ]},
      { h: "Vos droits", p: [
        "Vous pouvez accéder à vos données, les corriger, les effacer, en recevoir une copie (Réglages → Confidentialité & données → Exporter), vous opposer à un traitement, en demander la limitation, retirer votre consentement et définir ce que deviennent vos données après votre décès.",
        "Écrivez-nous à [[adresse email de contact]]. Nous répondons sous un mois. Si vous n'êtes pas satisfait, vous pouvez saisir la CNIL (cnil.fr).",
      ]},
      { h: "Sécurité", p: [
        "Les échanges sont chiffrés (HTTPS) et les données sont chiffrées sur les serveurs. Les liens de partage sont uniques et impossibles à deviner, et le serveur n'en garde qu'une empreinte. Chaque ouverture est inscrite dans un journal que vous pouvez consulter.",
      ]},
      { h: "Stockage sur votre appareil", p: [
        "L'application garde sur votre appareil votre session de connexion et vos préférences (taille du texte, contraste…). Aucun cookie publicitaire, aucun outil de mesure d'audience.",
      ]},
    ],
  },

  conditions: {
    title: "Conditions d'utilisation",
    intro: "Ces conditions posent le cadre, avec un principe : prendre soin de la personne accompagnée, de sa dignité et de sa vie privée.",
    sections: [
      { h: "Le service", p: [
        "Le carnet vivant permet de rassembler et de transmettre le savoir humain sur une personne accompagnée, entre proches aidants, relais et équipes d'établissement. Il est édité par [[nom de la structure]].",
      ]},
      { h: "Ce n'est pas un outil médical", p: [
        "Le carnet ne remplace ni un avis médical, ni un dossier de soins, ni les transmissions réglementaires d'un établissement. N'y inscrivez pas de diagnostic ni de traitement. En cas d'urgence, appelez le 15 ou le 112.",
      ]},
      { h: "Respecter la personne accompagnée", list: [
        "Écrivez avec respect, comme si la personne lisait par-dessus votre épaule.",
        "Recueillez son accord quand c'est possible, ou celui de son représentant légal.",
        "Ne partagez que ce qui est utile à la personne qui reçoit la fiche.",
      ]},
      { h: "Votre compte", p: [
        "Vous êtes responsable de ce que vous écrivez et des personnes que vous invitez. Gardez votre mot de passe pour vous. Nous pouvons suspendre un compte en cas d'usage contraire à ces conditions, après vous avoir prévenu sauf urgence.",
      ]},
      { h: "L'aide à la rédaction (IA)", p: [
        "L'IA propose, vous décidez : une rubrique, une fiche ou une question peuvent être imparfaites. Relisez toujours avant d'enregistrer ou de partager. L'IA ne pose aucun diagnostic.",
      ]},
      { h: "Accès et prix", list: [
        "Particuliers : l'accès est pris en charge par votre mutuelle, si elle est partenaire. Elle vous transmet un code à saisir dans l'app ; vous n'avez rien à payer.",
        "Sans code : une période de découverte de 14 jours, gratuite et sans carte bancaire. [[Ce qui se passe à la fin de la découverte, sans code de mutuelle.]] Dans tous les cas, vos notes restent à vous : vous pouvez toujours les consulter, les exporter ou les supprimer.",
        "Proches invités et relais qui reçoivent une fiche : toujours gratuit.",
        "Établissements : abonnement selon le contrat conclu avec l'établissement. [[Conditions du contrat établissement.]]",
      ]},
      { h: "Arrêter", p: [
        "Vous pouvez supprimer votre compte à tout moment, depuis les réglages. Si nous devions arrêter le service, nous vous préviendrions [[délai, par exemple trois mois]] à l'avance pour que vous puissiez exporter vos carnets.",
      ]},
      { h: "Droit applicable", p: [
        "Ces conditions sont soumises au droit français. En cas de désaccord, nous chercherons d'abord une solution amiable ; vous pouvez aussi recourir gratuitement à un médiateur de la consommation : [[nom et coordonnées du médiateur]].",
      ]},
    ],
  },

  mentions: {
    title: "Mentions légales",
    sections: [
      { h: "Éditeur", p: [
        "[[Nom de la structure, forme juridique, capital, adresse du siège, numéro SIRET / RCS]].",
        "Directrice ou directeur de la publication : [[nom]].",
        "Contact : [[adresse email]].",
      ]},
      { h: "Hébergement", list: [
        "Application web : [[nom, adresse et téléphone de l'hébergeur]].",
        "Données : Supabase, sur des serveurs situés dans l'Union européenne ([[région]]).",
      ]},
      { h: "Accessibilité", p: [
        "Le carnet vivant vise la conformité au niveau AA des règles WCAG 2.1 : texte agrandissable, contraste renforcé, navigation au clavier, compatibilité avec les lecteurs d'écran, dictée et lecture à voix haute. Un défaut vous gêne ? Écrivez-nous à [[adresse email]], nous le corrigerons.",
      ]},
      { h: "Crédits", p: [
        "Polices Manrope et Atkinson Hyperlegible (licence SIL Open Font License). Application construite avec React, Vite, Capacitor et Supabase (licences libres).",
      ]},
    ],
  },
};

const ORDER = ["confidentialite", "conditions", "mentions"];

// Texte avec passages [[à compléter]] mis en évidence.
function Rich({text}){
  const parts = text.split(/\[\[(.+?)\]\]/);
  return parts.map((t, i) => i % 2
    ? <mark key={i} style={{background:"var(--c-histoire)", color:"var(--c-histoire-ink)", borderRadius:6, padding:"0 4px", fontWeight:700}}>À compléter : {t}</mark>
    : <React.Fragment key={i}>{t}</React.Fragment>);
}

function LegalPage({doc, onBack, onOpen}){
  const d = DOCS[doc] || DOCS.confidentialite;
  return (
    <div className="screen fade-enter" role="dialog" aria-modal="true" aria-labelledby="legal-title"
         style={{position:"absolute", inset:0, zIndex:60}}>
      <StatusBar/>
      <div className="topbar" style={{background:"var(--bg)", position:"relative", zIndex:1}}>
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"4px 22px 40px"}}>
        <h1 id="legal-title" style={{fontSize:28}}>{d.title}</h1>
        <p className="meta" style={{marginTop:8}}>Version {VERSION}</p>
        {d.intro && <p style={{marginTop:14, fontSize:15.5, lineHeight:1.6}}>{d.intro}</p>}
        {d.sections.map(s => (
          <section key={s.h} style={{marginTop:24}}>
            <h2 style={{fontSize:19}}>{s.h}</h2>
            {(s.p || []).map((t, i) => <p key={i} style={{marginTop:10, fontSize:15, lineHeight:1.6, color:"var(--ink-2)"}}><Rich text={t}/></p>)}
            {s.list && <ul style={{margin:"10px 0 0", paddingLeft:20, display:"grid", gap:8}}>
              {s.list.map((t, i) => <li key={i} style={{fontSize:15, lineHeight:1.55, color:"var(--ink-2)"}}><Rich text={t}/></li>)}
            </ul>}
          </section>
        ))}
        <nav aria-label="Autres documents" style={{marginTop:32, display:"grid", gap:8}}>
          {ORDER.filter(k => k !== doc).map(k => (
            <button key={k} className="btn soft" style={{width:"100%"}} onClick={() => onOpen(k)}>{DOCS[k].title}</button>
          ))}
        </nav>
      </div>
    </div>
  );
}

// Lien public : #legal=confidentialite | conditions | mentions
function current(){
  const v = new URLSearchParams(window.location.hash.slice(1)).get("legal");
  return v && DOCS[v] ? v : null;
}
function open(doc){ window.location.hash = "legal=" + doc; }
function close(){
  history.replaceState(null, "", window.location.pathname + window.location.search);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// Affiché par-dessus l'écran en cours quand l'adresse contient #legal=…
function LegalLayer(){
  const [doc, setDoc] = useState(current);
  useEffect(() => {
    const on = () => setDoc(current());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  if(!doc) return null;
  return <LegalPage key={doc} doc={doc} onBack={close} onOpen={open}/>;
}

// Petit lien à placer n'importe où (inscription, réglages…).
function LegalLink({doc, children, style}){
  return (
    <button type="button" onClick={() => open(doc)}
            style={{border:"none", background:"none", padding:0, minHeight:0, font:"inherit", color:"var(--ink)", textDecoration:"underline", cursor:"pointer", ...style}}>
      {children || DOCS[doc].title}
    </button>
  );
}

window.Legal = { DOCS, VERSION, LegalPage, LegalLayer, LegalLink, open };
})();
