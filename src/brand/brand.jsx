// Logo du carnet vivant, en SVG (net à toutes les tailles). Couleur = couleur du texte autour.
// Sources : src/brand/logo.svg (symbole + nom) et src/brand/mark.svg (symbole seul, pour l'icône).
import logoSvg from "./logo.svg?raw";
import markSvg from "./mark.svg?raw";

const parse = (svg) => ({
  viewBox: svg.match(/viewBox="([^"]+)"/)[1],
  d: svg.match(/ d="([^"]+)"/)[1],
});
const LOGO = parse(logoSvg);
const MARK = parse(markSvg);
const ratio = (vb) => { const [, , w, h] = vb.split(" ").map(Number); return w / h; };

// label : texte lu par les lecteurs d'écran ; sans label, le logo est décoratif.
function Shape({ shape, height, label, style }) {
  return (
    <svg viewBox={shape.viewBox} height={height} width={Math.round(height * ratio(shape.viewBox))}
         role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : "true"}
         focusable="false" style={{ display: "block", flexShrink: 0, ...style }}>
      <path fill="currentColor" fillRule="evenodd" d={shape.d} />
    </svg>
  );
}
const Logo = ({ height = 22, label, style }) => <Shape shape={LOGO} height={height} label={label} style={style} />;
const Mark = ({ height = 32, label, style }) => <Shape shape={MARK} height={height} label={label} style={style} />;

window.Brand = { Logo, Mark };
