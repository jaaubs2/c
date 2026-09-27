// Version web : enregistre le service worker, qui rend l'app installable sur l'écran
// d'accueil et permet de l'ouvrir même avec une connexion faible.
// Pas utile dans les apps iPhone/Android (les fichiers y sont déjà embarqués).
import { Capacitor } from "@capacitor/core";

if (import.meta.env.PROD && !Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
