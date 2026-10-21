// Parcourt les écrans de démo avec tous les réglages d'accessibilité (très grand texte, contraste, dyslexie)
// et signale tout ce qui dépasse de l'écran sur les côtés. Usage : node tests/debordement-demo.cjs [url]
const { chromium, devices } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'http://127.0.0.1:4175/?demo';
const DEPTH = +(process.argv[3] || 2);
const CLICKABLE = '.phone button:visible, .phone [role=button]:visible, .phone a[href]:visible, .phone [role=tab]:visible';
const results = {};
const seen = new Set();
let screens = 0, errors = [];

async function sig(page) {
  return page.evaluate(() => {
    const p = document.querySelector('.phone'); if (!p) return 'none';
    const heads = [...p.querySelectorAll('h1,h2,h3,[role=dialog] h2,.kicker')].slice(0, 6).map(h => h.textContent.trim().slice(0, 30)).join('|');
    return heads + '#' + p.querySelectorAll('button').length + '#' + (p.querySelector('[role=dialog]') ? 'dlg' : '');
  });
}
const PREFS = JSON.stringify({ textSize: 'xlarge', highContrast: true, reduceMotion: true, dyslexia: true });
async function audit(page, label) {
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth, out = [];
    const phone = document.querySelector('.phone'); if (!phone) return { sw: 0, items: [] };
    for (const el of phone.querySelectorAll('*')) {
      if (el.closest('[aria-hidden="true"]') || el.offsetParent === null) continue;
      if (getComputedStyle(el).position === 'absolute' && el.clientWidth <= 1) continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      // Dépasse à droite de l'écran, sans être dans une zone qui défile horizontalement exprès.
      let p = el.parentElement, scrollX = false;
      while (p && p !== phone) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth + 1 && !p.classList.contains('scroll')) { scrollX = true; break; } p = p.parentElement; }
      if (scrollX) continue;
      if (b.right > W + 2 || b.left < -2) out.push((el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()) + ' «' + (el.textContent || '').trim().slice(0, 30) + '» ' + Math.round(b.left) + '→' + Math.round(b.right));
    }
    const sc = [...phone.querySelectorAll('.scroll')].map(s => s.scrollWidth - s.clientWidth).filter(x => x > 1);
    return { sw: Math.max(0, ...sc), items: out.slice(0, 6) };
  });
  screens++;
  if (r.items.length || r.sw) { results[label] = r; }
}
async function names(page) {
  return page.evaluate((sel) => [...document.querySelectorAll(sel.replace(/:visible/g, ''))]
    .filter(el => el.offsetParent !== null && !el.closest('.demo-pill') && !el.closest('.tabbar'))
    .map(el => (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)), CLICKABLE);
}
async function replay(page, space, tab, path) {
  await page.evaluate((p) => { try { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('lcv-a11y', p); } catch {} }, PREFS);
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForSelector('.phone');
  await page.locator('.demo-pill button', { hasText: space }).click();
  await page.waitForTimeout(200);
  if (tab >= 0) { await page.locator('.tabbar .tab, .tabbar button').nth(tab).click(); await page.waitForTimeout(250); }
  for (const i of path) {
    const loc = page.locator(CLICKABLE).filter({ hasNot: page.locator('xx') });
    const all = await page.$$(CLICKABLE.split(', ').map(s => s.replace(':visible', '')).join(', '));
    const vis = [];
    for (const el of all) if (await el.evaluate(e => e.offsetParent !== null && !e.closest('.demo-pill') && !e.closest('.tabbar'))) vis.push(el);
    if (!vis[i]) return false;
    await vis[i].click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(300);
  }
  return true;
}
async function explore(page, space, tab, path, label) {
  const s = await sig(page);
  if (seen.has(s)) return;
  seen.add(s);
  await audit(page, label);
  if (path.length >= DEPTH) return;
  const list = await names(page);
  for (let i = 0; i < list.length; i++) {
    if (/supprimer|déconnect|se déconnecter|révoquer|quitter/i.test(list[i])) continue;
    if (!(await replay(page, space, tab, [...path, i]))) continue;
    await explore(page, space, tab, [...path, i], `${label} › ${list[i]}`);
  }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'load' });
  for (const space of ['Aidant', 'Proche', 'Équipe']) {
    await replay(page, space, -1, []);
    const tabs = await page.locator('.tabbar .tab, .tabbar button').count();
    for (let t = 0; t < tabs; t++) {
      await replay(page, space, t, []);
      const tname = (await page.locator('.tabbar .tab, .tabbar button').nth(t).innerText().catch(() => '' + t)).trim();
      await explore(page, space, t, [], `${space} › ${tname}`);
    }
  }
  await browser.close();
  const keys = Object.keys(results);
  console.log(screens + ' écrans parcourus, ' + keys.length + ' avec un débordement');
  const byItem = {};
  for (const k of keys) for (const it of results[k].items) (byItem[it.replace(/ -?\d+→\d+$/, '')] ||= []).push(k);
  for (const [it, ks] of Object.entries(byItem).sort((a, b) => b[1].length - a[1].length)) console.log('- ' + it + '  (' + ks.length + ' écrans, ex. ' + ks[0] + ')');
  for (const k of keys) if (results[k].sw) console.log('  défilement horizontal ' + results[k].sw + 'px : ' + k);
  process.exit(keys.length || errors.length ? 1 : 0);
})();
