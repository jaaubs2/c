# Démo pour le jury — 5 minutes

Une histoire, trois points de vue, une seule idée : **le savoir humain sur Jeanne ne se perd plus
quand quelqu'un d'autre prend le relais.**

Tout ce qui est montré est **réel** : vrais comptes, vraies données enregistrées sur le serveur, vraie IA.
Le parcours ci-dessous a été répété automatiquement, clic par clic (32 vérifications, toutes réussies).

---

## Les personnages (comptes de démonstration)

| Qui | Rôle | Identifiant |
|---|---|---|
| **Anne** | Aidante de sa mère **Jeanne**, 86 ans | `anne@demo.lecarnetvivant.fr` |
| **Claire** | Sa sœur, vient le mercredi | pas de compte : un **lien** |
| **Marc Aubry** | Cadre de santé, Maison des Tilleuls | `marc@demo.lecarnetvivant.fr` |
| **Sandra Meyer** | Aide-soignante, Unité B | `sandra@demo.lecarnetvivant.fr` |
| **Sophie** | Fille de Marthe, résidente | `sophie@demo.lecarnetvivant.fr` |
| Léo | Petit-fils de Jeanne | `leo@demo.lecarnetvivant.fr` |

Mot de passe de tous les comptes : **`CarnetVivant-2026`** (modifiable en haut du fichier de démo).

Ce qui est déjà en place : les 21 notes de Jeanne dans les 7 rubriques ; une fiche pour Claire,
**déjà ouverte 2 fois** ; une ancienne fiche désactivée ; la Maison des Tilleuls avec 3 unités,
6 soignants, 28 résidents ; **2 notes qui attendent le visa de Marc**.

---

## Installer la démo (une fois, 5 minutes)

1. Supabase → **SQL Editor** → **New query**.
2. Ouvre `supabase/demo/demo-jury.sql` dans VS Code, copie **tout**, colle, **Run**.
3. Un tableau s'affiche : les identifiants, et le **lien de la fiche de Claire**
   (`#fiche=…`). Colle-le après l'adresse de l'app, par exemple
   `https://ton-adresse/#fiche=…`, et garde ce lien dans tes notes.

**Remise à zéro** : relancer le même fichier efface les comptes de démo et les recrée à neuf.
Les vrais comptes ne sont jamais touchés. ⚠️ Le lien de Claire **change** à chaque remise à zéro,
et il faut se reconnecter aux comptes.

---

## Le matériel

Sur l'ordinateur branché au projecteur, **trois fenêtres** (l'app s'affiche dans un cadre de téléphone) :

| Fenêtre | Navigateur | Contenu |
|---|---|---|
| ① Anne | Chrome, fenêtre normale | connectée comme Anne |
| ② Claire | Safari (ou Firefox) | le lien de la fiche de Claire, déjà ouvert |
| ③ Marc | Chrome, **fenêtre de navigation privée** | connecté comme Marc |

Pourquoi trois navigateurs ? Dans un même navigateur, on ne peut être connecté qu'à un seul compte.

---

## Le déroulé

### 0:00 – 0:40 · L'histoire (sans toucher à l'écran)

> « Jeanne a 86 ans. Sa fille Anne s'occupe d'elle depuis deux ans. Anne sait tout : qu'il ne
> faut jamais la presser le matin, que la pénombre l'angoisse, qu'une tarte aux pommes tiède
> la rend heureuse. Mais le mercredi, c'est sa sœur Claire. Le mardi, une aide à domicile.
> Et un jour, peut-être, un Ehpad. À chaque relais, ce savoir se perd.
> Le carnet vivant le garde, et le transmet. »

### 0:40 – 1:40 · Anne remplit le carnet · fenêtre ①

1. Montre l'accueil : « **Le carnet de Jeanne**, 21 notes, 7 rubriques sur 7. »
2. **Ajouter une note** → bouton **micro** → dis clairement :
   *« Le soir, elle aime qu'on lui lise le journal avant de dormir. »* → **Terminer**.
3. Le texte apparaît, et la rubrique est **proposée par l'IA**. → **Enregistrer**.

> « Anne n'a pas le temps d'écrire : elle parle, l'IA transcrit et range. Mais c'est toujours
> Anne qui décide : tout reste modifiable. »

### 1:40 – 2:40 · Transmettre · fenêtre ①

1. Sur l'accueil : **Fiche pour Claire · ouverte 2 fois** → clique.
   > « Anne sait que Claire l'a lue, deux fois. Le lien expire tout seul, et Anne peut le couper à tout moment. »
2. **Nouvelle transmission** → **Préparer la fiche** → **Rédiger avec l'IA**.
   > « L'IA choisit les trois choses essentielles, dans les rubriques qu'Anne a choisies. Anne relit, corrige. »
3. **Créer le lien de partage** → prénom : *Nadia* → coche la case → **Créer le lien sécurisé**.
   > « Un lien unique, impossible à deviner, vérifié par le serveur. Il suffit de l'envoyer par SMS. »

### 2:40 – 3:15 · Ce que reçoit Claire · fenêtre ②

1. Montre le mot d'Anne et les **3 choses à savoir**.
   > « Pas de compte, pas d'application à installer : un lien. Claire voit l'essentiel en dix secondes. »
2. Touche la 1re chose à savoir : la rubrique s'ouvre, avec toutes les notes d'Anne,
   et un bouton pour les **écouter**.
   > « La rubrique Santé n'apparaît nulle part : Anne ne l'a pas partagée avec Claire. »

### 3:15 – 4:15 · L'établissement · fenêtre ③

1. Accueil de Marc : la **Maison des Tilleuls**, 3 unités, 28 résidents.
2. **2 notes à valider** → la note de Sandra sur Marthe → **Valider**.
   > « Dans un Ehpad, les équipes tournent. Sandra note ce qui a marché ce matin. Marc, le cadre,
   > valide. L'équipe du soir le sait, et la famille aussi, tout de suite. »

### 4:15 – 4:45 · La confiance · fenêtre ①

1. **Réglages** → **Accessibilité** → **Très grand texte** : tout l'écran grandit, en direct.
   > « Beaucoup d'aidants ont eux-mêmes plus de 60 ans. Gros caractères, contrastes, lecture à voix haute,
   > navigation au clavier, lecteur d'écran : conforme au niveau AA des règles d'accessibilité. »
2. (Remets le texte en taille normale.)
   > « Côté données : tout est hébergé en Europe, l'IA est française, rien n'est médical,
   > chaque consentement est enregistré, et on peut tout exporter ou tout effacer en un clic. »

### 4:45 – 5:00 · Conclusion

> « Le carnet vivant, c'est la mémoire de ce qui fait du bien à Jeanne, qui passe de main en main
> sans jamais se perdre. »

---

## Plan B

| Si… | Alors… |
|---|---|
| **Pas d'internet** | Partage de connexion de ton téléphone (à tester sur place). En dernier recours : la **vidéo** de la démo (ci-dessous). |
| **La dictée ne marche pas** (micro, bruit) | Écris la note au clavier : la rubrique est proposée de la même façon. « La dictée, c'est pour quand on a les mains prises. » |
| **L'IA ne répond pas** | Continue sans : « L'IA propose, elle n'est jamais indispensable. » Choisis la rubrique à la main, écris la fiche toi-même. |
| **Un compte est déconnecté** | Identifiant et mot de passe dans le tableau ci-dessus (garde-les sur papier). |
| **Le lien de Claire ne s'ouvre plus** | Tu as sans doute remis la démo à zéro : relance le fichier et reprends le nouveau lien. |

**La vidéo de secours** : la veille, sur le Mac, `Cmd + Maj + 5` → **Enregistrer tout l'écran** →
joue la démo en entier → garde la vidéo sur le bureau (et sur une clé USB).

---

## Check-list

**J-7**
- [ ] Supabase, IA et mise en ligne faits (`SUPABASE.md`, `IA-MISTRAL.md`, `MISE-EN-LIGNE.md`).
- [ ] Démo installée, parcours joué une fois en entier, chronométré.
- [ ] Prix identiques dans l'app et dans le pitch (l'app affiche aujourd'hui **20 €/mois ou 180 €/an**).

**La veille**
- [ ] Vidéo de secours enregistrée.
- [ ] Identifiants et lien de Claire imprimés.

**1 heure avant**
- [ ] Remise à zéro de la démo (relancer le fichier), puis reconnexion : Anne ①, Marc ③, lien de Claire ②.
- [ ] Autoriser le micro dans Chrome (faire une dictée d'essai, puis la supprimer).
- [ ] Taille du texte d'Anne en **Normal** ; notifications de l'ordinateur coupées ; batterie branchée.
- [ ] Onglets inutiles fermés, zoom du navigateur à 100 %.

---

## Questions probables du jury

**« Pourquoi pas un hébergeur de données de santé (HDS) ? »**
Le carnet est **non médical par conception** : pas de diagnostic, pas de traitement, pas de résultat
d'examen. Il garde le savoir *humain* : habitudes, goûts, façon de parler. Les conditions d'utilisation
l'interdisent, et la rubrique « Santé et vigilance » ne contient que des repères du quotidien (« appareil
auditif à gauche »). Si demain le carnet devait se relier au dossier de soins d'un Ehpad, il faudrait un
hébergement HDS : c'est une étape identifiée.

**« Et si l'IA se trompe ? »**
Elle **propose**, la personne décide : chaque rubrique, chaque fiche se relit et se corrige avant d'être
enregistrée. Consigne donnée à l'IA : aucun diagnostic, ne rien inventer. Elle ne reçoit que le texte utile
et le prénom, jamais le nom de famille. C'est Mistral, une IA française, sur des serveurs européens.

**« Les données sont-elles en sécurité ? »**
Base de données en Europe (Supabase, région Paris), échanges chiffrés, règles d'accès vérifiées par le
serveur (et testées automatiquement : 81 vérifications). Les liens de partage sont uniques, stockés sous
forme d'empreinte, expirent, se désactivent, et chaque ouverture est inscrite dans un journal.

**« C'est vraiment fonctionnel ? »**
Oui : comptes, carnets, notes, partage, établissement, IA, export et suppression des données.
Plus de 200 vérifications automatiques couvrent la sécurité, l'IA, l'accessibilité et les parcours complets.
Pas encore en place : le paiement en ligne, et la publication sur l'App Store et Google Play.

**« Combien ça coûte à faire tourner ? »**
Hébergement européen gratuit au départ ; base de données gratuite, puis 25 $ par mois ; l'IA coûte moins
d'un centime par note ou par fiche. Comptes développeur : 99 $ par an (Apple), 25 $ une fois (Google).

**« Qui paie ? »**
L'aidant principal (abonnement), et l'établissement pour ses équipes. Les relais, eux, n'ont jamais besoin
de payer ni de créer un compte. *(À ajuster à ton modèle économique.)*

**« La suite ? »**
Un pilote avec un établissement et une vingtaine d'aidants ; la publication sur les stores ; le paiement ;
un audit d'accessibilité avec des personnes utilisatrices ; la relecture juridique des documents.
