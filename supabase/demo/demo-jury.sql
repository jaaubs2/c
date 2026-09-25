-- ═══════════════════════════════════════════════════════════════════════
--  LE CARNET VIVANT — DONNÉES DE DÉMONSTRATION (jury, rendez-vous, salons)
-- ═══════════════════════════════════════════════════════════════════════
--
--  À coller dans Supabase → SQL Editor → New query → Run  (voir docs/DEMO-JURY.md).
--
--  Crée des comptes fictifs, déjà remplis, avec les personnages de la démo :
--    • Anne, aidante de sa mère Jeanne (86 ans) : 21 notes, un cercle, une fiche partagée ;
--    • Claire, sa sœur : ouvre la fiche par un lien, sans compte ;
--    • la Maison des Tilleuls : Marc (cadre de santé), 5 soignants, 28 résidents,
--      2 notes qui attendent le visa de Marc ;
--    • Sophie, fille de Marthe (résidente) : contribue au carnet de sa mère ;
--    • une mutuelle fictive, « Mutuelle Exemple (démo) », code DEMO-2026, qui prend Anne en charge.
--
--  REJOUABLE : relancer ce fichier efface les comptes de démo et les recrée à neuf
--  (pratique juste avant le jury). Les vrais comptes ne sont jamais touchés :
--  seules les adresses « @demo.lecarnetvivant.fr » sont concernées.
--
--  Tout se fait d'un bloc : en cas d'erreur, rien n'est modifié.
--  À la fin, un tableau affiche les identifiants et le lien de la fiche de Claire.
-- ═══════════════════════════════════════════════════════════════════════

create temp table if not exists demo_resultat (ordre int, quoi text, valeur text) on commit preserve rows;
truncate demo_resultat;

do $demo$
declare
  -- ▼▼▼  Mot de passe commun à tous les comptes de démo : tu peux le changer  ▼▼▼
  v_password constant text := 'CarnetVivant-2026';
  -- ▲▲▲
  v_domain   constant text := '@demo.lecarnetvivant.fr';
  v_now      timestamptz := now();
  u          jsonb := '{}';  -- prénom → identifiant du compte
  v_id       uuid;
  v_carnet   uuid;
  v_org      uuid;
  v_share    uuid;
  v_token    text;
  v_unit     jsonb := '{}';  -- A/B/C → identifiant d'unité
  r          jsonb;
  n          jsonb;
  c          text;
  who        record;
begin
  -- ─── 1. Remise à zéro des données de démo ───────────────────────────
  delete from public.organizations o
   where o.created_by in (select id from auth.users where email like '%' || v_domain);
  delete from public.carnets k
   where k.owner_id in (select id from auth.users where email like '%' || v_domain);
  delete from auth.users where email like '%' || v_domain;
  delete from public.mutuelle_codes where mutuelle_name = 'Mutuelle Exemple (démo)';

  -- ─── 2. Comptes (mot de passe chiffré comme par Supabase) ──────────
  for who in
    select * from (values
      ('anne',   'Anne',         'aidant'),
      ('leo',    'Léo',          'aidant'),
      ('sophie', 'Sophie',       'aidant'),
      ('marc',   'Marc Aubry',   'etab'),
      ('sandra', 'Sandra Meyer', 'etab'),
      ('karim',  'Karim Haddad', 'etab'),
      ('lucie',  'Lucie Faure',  'etab'),
      ('theo',   'Théo Lambert', 'etab'),
      ('ines',   'Inès Rocha',   'etab')
    ) as t(login, display_name, account_type)
  loop
    v_id := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role,
                            created_at, updated_at)
    values (v_id, who.login || v_domain, extensions.crypt(v_password, extensions.gen_salt('bf')), v_now,
            jsonb_build_object('display_name', who.display_name, 'account_type', who.account_type,
                               'consents', jsonb_build_array('terms', 'sensitive_data')),
            'authenticated', 'authenticated', v_now - interval '60 days', v_now);
    u := u || jsonb_build_object(who.login, v_id);
  end loop;

  -- Colonnes propres au vrai Supabase (absentes du simulateur de test) : on les remplit
  -- seulement si elles existent, pour que la connexion par mot de passe fonctionne.
  if exists (select 1 from information_schema.columns
             where table_schema = 'auth' and table_name = 'users' and column_name = 'instance_id') then
    execute $q$update auth.users set instance_id = '00000000-0000-0000-0000-000000000000',
                 raw_app_meta_data = '{"provider":"email","providers":["email"]}'
               where email like '%' || $1$q$ using v_domain;
    for c in select column_name from information_schema.columns
             where table_schema = 'auth' and table_name = 'users'
               and data_type in ('character varying', 'text')
               and (column_name like '%token%' or column_name in ('email_change', 'phone_change'))
    loop
      execute format('update auth.users set %I = coalesce(%I, %L) where email like %L', c, c, '', '%' || v_domain);
    end loop;
  end if;
  if to_regclass('auth.identities') is not null then
    execute $q$insert into auth.identities (id, user_id, provider_id, identity_data, provider,
                                            last_sign_in_at, created_at, updated_at)
               select gen_random_uuid(), id, id::text,
                      jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
                      'email', now(), now(), now()
               from auth.users where email like '%' || $1$q$ using v_domain;
  end if;

  -- Les notes reçoivent ici leurs vraies dates et leurs auteurs : on suspend le temps de
  -- l'insertion la règle qui les impose à « maintenant » et à « la personne connectée ».
  alter table public.notes disable trigger notes_before_write;

  -- ─── Accès : Anne est prise en charge par une mutuelle (fictive) ────
  v_id := private.mutuelle_code_add('Mutuelle Exemple (démo)', 'DEMO-2026');
  insert into public.access_grants (user_id, kind, mutuelle_name, code_id, created_at)
  values ((u->>'anne')::uuid, 'mutuelle', 'Mutuelle Exemple (démo)', v_id, v_now - interval '200 days');

  -- ─── 3. Le carnet de Jeanne, tenu par Anne ──────────────────────────
  insert into public.carnets (owner_id, person_name, person_age, since_label, owner_relation, avatar, pronoun,
                              created_at)
  values ((u->>'anne')::uuid, 'Jeanne', 86, '2 ans', 'fille', 'warm', 'elle', v_now - interval '200 days')
  returning id into v_carnet;
  insert into public.consents (user_id, carnet_id, kind, value, created_at)
  values ((u->>'anne')::uuid, v_carnet, 'person_consent', 'accord', v_now - interval '200 days');
  insert into public.carnet_members (carnet_id, user_id, role, display_name, relation, created_at)
  values (v_carnet, (u->>'leo')::uuid, 'editor', 'Léo', 'Petit-fils', v_now - interval '40 days');

  -- [jours, rubrique, texte, auteur]
  for n in select * from jsonb_array_elements($j$[
    [184, "histoire",  "Jeanne est née en 1939 à Saint-Affrique, dans l'Aveyron. Elle parle souvent de la rivière près de la maison.", "anne"],
    [21,  "histoire",  "A été institutrice pendant 38 ans. Garde des cartes postales de ses anciens élèves dans le tiroir du bas.", "anne"],
    [9,   "histoire",  "S'est mariée avec Henri en juin 1962. La date l'émeut beaucoup.", "anne"],
    [120, "habitudes", "Ne jamais la presser le matin. Elle a besoin d'au moins une heure entre le réveil et le petit-déjeuner.", "anne"],
    [6,   "habitudes", "Café au lait tiède, deux sucres, dans la tasse bleue à fleurs.", "anne"],
    [2,   "habitudes", "Petite sieste vers 14h, jamais plus de 40 minutes, sinon nuit difficile.", "anne"],
    [40,  "apaise",    "La pénombre l'angoisse. Laisser la veilleuse du couloir allumée toute la nuit.", "anne"],
    [15,  "apaise",    "Tenir sa main droite la rassure immédiatement quand elle s'agite.", "anne"],
    [3,   "apaise",    "Mettre la radio (France Musique) très bas le matin l'apaise pendant la toilette.", "leo"],
    [28,  "parler",    "L'appeler « Jeanne ». Pas « Madame », pas « mamie ». Elle préfère son prénom.", "anne"],
    [11,  "parler",    "Parler lentement, une phrase à la fois. Laisser un long silence avant de reformuler.", "anne"],
    [4,   "parler",    "Éviter les questions à choix multiples. Plutôt « Tu veux du thé ? » que « Qu'est-ce que tu veux boire ? »", "anne"],
    [140, "gouts",     "Elle adore qu'on lui chante des chansons des années 60, Aznavour surtout.", "anne"],
    [19,  "gouts",     "Aime énormément l'odeur du lilas. En mettre dans sa chambre au printemps.", "anne"],
    [7,   "gouts",     "Tarte aux pommes tiède : son plus grand plaisir. Sans cannelle, elle n'aime pas.", "anne"],
    [110, "sante",     "Équilibre fragile à droite. Toujours se placer de ce côté pour marcher avec elle.", "anne"],
    [13,  "sante",     "Appareil auditif à l'oreille gauche. Vérifier la pile chaque lundi.", "anne"],
    [1,   "sante",     "N'aime plus les textures râpeuses (carottes crues). Préférer les légumes fondants.", "anne"],
    [180, "proches",   "Henri, son mari, est décédé en 2019. Parler de lui au présent l'apaise plus qu'au passé.", "anne"],
    [22,  "proches",   "Sa fille Claire vient chaque mercredi. Jeanne la guette dès 14h.", "anne"],
    [5,   "proches",   "Léo, son petit-fils, lui téléphone le dimanche soir. Toujours préparer le téléphone avant 19h.", "leo"]
  ]$j$::jsonb)
  loop
    insert into public.notes (carnet_id, author_id, author_name, author_role, category, body, status, created_at, updated_at)
    values (v_carnet, (u->>(n->>3))::uuid,
            case n->>3 when 'leo' then 'Léo' else 'Anne' end,
            case n->>3 when 'leo' then 'Petit-fils' else '' end,
            n->>1, n->>2, 'published',
            v_now - make_interval(days => (n->>0)::int), v_now - make_interval(days => (n->>0)::int));
  end loop;

  -- La fiche pour Claire : créée il y a 2 jours, valable encore 5 jours, déjà ouverte deux fois.
  v_token := private.random_token();
  insert into public.shares (carnet_id, created_by, from_name, recipient_type, recipient_name, categories, intro,
                             ai_summary, token_hash, expires_at, created_at)
  values (v_carnet, (u->>'anne')::uuid, 'Anne', 'proche', 'Claire',
          array['histoire', 'habitudes', 'apaise', 'parler', 'gouts', 'proches'],
          'Claire, voici l''essentiel pour tes mercredis avec maman. Merci d''être là pour elle.',
          $j${"essentials": [
            {"category": "parler", "text": "L'appeler « Jeanne », jamais « Madame » ni « mamie ». Parler lentement, une phrase à la fois."},
            {"category": "apaise", "text": "Si elle s'agite, lui tenir la main droite. La pénombre l'angoisse : laisser une lumière."},
            {"category": "gouts",  "text": "Son grand plaisir : une tarte aux pommes tiède, sans cannelle, et un air d'Aznavour."}
          ]}$j$::jsonb,
          private.sha256(v_token), v_now + interval '5 days', v_now - interval '2 days')
  returning id into v_share;
  insert into public.share_access_log (share_id, accessed_at)
  values (v_share, v_now - interval '1 day 20 hours'), (v_share, v_now - interval '3 hours');

  -- Une ancienne fiche, désactivée : montre la révocation dans « Accès & partages ».
  insert into public.shares (carnet_id, created_by, from_name, recipient_type, recipient_name, categories,
                             token_hash, expires_at, revoked_at, created_at)
  values (v_carnet, (u->>'anne')::uuid, 'Anne', 'pro', 'Mme Durand, aide à domicile',
          array['habitudes', 'parler', 'sante'], private.sha256(private.random_token()),
          v_now - interval '10 days', v_now - interval '12 days', v_now - interval '20 days');

  insert into demo_resultat values (10, 'Lien de la fiche de Claire (à ajouter après l''adresse de l''app)', '#fiche=' || v_token);

  -- ─── 4. La Maison des Tilleuls ──────────────────────────────────────
  insert into public.organizations (name, kind, city, created_by, created_at)
  values ('Maison des Tilleuls', 'EHPAD', 'Toulouse', (u->>'marc')::uuid, v_now - interval '90 days')
  returning id into v_org;
  for r in select * from jsonb_array_elements($j$[
    {"k": "A", "name": "Unité A", "sub": "Rez-de-jardin", "pos": 0},
    {"k": "B", "name": "Unité B", "sub": "1er étage · unité protégée", "pos": 1},
    {"k": "C", "name": "Unité C", "sub": "2e étage", "pos": 2}
  ]$j$::jsonb)
  loop
    insert into public.units (org_id, name, subtitle, position) values (v_org, r->>'name', r->>'sub', (r->>'pos')::int)
    returning id into v_id;
    v_unit := v_unit || jsonb_build_object(r->>'k', v_id);
  end loop;

  insert into public.org_members (org_id, user_id, role, display_name, job_title, unit_id, perm, created_at)
  values
    (v_org, (u->>'marc')::uuid,   'cadre',    'Marc Aubry',   'Cadre de santé',    null,                       'write',    v_now - interval '90 days'),
    (v_org, (u->>'sandra')::uuid, 'soignant', 'Sandra Meyer', 'Aide-soignante',    (v_unit->>'B')::uuid, 'validate', v_now - interval '80 days'),
    (v_org, (u->>'karim')::uuid,  'soignant', 'Karim Haddad', 'Infirmier',         (v_unit->>'A')::uuid, 'write',    v_now - interval '80 days'),
    (v_org, (u->>'lucie')::uuid,  'soignant', 'Lucie Faure',  'AMP',               (v_unit->>'B')::uuid, 'read',     v_now - interval '70 days'),
    (v_org, (u->>'theo')::uuid,   'soignant', 'Théo Lambert', 'Aide-soignant',     (v_unit->>'C')::uuid, 'validate', v_now - interval '60 days'),
    (v_org, (u->>'ines')::uuid,   'soignant', 'Inès Rocha',   'Psychomotricienne', (v_unit->>'A')::uuid, 'read',     v_now - interval '50 days');

  -- Résidents : [nom, âge, pronom, unité, chambre, proche, lien, notes [[jours, rubrique, texte]]]
  for r in select * from jsonb_array_elements($j$[
    ["Marthe Delcourt", 91, "elle", "B", "Ch. 12", "Sophie", "Fille", [[4, "habitudes", "Se lève vers 8h30, jamais avant. Un réveil brusque la met en colère pour la matinée."], [6, "apaise", "Le chapelet dans la poche gauche de son gilet. Le chercher avec elle si elle s'agite."], [9, "parler", "Vouvoyer. « Madame Delcourt ». Elle a été directrice d'école."], [2, "sante", "Diabète : pas de jus de fruit le matin. Goûter à 16h, pas plus tard."]]],
    ["Henri Bassa", 79, "il", "A", "Ch. 4", "Nadia", "Épouse", [[1, "gouts", "Le foot à la télé le soir le calme, surtout l'OM. Sinon RMC en fond sonore."], [3, "proches", "Nadia passe chaque jour à 15h. Il la guette dès 14h30 à la fenêtre."], [3, "apaise", "N'aime pas être touché par surprise. Se présenter, puis tendre la main."]]],
    ["Louise Perrin", 88, "elle", "C", "Ch. 21", "Paul", "Fils", [[5, "histoire", "Couturière pendant 40 ans. Lui donner un tissu à plier la rassure."], [2, "habitudes", "Tisane verveine avant le coucher, jamais de café après 15h."]]],
    ["André Kowalski", 83, "il", "A", "Ch. 3", "Hélène", "Fille", [[7, "histoire", "Ancien cheminot. Parler de trains, d'horaires, de la gare de Lyon : il s'illumine."], [5, "parler", "Le tutoiement le vexe. « Monsieur Kowalski », puis André s'il le propose."], [2, "habitudes", "Journal papier au petit-déjeuner, même s'il ne lit plus vraiment. Le geste compte."], [4, "proches", "Hélène appelle le mardi et le samedi vers 18h. Préparer le téléphone."]]],
    ["Simone Aït-Ahmed", 90, "elle", "B", "Ch. 15", "Yanis", "Petit-fils", [[3, "apaise", "Le bruit des chariots l'angoisse. Fermer la porte pendant la distribution des repas."], [8, "gouts", "Thé à la menthe très sucré à 16h. Refuse tout ce qui est froid."], [6, "parler", "Mélange français et arabe quand elle est fatiguée. Répondre doucement, ne pas corriger."], [1, "sante", "Appareil auditif gauche : pile à vérifier le lundi. Sans lui, elle se replie."], [10, "proches", "Yanis vient le dimanche avec les enfants. Elle en parle toute la semaine."]]],
    ["Georges Renard", 77, "il", "C", "Ch. 24", "Michel", "Frère", [[9, "habitudes", "Se couche tard, vers 23h. Le forcer plus tôt, c'est une nuit agitée."], [4, "gouts", "Mots croisés et Brassens. Un vieux Télé 7 Jours fait l'affaire."], [1, "apaise", "Quand il tourne en rond, proposer de marcher dehors avec lui. Dix minutes suffisent."]]],
    ["Yvette Morel", 94, "elle", "C", "Ch. 27", "Chantal", "Nièce", [[12, "histoire", "Née à Marseille, fille de pêcheur. Les photos du Vieux-Port la font parler longtemps."], [6, "apaise", "Son châle bleu, toujours sur les épaules. Sans lui, elle cherche et s'inquiète."], [5, "gouts", "Adore la soupe de poisson et les navettes à la fleur d'oranger."], [2, "sante", "Fausse route possible : eau gélifiée, textures mixées, jamais pressée."]]],
    ["Paulette Girard", 89, "elle", "A", "Ch. 1", "Nathalie", "Fille", [[4, "habitudes", "Petit-déjeuner à 7h précises, tartines beurrées et chicorée."], [6, "gouts", "Les chansons de Piaf la font chanter à voix haute."]]],
    ["Marcel Lopez", 81, "il", "A", "Ch. 2", "Julien", "Fils", [[5, "histoire", "Boulanger pendant 45 ans. L'odeur du pain chaud l'apaise instantanément."], [9, "apaise", "Quand il s'agite, lui proposer de pétrir une balle de mousse."]]],
    ["Denise Fontaine", 92, "elle", "A", "Ch. 5", "Agnès", "Nièce", [[8, "parler", "Malentendante : se placer face à elle, articuler, ne pas crier."], [11, "sante", "Chutes fréquentes la nuit. Barrière et veilleuse indispensables."]]],
    ["Robert Nguyen", 78, "il", "A", "Ch. 6", "Lan", "Épouse", [[11, "habitudes", "Tai-chi au lever du soleil dans le jardin, depuis 30 ans."], [3, "proches", "Lan lui apporte du pho le jeudi. Il compte les jours."]]],
    ["Colette Marchand", 87, "elle", "A", "Ch. 8", "Éric", "Fils", [[2, "gouts", "Aquarelle et pastels : lui laisser du papier et de l'eau."], [7, "apaise", "La télévision allumée sans le son la met en colère. Éteindre ou monter le son."]]],
    ["Jacques Petit", 85, "il", "A", "Ch. 10", "Valérie", "Fille", [[5, "histoire", "Instituteur en Bretagne. Réciter des fables avec lui le rend fier."], [10, "parler", "Ne jamais dire « on va se calmer ». Poser une question simple à la place."]]],
    ["Odette Rousseau", 93, "elle", "B", "Ch. 11", "Camille", "Petite-fille", [[8, "habitudes", "Sieste après le déjeuner, jamais plus d'une heure."], [13, "gouts", "Confiture de mirabelles. En garder un pot d'avance."]]],
    ["Bernard Leroy", 80, "il", "B", "Ch. 13", "Josiane", "Épouse", [[11, "apaise", "Le chat en peluche sur le lit : ne pas le déplacer."], [4, "proches", "Josiane vient tous les matins à 10h. L'attendre avec lui à la fenêtre."]]],
    ["Michèle Garnier", 86, "elle", "B", "Ch. 14", "Thomas", "Fils", [[2, "parler", "Elle répond mieux quand on l'appelle « Michou », comme sa mère."], [7, "sante", "Diabète : surveiller le sucre des goûters, elle en cache dans sa table de nuit."]]],
    ["Raymond Blanc", 88, "il", "B", "Ch. 16", "Sylvie", "Fille", [[5, "histoire", "Ancien viticulteur. Sentir un bouchon de liège le fait sourire."], [10, "habitudes", "Il range ses chaussures sous la chaise, toujours dans le même ordre."]]],
    ["Suzanne Mercier", 91, "elle", "B", "Ch. 17", "Béatrice", "Nièce", [[8, "gouts", "Les roses. Une fleur fraîche dans la chambre change sa journée."], [13, "apaise", "Le noir complet l'angoisse. Volet entrouvert la nuit."]]],
    ["Lucien Bertrand", 84, "il", "B", "Ch. 18", "Pascal", "Fils", [[11, "habitudes", "Se rase seul chaque matin. Le laisser faire, même si c'est long."], [4, "parler", "Vouvoiement strict. Il a été notaire."]]],
    ["Ginette Roux", 95, "elle", "C", "Ch. 20", "Monique", "Fille", [[2, "gouts", "Le loto du jeudi : elle ne le rate jamais. Lui garder sa place près de la fenêtre."], [7, "proches", "Monique appelle chaque soir à 19h."]]],
    ["Pierre Moreau", 79, "il", "C", "Ch. 22", "Danielle", "Épouse", [[5, "apaise", "Sa montre au poignet, toujours. Il la cherche sinon."], [10, "sante", "Parkinson : lui laisser le temps pour les gestes, ne pas finir à sa place."]]],
    ["Thérèse Lambert", 90, "elle", "C", "Ch. 23", "Olivier", "Fils", [[8, "histoire", "Couturière à Lyon, des canuts dans la famille. Les tissus, la soie : ses mots reviennent."], [13, "habitudes", "Messe télévisée le dimanche à 11h. Ne pas déranger."]]],
    ["Albert Simon", 82, "il", "C", "Ch. 25", "Karine", "Fille", [[11, "gouts", "Le rugby, et le pastis sans alcool. Le Top 14 le samedi."], [4, "parler", "Blagueur : rire avec lui désamorce tout."]]],
    ["Jeanne Dubois", 96, "elle", "C", "Ch. 26", "Florence", "Nièce", [[2, "apaise", "Le chapelet à 17h, dans le calme. Ne pas interrompre."], [7, "proches", "Florence vient le mercredi. Jeanne prépare sa coiffure dès le matin."]]],
    ["Henriette Vidal", 87, "elle", "C", "Ch. 28", "Anne-Marie", "Fille", [[5, "habitudes", "Marche dans le couloir après chaque repas, toujours vers la droite."], [10, "sante", "Régime sans sel strict. Elle demande souvent la salière."]]],
    ["Fernand Chevalier", 86, "il", "A", "Ch. 30", "Didier", "Fils", [[8, "histoire", "Facteur à vélo pendant 35 ans. Connaît encore toutes les rues du village."], [13, "gouts", "Accordéon et bals du samedi. Yvette Horner le fait taper du pied."]]],
    ["Madeleine Perrot", 89, "elle", "B", "Ch. 31", "Isabelle", "Fille", [[11, "apaise", "Sa boîte à boutons : les trier la calme en quelques minutes."], [4, "habitudes", "Lait chaud au miel à 20h30, puis extinction des feux."]]],
    ["Roland Gauthier", 83, "il", "C", "Ch. 32", "Nicole", "Épouse", [[2, "parler", "Parler lentement, une consigne à la fois. Il acquiesce même sans comprendre."], [7, "proches", "Nicole déjeune avec lui le dimanche. Mettre deux couverts."]]]
  ]$j$::jsonb)
  loop
    insert into public.carnets (org_id, unit_id, room, person_name, person_age, pronoun, created_at)
    values (v_org, (v_unit->>(r->>3))::uuid, r->>4, r->>0, (r->>1)::int, r->>2, v_now - interval '85 days')
    returning id into v_id;
    for n in select * from jsonb_array_elements(r->7) loop
      insert into public.notes (carnet_id, author_id, author_name, author_role, category, body, status, created_at, updated_at)
      values (v_id, case when r->>0 = 'Marthe Delcourt' then (u->>'sophie')::uuid end,
              r->>5, r->>6, n->>1, n->>2, 'published',
              v_now - make_interval(days => (n->>0)::int, hours => 3), v_now - make_interval(days => (n->>0)::int, hours => 3));
    end loop;
    if r->>0 = 'Marthe Delcourt' then
      insert into public.carnet_members (carnet_id, user_id, role, display_name, relation, created_at)
      values (v_id, (u->>'sophie')::uuid, 'editor', 'Sophie', 'Fille', v_now - interval '30 days');
    end if;
  end loop;

  -- Transmissions de l'équipe : une publiée, deux qui attendent le visa de Marc.
  insert into public.notes (carnet_id, author_id, author_name, author_role, category, body, status, created_at, updated_at)
  select k.id, (u->>x.login)::uuid, x.author, x.job, x.cat, x.body, x.status,
         v_now - make_interval(hours => x.hours), v_now - make_interval(hours => x.hours)
  from (values
    ('Henri Bassa',     'karim',  'Karim Haddad', 'Infirmier',      'apaise',   'Agité vers 14h en attendant Nadia. Le match à la télé l''a apaisé.', 'published', 6),
    ('Marthe Delcourt', 'sandra', 'Sandra Meyer', 'Aide-soignante', 'apaise',   'Ce matin, a retrouvé son chapelet et s''est apaisée tout de suite. Le laisser dans la poche gauche du gilet, ça marche.', 'pending', 3),
    ('Louise Perrin',   'theo',   'Théo Lambert', 'Aide-soignant',  'histoire', 'A demandé « son atelier » deux fois. Un tissu à plier a suffi.', 'pending', 26)
  ) as x(resident, login, author, job, cat, body, status, hours)
  join public.carnets k on k.org_id = v_org and k.person_name = x.resident;

  alter table public.notes enable trigger notes_before_write;

  -- ─── 5. Récapitulatif ────────────────────────────────────────────────
  insert into demo_resultat values
    (1, 'Mot de passe (tous les comptes)', v_password),
    (2, 'Aidante : Anne (carnet de Jeanne)', 'anne' || v_domain),
    (3, 'Cadre de santé : Marc (Maison des Tilleuls)', 'marc' || v_domain),
    (4, 'Soignante : Sandra (Unité B, notes à valider)', 'sandra' || v_domain),
    (5, 'Famille : Sophie (carnet de sa mère Marthe)', 'sophie' || v_domain),
    (6, 'Cercle : Léo (petit-fils de Jeanne)', 'leo' || v_domain),
    (7, 'Autres soignants', 'karim, lucie, theo, ines' || v_domain),
    (8, 'Code de la mutuelle de démo (pour un nouveau compte)', 'DEMO-2026');
end
$demo$;

select quoi as "Démo prête", valeur as "Valeur" from demo_resultat order by ordre;
