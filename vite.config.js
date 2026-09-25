import { defineConfig } from "vite";

// Les écrans du prototype utilisent React de façon globale (window.React) et la
// transformation JSX « classique » (React.createElement) : on la reproduit ici.
export default defineConfig({
  // Chemins relatifs : le même build sert au web (PWA) et aux apps iPhone/Android.
  base: "./",
  esbuild: {
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  },
});
