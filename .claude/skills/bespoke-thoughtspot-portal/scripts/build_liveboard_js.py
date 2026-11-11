"""Generate ONE execute-thoughtspot-code body that builds the core Liveboard from a spec (no Spotter designer).

Usage: python3 build_liveboard_js.py <liveboard-spec.json> <out.js>

Spec (see references/examples/emburse/liveboard-spec.json):
{
  "name": "Emburse Expense Analytics", "description": "...",
  "model": { "guid": "...", "name": "Emburse Expense Analytics" },
  "palette": { "primary": "#015CB7", "ramp": ["#E6F0FA", "#4DA3EC", "#015CB7", "#012B6B"] },
  "tabs": [ { "name": "Overview", "tiles": [
      { "type": "KPI", "name": "Spend", "search": "[Expense Amount] [Transaction Date].weekly" },
      { "type": "SANKEY", "name": "...", "search": "[Expense Amount] [Department] [Expense Category] [Payment Method]" },
      { "type": "HEATMAP", "name": "...", "search": "[Out-of-Policy %] [Department] [Expense Category]" },
      { "type": "TABLE", "name": "...", "search": "[Report ID] [Employee] [Expense Amount] ... [Report Status] = 'pending approval' sort by [Days Pending] descending", "action": true },
      { "type": "BAR" | "COLUMN" | "LINE", "name": "...", "search": "..." } ] },
    { "name": "KPIs", "kpi_layout": true, "tiles": [ two KPI tiles ] } ] }

"kpi_layout": true produces the user's standard KPIs tab (from their Emburse reference TML): KPI group at x5 y0 w7 h4,
leaving x0 y0 w5 h6 for the bespoke custom chart (make_tile_patch --x 0 --y 0 --w 5 --h 6) and x5 y4 w7 h2 for the
insights strip.

Inside the sandbox the body: reads the model's attribute names, runs every tile search (record_size 1) to get the exact
output column names, builds each tile from the known-good shapes in references/thoughtspot-recipes.md (KPI, legacy
SANKEY, HEATMAP with size + GRADIENT, TABLE_MODE, legacy BAR/COLUMN/LINE with the brand colour), lays tiles out
(KPIs 3 wide in rows of 4, charts 6 wide in pairs, tables full width), imports the Liveboard, then returns its guid,
the tab ids, and the viz GUID of the tile marked "action": true (the portal's actionViz).
Paste the output unchanged as `code` with confirm_write_operations: true.
"""
import json
import sys

spec = json.load(open(sys.argv[1]))
body = r"""
const S = SPEC, P = S.palette || {};
const md = await ts.post('/api/rest/2.0/metadata/search', { metadata: [{ identifier: S.model.guid }], include_details: true });
const det = md.body && md.body[0] && md.body[0].metadata_detail;
const ATTR = new Set(((det && det.columns) || []).filter((c) => c.type === 'ATTRIBUTE').map((c) => c.header ? c.header.name : c.name));
const MEAS_RE = /^(Total|Average|Unique Number of|Max|Min|Sum|Count|Std Deviation|Variance)\b|%|\bRate\b|\bRatio\b|\bCount\b/i;
const isDim = (c) => /^(Day|Week|Month|Quarter|Year|Hour|Minute|Day of Week|Day of Month|Day of Year|Week of Year|Month of Year|Quarter of Year)\(.+\)$/i.test(c) || (ATTR.size ? ATTR.has(c) : !MEAS_RE.test(c));
const tokens = (q) => (q.match(/\[[^\]]+\]/g) || []).map((t) => t.slice(1, -1));
const order = (cols, q) => { const out = []; tokens(q).forEach((t) => { const c = cols.find((x) => x === t || x.endsWith(' ' + t) || x.includes('(' + t + ')')); if (c && !out.includes(c)) out.push(c); }); cols.forEach((c) => { if (!out.includes(c)) out.push(c); }); return out; };
const colorStyle = (m) => JSON.stringify({ overrides: { column_properties: [{ column_id: m, properties: { color: (P.primary || '#2E75F0').toLowerCase() } }] } });
const table = (cols) => ({ table_columns: cols.map((c) => ({ column_id: c })), ordered_column_ids: cols, client_state: '', client_state_v2: JSON.stringify({ tableVizPropVersion: 'V1' }) });
const tablesRef = [{ id: S.model.name, name: S.model.name, fqn: S.model.guid }];
const vizs = [], layoutTabs = [], errors = [], groups = [];
let n = 0, actionName = null;
for (const tab of S.tabs) {
  const tiles = []; let x = 0, y = 0, rowH = 0;
  const place = (w, h) => { const span = tab.reserve_right ? 7 : 12; if (x + w > span) { x = 0; y += rowH; rowH = 0; } const t = { x, y, width: w, height: h }; x += w; rowH = Math.max(rowH, h); return t; };
  for (const t of tab.tiles) {
    const q = await ts.post('/api/rest/2.0/searchdata', { query_string: t.search, logical_table_identifier: S.model.guid, record_size: 1 });
    const raw = q.body && q.body.contents && q.body.contents[0] && q.body.contents[0].column_names;
    if (!raw) { errors.push(t.name + ': ' + JSON.stringify(q.body).slice(0, 160)); continue; }
    const cols = order(raw, t.search), dims = cols.filter(isDim), meas = cols.filter((c) => !isDim(c));
    const id = 'Viz_' + (++n);
    const a = { name: t.name, tables: tablesRef, search_query: t.search, answer_columns: cols.map((c) => ({ name: c })), table: table(cols), display_mode: 'CHART_MODE' };
    if (t.description) a.description = t.description;
    const ty = t.type.toUpperCase();
    if (ty === 'KPI') {
      a.chart = { type: 'KPI', chart_columns: cols.map((c) => ({ column_id: c })), axis_configs: [{ x: [dims[0]], y: [meas[0]] }], viz_style: colorStyle(meas[0]) };
    } else if (ty === 'SANKEY') {
      a.chart = { type: 'SANKEY', chart_columns: cols.map((c) => ({ column_id: c })), axis_configs: [{ x: dims, y: [meas[0]] }] };
    } else if (ty === 'HEATMAP') {
      const M = meas[0], R = P.ramp || ['#EEF3FB', '#7FA8E8', '#2E75F0', '#123A7A'];
      a.chart = { type: 'HEATMAP', chart_columns: cols.map((c) => ({ column_id: c })), axis_configs: [{ x: [dims[0]], y: [dims[1]], size: M }],
        viz_style: JSON.stringify({ overrides: { data_label_properties: { column_data_label_properties: [{ column_id: M, properties: { is_visible: true } }] },
          column_properties: [{ column_id: M, properties: { conditional_formatting: { rows: [{ backgroundFormatType: 'GRADIENT',
            gradientBackgroundAttrs: { colors: R, backgroundFormatRange: R.map((_, i) => i / (R.length - 1)), isAutoScaled: true }, comparisonType: 'VALUE_BASED', lhsColumnId: M }] } } }] } }) };
    } else if (ty === 'TABLE') {
      a.display_mode = 'TABLE_MODE';
      a.chart = { type: 'COLUMN', chart_columns: cols.map((c) => ({ column_id: c })), axis_configs: [{ x: [dims[0]], y: [meas[0] || cols[cols.length - 1]] }] };
      if (t.action) actionName = t.name;
    } else {
      // Multi-measure BAR/COLUMN/LINE (no colour dim): every measure on y, coloured primary, then P.series[1..] (Rocketlane run:
      // "Overdue vs At-Risk tasks" needs two columns side by side; the old code kept only the first measure).
      const ys = dims[1] ? meas.slice(0, ty === 'LINE' ? 2 : 1) : meas.slice(0, t.max_measures || 3);
      const SER = [P.primary || '#2E75F0'].concat(P.series || [P.accent || '#F59E0B', '#94A3B8']);
      const multiStyle = JSON.stringify({ overrides: { column_properties: ys.map((m, i) => ({ column_id: m, properties: { color: SER[i % SER.length].toLowerCase() } })) } });
      a.chart = { type: ty, chart_columns: cols.map((c) => ({ column_id: c })), axis_configs: [Object.assign({ x: [dims[0]], y: ys }, dims[1] ? { color: [dims[1]] } : {})], viz_style: dims[1] ? '' : multiStyle };
    }
    vizs.push({ id, answer: a });
    const size = ty === 'KPI' ? [3, 5] : ty === 'TABLE' ? [12, 9] : [6, 9];
    if (tab.reserve_right && ty === 'TABLE') size[0] = 7;
    tiles.push(Object.assign({ visualization_id: id }, t.w ? { ...place(t.w, t.h || size[1]) } : place(size[0], size[1])));
  }
  if (tab.kpi_layout) {
    // User-specified KPIs tab: custom chart reserved at x0 y0 w5 h6, KPI group at x5 y0 w7 h4 (each KPI 6x6 inside
    // the group grid), insights strip reserved at x5 y4 w7 h2. Charts are added later by make_tile_patch / the designer.
    const kpiIds = tiles.map((t) => t.visualization_id);
    const gid = 'Group_' + tab.name.replace(/\W/g, '');
    groups.push({ id: gid, name: tab.kpi_group_name || 'Headline KPIs', visualizations: kpiIds });
    layoutTabs.push({ name: tab.name, description: tab.description || '', tiles: [{ visualization_id: gid, x: 5, y: 0, width: 7, height: 4 }],
      group_layouts: [{ id: gid, tiles: kpiIds.map((id, i) => ({ visualization_id: id, x: (i % 2) * 6, y: Math.floor(i / 2) * 6, width: 6, height: 6 })) }] });
  } else {
    layoutTabs.push({ name: tab.name, description: tab.description || '', tiles });
  }
}
if (errors.length) return { refused: 'tile searches failed', errors };
const doc = { liveboard: Object.assign({ name: S.name, description: S.description || '', visualizations: vizs, layout: { tabs: layoutTabs } }, groups.length ? { groups } : {}) };
const r = await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [JSON.stringify(doc)], import_policy: 'ALL_OR_NONE', create_new: true });
const resp = r.body && r.body[0] && r.body[0].response;
const guid = resp && resp.header && resp.header.id_guid;
if (!guid) return { refused: 'import failed', raw: JSON.stringify(r.body).slice(0, 800) };
const back = JSON.parse((await ts.post('/api/rest/2.0/metadata/tml/export', { metadata: [{ identifier: guid, type: 'LIVEBOARD' }], edoc_format: 'JSON' })).body[0].edoc).liveboard;
const d2 = (await ts.post('/api/rest/2.0/metadata/search', { metadata: [{ identifier: guid, type: 'LIVEBOARD' }], include_details: true })).body[0].metadata_detail;
const vg = ((d2.reportContent && d2.reportContent.sheets) || []).flatMap((s) => (s.sheetContent && s.sheetContent.visualizations) || []).map((v) => ({ id: v.header.id, name: v.header.name }));
const act = actionName && vg.find((v) => v.name.includes(actionName.slice(0, 18)));
return { guid, url: '/#/pinboard/' + guid, tabs: (back.layout.tabs || []).map((t) => ({ name: t.name, id: t.id })), actionViz: act ? act.id : null, tiles: vizs.length, attrsSeen: ATTR.size };
"""
code = "const SPEC = " + json.dumps(spec) + ";\n" + body
open(sys.argv[2], "w", encoding="utf-8").write(code)
print("wrote", sys.argv[2], len(code), "chars")
