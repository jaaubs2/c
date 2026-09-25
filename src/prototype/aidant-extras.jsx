// Aidant extras — Notifications, improved Settings, Confirmation
const { useState: useStateAX, useEffect: useEffectAX, useMemo: useMemoAX } = React;
const {
  IconBack: IconBackAX, IconCheck: IconCheckAX, IconClose: IconCloseAX,
  IconBell: IconBellAX, IconShare: IconShareAX, IconEdit: IconEditAX,
  IconLink: IconLinkAX, IconLock: IconLockAX, IconSparkle: IconSparkleAX,
  IconChevron: IconChevronAX, IconEye: IconEyeAX,
  JeanneIllustration: JIAX, AnneIllustration: AIAX
} = window.Icons;
const { CATEGORIES: CATSAX, CAT_BY_ID: CBYAX, softDate: softDateAX, NOTIFICATIONS, ACTIVITY_LOG } = window.AppData;
const { StatusBar: SBAX, Avatar: AvatarAX, useA11y } = window.UI;

/* ─────────────────────────────────────────────────────────────
   NOTIFICATIONS — slide-up
   ───────────────────────────────────────────────────────────── */
function AidantNotifications({onBack, onOpenCat, live}){
  const REQUEST = { id:"req-tilleuls", kind:"request", ts:Date.now()-2*3600000, title:"La Maison des Tilleuls a ouvert le carnet de Jeanne", body:"Marc Aubry, cadre de santé · Unité B, t'invite à y contribuer : ce que toi seule sais d'elle, l'équipe ne peut pas le deviner. Choisis ce que tu partages.", cats:["habitudes","apaise","parler","histoire"] };
  // Avec un vrai compte : les vraies ouvertures de fiches (journal d'accès).
  const [items, setItems] = useStateAX(live || [REQUEST, ...NOTIFICATIONS]);
  const [reqCats, setReqCats] = useStateAX(REQUEST.cats);
  const [decided, setDecided] = useStateAX(null);

  function ackOne(id){
    setItems(prev => prev.filter(n => n.id !== id));
  }
  function clear(){
    setItems([]);
  }

  const kindLabel = {
    request:"Invitation",
    read:"Consultation",
    refresh:"À actualiser",
    reply:"Réponse",
    weekly:"Hebdo"
  };
  const kindBg = {
    request: "var(--c-sante)",
    read:    "var(--c-gouts)",
    refresh: "var(--c-histoire)",
    reply:   "var(--c-proches)",
    weekly:  "var(--c-parler)"
  };

  return (
    <div className="screen slide-up">
      <SBAX/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Fermer" onClick={onBack}>
          <IconCloseAX size={20}/>
        </button>
        <div>
          <p className="kicker">Notifications</p>
          <h1 className="serif" style={{fontSize:22, marginTop:2, textAlign:"center"}}>Du nouveau</h1>
        </div>
        <button className="iconbtn" aria-label="Tout effacer" onClick={clear}
                style={{opacity: items.length ? 1 : .4}} disabled={!items.length}>
          <IconCheckAX size={18} sw={2}/>
        </button>
      </div>

      <div className="scroll" style={{padding:"6px 20px 24px"}}>
        {items.length === 0 ? (
          <div className="card dashed" style={{marginTop:18, textAlign:"center", padding:"28px 20px"}}>
            <span style={{width:48, height:48, borderRadius:"50%", background:"var(--c-gouts)", display:"inline-flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
              <IconCheckAX size={22} sw={2}/>
            </span>
            <p style={{marginTop:14, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, color:"var(--ink)"}}>Tout est à jour.</p>
            <p style={{marginTop:8, fontSize:14, color:"var(--ink-2)", lineHeight:1.5}}>
              Tu peux revenir quand tu veux.
            </p>
          </div>
        ) : (
          <ul style={{listStyle:"none", padding:0, margin:"6px 0 0", display:"grid", gap:10}}>
            {items.map(n => (
              <li key={n.id}>
                <article className="card" style={{padding:16}}>
                  <div style={{display:"flex", alignItems:"center", gap:10}}>
                    <span style={{
                      width:28, height:28, borderRadius:9,
                      background: kindBg[n.kind],
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0
                    }} aria-hidden="true">
                      {n.kind === "request" && <IconLockAX size={14} sw={1.8}/>}
                      {n.kind === "read"    && <IconEyeAX size={14} sw={1.8}/>}
                      {n.kind === "refresh" && <IconSparkleAX size={14} sw={1.8}/>}
                      {n.kind === "reply"   && <IconShareAX size={14} sw={1.8}/>}
                      {n.kind === "weekly"  && <IconBellAX size={14} sw={1.8}/>}
                    </span>
                    <span className="kicker">{kindLabel[n.kind]}</span>
                    <span className="meta" style={{marginLeft:"auto"}}>{softDateAX(n.ts)}</span>
                  </div>

                  <p style={{marginTop:10, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, lineHeight:1.3, color:"var(--ink)", letterSpacing:"-.01em"}}>
                    {n.title}
                  </p>
                  <p style={{marginTop:6, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.5}}>
                    {n.body}
                  </p>

                  {n.kind === "request" && !decided && (
                    <div style={{marginTop:12}}>
                      <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                        {CATSAX.map(c => { const on = reqCats.includes(c.id); const asked = n.cats.includes(c.id); if(!asked) return null; return <button key={c.id} className="chip" aria-pressed={on} onClick={() => setReqCats(p => on ? p.filter(x => x !== c.id) : [...p, c.id])} style={on ? {} : {background:"var(--bg)", boxShadow:"none", textDecoration:"line-through", color:"var(--ink-3)"}}><c.Icon size={14} sw={1.8}/> {c.title}</button>; })}
                      </div>
                      <p className="meta" style={{marginTop:8, fontSize:12.5}}>Tes notes de ces rubriques rejoindront le carnet tenu par l'équipe, signées de ton nom.</p>
                      <div style={{display:"grid", gap:8, marginTop:12}}>
                        <button className="btn" style={{width:"100%", minHeight:48}} disabled={!reqCats.length} onClick={() => setDecided("ok")}><IconCheckAX size={18}/> Contribuer · {reqCats.length} rubrique{reqCats.length>1?"s":""}</button>
                        <button className="btn soft" style={{width:"100%", minHeight:48}} onClick={() => setDecided("no")}>Pas maintenant</button>
                      </div>
                    </div>
                  )}
                  {n.kind === "request" && decided && (
                    <div className="slide-up" style={{marginTop:12, padding:"12px 14px", borderRadius:14, background: decided === "ok" ? "var(--c-sante)" : "var(--bg)", color: decided === "ok" ? "var(--c-sante-ink)" : "var(--ink-2)", fontSize:13.5, fontWeight:700, lineHeight:1.4}}>
                      {decided === "ok" ? `Tu contribues au carnet de Jeanne à la Maison des Tilleuls · ${reqCats.length} rubriques. L'équipe de l'Unité B voit tes notes.` : "Invitation mise de côté. Tu la retrouveras dans Réglages."}
                    </div>
                  )}
                  <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
                    {n.kind === "refresh" && (
                      <button className="chip" onClick={() => onOpenCat(n.catId)}>
                        <IconEditAX size={14}/> Revoir
                      </button>
                    )}
                    {n.kind === "read" && (
                      <button className="chip" onClick={() => onOpenCat(n.catId)}>
                        <IconEyeAX size={14}/> Voir la fiche
                      </button>
                    )}
                    {n.kind === "reply" && (
                      <button className="chip">
                        <IconShareAX size={14}/> Répondre
                      </button>
                    )}
                    <button className="chip" onClick={() => ackOne(n.id)}
                            style={{marginLeft:"auto", color:"var(--ink-2)"}}>
                      Vu
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.5}}>
          Aucune notification automatique de santé.<br/>Le carnet n'est pas un outil médical.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SETTINGS V2 — profile + access management + non-medical reminder
   ───────────────────────────────────────────────────────────── */
function AidantSettingsV2({visibility, setVisibility, sharePayload, onRevoke}){
  const [revoked, setRevoked] = useStateAX(false);
  const [a11y, setA11yKey] = useA11y();

  return (
    <div className="screen fade-enter">
      <SBAX/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:22, marginLeft:4}}>Réglages</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 18px 24px"}}>

        {/* Profile section */}
        <p className="kicker">Profil de la personne aidée</p>
        <div className="card" style={{marginTop:10, padding:18, display:"flex", gap:14, alignItems:"center"}}>
          <div style={{width:64, height:64, borderRadius:"50%", background:"var(--c-habitudes)", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center", flexShrink:0}}>
            <JIAX size={64}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:20, color:"var(--ink)", letterSpacing:"-.01em"}}>Jeanne</p>
            <p className="meta" style={{marginTop:4}}>86 ans · accompagnée depuis 2 ans</p>
          </div>
          <button className="iconbtn" aria-label="Modifier le profil de Jeanne">
            <IconEditAX size={18}/>
          </button>
        </div>

        {/* Non-medical reminder */}
        <div className="card paper" style={{marginTop:14, padding:16, display:"flex", gap:12, alignItems:"flex-start"}}>
          <span aria-hidden="true" style={{
            width:32, height:32, borderRadius:10, flexShrink:0,
            background:"rgba(0,0,0,.06)",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>
            <IconSparkleAX size={16} sw={1.8} style={{color:"var(--accent)"}}/>
          </span>
          <p style={{fontSize:14.5, color:"var(--ink-2)", lineHeight:1.5}}>
            <strong style={{color:"var(--ink)"}}>Ce carnet n'est pas un outil médical.</strong> Aucun diagnostic, aucune donnée clinique — juste ce qui aide à passer un beau moment avec Jeanne.
          </p>
        </div>

        {/* Access management */}
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", marginTop:24}}>
          <p className="kicker">Accès partagés</p>
          <span className="mono" style={{fontSize:11, color:"var(--ink-2)"}}>1 actif</span>
        </div>
        <div className="card" style={{marginTop:10, padding:16}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <AvatarAX name={sharePayload.name} size={40} tone="sage"/>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{sharePayload.name}</p>
              <p className="meta" style={{marginTop:2}}>{sharePayload.recipient.title.toLowerCase()} · partagée il y a 2 jours</p>
            </div>
            <span className="mono" style={{padding:"4px 10px", fontSize:11, borderRadius:8, background: revoked ? "rgba(0,0,0,.08)" : "var(--c-gouts)", color: revoked ? "var(--ink-3)" : "var(--c-gouts-ink)", letterSpacing:".08em"}}>
              {revoked ? "RÉVOQUÉ" : "LU"}
            </span>
          </div>
          <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
            <button className="chip" aria-label="Voir le lien partagé">
              <IconLinkAX size={14}/> Voir le lien
            </button>
            <button className="chip" disabled={revoked}
                    onClick={() => { setRevoked(true); onRevoke && onRevoke(); }}
                    style={{marginLeft:"auto", color: revoked ? "var(--ink-3)" : "var(--accent)"}}>
              {revoked ? "Lien révoqué" : "Révoquer le lien"}
            </button>
          </div>
        </div>

        {/* Activity log */}
        <p className="kicker" style={{marginTop:24}}>Activité récente</p>
        <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
          {ACTIVITY_LOG.map(a => (
            <li key={a.id} style={{display:"flex", gap:12, padding:"10px 4px"}}>
              <span aria-hidden="true" style={{
                width:8, height:8, borderRadius:"50%", marginTop:7, flexShrink:0,
                background: a.kind === "read" ? "var(--c-gouts)" :
                            a.kind === "add" ? "var(--c-histoire)" :
                            a.kind === "share" ? "var(--c-proches)" :
                            "var(--c-apaise)"
              }}/>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontSize:14, color:"var(--ink)", lineHeight:1.4}}>
                  <strong style={{fontWeight:600}}>{a.who}</strong> {a.what}
                </p>
                <p style={{marginTop:2, fontSize:12, color:"var(--ink-2)"}}>{a.detail} · {softDateAX(a.ts)}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Privacy / consent */}
        <p className="kicker" style={{marginTop:24}}>Confidentialité</p>
        <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:10}}>
          <li className="card" style={{padding:14, display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, lineHeight:1}}>—</span>
            <span style={{fontSize:14.5, color:"var(--ink-2)", lineHeight:1.5}}>Rien ne quitte ton téléphone sans ton accord explicite.</span>
          </li>
          <li className="card" style={{padding:14, display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, lineHeight:1}}>—</span>
            <span style={{fontSize:14.5, color:"var(--ink-2)", lineHeight:1.5}}>Les fiches partagées expirent au bout de 7 jours.</span>
          </li>
          <li className="card" style={{padding:14, display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, lineHeight:1}}>—</span>
            <span style={{fontSize:14.5, color:"var(--ink-2)", lineHeight:1.5}}>Aucune publicité, aucun partage tiers, jamais.</span>
          </li>
        </ul>

        {/* Accessibility */}
        <p className="kicker" style={{marginTop:24}}>Accessibilité</p>
        <p style={{marginTop:6, fontSize:13.5, color:"var(--ink-2)"}}>
          L'aidant est souvent fatigué. Ajuste à ton confort.
        </p>

        <div style={{marginTop:12, display:"grid", gap:8}}>
          <div className="card" style={{padding:14}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)", marginBottom:10}}>Taille du texte</p>
            <div role="radiogroup" aria-label="Taille du texte" style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
              {[
                {id:"regular", label:"Normal", size:14},
                {id:"large",   label:"Grand",  size:16},
                {id:"xlarge",  label:"Très grand", size:18}
              ].map(opt => {
                const on = a11y.textSize === opt.id;
                return (
                  <button key={opt.id} role="radio" aria-checked={on}
                          onClick={() => setA11yKey("textSize", opt.id)}
                          style={{
                            border:"1px solid " + (on ? "var(--ink)" : "var(--line-2)"),
                            background: on ? "var(--ink)" : "var(--paper)",
                            color: on ? "var(--paper)" : "var(--ink)",
                            borderRadius:14, padding:"12px 8px",
                            cursor:"pointer", minHeight:54,
                            font:"500 " + opt.size + "px var(--sans)",
                            fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", letterSpacing:"-.01em"
                          }}>
                    Aa
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
            <div style={{flex:1}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>Contraste renforcé</p>
              <p style={{marginTop:4, fontSize:13, color:"var(--ink-2)"}}>Bords plus marqués, gris plus foncés.</p>
            </div>
            <button role="switch" aria-checked={a11y.highContrast}
                    onClick={() => setA11yKey("highContrast", !a11y.highContrast)}
                    aria-label="Contraste renforcé"
                    style={{
                      width:46, height:26, borderRadius:999, border:"none", padding:3,
                      background: a11y.highContrast ? "var(--accent)" : "var(--line-2)",
                      cursor:"pointer", flexShrink:0
                    }}>
              <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: a11y.highContrast ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
            </button>
          </div>

          <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
            <div style={{flex:1}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>Réduire les animations</p>
              <p style={{marginTop:4, fontSize:13, color:"var(--ink-2)"}}>Moins de mouvement à l'écran.</p>
            </div>
            <button role="switch" aria-checked={a11y.reduceMotion}
                    onClick={() => setA11yKey("reduceMotion", !a11y.reduceMotion)}
                    aria-label="Réduire les animations"
                    style={{
                      width:46, height:26, borderRadius:999, border:"none", padding:3,
                      background: a11y.reduceMotion ? "var(--accent)" : "var(--line-2)",
                      cursor:"pointer", flexShrink:0
                    }}>
              <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: a11y.reduceMotion ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
            </button>
          </div>

          <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
            <div style={{flex:1}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>Lecture à voix haute</p>
              <p style={{marginTop:4, fontSize:13, color:"var(--ink-2)"}}>Affiche un bouton « lire » sur les notes.</p>
            </div>
            <button role="switch" aria-checked={a11y.ttsOnRead}
                    onClick={() => setA11yKey("ttsOnRead", !a11y.ttsOnRead)}
                    aria-label="Lecture à voix haute"
                    style={{
                      width:46, height:26, borderRadius:999, border:"none", padding:3,
                      background: a11y.ttsOnRead ? "var(--accent)" : "var(--line-2)",
                      cursor:"pointer", flexShrink:0
                    }}>
              <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: a11y.ttsOnRead ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
            </button>
          </div>
        </div>

        {/* Visibility toggles */}
        <p className="kicker" style={{marginTop:24}}>Rubriques masquables</p>
        <p style={{marginTop:6, fontSize:13.5, color:"var(--ink-2)"}}>
          Désactive une rubrique pour qu'elle n'apparaisse dans aucune fiche partagée.
        </p>
        <div style={{marginTop:12, display:"grid", gap:8}}>
          {CATSAX.map(c => {
            const on = visibility[c.id] !== false;
            const Icon = c.Icon;
            return (
              <div key={c.id} className="card" style={{display:"flex", gap:12, alignItems:"center", padding:12}}>
                <span style={{width:32, height:32, borderRadius:10, background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                  <Icon size={16} sw={1.6}/>
                </span>
                <span style={{flex:1, minWidth:0, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15, color:"var(--ink)"}}>{c.title}</span>
                <button role="switch" aria-checked={on}
                        onClick={() => setVisibility({...visibility, [c.id]: !on})}
                        aria-label={`Inclure ${c.title}`}
                        style={{
                          width:46, height:26, borderRadius:999, border:"none", padding:3,
                          background: on ? "var(--accent)" : "var(--line-2)",
                          cursor:"pointer", flexShrink:0
                        }}>
                  <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: on ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONFIRMATION — animation Ajouté au carnet
   ───────────────────────────────────────────────────────────── */
function CaptureConfirmation({catId, onDone}){
  useEffectAX(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, []);

  const cat = CBYAX[catId];
  const Icon = cat.Icon;

  return (
    <div className="screen fade-enter" style={{background:"var(--bg)"}}>
      <SBAX/>
      <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 22px 80px"}}>
        <div style={{position:"relative", width:140, height:140}}>
          <span aria-hidden="true" style={{
            position:"absolute", inset:0, borderRadius:"50%",
            background: cat.bg, animation:"spark 1.4s ease-out"
          }}/>
          <span aria-hidden="true" style={{
            position:"absolute", inset:-12, borderRadius:"50%",
            border:"1.5px solid var(--accent)", opacity:.3, animation:"pulse 1.4s ease-out"
          }}/>
          <span style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: cat.ink
          }} aria-hidden="true">
            <IconCheckAX size={56} sw={2}/>
          </span>
        </div>

        <p className="kicker" style={{marginTop:30, color:cat.ink || "var(--ink-2)"}}>{cat.title}</p>
        <h1 className="serif" style={{marginTop:10, fontSize:30, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.05}}>
          Ajouté au carnet de Jeanne.
        </h1>
        <p style={{marginTop:14, fontSize:15, color:"var(--ink-2)", textAlign:"center", lineHeight:1.5, maxWidth:300}}>
          Une attention de plus pour celles et ceux qui prendront le relais.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CAREGIVER CARE — Une minute pour soi
   ───────────────────────────────────────────────────────────── */
function AidantCare({onBack}){
  const [mood, setMood] = useStateAX(null);
  const [breathing, setBreathing] = useStateAX(false);
  const [breath, setBreath] = useStateAX("inspire");
  const [showRepit, setShowRepit] = useStateAX(false);

  useEffectAX(() => {
    if(!breathing) return;
    const seq = [["inspire", 4000], ["retiens", 2000], ["expire", 6000], ["pause", 2000]];
    let i = 0;
    function step(){
      const [phase, dur] = seq[i % seq.length];
      setBreath(phase);
      i++;
      return setTimeout(step, dur);
    }
    const id = step();
    return () => clearTimeout(id);
  }, [breathing]);

  const moods = [
    {id:"epuisee",   label:"Épuisée",    tone:"#F1CFCB"},
    {id:"tendu",     label:"Tendue",     tone:"#F1DCA8"},
    {id:"ok",        label:"Ça va",      tone:"#C8D6B7"},
    {id:"emue",      label:"Émue",       tone:"#DCCFE2"}
  ];

  const breathLabel = {
    inspire:"Inspire doucement",
    retiens:"Retiens",
    expire:"Expire longuement",
    pause:"…"
  }[breath];

  return (
    <div className="screen slide-up">
      <SBAX/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Fermer" onClick={onBack}>
          <IconCloseAX size={20}/>
        </button>
        <div style={{textAlign:"center"}}>
          <p className="kicker">Une minute pour toi</p>
          <h1 className="serif" style={{fontSize:22, marginTop:2}}>Souffle, Anne.</h1>
        </div>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        {/* Opening message */}
        <div className="hero cool" style={{padding:"22px 22px 24px"}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:20, lineHeight:1.35, color:"var(--ink)", letterSpacing:"-.01em"}}>
            Tu prends soin de Jeanne depuis 2 ans. C'est immense — et c'est précieux.
          </p>
          <p style={{marginTop:12, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
            Là, maintenant, prends une vraie minute. Pour toi. Sans rien à réussir.
          </p>
        </div>

        {/* Self check-in */}
        <p className="kicker" style={{marginTop:24}}>Comment te sens-tu vraiment&nbsp;?</p>
        <p style={{marginTop:6, fontSize:13, color:"var(--ink-2)"}}>Optionnel. Rien n'est gardé, rien n'est jugé.</p>
        <div role="radiogroup" aria-label="Ton état du moment" style={{marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
          {moods.map(m => {
            const on = mood === m.id;
            return (
              <button key={m.id} role="radio" aria-checked={on}
                      onClick={() => setMood(m.id)}
                      className="card-press"
                      style={{
                        border:"1px solid " + (on ? "var(--ink)" : "var(--line-2)"),
                        background: on ? "var(--ink)" : "var(--paper)",
                        color: on ? "var(--paper)" : "var(--ink)",
                        borderRadius:14, padding:"12px 14px",
                        display:"flex", alignItems:"center", gap:10,
                        cursor:"pointer", minHeight:48,
                        font:"500 14.5px var(--sans)", textAlign:"left",
                        transition:"all .2s ease"
                      }}>
                <span aria-hidden="true" style={{width:14, height:14, borderRadius:"50%", background:m.tone, border:"1px solid rgba(0,0,0,.1)"}}/>
                {m.label}
              </button>
            );
          })}
        </div>

        {mood && (
          <p className="meta slide-up" style={{marginTop:14, fontSize:14, color:"var(--ink-2)", lineHeight:1.5, padding:"0 4px"}}>
            {mood === "epuisee" && "C'est entendu. Pose-toi simplement quelques instants. Tu n'as rien à faire d'autre."}
            {mood === "tendu"   && "Compris. Une respiration lente peut aider à relâcher un peu."}
            {mood === "ok"      && "Tant mieux. Profite de ce petit moment — il est à toi."}
            {mood === "emue"    && "Les émotions ont leur place. Tu n'es pas seule."}
          </p>
        )}

        {/* Breathing exercise */}
        <p className="kicker" style={{marginTop:28}}>3 grandes respirations</p>
        <div className="card" style={{marginTop:12, padding:"28px 22px 22px", textAlign:"center"}}>
          <div style={{position:"relative", width:160, height:160, margin:"0 auto"}}>
            <div aria-hidden="true" style={{
              position:"absolute", inset:0, borderRadius:"50%",
              background:"radial-gradient(circle at 30% 30%, #DCE6EF, #C9D9E4)",
              transform: breathing
                ? (breath === "inspire" ? "scale(1)"
                   : breath === "retiens" ? "scale(1)"
                   : breath === "expire" ? "scale(.6)"
                   : "scale(.6)")
                : "scale(.85)",
              transition: breathing ? `transform ${breath === "inspire" ? "4s" : breath === "expire" ? "6s" : "2s"} cubic-bezier(.4,.0,.2,1)` : "transform .4s ease"
            }}/>
            <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, color:"var(--ink)", letterSpacing:"-.01em"}}>
                {breathing ? breathLabel : "Prête ?"}
              </p>
            </div>
          </div>
          <button className="btn primary" style={{marginTop:22, minWidth:200}}
                  onClick={() => setBreathing(v => !v)}>
            {breathing ? "Arrêter" : "Commencer"}
          </button>
          <p className="meta" style={{marginTop:10}}>4s inspire · 2s retiens · 6s expire</p>
        </div>

        {/* Quick rituals */}
        <p className="kicker" style={{marginTop:28}}>D'autres petites choses</p>
        <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:8}}>
          {[
            {title:"Sortir prendre l'air", body:"15 minutes dehors changent souvent quelque chose.", tone:"var(--c-gouts)"},
            {title:"Appeler quelqu'un qui te fait du bien", body:"Une voix amie, sans rien à expliquer.", tone:"var(--c-proches)"},
            {title:"Un thé chaud, lentement", body:"Sans téléphone, sans télé. Juste le thé.", tone:"var(--c-habitudes)"}
          ].map((r, i) => (
            <li key={i} className="card" style={{padding:14, display:"flex", gap:12, alignItems:"flex-start"}}>
              <span aria-hidden="true" style={{width:8, height:8, borderRadius:"50%", marginTop:8, background:r.tone, flexShrink:0, border:"1px solid rgba(0,0,0,.1)"}}/>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>{r.title}</p>
                <p style={{marginTop:4, fontSize:13.5, color:"var(--ink-2)", lineHeight:1.5}}>{r.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Resources */}
        <p className="kicker" style={{marginTop:28}}>Si tu as besoin de plus</p>
        <div className="card paper" style={{marginTop:12, padding:16}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>Tu n'es jamais seule.</p>
          <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:8}}>
            <li style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
              <span style={{fontSize:14, color:"var(--ink)"}}>Allô Aidants</span>
              <span className="mono" style={{fontSize:12, color:"var(--ink-2)"}}>09 72 30 30 30</span>
            </li>
            <li style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
              <span style={{fontSize:14, color:"var(--ink)"}}>France Alzheimer</span>
              <span className="mono" style={{fontSize:12, color:"var(--ink-2)"}}>01 42 97 52 41</span>
            </li>
            <li style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
              <span style={{fontSize:14, color:"var(--ink)"}}>Solliciter une pause répit</span>
              <button onClick={() => setShowRepit(true)}
                      style={{background:"none", border:"none", padding:0, cursor:"pointer", fontSize:12, color:"var(--accent)", fontWeight:600}}>
                En savoir plus →
              </button>
            </li>
          </ul>
          <p className="meta" style={{marginTop:14, lineHeight:1.5}}>
            Numéros gratuits, écoute confidentielle, sans jugement.
          </p>
        </div>

        {showRepit && (
          <div role="dialog" aria-label="Pause répit" className="slide-up"
               style={{marginTop:18, background:"var(--card)", border:"2px solid var(--accent)", borderRadius:22, padding:20, boxShadow:"0 6px 24px -8px rgba(0,0,0,.2)"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
              <div>
                <p className="kicker" style={{color:"var(--accent)"}}>Pause répit</p>
                <h2 className="serif" style={{fontSize:22, marginTop:8, letterSpacing:"-.015em"}}>Te confier Jeanne, le temps de respirer.</h2>
              </div>
              <button onClick={() => setShowRepit(false)} aria-label="Fermer" className="iconbtn" style={{flexShrink:0, width:36, height:36, minWidth:36}}>
                <IconCloseAX size={16}/>
              </button>
            </div>

            <p style={{marginTop:14, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
              Une « pause répit » est un accueil temporaire (quelques heures à plusieurs semaines) pour Jeanne, le temps que tu te reposes. Ces solutions existent partout en France et sont en partie financées par la CNSA, le département ou ta caisse de retraite.
            </p>

            <p className="kicker" style={{marginTop:20}}>Les options possibles</p>
            <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:8}}>
              {[
                {title:"Accueil de jour",        body:"Quelques heures par semaine dans un centre dédié.", tone:"var(--c-gouts)"},
                {title:"Accueil de nuit",        body:"Pour souffler une nuit complète, quand le sommeil manque.", tone:"var(--c-parler)"},
                {title:"Hébergement temporaire", body:"Plusieurs jours à plusieurs semaines en établissement.", tone:"var(--c-habitudes)"},
                {title:"Relais à domicile",      body:"Un·e professionnel·le vient chez Jeanne pendant ton absence.", tone:"var(--c-apaise)"}
              ].map((o, i) => (
                <li key={i} className="card" style={{padding:12, display:"flex", gap:10, alignItems:"flex-start"}}>
                  <span aria-hidden="true" style={{width:8, height:8, borderRadius:"50%", marginTop:8, background:o.tone, border:"1px solid rgba(0,0,0,.1)", flexShrink:0}}/>
                  <span style={{flex:1, minWidth:0}}>
                    <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15, color:"var(--ink)"}}>{o.title}</span>
                    <span style={{display:"block", marginTop:3, fontSize:13, color:"var(--ink-2)", lineHeight:1.5}}>{o.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="kicker" style={{marginTop:20}}>Qui contacter</p>
            <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6, fontSize:14, color:"var(--ink-2)"}}>
              <li style={{display:"flex", justifyContent:"space-between", gap:10}}>
                <span>Ton point d'information local</span>
                <span className="mono" style={{color:"var(--ink-2)"}}>clic-info-personnes-agees.fr</span>
              </li>
              <li style={{display:"flex", justifyContent:"space-between", gap:10}}>
                <span>Plateforme nationale répit</span>
                <span className="mono" style={{color:"var(--ink-2)"}}>0 805 38 03 81</span>
              </li>
              <li style={{display:"flex", justifyContent:"space-between", gap:10}}>
                <span>Ta caisse de retraite</span>
                <span className="mono" style={{color:"var(--ink-2)"}}>aide à domicile</span>
              </li>
            </ul>

            <button className="btn primary" style={{marginTop:18, width:"100%"}}
                    onClick={() => { window.location.href = "tel:0805380381"; }}>
              Appeler la plateforme répit
            </button>
            <button className="btn ghost" style={{marginTop:8, width:"100%"}}
                    onClick={() => setShowRepit(false)}>
              J'y reviendrai plus tard
            </button>

            <p className="meta" style={{marginTop:12, textAlign:"center", lineHeight:1.5, fontStyle:"normal"}}>
              Demander une pause, c'est continuer à bien accompagner.
            </p>
          </div>
        )}

        {/* Close */}
        <button className="btn ghost" style={{marginTop:24, width:"100%"}} onClick={onBack}>
          Revenir au carnet
        </button>
        <p className="meta" style={{marginTop:14, textAlign:"center", lineHeight:1.5, fontStyle:"normal"}}>
          « Tu fais déjà beaucoup. »
        </p>
      </div>
    </div>
  );
}

window.AidantExtras = { AidantNotifications, AidantSettingsV2, CaptureConfirmation, AidantCare };
