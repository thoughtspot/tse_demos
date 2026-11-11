function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#16211f', head: '#8FB5B1', ink: '#E9EFEE', line: '#26413e' } : { bg: '#E1EBEA', head: '#4F7471', ink: '#1A2D2B', line: '#9CB4B1' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Zara Hughes, NP</b> (Desert Bloom) rebook rate fell from 72% in Jan to 36% in Oct; the network held 59%.</div>' +
  '<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Moxie Memberships</b> lifted member share from 11% to 31% since the Feb launch; packages-only stayed at 10%.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
