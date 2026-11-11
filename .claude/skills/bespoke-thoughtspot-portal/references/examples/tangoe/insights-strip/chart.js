function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }
var V = getViz(), dark = false;
try { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }
var P = dark ? { bg: '#1B1235', head: '#B79CF0', ink: '#ECE8F7', line: '#20A65F' } : { bg: '#F0EBFA', head: '#6633CA', ink: '#2C1355', line: '#20A65F' };
document.documentElement.style.background = P.bg; document.body.style.background = P.bg;
var el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }
el.style.background = P.bg; el.style.color = P.ink;
el.innerHTML = '<div class="k" style="color:' + P.head + '">Key findings</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Field Operations zombie lines</b>: zero-usage lines and licenses rose from 6.0% (Apr 2026) to 20.8% in Oct 2026, wasting about $29K a month (was $7K); every other business unit holds near 7%.</div>' +
'<div class="f" style="border-color:' + P.line + '"><b style="color:' + P.head + '">Vodafone billing errors</b>: after a rate-plan migration, audit found errors on 26.1% of Vodafone mobile charges in Oct 2026, up from 7.3% in May; other carriers stay near 7.8%. Rate Mismatch disputes are open.</div>';
try { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }
