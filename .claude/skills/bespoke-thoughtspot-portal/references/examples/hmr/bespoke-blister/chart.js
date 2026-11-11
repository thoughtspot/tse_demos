// HMR market-share blister pack. Bespoke SVG, no chart library.
// Search: [Units Sold] [Sale Date].monthly [Product] [Product Type] [ATC Class] [Theme Mode] [Market Segment] = 'reimbursed rx' (add [Region] for the region picker if row limits allow)
// 100 pills = 100% of units in the chosen market; Play flips pills month by month as share moves between products.
var CFG = {
  title: 'Market share blister',
  defaultMarket: 'C10',
  brand: { primary: '#47CEB8', deep: '#1E9E89', navy: '#123F3A', tint: '#E3F7F3', amber: '#F2B84B',
    darkBg: '#17211f', darkLine: '#24332f' },
  generics: ['#47CEB8', '#1E9E89', '#8FE3D5', '#2F7F73', '#B9EFE6'],
  brands: ['#123F3A', '#3D5A80', '#6C4F8F', '#8A5A44'],
  darkBrands: ['#D7E7E3', '#9DB4D6', '#B9A3D6', '#D9A98F'],
  otc: ['#F2B84B', '#E58F5A', '#F6D58E'],
  stepMs: 900
};

function getViz() {
  try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {}
  return null;
}
function cellVal(v) {
  if (v == null || typeof v !== 'object') return v;
  try { var r = typeof v.value === 'function' ? v.value() : v.value; return r != null ? r : (v.v != null ? v.v : v.formatted); } catch (e) { return null; }
}
function done() {
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[blister] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[blister] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(schema, re) { for (var i = 0; i < schema.length; i++) if (re.test(schema[i].name)) return schema[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtN(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toTime(v) {
  if (typeof v === 'number') return v < 1e11 ? v * 1000 : v;
  var t = Date.parse(v); return isNaN(t) ? null : t;
}
function monthLabel(t) { var d = new Date(t); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var C = {
  month: colOf(schema, /month|date/i), product: colOf(schema, /^product$/i) || colOf(schema, /product(?! type)/i),
  ptype: colOf(schema, /product type/i), market: colOf(schema, /atc|class|market/i), region: colOf(schema, /region/i),
  theme: colOf(schema, /theme/i),
  n: (schema.filter(function (c) { return /measure/i.test(c.type); })[0] || {}).name || colOf(schema, /^(total|sum)\b/i)
};
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#E6F2EF', muted: '#93ABA6', line: B.darkLine, card: '#22302d', foil: '#2c3d39', pocket: '#1b2724', primary: B.primary, tipBg: '#E6F2EF', tipInk: B.navy }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#5E7470', line: '#DCEBE7', card: '#EEF4F3', foil: '#D9E4E2', pocket: '#F8FBFA', primary: B.deep, tipBg: B.navy, tipInk: '#FFFFFF' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--bl-primary', P.primary], ['--bl-line', P.line], ['--bl-muted', P.muted], ['--bl-ink', P.ink]].forEach(function (t) { root.style.setProperty(t[0], t[1]); });

var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// ---- data model: market -> region -> month -> product -> units
var markets = {}, regions = {}, months = {}, ptypeOf = {};
rows.forEach(function (r) {
  var m = r[C.market] || 'All', t = toTime(r[C.month]), p = r[C.product], u = +r[C.n] || 0;
  if (t == null || p == null) return;
  markets[m] = 1; if (C.region) regions[r[C.region]] = 1; months[t] = 1;
  if (C.ptype) ptypeOf[p] = r[C.ptype];
});
var marketList = Object.keys(markets).sort();
var regionList = ['All regions'].concat(Object.keys(regions).sort());
var monthList = Object.keys(months).map(Number).sort(function (a, b) { return a - b; });
// drop a partial last month (under 60% of the previous month's units) so shares do not wobble
var sel = { market: null, region: 'All regions', idx: 0 };
sel.market = marketList.filter(function (m) { return m.indexOf(CFG.defaultMarket) === 0; })[0] || marketList[0];

function series() {
  var byM = {}, prods = {};
  rows.forEach(function (r) {
    if ((r[C.market] || 'All') !== sel.market) return;
    if (sel.region !== 'All regions' && C.region && r[C.region] !== sel.region) return;
    var t = toTime(r[C.month]); if (t == null) return;
    var p = r[C.product], u = +r[C.n] || 0;
    byM[t] = byM[t] || {}; byM[t][p] = (byM[t][p] || 0) + u; prods[p] = (prods[p] || 0) + u;
  });
  var ms = monthList.filter(function (t) { return byM[t]; });
  if (ms.length > 2) {
    var tot = function (t) { var s = 0; for (var k in byM[t]) s += byM[t][k]; return s; };
    var last = ms[ms.length - 1], prev = ms[ms.length - 2];
    if (tot(last) < 0.6 * tot(prev)) ms.pop();
    if (tot(ms[0]) < 0.6 * tot(ms[1])) ms.shift();
  }
  // originators first, then generics, then OTC; within type by total units
  var rank = function (p) { var t = String(ptypeOf[p] || ''); return /generic/i.test(t) ? 1 : /otc/i.test(t) ? 2 : 0; };
  var plist = Object.keys(prods).sort(function (a, b) { return rank(a) - rank(b) || prods[b] - prods[a]; });
  var col = {}, gi = 0, bi = 0, oi = 0;
  plist.forEach(function (p) { var k = rank(p); col[p] = k === 1 ? CFG.generics[gi++ % CFG.generics.length] : k === 2 ? CFG.otc[oi++ % CFG.otc.length] : (dark ? CFG.darkBrands : CFG.brands)[bi++ % CFG.brands.length]; });
  return { byM: byM, months: ms, prods: plist, color: col, rank: rank };
}
function pills(S, t) {
  // largest-remainder allocation of 100 pills, laid out in product order
  var m = S.byM[t] || {}, tot = 0; S.prods.forEach(function (p) { tot += m[p] || 0; });
  var alloc = S.prods.map(function (p) { var x = tot ? 100 * (m[p] || 0) / tot : 0; return { p: p, n: Math.floor(x), r: x - Math.floor(x), share: x, units: m[p] || 0 }; });
  var left = 100 - alloc.reduce(function (s, a) { return s + a.n; }, 0);
  alloc.slice().sort(function (a, b) { return b.r - a.r; }).slice(0, left).forEach(function (a) { a.n += 1; });
  var out = []; alloc.forEach(function (a) { for (var i = 0; i < a.n; i++) out.push(a); });
  while (out.length < 100) out.push(null);
  return { cells: out, alloc: alloc, total: tot };
}
function genericShare(S, t) {
  var m = S.byM[t] || {}, g = 0, tot = 0;
  S.prods.forEach(function (p) { tot += m[p] || 0; if (S.rank(p) === 1) g += m[p] || 0; });
  return tot ? 100 * g / tot : 0;
}

var timer = null, S = null, cellEls = [], tip = null, ui = {};
function stop() { if (timer) { clearInterval(timer); timer = null; } if (ui.play) ui.play.textContent = 'Play'; }
function play() {
  stop();
  if (!S || S.months.length < 2) return;
  if (sel.idx >= S.months.length - 1) sel.idx = 0;
  ui.play.textContent = 'Pause';
  update(true);
  timer = setInterval(function () {
    if (sel.idx >= S.months.length - 1) { stop(); return; }
    sel.idx += 1; update(true);
  }, CFG.stepMs);
}

function render() {
  stop();
  root.innerHTML = '';
  if (!rows.length || !C.n || !C.product) {
    root.innerHTML = '<div class="bl-empty">No sell-out rows yet.<br>Bind the search: [Units Sold] [Sale Date].monthly [Product] [Product Type] [ATC Class] [Region] [Theme Mode]</div>';
    return;
  }
  S = series();
  if (!S.months.length) { root.innerHTML = '<div class="bl-empty">No units for this selection.</div>'; return; }
  if (sel.idx > S.months.length - 1) sel.idx = S.months.length - 1;

  var head = document.createElement('div'); head.className = 'bl-head'; root.appendChild(head);
  head.innerHTML = '<p class="bl-title">' + esc(CFG.title) + '</p><p class="bl-sub"></p>';
  ui.sub = head.querySelector('.bl-sub');
  var ctr = document.createElement('div'); ctr.className = 'bl-ctr'; head.appendChild(ctr);
  function picker(label, list, val, on) {
    var w = document.createElement('label'); w.className = 'bl-pick'; w.textContent = label + ' ';
    var s = document.createElement('select');
    list.forEach(function (o) { var op = document.createElement('option'); op.value = o; op.textContent = o.length > 30 ? o.slice(0, 29) + '.' : o; if (o === val) op.selected = true; s.appendChild(op); });
    s.addEventListener('change', function () { on(s.value); });
    w.appendChild(s); ctr.appendChild(w); return s;
  }
  picker('Market', marketList, sel.market, function (v) { sel.market = v; sel.idx = 0; render(); });
  if (C.region) picker('Region', regionList, sel.region, function (v) { sel.region = v; render(); });
  ui.play = document.createElement('button'); ui.play.className = 'bl-btn'; ui.play.textContent = 'Play';
  ui.play.addEventListener('click', function () { if (timer) stop(); else play(); });
  ctr.appendChild(ui.play);
  ui.range = document.createElement('input'); ui.range.type = 'range'; ui.range.className = 'bl-range';
  ui.range.min = 0; ui.range.max = S.months.length - 1; ui.range.value = sel.idx;
  ui.range.addEventListener('input', function () { stop(); sel.idx = +ui.range.value; update(false); });
  ctr.appendChild(ui.range);
  ui.mon = document.createElement('span'); ui.mon.className = 'bl-mon'; ctr.appendChild(ui.mon);

  var stage = document.createElement('div'); stage.className = 'bl-stage'; root.appendChild(stage);
  var leg = document.createElement('div'); leg.className = 'bl-leg'; root.appendChild(leg); ui.leg = leg;
  tip = document.createElement('div'); tip.className = 'bl-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);

  var W = stage.clientWidth || 480, H = stage.clientHeight || 280;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Blister pack of 100 pills showing market share' }, stage);
  // card: 10 columns x 10 rows of capsules, aspect about 1.9 : 1 per pocket
  var pad = 10, cw = (W - 2 * pad) / 10, ch = Math.min((H - 2 * pad) / 10, cw * 0.62);
  var gw = cw * 10, gh = ch * 10, ox = (W - gw) / 2, oy = (H - gh) / 2;
  svgEl('rect', { x: ox - 8, y: oy - 8, width: gw + 16, height: gh + 16, rx: 14, fill: P.card, stroke: P.line }, svg);
  for (var k = 1; k < 5; k++) svgEl('line', { x1: ox - 4, x2: ox + gw + 4, y1: oy + k * 2 * ch, y2: oy + k * 2 * ch, stroke: P.line, 'stroke-dasharray': '3 4' }, svg);
  cellEls = [];
  for (var i = 0; i < 100; i++) {
    var cx = ox + (i % 10) * cw + cw / 2, cy = oy + Math.floor(i / 10) * ch + ch / 2;
    var pw = cw * 0.78, ph = ch * 0.66;
    svgEl('rect', { x: cx - pw / 2 - 2, y: cy - ph / 2 - 2, width: pw + 4, height: ph + 4, rx: (ph + 4) / 2, fill: P.pocket, stroke: P.foil }, svg);
    var g = svgEl('g', { transform: 'translate(' + cx + ' ' + cy + ')', 'class': 'bl-pill' }, svg);
    var inner = svgEl('g', { 'class': 'bl-flip' }, g);
    var body = svgEl('rect', { x: -pw / 2, y: -ph / 2, width: pw, height: ph, rx: ph / 2, fill: P.foil }, inner);
    svgEl('rect', { x: -pw / 2 + ph * 0.25, y: -ph / 2 + ph * 0.16, width: pw * 0.42, height: ph * 0.2, rx: ph * 0.1, fill: '#FFFFFF', opacity: 0.35 }, inner);
    cellEls.push({ g: g, inner: inner, body: body, cur: null });
    (function (idx) {
      g.addEventListener('mousemove', function (ev) { showTip(ev, idx); });
      g.addEventListener('mouseleave', function () { tip.style.opacity = 0; });
    })(i);
  }
  update(false);
}

var lastCells = null;
function update(animate) {
  var t = S.months[sel.idx], A = pills(S, t);
  lastCells = A;
  ui.range.value = sel.idx; ui.mon.textContent = monthLabel(t);
  var g0 = genericShare(S, S.months[0]), g1 = genericShare(S, t);
  ui.sub.textContent = 'Each pill = 1% of units sold. Generics ' + Math.round(g0) + '% in ' + monthLabel(S.months[0]) + ', ' + Math.round(g1) + '% in ' + monthLabel(t) + '.';
  A.cells.forEach(function (a, i) {
    var el = cellEls[i], p = a ? a.p : null;
    if (el.cur === p) return;
    var fill = p ? S.color[p] : P.foil;
    if (animate && !reduced && el.cur !== null) {
      el.inner.classList.remove('bl-pop'); void el.inner.getBoundingClientRect();
      el.inner.style.animationDelay = (i % 10) * 18 + 'ms';
      el.inner.classList.add('bl-pop');
      setTimeout(function () { el.body.setAttribute('fill', fill); }, 140 + (i % 10) * 18);
    } else {
      el.body.setAttribute('fill', fill);
    }
    el.cur = p;
  });
  var first = pills(S, S.months[0]).alloc, fmap = {};
  first.forEach(function (a) { fmap[a.p] = a.share; });
  ui.leg.innerHTML = A.alloc.filter(function (a) { return a.units > 0 || fmap[a.p] > 0; }).slice(0, 6).map(function (a) {
    var d = a.share - (fmap[a.p] || 0), ds = (d >= 0 ? '+' : '') + d.toFixed(0) + ' pts';
    return '<span class="bl-li"><i style="background:' + S.color[a.p] + '"></i><b>' + esc(a.p) + '</b> ' + a.share.toFixed(0) + '% <em class="' + (d >= 0 ? 'up' : 'dn') + '">' + ds + '</em></span>';
  }).join('');
}
function showTip(ev, idx) {
  if (!lastCells) return;
  var a = lastCells.cells[idx];
  if (!a) { tip.style.opacity = 0; return; }
  tip.innerHTML = '<b>' + esc(a.p) + '</b>' + esc(ptypeOf[a.p] || '') + '<br>' + a.share.toFixed(1) + '% of ' + esc(sel.market) + '<br>' + fmtN(a.units) + ' units in ' + monthLabel(S.months[sel.idx]);
  var r = root.getBoundingClientRect(), x = ev.clientX - r.left + 12, y = ev.clientY - r.top + 12;
  if (x > r.width - 200) x = ev.clientX - r.left - 200;
  if (y > r.height - 80) y = ev.clientY - r.top - 80;
  tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.opacity = 1;
}

var lastW = 0, lastH = 0, rtimer = null;
try {
  render();
  if (S && S.months.length > 1 && !reduced) { sel.idx = 0; update(false); setTimeout(play, 500); }
  else if (S) { sel.idx = S.months.length - 1; update(false); }
} catch (err) { console.error('[blister] render failed', err); root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px">' + esc(err && err.stack || err) + '</pre>'; }
done();
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(function () {
    var r = root.getBoundingClientRect();
    if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 2) return;
    var first = lastW === 0; lastW = r.width; lastH = r.height;
    if (first) return;
    var was = !!timer; clearTimeout(rtimer); rtimer = setTimeout(function () { try { var keep = sel.idx; render(); sel.idx = keep; if (S) { update(false); if (was) play(); } } catch (e) { console.error(e); } }, 120);
  }).observe(root);
}
