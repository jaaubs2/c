// Vérifie les données de démonstration (supabase/demo/demo-jury.sql) :
// le fichier se charge, se recharge (remise à zéro), et chaque compte arrive au bon endroit.
// Prérequis : mêmes que e2e.cjs (base locale, mini-supabase.cjs, app construite sur le port 4174).
const { chromium, devices } = require('playwright');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const APP = 'http://127.0.0.1:4174/';
const SHOTS = process.argv[2]; // dossier de captures du scénario (facultatif)
const shot = async (page, name) => { if (!SHOTS) return; await page.waitForTimeout(700); await page.screenshot({ path: path.join(SHOTS, name) }); };

let passed = 0, failed = 0;
const ok = (c, l) => { if (c) { passed++; console.log('  ✔', l); } else { failed++; console.log('  ✘', l); } };
const errors = [];

// Carnets de la démo : tenus par un compte de démo, ou appartenant à l'établissement de démo.
const DEMO_USERS = `(select id from auth.users where email like '%@demo.lecarnetvivant.fr')`;
const DEMO = `(k.owner_id in ${DEMO_USERS} or k.org_id in (select id from public.organizations where created_by in ${DEMO_USERS}))`;

async function seed() {
  const db = new Client({ host: '127.0.0.1', user: 'postgres', password: 'postgres', database: 'carnet' });
  await db.connect();
  const res = await db.query(fs.readFileSync(path.join(__dirname, '../demo/demo-jury.sql'), 'utf8'));
  const rows = [].concat(res).pop().rows;
  const count = async (sql) => +(await db.query(sql)).rows[0].n;
  const counts = {
    users: await count(`select count(*) n from auth.users where email like '%@demo.lecarnetvivant.fr'`),
    orgs: await count(`select count(*) n from public.organizations where name = 'Maison des Tilleuls'`),
    carnets: await count(`select count(*) n from public.carnets k where ${DEMO}`),
    notes: await count(`select count(*) n from public.notes x join public.carnets k on k.id = x.carnet_id where ${DEMO}`),
    pending: await count(`select count(*) n from public.notes x join public.carnets k on k.id = x.carnet_id where ${DEMO} and x.status = 'pending'`),
    trigger: await count(`select count(*) n from pg_trigger where tgname = 'notes_before_write' and tgenabled = 'O'`),
  };
  await db.end();
  return { rows, counts };
}

async function login(browser, email, password) {
  const ctx = await browser.newContext({ ...devices['iPhone 14'], permissions: ['microphone'] });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${email} · ${e.message}`));
  page.setDefaultTimeout(8000);
  await page.goto(APP);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.locator('#li-email').fill(email);
  await page.locator('#li-pwd').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  return page;
}
const see = async (page, text, label) => {
  try { await page.getByText(text).first().waitFor({ timeout: 8000 }); ok(true, label); }
  catch { ok(false, label); }
};

(async () => {
  console.log('\n■ Chargement des données de démo');
  let s = await seed();
  ok(s.counts.users === 9, `9 comptes de démo (${s.counts.users})`);
  ok(s.counts.carnets === 29, `29 carnets : Jeanne + 28 résidents (${s.counts.carnets})`);
  ok(s.counts.pending === 2, '2 notes attendent le visa du cadre');
  ok(s.counts.trigger === 1, 'la règle sur les notes est bien réactivée après le chargement');
  const before = s.counts.notes;

  console.log('\n■ Rechargement (remise à zéro avant le jury)');
  s = await seed();
  ok(s.counts.users === 9 && s.counts.orgs === 1 && s.counts.carnets === 29 && s.counts.notes === before,
    'relancer le fichier recrée la démo à l\'identique, sans doublon');
  const val = (start) => (s.rows.find((r) => r['Démo prête'].startsWith(start)) || {})['Valeur'];
  const password = val('Mot de passe');
  const link = val('Lien de la fiche');
  ok(!!password && /^#fiche=[\w-]{20,}$/.test(link || ''), 'le tableau final donne le mot de passe et le lien de Claire');

  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

  console.log('\n■ Anne, aidante');
  const anne = await login(browser, 'anne@demo.lecarnetvivant.fr', password);
  await see(anne, 'Le carnet de Jeanne', 'Anne arrive dans le carnet de Jeanne');
  await see(anne, '21 notes', 'avec ses 21 notes');
  await see(anne, 'Aux côtés de Jeanne', '« Aux côtés de Jeanne »');

  console.log('\n■ Claire ouvre la fiche, sans compte');
  const claire = await (await browser.newContext({ ...devices['iPhone 14'] })).newPage();
  claire.on('pageerror', (e) => errors.push(`Claire · ${e.message}`));
  await claire.goto(APP + link);
  await claire.getByRole('button', { name: 'Passer' }).click();
  await see(claire, 'voici l\'essentiel pour tes mercredis', 'le mot d\'accueil d\'Anne s\'affiche');
  await see(claire, 'tarte aux pommes tiède', 'les choses à savoir s\'affichent');
  ok(await claire.getByText('Équilibre fragile').count() === 0, 'la rubrique Santé, non partagée, reste invisible');

  console.log('\n■ Marc, cadre de santé');
  const marc = await login(browser, 'marc@demo.lecarnetvivant.fr', password);
  await see(marc, 'Maison des Tilleuls', 'Marc arrive dans la Maison des Tilleuls');
  await see(marc, '2 notes à valider', '2 notes attendent son visa');
  await see(marc, '28 carnets', '28 résidents');

  console.log('\n■ Sandra, aide-soignante');
  const sandra = await login(browser, 'sandra@demo.lecarnetvivant.fr', password);
  await see(sandra, 'Marthe', 'Sandra voit les résidents de son unité');

  console.log('\n■ Sophie, famille');
  const sophie = await login(browser, 'sophie@demo.lecarnetvivant.fr', password);
  await see(sophie, 'Marthe', 'Sophie arrive dans le carnet de sa mère');

  console.log('\n■ Léo, petit-fils');
  const leo = await login(browser, 'leo@demo.lecarnetvivant.fr', password);
  await see(leo, 'Jeanne', 'Léo contribue au carnet de sa grand-mère');

  // ─── Répétition du scénario du jury (docs/DEMO-JURY.md), dans l'ordre ───
  console.log('\n■ Répétition du scénario du jury');
  await shot(anne, 'jury-1-accueil-anne.png');
  await anne.getByRole('button', { name: 'Ajouter une note' }).first().click();
  await anne.getByRole('button', { name: 'Dicter la note' }).click();
  await see(anne, "J'écoute", '① Anne dicte une note');
  await anne.waitForTimeout(2500);
  await anne.getByRole('button', { name: 'Terminer la dictée' }).click();
  await anne.waitForFunction(() => document.querySelector('#note-text').value.length > 5, null, { timeout: 10000 })
    .then(() => ok(true, '   le texte dicté apparaît')).catch(() => ok(false, '   le texte dicté apparaît'));
  await see(anne, "Proposée par l'IA", '   l\'IA propose la rubrique');
  await shot(anne, 'jury-2-dictee.png');
  await anne.getByRole('button', { name: /Enregistrer/ }).click();
  await see(anne, 'Rangé dans', '   la note est rangée');

  await see(anne, 'ouverte 2 fois', '② l\'accueil montre que Claire a ouvert sa fiche 2 fois');
  await anne.getByText('Fiche pour Claire').click();
  await see(anne, 'Ouverte 2 fois', '   avec son journal d\'ouverture (2 fois)');
  await shot(anne, 'jury-3-journal.png');
  await anne.getByRole('button', { name: /Nouvelle transmission/ }).click();
  await anne.getByRole('button', { name: 'Préparer la fiche' }).click();
  await anne.getByRole('button', { name: "Rédiger avec l'IA" }).click();
  await anne.getByLabel('Chose à savoir 1', { exact: true }).waitFor().then(() => ok(true, '③ l\'IA rédige la fiche')).catch(() => ok(false, '③ l\'IA rédige la fiche'));
  await shot(anne, 'jury-4-fiche-ia.png');
  await anne.getByRole('button', { name: /Créer le lien de partage/ }).click();
  await anne.locator('#to-name').fill('Nadia');
  await anne.getByRole('checkbox').click();
  await anne.getByRole('button', { name: /Créer le lien sécurisé/ }).click();
  await anne.getByText(/#fiche=/).waitFor().then(() => ok(true, '   le lien pour Nadia est créé')).catch(() => ok(false, '   le lien pour Nadia est créé'));
  await shot(anne, 'jury-5-lien.png');
  await anne.getByRole('button', { name: /Terminé/ }).click();

  await shot(claire, 'jury-6-fiche-claire.png');
  await claire.getByText("L'appeler « Jeanne »").first().click();
  await see(claire, 'Tout écouter', '⑤ Claire ouvre une chose à savoir : la rubrique, à écouter');
  await see(claire, 'Parler lentement, une phrase à la fois. Laisser', '   avec toutes les notes d\'Anne');

  await marc.getByText('2 notes à valider').click();
  await see(marc, 'chapelet', '⑥ Marc lit la note de Sandra');
  await shot(marc, 'jury-7-validation.png');
  await marc.getByRole('button', { name: 'Valider', exact: true }).first().click();
  await see(marc, 'Note publiée', '   et la valide');
  await sophie.reload();
  await sophie.getByText('Ce qui apaise / ce qui angoisse').first().click().catch(() => {});
  await see(sophie, 'a retrouvé son chapelet', '   Sophie voit aussitôt la note validée');
  await shot(sophie, 'jury-8-famille.png');

  await anne.locator('.tabbar').getByRole('button', { name: 'Réglages' }).click();
  await anne.getByText('Accessibilité').first().click();
  await anne.getByRole('radio', { name: /Très grand|Aa/ }).last().click();
  await anne.getByRole('button', { name: 'Retour' }).first().click();
  await anne.locator('.tabbar').getByRole('button', { name: 'Accueil' }).click();
  await see(anne, 'Le carnet de Jeanne', '⑦ très grand texte : l\'accueil reste lisible');
  await shot(anne, 'jury-9-grand-texte.png');

  await browser.close();
  console.log(`\n${passed} vérifications réussies, ${failed} en échec.`);
  console.log('Erreurs JavaScript :', errors.length ? '\n - ' + errors.join('\n - ') : 'aucune');
  process.exit(failed || errors.length ? 1 : 0);
})().catch((e) => { console.error('\nARRÊT :', e.message.split('\n')[0]); process.exit(1); });
