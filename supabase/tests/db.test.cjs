// Tests de la base : chaque scénario appelle les mêmes fonctions que l'app,
// avec les droits de la personne concernée (rôle « authenticated » ou « anon »).
const { Client } = require('pg');

const db = new Client({ host: '127.0.0.1', user: 'postgres', password: 'postgres', database: 'carnet' });
let passed = 0, failed = 0;
const ok = (cond, label) => { if (cond) { passed++; console.log('  ✔', label); } else { failed++; console.log('  ✘', label); } };

async function asUser(user, sql, params = []) {
  await db.query('begin');
  try {
    await db.query(`set local role ${user ? 'authenticated' : 'anon'}`);
    await db.query(`select set_config('request.jwt.claims', $1, true)`,
      [user ? JSON.stringify({ sub: user.id, email: user.email, role: 'authenticated' }) : JSON.stringify({ role: 'anon' })]);
    const r = await db.query(sql, params);
    await db.query('commit');
    return r;
  } catch (e) { await db.query('rollback'); throw e; }
}
// Appel d'une fonction d'API avec des arguments nommés, comme le fait l'app.
async function rpc(user, fn, args = {}) {
  const keys = Object.keys(args);
  const sql = `select public.${fn}(${keys.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`;
  const r = await asUser(user, sql, keys.map(k => args[k]));
  return r.rows[0].r;
}
async function fails(p, label) { try { await p; ok(false, label + ' (aurait dû être refusé)'); } catch (e) { ok(true, `${label} → refusé : ${e.message}`); } }

async function mkUser(name, email) {
  const r = await db.query(
    `insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id, email`,
    [email, { display_name: name, consents: ['terms', 'sensitive_data'] }]);
  return r.rows[0];
}

(async () => {
  await db.connect();
  const anne = await mkUser('Anne', 'anne@test.fr');
  const leo = await mkUser('Léo', 'leo@test.fr');
  const mallory = await mkUser('Mallory', 'mallory@test.fr');

  console.log('\n■ Inscription et consentements');
  const boot = await rpc(anne, 'app_bootstrap');
  ok(boot.profile.display_name === 'Anne', 'le profil est créé avec le prénom');
  const consents = await asUser(anne, 'select kind from public.consents order by kind');
  ok(consents.rows.map(r => r.kind).join() === 'sensitive_data,terms', 'les 2 consentements du formulaire sont enregistrés');

  console.log('\n■ Carnet et notes de l\'aidante');
  const carnet = await rpc(anne, 'carnet_create', { p_person_name: 'Jeanne', p_person_age: 86, p_since: '2 ans', p_relation: 'fille', p_person_consent: 'accord' });
  ok(carnet.my_role === 'owner', 'Anne crée le carnet de Jeanne et en est propriétaire');
  const pc = await asUser(anne, `select value from public.consents where kind = 'person_consent'`);
  ok(pc.rows[0]?.value === 'accord', 'l\'accord de Jeanne est enregistré');
  const n1 = await rpc(anne, 'note_add', { p_carnet: carnet.id, p_category: 'habitudes', p_body: 'Café au lait tiède, deux sucres.' });
  const n2 = await rpc(anne, 'note_add', { p_carnet: carnet.id, p_category: 'apaise', p_body: 'Tenir sa main droite la rassure.' });
  const n3 = await rpc(anne, 'note_add', { p_carnet: carnet.id, p_category: 'sante', p_body: 'Appareil auditif gauche.' });
  ok(n1.status === 'published' && n1.author_name === 'Anne', 'une note est publiée et signée « Anne »');
  ok((await rpc(anne, 'notes_list', { p_carnet: carnet.id })).length === 3, 'Anne voit ses 3 notes');
  await fails(rpc(anne, 'note_add', { p_carnet: carnet.id, p_category: 'diagnostic', p_body: 'x' }), 'une rubrique inconnue (ex. médicale)');

  console.log('\n■ Une inconnue ne voit rien');
  ok((await rpc(mallory, 'notes_list', { p_carnet: carnet.id })).length === 0, 'Mallory ne voit aucune note de Jeanne');
  ok((await asUser(mallory, 'select * from public.notes')).rowCount === 0, 'même en lisant la table directement');
  ok((await rpc(mallory, 'app_bootstrap')).carnets.length === 0, 'aucun carnet dans son espace');
  await fails(rpc(mallory, 'note_add', { p_carnet: carnet.id, p_category: 'gouts', p_body: 'intrusion' }), 'Mallory écrit dans le carnet');
  await fails(rpc(mallory, 'carnet_update', { p_carnet: carnet.id, p_person_name: 'X', p_person_age: 1, p_since: '' }), 'Mallory modifie le carnet');
  await fails(rpc(mallory, 'create_share', { p_carnet: carnet.id, p_recipient_type: 'proche', p_recipient_name: 'M', p_categories: ['habitudes'] }), 'Mallory crée un lien de partage');
  await fails(rpc(mallory, 'note_delete', { p_note: n1.id }), 'Mallory supprime une note');

  console.log('\n■ Partage par lien sécurisé');
  const share = await rpc(anne, 'create_share', { p_carnet: carnet.id, p_recipient_type: 'proche', p_recipient_name: 'Claire', p_categories: ['habitudes', 'apaise'], p_expires_in_days: 7 });
  ok(share.token && share.token.length >= 30, 'un jeton long et aléatoire est renvoyé une seule fois');
  const stored = await db.query('select token_hash from public.shares where id = $1', [share.id]);
  ok(stored.rows[0].token_hash !== share.token, 'le jeton n\'est pas stocké en clair (seulement son hash)');
  const fiche = await rpc(null, 'open_share', { p_token: share.token });
  ok(fiche.status === 'ok' && fiche.person.name === 'Jeanne' && fiche.from_name === 'Anne', 'Claire, sans compte, ouvre la fiche de Jeanne partagée par Anne');
  ok(fiche.notes.length === 2 && fiche.notes.every(n => ['habitudes', 'apaise'].includes(n.category)), 'elle ne reçoit que les 2 rubriques choisies (pas la santé)');
  ok((await rpc(null, 'open_share', { p_token: 'x'.repeat(32) })).status === 'invalid', 'un faux lien est refusé');
  await fails(asUser(null, 'select * from public.notes'), 'un visiteur lit la table des notes');
  const shares = await rpc(anne, 'list_shares', { p_carnet: carnet.id });
  ok(shares[0].open_count === 1, 'le journal d\'accès compte 1 ouverture');
  await rpc(anne, 'note_archive', { p_note: n2.id });
  ok((await rpc(null, 'open_share', { p_token: share.token })).notes.length === 1, 'une note archivée n\'est plus transmise');
  await rpc(anne, 'revoke_share', { p_share: share.id });
  const rev = await rpc(null, 'open_share', { p_token: share.token });
  ok(rev.status === 'revoked' && rev.from_name === 'Anne' && !rev.notes, 'après révocation, le lien ne donne plus rien');
  const s2 = await rpc(anne, 'create_share', { p_carnet: carnet.id, p_recipient_type: 'pro', p_recipient_name: 'Sandra', p_categories: ['habitudes'], p_expires_in_days: 1 });
  await db.query(`update public.shares set expires_at = now() - interval '1 minute' where id = $1`, [s2.id]);
  ok((await rpc(null, 'open_share', { p_token: s2.token })).status === 'expired', 'un lien expiré est refusé');
  await fails(rpc(anne, 'create_share', { p_carnet: carnet.id, p_recipient_type: 'proche', p_recipient_name: '', p_categories: ['habitudes'], p_expires_in_days: 365 }), 'un lien de plus de 90 jours');
  await fails(asUser(anne, `update public.shares set expires_at = now() + interval '10 years' where id = '${s2.id}'`), 'Anne prolonge un lien à la main (seule la révocation est permise)');

  console.log('\n■ Cercle d\'aidants (invitation par lien)');
  const inv = await rpc(anne, 'carnet_invite_create', { p_carnet: carnet.id, p_invited_name: 'Léo', p_relation: 'son petit-fils' });
  ok((await rpc(null, 'carnet_invite_preview', { p_token: inv.token })).person_first_name === 'Jeanne', 'l\'aperçu d\'invitation montre seulement le prénom');
  ok((await rpc(leo, 'carnet_invite_accept', { p_token: inv.token })).status === 'ok', 'Léo accepte l\'invitation');
  ok((await rpc(mallory, 'carnet_invite_accept', { p_token: inv.token })).status === 'used', 'le même lien ne marche pas une 2e fois');
  ok((await rpc(leo, 'notes_list', { p_carnet: carnet.id })).length === 3, 'Léo voit les notes de Jeanne');
  const nl = await rpc(leo, 'note_add', { p_carnet: carnet.id, p_category: 'proches', p_body: 'J\'appelle mamie le dimanche.' });
  ok(nl.author_name === 'Léo' && nl.author_role === 'son petit-fils', 'la note de Léo est signée « Léo · son petit-fils »');
  await fails(rpc(leo, 'note_update', { p_note: n1.id, p_body: 'modifié par Léo' }), 'Léo modifie la note d\'Anne');
  await fails(rpc(leo, 'create_share', { p_carnet: carnet.id, p_recipient_type: 'proche', p_recipient_name: 'x', p_categories: ['habitudes'] }), 'Léo crée un lien (réservé à Anne)');
  ok((await rpc(anne, 'note_update', { p_note: nl.id, p_body: 'J\'appelle mamie chaque dimanche.' })).body.includes('chaque'), 'Anne peut corriger une note du cercle');

  console.log('\n■ RGPD : export et suppression');
  const exp = await rpc(anne, 'export_my_data');
  ok(exp.carnets.length === 1 && exp.carnets[0].notes.length === 4 && exp.consentements.length === 3, 'l\'export contient carnet, notes et consentements');
  ok(!JSON.stringify(exp).includes('token_hash'), 'l\'export ne contient pas les hash des liens');
  await rpc(anne, 'delete_my_account');
  ok((await db.query('select count(*)::int c from public.carnets')).rows[0].c === 0, 'le carnet de Jeanne est supprimé avec le compte d\'Anne');
  ok((await db.query('select count(*)::int c from public.notes')).rows[0].c === 0, 'toutes les notes aussi');
  ok((await db.query('select count(*)::int c from public.shares')).rows[0].c === 0, 'et les liens de partage');
  ok((await rpc(leo, 'app_bootstrap')).carnets.length === 0, 'Léo n\'y a plus accès');

  console.log('\n■ Établissement : création');
  const marc = await mkUser('Marc Aubry', 'marc@ehpad.fr');
  const sandra = await mkUser('', 'sandra@ehpad.fr');
  const karim = await mkUser('', 'karim@ehpad.fr');
  const lucie = await mkUser('', 'lucie@ehpad.fr');
  const sophie = await mkUser('Sophie', 'sophie@test.fr');
  const org = await rpc(marc, 'org_create', { p_name: 'Maison des Tilleuls', p_kind: 'EHPAD', p_finess: '690000001', p_city: 'Lyon', p_display_name: 'Marc Aubry', p_job_title: 'Cadre de santé', p_units: ['Unité A', 'Unité B'] });
  let snap = await rpc(marc, 'org_snapshot');
  ok(snap.org.name === 'Maison des Tilleuls' && snap.units.length === 2 && snap.me.role === 'cadre', 'Marc crée l\'établissement avec 2 unités, il en est cadre');
  const [uA, uB] = snap.units.map(u => u.id);
  await fails(rpc(marc, 'org_create', { p_name: 'Autre', p_kind: '', p_finess: null, p_city: '', p_display_name: '', p_job_title: '', p_units: ['U'] }), 'un 2e établissement pour le même compte');
  const marthe = await rpc(marc, 'resident_create', { p_name: 'Marthe Delcourt', p_age: 91, p_room: 'Ch. 12', p_unit: uB });
  const henri = await rpc(marc, 'resident_create', { p_name: 'Henri Bassa', p_age: 79, p_room: 'Ch. 4', p_unit: uA });
  ok(!!marthe.id && !!henri.id, 'Marc ouvre les carnets de Marthe (unité B) et d\'Henri (unité A)');

  console.log('\n■ Établissement : entrée des soignants par code');
  const cS = await rpc(marc, 'staff_invite_create', { p_display_name: 'Sandra Meyer', p_job_title: 'Aide-soignante', p_unit: uB, p_perm: 'validate' });
  const cK = await rpc(marc, 'staff_invite_create', { p_display_name: 'Karim Haddad', p_job_title: 'Infirmier', p_unit: uA, p_perm: 'write' });
  const cL = await rpc(marc, 'staff_invite_create', { p_display_name: 'Lucie Faure', p_job_title: 'AMP', p_unit: uB, p_perm: 'read' });
  ok(/^\d{6}$/.test(cS.code), `le code d'entrée fait 6 chiffres (${cS.code})`);
  ok((await rpc(sandra, 'staff_invite_accept', { p_code: cS.code })).status === 'ok', 'Sandra entre son code et rejoint l\'équipe');
  await rpc(karim, 'staff_invite_accept', { p_code: cK.code });
  await rpc(lucie, 'staff_invite_accept', { p_code: cL.code });
  ok((await rpc(mallory, 'staff_invite_accept', { p_code: cS.code })).status === 'invalid', 'un code déjà utilisé ne marche plus');
  for (let i = 0; i < 4; i++) await rpc(mallory, 'staff_invite_accept', { p_code: String(100000 + i) });
  await fails(rpc(mallory, 'staff_invite_accept', { p_code: '123456' }), 'au 6e essai raté, les tentatives sont bloquées');
  await fails(rpc(sandra, 'staff_invite_create', { p_display_name: 'X', p_job_title: '', p_unit: uB, p_perm: 'write' }), 'une soignante crée un code');
  snap = await rpc(sandra, 'org_snapshot');
  ok(snap.me.display_name === 'Sandra Meyer' && snap.me.perm === 'validate', 'Sandra a le nom, l\'unité et les droits prévus par Marc');

  console.log('\n■ Établissement : chacun voit son unité');
  ok(snap.residents.map(r => r.person_name).join() === 'Marthe Delcourt', 'Sandra (unité B) ne voit que Marthe');
  ok((await rpc(karim, 'org_snapshot')).residents.map(r => r.person_name).join() === 'Henri Bassa', 'Karim (unité A) ne voit qu\'Henri');
  ok((await rpc(marc, 'org_snapshot')).residents.length === 2, 'Marc, cadre, voit tous les résidents');
  await fails(rpc(karim, 'note_add', { p_carnet: marthe.id, p_category: 'gouts', p_body: 'hors unité' }), 'Karim écrit dans le carnet d\'une résidente d\'une autre unité');
  ok((await rpc(mallory, 'org_snapshot')) === null, 'une personne extérieure ne voit rien de l\'établissement');

  console.log('\n■ Établissement : notes et visa du cadre');
  const pn = await rpc(sandra, 'note_add', { p_carnet: marthe.id, p_category: 'apaise', p_body: 'Le chapelet dans la poche gauche la calme.' });
  ok(pn.status === 'pending' && pn.author_role === 'Aide-soignante', 'la note de Sandra (droit « À valider ») part en attente de visa');
  await fails(rpc(lucie, 'note_add', { p_carnet: marthe.id, p_category: 'gouts', p_body: 'x' }), 'Lucie (lecture seule) écrit une note');
  ok(!(await rpc(lucie, 'notes_list', { p_carnet: marthe.id })).some(n => n.id === pn.id), 'Lucie ne voit pas la note en attente');
  ok((await rpc(sandra, 'notes_list', { p_carnet: marthe.id })).some(n => n.id === pn.id), 'Sandra voit sa propre note en attente');
  await fails(rpc(sandra, 'note_validate', { p_note: pn.id, p_approve: true }), 'Sandra valide sa propre note');
  ok((await rpc(marc, 'note_validate', { p_note: pn.id, p_approve: true })).status === 'published', 'Marc valide : la note est publiée');
  ok((await rpc(lucie, 'notes_list', { p_carnet: marthe.id })).some(n => n.id === pn.id), 'Lucie la voit désormais');
  const kn = await rpc(karim, 'note_add', { p_carnet: henri.id, p_category: 'gouts', p_body: 'Le foot à la télé le calme.' });
  ok(kn.status === 'published', 'la note de Karim (droit « Notes ») est publiée tout de suite');
  await rpc(marc, 'member_update', { p_user: lucie.id, p_unit: uB, p_perm: 'write' });
  ok((await rpc(lucie, 'note_add', { p_carnet: marthe.id, p_category: 'gouts', p_body: 'Aime les madeleines.' })).status === 'published', 'Marc donne le droit « Notes » à Lucie, qui peut écrire');
  await fails(rpc(sandra, 'member_update', { p_user: lucie.id, p_unit: uA, p_perm: 'read' }), 'Sandra change les droits de Lucie');

  console.log('\n■ Établissement : la famille contribue');
  const fi = await rpc(marc, 'carnet_invite_create', { p_carnet: marthe.id, p_invited_name: 'Sophie', p_relation: 'sa fille' });
  ok((await rpc(null, 'carnet_invite_preview', { p_token: fi.token })).from_name === 'Maison des Tilleuls', 'l\'invitation vient de « Maison des Tilleuls »');
  await rpc(sophie, 'carnet_invite_accept', { p_token: fi.token });
  const sboot = await rpc(sophie, 'app_bootstrap');
  ok(sboot.carnets.length === 1 && sboot.carnets[0].person_name === 'Marthe Delcourt', 'Sophie retrouve le carnet de sa mère');
  const pn2 = await rpc(sandra, 'note_add', { p_carnet: marthe.id, p_category: 'habitudes', p_body: 'Se lève à 8h30.' });
  ok(!(await rpc(sophie, 'notes_list', { p_carnet: marthe.id })).some(n => n.id === pn2.id), 'Sophie ne voit pas les notes en attente de visa');
  const sn = await rpc(sophie, 'note_add', { p_carnet: marthe.id, p_category: 'histoire', p_body: 'Maman a été directrice d\'école.' });
  ok(sn.status === 'published' && sn.author_role === 'sa fille', 'la note de Sophie est publiée et signée « sa fille »');
  ok((await rpc(sandra, 'notes_list', { p_carnet: marthe.id })).some(n => n.id === sn.id), 'l\'équipe voit la note de Sophie');
  const esh = await rpc(marc, 'create_share', { p_carnet: marthe.id, p_recipient_type: 'pro', p_recipient_name: 'Remplaçante', p_categories: ['apaise', 'habitudes'] });
  const ef = await rpc(null, 'open_share', { p_token: esh.token });
  ok(ef.notes.length === 1 && ef.notes[0].id === pn.id, 'la fiche transmise par le cadre ne contient que les notes validées');

  console.log('\n■ IA : traçabilité, fiche relue, quota');
  const vn = await rpc(sophie, 'note_add', { p_carnet: marthe.id, p_category: 'gouts', p_body: 'Adore les madeleines trempées dans le thé.', p_input_mode: 'voice', p_ai_category: 'gouts' });
  ok(vn.input_mode === 'voice' && vn.ai_category === 'gouts', 'une note dictée garde la trace de la dictée et de la rubrique proposée par l\'IA');
  await fails(rpc(sophie, 'note_add', { p_carnet: marthe.id, p_category: 'gouts', p_body: 'x', p_input_mode: 'telepathie' }), 'un mode de saisie inconnu');
  const sum = { essentials: [ { category: 'apaise', text: 'Le chapelet dans la poche gauche la calme.' }, { category: 'sante', text: 'Ne doit pas apparaître.' } ] };
  const ssh = await rpc(marc, 'create_share', { p_carnet: marthe.id, p_recipient_type: 'pro', p_recipient_name: 'Remplaçante', p_categories: ['apaise'], p_ai_summary: sum });
  const sf = await rpc(null, 'open_share', { p_token: ssh.token });
  ok(sf.share.essentials.length === 1 && sf.share.essentials[0].category === 'apaise', 'la fiche ne renvoie que les « choses à savoir » des rubriques partagées');
  await fails(rpc(marc, 'create_share', { p_carnet: marthe.id, p_recipient_type: 'pro', p_recipient_name: '', p_categories: ['apaise'], p_ai_summary: { essentials: [ { category: 'diagnostic', text: 'x' } ] } }), 'un résumé avec une rubrique inconnue');
  await fails(rpc(marc, 'create_share', { p_carnet: marthe.id, p_recipient_type: 'pro', p_recipient_name: '', p_categories: ['apaise'], p_ai_summary: { essentials: [ { category: 'apaise', text: 'x'.repeat(301) } ] } }), 'un résumé trop long');
  let q; for (let i = 0; i < 3; i++) q = await rpc(sophie, 'ai_quota_hit', { p_limit: 3 });
  ok(q.calls === 3, 'le compteur d\'appels à l\'IA avance');
  await fails(rpc(sophie, 'ai_quota_hit', { p_limit: 3 }), 'au-delà de la limite du jour, l\'IA est refusée');
  await fails(rpc(null, 'ai_quota_hit', {}), 'un visiteur sans compte appelle l\'IA');
  const big = await rpc(mallory, 'ai_quota_hit', { p_limit: 100000 });
  ok(big.calls === 1, 'la limite demandée est plafonnée côté serveur (pas de quota illimité)');

  console.log('\n■ Départ d\'une soignante');
  await rpc(sandra, 'delete_my_account');
  const left = await rpc(marc, 'org_snapshot');
  ok(!left.members.some(m => m.display_name === 'Sandra Meyer'), 'Sandra ne fait plus partie de l\'équipe');
  ok(left.residents.length === 2 && left.notes.some(n => n.id === pn.id), 'les carnets et les notes restent à l\'établissement');

  console.log(`\n${passed} vérifications réussies, ${failed} en échec.`);
  await db.end();
  process.exit(failed ? 1 : 0);
})().catch(async e => { console.error('ERREUR', e); await db.end(); process.exit(1); });
