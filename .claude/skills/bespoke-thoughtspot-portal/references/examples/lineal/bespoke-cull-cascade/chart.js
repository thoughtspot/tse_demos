// Lineal cull cascade. Bespoke SVG, no chart library.
// Search: [Docs Collected] [Docs Promoted to Review] [Docs Reviewed] [Docs Produced] [Batch Date].monthly [Source Group] [Theme Mode]
// The EDRM funnel as a cascade: collected documents pour in from three source pipes (Email, Chat & Mobile, Files),
// fall through the AmplifyAI cull, review and production sieves, and most peel away before a human reads them.
// Play replays the months: the Chat & Mobile stream swells and the cull rate slips.
var CFG = {
  title: 'Cull cascade: collected to produced',
  stages: [['col', 'Collected'], ['pro', 'Promoted to review'], ['rev', 'Human reviewed'], ['prd', 'Produced']],
  groups: ['Email', 'Chat & Mobile', 'Files & Structured'],
  brand: { primary: '#D90633', deep: '#A40526', navy: '#100808', tint: '#FBE3E8', muted: '#93757A',
    darkBg: '#1C1314', darkLine: '#3A2628', darkPrimary: '#FF4D6D' }
};
function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
function cellVal(v) {
  if (v == null || typeof v !== 'object') return v;
  try { var r = typeof v.value === 'function' ? v.value() : v.value; return r != null ? r : (v.v != null ? v.v : v.formatted); } catch (e) { return null; }
}
function done() { try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[cascade] render-complete unavailable', e); } }
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[cascade] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(list, re) { for (var i = 0; i < list.length; i++) if (re.test(list[i].name)) return list[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function big(n) { n = +n || 0; return n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
function pc(x, d) { return x == null || !isFinite(x) ? '-' : (100 * x).toFixed(d == null ? 1 : d) + '%'; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMs(v) { var n = Number(v); if (!isFinite(n)) { var d = Date.parse(v); return isFinite(d) ? d : null; } return n < 1e11 ? n * 1000 : n; }
function monLabel(ms) { var d = new Date(ms); return MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var measures = schema.filter(function (c) { return /measure/i.test(c.type || '') || /^(total|sum)\b/i.test(c.name); });
var dims = schema.filter(function (c) { return measures.indexOf(c) < 0; });
var M = {};
M.pro = colOf(measures, /promot/i);
M.prd = colOf(measures, /produc/i);
M.rev = colOf(measures.filter(function (c) { return c.name !== M.pro && c.name !== M.prd; }), /review/i);
M.col = colOf(measures.filter(function (c) { return c.name !== M.pro && c.name !== M.prd && c.name !== M.rev; }), /collect|docs/i);
var C = { month: colOf(dims, /date|month/i), group: colOf(dims, /source|group/i), theme: colOf(dims, /theme/i) };
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#F3ECEC', muted: '#B39EA1', line: B.darkLine, primary: B.darkPrimary, tipBg: '#F3ECEC', tipInk: B.navy, flow: 'rgba(255,77,109,0.10)',
      g: { 'Email': '#E6D9DA', 'Chat & Mobile': B.darkPrimary, 'Files & Structured': '#8C6F74' } }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#6B5A5C', line: '#E6DCDB', primary: B.primary, tipBg: B.navy, tipInk: '#FFFFFF', flow: 'rgba(217,6,51,0.07)',
      g: { 'Email': '#3B2F30', 'Chat & Mobile': B.primary, 'Files & Structured': '#C9A7AC' } };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var root = document.getElementById('chart'); if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--cc-muted', P.muted], ['--cc-primary', P.primary], ['--cc-ink', P.ink], ['--cc-line', P.line]].forEach(function (kv) { root.style.setProperty(kv[0], kv[1]); });
var reduced = false; try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// cube[month][group] = {col, pro, rev, prd}
var cube = {}, monthsAll = [], groupsSeen = {};
rows.forEach(function (r) {
  var m = toMs(r[C.month]), g = C.group ? String(r[C.group]) : 'All sources';
  if (m == null) return;
  if (!cube[m]) { cube[m] = {}; monthsAll.push(m); }
  groupsSeen[g] = 1;
  var o = cube[m][g] || (cube[m][g] = { col: 0, pro: 0, rev: 0, prd: 0 });
  CFG.stages.forEach(function (s) { if (M[s[0]]) o[s[0]] += +r[M[s[0]]] || 0; });
});
monthsAll.sort(function (a, b) { return a - b; });
var GROUPS = CFG.groups.filter(function (g) { return groupsSeen[g]; });
Object.keys(groupsSeen).forEach(function (g) { if (GROUPS.indexOf(g) < 0) GROUPS.push(g); });
function tot(m, g, k) { var c = cube[m] || {}, s = 0; GROUPS.forEach(function (x) { if ((!g || g === x) && c[x]) s += c[x][k]; }); return s; }
// drop partial months (under 40% of the median collected volume)
var vols = monthsAll.map(function (m) { return tot(m, null, 'col'); }).slice().sort(function (a, b) { return a - b; });
var med = vols.length ? vols[Math.floor(vols.length / 2)] : 0;
var months = monthsAll.filter(function (m) { return tot(m, null, 'col') >= 0.4 * med; });
GROUPS.forEach(function (g) { if (!P.g[g]) P.g[g] = P.muted; });

var state = { i: Math.max(0, months.length - 1), group: '', playing: false };
var anim = null, playTimer = null, lastKey = '', disp = null;

function render() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  if (playTimer) { clearInterval(playTimer); playTimer = null; state.playing = false; }
  root.innerHTML = '';
  if (!rows.length || !M.col || !M.pro || !C.month) {
    root.innerHTML = '<div class="cc-empty">Bind the search<br><b>[Docs Collected] [Docs Promoted to Review] [Docs Reviewed] [Docs Produced] [Batch Date].monthly [Source Group] [Theme Mode]</b></div>';
    return;
  }
  var head = document.createElement('div'); head.className = 'cc-head'; root.appendChild(head);
  head.innerHTML = '<p class="cc-title">' + esc(CFG.title) + '</p><p class="cc-sub"></p>';
  var sub = head.querySelector('.cc-sub');
  var ctl = document.createElement('div'); ctl.className = 'cc-ctl'; head.appendChild(ctl);
  var play = document.createElement('button'); play.className = 'cc-play'; play.setAttribute('aria-label', 'Play months'); play.innerHTML = '&#9654;'; ctl.appendChild(play);
  var pick = document.createElement('label'); pick.className = 'cc-pick'; pick.innerHTML = '<span>Source</span>'; ctl.appendChild(pick);
  var sel = document.createElement('select'); pick.appendChild(sel);
  [''].concat(GROUPS).forEach(function (g) { var o = document.createElement('option'); o.value = g; o.textContent = g || 'All sources'; if (g === state.group) o.selected = true; sel.appendChild(o); });
  var rng = document.createElement('input'); rng.type = 'range'; rng.className = 'cc-range'; rng.min = 0; rng.max = months.length - 1; rng.value = state.i; rng.setAttribute('aria-label', 'Month'); ctl.appendChild(rng);
  var mlab = document.createElement('span'); mlab.className = 'cc-month'; ctl.appendChild(mlab);

  var stage = document.createElement('div'); stage.className = 'cc-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'cc-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);
  var W = Math.max(260, stage.clientWidth), H = Math.max(220, stage.clientHeight);
  lastKey = stage.clientWidth + 'x' + stage.clientHeight;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': CFG.title }, stage);
  var narrow = W < 460;
  var padL = narrow ? 84 : 112, padR = narrow ? 58 : 74, top = 8, bottom = 34;
  var cx = padL + (W - padL - padR) / 2, maxW = W - padL - padR;
  var n = CFG.stages.length, rowH = (H - top - bottom) / n, barH = Math.max(14, Math.min(28, rowH * 0.36));
  var gFlow = svgEl('g', {}, svg), gPart = svgEl('g', {}, svg), gBars = svgEl('g', {}, svg), gLab = svgEl('g', {}, svg);
  var yOf = function (k) { return top + rowH * k + rowH * 0.5 - barH / 2; };

  function values(i) {
    var m = months[i], out = {};
    CFG.stages.forEach(function (s) { out[s[0]] = {}; GROUPS.forEach(function (g) { out[s[0]][g] = (!state.group || state.group === g) && cube[m][g] ? cube[m][g][s[0]] : 0; }); });
    return out;
  }
  var maxCol = 0; months.forEach(function (m) { var v = tot(m, state.group || null, 'col'); if (v > maxCol) maxCol = v; });
  var wOf = function (v) { return v <= 0 ? 0 : Math.max(4, maxW * Math.sqrt(v / maxCol)); };

  // persistent elements
  var segs = [], flows = [], labs = [];
  CFG.stages.forEach(function (s, k) {
    var y = yOf(k);
    var t1 = svgEl('text', { x: 8, y: y + barH / 2 - 2, 'font-size': narrow ? 10.5 : 11.5, 'font-weight': 700, fill: P.ink }, gLab); t1.textContent = s[1];
    var t2 = svgEl('text', { x: 8, y: y + barH / 2 + 12, 'font-size': 10, fill: P.muted }, gLab);
    var t3 = svgEl('text', { x: W - 8, y: y + barH / 2 + 4, 'text-anchor': 'end', 'font-size': narrow ? 11 : 12.5, 'font-weight': 700, fill: P.ink }, gLab);
    labs.push({ sub: t2, val: t3 });
    GROUPS.forEach(function (g) {
      var r = svgEl('rect', { y: y, height: barH, rx: 2, fill: P.g[g], class: 'cc-seg' }, gBars);
      segs.push({ el: r, k: k, g: g });
      r.addEventListener('mousemove', function (ev) { showTip(k, g, ev); });
      r.addEventListener('mouseleave', hideTip);
      r.addEventListener('click', function () { state.group = state.group === g ? '' : g; render(); });
    });
    if (k < n - 1) {
      var poly = svgEl('polygon', { fill: P.flow, stroke: 'none' }, gFlow);
      var lt = svgEl('text', { x: cx, y: y + barH + (rowH - barH) / 2 + 4, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: P.primary, stroke: P.bg, 'stroke-width': 3, 'paint-order': 'stroke' }, gLab);
      flows.push({ el: poly, lab: lt, k: k });
    }
  });
  var foot = svgEl('text', { x: W - 8, y: H - 10, 'text-anchor': 'end', 'font-size': narrow ? 11 : 12, fill: P.muted }, gLab);
  var lx = 8;
  GROUPS.forEach(function (g) {
    svgEl('rect', { x: lx, y: H - 19, width: 9, height: 9, rx: 1, fill: P.g[g] }, gLab);
    var lt2 = svgEl('text', { x: lx + 13, y: H - 11, 'font-size': 10, fill: P.muted }, gLab); lt2.textContent = narrow ? g.split(' ')[0] : g;
    lx += 13 + (narrow ? 34 : g.length * 5.6) + 10;
  });

  function stageTot(v, key) { var s = 0; GROUPS.forEach(function (g) { s += v[key][g]; }); return s; }
  function layout(v) {
    CFG.stages.forEach(function (s, k) {
      var total = stageTot(v, s[0]), w = wOf(total), x = cx - w / 2;
      segs.filter(function (o) { return o.k === k; }).forEach(function (o) {
        var sw = total > 0 ? w * v[s[0]][o.g] / total : 0;
        o.el.setAttribute('x', x.toFixed(1)); o.el.setAttribute('width', Math.max(0, sw).toFixed(1)); x += sw;
      });
      labs[k].val.textContent = big(total);
      var colT = stageTot(v, 'col');
      labs[k].sub.textContent = k === 0 ? 'docs in' : pc(colT > 0 ? total / colT : null, k === 3 ? 2 : 1) + ' of collected';
      s.w = w;
    });
    flows.forEach(function (f) {
      var a = CFG.stages[f.k], b = CFG.stages[f.k + 1], ya = yOf(f.k) + barH, yb = yOf(f.k + 1);
      f.el.setAttribute('points', [cx - a.w / 2, ya, cx + a.w / 2, ya, cx + b.w / 2, yb, cx - b.w / 2, yb].map(function (q) { return q.toFixed(1); }).join(' '));
      var ta = stageTot(v, a[0]), tb = stageTot(v, b[0]);
      var lbl = f.k === 0 ? 'culled by AmplifyAI, dedupe and filters' : f.k === 1 ? 'decided by TAR / aiR, no human read' : 'non-responsive or withheld as privileged';
      f.lab.textContent = '-' + pc(ta > 0 ? 1 - tb / ta : null) + ' ' + (narrow ? '' : lbl);
    });
  }
  function readout(i) {
    var m = months[i], g = state.group || null, col = tot(m, g, 'col'), pro = tot(m, g, 'pro');
    var chat = tot(m, 'Chat & Mobile', 'col'), all = tot(m, null, 'col');
    mlab.textContent = monLabel(m);
    foot.textContent = 'Cull rate ' + pc(col > 0 ? 1 - pro / col : null) + (state.group ? '' : '  |  Chat share ' + pc(all > 0 ? chat / all : null, 0));
  }
  // story subline: first full year vs latest month
  (function () {
    var f = months[0], l = months[months.length - 1];
    var sh = function (m) { var a = tot(m, null, 'col'); return a > 0 ? tot(m, 'Chat & Mobile', 'col') / a : null; };
    var cr = function (m) { var a = tot(m, null, 'col'); return a > 0 ? 1 - tot(m, null, 'pro') / a : null; };
    sub.innerHTML = 'Chat &amp; Mobile grew from ' + pc(sh(f), 0) + ' to <b>' + pc(sh(l), 0) + '</b> of collected docs; cull rate ' + pc(cr(f)) + ' -> <b>' + pc(cr(l)) + '</b>.';
  })();

  function showTip(k, g, ev) {
    var v = values(state.i), s = CFG.stages[k], val = v[s[0]][g], tot0 = stageTot(v, s[0]);
    var col = v.col[g], pro = v.pro[g];
    tip.innerHTML = '<b>' + esc(g) + ' - ' + esc(s[1]) + '</b>' + big(val) + ' docs (' + pc(tot0 > 0 ? val / tot0 : null, 0) + ' of stage)<br>' +
      (k === 0 ? 'Cull rate ' + pc(col > 0 ? 1 - pro / col : null) : pc(col > 0 ? val / col : null, 2) + ' of its collected docs') + '<br>' + monLabel(months[state.i]) + ' - click to isolate';
    var rb = root.getBoundingClientRect(), x = ev.clientX - rb.left + 12, y = ev.clientY - rb.top + 12;
    tip.style.opacity = 1;
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    tip.style.left = Math.min(x, rb.width - tw - 6) + 'px'; tip.style.top = Math.min(y, rb.height - th - 6) + 'px';
  }
  function hideTip() { tip.style.opacity = 0; }

  // particles: documents falling; most peel off at the first sieve
  var parts = [];
  function spawn() {
    var v = disp, colT = stageTot(v, 'col'); if (colT <= 0) return;
    var r = Math.random() * colT, g = GROUPS[0];
    for (var j = 0; j < GROUPS.length; j++) { r -= v.col[GROUPS[j]]; if (r <= 0) { g = GROUPS[j]; break; } }
    var w0 = CFG.stages[0].w || 10;
    var c = svgEl('circle', { r: 2.1, fill: P.g[g], opacity: 0.85 }, gPart);
    parts.push({ el: c, g: g, x: cx + (Math.random() - 0.5) * w0 * 0.9, y: yOf(0) + barH, vy: 0.9 + Math.random() * 0.6, vx: 0, k: 0, out: false, life: 1 });
  }
  function stepParts() {
    var v = disp;
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (!p.out) {
        var nextY = yOf(p.k + 1);
        if (p.y >= nextY - 1) {
          var a = v[CFG.stages[p.k][0]][p.g], b = v[CFG.stages[p.k + 1][0]][p.g];
          var keep = a > 0 ? b / a : 0;
          if (Math.random() > keep) { p.out = true; p.vx = (p.x < cx ? -1 : 1) * (0.8 + Math.random() * 1.2); p.vy = 0.3; }
          else { p.k++; p.y = nextY + barH; var w = CFG.stages[p.k].w || 4; p.x = cx + (Math.random() - 0.5) * w * 0.9; }
          if (p.k >= n - 1) p.life = 0;
        }
        p.y += p.vy;
      } else { p.x += p.vx; p.y += p.vy; p.life -= 0.025; }
      if (p.life <= 0) { p.el.remove(); parts.splice(i, 1); continue; }
      p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', p.y.toFixed(1)); p.el.setAttribute('opacity', (0.85 * p.life).toFixed(2));
    }
  }

  var target = values(state.i);
  disp = disp && lastKey ? disp : target;
  disp = JSON.parse(JSON.stringify(target));
  layout(disp); readout(state.i);
  var tick = 0;
  function loop() {
    var moved = false;
    CFG.stages.forEach(function (s) { GROUPS.forEach(function (g) { var a = disp[s[0]][g], b = target[s[0]][g]; if (Math.abs(a - b) > 0.5) { disp[s[0]][g] = a + (b - a) * 0.18; moved = true; } else disp[s[0]][g] = b; }); });
    if (moved) layout(disp);
    if (!reduced) { if (tick++ % 3 === 0 && parts.length < 90) spawn(); stepParts(); }
    anim = requestAnimationFrame(loop);
  }
  if (!reduced) anim = requestAnimationFrame(loop);

  function setMonth(i) { hideTip(); state.i = i; rng.value = i; target = values(i); if (reduced) { disp = JSON.parse(JSON.stringify(target)); layout(disp); } readout(i); }
  function setPlay(on) {
    state.playing = on; play.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    if (on) {
      if (state.i >= months.length - 1) setMonth(0);
      playTimer = setInterval(function () { if (state.i >= months.length - 1) { setPlay(false); return; } setMonth(state.i + 1); }, reduced ? 1100 : 650);
    }
  }
  play.addEventListener('click', function () { setPlay(!state.playing); });
  rng.addEventListener('input', function () { setPlay(false); setMonth(+rng.value); });
  sel.addEventListener('change', function () { state.group = sel.value; render(); });
}

try {
  render();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { var st = root.querySelector('.cc-stage'); if (st && st.clientWidth + 'x' + st.clientHeight !== lastKey) render(); }).observe(root);
  }
  done();
} catch (err) {
  root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px;color:#D90633">' + esc(err && err.stack ? err.stack : err) + '</pre>';
  done();
}
