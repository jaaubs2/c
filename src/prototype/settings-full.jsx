// Full Settings — menu router + sub-pages
const { useState: useSSet, useEffect: useESet, useMemo: useMSet } = React;
const {
  IconBack: IconBackSet, IconCheck: IconCheckSet, IconClose: IconCloseSet,
  IconLock: IconLockSet, IconSettings: IconSettingsSet, IconBell: IconBellSet,
  IconShare: IconShareSet, IconChevron: IconChevronSet, IconLink: IconLinkSet,
  IconEdit: IconEditSet, IconSparkle: IconSparkleSet,
  JeanneIllustration: JISet, AnneIllustration: AISet
} = window.Icons;
const { CATEGORIES: CATSet, CAT_BY_ID: CBYSet, softDate: softDateSet, ACTIVITY_LOG: ACTSet } = window.AppData;
const { StatusBar: SBSet, Avatar: AvSet, useA11y: useA11ySet } = window.UI;

/* ─── settings root ─── */
function SettingsFull({visibility, setVisibility, sharePayload, onLogout, live}){
  const [page, setPage] = useSSet("menu");

  function back(){ setPage("menu"); }

  // Avec un vrai compte : pages branchées sur le serveur.
  if(live){
    if(page === "account") return <LiveAccountPage live={live} onBack={back}/>;
    if(page === "me") return <LiveMePage live={live} onBack={back}/>;
    if(page === "profile") return <LivePersonPage live={live} onBack={back}/>;
    if(page === "circle") return <LiveCirclePage live={live} onBack={back}/>;
    if(page === "access") return <LiveAccessPage live={live} onBack={back} visibility={visibility} setVisibility={setVisibility}/>;
    if(page === "privacy") return <LivePrivacyPage live={live} onBack={back} onGo={setPage}/>;
  }

  if(page === "account") return <AccountPage onBack={back} onLogout={onLogout}/>;
  if(page === "me") return <MeProfilePage onBack={back}/>;
  if(page === "profile") return <ProfilePage onBack={back}/>;
  if(page === "circle") return <CirclePage onBack={back}/>;
  if(page === "access") return <AccessPage onBack={back} sharePayload={sharePayload} visibility={visibility} setVisibility={setVisibility}/>;
  if(page === "privacy") return <PrivacyPage onBack={back}/>;
  if(page === "a11y") return <A11yPage onBack={back}/>;
  if(page === "notif") return <NotifPrefsPage onBack={back}/>;
  if(page === "appear") return <AppearancePage onBack={back}/>;
  if(page === "help") return <HelpPage onBack={back}/>;

  return <SettingsMenu onPick={setPage} onLogout={onLogout}/>;
}

/* ─── menu ─── */
function SettingsMenu({onPick, onLogout}){
  const W = window.Who;
  const sections = [
    {group:"Toi",   items:[
      {id:"me",      title:"Mon profil",                     body:`Prénom, photo, lien avec ${W.person}.`},
      {id:"account", title:"Mon compte",                    body:"Email, mot de passe, déconnexion."},
      {id:"a11y",    title:"Accessibilité",                 body:"Taille, contraste, animations, voix."},
      {id:"notif",   title:"Notifications",                 body:"Rappels doux, consultations, mises à jour."},
      {id:"appear",  title:"Apparence",                     body:"Clair · Mode soir."}
    ]},
    {group:W.person,       items:[
      {id:"profile", title:`Profil de ${W.person}`,         body:"Prénom, avatar, âge, depuis…"},
      {id:"circle",  title:"Le cercle d'aidants",           body:W.demo ? "Anne, Léo · inviter d'autres proches." : "Inviter d'autres proches à contribuer."},
      {id:"access",  title:"Accès & partages",              body:"Liens de transmission, révoquer, journal."}
    ]},
    {group:"L'app", items:[
      {id:"privacy", title:"Confidentialité & données",     body:"Hébergement, exporter, supprimer."},
      {id:"help",    title:"Aide & à propos",               body:"FAQ, contact, mentions légales."}
    ]}
  ];

  return (
    <div className="screen fade-enter">
      <SBSet/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:24, marginLeft:4, letterSpacing:"-.02em"}}>Réglages</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 18px 24px"}}>
        {sections.map((sec, si) => (
          <section key={sec.group} style={{marginTop: si === 0 ? 4 : 22}}>
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
                    <IconChevronSet size={18}/>
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
          Le carnet vivant · version 1.0
        </p>
      </div>
    </div>
  );
}

/* ─── shared sub-page shell ─── */
function SubPage({title, onBack, children}){
  return (
    <div className="screen fade-enter">
      <SBSet/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackSet size={20}/></button>
        <h1 className="serif" style={{fontSize:20, letterSpacing:"-.01em"}}>{title}</h1>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        {children}
      </div>
    </div>
  );
}

/* ─── Mon compte ─── */
function AccountPage({onBack, onLogout}){
  const [confirmDelete, setConfirmDelete] = useSSet(false);
  return (
    <SubPage title="Mon compte" onBack={onBack}>
      <div className="card" style={{padding:16, display:"flex", gap:12, alignItems:"center"}}>
        <AvSet name="Anne C" size={48} tone="cool"/>
        <div>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17}}>Anne C.</p>
          <p className="meta" style={{marginTop:2}}>anne@example.com</p>
        </div>
      </div>

      <p className="kicker" style={{marginTop:24}}>Identifiants</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <RowItem label="Email" value="anne@example.com" action="Modifier"/>
        <RowItem label="Mot de passe" value="••••••••" action="Changer"/>
        <RowItem label="Authentification à deux facteurs" value="Désactivé" action="Activer"/>
      </ul>

      <p className="kicker" style={{marginTop:24}}>Session</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <li>
          <button onClick={onLogout}
                  style={{
                    width:"100%", textAlign:"left",
                    background:"var(--card)", border:"1px solid var(--line)",
                    borderRadius:18, padding:"14px 16px",
                    cursor:"pointer", display:"flex", alignItems:"center", gap:12, minHeight:60
                  }}>
            <span style={{flex:1, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5}}>Se déconnecter</span>
            <IconChevronSet size={18}/>
          </button>
        </li>
      </ul>

      <p className="kicker" style={{marginTop:24, color:"var(--accent)"}}>Zone sensible</p>

      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)}
                style={{
                  marginTop:10, width:"100%", textAlign:"left",
                  background:"var(--paper)", border:"1px solid var(--line)",
                  borderRadius:18, padding:"14px 16px",
                  cursor:"pointer", color:"var(--accent)",
                  fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5
                }}>
          Supprimer mon compte
        </button>
      ) : (
        <div className="card paper slide-up" style={{marginTop:10, padding:16}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>Tu pars vraiment ?</p>
          <p style={{marginTop:8, fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
            Si tu supprimes ton compte, on efface définitivement&nbsp;:
          </p>
          <ul style={{margin:"10px 0 0", paddingLeft:18, fontSize:14, color:"var(--ink-2)", lineHeight:1.7}}>
            <li>Le carnet de Jeanne (toutes les notes)</li>
            <li>Tes fiches partagées et leurs liens</li>
            <li>L'activité et l'historique d'accès</li>
          </ul>
          <p style={{marginTop:10, fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
            Si Anne fait partie d'un cercle d'aidants, les autres pourront continuer à contribuer.
          </p>
          <div style={{display:"flex", gap:8, marginTop:14}}>
            <button className="chip" onClick={() => setConfirmDelete(false)}>Annuler</button>
            <button className="chip" style={{marginLeft:"auto", color:"var(--accent)"}}>Exporter mes données d'abord</button>
          </div>
          <button className="btn" style={{marginTop:12, width:"100%", background:"var(--accent)", color:"var(--paper)"}}>
            Supprimer définitivement
          </button>
        </div>
      )}
    </SubPage>
  );
}

function RowItem({label, value, action}){
  return (
    <li>
      <button style={{
        width:"100%", textAlign:"left",
        background:"var(--card)", border:"1px solid var(--line)",
        borderRadius:18, padding:"12px 16px",
        cursor:"pointer", display:"flex", alignItems:"center", gap:12, minHeight:56
      }}>
        <span style={{flex:1, minWidth:0}}>
          <span style={{display:"block", fontSize:13, color:"var(--ink-2)", letterSpacing:".02em"}}>{label}</span>
          <span style={{display:"block", marginTop:2, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15, color:"var(--ink)"}}>{value}</span>
        </span>
        {action && <span style={{fontSize:13, color:"var(--accent)", fontWeight:600}}>{action}</span>}
      </button>
    </li>
  );
}

/* ─── Mon profil (l'aidante elle-même) ─── */
function MeProfilePage({onBack}){
  const [name, setName] = useSSet("Anne");
  const [lastname, setLastname] = useSSet("Cottin");
  const [relation, setRelation] = useSSet("Sa fille");
  const [phone, setPhone] = useSSet("06 12 34 56 78");
  const [photo, setPhoto] = useSSet(null);
  const [saved, setSaved] = useSSet(false);
  const [showPicker, setShowPicker] = useSSet(false);
  const fileRef = React.useRef(null);

  function onPhotoPick(e){
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const url = URL.createObjectURL(f);
    setPhoto(url);
  }
  function save(){
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const RELATIONS_ME = ["Sa fille", "Son fils", "Sa belle-fille", "Son petit-fils", "Sa petite-fille", "Son conjoint", "Une amie", "Un voisin"];

  return (
    <SubPage title="Mon profil" onBack={onBack}>
      <input ref={fileRef} type="file" accept="image/*" aria-label="Choisir une photo de moi"
             onChange={onPhotoPick} style={{position:"absolute", width:0, height:0, opacity:0, pointerEvents:"none"}}/>

      <div className="card" style={{padding:18, display:"flex", gap:14, alignItems:"center"}}>
        <button onClick={() => fileRef.current && fileRef.current.click()}
                aria-label="Changer ma photo"
                style={{
                  width:72, height:72, borderRadius:"50%",
                  border:"2px dashed " + (photo ? "transparent" : "var(--line-2)"),
                  background:"var(--paper)", padding:0, cursor:"pointer",
                  overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center"
                }}>
          {photo
            ? <img src={photo} alt={name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
            : <AvSet name="Anne C" size={72} tone="cool"/>}
        </button>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, letterSpacing:"-.01em"}}>{name} {lastname.charAt(0)}.</p>
          <p className="meta" style={{marginTop:2}}>{relation} de Jeanne</p>
          <button onClick={() => fileRef.current && fileRef.current.click()}
                  className="chip" style={{marginTop:8, fontSize:12.5, padding:"5px 10px"}}>
            {photo ? "Changer la photo" : "Ajouter une photo"}
          </button>
          <button onClick={() => setShowPicker(v => !v)} className="chip" style={{marginTop:8, marginLeft:6, fontSize:12.5, padding:"5px 10px"}}>Changer l'avatar</button>
        </div>
      </div>
      {showPicker && <div className="card slide-up" style={{marginTop:10, padding:14}}><p className="kicker" style={{marginBottom:10}}>Choisir mon avatar</p><window.AvatarPicker name="Anne C" bg="var(--c-parler)" onPick={() => { setPhoto(null); setShowPicker(false); }}/></div>}

      <p className="kicker" style={{marginTop:24}}>Toi</p>
      <Field2 label="Prénom" id="me-name" value={name} onChange={setName}/>
      <Field2 label="Nom" id="me-lastname" value={lastname} onChange={setLastname}/>
      <Field2 label="Téléphone" id="me-phone" value={phone} onChange={setPhone}/>

      <p className="kicker" style={{marginTop:24}}>Ton lien avec Jeanne</p>
      <div role="radiogroup" aria-label="Ton lien avec Jeanne" style={{marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
        {RELATIONS_ME.map(r => {
          const on = relation === r;
          return (
            <button key={r} role="radio" aria-checked={on}
                    onClick={() => setRelation(r)}
                    className="card-press"
                    style={{
                      border: "2px solid " + (on ? "var(--accent)" : "var(--line-2)"),
                      background: "var(--paper)",
                      color: "var(--ink)",
                      borderRadius:14, padding:"10px 12px",
                      cursor:"pointer", minHeight:44,
                      font:"500 13.5px var(--sans)", textAlign:"center"
                    }}>
              {r}
            </button>
          );
        })}
      </div>

      <p className="meta" style={{marginTop:18, fontSize:12.5, lineHeight:1.55}}>
        Ce que tu mets ici n'apparaît pas dans le carnet de Jeanne. C'est uniquement ton profil dans l'app, visible par le cercle d'aidants.
      </p>

      <button onClick={save}
              className="btn primary"
              style={{marginTop:22, width:"100%", minHeight:48}}>
        Enregistrer
      </button>
      {saved && (
        <p className="slide-up" style={{marginTop:12, padding:"10px 14px", background:"var(--c-gouts)33",
            border:"1px solid var(--c-gouts)", borderRadius:14, fontSize:14, color:"var(--ink)", textAlign:"center"}}>
          Ton profil a été mis à jour.
        </p>
      )}
    </SubPage>
  );
}

/* ─── Profil de Jeanne ─── */
function ProfilePage({onBack}){
  const [name, setName] = useSSet("Jeanne");
  const [age, setAge] = useSSet(86);
  const [since, setSince] = useSSet("2 ans");
  const [relation, setRelation] = useSSet("Sa fille");
  const [avatar, setAvatar] = useSSet(0);
  const [photo, setPhoto] = useSSet(null);
  const [showAvatar, setShowAvatar] = useSSet(false);
  const [showRelation, setShowRelation] = useSSet(false);
  const [saved, setSaved] = useSSet(false);
  const fileRef = React.useRef(null);

  const AVATARS = [
    {id:0, style:"bun",   label:"Chignon"},
    {id:1, style:"bob",   label:"Carré"},
    {id:2, style:"short", label:"Court"},
    {id:3, style:"curly", label:"Bouclé"},
    {id:4, style:"wave",  label:"Ondulé"},
    {id:5, style:"long",  label:"Long"}
  ];
  const JAv = ({size, a}) => a.id === 0 ? <JISet size={size}/> : <window.Persona name="Jeanne Martin" seed={"jeanne-v" + a.id} style={a.style} size={size} bg="transparent"/>;
  const RELATIONS = ["Sa fille", "Son fils", "Son conjoint·e", "Un autre proche", "Un professionnel"];
  const current = AVATARS.find(a => a.id === avatar) || AVATARS[0];

  function onPhotoPick(e){
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    if(f.size > 8 * 1024 * 1024){ alert("Photo trop lourde (max 8 Mo)."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target.result); setShowAvatar(false); };
    reader.readAsDataURL(f);
  }

  function save(){
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <SubPage title="Profil de Jeanne" onBack={onBack}>
      <input ref={fileRef} type="file" accept="image/*" aria-label="Choisir une photo de Jeanne"
             onChange={onPhotoPick} style={{position:"absolute", width:0, height:0, opacity:0, pointerEvents:"none"}}/>

      <div className="card" style={{padding:16, display:"flex", gap:14, alignItems:"center"}}>
        <div style={{width:64, height:64, borderRadius:"50%", background:"var(--c-habitudes)", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
          {photo
            ? <img src={photo} alt="Jeanne" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
            : <JAv size={64} a={current}/>}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>{name || "—"}</p>
          <p className="meta" style={{marginTop:2}}>{age} ans · accompagnée depuis {since}</p>
        </div>
        <button className="chip" style={{minHeight:36, padding:"6px 12px", fontSize:13}}
                onClick={() => setShowAvatar(v => !v)}>
          {photo ? "Modifier" : "Changer l'avatar"}
        </button>
      </div>

      {showAvatar && (
        <div className="card slide-up" style={{marginTop:10, padding:14}}>
          <p className="kicker">Choisir un avatar</p>
          <div style={{marginTop:10, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10}}>
            {AVATARS.map(a => {
              const on = avatar === a.id && !photo;
              return (
                <button key={a.id} onClick={() => { setAvatar(a.id); setPhoto(null); setShowAvatar(false); }}
                        aria-pressed={on} aria-label={`Avatar ${a.label}`}
                        style={{
                          padding:8, border:"2px solid " + (on ? "var(--accent)" : "transparent"),
                          background:"transparent", borderRadius:16, cursor:"pointer",
                          display:"flex", flexDirection:"column", alignItems:"center", gap:6
                        }}>
                  <div style={{width:64, height:64, borderRadius:"50%", overflow:"hidden",
                              background:"var(--c-habitudes)", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
                    <JAv size={64} a={a}/>
                  </div>
                  <span style={{fontSize:11, color:"var(--ink-2)", textAlign:"center"}}>{a.label}</span>
                </button>
              );
            })}
            <button onClick={() => fileRef.current && fileRef.current.click()}
                    aria-label="Importer une photo de Jeanne"
                    style={{padding:8, border:"2px " + (photo ? "solid var(--accent)" : "dashed var(--line-2)"),
                            background: photo ? "var(--paper)" : "var(--paper)",
                            borderRadius:16, cursor:"pointer", display:"flex", flexDirection:"column",
                            alignItems:"center", justifyContent:"center", gap:6, minHeight:96, color:"var(--ink-2)", overflow:"hidden"}}>
              {photo ? (
                <>
                  <img src={photo} alt="" style={{width:64, height:64, borderRadius:14, objectFit:"cover"}}/>
                  <span style={{fontSize:11, color:"var(--accent)", fontWeight:600}}>Importée ✓</span>
                </>
              ) : (
                <>
                  <span style={{fontSize:24, lineHeight:1}}>+</span>
                  <span style={{fontSize:11}}>Photo</span>
                </>
              )}
            </button>
          </div>
          {photo && (
            <button onClick={() => setPhoto(null)}
                    style={{marginTop:12, background:"none", border:"none", color:"var(--ink-2)",
                            textDecoration:"underline", cursor:"pointer", fontSize:13, padding:0}}>
              Retirer la photo
            </button>
          )}
        </div>
      )}

      <Field2 label="Son prénom" id="pf-name" value={name} onChange={setName}/>
      <Field2 label="Son âge" id="pf-age" type="number" value={age} onChange={v => setAge(v ? Number(v) : "")}/>
      <Field2 label="Accompagnée depuis…" id="pf-since" value={since} onChange={setSince}/>

      <p className="kicker" style={{marginTop:24}}>Lien avec elle</p>
      <button onClick={() => setShowRelation(v => !v)}
              style={{marginTop:8, width:"100%", textAlign:"left",
                      background:"var(--card)", border:"1px solid var(--line)",
                      borderRadius:18, padding:"14px 16px", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:12, minHeight:56}}>
        <span style={{flex:1, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>{relation}</span>
        <IconChevronSet size={18} style={{transform: showRelation ? "rotate(90deg)" : "none", transition:"transform .2s"}}/>
      </button>
      {showRelation && (
        <div role="radiogroup" aria-label="Lien avec Jeanne"
             className="slide-up" style={{marginTop:10, display:"grid", gap:6}}>
          {RELATIONS.map(r => {
            const on = relation === r;
            return (
              <button key={r} role="radio" aria-checked={on}
                      onClick={() => { setRelation(r); setShowRelation(false); }}
                      style={{
                        width:"100%", textAlign:"left", cursor:"pointer",
                        background:"var(--card)",
                        border: "2px solid " + (on ? "var(--accent)" : "var(--line)"),
                        borderRadius:14, padding:"10px 14px", minHeight:44,
                        fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15, color:"var(--ink)"
                      }}>
                {r}
              </button>
            );
          })}
        </div>
      )}

      <button className="btn primary" style={{marginTop:24, width:"100%"}} onClick={save}>
        {saved ? "✓ Enregistré" : "Enregistrer"}
      </button>
      {saved && (
        <p className="slide-up" style={{marginTop:12, padding:"10px 14px", background:"var(--c-gouts)33",
            border:"1px solid var(--c-gouts)", borderRadius:14, fontSize:14, color:"var(--ink)", textAlign:"center"}}>
          Le profil de Jeanne a été mis à jour.
        </p>
      )}
    </SubPage>
  );
}

function Field2({label, id, type="text", value, onChange}){
  return (
    <div style={{marginTop:18}}>
      <label htmlFor={id} style={{display:"block", fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:6}}>{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
             style={{width:"100%", minHeight:48, border:"1px solid var(--line-2)", background:"var(--paper)", borderRadius:14, padding:"12px 14px", fontSize:16, fontFamily:"var(--sans)", color:"var(--ink)"}}/>
    </div>
  );
}

/* ─── Cercle d'aidants ─── */
function CirclePage({onBack}){
  const members = [
    {name:"Anne C.", role:"Sa fille", tag:"Toi", tone:"cool", contrib: 18, lastSeen:"il y a 3 h"},
    {name:"Léo C.", role:"Son petit-fils", tag:"Contributeur", tone:"sage", contrib: 3, lastSeen:"hier"}
  ];
  const [invite, setInvite] = useSSet(false);
  const [inviteEmail, setInviteEmail] = useSSet("");
  const [inviteRole, setInviteRole] = useSSet("contributeur");
  const [sent, setSent] = useSSet(null);

  function sendInvite(){
    const email = inviteEmail.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setSent({ok:false, msg:"Hmm, cet email n'a pas l'air valide."});
      return;
    }
    setSent({ok:true, msg:`Invitation envoyée à ${email}.`, email});
    setInviteEmail("");
    setInvite(false);
  }

  return (
    <SubPage title="Le cercle d'aidants" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Plusieurs proches peuvent contribuer au carnet. Chacun ajoute sa connaissance, avec son nom à côté.
      </p>

      <ul style={{listStyle:"none", padding:0, margin:"22px 0 0", display:"grid", gap:10}}>
        {members.map(m => (
          <li key={m.name} className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
            <AvSet name={m.name} size={44} tone={m.tone}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <span style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>{m.name}</span>
                {m.tag === "Toi" && (
                  <span className="mono" style={{fontSize:10, padding:"3px 7px", borderRadius:6, background:"var(--c-parler)", color:"var(--c-parler-ink)", letterSpacing:".08em"}}>TOI</span>
                )}
              </div>
              <p className="meta" style={{marginTop:2}}>{m.role} · {m.contrib} notes · vu {m.lastSeen}</p>
            </div>
            {m.tag !== "Toi" && (
              <button className="chip" style={{minHeight:36, padding:"6px 12px", fontSize:13}}>Gérer</button>
            )}
          </li>
        ))}
      </ul>

      {!invite ? (
        <button onClick={() => setInvite(true)}
                style={{
                  marginTop:18, width:"100%", textAlign:"left",
                  background:"var(--ink)", color:"var(--paper)", border:"none",
                  borderRadius:18, padding:"16px 16px", cursor:"pointer",
                  display:"flex", gap:12, alignItems:"center", minHeight:60
                }}>
          <span style={{width:36, height:36, borderRadius:11, background:"rgba(252,246,236,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, lineHeight:1}}>+</span>
          <span style={{flex:1, minWidth:0}}>
            <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>Inviter un autre proche</span>
            <span style={{display:"block", marginTop:2, fontSize:13, opacity:.75}}>Il pourra contribuer au carnet de Jeanne.</span>
          </span>
        </button>
      ) : (
        <div className="card slide-up" style={{marginTop:14, padding:16}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>Inviter quelqu'un</p>
          <Field2 label="Son email" id="circle-email" value={inviteEmail} onChange={setInviteEmail}/>
          <p className="kicker" style={{marginTop:18}}>Son rôle</p>
          <div className="seg" style={{marginTop:8}}>
            <button className={inviteRole === "contributeur" ? "on" : ""} onClick={() => setInviteRole("contributeur")}>Contributeur</button>
            <button className={inviteRole === "lecteur" ? "on" : ""} onClick={() => setInviteRole("lecteur")}>Lecteur</button>
          </div>
          <p style={{marginTop:8, fontSize:12.5, color:"var(--ink-2)", lineHeight:1.5}}>
            Le contributeur peut ajouter des notes, le lecteur ne peut que consulter.
          </p>
          <div style={{display:"flex", gap:8, marginTop:14}}>
            <button className="chip" onClick={() => { setInvite(false); setSent(null); }}>Annuler</button>
            <button className="btn primary" style={{flex:1, minHeight:44}} onClick={sendInvite}>Envoyer l'invitation</button>
          </div>
        </div>
      )}

      {sent && (
        <div className="slide-up" style={{
          marginTop:14, padding:"12px 14px",
          background: sent.ok ? "var(--c-gouts)33" : "#F1CFCB55",
          border: "1px solid " + (sent.ok ? "var(--c-gouts)" : "#F1CFCB"),
          borderRadius:14, display:"flex", gap:10, alignItems:"flex-start"
        }}>
          <span aria-hidden="true" style={{width:18, height:18, borderRadius:"50%", background: sent.ok ? "var(--c-gouts-ink)" : "#7A2A1E", color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1}}>
            {sent.ok ? <IconCheckSet size={12}/> : <span style={{fontSize:13, lineHeight:1}}>!</span>}
          </span>
          <p style={{fontSize:14, color:"var(--ink)", lineHeight:1.5, flex:1}}>
            {sent.msg}
            {sent.ok && <span style={{display:"block", marginTop:4, fontSize:12.5, color:"var(--ink-2)"}}>Tu seras notifié{"e"} dès qu'iel rejoint.</span>}
          </p>
          <button className="iconbtn" aria-label="Fermer" onClick={() => setSent(null)} style={{flexShrink:0}}>
            <IconCloseSet size={16}/>
          </button>
        </div>
      )}

      <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.5}}>
        Chaque note garde le nom de qui l'a ajoutée.
      </p>
    </SubPage>
  );
}

/* ─── Accès & partages ─── */
function AccessPage({onBack, sharePayload, visibility, setVisibility}){
  const [revoked, setRevoked] = useSSet(false);
  const ACT = ACTSet || [];

  return (
    <SubPage title="Accès & partages" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Liens actifs, ce que chacun voit, et le journal des consultations.
      </p>

      <p className="kicker" style={{marginTop:22}}>Liens actifs</p>
      <div className="card" style={{marginTop:10, padding:16}}>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <AvSet name={sharePayload.name} size={40} tone="sage"/>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{sharePayload.name}</p>
            <p className="meta" style={{marginTop:2}}>{sharePayload.recipient.title.toLowerCase()} · {sharePayload.included.length} rubriques</p>
          </div>
          <span className="mono" style={{padding:"4px 10px", fontSize:11, borderRadius:8, background: revoked ? "rgba(0,0,0,.08)" : "var(--c-gouts)", color: revoked ? "var(--ink-3)" : "var(--c-gouts-ink)", letterSpacing:".08em"}}>
            {revoked ? "RÉVOQUÉ" : "ACTIF"}
          </span>
        </div>

        <p className="meta" style={{marginTop:14, padding:"10px 0 0", borderTop:"1px solid var(--line)"}}>
          Partagé il y a 2 jours · valable encore 5 jours · 1 consultation
        </p>

        <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
          <button className="chip"><IconLinkSet size={14}/> Voir le lien</button>
          <button className="chip">Renouveler 7 jours</button>
          <button className="chip" disabled={revoked} onClick={() => setRevoked(true)}
                  style={{marginLeft:"auto", color: revoked ? "var(--ink-3)" : "var(--accent)"}}>
            {revoked ? "Révoqué" : "Révoquer"}
          </button>
        </div>
      </div>

      <p className="kicker" style={{marginTop:22}}>Journal d'accès</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:0, borderRadius:18, overflow:"hidden", border:"1px solid var(--line)"}}>
        {ACT.map((a, i) => (
          <li key={a.id} style={{
            display:"flex", gap:12, padding:"14px 16px",
            background:"var(--card)",
            borderBottom: i < ACT.length - 1 ? "1px solid var(--line)" : "none"
          }}>
            <span aria-hidden="true" style={{
              width:8, height:8, borderRadius:"50%", marginTop:6, flexShrink:0,
              background: a.kind === "read" ? "var(--c-gouts)" :
                          a.kind === "add" ? "var(--c-histoire)" :
                          a.kind === "share" ? "var(--c-proches)" : "var(--c-apaise)"
            }}/>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontSize:14, color:"var(--ink)", lineHeight:1.4}}>
                <strong>{a.who}</strong> {a.what}
              </p>
              <p style={{marginTop:2, fontSize:12, color:"var(--ink-2)"}}>{a.detail} · {softDateSet(a.ts)}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="kicker" style={{marginTop:22}}>Rubriques masquables</p>
      <p style={{marginTop:6, fontSize:13, color:"var(--ink-2)"}}>Désactive une rubrique pour qu'elle n'apparaisse dans aucune fiche partagée.</p>
      <div style={{marginTop:10, display:"grid", gap:6}}>
        {CATSet.map(c => {
          const on = visibility[c.id] !== false;
          const Icon = c.Icon;
          return (
            <div key={c.id} className="card" style={{padding:12, display:"flex", gap:12, alignItems:"center"}}>
              <span style={{width:30, height:30, borderRadius:9, background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                <Icon size={15} sw={1.6}/>
              </span>
              <span style={{flex:1, minWidth:0, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>{c.title}</span>
              <button role="switch" aria-checked={on}
                      onClick={() => setVisibility({...visibility, [c.id]: !on})}
                      aria-label={`Inclure ${c.title}`}
                      style={{width:46, height:26, borderRadius:999, border:"none", padding:3, background: on ? "var(--accent)" : "var(--line-2)", cursor:"pointer", flexShrink:0}}>
                <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: on ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
              </button>
            </div>
          );
        })}
      </div>
    </SubPage>
  );
}

/* ─── Confidentialité & données ─── */
function PrivacyPage({onBack}){
  return (
    <SubPage title="Confidentialité & données" onBack={onBack}>
      <div className="hero cool" style={{padding:18, marginTop:6}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, letterSpacing:"-.01em"}}>
          Tes données t'appartiennent.
        </p>
        <p style={{marginTop:10, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
          Tout ce qu'on stocke est chiffré et hébergé dans l'Union européenne, conformément au RGPD.
        </p>
      </div>

      <p className="kicker" style={{marginTop:22}}>Où sont stockées les données</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <RowItem label="Hébergement" value="Union européenne" />
        <RowItem label="Chiffrement" value="AES-256 au repos & en transit" />
        <RowItem label="Conformité" value="RGPD · non médical" />
      </ul>

      <p className="kicker" style={{marginTop:22}}>Consentements donnés</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <RowItem label="Conditions d'utilisation" value="Acceptées le 12 mai 2024" action="Relire"/>
        <RowItem label="Politique de confidentialité" value="v 2.1 · acceptée" action="Relire"/>
        <RowItem label="Données sensibles" value="Comprises et acceptées" action="Détails"/>
      </ul>

      <p className="kicker" style={{marginTop:22}}>Tes droits</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <li>
          <button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"center", minHeight:60}}>
            <span style={{flex:1, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5}}>Exporter mes données</span>
            <span className="mono" style={{fontSize:11, color:"var(--ink-2)"}}>JSON · PDF</span>
            <IconChevronSet size={18}/>
          </button>
        </li>
        <li>
          <button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"center", minHeight:60}}>
            <span style={{flex:1, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5}}>Demander l'effacement total</span>
            <IconChevronSet size={18}/>
          </button>
        </li>
      </ul>

      <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.55}}>
        Contact DPO : <a href="#" style={{color:"var(--ink)", textDecoration:"underline"}}>dpo@carnet-vivant.fr</a>
      </p>
    </SubPage>
  );
}

/* ─── Accessibilité ─── */
function A11yPage({onBack}){
  const [a, setA] = useA11ySet();
  return (
    <SubPage title="Accessibilité" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        L'aidant est souvent fatigué. Ajuste à ton confort — les changements s'appliquent tout de suite.
      </p>

      <div style={{marginTop:18, display:"grid", gap:10}}>
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)", marginBottom:10}}>Taille du texte</p>
          <div role="radiogroup" aria-label="Taille du texte" style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6}}>
            {[{id:"regular", label:"Normal", size:14},{id:"large", label:"Grand", size:16},{id:"xlarge", label:"Très grand", size:18}].map(o => {
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

        <ToggleCard title="Contraste renforcé" body="Bords plus marqués, gris plus foncés."
                    checked={a.highContrast} onChange={v => setA("highContrast", v)}/>
        <ToggleCard title="Réduire les animations" body="Moins de mouvement à l'écran."
                    checked={a.reduceMotion} onChange={v => setA("reduceMotion", v)}/>
        <ToggleCard title="Lecture facilitée" body="Police Atkinson Hyperlegible, lettres et lignes plus espacées. Pensé pour la dyslexie et la fatigue visuelle."
                    checked={a.dyslexia} onChange={v => setA("dyslexia", v)}/>
        <ToggleCard title="Lecture à voix haute" body="Affiche un bouton « lire » sur les notes."
                    checked={a.ttsOnRead} onChange={v => setA("ttsOnRead", v)}/>
      </div>

      <div className="card" style={{marginTop:16, padding:16, background:"var(--c-sante)", color:"var(--c-sante-ink)"}}>
        <p style={{font:"800 14.5px var(--sans)"}}>Ce que nous garantissons</p>
        <ul style={{margin:"8px 0 0", paddingLeft:18, fontSize:13.5, fontWeight:600, lineHeight:1.6}}>
          <li>Contraste texte ≥ 4,5:1 sur toutes les tuiles (WCAG 1.4.3)</li>
          <li>Cibles tactiles ≥ 44 px (WCAG 2.5.5)</li>
          <li>Navigation clavier complète, focus visible (2.1.1, 2.4.7)</li>
          <li>Chaque note écoutable, chaque écran dictable (1.1.1)</li>
        </ul>
      </div>
      <p className="meta" style={{marginTop:16, textAlign:"center", lineHeight:1.55}}>
        Tes préférences sont enregistrées sur cet appareil seulement.
      </p>
    </SubPage>
  );
}

function ToggleCard({title, body, checked, onChange}){
  return (
    <div className="card" style={{padding:14, display:"flex", gap:12, alignItems:"center"}}>
      <div style={{flex:1, minWidth:0}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15.5, color:"var(--ink)"}}>{title}</p>
        <p style={{marginTop:4, fontSize:13, color:"var(--ink-2)"}}>{body}</p>
      </div>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
              aria-label={title}
              style={{width:46, height:26, borderRadius:999, border:"none", padding:3, background: checked ? "var(--accent)" : "var(--line-2)", cursor:"pointer", flexShrink:0}}>
        <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: checked ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
      </button>
    </div>
  );
}

/* ─── Notifications ─── */
function NotifPrefsPage({onBack}){
  const [prefs, setPrefs] = useSSet({
    gentle:true, reads:true, stale:true, weekly:false, mute:false
  });
  const setP = (k, v) => setPrefs(p => ({...p, [k]: v}));
  return (
    <SubPage title="Notifications" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        On ne notifie jamais d'urgence santé. Juste ce qui peut t'aider à transmettre.
      </p>

      <div style={{marginTop:18, display:"grid", gap:10}}>
        <ToggleCard title="Rappels doux"          body="Pour cet après-midi, Aznavour la fera fondre."
                    checked={prefs.gentle} onChange={v => setP("gentle", v)}/>
        <ToggleCard title="Consultations de fiche" body="Quand un proche ouvre la fiche partagée."
                    checked={prefs.reads}  onChange={v => setP("reads", v)}/>
        <ToggleCard title="Invitations à actualiser" body="Quand une info qui date pourrait être mise à jour."
                    checked={prefs.stale}  onChange={v => setP("stale", v)}/>
        <ToggleCard title="Résumé hebdomadaire" body={`« Cette semaine dans le carnet de ${window.Who.person} ».`}
                    checked={prefs.weekly} onChange={v => setP("weekly", v)}/>
      </div>

      <p className="kicker" style={{marginTop:22}}>Mode silencieux</p>
      <ToggleCard title="Ne pas déranger" body="Aucune notification pendant 24h." checked={prefs.mute} onChange={v => setP("mute", v)}/>
    </SubPage>
  );
}

/* ─── Apparence ─── */
function AppearancePage({onBack}){
  const [theme, setTheme] = useSSet("clair");
  return (
    <SubPage title="Apparence" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>
        Pour le confort de tes yeux, surtout en fin de journée.
      </p>

      <div role="radiogroup" aria-label="Thème" style={{marginTop:22, display:"grid", gap:10}}>
        {[
          {id:"clair", title:"Clair",            body:"Fond crème, texte navy. Le défaut.", swatch:["#FFFFFF", "#161E2B"]},
          {id:"soir",  title:"Mode soir",        body:"Fond sombre chaud, texte clair. Repose les yeux.", swatch:["#1A1A1F", "#F0EBE0"]},
          {id:"auto",  title:"Automatique",      body:"Suit l'heure du téléphone — clair le jour, sombre le soir.", swatch:["#FFFFFF", "#1A1A1F"]}
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

      <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.55}}>
        Tu peux aussi tout retoucher finement via le panneau Tweaks.
      </p>
    </SubPage>
  );
}

/* ─── Aide & à propos ─── */
function HelpPage({onBack}){
  return (
    <SubPage title="Aide & à propos" onBack={onBack}>
      <div className="hero" style={{padding:18, marginTop:6}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, letterSpacing:"-.01em"}}>
          Ce n'est pas un outil médical.
        </p>
        <p style={{marginTop:10, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
          Aucun diagnostic, aucune donnée clinique — juste l'humain qu'on transmet.
          Pour toute urgence : 15 (Samu) · 3919 (violences conjugales) · 3114 (prévention suicide).
        </p>
      </div>

      <p className="kicker" style={{marginTop:22}}>Questions fréquentes</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        {[
          "Que se passe-t-il si je n'ai plus mon téléphone ?",
          "Puis-je inviter une auxiliaire de vie ?",
          "Comment supprimer un partage ?",
          "Le carnet est-il accessible à l'administration ?",
          "Que devient le carnet après le décès ?"
        ].map((q, i) => (
          <li key={i}>
            <button style={{width:"100%", textAlign:"left", background:"var(--card)", border:"1px solid var(--line)", borderRadius:18, padding:"14px 16px", cursor:"pointer", display:"flex", gap:12, alignItems:"center", minHeight:56}}>
              <span style={{flex:1, fontSize:14.5, color:"var(--ink)"}}>{q}</span>
              <IconChevronSet size={16}/>
            </button>
          </li>
        ))}
      </ul>

      <p className="kicker" style={{marginTop:22}}>Nous contacter</p>
      <div className="card" style={{marginTop:10, padding:16}}>
        <p style={{fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
          Une question, un retour ? Écris-nous, on lit tout.
        </p>
        <p style={{marginTop:10, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>contact@carnet-vivant.fr</p>
      </div>

      <p className="kicker" style={{marginTop:22}}>Mentions légales</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <RowItem label="Conditions d'utilisation" value="v 2.1" action="Lire"/>
        <RowItem label="Politique de confidentialité" value="v 2.1" action="Lire"/>
        <RowItem label="Mentions légales" value="Carnet Vivant SAS" action="Lire"/>
        <RowItem label="Licences open-source" value="React · Inter · Fraunces" action="Voir"/>
      </ul>

      <p className="meta" style={{marginTop:20, textAlign:"center", lineHeight:1.55}}>
        Le carnet vivant · v 1.0.0 · build 124
      </p>
    </SubPage>
  );
}

/* ════════ Pages réelles (vrais comptes) ════════ */
const LiveRow = ({label, value}) => (
  <li className="card" style={{padding:"12px 16px", display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
    <span style={{fontSize:13, color:"var(--ink-2)"}}>{label}</span>
    <span style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:14.5, textAlign:"right"}}>{value}</span>
  </li>
);
const liveInput = {width:"100%", minHeight:52, borderRadius:16, border:"none", background:"#fff", padding:"0 16px", font:"600 16px var(--sans)", color:"var(--ink)", boxShadow:"inset 0 0 0 1.5px var(--line)"};
const Saved = ({on}) => on ? <p role="status" className="meta" style={{marginTop:10, fontWeight:700, color:"#3F7A57"}}>Enregistré.</p> : null;

function LiveAccountPage({live, onBack}){
  const [confirm, setConfirm] = useSSet(false);
  const a = window.BUI.useAction();
  const W = window.Who;
  const owner = live.carnet && live.carnet.my_role === "owner";
  return (
    <SubPage title="Mon compte" onBack={onBack}>
      <div className="card" style={{padding:16, display:"flex", gap:12, alignItems:"center"}}>
        <AvSet name={live.name || "Toi"} size={48} tone="cool"/>
        <div style={{minWidth:0}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17}}>{live.name || "Mon compte"}</p>
          <p className="meta" style={{marginTop:2, wordBreak:"break-all"}}>{live.email}</p>
        </div>
      </div>
      <p className="meta" style={{marginTop:14, lineHeight:1.5}}>Pour changer de mot de passe : déconnecte-toi, puis choisis « Mot de passe oublié ». Tu recevras un code par email.</p>

      <button className="card card-press" onClick={live.onLogout} style={{marginTop:18, width:"100%", textAlign:"left", cursor:"pointer", padding:"14px 16px", font:"800 15px var(--sans)"}}>Se déconnecter</button>

      <p className="kicker" style={{marginTop:26, color:"var(--accent)"}}>Zone sensible</p>
      {!confirm ? (
        <button onClick={() => setConfirm(true)} className="card" style={{marginTop:10, width:"100%", textAlign:"left", cursor:"pointer", padding:"14px 16px", color:"#8C1D18", font:"800 15px var(--sans)"}}>Supprimer mon compte</button>
      ) : (
        <div className="card slide-up" style={{marginTop:10, padding:16}}>
          <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>Tu pars vraiment ?</p>
          <p style={{marginTop:8, fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>On efface définitivement, sans retour possible :</p>
          <ul style={{margin:"10px 0 0", paddingLeft:18, fontSize:14, color:"var(--ink-2)", lineHeight:1.7}}>
            <li>ton compte et tes consentements</li>
            {owner && <li>le carnet de {W.person}, toutes ses notes, y compris celles du cercle</li>}
            {owner && <li>les fiches partagées : leurs liens ne s'ouvriront plus</li>}
            {!owner && <li>ta participation aux carnets où tu étais invité·e</li>}
          </ul>
          <button className="btn soft" style={{marginTop:14, width:"100%"}} onClick={() => a.run(live.onExport).catch(() => {})}>Exporter mes données d'abord</button>
          <window.BUI.FormError msg={a.error}/>
          <div style={{display:"flex", gap:8, marginTop:10}}>
            <button className="btn soft" style={{flex:1}} onClick={() => setConfirm(false)}>Annuler</button>
            <button className="btn" style={{flex:1, background:"#8C1D18", color:"#fff"}} disabled={a.busy}
                    onClick={() => a.run(live.onDeleteAccount).catch(() => {})}>{a.busy ? "Suppression…" : "Supprimer"}</button>
          </div>
        </div>
      )}
    </SubPage>
  );
}

function LiveMePage({live, onBack}){
  const [name, setName] = useSSet(live.name || "");
  const [saved, setSaved] = useSSet(false);
  const a = window.BUI.useAction();
  return (
    <SubPage title="Mon profil" onBack={onBack}>
      <label style={{display:"block", marginTop:8}}><span className="kicker" style={{display:"block", marginBottom:8}}>Ton prénom</span>
        <input value={name} onChange={e => { setName(e.target.value); setSaved(false); }} maxLength={80} style={liveInput} autoComplete="given-name"/></label>
      <p className="meta" style={{marginTop:10, lineHeight:1.5}}>C'est ce nom qui signe tes notes et qui apparaît sur les fiches que tu partages.</p>
      <window.BUI.FormError msg={a.error}/>
      <button className="btn" style={{marginTop:18, width:"100%"}} disabled={!name.trim() || a.busy}
              onClick={() => a.run(() => live.onSaveProfile(name.trim())).then(() => setSaved(true)).catch(() => {})}>{a.busy ? "Enregistrement…" : "Enregistrer"}</button>
      <Saved on={saved}/>
    </SubPage>
  );
}

function LivePersonPage({live, onBack}){
  const k = live.carnet || {};
  const owner = k.my_role === "owner";
  const [f, setF] = useSSet({ name:k.person_name || "", age:k.person_age ?? "", since:k.since_label || "", pronoun:k.pronoun || "elle" });
  const [saved, setSaved] = useSSet(false);
  const a = window.BUI.useAction();
  const up = (key, v) => { setF(p => ({...p, [key]:v})); setSaved(false); };
  return (
    <SubPage title={`Profil de ${window.Who.person}`} onBack={onBack}>
      {!owner && <p className="meta" style={{marginTop:6, lineHeight:1.5}}>Seule la personne qui tient le carnet peut modifier ce profil.</p>}
      <fieldset disabled={!owner} style={{border:"none", padding:0, margin:0, display:"grid", gap:14, marginTop:8}}>
        <label><span className="kicker" style={{display:"block", marginBottom:8}}>Prénom (et nom si tu veux)</span>
          <input value={f.name} onChange={e => up("name", e.target.value)} maxLength={80} style={liveInput}/></label>
        <div>
          <span className="kicker" style={{display:"block", marginBottom:8}}>On parle d'elle ou de lui ?</span>
          <div role="radiogroup" aria-label="Pronom" style={{display:"flex", gap:8}}>
            {[["elle", "Elle"], ["il", "Il"]].map(([id, l]) => <button key={id} role="radio" className="chip" aria-checked={f.pronoun === id} aria-pressed={f.pronoun === id} onClick={() => up("pronoun", id)}>{l}</button>)}
          </div>
        </div>
        <label><span className="kicker" style={{display:"block", marginBottom:8}}>Âge</span>
          <input value={f.age} onChange={e => up("age", e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" style={liveInput}/></label>
        <label><span className="kicker" style={{display:"block", marginBottom:8}}>Accompagné{f.pronoun === "il" ? "" : "e"} depuis</span>
          <input value={f.since} onChange={e => up("since", e.target.value)} maxLength={40} placeholder="2 ans" style={liveInput}/></label>
      </fieldset>
      <window.BUI.FormError msg={a.error}/>
      {owner && <button className="btn" style={{marginTop:18, width:"100%"}} disabled={!f.name.trim() || a.busy}
              onClick={() => a.run(() => live.onSaveCarnet({ name:f.name.trim(), age:f.age, since:f.since, pronoun:f.pronoun })).then(() => setSaved(true)).catch(() => {})}>{a.busy ? "Enregistrement…" : "Enregistrer"}</button>}
      <Saved on={saved}/>
    </SubPage>
  );
}

function LiveCirclePage({live, onBack}){
  const W = window.Who;
  const owner = live.carnet && live.carnet.my_role === "owner";
  const [members, setMembers] = useSSet(null);
  const [f, setF] = useSSet({ name:"", relation:"" });
  const [invite, setInvite] = useSSet(null);
  const a = window.BUI.useAction();
  useESet(() => { live.listMembers().then(setMembers).catch(() => setMembers([])); }, []);
  return (
    <SubPage title="Le cercle d'aidants" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>Les proches invités lisent le carnet de {W.person} et y ajoutent ce qu'ils savent. Chaque note est signée.</p>
      <p className="kicker" style={{marginTop:22}}>Dans le cercle</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        {owner && <LiveRow label={`${live.name || "Toi"} · toi`} value="Tient le carnet"/>}
        {members === null && <li className="meta">Chargement…</li>}
        {members && members.map(m => <LiveRow key={m.user_id} label={`${m.display_name || "Proche"}${m.relation ? " · " + m.relation : ""}`} value={`${m.contributions} note${m.contributions > 1 ? "s" : ""}`}/>)}
        {members && members.length === 0 && <li className="meta" style={{padding:"4px 2px"}}>Personne d'autre pour l'instant.</li>}
      </ul>
      {owner && !invite && (<>
        <p className="kicker" style={{marginTop:24}}>Inviter un proche</p>
        <div style={{display:"grid", gap:10, marginTop:10}}>
          <input value={f.name} onChange={e => setF(p => ({...p, name:e.target.value}))} placeholder="Son prénom" maxLength={80} style={liveInput} aria-label="Prénom du proche"/>
          <input value={f.relation} onChange={e => setF(p => ({...p, relation:e.target.value}))} placeholder={`Son lien avec ${W.person} (ex. ${W.g("son", "son")} petit-fils)`} maxLength={60} style={liveInput} aria-label="Son lien"/>
        </div>
        <window.BUI.FormError msg={a.error}/>
        <button className="btn" style={{marginTop:14, width:"100%"}} disabled={!f.name.trim() || a.busy}
                onClick={() => a.run(() => live.onInvite({ name:f.name.trim(), relation:f.relation.trim() })).then(setInvite).catch(() => {})}>{a.busy ? "Création…" : "Créer le lien d'invitation"}</button>
      </>)}
      {invite && (
        <div style={{marginTop:22}}>
          <p className="kicker">Invitation pour {f.name}</p>
          <p className="meta" style={{marginTop:6, marginBottom:10, lineHeight:1.5}}>Envoie-lui ce lien. Il ne sert qu'une fois : {f.name} créera son compte et rejoindra le cercle.</p>
          <window.BUI.LinkBox url={invite.url} expiresAt={invite.expiresAt} shareText={`${live.name || "Je"} t'invite au carnet de ${W.person}`}/>
          <button className="btn soft" style={{marginTop:12, width:"100%"}} onClick={() => { setInvite(null); setF({name:"", relation:""}); }}>Inviter quelqu'un d'autre</button>
        </div>
      )}
    </SubPage>
  );
}

function LiveAccessPage({live, onBack, visibility, setVisibility}){
  const shares = live.shares || [];
  const now = Date.now();
  return (
    <SubPage title="Accès & partages" onBack={onBack}>
      <p style={{marginTop:6, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>Chaque fiche partagée, ce qu'elle montre et combien de fois elle a été ouverte. Tu crées les liens depuis « Transmettre ».</p>
      <p className="kicker" style={{marginTop:22}}>Fiches partagées</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:8}}>
        {shares.length === 0 && <li className="card" style={{padding:16}}><p className="meta">Aucune fiche partagée pour l'instant.</p></li>}
        {shares.map(sh => { const st = sh.revokedAt ? "Désactivée" : sh.expiresAt <= now ? "Expirée" : "Active"; return (
          <li key={sh.id} className="card" style={{padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:10, alignItems:"center"}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{sh.name || "Relais"}</p>
              <span className="mono" style={{padding:"4px 10px", fontSize:11, borderRadius:8, background: st === "Active" ? "var(--c-gouts)" : "rgba(0,0,0,.08)", color: st === "Active" ? "var(--c-gouts-ink)" : "var(--ink-3)", letterSpacing:".08em"}}>{st.toUpperCase()}</span>
            </div>
            <p className="meta" style={{marginTop:8}}>{sh.included.map(id => CBYSet[id]?.title).join(" · ")}</p>
            <p className="meta" style={{marginTop:6}}>Créée {softDateSet(sh.createdAt)} · {sh.openCount ? `ouverte ${sh.openCount} fois, la dernière ${softDateSet(sh.lastOpenedAt)}` : "jamais ouverte"}</p>
            {st === "Active" && <button className="chip" style={{marginTop:10, color:"#8C1D18"}} onClick={() => live.onRevoke(sh.id)}>Désactiver ce lien</button>}
          </li>
        ); })}
      </ul>
      <p className="kicker" style={{marginTop:22}}>Rubriques masquables</p>
      <p style={{marginTop:6, fontSize:13, color:"var(--ink-2)"}}>Désactive une rubrique pour qu'elle ne soit proposée dans aucune nouvelle fiche.</p>
      <div style={{marginTop:10, display:"grid", gap:6}}>
        {CATSet.map(c => { const on = visibility[c.id] !== false; const Icon = c.Icon; return (
          <div key={c.id} className="card" style={{padding:12, display:"flex", gap:12, alignItems:"center"}}>
            <span style={{width:30, height:30, borderRadius:9, background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true"><Icon size={15} sw={1.6}/></span>
            <span style={{flex:1, minWidth:0, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>{c.title}</span>
            <button role="switch" aria-checked={on} onClick={() => setVisibility({...visibility, [c.id]: !on})} aria-label={`Inclure ${c.title}`}
                    style={{width:46, height:26, borderRadius:999, border:"none", padding:3, background: on ? "var(--accent)" : "var(--line-2)", cursor:"pointer", flexShrink:0}}>
              <span style={{display:"block", width:20, height:20, borderRadius:"50%", background:"#FFFFFF", transform: on ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
            </button>
          </div>
        ); })}
      </div>
    </SubPage>
  );
}

function LivePrivacyPage({live, onBack, onGo}){
  const [consents, setConsents] = useSSet(null);
  const [done, setDone] = useSSet(false);
  const a = window.BUI.useAction();
  useESet(() => { window.Backend.myConsents().then(setConsents).catch(() => setConsents([])); }, []);
  const LABEL = { terms:"Conditions et politique de confidentialité", sensitive_data:"Informations sensibles, partagées seulement sur invitation", person_consent:"Accord de la personne accompagnée" };
  const VALUE = { accepted:"acceptées", accord:"accord donné", representant:"représentant légal", later:"à en parler plus tard" };
  const day = (d) => new Date(d).toLocaleDateString("fr-FR", {day:"numeric", month:"long", year:"numeric"});
  return (
    <SubPage title="Confidentialité & données" onBack={onBack}>
      <div className="hero cool" style={{padding:18, marginTop:6}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17}}>Tes données t'appartiennent.</p>
        <p style={{marginTop:10, fontSize:14.5, lineHeight:1.55}}>Le carnet n'est pas un dossier médical : aucune donnée clinique, aucun diagnostic. Rien n'est partagé sans ton invitation.</p>
      </div>
      <p className="kicker" style={{marginTop:22}}>Où sont les données</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        <LiveRow label="Hébergement" value="Union européenne"/>
        <LiveRow label="Chiffrement" value="Au repos et en transit"/>
        <LiveRow label="Liens partagés" value="Expirent, révocables"/>
        <LiveRow label="Aide à la rédaction (IA)" value="Mistral AI, France"/>
      </ul>
      <p className="meta" style={{marginTop:10, lineHeight:1.55}}>L'IA est facultative : elle ne sert que quand tu dictes, ranges une note ou prépares une fiche. Elle ne reçoit que le texte utile et le prénom, jamais le nom de famille, et ne pose aucun diagnostic.</p>
      <p className="kicker" style={{marginTop:22}}>Consentements enregistrés</p>
      <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
        {consents === null && <li className="meta">Chargement…</li>}
        {consents && consents.map((c, i) => (
          <li key={i} className="card" style={{padding:"12px 16px"}}>
            <p style={{font:"800 14px var(--sans)"}}>{LABEL[c.kind] || c.kind}</p>
            <p className="meta" style={{marginTop:4}}>{VALUE[c.value] || c.value} · le {day(c.created_at)} · version {c.version}</p>
          </li>
        ))}
      </ul>
      <p className="kicker" style={{marginTop:22}}>Tes droits</p>
      <div style={{display:"grid", gap:8, marginTop:10}}>
        <button className="btn soft" style={{width:"100%"}} disabled={a.busy} onClick={() => a.run(live.onExport).then(() => setDone(true)).catch(() => {})}>{a.busy ? "Préparation…" : "Exporter toutes mes données"}</button>
        {done && <p role="status" className="meta" style={{fontWeight:700}}>Fichier téléchargé.</p>}
        <window.BUI.FormError msg={a.error}/>
        <button className="btn soft" style={{width:"100%", color:"#8C1D18"}} onClick={() => onGo("account")}>Supprimer mon compte et mes données</button>
      </div>
    </SubPage>
  );
}

window.SettingsFull = { SettingsFull };
