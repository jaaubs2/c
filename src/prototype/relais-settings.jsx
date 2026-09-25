// Relais Settings — menu + sub-pages + multi-profile (Mes carnets)
const { useState: useSRS, useEffect: useERS } = React;
const {
  IconBack: IconBackRS, IconCheck: IconCheckRS, IconChevron: IconChevronRS,
  IconLock: IconLockRS, IconLink: IconLinkRS, IconSettings: IconSettingsRS,
  JeanneIllustration: JIRS
} = window.Icons;
const { RELAIS_CARNETS, CATEGORIES: CATSRS, CAT_BY_ID: CBYRS, softDate: softDateRS } = window.AppData;
const { StatusBar: SBRS, Avatar: AvRS, useA11y: useA11yRS } = window.UI;

/* ─── root menu ─── */
function RelaisSettings({currentCarnetId, onSwitchCarnet, onLogout}){
  const [page, setPage] = useSRS("menu");
  const back = () => setPage("menu");

  if(page === "carnets")  return <MesCarnetsPage onBack={back} currentCarnetId={currentCarnetId} onSwitchCarnet={(id) => { onSwitchCarnet(id); back(); }}/>;
  if(page === "account")  return <RelaisAccountPage onBack={back} onLogout={onLogout}/>;
  if(page === "access")   return <RelaisAccessPage onBack={back}/>;
  if(page === "a11y")     return <RelaisA11yPage onBack={back}/>;
  if(page === "notif")    return <RelaisNotifPage onBack={back}/>;
  if(page === "appear")   return <RelaisAppearancePage onBack={back}/>;
  if(page === "help")     return <RelaisHelpPage onBack={back}/>;

  return <RelaisMenuRoot onPick={setPage} currentCarnetId={currentCarnetId} onLogout={onLogout}/>;
}

function RelaisMenuRoot({onPick, currentCarnetId, onLogout}){
  const current = RELAIS_CARNETS.find(c => c.id === currentCarnetId) || RELAIS_CARNETS[0];

  const sections = [
    { group:"Tes carnets", items:[
      { id:"carnets", title:"Mes carnets",         body:`${RELAIS_CARNETS.length} carnets partagés · actuel : ${current.profile.name}` },
      { id:"access",  title:"Accès reçus",         body:"Liens partagés, expirations, retirer un accès." }
    ]},
    { group:"Toi",   items:[
      { id:"account", title:"Mon compte léger",    body:"Prénom, email, déconnexion." },
      { id:"a11y",    title:"Accessibilité",       body:"Taille, contraste, animations, voix." },
      { id:"notif",   title:"Notifications",       body:"Quand un nouveau carnet t'est partagé." },
      { id:"appear",  title:"Apparence",           body:"Clair · Mode soir." }
    ]},
    { group:"L'app", items:[
      { id:"help",    title:"Aide & à propos",     body:"FAQ, contact, mentions légales." }
    ]}
  ];

  return (
    <div className="screen fade-enter">
      <SBRS/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:24, marginLeft:4, letterSpacing:"-.02em"}}>Réglages</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 18px 24px"}}>
        {/* Current profile chip */}
        <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
          <AvRS name="Claire D" size={42} tone="sage"/>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>Claire D.</p>
            <p className="meta" style={{marginTop:2}}>Compte léger · 2 carnets</p>
          </div>
        </div>

        {sections.map((sec, si) => (
          <section key={sec.group} style={{marginTop:22}}>
            <p className="kicker">{sec.group}</p>
            <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
              {sec.items.map(item => (
                <li key={item.id}>
                  <button onClick={() => onPick(item.id)}
                          className="card-press"
                          style={{
                            width:"100%", textAlign:"left",
                            background:"var(--card)", border:"1px solid var(--line)",
                            borderRadius:18, padding:"14px 16px",
                            cursor:"pointer", display:"flex", alignItems:"center", gap:12, minHeight:64
                          }}>
                    <span style={{flex:1, minWidth:0}}>
                      <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>{item.title}</span>
                      <span style={{display:"block", marginTop:2, fontSize:13, color:"var(--ink-2)", lineHeight:1.4}}>{item.body}</span>
                    </span>
                    <IconChevronRS size={18}/>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <button className="card card-press" onClick={onLogout} style={{marginTop:22, width:"100%", textAlign:"left", cursor:"pointer", padding:"14px 16px", display:"flex", gap:12, alignItems:"center", color:"#B3261E"}}>
          <span aria-hidden="true" style={{width:36, height:36, borderRadius:"50%", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg></span>
          <span style={{font:"800 14.5px var(--sans)"}}>Se déconnecter</span>
        </button>
        <p className="meta" style={{marginTop:16, textAlign:"center", lineHeight:1.5}}>
          Tu es invité·e à consulter — pas à modifier.
        </p>
      </div>
    </div>
  );
}

/* ─── shared sub-page shell ─── */
function RSubPage({title, onBack, children}){
  return (
    <div className="screen fade-enter">
      <SBRS/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackRS size={20}/></button>
        <span style={{font:"800 16px var(--sans)", letterSpacing:"-.01em"}}>{title}</span>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        {children}
      </div>
    </div>
  );
}

/* ─── Mes carnets — multi-profile switcher ─── */
function MesCarnetsPage({onBack, currentCarnetId, onSwitchCarnet}){
  return (
    <RSubPage title="Mes carnets" onBack={onBack}>
      <p className="meta" style={{marginTop:6, fontSize:15, lineHeight:1.55}}>
        Les personnes que tu accompagnes — chaque carnet est privé et appartient à sa famille.
      </p>
      <ul style={{listStyle:"none", padding:0, margin:"20px 0 0", display:"grid", gap:12}}>
        {RELAIS_CARNETS.map(c => {
          const isActive = currentCarnetId === c.id;
          const isPrimary = c.id === "jeanne";
          const bg = isPrimary ? "var(--c-habitudes)" : "var(--c-parler)";
          const ink = isPrimary ? "var(--c-habitudes-ink)" : "var(--c-parler-ink)";
          return (
            <li key={c.id}>
              <button onClick={() => onSwitchCarnet(c.id)} aria-pressed={isActive} aria-label={`Basculer vers le carnet de ${c.profile.name}`} className="card-press"
                      style={{width:"100%", textAlign:"left", background:bg, color:ink, border:"none", borderRadius:"var(--r-lg)", padding:18, cursor:"pointer", display:"flex", flexDirection:"column", gap:16, minWidth:0}}>
                <span style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", width:"100%"}}>
                  <span style={{width:56, height:56, borderRadius:"50%", overflow:"hidden", background:"rgba(255,255,255,.6)", display:"flex", alignItems:"flex-end", justifyContent:"center"}} aria-hidden="true">
                    {isPrimary ? <JIRS size={54}/> : <window.Persona name={c.profile.name} size={54} bg="transparent"/>}
                  </span>
                  {isActive
                    ? <span style={{font:"800 11px var(--sans)", letterSpacing:".12em", textTransform:"uppercase", background:"var(--ink)", color:"#fff", borderRadius:999, padding:"7px 12px"}}>Actuel</span>
                    : <span style={{width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.6)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true"><IconChevronRS size={16}/></span>}
                </span>
                <span style={{minWidth:0, width:"100%"}}>
                  <span style={{display:"block", font:"800 22px var(--sans)", letterSpacing:"-.025em", lineHeight:1.1}}>{c.profile.name}</span>
                  <span style={{display:"block", marginTop:6, fontSize:14, fontWeight:600, opacity:.85}}>{c.profile.age} ans · {c.profile.relation}</span>
                  <span style={{display:"flex", gap:6, marginTop:12, flexWrap:"wrap"}}>
                    {[`Partagé par ${c.sharedBy}`, `${c.included.length} rubriques`, `Expire dans ${c.expiresIn} j`].map(t => (
                      <span key={t} style={{font:"700 12px var(--sans)", background:"rgba(255,255,255,.6)", borderRadius:999, padding:"6px 10px", whiteSpace:"nowrap"}}>{t}</span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="meta" style={{marginTop:18, fontSize:13, textAlign:"center", lineHeight:1.5}}>
        Pour accompagner quelqu'un d'autre, il suffit d'ouvrir le lien qu'on te partage.
      </p>
    </RSubPage>
  );
}

/* ─── Mon compte léger ─── */
function RelaisAccountPage({onBack, onLogout}){
  const [name, setName] = useSRS("Claire");
  const [email, setEmail] = useSRS("claire@example.com");
  const [showPicker, setShowPicker] = useSRS(false);

  return (
    <RSubPage title="Mon compte léger" onBack={onBack}>
      <div className="card" style={{padding:16, display:"flex", gap:12, alignItems:"center"}}>
        <AvRS name="Claire D" size={56} tone="sage"/>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17}}>Claire D.</p>
          <p className="meta" style={{marginTop:2}}>Compte léger · sans mot de passe</p>
        </div>
        <button className="chip" style={{minHeight:36, padding:"6px 12px", fontSize:13}} onClick={() => setShowPicker(v => !v)}>Avatar</button>
      </div>
      {showPicker && <div className="card slide-up" style={{marginTop:10, padding:14}}><p className="kicker" style={{marginBottom:10}}>Choisir mon avatar</p><window.AvatarPicker name="Claire D" bg="var(--c-sante)" onPick={() => setShowPicker(false)}/></div>}

      <p style={{marginTop:18, fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
        Un compte léger te permet de retrouver tes carnets sans renseigner plus que ton prénom. Connexion par lien magique envoyé par email.
      </p>

      <RsField label="Ton prénom" id="rs-name" value={name} onChange={setName}/>
      <RsField label="Email" id="rs-email" type="email" value={email} onChange={setEmail}/>

      <button className="btn primary" style={{marginTop:20, width:"100%"}}>Enregistrer</button>

      <p className="kicker" style={{marginTop:24}}>Session</p>
      <button onClick={onLogout}
              style={{
                marginTop:8, width:"100%", textAlign:"left",
                background:"var(--card)", border:"1px solid var(--line)",
                borderRadius:18, padding:"14px 16px",
                cursor:"pointer", display:"flex", alignItems:"center", gap:12, minHeight:60
              }}>
        <span style={{flex:1, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5}}>Se déconnecter</span>
        <IconChevronRS size={18}/>
      </button>

      <p className="kicker" style={{marginTop:24, color:"var(--accent)"}}>Zone sensible</p>
      <button style={{
        marginTop:8, width:"100%", textAlign:"left",
        background:"var(--paper)", border:"1px solid var(--line)",
        borderRadius:18, padding:"14px 16px",
        cursor:"pointer", color:"var(--accent)",
        fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5
      }}>
        Supprimer mon compte léger
      </button>
      <p className="meta" style={{marginTop:10, lineHeight:1.5}}>
        Les carnets restent chez leurs familles — tu perds seulement l'accès rapide.
      </p>
    </RSubPage>
  );
}

function RsField({label, id, type="text", value, onChange}){
  return (
    <div style={{marginTop:18}}>
      <label htmlFor={id} style={{display:"block", fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:6}}>{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
             style={{width:"100%", minHeight:48, border:"1px solid var(--line-2)", background:"var(--paper)", borderRadius:14, padding:"12px 14px", fontSize:16, fontFamily:"var(--sans)", color:"var(--ink)"}}/>
    </div>
  );
}

/* ─── Accès reçus ─── */
function RelaisAccessPage({onBack}){
  return (
    <RSubPage title="Accès reçus" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Les liens qu'on t'a partagés et leur durée de validité.
      </p>

      <ul style={{listStyle:"none", padding:0, margin:"22px 0 0", display:"grid", gap:10}}>
        {RELAIS_CARNETS.map(c => (
          <li key={c.id} className="card" style={{padding:14}}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <AvRS name={c.sharedBy} size={36} tone="cool"/>
              <div style={{flex:1, minWidth:0}}>
                <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5}}>
                  Carnet de <strong>{c.profile.name}</strong>
                </p>
                <p className="meta" style={{marginTop:2}}>
                  Partagé par {c.sharedBy} · {softDateRS(c.sharedAt)}
                </p>
              </div>
              <span className="mono" style={{padding:"4px 10px", fontSize:11, borderRadius:8, background: c.expiresIn > 2 ? "var(--c-gouts)" : "var(--c-apaise)", color: c.expiresIn > 2 ? "var(--c-gouts-ink)" : "var(--c-apaise-ink)", letterSpacing:".08em"}}>
                {c.expiresIn} J
              </span>
            </div>
            <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
              <span className="chip" style={{minHeight:32, padding:"4px 10px", fontSize:12}}>
                {c.included.length} rubriques visibles
              </span>
              <button className="chip" style={{marginLeft:"auto", color:"var(--accent)", fontSize:13}}>
                Retirer cet accès
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="meta" style={{marginTop:18, textAlign:"center", lineHeight:1.55}}>
        Les familles peuvent révoquer un lien à tout moment.
      </p>
    </RSubPage>
  );
}

/* ─── Accessibilité ─── */
function RelaisA11yPage({onBack}){
  const [a, setA] = useA11yRS();
  return (
    <RSubPage title="Accessibilité" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Ajuste à ton confort — les changements s'appliquent tout de suite.
      </p>

      <div style={{marginTop:18, display:"grid", gap:10}}>
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)", marginBottom:10}}>Taille du texte</p>
          <div role="radiogroup" aria-label="Taille du texte" style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
            {[{id:"regular", size:14},{id:"large", size:16},{id:"xlarge", size:18}].map(o => {
              const on = a.textSize === o.id;
              return (
                <button key={o.id} role="radio" aria-checked={on} onClick={() => setA("textSize", o.id)}
                        style={{border:"1px solid " + (on ? "var(--ink)" : "var(--line-2)"), background: on ? "var(--ink)" : "var(--paper)", color: on ? "var(--paper)" : "var(--ink)", borderRadius:14, padding:"12px 8px", cursor:"pointer", minHeight:54, fontSize:o.size, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em"}}>
                  Aa
                </button>
              );
            })}
          </div>
        </div>

        <RsToggle title="Contraste renforcé" body="Bords plus marqués." checked={a.highContrast} onChange={v => setA("highContrast", v)}/>
        <RsToggle title="Réduire les animations" body="Moins de mouvement." checked={a.reduceMotion} onChange={v => setA("reduceMotion", v)}/>
        <RsToggle title="Lecture facilitée" body="Police et espacements pensés pour la dyslexie." checked={a.dyslexia} onChange={v => setA("dyslexia", v)}/>
        <RsToggle title="Lecture à voix haute" body="Affiche un bouton « lire »." checked={a.ttsOnRead} onChange={v => setA("ttsOnRead", v)}/>
      </div>
    </RSubPage>
  );
}

function RsToggle({title, body, checked, onChange}){
  return (
    <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
      <div style={{flex:1, minWidth:0}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>{title}</p>
        <p style={{marginTop:4, fontSize:13, color:"var(--ink-2)"}}>{body}</p>
      </div>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} aria-label={title}
              style={{width:46, height:26, borderRadius:999, border:"none", padding:3, background: checked ? "var(--accent)" : "var(--line-2)", cursor:"pointer", flexShrink:0}}>
        <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: checked ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
      </button>
    </div>
  );
}

/* ─── Notifications ─── */
function RelaisNotifPage({onBack}){
  const [prefs, setPrefs] = useSRS({newShare:true, reminder:false, update:true, mute:false});
  const setP = (k, v) => setPrefs(p => ({...p, [k]: v}));
  return (
    <RSubPage title="Notifications" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Pour rester au courant sans être dérangé·e.
      </p>
      <div style={{marginTop:18, display:"grid", gap:10}}>
        <RsToggle title="Nouveau carnet partagé" body="Quand quelqu'un te confie un carnet." checked={prefs.newShare} onChange={v => setP("newShare", v)}/>
        <RsToggle title="Rappels du jour" body="Pour cet après-midi, Aznavour la fera fondre." checked={prefs.reminder} onChange={v => setP("reminder", v)}/>
        <RsToggle title="Mises à jour du carnet" body="Quand une famille ajoute une info importante." checked={prefs.update} onChange={v => setP("update", v)}/>
      </div>
      <p className="kicker" style={{marginTop:22}}>Mode silencieux</p>
      <RsToggle title="Ne pas déranger" body="Aucune notification pendant 24h." checked={prefs.mute} onChange={v => setP("mute", v)}/>
    </RSubPage>
  );
}

/* ─── Apparence ─── */
function RelaisAppearancePage({onBack}){
  const [theme, setTheme] = useSRS("clair");
  return (
    <RSubPage title="Apparence" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Pour le confort de tes yeux.
      </p>
      <div role="radiogroup" aria-label="Thème" style={{marginTop:22, display:"grid", gap:10}}>
        {[
          {id:"clair", title:"Clair", body:"Fond crème, texte navy.", swatch:["#FFFFFF", "#161E2B"]},
          {id:"soir",  title:"Mode soir", body:"Sombre chaud, repose les yeux.", swatch:["#1A1A1F", "#F0EBE0"]},
          {id:"auto",  title:"Automatique", body:"Suit l'heure du téléphone.", swatch:["#FFFFFF", "#1A1A1F"]}
        ].map(t => {
          const on = theme === t.id;
          return (
            <button key={t.id} role="radio" aria-checked={on} onClick={() => setTheme(t.id)}
                    style={{
                      width:"100%", textAlign:"left",
                      background: on ? "var(--ink)" : "var(--card)",
                      color: on ? "var(--paper)" : "var(--ink)",
                      border: "1px solid " + (on ? "var(--ink)" : "var(--line)"),
                      borderRadius:18, padding:"14px 16px",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:12, minHeight:64
                    }}>
              <div style={{display:"flex", width:48, height:36, borderRadius:8, overflow:"hidden", border:"1px solid rgba(0,0,0,.1)", flexShrink:0}}>
                <span style={{flex:1, background:t.swatch[0]}}/>
                <span style={{flex:1, background:t.swatch[1]}}/>
              </div>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{t.title}</span>
                <span style={{display:"block", marginTop:2, fontSize:13, opacity:.75, lineHeight:1.4}}>{t.body}</span>
              </span>
            </button>
          );
        })}
      </div>
    </RSubPage>
  );
}

/* ─── Aide & à propos ─── */
function RelaisHelpPage({onBack}){
  return (
    <RSubPage title="Aide & à propos" onBack={onBack}>
      <div className="hero" style={{padding:18, marginTop:6}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, letterSpacing:"-.01em"}}>
          Tu es invité·e à lire.
        </p>
        <p style={{marginTop:10, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
          Ces carnets sont confidentiels. Tu ne peux pas les modifier, juste y trouver ce qui t'aide à bien accompagner.
        </p>
      </div>

      <p className="kicker" style={{marginTop:22}}>Questions fréquentes</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        {[
          "Puis-je télécharger une fiche pour la lire hors ligne ?",
          "Que se passe-t-il quand le lien expire ?",
          "Comment retrouver un carnet plus tard ?",
          "Puis-je écrire dans le carnet ?",
          "Comment laisser un mot à la famille ?"
        ].map((q, i) => (
          <li key={i}>
            <button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"center", minHeight:56}}>
              <span style={{flex:1, fontSize:14.5, color:"var(--ink)"}}>{q}</span>
              <IconChevronRS size={16}/>
            </button>
          </li>
        ))}
      </ul>

      <p className="kicker" style={{marginTop:22}}>Mentions légales</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <li><button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"12px 16px", cursor:"pointer", minHeight:48, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>Conditions d'utilisation</button></li>
        <li><button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"12px 16px", cursor:"pointer", minHeight:48, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>Politique de confidentialité</button></li>
      </ul>

      <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.55}}>
        Le carnet vivant · v 1.0.0
      </p>
    </RSubPage>
  );
}

window.RelaisSettings = { RelaisSettings };
