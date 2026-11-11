"""Build Table TML (YAML) for a loaded Snowflake table, from the load manifest and the model spec.

Usage: python3 build_table_tml.py <manifest.json> <model-spec.json> <connection_name> <connection_guid> <db> <schema> <out.tml>

Column types come from the manifest's Snowflake types (DATE, VARCHAR, NUMBER(p,0) -> INT64, other NUMBER -> DOUBLE);
MEASURE vs ATTRIBUTE comes from the model spec. The connection is referenced by name AND guid (fqn), so a
renamed or duplicated connection name cannot silently bind the table to the wrong connection.
"""
import json
import sys


def ts_type(t):
    t = t.upper()
    if t.startswith("DATE") and not t.startswith("DATETIME"):
        return "DATE"
    if t.startswith(("TIMESTAMP", "DATETIME")):
        return "DATE_TIME"
    if t.startswith(("VARCHAR", "STRING", "TEXT", "CHAR")):
        return "VARCHAR"
    if t.startswith("BOOL"):
        return "BOOL"
    if t.startswith(("NUMBER", "DECIMAL", "NUMERIC")):
        return "INT64" if t.replace(" ", "").endswith(",0)") else "DOUBLE"
    if t.startswith(("INT", "BIGINT", "SMALLINT")):
        return "INT64"
    return "DOUBLE"


def main(manifest, model_spec, conn_name, conn_guid, db, schema, out_path):
    tbl = json.load(open(manifest))["tables"][0]
    spec = json.load(open(model_spec))
    measures = {c["db"] for c in spec["columns"] if c.get("type") == "MEASURE"}
    out = ["table:", "  name: " + tbl["table_name"], "  db: " + db, "  schema: " + schema, "  db_table: " + tbl["table_name"],
           "  connection:", "    name: " + conn_name, "    fqn: " + conn_guid, "  columns:"]
    for c in tbl["columns"]:
        n = c.get("db_column_name", c["name"])
        out += ["  - name: " + n, "    db_column_name: " + n, "    properties:",
                "      column_type: " + ("MEASURE" if n in measures else "ATTRIBUTE"),
                "    db_column_properties:", "      data_type: " + ts_type(c["type"])]
    open(out_path, "w").write("\n".join(out) + "\n")
    print("wrote", out_path, len(tbl["columns"]), "columns,", len(measures), "measures")


if __name__ == "__main__":
    main(*sys.argv[1:8])
