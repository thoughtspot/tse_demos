// Surescripts prior-auth relay. Bespoke SVG, no chart library.
// Search: [PA Turnaround Hours] [PA Requests] [Transaction Date].monthly [State] [PA Channel] [PA Channel] != 'not a pa' [Transaction Date] = 'last 12 months' [Theme Mode]
// One relay lane per PA channel: Prescriber/EHR -> Surescripts network -> PBM review -> Decision. Lane length = turnaround
// hours (sqrt scale), lane thickness = request share, hop heat = hours spent in that hop. A 24h clock dial shows the blended
// turnaround for the chosen state; Play walks the months (Texas collapses as ePA takes over).
var CFG = {
  title: 'Prior-auth relay: turnaround by hop',
  defState: 'Texas',
  channels: ['Fax / Phone', 'Electronic (ePA)', 'Touchless ePA'],
  short: { 'Fax / Phone': 'Fax / phone', 'Electronic (ePA)': 'ePA', 'Touchless ePA': 'Touchless' },
  hops: ['Prescriber / EHR', 'Surescripts', 'PBM review', 'Decision'],
  split: { 'Fax / Phone': [0.22, 0.12, 0.66], 'Electronic (ePA)': [0.07, 0.03, 0.9], 'Touchless ePA': [0.1, 0.1, 0.8] },
  stallHrs: 8,
  brand: {
    light: { bg: '#FFFFFF', fg: '#002A3B', muted: '#5B6E7B', line: '#D3DEE4', track: '#EEF4F7', primary: '#005677', sky: '#009DD1', accent: '#F26027', ramp: ['#BFE3F1', '#009DD1', '#005677', '#002A3B'], tipBg: '#002A3B', tipFg: '#FFFFFF', dot: '#005677' },
    dark: { bg: '#0F2733', fg: '#E6EEF2', muted: '#9FB3BF', line: '#1F3D4C', track: '#143240', primary: '#4FC3EC', sky: '#009DD1', accent: '#FF7A45', ramp: ['#1C4A5E', '#0083B0', '#38B6E6', '#BDE9F8'], tipBg: '#E6EEF2', tipFg: '#0F2733', dot: '#BDE9F8' }
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[relay] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: (raw && raw.schema) || [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[relay] live data unavailable', e); return { schema: [], rows: [] }; }
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n) || String(v).indexOf('-') > 0) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function monShort(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + " '" + String(d.getUTCFullYear()).slice(2); }
function fmtH(h) { return h == null ? 'n/a' : h < 1 ? Math.round(h * 60) + ' min' : h.toFixed(1) + 'h'; }
function pct(x) { return Math.round(x * 100) + '%'; }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(',') + ')'; }
function rampAt(R, t) { t = Math.max(0, Math.min(1, t)); var s = t * (R.length - 1), i = Math.min(R.length - 2, Math.floor(s)); return mix(R[i], R[i + 1], s - i); }
function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var isMeas = function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); };
var measures = schema.filter(isMeas), attrs = schema.filter(function (c) { return !isMeas(c); });
var M_HRS = (measures.filter(function (c) { return /turnaround|hours/i.test(c.name); })[0] || {}).name;
var M_REQ = (measures.filter(function (c) { return c.name !== M_HRS && /request|count|pa/i.test(c.name); })[0] || {}).name;
var A_TH = (attrs.filter(function (c) { return /theme/i.test(c.name); })[0] || {}).name;
var A_MON = (attrs.filter(function (c) { return /\(.*date.*\)|month/i.test(c.name) && !/theme/i.test(c.name); })[0] || {}).name;
var A_ST = (attrs.filter(function (c) { return /state|region/i.test(c.name); })[0] || {}).name;
var A_CH = (attrs.filter(function (c) { return /channel/i.test(c.name); })[0] || {}).name;
var dark = !!A_TH && rows.length > 0 && String(rows[0][A_TH]).toLowerCase() === 'dark';
var PAL = dark ? CFG.brand.dark : CFG.brand.light;

var host = document.getElementById('chart');
document.documentElement.style.background = PAL.bg; document.body.style.background = PAL.bg;
if (host) {
  host.style.background = PAL.bg;
  [['--pr-fg', PAL.fg], ['--pr-muted', PAL.muted], ['--pr-line', PAL.line], ['--pr-primary', PAL.primary], ['--pr-accent', PAL.accent]].forEach(function (p) { host.style.setProperty(p[0], p[1]); });
}

var tip = null, raf = 0, playTimer = 0, ro = null, lastW = 0, lastH = 0;
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
  el.setAttribute('class', ((el.getAttribute('class') || '') + ' pr-hit').trim());
  el.addEventListener('mousemove', function (ev) { showTip(ev, fn()); });
  el.addEventListener('mouseleave', hideTip);
}

function empty(msg) {
  host.innerHTML = '<div class="pr-empty">' + msg + '</div>';
  done();
}

// ---- data model: month -> state -> channel -> {h, n, hw}
var DATA = {}, MONTHS = [], STATES = {}, reduce = false;
try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
function build() {
  rows.forEach(function (r) {
    var m = toMs(r[A_MON]), st = r[A_ST], ch = r[A_CH], n = Number(r[M_REQ]) || 0, h = r[M_HRS] == null || r[M_HRS] === '' ? null : Number(r[M_HRS]);
    if (m == null || !st || CFG.channels.indexOf(ch) < 0) return;
    var M = DATA[m] || (DATA[m] = {}), S = M[st] || (M[st] = {}), c = S[ch] || (S[ch] = { n: 0, hw: 0, hn: 0 });
    c.n += n; if (h != null && isFinite(h)) { c.hw += h * n; c.hn += n; }
    STATES[st] = (STATES[st] || 0) + n;
  });
  var ms = Object.keys(DATA).map(Number).sort(function (a, b) { return a - b; });
  var tot = ms.map(function (m) { var t = 0; for (var s in DATA[m]) for (var c in DATA[m][s]) t += DATA[m][s][c].n; return t; });
  var med = median(tot);
  MONTHS = ms.filter(function (m, i) { return tot[i] >= 0.4 * med; });
}
function agg(m, st) {
  var out = {}, M = DATA[m] || {};
  CFG.channels.forEach(function (ch) { out[ch] = { n: 0, hw: 0, hn: 0 }; });
  for (var s in M) {
    if (st !== '__all' && s !== st) continue;
    CFG.channels.forEach(function (ch) { var c = M[s][ch]; if (c) { out[ch].n += c.n; out[ch].hw += c.hw; out[ch].hn += c.hn; } });
  }
  var N = 0, HW = 0, HN = 0, E = 0;
  CFG.channels.forEach(function (ch) { var c = out[ch]; c.h = c.hn ? c.hw / c.hn : null; N += c.n; HW += c.hw; HN += c.hn; if (ch !== 'Fax / Phone') E += c.n; });
  return { ch: out, n: N, h: HN ? HW / HN : null, epa: N ? E / N : 0 };
}

var state = { st: CFG.defState, metric: 'hours', mi: 0, playing: false };

function render() {
  cancelAnimationFrame(raf); raf = 0; hideTip();
  var stage = host.querySelector('.pr-stage');
  var W = stage.clientWidth, H = stage.clientHeight;
  if (W < 50 || H < 50) return;
  lastW = W; lastH = H;
  stage.querySelectorAll('svg').forEach(function (s) { s.remove(); });
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': CFG.title }, stage);
  var m = MONTHS[state.mi], A = agg(m, state.st), NET = agg(m, '__all'), A0 = agg(MONTHS[0], state.st);
  var stName = state.st === '__all' ? 'Network' : state.st;

  var sub = host.querySelector('.pr-sub');
  if (state.metric === 'hours') {
    sub.innerHTML = '<b>' + esc(stName) + '</b> avg time to decision <i>' + fmtH(A0.h) + '</i> in ' + monShort(MONTHS[0]) + ' &rarr; <b>' + fmtH(A.h) + '</b> in ' + monShort(m) + '; ePA share ' + pct(A0.epa) + ' &rarr; ' + pct(A.epa) + ' (network ' + fmtH(NET.h) + ')';
  } else {
    sub.innerHTML = '<b>' + esc(stName) + '</b> ePA share <i>' + pct(A0.epa) + '</i> in ' + monShort(MONTHS[0]) + ' &rarr; <b>' + pct(A.epa) + '</b> in ' + monShort(m) + '; turnaround ' + fmtH(A0.h) + ' &rarr; ' + fmtH(A.h) + ' (network ' + pct(NET.epa) + ')';
  }
  host.querySelector('.pr-month').textContent = monShort(m);
  host.querySelector('.pr-range').value = state.mi;

  // layout
  var sparkH = H > 300 ? 62 : 46, topPad = 18;
  var mainH = H - sparkH - topPad - 8;
  var dialR = Math.max(26, Math.min(56, Math.min(W * 0.12, mainH * 0.3)));
  var dialCx = dialR + 10, dialCy = topPad + mainH * 0.42;
  var x0 = dialCx + dialR + 26, x1 = W - 52, laneW = Math.max(60, x1 - x0);

  // ---- dial (24h clock)
  var g = svgEl('g', {}, svg);
  var val = state.metric === 'hours' ? A.h : A.epa, netVal = state.metric === 'hours' ? NET.h : NET.epa;
  var frac = state.metric === 'hours' ? Math.min(1, (val || 0) / 24) : val;
  var worse = state.metric === 'hours' ? (val || 0) > (netVal || 0) * 1.15 : val < netVal * 0.85;
  svgEl('circle', { cx: dialCx, cy: dialCy, r: dialR, fill: 'none', stroke: PAL.track, 'stroke-width': 8 }, g);
  for (var t = 0; t < 24; t += 3) {
    var a = t / 24 * Math.PI * 2 - Math.PI / 2;
    svgEl('line', { x1: dialCx + Math.cos(a) * (dialR - 12), y1: dialCy + Math.sin(a) * (dialR - 12), x2: dialCx + Math.cos(a) * (dialR - 7), y2: dialCy + Math.sin(a) * (dialR - 7), stroke: PAL.muted, 'stroke-width': 1 }, g);
  }
  var ae = frac * Math.PI * 2 - Math.PI / 2, large = frac > 0.5 ? 1 : 0;
  if (frac > 0.001) {
    var arcD = frac >= 0.999 ? 'M ' + dialCx + ' ' + (dialCy - dialR) + ' A ' + dialR + ' ' + dialR + ' 0 1 1 ' + (dialCx - 0.01) + ' ' + (dialCy - dialR)
      : 'M ' + dialCx + ' ' + (dialCy - dialR) + ' A ' + dialR + ' ' + dialR + ' 0 ' + large + ' 1 ' + (dialCx + Math.cos(ae) * dialR) + ' ' + (dialCy + Math.sin(ae) * dialR);
    svgEl('path', { d: arcD, fill: 'none', stroke: worse ? PAL.accent : PAL.primary, 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
  }
  svgEl('line', { x1: dialCx, y1: dialCy, x2: dialCx + Math.cos(ae) * (dialR - 14), y2: dialCy + Math.sin(ae) * (dialR - 14), stroke: PAL.fg, 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  svgEl('circle', { cx: dialCx, cy: dialCy, r: 3, fill: PAL.fg }, g);
  var tv = svgEl('text', { x: dialCx, y: dialCy + dialR + 18, 'text-anchor': 'middle', 'font-size': dialR > 40 ? 17 : 14, 'font-weight': 700, fill: worse ? PAL.accent : PAL.primary }, g);
  tv.textContent = state.metric === 'hours' ? fmtH(val) : pct(val);
  var tl = svgEl('text', { x: dialCx, y: dialCy + dialR + 32, 'text-anchor': 'middle', 'font-size': 10.5, fill: PAL.muted }, g);
  tl.textContent = state.metric === 'hours' ? 'time to decision' : 'ePA share';
  var tn = svgEl('text', { x: dialCx, y: dialCy - dialR - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: PAL.fg }, g);
  tn.textContent = stName.length > 12 ? stName.slice(0, 11) + '.' : stName;
  var dhit = svgEl('circle', { cx: dialCx, cy: dialCy, r: dialR + 6, fill: 'transparent' }, g);
  bindTip(dhit, function () { return '<b>' + esc(stName) + ', ' + monLabel(m) + '</b>Avg time to decision: ' + fmtH(A.h) + '<br>ePA share: ' + pct(A.epa) + '<br>PA requests: ' + A.n.toLocaleString() + '<br>Network: ' + fmtH(NET.h) + ', ePA ' + pct(NET.epa); });

  // ---- hop headers
  var lanesTop = topPad + 6, laneGap = (mainH - 6) / CFG.channels.length;
  var maxH = 0; MONTHS.forEach(function (mm) { var q = agg(mm, state.st); CFG.channels.forEach(function (ch) { if (q.ch[ch].h > maxH) maxH = q.ch[ch].h; }); });
  maxH = Math.max(maxH, 1);
  var lenOf = function (h) { return Math.max(26, laneW * Math.sqrt(Math.max(h || 0, 0.01) / maxH)); };
  var hdr = svgEl('g', {}, svg);
  var ht = svgEl('text', { x: x0, y: topPad - 4, 'font-size': 10, fill: PAL.muted, 'font-weight': 700 }, hdr);
  ht.textContent = laneW > 250 ? 'Relay: Prescriber > Network > PBM review > Decision (length = hours)' : 'Prescriber > Network > PBM > Decision';
  bindTip(ht, function () { return '<b>The prior-auth relay</b>Each lane is one submission channel. Stations: prescriber submits from the EHR, the request crosses the Surescripts network, the PBM reviews, the decision returns. Lane length = avg hours to decision (sqrt scale); orange hops stall over ' + CFG.stallHrs + 'h.'; });
  var lanes = [], totalN = Math.max(1, A.n);
  CFG.channels.forEach(function (ch, li) {
    var c = A.ch[ch], cy = lanesTop + laneGap * li + laneGap * 0.55, share = c.n / totalN;
    var th = 4 + 14 * Math.sqrt(share), len = c.h == null ? 0 : lenOf(c.h);
    var lg = svgEl('g', {}, svg);
    var ll = svgEl('text', { x: x0, y: cy - th / 2 - 5, 'font-size': 11, 'font-weight': 700, fill: PAL.fg }, lg);
    ll.textContent = CFG.short[ch] + ' \u00b7 ' + pct(share);
    bindTip(ll, function () { return '<b>' + esc(ch) + '</b>' + c.n.toLocaleString() + ' PA requests (' + pct(share) + ' of ' + esc(stName) + ')<br>Avg time to decision: ' + fmtH(c.h); });
    svgEl('rect', { x: x0, y: cy - th / 2, width: laneW, height: th, rx: th / 2, fill: PAL.track }, lg);
    if (!c.n || c.h == null) { lanes.push(null); return; }
    var sp = CFG.split[ch], xs = [x0], acc = 0;
    sp.forEach(function (s) { acc += s; xs.push(x0 + len * acc); });
    sp.forEach(function (s, si) {
      var hh = c.h * s, hot = hh >= CFG.stallHrs;
      var seg = svgEl('rect', { x: xs[si], y: cy - th / 2, width: Math.max(1.5, xs[si + 1] - xs[si]), height: th, fill: hot ? PAL.accent : rampAt(PAL.ramp, 0.25 + 0.75 * Math.min(1, Math.sqrt(hh / 12))), rx: si === 0 || si === 2 ? th / 2 : 0, opacity: 0.95 }, lg);
      if (hot) seg.setAttribute('class', 'pr-hot');
      bindTip(seg, function () { return '<b>' + esc(ch) + ': ' + CFG.hops[si] + ' &rarr; ' + CFG.hops[si + 1] + '</b>~' + fmtH(hh) + ' in this hop (' + pct(s) + ' of ' + fmtH(c.h) + ')' + (hot ? '<br>Stall: over ' + CFG.stallHrs + 'h' : ''); });
    });
    xs.forEach(function (x, si) {
      if (len < 44 && si > 0 && si < 3) return;
      var st = svgEl('circle', { cx: x, cy: cy, r: Math.max(3, th / 2 + 1.5), fill: PAL.bg, stroke: si === 3 ? PAL.primary : PAL.muted, 'stroke-width': 1.5 }, lg);
      bindTip(st, function () { return '<b>' + esc(ch) + ': ' + CFG.hops[si] + '</b>Elapsed: ' + fmtH(c.h * [0, sp[0], sp[0] + sp[1], 1][si]); });
    });
    var vt = svgEl('text', { x: Math.min(xs[3] + 9, W - 4), y: cy + 4, 'font-size': 11.5, 'font-weight': 700, fill: c.h >= CFG.stallHrs * 1.5 ? PAL.accent : PAL.primary, 'text-anchor': xs[3] + 9 > W - 44 ? 'end' : 'start' }, lg);
    vt.textContent = fmtH(c.h);
    if (xs[3] + 9 > W - 44) { vt.setAttribute('y', cy - th / 2 - 5); vt.setAttribute('x', W - 4); }
    bindTip(vt, function () { return '<b>' + esc(ch) + '</b>Avg time to decision ' + fmtH(c.h) + '<br>Network: ' + fmtH(NET.ch[ch].h); });
    lanes.push({ xs: xs, cy: cy, th: th, sp: sp, h: c.h, n: c.n });
  });

  // ---- particles (PA requests running the relay)
  var pg = svgEl('g', { 'pointer-events': 'none' }, svg), parts = [];
  lanes.forEach(function (L, li) {
    if (!L) return;
    var k = Math.max(1, Math.min(9, Math.round(L.n / Math.max(1, totalN) * 18)));
    for (var i = 0; i < k; i++) parts.push({ L: L, u: (i + Math.random() * 0.5) / k, el: svgEl('circle', { r: Math.max(2, Math.min(4, L.th / 3)), fill: PAL.bg, stroke: PAL.dot, 'stroke-width': 1.4 }, pg) });
  });
  function place(p) {
    var L = p.L, x = L.xs[0] + (L.xs[3] - L.xs[0]) * p.u;
    p.el.setAttribute('cx', x); p.el.setAttribute('cy', L.cy);
  }
  parts.forEach(place);
  var last = 0;
  function tick(ts) {
    var dt = last ? Math.min(60, ts - last) : 16; last = ts;
    parts.forEach(function (p) {
      var L = p.L, seg = p.u < L.sp[0] ? 0 : p.u < L.sp[0] + L.sp[1] ? 1 : 2, hh = L.h * L.sp[seg];
      var v = 0.00022 / (1 + hh / 3) * (laneW / Math.max(30, L.xs[3] - L.xs[0]));
      p.u += v * dt; if (p.u > 1) p.u -= 1;
      place(p);
    });
    raf = requestAnimationFrame(tick);
  }
  if (!reduce && parts.length) raf = requestAnimationFrame(tick);

  // ---- sparkline across months
  var sy0 = H - sparkH + 16, sy1 = H - 14, sx0 = 10, sx1 = W - 10;
  var sg = svgEl('g', {}, svg);
  svgEl('line', { x1: sx0, y1: sy1, x2: sx1, y2: sy1, stroke: PAL.line }, sg);
  var vals = MONTHS.map(function (mm) { var q = agg(mm, state.st), n2 = agg(mm, '__all'); return state.metric === 'hours' ? [q.h, n2.h] : [q.epa, n2.epa]; });
  var vmax = 0; vals.forEach(function (v) { vmax = Math.max(vmax, v[0] || 0, v[1] || 0); }); vmax = vmax || 1;
  var sxOf = function (i) { return sx0 + (sx1 - sx0) * (MONTHS.length > 1 ? i / (MONTHS.length - 1) : 0.5); };
  var syOf = function (v) { return sy1 - (sy1 - sy0) * (v || 0) / vmax; };
  [1, 0].forEach(function (k) {
    var d = vals.map(function (v, i) { return (i ? 'L' : 'M') + sxOf(i) + ' ' + syOf(v[k]); }).join(' ');
    svgEl('path', { d: d, fill: 'none', stroke: k ? PAL.muted : PAL.accent, 'stroke-width': k ? 1.4 : 2.2, 'stroke-dasharray': k ? '3 3' : 'none' }, sg);
  });
  var sl = svgEl('text', { x: sx0, y: sy0 - 8, 'font-size': 10, fill: PAL.muted }, sg);
  sl.textContent = (state.metric === 'hours' ? 'Time to decision' : 'ePA share') + ': ' + stName + ' vs network (dashed)';
  vals.forEach(function (v, i) {
    var cur = i === state.mi;
    var pt = svgEl('circle', { cx: sxOf(i), cy: syOf(v[0]), r: cur ? 4.5 : 2.6, fill: cur ? PAL.accent : PAL.bg, stroke: PAL.accent, 'stroke-width': 1.5 }, sg);
    var hit = svgEl('rect', { x: sxOf(i) - 8, y: sy0 - 4, width: 16, height: sy1 - sy0 + 8, fill: 'transparent' }, sg);
    var f = function () { return state.metric === 'hours' ? fmtH(v[0]) + ' (network ' + fmtH(v[1]) + ')' : pct(v[0]) + ' (network ' + pct(v[1]) + ')'; };
    bindTip(hit, function () { return '<b>' + esc(stName) + ', ' + monLabel(MONTHS[i]) + '</b>' + f() + '<br>Click to jump here'; });
    hit.addEventListener('click', function () { stop(); state.mi = i; render(); });
    if (cur || i === 0 || i === MONTHS.length - 1) {
      var ml = svgEl('text', { x: sxOf(i), y: sy1 + 11, 'text-anchor': i === 0 ? 'start' : i === MONTHS.length - 1 ? 'end' : 'middle', 'font-size': 9.5, fill: cur ? PAL.fg : PAL.muted }, sg);
      ml.textContent = monShort(MONTHS[i]);
    }
  });
  done();
}

function stop() { state.playing = false; clearInterval(playTimer); playTimer = 0; var b = host.querySelector('.pr-play'); if (b) b.innerHTML = '&#9654;'; }
function play() {
  if (state.playing) { stop(); return; }
  state.playing = true; host.querySelector('.pr-play').innerHTML = '&#10074;&#10074;';
  if (state.mi >= MONTHS.length - 1) { state.mi = 0; render(); }
  playTimer = setInterval(function () {
    if (state.mi >= MONTHS.length - 1) { stop(); return; }
    state.mi++; render();
  }, 1100);
}

function mount() {
  if (!host) return;
  if (!M_HRS || !A_MON || !A_CH || !rows.length) {
    empty('Bind this search: [PA Turnaround Hours] [PA Requests] [Transaction Date].monthly [State] [PA Channel] [PA Channel] != \'not a pa\' [Transaction Date] = \'last 12 months\' [Theme Mode]');
    return;
  }
  build();
  if (!MONTHS.length) { empty('No complete months of prior-auth data in this search.'); return; }
  var names = Object.keys(STATES).sort(function (a, b) { return STATES[b] - STATES[a]; });
  if (!A_ST) names = [];
  if (names.indexOf(CFG.defState) < 0) state.st = '__all';
  state.mi = MONTHS.length - 1;
  var opts = '<option value="__all">Network</option>' + names.map(function (s) { return '<option value="' + esc(s) + '"' + (s === state.st ? ' selected' : '') + '>' + esc(s) + '</option>'; }).join('');
  host.innerHTML = '<div class="pr-head"><p class="pr-title">' + esc(CFG.title) + '</p><p class="pr-sub"></p>' +
    '<div class="pr-ctl"><button class="pr-play" type="button" aria-label="Play months">&#9654;</button>' +
    '<input class="pr-range" type="range" min="0" max="' + (MONTHS.length - 1) + '" step="1" aria-label="Month">' +
    '<span class="pr-month"></span>' +
    '<label class="pr-pick"><select class="pr-state" aria-label="State">' + opts + '</select></label>' +
    '<label class="pr-pick"><select class="pr-metric" aria-label="Metric"><option value="hours">Turnaround</option><option value="epa">ePA share</option></select></label></div></div>' +
    '<div class="pr-stage"></div><div class="pr-tip"></div>';
  tip = host.querySelector('.pr-tip');
  tip.style.background = PAL.tipBg; tip.style.color = PAL.tipFg;
  host.querySelector('.pr-play').addEventListener('click', play);
  host.querySelector('.pr-range').addEventListener('input', function (e) { stop(); state.mi = Number(e.target.value); render(); });
  host.querySelector('.pr-state').addEventListener('change', function (e) { state.st = e.target.value; render(); });
  host.querySelector('.pr-metric').addEventListener('change', function (e) { state.metric = e.target.value; render(); });
  render();
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(function () {
      var s = host.querySelector('.pr-stage'); if (!s) return;
      if (Math.abs(s.clientWidth - lastW) > 2 || Math.abs(s.clientHeight - lastH) > 2) render();
    });
    ro.observe(host);
  }
}

try { mount(); } catch (err) {
  try { host.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;color:#c00;padding:8px">' + esc(err && err.stack || err) + '</pre>'; } catch (e) {}
  done();
}
