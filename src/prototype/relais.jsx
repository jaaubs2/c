// Relais — proche / nouvel intervenant experience
const { useState: useSR, useMemo: useMR, useRef: useRefR } = React;
const {
  IconBack: IconBackR, IconCheck: IconCheckR, IconChevron: IconChevronR,
  IconSearch: IconSearchR, IconClose: IconCloseR, IconSparkle: IconSparkleR,
  IconReply: IconReplyR, IconQuestion: IconQuestionR, IconEye: IconEyeR,
  IconCalendar: IconCalendarR, IconLock: IconLockR,
  JeanneIllustration: JIR, AnneIllustration: AIR
} = window.Icons;
const { CATEGORIES: CATS_R, CAT_BY_ID: CBR, softDate: softDateR, TOP_THREE, TIPS_BY_MOMENT, RELAIS_CARNETS: RELAIS_CARNETS_R } = window.AppData;
const { StatusBar: SBR, SearchBar: SearchBarR, Avatar: AvatarR, momentNow } = window.UI;

/* ─────────────────────────────────────────────────────────────
   0. Welcome (onboarding for the relais)
   ───────────────────────────────────────────────────────────── */
function RelaisWelcome({payload, onEnter}){
  const [step, setStep] = useSR(0);
  const name = ((payload?.name ?? "Claire") || "").split(" ")[0];
  const from = payload?.fromName || "Anne";
  const personName = payload?.profile?.name || "Jeanne";
  const personFirst = personName.split(" ")[0];
  const personRelation = payload?.profile?.relation ?? "sa mère";
  const isJeanneRW = window.Who.demo && personFirst === "Jeanne";
  const relationShort = personRelation.replace(/\s*\(.*\)\s*/, "").trim().replace(/^ma\s/i, "sa ").replace(/^mon\s/i, "son ");
  const Sparks = () => <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round"><path d="M196 30v18M187 39h18"/><path d="M336 176v12M330 182h12"/><path d="M52 236v12M46 242h12"/></g>;
  const Medallion = ({children, bg}) => (
    <div style={{position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:128, height:128, borderRadius:"50%", background:bg, border:"6px solid var(--bg)", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", boxShadow:"0 18px 40px -16px rgba(0,0,0,.35)"}}>{children}</div>
  );
  const slides = [
    { kicker:"Un carnet partagé", title: name ? `Bonjour ${name}.` : "Bonjour.",
      lede:`${from} te partage le carnet de ${personName}${relationShort ? ", " + relationShort : ""}, pour t'aider à passer un beau moment avec ${window.Who.demo ? (isJeanneRW ? "elle" : "lui") : window.Who.g("elle", "lui")}.`,
      art: (<>
        <svg viewBox="0 0 380 300" width="100%" aria-hidden="true" style={{display:"block"}}>
          <path d="M40 120c10-50 70-80 120-60 40 16 46 60 30 96-14 34-48 54-88 50-44-4-70-42-62-86z" fill="var(--c-habitudes)"/>
          <path d="M230 40c50-24 108-4 118 40 8 36-20 62-58 72-32 8-44 40-84 36-38-4-62-38-52-72 10-36 40-54 76-76z" fill="var(--ink)"/>
          <path d="M120 210c28-16 70-14 96 10 22 20 14 50-10 66-28 18-70 14-92-10-20-22-14-50 6-66z" fill="var(--c-parler)"/>
          <circle cx="292" cy="94" r="24" fill="#fff" fillOpacity=".92"/><Sparks/>
        </svg>
        <Medallion bg={isJeanneRW ? "var(--c-habitudes)" : "var(--c-parler)"}>
          {isJeanneRW ? <JIR size={120}/> : <window.Persona name={personName} size={120} bg="transparent" style={!window.Who.demo && window.Who.pronoun === "il" ? "short" : undefined}/>}
        </Medallion>
      </>) },
    { kicker:"Ce que c'est", title:"Pas un dossier.\nUn carnet humain.",
      lede:"Ses habitudes, ce qui l'apaise, comment lui parler, ses goûts. Le savoir qui ne se trouve nulle part ailleurs.",
      art: (<>
        <svg viewBox="0 0 380 300" width="100%" aria-hidden="true" style={{display:"block"}}>
          <path d="M62 60c40-38 108-30 128 10 14 28-6 52-38 66-30 14-36 44-72 48-36 4-72-24-70-58 2-32 24-42 52-66z" fill="var(--c-apaise)"/>
          <path d="M250 100c50-24 108-4 118 40 8 36-20 62-58 72-32 8-44 40-84 36-38-4-62-38-52-72 10-36 40-54 76-76z" fill="var(--ink)"/>
          <path d="M150 200c28-16 62-10 74 14 10 20-4 40-28 50-26 10-58 2-66-22-6-18 4-32 20-42z" fill="var(--c-histoire)"/>
          <circle cx="110" cy="104" r="24" fill="#fff" fillOpacity=".92"/><Sparks/>
        </svg>
        <Medallion bg="var(--c-apaise)">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--ink)" style={{alignSelf:"center"}}><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/></svg>
        </Medallion>
      </>) },
    { kicker:"Tout est là", title:"À ton rythme,\nquand tu en as besoin.",
      lede:`Découvre ${personFirst}. Garde le carnet sous la main. Et laisse un mot à ${from} si tu veux.`,
      art: (<>
        <svg viewBox="0 0 380 300" width="100%" aria-hidden="true" style={{display:"block"}}>
          <path d="M40 120c10-50 70-80 120-60 40 16 46 60 30 96-14 34-48 54-88 50-44-4-70-42-62-86z" fill="var(--ink)"/>
          <path d="M230 40c50-24 108-4 118 40 8 36-20 62-58 72-32 8-44 40-84 36-38-4-62-38-52-72 10-36 40-54 76-76z" fill="var(--c-gouts)"/>
          <path d="M120 210c28-16 70-14 96 10 22 20 14 50-10 66-28 18-70 14-92-10-20-22-14-50 6-66z" fill="var(--c-sante)"/>
          <circle cx="100" cy="120" r="22" fill="#fff" fillOpacity=".92"/><Sparks/>
        </svg>
        <Medallion bg="var(--c-gouts)">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--ink)" style={{alignSelf:"center"}}><path d="M12 2.5l2.6 6 6.4.6-4.8 4.3 1.5 6.3L12 16.4 6.3 19.7l1.5-6.3L3 9.1l6.4-.6z"/></svg>
        </Medallion>
      </>) }
  ];
  const s = slides[step];
  const last = step === slides.length - 1;
  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar" style={{justifyContent:"space-between"}}>
        <div style={{display:"flex", gap:6, alignItems:"center", paddingLeft:4}}>
          {slides.map((_, i) => <span key={i} aria-hidden="true" style={{height:6, borderRadius:3, width: i === step ? 24 : 6, background: i === step ? "var(--ink)" : "rgba(0,0,0,.18)", transition:"width .3s ease"}}/>)}
        </div>
        {!last && <button onClick={onEnter} style={{border:"none", background:"transparent", font:"700 14px var(--sans)", color:"var(--ink-2)", cursor:"pointer", minHeight:36, padding:"0 6px"}}>Passer</button>}
      </div>
      <div className="scroll" style={{padding:"0 24px 24px", display:"flex", flexDirection:"column"}}>
        <div key={step} className="fade-enter" style={{margin:"0 -8px", position:"relative"}}>{s.art}</div>
        <div style={{flex:1}}/>
        <div key={"t"+step} className="fade-enter" style={{textAlign:"center", marginTop:8}}>
          <p className="kicker">{s.kicker}</p>
          <h1 style={{marginTop:10, fontSize:30, whiteSpace:"pre-line", letterSpacing:"-.035em", lineHeight:1.08}}>{s.title}</h1>
          <p className="meta" style={{marginTop:12, fontSize:15, lineHeight:1.5, maxWidth:320, marginInline:"auto"}}>{s.lede}</p>
        </div>
        <button className="btn" style={{marginTop:26, width:"100%", minHeight:56, fontSize:16}} onClick={last ? onEnter : () => setStep(step + 1)}>
          {last ? "Entrer dans le carnet" : "Continuer"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   0a. Carnet picker — first screen for multi-carnet relais
   ───────────────────────────────────────────────────────────── */
function RelaisCarnetPicker({onPick, name="Claire"}){
  const carnets = RELAIS_CARNETS_R || [];
  const first = name.split(" ")[0];
  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar" style={{justifyContent:"center"}}>
        <span className="mono" style={{whiteSpace:"nowrap", fontSize:11, padding:"5px 10px", borderRadius:8, background:"rgba(0,0,0,.06)", color:"var(--ink-2)", letterSpacing:".08em"}}>
          TES CARNETS
        </span>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <p className="kicker" style={{marginTop:8}}>Bonjour {first}</p>
        <h1 className="serif" style={{fontSize:32, marginTop:10, letterSpacing:"-.02em", lineHeight:1.1}}>
          Quel carnet veux-tu ouvrir&nbsp;?
        </h1>
        <p style={{marginTop:12, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.55}}>
          {carnets.length} personne{carnets.length>1?"s":""} te {carnets.length>1?"sont":"est"} confié{carnets.length>1?"es":"e"} — chaque carnet est privé et appartient à sa famille.
        </p>

        <ul style={{listStyle:"none", padding:0, margin:"24px 0 0", display:"grid", gap:12}}>
          {carnets.map(c => {
            const cFirst = c.profile.name.split(" ")[0];
            const isJeanne = c.id === "jeanne";
            const isUrgent = c.expiresIn <= 2;
            return (
              <li key={c.id}>
                <button onClick={() => onPick(c.id)}
                        aria-label={`Ouvrir le carnet de ${c.profile.name}`}
                        className="card-press"
                        style={{
                          width:"100%", textAlign:"left",
                          padding:"18px 18px",
                          borderRadius:22,
                          border:"none",
                          background: isJeanne
                            ? "var(--c-habitudes)"
                            : "var(--c-parler)",
                          cursor:"pointer",
                          display:"flex", gap:14, alignItems:"center",
                          minHeight:96,
                          boxShadow:"0 8px 22px -10px rgba(0,0,0,.25)"
                        }}>
                  <div style={{
                    width:72, height:72, borderRadius:20,
                    background: isJeanne ? "var(--c-habitudes)" : "var(--c-parler)",
                    overflow:"hidden", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center"
                  }}>
                    {isJeanne
                      ? <JIR size={72}/>
                      : <window.Persona name={c.profile.name} size={72} bg="transparent"/>
                    }
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <p className="label" style={{fontSize:10.5}}>Carnet de</p>
                    <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:22, letterSpacing:"-.01em", marginTop:2}}>{c.profile.name}</p>
                    <p className="meta" style={{marginTop:4, fontSize:12.5}}>
                      {c.profile.age} ans · partagé par {c.sharedBy}
                    </p>
                    <div style={{display:"flex", gap:6, marginTop:8, flexWrap:"wrap"}}>
                      <span className="mono" style={{whiteSpace:"nowrap", fontSize:10, padding:"3px 8px", borderRadius:6, background:"rgba(0,0,0,.06)", color:"var(--ink-2)", letterSpacing:".06em"}}>
                        {(c.notes || []).length || "—"} note{((c.notes || []).length>1)?"s":""}
                      </span>
                      {isUrgent && (
                        <span className="mono" style={{fontSize:10, padding:"3px 8px", borderRadius:6, background:"var(--ink)", color:"#fff", letterSpacing:".06em", whiteSpace:"nowrap"}}>
                          EXPIRE BIENTÔT
                        </span>
                      )}
                    </div>
                  </div>
                  <span aria-hidden="true" style={{flexShrink:0, opacity:.5}}>
                    <IconChevronR size={16} style={{transform:"rotate(180deg)"}}/>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="meta" style={{marginTop:18, fontSize:11.5, textAlign:"center", lineHeight:1.5}}>
          Tu pourras changer à tout moment depuis l'accueil ou les réglages.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. Relais Home — dashboard with 3 essentials
   ───────────────────────────────────────────────────────────── */
function RelaisHome({notes, payload, onOpenCat, onTab, currentCarnetId, onSwitchCarnet, onOpenJournal}){
  const includedSet = new Set(payload.included);
  const visibleCats = CATS_R.filter(c => includedSet.has(c.id));
  const from = payload.fromName || "Anne";
  const personName = payload.profile?.name || "Jeanne";
  const personFirst = personName.split(" ")[0];
  const personAge = payload.profile?.age || 86;
  const isJeanneRH = window.Who.demo && personFirst === "Jeanne";
  const [switcherOpen, setSwitcherOpen] = useSR(false);
  const carnets = window.Who.demo ? (RELAIS_CARNETS_R || []) : [];
  const essentials = window.Who.demo ? TOP_THREE : window.Live.topThree(notes);
  const hasMultiple = carnets.length > 1;

  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar">
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <AvatarR name={payload.name || "Toi"} size={40} tone="sage"/>
          <div>
            <p style={{fontSize:13, color:"var(--ink-3)", lineHeight:1.2}}>Bonjour</p>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{(payload.name || "").split(" ")[0] || "et bienvenue"}</p>
          </div>
        </div>
        <button className="iconbtn" aria-label="Confidentialité"><IconLockR size={18}/></button>
      </div>

      <div className="scroll">
        {/* Person hero */}
        <div style={{padding:"6px 18px 0"}}>
          <div className="hero" style={{padding:"22px 20px", position:"relative"}}>
            <button
              onClick={() => hasMultiple && setSwitcherOpen(v => !v)}
              aria-expanded={switcherOpen}
              aria-label={hasMultiple ? `Changer de carnet — actuel : ${personFirst}` : `Carnet de ${personFirst}`}
              disabled={!hasMultiple}
              style={{
                all:"unset", display:"flex", gap:14, alignItems:"center", width:"100%",
                cursor: hasMultiple ? "pointer" : "default",
                borderRadius:14
              }}>
              <div style={{width:74, height:74, borderRadius:20, background: isJeanneRH ? "var(--c-habitudes)" : "var(--c-parler)", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                {isJeanneRH
                  ? <JIR size={74}/>
                  : <window.Persona name={personName} size={74} bg="transparent" style={!window.Who.demo && window.Who.pronoun === "il" ? "short" : undefined}/>
                }
              </div>
              <div style={{flex:1, minWidth:0}}>
                <p className="label" style={{fontSize:11}}>Tu accompagnes</p>
                <span style={{display:"flex", alignItems:"center", gap:8}}>
                  <h1 className="serif" style={{fontSize:28, marginTop:2}}>{personFirst}</h1>
                  {hasMultiple && (
                    <span aria-hidden="true" style={{
                      display:"inline-flex", alignItems:"center", justifyContent:"center",
                      width:26, height:26, borderRadius:"50%",
                      background:"rgba(0,0,0,.06)",
                      transform: switcherOpen ? "rotate(180deg)" : "none",
                      transition:"transform .2s ease"
                    }}>
                      <IconChevronR size={14}/>
                    </span>
                  )}
                </span>
                <p className="meta" style={{marginTop:2}}>{personAge} ans · partagé par {from}</p>
              </div>
            </button>

            {switcherOpen && hasMultiple && (
              <div className="slide-up" style={{
                marginTop:14, padding:8, borderRadius:16,
                background:"rgba(255,255,255,.7)",
                border:"none"
              }}>
                <p className="meta" style={{fontSize:11, padding:"4px 8px 6px"}}>Tes carnets ({carnets.length})</p>
                <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:4}}>
                  {carnets.map(c => {
                    const active = c.id === currentCarnetId;
                    const cFirst = c.profile.name.split(" ")[0];
                    const cIsJeanne = c.id === "jeanne";
                    return (
                      <li key={c.id}>
                        <button
                          onClick={() => { setSwitcherOpen(false); if(!active) onSwitchCarnet && onSwitchCarnet(c.id); }}
                          aria-pressed={active}
                          className="card-press"
                          style={{
                            width:"100%", display:"flex", alignItems:"center", gap:12,
                            padding:"10px 10px", borderRadius:12,
                            border:"none",
                            background: active ? "rgba(0,0,0,.06)" : "transparent",
                            cursor:"pointer", textAlign:"left", minHeight:48,
                            font:"500 14px var(--sans)", color:"var(--ink)"
                          }}>
                          <span style={{
                            width:36, height:36, borderRadius:10, flexShrink:0,
                            background: cIsJeanne ? "var(--c-habitudes)" : "var(--c-parler)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            overflow:"hidden"
                          }}>
                            {cIsJeanne
                              ? <JIR size={36}/>
                              : <window.Persona name={c.profile.name} size={36} bg="transparent"/>
                            }
                          </span>
                          <span style={{flex:1, minWidth:0}}>
                            <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, letterSpacing:"-.01em"}}>{c.profile.name}</span>
                            <span style={{display:"block", marginTop:2, fontSize:11.5, color:"var(--ink-2)"}}>
                              {c.profile.age} ans · partagé par {c.sharedBy}
                            </span>
                          </span>
                          {active && <IconCheckR size={18}/>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <p style={{marginTop:16, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontStyle:"normal", fontSize:15, color:"var(--ink-2)", lineHeight:1.5}}>
              « Le reste, {window.Who.g("elle", "il")} te le dira à sa façon. »
            </p>
          </div>
        </div>

        {/* 3 essentials */}
        {onOpenJournal && <div style={{padding:"14px 18px 0"}}><window.FamilyJournalCard onOpen={onOpenJournal} who={personFirst}/></div>}
        <div style={{padding:"22px 22px 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2 className="serif">3 choses à savoir</h2>
            <span className="chip" style={{minHeight:30, padding:"4px 10px", fontSize:11, background:"var(--paper)"}}>
              <IconSparkleR size={12}/> Tout de suite
            </span>
          </div>
          <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:10}}>
            {essentials.length === 0 && <li className="card" style={{padding:16}}><p className="meta">Aucun repère partagé pour l'instant.</p></li>}
            {essentials.map((t, i) => {
              const cat = CBR[t.catId];
              return (
                <li key={i}>
                  <button onClick={() => onOpenCat(t.catId)}
                          style={{
                            width:"100%", textAlign:"left", border:"none", cursor:"pointer",
                            background:cat.bg, color:cat.ink, borderRadius:20, padding:"14px 16px",
                            display:"flex", gap:12, alignItems:"flex-start"
                          }}>
                    <span style={{
                      width:30, height:30, borderRadius:"50%", background:"var(--ink)", color:"#fff",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--display)", fontSize:14, fontWeight:600, flexShrink:0
                    }} aria-hidden="true">{i+1}</span>
                    <span style={{flex:1, minWidth:0}}>
                      <span style={{display:"block", fontFamily:"var(--display)", fontSize:17, fontWeight:500}}>{t.title}</span>
                      <span style={{display:"block", marginTop:6, fontSize:13.5, opacity:.85, lineHeight:1.45}}>{t.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Today shortcut */}
        <div style={{padding:"22px 22px 0"}}>
          <button onClick={() => onTab("today")}
                  style={{
                    width:"100%", textAlign:"left", cursor:"pointer",
                    background:"var(--ink)", color:"var(--paper)", border:"none",
                    borderRadius:24, padding:"20px",
                    display:"flex", gap:14, alignItems:"center"
                  }}>
            <span style={{width:42, height:42, borderRadius:13, background:"rgba(252,246,236,.15)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
              <IconCalendarR size={20}/>
            </span>
            <span style={{flex:1, minWidth:0}}>
              <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>Aujourd'hui</span>
              <span style={{display:"block", marginTop:4, fontSize:13.5, opacity:.75}}>Les conseils du moment, à portée de main.</span>
            </span>
            <IconChevronR size={20}/>
          </button>
        </div>

        {/* Discover rubriques */}
        <div style={{padding:"22px 22px 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2 className="serif">Découvrir</h2>
            <button onClick={() => onTab("discover")} className="chip" style={{minHeight:32, padding:"6px 12px", fontSize:12}}>
              Tout voir <IconChevronR size={12}/>
            </button>
          </div>
          <p style={{marginTop:6, fontSize:13, color:"var(--ink-3)"}}>
            {visibleCats.length} rubrique{visibleCats.length>1?"s":""} partagée{visibleCats.length>1?"s":""} par {from}.
          </p>
          <div style={{marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            {visibleCats.slice(0, 4).map(c => {
              const Icon = c.Icon;
              const n = notes.filter(x => x.catId === c.id).length;
              return (
                <button key={c.id} onClick={() => onOpenCat(c.id)}
                        style={{
                          background:c.bg, color:c.ink, border:"none", cursor:"pointer",
                          borderRadius:20, padding:"14px 14px 12px",
                          display:"flex", flexDirection:"column", gap:10, textAlign:"left",
                          minHeight:124
                        }}>
                  <span style={{width:34, height:34, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
                    <Icon size={18} sw={1.6}/>
                  </span>
                  <span style={{flex:1, fontFamily:"var(--display)", fontSize:15, fontWeight:500, lineHeight:1.2}}>{c.title}</span>
                  <span style={{fontSize:11, opacity:.75, fontWeight:600}}>{n} note{n>1?"s":""}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. Relais Discover — rubriques (read-only)
   ───────────────────────────────────────────────────────────── */
function RelaisDiscover({notes, payload, onOpenCat}){
  const includedSet = new Set(payload.included);
  const visibleCats = CATS_R.filter(c => includedSet.has(c.id));
  const personFirst = (payload.profile?.name || "Jeanne").split(" ")[0];
  const [search, setSearch] = useSR("");

  const matches = useMR(() => {
    if(!search.trim()) return [];
    const q = search.toLowerCase();
    return notes.filter(n => includedSet.has(n.catId) && n.text.toLowerCase().includes(q)).slice(0, 8);
  }, [search, notes]);

  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:22, marginLeft:4}}>Découvrir {personFirst}</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll">
        <div style={{padding:"6px 18px 12px"}}>
          <SearchBarR value={search} onChange={setSearch} placeholder="Rechercher un détail…"/>
          {matches.length > 0 && (
            <div className="card" style={{marginTop:10, padding:12}}>
              <p className="label" style={{marginBottom:8}}>{matches.length} résultat{matches.length>1?"s":""}</p>
              <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:6}}>
                {matches.map(n => (
                  <li key={n.id}>
                    <button onClick={() => onOpenCat(n.catId)} style={{
                      width:"100%", textAlign:"left", border:"none", background:"transparent",
                      cursor:"pointer", padding:"8px 10px", borderRadius:12,
                      display:"flex", gap:10, alignItems:"flex-start"
                    }}>
                      <span style={{width:8, height:8, marginTop:7, borderRadius:"50%", background:CBR[n.catId].bg, flexShrink:0}}/>
                      <span style={{flex:1}}>
                        <span style={{fontSize:14, color:"var(--ink)", display:"block", lineHeight:1.4}}>{n.text}</span>
                        <span className="meta">{CBR[n.catId].title}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ul style={{listStyle:"none", padding:"4px 18px 0", margin:0, display:"grid", gap:12}}>
          {visibleCats.map(c => {
            const Icon = c.Icon;
            const list = notes.filter(x => x.catId === c.id).sort((a,b) => b.ts - a.ts);
            const recent = list[0];
            return (
              <li key={c.id}>
                <button onClick={() => onOpenCat(c.id)}
                        className="cat-tile"
                        style={{background:c.bg, color:c.ink, padding:"16px", borderRadius:22, alignItems:"flex-start"}}>
                  <span style={{width:46, height:46, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                    <Icon size={22} sw={1.6}/>
                  </span>
                  <span style={{flex:1, minWidth:0, textAlign:"left"}}>
                    <span style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:8}}>
                      <span style={{fontFamily:"var(--display)", fontSize:18, fontWeight:500}}>{c.title}</span>
                      <span style={{fontSize:12, opacity:.7, fontWeight:600}}>{list.length}</span>
                    </span>
                    {recent && (
                      <span style={{display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:8, fontSize:13.5, opacity:.85, lineHeight:1.45}}>
                        « {recent.text} »
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {payload.included.length < CATS_R.length && (
          <div style={{padding:"22px 22px 0"}}>
            <div className="card dashed" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
              <IconLockR size={20}/>
              <div>
                <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>Certaines rubriques ne sont pas partagées.</p>
                <p style={{marginTop:6, fontSize:13.5, color:"var(--ink-2)", lineHeight:1.5}}>
                  C'est normal — {payload.fromName} a choisi ce qui est utile pour toi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Relais category — read only */
function RelaisCategory({catId, notes, onBack}){
  const cat = CBR[catId];
  const Icon = cat.Icon;
  const list = notes.filter(n => n.catId === catId).sort((a,b) => b.ts - a.ts);
  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackR size={20}/></button>
        <span className="label">{list.length} note{list.length>1?"s":""}</span>
        <span style={{width:44}}/>
      </div>
      <div style={{padding:"4px 22px 0", display:"flex", justifyContent:"flex-end"}}><window.UI.ReadAll texts={[cat.title, ...list.map(n => n.text)]}/></div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <div style={{
          background:cat.bg, color:cat.ink, borderRadius:24, padding:"22px 20px",
          marginTop:6, position:"relative", overflow:"hidden"
        }}>
          <span aria-hidden="true" style={{position:"absolute", top:-30, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,.35)"}}/>
          <span style={{width:48, height:48, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", position:"relative"}} aria-hidden="true">
            <Icon size={24} sw={1.6}/>
          </span>
          <h1 className="serif" style={{fontSize:28, marginTop:14, position:"relative", color:"inherit"}}>{cat.title}</h1>
          <p style={{marginTop:6, fontSize:14, opacity:.85, position:"relative"}}>{cat.blurb}</p>
        </div>

        <ul style={{listStyle:"none", padding:0, margin:"20px 0 0", display:"grid", gap:10}}>
          {list.map(n => (
            <li key={n.id}>
              <div className="note" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:16, lineHeight:1.5}}>{n.text}</p>
                  <p className="when" style={{marginTop:8}}>noté {softDateR(n.ts)}</p>
                </div>
                <window.UI.ReadAloud text={n.text} size={40}/>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. Relais Aujourd'hui — contextual tips
   ───────────────────────────────────────────────────────────── */
function RelaisToday({onOpenCat, notes}){
  const [moment, setMoment] = useSR(momentNow());
  const TIPS = window.Who.demo ? TIPS_BY_MOMENT : window.Live.tipsByMoment(notes);
  const block = TIPS.find(b => b.id === moment) || TIPS[0];
  const idx = TIPS.findIndex(b => b.id === moment);

  // Time-of-day gradient
  const momentGradient = {
    matin: "var(--c-histoire)",
    midi:  "var(--c-habitudes)",
    aprem: "var(--c-apaise)",
    soir:  "var(--c-parler)"
  }[moment];

  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar">
        <div>
          <p className="kicker">Aujourd'hui</p>
          <h1 className="serif" style={{fontSize:24, marginTop:2}}>{block.title}</h1>
        </div>
        <span className="meta" style={{whiteSpace:"nowrap", fontWeight:700}}>{block.hint}</span>
      </div>

      <div className="scroll" style={{padding:"6px 18px 24px"}}>
        {/* Time-of-day moment selector — horizontal pills */}
        <div className="seg" role="tablist" aria-label="Moment de la journée" style={{margin:"6px 0 18px"}}>
          {TIPS.map((b) => {
            const on = moment === b.id;
            const labels = {matin:"Matin", midi:"Midi", aprem:"Aprem", soir:"Soir"};
            return <button key={b.id} role="tab" className={on ? "on" : ""} aria-selected={on} onClick={() => setMoment(b.id)} style={{whiteSpace:"nowrap", padding:"0 6px"}}>{labels[b.id]}</button>;
          })}
        </div>

        {/* Big moment hero */}
        {block.items.length === 0 && <div className="card" style={{padding:"22px 20px", textAlign:"center"}}><p style={{font:"800 16px var(--sans)"}}>Rien de particulier noté pour ce moment.</p><p className="meta" style={{marginTop:6}}>Regarde les rubriques de l'accueil pour l'essentiel.</p></div>}
        {block.items.length > 0 && (() => { const c0 = CBR[block.items[0].catId]; const I0 = c0.Icon; return (
        <button onClick={() => onOpenCat(block.items[0].catId)} className="card-press" style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:"22px 20px", background:c0.bg, color:c0.ink}}>
          <span style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{width:44, height:44, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true"><I0 size={20} sw={1.8}/></span>
            <span className="kicker" style={{color:"inherit", opacity:.75}}>Le bon réflexe</span>
          </span>
          <span style={{display:"block", marginTop:18, font:"800 22px var(--sans)", letterSpacing:"-.025em", lineHeight:1.25}}>{block.items[0].text}</span>
          <span style={{display:"block", marginTop:12, fontSize:13, fontWeight:700, opacity:.8}}>{c0.title}</span>
        </button>); })()}

        {/* Timeline of other tips for this moment */}
        {block.items.length > 1 && <p className="kicker" style={{marginTop:24}}>Aussi à garder en tête</p>}
        <ul style={{listStyle:"none", padding:0, margin:"12px 0 0"}}>
          {block.items.slice(1).map((item, i) => {
            const cat = CBR[item.catId];
            const Icon = cat.Icon;
            return (
              <li key={i} style={{display:"flex", gap:14, paddingLeft:6}}>
                {/* timeline rail */}
                <div style={{display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, paddingTop:8}}>
                  <span style={{width:10, height:10, borderRadius:"50%", background:cat.bg, border:"2px solid var(--bg)", boxShadow:"0 0 0 1px rgba(0,0,0,.15)"}} aria-hidden="true"/>
                  {i < block.items.length - 2 && <span style={{width:1, flex:1, background:"rgba(0,0,0,.12)", marginTop:6, marginBottom:6, minHeight:30}}/>}
                </div>
                <button onClick={() => onOpenCat(item.catId)}
                        style={{
                          flex:1, textAlign:"left", marginBottom:10,
                          background:"var(--card)", border:"none",
                          borderRadius:"var(--r-md)", padding:"14px", cursor:"pointer",
                          display:"flex", gap:10, alignItems:"flex-start"
                        }}>
                  <span style={{width:36, height:36, borderRadius:"50%", background:cat.bg, color:cat.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                    <Icon size={17} sw={1.8}/>
                  </span>
                  <span style={{flex:1, minWidth:0}}>
                    <span style={{display:"block", fontSize:14.5, fontWeight:600, color:"var(--ink)", lineHeight:1.45}}>{item.text}</span>
                    <span className="mono" style={{whiteSpace:"nowrap", display:"block", marginTop:6, fontSize:10, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:".1em"}}>{cat.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{marginTop:18}}>
          <div className="card dashed" style={{textAlign:"center", padding:"20px 16px"}}>
            <IconSparkleR size={18} sw={1.6} style={{color:"var(--accent)"}}/>
            <p style={{marginTop:8, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontStyle:"normal", fontSize:15, color:"var(--ink-2)", lineHeight:1.45}}>
              « Tu n'as pas besoin de tout retenir. C'est là quand tu en as besoin. »
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. Relais Répondre — ack + thank you + question
   ───────────────────────────────────────────────────────────── */
function RelaisRespond({payload, onAck}){
  const [tab, setTab] = useSR("merci"); // merci | question | recu
  const [text, setText] = useSR("");
  const [sent, setSent] = useSR(false);
  const from = payload.fromName || "Anne";
  const personFirst = (payload.profile?.name || "Jeanne").split(" ")[0];

  function send(kind){
    setSent(kind);
    setText("");
    if(kind === "recu") onAck();
  }

  return (
    <div className="screen fade-enter">
      <SBR/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:22, marginLeft:4}}>Répondre à {from}</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <p style={{marginTop:4, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          Un mot, une question, ou simplement signaler que tu as bien pris connaissance — au choix.
        </p>

        <div className="seg" style={{marginTop:20}}>
          <button className={tab === "merci" ? "on" : ""} onClick={() => setTab("merci")} aria-pressed={tab==="merci"}>Mot</button>
          <button className={tab === "question" ? "on" : ""} onClick={() => setTab("question")} aria-pressed={tab==="question"}>Question</button>
          <button className={tab === "recu" ? "on" : ""} onClick={() => setTab("recu")} aria-pressed={tab==="recu"}>Reçu</button>
        </div>

        {tab === "merci" && (
          <div style={{marginTop:18}}>
            <p className="label">Un petit mot à {from}</p>
            <textarea rows={5} value={text} onChange={e => setText(e.target.value)}
                      placeholder={`Merci ${from}, j'ai bien lu. Je passerai chez ${personFirst} mercredi.`}
                      style={{marginTop:8}} aria-label={`Mot à ${from}`}/>
            <button className="btn primary" style={{marginTop:14, width:"100%"}} disabled={!text.trim()} onClick={() => send("merci")}>
              <IconReplyR size={20}/> Envoyer
            </button>
          </div>
        )}

        {tab === "question" && (
          <div style={{marginTop:18}}>
            <p className="label">Une question à {from}</p>
            <p style={{marginTop:6, fontSize:13.5, color:"var(--ink-3)"}}>
              Sur une habitude, un détail. {from} reçoit ta question directement, sans formalité.
            </p>
            <textarea rows={5} value={text} onChange={e => setText(e.target.value)}
                      placeholder={`Comment ${personFirst} préfère-t-elle son thé du goûter ?`}
                      style={{marginTop:12}} aria-label={`Question à ${from}`}/>
            <button className="btn primary" style={{marginTop:14, width:"100%"}} disabled={!text.trim()} onClick={() => send("question")}>
              <IconQuestionR size={20}/> Demander
            </button>
          </div>
        )}

        {tab === "recu" && (
          <div style={{marginTop:18}}>
            <div className="card paper">
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>« J'ai bien pris connaissance. »</p>
              <p style={{marginTop:10, fontSize:14, color:"var(--ink-2)", lineHeight:1.5}}>
                {from} verra que tu as ouvert et lu la fiche. Aucun message n'est envoyé — juste un accusé silencieux.
              </p>
            </div>
            <button className="btn primary" style={{marginTop:14, width:"100%"}} onClick={() => send("recu")}>
              <IconCheckR size={20}/> Confirmer
            </button>
          </div>
        )}

        {sent && (
          <div className="card" style={{marginTop:22, background:"var(--c-gouts)", color:"var(--c-gouts-ink)", border:"none"}}>
            <div style={{display:"flex", gap:12, alignItems:"flex-start"}}>
              <span style={{width:36, height:36, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                <IconCheckR size={18} sw={2}/>
              </span>
              <div>
                <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>
                  {sent === "recu" && "Bien noté — accusé envoyé."}
                  {sent === "merci" && `Ton mot est parti chez ${from}.`}
                  {sent === "question" && `${from} recevra ta question.`}
                </p>
                <p style={{marginTop:6, fontSize:13.5, opacity:.85, lineHeight:1.5}}>
                  Tu peux revenir lire la fiche autant de fois que nécessaire.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.Relais = { RelaisCarnetPicker, RelaisWelcome, RelaisHome, RelaisDiscover, RelaisCategory, RelaisToday, RelaisRespond };
