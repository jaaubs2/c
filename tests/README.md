# Tests d'accessibilité (mode démo)

Pour les développeurs. Contrôlent l'app en mode démo, au format iPhone.

- `accessibilite-demo.cjs` : parcourt environ 100 écrans des trois espaces et lance l'outil **axe**
  (règles WCAG 2.1 A et AA) sur chacun.
- `clavier-demo.cjs` : navigation au clavier (Tab, Entrée, Échap), focus visible, focus sur le titre
  à chaque nouvel écran, très grand texte et contraste renforcé sans défilement horizontal.

```
npm install --no-save playwright axe-core
npx vite build --outDir dist-a11y && npx vite preview --outDir dist-a11y --port 4175 &
node tests/accessibilite-demo.cjs
node tests/clavier-demo.cjs
```

Le parcours avec de vrais comptes est contrôlé aussi : voir `supabase/tests/README.md`.
Un outil automatique ne remplace pas un essai avec VoiceOver (iPhone) et TalkBack (Android).
