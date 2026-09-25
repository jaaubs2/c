// Parcourt les écrans de démo (clics jusqu'à 2 niveaux) et lance axe (WCAG 2.1 A/AA) sur chaque nouvel écran.
// Usage : node tests/accessibilite-demo.cjs [url] [profondeur]   (voir tests/README.md)
const { chromium, devices } = require('playwright');
const fs = require('fs');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
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
async function audit(page, label) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: AXE });
  const r = await page.evaluate(async () => {
    const res = await axe.run(document.querySelector('.phone') || document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
    return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ t: n.target.join(' '), h: n.html.slice(0, 180), s: (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 220) })) }));
  });
  screens++;
  for (const v of r) {
    const e = results[v.id] ||= { impact: v.impact, help: v.help, screens: new Set(), nodes: new Map() };
    e.screens.add(label);
    for (const n of v.nodes) { const k = n.h.replace(/\d+/g, '#'); if (!e.nodes.has(k)) e.nodes.set(k, { ...n, screen: label }); }
  }
}
async function names(page) {
  return page.evaluate((sel) => [...document.querySelectorAll(sel.replace(/:visible/g, ''))]
    .filter(el => el.offsetParent !== null && !el.closest('.demo-pill') && !el.closest('.tabbar'))
    .map(el => (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)), CLICKABLE);
}
async function replay(page, space, tab, path) {
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
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
  const out = Object.entries(results).sort((a, b) => b[1].nodes.size - a[1].nodes.size).map(([id, e]) => ({
    id, impact: e.impact, help: e.help, count: e.nodes.size, screens: [...e.screens], examples: [...e.nodes.values()],
  }));
  fs.writeFileSync(require('os').tmpdir() + '/accessibilite-demo.json', JSON.stringify(out, null, 1));
  console.log(`${screens} écrans audités, erreurs JS : ${errors.length ? [...new Set(errors)].join(' / ') : 'aucune'}`);
  for (const o of out) console.log(`- ${o.id} [${o.impact}] ×${o.count} (${o.screens.length} écrans) — ${o.help}`);
  console.log(out.length ? `${out.length} type(s) de défaut : détails dans ${require('os').tmpdir()}/accessibilite-demo.json` : 'Aucun défaut détecté.');
  process.exit(out.length || errors.length ? 1 : 0);
})();
