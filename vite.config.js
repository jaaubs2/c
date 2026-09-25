import { defineConfig, loadEnv } from "vite";

// Sécurité : refuse de construire l'app avec une clé secrète de Supabase.
// Seule la clé publique (« anon » ou « publishable ») peut se retrouver dans l'app.
function refuseSecretKey(mode) {
  const key = loadEnv(mode, process.cwd(), "VITE_").VITE_SUPABASE_ANON_KEY || "";
  let role = "";
  try { role = JSON.parse(Buffer.from(key.split(".")[1] || "", "base64url").toString()).role || ""; } catch {}
  if (key.startsWith("sb_secret_") || role === "service_role") {
    throw new Error(
      "VITE_SUPABASE_ANON_KEY contient une clé SECRÈTE de Supabase. " +
      "Remplace-la par la clé publique « anon » (ou « publishable ») : Supabase → Project Settings → API Keys."
    );
  }
}

// Les écrans du prototype utilisent React de façon globale (window.React) et la
// transformation JSX « classique » (React.createElement) : on la reproduit ici.
export default defineConfig(({ mode }) => {
  refuseSecretKey(mode);
  return {
    // Chemins relatifs : le même build sert au web (PWA) et aux apps iPhone/Android.
    base: "./",
    esbuild: {
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
    },
  };
});
