function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#0b1a33', head: '#52B5F9', ink: '#EAF4FF', line: '#1c3150' } : { bg: '#E6F8FF', head: '#0098D9', ink: '#020A1D', line: '#BDEBFF' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Health &amp; Beauty</b> cut Red-rated plastic from 34% to 11% in three quarters, lowering modulated EPR fees.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Plastic PRNs</b> jumped from &pound;88 to &pound;235 per tonne since April, now the biggest cost driver.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
