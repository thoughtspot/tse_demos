const { chromium } = await import(process.env.HOME + '/.claude/skills/ts-object-answer-chart-builder/helpers/node_modules/playwright-core/index.mjs');
const OUT = process.env.HOME + '/bespoke-portals/tangoe/shots/';
const URL = 'http://localhost:5191/';
const b = await chromium.launch();
const errs = [], res = {};
async function page(tab, vp = { width: 1440, height: 900 }, theme = 'light') {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(([t, th]) => { sessionStorage.setItem('tangoe.auth', JSON.stringify({ username: 'demo', password: 'demo' })); sessionStorage.setItem('tangoe.tab', t); localStorage.setItem('tangoe-theme', th); }, [tab, theme]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(tab + ': ' + e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(4500);
  return p;
}
{ const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('login: ' + e.message));
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(3000); await p.screenshot({ path: OUT + 'login.png' }); await ctx.close(); }
let p = await page('analytics');
await p.screenshot({ path: OUT + 'portal-analytics.png' });
res.consumption = await p.evaluate(() => /consumption|credits/i.test(document.body.innerText));
await p.context().close();
res.widths = {};
for (const t of ['home', 'analytics', 'carriers', 'capacity', 'my-analytics', 'ask']) {
  p = await page(t, { width: 2000, height: 1200 });
  res.widths[t] = await p.evaluate(() => { const m = document.querySelector('.app-main'); const c = m && m.firstElementChild; const mw = m ? m.getBoundingClientRect().width : 0; const cw = c ? c.getBoundingClientRect().width : 0; return { main: Math.round(mw), page: Math.round(cw), cls: c ? c.className.split(' ')[0] : '', hscroll: document.documentElement.scrollWidth > innerWidth }; });
  await p.screenshot({ path: OUT + 'w2000-' + t + '.png' });
  await p.context().close();
}
p = await page('capacity'); await p.screenshot({ path: OUT + 'reclaim-queue.png' }); await p.context().close();
p = await page('carriers'); await p.screenshot({ path: OUT + 'bu-insights.png' }); await p.context().close();
p = await page('analytics', { width: 1440, height: 900 }, 'dark'); await p.screenshot({ path: OUT + 'portal-analytics-dark.png' }); await p.context().close();
p = await page('ask');
res.askPresent = !!(await p.$('.sl-ai-pane-input input'));
if (res.askPresent) {
  for (const q of ['what is tangoe', 'help', 'who are you']) { await p.fill('.sl-ai-pane-input input', q); await p.press('.sl-ai-pane-input input', 'Enter'); await p.waitForTimeout(1200); }
  res.trialModal = !!(await p.$('.sl-trial-modal'));
}
res.appAlive = !!(await p.$('.app-shell'));
await p.screenshot({ path: OUT + 'ask-3q.png' });
await p.context().close();
await b.close();
console.log(JSON.stringify(res, null, 1));
console.log('errors:', JSON.stringify(errs));
