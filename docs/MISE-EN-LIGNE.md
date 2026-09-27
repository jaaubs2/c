# Mettre l'app en ligne (pas à pas)

Tant que l'app tourne seulement sur ton ordinateur, un lien de partage ne s'ouvre pas sur le
téléphone de Claire. Une fois en ligne :

- les liens de partage et d'invitation marchent partout ;
- on peut installer l'app depuis le navigateur (« Ajouter à l'écran d'accueil ») ;
- tu as une adresse à donner au jury, et à l'App Store pour la politique de confidentialité.

> Compte 30 à 45 minutes. À faire **après** [`SUPABASE.md`](SUPABASE.md).

## L'hébergeur choisi : statichost.eu

**statichost.eu** est 100 % européen (entreprise et serveurs), ne suit pas les visiteurs, et son offre
gratuite suffit largement (10 Go de trafic par mois). Il reconstruit l'app tout seul à chaque
mise à jour sur GitHub. Avec Supabase (Paris) et Mistral (France), **toute la chaîne reste en Europe**.

Le réglage est déjà prêt dans le projet : fichier `statichost.yml`.

## 1. Mettre le code sur la branche principale

statichost publie la branche `main` de GitHub. Le travail est aujourd'hui sur la branche
`claude/blissful-brahmagupta-fmtnuw` : il faut la fusionner dans `main`.

Sur github.com → ton dépôt `c` → bandeau jaune **Compare & pull request** → **Create pull request**
→ **Merge pull request** → **Confirm merge**. (Tu peux aussi me demander de préparer la *pull request*.)

## 2. Créer le site sur statichost

1. Va sur **statichost.eu** → crée un compte.
2. **Add site** (ajouter un site) :
   - **nom du site** : par exemple `carnet-vivant` (il apparaîtra dans l'adresse) ;
   - **dépôt** : ton dépôt est privé, donc utilise l'adresse SSH : `git@github.com:jaaubs2/c.git`.
3. Lance une première construction. Elle échouera tant que GitHub n'autorise pas statichost :
   c'est normal. Le **journal de construction** affiche une **clé publique** (une longue ligne
   qui commence par `ssh-`). Copie-la.
4. Sur GitHub → dépôt `c` → **Settings** → **Deploy keys** → **Add deploy key** :
   titre « statichost », colle la clé, **ne coche pas** « Allow write access » → **Add key**.
5. Relance la construction sur statichost : elle doit réussir. Note l'**adresse du site** affichée.

## 3. Donner à la version en ligne ses réglages

Comme `.env.local` sur ton ordinateur, la version en ligne a besoin de 3 informations. Elles sont
**publiques** (elles se retrouvent de toute façon dans l'app), donc on peut les envoyer sur GitHub.

1. Dans VS Code, copie `.env.production.example` sous le nom **`.env.production`**.
2. Remplis :
   - `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` : les mêmes que dans `.env.local` ;
   - `VITE_PUBLIC_URL` : l'adresse du site notée à l'étape 2, terminée par `/`.
3. Envoie ce fichier sur GitHub (ou donne-moi les 3 valeurs et je m'en occupe).

⚠️ Jamais la clé `service_role` / `secret` : si tu la colles par erreur, la construction s'arrête
avec un message clair, et rien n'est publié.

## 4. Mises à jour automatiques

Pour que chaque modification sur GitHub soit publiée toute seule :
GitHub → dépôt `c` → **Settings** → **Webhooks** → **Add webhook** :

- **Payload URL** : `https://builder.statichost.eu/NOM_DU_SITE` (le nom choisi à l'étape 2) ;
- **Content type** : `application/json` ;
- **Just the push event** → **Add webhook**.

## 5. Prévenir Supabase de la nouvelle adresse

Supabase → **Authentication** → **URL Configuration** :

- **Site URL** : l'adresse du site ;
- **Redirect URLs** → **Add URL** : la même adresse.

Sans cela, les emails (mot de passe oublié) renverraient vers ton ordinateur.

## 6. Vérifier sur un vrai téléphone

1. Ouvre l'adresse sur ton téléphone, connecte-toi, crée un lien de partage.
2. Envoie-le par SMS à quelqu'un : la fiche s'ouvre chez lui, sans compte.
3. Dans Safari : bouton **Partager** → **Sur l'écran d'accueil** (sur Android : menu ⋮ → **Installer l'application**).

## 7. (Facultatif) Une vraie adresse, par exemple `lecarnetvivant.fr`

Achète le nom chez un bureau d'enregistrement (environ 10 € par an), puis ajoute-le au site dans
statichost (**custom domain**) en suivant ses instructions : le certificat HTTPS est offert.
Pense ensuite à mettre à jour `VITE_PUBLIC_URL` (étape 3) et Supabase (étape 5).

## 8. Les documents légaux

L'app contient une politique de confidentialité, des conditions d'utilisation et des mentions
légales (Réglages → Aide & à propos, et sous les cases à cocher de l'inscription).
Leur adresse publique, à donner à l'App Store et à Google Play :

`https://TON-ADRESSE/#legal=confidentialite` (et `#legal=conditions`, `#legal=mentions`)

Les passages surlignés **« À compléter »** attendent tes informations. Ils sont dans le fichier
`src/prototype/legal.jsx`, entre doubles crochets `[[…]]` :

- nom de la structure, forme juridique, adresse, SIRET, directeur ou directrice de la publication ;
- email de contact pour les données personnelles ;
- région Supabase choisie (Paris), service d'emails (Brevo), hébergeur (statichost.eu, Union européenne) ;
- durée de conservation des comptes inactifs ;
- ce qui se passe à la fin de la découverte sans code, conditions du contrat établissement, médiateur de la consommation ;
- délai de préavis si le service s'arrêtait.

Ces textes sont une **base sérieuse, pas un avis juridique** : fais-les relire (incubateur,
juriste, ou le délégué à la protection des données d'un établissement partenaire) avant l'ouverture au public.

## Honnêtement

La configuration suit la documentation de statichost.eu, mais je n'ai pas pu la tester
d'ici (le site est bloqué depuis mon environnement). Si la construction échoue, copie-moi
la fin du journal de construction : on corrige ensemble.
