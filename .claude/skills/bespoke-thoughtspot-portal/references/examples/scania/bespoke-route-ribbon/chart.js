// Scania route ribbon. Bespoke SVG, no chart library.
// Search: [Idle Share] [Fuel per 100 km] [Distance (km)] [Country] [Application] [Shift Date].monthly [Shift Date] = 'last 12 months' [Theme Mode]
// One road per country. Ribbon thickness = km driven that month, colour = idle share (or L/100 km) on the Scania blue ramp;
// hot months (well above the fleet median) glow Scania red. A truck drives each road; Play walks the months.
var CFG = {
  title: 'Route ribbon: where idling burns fuel',
  app: 'Long Haulage',
  maxLanes: 8,
  short: { 'United Kingdom': 'UK', 'Switzerland': 'Switzerl.', 'Netherlands': 'Netherl.' },
  hotIdle: 1.6,
  hotFuel: 1.07,
  brand: {
    light: { bg: '#FFFFFF', fg: '#041E42', muted: '#56657A', grid: '#DCE3EE', road: '#F1F4F9', dash: '#FFFFFF', primary: '#16417F', accent: '#D6001C', ramp: ['#E6EEF9', '#7FA6DD', '#2058A8', '#041E42'], tipBg: '#041E42', tipFg: '#FFFFFF', truck: '#041E42' },
    dark: { bg: '#0F1726', fg: '#E8EEF7', muted: '#93A3BA', grid: '#26324A', road: '#152036', dash: '#0F1726', primary: '#7FA6DD', accent: '#FF3B4E', ramp: ['#1B2B47', '#2C5597', '#5B8FDB', '#BFD4F2'], tipBg: '#E8EEF7', tipFg: '#0F1726', truck: '#E8EEF7' }
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[ribbon] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: (raw && raw.schema) || [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[ribbon] live data unavailable', e); return { schema: [], rows: [] }; }
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtK(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n) || String(v).indexOf('-') > 0) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function monShort(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + " '" + String(d.getUTCFullYear()).slice(2); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(',') + ')'; }
function rampAt(R, t) { t = Math.max(0, Math.min(1, t)); var s = t * (R.length - 1), i = Math.min(R.length - 2, Math.floor(s)); return mix(R[i], R[i + 1], s - i); }
function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var isMeas = function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); };
var measures = schema.filter(isMeas), attrs = schema.filter(function (c) { return !isMeas(c); });
var M_IDLE = (measures.filter(function (c) { return /idl/i.test(c.name); })[0] || {}).name;
var M_FUEL = (measures.filter(function (c) { return c.name !== M_IDLE && /fuel|100 ?km/i.test(c.name); })[0] || {}).name;
var M_KM = (measures.filter(function (c) { return c.name !== M_IDLE && c.name !== M_FUEL && /distance|km/i.test(c.name); })[0] || {}).name;
var A_TH = (attrs.filter(function (c) { return /theme/i.test(c.name); })[0] || {}).name;
var A_MON = (attrs.filter(function (c) { return /\(.*date.*\)|month/i.test(c.name) && !/theme/i.test(c.name); })[0] || {}).name;
var A_CTRY = (attrs.filter(function (c) { return /country|region|depot/i.test(c.name); })[0] || {}).name;
var A_APP = (attrs.filter(function (c) { return /application|segment/i.test(c.name); })[0] || {}).name;
var dark = !!A_TH && rows.length > 0 && String(rows[0][A_TH]).toLowerCase() === 'dark';
var P = dark ? CFG.brand.dark : CFG.brand.light;
var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
root.style.background = P.bg; root.style.color = P.fg;
[['--rr-muted', P.muted], ['--rr-primary', P.primary], ['--rr-accent', P.accent], ['--rr-ink', P.fg], ['--rr-line', P.grid]].forEach(function (kv) { root.style.setProperty(kv[0], kv[1]); });

var state = { app: null, metric: 'idle', cur: -1, playing: false };
var playTimer = null, truckAnim = null;

function stopAll() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  if (truckAnim) { cancelAnimationFrame(truckAnim); truckAnim = null; }
  state.playing = false;
}

function render() {
  stopAll();
  root.innerHTML = '';
  if (!rows.length || !M_IDLE || !A_CTRY || !A_MON || !M_KM) {
    root.innerHTML = '<div class="rr-empty"><b>' + esc(CFG.title) + '</b><br>Bind the search: [Idle Share] [Fuel per 100 km] [Distance (km)] [Country] [Application] [Shift Date].monthly [Theme Mode]</div>';
    done();
    return;
  }
  var apps = {};
  rows.forEach(function (r) { var a = A_APP ? String(r[A_APP]) : 'All'; apps[a] = (apps[a] || 0) + (Number(r[M_KM]) || 0); });
  var appList = Object.keys(apps).sort(function (a, b) { return apps[b] - apps[a]; });
  if (!state.app || appList.indexOf(state.app) < 0) state.app = appList.indexOf(CFG.app) >= 0 ? CFG.app : appList[0];
  if (state.metric === 'fuel' && !M_FUEL) state.metric = 'idle';
  var MK = state.metric === 'idle' ? M_IDLE : M_FUEL;

  // ---- cube for the selected application: country -> month -> {v, idle, fuel, km}
  var cube = {}, monKm = {};
  rows.forEach(function (r) {
    if (A_APP && String(r[A_APP]) !== state.app) return;
    var c = String(r[A_CTRY]), m = toMs(r[A_MON]); if (m == null) return;
    var km = Number(r[M_KM]) || 0;
    (cube[c] = cube[c] || {})[m] = { idle: r[M_IDLE] == null ? null : Number(r[M_IDLE]), fuel: M_FUEL && r[M_FUEL] != null ? Number(r[M_FUEL]) : null, km: km };
    monKm[m] = (monKm[m] || 0) + km;
  });
  var mons = Object.keys(monKm).map(Number).sort(function (a, b) { return a - b; });
  var medKm = median(mons.map(function (m) { return monKm[m]; }));
  mons = mons.filter(function (m) { return monKm[m] >= 0.4 * medKm; });
  if (!mons.length) { root.innerHTML = '<div class="rr-empty">No complete months for ' + esc(state.app) + '</div>'; done(); return; }
  if (state.cur < 0 || state.cur >= mons.length) state.cur = mons.length - 1;
  var key = state.metric;
  var vals = [];
  Object.keys(cube).forEach(function (c) { mons.forEach(function (m) { var x = cube[c][m]; if (x && x[key] != null && x[key] > 0) vals.push(x[key]); }); });
  if (!vals.length) { root.innerHTML = '<div class="rr-empty">No ' + esc(MK) + ' for ' + esc(state.app) + '</div>'; done(); return; }
  var vMin = Math.min.apply(null, vals), vMax = Math.max.apply(null, vals), vMed = median(vals);
  var hotAt = vMed * (key === 'idle' ? CFG.hotIdle : CFG.hotFuel);
  function isHot(v) { return v != null && v >= hotAt; }
  function fmtV(v, k) { if (v == null) return 'n/a'; return (k || key) === 'idle' ? (100 * v).toFixed(1) + '%' : v.toFixed(1) + ' L'; }

  // ---- lanes: hottest latest value first, capped
  var last = mons[mons.length - 1];
  var lanes = Object.keys(cube).map(function (c) {
    var tot = 0; mons.forEach(function (m) { tot += cube[c][m] ? cube[c][m].km : 0; });
    var lv = cube[c][last] ? cube[c][last][key] : null;
    return { c: c, km: tot, lv: lv };
  }).filter(function (l) { return l.km > 0 && l.lv != null && l.lv > 0; });
  lanes.sort(function (a, b) { return b.lv - a.lv; });
  lanes = lanes.slice(0, CFG.maxLanes);

  // story line: lane with the biggest rise first -> last
  var best = null;
  lanes.forEach(function (l) {
    var f = null, z = null;
    mons.forEach(function (m) { var x = cube[l.c][m]; if (x && x[key] != null && x[key] > 0) { if (f == null) f = x[key]; z = x[key]; } });
    if (f != null && (!best || (z - f) > best.d)) best = { c: l.c, f: f, z: z, d: z - f };
  });

  // ---- header
  var head = document.createElement('div'); head.className = 'rr-head';
  var sub = best && best.d > 0 ? '<b>' + esc(best.c) + '</b> ' + (key === 'idle' ? 'idle share' : 'fuel use') + ' up from ' + fmtV(best.f) + ' to <i>' + fmtV(best.z) + '</i>; fleet median ' + fmtV(vMed) + '. Red = hot spot.' : 'Fleet median ' + fmtV(vMed) + '. Red = hot spot.';
  head.innerHTML = '<p class="rr-title">' + esc(CFG.title) + '</p><p class="rr-sub">' + sub + '</p>' +
    '<div class="rr-ctl"><button class="rr-play" aria-label="Play months" title="Play">&#9654;</button>' +
    '<input class="rr-range" type="range" min="0" max="' + (mons.length - 1) + '" value="' + state.cur + '" aria-label="Month">' +
    '<span class="rr-month"></span>' +
    '<label class="rr-pick"><select class="rr-app" aria-label="Application">' + appList.map(function (a) { return '<option' + (a === state.app ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</select></label>' +
    (M_FUEL ? '<label class="rr-pick"><select class="rr-met" aria-label="Metric"><option value="idle"' + (key === 'idle' ? ' selected' : '') + '>Idle share</option><option value="fuel"' + (key === 'fuel' ? ' selected' : '') + '>L/100 km</option></select></label>' : '') +
    '</div>';
  root.appendChild(head);
  var stage = document.createElement('div'); stage.className = 'rr-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'rr-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipFg; root.appendChild(tip);

  var W = stage.clientWidth || 500, H = stage.clientHeight || 330;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': CFG.title }, stage);
  var defs = svgEl('defs', {}, svg);
  var glow = svgEl('filter', { id: 'rrGlow', x: '-20%', y: '-60%', width: '140%', height: '220%' }, defs);
  svgEl('feGaussianBlur', { stdDeviation: '3', result: 'b' }, glow);
  var lg = svgEl('linearGradient', { id: 'rrRamp', x1: '0', x2: '1', y1: '0', y2: '0' }, defs);
  P.ramp.forEach(function (c, i) { svgEl('stop', { offset: (i / (P.ramp.length - 1)), 'stop-color': c }, lg); });

  var labW = Math.min(104, Math.max(70, W * 0.2)), valW = 62;
  var x0 = labW, x1 = W - valW, top = 6, bottom = 34;
  var laneH = Math.max(18, (H - top - bottom) / Math.max(1, lanes.length));
  var maxKm = 0; lanes.forEach(function (l) { mons.forEach(function (m) { var x = cube[l.c][m]; if (x) maxKm = Math.max(maxKm, x.km); }); });
  var step = mons.length > 1 ? (x1 - x0) / (mons.length - 1) : 0;
  function xm(i) { return mons.length > 1 ? x0 + i * step : (x0 + x1) / 2; }
  function thick(km) { return Math.max(3, Math.sqrt(km / (maxKm || 1)) * laneH * 0.62); }
  function colorOf(v) { return v == null ? P.grid : rampAt(P.ramp, (v - vMin) / ((hotAt - vMin) || 1)); }

  var gRoads = svgEl('g', {}, svg), gHot = svgEl('g', {}, svg), gTrucks = svgEl('g', {}, svg), gLab = svgEl('g', {}, svg);
  var segEls = [], trucks = [], valEls = [];

  lanes.forEach(function (l, li) {
    var cy = top + laneH * (li + 0.5);
    svgEl('rect', { x: x0 - 6, y: cy - laneH * 0.36, width: x1 - x0 + 12, height: laneH * 0.72, rx: laneH * 0.36, fill: P.road }, gRoads);
    var t = svgEl('text', { x: 4, y: cy + 4, 'font-size': '12', 'font-weight': '700', fill: P.fg }, gLab); var nm = (W < 480 && CFG.short[l.c]) || l.c; t.textContent = nm.length > 14 ? nm.slice(0, 13) + '.' : nm;
    for (var i = 0; i < mons.length - 1 || (mons.length === 1 && i === 0); i++) {
      var a = cube[l.c][mons[i]], b = cube[l.c][mons[Math.min(i + 1, mons.length - 1)]];
      var ta = thick(a ? a.km : 0) / 2, tb = thick(b ? b.km : 0) / 2;
      var xa = xm(i), xb = mons.length > 1 ? xm(i + 1) : x1;
      var xc = (xa + xb) / 2;
      var d = 'M' + xa + ',' + (cy - ta) + ' C' + xc + ',' + (cy - ta) + ' ' + xc + ',' + (cy - tb) + ' ' + xb + ',' + (cy - tb) +
        ' L' + xb + ',' + (cy + tb) + ' C' + xc + ',' + (cy + tb) + ' ' + xc + ',' + (cy + ta) + ' ' + xa + ',' + (cy + ta) + ' Z';
      var v = b ? b[key] : null;
      var hot = isHot(v);
      if (hot) segEls.push({ i: i + 1, el: svgEl('path', { d: d, fill: P.accent, opacity: 0.85, filter: 'url(#rrGlow)', 'class': reduced ? '' : 'rr-hot' }, gHot), hotGlow: true });
      var p = svgEl('path', { d: d, fill: hot ? P.accent : colorOf(v), 'class': 'rr-hit' }, gRoads);
      (function (c, mi, cell) {
        p.addEventListener('mousemove', function (ev) { showTip(ev, c, mi, cell); });
        p.addEventListener('mouseleave', hideTip);
      })(l.c, i + 1, b);
      segEls.push({ i: i + 1, el: p });
    }
    // centre dashes (the road marking)
    svgEl('line', { x1: x0, x2: x1, y1: cy, y2: cy, stroke: P.dash, 'stroke-width': 1.2, 'stroke-dasharray': '5 6', opacity: 0.75, 'pointer-events': 'none' }, gRoads);
    // truck
    var g = svgEl('g', { 'pointer-events': 'none' }, gTrucks);
    svgEl('rect', { x: -11, y: -5, width: 13, height: 9, rx: 1.5, fill: P.truck }, g);
    svgEl('path', { d: 'M2,-3 L7,-3 L10,0 L10,4 L2,4 Z', fill: P.truck }, g);
    svgEl('rect', { x: 6, y: -2, width: 2.6, height: 2.4, fill: P.bg }, g);
    svgEl('circle', { cx: -7, cy: 5, r: 1.9, fill: P.bg, stroke: P.truck, 'stroke-width': 1 }, g);
    svgEl('circle', { cx: 6, cy: 5, r: 1.9, fill: P.bg, stroke: P.truck, 'stroke-width': 1 }, g);
    trucks.push({ g: g, cy: cy, lane: l, x: xm(state.cur) });
    var vt = svgEl('text', { x: W - 2, y: cy + 4, 'text-anchor': 'end', 'font-size': '12', 'font-weight': '700' }, gLab);
    valEls.push({ el: vt, lane: l });
  });

  // month axis + legend
  var ay = top + laneH * lanes.length + 14;
  [0, Math.floor((mons.length - 1) / 2), mons.length - 1].forEach(function (i, k, arr) {
    if (k > 0 && i === arr[k - 1]) return;
    var t = svgEl('text', { x: xm(i), y: ay, 'text-anchor': i === 0 ? 'start' : i === mons.length - 1 ? 'end' : 'middle', 'font-size': '11', fill: P.muted }, gLab);
    t.textContent = monShort(mons[i]);
  });
  var ly = ay + 10, lw = Math.min(110, (x1 - x0) * 0.4);
  svgEl('rect', { x: x0, y: ly, width: lw, height: 6, rx: 3, fill: 'url(#rrRamp)' }, gLab);
  var lt1 = svgEl('text', { x: x0 - 4, y: ly + 6, 'text-anchor': 'end', 'font-size': '10.5', fill: P.muted }, gLab); lt1.textContent = fmtV(vMin);
  var lt2 = svgEl('text', { x: x0 + lw + 4, y: ly + 6, 'font-size': '10.5', fill: P.muted }, gLab); lt2.textContent = fmtV(hotAt);
  var hx = x0 + lw + 50;
  svgEl('rect', { x: hx, y: ly, width: 12, height: 6, rx: 3, fill: P.accent }, gLab);
  var lt3 = svgEl('text', { x: hx + 16, y: ly + 6, 'font-size': '10.5', fill: P.muted }, gLab); lt3.textContent = 'hot spot';
  var lt4 = svgEl('text', { x: W - 2, y: ly + 6, 'text-anchor': 'end', 'font-size': '10.5', fill: P.muted }, gLab); lt4.textContent = 'width = km driven';

  var monthEl = head.querySelector('.rr-month'), range = head.querySelector('.rr-range'), play = head.querySelector('.rr-play');

  function paint(animateTrucks) {
    monthEl.textContent = monShort(mons[state.cur]);
    range.value = state.cur;
    segEls.forEach(function (s) { s.el.style.opacity = s.i <= state.cur ? (s.hotGlow ? '' : '1') : '0.12'; if (s.hotGlow) s.el.style.display = s.i <= state.cur ? '' : 'none'; });
    valEls.forEach(function (v) {
      var x = cube[v.lane.c][mons[state.cur]], val = x ? x[key] : null;
      v.el.textContent = fmtV(val); v.el.setAttribute('fill', isHot(val) ? P.accent : P.fg);
    });
    var target = xm(state.cur);
    if (!animateTrucks || reduced) { trucks.forEach(function (t) { t.x = target; t.g.setAttribute('transform', 'translate(' + target + ',' + t.cy + ')'); }); return; }
    var from = trucks.map(function (t) { return t.x; }), t0 = null;
    if (truckAnim) cancelAnimationFrame(truckAnim);
    function stepF(ts) {
      if (t0 == null) t0 = ts;
      var k = Math.min(1, (ts - t0) / 520), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      trucks.forEach(function (t, i) { t.x = from[i] + (target - from[i]) * e; t.g.setAttribute('transform', 'translate(' + t.x + ',' + t.cy + ')'); });
      truckAnim = k < 1 ? requestAnimationFrame(stepF) : null;
    }
    truckAnim = requestAnimationFrame(stepF);
  }
  function showTip(ev, c, mi, cell) {
    var r = root.getBoundingClientRect();
    tip.innerHTML = '<b>' + esc(c) + ' &middot; ' + monLabel(mons[mi]) + '</b>' + esc(state.app) +
      '<br>Idle share: ' + fmtV(cell ? cell.idle : null, 'idle') +
      (M_FUEL ? '<br>Fuel: ' + (cell && cell.fuel != null ? cell.fuel.toFixed(1) + ' L/100 km' : 'n/a') : '') +
      '<br>Distance: ' + fmtK(cell ? cell.km : 0) + ' km' + (cell && isHot(cell[key]) ? '<br><span style="color:' + (dark ? '#B00016' : '#FF8A95') + ';font-weight:700">Hot spot: ' + fmtV(cell[key]) + ' vs median ' + fmtV(vMed) + '</span>' : '');
    var x = ev.clientX - r.left + 12, y = ev.clientY - r.top + 12;
    tip.style.opacity = '1';
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > r.width - 4) x = ev.clientX - r.left - tw - 12;
    if (y + th > r.height - 4) y = ev.clientY - r.top - th - 12;
    tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  range.addEventListener('input', function () { stopPlay(); state.cur = +range.value; paint(true); });
  function stopPlay() { if (playTimer) { clearInterval(playTimer); playTimer = null; } state.playing = false; play.innerHTML = '&#9654;'; }
  play.addEventListener('click', function () {
    if (state.playing) { stopPlay(); return; }
    state.playing = true; play.innerHTML = '&#10074;&#10074;';
    if (state.cur >= mons.length - 1) state.cur = 0;
    paint(false);
    playTimer = setInterval(function () {
      if (state.cur >= mons.length - 1) { stopPlay(); return; }
      state.cur++; hideTip(); paint(true);
    }, 700);
  });
  head.querySelector('.rr-app').addEventListener('change', function (e) { state.app = e.target.value; state.cur = -1; render(); });
  var met = head.querySelector('.rr-met');
  if (met) met.addEventListener('change', function (e) { state.metric = e.target.value; render(); });
  paint(false);
  done();
}

try {
  render();
  var lastW = 0, lastH = 0;
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      var w = root.clientWidth, h = root.clientHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h; render();
    }).observe(root);
  }
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#D6001C">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
