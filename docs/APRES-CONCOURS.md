# To-do · avant et après le concours

Tout ce qui a été mis de côté, au même endroit. Coche au fur et à mesure.

---

## Avant le jury (vendredi 23 octobre)

- [ ] **Mettre en ligne les dernières corrections** : valider la fusion (pull request) sur GitHub.
- [ ] **Supabase → SQL Editor** : coller et lancer, dans l'ordre, les deux nouveaux fichiers de `supabase/migrations/` :
  - `20261019000000_cercle.sql` (retirer un proche du cercle) ;
  - `20261020000000_humeurs.sql` (« Comment va Jeanne » et le ressenti de l'aidant, gardés sur le compte).
- [ ] Relancer `supabase/demo/demo-jury.sql`, qui ajoute 29 jours d'humeurs à Jeanne pour la démo, puis reprendre le **nouveau lien de Claire**.
- [ ] Diapo : mettre les vraies photos sur la slide 2 et décider qui fait la démo (Hugo seul, ou une vidéo).
- [ ] Faire relire à Hugo le document des questions-réponses mis à jour (la question 3 a changé).
- [ ] 1 heure avant : remettre la démo à zéro (voir `docs/DEMO-JURY.md`).

---

## Après le concours

### 1. L'établissement : relier le carnet de la famille (le « cas B »)
Aujourd'hui, seul l'établissement peut ouvrir un carnet et y inviter la famille. À construire :
- [ ] La famille **relie** son carnet à un établissement quand la personne y entre, et **en reste propriétaire**.
- [ ] Pour les soignants, **rien ne change** : le carnet apparaît dans leur unité, ils lisent et écrivent, et le cadre valide.
- [ ] La famille garde un **lien permanent** : elle voit les notes validées de l'équipe et « Comment va Jeanne ».
- [ ] La famille peut **couper l'accès** (changement d'établissement, retour à domicile) et garde tout.
- [ ] À trancher : quelle unité, qui choisit, et comment l'établissement accepte le carnet.

### 2. Les notes qui se ressemblent (l'exemple de la carotte)
- [ ] À l'enregistrement d'une note, l'IA repère une note proche ou contradictoire et la montre.
- [ ] Trois choix, sans fusion automatique :
  - **garder les deux** ;
  - **la nouvelle remplace l'ancienne**, qui part dans la trace de vie ;
  - **compléter l'ancienne**, avec un texte proposé par l'IA et relu.
- [ ] Tester avec de vraies notes avant de l'activer pour tout le monde.

### 3. Le mode sombre
- [ ] Choisir la palette sombre (fonds, textes, couleurs des rubriques).
- [ ] Adapter les couleurs écrites « en dur » dans les écrans (environ 300).
- [ ] Vérifier les contrastes (niveau AA) en mode sombre, écran par écran.
- [ ] Brancher « Clair / Mode soir / Automatique », déjà enregistré dans les Réglages.

### 4. Les notifications
- [ ] Valider la liste. Proposition :
  - « Comment tu te sens aujourd'hui ? », à 19h, désactivable ;
  - « X a ouvert la fiche » ;
  - « X a ajouté une note » ;
  - « N notes à revérifier », une fois par semaine maximum ;
  - « Le lien de X expire demain ».
- [ ] Aucune notification entre 21h et 8h, et un bouton « Ne pas déranger ».
- [ ] Configurer les notifications sur téléphone au moment de la sortie sur les stores (Firebase pour Android, Apple Push pour iPhone).
- [ ] En attendant, les e-mails avec Brevo sont possibles (gratuits jusqu'à 300 par jour).

### 5. La sortie sur l'App Store et Google Play
- [ ] Comptes développeur : Apple (99 $ par an) et Google (25 $ une seule fois).
- [ ] Captures d'écran, textes des fiches, étiquettes de confidentialité des stores.
- [ ] Le **paiement** de l'abonnement des familles (9,90 € par mois après 14 jours) par les stores. Commission : 15 %.
- [ ] **Audit de sécurité** par un expert extérieur, avant la phase de test.

### 6. Ce que l'app promet et qu'il reste à faire
- [ ] **Supprimer automatiquement les comptes inactifs depuis 2 ans**, avec un e-mail de rappel avant. C'est écrit dans la politique de confidentialité.
- [ ] Onglet « Moi » : passer aussi le plan de relais, « Mon carnet à moi » et la date du dernier relais sur le compte. Ils sont encore gardés sur le téléphone.
- [ ] Faire le tri des écrans qui n'existent qu'en démo : les garder pour la démo, les construire vraiment, ou les retirer. Exemples : l'invitation de la Maison des Tilleuls dans les notifications, « Claire t'a laissé un mot », le partage de « Mon carnet à moi ».

### 7. Des idées pour plus tard
- [ ] Que la personne en situation de handicap puisse **tenir son carnet elle-même**.
- [ ] Lire une fiche **sans réseau**.
- [ ] Se relier aux logiciels de soins. Il faudra alors un hébergement certifié pour les données de santé (HDS).

### 8. L'entreprise et les documents
- [ ] Créer la structure juridique, puis mettre à jour les mentions légales (nom, statut, adresse).
- [ ] Faire relire les textes légaux par un professionnel.
- [ ] Préparer la phase pilote : questionnaire avant/après pour les aidants, indicateurs (fiches transmises et ouvertes, aidant soulagé, nouveaux soignants mieux préparés).
- [ ] Ranger tous les mots de passe dans un gestionnaire (Trousseau iCloud ou Bitwarden).
- [ ] Après les démonstrations : effacer les comptes de démo avec `supabase/demo/supprimer-demo.sql`.
