# ThoughtSpot recipes that are known to work (sebe.thoughtspotstaging.cloud, Oct 2026)

All of these run as `execute-thoughtspot-code` bodies (SpotterCode MCP) with `confirm_write_operations: true`
for writes. Look up an endpoint with `get-rest-api-reference` before using one that is not here.

## Preflight (read-only, one call)

```js
const me = await ts.get('/api/rest/2.0/auth/session/user');
if (typeof me.body === 'string') return { idle: true };            // "Idle Screen" HTML = cluster asleep
const c = await ts.post('/api/rest/2.0/connection/search', { record_size: 500, connections: [{ identifier: CONNECTION_NAME }] });
const conn = (Array.isArray(c.body) ? c.body : [])[0];
const d = conn && (await ts.post('/api/rest/2.0/connection/search', { connections: [{ identifier: conn.id }], include_details: true })).body[0];
let cfg = {}; try { cfg = JSON.parse(d.details.configuration); } catch (e) {}
return { user: me.body.name, org: me.body.current_org, connection: conn && { id: conn.id, name: conn.name, account: cfg.accountName, user: cfg.user, role: cfg.role, warehouse: cfg.warehouse } };
```

Check that `org.name` matches the defaults, and that the thoughtspot-spotter MCP's `list_orgs` shows the same Org as
`is_active`. Then compare `account` with Snowflake `SELECT CURRENT_ACCOUNT()` from the profile; it must match.

## Wait until a new object is searchable

```js
const q = await ts.post('/api/rest/2.0/searchdata', { query_string: '[COL]', logical_table_identifier: GUID, record_size: 1 });
return q.status === 200 && q.body.contents ? 'ready' : JSON.stringify(q.body).slice(0, 200);
```
"Invalid data source guid" or "Column ... not found" right after an import means it isn't indexed yet. Re-run it a few times about 30 seconds apart.

## Liveboard TML editing pattern

Export JSON, find the viz by `id` (`Viz_N`) or `answer.name`, change it, and import the whole document with
`create_new: false`. The guid sits at the document root, so the import updates in place. Then re-export and assert the change.

```js
const doc = JSON.parse((await ts.post('/api/rest/2.0/metadata/tml/export', { metadata: [{ identifier: LB, type: 'LIVEBOARD' }], edoc_format: 'JSON' })).body[0].edoc);
// ...edit doc.liveboard.visualizations / doc.liveboard.layout.tabs[].tiles ...
await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [JSON.stringify(doc)], import_policy: 'ALL_OR_NONE', create_new: false });
```

Tile and tab GUIDs (for the portal's `actionViz`, `activeTabId`) are not in the TML. Read them from
`metadata/search` with `include_details: true` → `metadata_detail.reportContent.sheets[].sheetContent.visualizations[].header.id`.
Tab ids are `layout.tabs[].id` in the TML export.

## Chart recipes (native)

**HEATMAP (legacy)**: this is the only shape that renders.
```js
chart.type = 'HEATMAP';
chart.axis_configs = [{ x: ['<Dim A>'], y: ['<Dim B>'], size: '<Measure>' }];          // size is a STRING
chart.viz_style = JSON.stringify({ overrides: {
  data_label_properties: { column_data_label_properties: [{ column_id: M, properties: { is_visible: true } }] },
  column_properties: [{ column_id: M, properties: { conditional_formatting: { rows: [{ backgroundFormatType: 'GRADIENT',
    gradientBackgroundAttrs: { colors: [LIGHT, MID, PRIMARY, DARK], backgroundFormatRange: [lo, a, b, hi], isAutoScaled: true },
    comparisonType: 'VALUE_BASED', lhsColumnId: M }] } } }] } });
```
Search: `[Measure] [Dim A] [Dim B]`. Never a date-part (day of week) axis; the designer cannot produce it.

**KPI with sparkline**: `chart.type: 'KPI'`, search `[Measure] [Date].weekly` (weekly, not monthly, so a partial
current month does not crater the line). Colour: `viz_style.overrides.column_properties[{column_id, properties:{color}}]`.

**Table for the custom action**: `display_mode: 'TABLE_MODE'`, exactly 6 columns, filtered to the actionable status,
sorted by urgency (for example `[Report Status] = 'pending approval' sort by [Days Pending] descending`).

**Sankey**: palette overrides are ignored; accept the default colours and say so.

## Custom chart (BYOC) tile

`scripts/make_tile_patch.py` creates or updates a MUZE_STUDIO viz carrying `chart.html/css/js`. Its
`custom_visual_props.clientState.playground.code` holds base64 code, and `custom_chart_config` holds
`[{ key: 'basic', dimensions: [{ key: 'fields', columns: <attributes then measures>, mode: 'COLUMN_DRIVEN' }] }]`.
The patch proves the code round-tripped byte-for-byte.

## Theme pivot for custom charts

Model: parameter `App Theme` (CHAR, list light/dark, default light) plus formula column `Theme Mode` = `[App Theme]`
(added by `build_model_tml.py`). Chart: add `[Theme Mode]` to the search, then in the body:
```js
const TH = AZ.col(schema, /theme/i, opt), dark = !!TH && rows.length > 0 && String(rows[0][TH]).toLowerCase() === 'dark';
const PAL = dark ? { bg: '<dark tile bg>', fg: '#E7ECF2', muted: '#93A0B4', grid: '<dark border>', ... } : { bg: '#FFFFFF', fg: '<brand navy>', ... };
document.documentElement.style.setProperty('--az-surface', PAL.bg); document.body.style.background = PAL.bg;
const host = document.getElementById('chart'); if (host) host.style.background = PAL.bg;   // --maya-bg alone does NOT paint
[['--maya-bg', PAL.bg], ['--maya-fg', PAL.fg], ['--maya-fg-muted', PAL.muted], ['--maya-grid', PAL.grid],
 ['--maya-series-1', ...], ['--maya-tooltip-bg', ...], ['--maya-tooltip-fg', ...]].forEach(([k, v]) => host.style.setProperty(k, v));
```
Use the portal's dark tile colour (`--ts-var-liveboard-tile-background` in the dark block of `config.ts`) as the dark background.
Portal: `runtimeParameters={themeParameters(theme)}` on the Liveboard embeds (`portal_finish.py`).
Test both modes in the preview by flipping `Theme Mode` in `sample-data.json`.

## Security settings

```js
const s = await ts.post('/api/rest/2.0/system/security-settings/search', {});   // org_preferences readable by developers
// add origins to org CORS (merge, never replace):
await ts.post('/api/rest/2.0/system/security-settings/configure', { org_preferences: [{ org_identifier: ORG, cors_whitelisted_urls: merged }] });
```
`scope: 'CLUSTER'` (CSP) returns 403 for non-admins. Hand the user the CSP list instead: visual embed host
`http://localhost:<port>` (plus the deploy URL), font-src `https://fonts.gstatic.com`, style-src `https://fonts.googleapis.com`,
script-src `https://cdn.jsdelivr.net`.

## Designer fallback (when Spotter `modify_dashboard` fails)

One sandbox call: export the Liveboard JSON, then:
- **Extra charts:** for each, run `searchdata` (record_size 1) for the column names and push a viz with a legacy type:
  - LINE: `{ x: [date bucket], y: [measure], color: [dim] }`
  - BAR or COLUMN: `{ x: [dim], y: [measures] }`, with `viz_style` colour = primary for single-measure bars
  - `searchdata` returns **attributes first**, whatever the query order (`[Total Cost] [Budget] [Client Industry]` came back
    `Client Industry | Total Total Cost | Total Budget`). Pick the dimension by name or by the model's attribute list, never by position
    (Lineal run: `cc[cc.length - 1]` put a measure on x and needed a second patch).
  
  Place them 6 wide, 9 high, filling any empty right half of the Overview's last row first (if the lowest tile is a
  6-wide tile at x 0, the first new chart goes at x 6 on that row), then pairs below. Appending everything under the
  lowest tile leaves a hole (Lead Forensics run).
- **Insights tile:** a MUZE_STUDIO viz on search `[<any measure>] [Theme Mode]` whose JS reads the theme column and renders
  a static "Key findings" card (verified story numbers). Light: brand tint background, primary headings, navy text.
  Dark: the portal's dark tile colour, light text. It must call `viz.events.emitRenderCompletedEvent()`. Place it at
  KPIs tab x 5, y 4, w 7, h 2 (the kpi_layout strip; copy `examples/unite-us/insights-strip/`). Worked example: the Unite Us run (`~/bespoke-portals/unite-us`, Liveboard `2b9dbbbc…`, tile "Key findings").

Import with `create_new: false`, then re-export and count the tiles.
