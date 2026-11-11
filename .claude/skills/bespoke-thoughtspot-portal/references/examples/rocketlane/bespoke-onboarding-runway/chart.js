// Rocketlane onboarding runway. Bespoke SVG, no chart library.
// Search: [Overdue Rate] [Tasks] [Customer Segment] [Project Phase] [Task Start Date].monthly [Task Start Date] = 'last 12 months' [Theme Mode]
// Seven phase chevrons form a runway; one lane per customer segment. Cell heat = overdue rate, hatched + orange edge
// when 25% or more of the tasks run late. Project markers taxi along each lane and stall in hot cells.
// Play walks the last 12 months.
var CFG = {
  title: 'Onboarding runway',
  focus: 'Enterprise',
  hot: 0.25,
  order: ['Enterprise', 'Mid-Market', 'SMB'],
  short: { 'Kickoff': 'Kickoff', 'Discovery': 'Discovery', 'Configuration': 'Config', 'Data Migration': 'Migration', 'Testing & UAT': 'UAT', 'Go-Live': 'Go-Live', 'Hypercare': 'Hypercare' },
  brand: {
    light: { bg: '#FFFFFF', fg: '#1D1D1F', muted: '#5B6472', grid: '#E3E8F2', primary: '#0F62FE', primaryDark: '#0A3A99', accent: '#FF7832', ramp: ['#EEF3FF', '#B9CEFF', '#5C8EFF', '#0F62FE', '#0A3A99'], dot: '#1D1D1F', tipBg: '#1D1D1F', tipFg: '#FFFFFF', lane: '#F5F7FB' },
    dark: { bg: '#161A22', fg: '#E7ECF2', muted: '#93A0B4', grid: '#2A3140', primary: '#6EA0FF', primaryDark: '#9DBDFF', accent: '#FF8F52', ramp: ['#1C2433', '#22386A', '#2D5BC4', '#4C86FF', '#9DBDFF'], dot: '#E7ECF2', tipBg: '#E7ECF2', tipFg: '#161A22', lane: '#1B2029' }
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
function done() {
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[runway] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: (raw && raw.schema) || [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[runway] live data unavailable', e); return { schema: [], rows: [] }; }
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtN(n) { return n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
function pct(r) { return (100 * r).toFixed(1) + '%'; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n) || String(v).indexOf('-') > 0) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }).join(',') + ')'; }
function rampAt(R, t) { t = Math.max(0, Math.min(1, t)); var s = t * (R.length - 1), i = Math.min(R.length - 2, Math.floor(s)); return mix(R[i], R[i + 1], s - i); }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var isMeas = function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); };
var measures = schema.filter(isMeas), attrs = schema.filter(function (c) { return !isMeas(c); });
var M_RATE = (measures.filter(function (c) { return /overdue/i.test(c.name) && /rate/i.test(c.name); })[0] || {}).name;
var M_TASK = (measures.filter(function (c) { return c.name !== M_RATE && /task/i.test(c.name); })[0] || {}).name;
var A_TH = (attrs.filter(function (c) { return /theme/i.test(c.name); })[0] || {}).name;
var A_MON = (attrs.filter(function (c) { return /\(.*date.*\)|month/i.test(c.name) && !/theme/i.test(c.name); })[0] || {}).name;
var A_SEG = (attrs.filter(function (c) { return /segment/i.test(c.name); })[0] || {}).name;
var A_PH = (attrs.filter(function (c) { return /phase/i.test(c.name); })[0] || {}).name;
var dark = !!A_TH && rows.length > 0 && String(rows[0][A_TH]).toLowerCase() === 'dark';
var P = dark ? CFG.brand.dark : CFG.brand.light;
var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
root.style.background = P.bg; root.style.color = P.fg;
[['--rw-muted', P.muted], ['--rw-primary', P.primary], ['--rw-accent', P.accent], ['--rw-ink', P.fg], ['--rw-line', P.grid]].forEach(function (kv) { root.style.setProperty(kv[0], kv[1]); });

var anim = null, playTimer = null, lastStage = '';

function render() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  root.innerHTML = '';
  if (!rows.length || !M_RATE || !A_SEG || !A_PH || !A_MON) {
    root.innerHTML = '<div class="rw-empty"><b>' + CFG.title + '</b><br>Bind the search: [Overdue Rate] [Tasks] [Customer Segment] [Project Phase] [Task Start Date].monthly [Theme Mode]</div>';
    return;
  }
  // ---- data cube: month -> segment -> phase -> {rate, n}
  var cube = {}, monSet = {}, segSet = {}, phSet = {};
  rows.forEach(function (r) {
    var ms = toMs(r[A_MON]); if (ms == null) return;
    var s = String(r[A_SEG]), p = String(r[A_PH]), rate = Number(r[M_RATE]) || 0, n = M_TASK ? Number(r[M_TASK]) || 0 : 1;
    monSet[ms] = 1; segSet[s] = 1; phSet[p] = 1;
    cube[ms] = cube[ms] || {}; cube[ms][s] = cube[ms][s] || {};
    cube[ms][s][p] = { rate: rate, n: n };
  });
  var months = Object.keys(monSet).map(Number).sort(function (a, b) { return a - b; });
  var phases = Object.keys(phSet).sort();
  var segs = CFG.order.filter(function (s) { return segSet[s]; }).concat(Object.keys(segSet).filter(function (s) { return CFG.order.indexOf(s) < 0; }).sort());
  function phName(p) { var b = String(p).replace(/^\d+\.\s*/, ''); return CFG.short[b] || b; }
  function cell(ms, s, p) { return (cube[ms] && cube[ms][s] && cube[ms][s][p]) || { rate: 0, n: 0 }; }
  function laneRate(ms, s) { var o = 0, n = 0; phases.forEach(function (p) { var c = cell(ms, s, p); o += c.rate * c.n; n += c.n; }); return { rate: n ? o / n : 0, n: n }; }
  var maxRate = 0.4; rows.forEach(function (r) { var v = Number(r[M_RATE]) || 0; if (v > maxRate) maxRate = Math.min(0.6, v); });
  var focus = segSet[CFG.focus] ? CFG.focus : segs[0];
  var state = { mi: months.length - 1, seg: 'All', playing: false };

  // ---- shell
  var head = document.createElement('div'); head.className = 'rw-head';
  head.innerHTML = '<p class="rw-title">' + CFG.title + '</p><p class="rw-sub"></p>' +
    '<div class="rw-ctl"><button class="rw-play" aria-label="Play months">&#9654;</button>' +
    '<input class="rw-range" type="range" min="0" max="' + (months.length - 1) + '" value="' + (months.length - 1) + '" aria-label="Month">' +
    '<span class="rw-month"></span><label class="rw-pick">Segment <select></select></label></div>';
  root.appendChild(head);
  var sub = head.querySelector('.rw-sub'), play = head.querySelector('.rw-play'), range = head.querySelector('.rw-range');
  var mlab = head.querySelector('.rw-month'), sel = head.querySelector('select');
  ['All'].concat(segs).forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
  var stage = document.createElement('div'); stage.className = 'rw-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'rw-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipFg; root.appendChild(tip);
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = '1';
    var rb = root.getBoundingClientRect(), x = ev.clientX - rb.left + 12, y = ev.clientY - rb.top + 12;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > rb.width - 4) x = ev.clientX - rb.left - tw - 12;
    if (y + th > rb.height - 4) y = ev.clientY - rb.top - th - 12;
    tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  var W = stage.clientWidth || 500, H = stage.clientHeight || 330;
  lastStage = W + 'x' + H;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': CFG.title }, null);
  stage.appendChild(svg);
  var defs = svgEl('defs', {}, svg);
  var pat = svgEl('pattern', { id: 'rwHatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  svgEl('rect', { width: 6, height: 6, fill: 'transparent' }, pat);
  svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: P.accent, 'stroke-width': 2.2, opacity: 0.75 }, pat);

  var labW = Math.max(74, Math.min(96, W * 0.18)), padR = 6, topH = 22, legH = 26;
  var x0 = labW, x1 = W - padR, cw = (x1 - x0) / Math.max(1, phases.length);
  var gHead = svgEl('g', {}, svg), gLanes = svgEl('g', {}, svg), gDots = svgEl('g', {}, svg), gLab = svgEl('g', {}, svg), gLeg = svgEl('g', {}, svg);

  // phase header
  phases.forEach(function (p, i) {
    var t = svgEl('text', { x: x0 + cw * i + cw / 2, y: 13, 'text-anchor': 'middle', 'font-size': cw < 52 ? 9 : 10, 'font-weight': 600, fill: P.muted }, gHead);
    t.textContent = phName(p);
  });

  // legend
  (function () {
    var ly = H - legH + 8, lx = x0, lw = Math.min(120, (x1 - x0) * 0.35);
    var gid = 'rwLeg'; var lg = svgEl('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    P.ramp.forEach(function (c, i) { svgEl('stop', { offset: (i / (P.ramp.length - 1)), 'stop-color': c }, lg); });
    var t0 = svgEl('text', { x: lx - 4, y: ly + 8, 'text-anchor': 'end', 'font-size': 9.5, fill: P.muted }, gLeg); t0.textContent = 'Overdue 0%';
    svgEl('rect', { x: lx, y: ly, width: lw, height: 9, rx: 2, fill: 'url(#' + gid + ')' }, gLeg);
    var t1 = svgEl('text', { x: lx + lw + 4, y: ly + 8, 'font-size': 9.5, fill: P.muted }, gLeg); t1.textContent = Math.round(maxRate * 100) + '%';
    var hx = lx + lw + 36;
    if (hx + 90 < x1) {
      svgEl('rect', { x: hx, y: ly, width: 14, height: 9, fill: 'url(#rwHatch)', stroke: P.accent, 'stroke-width': 1.2 }, gLeg);
      var t2 = svgEl('text', { x: hx + 18, y: ly + 8, 'font-size': 9.5, fill: P.muted }, gLeg); t2.textContent = Math.round(CFG.hot * 100) + '%+ late';
      var dx = hx + 80;
      if (dx + 60 < x1) {
        svgEl('circle', { cx: dx + 4, cy: ly + 4.5, r: 3, fill: P.dot }, gLeg);
        var t3 = svgEl('text', { x: dx + 11, y: ly + 8, 'font-size': 9.5, fill: P.muted }, gLeg); t3.textContent = 'projects';
      }
    }
  })();

  var lanes = [], dots = [];
  function chevron(x, y, w, h, first) {
    var k = Math.min(9, w * 0.18);
    var pts = first ? [[x, y], [x + w - k, y], [x + w, y + h / 2], [x + w - k, y + h], [x, y + h]]
      : [[x - k + 1, y], [x + w - k, y], [x + w, y + h / 2], [x + w - k, y + h], [x - k + 1, y + h], [x + 1, y + h / 2]];
    return pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
  }
  function drawLanes() {
    while (gLanes.firstChild) gLanes.removeChild(gLanes.firstChild);
    while (gLab.firstChild) gLab.removeChild(gLab.firstChild);
    hideTip();
    var ms = months[state.mi], shown = state.seg === 'All' ? segs : [state.seg];
    var avail = H - topH - legH, gap = 10, lh = Math.min(92, (avail - gap * (shown.length - 1)) / shown.length);
    var y = topH + Math.max(0, (avail - (lh * shown.length + gap * (shown.length - 1))) / 2);
    var maxN = 1; shown.forEach(function (s) { phases.forEach(function (p) { var c = cell(ms, s, p); if (c.n > maxN) maxN = c.n; }); });
    lanes = [];
    shown.forEach(function (s) {
      var g = svgEl('g', {}, gLanes), lr = laneRate(ms, s), isF = s === focus;
      svgEl('rect', { x: 0, y: y - 3, width: W, height: lh + 6, rx: 6, fill: P.lane }, g);
      var tl = svgEl('text', { x: 8, y: y + lh / 2 - 3, 'font-size': 11.5, 'font-weight': 700, fill: isF ? P.primary : P.fg }, g); tl.textContent = s;
      var tr = svgEl('text', { x: 8, y: y + lh / 2 + 11, 'font-size': 10.5, 'font-weight': 600, fill: lr.rate >= CFG.hot ? P.accent : P.muted }, g); tr.textContent = pct(lr.rate) + ' late';
      var hitL = svgEl('rect', { x: 0, y: y, width: x0 - 4, height: lh, fill: 'transparent', 'class': 'rw-hit' }, g);
      (function (s, lr) {
        hitL.addEventListener('mousemove', function (ev) { showTip('<b>' + esc(s) + '</b>' + esc(monLabel(ms)) + '<br>Overdue rate ' + pct(lr.rate) + '<br>' + fmtN(lr.n) + ' tasks', ev); });
        hitL.addEventListener('mouseleave', hideTip);
      })(s, lr);
      var cells = [];
      phases.forEach(function (p, i) {
        var c = cell(ms, s, p), cx = x0 + cw * i;
        var hh = lh * (0.55 + 0.45 * Math.sqrt(c.n / maxN)), cy = y + (lh - hh) / 2;
        var poly = chevron(cx, cy, cw, hh, i === 0);
        var fill = rampAt(P.ramp, c.rate / maxRate), hot = c.rate >= CFG.hot;
        svgEl('polygon', { points: poly, fill: fill, stroke: hot ? P.accent : P.bg, 'stroke-width': hot ? 1.6 : 1 }, g);
        if (hot) svgEl('polygon', { points: poly, fill: 'url(#rwHatch)', opacity: 0.55 }, g);
        if (cw >= 40 && hh >= 22) {
          var tt = c.rate / maxRate, tc = dark ? (tt > 0.6 ? '#161A22' : '#E7ECF2') : (tt > 0.55 ? '#FFFFFF' : P.fg);
          var lt = svgEl('text', { x: cx + cw / 2 - 2, y: cy + hh / 2 + 3.5, 'text-anchor': 'middle', 'font-size': cw < 52 ? 9 : 10, 'font-weight': 700, fill: tc, stroke: fill, 'stroke-width': 3, 'paint-order': 'stroke', 'pointer-events': 'none' }, gLab);
          lt.textContent = Math.round(c.rate * 100) + '%';
        }
        var hit = svgEl('polygon', { points: poly, fill: 'transparent', 'class': 'rw-hit' }, g);
        (function (s, p, c) {
          hit.addEventListener('mousemove', function (ev) {
            showTip('<b>' + esc(s) + ' - ' + esc(String(p).replace(/^\d+\.\s*/, '')) + '</b>' + esc(monLabel(ms)) + '<br>Overdue rate ' + pct(c.rate) + (c.rate >= CFG.hot ? ' (hot)' : '') + '<br>' + fmtN(c.n) + ' tasks started', ev);
          });
          hit.addEventListener('mouseleave', hideTip);
        })(s, p, c);
        cells.push({ x: cx, w: cw, rate: c.rate, n: c.n });
      });
      lanes.push({ s: s, y: y, h: lh, cells: cells, n: lr.n, acc: 0 });
      y += lh + gap;
    });
  }
  function subline() {
    var ms = months[state.mi], f = laneRate(ms, focus), f0 = laneRate(months[0], focus);
    var hotList = [];
    phases.forEach(function (p) { var c = cell(ms, focus, p); if (c.rate >= CFG.hot) hotList.push(phName(p) + ' ' + Math.round(c.rate * 100) + '%'); });
    var d = 100 * (f.rate - f0.rate);
    sub.innerHTML = esc(monLabel(ms)) + ': <b>' + esc(focus) + ' ' + pct(f.rate) + ' of tasks late</b>' +
      (state.mi > 0 ? ' (' + (d >= 0 ? '+' : '') + d.toFixed(1) + ' pts vs ' + esc(monLabel(months[0])) + ')' : '') +
      (hotList.length ? '. Hot: <i>' + esc(hotList.join(', ')) + '</i>' : '. No phase above ' + Math.round(CFG.hot * 100) + '%.');
    mlab.textContent = monLabel(ms);
  }
  // project markers: spawn per lane by task volume; speed drops in late cells, they turn orange while stalled
  function spawn(L) {
    var c = svgEl('circle', { r: 2.6, cx: x0, cy: L.y + L.h / 2, fill: P.dot, opacity: 0.8, 'pointer-events': 'none' }, gDots);
    var side = Math.random() < 0.5 ? -1 : 1;
    dots.push({ el: c, L: L, x: x0 + 2, off: side * L.h * (0.12 + Math.random() * 0.16), v: 0.8 + Math.random() * 0.5 });
  }
  var last = 0;
  function frame(ts, warm) {
    var dt = last ? Math.min(50, ts - last) : 16; last = ts;
    var maxL = 1; lanes.forEach(function (L) { if (L.n > maxL) maxL = L.n; });
    lanes.forEach(function (L) { L.acc += dt * 0.006 * (L.n / maxL); while (L.acc >= 1) { L.acc -= 1; if (dots.length < 120) spawn(L); } });
    for (var i = dots.length - 1; i >= 0; i--) {
      var q = dots[i], L = q.L, ci = Math.min(L.cells.length - 1, Math.max(0, Math.floor((q.x - x0) / cw)));
      var cr = L.cells[ci] ? L.cells[ci].rate : 0, slow = Math.max(0.12, 1 - cr * 2.2);
      q.x += dt * 0.05 * q.v * slow;
      if (q.x >= x1 - 2) { gDots.removeChild(q.el); dots.splice(i, 1); continue; }
      q.el.setAttribute('fill', cr >= CFG.hot ? P.accent : P.dot);
      q.el.setAttribute('cx', q.x.toFixed(1)); q.el.setAttribute('cy', (L.y + L.h / 2 + q.off).toFixed(1));
    }
    if (!warm) anim = requestAnimationFrame(frame);
  }
  function update() {
    drawLanes(); subline();
    dots.forEach(function (q) { if (q.el.parentNode) q.el.parentNode.removeChild(q.el); }); dots = [];
    if (!reduced) { for (var w = 0; w < 700; w++) frame(w * 16 + 1, true); last = 0; }
  }
  function setPlay(on) {
    state.playing = on; play.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if (on) {
      if (state.mi >= months.length - 1) { state.mi = 0; range.value = '0'; update(); }
      playTimer = setInterval(function () {
        if (state.mi >= months.length - 1) { setPlay(false); return; }
        state.mi++; range.value = String(state.mi); update();
      }, reduced ? 1600 : 1100);
    }
  }
  play.addEventListener('click', function () { setPlay(!state.playing); });
  range.addEventListener('input', function () { setPlay(false); state.mi = Number(range.value); update(); });
  sel.addEventListener('change', function () { state.seg = sel.value; update(); });

  update();
  if (!reduced) anim = requestAnimationFrame(frame);
}

try {
  render();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      var st = root.querySelector('.rw-stage');
      var key = st ? st.clientWidth + 'x' + st.clientHeight : '';
      if (st && key !== lastStage) render();
    }).observe(root);
  }
  done();
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#0F62FE">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
