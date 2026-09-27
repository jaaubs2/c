// Relais v2 — carnet picker restyled (hero blobs, centered copy, avatar row, black pill CTA). Overrides window.Relais.RelaisCarnetPicker.
(() => {
const { useState } = React;
const { StatusBar } = window.UI;
const { JeanneIllustration, IconChevron } = window.Icons;
const CARNETS = window.AppData.RELAIS_CARNETS || [];

const Blobs = () => (
  <svg viewBox="0 0 380 300" width="100%" height="auto" aria-hidden="true" style={{display:"block"}}>
    <path d="M62 60c40-38 108-30 128 10 14 28-6 52-38 66-30 14-36 44-72 48-36 4-72-24-70-58 2-32 24-42 52-66z" fill="var(--ink)"/>
    <path d="M250 100c50-24 108-4 118 40 8 36-20 62-58 72-32 8-44 40-84 36-38-4-62-38-52-72 10-36 40-54 76-76z" fill="var(--c-habitudes)"/>
    <path d="M150 200c28-16 62-10 74 14 10 20-4 40-28 50-26 10-58 2-66-22-6-18 4-32 20-42z" fill="var(--c-parler)"/>
    <circle cx="110" cy="104" r="24" fill="#fff" fillOpacity=".92"/>
    <circle cx="288" cy="150" r="22" fill="#fff" fillOpacity=".9"/>
    <circle cx="184" cy="236" r="16" fill="#fff" fillOpacity=".9"/>
    <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
      <path d="M208 42v18M199 51h18"/><path d="M336 62v12M330 68h12"/><path d="M52 210v12M46 216h12"/>
    </g>
  </svg>
);

function RelaisCarnetPicker({onPick, name="Claire"}){
  const [sel, setSel] = useState(CARNETS[0]?.id);
  const cur = CARNETS.find(c => c.id === sel) || CARNETS[0];
  const first = name.split(" ")[0];
  return (
    <div className="screen fade-enter">
      <StatusBar/>
      <div className="scroll" style={{padding:"0 24px 28px", display:"flex", flexDirection:"column"}}>
        <div style={{margin:"4px -8px 0"}}><Blobs/></div>
        <div style={{textAlign:"center", marginTop:8}}>
          <p className="kicker">Bonjour {first}</p>
          <h1 style={{fontSize:32, marginTop:10, letterSpacing:"-.035em"}}>Quel carnet<br/>veux-tu ouvrir&nbsp;?</h1>
          <p className="meta" style={{marginTop:12, fontSize:15, lineHeight:1.5, maxWidth:300, marginInline:"auto"}}>
            {CARNETS.length} personnes te sont confiées. Chaque carnet est privé et appartient à sa famille.
          </p>
        </div>

        <div role="radiogroup" aria-label="Choisir un carnet" style={{display:"flex", justifyContent:"center", gap:22, marginTop:26}}>
          {CARNETS.map(c => {
            const on = c.id === sel, isJ = c.id === "jeanne", f = c.profile.name.split(" ")[0];
            return (
              <button key={c.id} role="radio" aria-checked={on} onClick={() => setSel(c.id)} aria-label={`Carnet de ${c.profile.name}`}
                      style={{border:"none", background:"transparent", padding:0, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8}}>
                <span style={{width:72, height:72, borderRadius:"50%", padding:3, background: on ? "var(--ink)" : "transparent", display:"block", transition:"background .2s"}}>
                  <span style={{width:"100%", height:"100%", borderRadius:"50%", background: isJ ? "var(--c-habitudes)" : "var(--c-parler)", border:"3px solid var(--bg)", overflow:"hidden", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
                    {isJ ? <JeanneIllustration size={66}/> : <window.Persona name={c.profile.name} size={66} bg="transparent"/>}
                  </span>
                </span>
                <span style={{font:`${on ? 800 : 600} 13px var(--sans)`, color: on ? "var(--ink)" : "var(--ink-3)"}}>{f}</span>
              </button>
            );
          })}
        </div>

        <div style={{flex:1}}/>
        <p className="meta" style={{textAlign:"center", fontSize:12.5, marginTop:22}}>
          {cur.profile.age} ans · partagé par {cur.sharedBy}{cur.expiresIn <= 2 ? " · expire bientôt" : ""}
        </p>
        <button className="btn" onClick={() => onPick(cur.id)} style={{marginTop:12, width:"100%", minHeight:56, fontSize:16}}>
          Ouvrir le carnet de {cur.profile.name.split(" ")[0]} <IconChevron size={18}/>
        </button>
      </div>
    </div>
  );
}
Object.assign(window.Relais, { RelaisCarnetPicker });
})();
