// Aidant — Transmettre (sheet → preview → share) and Settings
const { useState: useStateAS, useMemo: useMemoAS } = React;
const {
  IconBack: IconBackAS, IconCheck: IconCheckAS, IconShare: IconShareAS,
  IconLink: IconLinkAS, IconCopy: IconCopyAS, IconEye: IconEyeAS,
  IconLock: IconLockAS, IconChevron: IconChevronAS, IconPlus: IconPlusAS
} = window.Icons;
const { CATEGORIES: CATS_AS, CAT_BY_ID: CBY_AS, softDate: softDate_AS } = window.AppData;
const { StatusBar: SB_AS } = window.UI;

const RECIPIENTS_AS = [
  {
    id:"proche", title:"Un proche",
    blurb:"Famille, ami qui prend le relais ce week-end.",
    tone:"chaleureux, tutoiement",
    include:["histoire","habitudes","apaise","parler","gouts","proches"],
    intro:"Voici ce qu'il faut savoir pour passer un bon moment avec Jeanne."
  },
  {
    id:"pro", title:"Un professionnel",
    blurb:"Auxiliaire de vie, aide à domicile, infirmière.",
    tone:"clair, vouvoiement, précis",
    include:["habitudes","apaise","parler","sante","gouts"],
    intro:"L'essentiel pour bien accompagner Jeanne au quotidien."
  },
  {
    id:"etab", title:"Un établissement",
    blurb:"Accueil court ou long séjour, à remettre à l'équipe.",
    tone:"institutionnel, structuré",
    include:["histoire","habitudes","apaise","parler","gouts","sante","proches"],
    intro:"Fiche de connaissance — Madame Jeanne C., remise à l'équipe d'accueil."
  }
];

/* ─────────────────────────────────────────────────────────────
   Transmettre — tab landing → flow
   ───────────────────────────────────────────────────────────── */
function AidantTransmettre({notes, sharePayload, setSharePayload, onSent, onClose}){
  // sub-step: list | choose | preview | share
  const [step, setStep] = useStateAS("list");
  const [recipientId, setRecipientId] = useStateAS("proche");
  const [included, setIncluded] = useStateAS(null);
  const recipient = RECIPIENTS_AS.find(r => r.id === recipientId);

  function startNew(){
    setRecipientId("proche");
    setIncluded(null);
    setStep("choose");
  }
  function generate(){
    setIncluded(new Set(recipient.include));
    setStep("preview");
  }
  function goShare(){
    // commit pending
    setStep("share");
  }
  function send({name}){
    setSharePayload({
      recipient, included:Array.from(included), name, fromName:"Anne",
      token:"4f7c-2a9e", createdAt:Date.now()
    });
    onSent(name);
    setStep("list");
  }

  return (
    <div className="screen fade-enter">
      <SB_AS/>
      <div className="topbar">
        {step !== "list" ? (
          <button className="iconbtn" aria-label="Retour" onClick={() => setStep(prev => prev === "share" ? "preview" : prev === "preview" ? "choose" : "list")}>
            <IconBackAS size={20}/>
          </button>
        ) : (onClose ? <button className="iconbtn" aria-label="Retour" onClick={onClose}><IconBackAS size={20}/></button> : <span style={{width:44}}/>)}
        <h1 className="serif" style={{fontSize:22}}>Transmettre</h1>
        <span style={{width:44}}/>
      </div>

      {step === "list" && (
        <div className="scroll" style={{padding:"6px 22px 24px"}}>
          <p style={{marginTop:4, fontSize:16, color:"var(--ink-2)", lineHeight:1.5}}>
            Une fiche claire et chaleureuse, adaptée à qui prend le relais.
          </p>

          <button onClick={startNew}
                  style={{
                    marginTop:20, width:"100%", textAlign:"left",
                    background:"var(--ink)", color:"var(--paper)", border:"none",
                    borderRadius:24, padding:"22px 22px", cursor:"pointer",
                    display:"flex", gap:14, alignItems:"center"
                  }}>
            <span style={{width:44, height:44, borderRadius:14, background:"rgba(252,246,236,.18)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
              <IconPlusAS size={22}/>
            </span>
            <span style={{flex:1, minWidth:0}}>
              <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:20}}>Nouvelle transmission</span>
              <span style={{display:"block", marginTop:4, fontSize:13.5, opacity:.75}}>Choisir le destinataire, ajuster ce qui est visible, envoyer.</span>
            </span>
          </button>

          <p className="label" style={{marginTop:28}}>Fiches en cours</p>
          <div style={{marginTop:10, display:"grid", gap:10}}>
            <ShareCard payload={sharePayload}/>
          </div>

          <p className="label" style={{marginTop:28}}>Modèles</p>
          <div style={{marginTop:10, display:"grid", gap:10}}>
            {RECIPIENTS_AS.map(r => (
              <button key={r.id} onClick={() => { setRecipientId(r.id); setIncluded(new Set(r.include)); setStep("preview"); }}
                      style={{
                        width:"100%", textAlign:"left",
                        background:"var(--paper)", border:"1px solid var(--line)",
                        borderRadius:20, padding:"14px 16px", cursor:"pointer",
                        display:"flex", gap:12, alignItems:"center"
                      }}>
                <span style={{width:40, height:40, borderRadius:12,
                              background: r.id === "proche" ? "var(--c-apaise)" : r.id === "pro" ? "var(--c-parler)" : "var(--c-proches)",
                              color: r.id === "proche" ? "var(--c-apaise-ink)" : r.id === "pro" ? "var(--c-parler-ink)" : "var(--c-proches-ink)",
                              display:"flex", alignItems:"center", justifyContent:"center"}}
                      aria-hidden="true">
                  <IconShareAS size={18} sw={1.6}/>
                </span>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{r.title}</span>
                  <span className="meta" style={{marginTop:2, display:"block"}}>{r.blurb}</span>
                </span>
                <IconChevronAS size={18} sw={1.7}/>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "choose" && (
        <ChooseRecipient
          recipientId={recipientId} setRecipientId={setRecipientId}
          onNext={generate}
        />
      )}

      {step === "preview" && included && (
        <PreviewFiche
          notes={notes}
          recipient={recipient}
          included={included}
          onToggle={(catId) => {
            const next = new Set(included);
            if(next.has(catId)) next.delete(catId); else next.add(catId);
            setIncluded(next);
          }}
          onNext={goShare}
        />
      )}

      {step === "share" && included && (
        <ShareCompose
          recipient={recipient}
          included={Array.from(included)}
          onSend={send}
        />
      )}
    </div>
  );
}

function ShareCard({payload}){
  const cat = CBY_AS[payload.included[0]];
  return (
    <div className="card" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
      <span style={{width:42, height:42, borderRadius:13, flexShrink:0, background:cat.bg, color:cat.ink, display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
        <IconShareAS size={18} sw={1.7}/>
      </span>
      <div style={{flex:1, minWidth:0}}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16, color:"var(--ink)"}}>
          Pour {payload.name}
        </p>
        <p className="meta" style={{marginTop:4}}>
          {payload.recipient.title.toLowerCase()} · {payload.included.length} rubriques · partagée {softDate_AS(payload.createdAt)}
        </p>
        <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
          <span className="chip" style={{minHeight:32, padding:"4px 12px", fontSize:12, background:"var(--paper)"}}>
            Valable encore 5 jours
          </span>
          <span className="chip" style={{minHeight:32, padding:"4px 12px", fontSize:12, background:"var(--paper)"}}>
            <span style={{width:6, height:6, borderRadius:"50%", background:"#3F7A57", display:"inline-block"}}/>
            Lu
          </span>
        </div>
      </div>
    </div>
  );
}

function ChooseRecipient({recipientId, setRecipientId, onNext}){
  const recipient = RECIPIENTS_AS.find(r => r.id === recipientId);
  return (
    <div className="scroll" style={{padding:"6px 22px 24px"}}>
      <p className="label">Étape 1 sur 3</p>
      <h1 className="serif" style={{marginTop:6, fontSize:28}}>À qui veux‑tu transmettre&nbsp;?</h1>
      <p style={{marginTop:10, fontSize:16, color:"var(--ink-2)"}}>
        Je prépare une fiche claire. Le ton et le niveau de détail s'adaptent au destinataire.
      </p>

      <div role="radiogroup" aria-label="Destinataire" style={{display:"grid", gap:12, marginTop:22}}>
        {RECIPIENTS_AS.map(r => {
          const selected = recipientId === r.id;
          return (
            <button key={r.id} role="radio" aria-checked={selected}
                    onClick={() => setRecipientId(r.id)}
                    style={{
                      background: selected ? "var(--ink)" : "var(--card)",
                      color: selected ? "var(--paper)" : "var(--ink)",
                      border: "1px solid " + (selected ? "var(--ink)" : "var(--line)"),
                      borderRadius:22, padding:"18px",
                      cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left"
                    }}>
              <span style={{flex:1, minWidth:0}}>
                <span style={{display:"block", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:20}}>{r.title}</span>
                <span style={{display:"block", marginTop:4, fontSize:13.5, color: selected ? "rgba(252,246,236,.78)" : "var(--ink-3)"}}>{r.blurb}</span>
              </span>
              <span aria-hidden="true" style={{
                width:24, height:24, borderRadius:"50%",
                border: selected ? "2px solid var(--paper)" : "2px solid var(--line-2)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {selected && <span style={{width:10, height:10, borderRadius:"50%", background:"var(--paper)"}}/>}
              </span>
            </button>
          );
        })}
      </div>

      <p className="label" style={{marginTop:26}}>Ce qui sera adapté</p>
      <div className="card paper" style={{marginTop:10}}>
        <p style={{fontSize:14, color:"var(--ink-2)", lineHeight:1.55}}>
          <strong style={{color:"var(--ink)"}}>Ton&nbsp;:</strong> {recipient.tone}.<br/>
          <strong style={{color:"var(--ink)"}}>Rubriques&nbsp;:</strong> {recipient.include.map(id => CBY_AS[id].title).join(" · ")}.
        </p>
      </div>

      <button className="btn primary" style={{marginTop:28, width:"100%"}} onClick={onNext}>
        Préparer la fiche
      </button>
    </div>
  );
}

function PreviewFiche({notes, recipient, included, onToggle, onNext}){
  const byCat = useMemoAS(() => {
    const m = {};
    for(const n of notes) (m[n.catId] = m[n.catId] || []).push(n);
    return m;
  }, [notes]);
  const visibleCats = CATS_AS.filter(c => included.has(c.id) && (byCat[c.id]||[]).length > 0);

  return (
    <div className="scroll" style={{padding:"6px 22px 24px"}}>
      <p className="label">Étape 2 sur 3 · Aperçu pour {recipient.title.toLowerCase()}</p>

      <article style={{
        marginTop:12, background:"var(--paper)", border:"1px solid var(--line)",
        borderRadius:24, padding:"22px 18px"
      }}>
        <p style={{fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:12, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:".18em"}}>L'essentiel à savoir</p>
        <h2 className="serif" style={{fontSize:26, marginTop:6}}>Jeanne</h2>
        <p style={{marginTop:10, fontSize:15, color:"var(--ink-2)", lineHeight:1.55}}>{recipient.intro}</p>

        {visibleCats.map(c => {
          const list = (byCat[c.id]||[]).sort((a,b) => b.ts - a.ts).slice(0, recipient.id === "etab" ? 5 : 3);
          const Icon = c.Icon;
          return (
            <section key={c.id} style={{marginTop:18}}>
              <h3 className="serif" style={{display:"flex", alignItems:"center", gap:10, fontSize:17}}>
                <span style={{width:30, height:30, borderRadius:10, background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
                  <Icon size={16} sw={1.6}/>
                </span>
                {c.title}
              </h3>
              <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:6}}>
                {list.map(n => (
                  <li key={n.id} style={{display:"flex", gap:10, fontSize:14.5, lineHeight:1.5}}>
                    <span aria-hidden="true" style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em"}}>—</span>
                    <span>{n.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </article>

      <p className="label" style={{marginTop:24}}>Ajuster ce qui est inclus</p>
      <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>
        {CATS_AS.map(c => {
          const on = included.has(c.id);
          return (
            <button key={c.id} className="chip" aria-pressed={on} onClick={() => onToggle(c.id)}>
              {on ? <IconCheckAS size={14}/> : <IconPlusAS size={14}/>}
              {c.title}
            </button>
          );
        })}
      </div>

      <button className="btn primary" style={{marginTop:26, width:"100%"}} onClick={onNext}>
        <IconLinkAS size={20}/> Créer le lien de partage
      </button>
    </div>
  );
}

function ShareCompose({recipient, included, onSend}){
  const [name, setName] = useStateAS(recipient.id === "proche" ? "Claire" : recipient.id === "pro" ? "Sandra (AVS)" : "Maison des Tilleuls");
  const [consent, setConsent] = useStateAS(true);
  const [copied, setCopied] = useStateAS(false);
  const link = "carnet.vivant/j/4f7c-2a9e";
  const includedSet = new Set(included);

  function copy(){
    try{ navigator.clipboard.writeText(link); }catch{}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="scroll" style={{padding:"6px 22px 24px"}}>
      <p className="label">Étape 3 sur 3</p>
      <h1 className="serif" style={{marginTop:6, fontSize:28}}>Partager le lien</h1>
      <p style={{marginTop:10, fontSize:15.5, color:"var(--ink-2)", lineHeight:1.5}}>
        Ce lien donne accès <strong style={{color:"var(--ink)"}}>à cette fiche seulement</strong>, pas à tout le carnet.
      </p>

      <div style={{marginTop:22}}>
        <label htmlFor="to-name" className="label">Pour</label>
        <input id="to-name" type="text" value={name} onChange={e => setName(e.target.value)} style={{marginTop:8}} aria-label="Nom du destinataire"/>
      </div>

      <div style={{marginTop:22, background:"var(--paper)", border:"1px solid var(--line)", borderRadius:22, padding:"16px 18px"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <span style={{width:32, height:32, borderRadius:11, background:"var(--c-proches)", color:"var(--c-proches-ink)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
            <IconLinkAS size={16}/>
          </span>
          <span className="label">Lien généré</span>
          <span style={{marginLeft:"auto", fontSize:12, color:"var(--ink-3)"}}>7 jours</span>
        </div>
        <p style={{fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:14.5, marginTop:10, wordBreak:"break-all"}}>
          {link}
        </p>
        <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
          <button className="chip" onClick={copy}>
            {copied ? <><IconCheckAS size={14}/> Copié</> : <><IconCopyAS size={14}/> Copier</>}
          </button>
          <button className="chip" onClick={() => window.print()} aria-label="Exporter en PDF imprimable">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9V3h12v6"/>
              <rect x="4" y="9" width="16" height="8" rx="2"/>
              <rect x="6" y="14" width="12" height="7" rx="1"/>
            </svg>
            Imprimer (PDF)
          </button>
        </div>
      </div>

      <p className="label" style={{marginTop:24}}>Visibilité</p>
      <p style={{marginTop:4, fontSize:13, color:"var(--ink-3)"}}>
        {includedSet.size} rubrique{includedSet.size>1?"s":""} sur 7 incluse{includedSet.size>1?"s":""}.
      </p>
      <div style={{marginTop:10, display:"grid", gap:6}}>
        {CATS_AS.map(c => {
          const on = includedSet.has(c.id);
          const Icon = c.Icon;
          return (
            <div key={c.id} style={{
              display:"flex", alignItems:"center", gap:12, padding:"8px 12px", borderRadius:14,
              background: on ? c.bg : "var(--paper)", color: on ? c.ink : "var(--ink-3)",
              border:"1px solid " + (on ? "transparent" : "var(--line)"),
              opacity: on ? 1 : .7
            }}>
              <span style={{width:26, height:26, borderRadius:8, background:"rgba(255,255,255,.55)", display:"flex", alignItems:"center", justifyContent:"center"}} aria-hidden="true">
                <Icon size={14} sw={1.6}/>
              </span>
              <span style={{fontSize:14, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", flex:1, textDecoration: on ? "none" : "line-through"}}>{c.title}</span>
              <span style={{fontSize:11, fontWeight:600, letterSpacing:".06em", textTransform:"uppercase"}}>{on ? "Visible" : "Masqué"}</span>
            </div>
          );
        })}
      </div>

      <button onClick={() => setConsent(v => !v)} role="checkbox" aria-checked={consent}
              style={{
                marginTop:22, width:"100%", textAlign:"left",
                display:"flex", gap:12, alignItems:"flex-start",
                background:"var(--paper)", border:"1px solid var(--line)",
                borderRadius:18, padding:"14px 16px", cursor:"pointer", color:"var(--ink)"
              }}>
        <span style={{
          width:22, height:22, borderRadius:7, flexShrink:0, marginTop:1,
          background: consent ? "var(--ink)" : "transparent",
          border: consent ? "2px solid var(--ink)" : "2px solid var(--line-2)",
          color:"var(--paper)", display:"flex", alignItems:"center", justifyContent:"center"
        }} aria-hidden="true">
          {consent && <IconCheckAS size={12} sw={2.5}/>}
        </span>
        <span style={{fontSize:13.5, color:"var(--ink-2)", lineHeight:1.5}}>
          Je confirme avoir l'accord de Jeanne (ou de ses représentants) pour transmettre ces informations. Je peux révoquer ce lien à tout moment.
        </span>
      </button>

      <button className="btn primary" style={{marginTop:20, width:"100%"}}
              disabled={!consent || includedSet.size === 0}
              onClick={() => onSend({name})}>
        <IconShareAS size={20}/> Envoyer à {name.split(" ")[0]}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Réglages — privacy + visibility toggles
   ───────────────────────────────────────────────────────────── */
function AidantSettings({visibility, setVisibility}){
  return (
    <div className="screen fade-enter">
      <SB_AS/>
      <div className="topbar">
        <h1 className="serif" style={{fontSize:22, marginLeft:4}}>Réglages</h1>
        <span style={{width:44}}/>
      </div>

      <div className="scroll" style={{padding:"6px 22px 24px"}}>
        <div className="hero" style={{padding:"22px 20px"}}>
          <span style={{width:44, height:44, borderRadius:14, background:"var(--paper)", display:"inline-flex", alignItems:"center", justifyContent:"center", border:"1px solid var(--line)"}} aria-hidden="true">
            <IconLockAS size={20}/>
          </span>
          <h2 className="serif" style={{marginTop:14, fontSize:22}}>Ton carnet, tes règles.</h2>
          <p style={{marginTop:10, fontSize:15, color:"var(--ink-2)", lineHeight:1.5}}>
            Ce carnet n'est <strong>pas un dossier médical</strong>. Il ne se partage que sur invitation, rubrique par rubrique.
          </p>
        </div>

        <p className="label" style={{marginTop:24}}>Trois engagements</p>
        <ul style={{listStyle:"none", padding:0, margin:"10px 0 0", display:"grid", gap:10}}>
          <li className="card" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>—</span>
            <span style={{fontSize:14, color:"var(--ink-2)"}}>Rien ne quitte ton téléphone sans ton accord explicite.</span>
          </li>
          <li className="card" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>—</span>
            <span style={{fontSize:14, color:"var(--ink-2)"}}>Les fiches partagées expirent au bout de 7 jours.</span>
          </li>
          <li className="card" style={{display:"flex", gap:12, alignItems:"flex-start"}}>
            <span style={{color:"var(--accent)", fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:18}}>—</span>
            <span style={{fontSize:14, color:"var(--ink-2)"}}>Aucune publicité, aucun partage tiers, jamais.</span>
          </li>
        </ul>

        <p className="label" style={{marginTop:24}}>Rubriques masquables</p>
        <p style={{marginTop:6, fontSize:13, color:"var(--ink-3)"}}>Désactive une rubrique pour qu'elle n'apparaisse dans aucune fiche.</p>
        <div style={{marginTop:12, display:"grid", gap:10}}>
          {CATS_AS.map(c => {
            const on = visibility[c.id] !== false;
            const Icon = c.Icon;
            return (
              <div key={c.id} className="card" style={{display:"flex", gap:12, alignItems:"center", padding:14}}>
                <span style={{width:36, height:36, borderRadius:11, background:c.bg, color:c.ink, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}} aria-hidden="true">
                  <Icon size={18} sw={1.6}/>
                </span>
                <span style={{flex:1, minWidth:0, fontFamily:"var(--display)", fontWeight:800, letterSpacing:"-.02em", fontSize:16}}>{c.title}</span>
                <button role="switch" aria-checked={on}
                        onClick={() => setVisibility({...visibility, [c.id]: !on})}
                        aria-label={`Inclure ${c.title}`}
                        style={{
                          width:50, height:30, borderRadius:999, border:"none", padding:3,
                          background: on ? "var(--accent)" : "var(--line-2)",
                          cursor:"pointer", flexShrink:0
                        }}>
                  <span style={{display:"block", width:24, height:24, borderRadius:"50%", background:"#FFFFFF", transform: on ? "translateX(20px)" : "translateX(0)", transition:"transform .2s"}}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.AidantShare = { AidantTransmettre, AidantSettings };
