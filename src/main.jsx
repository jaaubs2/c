// Point de départ de l'application.
//
// Le prototype chargeait ses fichiers .jsx un par un et chacun se « branchait » sur
// window.X. On garde exactement le même ordre, pour ne rien changer au comportement.

// 1) React global + choix de l'affichage (cadre ou plein écran)
import "./setup-globals.js";
import "./device.js";

// 1 bis) Connexion au serveur et « qui est qui » (mode démo si non configuré)
import "./backend/backend.js";
import "./backend/live.js";

// 2) Styles : ceux du prototype, puis les réglages plein écran
import "./prototype/styles.css";
import "./device.css";

// 3) Les écrans, dans le même ordre que l'ancien index.html
import "./prototype/tweaks-panel.jsx";
import "./prototype/icons.jsx";
import "./prototype/persona.jsx";
import "./prototype/data.jsx";
import "./prototype/ui.jsx";
import "./prototype/backend-ui.jsx";
import "./prototype/tabbar-v2.jsx";
import "./prototype/aidant.jsx";
import "./prototype/aidant-home-v2.jsx";
import "./prototype/aidant-v2.jsx";
import "./prototype/aidant-share.jsx";
import "./prototype/aidant-extras.jsx";
import "./prototype/auth.jsx";
import "./prototype/settings-full.jsx";
import "./prototype/relais.jsx";
import "./prototype/relais-v2.jsx";
import "./prototype/shared-journal.jsx";
import "./prototype/etab.jsx";
import "./prototype/onboarding.jsx";
import "./prototype/aidant-moi.jsx";
import "./prototype/relais-settings.jsx";

// 4) app.jsx affiche l'application
import "./prototype/app.jsx";

// 5) Version web installable (PWA)
import "./pwa.js";
