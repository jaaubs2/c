// App — routing across two views + demo switcher
const { useState: useStateApp } = React;
const { INITIAL_NOTES, DEFAULT_SHARE, CATEGORIES: CATS_APP, RELAIS_CARNETS } = window.AppData;
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
const {
  IconHomeT, IconMic, IconShare, IconSettings, IconCompass, IconCalendar, IconReply
} = window.Icons;

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

function App(){
  // top-level phase: launch | signup | login | recovery | verification | onboarding | app | relais-landing | relais-lite
  const [phase, setPhase] = useStateApp("app"); // default = signed in
  const [signupEmail, setSignupEmail] = useStateApp("");
  const [etabRole, setEtabRole] = useStateApp("cadre");
  const [view, setView] = useStateApp("aidant"); // aidant | relais
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

  const [notes, setNotes] = useStateApp(() => [...INITIAL_NOTES].sort((a,b) => b.ts - a.ts));
  const [visibility, setVisibility] = useStateApp({});
  const [sharePayload, setSharePayload] = useStateApp(DEFAULT_SHARE);
  const [mood, setMood] = useStateApp("sereine");
  const [toast, setToast] = useStateApp("");

  function saveNote(a, b){
    const text = typeof a === "object" ? a.text : a, catId = typeof a === "object" ? a.catId : b;
    const n = { id:"n"+Math.random().toString(36).slice(2,9), text, catId, ts:Date.now() };
    setNotes(prev => [n, ...prev]);
    setAidantTab("home");
    setToast(`Rangé dans « ${CATS_APP.find(c => c.id === catId)?.title || "le carnet"} ».`);
  }
  function editNote(id, text){
    setNotes(prev => prev.map(n => n.id === id ? {...n, text} : n));
    setToast("Note mise à jour.");
  }
  function confirmNote(id){
    setNotes(prev => prev.map(n => n.id === id ? {...n, confirmedAt:Date.now()} : n));
    setToast("Confirmé. Merci de garder le carnet vivant.");
  }
  function archiveNote(id){
    setNotes(prev => prev.map(n => n.id === id ? {...n, archived:true, archivedAt:Date.now()} : n));
    setToast("Gardé dans la trace de vie.");
  }
  function deleteNote(id){
    setNotes(prev => prev.filter(n => n.id !== id));
    setToast("Note supprimée.");
  }

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
  const relaisNotes = isJeanne
    ? visibleNotes
    : (relaisActiveCarnet.notes || []).filter(n => relaisActiveCarnet.included.includes(n.catId));
  const relaisPayload = isJeanne
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
      return <AidantNotifications onBack={() => setShowNotifs(false)}
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
                    onOpenJournal={() => setShowJournal(true)}
                    onOpenCare={() => setShowCare(true)}
                    sharePayload={sharePayload}
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
                                onSent={(name) => setToast(`Lien envoyé à ${name.split(" ")[0]}.`)}/>;
    }
    if(aidantTab === "settings"){
      return <SettingsFull visibility={visibility} setVisibility={setVisibility}
                           sharePayload={sharePayload}
                           onLogout={() => setPhase("launch")}/>;
    }
    return null;
  }

  /* ── RELAIS ── */
  const relaisOnboarded = !!relaisOnboardedMap[currentCarnetId];
  function renderRelais(){
    if(showJournal) return <window.FamilyJournalPage onBack={() => setShowJournal(false)}/>;
    if(!relaisPickerSeen && (RELAIS_CARNETS?.length || 0) > 1){
      return <RelaisCarnetPicker
        name={relaisPayload.name}
        onPick={(id) => {
          setCurrentCarnetId(id);
          setRelaisPickerSeen(true);
        }}/>;
    }
    if(!relaisOnboarded){
      return <RelaisWelcome payload={relaisPayload} onEnter={() => setRelaisOnboardedMap(m => ({...m, [currentCarnetId]: true}))}/>;
    }
    if(relaisCat){
      return <RelaisCategory catId={relaisCat} notes={relaisNotes} onBack={() => setRelaisCat(null)}/>;
    }
    if(relaisTab === "home"){
      return <RelaisHome notes={relaisNotes} payload={relaisPayload} onOpenJournal={currentCarnetId === "jeanne" ? () => setShowJournal(true) : null}
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
      return <RelaisToday onOpenCat={id => setRelaisCat(id)}/>;
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
                              onLogout={() => setPhase("launch")}/>;
    }
    return null;
  }

  const showTabBar = view === "aidant"
    ? aidantTab !== "capture" && !aidantCat && !showNotifs && !showCare && !savedNote && !showJournal
    : relaisPickerSeen && relaisOnboarded && !relaisCat && !showJournal;

  return (
    <div className="phone" role="application" aria-label="Le carnet vivant, prototype">
      <DemoPill view={view} onChange={changeView}/>

      {phase === "launch" && <LaunchScreen onSignup={() => setPhase("choose-profile")} onLogin={() => setPhase("login")}/>}
      {phase === "choose-profile" && <RolePicker onBack={() => setPhase("launch")}
        onPick={(r) => {
          if(r === "aidant"){ setChosenType("aidant"); setView("aidant"); setPhase("signup"); }
          else if(r === "proche"){ setChosenType("proche"); setView("relais"); setPhase("signup"); }
          else if(r === "etab") setPhase("etab-signup");
          else setPhase("staff-entry");
        }}/>}
      {phase === "etab-signup" && <EtabSignup onBack={() => setPhase("choose-profile")} onDone={(f) => { setEtabRole("cadre"); setView("etab"); setPhase("app"); setToast(`${f.name} créée. Ajoute ton équipe.`); }}/>}
      {phase === "staff-entry" && <StaffEntry onBack={() => setPhase("choose-profile")} onDone={(me) => { setEtabRole("staff"); setView("etab"); setPhase("app"); setToast(`Bienvenue ${me.name.split(" ")[0]}. Unité B.`); }}/>}
      {phase === "verification" && <VerificationScreen email={signupEmail}
                                                        onBack={() => setPhase("signup")}
                                                        onVerified={() => setPhase(chosenType === "aidant" ? "subscription" : "onboarding")}/>}
      {phase === "subscription" && <SubscriptionScreen onBack={() => setPhase("verification")}
                                                        onTrial={() => setPhase("onboarding")}
                                                        onSubscribe={(p) => { setChosenPlan(p); setPhase("payment"); }}/>}
      {phase === "payment" && <PaymentScreen plan={chosenPlan} onBack={() => setPhase("subscription")} onPaid={() => setPhase("subscription-success")}/>}
      {phase === "subscription-success" && <SubscriptionSuccess plan={chosenPlan} onDone={() => setPhase("onboarding")}/>}
      {phase === "signup" && <SignupScreen onBack={() => setPhase("choose-profile")}
                                            onSubmit={({email}) => { setSignupEmail(email); setPhase("verification"); }}
                                            onLogin={() => setPhase("login")}/>}
      {phase === "login" && <LoginScreen onBack={() => setPhase("launch")}
                                          onSubmit={() => setPhase("app")}
                                          onSignup={() => setPhase("signup")}
                                          onForgot={() => setPhase("recovery")}/>}
      {phase === "recovery" && <RecoveryScreen onBack={() => setPhase("login")} onSent={() => setPhase("login")}/>}
      {phase === "verification" && false}
      {phase === "onboarding" && <OnboardingFlow onDone={() => setPhase("app")}/>}

      {phase === "app" && (view === "aidant" ? renderAidant() : view === "etab" ? <EtabApp key={etabRole} initialRole={etabRole} jeanneNotes={visibleNotes} onToast={setToast} onLogout={() => setPhase("launch")}/> : renderRelais())}

      {phase === "app" && showTabBar && view === "aidant" && (
        <TabBar tabs={AIDANT_TABS} current={aidantTab} onChange={setAidantTab}/>
      )}
      {phase === "app" && showTabBar && view === "relais" && (
        <TabBar tabs={RELAIS_TABS} current={relaisTab} onChange={setRelaisTab}/>
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
