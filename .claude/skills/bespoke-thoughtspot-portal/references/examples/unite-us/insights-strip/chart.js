function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#16263d', head: '#5B9BFF', ink: '#E8EEF6', line: '#25395a' } : { bg: '#EEF5FC', head: '#216CFF', ink: '#2C405A', line: '#D3E2F5' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Maricopa housing</b> referrals doubled; days to accept 1.6 to 5.3 as partners hit capacity.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Mecklenburg food</b> resolution 60% to 79% after Queen City Food Collective joined.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
