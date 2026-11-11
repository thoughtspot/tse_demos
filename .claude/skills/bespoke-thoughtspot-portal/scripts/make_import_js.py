"""Wrap a TML file into a self-contained execute-thoughtspot-code body (SpotterCode MCP).

Usage: python3 make_import_js.py <file.tml> <out.js> [--update]

The sandbox cannot read local files, so the TML travels inside the code. The body imports with
ALL_OR_NONE (create_new unless --update), returns the status and the new object's guid, and never
runs a separate VALIDATE_ONLY pass (the user does not want an extra approval round for it).
Read the output file and paste it, unchanged, as `code` with confirm_write_operations: true.
"""
import json
import sys

src, out = sys.argv[1], sys.argv[2]
update = "--update" in sys.argv
tml = open(src, encoding="utf-8").read()
code = (
    "const TML = " + json.dumps(tml) + ";\n"
    "const r = await ts.post('/api/rest/2.0/metadata/tml/import', { metadata_tmls: [TML], import_policy: 'ALL_OR_NONE', create_new: "
    + ("false" if update else "true") + " });\n"
    "const x = Array.isArray(r.body) && r.body[0] && r.body[0].response;\n"
    "return { http: r.status, status: x && x.status, guid: x && x.header && x.header.id_guid, name: x && x.header && x.header.name,"
    " raw: x ? undefined : JSON.stringify(r.body).slice(0, 600) };\n"
)
open(out, "w", encoding="utf-8").write(code)
print("wrote", out, len(code), "chars")
