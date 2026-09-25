// Journal partagé (établissement → famille) + file hors ligne des notes vocales
(() => {
const { useState, useEffect } = React;
const { CAT_BY_ID, softDate } = window.AppData;
const { IconChevron, IconCheck } = window.Icons;

/* ── Journal retour famille — store partagé entre les vues ── */
const KEY = "cv-family-journal";
const SEED = [
  { id:"fj1", text:"Ce matin, a chanté avec la radio pendant la toilette. France Musique très bas, ça marche.", catId:"apaise", ts:Date.now()-3*3600000, who:"Sandra", role:"Aide-soignante", unit:"B" },
  { id:"fj2", text:"Déjeuner complet, la purée surtout. A demandé deux fois si Claire venait mercredi.", catId:"gouts", ts:Date.now()-26*3600000, who:"Karim", role:"Infirmier", unit:"B" },
  { id:"fj3", text:"Sieste de 13h30 à 14h20. Réveil calme, a reconnu Sandra tout de suite.", catId:"habitudes", ts:Date.now()-2*86400000-3600000, who:"Sandra", role:"Aide-soignante", unit:"B" },
];
let entries = (() => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || SEED; } catch(e){ return SEED; } })();
const listeners = new Set();
const FamilyJournal = {
  list: () => entries,
  publish: (e) => { entries = [{ id:"fj"+Date.now(), ...e }, ...entries]; try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch(_){} listeners.forEach(f => f()); },
  use: () => { const [, t] = useState(0); useEffect(() => { const f = () => t(x => x+1); listeners.add(f); return () => listeners.delete(f); }, []); return entries; },
};

/* Carte compacte pour l'accueil (aidant / proche) */
function FamilyJournalCard({onOpen, who="Jeanne"}){
  const list = FamilyJournal.use();
  if(!list.length) return null;
  const last = list[0], c = CAT_BY_ID[last.catId];
  const today = list.filter(e => Date.now() - e.ts < 86400000).length;
  return (
    <button onClick={onOpen} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:16, display:"flex", gap:14, alignItems:"center", background:"var(--c-sante)", color:"var(--c-sante-ink)"}}>
      <span aria-hidden="true" style={{width:44, height:44, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><c.Icon size={20} sw={1.8}/></span>
      <span style={{flex:1, minWidth:0}}>
        <span style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
          <span style={{font:"800 11px var(--sans)", letterSpacing:".1em", textTransform:"uppercase", opacity:.75}}>Des nouvelles de {who}</span>
          <span style={{fontSize:12, fontWeight:700, whiteSpace:"nowrap", opacity:.75}}>{softDate(last.ts)}</span>
        </span>
        <span style={{display:"block", marginTop:6, font:"700 14.5px var(--sans)", lineHeight:1.4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical"}}>{last.text}</span>
        <span style={{display:"block", marginTop:6, fontSize:12.5, fontWeight:600, opacity:.8}}>{last.who}, {last.role.toLowerCase()} · Maison des Tilleuls{today > 1 ? ` · ${today} nouvelles aujourd'hui` : ""}</span>
      </span>
      <IconChevron size={18}/>
    </button>
  );
}

/* Page complète — lecture par jour */
function FamilyJournalPage({onBack, who="Jeanne"}){
  const list = FamilyJournal.use();
  const { StatusBar, ReadAloud } = window.UI;
  const { IconBack } = window.Icons;
  const byDay = list.reduce((acc, e) => { const k = new Date(e.ts).toDateString(); (acc[k] = acc[k] || []).push(e); return acc; }, {});
  const dayLabel = (k) => { const d = new Date(k), n = new Date(); const diff = Math.round((new Date(n.toDateString()) - new Date(d.toDateString())) / 86400000); return diff === 0 ? "Aujourd'hui" : diff === 1 ? "Hier" : d.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }); };
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>
        <span style={{font:"800 16px var(--sans)", letterSpacing:"-.01em"}}>Des nouvelles de {who}</span>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <div style={{background:"var(--c-sante)", color:"var(--c-sante-ink)", borderRadius:"var(--r-xl)", padding:"18px 20px"}}>
          <p style={{font:"800 18px var(--sans)", letterSpacing:"-.02em", lineHeight:1.2}}>Ce que l'équipe a vu, pour toi.</p>
          <p style={{marginTop:6, fontSize:13.5, fontWeight:600, lineHeight:1.5, opacity:.9}}>Chaque mot est écrit par un·e soignant·e de la Maison des Tilleuls et relu par le cadre avant de t'arriver. Rien de médical : les petites choses de la journée.</p>
        </div>
        {Object.keys(byDay).map(k => (
          <section key={k} style={{marginTop:22}}>
            <p className="kicker" style={{textTransform:"none", letterSpacing:0, fontSize:13}}>{dayLabel(k)}</p>
            <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:8}}>
              {byDay[k].map(e => { const c = CAT_BY_ID[e.catId]; return (
                <li key={e.id} className="card" style={{padding:16, display:"flex", gap:12, alignItems:"flex-start"}}>
                  <span aria-hidden="true" style={{width:36, height:36, borderRadius:"50%", background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><c.Icon size={16} sw={1.8}/></span>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{font:"600 15px var(--sans)", lineHeight:1.5}}>{e.text}</p>
                    <p className="meta" style={{marginTop:8, fontSize:12.5}}>{e.who}, {e.role.toLowerCase()} · {new Date(e.ts).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}</p>
                  </div>
                  <ReadAloud text={e.text} size={36}/>
                </li>
              ); })}
            </ul>
          </section>
        ))}
        <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.5}}>Tu peux répondre à l'équipe depuis « Répondre » : un merci, une précision, ça compte pour elles aussi.</p>
      </div>
    </div>
  );
}

/* ── File hors ligne ─────────────────────────────────────── */
const NKEY = "cv-net-offline";
let offline = (() => { try { return localStorage.getItem(NKEY) === "1"; } catch(e){ return false; } })();
let queue = [];
const nl = new Set();
const Net = {
  isOffline: () => offline,
  toggle: () => { offline = !offline; try { localStorage.setItem(NKEY, offline ? "1" : "0"); } catch(_){} if(!offline){ const q = queue; queue = []; q.forEach(fn => fn()); } nl.forEach(f => f()); },
  enqueue: (fn) => { queue.push(fn); nl.forEach(f => f()); },
  pending: () => queue.length,
  use: () => { const [, t] = useState(0); useEffect(() => { const f = () => t(x => x+1); nl.add(f); return () => nl.delete(f); }, []); return { offline, pending: queue.length }; },
};

/* Bandeau : n'apparaît que hors ligne (le réseau se détecte tout seul) */
function NetBanner(){
  const { offline, pending } = Net.use();
  useEffect(() => {
    const on = () => { if(offline) Net.toggle(); }, off = () => { if(!offline) Net.toggle(); };
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [offline]);
  if(!offline) return null;
  return (
    <div role="status" style={{margin:"0 20px", borderRadius:999, minHeight:34, padding:"0 14px", display:"flex", alignItems:"center", gap:8, alignSelf:"flex-start", background:"var(--ink)", color:"#fff", font:"700 12.5px var(--sans)"}}>
      <span aria-hidden="true" style={{width:8, height:8, borderRadius:"50%", background:"var(--accent-2)", boxShadow:"0 0 0 3px rgba(232,137,60,.3)"}}/>
      {pending ? `Hors ligne · ${pending} note${pending>1?"s":""} partira${pending>1?"ont":""} au retour du réseau` : "Hors ligne · tes notes partiront plus tard"}
    </div>
  );
}

/* Pastille « en attente » sur une note */
function PendingPill(){
  return <span style={{font:"700 11.5px var(--sans)", background:"var(--bg)", color:"var(--ink-2)", borderRadius:999, padding:"5px 10px", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:6}}><span aria-hidden="true" style={{width:6, height:6, borderRadius:"50%", background:"var(--accent-2)"}}/>Partira au retour du réseau</span>;
}

window.FamilyJournal = FamilyJournal; window.Net = Net;
Object.assign(window, { FamilyJournalCard, FamilyJournalPage, NetBanner, PendingPill });
})();
