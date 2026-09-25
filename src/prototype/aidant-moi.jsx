// Onglet « Moi » — prévention de l'épuisement, à partir de ce que l'app sait déjà :
// charge invisible calculée sur l'usage réel, plan de relais pré-engagé, carnet de l'aidante transmissible.
(() => {
const { useState, useEffect, useMemo } = React;
const { StatusBar, Avatar } = window.UI;
const { IconChevron, IconCheck, IconMic, IconShare, CatHeart, CatLeaf, CatPeople, CatSun, IconCalendar, IconLock } = window.Icons;

const KEY = "cv-moi-v2";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){ return {}; } };
const save = (patch) => { try { localStorage.setItem(KEY, JSON.stringify({...load(), ...patch})); } catch(e){} };
const DAY = 86400000;
const Circle = ({Icon, bg="var(--ink)", color="#fff", size=44, isize=20}) => (
  <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={isize} sw={1.8}/></span>
);
const Pad = ({children, style}) => <div style={{padding:"0 20px", ...style}}>{children}</div>;
const Pill = ({children, dark}) => <span style={{font:"800 10.5px var(--sans)", letterSpacing:".08em", textTransform:"uppercase", background: dark ? "var(--ink)" : "rgba(255,255,255,.65)", color: dark ? "#fff" : "var(--ink)", borderRadius:999, padding:"6px 10px", whiteSpace:"nowrap"}}>{children}</span>;
const H2 = ({t, s}) => <div style={{padding:"26px 20px 12px"}}><h2>{t}</h2>{s && <p className="meta" style={{marginTop:4}}>{s}</p>}</div>;

/* ── 1. Charge invisible : calculée sur l'activité réelle du carnet ── */
function useCharge(notes, lastRelayDays, moods){
  return useMemo(() => {
    const now = Date.now(), week = notes.filter(n => now - n.ts < 7*DAY);
    const night = week.filter(n => { const h = new Date(n.ts).getHours(); return h >= 22 || h < 6; }).length;
    const days = new Set(week.map(n => new Date(n.ts).toDateString())).size;
    const hard = moods.filter(m => m != null && m <= 2).length;
    // score 0-100 : relais (40) · nuits (20) · jours sans pause (20) · ressenti (20)
    const score = Math.min(100, Math.round(Math.min(lastRelayDays, 14)/14*40 + Math.min(night, 4)/4*20 + Math.min(days, 7)/7*20 + hard/7*20));
    const zone = score >= 65 ? "rouge" : score >= 40 ? "orange" : "vert";
    return { week: week.length, night, days, hard, score, zone };
  }, [notes, lastRelayDays, moods]);
}

/* ── Respiration 4-2-6 ── */
function Breath(){
  const [on, setOn] = useState(false), [phase, setPhase] = useState("inspire");
  useEffect(() => { if(!on) return; const seq = [["inspire",4000],["retiens",2000],["expire",6000]]; let i = 0, id; const step = () => { setPhase(seq[i%3][0]); id = setTimeout(step, seq[i%3][1]); i++; }; step(); return () => clearTimeout(id); }, [on]);
  const scale = !on ? .78 : phase === "expire" ? .6 : 1, dur = phase === "inspire" ? "4s" : phase === "expire" ? "6s" : ".6s";
  return (
    <div style={{background:"var(--ink)", color:"#fff", borderRadius:"var(--r-xl)", padding:"20px", display:"flex", gap:18, alignItems:"center"}}>
      <div style={{position:"relative", width:92, height:92, flexShrink:0}} aria-live="polite">
        <span aria-hidden="true" style={{position:"absolute", inset:0, borderRadius:"50%", background:"var(--c-parler)", transform:`scale(${scale})`, transition:`transform ${on ? dur : ".4s"} cubic-bezier(.4,0,.2,1)`}}/>
        <span style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", font:"800 14px var(--sans)", color:"var(--ink)"}}>{on ? {inspire:"Inspire",retiens:"Retiens",expire:"Expire"}[phase] : "4·2·6"}</span>
      </div>
      <div style={{flex:1, minWidth:0}}>
        <p style={{font:"800 16px var(--sans)", letterSpacing:"-.02em"}}>Une minute, maintenant.</p>
        <p style={{marginTop:4, fontSize:13, fontWeight:600, opacity:.7, lineHeight:1.4}}>Trois cycles suffisent à faire redescendre le rythme cardiaque.</p>
        <button className="btn" onClick={() => setOn(v => !v)} style={{marginTop:12, background:"#fff", color:"var(--ink)", minHeight:44}}>{on ? "Arrêter" : "Commencer"}</button>
      </div>
    </div>
  );
}

/* ── Page ── */
function AidantMoi({notes=[], onOpenShare, onToast}){
  const st = load();
  const [moods, setMoods] = useState(st.moods || [2,2,3,1,2,3,null]);
  const [plan, setPlan] = useState(st.plan || { on:false, seuil:"orange", who:"Léo", auto:true });
  const [triggered, setTriggered] = useState(st.triggered || false);
  const [lastRelayDays, setLastRelayDays] = useState(st.lastRelayDays ?? 9);
  const [mine, setMine] = useState(st.mine || [
    { id:"m1", text:"Marcher jusqu'au marché le samedi matin, seule, sans téléphone.", ts:Date.now()-3*DAY },
    { id:"m2", text:"Le café avec Sophie. Elle ne me demande jamais « et ta mère ? » en premier.", ts:Date.now()-8*DAY },
    { id:"m3", text:"Dire non à une demande par semaine. Une seule. Ça suffit à me sentir exister.", ts:Date.now()-12*DAY },
  ]);
  const [mineShared, setMineShared] = useState(st.mineShared || false);
  const [recording, setRecording] = useState(false);
  const [draft, setDraft] = useState("");
  const [showPlan, setShowPlan] = useState(false);
  const persist = (p) => save(p);

  const charge = useCharge(notes, lastRelayDays, moods);
  const today = moods[6];
  const DAYS = ["L","M","M","J","V","S","D"];
  const LEVELS = [{v:1,l:"Épuisée"},{v:2,l:"Tendue"},{v:3,l:"Ça va"},{v:4,l:"Bien"}];
  const ZONE = {
    vert:   { bg:"var(--c-sante)",    ink:"var(--c-sante-ink)",    title:"Charge soutenable", body:"Tu tiens parce que tu délègues. Garde ce rythme." },
    orange: { bg:"var(--c-histoire)", ink:"var(--c-histoire-ink)", title:"Charge élevée",     body:"C'est la zone où l'on tient « encore un peu ». C'est justement le moment de passer le relais, pas après." },
    rouge:  { bg:"var(--c-apaise)",   ink:"var(--c-apaise-ink)",   title:"Charge critique",   body:"Personne ne peut porter ça seule sans s'abîmer. Ton plan de relais est prêt à partir." },
  }[charge.zone];
  const seuilHit = plan.on && !triggered && (plan.seuil === "orange" ? charge.zone !== "vert" : charge.zone === "rouge");

  function pickMood(v){ const next = [...moods.slice(0,6), v]; setMoods(next); persist({moods:next}); }
  function fire(){ setTriggered(true); persist({triggered:true}); onToast && onToast(`${plan.who} a reçu ton message et le carnet.`); }
  function relayed(){ setLastRelayDays(0); setTriggered(false); persist({lastRelayDays:0, triggered:false}); onToast && onToast("Relais noté. Bon repos, Anne."); }
  function startRec(){
    setRecording(true); const t = "Chanter dans la voiture, fort, sur le parking avant de rentrer."; let i = 0;
    const id = setInterval(() => { i += 3; setDraft(t.slice(0,i)); if(i >= t.length){ clearInterval(id); setTimeout(() => { const n = {id:"m"+Date.now(), text:t, ts:Date.now()}; const next = [n, ...mine]; setMine(next); persist({mine:next}); setRecording(false); setDraft(""); onToast && onToast("Ajouté à ton carnet à toi."); }, 500); } }, 60);
  }
  const msg = `Léo, j'ai besoin que tu prennes le relais auprès de Maman ${charge.zone === "rouge" ? "dès demain" : "ce week-end"}. Je t'envoie le carnet : tout y est. Merci d'être là. — Anne`;

  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <div style={{flex:1, minWidth:0}}><h1 style={{fontSize:28}}>Et toi, Anne&nbsp;?</h1><p className="meta" style={{marginTop:2}}>Ce que le carnet sait de ta charge, pas seulement de Jeanne.</p></div>
        <Avatar name="Anne C" size={46} tone="cool"/>
      </div>
      <div className="scroll">

        {/* ── Charge invisible ── */}
        <Pad style={{paddingTop:12}}>
          <div style={{background:ZONE.bg, color:ZONE.ink, borderRadius:"var(--r-xl)", padding:"20px 18px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <p className="kicker" style={{color:"inherit", opacity:.75}}>Ta charge invisible · 7 jours</p>
              <Pill>{charge.score} / 100</Pill>
            </div>
            <div style={{height:10, borderRadius:999, background:"rgba(255,255,255,.55)", marginTop:14, position:"relative", overflow:"hidden"}} role="meter" aria-valuenow={charge.score} aria-valuemin={0} aria-valuemax={100} aria-label="Charge">
              <span style={{position:"absolute", left:0, top:0, bottom:0, width:`${charge.score}%`, background:"var(--ink)", borderRadius:999, transition:"width .6s"}}/>
              <span aria-hidden="true" style={{position:"absolute", left:"40%", top:0, bottom:0, width:2, background:"rgba(0,0,0,.25)"}}/>
              <span aria-hidden="true" style={{position:"absolute", left:"65%", top:0, bottom:0, width:2, background:"rgba(0,0,0,.25)"}}/>
            </div>
            <p style={{marginTop:16, font:"800 20px var(--sans)", letterSpacing:"-.025em", lineHeight:1.15}}>{ZONE.title}</p>
            <p style={{marginTop:6, fontSize:13.5, fontWeight:600, lineHeight:1.5, opacity:.9}}>{ZONE.body}</p>
            <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:6}}>
              {[[lastRelayDays, "jour"+(lastRelayDays>1?"s":"")+" sans relais"], [charge.night, "note"+(charge.night>1?"s":"")+" la nuit"], [charge.days, "jour"+(charge.days>1?"s":"")+" sur 7 mobilisée"]].map(([n,l]) => (
                <li key={l} style={{background:"rgba(255,255,255,.6)", borderRadius:14, padding:"10px 10px", color:"var(--ink)"}}>
                  <span style={{display:"block", font:"800 22px var(--sans)", letterSpacing:"-.03em", lineHeight:1}}>{n}</span>
                  <span style={{display:"block", marginTop:4, fontSize:11.5, fontWeight:700, lineHeight:1.25, opacity:.8}}>{l}</span>
                </li>
              ))}
            </ul>
            <p style={{marginTop:12, fontSize:12, fontWeight:600, opacity:.75, lineHeight:1.45}}>Calculé à partir de tes {charge.week} notes de la semaine, de leurs horaires et du dernier relais. Jamais partagé.</p>
          </div>
        </Pad>

        {/* ── Plan de relais (pré-engagement) ── */}
        <Pad style={{paddingTop:12}}>
          <div className="card" style={{padding:0, overflow:"hidden"}}>
            <button onClick={() => setShowPlan(v => !v)} style={{width:"100%", textAlign:"left", border:"none", background:"none", cursor:"pointer", padding:16, display:"flex", gap:14, alignItems:"center", color:"var(--ink)"}}>
              <Circle Icon={CatPeople} bg={plan.on ? "var(--ink)" : "var(--bg)"} color={plan.on ? "#fff" : "var(--ink)"}/>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Mon plan de relais</span>
                <span className="meta" style={{display:"block", marginTop:4}}>{plan.on ? `Activé · ${plan.who} prévenu dès la zone ${plan.seuil}` : "Décide aujourd'hui, à froid, quand passer la main."}</span>
              </span>
              <span style={{transform: showPlan ? "rotate(90deg)" : "none", transition:"transform .2s", display:"flex"}}><IconChevron size={18}/></span>
            </button>
            {showPlan && (
              <div className="slide-up" style={{padding:"0 16px 16px"}}>
                <p style={{fontSize:13.5, fontWeight:600, color:"var(--ink-2)", lineHeight:1.5}}>Quand on est épuisée, on ne demande plus d'aide. Alors on la programme avant.</p>
                <p className="kicker" style={{marginTop:16}}>Je passe le relais quand ma charge est</p>
                <div className="seg" style={{marginTop:8}}>
                  {[["orange","Élevée"],["rouge","Critique"]].map(([id,l]) => <button key={id} className={plan.seuil === id ? "on" : ""} onClick={() => { const p = {...plan, seuil:id}; setPlan(p); persist({plan:p}); }}>{l}</button>)}
                </div>
                <p className="kicker" style={{marginTop:16}}>Qui prend le relais</p>
                <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
                  {["Léo","Claire","Auxiliaire"].map(w => <button key={w} className="chip" aria-pressed={plan.who === w} onClick={() => { const p = {...plan, who:w}; setPlan(p); persist({plan:p}); }}>{w}</button>)}
                </div>
                <p className="kicker" style={{marginTop:16}}>Ce qui part automatiquement</p>
                <ul style={{listStyle:"none", padding:0, margin:"8px 0 0", display:"grid", gap:6}}>
                  {["Un message écrit par toi, à l'avance", "Le carnet de Jeanne, en accès 7 jours", "Une pause de notifications pour toi, 48 h"].map(t => <li key={t} style={{display:"flex", gap:10, alignItems:"center", fontSize:14, fontWeight:600}}><span style={{width:22, height:22, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><IconCheck size={12} sw={2.6}/></span>{t}</li>)}
                </ul>
                <button className={"btn" + (plan.on ? " soft" : "")} style={{marginTop:16, width:"100%"}} onClick={() => { const p = {...plan, on:!plan.on}; setPlan(p); persist({plan:p}); onToast && onToast(p.on ? "Plan de relais activé." : "Plan de relais désactivé."); }}>{plan.on ? "Désactiver le plan" : "Activer mon plan de relais"}</button>
              </div>
            )}
          </div>
          {seuilHit && (
            <div className="slide-up" style={{marginTop:8, background:"var(--ink)", color:"#fff", borderRadius:"var(--r-xl)", padding:18}}>
              <p className="kicker" style={{color:"var(--accent-2)"}}>Seuil atteint · ton plan se déclenche</p>
              <p style={{marginTop:10, fontSize:15, fontWeight:600, lineHeight:1.5, background:"rgba(255,255,255,.1)", borderRadius:14, padding:"12px 14px"}}>« {msg} »</p>
              <div style={{display:"grid", gap:8, marginTop:14}}>
                <button className="btn" style={{width:"100%", background:"#fff", color:"var(--ink)"}} onClick={fire}><IconShare size={18}/><span style={{whiteSpace:"nowrap"}}>Envoyer à {plan.who}</span></button>
                <button className="btn" style={{width:"100%", background:"rgba(255,255,255,.15)", color:"#fff", whiteSpace:"nowrap"}} onClick={() => { setTriggered(true); persist({triggered:true}); }}>Pas cette fois</button>
              </div>
            </div>
          )}
          {triggered && lastRelayDays > 0 && (
            <button onClick={relayed} className="card card-press" style={{marginTop:8, width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:12, alignItems:"center", padding:14}}>
              <Circle Icon={IconCheck} size={36} isize={16}/>
              <span style={{flex:1, font:"700 14px var(--sans)"}}>{plan.who} a pris le relais ? Note-le pour remettre ton compteur à zéro.</span>
            </button>
          )}
        </Pad>

        {/* ── Check-in + semaine (compact) ── */}
        <Pad style={{paddingTop:12}}>
          <div className="card" style={{padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><p className="kicker">Aujourd'hui, tu te sens…</p><span className="meta" style={{fontWeight:700, whiteSpace:"nowrap"}}>{charge.hard} j. difficile{charge.hard>1?"s":""} / 7</span></div>
            <div role="radiogroup" style={{display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:6, marginTop:10}}>
              {LEVELS.map(l => { const on = today === l.v; return <button key={l.v} role="radio" aria-checked={on} onClick={() => pickMood(l.v)} style={{border:"none", cursor:"pointer", borderRadius:12, minHeight:44, background: on ? "var(--ink)" : "var(--bg)", color: on ? "#fff" : "var(--ink)", font:"800 13px var(--sans)"}}>{l.l}</button>; })}
            </div>
            <div style={{display:"flex", gap:5, alignItems:"flex-end", height:40, marginTop:14}}>
              {DAYS.map((d,i) => { const v = moods[i]; return <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", justifyContent:"flex-end"}}><span style={{width:"100%", borderRadius:6, background: v == null ? "var(--line)" : v <= 2 ? "var(--c-apaise)" : "var(--c-sante)", height: v == null ? 6 : 6 + v*6}}/><span style={{font:"800 10px var(--sans)", color:"var(--ink-3)"}}>{d}</span></div>; })}
            </div>
          </div>
        </Pad>

        {/* ── Mon carnet à moi ── */}
        <H2 t="Mon carnet à moi" s="Ce qui te recharge, dicté comme pour Jeanne. Pour ne pas l'oublier les jours où tout s'efface."/>
        <Pad>
          <button onClick={startRec} disabled={recording} className="card-press" style={{width:"100%", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:18, background:"var(--c-parler)", color:"var(--c-parler-ink)", textAlign:"left", display:"flex", gap:14, alignItems:"center"}}>
            <Circle Icon={IconMic} size={48} isize={22}/>
            <span style={{flex:1, minWidth:0}}>
              <span style={{display:"block", font:"800 16px var(--sans)", letterSpacing:"-.02em"}}>{recording ? "J'écoute…" : "Qu'est-ce qui t'a fait du bien, récemment ?"}</span>
              <span style={{display:"block", marginTop:4, fontSize:13, fontWeight:600, opacity:.8, minHeight:18}}>{recording ? draft : "Une phrase suffit. Je la garde pour toi."}</span>
            </span>
          </button>
          <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
            {mine.map(n => <li key={n.id} className="card" style={{padding:"12px 14px", font:"600 14px var(--sans)", lineHeight:1.45}}>{n.text}</li>)}
          </ul>
          <button onClick={() => { setMineShared(v => !v); persist({mineShared:!mineShared}); onToast && onToast(!mineShared ? "Léo sait maintenant comment prendre soin de toi." : "Carnet à toi de nouveau privé."); }} className="card card-press" style={{marginTop:8, width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:12, alignItems:"center", padding:14, background: mineShared ? "var(--c-proches)" : "var(--card)", color: mineShared ? "var(--c-proches-ink)" : "var(--ink)"}}>
            <Circle Icon={mineShared ? CatPeople : IconLock} size={36} isize={16} bg={mineShared ? "var(--ink)" : "var(--bg)"} color={mineShared ? "#fff" : "var(--ink)"}/>
            <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14px var(--sans)"}}>{mineShared ? "Partagé avec Léo" : "Partager avec Léo"}</span><span style={{display:"block", marginTop:2, fontSize:12.5, fontWeight:600, opacity:.8}}>Quand il prend le relais, il saura aussi comment t'aider, toi.</span></span>
          </button>
        </Pad>

        {/* ── Respiration ── */}
        <Pad style={{paddingTop:22}}><Breath/></Pad>

        {/* ── Relais & répit ── */}
        <H2 t="Te faire relayer"/>
        <Pad>
          <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:8}}>
            <li><button onClick={onOpenShare} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:14, alignItems:"center", padding:16}}>
              <Circle Icon={IconShare} bg="var(--c-proches)" color="var(--c-proches-ink)"/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Transmettre le carnet</span><span className="meta" style={{display:"block", marginTop:4}}>Un proche ou une auxiliaire prend le relais avec tout ce qu'il faut savoir.</span></span>
              <IconChevron size={18}/>
            </button></li>
            <li><a href="tel:0805380381" className="card card-press" style={{display:"flex", gap:14, alignItems:"center", padding:16, textDecoration:"none", color:"var(--ink)"}}>
              <Circle Icon={CatSun} bg="var(--c-habitudes)" color="var(--c-habitudes-ink)"/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Pause répit · 0 805 38 03 81</span><span className="meta" style={{display:"block", marginTop:4}}>Accueil de jour, de nuit, hébergement temporaire. Gratuit, en partie financé.</span></span>
            </a></li>
            <li><a href="tel:0972303030" className="card card-press" style={{display:"flex", gap:14, alignItems:"center", padding:16, textDecoration:"none", color:"var(--ink)"}}>
              <Circle Icon={CatHeart} bg="var(--c-apaise)" color="var(--c-apaise-ink)"/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Allô Aidants · 09 72 30 30 30</span><span className="meta" style={{display:"block", marginTop:4}}>Écoute 7j/7, confidentielle, sans jugement.</span></span>
            </a></li>
          </ul>
          <p className="meta" style={{marginTop:16, marginBottom:8, textAlign:"center", lineHeight:1.5}}>Rien de cette page n'est visible par Jeanne, les proches ou l'établissement.</p>
        </Pad>
      </div>
    </div>
  );
}
window.AidantMoi = { AidantMoi };
})();
