const LB = "132eef94-24a8-4c80-b33d-2df1902eaf14", MODEL = "85ed75fd-25d9-41f9-afa6-7eccae453e74", MODEL_NAME = "Surescripts Network Analytics";
const NAME = "Key findings", TAB = "KPIs", SEARCH = "[Transactions] [Theme Mode]";
const POS = {"x": 5, "y": 4, "width": 7, "height": 2}, UPDATE = false;
const F = {"html": "<div id=\"chart\"></div>\n", "css": "html, body { height: 100%; margin: 0; }\n#chart { height: 100%; box-sizing: border-box; display: flex; align-items: stretch; gap: 12px; padding: 8px 14px; font-family: \"Figtree\", system-ui, -apple-system, Segoe UI, sans-serif; font-size: 12px; line-height: 1.35; overflow: hidden; }\n#chart .k { flex: 0 0 auto; align-self: center; font-weight: 700; font-size: 12.5px; writing-mode: horizontal-tb; }\n#chart .f { flex: 1 1 0; min-width: 0; align-self: center; border-left: 2px solid; padding-left: 10px; }\n#chart .f b { font-weight: 700; }", "js": "function getViz() { try { if (typeof viz !== 'undefined' && viz) return viz; } catch (e) {} return null; }\nvar V = getViz(), dark = false;\ntry { var d = V && V.getDataFromSearchQuery && V.getDataFromSearchQuery().getData(); if (d && d.schema) { var ti = d.schema.findIndex(function (c) { return /theme/i.test(c.name); }); if (ti >= 0 && d.data.length) { var v = d.data[0][ti]; v = (v && typeof v === 'object') ? (v.value || v.v) : v; dark = String(v).toLowerCase() === 'dark'; } } } catch (e) { console.warn('[insights] no data', e); }\nvar P = dark ? { bg: '#0F2733', head: '#67CBEC', ink: '#E6EEF2', line: '#F26027' } : { bg: '#E3F1F6', head: '#005677', ink: '#002A3B', line: '#F26027' };\ndocument.documentElement.style.background = P.bg; document.body.style.background = P.bg;\nvar el = document.getElementById('chart'); if (!el) { el = document.createElement('div'); el.id = 'chart'; document.body.appendChild(el); }\nel.style.background = P.bg; el.style.color = P.ink;\nel.innerHTML = '<div class=\"k\" style=\"color:' + P.head + '\">Key findings</div>' +\n'<div class=\"f\" style=\"border-color:' + P.line + '\"><b style=\"color:' + P.head + '\">Texas ePA rollout</b>: average prior-auth turnaround fell from 21.7 h (Nov 2025) to 5.4 h in Oct 2026 (-75%) as electronic PA share rose from 24% to 92%; the rest of the network sits near 12 h.</div>' +\n'<div class=\"f\" style=\"border-color:' + P.line + '\"><b style=\"color:' + P.head + '\">Navitus RTPB lift</b>: RTPB checks on new Rx rose from 31% to 73% and first-fill abandonment fell from 17.0% to 6.9%, now below the 10.5% network average.</div>';\ntry { V.events.emitRenderCompletedEvent(); } catch (e) { console.warn('[insights] render-complete unavailable', e); }"};
if (F.html.length + F.css.length + F.js.length !== 2263) return { refused: 'chart files corrupted in transit' };
const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
const B = { html: b64(F.html), css: b64(F.css), js: b64(F.js) };
const q = await ts.post('/api/rest/2.0/searchdata', { query_string: SEARCH, logical_table_identifier: MODEL, record_size: 1 });
const cols = q.body && q.body.contents && q.body.contents[0] && q.body.contents[0].column_names;
if (!cols) return { refused: 'search failed (column not indexed yet? retry in a minute)', raw: JSON.stringify(q.body).slice(0, 300) };
const exp = async () => JSON.parse((await ts.post('/api/rest/2.0/metadata/tml/export', { metadata: [{ identifier: LB, type: 'LIVEBOARD' }], edoc_format: 'JSON' })).body[0].edoc);
const doc = await exp(), lb = doc.liveboard;
const MEASURE = /^(Total|Average|Unique|Count|Max|Min)\b|%|Rate\b|Ratio\b/i;
const ordered = [...cols.filter((c) => !MEASURE.test(c)), ...cols.filter((c) => MEASURE.test(c))];
const code = { jsCodeBase64: B.js, cssCodeBase64: B.css, htmlCodeBase64: B.html };
let v = lb.visualizations.find((x) => x.answer && x.answer.name === NAME);
if (UPDATE && !v) return { refused: 'tile not found: ' + NAME };
if (!UPDATE && v) return { refused: 'tile already present: ' + NAME + ' (use --update)' };
let id;
if (UPDATE) {
  const an = v.answer, cvp = JSON.parse(an.chart.custom_visual_props), cs = JSON.parse(cvp.clientState);
  cs.playground.code = code; cvp.clientState = JSON.stringify(cs);
  an.search_query = SEARCH; an.answer_columns = cols.map((c) => ({ name: c }));
  an.table = { table_columns: cols.map((c) => ({ column_id: c })), ordered_column_ids: cols, client_state: '', client_state_v2: JSON.stringify({ tableVizPropVersion: 'V1' }) };
  an.chart.chart_columns = cols.map((c) => ({ column_id: c }));
  an.chart.custom_chart_config = [{ key: 'basic', dimensions: [{ key: 'fields', columns: ordered, mode: 'COLUMN_DRIVEN' }] }];
  an.chart.custom_visual_props = JSON.stringify(cvp); id = v.id;
} else {
  const cvp = JSON.stringify({ clientState: JSON.stringify({ version: 1, playground: { version: 'v1', code, splitSizes: [55], editorConsoleSplitSizes: [99] } }),
    axisVisualProps: {}, columnVisualProps: {}, dataLabelVisualProps: {}, tooltipVisualProps: {}, legendVisualProps: {}, displayVisualProps: {} });
  id = 'Viz_' + (Math.max(0, ...lb.visualizations.map((x) => +String(x.id).replace(/\D/g, '') || 0)) + 1);
  lb.visualizations.push({ id, answer: { name: NAME, tables: [{ id: MODEL_NAME, name: MODEL_NAME, fqn: MODEL }], search_query: SEARCH,
    answer_columns: cols.map((c) => ({ name: c })),
    table: { table_columns: cols.map((c) => ({ column_id: c })), ordered_column_ids: cols, client_state: '', client_state_v2: JSON.stringify({ tableVizPropVersion: 'V1' }) },
    chart: { type: 'MUZE_STUDIO', chart_columns: cols.map((c) => ({ column_id: c })), client_state: '',
      client_state_v2: JSON.stringify({ version: 'V4DOT2', chartProperties: { chartSpecific: { dataFieldArea: 'column' } }, columnProperties: [], axisProperties: [] }),
      custom_chart_config: [{ key: 'basic', dimensions: [{ key: 'fields', columns: ordered, mode: 'COLUMN_DRIVEN' }] }], custom_visual_props: cvp },
    display_mode: 'CHART_MODE' } });
  const tab = (lb.layout.tabs || []).find((t) => t.name === TAB);
  if (!tab) return { refused: 'tab not found: ' + TAB, tabs: (lb.layout.tabs || []).map((t) => t.name) };
  tab.tiles.push(Object.assign({ visualization_id: id }, POS));
}
const r = await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [JSON.stringify(doc)], import_policy: 'ALL_OR_NONE', create_new: false });
const st = r.body && r.body[0] && r.body[0].response && r.body[0].response.status;
const back = (await exp()).liveboard.visualizations.find((x) => x.answer && x.answer.name === NAME);
let codeOk = false;
try { const c = JSON.parse(JSON.parse(back.answer.chart.custom_visual_props).clientState).playground.code; codeOk = c.jsCodeBase64 === B.js && c.cssCodeBase64 === B.css && c.htmlCodeBase64 === B.html; } catch (e) {}
const ins = { import: st, id, cols, type: back && back.answer.chart.type, codeOk };
// ---- designer fallback: 3 native charts on Overview, filling the half-empty last row first
const PRIMARY = '#005677';
const EXTRA = [
  { name: 'RTPB adoption by EHR vendor', type: 'COLUMN', search: "[RTPB Adoption] [EHR Vendor] [Transaction Date] = 'last 12 months' sort by [RTPB Adoption] descending", dim: 'EHR Vendor' },
  { name: 'Prior auth volume by channel (monthly)', type: 'COLUMN', search: "[PA Requests] [Transaction Date].monthly [PA Channel] [PA Channel] != 'not a pa' [Transaction Date] = 'last 12 months'", dim: 'Month(Transaction Date)', color: 'PA Channel' },
  { name: 'EPCS share of new prescriptions by organization type', type: 'BAR', search: "[EPCS Share] [Organization Type] sort by [EPCS Share] descending", dim: 'Organization Type' },
];
const doc2 = await exp(), lb2 = doc2.liveboard;
const ov = lb2.layout.tabs.find((t) => t.name === 'Overview');
let maxY = 0; ov.tiles.forEach((t) => { maxY = Math.max(maxY, t.y + t.height); });
const lastRow = ov.tiles.filter((t) => t.y + t.height === maxY);
const slots = [];
if (lastRow.length === 1 && lastRow[0].x === 0 && lastRow[0].width === 6) slots.push({ x: 6, y: lastRow[0].y });
let ny = maxY; while (slots.length < EXTRA.length) { slots.push({ x: 0, y: ny }); if (slots.length < EXTRA.length) slots.push({ x: 6, y: ny }); ny += 9; }
let n = Math.max(0, ...lb2.visualizations.map((x) => +String(x.id).replace(/\D/g, '') || 0));
const added = [];
for (let k = 0; k < EXTRA.length; k++) {
  const e = EXTRA[k];
  const q2 = await ts.post('/api/rest/2.0/searchdata', { query_string: e.search, logical_table_identifier: MODEL, record_size: 1 });
  const cc = q2.body && q2.body.contents && q2.body.contents[0] && q2.body.contents[0].column_names;
  if (!cc) return { ins, refused: 'search failed: ' + e.name, raw: JSON.stringify(q2.body).slice(0, 200) };
  const dim = cc.find((c) => c === e.dim), col = e.color && cc.find((c) => c === e.color), meas = cc.filter((c) => c !== dim && c !== col);
  const vid = 'Viz_' + (++n);
  const axis = Object.assign({ x: [dim], y: [meas[0]] }, col ? { color: [col] } : {});
  lb2.visualizations.push({ id: vid, answer: { name: e.name, tables: [{ id: MODEL_NAME, name: MODEL_NAME, fqn: MODEL }], search_query: e.search,
    answer_columns: cc.map((c) => ({ name: c })),
    table: { table_columns: cc.map((c) => ({ column_id: c })), ordered_column_ids: cc, client_state: '', client_state_v2: JSON.stringify({ tableVizPropVersion: 'V1' }) },
    chart: { type: e.type, chart_columns: cc.map((c) => ({ column_id: c })), axis_configs: [axis],
      viz_style: col ? '' : JSON.stringify({ overrides: { column_properties: [{ column_id: meas[0], properties: { color: PRIMARY } }] } }) },
    display_mode: 'CHART_MODE' } });
  ov.tiles.push({ visualization_id: vid, x: slots[k].x, y: slots[k].y, width: 6, height: 9 });
  added.push({ vid, name: e.name, dim, color: col || null, measure: meas[0], at: slots[k] });
}
const r2 = await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [JSON.stringify(doc2)], import_policy: 'ALL_OR_NONE', create_new: false });
const st2 = r2.body && r2.body[0] && r2.body[0].response && r2.body[0].response.status;
const fin = (await exp()).liveboard;
return { ins, charts: { import: st2, added }, layout: fin.layout.tabs.map((t) => ({ tab: t.name, tiles: t.tiles.map((x) => { const v = fin.visualizations.find((z) => z.id === x.visualization_id); return (v ? v.answer.name.slice(0, 28) : x.visualization_id) + '@' + x.x + ',' + x.y + ' ' + x.width + 'x' + x.height; }) })) };
