function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#161A22', head: '#6EA0FF', ink: '#E7ECF2', line: '#2D5BC4' } : { bg: '#E5EEFF', head: '#0F62FE', ink: '#1D1D1F', line: '#0F62FE' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Enterprise tasks slipping</b>: overdue rate rose from 11.3% (H1 2026) to 36.0% in Oct; Configuration, Data Migration and UAT run 33-40% late.</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Priya Raman reaches value faster</b>: time to value fell from 80.6 days (Q1) to 52.6 in Q4 vs 72.4 for Mid-Market Launch peers.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
