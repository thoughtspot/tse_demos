"""Build Model TML (YAML) from a model spec JSON, ready for metadata/tml/import.

Usage: python3 build_model_tml.py <model-spec.json> <table_guid> <out.tml>

Spec shape (see references/examples/emburse/model-spec.json):
{
  "name": "Emburse Expense Analytics",
  "description": "...",
  "table": "EMBURSE_EXPENSE_LINES",
  "columns": [
    {"db": "EXPENSE_AMOUNT_USD", "name": "Expense Amount", "type": "MEASURE", "agg": "SUM",
     "currency": true, "desc": "...", "synonyms": ["spend"]}     # currency: true = USD, or an ISO code ("GBP", "EUR")
  ],
  "formulas": [
    {"name": "Out-of-Policy %", "desc": "...", "format": "0.0%", "expr": "sum ( [{T}::OUT_OF_POLICY_AMOUNT_USD] ) / sum ( [{T}::EXPENSE_AMOUNT_USD] )"},
    {"name": "Energy Cost", "currency": "EUR", "expr": "..."}   # currency also works on formulas (Scania run)
  ],
  "theme_parameter": true
}

{T} in a formula expr is replaced by the table name. With theme_parameter (default true) the model gets
an "App Theme" list parameter (light/dark) and a "Theme Mode" formula column that returns it; the portal
passes the parameter at runtime and custom charts read the column to match the app theme.
"""
import json
import sys


def q(s):
    return '"' + str(s).replace('\\', '\\\\').replace('"', '\\"') + '"'


def build(spec, table_guid):
    T = spec["table"]
    formulas = list(spec.get("formulas", []))
    out = ["model:", "  name: " + q(spec["name"])]
    if spec.get("description"):
        out.append("  description: " + q(spec["description"]))
    out += ["  model_tables:", "  - name: " + T, "    fqn: " + q(table_guid), "  columns:"]
    for c in spec["columns"]:
        out += ["  - name: " + q(c["name"])]
        if c.get("desc"):
            out.append("    description: " + q(c["desc"]))
        out += ["    column_id: " + T + "::" + c["db"], "    properties:", "      column_type: " + c.get("type", "ATTRIBUTE")]
        if c.get("agg"):
            out.append("      aggregation: " + c["agg"])
        if c.get("currency"):
            out += ["      currency_type:", "        iso_code: " + (c["currency"] if isinstance(c["currency"], str) else "USD")]
        if c.get("format"):
            out.append("      format_pattern: " + q(c["format"]))
        if c.get("synonyms"):
            out.append("      synonyms: [" + ", ".join(q(s) for s in c["synonyms"]) + "]")
            out.append("      synonym_type: USER_DEFINED")
    theme = spec.get("theme_parameter", True)
    if theme:
        formulas.append({"name": "Theme Mode", "type": "ATTRIBUTE", "expr": "[App Theme]",
                         "desc": "Technical column for app theming (light or dark). Not a business attribute; do not use in analysis."})
    for f in formulas:
        out += ["  - name: " + q(f["name"])]
        if f.get("desc"):
            out.append("    description: " + q(f["desc"]))
        out += ["    formula_id: " + q("formula_" + f["name"]), "    properties:", "      column_type: " + f.get("type", "MEASURE")]
        if f.get("type", "MEASURE") == "MEASURE":
            out.append("      aggregation: " + f.get("agg", "SUM"))
        if f.get("currency"):
            out += ["      currency_type:", "        iso_code: " + (f["currency"] if isinstance(f["currency"], str) else "USD")]
        if f.get("format"):
            out.append("      format_pattern: " + q(f["format"]))
    if formulas:
        out.append("  formulas:")
        for f in formulas:
            out += ["  - id: " + q("formula_" + f["name"]), "    name: " + q(f["name"]), "    expr: " + q(f["expr"].replace("{T}", T))]
    if theme:
        out += ["  parameters:", "  - name: App Theme", "    data_type: CHAR", "    default_value: light",
                "    description: Set by the embedding app so custom charts match its light/dark theme.",
                "    list_config:", "      list_choice:", "      - value: light", "        display_name: light",
                "      - value: dark", "        display_name: dark"]
    out += ["  properties:", "    is_bypass_rls: false", "    join_progressive: true",
            "    spotter_config:", "      is_spotter_enabled: true"]
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    open(sys.argv[3], "w").write(build(spec, sys.argv[2]))
    print("wrote", sys.argv[3])
