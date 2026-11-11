function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#18151D', head: '#FB64FA', ink: '#F3EEF6', line: '#3A2440' } : { bg: '#FFF0FF', head: '#C81FC7', ink: '#0F0F0F', line: '#FA47F9' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">RevOps leaders pick up</b>: connect rate jumped from 8.6% (Q2) to 21.7% in Oct after Signal-Based Dialing went live.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Coach Lucas Wright</b>: handles only 14% of "Using a Competitor" objections vs 49% for the team.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
