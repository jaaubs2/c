// App — routage entre les espaces.
// Deux modes :
//   • démo (sans serveur configuré, ou avec « ?demo ») : données d'exemple, sélecteur Proche / Aidant / Équipe ;
//   • vrais comptes (Supabase) : chacun arrive dans son espace, avec ses propres données.
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;
const { INITIAL_NOTES, DEFAULT_SHARE, CATEGORIES: CATS_APP, RELAIS_CARNETS, softDate: softDateApp } = window.AppData;
const { Toast, DemoPill, TabBar, StatusBar: SBApp } = window.UI;
const { AidantHome, AidantCarnet, AidantCapture, AidantCategory } = window.Aidant;
const { AidantTransmettre, AidantSettings } = window.AidantShare;
const { AidantNotifications, AidantSettingsV2, CaptureConfirmation, AidantCare } = window.AidantExtras;
const { LaunchScreen, SignupScreen, LoginScreen, RecoveryScreen, VerificationScreen, OnboardingFlow, RelaisLanding, RelaisLiteSignup, ChooseProfileScreen, SubscriptionScreen, PaymentScreen, SubscriptionSuccess } = window.Auth;
const { SettingsFull } = window.SettingsFull;
const { RelaisCarnetPicker, RelaisWelcome, RelaisHome, RelaisDiscover, RelaisCategory, RelaisToday, RelaisRespond } = window.Relais;
const { RelaisSettings } = window.RelaisSettings;
const { EtabApp } = window.Etab;
const { AidantMoi } = window.AidantMoi;
const { RolePicker, EtabSignup, StaffEntry } = window.Onboarding;
const { BootScreen, FicheStatus, NewPasswordScreen, ProcheInfo, InviteScreen } = window.BUI;
const {
  IconHomeT, IconMic, IconShare, IconSettings, IconCompass, IconCalendar, IconReply
} = window.Icons;

const Backend = window.Backend;
const REAL = Backend.enabled;

const AIDANT_TABS = [
  { id:"home",        label:"Accueil",     Icon: IconHomeT },
  { id:"carnet",      label:"Carnet",      Icon: (p) => <window.Icons.CatBook {...p}/> },
  { id:"capture",     label:"Ajouter",     Icon: IconMic,    kind:"mic" },
  { id:"moi",         label:"Moi",         Icon: (p) => <window.Icons.CatHeart {...p}/> },
  { id:"settings",    label:"Réglages",    Icon: IconSettings }
];

const RELAIS_TABS = [
  { id:"home",     label:"Accueil",          Icon: IconHomeT },
  { id:"discover", label:"Découvrir",        Icon: IconCompass },
  { id:"today",    label:"Aujourd'hui",      Icon: IconCalendar },
  { id:"respond",  label:"Répondre",         Icon: IconReply },
  { id:"settings", label:"Réglages",         Icon: IconSettings }
];
// Un relais qui ouvre une fiche par lien n'a pas de compte : pas de réponse ni de réglages de compte.
const GUEST_TABS = RELAIS_TABS.filter(t => ["home", "discover", "today"].includes(t.id));

const RECIPIENT_TITLES = { proche:"Un proche", pro:"Un professionnel", etab:"Un établissement" };
const byDate = (a, b) => b.ts - a.ts;

function App(){
  // top-level phase: boot | launch | choose-profile | signup | verification | login | recovery | new-password
  //                  | subscription | payment | onboarding | etab-signup | staff-entry | proche-info | invite | fiche-status | app
  const [phase, setPhase] = useStateApp(REAL ? "boot" : "app");
  const [signupEmail, setSignupEmail] = useStateApp("");
  const [etabRole, setEtabRole] = useStateApp("cadre");
  const [view, setView] = useStateApp("aidant"); // aidant | relais | etab
  const [chosenType, setChosenType] = useStateApp("aidant");
  const [chosenPlan, setChosenPlan] = useStateApp("monthly");
  const [aidantTab, setAidantTab] = useStateApp("home");
  const [relaisTab, setRelaisTab] = useStateApp("home");
  const [aidantCat, setAidantCat] = useStateApp(null);
  const [relaisCat, setRelaisCat] = useStateApp(null);

  const [relaisOnboardedMap, setRelaisOnboardedMap] = useStateApp({jeanne:true, roger:true});
  const [relaisPickerSeen, setRelaisPickerSeen] = useStateApp(false);
  const [currentCarnetId, setCurrentCarnetId] = useStateApp("jeanne");
  const [showNotifs, setShowNotifs] = useStateApp(false);
  const [showCare, setShowCare] = useStateApp(false);
  const [showJournal, setShowJournal] = useStateApp(false);
  const [savedNote, setSavedNote] = useStateApp(null); // {catId} when showing confirmation

  const [notes, setNotes] = useStateApp(() => REAL ? [] : [...INITIAL_NOTES].sort(byDate));
  const [visibility, setVisibility] = useStateApp({});
  const [sharePayload, setSharePayload] = useStateApp(DEFAULT_SHARE);
  const [mood, setMood] = useStateApp("sereine");
  const [toast, setToast] = useStateApp("");

  // ── Vrais comptes ──
  const [account, setAccount] = useStateApp(null);     // résultat de app_bootstrap
  const [carnet, setCarnet] = useStateApp(null);       // carnet ouvert (aidant)
  const [shares, setShares] = useStateApp([]);         // fiches partagées du carnet
  const [guest, setGuest] = useStateApp(null);         // fiche ouverte par lien, sans compte
  const [ficheStatus, setFicheStatus] = useStateApp(null);
  const [inviteToken, setInviteToken] = useStateApp(null);
  const [signedIn, setSignedIn] = useStateApp(false);
  const [recoveryEmail, setRecoveryEmail] = useStateApp("");
  const [intent, setIntent] = useStateApp("aidant");   // aidant | cadre | soignant
  const justSignedUp = useRefApp(false);
  const inviteRef = useRefApp(null);

  /* Qui est qui, pour les écrans (prénoms, « elle » / « il »). */
  if(REAL){
    const w = window.Who;
    if(guest){
      w.set({ demo:false, aidant:window.Live.first(guest.from_name), aidantFull:guest.from_name,
              person:window.Live.first(guest.person.name), personFull:guest.person.name, pronoun:guest.person.pronoun || "elle" });
    } else {
      const me = account?.membership?.display_name || account?.profile?.display_name || "";
      w.set({ demo:false, aidant:window.Live.first(me), aidantFull:me,
              person:window.Live.first(carnet?.person_name), personFull:carnet?.person_name || "",
              pronoun:carnet?.pronoun || "elle" });
    }
  }

  /* ── Démarrage (vrais comptes) ── */
  useEffectApp(() => {
    if(!REAL) return;
    const link = Backend.readLink();
    if(link?.kind === "fiche"){ openFiche(link.token); return; }
    if(link?.kind === "invitation"){ inviteRef.current = link.token; setInviteToken(link.token); Backend.clearLink(); }
    Backend.session()
      .then(s => { setSignedIn(!!s); if(s) loadAccount(); else setPhase(inviteRef.current ? "invite" : "launch"); })
      .catch(() => setPhase("launch"));
    return Backend.onAuthChange((event, session) => {
      setSignedIn(!!session);
      if(event === "SIGNED_OUT"){ resetAccount(); setPhase("launch"); }
    });
  }, []);

  function resetAccount(){
    setAccount(null); setCarnet(null); setNotes([]); setShares([]);
    setAidantTab("home"); setAidantCat(null); setShowNotifs(false); setShowCare(false);
    window.Who.reset(); window.Who.set({ demo:false });
  }

  async function openFiche(token){
    setPhase("boot");
    try{
      const r = await Backend.openShare(token);
      if(r.status !== "ok"){ setFicheStatus({status:r.status, fromName:r.from_name}); setPhase("fiche-status"); return; }
      setGuest(r); setView("relais"); setRelaisTab("home"); setPhase("app");
    } catch(e){
      setFicheStatus({status:"error"}); setPhase("fiche-status");
    }
  }

  async function openCarnet(k){
    setCarnet(k);
    const list = await Backend.listNotes(k.id);
    setNotes(list.sort(byDate));
    setShares(["owner", "cadre"].includes(k.my_role) ? await Backend.listShares(k.id) : []);
  }

  /** Charge le compte connecté et l'envoie dans son espace. */
  async function loadAccount(){
    setPhase("boot");
    try{
      const token = inviteRef.current;
      if(token){
        inviteRef.current = null; setInviteToken(null);
        const r = await Backend.acceptInvite(token);
        setToast(r.status === "ok" ? "Tu as rejoint le carnet." : "Cette invitation n'est plus valable.");
      }
      const b = await Backend.bootstrap();
      const s = await Backend.session();
      const meta = s?.user?.user_metadata || {};
      setAccount(b); setSignedIn(true);
      if(b.membership){
        setEtabRole(b.membership.role === "cadre" ? "cadre" : "staff");
        setView("etab"); setPhase("app"); return;
      }
      if(b.carnets.length){
        await openCarnet(b.carnets[0]);
        setView("aidant"); setAidantTab("home"); setPhase("app"); return;
      }
      if(meta.intent === "cadre"){ setPhase("etab-signup"); return; }
      if(meta.intent === "soignant"){ setPhase("staff-entry"); return; }
      setPhase(justSignedUp.current ? "subscription" : "onboarding");
    } catch(e){
      setToast(e.message); setPhase("launch");
    }
  }

  /* ── Comptes : actions des écrans (renvoient une promesse, l'écran affiche l'erreur) ── */
  async function doSignup({email, password, name}){
    const accountType = intent === "aidant" ? "aidant" : "etab";
    const r = await Backend.signUp({ email, password, displayName:name, accountType, intent });
    justSignedUp.current = true;
    setSignupEmail(email);
    if(r.needsCode) setPhase("verification"); else await loadAccount();
  }
  async function doVerify(code){ await Backend.verifySignup(signupEmail, code); await loadAccount(); }
  async function doLogin({email, password}){ await Backend.signIn(email, password); await loadAccount(); }
  async function doRecovery(email){ await Backend.sendRecovery(email); setRecoveryEmail(email); setPhase("new-password"); }
  async function doOnboarding(res){
    if(!res) return;
    await Backend.createCarnet({ name:res.profile.name, age:res.profile.age, since:res.profile.since,
      relation:res.role, avatar:res.profile.avatar, pronoun:res.profile.pronoun, personConsent:res.consent });
    justSignedUp.current = false;
    await loadAccount();
  }
  async function doEtabSignup(f){
    await Backend.createOrg({ name:f.name, kind:f.type, finess:f.finess, city:f.city, displayName:f.who, jobTitle:f.role, units:f.units });
    justSignedUp.current = false;
    await loadAccount();
  }
  async function logout(){
    if(REAL){ await Backend.signOut(); resetAccount(); setPhase("launch"); }
    else setPhase("launch");
  }

  /* ── Notes ── */
  async function saveNote(a, b){
    const text = typeof a === "object" ? a.text : a, catId = typeof a === "object" ? a.catId : b;
    const title = CATS_APP.find(c => c.id === catId)?.title || "le carnet";
    if(REAL){
      const n = await Backend.addNote(carnet.id, {text, catId});
      setNotes(prev => [n, ...prev]);
      setAidantTab("home");
      setToast(`Rangé dans « ${title} ».`);
      return;
    }
    const n = { id:"n"+Math.random().toString(36).slice(2,9), text, catId, ts:Date.now() };
    setNotes(prev => [n, ...prev]);
    setAidantTab("home");
    setToast(`Rangé dans « ${title} ».`);
  }
  const replaceNote = (n) => setNotes(prev => prev.map(x => x.id === n.id ? n : x));
  async function remote(fn, ok){
    try { const r = await fn(); if(ok) setToast(ok); return r; }
    catch(e){ setToast(e.message); }
  }
  function editNote(id, text){
    if(REAL) return remote(async () => replaceNote(await Backend.updateNote(id, {text})), "Note mise à jour.");
    setNotes(prev => prev.map(n => n.id === id ? {...n, text} : n));
    setToast("Note mise à jour.");
  }
  function confirmNote(id){
    if(REAL) return remote(async () => replaceNote(await Backend.confirmNote(id)), "Confirmé. Merci de garder le carnet vivant.");
    setNotes(prev => prev.map(n => n.id === id ? {...n, confirmedAt:Date.now()} : n));
    setToast("Confirmé. Merci de garder le carnet vivant.");
  }
  function archiveNote(id){
    if(REAL) return remote(async () => replaceNote(await Backend.archiveNote(id)), "Gardé dans la trace de vie.");
    setNotes(prev => prev.map(n => n.id === id ? {...n, archived:true, archivedAt:Date.now()} : n));
    setToast("Gardé dans la trace de vie.");
  }
  function deleteNote(id){
    if(REAL) return remote(async () => { await Backend.deleteNote(id); setNotes(prev => prev.filter(n => n.id !== id)); }, "Note supprimée.");
    setNotes(prev => prev.filter(n => n.id !== id));
    setToast("Note supprimée.");
  }

  /* ── Partages (vrais comptes) ── */
  const refreshShares = async () => setShares(await Backend.listShares(carnet.id));
  const shareLive = REAL && carnet ? {
    shares,
    canShare: ["owner", "cadre"].includes(carnet.my_role),
    onCreate: async (opts) => { const r = await Backend.createShare({ carnetId:carnet.id, ...opts }); await refreshShares(); return r; },
    onRevoke: (id) => remote(async () => { await Backend.revokeShare(id); await refreshShares(); }, "Lien désactivé. Plus personne ne peut l'ouvrir."),
  } : null;
  const lastShare = shares.find(s => !s.revokedAt && s.expiresAt > Date.now());

  /* ── Réglages (vrais comptes) ── */
  const settingsLive = REAL && account ? {
    email: account.email,
    name: account.profile?.display_name || "",
    carnet,
    onLogout: logout,
    onExport: () => Backend.exportData(),
    onDeleteAccount: async () => { await Backend.deleteAccount(); resetAccount(); setPhase("launch"); setToast("Ton compte et tes données ont été supprimés."); },
    onSaveProfile: async (name) => { await Backend.updateProfile(name); setAccount(a => ({...a, profile:{...a.profile, display_name:name}})); },
    onSaveCarnet: async (patch) => { const k = await Backend.updateCarnet(carnet.id, patch); setCarnet(k); },
    onInvite: (opts) => Backend.createInvite(carnet.id, opts),
    listMembers: () => Backend.listMembers(carnet.id),
    shares,
    onRevoke: (id) => shareLive && shareLive.onRevoke(id),
  } : null;

  /* ── Notifications (vrais comptes) : les ouvertures de fiches ── */
  const liveNotifs = REAL ? shares.filter(s => s.lastOpenedAt).map(s => ({
    id:"open-" + s.id, kind:"read", ts:s.lastOpenedAt, catId:"proches",
    title:`${s.name ? window.Live.first(s.name) : "Ton relais"} a ouvert la fiche`,
    body:`${softDateApp(s.lastOpenedAt)} · ${s.openCount} ouverture${s.openCount > 1 ? "s" : ""}`,
  })).sort((a, b) => b.ts - a.ts) : null;

  function changeView(next){
    setView(next);
    if(next === "aidant") setAidantCat(null);
    if(next === "relais") setRelaisCat(null);
  }

  const visibleNotes = notes.filter(n => visibility[n.catId] !== false && !n.archived);

  /* Active relais carnet — Jeanne uses the aidant's live notes,
     other carnets (Roger…) have their own data baked in. */
  const relaisActiveCarnet = RELAIS_CARNETS.find(c => c.id === currentCarnetId) || RELAIS_CARNETS[0];
  const isJeanne = relaisActiveCarnet.id === "jeanne";
  let relaisNotes = isJeanne
    ? visibleNotes
    : (relaisActiveCarnet.notes || []).filter(n => relaisActiveCarnet.included.includes(n.catId));
  let relaisPayload = isJeanne
    ? { ...sharePayload, profile: { name:"Jeanne", age:86, since:"2 ans" } }
    : {
        recipient: { id:"proche", title:"Un proche",
                     include: relaisActiveCarnet.included,
                     tone:"chaleureux, tutoiement",
                     intro:`Voici ce qu'il faut savoir pour passer un bon moment avec ${relaisActiveCarnet.profile.name.split(" ")[0]}.` },
        included: relaisActiveCarnet.included,
        name: "Claire",
        fromName: relaisActiveCarnet.sharedBy,
        token: "8b2d-91af",
        createdAt: relaisActiveCarnet.sharedAt,
        profile: relaisActiveCarnet.profile
      };
  if(REAL && guest){
    const sh = guest.share, first = window.Live.first(guest.person.name);
    relaisNotes = guest.notes;
    relaisPayload = {
      recipient: { id:sh.recipient_type, title:RECIPIENT_TITLES[sh.recipient_type], include:sh.categories,
                   intro: sh.intro || `Voici ce qu'il faut savoir pour passer un bon moment avec ${first}.` },
      included: sh.categories,
      name: sh.recipient_name || "",
      fromName: guest.from_name,
      createdAt: Date.parse(sh.created_at),
      expiresAt: Date.parse(sh.expires_at),
      profile: { name:guest.person.name, age:guest.person.age, since:guest.person.since, relation:"" }
    };
  }
  const relaisKey = REAL && guest ? "guest" : currentCarnetId;

  /* ── AIDANT ── */
  function renderAidant(){
    // Confirmation overlay after a save
    if(savedNote){
      return <CaptureConfirmation catId={savedNote.catId} onDone={() => { setSavedNote(null); setAidantTab("home"); }}/>;
    }
    // Capture is full-screen, replaces tab content
    if(aidantTab === "capture"){
      return <AidantCapture onClose={() => setAidantTab("home")} onSave={saveNote}/>;
    }
    if(showJournal) return <window.FamilyJournalPage onBack={() => setShowJournal(false)}/>;
    // Notifications overlay (over home)
    if(showNotifs){
      return <AidantNotifications onBack={() => setShowNotifs(false)} live={liveNotifs}
                                   onOpenCat={id => { setShowNotifs(false); setAidantCat(id); }}/>;
    }
    // Care overlay (over home)
    if(showCare){
      return <AidantCare onBack={() => setShowCare(false)}/>;
    }
    // Category drill-in
    if(aidantCat){
      return (
        <AidantCategory
          catId={aidantCat}
          notes={notes}
          onBack={() => setAidantCat(null)}
          onOpenCapture={() => setAidantTab("capture")}
          onEdit={editNote}
          onDelete={deleteNote}
          onConfirm={confirmNote}
          onArchive={archiveNote}
        />
      );
    }
    if(aidantTab === "home"){
      return (
        <AidantHome notes={notes} mood={mood} setMood={setMood}
                    onOpenCat={id => setAidantCat(id)}
                    onOpenCapture={() => setAidantTab("capture")}
                    onTab={setAidantTab}
                    onOpenNotifs={() => setShowNotifs(true)}
                    onOpenJournal={REAL ? null : () => setShowJournal(true)}
                    onOpenCare={() => setShowCare(true)}
                    sharePayload={sharePayload}
                    lastShare={lastShare}
                    onOpenShare={() => setAidantTab("transmettre")}/>
      );
    }
    if(aidantTab === "carnet"){
      return <AidantCarnet notes={notes} onOpenCat={id => setAidantCat(id)}/>;
    }
    if(aidantTab === "moi"){
      return <AidantMoi notes={notes} onOpenShare={() => setAidantTab("transmettre")} onToast={setToast}/>;
    }
    if(aidantTab === "transmettre"){
      return <AidantTransmettre notes={visibleNotes} sharePayload={sharePayload} setSharePayload={setSharePayload} onClose={() => setAidantTab("moi")}
                                live={shareLive}
                                onSent={(name) => setToast(REAL ? "Lien créé. Envoie-le quand tu veux." : `Lien envoyé à ${name.split(" ")[0]}.`)}/>;
    }
    if(aidantTab === "settings"){
      return <SettingsFull visibility={visibility} setVisibility={setVisibility}
                           sharePayload={sharePayload}
                           live={settingsLive}
                           onLogout={logout}/>;
    }
    return null;
  }

  /* ── RELAIS ── */
  const relaisOnboarded = !!relaisOnboardedMap[relaisKey];
  function renderRelais(){
    if(showJournal) return <window.FamilyJournalPage onBack={() => setShowJournal(false)}/>;
    if(!guest && !relaisPickerSeen && (RELAIS_CARNETS?.length || 0) > 1){
      return <RelaisCarnetPicker
        name={relaisPayload.name}
        onPick={(id) => {
          setCurrentCarnetId(id);
          setRelaisPickerSeen(true);
        }}/>;
    }
    if(!relaisOnboarded){
      return <RelaisWelcome payload={relaisPayload} onEnter={() => setRelaisOnboardedMap(m => ({...m, [relaisKey]: true}))}/>;
    }
    if(relaisCat){
      return <RelaisCategory catId={relaisCat} notes={relaisNotes} onBack={() => setRelaisCat(null)}/>;
    }
    if(relaisTab === "home"){
      return <RelaisHome notes={relaisNotes} payload={relaisPayload} onOpenJournal={!guest && currentCarnetId === "jeanne" ? () => setShowJournal(true) : null}
                         onOpenCat={id => setRelaisCat(id)}
                         onTab={setRelaisTab}
                         currentCarnetId={currentCarnetId}
                         onSwitchCarnet={(id) => {
                           setCurrentCarnetId(id);
                           const c = RELAIS_CARNETS.find(x => x.id === id);
                           setToast(`Carnet de ${c?.profile.name.split(" ")[0] || ""} ouvert.`);
                         }}/>;
    }
    if(relaisTab === "discover"){
      return <RelaisDiscover notes={relaisNotes} payload={relaisPayload}
                             onOpenCat={id => setRelaisCat(id)}/>;
    }
    if(relaisTab === "today"){
      return <RelaisToday notes={relaisNotes} onOpenCat={id => setRelaisCat(id)}/>;
    }
    if(relaisTab === "respond"){
      return <RelaisRespond payload={relaisPayload} onAck={() => setToast(`${relaisPayload.fromName} saura que tu as lu.`)}/>;
    }
    if(relaisTab === "settings"){
      return <RelaisSettings currentCarnetId={currentCarnetId}
                              onSwitchCarnet={(id) => {
                                setCurrentCarnetId(id);
                                setRelaisTab("home");
                                const c = RELAIS_CARNETS.find(x => x.id === id);
                                setToast(`Carnet de ${c?.profile.name.split(" ")[0] || ""} ouvert.`);
                              }}
                              onLogout={logout}/>;
    }
    return null;
  }

  const showTabBar = view === "aidant"
    ? aidantTab !== "capture" && !aidantCat && !showNotifs && !showCare && !savedNote && !showJournal
    : (guest || relaisPickerSeen) && relaisOnboarded && !relaisCat && !showJournal;

  /* Choix du profil à l'inscription. */
  function pickRole(r){
    if(!REAL){
      if(r === "aidant"){ setChosenType("aidant"); setView("aidant"); setPhase("signup"); }
      else if(r === "proche"){ setChosenType("proche"); setView("relais"); setPhase("signup"); }
      else if(r === "etab") setPhase("etab-signup");
      else setPhase("staff-entry");
      return;
    }
    if(r === "proche"){ setPhase("proche-info"); return; }
    setIntent(r === "etab" ? "cadre" : r === "soignant" ? "soignant" : "aidant");
    setChosenType(r === "aidant" ? "aidant" : "etab");
    setPhase("signup");
  }

  return (
    <div className="phone" role="application" aria-label="Le carnet vivant">
      {!REAL && <DemoPill view={view} onChange={changeView}/>}

      {phase === "boot" && <BootScreen/>}
      {phase === "fiche-status" && <FicheStatus status={ficheStatus?.status} fromName={ficheStatus?.fromName}/>}
      {phase === "proche-info" && <ProcheInfo onBack={() => setPhase("choose-profile")} onLogin={() => setPhase("login")}/>}
      {phase === "invite" && <InviteScreen token={inviteToken} signedIn={signedIn}
        onSignup={() => { setIntent("aidant"); setChosenType("proche"); setPhase("signup"); }}
        onLogin={() => setPhase("login")}
        onAccept={() => loadAccount()}
        onBack={() => { inviteRef.current = null; setInviteToken(null); setPhase(signedIn ? "boot" : "launch"); if(signedIn) loadAccount(); }}/>}
      {phase === "new-password" && <NewPasswordScreen email={recoveryEmail} onBack={() => setPhase("recovery")} onDone={() => loadAccount()}/>}

      {phase === "launch" && <LaunchScreen onSignup={() => setPhase(inviteToken ? "invite" : "choose-profile")} onLogin={() => setPhase("login")}/>}
      {phase === "choose-profile" && <RolePicker onBack={() => setPhase("launch")} onPick={pickRole}/>}
      {phase === "etab-signup" && <EtabSignup onBack={() => setPhase(REAL ? "launch" : "choose-profile")}
        onDone={REAL ? doEtabSignup : (f) => { setEtabRole("cadre"); setView("etab"); setPhase("app"); setToast(`${f.name} créée. Ajoute ton équipe.`); }}/>}
      {phase === "staff-entry" && <StaffEntry onBack={() => setPhase(REAL ? "launch" : "choose-profile")}
        onDone={REAL ? () => loadAccount() : (me) => { setEtabRole("staff"); setView("etab"); setPhase("app"); setToast(`Bienvenue ${me.name.split(" ")[0]}. Unité B.`); }}/>}
      {phase === "verification" && <VerificationScreen email={signupEmail}
                                                        onBack={() => setPhase("signup")}
                                                        onVerify={REAL ? doVerify : null}
                                                        onResend={REAL ? () => Backend.resendSignup(signupEmail) : null}
                                                        onVerified={() => setPhase(chosenType === "aidant" ? "subscription" : "onboarding")}/>}
      {phase === "subscription" && <SubscriptionScreen onBack={() => setPhase(REAL ? "onboarding" : "verification")}
                                                        onTrial={() => setPhase("onboarding")}
                                                        onSubscribe={(p) => {
                                                          if(REAL){ setToast("Le paiement en ligne arrive bientôt. Profite de l'essai gratuit."); setPhase("onboarding"); return; }
                                                          setChosenPlan(p); setPhase("payment");
                                                        }}/>}
      {phase === "payment" && <PaymentScreen plan={chosenPlan} onBack={() => setPhase("subscription")} onPaid={() => setPhase("subscription-success")}/>}
      {phase === "subscription-success" && <SubscriptionSuccess plan={chosenPlan} onDone={() => setPhase("onboarding")}/>}
      {phase === "signup" && <SignupScreen onBack={() => setPhase(inviteToken ? "invite" : "choose-profile")}
                                            askName={REAL}
                                            onSubmit={REAL ? doSignup : ({email}) => { setSignupEmail(email); setPhase("verification"); }}
                                            onOAuth={REAL ? (provider) => Backend.signInWithProvider(provider) : null}
                                            onLogin={() => setPhase("login")}/>}
      {phase === "login" && <LoginScreen onBack={() => setPhase(inviteToken ? "invite" : "launch")}
                                          onSubmit={REAL ? doLogin : () => setPhase("app")}
                                          onOAuth={REAL ? (provider) => Backend.signInWithProvider(provider) : null}
                                          onSignup={() => setPhase(inviteToken ? "invite" : "choose-profile")}
                                          onForgot={() => setPhase("recovery")}/>}
      {phase === "recovery" && <RecoveryScreen onBack={() => setPhase("login")} onSend={REAL ? doRecovery : null} onSent={() => setPhase("login")}/>}
      {phase === "onboarding" && <OnboardingFlow real={REAL} onDone={REAL ? doOnboarding : () => setPhase("app")}/>}

      {phase === "app" && (view === "aidant" ? renderAidant()
        : view === "etab" ? <EtabApp key={etabRole} initialRole={etabRole} real={REAL} jeanneNotes={visibleNotes} onToast={setToast} onLogout={logout}/>
        : renderRelais())}

      {phase === "app" && showTabBar && view === "aidant" && (
        <TabBar tabs={AIDANT_TABS} current={aidantTab} onChange={setAidantTab}/>
      )}
      {phase === "app" && showTabBar && view === "relais" && (
        <TabBar tabs={REAL && guest ? GUEST_TABS : RELAIS_TABS} current={relaisTab} onChange={setRelaisTab}/>
      )}

      <Toast msg={toast} onClear={() => setToast("")}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.Fragment>
    <App/>
    {window.TweakManager && <window.TweakManager/>}
  </React.Fragment>
);
