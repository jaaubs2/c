# Tests du back-end

Pour les développeurs (ou le Claude de VS Code). Rien de tout cela n'est nécessaire pour utiliser l'app.

## Sécurité de la base (81 vérifications)

Rejoue de vrais scénarios avec les droits de chaque personne (aidante, proche invité, inconnue,
cadre, soignants, famille) : chacun ne voit et ne fait que ce qu'il a le droit.

Prérequis : PostgreSQL local (utilisateur `postgres`, mot de passe `postgres`).

```
npm install --no-save pg jose
./supabase/tests/reset-db.sh
node supabase/tests/db.test.cjs
```

## Fonction IA (32 vérifications)

Teste `supabase/functions/ai/handler.ts` avec un faux Mistral et une fausse base : accès réservé
aux personnes connectées, quota, serveur européen, clé jamais renvoyée, réponses de l'IA vérifiées,
prénom seul envoyé, notes en attente ou hors rubriques jamais envoyées, dictée (taille, type).

```
node supabase/tests/ai.test.mjs      # Node 22 ou plus récent
```

## Scénario complet dans le navigateur (54 vérifications)

`mini-supabase.cjs` imite les deux services de Supabase utilisés par l'app (comptes et appels
de fonctions), branchés sur la base locale. `e2e.cjs` joue le parcours complet au format iPhone :
Anne crée un carnet et un lien, Claire l'ouvre sans compte, Marc crée son établissement,
Sandra entre avec son code, Sophie rejoint le carnet de sa mère, Anne supprime son compte.
Côté IA (faux Mistral intégré à `mini-supabase.cjs`, micro simulé) : dictée d'une note, rubrique
proposée, fiche rédigée puis corrigée, affichage chez le relais, carte « Garder le carnet vivant ».
Accessibilité : chaque écran capturé (et l'inscription, le code, la politique de confidentialité)
est contrôlé avec axe (règles WCAG 2.1 A et AA) ; le scénario échoue au moindre défaut.

```
npm install --no-save pg jose playwright axe-core
./supabase/tests/reset-db.sh
node supabase/tests/mini-supabase.cjs            # affiche ANON_KEY=…
VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=<ANON_KEY> \
  VITE_PUBLIC_URL=http://127.0.0.1:4174/ npx vite build --outDir dist-e2e
npx vite preview --outDir dist-e2e --port 4174 &
node supabase/tests/e2e.cjs ./captures
```

## Données de démonstration (32 vérifications)

`demo.test.cjs` charge `supabase/demo/demo-jury.sql` deux fois (la seconde fois doit tout remettre à zéro
sans doublon), connecte chaque compte de démo, puis rejoue le scénario du jury (`docs/DEMO-JURY.md`)
clic par clic. Mêmes prérequis que le scénario complet ci-dessus.

```
node supabase/tests/demo.test.cjs ./captures-jury
```
