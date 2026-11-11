function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#0F2733', head: '#67CBEC', ink: '#E6EEF2', line: '#F26027' } : { bg: '#E3F1F6', head: '#005677', ink: '#002A3B', line: '#F26027' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Texas ePA rollout</b>: average prior-auth turnaround fell from 21.7 h (Nov 2025) to 5.4 h in Oct 2026 (-75%) as electronic PA share rose from 24% to 92%; the rest of the network sits near 12 h.</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Navitus RTPB lift</b>: RTPB checks on new Rx rose from 31% to 73% and first-fill abandonment fell from 17.0% to 6.9%, now below the 10.5% network average.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
