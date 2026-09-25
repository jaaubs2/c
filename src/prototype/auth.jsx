// Auth + Onboarding screens — Le carnet vivant
const { useState: useSAuth, useEffect: useEAuth, useRef: useRAuth } = React;
const {
  IconBack: IconBackAuth, IconCheck: IconCheckAuth, IconClose: IconCloseAuth,
  IconLock: IconLockAuth, IconShare: IconShareAuth, IconMic: IconMicAuth,
  IconSparkle: IconSparkleAuth, IconChevron: IconChevronAuth,
  JeanneIllustration: JIAuth, AnneIllustration: AIAuth
} = window.Icons;
const { CATEGORIES: CATSAuth, CAT_BY_ID: CBYAuth, EXAMPLE_PROMPTS: EXAuth, classify: classifyAuth } = window.AppData;
const { StatusBar: SBAuth, Avatar: AvatarAuth } = window.UI;

/* ─── Brand logo — simple wordmark ─── */
function BrandLogo({size = 28}){
  return (
    <span aria-hidden="true" style={{display:"inline-flex", alignItems:"center", gap:8}}>
      <span style={{
        width:size, height:size, borderRadius:"50%",
        background:"radial-gradient(circle at 30% 30%, var(--accent-2), var(--accent))",
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        color:"#FFFFFF", fontFamily:"var(--display)", fontWeight:600, fontSize:size*.55,
        letterSpacing:"-.02em"
      }}>c</span>
      <span style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:size*.7, color:"var(--ink)", letterSpacing:"-.015em"}}>
        Le carnet vivant
      </span>
    </span>
  );
}

/* ─── OAuth icons ─── */
const IconGoogle = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-.9 2.4-2 3.1v2.6h3.3c1.9-1.7 3-4.3 3-7.5z"/>
    <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6C4.6 19.7 8 22 12 22z"/>
    <path fill="#FBBC05" d="M6.3 13.7c-.2-.6-.3-1.2-.3-1.7s.1-1.2.3-1.7V7.7H2.9C2.3 9 2 10.4 2 12s.3 3 .9 4.3l3.4-2.6z"/>
    <path fill="#EA4335" d="M12 6.4c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 3.5 14.7 2.6 12 2.6 8 2.6 4.6 5 2.9 8.3l3.4 2.6C7.1 8.2 9.4 6.4 12 6.4z"/>
  </svg>
);
const IconApple = ({size=18}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.3 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3 0 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.5.7-.9 1.2-1.9 1.5-3-3.1-1.2-3.2-4.6-3.2-4.9zM14.8 3.4c.7-.8 1.2-2 1-3.2-1.1.1-2.4.7-3.1 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.4-.6 3.2-1.5z"/>
  </svg>
);

/* ─── Inputs ─── */
function FormField({label, hint, error, children, htmlFor}){
  return (
    <div style={{marginTop:14}}>
      <label htmlFor={htmlFor}
             style={{display:"block", fontFamily:"var(--sans)", fontSize:13, fontWeight:600, color:"var(--ink)", letterSpacing:".02em", marginBottom:6}}>
        {label}
      </label>
      {children}
      {hint && !error && <p style={{marginTop:6, fontSize:12.5, color:"var(--ink-2)"}}>{hint}</p>}
      {error && <p style={{marginTop:6, fontSize:12.5, color:"var(--accent)"}}>{error}</p>}
    </div>
  );
}

function Field({id, type="text", value, onChange, placeholder, autoComplete}){
  return (
    <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
           placeholder={placeholder} autoComplete={autoComplete}
           style={{width:"100%", minHeight:48, border:"1px solid var(--line-2)",
                   background:"var(--paper)", borderRadius:14, padding:"12px 14px",
                   fontSize:16, fontFamily:"var(--sans)", color:"var(--ink)"}}/>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. LAUNCH
   ───────────────────────────────────────────────────────────── */
function LaunchScreen({onSignup, onLogin}){
  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="scroll" style={{padding:"0 24px 28px", display:"flex", flexDirection:"column"}}>
        <div style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", paddingTop:24}}>
          <h1 style={{fontSize:32, letterSpacing:"-.035em", lineHeight:1.1, textWrap:"pretty", maxWidth:300}}>Le savoir qui prend soin d'elle.</h1>
          <p className="meta" style={{marginTop:12, fontSize:15, lineHeight:1.5, maxWidth:300}}>Un carnet humain pour accompagner une personne en perte d'autonomie. Pas un dossier médical, juste l'essentiel.</p>
        </div>
        <button className="btn" style={{width:"100%", minHeight:56, fontSize:16}} onClick={onSignup}>Créer mon carnet</button>
        <button className="btn soft" style={{marginTop:10, width:"100%", minHeight:52}} onClick={onLogin}>Se connecter</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. SIGNUP
   ───────────────────────────────────────────────────────────── */
function SignupScreen({onBack, onSubmit, onLogin, askName, onOAuth}){
  const [name, setName] = useSAuth("");
  const [busy, setBusy] = useSAuth(false);
  const [serverError, setServerError] = useSAuth("");
  const [email, setEmail] = useSAuth("");
  const [password, setPassword] = useSAuth("");
  const [terms, setTerms] = useSAuth(false);
  const [sensitive, setSensitive] = useSAuth(false);
  const [emailError, setEmailError] = useSAuth(null);

  function validate(){
    if(!email.includes("@") || email.length < 5){
      setEmailError("Cet email ne semble pas valide.");
      return false;
    }
    if(email === "claire@example.com"){
      setEmailError("Cet email semble déjà utilisé.");
      return false;
    }
    setEmailError(null);
    return true;
  }

  async function submit(){
    if(!validate()) return;
    if(!terms || !sensitive) return;
    if(password.length < 8) return;
    setBusy(true); setServerError("");
    try { await onSubmit({email, password, name:name.trim()}); }
    catch(e){ setServerError(e.message); }
    finally { setBusy(false); }
  }
  async function oauth(provider){
    if(!onOAuth){ onSubmit({email:"anne@example.com", oauth:provider}); return; }
    if(!terms || !sensitive){ setServerError("Coche d'abord les deux cases ci-dessous : elles valent aussi pour Google et Apple."); return; }
    setServerError("");
    try { await onOAuth(provider); } catch(e){ setServerError(e.message); }
  }

  const canSubmit = email && password.length >= 8 && terms && sensitive && (!askName || name.trim()) && !busy;

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 className="serif" style={{fontSize:30, marginTop:8, letterSpacing:"-.02em"}}>
          Créer ton compte
        </h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          Ces informations sont sensibles. On les protège avec soin.
        </p>

        {/* OAuth */}
        <div style={{display:"grid", gap:8, marginTop:24}}>
          <button onClick={() => oauth("google")}
                  className="btn soft" style={{width:"100%", minHeight:52}}>
            <IconGoogle size={18}/> Continuer avec Google
          </button>
          <button onClick={() => oauth("apple")}
                  className="btn" style={{width:"100%", minHeight:52, background:"#000", color:"#FFF"}}>
            <IconApple size={18}/> Continuer avec Apple
          </button>
        </div>

        {/* divider */}
        <div style={{display:"flex", alignItems:"center", gap:12, margin:"24px 0 4px"}} aria-hidden="true">
          <div style={{flex:1, height:1, background:"var(--line-2)"}}/>
          <span className="kicker">ou</span>
          <div style={{flex:1, height:1, background:"var(--line-2)"}}/>
        </div>

        {askName && (
          <FormField label="Ton prénom" htmlFor="su-name" hint="C'est ainsi que l'app et tes proches te verront.">
            <Field id="su-name" value={name} onChange={setName} placeholder="Anne" autoComplete="given-name"/>
          </FormField>
        )}

        <FormField label="Email" htmlFor="su-email" error={emailError}>
          <Field id="su-email" type="email" value={email} onChange={setEmail}
                 placeholder="ton@email.fr" autoComplete="email"/>
        </FormField>

        <FormField label="Mot de passe" htmlFor="su-pwd"
                   hint="Au moins 8 caractères — choisis-en un que tu retiendras.">
          <Field id="su-pwd" type="password" value={password} onChange={setPassword}
                 placeholder="••••••••" autoComplete="new-password"/>
        </FormField>

        {/* Consent block */}
        <div style={{marginTop:20, display:"grid", gap:10}}>
          <ConsentCheck checked={terms} onChange={setTerms}
                        label={<>J'accepte les conditions d'utilisation et la politique de confidentialité.</>}/>
          <ConsentCheck checked={sensitive} onChange={setSensitive}
                        label={<>Je comprends que <strong style={{color:"var(--ink)"}}>ces informations sont sensibles</strong> et qu'elles ne se partagent que sur mon invitation explicite.</>}/>
          <p className="meta" style={{lineHeight:1.6}}>
            À lire : <window.Legal.LegalLink doc="conditions">conditions d'utilisation</window.Legal.LegalLink> · <window.Legal.LegalLink doc="confidentialite">politique de confidentialité</window.Legal.LegalLink>
          </p>
        </div>

        <window.BUI.FormError msg={serverError}/>

        <button className="btn" style={{marginTop:24, width:"100%"}}
                disabled={!canSubmit} onClick={submit}>
          {busy ? "Création du compte…" : "Créer mon compte"}
        </button>

        <p style={{marginTop:18, textAlign:"center", fontSize:14.5, color:"var(--ink-2)"}}>
          Tu as déjà un compte ?&nbsp;
          <button onClick={onLogin}
                  style={{background:"none", border:"none", color:"var(--ink)", textDecoration:"underline", cursor:"pointer", padding:0, font:"inherit"}}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}

function ConsentCheck({checked, onChange, label}){
  return (
    <button onClick={() => onChange(!checked)} role="checkbox" aria-checked={checked}
            style={{
              width:"100%", textAlign:"left",
              display:"flex", gap:12, alignItems:"flex-start",
              background:"var(--paper)", border:"1px solid var(--line)",
              borderRadius:14, padding:"12px 14px", cursor:"pointer", color:"var(--ink)"
            }}>
      <span style={{
        width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1,
        background: checked ? "var(--ink)" : "transparent",
        border: checked ? "2px solid var(--ink)" : "2px solid var(--line-2)",
        color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center"
      }} aria-hidden="true">
        {checked && <IconCheckAuth size={12} sw={2.5}/>}
      </span>
      <span style={{fontSize:13.5, color:"var(--ink-2)", lineHeight:1.5}}>{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. LOGIN
   ───────────────────────────────────────────────────────────── */
function LoginScreen({onBack, onSubmit, onSignup, onForgot, onOAuth}){
  const real = window.Backend.enabled;
  const [email, setEmail] = useSAuth(real ? "" : "anne@example.com");
  const [password, setPassword] = useSAuth("");
  const [err, setErr] = useSAuth(null);
  const [busy, setBusy] = useSAuth(false);

  async function submit(){
    if(!email.includes("@")){ setErr("Email invalide."); return; }
    if(password.length < 4){ setErr("Mot de passe trop court."); return; }
    setErr(null); setBusy(true);
    try { await onSubmit({email, password}); }
    catch(e){ setErr(e.message); }
    finally { setBusy(false); }
  }
  async function oauth(provider){
    if(!onOAuth){ onSubmit({email:"anne@example.com"}); return; }
    setErr(null);
    try { await onOAuth(provider); } catch(e){ setErr(e.message); }
  }

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 className="serif" style={{fontSize:30, marginTop:8, letterSpacing:"-.02em"}}>
          Te revoilà.
        </h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          {real ? "Ton carnet t'attend." : "Le carnet de Jeanne t'attend."}
        </p>

        <FormField label="Email" htmlFor="li-email">
          <Field id="li-email" type="email" value={email} onChange={setEmail}
                 placeholder="ton@email.fr" autoComplete="email"/>
        </FormField>

        <FormField label="Mot de passe" htmlFor="li-pwd" error={err}>
          <Field id="li-pwd" type="password" value={password} onChange={setPassword}
                 placeholder="••••••••" autoComplete="current-password"/>
        </FormField>

        <button onClick={onForgot}
                style={{marginTop:14, background:"none", border:"none", color:"var(--ink)",
                        textDecoration:"underline", cursor:"pointer", padding:0,
                        font:"500 14px var(--sans)"}}>
          Mot de passe oublié ?
        </button>

        <button className="btn" style={{marginTop:22, width:"100%"}} onClick={submit} disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>

        <div style={{display:"flex", alignItems:"center", gap:12, margin:"24px 0"}} aria-hidden="true">
          <div style={{flex:1, height:1, background:"var(--line-2)"}}/>
          <span className="kicker">ou</span>
          <div style={{flex:1, height:1, background:"var(--line-2)"}}/>
        </div>

        <button onClick={() => oauth("google")}
                className="btn soft" style={{width:"100%", minHeight:52}}>
          <IconGoogle size={18}/> Continuer avec Google
        </button>
        <button onClick={() => oauth("apple")}
                className="btn" style={{width:"100%", minHeight:52, marginTop:8, background:"#000", color:"#FFF"}}>
          <IconApple size={18}/> Continuer avec Apple
        </button>

        <p style={{marginTop:18, textAlign:"center", fontSize:14.5, color:"var(--ink-2)"}}>
          Pas encore de compte ?&nbsp;
          <button onClick={onSignup}
                  style={{background:"none", border:"none", color:"var(--ink)", textDecoration:"underline", cursor:"pointer", padding:0, font:"inherit"}}>
            En créer un
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. RECOVERY + 5. VERIFICATION
   ───────────────────────────────────────────────────────────── */
function RecoveryScreen({onBack, onSent, onSend}){
  const [email, setEmail] = useSAuth("");
  const [sent, setSent] = useSAuth(false);
  const [busy, setBusy] = useSAuth(false);
  const [err, setErr] = useSAuth("");
  async function send(){
    if(!onSend){ setSent(true); return; }
    setBusy(true); setErr("");
    try { await onSend(email); } catch(e){ setErr(e.message); } finally { setBusy(false); }
  }

  if(sent) return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"6px 22px 24px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center"}}>
        <div style={{marginTop:30, width:80, height:80, borderRadius:"50%", background:"var(--c-gouts)", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <IconCheckAuth size={36} sw={2}/>
        </div>
        <h1 className="serif" style={{fontSize:28, marginTop:22, letterSpacing:"-.02em"}}>Lien envoyé.</h1>
        <p style={{marginTop:12, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.55, maxWidth:320}}>
          On t'a envoyé un lien pour réinitialiser ton mot de passe à <strong style={{color:"var(--ink)"}}>{email}</strong>.
          Pense à vérifier tes spams.
        </p>
        <button className="btn soft" style={{marginTop:28, minWidth:200}} onClick={onBack}>
          Retour à la connexion
        </button>
        <button onClick={() => setSent(false)}
                style={{marginTop:14, background:"none", border:"none", color:"var(--ink)", textDecoration:"underline", cursor:"pointer", font:"500 14px var(--sans)"}}>
          Renvoyer le lien
        </button>
      </div>
    </div>
  );

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 className="serif" style={{fontSize:28, marginTop:8, letterSpacing:"-.02em"}}>
          Mot de passe oublié ?
        </h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          Donne-nous ton email — on t'envoie {onSend ? "un code" : "un lien"} pour en choisir un nouveau.
        </p>

        <FormField label="Email" htmlFor="rec-email">
          <Field id="rec-email" type="email" value={email} onChange={setEmail}
                 placeholder="ton@email.fr" autoComplete="email"/>
        </FormField>

        <window.BUI.FormError msg={err}/>
        <button className="btn" style={{marginTop:22, width:"100%"}}
                disabled={!email.includes("@") || busy} onClick={send}>
          {busy ? "Envoi…" : onSend ? "M'envoyer le code" : "M'envoyer le lien"}
        </button>
      </div>
    </div>
  );
}

function VerificationScreen({email, onBack, onVerified, onVerify, onResend}){
  const [code, setCode] = useSAuth(["", "", "", "", "", ""]);
  const [err, setErr] = useSAuth("");
  const [info, setInfo] = useSAuth("");
  const [busy, setBusy] = useSAuth(false);
  const refs = useRAuth([]);

  function setDigit(i, v){
    v = v.replace(/\D/g, "").slice(0, 1);
    setCode(prev => {
      const next = [...prev]; next[i] = v; return next;
    });
    if(v && i < 5) refs.current[i+1]?.focus();
  }

  const filled = code.join("").length === 6;
  useEAuth(() => {
    if(!filled) return;
    if(!onVerify){ setTimeout(() => onVerified(), 600); return; }
    setBusy(true); setErr(""); setInfo("");
    onVerify(code.join(""))
      .catch(e => { setErr(e.message); setCode(["", "", "", "", "", ""]); refs.current[0]?.focus(); })
      .finally(() => setBusy(false));
  }, [filled]);
  async function resend(){
    if(!onResend) return;
    setErr(""); setInfo("");
    try { await onResend(); setInfo("Nouveau code envoyé."); } catch(e){ setErr(e.message); }
  }

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 className="serif" style={{fontSize:28, marginTop:8, letterSpacing:"-.02em"}}>
          Vérifie ton email.
        </h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          On a envoyé un code à 6 chiffres à <strong style={{color:"var(--ink)"}}>{email || "ton email"}</strong>.
        </p>

        <div style={{display:"flex", gap:8, marginTop:28, justifyContent:"center"}}>
          {code.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
                   inputMode="numeric" maxLength={1} value={d}
                   onChange={e => setDigit(i, e.target.value)}
                   aria-label={`Chiffre ${i+1}`}
                   style={{
                     width:48, height:60, borderRadius:14,
                     border:"1px solid " + (d ? "var(--ink)" : "var(--line-2)"),
                     background:"var(--paper)", textAlign:"center",
                     font:"600 28px var(--display)", color:"var(--ink)",
                     letterSpacing:"-.02em"
                   }}/>
          ))}
        </div>

        {busy && <p className="meta" role="status" style={{marginTop:18, textAlign:"center"}}>Vérification…</p>}
        <window.BUI.FormError msg={err}/>
        {info && <p role="status" className="meta" style={{marginTop:14, textAlign:"center", fontWeight:700}}>{info}</p>}
        <button onClick={resend} style={{marginTop:24, background:"none", border:"none", color:"var(--ink)",
                       textDecoration:"underline", cursor:"pointer", padding:0,
                       display:"block", marginInline:"auto",
                       font:"500 14px var(--sans)"}}>
          Renvoyer le code
        </button>

        <p className="meta" style={{marginTop:26, textAlign:"center", lineHeight:1.5}}>
          Pense à regarder dans les spams. Le code expire au bout d'une heure.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. ONBOARDING — first-run setup
   ───────────────────────────────────────────────────────────── */

const ONBOARDING_STEPS = ["welcome", "role", "profile", "consent", "howto"];

function OnboardingFlow({onDone, real}){
  const [step, setStep] = useSAuth(0);
  const [role, setRole] = useSAuth("fille");
  const [profile, setProfile] = useSAuth(real
    ? { name: "", age: "", since: "", pronoun: "elle", avatar: "warm" }
    : { name: "Jeanne", age: 86, since: "2 ans", relation: "ma mère", pronoun: "elle", avatar: "warm" });
  const [consent, setConsent] = useSAuth(null); // accord | representant | later
  const [busy, setBusy] = useSAuth(false);
  const [err, setErr] = useSAuth("");

  async function next(){
    if(step < ONBOARDING_STEPS.length - 1){ setStep(step + 1); return; }
    setBusy(true); setErr("");
    try { await onDone({role, profile, consent}); }
    catch(e){ setErr(e.message); }
    finally { setBusy(false); }
  }
  function back(){ if(step > 0) setStep(step - 1); else if(!real) onDone(null); }

  const phase = ONBOARDING_STEPS[step];

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        {step > 0 ? (
          <button className="iconbtn" aria-label="Retour" onClick={back}><IconBackAuth size={20}/></button>
        ) : <span style={{width:44}}/>}
        <div style={{display:"flex", gap:5, alignItems:"center"}}>
          {ONBOARDING_STEPS.map((_, i) => (
            <span key={i} aria-hidden="true" style={{
              height:6, borderRadius:3,
              width: i === step ? 22 : 6,
              background: i <= step ? "var(--ink)" : "rgba(0,0,0,.18)",
              transition:"width .3s ease, background .3s ease"
            }}/>
          ))}
        </div>
        {!real && step < ONBOARDING_STEPS.length - 1 ? (
          <button className="chip" onClick={onDone} style={{minHeight:36, padding:"6px 14px", fontSize:13}}>Passer</button>
        ) : <span style={{width:44}}/>}
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        {phase === "welcome" && <OnbWelcome onNext={next}/>}
        {phase === "role" && <OnbRole role={role} setRole={setRole} onNext={next}/>}
        {phase === "profile" && <OnbProfile profile={profile} setProfile={setProfile} onNext={next}/>}
        {phase === "consent" && <OnbConsent value={consent} onChange={setConsent} onNext={next} pronoun={profile.pronoun}/>}
        {phase === "howto" && <OnbHowto onNext={next}/>}
        {busy && <p className="meta" role="status" style={{marginTop:14, textAlign:"center"}}>Création du carnet…</p>}
        <window.BUI.FormError msg={err}/>
      </div>
    </div>
  );
}

function OnbWelcome({onNext}){
  return (
    <>
      <div className="float" style={{margin:"20px auto 0", display:"flex", justifyContent:"center"}}>
        <div style={{
          width:180, height:180, borderRadius:32, overflow:"hidden",
          background:"radial-gradient(120% 100% at 30% 30%, #F2D2B6, #F1DCA8)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          border:"1px solid rgba(0,0,0,.06)"
        }}>
          <JIAuth size={180}/>
        </div>
      </div>
      <p className="kicker" style={{marginTop:30, textAlign:"center"}}>Bienvenue</p>
      <h1 className="serif" style={{fontSize:32, marginTop:12, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.05}}>
        Ravi de t'accueillir.{"\n"}Qui accompagnes-tu ?
      </h1>
      <p style={{marginTop:16, fontSize:16, color:"var(--ink-2)", textAlign:"center", lineHeight:1.55, maxWidth:330, marginInline:"auto"}}>
        Quelques questions douces pour commencer le carnet à ta façon — tu pourras tout modifier plus tard.
      </p>
      <button className="btn" style={{marginTop:30, width:"100%"}} onClick={onNext}>
        Commencer
      </button>
    </>
  );
}

function OnbRole({role, setRole, onNext}){
  const ROLES = [
    {id:"fille", label:"Sa fille"},
    {id:"fils", label:"Son fils"},
    {id:"conjoint", label:"Son conjoint·e"},
    {id:"proche", label:"Un autre proche"},
    {id:"pro", label:"Un professionnel"}
  ];
  return (
    <>
      <p className="kicker" style={{marginTop:8}}>Ton rôle</p>
      <h1 className="serif" style={{fontSize:28, marginTop:10, letterSpacing:"-.02em"}}>
        Quel lien as-tu avec elle ?
      </h1>
      <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
        Pour qu'on adapte le ton du carnet.
      </p>

      <div role="radiogroup" aria-label="Ton lien" style={{marginTop:22, display:"grid", gap:10}}>
        {ROLES.map(r => {
          const on = role === r.id;
          return (
            <button key={r.id} role="radio" aria-checked={on}
                    onClick={() => setRole(r.id)}
                    style={{
                      width:"100%", textAlign:"left",
                      background: on ? "var(--ink)" : "var(--card)",
                      color: on ? "var(--paper)" : "var(--ink)",
                      border: "1px solid " + (on ? "var(--ink)" : "var(--line)"),
                      borderRadius:18, padding:"16px 18px",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:14, minHeight:60
                    }}>
              <span style={{flex:1, minWidth:0, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>{r.label}</span>
              <span aria-hidden="true" style={{
                width:22, height:22, borderRadius:"50%", flexShrink:0,
                border: on ? "2px solid var(--paper)" : "2px solid var(--line-2)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {on && <span style={{width:10, height:10, borderRadius:"50%", background:"var(--paper)"}}/>}
              </span>
            </button>
          );
        })}
      </div>

      <button className="btn" style={{marginTop:24, width:"100%"}} onClick={onNext}>
        Continuer
      </button>
    </>
  );
}

function OnbProfile({profile, setProfile, onNext}){
  const AVATARS = [
    {id:"warm", tone:"var(--c-habitudes)"},
    {id:"sage", tone:"var(--c-gouts)"},
    {id:"rose", tone:"var(--c-apaise)"},
    {id:"blue", tone:"var(--c-parler)"}
  ];
  const avatar = profile.avatar || "warm";
  const setAvatar = (a) => setProfile({...profile, avatar:a});
  const il = profile.pronoun === "il";

  return (
    <>
      <p className="kicker" style={{marginTop:8}}>Son profil</p>
      <h1 className="serif" style={{fontSize:28, marginTop:10, letterSpacing:"-.02em"}}>
        Présente-nous {profile.name || "la personne que tu accompagnes"}.
      </h1>

      {/* Avatar selector */}
      <p className="kicker" style={{marginTop:24}}>Avatar</p>
      <div style={{display:"flex", gap:10, marginTop:10, flexWrap:"wrap"}}>
        {AVATARS.map(a => (
          <button key={a.id} onClick={() => setAvatar(a.id)} aria-label={`Avatar ${a.id}`}
                  aria-pressed={avatar === a.id}
                  style={{
                    width:72, height:72, borderRadius:20, overflow:"hidden",
                    background: a.tone, display:"flex", alignItems:"flex-end", justifyContent:"center",
                    border: "2px solid " + (avatar === a.id ? "var(--ink)" : "transparent"),
                    cursor:"pointer", padding:0
                  }}>
            <JIAuth size={72}/>
          </button>
        ))}
        <button aria-label="Ajouter une photo" style={{
          width:72, height:72, borderRadius:20, border:"1px dashed var(--line-2)",
          background:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", color:"var(--ink-2)", fontSize:11, lineHeight:1.2, padding:8, textAlign:"center"
        }}>
          + Photo
        </button>
      </div>

      <FormField label="Son prénom" htmlFor="op-name">
        <Field id="op-name" value={profile.name} onChange={v => setProfile({...profile, name:v})}
               placeholder="Jeanne"/>
      </FormField>

      <div style={{marginTop:16}}>
        <span className="kicker">On parle d'elle ou de lui ?</span>
        <div role="radiogroup" aria-label="Pronom" style={{display:"flex", gap:8, marginTop:8}}>
          {[["elle", "Elle"], ["il", "Il"]].map(([id, label]) => (
            <button key={id} role="radio" className="chip" aria-checked={(profile.pronoun || "elle") === id} aria-pressed={(profile.pronoun || "elle") === id}
                    onClick={() => setProfile({...profile, pronoun:id})}>{label}</button>
          ))}
        </div>
      </div>

      <FormField label="Son âge" htmlFor="op-age">
        <Field id="op-age" type="number" value={profile.age}
               onChange={v => setProfile({...profile, age: v ? Number(v) : ""})}
               placeholder="86"/>
      </FormField>

      <FormField label={il ? "Accompagné depuis…" : "Accompagnée depuis…"} htmlFor="op-since" hint="Approximatif, ça suffit.">
        <Field id="op-since" value={profile.since}
               onChange={v => setProfile({...profile, since:v})}
               placeholder="2 ans"/>
      </FormField>

      <button className="btn" style={{marginTop:24, width:"100%"}}
              disabled={!profile.name} onClick={onNext}>
        Continuer
      </button>
    </>
  );
}

function OnbConsent({value, onChange, onNext, pronoun}){
  const g = (f, m) => pronoun === "il" ? m : f;
  const opts = [
    {id:"accord",     title:g("Elle a donné son accord", "Il a donné son accord"), body:g("Tu lui as expliqué et elle est d'accord.", "Tu lui as expliqué et il est d'accord.")},
    {id:"representant", title:"Je suis son représentant légal", body:"Tutelle, curatelle, mandat de protection future."},
    {id:"later",      title:"J'en parlerai plus tard",        body:"Tu pourras revenir sur cette question quand tu veux."}
  ];
  return (
    <>
      <div style={{margin:"12px auto 0", width:64, height:64, borderRadius:18, background:"var(--c-apaise)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--c-apaise-ink)"}}>
        <IconLockAuth size={28}/>
      </div>
      <p className="kicker" style={{marginTop:18, textAlign:"center"}}>Avec respect</p>
      <h1 className="serif" style={{fontSize:26, marginTop:10, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.15}}>
        {g("Le carnet parle d'elle.", "Le carnet parle de lui.")}{"\n"}{g("A-t-elle donné son accord ?", "A-t-il donné son accord ?")}
      </h1>
      <p style={{marginTop:14, fontSize:15, color:"var(--ink-2)", textAlign:"center", lineHeight:1.55, maxWidth:330, marginInline:"auto"}}>
        Ces informations lui appartiennent. On préfère te le rappeler avec douceur — rien n'est bloquant.
      </p>

      <div role="radiogroup" aria-label="Consentement" style={{marginTop:22, display:"grid", gap:10}}>
        {opts.map(o => {
          const on = value === o.id;
          return (
            <button key={o.id} role="radio" aria-checked={on}
                    onClick={() => onChange(o.id)}
                    style={{
                      width:"100%", textAlign:"left",
                      background: on ? "var(--ink)" : "var(--card)",
                      color: on ? "var(--paper)" : "var(--ink)",
                      border: "1px solid " + (on ? "var(--ink)" : "var(--line)"),
                      borderRadius:18, padding:"14px 16px",
                      cursor:"pointer", display:"flex", flexDirection:"column", gap:4
                    }}>
              <span style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{o.title}</span>
              <span style={{fontSize:13.5, opacity:.75, lineHeight:1.45}}>{o.body}</span>
            </button>
          );
        })}
      </div>

      <button className="btn" style={{marginTop:24, width:"100%"}}
              disabled={!value} onClick={onNext}>
        Continuer
      </button>
    </>
  );
}

function OnbHowto({onNext}){
  return (
    <>
      <p className="kicker" style={{marginTop:8, textAlign:"center"}}>Comment ça marche</p>
      <h1 className="serif" style={{fontSize:28, marginTop:10, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.1}}>
        Trois gestes,{"\n"}c'est tout.
      </h1>

      <ul style={{listStyle:"none", padding:0, margin:"24px 0 0", display:"grid", gap:12}}>
        {[
          {icon: <IconMicAuth size={22}/>, title:"Tu parles, le carnet écoute",
           body:"Un grand bouton micro, partout. Pas besoin de taper.", bg:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)"},
          {icon: <IconSparkleAuth size={22}/>, title:"L'IA range au bon endroit",
           body:"Sept rubriques, classées automatiquement — tu confirmes d'un geste.", bg:"var(--c-gouts)", ink:"var(--c-gouts-ink)"},
          {icon: <IconShareAuth size={22}/>, title:"Tu transmets par lien",
           body:"Une fiche claire, adaptée au destinataire — valable 7 jours.", bg:"var(--c-proches)", ink:"var(--c-proches-ink)"}
        ].map((s, i) => (
          <li key={i} className="card" style={{padding:16, display:"flex", gap:14, alignItems:"flex-start"}}>
            <span style={{
              width:46, height:46, borderRadius:14, flexShrink:0,
              background:s.bg, color:s.ink,
              display:"flex", alignItems:"center", justifyContent:"center"
            }} aria-hidden="true">
              {s.icon}
            </span>
            <div style={{flex:1, minWidth:0}}>
              <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17, color:"var(--ink)", letterSpacing:"-.01em"}}>{s.title}</p>
              <p style={{marginTop:6, fontSize:14, color:"var(--ink-2)", lineHeight:1.5}}>{s.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <button className="btn" style={{marginTop:28, width:"100%"}} onClick={onNext}>
        Entrer dans le carnet
      </button>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. RELAIS LINK LANDING — Continuer sans compte / Créer un compte léger
   ───────────────────────────────────────────────────────────── */
function RelaisLanding({payload, onContinueAsGuest, onCreateAccount}){
  const name = (payload?.name || "Claire").split(" ")[0];
  const from = payload?.fromName || "Anne";

  return (
    <div className="screen fade-enter">
      <SBAuth/>

      <div className="scroll" style={{padding:"20px 22px 24px"}}>
        <p className="kicker" style={{textAlign:"center"}}>Un lien partagé</p>

        <div className="float" style={{margin:"18px auto 0", display:"flex", justifyContent:"center"}}>
          <div style={{
            width:160, height:160, borderRadius:28, overflow:"hidden",
            background:"radial-gradient(120% 100% at 30% 30%, #F2D2B6, #F1DCA8)",
            display:"flex", alignItems:"flex-end", justifyContent:"center"
          }}>
            <JIAuth size={160}/>
          </div>
        </div>

        <h1 className="serif" style={{fontSize:30, marginTop:24, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.1}}>
          {from} te partage le carnet de Jeanne.
        </h1>
        <p style={{marginTop:14, fontSize:15.5, color:"var(--ink-2)", textAlign:"center", lineHeight:1.55, maxWidth:330, marginInline:"auto"}}>
          Tu pourras y voir ce qui aide à passer un beau moment avec elle — en lecture seule, sans compte si tu préfères.
        </p>

        <div className="card paper" style={{marginTop:24, padding:14, display:"flex", gap:12, alignItems:"center"}}>
          <AvatarAuth name={from} size={42} tone="cool"/>
          <div style={{flex:1, minWidth:0}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:15}}>{from}</p>
            <p className="meta">Sa fille · partagé il y a 2 jours</p>
          </div>
          <span className="mono" style={{fontSize:10, padding:"4px 8px", borderRadius:6, background:"var(--c-gouts)", color:"var(--c-gouts-ink)", letterSpacing:".08em"}}>POUR {name.toUpperCase()}</span>
        </div>

        <button className="btn" style={{marginTop:24, width:"100%"}} onClick={onContinueAsGuest}>
          Continuer sans compte
        </button>
        <button className="btn soft" style={{marginTop:10, width:"100%"}} onClick={onCreateAccount}>
          Créer un compte léger
        </button>

        <p className="meta" style={{marginTop:16, textAlign:"center", lineHeight:1.5, maxWidth:300, marginInline:"auto"}}>
          Le compte léger te permet de retrouver le carnet plus tard, sans renseigner plus que ton prénom.
        </p>
      </div>
    </div>
  );
}

function RelaisLiteSignup({onBack, onDone}){
  const [name, setName] = useSAuth("Claire");
  const [email, setEmail] = useSAuth("");
  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <h1 className="serif" style={{fontSize:28, marginTop:8, letterSpacing:"-.02em"}}>Compte léger</h1>
        <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
          Juste ton prénom et un email pour retrouver le carnet plus tard.
        </p>

        <FormField label="Ton prénom" htmlFor="rl-name">
          <Field id="rl-name" value={name} onChange={setName} placeholder="Claire"/>
        </FormField>
        <FormField label="Email" htmlFor="rl-email" hint="Tu recevras un lien à chaque connexion.">
          <Field id="rl-email" type="email" value={email} onChange={setEmail} placeholder="ton@email.fr"/>
        </FormField>

        <button className="btn" style={{marginTop:22, width:"100%"}}
                disabled={!name || !email.includes("@")} onClick={() => onDone({name, email})}>
          Créer mon compte léger
        </button>
        <p className="meta" style={{marginTop:14, textAlign:"center", lineHeight:1.5}}>
          Pas de mot de passe. Un lien magique à chaque connexion.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHOOSE PROFILE TYPE — aidant principal vs proche-soignant
   ───────────────────────────────────────────────────────────── */
function ChooseProfileScreen({onBack, onPick}){
  const [type, setType] = useSAuth(null);

  const TYPES = [
    {
      id:"aidant",
      title:"Je suis aidant principal",
      body:"Je construis le carnet de la personne que j'accompagne, j'en suis responsable et je décide qui peut le consulter.",
      tag:"Famille proche",
      bg:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)",
      illus: (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
        </svg>
      )
    },
    {
      id:"proche",
      title:"Je suis proche-soignant",
      body:"On m'a partagé un carnet pour accompagner quelqu'un. Je consulte, je peux laisser un mot, mais je ne modifie rien.",
      tag:"Relais · professionnel",
      bg:"var(--c-parler)", ink:"var(--c-parler-ink)",
      illus: (
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="9" r="3"/>
          <circle cx="17" cy="11" r="2.5"/>
          <path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5"/>
          <path d="M15 20c.4-2 1.6-3.2 4-3.2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBackAuth size={20}/></button>
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <p className="kicker" style={{marginTop:8}}>Avant de continuer</p>
        <h1 className="serif" style={{fontSize:30, marginTop:10, letterSpacing:"-.02em", lineHeight:1.1}}>
          Qui es-tu pour elle&nbsp;?
        </h1>
        <p style={{marginTop:12, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.55}}>
          On adapte ton compte pour qu'il te corresponde — tu pourras toujours changer plus tard.
        </p>

        <div role="radiogroup" aria-label="Type de profil" style={{marginTop:24, display:"grid", gap:12}}>
          {TYPES.map(t => {
            const on = type === t.id;
            return (
              <button key={t.id} role="radio" aria-checked={on}
                      onClick={() => setType(t.id)}
                      style={{
                        width:"100%", textAlign:"left",
                        background: on ? "var(--ink)" : "var(--card)",
                        color: on ? "var(--paper)" : "var(--ink)",
                        border: "1px solid " + (on ? "var(--ink)" : "var(--line)"),
                        borderRadius:22, padding:"18px",
                        cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start", minHeight:120
                      }}>
                <span style={{
                  width:60, height:60, borderRadius:18, flexShrink:0,
                  background: on ? "rgba(252,246,236,.12)" : t.bg,
                  color: on ? "var(--paper)" : t.ink,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }} aria-hidden="true">
                  {t.illus}
                </span>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18, letterSpacing:"-.01em"}}>{t.title}</span>
                  <span className="mono" style={{display:"inline-block", marginTop:6, padding:"3px 8px", borderRadius:6, fontSize:10, letterSpacing:".08em", background: on ? "rgba(252,246,236,.15)" : t.bg, color: on ? "var(--paper)" : t.ink}}>
                    {t.tag.toUpperCase()}
                  </span>
                  <span style={{display:"block", marginTop:8, fontSize:13.5, opacity:.85, lineHeight:1.5}}>{t.body}</span>
                </span>
                <span aria-hidden="true" style={{
                  width:22, height:22, borderRadius:"50%", flexShrink:0, marginTop:6,
                  border: on ? "2px solid var(--paper)" : "2px solid var(--line-2)",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  {on && <span style={{width:10, height:10, borderRadius:"50%", background:"var(--paper)"}}/>}
                </span>
              </button>
            );
          })}
        </div>

        <button className="btn" style={{marginTop:24, width:"100%"}}
                disabled={!type} onClick={() => onPick(type)}>
          Continuer
        </button>

        <p className="meta" style={{marginTop:18, textAlign:"center", lineHeight:1.55}}>
          Tu hésites&nbsp;? Choisis <strong style={{color:"var(--ink)"}}>aidant principal</strong> si tu construis le carnet, <strong style={{color:"var(--ink)"}}>proche-soignant</strong> si tu accompagnes via un lien partagé.
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCÈS — pris en charge par la mutuelle (particuliers)
   La mutuelle partenaire donne un code à ses adhérents. Sans code : découverte.
   ───────────────────────────────────────────────────────────── */
const ACCESS_FEATURES = [
  "Le carnet de la personne que tu accompagnes, sans limite",
  "Dictée et rangement des notes par l'IA",
  "Fiches partagées par lien sécurisé, pour les relais",
  "Ton cercle d'aidants peut contribuer, gratuitement",
  "Données chiffrées, hébergées en Europe",
];

function AccessScreen({real, onRedeem, onDiscovery, onDone, onBack}){
  const [code, setCode] = useSAuth("");
  const [step, setStep] = useSAuth("code");   // code | none | ok
  const [mutuelle, setMutuelle] = useSAuth("");
  const [err, setErr] = useSAuth("");
  const [busy, setBusy] = useSAuth(false);
  const clean = code.replace(/[^A-Za-z0-9]/g, "");

  async function redeem(e){
    e && e.preventDefault();
    if(clean.length < 6 || busy) return;
    setBusy(true); setErr("");
    try {
      if(!real){ setMutuelle("Mutuelle Exemple"); setStep("ok"); return; }
      const r = await onRedeem(code);
      if(r.status !== "ok"){ setErr("Ce code ne correspond à aucune mutuelle partenaire. Vérifie-le, lettre par lettre."); return; }
      setMutuelle(r.access.mutuelle_name); setStep("ok");
    } catch(x){ setErr(x.message); }
    finally { setBusy(false); }
  }
  async function discover(){
    setBusy(true); setErr("");
    try { if(real) await onDiscovery(); onDone(); }
    catch(x){ setErr(x.message); }
    finally { setBusy(false); }
  }

  if(step === "ok") return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="scroll" style={{padding:"40px 22px 24px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center"}}>
        <div style={{width:110, height:110, marginTop:30, borderRadius:"50%", background:"var(--c-gouts)", color:"var(--c-gouts-ink)", display:"flex", alignItems:"center", justifyContent:"center"}}>
          <IconCheckAuth size={46} sw={2}/>
        </div>
        <p className="kicker" style={{marginTop:28}}>C'est pris en charge</p>
        <h1 className="serif" role="status" style={{marginTop:10, fontSize:28, letterSpacing:"-.02em", lineHeight:1.15}}>
          {mutuelle} t'offre le carnet vivant.
        </h1>
        <p style={{marginTop:14, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.55, maxWidth:320}}>
          Tu n'as rien à payer. Ta mutuelle ne voit jamais ce que tu écris dans le carnet.
        </p>
        <button className="btn" style={{marginTop:28, width:"100%"}} onClick={onDone}>Créer le carnet</button>
      </div>
    </div>
  );

  return (
    <div className="screen fade-enter">
      <SBAuth/>
      <div className="topbar">
        {onBack ? <button className="iconbtn" aria-label="Retour" onClick={step === "none" ? () => setStep("code") : onBack}><IconBackAuth size={20}/></button> : <span style={{width:44}}/>}
        <BrandLogo size={20}/>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <div style={{margin:"4px auto 0", width:60, height:60, borderRadius:18, background:"var(--c-gouts)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--c-gouts-ink)"}}>
          <IconSparkleAuth size={28}/>
        </div>
        <h1 className="serif" style={{fontSize:28, marginTop:16, textAlign:"center", letterSpacing:"-.02em", lineHeight:1.15}}>
          Ton accès est pris en charge par ta mutuelle.
        </h1>
        <p style={{marginTop:12, fontSize:15.5, color:"var(--ink-2)", textAlign:"center", lineHeight:1.55, maxWidth:340, marginInline:"auto"}}>
          Le carnet vivant est offert aux adhérents des mutuelles partenaires, pour soutenir ce que tu fais déjà au quotidien.
        </p>

        {step === "code" ? (
          <form onSubmit={redeem} style={{marginTop:22}}>
            <FormField label="Code de ta mutuelle" htmlFor="mu-code"
                       hint="Ta mutuelle te l'a transmis : courrier, email ou espace adhérent.">
              <input id="mu-code" value={code} onChange={e => { setCode(e.target.value); setErr(""); }}
                     autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="MUTUELLE-2026"
                     aria-invalid={!!err} aria-describedby={err ? "mu-err" : undefined}
                     style={{width:"100%", minHeight:52, border:"1px solid var(--line-2)", background:"var(--paper)", borderRadius:14,
                             padding:"12px 14px", fontSize:18, fontFamily:"var(--sans)", fontWeight:700, letterSpacing:".06em", color:"var(--ink)", textTransform:"uppercase"}}/>
            </FormField>
            <div id="mu-err"><window.BUI.FormError msg={err}/></div>
            <button type="submit" className="btn" style={{marginTop:18, width:"100%"}} disabled={clean.length < 6 || busy}>
              {busy ? "Vérification…" : "Valider mon code"}
            </button>
            <button type="button" className="btn soft" style={{marginTop:10, width:"100%"}} onClick={() => { setStep("none"); setErr(""); }}>
              Je n'ai pas de code
            </button>
          </form>
        ) : (
          <div className="card slide-up" style={{marginTop:22, padding:18}}>
            <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:17}}>Commence tout de suite.</p>
            <p style={{marginTop:8, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>
              Tu as <strong style={{color:"var(--ink)"}}>14 jours de découverte</strong>, sans rien payer ni donner de carte bancaire.
              Pendant ce temps, demande à ta mutuelle si elle propose le carnet vivant : tu pourras ajouter son code plus tard, dans les réglages.
            </p>
            <p style={{marginTop:8, fontSize:14.5, color:"var(--ink-2)", lineHeight:1.55}}>Quoi qu'il arrive, tes notes restent à toi.</p>
            <window.BUI.FormError msg={err}/>
            <button className="btn" style={{marginTop:16, width:"100%"}} disabled={busy} onClick={discover}>
              {busy ? "Un instant…" : "Commencer la découverte"}
            </button>
          </div>
        )}

        <p className="kicker" style={{marginTop:26}}>Ce qui est inclus</p>
        <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:8}}>
          {ACCESS_FEATURES.map((f, i) => (
            <li key={i} style={{display:"flex", gap:12, alignItems:"flex-start"}}>
              <span aria-hidden="true" style={{width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1, background:"var(--c-gouts)", color:"var(--c-gouts-ink)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                <IconCheckAuth size={14} sw={2.5}/>
              </span>
              <span style={{fontSize:14.5, color:"var(--ink)", lineHeight:1.5}}>{f}</span>
            </li>
          ))}
        </ul>
        <p className="meta" style={{marginTop:16, textAlign:"center", lineHeight:1.55}}>
          Les proches que tu invites et les relais qui reçoivent une fiche n'ont jamais rien à payer.
        </p>
      </div>
    </div>
  );
}

window.Auth = {
  LaunchScreen, SignupScreen, LoginScreen, RecoveryScreen, VerificationScreen,
  OnboardingFlow, RelaisLanding, RelaisLiteSignup, BrandLogo, ChooseProfileScreen,
  AccessScreen
};
