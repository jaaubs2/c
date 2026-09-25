# Tests du back-end

Pour les développeurs (ou le Claude de VS Code). Rien de tout cela n'est nécessaire pour utiliser l'app.

## Sécurité de la base (72 vérifications)

Rejoue de vrais scénarios avec les droits de chaque personne (aidante, proche invité, inconnue,
cadre, soignants, famille) : chacun ne voit et ne fait que ce qu'il a le droit.

Prérequis : PostgreSQL local (utilisateur `postgres`, mot de passe `postgres`).

```
npm install --no-save pg jose
./supabase/tests/reset-db.sh
node supabase/tests/db.test.cjs
```

## Scénario complet dans le navigateur (38 vérifications)

`mini-supabase.cjs` imite les deux services de Supabase utilisés par l'app (comptes et appels
de fonctions), branchés sur la base locale. `e2e.cjs` joue le parcours complet au format iPhone :
Anne crée un carnet et un lien, Claire l'ouvre sans compte, Marc crée son établissement,
Sandra entre avec son code, Sophie rejoint le carnet de sa mère, Anne supprime son compte.

```
npm install --no-save pg jose playwright
./supabase/tests/reset-db.sh
node supabase/tests/mini-supabase.cjs            # affiche ANON_KEY=…
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=<ANON_KEY> \
  VITE_PUBLIC_URL=http://127.0.0.1:4174/ npx vite build --outDir dist-e2e
npx vite preview --outDir dist-e2e --port 4174 &
node supabase/tests/e2e.cjs ./captures
```
