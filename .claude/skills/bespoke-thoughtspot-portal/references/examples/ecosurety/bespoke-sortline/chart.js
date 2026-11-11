// Ecosurety RAM sorting line. Bespoke SVG conveyor, no chart library.
// Search: [Material] [RAM Rating] [Placed on Market Date].quarterly [Sector] [Tonnage] [EPR Fee] [Theme Mode]
// Interactions: sector and quarter selects, Play steps through quarters, hover any belt segment or lane for tonnes and fees.
var CFG = {
  title: 'RAM sorting line',
  defaultSector: 'Health & Beauty',
  brand: { primary: '#00B8FF', navy: '#020A1D', darkBg: '#0b1a33', darkLine: '#1c3150', darkPrimary: '#52B5F9' },
  ram: { Green: '#00BB7F', Amber: '#F99C00', Red: '#FF2357' },
  ramOrder: ['Green', 'Amber', 'Red'],
  modulation: { Green: '0.9x', Amber: '1.0x', Red: '1.2x' },
  stepMs: 1100
};
var GBP = '\u00a3';
var SHORT = { 'Fibre-based Composite': 'Fibre composite', 'Paper and Card': 'Paper & card' };

function getViz() {
  try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {}
  return null;
}
function cellVal(v) {
  if (v == null || typeof v !== 'object') return v;
  try { var r = typeof v.value === 'function' ? v.value() : v.value; return r != null ? r : (v.v != null ? v.v : v.formatted); } catch (e) { return null; }
}
function done() {
  try { getViz().events.emitRenderCompletedEvent(); } catch (e) { console.warn('[sortline] render-complete unavailable', e); }
}
function liveRows() {
  try {
    var V = getViz(), dm = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery(), raw = dm && dm.getData();
    if (!raw || !raw.data || !raw.data.length) return { schema: (raw && raw.schema) || [], rows: [] };
    var schema = raw.schema || [];
    return { schema: schema, rows: raw.data.map(function (a) { var o = {}; schema.forEach(function (c, i) { o[c.name] = cellVal(a[i]); }); return o; }) };
  } catch (e) { console.warn('[sortline] live data unavailable', e); return { schema: [], rows: [] }; }
}
function colOf(schema, re, measure) {
  for (var i = 0; i < schema.length; i++) {
    var c = schema[i], isM = /measure/i.test(c.type || '') || /^(total|sum|average)\b/i.test(c.name);
    if (measure === true && !isM) continue;
    if (measure === false && isM) continue;
    if (re.test(c.name)) return c.name;
  }
  return null;
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function fmtT(n) { return n >= 1e5 ? Math.round(n / 1e3) + 'K t' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K t' : Math.round(n).toLocaleString('en-GB') + ' t'; }
function fmtP(x) { return (100 * x).toFixed(1) + '%'; }
function qLabel(v) {
  var d = typeof v === 'number' ? new Date(v < 1e11 ? v * 1000 : v) : new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return 'Q' + (Math.floor(d.getUTCMonth() / 3) + 1) + ' ' + d.getUTCFullYear();
}
var NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

var LD = liveRows(), schema = LD.schema, rows = LD.rows;
var C = {
  material: colOf(schema, /material/i, false),
  ram: colOf(schema, /ram|rating|recyclab/i, false),
  quarter: colOf(schema, /quarter|date/i, false),
  sector: colOf(schema, /sector/i, false),
  theme: colOf(schema, /theme/i, false),
  tonnes: colOf(schema, /tonn|weight/i, true),
  fee: colOf(schema, /fee/i, true)
};
var dark = !!C.theme && rows.length > 0 && String(rows[0][C.theme]).toLowerCase() === 'dark';
var B = CFG.brand;
var P = dark
  ? { bg: B.darkBg, ink: '#EAF4FF', muted: '#9FB3C8', line: B.darkLine, belt: '#13294d', primary: B.darkPrimary, tipBg: '#EAF4FF', tipInk: B.navy }
  : { bg: '#FFFFFF', ink: B.navy, muted: '#4A5565', line: '#E5E5E5', belt: '#EEF3F7', primary: B.primary, tipBg: B.navy, tipInk: '#FFFFFF' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;

var root = document.getElementById('chart');
if (!root) { root = document.createElement('div'); root.id = 'chart'; document.body.appendChild(root); }
root.style.background = P.bg; root.style.color = P.ink;
[['--sl-primary', P.primary], ['--sl-line', P.line], ['--sl-muted', P.muted], ['--sl-ink', P.ink], ['--sl-bg', P.bg]].forEach(function (t) { root.style.setProperty(t[0], t[1]); });

var reduced = false;
try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// ---- data model: quarter -> sector -> material -> rating -> {t, fee}
var quarters = [], sectors = [], matTotals = {};
var cube = {};
rows.forEach(function (r) {
  var q = r[C.quarter], s = r[C.sector] || 'All', m = r[C.material], g = r[C.ram];
  var t = Number(r[C.tonnes]) || 0, f = Number(r[C.fee]) || 0;
  if (m == null || g == null) return;
  if (quarters.indexOf(q) < 0) quarters.push(q);
  if (sectors.indexOf(s) < 0) sectors.push(s);
  matTotals[m] = (matTotals[m] || 0) + t;
  var k = q + '|' + s + '|' + m + '|' + g;
  if (!cube[k]) cube[k] = { t: 0, f: 0 };
  cube[k].t += t; cube[k].f += f;
});
quarters.sort(function (a, b) { return Number(a) - Number(b); });
sectors.sort();
var materials = Object.keys(matTotals).sort(function (a, b) { return matTotals[b] - matTotals[a]; });

var sel = { sector: sectors.indexOf(CFG.defaultSector) >= 0 ? CFG.defaultSector : 'All', qi: Math.max(0, quarters.length - 1) };
var shown = {}; // current animated shares per material
var anim = null, playTimer = null, particles = [], lastTs = 0;

function lane(qi, m) {
  var q = quarters[qi], out = { t: 0, f: 0, by: {} };
  CFG.ramOrder.forEach(function (g) { out.by[g] = { t: 0, f: 0 }; });
  sectors.forEach(function (s) {
    if (sel.sector !== 'All' && s !== sel.sector) return;
    CFG.ramOrder.forEach(function (g) {
      var c = cube[q + '|' + s + '|' + m + '|' + g];
      if (c) { out.by[g].t += c.t; out.by[g].f += c.f; out.t += c.t; out.f += c.f; }
    });
  });
  return out;
}
function redShare(qi) {
  var red = 0, tot = 0;
  materials.forEach(function (m) { var l = lane(qi, m); red += l.by.Red.t; tot += l.t; });
  return tot ? red / tot : 0;
}

// ---- DOM scaffold
root.innerHTML = '';
var head = document.createElement('div'); head.className = 'sl-head'; root.appendChild(head);
var ttl = document.createElement('div'); ttl.className = 'sl-title'; ttl.textContent = CFG.title; head.appendChild(ttl);
var sub = document.createElement('div'); sub.className = 'sl-sub'; head.appendChild(sub);
var ctr = document.createElement('div'); ctr.className = 'sl-ctr'; root.appendChild(ctr);
function mkSelect(opts, val, onCh, label) {
  var s = document.createElement('select'); s.setAttribute('aria-label', label);
  opts.forEach(function (o) { var e = document.createElement('option'); e.value = o.v; e.textContent = o.t; if (String(o.v) === String(val)) e.selected = true; s.appendChild(e); });
  s.onchange = function () { onCh(s.value); };
  ctr.appendChild(s); return s;
}
var secSel = mkSelect([{ v: 'All', t: 'All sectors' }].concat(sectors.map(function (s) { return { v: s, t: s }; })), sel.sector, function (v) { stop(); sel.sector = v; render(true); }, 'Sector');
var qSel = mkSelect(quarters.map(function (q, i) { return { v: i, t: qLabel(q) + (i === quarters.length - 1 ? ' (to date)' : '') }; }), sel.qi, function (v) { stop(); sel.qi = Number(v); render(true); }, 'Quarter');
var play = document.createElement('button'); play.className = 'sl-play'; play.type = 'button'; play.textContent = 'Play'; ctr.appendChild(play);
play.onclick = function () { if (playTimer) stop(); else start(0); };
var stage = document.createElement('div'); stage.className = 'sl-stage'; root.appendChild(stage);
var legend = document.createElement('div'); legend.className = 'sl-legend'; root.appendChild(legend);
legend.innerHTML = CFG.ramOrder.map(function (g) { return '<span><i style="background:' + CFG.ram[g] + '"></i>' + g + ' <em>fee ' + CFG.modulation[g] + '</em></span>'; }).join('') + '<span class="sl-legend-note">' + GBP + '/t = EPR fee per tonne</span>';
var tip = document.createElement('div'); tip.className = 'sl-tip'; tip.style.background = P.tipBg; tip.style.color = P.tipInk; root.appendChild(tip);

function showTip(e, html) {
  tip.innerHTML = html; tip.style.display = 'block';
  var r = root.getBoundingClientRect(), x = e.clientX - r.left + 12, y = e.clientY - r.top + 12;
  var w = tip.offsetWidth, h = tip.offsetHeight;
  if (x + w > r.width - 4) x = e.clientX - r.left - w - 12;
  if (y + h > r.height - 4) y = e.clientY - r.top - h - 12;
  tip.style.left = Math.max(4, x) + 'px'; tip.style.top = Math.max(4, y) + 'px';
}
function hideTip() { tip.style.display = 'none'; }

function start(from) {
  stop(); sel.qi = from; qSel.value = String(from); render(true);
  play.textContent = 'Pause'; play.classList.add('is-on');
  playTimer = setInterval(function () {
    if (sel.qi >= quarters.length - 1) { stop(); return; }
    sel.qi += 1; qSel.value = String(sel.qi); render(true);
  }, CFG.stepMs);
}
function stop() { if (playTimer) clearInterval(playTimer); playTimer = null; play.textContent = 'Play'; play.classList.remove('is-on'); }

var svg = null, geom = null;
function render(animate) {
  var qi = sel.qi, first = 0;
  var rs = redShare(qi), r0 = redShare(first), d = (rs - r0) * 100;
  sub.innerHTML = 'Red-rated share <b style="color:' + CFG.ram.Red + '">' + fmtP(rs) + '</b> in ' + esc(qLabel(quarters[qi])) +
    (qi > first ? ' <span class="sl-delta">' + (d <= 0 ? '' : '+') + d.toFixed(1) + ' pts vs ' + esc(qLabel(quarters[first])) + '</span>' : '') +
    (sel.sector !== 'All' ? ' &middot; ' + esc(sel.sector) : '');
  var target = {};
  materials.forEach(function (m) {
    var l = lane(qi, m);
    target[m] = { t: l.t, f: l.f, by: l.by, s: CFG.ramOrder.map(function (g) { return l.t ? l.by[g].t / l.t : 0; }) };
  });
  if (anim) cancelAnimationFrame(anim.raf);
  var from = {};
  materials.forEach(function (m) { from[m] = shown[m] ? shown[m].slice() : target[m].s.slice(); });
  var t0 = performance.now(), dur = animate && !reduced ? 650 : 0;
  function frame(now) {
    var k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
    materials.forEach(function (m) { shown[m] = from[m].map(function (v, i) { return v + (target[m].s[i] - v) * e; }); });
    draw(target);
    if (k < 1) anim = { raf: requestAnimationFrame(frame) }; else anim = null;
  }
  frame(t0);
}

function draw(target) {
  var W = stage.clientWidth || 500, H = stage.clientHeight || 300;
  if (!svg) { svg = svgEl('svg', { width: W, height: H, role: 'img', 'aria-label': CFG.title }); stage.appendChild(svg); }
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  hideTip();
  var n = materials.length || 1, labW = Math.min(132, Math.max(96, W * 0.25)), feeW = 52, x0 = labW, x1 = W - feeW - 6;
  var laneH = H / n, beltH = Math.max(8, Math.min(16, laneH * 0.36));
  geom = { x0: x0, x1: x1, lanes: [] };
  materials.forEach(function (m, i) {
    var T = target[m], cy = i * laneH + laneH / 2, g = svgEl('g', {}, svg);
    var short = SHORT[m] || m, maxCh = Math.floor((labW - 8) / 7.2); var lbl = svgEl('text', { x: 0, y: cy - 2, fill: P.ink, 'font-size': 12, 'font-weight': 700 }, g); lbl.textContent = short.length > maxCh ? short.slice(0, maxCh - 1) + '.' : short;
    var tl = svgEl('text', { x: 0, y: cy + 12, fill: P.muted, 'font-size': 10.5 }, g); tl.textContent = T.t ? fmtT(T.t) : 'no data';
    var L0 = lane(0, m), dRed = sel.qi > 0 && L0.t && T.t ? 100 * (T.by.Red.t / T.t - L0.by.Red.t / L0.t) : 0;
    if (Math.abs(dRed) >= 5 && T.t >= 300) { var dt = svgEl('tspan', { fill: dRed < 0 ? CFG.ram.Green : CFG.ram.Red, 'font-weight': 700 }, tl); dt.textContent = '  Red ' + (dRed < 0 ? '-' : '+') + Math.abs(dRed).toFixed(0) + ' pts'; }
    // rollers + belt base
    var bw = x1 - x0;
    svgEl('rect', { x: x0 - 4, y: cy - beltH / 2 - 3, width: bw + 8, height: beltH + 6, rx: (beltH + 6) / 2, fill: P.belt }, g);
    var xs = x0, sh = shown[m] || T.s;
    CFG.ramOrder.forEach(function (rg, j) {
      var w = bw * sh[j];
      if (w > 0.4) {
        var seg = svgEl('rect', { x: xs, y: cy - beltH / 2, width: Math.max(0, w - (j < 2 ? 1 : 0)), height: beltH, fill: CFG.ram[rg], rx: 3, 'class': 'sl-seg' }, g);
        (function (rg, j) {
          seg.addEventListener('mousemove', function (e) {
            var b = T.by[rg], fpt = b.t ? b.f / b.t : 0;
            showTip(e, '<b>' + esc(m) + ' &middot; ' + rg + '</b><br>' + fmtT(b.t) + ' (' + fmtP(T.t ? b.t / T.t : 0) + ')<br>EPR fee ' + GBP + Math.round(b.f).toLocaleString('en-GB') + ' &middot; ' + GBP + Math.round(fpt) + '/t');
          });
          seg.addEventListener('mouseleave', hideTip);
        })(rg, j);
        if (w > 34 && beltH >= 12) { var pt = svgEl('text', { x: xs + w / 2, y: cy + 3.5, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 700, fill: '#ffffff', 'pointer-events': 'none' }, g); pt.textContent = Math.round(sh[j] * 100) + '%'; }
      }
      xs += w;
    });
    svgEl('circle', { cx: x0 - 2, cy: cy, r: beltH / 2 + 1.5, fill: 'none', stroke: P.muted, 'stroke-width': 1.2, opacity: 0.55 }, g);
    svgEl('circle', { cx: x1 + 2, cy: cy, r: beltH / 2 + 1.5, fill: 'none', stroke: P.muted, 'stroke-width': 1.2, opacity: 0.55 }, g);
    var fpt = T.t ? T.f / T.t : 0;
    var ft = svgEl('text', { x: W - 2, y: cy + 4, 'text-anchor': 'end', fill: P.ink, 'font-size': 11.5, 'font-weight': 700 }, g); ft.textContent = T.t ? GBP + Math.round(fpt) + '/t' : '';
    var hit = svgEl('rect', { x: 0, y: cy - laneH / 2, width: labW - 6, height: laneH, fill: 'transparent' }, g);
    hit.addEventListener('mousemove', function (e) {
      showTip(e, '<b>' + esc(m) + '</b><br>' + fmtT(T.t) + ' placed on market<br>EPR fee ' + GBP + Math.round(T.f).toLocaleString('en-GB') + '<br>Red-rated ' + fmtP(T.t ? T.by.Red.t / T.t : 0));
    });
    hit.addEventListener('mouseleave', hideTip);
    geom.lanes.push({ m: m, cy: cy, beltH: beltH });
    if (i < n - 1) svgEl('line', { x1: 0, x2: W, y1: (i + 1) * laneH, y2: (i + 1) * laneH, stroke: P.line, 'stroke-width': 1 }, g);
  });
  var pl = svgEl('g', { 'class': 'sl-parcels', 'pointer-events': 'none' }, svg);
  geom.parcelLayer = pl;
  drawParcels();
}

// ---- parcels riding the belts: colour drawn by the lane's current RAM mix, they settle into their rating's segment
function spawn(li) {
  var L = geom.lanes[li], sh = shown[L.m] || [1, 0, 0], r = Math.random(), j = r < sh[0] ? 0 : r < sh[0] + sh[1] ? 1 : 2;
  var segStart = geom.x0 + (geom.x1 - geom.x0) * (j === 0 ? 0 : j === 1 ? sh[0] : sh[0] + sh[1]);
  var segEnd = segStart + (geom.x1 - geom.x0) * sh[j];
  particles.push({ li: li, j: j, x: geom.x0 - 10, stopAt: segStart + Math.random() * Math.max(4, segEnd - segStart - 6), v: 40 + Math.random() * 30, life: 1 });
}
function drawParcels() {
  if (!geom || !geom.parcelLayer) return;
  var pl = geom.parcelLayer;
  while (pl.firstChild) pl.removeChild(pl.firstChild);
  particles.forEach(function (p) {
    var L = geom.lanes[p.li]; if (!L) return;
    var s = Math.max(5, Math.min(8, L.beltH * 0.55));
    svgEl('rect', { x: p.x - s / 2, y: L.cy - L.beltH / 2 - s - 1, width: s, height: s, rx: 1.5, fill: CFG.ram[CFG.ramOrder[p.j]], stroke: P.bg, 'stroke-width': 1, opacity: Math.max(0, Math.min(1, p.life)) }, pl);
  });
}
function tick(ts) {
  var dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0; lastTs = ts;
  if (geom && geom.lanes.length) {
    if (particles.length < geom.lanes.length * 3 && Math.random() < 0.18) spawn(Math.floor(Math.random() * geom.lanes.length));
    particles.forEach(function (p) { if (p.x < p.stopAt) p.x = Math.min(p.stopAt, p.x + p.v * dt); else p.life -= dt * 1.4; });
    particles = particles.filter(function (p) { return p.life > 0; });
    drawParcels();
  }
  if (!reduced) requestAnimationFrame(tick);
}

if (!rows.length || !C.material || !C.ram || !C.tonnes) {
  stage.innerHTML = '<div class="sl-empty">Bind the search <b>[Material] [RAM Rating] [Placed on Market Date].quarterly [Sector] [Tonnage] [EPR Fee] [Theme Mode]</b> to see the sorting line.</div>';
  ctr.style.display = 'none'; legend.style.display = 'none';
  done();
} else {
  try {
    var first = true;
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { if (first) { first = false; return; } svg = null; stage.innerHTML = ''; particles = []; render(false); }).observe(stage);
    render(false);
    done();
    if (!reduced) { requestAnimationFrame(tick); setTimeout(function () { start(0); }, 700); }
  } catch (err) {
    stage.innerHTML = '<pre class="sl-empty">' + esc(err && err.stack || err) + '</pre>';
    done();
  }
}
