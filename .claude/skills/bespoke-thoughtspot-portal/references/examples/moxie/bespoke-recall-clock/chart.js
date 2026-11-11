// Moxie rebooking recall clock. Bespoke SVG, no chart library.
// Search: [Rebooked Visits] [Completed Visits] [Net Revenue] [Practice] [Provider] [Appointment Date].monthly
//   [Provider Role] = 'nurse practitioner (np)' 'registered nurse (rn)' 'physician assistant (pa)'
//   [Appointment Date] >= '11/01/2025' [Theme Mode]
// A clock face of the last 12 months. Each ring is one injector at the selected practice, each segment one month,
// coloured by that injector's rebook rate (patients who book their next visit before leaving). Play sweeps the gold
// hand month by month; the injector whose rebooking is slipping drains from sage to coral.
var CFG = {
  title: 'Rebooking recall clock',
  months: 12,
  maxRings: 6,
  brand: { primary: '#6A8E8B', deep: '#204C47', navy: '#1A2D2B', tint: '#E1EBEA', coral: '#E47367', gold: '#AC8343', violet: '#B377C5',
    darkBg: '#16211F', darkLine: '#26413E', darkPrimary: '#8FB5B1', darkCoral: '#F08B80', darkGold: '#D4A967' }
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[clock] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[clock] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(list, re) { for (var i = 0; i < list.length; i++) if (re.test(list[i].name)) return list[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function money(n) { return n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K' : '$' + Math.round(n); }
function pc(x) { return x == null || !isFinite(x) ? '-' : Math.round(100 * x) + '%'; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n)) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monShort(ms) { return MON[new Date(ms).getUTCMonth()]; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
function shortName(s) { var p = String(s).split(','), n = p[0].split(' '); return (n.length > 1 ? n[0] + ' ' + n[n.length - 1].charAt(0) + '.' : n[0]) + (p[1] ? ',' + p[1] : ''); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function mix(a, b, t) { var x = hex2rgb(a), y = hex2rgb(b); return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')'; }
function scale(stops, v) {
  if (v <= stops[0][0]) return stops[0][1];
  for (var i = 1; i < stops.length; i++) if (v <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  return stops[stops.length - 1][1];
}

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var measures = schema.filter(function (c) { return /measure/i.test(c.type || '') || /^(total|average|sum)\b/i.test(c.name); });
var dims = schema.filter(function (c) { return measures.indexOf(c) < 0; });
var C = {
  practice: colOf(dims, /practice|clinic|location/i), provider: colOf(dims, /provider|injector/i), month: colOf(dims, /date|month/i), theme: colOf(dims, /theme/i),
  reb: colOf(measures, /rebook/i), comp: colOf(measures.filter(function (c) { return !/rebook/i.test(c.name); }), /complet|visit/i), rev: colOf(measures, /revenue|sales/i)
};
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#E9EFEE', muted: '#9FB0AD', line: B.darkLine, primary: B.darkPrimary, onPrimary: '#0D1514', alert: B.darkCoral, hand: B.darkGold, tipBg: '#E9EFEE', tipInk: B.navy, face: '#1A2A28',
      rate: [[0.35, '#F08B80'], [0.5, '#8C5A52'], [0.6, '#2E4A47'], [0.7, '#5E8A86'], [0.82, '#A9CCC8']], rev: ['#1F3331', '#A9CCC8'] }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#5F6B69', line: '#E1DDD5', primary: B.primary, onPrimary: '#FFFFFF', alert: '#C9554A', hand: B.gold, tipBg: B.navy, tipInk: '#FFFFFF', face: '#F7F3EC',
      rate: [[0.35, '#E47367'], [0.5, '#F2C1B9'], [0.6, '#E1EBEA'], [0.7, '#6A8E8B'], [0.82, '#204C47']], rev: ['#E1EBEA', '#204C47'] };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--rc-primary', P.primary], ['--rc-on-primary', P.onPrimary], ['--rc-line', P.line], ['--rc-muted', P.muted], ['--rc-ink', P.ink], ['--rc-alert', P.alert]].forEach(function (t) { root.style.setProperty(t[0], t[1]); });

var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// cube[practice][provider][month] = { r, c, v }
var cube = {}, monthSet = {}, pracVol = {};
rows.forEach(function (r) {
  var p = r[C.practice], d = r[C.provider], m = toMs(r[C.month]);
  if (p == null || d == null || m == null) return;
  var rb = Number(r[C.reb]) || 0, cp = Number(r[C.comp]) || 0, rv = Number(r[C.rev]) || 0;
  monthSet[m] = 1;
  cube[p] = cube[p] || {}; cube[p][d] = cube[p][d] || {};
  var o = cube[p][d][m] || (cube[p][d][m] = { r: 0, c: 0, v: 0 });
  o.r += rb; o.c += cp; o.v += rv;
  pracVol[p] = (pracVol[p] || 0) + cp;
});
var months = Object.keys(monthSet).map(Number).sort(function (a, b) { return a - b; }).slice(-CFG.months);
var practices = Object.keys(cube).sort();

function provStats(p, d) {
  var s = cube[p][d], early = { r: 0, c: 0 }, late = { r: 0, c: 0 }, tot = 0, n = months.length, k = Math.max(1, Math.min(3, Math.floor(n / 3)));
  months.forEach(function (m, i) { var o = s[m]; if (!o) return; tot += o.c; if (i < k) { early.r += o.r; early.c += o.c; } if (i >= n - k) { late.r += o.r; late.c += o.c; } });
  return { tot: tot, early: early.c ? early.r / early.c : null, late: late.c ? late.r / late.c : null };
}
// the story: the injector whose rebook rate fell the most (first quarter of the window vs the last)
var story = { p: practices[0], d: null, drop: -1, early: null, late: null };
practices.forEach(function (p) {
  Object.keys(cube[p]).forEach(function (d) {
    var s = provStats(p, d);
    if (s.tot < 60 || s.early == null || s.late == null) return;
    if (s.early - s.late > story.drop) story = { p: p, d: d, drop: s.early - s.late, early: s.early, late: s.late };
  });
});
var netRate = (function () {
  var r = 0, c = 0; practices.forEach(function (p) { Object.keys(cube[p]).forEach(function (d) { var o = cube[p][d][months[months.length - 1]]; if (o) { r += o.r; c += o.c; } }); }); return c ? r / c : null;
})();
var state = { practice: story.p, color: 'rate', hand: months.length - 1, focus: story.d, playing: false };
var anim = null, playTimer = null, lastStage = null;

function stopAll() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
}

function render() {
  stopAll();
  root.innerHTML = '';
  if (!rows.length || !C.practice || !C.provider || !C.month || !C.reb || !C.comp || !months.length) {
    root.innerHTML = '<div class="rc-empty">No appointments to show yet.<br>Bind the search: [Rebooked Visits] [Completed Visits] [Net Revenue] [Practice] [Provider] [Appointment Date].monthly [Theme Mode]</div>';
    return;
  }
  var head = document.createElement('div'); head.className = 'rc-head'; root.appendChild(head);
  head.innerHTML = '<p class="rc-title">' + esc(CFG.title) + '</p><p class="rc-sub"></p>';
  var sub = head.querySelector('.rc-sub');
  var ctl = document.createElement('div'); ctl.className = 'rc-ctl'; head.appendChild(ctl);
  var play = document.createElement('button'); play.className = 'rc-play'; play.setAttribute('aria-label', 'Play the last 12 months'); ctl.appendChild(play);
  function picker(label, opts, val) {
    var l = document.createElement('label'); l.className = 'rc-pick'; l.innerHTML = '<span>' + label + '</span>';
    var s = document.createElement('select');
    opts.forEach(function (o) { var e = document.createElement('option'); e.value = o[0]; e.textContent = o[1]; if (o[0] === val) e.selected = true; s.appendChild(e); });
    l.appendChild(s); ctl.appendChild(l); return s;
  }
  var selP = picker('Practice', practices.map(function (p) { return [p, p]; }), state.practice);
  var selC = picker('Colour', [['rate', 'Rebook rate'], ['rev', 'Net revenue']], state.color);
  var mlab = document.createElement('span'); mlab.className = 'rc-month'; ctl.appendChild(mlab);

  var stage = document.createElement('div'); stage.className = 'rc-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'rc-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = '1';
    var rb = root.getBoundingClientRect(), x = ev.clientX - rb.left + 12, y = ev.clientY - rb.top + 12;
    if (x + tip.offsetWidth > rb.width - 4) x = ev.clientX - rb.left - tip.offsetWidth - 12;
    if (y + tip.offsetHeight > rb.height - 4) y = ev.clientY - rb.top - tip.offsetHeight - 12;
    tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  var W = stage.clientWidth || 500, H = stage.clientHeight || 360;
  lastStage = W + 'x' + H;
  var side = W >= 430;
  var rosterW = side ? Math.min(190, Math.max(140, W * 0.34)) : 0;
  var cw = W - rosterW, chH = side ? H : H - 64;
  var R = Math.max(40, Math.min((cw - 44) / 2, (chH - 40) / 2));
  var cx = cw / 2 + (side ? 4 : 0), cy = chH / 2 + 4, r0 = R * 0.36;
  var D2R = Math.PI / 180, n = months.length, step = 360 / n, gap = 1.2;
  function pt(deg, r) { var a = deg * D2R; return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }; }
  function arc(a1, a2, ri, ro) {
    var big = (a2 - a1) > 180 ? 1 : 0, p1 = pt(a1, ro), p2 = pt(a2, ro), p3 = pt(a2, ri), p4 = pt(a1, ri);
    return 'M' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1) + ' A' + ro + ',' + ro + ' 0 ' + big + ' 1 ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1) +
      ' L' + p3.x.toFixed(1) + ',' + p3.y.toFixed(1) + ' A' + ri + ',' + ri + ' 0 ' + big + ' 0 ' + p4.x.toFixed(1) + ',' + p4.y.toFixed(1) + ' Z';
  }
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Rebook rate by injector and month at ' + state.practice }, stage);

  var provs = Object.keys(cube[state.practice] || {}).map(function (d) { return { d: d, s: provStats(state.practice, d) }; })
    .filter(function (o) { return o.s.tot > 0; })
    .sort(function (a, b) { return (a.d === state.focus ? 1 : 0) - (b.d === state.focus ? 1 : 0) || a.s.tot - b.s.tot; }).slice(-CFG.maxRings);
  // outermost ring = last in the list (the story injector when present, else the busiest)
  var band = (R - r0) / Math.max(1, provs.length);
  var maxRev = 0; provs.forEach(function (o) { months.forEach(function (m) { var c = cube[state.practice][o.d][m]; if (c && c.v > maxRev) maxRev = c.v; }); });

  svgEl('circle', { cx: cx, cy: cy, r: R + 16, fill: P.face, stroke: P.line, 'stroke-width': 1 }, svg);
  var gCells = svgEl('g', {}, svg), gLab = svgEl('g', { 'pointer-events': 'none' }, svg), gHand = svgEl('g', { 'pointer-events': 'none' }, svg), gMid = svgEl('g', { 'pointer-events': 'none' }, svg);
  months.forEach(function (m, i) {
    var p = pt((i + 0.5) * step, R + 9);
    var t = svgEl('text', { x: p.x.toFixed(1), y: (p.y + 3.5).toFixed(1), 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: P.muted }, gLab);
    t.textContent = monShort(m);
  });
  var cells = [];
  provs.forEach(function (o, k) {
    var ri = r0 + k * band + 1, ro = r0 + (k + 1) * band - 1, isF = o.d === state.focus;
    months.forEach(function (m, i) {
      var c = cube[state.practice][o.d][m] || { r: 0, c: 0, v: 0 }, rate = c.c ? c.r / c.c : null;
      var fill = state.color === 'rate' ? (rate == null ? P.line : scale(P.rate, rate)) : mix(P.rev[0], P.rev[1], maxRev ? c.v / maxRev : 0);
      var el = svgEl('path', { d: arc(i * step + gap / 2, (i + 1) * step - gap / 2, ri, ro), fill: fill, class: 'rc-cell', stroke: isF ? P.alert : 'none', 'stroke-width': isF ? 0 : 0 }, gCells);
      el.addEventListener('mousemove', function (ev) {
        el.setAttribute('stroke', P.ink); el.setAttribute('stroke-width', 1.5);
        var all = practiceMonth(m);
        showTip('<b>' + esc(o.d) + '</b>' + esc(monLabel(m)) + '<br>Rebook rate ' + pc(rate) + ' (' + c.r + ' of ' + c.c + ' visits)<br>Practice ' + pc(all) + '<br>Net revenue ' + money(c.v), ev);
      });
      el.addEventListener('mouseleave', function () { el.setAttribute('stroke', 'none'); hideTip(); });
      el.addEventListener('click', function () { state.focus = o.d; render(); });
      cells.push({ el: el, i: i, k: k, focus: isF });
    });
  });

  function practiceMonth(m) {
    var r = 0, c = 0; Object.keys(cube[state.practice]).forEach(function (d) { var o = cube[state.practice][d][m]; if (o) { r += o.r; c += o.c; } }); return c ? r / c : null;
  }

  // roster: one row per ring with first-quarter vs last-quarter rebook rate
  var gRos = svgEl('g', {}, svg);
  var rosX = side ? cw + 6 : 12, rosY = side ? Math.max(14, cy - (provs.length * 30) / 2) : chH + 6, rowH = side ? 30 : 0;
  var rev = provs.slice().reverse();
  rev.forEach(function (o, j) {
    var isF = o.d === state.focus, x = side ? rosX : 12 + (j % 2) * (W / 2), y = side ? rosY + j * rowH : rosY + Math.floor(j / 2) * 20;
    var g = svgEl('g', { class: 'rc-row' }, gRos);
    var hit = svgEl('rect', { x: x - 4, y: y - 11, width: side ? rosterW - 6 : W / 2 - 16, height: side ? 28 : 19, rx: 6, fill: isF ? (dark ? 'rgba(240,139,128,0.12)' : 'rgba(228,115,103,0.10)') : 'transparent' }, g);
    var t = svgEl('text', { x: x + 2, y: y + 2, 'font-size': 11, 'font-weight': isF ? 700 : 600, fill: isF ? P.alert : P.ink }, g);
    t.textContent = shortName(o.d);
    if (side) {
      var t2 = svgEl('text', { x: x + 2, y: y + 14, 'font-size': 10, fill: P.muted }, g);
      t2.textContent = pc(o.s.early) + ' -> ' + pc(o.s.late) + ' rebook';
    }
    hit.addEventListener('mousemove', function (ev) { highlight(o.d); showTip('<b>' + esc(o.d) + '</b>Rebook rate ' + pc(o.s.early) + ' early in the window, ' + pc(o.s.late) + ' in the last quarter<br>' + o.s.tot + ' completed visits', ev); });
    t.addEventListener('mousemove', function (ev) { highlight(o.d); });
    hit.addEventListener('mouseleave', function () { highlight(null); hideTip(); });
    hit.addEventListener('click', function () { state.focus = o.d; render(); });
  });
  function highlight(d) {
    var k = -1; provs.forEach(function (o, i) { if (o.d === d) k = i; });
    cells.forEach(function (c) { c.el.setAttribute('opacity', k < 0 || c.k === k ? (c.i > state.hand ? 0.14 : 1) : 0.25); });
  }

  // hand + centre readout
  var hand = svgEl('line', { x1: cx, y1: cy, stroke: P.hand, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gHand);
  var tipDot = svgEl('circle', { r: 4, fill: P.hand }, gHand);
  svgEl('circle', { cx: cx, cy: cy, r: r0 - 3, fill: P.bg, stroke: P.line }, gMid);
  var cM = svgEl('text', { x: cx, y: cy - r0 * 0.36, 'text-anchor': 'middle', 'font-size': Math.max(9, r0 * 0.2), 'font-weight': 600, fill: P.muted }, gMid);
  var cV = svgEl('text', { x: cx, y: cy + r0 * 0.12, 'text-anchor': 'middle', 'font-size': Math.max(14, r0 * 0.42), 'font-weight': 700, fill: P.ink }, gMid);
  var cL = svgEl('text', { x: cx, y: cy + r0 * 0.42, 'text-anchor': 'middle', 'font-size': Math.max(8, r0 * 0.16), fill: P.muted }, gMid);
  cL.textContent = 'practice rebook';
  var handA = (state.hand + 1) * step;
  function paint() {
    var p = pt(handA, R + 2); hand.setAttribute('x2', p.x.toFixed(1)); hand.setAttribute('y2', p.y.toFixed(1)); tipDot.setAttribute('cx', p.x.toFixed(1)); tipDot.setAttribute('cy', p.y.toFixed(1));
    var p0 = pt(handA, r0 - 3); hand.setAttribute('x1', p0.x.toFixed(1)); hand.setAttribute('y1', p0.y.toFixed(1));
  }
  function setHand(i, animate) {
    hideTip();
    state.hand = i;
    var m = months[i], all = practiceMonth(m);
    cM.textContent = monLabel(m); cV.textContent = pc(all); mlab.textContent = monLabel(m);
    cells.forEach(function (c) { c.el.setAttribute('opacity', c.i > i ? 0.14 : 1); });
    var target = (i + 1) * step;
    if (!animate || reduced) { handA = target; paint(); return; }
    var from = handA < target ? handA : 0, t0 = null;
    if (anim) cancelAnimationFrame(anim);
    function stepFn(ts) { if (!t0) t0 = ts; var u = Math.min(1, (ts - t0) / 520), e = 1 - Math.pow(1 - u, 3); handA = from + (target - from) * e; paint(); if (u < 1) anim = requestAnimationFrame(stepFn); else anim = null; }
    anim = requestAnimationFrame(stepFn);
  }

  // subline: the story in numbers
  var fs = state.focus && cube[state.practice][state.focus] ? provStats(state.practice, state.focus) : null;
  if (fs && fs.early != null && fs.late != null) {
    sub.innerHTML = '<b>' + esc(shortName(state.focus)) + '</b> rebook rate ' + pc(fs.early) + ' -> <b>' + pc(fs.late) + '</b> over 12 months' + (netRate != null ? '; network ' + pc(netRate) + ' this month' : '') + '.';
  } else {
    sub.textContent = 'Each ring is an injector, each segment a month. Press play to sweep the year.';
  }

  function setPlay(on) {
    state.playing = on; play.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if (on) {
      if (state.hand >= n - 1) setHand(0, false);
      playTimer = setInterval(function () {
        if (state.hand >= n - 1) { setPlay(false); return; }
        setHand(state.hand + 1, true);
      }, reduced ? 1200 : 760);
    }
  }
  play.addEventListener('click', function () { setPlay(!state.playing); });
  selP.addEventListener('change', function () {
    state.practice = selP.value; var best = null, bd = -1;
    Object.keys(cube[state.practice]).forEach(function (d) { var s = provStats(state.practice, d); if (s.tot >= 60 && s.early != null && s.late != null && s.early - s.late > bd) { bd = s.early - s.late; best = d; } });
    state.focus = best; state.hand = n - 1; render();
  });
  selC.addEventListener('change', function () { state.color = selC.value; render(); });

  setPlay(false);
  setHand(state.hand, false);
}

try {
  render();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      var st = root.querySelector('.rc-stage');
      var key = st ? st.clientWidth + 'x' + st.clientHeight : '';
      if (st && key !== lastStage) render();
    }).observe(root);
  }
  done();
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#C9554A">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
