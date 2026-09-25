# Brancher l'app sur Supabase (pas à pas)

Temps estimé : 30 à 45 minutes. Rien à installer : tout se passe dans le navigateur,
sauf l'étape 6 (un petit fichier à créer dans le projet).

Tant que ce n'est pas fait, l'app reste en **mode démo** (données d'exemple).

---

## 1. Créer le compte et le projet

1. Va sur **https://supabase.com** → **Start your project** → crée un compte (email ou GitHub).
2. Clique **New project** :
   - **Name** : `carnet-vivant`
   - **Database password** : clique sur *Generate*, puis **note-le dans un endroit sûr**
     (gestionnaire de mots de passe). On n'en a pas besoin tout de suite, mais il ne se retrouve pas.
   - **Region** : choisis **Europe — Paris** (`eu-west-3`). À défaut : Francfort.
     C'est ce qui garantit l'hébergement des données dans l'Union européenne.
   - **Plan** : Free pour commencer.
3. Clique **Create new project** et patiente 1 à 2 minutes.

## 2. Créer la base de données

1. Menu de gauche : **SQL Editor** → **New query**.
2. Ouvre le fichier `supabase/migrations/20260925000000_init.sql` du projet (dans VS Code),
   copie **tout** son contenu, et colle-le dans l'éditeur Supabase.
3. Clique **Run**. Tu dois voir **Success. No rows returned**.

C'est cette étape qui crée les tables, les règles d'accès (chacun ne voit que ce qui le
concerne) et les fonctions utilisées par l'app.

## 3. Régler l'inscription par email

Menu **Authentication** :

1. **Sign In / Providers** → **Email** :
   - *Enable Email provider* : **activé**
   - *Confirm email* : **activé** (l'utilisateur reçoit un code à 6 chiffres)
   - *Minimum password length* : **8**
   - *Email OTP length* : **6** (si l'option est présente)
2. **Emails** (ou *Email Templates*) : remplace deux modèles par ceux-ci.

**« Confirm signup »** — Objet : `Ton code pour Le carnet vivant`

```html
<h2>Bienvenue dans Le carnet vivant</h2>
<p>Voici ton code pour confirmer ton adresse email :</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Il est valable une heure. Si tu n'as rien demandé, ignore ce message.</p>
```

**« Reset password »** — Objet : `Ton code pour changer de mot de passe`

```html
<h2>Nouveau mot de passe</h2>
<p>Voici ton code pour choisir un nouveau mot de passe :</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Il est valable une heure. Si tu n'as rien demandé, ignore ce message : ton mot de passe ne change pas.</p>
```

> L'important est `{{ .Token }}` : c'est lui qui affiche le code à 6 chiffres que l'app demande.

3. **URL Configuration** :
   - *Site URL* : `http://localhost:5173` pour l'instant (tu mettras l'adresse en ligne plus tard).
   - *Redirect URLs* : ajoute `http://localhost:5173/**`.

## 4. ⚠️ Avant une vraie démo : un service d'envoi d'emails

L'envoi d'emails fourni par Supabase est **limité à quelques emails par heure** : suffisant pour
tester seule, **pas pour une démo** où plusieurs personnes créent un compte.

Solution simple et européenne : **Brevo** (entreprise française, gratuit jusqu'à 300 emails/jour).

1. Crée un compte sur **https://www.brevo.com**, puis *SMTP & API* → génère une **clé SMTP**.
2. Dans Supabase : **Authentication → Emails → SMTP Settings** → *Enable custom SMTP* :
   - Host `smtp-relay.brevo.com`, Port `587`
   - Username : l'identifiant SMTP donné par Brevo ; Password : la clé SMTP
   - Sender email : une adresse que tu as validée dans Brevo ; Sender name : `Le carnet vivant`

## 5. Récupérer les deux codes de connexion

Bouton **Connect** en haut du projet (ou **Project Settings → API**) :

- **Project URL** : ressemble à `https://abcdefgh.supabase.co`
- **anon public** key (parfois appelée *publishable key*) : une longue suite de caractères

Ces deux valeurs peuvent être dans l'app sans danger : ce sont les règles d'accès de la base
qui protègent les données. **Ne copie jamais** la clé *service_role* (ou *secret*) dans l'app.

## 6. Les donner à l'app

Dans VS Code, à la racine du projet :

1. Duplique le fichier `.env.example` et renomme la copie en **`.env.local`**.
2. Remplis les deux lignes :

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=la-longue-cle-anon
```

3. Arrête l'app (Ctrl + C dans le terminal) et relance `npm run dev`.

L'app démarre maintenant sur l'écran « Créer mon carnet » : c'est le mode réel.
Le fichier `.env.local` n'est jamais envoyé sur GitHub (il est ignoré volontairement).

## 7. Vérifier que tout marche

1. **Créer mon carnet** → *Un·e aidant·e* → ton prénom, ton email, un mot de passe → coche les deux cases.
2. Tu reçois un **code à 6 chiffres** par email → saisis-le.
3. Crée le carnet d'une personne, ajoute une note, puis *Transmettre* → crée un lien.
4. Ouvre ce lien dans une fenêtre de navigation privée : la fiche s'affiche, sans compte.
5. Dans Supabase, **Table Editor** → `notes` : ta note y est.

## Bon à savoir

- **Montrer la démo complète** (les 3 espaces avec les données de Jeanne) : ajoute `?demo` à l'adresse,
  par exemple `http://localhost:5173/?demo`.
- **Mise en veille** : un projet gratuit se met en pause après 7 jours sans activité.
  La semaine du jury, connecte-toi à l'app régulièrement, ou passe au plan *Pro* (25 $/mois) pour le mois.
- **RGPD** : dans *Organization Settings → Legal Documents*, signe l'accord de traitement des données
  (DPA) de Supabase. Il fait partie de ta conformité (sous-traitant).
- **Liens partagés** : pour qu'un lien s'ouvre sur le téléphone d'un relais, l'app doit être **en ligne**
  (pas seulement sur ton ordinateur). Quand elle le sera, ajoute son adresse dans `.env.local` :
  `VITE_PUBLIC_URL=https://ton-adresse.fr/`, et dans Supabase (*URL Configuration*).
- **Connexion Google / Apple** : les boutons sont branchés, mais il faut d'abord activer ces fournisseurs
  dans *Authentication → Sign In / Providers* (Google demande un compte Google Cloud ; Apple, le compte
  Apple Developer à 99 $/an). En attendant, un message clair s'affiche.
