// Écrans et composants liés au serveur (utilisés seulement avec de vrais comptes) :
// chargement, fiche expirée, nouveau mot de passe, invitation, lien à partager,
// rédaction d'une note. Même style que le reste de l'app.
(() => {
const { useState, useEffect, useRef } = React;
const { StatusBar } = window.UI;
const { IconBack, IconClose, IconCheck, IconCopy, IconShare, IconLink, IconLock, IconChevron } = window.Icons;
const { CATEGORIES, CAT_BY_ID, classify } = window.AppData;

const Circle = ({Icon, size=44, bg="var(--ink)", color="#fff", isize=20}) => (
  <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={isize} sw={1.8}/></span>
);
const Top = ({onBack, title}) => (
  <div className="topbar" style={{padding:"8px 20px 4px"}}>
    {onBack ? <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button> : <span style={{width:44}}/>}
    <span style={{font:"800 16px var(--sans)", letterSpacing:"-.01em"}}>{title || ""}</span>
    <span style={{width:44}}/>
  </div>
);
const inputStyle = {width:"100%", minHeight:52, borderRadius:16, border:"none", background:"#fff", padding:"0 16px", font:"600 16px var(--sans)", color:"var(--ink)", boxShadow:"inset 0 0 0 1.5px var(--line)"};

/** Message d'erreur lisible, annoncé aux lecteurs d'écran. */
function FormError({msg}){
  if(!msg) return null;
  return <p role="alert" style={{marginTop:14, padding:"12px 14px", borderRadius:14, background:"#FBE3E1", color:"#8C1D18", font:"700 14px var(--sans)", lineHeight:1.45}}>{msg}</p>;
}

/** Exécute une action serveur en gérant « en cours » et l'erreur. */
function useAction(){
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(fn){
    setBusy(true); setError("");
    try { return await fn(); }
    catch(e){ setError(e.message || "Une erreur est survenue."); throw e; }
    finally { setBusy(false); }
  }
  return { busy, error, setError, run };
}

/* ── Chargement ─────────────────────────────────────────── */
function BootScreen({label="Ouverture du carnet…"}){
  return (
    <div className="screen fade-enter" role="status" aria-live="polite">
      <StatusBar/>
      <div className="scroll" style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingBottom:0}}>
        <div className="dots" aria-hidden="true" style={{transform:"scale(1.4)"}}><span className="on"/><span/><span/></div>
        <p className="meta" style={{marginTop:18, fontSize:15}}>{label}</p>
      </div>
    </div>
  );
}

/* ── Fiche : lien invalide, expiré ou révoqué ───────────── */
function FicheStatus({status, fromName}){
  const from = fromName ? window.Live.first(fromName) : "la personne qui te l'a envoyé";
  const T = {
    expired: ["Ce lien a expiré.", `Pour protéger la personne accompagnée, les fiches ne restent ouvertes que quelques jours. Demande un nouveau lien à ${from}.`],
    revoked: ["Ce lien a été désactivé.", `${fromName ? window.Live.first(fromName) : "L'aidant"} a retiré l'accès à cette fiche. Si tu en as encore besoin, demande-lui un nouveau lien.`],
    invalid: ["Ce lien ne fonctionne pas.", "Vérifie que tu as bien copié le lien en entier, ou demande-le à nouveau."],
    error: ["Impossible d'ouvrir la fiche.", "Le serveur ne répond pas. Vérifie ta connexion internet, puis réessaie."],
  }[status] || ["Ce lien ne fonctionne pas.", ""];
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="scroll" style={{padding:"40px 26px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center"}}>
        <Circle Icon={IconLock} size={72} isize={30} bg="var(--c-histoire)" color="var(--c-histoire-ink)"/>
        <h1 style={{fontSize:28, marginTop:24}}>{T[0]}</h1>
        <p style={{marginTop:12, fontSize:16, color:"var(--ink-2)", lineHeight:1.55, maxWidth:330}}>{T[1]}</p>
        {status === "error" && <button className="btn" style={{marginTop:26}} onClick={() => window.location.reload()}>Réessayer</button>}
      </div>
    </div>
  );
}

/* ── Nouveau mot de passe (code reçu par email) ─────────── */
function NewPasswordScreen({email, onBack, onDone}){
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const a = useAction();
  const ok = /^\d{6}$/.test(code) && pwd.length >= 8 && pwd === pwd2;
  async function submit(){
    try { await a.run(() => window.Backend.resetPassword(email, code, pwd)); onDone(); } catch {}
  }
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Top onBack={onBack}/>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 style={{fontSize:28, marginTop:8}}>Nouveau mot de passe</h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>On a envoyé un code à 6 chiffres à <strong style={{color:"var(--ink)"}}>{email}</strong>. Pense à regarder dans les spams.</p>
        <label style={{display:"block", marginTop:22}}><span className="kicker" style={{display:"block", marginBottom:8}}>Code reçu</span>
          <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" style={{...inputStyle, letterSpacing:".3em", font:"800 22px var(--sans)"}}/></label>
        <label style={{display:"block", marginTop:16}}><span className="kicker" style={{display:"block", marginBottom:8}}>Nouveau mot de passe</span>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} autoComplete="new-password" placeholder="Au moins 8 caractères" style={inputStyle}/></label>
        <label style={{display:"block", marginTop:16}}><span className="kicker" style={{display:"block", marginBottom:8}}>Encore une fois</span>
          <input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} autoComplete="new-password" style={inputStyle}/></label>
        {pwd2 && pwd !== pwd2 && <p className="meta" style={{marginTop:8, color:"#8C1D18"}}>Les deux mots de passe ne sont pas identiques.</p>}
        <FormError msg={a.error}/>
        <button className="btn" style={{marginTop:22, width:"100%"}} disabled={!ok || a.busy} onClick={submit}>{a.busy ? "Enregistrement…" : "Enregistrer et me connecter"}</button>
      </div>
    </div>
  );
}

/* ── « Tu es un proche ? » : pas de compte à créer ──────── */
function ProcheInfo({onBack, onLogin}){
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Top onBack={onBack}/>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <Circle Icon={IconLink} size={64} isize={26} bg="var(--c-sante)" color="var(--c-sante-ink)"/>
        <h1 style={{fontSize:28, marginTop:20}}>Pas besoin de compte.</h1>
        <p style={{marginTop:12, fontSize:16, color:"var(--ink-2)", lineHeight:1.55}}>Quand un aidant te confie une personne, il t'envoie un <strong style={{color:"var(--ink)"}}>lien</strong> (par SMS, email ou message). Ouvre-le : la fiche s'affiche directement, avec seulement ce qu'il a choisi de te montrer.</p>
        <div className="card" style={{marginTop:20, padding:16}}>
          <p style={{font:"800 15px var(--sans)"}}>On t'a invité à contribuer à un carnet ?</p>
          <p className="meta" style={{marginTop:6, lineHeight:1.5}}>Ouvre le lien d'invitation : il te proposera de créer ton compte, puis tu pourras ajouter tes propres notes.</p>
        </div>
        <button className="btn soft" style={{marginTop:22, width:"100%"}} onClick={onLogin}>J'ai déjà un compte</button>
      </div>
    </div>
  );
}

/* ── Invitation à rejoindre un carnet ───────────────────── */
function InviteScreen({token, signedIn, onSignup, onLogin, onAccept, onBack}){
  const [info, setInfo] = useState(null);
  const a = useAction();
  useEffect(() => {
    window.Backend.previewInvite(token).then(setInfo).catch(() => setInfo({status:"error"}));
  }, [token]);
  if(!info) return <BootScreen label="Ouverture de l'invitation…"/>;
  if(info.status !== "ok"){
    const msg = { used:"Cette invitation a déjà été utilisée.", expired:"Cette invitation a expiré.", error:"Impossible de vérifier l'invitation pour le moment." }[info.status] || "Cette invitation n'est pas valide.";
    return (
      <div className="screen fade-enter"><StatusBar/><Top onBack={onBack}/>
        <div className="scroll" style={{padding:"30px 26px", textAlign:"center"}}>
          <h1 style={{fontSize:26}}>{msg}</h1>
          <p className="meta" style={{marginTop:12, fontSize:15, lineHeight:1.5}}>Demande un nouveau lien à la personne qui te l'a envoyée.</p>
          <button className="btn soft" style={{marginTop:24}} onClick={onBack}>Continuer</button>
        </div>
      </div>
    );
  }
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Top onBack={onBack}/>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <div style={{background:"var(--c-proches)", color:"var(--c-proches-ink)", borderRadius:"var(--r-xl)", padding:22}}>
          <p className="kicker" style={{color:"inherit", opacity:.8}}>Invitation</p>
          <h1 style={{fontSize:27, marginTop:10, color:"inherit"}}>Le carnet de {info.person_first_name}</h1>
          <p style={{marginTop:10, fontSize:15, fontWeight:600, lineHeight:1.5}}>{info.from_name ? `${info.from_name} t'invite` : "Tu es invité·e"} à lire ce carnet et à y ajouter ce que tu sais{info.invited_name ? `, ${window.Live.first(info.invited_name)}` : ""}.</p>
        </div>
        {signedIn ? (<>
          <FormError msg={a.error}/>
          <button className="btn" style={{marginTop:22, width:"100%"}} disabled={a.busy} onClick={() => a.run(onAccept).catch(() => {})}>{a.busy ? "Un instant…" : "Rejoindre le carnet"}</button>
        </>) : (<>
          <p style={{marginTop:20, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>Pour contribuer, il te faut un compte. C'est rapide, et tes informations restent protégées.</p>
          <button className="btn" style={{marginTop:18, width:"100%"}} onClick={onSignup}>Créer mon compte</button>
          <button className="btn soft" style={{marginTop:8, width:"100%"}} onClick={onLogin}>J'ai déjà un compte</button>
        </>)}
      </div>
    </div>
  );
}

/* ── Lien à copier ou partager ──────────────────────────── */
function LinkBox({url, expiresAt, shareText="Le carnet vivant"}){
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  async function copy(){
    try { await navigator.clipboard.writeText(url); }
    catch { const r = document.createRange(); r.selectNodeContents(ref.current); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand && document.execCommand("copy"); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const until = expiresAt ? new Date(expiresAt).toLocaleDateString("fr-FR", {day:"numeric", month:"long"}) : null;
  return (
    <div style={{background:"var(--paper)", border:"1px solid var(--line)", borderRadius:22, padding:"16px 18px"}}>
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <Circle Icon={IconLink} size={32} isize={16} bg="var(--c-proches)" color="var(--c-proches-ink)"/>
        <span className="label">Lien sécurisé</span>
        {until && <span style={{marginLeft:"auto", fontSize:12.5, color:"var(--ink-3)", fontWeight:600}}>jusqu'au {until}</span>}
      </div>
      <p ref={ref} style={{fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:13, marginTop:10, wordBreak:"break-all", color:"var(--ink-2)"}}>{url}</p>
      <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
        <button className="chip" onClick={copy}>{copied ? <><IconCheck size={14}/> Copié</> : <><IconCopy size={14}/> Copier</>}</button>
        {canShare && <button className="chip" onClick={() => navigator.share({title:"Le carnet vivant", text:shareText, url}).catch(() => {})}><IconShare size={14}/> Envoyer…</button>}
      </div>
    </div>
  );
}

/* ── Rédiger une note (vraie saisie, dictée par le clavier) ── */
function NoteComposer({subject, needsVisa, onClose, onSave}){
  const [text, setText] = useState("");
  const [picked, setPicked] = useState(null);
  const [picking, setPicking] = useState(false);
  const a = useAction();
  const suggested = React.useMemo(() => (classify(text)[0] || {}).cat || null, [text]);
  const c = picked || suggested || CAT_BY_ID.habitudes;
  async function save(){
    try { await a.run(() => onSave({text:text.trim(), catId:c.id})); } catch {}
  }
  return (
    <div className="screen fade-enter" style={{background:"var(--ink)", color:"#fff"}}>
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <button className="iconbtn" aria-label="Annuler" onClick={onClose} style={{background:"rgba(255,255,255,.12)", color:"#fff"}}><IconClose size={20}/></button>
        <span style={{font:"800 15px var(--sans)", opacity:.8, display:"flex", alignItems:"center", gap:8}}>{subject || "Nouvelle note"}</span>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"8px 22px 28px", display:"flex", flexDirection:"column"}}>
        <label htmlFor="note-text" className="kicker" style={{color:"rgba(255,255,255,.6)", marginTop:8}}>Ce que tu veux transmettre</label>
        <textarea id="note-text" value={text} onChange={e => setText(e.target.value)} autoFocus rows={6} maxLength={4000}
                  placeholder={`Une habitude, ce qui ${window.Who.g("l'apaise", "l'apaise")}, comment lui parler…`}
                  style={{marginTop:10, background:"transparent", color:"#fff", boxShadow:"none", border:"none", outline:"none", padding:0, font:"700 22px var(--sans)", lineHeight:1.4, letterSpacing:"-.01em", minHeight:170}}/>
        <p style={{marginTop:8, fontSize:13, fontWeight:600, opacity:.6, lineHeight:1.45}}>Pour dicter, touche le micro de ton clavier.</p>
        <div style={{flex:1}}/>
        <button onClick={() => setPicking(v => !v)} aria-expanded={picking} className="card-press" style={{marginTop:18, width:"100%", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:"16px 18px", background:c.bg, color:c.ink, textAlign:"left", display:"flex", gap:14, alignItems:"center"}}>
          <Circle Icon={c.Icon} size={44} isize={20}/>
          <span style={{flex:1, minWidth:0}}>
            <span style={{display:"block", font:"800 17px var(--sans)", letterSpacing:"-.02em"}}>{c.title}</span>
            <span style={{display:"block", marginTop:2, fontSize:13, fontWeight:600, opacity:.8}}>{picking ? "Choisis la rubrique" : picked ? "Rubrique choisie · appuie pour changer" : "Rubrique proposée · appuie pour changer"}</span>
          </span>
          <IconChevron size={18}/>
        </button>
        {picking && <div className="slide-up" style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>{CATEGORIES.map(x => <button key={x.id} onClick={() => { setPicked(x); setPicking(false); }} className="chip" aria-pressed={x.id === c.id} style={{background:x.bg, color:x.ink, boxShadow:"none", minHeight:44}}><x.Icon size={15} sw={1.8}/> {x.title}</button>)}</div>}
        <FormError msg={a.error}/>
        <button className="btn" style={{marginTop:12, width:"100%", background:"#fff", color:"var(--ink)"}} disabled={!text.trim() || a.busy} onClick={save}>
          <IconCheck size={20}/> {a.busy ? "Enregistrement…" : needsVisa ? "Envoyer au cadre" : "Enregistrer"}
        </button>
        {needsVisa !== undefined && <p style={{marginTop:12, textAlign:"center", fontSize:12.5, fontWeight:600, opacity:.55}}>{needsVisa ? "Publiée après validation par le cadre de santé." : "Visible tout de suite par l'équipe et la famille."}</p>}
      </div>
    </div>
  );
}

window.BUI = { FormError, useAction, BootScreen, FicheStatus, NewPasswordScreen, ProcheInfo, InviteScreen, LinkBox, NoteComposer };
})();
