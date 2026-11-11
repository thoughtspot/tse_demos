// Lead Forensics visitor radar. Bespoke SVG, no chart library.
// Search: [Identified Visits] [Lead Score] [Traffic Source] [Lead Score Band] [Visit Date].monthly [Theme Mode]
// Sectors are traffic sources (width = share of the month's identified visits), rings are lead-score bands
// (Hot innermost), blips are identified companies. Play replays the last 12 months; the sweep arm lights blips.
var CFG = {
  title: 'Visitor radar',
  focus: 'AI Assistant',
  months: 12,
  bands: ['Hot', 'Warm', 'Cold'],
  blips: 240,
  brand: { primary: '#5400D4', accent: '#9B00FF', navy: '#071424', light: '#F1EAFE', hot: '#E30613', muted: '#8A8FA3',
    darkBg: '#14112B', darkLine: '#2D2750', darkPrimary: '#9B6BFF', darkAccent: '#C77DFF', darkHot: '#FF4D5E', darkMuted: '#6F6992' },
  short: { 'Organic Search': 'Organic search', 'Paid Search': 'Paid search', 'LinkedIn Ads': 'LinkedIn ads', 'AI Assistant': 'AI assistants',
    'Email Campaign': 'Email', 'Organic Social': 'Social', 'Display Retargeting': 'Retargeting' }
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[radar] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[radar] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(schema, re) { for (var i = 0; i < schema.length; i++) if (re.test(schema[i].name)) return schema[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtN(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
function pct(a, b) { return b ? (100 * a / b).toFixed(1) + '%' : '0%'; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n)) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function shortName(s) { return CFG.short[s] || s; }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rand(seed) { var x = seed || 1; return function () { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var measures = schema.filter(function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); });
var C = {
  src: colOf(schema, /source|channel/i), band: colOf(schema, /band|temperature/i), month: colOf(schema, /date|month/i), theme: colOf(schema, /theme/i),
  n: (measures.filter(function (c) { return !/score|average/i.test(c.name); })[0] || {}).name,
  score: (measures.filter(function (c) { return /score/i.test(c.name); })[0] || {}).name
};
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#EEEAF8', muted: '#A39DC0', line: B.darkLine, primary: B.darkPrimary, accent: B.darkAccent, hot: B.darkHot, cold: B.darkMuted, tipBg: '#EEEAF8', tipInk: B.navy, sweep: B.darkAccent }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#5E6478', line: '#E4DEF2', primary: B.primary, accent: B.accent, hot: B.hot, cold: '#A6A9BA', tipBg: B.navy, tipInk: '#FFFFFF', sweep: B.primary };
var BAND_COL = { Hot: P.hot, Warm: P.primary, Cold: P.cold };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--vr-primary', P.primary], ['--vr-line', P.line], ['--vr-muted', P.muted], ['--vr-ink', P.ink], ['--vr-accent', P.accent]].forEach(function (t) { root.style.setProperty(t[0], t[1]); });

var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// cube[month][source][band] = { n, scoreSum }
var cube = {}, monthsAll = [], sourceTot = {};
rows.forEach(function (r) {
  var m = toMs(r[C.month]), s = r[C.src], b = r[C.band], n = Number(r[C.n]) || 0, sc = Number(r[C.score]) || 0;
  if (m == null || s == null || b == null) return;
  if (!cube[m]) { cube[m] = {}; monthsAll.push(m); }
  if (!cube[m][s]) cube[m][s] = {};
  var c = cube[m][s][b] || (cube[m][s][b] = { n: 0, ss: 0 });
  c.n += n; c.ss += sc * n;
  sourceTot[s] = (sourceTot[s] || 0) + n;
});
monthsAll.sort(function (a, b) { return a - b; });
var months = monthsAll.slice(-CFG.months);
var sources = Object.keys(sourceTot).sort(function (a, b) { return sourceTot[b] - sourceTot[a]; });
var monthTotals = months.map(function (m) { var t = 0; for (var s in cube[m]) for (var b in cube[m][s]) t += cube[m][s][b].n; return t; });
var medTotal = monthTotals.slice().sort(function (a, b) { return a - b; })[Math.floor(monthTotals.length / 2)] || 0;
var state = { mi: months.length - 1, focus: sources.indexOf(CFG.focus) >= 0 ? CFG.focus : (sources[0] || ''), playing: false };
var anim = null, playTimer = null, angles = null, lastStage = null;

function monthStats(m) {
  var out = { total: 0, src: {} };
  sources.forEach(function (s) {
    var o = { n: 0, ss: 0, band: {} };
    CFG.bands.forEach(function (b) { var c = cube[m] && cube[m][s] && cube[m][s][b]; var n = c ? c.n : 0; o.band[b] = n; o.n += n; o.ss += c ? c.ss : 0; });
    out.src[s] = o; out.total += o.n;
  });
  return out;
}
function targetAngles(st) {
  var minA = 7, free = 360 - minA * sources.length, a = 0, out = {};
  sources.forEach(function (s) { var w = minA + free * (st.total ? st.src[s].n / st.total : 1 / sources.length); out[s] = [a, a + w]; a += w; });
  // rotate so the focus sector is centred at the top-right (45 deg) where its label has room
  var f = out[state.focus]; if (f) { var shift = 45 - (f[0] + f[1]) / 2; sources.forEach(function (s) { out[s] = [out[s][0] + shift, out[s][1] + shift]; }); }
  return out;
}

function stopAll() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
}

function render() {
  stopAll();
  root.innerHTML = '';
  if (!rows.length || !C.src || !C.band || !C.n || !months.length) {
    root.innerHTML = '<div class="vr-empty">No identified visits yet.<br>Bind the search: [Identified Visits] [Lead Score] [Traffic Source] [Lead Score Band] [Visit Date].monthly [Theme Mode]</div>';
    return;
  }
  var head = document.createElement('div'); head.className = 'vr-head'; root.appendChild(head);
  head.innerHTML = '<p class="vr-title">' + esc(CFG.title) + '</p><p class="vr-sub"></p>';
  var sub = head.querySelector('.vr-sub');
  var ctl = document.createElement('div'); ctl.className = 'vr-ctl'; head.appendChild(ctl);
  var play = document.createElement('button'); play.className = 'vr-play'; play.setAttribute('aria-label', 'Play the last 12 months'); ctl.appendChild(play);
  var range = document.createElement('input'); range.type = 'range'; range.className = 'vr-range'; range.min = '0'; range.max = String(months.length - 1); range.value = String(state.mi); range.setAttribute('aria-label', 'Month'); ctl.appendChild(range);
  var mlab = document.createElement('span'); mlab.className = 'vr-month'; ctl.appendChild(mlab);
  var pick = document.createElement('label'); pick.className = 'vr-pick'; pick.innerHTML = '<span>Focus</span>';
  var sel = document.createElement('select');
  sources.forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = shortName(s); if (s === state.focus) o.selected = true; sel.appendChild(o); });
  pick.appendChild(sel); ctl.appendChild(pick);

  var stage = document.createElement('div'); stage.className = 'vr-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'vr-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = '1';
    var rb = root.getBoundingClientRect(), x = ev.clientX - rb.left + 12, y = ev.clientY - rb.top + 12;
    if (x + tip.offsetWidth > rb.width - 4) x = ev.clientX - rb.left - tip.offsetWidth - 12;
    if (y + tip.offsetHeight > rb.height - 4) y = ev.clientY - rb.top - tip.offsetHeight - 12;
    tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  var W = stage.clientWidth || 480, H = stage.clientHeight || 340;
  lastStage = W + 'x' + H;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Visitor radar by traffic source and lead score band' }, stage);
  var R = Math.max(40, Math.min((W - 170) / 2, (H - 56) / 2));
  var cx = W / 2, cy = H / 2 + 2, ringR = [R * 0.36, R * 0.68, R];
  var D2R = Math.PI / 180;
  function pt(deg, r) { var a = deg * D2R; return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }; }
  function wedge(a1, a2, r0, r1) {
    var big = (a2 - a1) > 180 ? 1 : 0, p1 = pt(a1, r1), p2 = pt(a2, r1), p3 = pt(a2, r0), p4 = pt(a1, r0);
    return 'M' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1) + ' A' + r1 + ',' + r1 + ' 0 ' + big + ' 1 ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1) +
      ' L' + p3.x.toFixed(1) + ',' + p3.y.toFixed(1) + (r0 > 0 ? ' A' + r0 + ',' + r0 + ' 0 ' + big + ' 0 ' + p4.x.toFixed(1) + ',' + p4.y.toFixed(1) : '') + ' Z';
  }

  var defs = svgEl('defs', {}, svg);
  var grad = svgEl('radialGradient', { id: 'vr-glow', cx: '50%', cy: '50%', r: '50%' }, defs);
  svgEl('stop', { offset: '0%', 'stop-color': P.primary, 'stop-opacity': dark ? '0.22' : '0.10' }, grad);
  svgEl('stop', { offset: '100%', 'stop-color': P.primary, 'stop-opacity': '0' }, grad);
  svgEl('circle', { cx: cx, cy: cy, r: R, fill: 'url(#vr-glow)' }, svg);

  var gSect = svgEl('g', {}, svg), gGrid = svgEl('g', {}, svg), gBlip = svgEl('g', {}, svg), gSweep = svgEl('g', { 'pointer-events': 'none' }, svg), gLab = svgEl('g', { 'pointer-events': 'none' }, svg);
  ringR.forEach(function (r) { svgEl('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: P.line, 'stroke-width': 1 }, gGrid); });
  var bandLab = [['Hot', ringR[0] * 0.55], ['Warm', (ringR[0] + ringR[1]) / 2], ['Cold', (ringR[1] + ringR[2]) / 2]];
  var gBandLab = svgEl('g', { 'pointer-events': 'none' }, svg);
  bandLab.forEach(function (b) { var t = svgEl('text', { x: cx, y: cy + b[1] + 3, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: BAND_COL[b[0]], opacity: 0.85 }, gBandLab); t.textContent = b[0].toUpperCase(); });

  // sweep arm with a fading trail
  var trail = [], TRAIL = 6;
  for (var i = 0; i < TRAIL; i++) trail.push(svgEl('path', { fill: P.sweep, opacity: (0.16 * (1 - i / TRAIL)).toFixed(3) }, gSweep));
  var arm = svgEl('line', { x1: cx, y1: cy, stroke: P.sweep, 'stroke-width': 1.6, opacity: 0.9 }, gSweep);
  svgEl('circle', { cx: cx, cy: cy, r: 3, fill: P.sweep }, gSweep);

  var blips = [], sectEls = {}, labEls = {};
  function cellTip(s, b, st) {
    var o = st.src[s], n = b ? o.band[b] : o.n;
    var avg = o.n ? o.ss / o.n : 0;
    return '<b>' + esc(s) + (b ? ' - ' + esc(b) : '') + '</b>' + fmtN(n) + ' identified visits in ' + esc(monLabel(months[state.mi])) +
      '<br>' + pct(o.n, st.total) + ' of all visits' + (b ? '' : ', ' + pct(o.band.Hot, o.n) + ' hot') + '<br>Avg lead score ' + avg.toFixed(0);
  }

  function draw(st, ang) {
    gSect.innerHTML = ''; gBlip.innerHTML = ''; gLab.innerHTML = ''; blips = []; sectEls = {};
    var unit = Math.max(1, st.total / CFG.blips);
    sources.forEach(function (s, si) {
      var a = ang[s], isF = s === state.focus;
      var sec = svgEl('path', { d: wedge(a[0], a[1], 0, R), class: 'vr-sector', fill: isF ? P.accent : (si % 2 ? P.primary : 'transparent'), 'fill-opacity': isF ? (dark ? 0.2 : 0.12) : (dark ? 0.05 : 0.03), stroke: P.line, 'stroke-width': 1 }, gSect);
      sec.addEventListener('mousemove', function (ev) { showTip(cellTip(s, null, st), ev); });
      sec.addEventListener('mouseleave', hideTip);
      sec.addEventListener('click', function () { state.focus = s; sel.value = s; update(true); });
      sectEls[s] = sec;
      // blips
      CFG.bands.forEach(function (b, bi) {
        var k = Math.round(st.src[s].band[b] / unit), r0 = bi ? ringR[bi - 1] : 6, r1 = ringR[bi];
        var rnd = rand(hash(s + '|' + b) || 7), span = a[1] - a[0], pad = Math.min(2.5, span * 0.15);
        for (var j = 0; j < k; j++) {
          var aa = a[0] + pad + (span - 2 * pad) * rnd(), rr = r0 + 3 + (r1 - r0 - 6) * Math.sqrt(rnd()), p = pt(aa, rr);
          var big = b === 'Hot' ? 2.9 : b === 'Warm' ? 2.4 : 2;
          var c = svgEl('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: big, fill: BAND_COL[b], opacity: 0.55 }, gBlip);
          (function (s, b) {
            c.addEventListener('mousemove', function (ev) { c.setAttribute('r', big + 2); showTip(cellTip(s, b, st), ev); });
            c.addEventListener('mouseleave', function () { c.setAttribute('r', big); hideTip(); });
          })(s, b);
          blips.push({ el: c, a: ((aa % 360) + 360) % 360, base: isF ? 0.8 : 0.5 });
        }
      });
      // label
      var mid = (a[0] + a[1]) / 2, show = isF || (a[1] - a[0]) >= 16;
      if (show) {
        var lp = pt(mid, R + 10), nm = ((mid % 360) + 360) % 360;
        var anchor = nm > 10 && nm < 170 ? 'start' : nm > 190 && nm < 350 ? 'end' : 'middle';
        var dy = nm > 100 && nm < 260 ? 11 : 0;
        var t = svgEl('text', { x: lp.x.toFixed(1), y: (lp.y + dy).toFixed(1), 'text-anchor': anchor, 'font-size': isF ? 11.5 : 10.5, 'font-weight': isF ? 700 : 600, fill: isF ? P.accent : P.muted }, gLab);
        t.textContent = shortName(s) + (isF ? ' ' + pct(st.src[s].n, st.total) : '');
      }
    });
    gBlip.parentNode.appendChild(gBandLab);
  }

  var sweepA = 0, cur = null, last = 0;
  function frame(ts) {
    var dt = last ? Math.min(64, ts - last) : 16; last = ts;
    sweepA = (sweepA + dt * 0.09) % 360;
    paintSweep();
    anim = requestAnimationFrame(frame);
  }
  function paintSweep() {
    var p = pt(sweepA, R); arm.setAttribute('x2', p.x.toFixed(1)); arm.setAttribute('y2', p.y.toFixed(1));
    for (var i = 0; i < TRAIL; i++) trail[i].setAttribute('d', wedge(sweepA - (i + 1) * 6, sweepA - i * 6, 0, R));
    for (var k = 0; k < blips.length; k++) {
      var d = (sweepA - blips[k].a + 360) % 360, glow = d < 50 ? 1 - d / 50 : 0;
      blips[k].el.setAttribute('opacity', Math.min(1, blips[k].base + 0.5 * glow).toFixed(2));
    }
  }

  function subline(st) {
    var m = months[state.mi], f = st.src[state.focus] || { n: 0 };
    var first = monthStats(months[0]), f0 = first.src[state.focus] || { n: 0 };
    var partial = state.mi === months.length - 1 && monthTotals[state.mi] < 0.7 * medTotal;
    var d = (first.total ? 100 * f.n / st.total - 100 * f0.n / first.total : 0);
    sub.innerHTML = esc(monLabel(m)) + (partial ? ' (to date)' : '') + ': ' + fmtN(st.total) + ' identified visits. <b>' + esc(shortName(state.focus)) + ' ' + pct(f.n, st.total) + '</b>' +
      (state.mi > 0 ? ' (' + (d >= 0 ? '+' : '') + d.toFixed(1) + ' pts since ' + esc(monLabel(months[0])) + ')' : '');
    mlab.textContent = monLabel(m);
  }

  var tween = null;
  function update(animate) {
    var st = monthStats(months[state.mi]), target = targetAngles(st);
    subline(st);
    if (tween) { cancelAnimationFrame(tween); tween = null; }
    if (!animate || reduced || !angles) { angles = target; draw(st, angles); if (reduced) paintSweep(); return; }
    var from = angles, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var u = Math.min(1, (ts - t0) / 450), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, mix = {};
      sources.forEach(function (s) { mix[s] = [from[s][0] + (target[s][0] - from[s][0]) * e, from[s][1] + (target[s][1] - from[s][1]) * e]; });
      angles = mix; draw(st, mix);
      if (u < 1) tween = requestAnimationFrame(step); else { angles = target; draw(st, target); tween = null; }
    }
    tween = requestAnimationFrame(step);
  }

  function setPlay(on) {
    state.playing = on; play.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if (on) {
      if (state.mi >= months.length - 1) { state.mi = 0; range.value = '0'; update(true); }
      playTimer = setInterval(function () {
        if (state.mi >= months.length - 1) { setPlay(false); return; }
        state.mi++; range.value = String(state.mi); update(true);
      }, reduced ? 1400 : 900);
    }
  }
  play.addEventListener('click', function () { setPlay(!state.playing); });
  range.addEventListener('input', function () { setPlay(false); state.mi = Number(range.value); update(true); });
  sel.addEventListener('change', function () { state.focus = sel.value; update(true); });

  setPlay(false);
  update(false);
  paintSweep();
  if (!reduced) anim = requestAnimationFrame(frame);
}

try {
  render();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      var st = root.querySelector('.vr-stage');
      var key = st ? st.clientWidth + 'x' + st.clientHeight : '';
      if (st && key !== lastStage) { angles = null; render(); }
    }).observe(root);
  }
  done();
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#E30613">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
