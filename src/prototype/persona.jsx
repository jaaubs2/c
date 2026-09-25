// Flat persona avatars — head/shoulders bust in a colored circle, seeded by name
(() => {
const SKINS = ["#F6D3B3","#E8B48E","#C98C5E","#8D5A3A","#6B4530","#F1C7A5"];
const LIGHT_HAIRS = ["#C9A16B","#E9DCC3","#A0522D","#8A5A34"];
const LIGHT_CLOTHES = ["#E85D4A","#8FD3C7","#F2F2F2","#F0C36A","#B9A6D6","#D9EBE3","#5B8FA8"];
const HAIRS = ["#2B2622","#4A3226","#8A5A34","#C9A16B","#E9DCC3","#5A4B45","#1E1B1A","#A0522D"];
const CLOTHES = ["#E85D4A","#5B8FA8","#8FD3C7","#F2F2F2","#2F3A45","#3B5F6B","#F0C36A","#B9A6D6","#2B2622","#D9EBE3"];
const HAIR_STYLES = ["bob","long","short","bun","curly","side","pixie","afro","wave","cropped"];

function hash(str){ let h = 2166136261; for(const c of str){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function pick(arr, n){ return arr[(n >>> 0) % arr.length]; }

function Hair({style, color, back}){
  const cap = "M31 48 C31 22 69 22 69 48"; // skull-hugging outer cap edge
  switch(style){
    case "bob": return back
      ? <path d="M30 46 C28 20 72 20 70 46 L72 74 C64 78 36 78 28 74 Z" fill={color}/>
      : <path d={cap + " L67 48 C66 40 60 34 50 34 C40 34 34 40 33 48 Z"} fill={color}/>;
    case "long": return back
      ? <path d="M30 46 C28 18 72 18 70 46 L76 100 L24 100 Z" fill={color}/>
      : <path d={cap + " L67 48 C66 40 60 34 50 34 C40 34 34 40 33 48 Z"} fill={color}/>;
    case "short": return back
      ? <path d="M30 50 C30 22 70 22 70 50 L68 56 L32 56 Z" fill={color}/>
      : <path d={cap + " L67 50 C67 42 62 36 54 36 C46 36 40 40 38 46 C36 48 34 50 33 50 Z"} fill={color}/>;
    case "bun": return back
      ? <><circle cx="50" cy="20" r="11" fill={color}/><path d="M31 50 C31 22 69 22 69 50 L66 52 L34 52 Z" fill={color}/></>
      : <path d={cap + " L67 50 C66 40 60 35 50 35 C40 35 34 40 33 50 Z"} fill={color}/>;
    case "curly": return back
      ? <path d="M26 48 C20 18 80 18 74 48 C82 62 76 76 66 74 L34 74 C24 76 18 62 26 48 Z" fill={color}/>
      : <path d="M29 50 C28 24 72 24 71 50 L67 50 C66 40 60 34 50 34 C40 34 34 40 33 50 Z" fill={color}/>;
    case "side": return back
      ? <path d="M30 46 C28 18 72 18 70 46 L74 84 L62 86 L60 60 L30 62 Z" fill={color}/>
      : <path d={cap + " L67 50 C66 40 60 34 48 35 C38 36 33 44 33 54 Z"} fill={color}/>;
    case "pixie": return back
      ? <path d="M30 48 C26 18 76 16 72 48 L70 56 L32 56 Z" fill={color}/>
      : <path d="M30 50 C28 20 74 18 70 50 L66 50 C66 40 58 34 48 37 C42 39 36 44 33 52 Z" fill={color}/>;
    case "afro": return back
      ? <circle cx="50" cy="40" r="28" fill={color}/>
      : <path d="M27 48 C26 22 74 22 73 48 L69 50 C66 40 60 34 50 34 C40 34 34 40 31 50 Z" fill={color}/>;
    case "wave": return back
      ? <path d="M30 46 C28 18 72 18 70 46 C78 62 74 80 62 86 L60 62 L40 62 L38 86 C26 80 22 62 30 46 Z" fill={color}/>
      : <path d={cap + " L67 48 C66 40 60 34 50 34 C40 34 34 40 33 48 Z"} fill={color}/>;
    case "bald": return back ? null
      : <><path d="M33 46 C32 38 36 33 42 32 L40 42 Z" fill={color}/><path d="M67 46 C68 38 64 33 58 32 L60 42 Z" fill={color}/></>;
    default: return back
      ? <path d="M30 50 C30 22 70 22 70 50 L68 56 L32 56 Z" fill={color}/>
      : <path d={cap + " L67 50 C66 40 60 35 50 35 C40 35 34 40 33 50 Z"} fill={color}/>;
  }
}

function Persona({name="", size=40, bg="var(--c-parler)", seed, style:styleProp, variant}){
  const h = hash((seed || name) + (variant ? "#" + variant : ""));
  const skinIdx = (h >>> 3) % SKINS.length, skin = SKINS[skinIdx], darkSkin = skinIdx === 3 || skinIdx === 4;
  const hair = darkSkin ? pick(LIGHT_HAIRS, h >>> 7) : pick(HAIRS, h >>> 7);
  const cloth = darkSkin ? pick(LIGHT_CLOTHES, h >>> 11) : pick(CLOTHES, h >>> 11);
  const BALD = ["Roger Vidal", "Marcel Lopez"];
  const style = styleProp || (BALD.includes(name) ? "bald" : pick(HAIR_STYLES, h >>> 15));
  const glasses = ((h >>> 19) & 7) === 0, necklace = ((h >>> 22) & 3) === 0, collar = ((h >>> 24) & 1) === 1;
  const uid = "pc" + (h % 100000);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{display:"block", flexShrink:0}}>
      <defs><clipPath id={uid}><circle cx="50" cy="50" r="50"/></clipPath></defs>
      <circle cx="50" cy="50" r="50" fill={bg}/>
      <g clipPath={`url(#${uid})`}>
        <Hair style={style} color={hair} back/>
        <path d="M22 100 C22 78 34 70 50 70 C66 70 78 78 78 100 Z" fill={cloth}/>
        {collar && <path d="M44 70 L50 80 L56 70 Z" fill="#fff" fillOpacity=".9"/>}
        <rect x="44" y="58" width="12" height="14" rx="4" fill={skin}/>
        <ellipse cx="50" cy="46" rx="17" ry="20" fill={skin}/>
        <Hair style={style} color={hair}/>
        {glasses && <g fill="none" stroke="#2B2622" strokeWidth="2"><circle cx="42" cy="48" r="5"/><circle cx="58" cy="48" r="5"/><path d="M47 48h6"/></g>}
        {necklace && <g fill="#E85D4A">{[38,42,46,50,54,58,62].map((x,i) => <circle key={x} cx={x} cy={74 + Math.abs(i-3)*-1.5 + 4} r="1.8"/>)}</g>}
      </g>
    </svg>
  );
}

/* Choix d'avatar par personne (persistant) */
const KEY = "cv-avatar-prefs";
let prefs = {}; try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){}
const listeners = new Set();
const AvatarPrefs = {
  get: (name) => prefs[name] || null,
  set: (name, v) => { prefs = {...prefs, [name]: v}; try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch(e){} listeners.forEach(f => f()); },
  use: () => { const [, tick] = React.useState(0); React.useEffect(() => { const f = () => tick(t => t+1); listeners.add(f); return () => listeners.delete(f); }, []); return prefs; }
};
const VARIANTS = [
  {id:"v0", label:"Par défaut"}, {id:"v1", style:"bun", label:"Chignon"}, {id:"v2", style:"bob", label:"Carré"},
  {id:"v3", style:"short", label:"Court"}, {id:"v4", style:"curly", label:"Bouclé"}, {id:"v5", style:"wave", label:"Ondulé"},
  {id:"v6", style:"long", label:"Long"}, {id:"v7", style:"pixie", label:"Pixie"}, {id:"v8", style:"afro", label:"Afro"},
];
/* Persona qui respecte le choix de l'utilisateur */
function UserPersona({name, size, bg}){
  AvatarPrefs.use();
  const v = VARIANTS.find(x => x.id === AvatarPrefs.get(name)) || VARIANTS[0];
  return <Persona name={name} size={size} bg={bg} variant={v.id === "v0" ? undefined : v.id} style={v.style}/>;
}
function AvatarPicker({name, bg="var(--c-parler)", size=56, onPick}){
  AvatarPrefs.use();
  const cur = AvatarPrefs.get(name) || "v0";
  return (
    <div style={{display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8}}>
      {VARIANTS.map(v => { const on = cur === v.id; return (
        <button key={v.id} onClick={() => { AvatarPrefs.set(name, v.id); onPick && onPick(v); }} aria-pressed={on} aria-label={"Avatar " + v.label}
                style={{border:"none", cursor:"pointer", borderRadius:"var(--r-md)", padding:"10px 6px", background: on ? "var(--ink)" : "var(--bg)", color: on ? "#fff" : "var(--ink)", display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
          <Persona name={name} size={size} bg={bg} variant={v.id === "v0" ? undefined : v.id} style={v.style}/>
          <span style={{font:"700 11.5px var(--sans)"}}>{v.label}</span>
        </button>
      ); })}
    </div>
  );
}
window.Persona = Persona; window.UserPersona = UserPersona; window.AvatarPicker = AvatarPicker; window.AvatarPrefs = AvatarPrefs;
})();
