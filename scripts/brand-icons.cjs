// Fabrique toutes les icônes de l'app à partir du symbole du logo (src/brand/mark.svg).
// Lancer : node scripts/brand-icons.cjs   (puis « npm run app:icons » pour les apps iPhone/Android)
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BG = "#A9B9F5";        // fond des icônes : le bleu doux de l'app
const INK = "#14151A";       // le symbole, en noir
const CREAM = "#F4F3EF";     // fond de l'écran de démarrage

const markSvg = fs.readFileSync(path.join(ROOT, "src/brand/mark.svg"), "utf8");
const viewBox = markSvg.match(/viewBox="([^"]+)"/)[1];
const d = markSvg.match(/ d="([^"]+)"/)[1];
const [vx, vy, vw, vh] = viewBox.split(" ").map(Number);

// Un carré de « size » px, fond « bg », symbole de largeur « scale » × size, centré (légèrement remonté).
function square(size, { bg, ink = INK, scale, radius = 0 }) {
  const w = size * scale, h = w * vh / vw;
  const x = (size - w) / 2, y = (size - h) / 2 - size * 0.01;
  const k = w / vw;
  const rect = bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rect}` +
    `<g transform="translate(${x} ${y}) scale(${k}) translate(${-vx} ${-vy})"><path fill="${ink}" fill-rule="evenodd" d="${d}"/></g></svg>`;
}
const png = (svg, out) => sharp(Buffer.from(svg)).png().toFile(path.join(ROOT, out)).then(() => console.log("✔", out));

(async () => {
  // Version web installable
  await png(square(192, { bg: BG, scale: 0.62 }), "public/icons/icon-192.png");
  await png(square(512, { bg: BG, scale: 0.62 }), "public/icons/icon-512.png");
  await png(square(512, { bg: BG, scale: 0.5 }), "public/icons/icon-maskable-512.png"); // zone de sécurité Android
  await png(square(180, { bg: BG, scale: 0.6 }), "public/icons/apple-touch-icon.png");
  fs.writeFileSync(path.join(ROOT, "public/icons/favicon.svg"), square(64, { bg: BG, scale: 0.7, radius: 14 }) + "\n");
  console.log("✔ public/icons/favicon.svg");
  // Sources des apps iPhone / Android (pour « npm run app:icons »)
  await png(square(1024, { bg: BG, scale: 0.6 }), "assets/icon-only.png");
  await png(square(2732, { bg: CREAM, scale: 0.18 }), "assets/splash.png");
  await png(square(2732, { bg: INK, ink: CREAM, scale: 0.18 }), "assets/splash-dark.png");
})();
