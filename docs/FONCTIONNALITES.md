# Le carnet vivant · toutes les fonctionnalités

*État de l'application au 26 octobre 2026.*

> **En une phrase :** Le carnet vivant garde ce qu'on sait d'une personne en perte d'autonomie (ce qui l'apaise, ses habitudes, comment lui parler) et le transmet à chaque personne qui prend le relais : la famille, un proche, une aide à domicile, une équipe d'établissement.
>
> **Le problème qu'il résout :** le problème n'est pas le soin, c'est la **transmission**. À chaque relais, ce savoir se perd.

---

## 1. À qui ça s'adresse

| Qui | Exemple dans la démo | Ce qu'il fait dans l'app | Compte ? | Paie ? |
|---|---|---|---|---|
| **L'aidant** : le proche qui accompagne au quotidien | Anne, fille de Jeanne | Tient le carnet, ajoute les notes, transmet, invite | Oui | Non : la mutuelle paie, ou abonnement (à venir) |
| **Le cercle d'aidants** : la famille invitée | Léo, petit-fils | Lit tout le carnet, ajoute ses notes | Oui | Non |
| **Les proches relais** : ceux qui prennent le relais un moment | Claire (sa sœur), une voisine, une auxiliaire de vie | Lit une fiche reçue par lien | **Non** | Jamais |
| **Le cadre d'établissement** | Marc, cadre de santé | Crée l'établissement, les unités, les carnets des résidents ; valide les notes | Oui | L'établissement paie un abonnement |
| **Les soignants** | Sandra, aide-soignante | Lisent les carnets de leur unité, ajoutent des notes | Oui, avec un code | Non |
| **La famille d'un résident** | Sophie, fille de Marthe | Voit les notes validées de l'équipe, ajoute les siennes | Oui | Non |
| **La mutuelle** | « Mutuelle Exemple » | Offre l'accès à ses adhérents aidants avec un code | Non | Oui : 4 € par aidant actif et par mois |

Le carnet sert quelle que soit la raison de la perte d'autonomie : **le grand âge, la maladie ou le handicap**, à domicile comme en établissement.

---

## 2. Les 7 rubriques du carnet

1. **Histoire de vie**
2. **Habitudes et routines**
3. **Ce qui apaise / ce qui angoisse**
4. **Comment lui parler**
5. **Goûts et plaisirs**
6. **Santé et vigilance** : des repères du quotidien seulement (« appareil auditif à gauche »), jamais de diagnostic ni de traitement
7. **Personnes importantes**

---

## 3. L'espace aidant

### S'inscrire et commencer
- Compte avec un e-mail et un mot de passe, vérifié par **un code à 6 chiffres** reçu par e-mail.
- Les consentements sont enregistrés : conditions d'utilisation, données sensibles, et accord de la personne accompagnée.
- **Accès** : avec le **code de sa mutuelle**, l'aidant est pris en charge. Sans code, il a **14 jours de découverte**. Le paiement n'existe pas encore dans l'app, donc rien n'est bloqué ensuite.
- Création du carnet : prénom, âge, depuis combien de temps, lien avec la personne, « elle » ou « il ».

### Ajouter une note
- **Dicter** : on appuie sur le micro et on parle. L'IA écrit la phrase.
- Ou **écrire** au clavier.
- L'IA **propose la rubrique** (« Proposée par l'IA »). On peut la changer, et on relit avant d'enregistrer.
- Chaque note est **signée** : qui l'a écrite, et quand.
- On peut modifier ou supprimer une note.

### L'accueil
- **« Le carnet de Jeanne »** : le nombre de notes et de rubriques remplies.
- **L'humeur du jour de la personne** : Sereine, Fatiguée, Fragile ou Belle journée. Un appui sur le bloc bleu ouvre **« Comment va Jeanne » sur 30 jours** : un calendrier, le total pour chaque humeur, et qui a noté quoi. Tout le cercle le voit, jamais les relais.
- **La recherche** dans tout le carnet, et des filtres par rubrique.
- **Un repère pour le moment de la journée** (matin, midi, après-midi, soir), tiré des notes.
- **« Toujours d'actualité ? »** : une note qui n'a pas été vérifiée depuis plus de 3 mois est signalée. On répond **Toujours vrai**, **A changé** (on la corrige) ou **Plus vrai** (elle part dans la « trace de vie »). Le rappel revient 3 mois après la dernière vérification.
- **« Garder le carnet vivant »** : l'IA relit le carnet et pose quelques questions pour le compléter ou le mettre à jour.
- **La carte « Partager la fiche de Jeanne »**, avec la dernière fiche envoyée et combien de fois elle a été ouverte.
- **Les notifications** (la cloche) : « Claire a ouvert la fiche ». Une notification effacée ne revient pas.

### Transmettre une fiche à un relais
1. On choisit pour qui : **un proche**, **un professionnel** ou **un établissement**.
2. On choisit les **rubriques visibles**. La rubrique Santé, par exemple, peut rester masquée.
3. **L'IA rédige la fiche** : un mot d'accueil et les **3 choses à savoir**. On relit et on corrige.
4. On ajoute le **prénom** du relais et **un petit mot** (300 caractères au maximum).
5. On choisit **la durée du lien** (3, 7 ou 30 jours), on confirme l'accord de la personne, et on obtient un **lien sécurisé** à envoyer par SMS, e-mail ou message.

Ensuite :
- un **journal des ouvertures** montre combien de fois et quand la fiche a été lue ;
- on peut **désactiver un lien** à tout moment, et chaque lien **expire tout seul** ;
- dans **Réglages → Accès & partages**, on retrouve la liste de toutes les fiches, et on peut masquer une rubrique pour toutes les futures fiches.

### Le cercle d'aidants
- On invite un proche avec un **lien à usage unique**. Il crée son compte et rejoint le carnet.
- Un proche du cercle **lit tout le carnet**, **ajoute ses notes** (signées) et peut modifier les siennes. Il ne peut **ni modifier ni supprimer** celles des autres, et il ne voit **ni les fiches partagées, ni l'onglet « Moi »**.
- On peut **retirer** un proche du cercle. Ses notes restent, signées de son prénom.

### L'onglet « Moi » : prendre soin de l'aidant
- **La charge invisible**, notée sur 100, avec trois zones : verte, orange, rouge. Elle est calculée sur 7 jours à partir de :
  - les jours sans relais (40 points) ;
  - les notes écrites la nuit (20 points) ;
  - les jours avec des notes (20 points) ;
  - le ressenti de l'aidant (20 points).
- **« Aujourd'hui, tu te sens… »** : À bout, Sous tension, Ça va, Bien. C'est gardé **sur le compte**, et lisible **par l'aidant seul**. Les 7 derniers jours s'affichent, et les jours vides sont en pointillés.
- **Le plan de relais** : on décide à l'avance quand passer la main et à qui. Quand le seuil est atteint, un message prêt s'affiche et l'app ouvre le partage de la fiche.
- **« Mon carnet à moi »** : ce qui fait du bien à l'aidant, pour ne pas l'oublier.
- **Une respiration guidée** 4-2-6, d'une minute.
- **De l'aide** : l'association *Avec nos proches*, ligne d'écoute des aidants au 01 84 72 94 72, et le guide officiel des solutions de répit.

### Les réglages
- **Mon profil**, **Mon compte** (e-mail, mot de passe, déconnexion, suppression du compte), **Profil de la personne**.
- **Le cercle d'aidants**, **Accès & partages**.
- **Accessibilité** (voir la partie 7).
- **Apparence** : le choix est enregistré. Le mode sombre arrive bientôt.
- **Confidentialité & données** : où sont hébergées les données, **exporter** toutes ses données, **supprimer** son compte.
- **Aide & à propos** : FAQ, contact (lecarnetvivant@gmail.com), conditions d'utilisation, politique de confidentialité, mentions légales.

---

## 4. L'espace relais (sans compte)

- On ouvre le **lien reçu**, sans rien installer ni créer de compte.
- On voit **le mot de l'aidant**, puis **les 3 choses à savoir**.
- Les **rubriques partagées** s'ouvrent avec toutes les notes, et **tout peut s'écouter** (« Tout écouter »).
- **« Aujourd'hui »** : les conseils du moment de la journée.
- **Le cadenas** : ce que l'aidant a choisi de partager, la date de fin du lien, et le fait que la fiche n'est pas un dossier médical.
- La fiche ne s'ouvre plus quand le lien a expiré ou a été désactivé.
- Une FAQ répond aux questions des relais.

---

## 5. L'espace établissement

### Pour le cadre
- **Inscription de l'établissement** : nom, type, numéro FINESS, ville, **unités** (par exemple A, B et C).
- **Les carnets des résidents**, par unité.
- **Un code d'accès** pour que les soignants rejoignent l'équipe.
- **« Notes à valider »** : les notes des soignants attendent son visa. Il **valide** ou **refuse**.
- **Inviter la famille** d'un résident dans son carnet, par lien.
- **Retirer** un soignant qui quitte l'équipe. Les carnets et les notes restent à l'établissement.

### Pour les soignants
- Ils entrent avec **le code** donné par le cadre.
- Chacun voit **les résidents de son unité**.
- Ils **ajoutent des notes** (dictées ou écrites), qui sont publiées après la validation du cadre.
- Une note écrite **sans réseau** part dès que le réseau revient.

### Pour la famille d'un résident
- Elle rejoint le carnet par le lien envoyé par le cadre.
- Elle voit les **notes validées de l'équipe**, signées (par exemple « Sandra, aide-soignante »), et ajoute les siennes.

---

## 6. La mutuelle

- La mutuelle reçoit un **code** à donner à ses adhérents aidants.
- L'aidant saisit le code dans l'app, et son accès est pris en charge.
- La mutuelle **ne voit aucune donnée** du carnet : elle finance l'accès, c'est tout.

---

## 7. Accessibilité

- **3 tailles de texte** (normal, grand, très grand). La barre de menu grandit avec le texte.
- **Contraste renforcé**.
- **Réduire les animations**.
- **Lecture facilitée** : une police adaptée à la dyslexie, avec des lettres et des lignes plus espacées.
- **Lecture à voix haute** des notes.
- **Navigation complète au clavier** et compatibilité avec les **lecteurs d'écran**.
- Conçue pour le **niveau AA** des règles d'accessibilité (WCAG 2.1). Elle est vérifiée automatiquement sur 99 écrans, avec tous les réglages activés.
- Presque rien à taper, grâce à la dictée.

---

## 8. Confiance, sécurité, données

- **Non médical par conception** : aucun diagnostic, aucun traitement, aucune ordonnance.
- **La base de données est hébergée en France** (Supabase, région Paris).
- **L'IA est française** (Mistral) :
  - elle n'est appelée que par notre serveur ;
  - aucune clé secrète n'est dans l'app ;
  - elle ne reçoit que le texte utile et le **prénom**, jamais le nom de famille ;
  - elle a pour consigne de ne jamais poser de diagnostic et de ne rien inventer ;
  - un **quota** limite son usage.
- **L'IA propose, la personne décide** : tout se relit et se corrige.
- **Les liens de partage** sont uniques, gardés sous forme d'empreinte (illisibles même pour nous), expirent, se désactivent, et chaque ouverture est enregistrée.
- **Les droits sont vérifiés par le serveur**, et ces règles sont testées automatiquement : chacun ne voit que ce qu'il a le droit de voir.
- **RGPD** : les consentements sont enregistrés, chacun peut **exporter** ses données ou **supprimer** son compte (et son carnet), et les textes légaux sont disponibles dans l'app.
- **Les e-mails** (codes de connexion) sont envoyés par Brevo, une entreprise française.

---

## 9. Le modèle économique

| Qui | Prix |
|---|---|
| Les familles, au lancement | 14 jours gratuits, puis 9,90 € par mois (le paiement arrive avec la sortie sur les stores) |
| Les mutuelles | 4 € par aidant actif et par mois, jusqu'à 2 € avec le volume |
| Les établissements | 2 € par résident et par mois, en commençant par une seule unité si besoin |
| Les relais et les proches invités | Toujours gratuit |

---

## 10. Sur quoi l'app fonctionne

- **Sur le web** : https://le-carnet-vivant.statichost.page, sur téléphone, tablette et ordinateur. On peut l'ajouter à l'écran d'accueil.
- **Sur iPhone et Android** : les applications sont prêtes techniquement, mais **pas encore publiées** sur l'App Store et Google Play.

---

## 11. Ce qui n'existe que dans la démo

Ces écrans servent à montrer l'idée, mais ne sont **pas encore branchés** avec un vrai compte :
- l'invitation « La Maison des Tilleuls a ouvert le carnet de Jeanne » dans les notifications ;
- le journal familial et le message « Claire t'a laissé un mot » ;
- plusieurs carnets confiés au même relais (Jeanne et Roger) ;
- le partage de « Mon carnet à moi » avec un relais ;
- les réglages de notifications : les interrupteurs s'affichent, mais n'envoient encore rien.

---

## 12. Ce qui arrive ensuite

Le détail est dans `docs/APRES-CONCOURS.md`.
- **Relier le carnet de la famille à un établissement** : la famille reste propriétaire et garde un lien permanent, et rien ne change pour les soignants.
- **Repérer les notes qui se ressemblent ou se contredisent**, et laisser l'aidant choisir.
- **Le mode sombre**.
- **Les notifications sur téléphone**, à la sortie sur les stores.
- **La sortie sur l'App Store et Google Play**, avec le paiement de l'abonnement.
- **Un audit de sécurité** par un expert extérieur, avant la phase de test.
- **La suppression automatique des comptes inactifs depuis 2 ans**, comme promis dans la politique de confidentialité.
- Plus tard : que la personne tienne elle-même son carnet, lire une fiche sans réseau, se relier aux logiciels de soins (avec un hébergement certifié HDS).
