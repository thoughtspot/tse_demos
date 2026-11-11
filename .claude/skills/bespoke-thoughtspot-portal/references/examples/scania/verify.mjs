const { chromium } = await import(process.env.HOME + '/.claude/skills/ts-object-answer-chart-builder/helpers/node_modules/playwright-core/index.mjs');
const OUT = process.env.HOME + '/bespoke-portals/scania/shots/';
const URL = 'http://localhost:5189/';
const b = await chromium.launch();
const errs = [], res = {};
async function page(tab, vp = { width: 1440, height: 900 }, theme = 'light') {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(([t, th]) => { sessionStorage.setItem('scania.auth', JSON.stringify({ username: 'demo', password: 'demo' })); sessionStorage.setItem('scania.tab', t); localStorage.setItem('scania-theme', th); }, [tab, theme]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(tab + ': ' + e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(4500);
  return p;
}
// 0. login page
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('login: ' + e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(3000); await p.screenshot({ path: OUT + 'login.png' }); await ctx.close(); }
// 1. analytics + avatar menu -> Consumption Stats
let p = await page('analytics');
await p.screenshot({ path: OUT + 'portal-analytics.png' });
await p.click('.sidenav-user, .topbar-user');
await p.click('[data-testid="menu-consumption"]');
await p.waitForSelector('.credits-modal');
res.before = await p.$eval('.credits-figure', (e) => e.innerText.replace(/\s+/g, ' '));
res.breakdownMenu = await p.$eval('.credits-breakdown', (e) => e.innerText.replace(/\s+/g, ' '));
res.barBefore = await p.$eval('.credits-bar-fill', (e) => e.style.width);
await p.screenshot({ path: OUT + 'consumption-modal.png' });
await p.click('.credits-upgrade'); await p.waitForTimeout(900);
res.after = await p.$eval('.credits-figure', (e) => e.innerText.replace(/\s+/g, ' '));
res.barAfter = await p.$eval('.credits-bar-fill', (e) => e.style.width);
res.topTier = await p.$eval('.credits-top', (e) => e.innerText).catch(() => 'none');
await p.keyboard.press('Escape'); await p.click('.winback-close, .credits-modal [aria-label="Close"]').catch(() => {});
await p.waitForTimeout(300);
// Liveboard-action view (dev hook)
await p.evaluate(() => (window).__credits.openModal('liveboard')); await p.waitForTimeout(400);
res.breakdownLiveboard = await p.$eval('.credits-breakdown', (e) => e.innerText.replace(/\s+/g, ' '));
await p.screenshot({ path: OUT + 'consumption-liveboard.png' });
res.spotterWording = await p.evaluate(() => /spotter|ai question/i.test(document.querySelector('.credits-modal')?.innerText || ''));
await p.context().close();
// 2. Report Builder + meter
p = await page('reports');
await p.waitForTimeout(6000);
res.reportIframe = await p.$$eval('.reports-embed iframe', (a) => a.length);
res.meter = await p.$eval('[data-testid="credit-meter"]', (e) => ({ text: e.innerText.replace(/\s+/g, ' '), visible: e.getBoundingClientRect().height > 0 }));
res.reportsEmbedH = await p.$eval('.reports-embed', (e) => Math.round(e.getBoundingClientRect().height));
await p.screenshot({ path: OUT + 'report-builder.png' });
await p.context().close();
// 3. widths at 2000px on every tab
res.widths = {};
for (const t of ['home', 'analytics', 'reports', 'carriers', 'capacity', 'my-analytics']) {
  p = await page(t, { width: 2000, height: 1200 });
  res.widths[t] = await p.evaluate(() => { const m = document.querySelector('.app-main'); const c = m && m.firstElementChild; const mw = m ? m.getBoundingClientRect().width : 0; const cw = c ? c.getBoundingClientRect().width : 0; return { main: Math.round(mw), page: Math.round(cw), cls: c ? c.className.split(' ')[0] : '', hscroll: document.documentElement.scrollWidth > innerWidth }; });
  await p.screenshot({ path: OUT + 'w2000-' + t + '.png' });
  await p.context().close();
}
// 4. Workshop queue + dark analytics
p = await page('capacity'); await p.screenshot({ path: OUT + 'workshop-queue.png' }); await p.context().close();
p = await page('carriers'); await p.screenshot({ path: OUT + 'driver-evaluation.png' }); await p.context().close();
p = await page('analytics', { width: 1440, height: 900 }, 'dark'); await p.screenshot({ path: OUT + 'portal-analytics-dark.png' }); await p.context().close();
// 5. Ask tab: 3 general questions -> paywall shows, app does not blank (switch to premium first is not needed: basic shows trial)
p = await page('ask');
res.askPresent = !!(await p.$('.sl-ai-pane-input input'));
if (res.askPresent) {
  for (const q of ['what is scania', 'help', 'who are you']) { await p.fill('.sl-ai-pane-input input', q); await p.press('.sl-ai-pane-input input', 'Enter'); await p.waitForTimeout(1200); }
  res.trialModal = !!(await p.$('.sl-trial-modal'));
}
res.appAlive = !!(await p.$('.app-shell'));
await p.screenshot({ path: OUT + 'ask-3q.png' });
await p.context().close();
await b.close();
console.log(JSON.stringify(res, null, 1));
console.log('errors:', JSON.stringify(errs));
