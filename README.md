# Le carnet vivant

Préserver et transmettre le savoir humain sur la personne accompagnée.
Outil pour les proches aidants, les relais et les équipes d'établissement. **Non médical.**

Un seul code, deux portes d'entrée :

- **l'app iPhone et Android** (App Store / Google Play), pour les aidants qui tiennent le carnet ;
- **la version web installable** (PWA), pour les relais qui ouvrent une fiche par lien et pour les établissements.

> **État actuel : back-end et comptes en place (Supabase).** Les trois espaces fonctionnent
> avec de vraies données : aidant, relais par lien sécurisé, et équipe d'établissement.
> Il reste à **créer le projet Supabase** et à le relier à l'app : suivre
> [`docs/SUPABASE.md`](docs/SUPABASE.md) (30 à 45 minutes, sans rien installer).
> Prochaine étape : la vraie IA (dictée vocale et rangement automatique des notes).

## Deux modes

- **Mode réel** (quand Supabase est configuré dans `.env.local`) : chacun crée son compte et arrive
  dans son espace, avec ses propres données.
  - **Aidant** : crée le carnet, écrit les notes, crée des liens de partage, invite son cercle.
  - **Relais** : ouvre la fiche par un lien, **sans compte** ; il ne voit que les rubriques choisies.
    Le lien expire, peut être désactivé, et chaque ouverture est inscrite dans un journal.
  - **Équipe** : le cadre crée l'établissement et ses unités, ouvre un carnet par résident, ajoute
    les soignants avec un code à 6 chiffres et choisit leurs droits ; il valide les notes « à valider ».
    La famille d'un résident peut être invitée à contribuer.
- **Mode démo** (sans configuration, ou avec `?demo` dans l'adresse) : les données d'exemple
  (Jeanne, Anne, la Maison des Tilleuls) et le sélecteur « Proche / Aidant / Équipe »,
  pour présenter les trois espaces.

Tout ce qui touche aux données est vérifié par le serveur (règles d'accès de la base), pas
seulement masqué à l'écran. Les consentements sont enregistrés et datés ; chacun peut exporter
ou supprimer ses données depuis *Réglages → Confidentialité & données*.

## Lancer l'app sur l'ordinateur

Il faut **Node.js** (https://nodejs.org, version « LTS »).

```
npm install      (la première fois seulement)
npm run dev
```

Puis ouvrir l'adresse affichée (en général http://localhost:5173).

- Sur **ordinateur**, l'app s'affiche dans un cadre de téléphone (pratique pour les démos).
- Sur un **vrai téléphone**, ou une fois installée, elle occupe tout l'écran.

En mode démo, le sélecteur « Proche / Aidant / Équipe » en haut permet de passer d'un espace à
l'autre. En mode réel, il n'apparaît pas : chacun ne voit que son espace.

## Version web installable (PWA)

```
npm run build
```

Le dossier `dist/` contient le site à mettre en ligne (chez un hébergeur européen).
Une fois en ligne :

- **iPhone** (Safari) : bouton Partager → « Sur l'écran d'accueil » ;
- **Android** (Chrome) : menu ⋮ → « Installer l'application ».

## Apps iPhone et Android

Les projets natifs sont dans `ios/` et `android/` (créés avec Capacitor, à partir du même code).

Après chaque modification de l'app, recopier la nouvelle version dans les deux projets :

```
npm run app:sync
```

| | iPhone | Android |
|---|---|---|
| Logiciel à installer | **Xcode** (Mac App Store, gratuit) | **Android Studio** (gratuit) |
| Ouvrir le projet | `npm run app:ios` | `npm run app:android` |
| Tester | bouton ▶ dans Xcode, sur simulateur ou iPhone branché | bouton ▶ dans Android Studio |
| Publier | compte Apple Developer (99 $/an) | compte Google Play Console (25 $, une fois) |

Icônes et écrans de démarrage : les images sources sont dans `assets/`.
Après les avoir modifiées : `npm run app:icons`.

## À savoir avant de publier

- **Identifiant de l'app : `fr.lecarnetvivant.app`** (dans `capacitor.config.json`).
  Il devient définitif à la première publication dans les stores : le changer avant si besoin.
- **Micro** : l'autorisation est déjà déclarée (texte affiché à l'utilisateur :
  « Le micro vous permet de dicter une note au lieu de l'écrire. »).
- **Abonnements** : vendus dans l'app iPhone, Apple prélève une commission (15 % pour une petite entreprise).
- **Polices** : elles sont chargées depuis Google Fonts. Pour le RGPD, il faudra les héberger
  nous-mêmes (Google reçoit sinon l'adresse IP de chaque utilisateur).

## Organisation des fichiers

| Dossier / fichier | Rôle |
|---|---|
| `src/prototype/` | Tous les écrans de l'app et leur style (`styles.css`) |
| `src/prototype/backend-ui.jsx` | Écrans liés aux comptes : chargement, lien expiré, invitation, lien à partager, saisie d'une note |
| `src/backend/` | Connexion à Supabase (`backend.js`) et « qui est qui » + contenus tirés des vraies notes (`live.js`) |
| `supabase/migrations/` | La base de données : tables, règles d'accès, fonctions |
| `supabase/tests/` | Tests de sécurité de la base et scénario complet (pour les développeurs) |
| `docs/SUPABASE.md` | Guide pas à pas pour créer et relier le projet Supabase |
| `src/main.jsx` | Point de départ : assemble les écrans dans l'ordre |
| `src/device.js`, `src/device.css` | Plein écran sur téléphone, cadre sur ordinateur |
| `src/pwa.js`, `public/sw.js`, `public/manifest.webmanifest` | Version web installable |
| `public/icons/` | Icônes de la version web |
| `assets/` | Images sources de l'icône et de l'écran de démarrage des apps |
| `ios/`, `android/` | Projets des apps iPhone et Android |
| `capacitor.config.json` | Nom et identifiant des apps |
