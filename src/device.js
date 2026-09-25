// Choisit l'affichage :
// - sur ordinateur : l'app est présentée dans un cadre de téléphone (pratique pour les démos) ;
// - sur un vrai téléphone, une fois installée, ou dans l'app iPhone/Android : plein écran,
//   sans la fausse barre d'état ni la fausse encoche (classe « device » sur <html>).
import { Capacitor } from "@capacitor/core";

const root = document.documentElement;
const isNative = Capacitor.isNativePlatform();
const installed =
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const smallScreen = window.matchMedia("(max-width: 520px)");

function apply() {
  root.classList.toggle("device", isNative || installed || smallScreen.matches);
}

root.classList.toggle("native", isNative);
apply();
smallScreen.addEventListener("change", apply);
