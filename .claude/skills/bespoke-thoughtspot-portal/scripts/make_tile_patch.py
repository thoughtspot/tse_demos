"""Generate an execute-thoughtspot-code body that ADDS or UPDATES a custom-chart (BYOC) tile on a Liveboard.

Usage:
  python3 make_tile_patch.py --liveboard <guid> --model <guid> --model-name "<name>" --chart-dir <dir with chart.html/css/js>
         --font "<portal font, from the portal spec font.family>"   # always pass it: the chart must match the app font
         --search "<search incl. [Theme Mode]>" --name "<tile title>" --tab "<tab name>" --x 5 --y 5 --w 7 --h 9
         [--update] --out patch.js

What it does (all inside one sandbox call, so nothing half-applies):
  * runs the search to get the exact column names, exports the Liveboard JSON TML,
  * add: appends a MUZE_STUDIO viz carrying the three chart files and a layout tile on the named tab;
    update: finds the tile by name and swaps its code, search and column lists,
  * imports with ALL_OR_NONE (create_new false), re-exports, and proves the code round-tripped byte-for-byte.

The chart files are shipped raw (base64-encoded inside the sandbox) with full-line // comments and indentation
stripped, which keeps the body under ~25 KB so it can be Read back and pasted. The trim is safe for charts built to
the Amuzing library contract (ASCII, no template strings); re-snap the trimmed files in the preview before sending
if the chart was hand-written.
"""
import argparse
import json
import os
import sys

ap = argparse.ArgumentParser()
for k in ("liveboard", "model", "model-name", "chart-dir", "search", "name", "tab", "out"):
    ap.add_argument("--" + k, required=True)
for k, d in (("x", 0), ("y", 0), ("w", 6), ("h", 8)):
    ap.add_argument("--" + k, type=int, default=d)
ap.add_argument("--update", action="store_true")
ap.add_argument("--font", default="", help="portal font family (spec font.family); forced onto the chart")
a = ap.parse_args()


def trim_js(s):
    return "\n".join(l.strip() for l in s.split("\n") if l.strip() and not l.strip().startswith("//"))


def trim_css(s):
    return "\n".join(l.strip() for l in s.split("\n") if (l.strip() and not l.strip().startswith("/*")) or "amuzing core" in l)


f = {k: open(os.path.join(a.chart_dir, "chart." + k), encoding="utf-8").read() for k in ("html", "css", "js")}
f["js"], f["css"] = trim_js(f["js"]), trim_css(f["css"])
if a.font:
    # The chart must use the portal's font. Embed it (subset woff2 as base64 @font-face): a Google Fonts <link> is
    # blocked by the cluster CSP inside Liveboard tiles even though the local preview loads it.
    import sys as _sys, os as _os, re as _re
    _sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
    from embed_font import font_css
    fam = a.font.strip().strip("'\"")
    stack = "'" + fam + "', system-ui, -apple-system, 'Segoe UI', sans-serif"
    f["html"] = _re.sub(r'<link[^>]+fonts\.googleapis\.com[^>]*>\s*', "", f["html"])
    f["css"] += ("\n/* portal-font:start */\n" + font_css(fam) + ":root { --az-font: " + stack + "; }\n"
                 "html, body, #chart, #chart * { font-family: " + stack + " !important; }\n"
                 "maya-chart#chart { --maya-font: " + stack + "; }\n/* portal-font:end */\n")
bad = [k for k, v in f.items() if any(ord(ch) > 126 for ch in v)]
if bad:
    sys.exit("non-ASCII characters in chart." + ", chart.".join(bad) + " - fix before shipping")

head = (
    "const LB = " + json.dumps(a.liveboard) + ", MODEL = " + json.dumps(a.model) + ", MODEL_NAME = " + json.dumps(a.model_name) + ";\n"
    "const NAME = " + json.dumps(a.name) + ", TAB = " + json.dumps(a.tab) + ", SEARCH = " + json.dumps(a.search) + ";\n"
    "const POS = " + json.dumps({"x": a.x, "y": a.y, "width": a.w, "height": a.h}) + ", UPDATE = " + ("true" if a.update else "false") + ";\n"
    "const F = " + json.dumps(f) + ";\n"
    "if (F.html.length + F.css.length + F.js.length !== " + str(len(f["html"]) + len(f["css"]) + len(f["js"])) + ") return { refused: 'chart files corrupted in transit' };\n"
)
body = r"""const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
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
return { import: st, id, cols, type: back && back.answer.chart.type, codeOk };
"""
code = head + body
open(a.out, "w", encoding="utf-8").write(code)
print("wrote", a.out, len(code), "chars" + ("  (WARNING: over 24 KB; Read it in parts or slim the chart)" if len(code) > 24000 else ""))
