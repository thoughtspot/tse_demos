function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#17211f', head: '#47CEB8', ink: '#E6F2EF', line: '#24332f' } : { bg: '#E3F7F3', head: '#1E9E89', ink: '#123F3A', line: '#C5ECE4' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Statins (C10)</b> generic share 40% to 84% since Cardiolis lost exclusivity.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Norte asthma &amp; COPD</b> stock-out rate 3% to 20% this quarter.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
