// Shared UI primitives for Le carnet vivant
const { useState, useEffect, useMemo } = React;
const {
  IconMic, IconBack, IconClose, IconSettings, IconShare,
  IconCheck, IconEdit, IconPlus, IconLock, IconChevron,
  IconLink, IconCopy, IconEye, IconSwap,
  IconSearch, IconBell, IconHomeT, IconCompass, IconCalendar, IconReply, IconQuestion, IconSparkle
} = window.Icons;

function StatusBar(){
  return (
    <div className="statusbar" aria-hidden="true">
      <span>9:41</span>
      <span className="right">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><path d="M1 8h2v2H1zM5 6h2v4H5zM9 4h2v6H9zM13 2h2v8h-2z"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M8 3.5c1.5 0 3 .6 4 1.6M5 6c.8-.8 1.9-1.3 3-1.3s2.2.5 3 1.3M2 8.5c1.5-1.6 3.7-2.6 6-2.6s4.5 1 6 2.6"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x=".5" y=".5" width="20" height="10" rx="2.5"/><rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/><rect x="21.5" y="3.5" width="1.5" height="4" rx=".7" fill="currentColor"/></svg>
      </span>
    </div>
  );
}

function Toast({msg, onClear}){
  useEffect(() => {
    if(!msg) return;
    const t = setTimeout(onClear, 2200);
    return () => clearTimeout(t);
  }, [msg]);
  return <div className={"toast " + (msg ? "show":"")} role="status" aria-live="polite">{msg}</div>;
}

/* Demo view switcher pill (top of phone) */
function DemoPill({view, onChange}){
  return (
    <div className="demo-pill" role="group" aria-label="Vue de démonstration">
      <button className={view === "relais" ? "on" : ""} onClick={() => onChange("relais")} aria-pressed={view === "relais"}>
        Proche
      </button>
      <button className={view === "aidant" ? "on" : ""} onClick={() => onChange("aidant")} aria-pressed={view === "aidant"}>
        Aidant
      </button>
      <button className={view === "etab" ? "on" : ""} onClick={() => onChange("etab")} aria-pressed={view === "etab"}>
        Équipe
      </button>
    </div>
  );
}

/* Bottom tab bar with center FAB option */
function TabBar({tabs, current, onChange}){
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {tabs.map(t => {
        const active = t.id === current;
        const isMic = t.kind === "mic";
        return (
          <button key={t.id}
                  className={"tab" + (active ? " on" : "") + (isMic ? " mic" : "")}
                  onClick={() => onChange(t.id)}
                  aria-label={t.label}
                  aria-current={active ? "page" : undefined}>
            <t.Icon size={isMic ? 28 : 22} sw={1.8}/>
            {!isMic && <span>{t.label}</span>}
            {!isMic && <span className="tab-dot" aria-hidden="true"/>}
          </button>
        );
      })}
    </nav>
  );
}

function SearchBar({value, onChange, placeholder="Rechercher"}){
  return (
    <label className="searchbar">
      <IconSearch size={18} sw={1.6} aria-hidden="true"/>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>
      {value && (
        <button onClick={() => onChange("")} aria-label="Effacer" style={{border:"none", background:"transparent", color:"var(--ink-3)", cursor:"pointer", padding:4}}>
          <IconClose size={16}/>
        </button>
      )}
    </label>
  );
}

/* Small avatar (initials in a soft circle) */
function Avatar({name, size=40, tone="warm"}){
  const bg = { warm:"var(--c-habitudes)", cool:"var(--c-parler)", sage:"var(--c-sante)" }[tone] || "var(--c-parler)";
  return <window.UserPersona name={name} size={size} bg={bg}/>;
}

/* Greeting helper */
function timeGreeting(){
  const h = new Date().getHours();
  if(h < 12) return "Bonjour";
  if(h < 18) return "Bel après-midi";
  return "Belle soirée";
}

function momentNow(){
  const h = new Date().getHours();
  if(h < 11) return "matin";
  if(h < 14) return "midi";
  if(h < 18) return "aprem";
  return "soir";
}

/* ─── TTS — read aloud (uses Web Speech API) ─── */
function useTTS(){
  const [speaking, setSpeaking] = React.useState(false);
  function speak(text){
    if(typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = .95; u.pitch = 1.05;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }
  function stop(){ if(typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); setSpeaking(false); }
  return { speaking, speak, stop };
}

function ReadAloud({text, size = 32}){
  const { speaking, speak, stop } = useTTS();
  return (
    <button onClick={() => speaking ? stop() : speak(text)}
            aria-label={speaking ? "Arrêter la lecture" : "Lire à voix haute"}
            aria-pressed={speaking}
            className="iconbtn"
            style={{
              width:size, height:size, minWidth:size,
              background: speaking ? "var(--ink)" : "rgba(255,255,255,.85)",
              color: speaking ? "#fff" : "var(--ink)"
            }}>
      {speaking ? (
        <svg width={size*.45} height={size*.45} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1"/>
          <rect x="14" y="5" width="4" height="14" rx="1"/>
        </svg>
      ) : (
        <svg width={size*.5} height={size*.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4 5 9H2v6h3l6 5V4z"/>
          <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14"/>
        </svg>
      )}
    </button>
  );
}

function ReadAll({texts, label="Tout écouter"}){
  const { speaking, speak, stop } = useTTS();
  return (
    <button onClick={() => speaking ? stop() : speak(texts.join(". "))} aria-pressed={speaking} className="chip" style={{background: speaking ? "var(--ink)" : "#fff", color: speaking ? "#fff" : "var(--ink)"}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4z"/><path d="M16 8a5 5 0 0 1 0 8"/></svg>
      {speaking ? "Arrêter" : label}
    </button>
  );
}

/* ─── Accessibility preferences ─── */
const A11Y_DEFAULTS = { textSize: "regular", highContrast: false, reduceMotion: false, ttsOnRead: false, dyslexia: false };
function useA11y(){
  const [a, setA] = React.useState(() => {
    try { return { ...A11Y_DEFAULTS, ...JSON.parse(localStorage.getItem("lcv-a11y") || "{}") }; }
    catch { return A11Y_DEFAULTS; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("lcv-a11y", JSON.stringify(a)); } catch {}
    const root = document.querySelector(".phone") || document.documentElement;
    root.setAttribute("data-text", a.textSize);
    root.setAttribute("data-contrast", a.highContrast ? "high" : "regular");
    root.setAttribute("data-motion", a.reduceMotion ? "reduce" : "regular");
    root.setAttribute("data-dys", a.dyslexia ? "1" : "0");
  }, [a]);
  return [a, (k, v) => setA(prev => ({...prev, [k]: v}))];
}

window.UI = {
  StatusBar, Toast, DemoPill, TabBar, SearchBar, Avatar,
  timeGreeting, momentNow,
  useTTS, ReadAloud, ReadAll, useA11y
};
