// Aidant — all caregiver-side screens
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;
const {
  IconMic, IconBack, IconClose, IconSettings, IconShare,
  IconCheck, IconEdit, IconPlus, IconLock, IconChevron,
  IconLink, IconCopy, IconEye, IconSwap,
  IconSearch, IconBell, IconHomeT, IconCompass, IconCalendar, IconReply, IconQuestion, IconSparkle,
  JeanneIllustration, AnneIllustration
} = window.Icons;
const { CATEGORIES, CAT_BY_ID, EXAMPLE_PROMPTS, classify, softDate, MOODS, RITUALS, ENRICHMENT_PROMPTS, staleCandidates } = window.AppData;
const { StatusBar: SB_A, SearchBar, Avatar, timeGreeting, momentNow } = window.UI;

/* ─────────────────────────────────────────────────────────────
   1. AIDANT HOME — Dashboard
   ───────────────────────────────────────────────────────────── */
function AidantHome({notes, mood, setMood, onOpenCat, onOpenCapture, onTab, onOpenShare, onOpenNotifs, onOpenCare, sharePayload}){
  const counts = useMemoA(() => {
    const c = {};
    for(const n of notes) c[n.catId] = (c[n.catId]||0) + 1;
    return c;
  }, [notes]);
  const last = notes[0];
  const [search, setSearch] = useStateA("");

  const matches = useMemoA(() => {
    if(!search.trim()) return [];
    const q = search.toLowerCase();
    return notes.filter(n => n.text.toLowerCase().includes(q)).slice(0, 5);
  }, [search, notes]);

  return (
    <div className="screen fade-enter">
      <SB_A/>
      <div className="topbar">
        <div style={{display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1}}>
          <Avatar name="Anne C" size={40} tone="cool"/>
          <div style={{minWidth:0, flex:1}}>
            <p style={{fontSize:11, color:"var(--ink-3)", lineHeight:1.2, letterSpacing:".08em", textTransform:"uppercase", fontWeight:700, whiteSpace:"nowrap"}}>{timeGreeting()}</p>
            <p style={{fontFamily:"var(--display)", fontSize:18, color:"var(--ink)", letterSpacing:"-.015em", marginTop:2}}>Anne</p>
          </div>
        </div>
        <div style={{display:"flex", gap:8, flexShrink:0}}>
          <button className="iconbtn" aria-label="Notifications" onClick={onOpenNotifs} style={{position:"relative"}}>
            <IconBell size={20}/>
            <span aria-hidden="true" style={{position:"absolute", top:8, right:8, width:8, height:8, borderRadius:"50%", background:"var(--accent)", border:"2px solid var(--paper)"}}/>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* Search */}
        <div style={{padding:"6px 18px 0"}}>
          <SearchBar value={search} onChange={setSearch}/>
          {matches.length > 0 && (
            <div className="card slide-up" style={{marginTop:10, padding:12}}>
              <p className="label" style={{marginBottom:8}}>{matches.length} résultat{matches.length>1?"s":""}</p>
              <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:6}}>
                {matches.map(n => {
                  const cat = CAT_BY_ID[n.catId];
                  return (
                    <li key={n.id}>
                      <button onClick={() => onOpenCat(n.catId)} style={{
                        width:"100%", textAlign:"left", border:"none", background:"transparent",
                        cursor:"pointer", padding:"8px 10px", borderRadius:12,
                        display:"flex", gap:10, alignItems:"flex-start"
                      }}>
                        <span style={{width:8, height:8, marginTop:7, borderRadius:"50%", background:cat.bg, flexShrink:0}}/>
                        <span style={{flex:1}}>
                          <span style={{fontSize:14, color:"var(--ink)", display:"block", lineHeight:1.4}}>{n.text}</span>
                          <span className="meta">{cat.title} · {softDate(n.ts)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Hero — Jeanne card with check-in */}
        <div style={{padding:"16px 18px 0"}}>
          <div className="hero" style={{padding:"26px 22px 24px"}}>
            <p className="kicker" style={{display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap"}}>
              <span>Le carnet</span>
              <span style={{width:3, height:3, borderRadius:"50%", background:"currentColor", opacity:.4}}/>
              <span className="mono" style={{textTransform:"none", letterSpacing:".04em"}}>{notes.length}&nbsp;notes</span>
            </p>

            <button onClick={() => onTab("settings")}
                    aria-label="Voir le profil de Jeanne"
                    style={{display:"flex", gap:18, alignItems:"center", marginTop:14, width:"100%", background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left"}}>
              {/* Portrait with progress ring */}
              <div style={{position:"relative", flexShrink:0, width:104, height:104}}>
                <svg width="104" height="104" viewBox="0 0 104 104" className="ring" aria-hidden="true" style={{position:"absolute", inset:0}}>
                  <circle cx="52" cy="52" r="49" fill="none" stroke="rgba(40,20,8,.08)" strokeWidth="2"/>
                  <circle cx="52" cy="52" r="49" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
                          strokeDasharray={`${Math.min(notes.length, 30) * 308/30} 308`}/>
                </svg>
                <div className="float" style={{
                  position:"absolute", inset:6, borderRadius:"50%",
                  background:"var(--c-habitudes)",
                  overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center"
                }}>
                  <JeanneIllustration size={92}/>
                </div>
              </div>
              <div style={{minWidth:0, flex:1}}>
                <h1 className="display" style={{fontSize:42, lineHeight:1}}>Jeanne</h1>
                <p className="meta" style={{marginTop:8}}>Accompagnée depuis 2 ans</p>
                <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
                  <span className="mono" style={{padding:"3px 8px", borderRadius:6, background:"rgba(40,20,8,.06)", fontSize:10.5, color:"var(--ink-2)", whiteSpace:"nowrap"}}>86 ans</span>
                  <span className="mono" style={{padding:"3px 8px", borderRadius:6, background:"rgba(40,20,8,.06)", fontSize:10.5, color:"var(--ink-2)", whiteSpace:"nowrap"}}>+3 cette sem.</span>
                </div>
              </div>
            </button>

            <hr style={{border:"none", borderTop:"1px solid rgba(40,20,8,.08)", margin:"20px 0 18px"}}/>

            <p style={{fontFamily:"var(--display)", fontSize:18, color:"var(--ink)", letterSpacing:"-.01em"}}>
              Comment va Jeanne aujourd'hui&nbsp;?
            </p>
            <p className="meta" style={{marginTop:6, fontSize:12}}>Optionnel · c'est juste un repère doux pour toi.</p>
            <div role="radiogroup" aria-label="Humeur du jour" style={{
              marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8
            }}>
              {MOODS.map(m => {
                const on = mood === m.id;
                return (
                  <button key={m.id} role="radio" aria-checked={on}
                          onClick={() => setMood(on ? null : m.id)}
                          className="card-press"
                          style={{
                            border: "2px solid " + (on ? "var(--accent)" : "var(--line-2)"),
                            background: "var(--paper)",
                            color: "var(--ink)",
                            borderRadius:14, padding:"10px 12px",
                            display:"flex", alignItems:"center", gap:10,
                            cursor:"pointer", minHeight:48,
                            font:"500 14px var(--sans)", textAlign:"left",
                            boxShadow: on ? "0 0 0 4px " + m.tone + "40" : "none",
                            transition:"all .2s ease"
                          }}>
                    <span aria-hidden="true" style={{width:14, height:14, borderRadius:"50%", background:m.tone, border:"1px solid rgba(40,20,8,.15)"}}/>
                    {m.label}
                  </button>
                );
              })}
            </div>
            {mood && (() => {
              const m = MOODS.find(x => x.id === mood);
              const msg = {
                sereine:  "C'est précieux à noter. Profite de la journée — peut-être un peu de musique cet après-midi.",
                fatiguee: "Compris. On évite les sollicitations longues. Une sieste vers 14h peut aider, comme d'habitude.",
                fragile:  "Doucement alors. Tenir sa main, allumer la veilleuse, baisser la lumière — ce qui l'apaise d'habitude.",
                belle:    "Quelle joie. C'est le bon moment pour appeler Léo ou Claire si tu peux."
              }[mood];
              return (
                <div className="slide-up" style={{marginTop:12}}>
                  <div style={{
                    padding:"12px 14px",
                    background: m.tone + "33",
                    border: "1px solid " + m.tone,
                    borderRadius:14, display:"flex", gap:10, alignItems:"flex-start"
                  }}>
                    <span aria-hidden="true" style={{width:14, height:14, borderRadius:"50%", background:m.tone, border:"1px solid rgba(40,20,8,.15)", marginTop:3, flexShrink:0}}/>
                    <p style={{fontSize:14, color:"var(--ink)", lineHeight:1.5, flex:1}}>
                      <strong style={{fontWeight:600}}>{m.label}.</strong> {msg}
                    </p>
                  </div>
                  <button onClick={onOpenCapture}
                          className="card-press"
                          style={{
                            marginTop:10, width:"100%",
                            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                            padding:"12px 14px", borderRadius:14,
                            border:"1.5px dashed " + m.tone,
                            background:"var(--paper)",
                            color:"var(--ink)",
                            font:"600 14px var(--sans)",
                            cursor:"pointer", minHeight:48
                          }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="3" width="6" height="12" rx="3"/>
                      <path d="M5 11a7 7 0 0 0 14 0"/>
                      <path d="M12 18v3"/>
                      <path d="M8.5 21h7"/>
                    </svg>
                    <span>Écrire une note dans le carnet</span>
                  </button>
                  <p className="meta" style={{marginTop:6, fontSize:11.5, textAlign:"center"}}>
                    Garder une trace de ce moment — pour toi, et pour les proches.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Empty state — first time, no notes yet */}
        {notes.length === 0 && (
          <div style={{padding:"14px 18px 0"}}>
            <div className="card slide-up" style={{padding:"20px 20px", position:"relative", overflow:"hidden", background:"linear-gradient(135deg, rgba(242,210,182,.4), rgba(252,246,236,1))"}}>
              <span aria-hidden="true" style={{position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.4)"}}/>
              <div style={{position:"relative"}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span aria-hidden="true" style={{color:"var(--accent)", display:"inline-flex"}}>
                    <IconSparkle size={18} sw={1.8}/>
                  </span>
                  <span className="kicker">Commençons en douceur</span>
                </div>
                <p style={{marginTop:12, fontFamily:"var(--display)", fontSize:22, letterSpacing:"-.01em", lineHeight:1.2}}>
                  Ton carnet est tout neuf.
                </p>
                <p style={{marginTop:10, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
                  La première note est souvent la plus simple — une habitude, un détail, ce qui la fait sourire. Je range au bon endroit.
                </p>
                <button onClick={onOpenCapture}
                        style={{
                          marginTop:16, width:"100%", border:"none",
                          background:"var(--ink)", color:"var(--paper)",
                          borderRadius:14, padding:"14px 16px",
                          font:"600 15px var(--sans)",
                          cursor:"pointer", minHeight:48,
                          display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8
                        }}>
                  <IconMic size={18}/> Écrire ma première note
                </button>
                <p className="meta" style={{marginTop:10, fontSize:11.5, textAlign:"center"}}>
                  Tu peux parler ou écrire — comme tu préfères.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI surfaced note — tappable */}
        {last && (
          <div style={{padding:"14px 18px 0"}}>
            <div className="card slide-up" style={{padding:"16px 18px"}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span aria-hidden="true" className="spark" style={{width:18, height:18, color:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <IconSparkle size={16} sw={1.8}/>
                </span>
                <span className="kicker" style={{whiteSpace:"nowrap"}}>Surfacé pour toi</span>
              </div>
              <button onClick={() => onOpenCat(last.catId)}
                      style={{background:"none", border:"none", padding:0, marginTop:10, width:"100%", textAlign:"left", cursor:"pointer"}}
                      aria-label={`Ouvrir cette note dans ${CAT_BY_ID[last.catId].title}`}>
                <p style={{fontFamily:"var(--display)", fontSize:16, lineHeight:1.4, color:"var(--ink)"}}>
                  {last.text}
                </p>
                <div style={{display:"flex", alignItems:"center", gap:8, marginTop:10}}>
                  <span style={{width:6, height:6, borderRadius:"50%", background:CAT_BY_ID[last.catId].bg, border:"1px solid rgba(40,20,8,.1)"}} aria-hidden="true"/>
                  <span className="meta" style={{whiteSpace:"nowrap"}}>{CAT_BY_ID[last.catId].title} · {softDate(last.ts)}</span>
                </div>
              </button>
              <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
                <button className="chip" style={{fontSize:13}}>Garder</button>
                <button className="chip" style={{fontSize:13, marginLeft:"auto"}} onClick={() => onOpenCat(last.catId)}>Actualiser</button>
              </div>
            </div>
          </div>
        )}

        {/* AI: Ritual for current moment */}
        {(() => {
          const m = momentNow();
          const r = RITUALS.find(x => x.moment === m) || RITUALS[0];
          const cat = CAT_BY_ID[r.catId];
          const Icon = cat.Icon;
          const momentLabel = {matin:"ce matin", midi:"ce midi", aprem:"cet après-midi", soir:"ce soir"}[m] || "aujourd'hui";
          return (
            <div style={{padding:"14px 18px 0"}}>
              <button onClick={() => onOpenCat(r.catId)}
                      className="card-press"
                      style={{
                        width:"100%", textAlign:"left", border:"1px solid rgba(40,20,8,.06)",
                        background:cat.bg, color:cat.ink, borderRadius:24, padding:"18px 18px",
                        cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start"
                      }}>
                <span style={{width:40, height:40, borderRadius:13, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                  <Icon size={20} sw={1.6}/>
                </span>
                <span style={{flex:1, minWidth:0}}>
                  <span className="kicker" style={{color:"inherit", opacity:.75}}>Pour {momentLabel}</span>
                  <span style={{display:"block", marginTop:6, fontFamily:"var(--display)", fontSize:17, letterSpacing:"-.01em", lineHeight:1.3}}>{r.title}</span>
                  <span style={{display:"block", marginTop:6, fontSize:13.5, opacity:.85, lineHeight:1.45}}>{r.body}</span>
                </span>
              </button>
            </div>
          );
        })()}

        {/* AI: Stale alert — only if there are stale notes */}
        {(() => {
          const stale = staleCandidates(notes);
          if(stale.length === 0) return null;
          const s = stale[0];
          const cat = CAT_BY_ID[s.catId];
          return (
            <div style={{padding:"12px 18px 0"}}>
              <div className="card" style={{display:"flex", gap:12, alignItems:"flex-start", padding:14, borderColor:"rgba(40,20,8,.12)", background:"var(--paper)"}}>
                <span style={{width:32, height:32, borderRadius:10, background:"rgba(40,20,8,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                  <span style={{color:"var(--accent)", fontSize:14, fontFamily:"var(--display)"}}>↻</span>
                </span>
                <div style={{flex:1, minWidth:0}}>
                  <p className="kicker">À actualiser ?</p>
                  <p style={{marginTop:6, fontSize:14, color:"var(--ink)", lineHeight:1.45}}>
                    « {s.text.length > 80 ? s.text.slice(0, 80) + "…" : s.text} »
                  </p>
                  <p style={{marginTop:6, fontSize:12.5, color:"var(--ink-2)"}}>
                    Notée {softDate(s.ts)} · toujours d'actualité ?
                  </p>
                  <div style={{display:"flex", gap:8, marginTop:10}}>
                    <button className="chip" onClick={() => onOpenCat(s.catId)} style={{minHeight:36, fontSize:13}}>Revoir</button>
                    <button className="chip" style={{minHeight:36, fontSize:13, color:"var(--ink-2)"}}>C'est toujours juste</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* AI: Gentle enrichment prompt — angle mort détecté */}
        {(() => {
          const counts = {};
          for(const n of notes) counts[n.catId] = (counts[n.catId]||0) + 1;
          // surface a prompt for the category with fewest notes
          const empty = CATEGORIES.find(c => (counts[c.id] || 0) < 3);
          const prompt = ENRICHMENT_PROMPTS.find(p => p.catId === empty?.id) || ENRICHMENT_PROMPTS[0];
          const cat = CAT_BY_ID[prompt.catId];
          return (
            <div style={{padding:"12px 18px 0"}}>
              <div className="card" style={{padding:18, background:"var(--paper)"}}>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <span aria-hidden="true" style={{color:"var(--accent)", display:"inline-flex"}} className="spark">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/>
                    </svg>
                  </span>
                  <span className="kicker">Pour mieux la connaître</span>
                </div>
                <p style={{marginTop:12, fontFamily:"var(--display)", fontSize:17, lineHeight:1.35, color:"var(--ink)", letterSpacing:"-.01em"}}>
                  {prompt.question}
                </p>
                <div style={{display:"flex", gap:8, marginTop:14, flexWrap:"wrap"}}>
                  <button onClick={onOpenCapture}
                          style={{
                            background:"var(--ink)", color:"var(--paper)", border:"none",
                            borderRadius:999, padding:"10px 18px", minHeight:44,
                            font:"600 14px var(--sans)", cursor:"pointer",
                            display:"inline-flex", alignItems:"center", gap:8
                          }}>
                    <IconMic size={16}/> Y répondre
                  </button>
                  <button className="chip" style={{color:"var(--ink-2)"}}>Plus tard</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Horizontal rubriques quick access */}
        <div style={{paddingTop:22, paddingBottom:4}}>
          <div style={{padding:"0 22px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2 className="serif">Accès rapides</h2>
            <button onClick={() => onTab("carnet")} className="chip" style={{minHeight:36, padding:"6px 12px"}}>
              Tout voir <IconChevron size={14}/>
            </button>
          </div>
          <div className="h-scroll">
            {CATEGORIES.map(c => {
              const Icon = c.Icon;
              const n = counts[c.id] || 0;
              return (
                <button key={c.id} onClick={() => onOpenCat(c.id)}
                        style={{
                          width:154, padding:"16px 16px 14px",
                          borderRadius:22, border:"none", background:c.bg, color:c.ink,
                          cursor:"pointer", textAlign:"left",
                          display:"flex", flexDirection:"column", gap:12,
                          minHeight:140
                        }}
                        aria-label={`${c.title}, ${n} notes`}>
                  <span style={{width:36, height:36, borderRadius:11, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
                    <Icon size={20} sw={1.6}/>
                  </span>
                  <span style={{flex:1, fontFamily:"var(--display)", fontSize:16, fontWeight:500, lineHeight:1.2}}>{c.title}</span>
                  <span style={{fontSize:12, opacity:.75, fontWeight:600, letterSpacing:".04em"}}>{n} note{n>1?"s":""}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Last share + CTA */}
        <div style={{padding:"22px 22px 0"}}>
          <div className="card paper" style={{display:"flex", gap:14, alignItems:"flex-start"}}>
            <span style={{
              width:42, height:42, borderRadius:13, flexShrink:0,
              background:"var(--c-proches)", color:"var(--c-proches-ink)",
              display:"flex", alignItems:"center", justifyContent:"center"
            }} aria-hidden="true">
              <IconShare size={20} sw={1.7}/>
            </span>
            <div style={{flex:1, minWidth:0}}>
              <p className="label">Dernier partage</p>
              <p style={{marginTop:4, fontFamily:"var(--display)", fontSize:16, color:"var(--ink)"}}>
                Fiche envoyée à {sharePayload.name.split(" ")[0]}
              </p>
              <p className="meta" style={{marginTop:4}}>il y a 2 jours · 6 rubriques · valable encore 5 jours</p>
              <button onClick={() => onTab("transmettre")}
                      className="chip"
                      style={{marginTop:12}}>
                Préparer une nouvelle transmission <IconChevron size={14}/>
              </button>
            </div>
          </div>
        </div>

        {/* Caregiver care — discrete, optional */}
        <div style={{padding:"14px 22px 0"}}>
          <div className="card paper" style={{padding:16, display:"flex", gap:12, alignItems:"flex-start"}}>
            <span aria-hidden="true" style={{
              width:36, height:36, borderRadius:11, flexShrink:0,
              background:"var(--c-apaise)", color:"var(--c-apaise-ink)",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
              </svg>
            </span>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontFamily:"var(--display)", fontSize:16, color:"var(--ink)", letterSpacing:"-.01em"}}>
                Et toi, Anne&nbsp;? Comment vas-tu ?
              </p>
              <p style={{marginTop:6, fontSize:13.5, color:"var(--ink-2)", lineHeight:1.5}}>
                Prends une minute pour souffler quand tu veux. Ce moment compte aussi.
              </p>
              <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
                <button className="chip" style={{fontSize:13}} onClick={onOpenCare}>Quelques minutes pour moi</button>
                <button className="chip" style={{fontSize:13, color:"var(--ink-3)"}}>Plus tard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. AIDANT CARNET — 7 rubriques rich list
   ───────────────────────────────────────────────────────────── */
function AidantCarnet({notes, onOpenCat}){
  const counts = useMemoA(() => {
    const c = {};
    for(const n of notes) c[n.catId] = (c[n.catId]||0) + 1;
    return c;
  }, [notes]);
  const [search, setSearch] = useStateA("");
  const filtered = search.trim()
    ? CATEGORIES.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) ||
                              (notes.some(n => n.catId === c.id && n.text.toLowerCase().includes(search.toLowerCase()))))
    : CATEGORIES;

  return (
    <div className="screen fade-enter">
      <SB_A/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:26, marginLeft:4}}>Le carnet</h1>
        <button className="iconbtn" aria-label="Filtres"><IconCompass size={20}/></button>
      </div>

      <div className="scroll">
        <div style={{padding:"6px 18px 12px"}}>
          <SearchBar value={search} onChange={setSearch}/>
        </div>

        <ul style={{listStyle:"none", padding:"4px 18px 0", margin:0, display:"grid", gap:12}}>
          {filtered.map(c => {
            const Icon = c.Icon;
            const n = counts[c.id] || 0;
            // For each cat, surface its latest note as preview
            const recent = notes.filter(x => x.catId === c.id).sort((a,b) => b.ts - a.ts)[0];
            return (
              <li key={c.id}>
                <button onClick={() => onOpenCat(c.id)}
                        className="cat-tile"
                        style={{background:c.bg, color:c.ink, padding:"16px 16px", borderRadius:22, alignItems:"flex-start"}}
                        aria-label={`${c.title}, ${n} notes`}>
                  <span style={{width:46, height:46, borderRadius:14, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                    <Icon size={22} sw={1.6}/>
                  </span>
                  <span style={{flex:1, minWidth:0, textAlign:"left"}}>
                    <span style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:8}}>
                      <span style={{fontFamily:"var(--display)", fontSize:18, fontWeight:500}}>{c.title}</span>
                      <span style={{fontSize:12, opacity:.7, fontWeight:600}}>{n}</span>
                    </span>
                    {recent ? (
                      <span style={{display:"block", marginTop:8, fontSize:13.5, opacity:.85, lineHeight:1.45, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical"}}>
                        « {recent.text} »
                      </span>
                    ) : (
                      <span style={{display:"block", marginTop:8, fontSize:13.5, opacity:.7, fontStyle:"normal"}}>
                        Encore vide.
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{padding:"22px 22px 0"}}>
          <div className="card dashed">
            <p style={{fontFamily:"var(--display)", fontSize:16}}>Tu observes une nouvelle chose&nbsp;?</p>
            <p style={{marginTop:6, fontSize:14, color:"var(--ink-2)"}}>Le micro est là, en bas, en un geste.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. AIDANT CAPTURE — overlay
   ───────────────────────────────────────────────────────────── */
function AidantCapture({onClose, onSave}){
  const [phase, setPhase] = useStateA("idle");
  const [text, setText] = useStateA("");
  const [suggested, setSuggested] = useStateA(null);

  // Toggle the phone shell's live-activity island during listening
  useEffectA(() => {
    const phone = document.querySelector(".phone");
    if(!phone) return;
    if(phase === "listening" || phase === "thinking") phone.setAttribute("data-listening", "1");
    else phone.removeAttribute("data-listening");
    return () => phone.removeAttribute("data-listening");
  }, [phase]);

  function startListening(){ setPhase("listening"); setText(""); }
  function startWriting(){ setPhase("writing"); setText(""); }

  // Real LLM-backed classifier with graceful fallback to the keyword heuristic.
  async function pickCat(t){
    const fallback = () => classify(t)[0]?.cat || CAT_BY_ID["histoire"];
    try {
      if(!window.claude || typeof window.claude.complete !== "function") return fallback();
      const prompt = `Tu ranges des notes prises par une aidante familiale sur la personne qu'elle accompagne.
Voici les 7 rubriques possibles :
- histoire   : son parcours, ses racines, ses souvenirs anciens.
- habitudes  : son rythme du jour, ce qui ancre, ses petits rituels.
- apaise     : ce qui la calme, ce qui l'angoisse, les déclencheurs émotionnels.
- parler     : la façon de lui parler, le ton, les mots qui passent ou blessent.
- gouts      : ce qu'elle aime, musique, plats, plaisirs simples.
- sante      : points de vigilance au quotidien, médicaments, corps.
- proches    : les personnes qui comptent (famille, amis, voisins).

Note à ranger :
"""${t}"""

Réponds UNIQUEMENT avec l'identifiant exact d'une seule rubrique (histoire, habitudes, apaise, parler, gouts, sante, ou proches). Pas d'autre mot, pas de ponctuation.`;
      const raw = await window.claude.complete(prompt);
      const id = (raw || "").toLowerCase().replace(/[^a-z]/g, "").trim();
      const ok = ["histoire","habitudes","apaise","parler","gouts","sante","proches"];
      if(ok.includes(id)) return CAT_BY_ID[id];
      return fallback();
    } catch(_){
      return fallback();
    }
  }

  async function classifyAndReview(t){
    setPhase("thinking");
    const cat = await pickCat(t);
    setSuggested(cat);
    setPhase("review");
  }

  function submitWritten(){
    if(!text.trim()) return;
    classifyAndReview(text);
  }
  function pickExample(t){
    setPhase("listening"); setText("");
    let i = 0;
    const id = setInterval(() => {
      i += 2 + Math.floor(Math.random()*3);
      if(i >= t.length){
        clearInterval(id);
        setText(t);
        classifyAndReview(t);
      } else setText(t.slice(0, i));
    }, 55);
  }
  function stopListening(){
    if(!text.trim()){
      pickExample(EXAMPLE_PROMPTS[Math.floor(Math.random()*EXAMPLE_PROMPTS.length)]);
      return;
    }
    classifyAndReview(text);
  }
  function confirm(){
    if(!text.trim() || !suggested) return;
    onSave({text:text.trim(), catId:suggested.id});
  }

  return (
    <div className="screen fade-enter">
      <SB_A/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Fermer" onClick={onClose}><IconClose size={20}/></button>
        <span className="label">Nouvelle note</span>
        <span style={{width:44}} aria-hidden="true"></span>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        {phase === "idle" && (
          <>
            <h1 className="serif" style={{marginTop:6, fontSize:30}}>Je t'écoute.</h1>
            <p style={{marginTop:10, fontSize:16, color:"var(--ink-2)"}}>
              Parle de Jeanne — une habitude, un souvenir, une attention. Je rangerai dans la bonne rubrique.
            </p>

            <button onClick={startListening}
                    aria-label="Commencer à parler"
                    style={{
                      marginTop:24, width:"100%", border:"1px solid var(--line)",
                      background:"var(--paper)", borderRadius:28, padding:"30px 18px",
                      cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:16
                    }}>
              <div style={{
                width:88, height:88, borderRadius:"50%",
                background:"var(--accent)", color:"var(--paper)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 14px 30px -8px rgba(194,96,73,.55)"
              }}>
                <IconMic size={38}/>
              </div>
              <span style={{fontFamily:"var(--display)", fontSize:18}}>Appuyer pour parler</span>
            </button>

            <div style={{display:"flex", alignItems:"center", gap:10, margin:"18px 0 14px"}}>
              <span style={{flex:1, height:1, background:"var(--line)"}}/>
              <span className="meta" style={{fontSize:11.5}}>OU</span>
              <span style={{flex:1, height:1, background:"var(--line)"}}/>
            </div>

            <button onClick={startWriting}
                    aria-label="Écrire la note"
                    style={{
                      width:"100%", border:"1.5px solid var(--line)",
                      background:"var(--paper)", color:"var(--ink)",
                      borderRadius:18, padding:"14px 16px",
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                      font:"600 15px var(--sans)", minHeight:48
                    }}>
              <IconEdit size={18}/>
              <span>Écrire la note</span>
            </button>

            <p className="label" style={{marginTop:28}}>Ou choisis un exemple</p>
            <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:8}}>
              {EXAMPLE_PROMPTS.map((p, i) => (
                <li key={i}>
                  <button onClick={() => pickExample(p)}
                          style={{
                            width:"100%", textAlign:"left", padding:"14px 16px",
                            background:"var(--paper)", border:"1px solid var(--line)",
                            borderRadius:18, cursor:"pointer",
                            font:"italic 500 15px var(--display)", color:"var(--ink-2)", lineHeight:1.45
                          }}>
                    « {p} »
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {phase === "listening" && (
          <div style={{textAlign:"center", marginTop:18}}>
            {/* Live activity hint near the dynamic island */}
            <p className="mono" style={{fontSize:10, color:"#FCF6EC", letterSpacing:".18em", fontWeight:600,
               background:"#0c0f14", display:"inline-block", padding:"4px 12px", borderRadius:8}}>
              ● ÉCOUTE EN COURS
            </p>
            <div className="wave" role="status" aria-label="Enregistrement en cours" style={{margin:"22px auto 18px"}}>
              {Array.from({length:10}).map((_,i) => <span key={i}/>)}
            </div>
            <p className="label">J'écoute…</p>

            <div className="card paper" style={{marginTop:24, textAlign:"left", minHeight:120}}>
              <p style={{fontFamily:"var(--display)", fontStyle:"normal", fontSize:18, lineHeight:1.5, minHeight:54}}>
                {text || <span style={{color:"var(--ink-3)"}}>La transcription apparaît ici…</span>}
                {text && <span style={{display:"inline-block", width:8, height:20, background:"var(--accent)", marginLeft:2, verticalAlign:"-3px", animation:"w 1s steps(2) infinite"}}/>}
              </p>
            </div>

            <button className="btn" style={{marginTop:24, width:"100%"}} onClick={stopListening}>
              <IconCheck size={20}/> J'ai fini
            </button>
            <button className="btn ghost" style={{marginTop:10, width:"100%"}} onClick={onClose}>
              Annuler
            </button>
          </div>
        )}

        {phase === "thinking" && (
          <div style={{textAlign:"center", marginTop:48}}>
            <div style={{position:"relative", width:120, height:120, margin:"0 auto"}}>
              <span aria-hidden="true" className="spark" style={{
                position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--accent)"
              }}>
                <IconSparkle size={80} sw={1.4}/>
              </span>
              <span aria-hidden="true" style={{
                position:"absolute", inset:-12, borderRadius:"50%",
                border:"1px solid rgba(194,96,73,.25)", animation:"pulse 1.6s ease-out infinite"
              }}/>
            </div>
            <p className="kicker" style={{marginTop:20, color:"var(--accent)"}}>L'IA range…</p>
            <p style={{marginTop:10, fontFamily:"var(--display)", fontSize:20, color:"var(--ink)", letterSpacing:"-.01em"}}>
              Je trouve la bonne rubrique.
            </p>
            <p className="mono" style={{marginTop:14, fontSize:11, color:"var(--ink-3)", letterSpacing:".1em"}}>
              ANALYSE EN COURS • {text.length} CARACTÈRES
            </p>
          </div>
        )}

        {phase === "writing" && (
          <>
            <h1 className="serif" style={{marginTop:6, fontSize:28}}>Écris ce que tu veux noter.</h1>
            <p style={{marginTop:8, fontSize:14.5, color:"var(--ink-2)"}}>
              Une phrase ou deux suffisent — je rangerai dans la bonne rubrique.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Ex. Elle aime quand on lui lit le journal le matin."
              style={{
                marginTop:18, width:"100%", minHeight:160,
                resize:"vertical",
                padding:"14px 16px",
                border:"1.5px solid var(--line)",
                borderRadius:18,
                background:"var(--paper)",
                color:"var(--ink)",
                font:"500 16px var(--display)",
                lineHeight:1.5,
                outline:"none"
              }}
            />
            <p className="meta" style={{marginTop:8, fontSize:11.5, textAlign:"right"}}>
              {text.trim().length} caractère{text.trim().length>1?"s":""}
            </p>

            <button onClick={submitWritten}
                    disabled={!text.trim()}
                    className="btn"
                    style={{
                      marginTop:14, width:"100%",
                      background: text.trim() ? "var(--ink)" : "var(--line-2)",
                      color:"var(--paper)", border:"none", borderRadius:14,
                      padding:"14px 18px", font:"600 15px var(--sans)",
                      cursor: text.trim() ? "pointer" : "not-allowed",
                      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, minHeight:48
                    }}>
              <IconCheck size={18}/> Continuer
            </button>
            <button onClick={startListening} className="btn ghost" style={{marginTop:10, width:"100%"}}>
              <IconMic size={18}/> Plutôt parler
            </button>
          </>
        )}

        {phase === "review" && suggested && (
          <CaptureReview text={text} setText={setText} suggested={suggested} setSuggested={setSuggested} onConfirm={confirm} onRecord={startListening}/>
        )}
      </div>
    </div>
  );
}

function CaptureReview({text, setText, suggested, setSuggested, onConfirm, onRecord}){
  const [picking, setPicking] = useStateA(false);
  const [editingText, setEditingText] = useStateA(false);
  const SIcon = suggested.Icon;
  const others = useMemoA(() => {
    const all = classify(text).map(s => s.cat.id);
    return CATEGORIES.filter(c => c.id !== suggested.id)
      .sort((a,b) => all.indexOf(a.id) - all.indexOf(b.id));
  }, [text, suggested]);

  return (
    <>
      <h2 className="serif" style={{marginTop:6, fontSize:24}}>Voilà ce que j'ai entendu.</h2>

      {!editingText ? (
        <div className="card paper" style={{marginTop:14}}>
          <p style={{fontFamily:"var(--display)", fontSize:18, fontStyle:"normal", lineHeight:1.5}}>« {text} »</p>
          <button className="chip" style={{marginTop:14}} onClick={() => setEditingText(true)}>
            <IconEdit size={16}/> Corriger le texte
          </button>
        </div>
      ) : (
        <div style={{marginTop:14}}>
          <textarea ref={el => el && el.focus()} rows={5} value={text} onChange={e => setText(e.target.value)} aria-label="Texte de la note"/>
          <button className="chip" style={{marginTop:10}} onClick={() => setEditingText(false)}>
            <IconCheck size={16}/> Garder ce texte
          </button>
        </div>
      )}

      <p className="label" style={{marginTop:24}}>Je range dans</p>
      <div style={{display:"flex", alignItems:"center", gap:14, marginTop:10, padding:"14px", background:suggested.bg, color:suggested.ink, borderRadius:20}}>
        <span style={{width:44, height:44, borderRadius:14, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
          <SIcon size={22} sw={1.6}/>
        </span>
        <span style={{flex:1, minWidth:0}}>
          <span style={{display:"block", fontFamily:"var(--display)", fontSize:17, fontWeight:500}}>{suggested.title}</span>
          <span style={{fontSize:13, opacity:.75}}>{suggested.blurb}</span>
        </span>
        <button className="chip" onClick={() => setPicking(v => !v)} aria-expanded={picking}>Changer</button>
      </div>

      {picking && (
        <div style={{marginTop:12, display:"flex", flexWrap:"wrap", gap:8}}>
          {others.map(c => (
            <button key={c.id} className="chip" onClick={() => { setSuggested(c); setPicking(false); }}>
              <c.Icon size={16} sw={1.6}/> {c.title}
            </button>
          ))}
        </div>
      )}

      <button className="btn primary" style={{marginTop:24, width:"100%"}} onClick={onConfirm} disabled={!text.trim()}>
        <IconCheck size={20}/> Enregistrer dans le carnet
      </button>
      <button className="btn ghost" style={{marginTop:10, width:"100%"}} onClick={onRecord}>
        <IconMic size={18}/> Refaire
      </button>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. AIDANT CATEGORY VIEW
   ───────────────────────────────────────────────────────────── */
function AidantCategory({catId, notes, onBack, onOpenCapture, onEdit, onDelete}){
  const cat = CAT_BY_ID[catId];
  const Icon = cat.Icon;
  const list = notes.filter(n => n.catId === catId).sort((a,b) => b.ts - a.ts);
  const [editingId, setEditingId] = useStateA(null);
  const [draft, setDraft] = useStateA("");

  return (
    <div className="screen fade-enter">
      <SB_A/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>
        <span className="label">{list.length} note{list.length>1?"s":""}</span>
        <button className="iconbtn" aria-label="Ajouter une note" onClick={onOpenCapture}><IconPlus size={20}/></button>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <div style={{
          background:cat.bg, color:cat.ink, borderRadius:24, padding:"22px 20px",
          marginTop:6, position:"relative", overflow:"hidden"
        }}>
          <span aria-hidden="true" style={{position:"absolute", top:-30, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.35)"}}/>
          <span style={{width:48, height:48, borderRadius:15, background:"rgba(255,255,255,.55)", display:"inline-flex", alignItems:"center", justifyContent:"center", position:"relative"}} aria-hidden="true">
            <Icon size={24} sw={1.6}/>
          </span>
          <h1 className="serif" style={{fontSize:28, marginTop:14, position:"relative", color:"inherit"}}>{cat.title}</h1>
          <p style={{marginTop:6, fontSize:14, opacity:.85, position:"relative"}}>{cat.blurb}</p>
        </div>

        <ul style={{listStyle:"none", padding:0, margin:"20px 0 0", display:"grid", gap:10}}>
          {list.length === 0 && (
            <li>
              <div className="card dashed" style={{textAlign:"center", padding:"28px 22px"}}>
                <p style={{fontFamily:"var(--display)", fontSize:18, color:"var(--ink)"}}>Encore vide.</p>
                <p style={{marginTop:10, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55, maxWidth:280, marginInline:"auto"}}>
                  Tu pourras enrichir ça au fil du temps — dès qu'un détail te vient à l'esprit.
                </p>
                <button className="btn soft" style={{marginTop:18}} onClick={onOpenCapture}>
                  <IconMic size={18}/> Ajouter une note
                </button>
              </div>
            </li>
          )}
          {list.map(n => (
            <li key={n.id}>
              {editingId === n.id ? (
                <div className="note">
                  <textarea rows={4} value={draft} onChange={e => setDraft(e.target.value)} autoFocus aria-label="Modifier la note"/>
                  <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
                    <button className="chip" onClick={() => { onEdit(editingId, draft.trim()); setEditingId(null); }}>
                      <IconCheck size={16}/> Enregistrer
                    </button>
                    <button className="chip" onClick={() => setEditingId(null)}>Annuler</button>
                    <button className="chip" style={{marginLeft:"auto", color:"var(--accent)"}} onClick={() => { onDelete(n.id); setEditingId(null); }}>Supprimer</button>
                  </div>
                </div>
              ) : (
                <div className="note">
                  <p style={{fontSize:16, lineHeight:1.5}}>{n.text}</p>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
                    <span className="when">noté {softDate(n.ts)}</span>
                    <button className="chip" style={{minHeight:36, padding:"6px 12px", fontSize:13}} onClick={() => { setEditingId(n.id); setDraft(n.text); }}>
                      <IconEdit size={14}/> Modifier
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

window.Aidant = { AidantHome, AidantCarnet, AidantCapture, AidantCategory };
