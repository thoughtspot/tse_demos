// Nooks persona dial lanes. Bespoke SVG, no chart library.
// Search: [Dials] [Connects] [Conversations] [Meetings Booked] [Persona] [Dial Mode] [Call Date].monthly [Theme Mode]
// One lane per prospect persona: signal meter = connect rate, call dots stream through the gates
// Dials > Connects > Conversations > Meetings. Play replays the last 12 months.
var CFG = {
  title: 'Persona dial lanes',
  focus: 'RevOps Leader',
  months: 12,
  order: ['Sales Leader', 'RevOps Leader', 'Marketing Leader', 'IT & Security', 'Finance Leader', 'HR & People', 'Founder / CEO'],
  gates: ['Dials', 'Connects', 'Convos', 'Meetings'],
  brand: {
    light: { bg: '#FFFFFF', fg: '#0F0F0F', muted: '#5C6B7F', grid: '#EEE6F2', primary: '#FA47F9', primaryDark: '#C81FC7', accent: '#8958DA', tint: '#FFF0FF', loss: '#CBD2DC', tipBg: '#0F0F0F', tipFg: '#FFFFFF' },
    dark: { bg: '#18151D', fg: '#F3EEF6', muted: '#A49CB0', grid: '#2A2433', primary: '#FB64FA', primaryDark: '#FB64FA', accent: '#A983E8', tint: '#2A1730', loss: '#4A4452', tipBg: '#F3EEF6', tipFg: '#0F0F0F' }
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[lanes] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[lanes] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(list, re) { for (var i = 0; i < list.length; i++) if (re.test(list[i].name)) return list[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtN(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
function pct(a, b) { return b ? (100 * a / b).toFixed(1) + '%' : '0%'; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n) || String(v).indexOf('-') > 0) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var measures = schema.filter(function (c) { return /measure/i.test(c.type || '') || /^(total|sum)\b/i.test(c.name); });
function pickM(re, not) { return (measures.filter(function (c) { return re.test(c.name) && !(not && not.test(c.name)); })[0] || {}).name; }
var C = {
  persona: colOf(schema, /persona/i), mode: colOf(schema, /dial mode|mode/i), month: colOf(schema, /date|month/i), theme: colOf(schema, /theme/i),
  meet: pickM(/meeting/i), conv: pickM(/conversation/i, /meeting/i), conn: pickM(/connect/i, /meeting|conversation/i)
};
C.dials = pickM(/dial|call/i, /meeting|conversation|connect/i);
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var P = dark ? CFG.brand.dark : CFG.brand.light;
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.fg;
[['--dl-primary', P.primaryDark], ['--dl-line', P.grid], ['--dl-muted', P.muted], ['--dl-ink', P.fg]].forEach(function (kv) { root.style.setProperty(kv[0], kv[1]); });
var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

var anim = null, playTimer = null, lastStage = '';
var state = { mi: -1, mode: 'All', playing: false };

function render() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  root.innerHTML = '';
  if (!rows.length || !C.persona || !C.month || !C.dials || !C.conn) {
    root.innerHTML = '<div class="dl-empty">Bind the search:<br>[Dials] [Connects] [Conversations] [Meetings Booked] [Persona] [Dial Mode] [Call Date].monthly [Theme Mode]</div>';
    return;
  }
  var cube = {}, monthSet = {}, modeSet = {}, perSet = {};
  rows.forEach(function (r) {
    var ms = toMs(r[C.month]); if (ms == null) return;
    var p = String(r[C.persona]), m = C.mode ? String(r[C.mode]) : 'All';
    monthSet[ms] = (monthSet[ms] || 0) + (Number(r[C.dials]) || 0); modeSet[m] = 1; perSet[p] = 1;
    var k = ms + '|' + p + '|' + m, c = cube[k] || (cube[k] = [0, 0, 0, 0]);
    c[0] += Number(r[C.dials]) || 0; c[1] += Number(r[C.conn]) || 0; c[2] += C.conv ? Number(r[C.conv]) || 0 : 0; c[3] += C.meet ? Number(r[C.meet]) || 0 : 0;
  });
  var allM = Object.keys(monthSet).map(Number).sort(function (a, b) { return a - b; });
  var months = allM.slice(-CFG.months);
  var personas = CFG.order.filter(function (p) { return perSet[p]; }).concat(Object.keys(perSet).filter(function (p) { return CFG.order.indexOf(p) < 0; })).slice(0, 9);
  var modes = Object.keys(modeSet).sort();
  if (state.mi < 0 || state.mi >= months.length) state.mi = months.length - 1;
  if (state.focus == null) state.focus = perSet[CFG.focus] ? CFG.focus : personas[0];

  function stats(ms, p) {
    var t = [0, 0, 0, 0];
    modes.forEach(function (m) { if (state.mode !== 'All' && m !== state.mode) return; var c = cube[ms + '|' + p + '|' + m]; if (c) for (var i = 0; i < 4; i++) t[i] += c[i]; });
    return t;
  }

  var head = document.createElement('div'); head.className = 'dl-head';
  head.innerHTML = '<p class="dl-title">' + esc(CFG.title) + '</p><p class="dl-sub"></p>';
  var ctl = document.createElement('div'); ctl.className = 'dl-ctl';
  ctl.innerHTML = '<button class="dl-play" aria-label="Play">&#9654;</button><input class="dl-range" type="range" min="0" max="' + (months.length - 1) + '" value="' + state.mi + '" aria-label="Month"><span class="dl-month"></span>' +
    '<label class="dl-pick">Dial mode <select>' + ['All'].concat(modes).map(function (m) { return '<option' + (m === state.mode ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>';
  head.appendChild(ctl); root.appendChild(head);
  var stage = document.createElement('div'); stage.className = 'dl-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'dl-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipFg; root.appendChild(tip);
  var sub = head.querySelector('.dl-sub'), play = ctl.querySelector('.dl-play'), range = ctl.querySelector('.dl-range'), mlab = ctl.querySelector('.dl-month'), sel = ctl.querySelector('select');

  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = '1';
    var b = root.getBoundingClientRect(), x = ev.clientX - b.left + 12, y = ev.clientY - b.top + 12;
    if (x + 235 > b.width) x = Math.max(4, ev.clientX - b.left - 240);
    if (y + 110 > b.height) y = Math.max(4, ev.clientY - b.top - 110);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  var W = stage.clientWidth || 500, H = stage.clientHeight || 360;
  lastStage = W + 'x' + H;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H }, stage);
  var labW = Math.min(150, Math.max(104, W * 0.25)), meterW = 26, top = 22, bot = 8;
  var x0 = labW + meterW + 14, x3 = W - 40, gx = [x0, x0 + (x3 - x0) * 0.36, x0 + (x3 - x0) * 0.68, x3];
  var laneH = (H - top - bot) / personas.length;
  var gLanes, gDots, lanes = [], dots = [];

  CFG.gates.forEach(function (g, i) {
    svgEl('line', { x1: gx[i], x2: gx[i], y1: top - 4, y2: H - bot, stroke: P.grid, 'stroke-dasharray': '3 3' }, svg);
    var t = svgEl('text', { x: gx[i], y: 11, 'text-anchor': i === 0 ? 'start' : i === 3 ? 'end' : 'middle', 'font-size': 10, 'font-weight': 700, fill: P.muted }, svg);
    t.textContent = g.toUpperCase();
  });
  gLanes = svgEl('g', {}, svg); gDots = svgEl('g', {}, svg);

  function laneTip(p, s, s0) {
    return '<b>' + esc(p) + '</b>' + esc(monLabel(months[state.mi])) + (state.mode !== 'All' ? ' &middot; ' + esc(state.mode) : '') +
      '<br>Dials ' + fmtN(s[0]) + ' &middot; Connects ' + fmtN(s[1]) + '<br>Conversations ' + fmtN(s[2]) + ' &middot; Meetings ' + fmtN(s[3]) +
      '<br>Connect rate <b style="display:inline">' + pct(s[1], s[0]) + '</b> (was ' + pct(s0[1], s0[0]) + ' in ' + esc(monLabel(months[0])) + ')' +
      '<br>Conv. rate ' + pct(s[2], s[1]) + ' &middot; Meeting rate ' + pct(s[3], s[2]);
  }

  function drawLanes() {
    hideTip();
    while (gLanes.firstChild) gLanes.removeChild(gLanes.firstChild);
    lanes = [];
    var ms = months[state.mi];
    personas.forEach(function (p, li) {
      var s = stats(ms, p), s0 = stats(months[0], p), cy = top + laneH * (li + 0.5), isF = p === state.focus;
      var rate = s[0] ? s[1] / s[0] : 0, col = isF ? P.primaryDark : P.muted;
      var g = svgEl('g', { 'class': 'dl-hit' }, gLanes);
      if (isF) svgEl('rect', { x: 0, y: cy - laneH / 2 + 1, width: W, height: laneH - 2, rx: 6, fill: P.tint }, g);
      var nm = svgEl('text', { x: 6, y: cy - 2, 'font-size': 11.5, 'font-weight': isF ? 800 : 600, fill: isF ? P.fg : P.fg }, g); nm.textContent = p;
      var rt = svgEl('text', { x: 6, y: cy + 11, 'font-size': 10.5, 'font-weight': 700, fill: col }, g); rt.textContent = pct(s[1], s[0]) + ' connect';
      // signal meter: 5 bars, one per 5 pts of connect rate
      var bars = Math.min(5, Math.ceil(rate / 0.05 - 1e-9)), mx = labW + 2, mh = Math.min(16, laneH * 0.6);
      for (var b = 0; b < 5; b++) {
        var bh = mh * (b + 1) / 5;
        svgEl('rect', { x: mx + b * 5, y: cy + mh / 2 - bh, width: 3.4, height: bh, rx: 1, fill: b < bars ? (isF ? P.primary : P.accent) : P.grid }, g);
      }
      // tapered flow band (sqrt widths)
      var maxH = Math.min(laneH * 0.62, 26), hs = [1, s[0] ? Math.sqrt(s[1] / s[0]) : 0, s[0] ? Math.sqrt(s[2] / s[0]) : 0, s[0] ? Math.sqrt(s[3] / s[0]) : 0].map(function (v) { return Math.max(1.5, v * maxH); });
      var d = 'M' + gx[0] + ' ' + (cy - hs[0] / 2);
      for (var i = 1; i < 4; i++) d += ' L' + gx[i] + ' ' + (cy - hs[i] / 2);
      for (var j = 3; j >= 0; j--) d += ' L' + gx[j] + ' ' + (cy + hs[j] / 2);
      svgEl('path', { d: d + ' Z', fill: isF ? P.primary : P.accent, opacity: isF ? 0.28 : 0.13 }, g);
      [s[1], s[2], s[3]].forEach(function (v, k) {
        var t = svgEl('text', { x: gx[k + 1] + (k === 2 ? 4 : 3), y: cy - Math.max(hs[k + 1] / 2, 4) - 2, 'font-size': 9.5, 'font-weight': 700, fill: isF ? P.primaryDark : P.muted }, g);
        t.textContent = fmtN(v);
      });
      var dt = svgEl('text', { x: gx[0] + 2, y: cy + laneH / 2 - 3, 'font-size': 9, fill: P.muted }, g); dt.textContent = fmtN(s[0]) + ' dials';
      svgEl('rect', { x: 0, y: cy - laneH / 2, width: W, height: laneH, fill: 'transparent' }, g);
      (function (p, s, s0) {
        g.addEventListener('mousemove', function (ev) { showTip(laneTip(p, s, s0), ev); });
        g.addEventListener('mouseleave', hideTip);
        g.addEventListener('click', function () { state.focus = p; drawLanes(); subline(); });
      })(p, s, s0);
      lanes.push({ p: p, cy: cy, s: s, isF: isF, acc: 0 });
    });
  }

  function subline() {
    var ms = months[state.mi], tot = [0, 0, 0, 0];
    personas.forEach(function (p) { var s = stats(ms, p); for (var i = 0; i < 4; i++) tot[i] += s[i]; });
    var f = stats(ms, state.focus), f0 = stats(months[0], state.focus);
    var d = (f[0] && f0[0]) ? 100 * (f[1] / f[0] - f0[1] / f0[0]) : 0;
    sub.innerHTML = esc(monLabel(ms)) + ': ' + fmtN(tot[0]) + ' dials, ' + pct(tot[1], tot[0]) + ' connect. <b>' + esc(state.focus) + ' ' + pct(f[1], f[0]) + '</b>' +
      (state.mi > 0 ? ' (' + (d >= 0 ? '+' : '') + d.toFixed(1) + ' pts)' : '');
    mlab.textContent = monLabel(ms);
  }

  // call dots: spawn per lane in proportion to dials; fate drawn from the lane's own rates
  function spawn(L) {
    var s = L.s, r1 = s[0] ? s[1] / s[0] : 0, r2 = s[1] ? s[2] / s[1] : 0, r3 = s[2] ? s[3] / s[2] : 0;
    var u = Math.random(), stop = u > r1 ? 1 : Math.random() > r2 ? 2 : Math.random() > r3 ? 3 : 4;
    var c = svgEl('circle', { r: 2.2, cx: gx[0], cy: L.cy, fill: L.isF ? P.primary : P.accent, opacity: 0.85 }, gDots);
    dots.push({ el: c, L: L, x: gx[0], y: L.cy + (Math.random() - 0.5) * 4, stop: stop, v: 0.9 + Math.random() * 0.5, fall: 0 });
  }
  var last = 0;
  function frame(ts, warm) {
    var dt = last ? Math.min(50, ts - last) : 16; last = ts;
    var maxD = 0; lanes.forEach(function (L) { if (L.s[0] > maxD) maxD = L.s[0]; });
    lanes.forEach(function (L) { L.acc += dt * 0.018 * (maxD ? L.s[0] / maxD : 0); while (L.acc >= 1) { L.acc -= 1; if (dots.length < 260) spawn(L); } });
    for (var i = dots.length - 1; i >= 0; i--) {
      var q = dots[i];
      if (q.fall) {
        q.fall += dt; q.y += dt * 0.03;
        q.el.setAttribute('opacity', Math.max(0, 0.7 - q.fall / 500).toFixed(2));
        if (q.fall > 500) { gDots.removeChild(q.el); dots.splice(i, 1); continue; }
      } else {
        q.x += dt * 0.07 * q.v;
        var lim = q.stop === 4 ? gx[3] : gx[q.stop];
        if (q.x >= lim) {
          q.x = lim;
          if (q.stop === 4) { gDots.removeChild(q.el); dots.splice(i, 1); meetMark(q.L); continue; }
          q.fall = 1; q.el.setAttribute('fill', P.loss);
        }
      }
      q.el.setAttribute('cx', q.x.toFixed(1)); q.el.setAttribute('cy', q.y.toFixed(1));
    }
    if (!warm) anim = requestAnimationFrame(frame);
  }
  function meetMark(L) {
    var x = gx[3] + 6, y = L.cy - 5;
    var g = svgEl('g', {}, gDots);
    svgEl('rect', { x: x, y: y, width: 10, height: 10, rx: 2, fill: L.isF ? P.primary : P.accent }, g);
    svgEl('rect', { x: x, y: y, width: 10, height: 3, rx: 1, fill: P.fg, opacity: 0.55 }, g);
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 650);
  }

  function update() {
    drawLanes(); subline();
    dots.forEach(function (q) { if (q.el.parentNode) q.el.parentNode.removeChild(q.el); }); dots = [];
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
  sel.addEventListener('change', function () { state.mode = sel.value; update(); });

  update();
  if (!reduced) {
    for (var w = 0; w < 140; w++) frame(w * 16 + 1, true);
    last = 0;
    anim = requestAnimationFrame(frame);
  }
}

try {
  render();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      var st = root.querySelector('.dl-stage');
      var key = st ? st.clientWidth + 'x' + st.clientHeight : '';
      if (st && key !== lastStage) render();
    }).observe(root);
  }
  done();
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#C81FC7">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
