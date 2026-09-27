# Brancher l'IA (Mistral), pas à pas

L'IA du carnet fait quatre choses :

1. **Dictée** : on appuie sur le micro, on parle, le texte s'écrit tout seul (modèle *Voxtral*).
2. **Rangement** : pendant qu'on écrit une note, l'IA propose la bonne rubrique
   (« Proposée par l'IA »). On peut toujours en choisir une autre.
3. **Fiche de transmission** : au moment de partager, « Rédiger avec l'IA » prépare un petit mot
   d'accueil et les 3 choses essentielles à savoir, **uniquement à partir des rubriques choisies**.
   Tout reste modifiable avant d'envoyer.
4. **Garder le carnet vivant** : sur l'accueil, l'IA repère une info ancienne à vérifier,
   deux notes qui se contredisent, ou une rubrique vide, et pose une question simple.

Sans ces réglages, l'app marche quand même : le micro, la rubrique proposée et
« Rédiger avec l'IA » ne s'affichent simplement pas.

> Compte 20 à 30 minutes. À faire **après** [`SUPABASE.md`](SUPABASE.md).

## Comment c'est protégé

- La **clé Mistral reste sur le serveur** (fonction Supabase `ai`). Elle n'est jamais dans l'app.
- Seule une personne **connectée** peut utiliser l'IA, avec **150 appels par jour** au maximum.
- Les appels partent vers le **serveur européen** de Mistral (`api.eu.mistral.ai`), entreprise française.
- Envoyé à l'IA : le texte des notes concernées et le **prénom** seulement (jamais le nom de famille).
  Les notes en attente de validation, archivées, ou hors des rubriques choisies ne partent pas.
- Consignes données à l'IA : **aucun diagnostic, rien d'inventé**, ton digne et chaleureux.
  Les réponses sont vérifiées par le serveur avant d'arriver dans l'app.
- Le serveur n'écrit **aucun contenu de note** dans ses journaux.

## 1. Créer le compte Mistral

1. Va sur **console.mistral.ai** et crée un compte avec ton email.
2. Crée ton espace de travail (*workspace*) : nom « Le carnet vivant ».
3. Dans **Billing** (facturation), choisis l'offre **payante à l'usage** (*Scale*) et ajoute une carte.
   ⚠️ Évite l'offre gratuite (*Experiment*) avec de vraies données : Mistral peut s'en servir
   pour entraîner ses modèles.
4. Toujours dans *Billing*, si la console le propose, fixe une **limite de dépenses**
   (par exemple 10 € par mois) : impossible d'avoir une mauvaise surprise.

## 2. Créer la clé

1. Menu **API Keys** → **Create new key**.
2. Nom : `carnet-vivant-serveur`. Pas de date d'expiration pour l'instant.
3. **Copie la clé tout de suite** (elle ne s'affiche qu'une fois) et garde-la dans un endroit sûr.
   Ne la mets **jamais** dans `.env.local`, ni dans le code, ni sur GitHub.

## 3. Mettre à jour la base de données

(Si tu as déjà lancé tous les fichiers du dossier `supabase/migrations/` en suivant `SUPABASE.md`, passe directement à l'étape 4.)

1. Dans Supabase : **SQL Editor** → **New query**.
2. Ouvre `supabase/migrations/20260926000000_ai.sql` dans VS Code, copie **tout**, colle, **Run**.
3. Tu dois voir **Success. No rows returned**.

Cela ajoute : le compteur d'appels par jour, l'origine des notes (écrite ou dictée) et
l'enregistrement de la fiche rédigée avec l'IA dans chaque lien de partage.

## 4. Envoyer la fonction IA sur Supabase

Dans le terminal de VS Code, dans le dossier du projet, tape ces commandes une par une :

```
npx supabase@latest login
```
Une page s'ouvre dans le navigateur : accepte. Puis :

```
npx supabase@latest link --project-ref TON_IDENTIFIANT
```
`TON_IDENTIFIANT`, ce sont les lettres de l'adresse de ton projet :
dans `https://abcdefgh.supabase.co`, c'est `abcdefgh`. Si on te demande le mot de passe
de la base, c'est celui choisi à la création du projet.

```
npx supabase@latest functions deploy ai --use-api
```
Tu dois voir `Deployed Functions on project … : ai`.

## 5. Donner la clé au serveur

```
npx supabase@latest secrets set MISTRAL_API_KEY=colle_ta_cle_ici
```

Ou sans terminal : Supabase → **Edge Functions** → **Secrets** → *Add new secret* →
nom `MISTRAL_API_KEY`, valeur : ta clé.

Réglages facultatifs (même endroit) :

| Nom | Par défaut | Rôle |
|---|---|---|
| `AI_DAILY_LIMIT` | `150` | Nombre d'appels IA par personne et par jour (500 au maximum) |
| `MISTRAL_TEXT_MODEL` | `mistral-medium-latest` | Modèle pour le rangement, la fiche et la relecture |
| `MISTRAL_AUDIO_MODEL` | `voxtral-mini-latest` | Modèle pour la dictée |

## 6. Vérifier que ça marche

1. Ouvre l'app, connecte-toi, ouvre le carnet → **Ajouter une note**.
2. Écris « Il aime son café noir le matin » : après une seconde, la rubrique
   *Habitudes* est proposée par l'IA.
3. Appuie sur le **micro**, dis une phrase, appuie à nouveau : le texte apparaît.
4. **Transmettre** → choisis des rubriques → **Rédiger avec l'IA** : un mot d'accueil et
   3 points apparaissent, modifiables.
5. Dans Supabase, **Table Editor** → `ai_usage` : tes appels du jour sont comptés.

Si un message d'erreur s'affiche :

- Le micro et « Rédiger avec l'IA » n'apparaissent pas → l'étape 4 ou 5 n'est pas faite
  (recharge l'app après les avoir faites).
- « clé Mistral refusée » → la clé est mal copiée, ou l'offre payante n'est pas activée.
- Autre souci : Supabase → **Edge Functions** → `ai` → **Logs** montre ce qui se passe.

## RGPD : ce qu'il faut faire en plus

- **Accord de traitement (DPA)** : Mistral est ton sous-traitant. Son accord de traitement des
  données fait partie de ses conditions (console → *Legal* / site mistral.ai → *Legal*) :
  lis-le, et garde-en une copie pour ton dossier.
- **Rétention zéro** : par défaut, Mistral peut garder les requêtes un temps limité pour
  surveiller les abus. Tu peux demander la **« zero data retention »** au support de Mistral
  (depuis la console, *Help*), en expliquant que ton service traite des données personnelles
  sensibles. À demander dès maintenant : la réponse peut prendre quelques jours.
- **Registre des traitements** : ajoute la ligne « Aide à la rédaction par IA — Mistral AI
  (France, UE) — texte des notes et prénom ».
- L'app l'explique déjà dans *Réglages → Confidentialité & données* : IA facultative,
  Mistral AI (France), prénom seulement, aucun diagnostic. Pense à le reprendre dans ta
  politique de confidentialité.

## Combien ça coûte

À titre d'ordre de grandeur (vérifie les prix du jour sur mistral.ai) : une note rangée ou
une fiche rédigée coûte **moins d'un centime**, une minute de dictée environ **un dixième de centime**.
La démo devant le jury coûtera quelques centimes. Pour 100 familles actives, compter quelques
euros par mois.

## Honnêtement

Tout a été testé avec une **imitation** de Mistral (mêmes formats de requêtes et de réponses,
32 vérifications de la fonction serveur et un parcours complet dans le navigateur). Rien n'a
encore tourné avec une **vraie clé**. Fais l'étape 6 au plus tôt, et bien avant le jury, pour
avoir le temps d'ajuster si besoin.
