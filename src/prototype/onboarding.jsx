// Onboarding structures — choix du profil, création d'établissement, entrée soignant·e par code, invitation famille
(() => {
const { useState } = React;
const { StatusBar, Avatar } = window.UI;
const { IconBack, IconCheck, IconChevron, CatPeople, IconLock } = window.Icons;

const Field = ({label, hint, ...p}) => (
  <label style={{display:"block"}}>
    <span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:6}}>{label}</span>
    <input {...p} style={{width:"100%", minHeight:52, borderRadius:16, border:"none", background:"#fff", padding:"0 16px", font:"600 16px var(--sans)", color:"var(--ink)", boxShadow:"inset 0 0 0 1.5px var(--line)", ...(p.style||{})}}/>
    {hint && <span className="meta" style={{display:"block", marginTop:6, fontSize:12.5}}>{hint}</span>}
  </label>
);
const Head = ({onBack, step, total}) => (
  <div className="topbar" style={{padding:"8px 20px 4px"}}>
    <button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>
    {step && <div style={{display:"flex", gap:6}} aria-label={`Étape ${step} sur ${total}`}>{Array.from({length:total}).map((_,i) => <span key={i} style={{height:6, borderRadius:3, width: i+1 === step ? 24 : 6, background: i+1 <= step ? "var(--ink)" : "var(--line-2)", transition:"width .3s"}}/>)}</div>}
    <span style={{width:44}}/>
  </div>
);
const Circle = ({Icon, bg="var(--ink)", color="#fff", size=44, isize=20}) => <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={isize} sw={1.8}/></span>;

/* 1. Qui es-tu ? */
function RolePicker({onBack, onPick}){
  const ROLES = [
    { id:"aidant", t:"Un·e aidant·e", b:"Tu accompagnes un proche. Tu crées et tiens son carnet.", bg:"var(--c-parler)", ink:"var(--c-parler-ink)", who:"Anne C" },
    { id:"proche", t:"Un proche invité", b:"Quelqu'un t'a envoyé un lien. Pas de compte à créer.", bg:"var(--c-sante)", ink:"var(--c-sante-ink)", who:"Claire Martin" },
    { id:"etab", t:"Un établissement ou un service", b:"EHPAD, SSIAD, accueil de jour. Tu ouvres un carnet par résident, ton équipe le tient.", bg:"var(--c-habitudes)", ink:"var(--c-habitudes-ink)", who:"Marc Aubry" },
    { id:"soignant", t:"Un·e soignant·e", b:"Ton cadre t'a donné un code. Entre-le, c'est tout.", bg:"var(--c-histoire)", ink:"var(--c-histoire-ink)", who:"Sandra Meyer" },
  ];
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Head onBack={onBack}/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <h1 style={{fontSize:30, marginTop:8}}>Tu es…</h1>
        <p className="meta" style={{marginTop:8, fontSize:15}}>Le carnet s'adapte à ta place auprès de la personne.</p>
        <ul style={{listStyle:"none", padding:0, margin:"18px 0 0", display:"grid", gap:10}}>
          {ROLES.map(r => (
            <li key={r.id}><button onClick={() => onPick(r.id)} className="card-press" style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:16, background:r.bg, color:r.ink, display:"flex", gap:14, alignItems:"center", minHeight:88}}>
              <window.UserPersona name={r.who} size={56} bg="rgba(255,255,255,.7)"/>
              <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 16.5px var(--sans)", letterSpacing:"-.02em"}}>{r.t}</span><span style={{display:"block", marginTop:4, fontSize:13, fontWeight:600, opacity:.85, lineHeight:1.4}}>{r.b}</span></span>
              <IconChevron size={18}/>
            </button></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* 2. Création d'une structure (3 étapes) */
function EtabSignup({onBack, onDone}){
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name:"Maison des Tilleuls", type:"EHPAD", finess:"", city:"Lyon", who:"Marc Aubry", role:"Cadre de santé", email:"", units:["Unité A","Unité B"] });
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const up = (k, v) => setF(p => ({...p, [k]:v}));
  const TYPES = ["EHPAD","SSIAD","Accueil de jour","Résidence autonomie","Service à domicile","Hôpital / USLD"];
  function verify(){ setChecking(true); setTimeout(() => { setChecking(false); setVerified(true); }, 1100); }
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Head onBack={() => step > 1 ? setStep(step - 1) : onBack()} step={step} total={3}/>
      <div className="scroll" style={{padding:"8px 20px 24px", display:"flex", flexDirection:"column"}}>
        {step === 1 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>Ta structure.</h1>
          <p className="meta" style={{marginTop:8}}>Le numéro FINESS nous permet de vérifier qu'il s'agit bien d'un établissement autorisé. Aucune donnée de résident n'est demandée.</p>
          <div style={{display:"grid", gap:14, marginTop:20}}>
            <Field label="Nom de l'établissement" value={f.name} onChange={e => up("name", e.target.value)}/>
            <div>
              <span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:8}}>Type</span>
              <div style={{display:"flex", flexWrap:"wrap", gap:8}}>{TYPES.map(t => <button key={t} className="chip" aria-pressed={f.type === t} onClick={() => up("type", t)}>{t}</button>)}</div>
            </div>
            <Field label="Numéro FINESS" value={f.finess} onChange={e => { up("finess", e.target.value.replace(/\D/g,"").slice(0,9)); setVerified(false); }} inputMode="numeric" placeholder="9 chiffres" hint="Sur ton arrêté d'autorisation ou sur finess.esante.gouv.fr"/>
            {f.finess.length === 9 && !verified && <button className="btn soft" onClick={verify} disabled={checking}>{checking ? "Vérification…" : "Vérifier le numéro"}</button>}
            {verified && <div className="card slide-up" style={{padding:14, display:"flex", gap:12, alignItems:"center", background:"var(--c-sante)", color:"var(--c-sante-ink)"}}><Circle Icon={IconCheck} size={36} isize={16}/><p style={{fontSize:13.5, fontWeight:700, lineHeight:1.4}}>{f.name} · {f.type} · {f.city}. Établissement reconnu.</p></div>}
          </div>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:20, width:"100%"}} disabled={!verified} onClick={() => setStep(2)}>Continuer</button>
        </>)}
        {step === 2 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>Et toi.</h1>
          <p className="meta" style={{marginTop:8}}>Tu seras le premier compte cadre : tu crées les unités, ajoutes l'équipe et décides des droits.</p>
          <div style={{display:"grid", gap:14, marginTop:20}}>
            <Field label="Prénom et nom" value={f.who} onChange={e => up("who", e.target.value)}/>
            <Field label="Fonction" value={f.role} onChange={e => up("role", e.target.value)} placeholder="Cadre de santé, directeur·rice, IDEC…"/>
            <Field label="Email professionnel" type="email" value={f.email} onChange={e => up("email", e.target.value)} placeholder={"prenom@" + f.name.toLowerCase().replace(/[^a-z]/g,"") + ".fr"} hint="Un code de connexion t'y sera envoyé. Pas de mot de passe."/>
          </div>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:20, width:"100%"}} disabled={!f.who.trim() || !f.email.includes("@")} onClick={() => setStep(3)}>Continuer</button>
        </>)}
        {step === 3 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>Tes unités.</h1>
          <p className="meta" style={{marginTop:8}}>Tu affecteras ensuite chaque soignant·e à une unité. Modifiable à tout moment.</p>
          <ul style={{listStyle:"none", padding:0, margin:"18px 0 0", display:"grid", gap:8}}>
            {f.units.map((u, i) => <li key={i} className="card" style={{padding:"6px 8px 6px 16px", display:"flex", alignItems:"center", gap:10}}><input value={u} onChange={e => up("units", f.units.map((x,k) => k === i ? e.target.value : x))} aria-label={`Nom de l'unité ${i+1}`} style={{flex:1, border:"none", background:"transparent", font:"800 15px var(--sans)", color:"var(--ink)", minHeight:40}}/><button className="iconbtn" aria-label="Retirer" onClick={() => up("units", f.units.filter((_,k) => k !== i))} style={{width:40, height:40, minWidth:40}}>×</button></li>)}
            <li><button className="btn soft" style={{width:"100%"}} onClick={() => up("units", [...f.units, `Unité ${String.fromCharCode(65 + f.units.length)}`])}>+ Ajouter une unité</button></li>
          </ul>
          <div className="card" style={{marginTop:16, padding:14, display:"flex", gap:12, alignItems:"center"}}>
            <Circle Icon={IconLock} bg="var(--bg)" color="var(--ink)" size={40} isize={18}/>
            <p className="meta" style={{fontSize:13, lineHeight:1.45}}>Ensuite, un carnet par résident, tenu par l'équipe. Les familles peuvent être invitées à y contribuer.</p>
          </div>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:20, width:"100%"}} disabled={f.units.length === 0} onClick={() => onDone(f)}>Créer {f.name}</button>
        </>)}
      </div>
    </div>
  );
}

/* 3. Entrée soignant·e par code */
function StaffEntry({onBack, onDone}){
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [err, setErr] = useState("");
  const found = code.length === 6;
  const me = { name:"Sandra Meyer", role:"Aide-soignante", unit:"Unité B", etab:"Maison des Tilleuls", cadre:"Marc Aubry", perm:"À valider" };
  const Keypad = ({value, onChange, max}) => (
    <div style={{display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8, marginTop:18}}>
      {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i) => k === "" ? <span key={i}/> : (
        <button key={i} onClick={() => k === "⌫" ? onChange(value.slice(0,-1)) : value.length < max && onChange(value + k)} aria-label={k === "⌫" ? "Effacer" : k} style={{border:"none", cursor:"pointer", minHeight:60, borderRadius:18, background: k === "⌫" ? "var(--bg-2)" : "#fff", font:"800 22px var(--sans)", color:"var(--ink)"}}>{k}</button>
      ))}
    </div>
  );
  const Dots = ({len, max, wide}) => <div style={{display:"flex", justifyContent:"center", gap:10, marginTop:20}} aria-hidden="true">{Array.from({length:max}).map((_,i) => <span key={i} style={{width: wide ? 40 : 18, height: wide ? 52 : 18, borderRadius: wide ? 12 : "50%", background: i < len ? "var(--ink)" : "#fff", boxShadow:"inset 0 0 0 1.5px var(--line-2)", display:"flex", alignItems:"center", justifyContent:"center", font:"800 22px var(--sans)", color:"#fff", transition:"background .15s"}}>{wide && i < len ? code[i] : ""}</span>)}</div>;
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Head onBack={() => step > 1 ? setStep(step - 1) : onBack()} step={step} total={3}/>
      <div className="scroll" style={{padding:"8px 20px 24px", display:"flex", flexDirection:"column"}}>
        {step === 1 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>Ton code d'équipe.</h1>
          <p className="meta" style={{marginTop:8}}>Six chiffres, donnés par ton cadre. Pas d'email, pas de mot de passe.</p>
          <Dots len={code.length} max={6} wide/>
          <Keypad value={code} onChange={setCode} max={6}/>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:16, width:"100%"}} disabled={!found} onClick={() => setStep(2)}>Continuer</button>
        </>)}
        {step === 2 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>C'est bien toi ?</h1>
          <div style={{marginTop:18, background:"var(--c-histoire)", color:"var(--c-histoire-ink)", borderRadius:"var(--r-xl)", padding:20, display:"flex", gap:14, alignItems:"center"}}>
            <window.UserPersona name={me.name} size={64} bg="rgba(255,255,255,.7)"/>
            <div style={{flex:1, minWidth:0}}><p style={{font:"800 20px var(--sans)", letterSpacing:"-.02em"}}>{me.name}</p><p style={{marginTop:4, fontSize:13.5, fontWeight:600, opacity:.85}}>{me.role} · {me.unit}</p></div>
          </div>
          <ul style={{listStyle:"none", padding:0, margin:"12px 0 0", display:"grid", gap:8}}>
            {[["Établissement", me.etab],["Ajoutée par", me.cadre],["Tes droits", me.perm + " · tes notes sont publiées après visa du cadre"]].map(([k,v]) => <li key={k} className="card" style={{padding:"12px 16px", display:"flex", justifyContent:"space-between", gap:12}}><span style={{font:"800 13.5px var(--sans)", whiteSpace:"nowrap"}}>{k}</span><span className="meta" style={{fontSize:13, textAlign:"right"}}>{v}</span></li>)}
          </ul>
          <div style={{flex:1}}/>
          <button className="btn" style={{marginTop:16, width:"100%"}} onClick={() => setStep(3)}>Oui, c'est moi</button>
          <button className="btn soft" style={{marginTop:8, width:"100%"}} onClick={() => { setCode(""); setStep(1); }}>Non, ce n'est pas moi</button>
        </>)}
        {step === 3 && (<>
          <h1 style={{fontSize:28, marginTop:8}}>{pin.length < 4 ? "Choisis un code à 4 chiffres." : "Encore une fois."}</h1>
          <p className="meta" style={{marginTop:8}}>C'est lui que tu taperas chaque jour, en tournée. {err && <strong style={{color:"#B3261E"}}>{err}</strong>}</p>
          <Dots len={pin.length < 4 ? pin.length : pin2.length} max={4}/>
          <Keypad value={pin.length < 4 ? pin : pin2} max={4} onChange={v => { setErr(""); if(pin.length < 4) setPin(v); else { setPin2(v); if(v.length === 4){ if(v === pin) setTimeout(() => onDone(me), 300); else { setErr("Les deux codes ne correspondent pas."); setPin(""); setPin2(""); } } } }}/>
          <div style={{flex:1}}/>
        </>)}
      </div>
    </div>
  );
}

/* 4. Invitation d'une famille (côté cadre) */
function InviteFamily({unit="Unité B", onBack, onSent}){
  const [f, setF] = useState({ resident:"", family:"", contact:"", cats:["habitudes","apaise","parler","sante"] });
  const { CATEGORIES } = window.AppData;
  const up = (k,v) => setF(p => ({...p, [k]:v}));
  const toggle = id => up("cats", f.cats.includes(id) ? f.cats.filter(x => x !== id) : [...f.cats, id]);
  const ok = f.resident.trim() && f.family.trim() && f.contact.trim() && f.cats.length;
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Head onBack={onBack}/>
      <div className="scroll" style={{padding:"8px 20px 24px", display:"flex", flexDirection:"column"}}>
        <h1 style={{fontSize:28, marginTop:8}}>Inviter une famille.</h1>
        <p className="meta" style={{marginTop:8}}>La famille reçoit ta demande et choisit ce qu'elle partage. Le carnet lui appartient : elle peut retirer l'accès à tout moment.</p>
        <div style={{display:"grid", gap:14, marginTop:20}}>
          <Field label="Résident·e" value={f.resident} onChange={e => up("resident", e.target.value)} placeholder="Prénom et nom"/>
          <Field label="Aidant·e principal·e" value={f.family} onChange={e => up("family", e.target.value)} placeholder="Prénom, lien (fille, époux…)"/>
          <Field label="Email ou téléphone" value={f.contact} onChange={e => up("contact", e.target.value)} placeholder="Pour lui envoyer l'invitation"/>
          <div>
            <span style={{display:"block", font:"800 13px var(--sans)", color:"var(--ink-2)", marginBottom:8}}>Rubriques demandées pour {unit}</span>
            <div style={{display:"flex", flexWrap:"wrap", gap:8}}>{CATEGORIES.map(c => <button key={c.id} className="chip" aria-pressed={f.cats.includes(c.id)} onClick={() => toggle(c.id)} style={f.cats.includes(c.id) ? {} : {background:c.bg, color:c.ink, boxShadow:"none"}}><c.Icon size={14} sw={1.8}/> {c.title}</button>)}</div>
            <p className="meta" style={{marginTop:8, fontSize:12.5}}>La famille pourra en retirer. Elle ne pourra pas en ajouter sans le vouloir.</p>
          </div>
        </div>
        <div style={{flex:1}}/>
        <button className="btn" style={{marginTop:20, width:"100%"}} disabled={!ok} onClick={() => onSent(f)}><IconCheck size={18}/> Envoyer l'invitation</button>
      </div>
    </div>
  );
}

window.Onboarding = { RolePicker, EtabSignup, StaffEntry, InviteFamily };
})();
