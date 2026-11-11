// Unite Us closed-loop referral journey. Bespoke SVG, no chart library.
// Search: [Referrals] [Referral Status] [Outcome Reason] [Service Type] [State] [Theme Mode]
// Interactions: service and state chips filter the loop; hover any stage, arc or loss stream for counts; particles show the flow.
var CFG = {
  title: 'The closed loop',
  brand: { primary: '#216CFF', accent: '#9643FF', navy: '#2C405A', light: '#EEF5FC', leak: '#A9BCD6',
    darkBg: '#16263d', darkLine: '#25395a', darkPrimary: '#5B9BFF', darkAccent: '#B583FF', darkLeak: '#4F6688' },
  accepted: ['Accepted', 'In Progress', 'Closed - Resolved', 'Closed - Unresolved'],
  closed: ['Closed - Resolved', 'Closed - Unresolved'],
  resolved: ['Closed - Resolved'],
  maxServiceChips: 5
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
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[closed-loop] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[closed-loop] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(schema, re) { for (var i = 0; i < schema.length; i++) if (re.test(schema[i].name)) return schema[i].name; return null; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtN(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'K' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n)); }
var SHORT = { 'Unable to Contact Client': 'Unable to contact', 'Program at Capacity': 'At capacity', 'Outside Service Area': 'Outside area', 'Client Declined': 'Client declined', 'Not Eligible': 'Not eligible' };
function shortName(n) { var p = String(n).split(': '); var t = p.length > 1 ? p[0] + ': ' + (SHORT[p[1]] || p[1]) : (SHORT[n] || n); return t.length > 28 ? t.slice(0, 27) + '.' : t; }
function pct(a, b) { return b ? (100 * a / b).toFixed(1) + '%' : '0%'; }
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var C = { status: colOf(schema, /status/i), reason: colOf(schema, /reason/i), service: colOf(schema, /service/i), state: colOf(schema, /^state$/i) || colOf(schema, /state/i), n: (schema.filter(function (c) { return /measure/i.test(c.type) || /^(total|sum)\b/i.test(c.name); })[0] || {}).name || colOf(schema, /^total referrals$/i), theme: colOf(schema, /theme/i) };
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#E8EEF6', muted: '#9FB0C6', line: B.darkLine, primary: B.darkPrimary, accent: B.darkAccent, leak: B.darkLeak, tipBg: '#E8EEF6', tipInk: B.navy }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#5B6B80', line: '#DDE5EF', primary: B.primary, accent: B.accent, leak: B.leak, tipBg: B.navy, tipInk: '#FFFFFF' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--cl-primary', P.primary], ['--cl-line', P.line], ['--cl-muted', P.muted], ['--cl-ink', P.ink]].forEach(function (t) { root.style.setProperty(t[0], t[1]); });

var sel = { service: 'All', state: 'All' };
var anim = null;
var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

function totalsBy(col) {
  var m = {};
  rows.forEach(function (r) { var k = r[col]; m[k] = (m[k] || 0) + (Number(r[C.n]) || 0); });
  return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
}

function journey() {
  var j = { referred: 0, accepted: 0, closed: 0, resolved: 0, leak1: {}, leak2: 0, leak3: {} };
  rows.forEach(function (r) {
    if (sel.service !== 'All' && r[C.service] !== sel.service) return;
    if (sel.state !== 'All' && r[C.state] !== sel.state) return;
    var n = Number(r[C.n]) || 0, s = String(r[C.status]), why = String(r[C.reason]);
    j.referred += n;
    if (CFG.accepted.indexOf(s) >= 0) j.accepted += n;
    else { var k = s === 'Pending' ? 'Awaiting partner' : (s === 'Declined' ? 'Declined: ' : 'Recalled: ') + why; j.leak1[k] = (j.leak1[k] || 0) + n; }
    if (CFG.closed.indexOf(s) >= 0) j.closed += n; else if (CFG.accepted.indexOf(s) >= 0) j.leak2 += n;
    if (CFG.resolved.indexOf(s) >= 0) j.resolved += n; else if (CFG.closed.indexOf(s) >= 0) j.leak3[why] = (j.leak3[why] || 0) + n;
  });
  return j;
}
function topLeaks(m, k) {
  var keys = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; });
  var out = keys.slice(0, k).map(function (x) { return { name: x, n: m[x] }; });
  var rest = keys.slice(k).reduce(function (s, x) { return s + m[x]; }, 0);
  if (rest > 0) out.push({ name: 'Other', n: rest });
  return out;
}

function render() {
  if (anim) { cancelAnimationFrame(anim); anim = null; }
  root.innerHTML = '';
  if (!rows.length || !C.status || !C.n) {
    root.innerHTML = '<div class="cl-empty">No referral rows yet.<br>Bind the search: [Referrals] [Referral Status] [Outcome Reason] [Service Type] [State] [Theme Mode]</div>';
    return;
  }
  var j = journey();
  var head = document.createElement('div'); head.className = 'cl-head'; root.appendChild(head);
  var rr = j.closed ? j.resolved / j.closed : 0;
  head.innerHTML = '<p class="cl-title">' + esc(CFG.title) + '</p><p class="cl-sub">' + esc(fmtN(j.referred)) + ' referrals: ' + pct(j.accepted, j.referred) + ' accepted by a partner, ' + pct(j.resolved, j.closed) + ' of closed cases resolved.</p>';
  var chips = document.createElement('div'); chips.className = 'cl-chips'; head.appendChild(chips);
  function picker(group, label, options, allLabel) {
    var w = document.createElement('label'); w.className = 'cl-pick';
    var sp = document.createElement('span'); sp.textContent = label; w.appendChild(sp);
    var s = document.createElement('select');
    ['All'].concat(options).forEach(function (o) { var op = document.createElement('option'); op.value = o; op.textContent = o === 'All' ? allLabel : o; if (sel[group] === o) op.selected = true; s.appendChild(op); });
    s.addEventListener('change', function () { sel[group] = s.value; render(); });
    w.appendChild(s); chips.appendChild(w);
  }
  if (C.service) picker('service', 'Need', totalsBy(C.service), 'All needs');
  if (C.state) picker('state', 'State', totalsBy(C.state), 'All states');

  var stage = document.createElement('div'); stage.className = 'cl-stage'; root.appendChild(stage);
  var tip = document.createElement('div'); tip.className = 'cl-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);
  function showTip(html, ev) {
    tip.innerHTML = html; tip.style.opacity = '1';
    var rb = root.getBoundingClientRect(), x = ev.clientX - rb.left + 12, y = ev.clientY - rb.top + 12;
    if (x + tip.offsetWidth > rb.width - 4) x = ev.clientX - rb.left - tip.offsetWidth - 12;
    if (y + tip.offsetHeight > rb.height - 4) y = ev.clientY - rb.top - tip.offsetHeight - 12;
    tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
  }
  function hideTip() { tip.style.opacity = '0'; }

  var W = stage.clientWidth || 480, H = stage.clientHeight || 340;
  var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Closed-loop referral journey' }, stage);
  var narrow = W < 460;
  var R = Math.max(36, Math.min(W * (narrow ? 0.24 : 0.22), (H - 112) / 2));
  var cx = W * 0.47, cy = H / 2 + 4;
  var D2R = Math.PI / 180;
  function pt(deg, r) { var a = deg * D2R; return { x: cx + (r || R) * Math.sin(a), y: cy - (r || R) * Math.cos(a) }; }
  function arcD(a1, a2) { var p1 = pt(a1), p2 = pt(a2); return 'M' + p1.x.toFixed(1) + ',' + p1.y.toFixed(1) + ' A' + R + ',' + R + ' 0 0 1 ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1); }
  var maxW = R * 0.2, minW = 2.5;
  function wOf(n) { return j.referred ? Math.max(minW, maxW * n / j.referred) : minW; }

  var STAGES = [
    { deg: -45, name: 'Referred', n: j.referred, note: 'All referrals sent' },
    { deg: 45, name: 'Accepted', n: j.accepted, note: 'Accepted by a partner' },
    { deg: 135, name: 'Case closed', n: j.closed, note: 'Services attempted, case closed' },
    { deg: 225, name: 'Resolved', n: j.resolved, note: 'Client received services' }
  ];
  var ARCS = [
    { a1: -45, a2: 45, n: j.accepted, mid: 0, leaks: topLeaks(j.leak1, 2), label: 'Lost before acceptance' },
    { a1: 45, a2: 135, n: j.closed, mid: 90, leaks: j.leak2 ? [{ name: 'Still in progress', n: j.leak2 }] : [], label: 'Open cases' },
    { a1: 135, a2: 225, n: j.resolved, mid: 180, leaks: topLeaks(j.leak3, 2), label: 'Closed unresolved' }
  ];
  var gArcs = svgEl('g', {}, svg), gLeaks = svgEl('g', {}, svg), gNodes = svgEl('g', {}, svg), gDots = svgEl('g', {}, svg);
  // Track ring and the loop-closing return arc.
  svgEl('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: P.line, 'stroke-width': 1 }, gArcs);
  var back = svgEl('path', { d: arcD(225, 315), fill: 'none', stroke: P.accent, 'stroke-width': Math.max(2, wOf(j.resolved) * 0.5), 'stroke-dasharray': '4 5', 'stroke-linecap': 'round', opacity: 0.85 }, gArcs);
  var lp = pt(270, R + 12);
  var lt = svgEl('text', { x: lp.x, y: lp.y - 4, 'text-anchor': 'end', 'font-size': 10.5, fill: P.accent, 'font-weight': 600 }, gArcs);
  lt.textContent = 'Outcome recorded';
  var lt2 = svgEl('text', { x: lp.x, y: lp.y + 8, 'text-anchor': 'end', 'font-size': 10.5, fill: P.accent }, gArcs); lt2.textContent = 'loop closed';
  back.addEventListener('mousemove', function (ev) { showTip('<b>Loop closed</b>' + fmtN(j.resolved) + ' outcomes recorded back to the sender', ev); });
  back.addEventListener('mouseleave', hideTip);

  var paths = [];
  ARCS.forEach(function (A, i) {
    var p = svgEl('path', { d: arcD(A.a1, A.a2), fill: 'none', stroke: P.primary, 'stroke-width': wOf(A.n), 'stroke-linecap': 'butt', opacity: 0.9 }, gArcs);
    p.style.cursor = 'pointer';
    p.addEventListener('mousemove', function (ev) { showTip('<b>' + esc(STAGES[i].name) + ' to ' + esc(STAGES[i + 1].name) + '</b>' + fmtN(A.n) + ' referrals (' + pct(A.n, j.referred) + ' of referred)', ev); });
    p.addEventListener('mouseleave', hideTip);
    paths.push({ el: p, len: p.getTotalLength(), leaks: [] });
    // Loss streams peel outward from the arc midpoint.
    var m = pt(A.mid), out = pt(A.mid, R + (A.mid === 90 ? 26 : 22));
    var k = A.leaks.length;
    A.leaks.forEach(function (L, li) {
      var spread = (li - (k - 1) / 2);
      var ex, ey, anchor;
      if (A.mid === 90) { ex = Math.min(W - 6, out.x + 26); ey = cy + spread * 34; anchor = 'start'; }
      else { ex = W * (li + 0.5) / k; ey = A.mid === 0 ? Math.max(30, cy - R - 34) : Math.min(H - 32, cy + R + 30); anchor = 'middle'; }
      var c1x = out.x, c1y = out.y;
      var d = 'M' + m.x.toFixed(1) + ',' + m.y.toFixed(1) + ' Q' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + ex.toFixed(1) + ',' + ey.toFixed(1);
      var lw = Math.max(2, wOf(L.n) * 0.9);
      var lpth = svgEl('path', { d: d, fill: 'none', stroke: P.leak, 'stroke-width': lw, 'stroke-linecap': 'round', opacity: 0.9 }, gLeaks);
      lpth.style.cursor = 'pointer';
      var ty = A.mid === 0 ? ey - 8 : A.mid === 180 ? ey + 14 : ey + 4;
      var tx = A.mid === 90 ? ex + 6 : ex;
      var name = shortName(L.name);
      var t1 = svgEl('text', { x: tx, y: ty, 'text-anchor': anchor, 'font-size': 10, fill: P.muted }, gLeaks); t1.textContent = name;
      var t2 = svgEl('text', { x: tx, y: ty + 11, 'text-anchor': anchor, 'font-size': 10.5, 'font-weight': 700, fill: P.ink }, gLeaks); t2.textContent = fmtN(L.n) + ' (' + pct(L.n, j.referred) + ')';
      var hl = function (on) { lpth.setAttribute('stroke', on ? P.accent : P.leak); };
      [lpth, t1, t2].forEach(function (el) {
        el.addEventListener('mousemove', function (ev) { hl(true); showTip('<b>' + esc(L.name) + '</b>' + fmtN(L.n) + ' referrals, ' + pct(L.n, j.referred) + ' of all referred', ev); });
        el.addEventListener('mouseleave', function () { hl(false); hideTip(); });
      });
      paths[i].leaks.push({ el: lpth, len: lpth.getTotalLength(), n: L.n });
    });
  });

  STAGES.forEach(function (S) {
    var p = pt(S.deg), lab = pt(S.deg, R + (narrow ? 16 : 20));
    var right = Math.sin(S.deg * D2R) > 0, down = Math.cos(S.deg * D2R) < 0;
    var node = svgEl('circle', { cx: p.x, cy: p.y, r: 7, fill: P.bg, stroke: P.primary, 'stroke-width': 3 }, gNodes);
    var ax = right ? 'start' : 'end', ly = down ? lab.y + 12 : lab.y - 14;
    var t1 = svgEl('text', { x: lab.x, y: ly, 'text-anchor': ax, 'font-size': 11, 'font-weight': 700, fill: P.ink }, gNodes); t1.textContent = S.name;
    var t2 = svgEl('text', { x: lab.x, y: ly + 12, 'text-anchor': ax, 'font-size': 10.5, fill: P.muted }, gNodes); t2.textContent = fmtN(S.n) + (S.name === 'Referred' ? '' : ' (' + pct(S.n, j.referred) + ')');
    [node, t1, t2].forEach(function (el) {
      el.addEventListener('mousemove', function (ev) { showTip('<b>' + esc(S.name) + '</b>' + esc(S.note) + ': ' + fmtN(S.n) + (S.name === 'Referred' ? '' : ', ' + pct(S.n, j.referred) + ' of referred'), ev); });
      el.addEventListener('mouseleave', hideTip);
    });
  });

  var big = svgEl('text', { x: cx, y: cy + 2, 'text-anchor': 'middle', 'font-size': Math.max(18, R * 0.34), 'font-weight': 700, fill: P.primary }, gNodes);
  big.textContent = j.closed ? Math.round(100 * rr) + '%' : '-';
  var small = svgEl('text', { x: cx, y: cy + 2 + Math.max(13, R * 0.17), 'text-anchor': 'middle', 'font-size': 10.5, fill: P.muted }, gNodes);
  small.textContent = 'cases resolved';

  // Particles: each travels the ring and either continues or peels into a loss stream, in proportion to the data.
  var N = reduced ? 0 : Math.round(Math.min(46, 14 + R * 0.25));
  var dots = [];
  function spawn(d) {
    d.seg = 0; d.t = -Math.random() * 1.2; d.leak = null; d.speed = 0.0035 + Math.random() * 0.002;
  }
  for (var i = 0; i < N; i++) { var c = svgEl('circle', { r: 2.4, fill: P.primary, opacity: 0 }, gDots); var d = { el: c }; spawn(d); d.t = Math.random() * 3 - 1; dots.push(d); }
  var segOut = [j.referred, j.accepted, j.closed];
  var segIn = [j.accepted, j.closed, j.resolved];
  function step() {
    dots.forEach(function (d) {
      d.t += d.speed * 1.6;
      if (d.t < 0) { d.el.setAttribute('opacity', 0); return; }
      if (d.leak) {
        if (d.t >= 1) { spawn(d); return; }
        var q = d.leak.el.getPointAtLength(d.leak.len * d.t);
        d.el.setAttribute('cx', q.x); d.el.setAttribute('cy', q.y); d.el.setAttribute('fill', P.leak); d.el.setAttribute('opacity', (1 - d.t).toFixed(2));
        return;
      }
      if (d.seg === 3) {
        if (d.t >= 1) { spawn(d); return; }
        var qb = back.getPointAtLength(back.getTotalLength() * d.t);
        d.el.setAttribute('cx', qb.x); d.el.setAttribute('cy', qb.y); d.el.setAttribute('fill', P.accent); d.el.setAttribute('opacity', 0.9);
        return;
      }
      var P0 = paths[d.seg];
      if (d.t >= 0.5 && d.decided !== d.seg) {
        d.decided = d.seg;
        var keep = segOut[d.seg] ? segIn[d.seg] / segOut[d.seg] : 1;
        if (Math.random() > keep && P0.leaks.length) {
          var tot = P0.leaks.reduce(function (s, L) { return s + L.n; }, 0), r = Math.random() * tot, acc = 0, pick = P0.leaks[0];
          for (var k = 0; k < P0.leaks.length; k++) { acc += P0.leaks[k].n; if (r <= acc) { pick = P0.leaks[k]; break; } }
          d.leak = pick; d.t = 0; return;
        }
      }
      if (d.t >= 1) { d.seg += 1; d.t = 0; d.decided = -1; return; }
      var p = P0.el.getPointAtLength(P0.len * d.t);
      d.el.setAttribute('cx', p.x); d.el.setAttribute('cy', p.y); d.el.setAttribute('fill', '#FFFFFF'); d.el.setAttribute('opacity', 0.95);
    });
    anim = requestAnimationFrame(step);
  }
  if (N) anim = requestAnimationFrame(step);
}

var lastW = 0, lastH = 0, timer = null;
try { render(); } catch (err) { console.error('[closed-loop] render failed', err); root.innerHTML = '<pre style="white-space:pre-wrap;font-size:11px;padding:10px">' + esc(err && err.stack || err) + '</pre>'; }
done();
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(function () {
    var r = root.getBoundingClientRect();
    if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 2) return;
    lastW = r.width; lastH = r.height; clearTimeout(timer); timer = setTimeout(function () { try { render(); } catch (e) { console.error(e); } }, 120);
  }).observe(root);
}
