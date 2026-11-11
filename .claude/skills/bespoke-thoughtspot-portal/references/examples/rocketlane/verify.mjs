const { chromium } = await import(process.env.HOME + '/.claude/skills/ts-object-answer-chart-builder/helpers/node_modules/playwright-core/index.mjs');
const OUT = process.env.HOME + '/bespoke-portals/rocketlane/shots/';
const b = await chromium.launch();
const errs = [], res = {};
async function page(tab, vp = { width: 1440, height: 900 }) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript((t) => { sessionStorage.setItem('rocketlane.auth', JSON.stringify({ username: 'demo', password: 'demo' })); sessionStorage.setItem('rocketlane.tab', t); localStorage.setItem('rocketlane-theme', 'light'); }, tab);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(tab + ': ' + e.message));
  await p.goto('http://localhost:5188/', { waitUntil: 'load' }); await p.waitForTimeout(5000);
  return p;
}
// 1. portal on the Dashboards tab, with the Tasks flyout open (hover)
let p = await page('analytics');
await p.waitForTimeout(8000);
await p.hover('.navrail-slot:has(button[aria-label="Tasks"])');
await p.waitForTimeout(500);
res.flyoutVisible = await p.$eval('.navrail-slot:has(button[aria-label="Tasks"]) .navrail-flyout', (e) => getComputedStyle(e).opacity);
res.crumb = await p.$eval('.rail-crumbs', (e) => e.innerText.replace(/\s+/g, ' '));
await p.screenshot({ path: OUT + 'portal-analytics.png' });
// 2. avatar menu -> Consumption Stats -> upgrade
await p.mouse.move(700, 400);
await p.click('.navrail-avatar');
await p.click('[data-testid="menu-consumption"]');
await p.waitForSelector('.credits-modal');
res.before = await p.$eval('.credits-figure', (e) => e.innerText.replace(/\s+/g, ' '));
res.breakdown = await p.$eval('.credits-breakdown', (e) => e.innerText.replace(/\s+/g, ' '));
res.barBefore = await p.$eval('.credits-bar-fill', (e) => e.style.width);
await p.screenshot({ path: OUT + 'consumption-modal.png' });
await p.click('.credits-upgrade');
await p.waitForTimeout(900);
res.after = await p.$eval('.credits-figure', (e) => e.innerText.replace(/\s+/g, ' '));
res.barAfter = await p.$eval('.credits-bar-fill', (e) => e.style.width);
res.upgradedMsg = await p.$eval('.credits-upgraded', (e) => e.innerText);
res.topTier = await p.$eval('.credits-top', (e) => e.innerText).catch(() => 'none');
await p.screenshot({ path: OUT + 'consumption-upgraded.png' });
await p.context().close();
// 3. Report Builder renders + meter visible
p = await page('reports');
await p.waitForTimeout(10000);
res.reportIframe = await p.$$eval('.reports-embed iframe', (a) => a.length);
res.meter = await p.$eval('[data-testid="credit-meter"]', (e) => ({ text: e.innerText.replace(/\s+/g, ' '), visible: e.getBoundingClientRect().height > 0 }));
await p.screenshot({ path: OUT + 'report-builder.png' });
await p.context().close();
// 4. Ask tab: 3 general questions -> paywall shows, app does not blank
p = await page('ask');
for (const q of ['what is rocketlane', 'help', 'who are you']) {
  await p.fill('.sl-ai-pane-input input', q); await p.press('.sl-ai-pane-input input', 'Enter'); await p.waitForTimeout(1200);
}
res.trialModal = !!(await p.$('.sl-trial-modal'));
res.appAlive = !!(await p.$('.navrail'));
await p.screenshot({ path: OUT + 'ask-3q.png' });
await p.context().close();
await b.close();
console.log(JSON.stringify(res, null, 1));
console.log('errors:', JSON.stringify(errs));
