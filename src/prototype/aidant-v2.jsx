// Aidant v2 — Carnet, Capture, Category restyled (color-block, Manrope, black circles). Overrides window.Aidant.
(() => {
const { useState, useEffect, useMemo } = React;
const { IconMic, IconBack, IconClose, IconCheck, IconEdit, IconPlus, IconChevron, IconSparkle, CatBook } = window.Icons;
const { CATEGORIES, CAT_BY_ID, EXAMPLE_PROMPTS, classify, softDate } = window.AppData;
const { StatusBar, SearchBar } = window.UI;

const Circle = ({Icon, size=44, bg="var(--ink)", color="#fff", isize=20}) => (
  <span aria-hidden="true" style={{width:size, height:size, borderRadius:"50%", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}><Icon size={isize} sw={1.8}/></span>
);
const Header = ({left, title, right}) => (
  <div className="topbar" style={{padding:"8px 20px 4px"}}>
    {left || <span style={{width:44}}/>}
    <span style={{font:"800 16px var(--sans)", letterSpacing:"-.01em"}}>{title}</span>
    {right || <span style={{width:44}}/>}
  </div>
);
const Ring = ({value, max, size=40, stroke=2.5, label}) => {
  const r = (size-stroke)/2, c = 2*Math.PI*r;
  return (
    <span aria-hidden="true" style={{position:"relative", width:size, height:size, flexShrink:0, display:"inline-block"}}>
      <svg width={size} height={size} className="ring" style={{position:"absolute", inset:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${Math.min(value,max)/max*c} ${c}`}/>
      </svg>
      <span style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", font:`800 ${size*.3}px var(--sans)`}}>{label ?? value}</span>
    </span>
  );
};

/* ── CARNET ─────────────────────────────────────────────── */
function AidantCarnet({notes, onOpenCat}){
  const counts = useMemo(() => { const c = {}; for(const n of notes) c[n.catId] = (c[n.catId]||0)+1; return c; }, [notes]);
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = q ? CATEGORIES.filter(c => c.title.toLowerCase().includes(q) || notes.some(n => n.catId === c.id && n.text.toLowerCase().includes(q))) : CATEGORIES;
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <div style={{flex:1, minWidth:0}}><h1 style={{fontSize:28}}>Le carnet</h1><p className="meta" style={{marginTop:2, whiteSpace:"nowrap"}}>{notes.length} notes · 7 rubriques</p></div>
      </div>
      <div className="scroll">
        <div style={{padding:"10px 20px 0"}}><SearchBar value={search} onChange={setSearch} placeholder="Rechercher une note"/></div>
        <ul style={{listStyle:"none", padding:"16px 20px 0", margin:0, display:"grid", gap:12}}>
          {filtered.map(c => { const n = counts[c.id]||0; const recent = notes.filter(x => x.catId === c.id).sort((a,b) => b.ts-a.ts)[0]; return (
            <li key={c.id}>
              <button onClick={() => onOpenCat(c.id)} className="card-press" aria-label={`${c.title}, ${n} notes`}
                      style={{width:"100%", textAlign:"left", border:"none", cursor:"pointer", background:c.bg, color:c.ink, borderRadius:"var(--r-lg)", padding:18, display:"flex", gap:14, alignItems:"flex-start", minWidth:0}}>
                <Circle Icon={c.Icon} size={46} isize={22}/>
                <span style={{flex:1, minWidth:0}}>
                  <span style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10}}>
                    <span style={{font:"800 17px var(--sans)", letterSpacing:"-.02em", lineHeight:1.2}}>{c.title}</span>
                    <Ring value={Math.min(n,8)} max={8} label={n}/>
                  </span>
                  <span style={{display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginTop:8, fontSize:13.5, fontWeight:600, opacity:.85, lineHeight:1.45}}>
                    {recent ? recent.text : "Encore vide — un détail suffit pour commencer."}
                  </span>
                </span>
              </button>
            </li>
          ); })}
        </ul>
      </div>
    </div>
  );
}

/* ── CAPTURE — un geste : parler, c'est enregistré ─────────── */
// Avec un vrai compte : vraie saisie (clavier ou dictée du clavier). En démo : dictée simulée.
function AidantCapture(props){
  if(!window.Who.demo){
    return <window.BUI.NoteComposer subject={`Pour ${window.Who.person}`} onClose={props.onClose}
                                    onSave={({text, catId}) => props.onSave(text, catId)}/>;
  }
  return <CaptureDemo {...props}/>;
}
function CaptureDemo({onClose, onSave}){
  const [text, setText] = useState("");
  const [cat, setCat] = useState(null);
  const [done, setDone] = useState(false);
  const [picking, setPicking] = useState(false);
  const [count, setCount] = useState(3);
  const timer = React.useRef(null);
  const sample = React.useMemo(() => EXAMPLE_PROMPTS[Math.floor(Math.random()*EXAMPLE_PROMPTS.length)], []);
  // écoute simulée → transcription live → rubrique → enregistrement auto après 3 s
  useEffect(() => {
    const phone = document.querySelector(".phone"); phone && phone.setAttribute("data-listening","1");
    let i = 0; const id = setInterval(() => {
      i += 2 + Math.floor(Math.random()*3);
      const t = sample.slice(0, i); setText(t); setCat(classify(t)[0]?.cat || null);
      if(i >= sample.length){ clearInterval(id); phone && phone.removeAttribute("data-listening"); setDone(true); }
    }, 40);
    return () => { clearInterval(id); phone && phone.removeAttribute("data-listening"); };
  }, []);
  useEffect(() => {
    if(!done || picking) return;
    setCount(3);
    timer.current = setInterval(() => setCount(c => { if(c <= 1){ clearInterval(timer.current); onSave(text.trim(), (cat || CAT_BY_ID.habitudes).id); return 0; } return c - 1; }), 1000);
    return () => clearInterval(timer.current);
  }, [done, picking]);
  const c = cat || CAT_BY_ID.habitudes;
  return (
    <div className="screen fade-enter" style={{background:"var(--ink)", color:"#fff"}}>
      <StatusBar/>
      <div className="topbar" style={{padding:"8px 20px 4px"}}>
        <button className="iconbtn" aria-label="Annuler" onClick={onClose} style={{background:"rgba(255,255,255,.12)", color:"#fff"}}><IconClose size={20}/></button>
        <span style={{font:"800 15px var(--sans)", opacity:.7}}>{done ? "Enregistré dans" : "Je t'écoute"}</span>
        <span style={{width:44}}/>
      </div>
      <div className="scroll" style={{padding:"8px 22px 28px", display:"flex", flexDirection:"column"}}>
        {/* onde */}
        <div className="wave" role="status" aria-label={done ? "Terminé" : "Enregistrement en cours"} style={{margin:"10px auto 0", opacity: done ? .35 : 1, transition:"opacity .3s"}}>{Array.from({length:12}).map((_,i) => <span key={i} style={{background:"#fff"}}/>)}</div>
        {/* transcription, grande */}
        <p aria-live="polite" style={{marginTop:22, font:"700 24px var(--sans)", lineHeight:1.35, letterSpacing:"-.02em", minHeight:130}}>{text}<span aria-hidden="true" style={{display: done ? "none" : "inline-block", width:3, height:26, background:"var(--accent-2)", marginLeft:4, verticalAlign:"-4px", animation:"blink 1s steps(2) infinite"}}/></p>
        <div style={{flex:1}}/>
        {/* rubrique détectée : tap pour changer */}
        <button onClick={() => setPicking(v => !v)} aria-expanded={picking} className="card-press" style={{width:"100%", border:"none", cursor:"pointer", borderRadius:"var(--r-xl)", padding:"16px 18px", background:c.bg, color:c.ink, textAlign:"left", display:"flex", gap:14, alignItems:"center", opacity: cat ? 1 : .5, transition:"background .3s"}}>
          <Circle Icon={c.Icon} size={44} isize={20}/>
          <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 17px var(--sans)", letterSpacing:"-.02em"}}>{c.title}</span><span style={{display:"block", marginTop:2, fontSize:13, fontWeight:600, opacity:.8}}>{picking ? "Choisis une autre rubrique" : "Appuie pour changer"}</span></span>
          {done && !picking && <span aria-label={`Enregistrement dans ${count} secondes`} style={{width:40, height:40, borderRadius:"50%", background:"var(--ink)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", font:"800 16px var(--sans)"}}>{count}</span>}
        </button>
        {picking && <div className="slide-up" style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:10}}>{CATEGORIES.filter(x => x.id !== c.id).map(x => <button key={x.id} onClick={() => { setCat(x); setPicking(false); }} className="chip" style={{background:x.bg, color:x.ink, boxShadow:"none", minHeight:44}}><x.Icon size={15} sw={1.8}/> {x.title}</button>)}</div>}
        {done && (
          <button className="btn" style={{marginTop:12, width:"100%", background:"#fff", color:"var(--ink)"}} onClick={() => { clearInterval(timer.current); onSave(text.trim(), c.id); }}><IconCheck size={20}/> C'est bon</button>
        )}
        <p style={{marginTop:12, textAlign:"center", fontSize:12.5, fontWeight:600, opacity:.55}}>{done ? "Tu pourras corriger le texte plus tard dans la rubrique." : "Parle naturellement. Je range au bon endroit."}</p>
      </div>
    </div>
  );
}

/* ── CATEGORY ───────────────────────────────────────────── */
const STALE_DAYS = 90;
const isStale = (n) => !n.archived && !n.confirmedAt && (Date.now() - n.ts) / 86400000 > STALE_DAYS;
function Trace({archived, show, setShow}){
  if(!archived.length) return null;
  return (
    <div style={{marginTop:20}}>
      <button onClick={() => setShow(v => !v)} className="card card-press" style={{width:"100%", textAlign:"left", cursor:"pointer", padding:14, display:"flex", gap:12, alignItems:"center", background:"var(--bg-2)"}}>
        <Circle Icon={CatBook} size={36} isize={16} bg="#fff" color="var(--ink)"/>
        <span style={{flex:1, minWidth:0}}><span style={{display:"block", font:"800 14px var(--sans)"}}>Trace de vie · {archived.length}</span><span className="meta" style={{fontSize:12.5}}>Ce qui était vrai, et ne l'est plus. Gardé, jamais effacé.</span></span>
        <span style={{transform: show ? "rotate(90deg)" : "none", transition:"transform .2s", display:"flex"}}><IconChevron size={16}/></span>
      </button>
      {show && <ul className="slide-up" style={{listStyle:"none", padding:0, margin:"8px 0 0", display:"grid", gap:6}}>
        {archived.map(n => <li key={n.id} className="note" style={{background:"transparent", boxShadow:"none", border:"1.5px dashed var(--line-2)"}}><p style={{font:"600 14px var(--sans)", lineHeight:1.5, color:"var(--ink-2)"}}>{n.text}</p><p className="when" style={{marginTop:6}}>vrai de {softDate(n.ts)} à {softDate(n.archivedAt)}</p></li>)}
      </ul>}
    </div>
  );
}
function AidantCategory({catId, notes, onBack, onOpenCapture, onEdit, onDelete, onConfirm, onArchive}){
  const cat = CAT_BY_ID[catId];
  const all = notes.filter(n => n.catId === catId).sort((a,b) => b.ts-a.ts);
  const list = all.filter(n => !n.archived), archived = all.filter(n => n.archived);
  const stale = onConfirm ? list.filter(isStale) : [];
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [showTrace, setShowTrace] = useState(false);
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <Header left={<button className="iconbtn" aria-label="Retour" onClick={onBack}><IconBack size={20}/></button>} title={`${list.length} note${list.length>1?"s":""}`} right={<button className="iconbtn" aria-label="Ajouter une note" onClick={onOpenCapture} style={{background:"var(--ink)", color:"#fff"}}><IconPlus size={20}/></button>}/>
      <div className="scroll" style={{padding:"8px 20px 24px"}}>
        <div style={{background:cat.bg, color:cat.ink, borderRadius:"var(--r-xl)", padding:"22px 20px", marginTop:6}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <Circle Icon={cat.Icon} size={48} isize={24}/>
            <Ring value={Math.min(list.length,8)} max={8} size={48} stroke={3} label={list.length}/>
          </div>
          <h1 style={{fontSize:28, marginTop:16}}>{cat.title}</h1>
          <p style={{marginTop:6, fontSize:14, fontWeight:600, opacity:.85}}>{cat.blurb}</p>
        </div>
        {stale.length > 0 && (
          <div className="card" style={{marginTop:12, padding:14, display:"flex", gap:12, alignItems:"center", background:"var(--c-histoire)", color:"var(--c-histoire-ink)"}}>
            <Circle Icon={IconSparkle} size={36} isize={16}/>
            <p style={{fontSize:13.5, fontWeight:700, lineHeight:1.45}}>{stale.length} note{stale.length>1?"s ont":" a"} plus de trois mois. {window.Who.person} change, le carnet aussi. Toujours d'actualité&nbsp;?</p>
          </div>
        )}
        <ul style={{listStyle:"none", padding:0, margin:"16px 0 0", display:"grid", gap:10}}>
          {list.length === 0 && (
            <li><div className="card" style={{textAlign:"center", padding:"28px 22px"}}>
              <h3>Encore vide.</h3>
              <p className="meta" style={{marginTop:8, maxWidth:280, marginInline:"auto"}}>Dès qu'un détail te vient à l'esprit, il trouvera sa place ici.</p>
              <button className="btn" style={{marginTop:18}} onClick={onOpenCapture}><IconMic size={18}/> Ajouter une note</button>
            </div></li>
          )}
          {list.map(n => { const st = onConfirm && isStale(n); return (
            <li key={n.id}>
              {editingId === n.id ? (
                <div className="note">
                  <textarea rows={4} value={draft} onChange={e => setDraft(e.target.value)} autoFocus aria-label="Modifier la note" style={{background:"var(--bg)", boxShadow:"none"}}/>
                  <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
                    <button className="chip" aria-pressed="true" onClick={() => { onEdit(editingId, draft.trim()); setEditingId(null); }}><IconCheck size={16}/> Enregistrer</button>
                    <button className="chip" style={{background:"var(--bg)", boxShadow:"none"}} onClick={() => setEditingId(null)}>Annuler</button>
                    <button className="chip" style={{marginLeft:"auto", background:"var(--bg)", boxShadow:"none", color:"#B3261E"}} onClick={() => { onDelete(n.id); setEditingId(null); }}>Supprimer</button>
                  </div>
                </div>
              ) : (
                <div className="note" style={{padding:16, outline: st ? "2px solid var(--c-histoire)" : "none"}}>
                  <p style={{font:"600 15.5px var(--sans)", lineHeight:1.5, letterSpacing:"-.005em"}}>{n.text}</p>
                  {st && (
                    <div style={{display:"flex", gap:6, marginTop:12}}>
                      <button className="chip" onClick={() => onConfirm(n.id)} style={{flex:1, justifyContent:"center", background:"var(--ink)", color:"#fff", minHeight:40, padding:"0 10px", whiteSpace:"nowrap"}}><IconCheck size={15}/> Toujours vrai</button>
                      <button className="chip" onClick={() => { setEditingId(n.id); setDraft(n.text); }} style={{flex:1, justifyContent:"center", background:"var(--bg)", boxShadow:"none", minHeight:40, padding:"0 10px", whiteSpace:"nowrap"}}>A changé</button>
                      <button className="chip" onClick={() => onArchive(n.id)} style={{background:"var(--bg)", boxShadow:"none", minHeight:40, padding:"0 10px", whiteSpace:"nowrap"}}>Plus vrai</button>
                    </div>
                  )}
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10}}>
                    <span className="when">{n.confirmedAt ? `confirmé ${softDate(n.confirmedAt)}` : `noté ${softDate(n.ts)}`}</span>
                    <button onClick={() => { setEditingId(n.id); setDraft(n.text); }} style={{border:"none", background:"var(--bg)", borderRadius:999, padding:"0 12px", minHeight:34, font:"700 13px var(--sans)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6}}><IconEdit size={14}/> Modifier</button>
                  </div>
                </div>
              )}
            </li>
          ); })}
        </ul>
        <Trace archived={archived} show={showTrace} setShow={setShowTrace}/>
      </div>
    </div>
  );
}

Object.assign(window.Aidant, { AidantCarnet, AidantCapture, AidantCategory });
})();
