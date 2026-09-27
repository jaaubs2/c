// Clavier, focus visible, très grand texte, contraste renforcé (mode démo).
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || require('os').tmpdir() + '/captures-clavier';
const URL = 'http://127.0.0.1:4175/?demo';
require('fs').mkdirSync(OUT, { recursive: true });
let ok = 0, ko = 0; const check = (c, l) => { c ? ok++ : ko++; console.log(c ? '  ✔' : '  ✘', l); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 14'], hasTouch: false, isMobile: false });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL); await page.waitForSelector('.phone'); await page.waitForTimeout(500);

  console.log('\n■ Clavier');
  const seen = [], noRing = [];
  for (let i = 0; i < 70; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement; if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || /rgb/.test(cs.boxShadow) && cs.boxShadow !== 'none';
      return { name: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40), ring, inPhone: !!el.closest('.phone') };
    });
    if (!f) continue;
    seen.push(f.name); if (!f.ring) noRing.push(f.name);
  }
  check(seen.length > 20, `Tab parcourt l'écran (${new Set(seen).size} éléments atteints)`);
  check(noRing.length === 0, `focus visible sur chaque élément${noRing.length ? ' — manquant : ' + [...new Set(noRing)].slice(0, 8).join(' | ') : ''}`);

  // Ouvrir Réglages au clavier puis revenir avec Échap
  await page.goto(URL); await page.waitForSelector('.phone');
  const tabs = page.locator('.tabbar .tab');
  const n = await tabs.count();
  await tabs.nth(n - 1).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const title1 = await page.evaluate(() => document.activeElement && document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0, 30));
  check(/^H[12]/.test(title1 || ''), `changer d'onglet place le focus sur le titre (${title1})`);
  const entry = page.locator('.phone .scroll button').filter({ hasText: 'Accessibilité' }).first();
  if (await entry.count()) {
    await entry.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    const t = await page.evaluate(() => document.activeElement.textContent.trim());
    check(t === 'Accessibilité', `ouvrir une page au clavier : le focus va sur son titre (« ${t} »)`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    check(!(await page.locator('.topbar h1', { hasText: 'Accessibilité' }).count()), 'Échap ramène à la page précédente');
  } else check(false, 'entrée « Accessibilité » introuvable');

  console.log('\n■ Très grand texte et contraste renforcé');
  await page.evaluate(() => localStorage.setItem('lcv-a11y', JSON.stringify({ textSize: 'xlarge', highContrast: true })));
  await page.goto(URL); await page.waitForSelector('.phone'); await page.waitForTimeout(600);
  check(await page.evaluate(() => document.querySelector('.phone').dataset.text === 'xlarge'), 'la préférence est appliquée dès l\'ouverture de l\'app');
  const overflow = async (label) => {
    const o = await page.evaluate(() => [...document.querySelectorAll('.phone .scroll')].filter(s => s.offsetParent).map(s => s.scrollWidth - s.clientWidth).reduce((a, b) => Math.max(a, b), 0));
    check(o <= 4, `${label} : pas de défilement horizontal (${o}px, arrondi toléré ≤ 4)`);
  };
  const shots = [];
  for (const space of ['Aidant', 'Proche', 'Équipe']) {
    await page.locator('.demo-pill button', { hasText: space }).click(); await page.waitForSelector('.tabbar .tab', { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(500); console.log('  ·', space, await page.locator('.tabbar .tab').count(), 'onglets');
    const c = await page.locator('.tabbar .tab').count();
    for (let t = 0; t < c; t++) {
      await page.locator('.tabbar .tab').nth(t).click(); await page.waitForTimeout(450);
      await overflow(`${space} onglet ${t + 1}`);
      if (t < 2) { const f = `${OUT}/xl-${space}-${t + 1}.png`; await page.locator('.phone').screenshot({ path: f }); shots.push(f); }
    }
  }
  check(errs.length === 0, 'aucune erreur JavaScript' + (errs.length ? ' : ' + errs[0] : ''));
  await browser.close();
  console.log(`\n${ok} vérifications réussies, ${ko} en échec.`);
  process.exit(ko ? 1 : 0);
})();
