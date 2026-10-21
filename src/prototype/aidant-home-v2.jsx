// Aidant Home v2 — modern, color-block, UX-first. Overrides window.Aidant.AidantHome.
(() => {
const { useState, useMemo } = React;
const { IconMic, IconBell, IconChevron, IconShare, IconSparkle, IconBack, JeanneIllustration } = window.Icons;
const { CATEGORIES, CAT_BY_ID, softDate, MOODS, RITUALS, ENRICHMENT_PROMPTS, dayKey, lastDays } = window.AppData;
const { StatusBar, SearchBar, Avatar, timeGreeting, momentNow } = window.UI;

// « Sereine » ou « Serein », selon la personne.
const moodLabel = (id) => { const m = MOODS.find(x => x.id === id); if(!m) return ""; return window.Who.pronoun === "il" ? ({sereine:"Serein", fatiguee:"Fatigué"}[id] || m.label) : m.label; };
const MOOD_TONE = Object.fromEntries(MOODS.map(m => [m.id, m.tone]));

/* « Comment va Jeanne » : les 30 derniers jours, d'après ce que le cercle a noté chaque jour. */
function PersonMoodsPage({moods, onBack}){
  const W = window.Who;
  const byDay = Object.fromEntries((moods || []).map(m => [m.day, m]));
  const days = lastDays(30);
  const lead = (days[0].getDay() + 6) % 7;            // la grille commence un lundi
  const counts = MOODS.map(m => [m, (moods || []).filter(x => x.day in byDay && x.mood === m.id && days.some(d => dayKey(d) === x.day)).length]);
  const filled = days.filter(d => byDay[dayKey(d)]).length;
  const recent = days.slice().reverse().map(d => [d, byDay[dayKey(d)]]).filter(([, m]) => m).slice(0, 7);
  const long = (d) => d.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
  return (
    <div className="screen slide-up">
      <StatusBar/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>
        <h1 className="serif" style={{fontSize:20, letterSpacing:"-.01em"}}>Comment va {W.person}</h1>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" tabIndex={0} role="region" aria-label={`Comment va ${W.person}, 30 derniers jours`} style={{padding:"6px 20px 24px"}}>
        <p style={{fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>Les 30 derniers jours, d'après ce que vous notez chaque jour sur l'accueil.</p>

        <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:8}}>
          {counts.map(([m, n]) => (
            <li key={m.id} style={{background:m.tone, borderRadius:16, padding:"12px 14px", color:"var(--ink)"}}>
              <span style={{display:"block", font:"800 22px var(--sans)", letterSpacing:"-.03em"}}>{n} <span style={{fontSize:13, fontWeight:700}}>jour{n > 1 ? "s" : ""}</span></span>
              <span style={{display:"block", marginTop:2, fontSize:13.5, fontWeight:700}}>{moodLabel(m.id)}</span>
            </li>
          ))}
        </ul>
        <p className="meta" style={{marginTop:8}}>{filled} jour{filled > 1 ? "s" : ""} renseigné{filled > 1 ? "s" : ""} sur 30.</p>

        <div className="card" style={{marginTop:16, padding:14}}>
          <div aria-hidden="true" style={{display:"grid", gridTemplateColumns:"repeat(7,minmax(0,1fr))", gap:6, marginBottom:6}}>
            {["L","M","M","J","V","S","D"].map((l, i) => <span key={i} style={{textAlign:"center", font:"800 11px var(--sans)", color:"var(--ink-3)"}}>{l}</span>)}
          </div>
          <ul aria-label="Les 30 derniers jours" style={{listStyle:"none", padding:0, margin:0, display:"grid", gridTemplateColumns:"repeat(7,minmax(0,1fr))", gap:6}}>
            {Array.from({length:lead}, (_, i) => <li key={"v" + i} aria-hidden="true"/>)}
            {days.map((d, i) => { const m = byDay[dayKey(d)]; const today = i === days.length - 1; return (
              <li key={dayKey(d)} aria-label={`${today ? "Aujourd'hui" : long(d)} : ${m ? moodLabel(m.mood) + (m.author_name ? ", noté par " + m.author_name : "") : "pas renseigné"}`}
                  style={{aspectRatio:"1", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", font:"800 12px var(--sans)",
                          background: m ? MOOD_TONE[m.mood] : "transparent", border: m ? "none" : "1.5px dashed var(--line-2)",
                          color:"var(--ink)", outline: today ? "2px solid var(--ink)" : "none", outlineOffset:1}}>
                <span aria-hidden="true">{d.getDate()}</span>
              </li>
            ); })}
          </ul>
          <p className="meta" style={{marginTop:10, fontSize:12}}>Case en pointillés : jour non renseigné. Case entourée : aujourd'hui.</p>
        </div>

        {recent.length > 0 && (<>
          <p className="kicker" style={{marginTop:22}}>Les derniers jours</p>
          <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
            {recent.map(([d, m]) => (
              <li key={m.day} className="card" style={{padding:"12px 14px", display:"flex", gap:12, alignItems:"center"}}>
                <span aria-hidden="true" style={{width:14, height:14, borderRadius:"50%", background:MOOD_TONE[m.mood], flexShrink:0, boxShadow:"inset 0 0 0 1px rgba(0,0,0,.12)"}}/>
                <span style={{flex:1, minWidth:0, fontSize:14}}><b style={{fontWeight:800}}>{moodLabel(m.mood)}</b> · {long(d)}</span>
                {m.author_name && <span className="meta" style={{whiteSpace:"nowrap"}}>{m.author_name}</span>}
              </li>
            ))}
          </ul>
        </>)}

        <p className="meta" style={{marginTop:18, lineHeight:1.5}}>Visible par toi et ton cercle d'aidants. Jamais dans les fiches envoyées aux relais.</p>
      </div>
    </div>
  );
}
window.PersonMoodsPage = PersonMoodsPage;

const SHORT = { histoire:"Histoire", habitudes:"Habitudes", apaise:"Apaisement", parler:"Lui parler", gouts:"Goûts", sante:"Vigilance", proches:"Proches" };

function Ring({value, max, size=56, stroke=3, label}){
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{position:"relative", width:size, height:size, flexShrink:0}} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" style={{position:"absolute", inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${Math.min(value,max)/max*c} ${c}`}/>
      </svg>
      <span style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", font:`800 ${size*0.24}px var(--sans)`, letterSpacing:"-.02em"}}>{label ?? `${value}/${max}`}</span>
    </div>
  );
}

function AidantHomeV2({notes, mood, setMood, onOpenCat, onOpenCapture, onTab, onOpenNotifs, hasNewNotifs, onOpenMoods, sharePayload, lastShare, onOpenJournal}){
  const W = window.Who;
  // Les notes « plus vraies » (gardées dans la trace de vie) ne comptent pas et ne s'affichent pas sur l'accueil.
  const active = useMemo(() => notes.filter(n => !n.archived), [notes]);
  const counts = useMemo(() => { const c = {}; for(const n of active) c[n.catId] = (c[n.catId]||0)+1; return c; }, [active]);
  // Sous chaque rubrique : la dernière note ajoutée.
  const latest = useMemo(() => { const l = {}; for(const n of active) if(!l[n.catId] || n.ts > l[n.catId].ts) l[n.catId] = n; return l; }, [active]);
  const filled = CATEGORIES.filter(c => counts[c.id] > 0).length;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const matches = useMemo(() => { if(!search.trim()) return []; const q = search.toLowerCase(); return active.filter(n => n.text.toLowerCase().includes(q)).slice(0,5); }, [search, active]);
  const m = momentNow();
  const ritual = (W.demo ? RITUALS.find(x => x.moment === m) || RITUALS[0] : window.Live.ritual(notes, m))
    || { catId:"habitudes", title:"Un repère pour ce moment", body:`Qu'est-ce qui compte pour ${W.g("elle", "lui")} à ce moment de la journée ? Note-le.` };
  const momentLabel = {matin:"ce matin", midi:"ce midi", aprem:"cet après-midi", soir:"ce soir"}[m];
  const weak = CATEGORIES.find(c => (counts[c.id]||0) < 3);
  const prompt = ENRICHMENT_PROMPTS.find(p => p.catId === weak?.id) || ENRICHMENT_PROMPTS[0];
  const shown = filter === "all" ? CATEGORIES : CATEGORIES.filter(c => c.id === filter);
  const pad = {padding:"0 20px"};

  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1}}>
          <Avatar name={W.aidantFull || W.aidant || "Toi"} size={46} tone="cool"/>
          <div style={{minWidth:0}}>
            <p style={{font:"800 19px var(--sans)", letterSpacing:"-.02em", lineHeight:1.1}}>{timeGreeting()}{W.aidant ? `, ${W.aidant}` : ""}</p>
            <p className="meta" style={{fontSize:12.5, marginTop:2}}>Aux côtés de {W.person}</p>
          </div>
        </div>
        <button className="iconbtn" aria-label={hasNewNotifs ? "Notifications, du nouveau" : "Notifications"} onClick={onOpenNotifs} style={{position:"relative"}}>
          <IconBell size={20}/>
          {hasNewNotifs && <span aria-hidden="true" style={{position:"absolute", top:10, right:11, width:8, height:8, borderRadius:"50%", background:"var(--accent-2)", border:"2px solid #fff"}}/>}
        </button>
      </div>

      <div className="scroll">
        <div style={{...pad, paddingTop:12}}>
          <SearchBar value={search} onChange={setSearch} placeholder="Rechercher dans le carnet"/>
          {matches.length > 0 && (
            <div className="card slide-up" style={{marginTop:10, padding:8}}>
              {matches.map(n => (
                <button key={n.id} onClick={() => onOpenCat(n.catId)} style={{width:"100%", textAlign:"left", border:"none", background:"transparent", cursor:"pointer", padding:"10px 12px", borderRadius:14, display:"flex", gap:10, alignItems:"flex-start"}}>
                  <span style={{width:10, height:10, marginTop:6, borderRadius:"50%", background:CAT_BY_ID[n.catId].bg, flexShrink:0}}/>
                  <span style={{flex:1}}><span style={{fontSize:14, fontWeight:600, display:"block", lineHeight:1.4}}>{n.text}</span><span className="meta" style={{fontSize:12}}>{CAT_BY_ID[n.catId].title} · {softDate(n.ts)}</span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hero — Jeanne */}
        <div style={{...pad, paddingTop:16}}>
          {/* Toucher le bloc (hors boutons) ouvre « Comment va Jeanne » sur 30 jours. Au clavier et au
              lecteur d'écran, c'est le titre qui sert de bouton : rien ne change à l'œil. */}
          <div className="hero" onClick={onOpenMoods ? (e) => { if(!e.target.closest("button")) onOpenMoods(); } : undefined}
               style={{padding:"22px 22px 22px", cursor: onOpenMoods ? "pointer" : "default"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <button onClick={() => onTab("settings")} aria-label={`Profil de ${W.person}`} style={{width:52, height:52, borderRadius:"50%", background:"var(--ink)", border:"none", padding:0, overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", cursor:"pointer"}}>
                {W.demo || W.pronoun !== "il" ? <JeanneIllustration size={50}/> : <window.Persona name={W.personFull || W.person} size={50} bg="transparent" style="short"/>}
              </button>
              <Ring value={filled} max={CATEGORIES.length} size={60} stroke={3}/>
            </div>
            <h1 style={{marginTop:18, fontSize:30}}>{onOpenMoods
              ? <button onClick={onOpenMoods} aria-label={`Le carnet de ${W.person}, voir comment ${W.g("elle", "il")} va ces 30 derniers jours`}
                        style={{all:"unset", cursor:"pointer", borderRadius:8}}>Le carnet de {W.person}</button>
              : <>Le carnet de {W.person}</>}</h1>
            <p className="meta" style={{marginTop:6, opacity:.8}}>{active.length} notes · {filled} rubriques sur {CATEGORIES.length} renseignées</p>

            <div role="radiogroup" aria-label={`Comment va ${W.person} aujourd'hui`} style={{display:"flex", gap:6, marginTop:18, flexWrap:"wrap"}}>
              {MOODS.map(x => { const on = mood === x.id; return (
                <button key={x.id} role="radio" aria-checked={on} onClick={() => setMood(on ? null : x.id)}
                        style={{border:"none", borderRadius:999, padding:"0 14px", minHeight:38, cursor:"pointer", font:"700 13px var(--sans)", background: on ? "var(--ink)" : "rgba(255,255,255,.55)", color: on ? "#fff" : "inherit"}}>{W.pronoun === "il" ? ({sereine:"Serein", fatiguee:"Fatigué"}[x.id] || x.label) : x.label}</button>
              ); })}
            </div>
            <button onClick={onOpenCapture} className="btn" style={{marginTop:18, minHeight:50, paddingLeft:22, whiteSpace:"nowrap"}}>
              <IconMic size={18}/> Ajouter une note
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{paddingTop:24}}>
          <div style={{...pad, display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12}}>
            <h2>Rubriques</h2>
            <button onClick={() => onTab("carnet")} style={{border:"none", background:"none", cursor:"pointer", font:"700 13px var(--sans)", color:"var(--ink-2)", display:"inline-flex", alignItems:"center", gap:4, minHeight:32}}>Tout voir <IconChevron size={14}/></button>
          </div>
          <div className="h-scroll" role="group" aria-label="Filtrer les rubriques">
            <button className="chip" aria-pressed={filter==="all"} onClick={() => setFilter("all")}>Toutes</button>
            {CATEGORIES.map(c => { const Icon = c.Icon; return (
              <button key={c.id} className="chip" aria-pressed={filter===c.id} onClick={() => setFilter(filter===c.id ? "all" : c.id)}>
                <Icon size={15} sw={2}/> {SHORT[c.id]}
              </button>
            ); })}
          </div>
        </div>

        {/* Rubrique grid */}
        <div style={{...pad, paddingTop:14, display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:12}}>
          {shown.map(c => { const Icon = c.Icon; const n = counts[c.id]||0; const last = latest[c.id]; return (
            <button key={c.id} onClick={() => onOpenCat(c.id)} className="card-press"
                    style={{borderRadius:"var(--r-lg)", border:"none", background:c.bg, color:c.ink, padding:16, minHeight:172, minWidth:0, overflow:"hidden", cursor:"pointer", textAlign:"left", display:"flex", flexDirection:"column", gridColumn: shown.length===1 ? "1 / -1" : "auto"}}>
              <span style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <span aria-hidden="true" style={{width:42, height:42, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon size={20} sw={1.8}/></span>
                <Ring value={Math.min(n,8)} max={8} size={40} stroke={2.5} label={n}/>
              </span>
              <span style={{flex:1}}/>
              <span style={{font:"800 16px var(--sans)", letterSpacing:"-.02em", lineHeight:1.15, display:"block", minWidth:0, width:"100%"}}>{c.title}<span style={{position:"absolute", width:1, height:1, overflow:"hidden", clip:"rect(0 0 0 0)", whiteSpace:"nowrap"}}>, {n} note{n > 1 ? "s" : ""}.</span></span>
              <span style={{display:"block", width:"100%", minWidth:0, marginTop:6, fontSize:12.5, fontWeight:600, opacity:.8, lineHeight:1.35, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{last ? last.text : c.blurb}</span>
            </button>
          ); })}
        </div>

        {/* Conseil du moment — adapté à l'humeur du jour */}
        {(() => {
          const pick = (catId, fallback) => { const n = notes.find(x => x.catId === catId && !x.archived); return n ? n.text : fallback; };
          const byMood = {
            fragile:  { kicker:W.g("Elle est fragile aujourd'hui", "Il est fragile aujourd'hui"), catId:"apaise",  title:"Ce qui l'apaise", body: pick("apaise", "Une voix douce, sa musique, le calme."), tone:"var(--c-apaise)", ink:"var(--c-apaise-ink)" },
            fatiguee: { kicker:W.g("Elle est fatiguée", "Il est fatigué"), catId:"habitudes", title:"Alléger la journée", body: pick("habitudes", "Respecter ses temps de repos, ne rien forcer."), tone:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)" },
            sereine:  { kicker:W.g("Elle est sereine", "Il est serein"), catId:"histoire", title:"Un moment pour se souvenir", body: pick("histoire", "Une photo, une chanson, une question sur sa jeunesse."), tone:"var(--c-histoire)", ink:"var(--c-histoire-ink)" },
            belle:    { kicker:"Belle journée", catId:"proches", title:"En profiter", body: W.demo ? "Une sortie courte pendant qu'elle est en forme, ou un appel à Claire : elle adore entendre sa voix." : `Une sortie courte pendant qu'${W.g("elle", "il")} est en forme, ou un appel à un proche.`, tone:"var(--c-sante)", ink:"var(--c-sante-ink)" },
          };
          const mm = mood && byMood[mood];
          const card = mm || { kicker:`Pour ${momentLabel}`, catId:ritual.catId, title:ritual.title, body:ritual.body, tone:"var(--card)", ink:"var(--ink)" };
          const c = CAT_BY_ID[card.catId];
          return (
            <div style={{...pad, paddingTop:24}}>
              <p className="kicker" style={{marginBottom:10}}>{card.kicker}</p>
              <button key={mood || "moment"} onClick={() => onOpenCat(card.catId)} className={"card card-press" + (mm ? " slide-up" : "")} style={{width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:14, alignItems:"center", padding:16, background:card.tone, color:card.ink}}>
                <span aria-hidden="true" style={{width:48, height:48, borderRadius:"50%", background: mm ? "var(--ink)" : c.bg, color: mm ? "#fff" : c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><c.Icon size={22} sw={1.8}/></span>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em", lineHeight:1.25}}>{card.title}</span>
                  <span style={{display:"block", marginTop:4, fontSize:13.5, fontWeight:600, lineHeight:1.45, color: mm ? "inherit" : "var(--ink-2)", opacity: mm ? .9 : 1}}>{card.body}</span>
                </span>
                <IconChevron size={18}/>
              </button>
            </div>
          );
        })()}

        {/* Journal retour établissement */}
        {onOpenJournal && <div style={{...pad, paddingTop:14}}><window.FamilyJournalCard onOpen={onOpenJournal}/></div>}

        {/* Relecture des notes anciennes */}
        {(() => { const stale = notes.filter(n => !n.archived && (Date.now() - Math.max(n.ts, n.updatedAt || 0, n.confirmedAt || 0)) / 86400000 > 90); if(!stale.length) return null; const first = stale[stale.length-1]; const c = CAT_BY_ID[first.catId]; return (
          <div style={{...pad, paddingTop:14}}>
            <button onClick={() => onOpenCat(first.catId)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:16, display:"flex", gap:14, alignItems:"center", background:"var(--c-histoire)", color:"var(--c-histoire-ink)"}}>
              <span aria-hidden="true" style={{width:44, height:44, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, font:"800 15px var(--sans)"}}>{stale.length}</span>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Toujours d'actualité ?</span>
                <span style={{display:"block", marginTop:4, fontSize:13, fontWeight:600, opacity:.85, lineHeight:1.4}}>« {first.text.length > 60 ? first.text.slice(0,60) + "…" : first.text} » a {Math.round((Date.now()-first.ts)/86400000/30)} mois. {W.person} change, le carnet aussi.</span>
              </span>
              <IconChevron size={18}/>
            </button>
          </div>
        ); })()}

        {/* Garder le carnet vivant (IA, vrais comptes) */}
        {!W.demo && <div style={{...pad, paddingTop:14}}><window.BUI.ReviewCard carnetId={W.carnetId} onOpenCat={onOpenCat} onOpenCapture={onOpenCapture}/></div>}

        {/* Enrichment prompt */}
        <div style={{...pad, paddingTop:14}}>
          <div className="card" style={{background:"var(--ink)", color:"#fff", padding:20}}>
            <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--accent-2)"}}><IconSparkle size={16} sw={2}/><span className="kicker" style={{color:"inherit"}}>Pour mieux la connaître</span></div>
            <p style={{marginTop:12, font:"800 18px var(--sans)", letterSpacing:"-.02em", lineHeight:1.3}}>{prompt.question}</p>
            <div style={{display:"flex", gap:8, marginTop:16}}>
              <button onClick={onOpenCapture} className="btn" style={{background:"#fff", color:"var(--ink)", minHeight:46}}><IconMic size={16}/> Y répondre</button>
              <button style={{border:"none", background:"transparent", color:"rgba(255,255,255,.7)", font:"700 14px var(--sans)", cursor:"pointer", padding:"0 12px", minHeight:46}}>Plus tard</button>
            </div>
          </div>
        </div>

        {/* Last share */}
        <div style={{...pad, paddingTop:14}}>
          <button onClick={() => onTab("transmettre")} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", display:"flex", gap:14, alignItems:"center", padding:16}}>
            <span aria-hidden="true" style={{width:48, height:48, borderRadius:16, background:"var(--c-proches)", color:"var(--c-proches-ink)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><IconShare size={20} sw={1.8}/></span>
            <span style={{flex:1, minWidth:0}}>
              <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Partager la fiche de {W.person}</span>
              <span className="meta" style={{display:"block", marginTop:4}}>
                {W.demo ? `Dernière : ${sharePayload.name.split(" ")[0]} · il y a 2 jours · valable 5 jours`
                  : lastShare ? `Dernière : ${lastShare.name ? lastShare.name.split(" ")[0] : "un relais"} · ${lastShare.openCount ? `ouverte ${lastShare.openCount} fois` : "pas encore ouverte"} · valable ${Math.max(1, Math.ceil((lastShare.expiresAt - Date.now()) / 86400000))} j`
                  : "Crée un lien sécurisé, rubrique par rubrique."}
              </span>
            </span>
            <IconChevron size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

window.Aidant.AidantHome = AidantHomeV2;
})();
