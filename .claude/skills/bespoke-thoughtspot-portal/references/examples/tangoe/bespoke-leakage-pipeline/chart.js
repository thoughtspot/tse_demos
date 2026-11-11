// Tangoe cost-leakage pipeline. Bespoke SVG, no chart library.
// Search: [Billed Amount] [Wasted Spend] [Disputed Amount] [Credits Recovered] [Billed Lines] [Zero-Usage Lines] [Business Unit] [Invoice Date].monthly [Invoice Date] = 'last 12 months' [Theme Mode]
// One pipe per business unit carries billed spend (thickness). The zero-usage valve leaks wasted spend (drips, heat = zero-usage
// rate); the invoice-audit valve returns recovered credits to the pipe through a green loop. Play walks the months.
var CFG = {
  title: 'Cost-leakage pipeline',
  hotRatio: 1.6,
  brand: {
    light: { bg: '#FFFFFF', fg: '#2C1355', muted: '#6B5F86', line: '#E2DAF3', pipe: '#6633CA', pipeHi: '#A88BE3', pipeLo: '#EEE8FA', primary: '#6633CA', leak: '#F37822', good: '#20A65F', ramp: ['#2C1355', '#7A2E9E', '#C0569A', '#F37822'], tipBg: '#2C1355', tipFg: '#FFFFFF', coin: '#FFFFFF' },
    dark: { bg: '#1B1235', fg: '#ECE8F7', muted: '#A79CC4', line: '#3A2D5C', pipe: '#8F66F0', pipeHi: '#C9B5FA', pipeLo: '#2A1E4D', primary: '#9C78F2', leak: '#FF8A3D', good: '#2FC377', ramp: ['#E0D6FA', '#D9A0D0', '#FFA36B', '#FF8A3D'], tipBg: '#ECE8F7', tipFg: '#1B1235', coin: '#ECE8F7' }
  }
};

function getViz() {
  try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {}
  return null;
}
function cellVal(v) {
  if (v == null || typeof v !== 'object') return v;
  try { var r = typeof v.value === 'function' ? v.value() : v.value; return r != null ? r : (v.v != null ? v.v : v.formatted); } catch (e) { return null; }
}
var doneSent = false;
function done() {
  if (doneSent) return; doneSent = true;
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[leak] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: (raw && raw.schema) || [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[leak] live data unavailable', e); return { schema: [], rows: [] }; }
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n) || String(v).indexOf('-') > 0) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function monShort(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + " '" + String(d.getUTCFullYear()).slice(2); }
function money(x) { x = x || 0; var a = Math.abs(x); return '$' + (a >= 1e6 ? (x / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (x / 1e3).toFixed(a >= 1e5 ? 0 : 1) + 'K' : Math.round(x)); }
function pct1(x) { return (x * 100).toFixed(1) + '%'; }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(',') + ')'; }
function rampAt(R, t) { t = Math.max(0, Math.min(1, t)); var s = t * (R.length - 1), i = Math.min(R.length - 2, Math.floor(s)); return mix(R[i], R[i + 1], s - i); }
function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var isMeas = function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); };
var measures = schema.filter(isMeas), attrs = schema.filter(function (c) { return !isMeas(c); });
function pickM(re, not) { var m = measures.filter(function (c) { return re.test(c.name) && !(not && not.test(c.name)); })[0]; return m ? m.name : null; }
var M_BILL = pickM(/billed amount/i) || pickM(/billed|spend|amount/i, /wasted|disput|credit|lines/i);
var M_WASTE = pickM(/wasted/i);
var M_DISP = pickM(/disput/i);
var M_CRED = pickM(/credit|recover/i);
var M_ZERO = pickM(/zero/i);
var M_LINES = pickM(/lines/i, /zero/i);
var A_TH = (attrs.filter(function (c) { return /theme/i.test(c.name); })[0] || {}).name;
var A_MON = (attrs.filter(function (c) { return /\(.*date.*\)|month/i.test(c.name) && !/theme/i.test(c.name); })[0] || {}).name;
var A_BU = (attrs.filter(function (c) { return c.name !== A_TH && c.name !== A_MON; })[0] || {}).name;
var dark = !!A_TH && rows.length > 0 && String(rows[0][A_TH]).toLowerCase() === 'dark';
var PAL = dark ? CFG.brand.dark : CFG.brand.light;

var host = document.getElementById('chart');
if (!host) { host = document.createElement('div'); host.id = 'chart'; document.body.appendChild(host); }
document.documentElement.style.background = PAL.bg; document.body.style.background = PAL.bg;
host.style.background = PAL.bg;
[['--lp-fg', PAL.fg], ['--lp-muted', PAL.muted], ['--lp-line', PAL.line], ['--lp-primary', PAL.primary], ['--lp-leak', PAL.leak], ['--lp-good', PAL.good]].forEach(function (p) { host.style.setProperty(p[0], p[1]); });

var tip = null, raf = 0, playTimer = 0, ro = null, lastW = 0, lastH = 0;
var reduce = false;
try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
function hideTip() { if (tip) tip.style.opacity = 0; }
function showTip(ev, html) {
  if (!tip) return;
  tip.innerHTML = html; tip.style.opacity = 1;
  var b = host.getBoundingClientRect(), x = ev.clientX - b.left + 12, y = ev.clientY - b.top + 12;
  var tw = tip.offsetWidth, th = tip.offsetHeight;
  if (x + tw > b.width - 4) x = Math.max(4, ev.clientX - b.left - tw - 12);
  if (y + th > b.height - 4) y = Math.max(4, ev.clientY - b.top - th - 12);
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function bindTip(el, fn) {
  el.addEventListener('mousemove', function (ev) { showTip(ev, fn()); });
  el.addEventListener('mouseleave', hideTip);
}

// ---- aggregate: month -> BU -> sums
var DATA = {}, MONTHS = [], BUS = [], BU_TOT = {};
(function build() {
  if (!A_MON || !A_BU || !M_BILL || !M_ZERO || !M_LINES) return;
  var tot = {};
  rows.forEach(function (r) {
    var ms = toMs(r[A_MON]); if (ms == null) return;
    var bu = String(r[A_BU] == null ? 'Unassigned' : r[A_BU]);
    var m = DATA[ms] || (DATA[ms] = {}), o = m[bu] || (m[bu] = { bill: 0, waste: 0, disp: 0, cred: 0, zero: 0, lines: 0 });
    o.bill += +r[M_BILL] || 0; o.waste += M_WASTE ? (+r[M_WASTE] || 0) : 0; o.disp += M_DISP ? (+r[M_DISP] || 0) : 0;
    o.cred += M_CRED ? (+r[M_CRED] || 0) : 0; o.zero += +r[M_ZERO] || 0; o.lines += +r[M_LINES] || 0;
    tot[ms] = (tot[ms] || 0) + (+r[M_BILL] || 0);
    BU_TOT[bu] = (BU_TOT[bu] || 0) + (+r[M_BILL] || 0);
  });
  var ks = Object.keys(DATA).map(Number).sort(function (a, b) { return a - b; });
  var med = median(ks.map(function (k) { return tot[k]; }));
  MONTHS = ks.filter(function (k, i) { return !((i === 0 || i === ks.length - 1) && tot[k] < 0.4 * med); });
  BUS = Object.keys(BU_TOT).sort(function (a, b) { return BU_TOT[b] - BU_TOT[a]; }).slice(0, 8);
})();

var state = { mi: Math.max(0, MONTHS.length - 1), metric: 'rate', playing: false };
function cell(ms, bu) { return (DATA[ms] && DATA[ms][bu]) || { bill: 0, waste: 0, disp: 0, cred: 0, zero: 0, lines: 0 }; }
function rate(o) { return o.lines ? o.zero / o.lines : 0; }
var MAXBILL = 1, MAXRATE = 0.01, MAXWASTE = 1;
MONTHS.forEach(function (ms) { BUS.forEach(function (b) { var o = cell(ms, b); MAXBILL = Math.max(MAXBILL, o.bill); MAXRATE = Math.max(MAXRATE, rate(o)); MAXWASTE = Math.max(MAXWASTE, o.waste); }); });

function storyLine() {
  if (MONTHS.length < 2) return '';
  var a = MONTHS[0], z = MONTHS[MONTHS.length - 1], best = null;
  BUS.forEach(function (b) {
    var r0 = rate(cell(a, b)), r1 = rate(cell(z, b)), d = r1 - r0;
    if (!best || d > best.d) best = { b: b, r0: r0, r1: r1, d: d };
  });
  if (!best || best.d < 0.02) return 'Zero-usage lines and licenses leak wasted spend; audit credits flow back.';
  return '<b>' + esc(best.b) + '</b> leak swelling: zero-usage lines <i>' + pct1(best.r0) + ' to ' + pct1(best.r1) + '</i> (' + monShort(a) + ' to ' + monShort(z) + ').';
}

function mount() {
  host.innerHTML = '';
  if (!MONTHS.length || !BUS.length) {
    host.innerHTML = '<div class="lp-empty">No data. Bind the search:<br>[Billed Amount] [Wasted Spend] [Disputed Amount] [Credits Recovered] [Billed Lines] [Zero-Usage Lines] [Business Unit] [Invoice Date].monthly [Theme Mode]</div>';
    done(); return;
  }
  var head = document.createElement('div'); head.className = 'lp-head';
  head.innerHTML = '<p class="lp-title">' + CFG.title + '</p><p class="lp-sub">' + storyLine() + '</p>' +
    '<div class="lp-ctl"><button class="lp-play" aria-label="Play months">&#9654;</button>' +
    '<input class="lp-range" type="range" min="0" max="' + (MONTHS.length - 1) + '" value="' + state.mi + '" aria-label="Month">' +
    '<span class="lp-month"></span>' +
    '<label class="lp-pick"><select class="lp-metric" aria-label="Metric"><option value="rate">Zero-usage rate</option><option value="waste">Wasted spend</option></select></label></div>';
  host.appendChild(head);
  var stage = document.createElement('div'); stage.className = 'lp-stage'; host.appendChild(stage);
  var foot = document.createElement('div'); foot.className = 'lp-foot'; host.appendChild(foot);
  tip = document.createElement('div'); tip.className = 'lp-tip'; tip.style.background = PAL.tipBg; tip.style.color = PAL.tipFg; host.appendChild(tip);
  var playBtn = head.querySelector('.lp-play'), range = head.querySelector('.lp-range'), sel = head.querySelector('.lp-metric');
  sel.value = state.metric;
  range.addEventListener('input', function () { stop(); state.mi = +range.value; draw(); });
  sel.addEventListener('change', function () { state.metric = sel.value; draw(); });
  playBtn.addEventListener('click', function () { if (state.playing) { stop(); return; } start(); });
  function stop() { state.playing = false; clearInterval(playTimer); playTimer = 0; playBtn.innerHTML = '&#9654;'; }
  function start() {
    state.playing = true; playBtn.innerHTML = '&#10074;&#10074;';
    if (state.mi >= MONTHS.length - 1) state.mi = 0;
    draw();
    playTimer = setInterval(function () {
      if (state.mi >= MONTHS.length - 1) { stop(); return; }
      state.mi++; range.value = state.mi; draw();
    }, reduce ? 1400 : 1100);
  }

  var parts = [], drips = [];
  function draw() {
    hideTip();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    var ms = MONTHS[state.mi];
    head.querySelector('.lp-month').textContent = monLabel(ms);
    stage.innerHTML = '';
    var W = stage.clientWidth || 500, H = stage.clientHeight || 300;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Cost-leakage pipeline by business unit' }, stage);
    var narrow = W < 470;
    var labW = narrow ? 84 : 112, valW = narrow ? 58 : 74;
    var x0 = labW + 14, x1 = W - valW - 6, L = Math.max(60, x1 - x0);
    var topPad = 10, n = BUS.length, rowH = Math.max(26, (H - topPad - 6) / n);
    var leakX = x0 + L * 0.36, auditX = x0 + L * 0.72;
    var others = [];
    BUS.forEach(function (b) { others.push(rate(cell(ms, b))); });
    var medRate = median(others);
    // header marks for the two valves
    var hdr = svgEl('g', {}, svg);
    if (leakX - x0 > 95) svgEl('text', { x: x0, y: 8, 'font-size': 10, fill: PAL.muted }, hdr).textContent = 'Invoices in';
    svgEl('text', { x: leakX, y: 8, 'font-size': 10, fill: PAL.leak, 'text-anchor': 'middle', 'font-weight': 700 }, hdr).textContent = 'Zero-usage leak';
    svgEl('text', { x: auditX, y: 8, 'font-size': 10, fill: PAL.good, 'text-anchor': 'middle', 'font-weight': 700 }, hdr).textContent = 'Audit recovery';
    svgEl('text', { x: W - 6, y: 8, 'font-size': 10, fill: PAL.muted, 'text-anchor': 'end' }, hdr).textContent = state.metric === 'rate' ? 'Zero-usage' : 'Wasted';
    var gPipes = svgEl('g', {}, svg), gFx = svgEl('g', {}, svg), gLab = svgEl('g', {}, svg);
    parts = []; drips = [];
    var totBill = 0, totWaste = 0, totCred = 0, totDisp = 0, totZero = 0, totLines = 0;
    BUS.forEach(function (b, i) {
      var o = cell(ms, b), r = rate(o), first = cell(MONTHS[0], b), r0 = rate(first);
      totBill += o.bill; totWaste += o.waste; totCred += o.cred; totDisp += o.disp; totZero += o.zero; totLines += o.lines;
      var cy = topPad + rowH * i + rowH * 0.55;
      var th = 4 + Math.sqrt(o.bill / MAXBILL) * Math.min(14, rowH * 0.34);
      var hot = medRate > 0 && r >= CFG.hotRatio * medRate && r > 0.09;
      var heat = rampAt(PAL.ramp, r / Math.max(0.12, MAXRATE));
      var fade = Math.max(0, Math.min(1, (o.waste / (o.bill || 1)) / 0.06));
      var after = th * (1 - Math.min(0.5, fade * 0.5));
      // pipe body: thick before the leak, thinner after (lost spend), a touch thicker after audit returns credits
      var back = after + Math.min(3, th * (o.cred / (o.bill || 1)) * 40);
      var path = 'M' + x0 + ',' + (cy - th / 2) + ' L' + leakX + ',' + (cy - th / 2) + ' L' + (leakX + 10) + ',' + (cy - after / 2) + ' L' + auditX + ',' + (cy - after / 2) +
        ' L' + (auditX + 10) + ',' + (cy - back / 2) + ' L' + x1 + ',' + (cy - back / 2) + ' L' + x1 + ',' + (cy + back / 2) + ' L' + (auditX + 10) + ',' + (cy + back / 2) +
        ' L' + auditX + ',' + (cy + after / 2) + ' L' + (leakX + 10) + ',' + (cy + after / 2) + ' L' + leakX + ',' + (cy + th / 2) + ' L' + x0 + ',' + (cy + th / 2) + ' Z';
      var pipe = svgEl('path', { d: path, fill: PAL.pipe, opacity: hot ? 0.95 : 0.78, class: 'lp-hit' }, gPipes);
      svgEl('rect', { x: x0, y: cy - th / 2, width: Math.max(1, x1 - x0), height: Math.max(1, th * 0.28), fill: PAL.pipeHi, opacity: 0.35, 'pointer-events': 'none' }, gPipes);
      bindTip(pipe, function () { return '<b>' + esc(b) + '</b>Billed ' + money(o.bill) + ' on ' + Math.round(o.lines).toLocaleString() + ' lines and seats<br>Cost per line ' + money(o.lines ? o.bill / o.lines : 0); });
      // zero-usage valve
      var vr = Math.max(5, th * 0.62);
      var valve = svgEl('rect', { x: leakX - vr, y: cy - vr, width: vr * 2, height: vr * 2, rx: 3, fill: heat, stroke: PAL.bg, 'stroke-width': 1.5, class: 'lp-hit' }, gFx);
      if (hot) svgEl('rect', { x: leakX - vr - 4, y: cy - vr - 4, width: vr * 2 + 8, height: vr * 2 + 8, rx: 5, fill: 'none', stroke: PAL.leak, 'stroke-width': 2, class: 'lp-hot', 'pointer-events': 'none' }, gFx);
      bindTip(valve, function () { return '<b>' + esc(b) + ': zero-usage leak</b>' + Math.round(o.zero).toLocaleString() + ' of ' + Math.round(o.lines).toLocaleString() + ' lines and licenses idle 30+ days (' + pct1(r) + ')<br>Wasted spend ' + money(o.waste) + '<br>' + monShort(MONTHS[0]) + ': ' + pct1(r0); });
      // puddle under the leak, sized by wasted spend
      var pw = 3 + Math.sqrt(o.waste / MAXWASTE) * (rowH * 0.42);
      var pud = svgEl('ellipse', { cx: leakX + 3, cy: cy + rowH * 0.36, rx: pw, ry: Math.max(1.5, pw * 0.22), fill: PAL.leak, opacity: 0.35 + 0.5 * fade, class: 'lp-hit' }, gFx);
      bindTip(pud, function () { return '<b>' + esc(b) + ': wasted spend</b>' + money(o.waste) + ' billed on zero-usage lines and licenses in ' + monLabel(ms); });
      // audit valve + green return loop
      var av = Math.max(4.5, after * 0.6);
      var dia = svgEl('path', { d: 'M' + auditX + ',' + (cy - av) + ' L' + (auditX + av) + ',' + cy + ' L' + auditX + ',' + (cy + av) + ' L' + (auditX - av) + ',' + cy + ' Z', fill: PAL.bg, stroke: PAL.good, 'stroke-width': 2, class: 'lp-hit' }, gFx);
      var lh = Math.min(rowH * 0.42, 6 + Math.sqrt(o.cred / (MAXBILL * 0.02 + 1)) * 6);
      var loopW = Math.max(0.8, Math.min(4, 0.8 + (o.cred / (o.bill || 1)) * 140));
      var loop = svgEl('path', { d: 'M' + (auditX + 4) + ',' + (cy - after / 2) + ' C' + (auditX + 2) + ',' + (cy - after / 2 - lh) + ' ' + (auditX - L * 0.16) + ',' + (cy - after / 2 - lh) + ' ' + (auditX - L * 0.2) + ',' + (cy - after / 2), fill: 'none', stroke: PAL.good, 'stroke-width': loopW, 'stroke-linecap': 'round', opacity: 0.9, class: 'lp-hit' }, gFx);
      var auditTip = function () { return '<b>' + esc(b) + ': invoice audit</b>Disputed ' + money(o.disp) + '<br>Credits recovered ' + money(o.cred) + (o.disp ? ' (' + Math.round(100 * o.cred / o.disp) + '% of disputed)' : ''); };
      bindTip(dia, auditTip); bindTip(loop, auditTip);
      // labels
      var lab = svgEl('text', { x: labW + 6, y: cy + 4, 'text-anchor': 'end', 'font-size': narrow ? 10.5 : 11.5, 'font-weight': hot ? 700 : 500, fill: hot ? PAL.leak : PAL.fg }, gLab);
      var nm = b; if (narrow && nm.length > 13) nm = nm.slice(0, 12) + '.';
      lab.textContent = nm;
      var vtxt = state.metric === 'rate' ? pct1(r) : money(o.waste);
      var dlt = state.metric === 'rate' ? (r - r0) * 100 : null;
      var v = svgEl('text', { x: W - 6, y: cy + 1, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: hot ? PAL.leak : PAL.fg }, gLab);
      v.textContent = vtxt;
      if (dlt != null && state.mi > 0) {
        var dv = svgEl('text', { x: W - 6, y: cy + 12, 'text-anchor': 'end', 'font-size': 9.5, fill: dlt > 2 ? PAL.leak : PAL.muted }, gLab);
        dv.textContent = (dlt >= 0 ? '+' : '') + dlt.toFixed(1) + ' pt';
      }
      // particles (coins) along the pipe; drips at the leak
      var nCoins = 2 + Math.round(4 * Math.sqrt(o.bill / MAXBILL));
      for (var k = 0; k < nCoins; k++) parts.push({ cy: cy, t: k / nCoins + Math.random() * 0.1, sp: 0.0016 + Math.random() * 0.0008, el: svgEl('circle', { r: Math.max(1.4, Math.min(2.6, th * 0.18)), fill: PAL.coin, opacity: 0.85, 'pointer-events': 'none' }, gFx) });
      var nDrip = Math.round(1 + 5 * Math.min(1, r / Math.max(0.12, MAXRATE)));
      for (var j = 0; j < nDrip; j++) drips.push({ x: leakX + (Math.random() * 6 - 3), y0: cy + vr, y1: cy + rowH * 0.34, t: Math.random(), sp: 0.012 + Math.random() * 0.01 * (hot ? 1.8 : 1), el: svgEl('circle', { r: hot ? 2.2 : 1.6, fill: PAL.leak, 'pointer-events': 'none' }, gFx) });
    });
    // label layer always on top of particles
    svg.appendChild(gLab);
    var rAll = totLines ? totZero / totLines : 0;
    foot.innerHTML = '<div class="lp-chip">Billed<b>' + money(totBill) + '</b></div>' +
      '<div class="lp-chip leak">Wasted (' + pct1(rAll) + ' idle)<b>' + money(totWaste) + '</b></div>' +
      '<div class="lp-chip back">Credits recovered<b>' + money(totCred) + '</b></div>';
    function place() {
      parts.forEach(function (p) { var x = x0 + (x1 - x0) * (p.t % 1); p.el.setAttribute('cx', x); p.el.setAttribute('cy', p.cy); });
      drips.forEach(function (d) { var t = d.t % 1; d.el.setAttribute('cx', d.x); d.el.setAttribute('cy', d.y0 + (d.y1 - d.y0) * t * t); d.el.setAttribute('opacity', 1 - t * 0.8); });
    }
    function tick() {
      parts.forEach(function (p) { p.t += p.sp; });
      drips.forEach(function (d) { d.t += d.sp; });
      place();
      raf = requestAnimationFrame(tick);
    }
    place();
    if (!reduce) raf = requestAnimationFrame(tick);
  }
  draw();
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(function () {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h; draw();
    });
    ro.observe(stage);
  }
  done();
}

try { mount(); } catch (err) {
  host.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:' + PAL.leak + '">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
