// Scénario de bout en bout, joué dans un vrai navigateur (format iPhone) :
// Anne (aidante), Claire (relais sans compte), Marc (cadre), Sandra (soignante), Sophie (famille).
const { chromium, devices } = require('playwright');
const path = require('path');
const APP = 'http://127.0.0.1:4174/';
const API = 'http://127.0.0.1:54321';
const SHOTS = process.argv[2];

let passed = 0, failed = 0;
const ok = (c, l) => { if (c) { passed++; console.log('  ✔', l); } else { failed++; console.log('  ✘', l); } };
const code = async (email) => (await (await fetch(`${API}/test/code?email=${encodeURIComponent(email)}`)).json())?.code;
const errors = [];

async function newPage(browser, who) {
  const ctx = await browser.newContext({ ...devices['iPhone 14'], acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${who} · ${e.message}`));
  page.setDefaultTimeout(8000);
  return page;
}
const shot = async (page, name) => { await page.waitForTimeout(700); await page.screenshot({ path: path.join(SHOTS, name) }); };
const see = async (page, text, label) => {
  try { await page.getByText(text).first().waitFor({ timeout: 8000 }); ok(true, label); }
  catch { ok(false, label); }
};
const absent = async (page, text, label) => ok(await page.getByText(text).count() === 0, label);

async function signup(page, { role, name, email }) {
  await page.getByText(role, { exact: true }).click();
  await page.locator('#su-name').fill(name);
  await page.locator('#su-email').fill(email);
  await page.locator('#su-pwd').fill('motdepasse123');
  await page.getByRole('checkbox').nth(0).click();
  await page.getByRole('checkbox').nth(1).click();
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await page.getByLabel('Chiffre 1').waitFor();
  const c = await code(email);
  for (let i = 0; i < 6; i++) await page.getByLabel(`Chiffre ${i + 1}`).fill(c[i]);
}
async function writeNote(page, text, buttonName = /Enregistrer/) {
  await page.locator('#note-text').fill(text);
  await page.getByRole('button', { name: buttonName }).click();
}

(async () => {
  const browser = await chromium.launch();

  console.log('\n■ Anne crée son compte et le carnet de Paul');
  const anne = await newPage(browser, 'Anne');
  await anne.goto(APP);
  await anne.getByRole('button', { name: 'Créer mon carnet' }).click();
  await signup(anne, { role: 'Un·e aidant·e', name: 'Anne', email: 'anne@e2e.fr' });
  await anne.getByRole('button', { name: 'Essayer 14 jours gratuitement' }).click();
  await anne.getByRole('button', { name: 'Commencer' }).click();
  await anne.getByRole('button', { name: 'Continuer' }).click();
  await anne.locator('#op-name').fill('Paul');
  await anne.getByRole('radio', { name: 'Il', exact: true }).click();
  await anne.locator('#op-age').fill('84');
  await anne.locator('#op-since').fill('3 ans');
  await anne.getByRole('button', { name: 'Continuer' }).click();
  await anne.getByText('Il a donné son accord').click();
  await anne.getByRole('button', { name: 'Continuer' }).click();
  await anne.getByRole('button', { name: 'Entrer dans le carnet' }).click();
  await see(anne, 'Le carnet de Paul', 'l\'accueil affiche « Le carnet de Paul »');
  await see(anne, 'Aux côtés de Paul', 'et « Aux côtés de Paul » sous le prénom d\'Anne');
  await absent(anne, 'Jeanne', 'aucune trace de Jeanne (données de démo)');
  await shot(anne, '1-aidant-accueil.png');

  console.log('\n■ Anne écrit trois notes');
  await anne.getByRole('button', { name: 'Ajouter une note' }).first().click();
  await anne.locator('#note-text').fill('Le matin, il aime son café noir, sans sucre.');
  await see(anne, 'Habitudes et routines', 'la rubrique « Habitudes » est proposée automatiquement');
  await shot(anne, '2-aidant-note.png');
  await anne.getByRole('button', { name: /Enregistrer/ }).click();
  await see(anne, 'Rangé dans « Habitudes et routines »', 'la note est enregistrée');
  await anne.getByRole('button', { name: 'Ajouter une note' }).first().click();
  await writeNote(anne, 'Parler lentement, l\'appeler Paul, jamais « Monsieur ».');
  await see(anne, 'Rangé dans « Comment lui parler »', 'deuxième note rangée dans « Comment lui parler »');
  await anne.getByRole('button', { name: 'Ajouter une note' }).first().click();
  await anne.locator('#note-text').fill('Appareil auditif à l\'oreille gauche.');
  await anne.getByRole('button', { name: /Rubrique/ }).click();
  await anne.locator('.chip', { hasText: 'Santé et vigilance' }).click();
  await anne.getByRole('button', { name: /Enregistrer/ }).click();
  await see(anne, 'Rangé dans « Santé et vigilance »', 'troisième note, rubrique choisie à la main');
  await anne.reload();
  await see(anne, 'Le carnet de Paul', 'après rechargement, Anne est toujours connectée');
  await see(anne, '3 notes', 'et ses 3 notes sont bien enregistrées sur le serveur');

  console.log('\n■ Anne crée un lien pour Claire');
  await anne.getByText('Transmettre à un relais').click();
  await anne.getByRole('button', { name: /Nouvelle transmission/ }).click();
  await anne.getByRole('button', { name: 'Préparer la fiche' }).click();
  await anne.getByRole('button', { name: /Créer le lien de partage/ }).click();
  await anne.locator('#to-name').fill('Claire');
  await anne.getByRole('checkbox').click();
  await anne.getByRole('button', { name: /Créer le lien sécurisé/ }).click();
  const linkEl = anne.getByText(/#fiche=/);
  await linkEl.waitFor();
  const shareUrl = (await linkEl.innerText()).trim();
  ok(/#fiche=[A-Za-z0-9_-]{30,}/.test(shareUrl), 'un vrai lien sécurisé est créé');
  await shot(anne, '3-aidant-lien.png');
  await anne.getByRole('button', { name: /Terminé/ }).click();
  await see(anne, 'Pas encore ouverte', 'la fiche apparaît « Pas encore ouverte »');

  console.log('\n■ Claire ouvre le lien, sans compte');
  const claire = await newPage(browser, 'Claire');
  await claire.goto(shareUrl);
  await claire.getByRole('button', { name: 'Passer' }).click();
  await see(claire, 'Paul', 'Claire voit la fiche de Paul');
  await see(claire, 'Parler lentement', 'avec ce qui a été partagé');
  await absent(claire, 'Appareil auditif', 'mais pas la santé (non incluse pour un proche)');
  await absent(claire, 'Roger', 'et aucun carnet de démonstration');
  await shot(claire, '4-relais-fiche.png');

  console.log('\n■ Anne voit l\'ouverture, puis désactive le lien');
  await anne.reload();
  await anne.getByText('Fiche pour Claire').click();
  await see(anne, 'Ouverte 1 fois', 'le journal d\'accès indique 1 ouverture');
  await anne.getByRole('button', { name: 'Désactiver le lien' }).click();
  await anne.getByRole('button', { name: 'Oui, désactiver' }).click();
  await see(anne, 'Désactivée', 'le lien est désactivé');
  await claire.goto('about:blank'); await claire.goto(shareUrl);
  await see(claire, 'Ce lien a été désactivé.', 'Claire ne peut plus ouvrir la fiche');

  console.log('\n■ Confidentialité et consentements');
  await anne.locator('.tabbar').getByRole('button', { name: 'Réglages' }).click();
  await anne.getByText('Confidentialité & données').click();
  await see(anne, 'Accord de la personne accompagnée', 'l\'accord de Paul est listé');
  await see(anne, 'Conditions et politique de confidentialité', 'les conditions acceptées aussi, avec leur date');
  const [download] = await Promise.all([anne.waitForEvent('download'), anne.getByRole('button', { name: 'Exporter toutes mes données' }).click()]);
  const exported = JSON.parse(require('fs').readFileSync(await download.path(), 'utf8'));
  ok(exported.carnets[0].notes.length === 3 && exported.consentements.length === 3, 'l\'export contient le carnet, les 3 notes et les consentements');
  await shot(anne, '5-aidant-confidentialite.png');

  console.log('\n■ Marc crée son établissement');
  const marc = await newPage(browser, 'Marc');
  await marc.goto(APP);
  await marc.getByRole('button', { name: 'Créer mon carnet' }).click();
  await signup(marc, { role: 'Un établissement ou un service', name: 'Marc Aubry', email: 'marc@e2e.fr' });
  await marc.getByLabel("Nom de l'établissement").fill('Résidence Les Lilas');
  await marc.getByRole('button', { name: 'Continuer' }).click();
  await marc.getByRole('button', { name: 'Continuer' }).click();
  await marc.getByRole('button', { name: 'Créer Résidence Les Lilas' }).click();
  await see(marc, 'Cadre de santé · Résidence Les Lilas', 'Marc arrive dans son établissement');
  await absent(marc, 'Tilleuls', 'aucune trace de l\'établissement de démonstration');

  console.log('\n■ Marc ouvre le carnet de Marthe et invite sa fille');
  await marc.getByRole('button', { name: 'Nouveau résident' }).click();
  await marc.getByPlaceholder('Ex. Germaine Roux').fill('Marthe Delcourt');
  await marc.getByPlaceholder('88').fill('91');
  await marc.getByPlaceholder('Ch. 33').fill('Ch. 12');
  await marc.getByRole('button', { name: 'Unité B', exact: true }).click();
  await marc.getByPlaceholder('Prénom, lien (fille, époux…)').fill('Sophie, sa fille');
  await marc.getByRole('button', { name: /Ouvrir le carnet et inviter Sophie/ }).click();
  const invEl = marc.getByText(/#invitation=/); await invEl.waitFor();
  const inviteUrl = (await invEl.innerText()).trim();
  ok(/#invitation=/.test(inviteUrl), 'un lien d\'invitation pour Sophie est créé');
  await marc.getByRole('button', { name: /Ouvrir le carnet/ }).click();
  await see(marc, 'Marthe Delcourt', 'le carnet de Marthe est ouvert');

  console.log('\n■ Marc ajoute Sandra à l\'équipe');
  await marc.getByRole('button', { name: 'Retour' }).click();
  await marc.locator('.tabbar').getByRole('button', { name: 'Équipe' }).click();
  await marc.getByText('Ajouter un·e soignant·e').click();
  await marc.getByPlaceholder('Ex. Lucie Faure').fill('Sandra Meyer');
  await marc.getByRole('button', { name: 'Unité B', exact: true }).click();
  await marc.getByRole('button', { name: 'Générer son code' }).click();
  const codeEl = marc.getByLabel(/^Code \d/); await codeEl.waitFor();
  const staffCode = (await marc.locator('p[aria-label^="Code"]').innerText()).trim();
  ok(/^\d{6}$/.test(staffCode), `un code d'entrée à 6 chiffres est créé (${staffCode})`);
  await marc.getByRole('button', { name: /Terminé/ }).click();
  await see(marc, 'Codes en attente', 'le code apparaît « en attente »');

  console.log('\n■ Sandra entre dans l\'équipe et écrit une note');
  const sandra = await newPage(browser, 'Sandra');
  await sandra.goto(APP);
  await sandra.getByRole('button', { name: 'Créer mon carnet' }).click();
  await signup(sandra, { role: 'Un·e soignant·e', name: 'Sandra', email: 'sandra@e2e.fr' });
  for (const d of staffCode) await sandra.getByRole('button', { name: d, exact: true }).click();
  await sandra.getByRole('button', { name: 'Continuer' }).click();
  await see(sandra, 'Sandra Meyer', 'Sandra se reconnaît : nom prévu par Marc');
  await see(sandra, 'Résidence Les Lilas', 'dans le bon établissement');
  await sandra.getByRole('button', { name: "C'est parti" }).click();
  await see(sandra, 'Mes résidents', 'elle arrive sur ses résidents');
  await sandra.getByRole('button', { name: /Ouvrir le carnet de Marthe/ }).click();
  await sandra.getByRole('button', { name: /Première note vocale|Ajouter une note vocale/ }).click();
  await writeNote(sandra, 'Le chapelet dans la poche gauche de son gilet la calme.', /Envoyer au cadre/);
  await see(sandra, 'Envoyée à Marc pour validation.', 'la note part en attente du visa de Marc');
  await shot(sandra, '6-soignante.png');

  console.log('\n■ Marc valide la note');
  await marc.reload();
  await see(marc, '1 note à valider', 'Marc voit 1 note à valider');
  await marc.getByText('1 note à valider').click();
  await shot(marc, '7-cadre-validation.png');
  await marc.getByRole('button', { name: 'Valider', exact: true }).click();
  await see(marc, 'Note publiée', 'la note est publiée');

  console.log('\n■ Sophie rejoint le carnet de sa mère');
  const sophie = await newPage(browser, 'Sophie');
  await sophie.goto(inviteUrl);
  await see(sophie, 'Le carnet de Marthe', 'Sophie voit l\'invitation au carnet de Marthe');
  await sophie.getByRole('button', { name: 'Créer mon compte' }).click();
  await sophie.locator('#su-name').fill('Sophie');
  await sophie.locator('#su-email').fill('sophie@e2e.fr');
  await sophie.locator('#su-pwd').fill('motdepasse123');
  await sophie.getByRole('checkbox').nth(0).click();
  await sophie.getByRole('checkbox').nth(1).click();
  await sophie.getByRole('button', { name: 'Créer mon compte' }).click();
  await sophie.getByLabel('Chiffre 1').waitFor();
  const sc = await code('sophie@e2e.fr');
  for (let i = 0; i < 6; i++) await sophie.getByLabel(`Chiffre ${i + 1}`).fill(sc[i]);
  await see(sophie, 'Le carnet de Marthe', 'Sophie arrive dans le carnet de sa mère');
  await sophie.getByText('Ce qui apaise / ce qui angoisse').first().click().catch(() => {});
  await see(sophie, 'chapelet', 'elle lit la note validée de l\'équipe');
  await see(sophie, 'par Sandra Meyer (Aide-soignante)', 'la note est signée par Sandra');
  ok(await sophie.getByRole('button', { name: 'Modifier' }).count() === 0, 'Sophie ne peut pas modifier la note de Sandra');
  await shot(sophie, '8-famille.png');

  console.log('\n■ Anne supprime son compte');
  await anne.getByRole('button', { name: 'Retour' }).click();
  await anne.getByText('Mon compte').click();
  await anne.getByRole('button', { name: 'Supprimer mon compte' }).click();
  await anne.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await see(anne, 'Créer mon carnet', 'Anne revient à l\'écran d\'accueil');
  await claire.goto('about:blank'); await claire.goto(shareUrl);
  await see(claire, 'Ce lien ne fonctionne pas.', 'le lien de Claire ne mène plus à rien');

  console.log(`\n${passed} vérifications réussies, ${failed} en échec.`);
  console.log('Erreurs JavaScript :', errors.length ? '\n - ' + errors.join('\n - ') : 'aucune');
  await browser.close();
  process.exit(failed || errors.length ? 1 : 0);
})().catch(e => { console.error('\nARRÊT :', e.message.split('\n')[0]); console.log(`${passed} réussies, ${failed} en échec avant l'arrêt.`); process.exit(1); });
