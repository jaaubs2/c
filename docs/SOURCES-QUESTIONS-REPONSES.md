# Sources des questions-réponses · Le carnet vivant

Ce document accompagne « Questions-réponses du jury ». Il indique d'où vient chaque information, pour que Hugo puisse répondre « d'où sort ce chiffre ? » sans hésiter.

Il y a deux types de sources :
- **les sources extérieures** : des documents publics, à citer si le jury demande ;
- **l'application elle-même** : des fonctions vérifiées dans le code et testées.

---

## 1. Sources extérieures

### Le projet personnalisé en Ehpad *(questions 7 et 15)*

**Ce qu'on en tire :** la HAS demande que chaque résident ait un projet personnalisé, construit avec lui, sa famille et l'équipe, à partir de son histoire, de ses goûts et de ses habitudes. Le carnet vivant alimente ce projet.

- [HAS, fiche-repère « Le projet personnalisé en Ehpad » (2018)](https://www.has-sante.fr/upload/docs/application/pdf/2018-10/fiche-repere-projet_personnalise_ehpad.pdf)
- [HAS, programme « Qualité de vie en Ehpad »](https://has-sante.fr/jcms/c_2835485/fr/programme-qualite-de-vie-en-ehpad)
- [Assemblée nationale, mission flash sur le rôle des proches en Ehpad (2022)](https://www2.assemblee-nationale.fr/content/download/462894/4517895/version/1/file/Communication+MI+flash+r%C3%B4le+des+proches+Ehpad.pdf) : le projet de vie repose sur l'histoire de la personne, son entourage, ses loisirs et ses goûts.

### Les financements pour les projets d'aidants *(question 2)*

**Ce qu'on en tire :** il existe des appels à projets chaque année pour les initiatives qui soutiennent les aidants.

- [Fondation de France, appel à initiatives « Aidants » 2025](https://fondationdefrance.org/images/pdf/2025_aap_fdf/cahier-des-charges-appel-a-initiatives-aidants-2025.pdf)
- [Département de la Manche, appel à projets « Seniors et aidants » 2025](https://www.manche.fr/wp-content/uploads/2025/01/CC-Senior-aidants-2025-1.pdf) : un exemple de conférence des financeurs départementale.

### Le partage d'informations entre soignants et aidants *(questions 3 et 15)*

**Ce qu'on en tire :** les règles sur ce que l'on peut partager entre professionnels et aidants restent floues. La qualité de membre de la famille ne donne pas, à elle seule, accès à tout le dossier du résident.

- [France Assos Santé Grand Est, fiche pratique « RU et aidants » (2023)](https://grand-est.france-assos-sante.org/wp-content/uploads/sites/9/2023/01/Fiche-pratique-RU-et-Aidants.pdf)
- [Donneespersonnelles.fr, échanges entre Ehpad et familles et RGPD](https://www.donneespersonnelles.fr/ehpad-echanges-familles-donnees-rgpd)

### Les concurrents *(question 18)*

- **Famileo :** [Le Journal des Entreprises, « Le lien transgénération de Famileo »](https://www.lejournaldesentreprises.com/article/le-lien-transgeneration-de-famileo-17009). Service lancé en 2015, payé par l'établissement (environ 70 € HT par mois), avec une gazette imprimée chaque semaine pour le résident.
- **Cahier de liaison à domicile :** [Essentiel Autonomie, « Aide à domicile : quels outils pour faciliter la vie des aidants »](https://www.essentiel-autonomie.com/services-domicile/aide-domicile-quels-outils-faciliter-vie-aidants)
- **Réseau d'entraide (Le Cœur du Nid) :** [AG2R La Mondiale, « Une application pour soulager les familles face au handicap » (mars 2026)](https://www.ag2rlamondiale.fr/particulier/magazine-solidarites/mars-2026/une-application-pour-soulager-les-familles-face-au-handicap)
- **Logiciels de soins en Ehpad (NetSoins) :** [ARS Occitanie, document mentionnant NetSoins](https://www.occitanie.ars.sante.fr/media/153302/download)

⚠️ Ces sources décrivent les outils de façon générale. Allez voir chaque outil vous-mêmes avant vendredi.

### Les coûts *(questions 2, 10 et 19)*

- **Hébergement de la base de données (Supabase) :** gratuit au départ, puis 25 $ par mois pour l'offre Pro. [supabase.com/pricing](https://supabase.com/pricing)
- **IA (Mistral) :** facturée à l'usage. Moins d'un centime par note ou par fiche, selon nos calculs à partir des tarifs. [mistral.ai/pricing](https://mistral.ai/pricing)
- **Apple :** 99 $ par an pour publier sur l'App Store. Commission de 15 % pour les entreprises qui gagnent moins d'un million de dollars par an. [Apple, App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/)
- **Google :** 25 $ une seule fois pour publier sur Google Play. Commission de 15 % sur les abonnements. [Google Play, frais de service](https://support.google.com/googleplay/android-developer/answer/112622)

### L'hébergement des données de santé (HDS) *(question 9)*

**Ce qu'on en tire :** pour héberger des données de santé, comme un dossier de soins, il faut un hébergeur certifié HDS. Le carnet vivant n'en a pas besoin aujourd'hui, parce qu'il est non médical.

- [Agence du numérique en santé, la certification HDS](https://esante.gouv.fr/produits-services/hds)

---

## 2. Ce qui est vérifié dans l'application

Ces points ont été vérifiés dans le code de l'app et sont couverts par plus de 200 tests automatiques. Ils peuvent être affirmés sans hésiter.

| Ce qu'on affirme | Question | Où le voir dans l'app |
|---|---|---|
| On dicte une note avec le micro, l'IA l'écrit et propose une rubrique | 1, 10, 14 | « Ajouter une note » → micro → « Proposée par l'IA » |
| Si l'IA ne répond pas, on choisit la rubrique à la main | 1, 10 | Toutes les rubriques restent modifiables |
| Le proche relais n'installe rien et ne crée pas de compte | 1, 8 | Le lien s'ouvre dans le navigateur |
| Le proche relais peut tout écouter | 1 | Bouton « Tout écouter » sur la fiche |
| Grands caractères, contrastes, lecture à voix haute, mode dyslexie, clavier | 1 | Réglages → Accessibilité (98 écrans testés sans erreur) |
| La base de données est hébergée en France | 5 | Supabase, région Paris |
| L'IA est française et passe par notre serveur | 5, 10 | Mistral, appelé uniquement depuis notre serveur, jamais depuis l'app |
| L'IA ne reçoit que le texte et le prénom, jamais le nom de famille | 5 | Consigne de l'IA côté serveur |
| L'IA a pour consigne de ne poser aucun diagnostic et de ne rien inventer | 14 | Consigne de l'IA côté serveur |
| Les liens sont uniques, expirent, se désactivent, et chaque ouverture est enregistrée | 5, 16 | « Partager la fiche » → journal « Ouverte 2 fois » |
| La rubrique Santé n'est visible que si l'aidant la partage | 5 | Fiche de Claire dans la démo |
| La mutuelle ne voit jamais le contenu du carnet | 5 | Elle n'a aucun accès prévu, et c'est écrit dans la politique de confidentialité |
| On peut tout exporter ou tout effacer | 5, 15 | Réglages → Compte : « Exporter mes données », « Supprimer mon compte » |
| Le cadre décide qui lit, qui écrit, et valide les notes avant publication | 7 | Compte de Marc dans la démo → « 2 notes à valider » |
| Les soignants se connectent avec un simple code | 7 | Code d'invitation de l'établissement |
| Les notes de plus de 3 mois sont signalées (« Toujours vrai / A changé / Plus vrai ») | 3 | Dans chaque rubrique |
| Un membre de la famille invité peut ajouter des notes | 8 | Compte de Léo dans la démo |
| Sans code mutuelle : 14 jours de découverte | 2 | À l'inscription, écran du code mutuelle → « Je n'ai pas de code » |
| Le paiement n'est pas encore dans l'app | 2 | Il sera activé à la sortie sur les stores |

## 3. Ce qui n'existe pas encore (ne pas l'affirmer)

| Ce qu'il ne faut pas dire | Pourquoi |
|---|---|
| « Nos tests avec des familles montrent que… » | Le test n'a pas encore commencé : c'est la prochaine étape. |
| « Le carnet fonctionne sans réseau » | Il faut internet pour l'ouvrir. |
| « La personne tient elle-même son carnet » | Ce n'est pas encore possible : c'est une évolution possible. |
| « L'app est connectée aux logiciels de soins » | Ce n'est pas prévu à court terme, et il faudrait un hébergement HDS. |
| « 100 % des données restent en France » | La base est en France, mais l'IA traite le texte en Europe. |
| « 45 minutes au lieu de 15 » | Chiffre sans source. |
| « Le carnet passe déjà de la maison à l'établissement » | Pas encore : aujourd'hui, l'établissement ouvre son propre carnet et y invite la famille. |
