"""Config-driven synthetic dataset engine: write a small JSON config, not a generator script.

Usage: python3 generate_dataset.py <config.json> <out_dir>
Writes <out_dir>/<TABLE>.csv and <out_dir>/manifest.json (explicit Snowflake types for `ts load snowflake`).

One row = one event (order line, expense line, claim, ticket...) done by an ACTOR (employee, store, account...).
Pipeline per run (seeded, so re-runs are identical):
  1. actors: `count` actors get attributes once (weighted picks, nested hierarchies, generated names).
  2. events: for every day in the window and every actor, n ~ Poisson(rate x calendar factors) events.
  3. columns: evaluated in config order for each event (weights / by / map / lognormal / uniform / expr).
  4. groups (optional): events grouped per actor-period into documents (report, order, invoice) with an ID,
     a submitted date (month-end clustering) and an age; then age-based status rules.
  5. post columns: exprs that may use the group fields (status, age...).
  Rows dated after as_of are dropped (no future dates, ever).

Config reference (see references/examples/emburse/dataset-config.json for a full example):
{
  "table": "ACME_ORDER_LINES", "seed": 7, "days": 730, "as_of": null,          # as_of null = yesterday
  "id_column": "LINE_ID", "id_prefix": "L-",
  "date_column": "ORDER_DATE",
  "actors": {
    "count": 1200, "label": "CUSTOMER_NAME", "names": "people" | "companies",
    "attributes": {
      "SEGMENT": {"weights": {"Enterprise": 20, "Mid-market": 50, "SMB": 30}},
      "GEO": {"levels": ["REGION", "COUNTRY", "CITY"],
              "tree": {"North America": [55, {"United States": [85, {"New York": 10, "Chicago": 6}]}]}}
    },
    "rate": 0.4,                                        # events per actor per average day
    "rate_by": {"SEGMENT": {"Enterprise": 3.0, "SMB": 0.5}},
    "rate_spread": 0.45                                 # lognormal per-actor activity spread
  },
  "calendar": {"growth_yoy": 0.10, "weekday": [1, 1.05, 1.05, 1, 0.9, 0.15, 0.1],
               "month": {"1": 1.1, "7": 0.85, "12": 0.7}, "holidays": "us"},
  "columns": [
    {"name": "CATEGORY", "weights": {"A": 50, "B": 30}, "by": "SEGMENT", "by_weights": {"SMB": {"A": 80, "B": 20}}},
    {"name": "PRODUCT", "map_from": "CATEGORY", "map": {"A": ["A1", "A2"], "B": ["B1"]}},
    {"name": "AMOUNT", "lognormal": {"by": "CATEGORY", "median": {"A": 120, "B": 900}, "sigma": 0.5}, "round": 2},
    {"name": "DISCOUNT", "expr": "r['AMOUNT'] * uniform(0, 0.2) if chance(0.3) else 0", "round": 2}
  ],
  "groups": {"id_column": "ORDER_ID", "id_prefix": "SO", "per": "actor_month" | "actor_week" | "event",
             "submitted_column": "SUBMITTED_DATE", "lag_days": [1, 10], "month_end_share": 0.6,
             "status_column": "STATUS",
             "status_rules": [{"if": "age < 0", "status": "Draft"},
                              {"if": "age <= 7", "weights": {"Pending": 70, "Approved": 30}},
                              {"weights": {"Closed": 95, "Cancelled": 5}}]},
  "post": [{"name": "DAYS_OPEN", "expr": "age if r['STATUS'] == 'Pending' else None"}],
  "types": {"AMOUNT": "NUMBER(12,2)", "DAYS_OPEN": "NUMBER(4,0)"}       # anything not listed is inferred
}
Expression helpers: r (row dict), d (event date), actor (dict), age (days from submitted date to as_of; groups only),
as_of, rng, uniform(a,b), chance(p), lognorm(median, sigma), pick(list), weighted(dict), ramp(days) (0 before the
last `days` days, rising to 1 at as_of; use it for planted stories), month, dow (0=Mon), quarter_end (bool),
math, timedelta. Columns or actor attributes whose name starts with "_" are helpers: usable in later exprs (r['_X'], actor['_X'])
but never written to the CSV (Rocketlane run: project lifecycle from actor['_OFF']). timedelta (e.g. "d + timedelta(days=r['CALLBACK_IN_DAYS'])" for a due date). Keep stories in exprs, e.g. "AMOUNT": "lognorm(200,0.3) * (1 + 0.25 * ramp(270) if r['CITY'] in ('New York','London') else 1)".
"""
import csv
import json
import math
import random
import sys
from datetime import date, timedelta
from pathlib import Path

FIRST = ("James Maria Wei Aisha Daniel Sofia Liam Priya Noah Elena Oliver Fatima Lucas Hannah Mateo Yuki Ethan Chloe Arjun Grace "
         "Benjamin Amara Henry Isabel Kenji Leah Omar Nina Samuel Zara David Mei Jack Ana Ryan Ingrid Marcus Lucia Tom Sara Felix "
         "Naomi Hugo Emily Ravi Clara Owen Julia Diego Ava Ahmed Beatriz Connor Dana Emeka Freya Gabriel Hiro Imani Jonas Kavya Leon "
         "Maya Nikhil Olga Pablo Rina Stefan Tara Vikram").split()
LAST = ("Smith Garcia Chen Khan Muller Rossi Johnson Patel Brown Novak Williams Tanaka Martin Dubois Kim Silva Taylor OBrien Nguyen "
        "Schmidt Davies Hughes Lopez Andersen Wright Sato Clarke Moreau Walker Singh Evans Fischer Murphy Costa Reid Bauer Hall Ito "
        "Lewis Jensen Okafor Haddad Kowalski Ferreira Lindqvist Mehta Romero Petrov Yamada Brennan").split()
CO_A = "Northwind Bluepeak Harborline Cobalt Vantage Summit Ironclad Lumen Granite Orchard Pinnacle Meridian Clearwater Atlas Brightline Evergreen Keystone Redwood Silverline Tidewater Crescent Polaris Juniper Falcon".split()
CO_B = "Logistics Health Bank Retail Insurance Manufacturing Media Utilities Foods Partners Airlines Pharma Freight Telecom Hospitals Capital Software Hotels Energy Wealth Robotics Schools Aerospace Group".split()


def us_holidays(years):
    out = set()
    for y in years:
        d = date(y, 11, 1)
        while d.weekday() != 3:
            d += timedelta(days=1)
        tg = d + timedelta(days=21)
        out |= {date(y, 1, 1), date(y, 7, 4), tg, tg + timedelta(days=1)} | {date(y, 12, k) for k in range(24, 32)}
    return out


def main(cfg_path, out_dir):
    C = json.load(open(cfg_path))
    rng = random.Random(C.get("seed", 1))
    as_of = date.fromisoformat(C["as_of"]) if C.get("as_of") else date.today() - timedelta(days=1)
    start = as_of - timedelta(days=C.get("days", 730) - 1)
    cal = C.get("calendar", {})
    wk = cal.get("weekday", [1, 1, 1, 1, 0.95, 0.2, 0.15])
    mon = {int(k): v for k, v in cal.get("month", {}).items()}
    hol = us_holidays(range(start.year, as_of.year + 1)) if cal.get("holidays", "us") == "us" else set()

    def weighted(w):
        ks = list(w)
        return rng.choices(ks, weights=[w[k] for k in ks])[0]

    def lognorm(med, sig):
        return rng.lognormvariate(math.log(med), sig)

    def ramp(days, d=None):
        d = d or CUR["d"]
        return max(0.0, min(1.0, 1 - (as_of - d).days / float(days)))

    CUR = {"d": start}
    env = {"rng": rng, "uniform": rng.uniform, "chance": lambda p: rng.random() < p, "lognorm": lognorm, "pick": rng.choice,
           "weighted": weighted, "math": math, "as_of": as_of, "ramp": ramp, "min": min, "max": max, "round": round,
           "abs": abs, "len": len, "timedelta": timedelta, "str": str, "int": int, "float": float, "any": any, "all": all, "sum": sum}

    CODE = {}
    GLOBS = {"__builtins__": {}, **env}

    def ev(expr, extra):
        code = CODE.get(expr)
        if code is None:
            code = CODE[expr] = compile(expr, "<expr>", "eval")
        return eval(code, GLOBS, extra)

    # ---- actors
    A = C["actors"]
    used = set()

    def gen_name(kind):
        for _ in range(10000):
            n = (rng.choice(CO_A) + " " + rng.choice(CO_B)) if kind == "companies" else (rng.choice(FIRST) + " " + rng.choice(LAST))
            if n not in used:
                used.add(n)
                return n
        return n + " " + str(len(used))

    def tree_pick(tree, levels, out):
        node, i = tree, 0
        while isinstance(node, dict) and i < len(levels):
            keys = list(node)
            wts = [node[k][0] if isinstance(node[k], list) else node[k] for k in keys]
            k = rng.choices(keys, weights=wts)[0]
            out[levels[i]] = k
            node = node[k][1] if isinstance(node[k], list) and len(node[k]) > 1 else None
            i += 1

    actors = []
    for _ in range(A["count"]):
        a = {}
        if A.get("label"):
            a[A["label"]] = gen_name(A.get("names", "people"))
        for col, spec in A.get("attributes", {}).items():
            if "levels" in spec:
                tree_pick(spec["tree"], spec["levels"], a)
            elif "weights" in spec:
                a[col] = weighted(spec["weights"])
            elif "expr" in spec:
                a[col] = ev(spec["expr"], {"actor": a, "r": a})
        rate = A.get("rate", 0.3)
        for col, m in A.get("rate_by", {}).items():
            rate *= m.get(a.get(col), 1.0)
        a["_rate"] = rate * rng.lognormvariate(0, A.get("rate_spread", 0.4))
        actors.append(a)

    # ---- events
    rows = []
    d = start
    years = 365.0
    while d <= as_of:
        CUR["d"] = d
        f = wk[d.weekday()] * mon.get(d.month, 1.0) * (1 + cal.get("growth_yoy", 0.1) * (d - start).days / years)
        if d in hol:
            f *= cal.get("holiday_factor", 0.3)
        for a in actors:
            lam = a["_rate"] * f
            # Poisson draw (Knuth) for small lambdas
            L, k, p = math.exp(-lam), 0, 1.0
            while True:
                p *= rng.random()
                if p <= L:
                    break
                k += 1
            for _ in range(k):
                r = {C["date_column"]: d}
                r.update({kk: vv for kk, vv in a.items() if not kk.startswith("_")})
                ctx = {"r": r, "d": d, "actor": a, "month": d.month, "dow": d.weekday(),
                       "quarter_end": d.month in (3, 6, 9, 12) and d.day >= 20}
                for c in C["columns"]:
                    n = c["name"]
                    if "weights" in c:
                        w = c.get("by_weights", {}).get(r.get(c.get("by")), c["weights"]) if c.get("by") else c["weights"]
                        v = weighted(w)
                    elif "map_from" in c:
                        opts = c["map"].get(r[c["map_from"]], c.get("default", [None]))
                        v = weighted(opts) if isinstance(opts, dict) else rng.choice(opts)
                    elif "lognormal" in c:
                        L2 = c["lognormal"]
                        med = L2["median"].get(r.get(L2.get("by")), L2.get("default", 100)) if isinstance(L2["median"], dict) else L2["median"]
                        sig = L2["sigma"].get(r.get(L2.get("by")), 0.4) if isinstance(L2["sigma"], dict) else L2["sigma"]
                        v = lognorm(med, sig)
                    elif "uniform" in c:
                        v = rng.uniform(*c["uniform"])
                    elif "expr" in c:
                        v = ev(c["expr"], ctx)
                    else:
                        v = c.get("value")
                    if isinstance(v, float) and "round" in c:
                        v = round(v, c["round"])
                    r[n] = v
                r["_actor"] = id(a)
                rows.append(r)
        d += timedelta(days=1)

    # ---- groups (documents) + status by age
    G = C.get("groups")
    if G:
        def key(r):
            dd = r[C["date_column"]]
            per = G.get("per", "actor_month")
            if per == "event":
                return (id(r),)
            if per == "actor_week":
                return (r["_actor"], dd.isocalendar()[0], dd.isocalendar()[1])
            return (r["_actor"], dd.year, dd.month)
        groups = {}
        for r in rows:
            groups.setdefault(key(r), []).append(r)
        ordered = sorted(groups.values(), key=lambda g: min(x[C["date_column"]] for x in g))
        lo, hi = G.get("lag_days", [1, 10])
        for seq, g in enumerate(ordered, 1):
            last = max(x[C["date_column"]] for x in g)
            sub = last + timedelta(days=rng.randint(lo, hi))
            if rng.random() < G.get("month_end_share", 0.0):
                nxt = date(last.year + (last.month == 12), last.month % 12 + 1, 1)
                me = nxt - timedelta(days=1)
                while me.weekday() >= 5:
                    me -= timedelta(days=1)
                if me >= last:
                    sub = me - timedelta(days=rng.randint(0, 2))
            age = (as_of - sub).days
            first = min(x[C["date_column"]] for x in g)
            gid = "%s-%d-%06d" % (G.get("id_prefix", "DOC"), first.year, seq)
            status = None
            for rule in G.get("status_rules", []):
                if "if" not in rule or ev(rule["if"], {"age": age, "r": g[0], "rows": g}):
                    status = rule.get("status") or weighted(rule["weights"])
                    break
            for r in g:
                r[G["id_column"]] = gid
                if G.get("submitted_column"):
                    r[G["submitted_column"]] = sub if age >= 0 else None
                if G.get("status_column"):
                    r[G["status_column"]] = status
                r["_age"] = age
    for p in C.get("post", []):
        for r in rows:
            CUR["d"] = r[C["date_column"]]
            v = ev(p["expr"], {"r": r, "d": r[C["date_column"]], "age": r.get("_age", 0), "month": r[C["date_column"]].month,
                               "dow": r[C["date_column"]].weekday()})
            if isinstance(v, float) and "round" in p:
                v = round(v, p["round"])
            r[p["name"]] = v

    rows = [r for r in rows if r[C["date_column"]] <= as_of]
    rows.sort(key=lambda r: (r[C["date_column"]], str(r.get((G or {}).get("id_column", ""), ""))))
    idc = C.get("id_column")
    if idc:
        for i, r in enumerate(rows, 1):
            r[idc] = "%s%07d" % (C.get("id_prefix", "R-"), i)

    # ---- columns, types, output
    cols = ([idc] if idc else []) + [k for k in rows[0] if not k.startswith("_") and k != idc]
    for r in rows[1:200]:
        for k in r:
            if not k.startswith("_") and k not in cols:
                cols.append(k)
    types = dict(C.get("types", {}))
    for k in cols:
        if k in types:
            continue
        vals = [r.get(k) for r in rows[:5000] if r.get(k) is not None]
        if all(isinstance(v, date) for v in vals) and vals:
            types[k] = "DATE"
        elif vals and all(isinstance(v, bool) for v in vals):
            types[k] = "BOOLEAN"
        elif vals and all(isinstance(v, int) for v in vals):
            types[k] = "NUMBER(12,0)"
        elif vals and all(isinstance(v, (int, float)) for v in vals):
            types[k] = "NUMBER(14,2)"
        else:
            types[k] = "VARCHAR(%d)" % max(32, 2 * max((len(str(v)) for v in vals), default=16))
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    csv_path = out / (C["table"] + ".csv")
    with csv_path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(cols)
        for r in rows:
            w.writerow(["" if r.get(k) is None else r.get(k) for k in cols])
    manifest = {"tables": [{"table_name": C["table"], "data_file": str(csv_path.resolve()),
                            "columns": [{"name": k, "db_column_name": k, "type": types[k]} for k in cols]}]}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps({"rows": len(rows), "actors": len(actors), "window": [str(start), str(as_of)], "columns": len(cols), "csv": str(csv_path)}))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
