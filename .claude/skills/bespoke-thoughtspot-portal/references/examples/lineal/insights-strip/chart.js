function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#1C1314', head: '#FF4D6D', ink: '#F3ECEC', line: '#3A2628' } : { bg: '#FBE3E8', head: '#D90633', ink: '#100808', line: '#EC6A85' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Chat sprawl</b>: Teams, Slack and WhatsApp rose from 16% to 38% of collected docs in 9 months; cull rate slipped from 91.5% to 88.3%.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">DACH privilege</b>: turnaround climbed from 31h to 66h; the 72h SLA hit rate fell from 99.8% to 68%.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
