// Aidant Home v2 — modern, color-block, UX-first. Overrides window.Aidant.AidantHome.
(() => {
const { useState, useMemo } = React;
const { IconMic, IconBell, IconChevron, IconShare, IconSparkle, JeanneIllustration } = window.Icons;
const { CATEGORIES, CAT_BY_ID, softDate, MOODS, RITUALS, ENRICHMENT_PROMPTS } = window.AppData;
const { StatusBar, SearchBar, Avatar, timeGreeting, momentNow } = window.UI;

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

function AidantHomeV2({notes, mood, setMood, onOpenCat, onOpenCapture, onTab, onOpenNotifs, sharePayload, lastShare, onOpenJournal}){
  const W = window.Who;
  const counts = useMemo(() => { const c = {}; for(const n of notes) c[n.catId] = (c[n.catId]||0)+1; return c; }, [notes]);
  const filled = CATEGORIES.filter(c => counts[c.id] > 0).length;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const matches = useMemo(() => { if(!search.trim()) return []; const q = search.toLowerCase(); return notes.filter(n => n.text.toLowerCase().includes(q)).slice(0,5); }, [search, notes]);
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
        <button className="iconbtn" aria-label="Notifications" onClick={onOpenNotifs} style={{position:"relative"}}>
          <IconBell size={20}/>
          <span aria-hidden="true" style={{position:"absolute", top:10, right:11, width:8, height:8, borderRadius:"50%", background:"var(--accent-2)", border:"2px solid #fff"}}/>
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
          <div className="hero" style={{padding:"22px 22px 22px"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
              <button onClick={() => onTab("settings")} aria-label={`Profil de ${W.person}`} style={{width:52, height:52, borderRadius:"50%", background:"var(--ink)", border:"none", padding:0, overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", cursor:"pointer"}}>
                {W.demo ? <JeanneIllustration size={50}/> : <window.Persona name={W.personFull || W.person} size={50} bg="transparent" style={W.pronoun === "il" ? "short" : undefined}/>}
              </button>
              <Ring value={filled} max={CATEGORIES.length} size={60} stroke={3}/>
            </div>
            <h1 style={{marginTop:18, fontSize:30}}>Le carnet de {W.person}</h1>
            <p className="meta" style={{marginTop:6, opacity:.8}}>{notes.length} notes · {filled} rubriques sur {CATEGORIES.length} renseignées</p>

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
          <div className="h-scroll" role="tablist" aria-label="Filtrer les rubriques">
            <button className="chip" role="tab" aria-pressed={filter==="all"} onClick={() => setFilter("all")}>Toutes</button>
            {CATEGORIES.map(c => { const Icon = c.Icon; return (
              <button key={c.id} className="chip" role="tab" aria-pressed={filter===c.id} onClick={() => setFilter(filter===c.id ? "all" : c.id)}>
                <Icon size={15} sw={2}/> {SHORT[c.id]}
              </button>
            ); })}
          </div>
        </div>

        {/* Rubrique grid */}
        <div style={{...pad, paddingTop:14, display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:12}}>
          {shown.map(c => { const Icon = c.Icon; const n = counts[c.id]||0; const last = notes.find(x => x.catId === c.id); return (
            <button key={c.id} onClick={() => onOpenCat(c.id)} className="card-press" aria-label={`${c.title}, ${n} notes`}
                    style={{borderRadius:"var(--r-lg)", border:"none", background:c.bg, color:c.ink, padding:16, minHeight:172, minWidth:0, overflow:"hidden", cursor:"pointer", textAlign:"left", display:"flex", flexDirection:"column", gridColumn: shown.length===1 ? "1 / -1" : "auto"}}>
              <span style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <span aria-hidden="true" style={{width:42, height:42, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}}><Icon size={20} sw={1.8}/></span>
                <Ring value={Math.min(n,8)} max={8} size={40} stroke={2.5} label={n}/>
              </span>
              <span style={{flex:1}}/>
              <span style={{font:"800 16px var(--sans)", letterSpacing:"-.02em", lineHeight:1.15, display:"block", minWidth:0, width:"100%"}}>{c.title}</span>
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
        {(() => { const stale = notes.filter(n => !n.archived && !n.confirmedAt && (Date.now() - n.ts) / 86400000 > 90); if(!stale.length) return null; const first = stale[stale.length-1]; const c = CAT_BY_ID[first.catId]; return (
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
            {W.demo ? (
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Fiche envoyée à {sharePayload.name.split(" ")[0]}</span>
                <span className="meta" style={{display:"block", marginTop:4}}>il y a 2 jours · 6 rubriques · valable 5 jours</span>
              </span>
            ) : lastShare ? (
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Fiche {lastShare.name ? `pour ${lastShare.name.split(" ")[0]}` : "partagée"}</span>
                <span className="meta" style={{display:"block", marginTop:4}}>{lastShare.openCount ? `ouverte ${lastShare.openCount} fois` : "pas encore ouverte"} · {lastShare.included.length} rubrique{lastShare.included.length > 1 ? "s" : ""} · valable {Math.max(1, Math.ceil((lastShare.expiresAt - Date.now()) / 86400000))} j</span>
              </span>
            ) : (
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", font:"800 15.5px var(--sans)", letterSpacing:"-.015em"}}>Transmettre à un relais</span>
                <span className="meta" style={{display:"block", marginTop:4}}>Crée un lien sécurisé, rubrique par rubrique.</span>
              </span>
            )}
            <IconChevron size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

window.Aidant.AidantHome = AidantHomeV2;
})();
