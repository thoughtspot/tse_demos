"""Generate an execute-thoughtspot-code body that embeds the portal font into existing custom-chart tiles.

Usage: python3 make_font_patch.py --liveboard <guid> --tiles "The closed loop,Key findings" --font "Montserrat" --out font.js

Only the font CSS travels (about 25 KB); the chart code already on the Liveboard is decoded, given the embedded
@font-face block plus a font-family override (any Google Fonts <link> removed, since the cluster CSP blocks it), and
re-imported. Re-running replaces the previous embedded block, so it's safe to repeat. Returns which tiles changed.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from embed_font import font_css  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--liveboard", required=True)
ap.add_argument("--tiles", required=True, help="comma-separated tile (answer) names")
ap.add_argument("--font", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--weights", default="400,600,700", help="static weights to embed when the font has no variable build (e.g. 400,700 keeps the paste under ~24 KB)")
a = ap.parse_args()


def _hash(t):
    # same rolling hash the sandbox recomputes; catches a same-length typo in the pasted base64
    h = 0
    for ch in t:
        h = (h * 31 + ord(ch)) % 4294967291
    return h

fam = a.font.strip().strip("'\"")
stack = "'" + fam + "', system-ui, -apple-system, 'Segoe UI', sans-serif"
block = ("/* portal-font:start */\n" + font_css(fam, tuple(w.strip() for w in a.weights.split(",") if w.strip())) + ":root { --az-font: " + stack + "; }\n"
         "html, body, #chart, #chart * { font-family: " + stack + " !important; }\n"
         "maya-chart#chart { --maya-font: " + stack + "; }\n/* portal-font:end */\n")
code = ("const LB = " + json.dumps(a.liveboard) + ", NAMES = " + json.dumps([t.strip() for t in a.tiles.split(",") if t.strip()]) + ";\n"
        "const BLOCK = " + json.dumps(block) + ";\n"
        "if (BLOCK.length !== " + str(len(block)) + ") return { refused: 'font block corrupted in transit', len: BLOCK.length };\n"
        "let h = 0; for (let i = 0; i < BLOCK.length; i++) h = (h * 31 + BLOCK.charCodeAt(i)) % 4294967291;\n"
        "if (h !== " + str(_hash(block)) + ") return { refused: 'font block hash mismatch (a base64 char changed in the paste)', h };\n" + r"""
const unb64 = (s) => decodeURIComponent(escape(atob(s)));
const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
const exp = async () => JSON.parse((await ts.post('/api/rest/2.0/metadata/tml/export', { metadata: [{ identifier: LB, type: 'LIVEBOARD' }], edoc_format: 'JSON' })).body[0].edoc);
const doc = await exp(), changed = [], missing = [];
for (const name of NAMES) {
  const v = doc.liveboard.visualizations.find((x) => x.answer && x.answer.name === name);
  if (!v || !v.answer.chart || !v.answer.chart.custom_visual_props) { missing.push(name); continue; }
  const cvp = JSON.parse(v.answer.chart.custom_visual_props), cs = JSON.parse(cvp.clientState), c = cs.playground.code;
  let html = unb64(c.htmlCodeBase64 || ''), css = unb64(c.cssCodeBase64 || '');
  html = html.replace(/<link[^>]+fonts\.googleapis\.com[^>]*>\s*/g, '');
  css = css.replace(/\/\* portal-font:start \*\/[\s\S]*?\/\* portal-font:end \*\/\n?/g, '') + '\n' + BLOCK;
  c.htmlCodeBase64 = b64(html); c.cssCodeBase64 = b64(css);
  cvp.clientState = JSON.stringify(cs); v.answer.chart.custom_visual_props = JSON.stringify(cvp); changed.push(name);
}
if (!changed.length) return { refused: 'no tiles changed', missing };
const r = await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [JSON.stringify(doc)], import_policy: 'ALL_OR_NONE', create_new: false });
const st = r.body && r.body[0] && r.body[0].response && r.body[0].response.status;
const back = await exp(), ok = {};
for (const name of changed) { const v = back.liveboard.visualizations.find((x) => x.answer && x.answer.name === name); try { ok[name] = unb64(JSON.parse(JSON.parse(v.answer.chart.custom_visual_props).clientState).playground.code.cssCodeBase64).indexOf('portal-font:start') >= 0; } catch (e) { ok[name] = false; } }
return { import: st, changed, missing, embedded: ok };
""")
open(a.out, "w", encoding="utf-8").write(code)
print("wrote", a.out, len(code), "chars")
