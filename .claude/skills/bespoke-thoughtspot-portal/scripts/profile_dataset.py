"""Generic sanity profile of a generated demo CSV. Run after every generation, before loading.

Usage: python3 profile_dataset.py <file.csv> --date COL --amount COL [--as-of YYYY-MM-DD] [--dims COL,COL,...]

Fails (exit 1) on the mistakes that reached Snowflake in earlier runs:
  * any date after --as-of (default: yesterday)  -> "future dates" (trips/periods that run past the end)
  * fewer than 2 years of daily coverage, or missing days
  * a dimension with a single value, or a measure column that is entirely empty
Prints the shape a demo needs to look real: volume, monthly totals, weekday share, YoY growth, cardinalities.
"""
import argparse
import csv
import sys
from collections import Counter, defaultdict
from datetime import date, timedelta

ap = argparse.ArgumentParser()
ap.add_argument("csv")
ap.add_argument("--date", required=True)
ap.add_argument("--amount", required=True)
ap.add_argument("--as-of", default=str(date.today() - timedelta(days=1)))
ap.add_argument("--dims", default="")
a = ap.parse_args()

rows = list(csv.DictReader(open(a.csv, encoding="utf-8")))
as_of = date.fromisoformat(a.as_of)
problems = []
days = [date.fromisoformat(r[a.date][:10]) for r in rows if r[a.date]]
amt = lambda r: float(r[a.amount] or 0)
total = sum(amt(r) for r in rows)
lo, hi = min(days), max(days)
print(f"rows {len(rows):,}   {a.date} {lo} .. {hi}   total {a.amount} {total:,.0f}")
if hi > as_of:
    problems.append(f"{sum(d > as_of for d in days):,} rows dated after {as_of} (future dates)")
if (hi - lo).days < 700:
    problems.append(f"only {(hi - lo).days} days of history; want about 2 years")
missing = (hi - lo).days + 1 - len(set(days))
if missing:
    problems.append(f"{missing} calendar days have no rows")

wk = sum(amt(r) for r, d in zip(rows, days) if d.weekday() < 5)
print(f"weekday share of {a.amount}: {wk / total:.1%}")
by_m = defaultdict(float)
for r, d in zip(rows, days):
    by_m[d.strftime("%Y-%m")] += amt(r)
print("monthly:", "  ".join(f"{k[2:]}:{v / 1e3:,.0f}K" for k, v in sorted(by_m.items())))
y2, y1 = hi.year, hi.year - 1
cut = hi.strftime("%m")
cur = sum(v for k, v in by_m.items() if k[:4] == str(y2) and k[5:] < cut)
prev = sum(v for k, v in by_m.items() if k[:4] == str(y1) and k[5:] < cut)
if prev:
    print(f"YoY {y2} vs {y1} (Jan to before {cut}): {cur / prev - 1:+.1%}")

for col in rows[0].keys():
    vals = [r[col] for r in rows]
    empty = sum(v == "" for v in vals)
    if empty == len(vals):
        problems.append(f"column {col} is entirely empty")
for d in [x for x in a.dims.split(",") if x]:
    c = Counter(r[d] for r in rows)
    print(f"{d}: {len(c)} values; top {', '.join(f'{k} {v / len(rows):.0%}' for k, v in c.most_common(4))}")
    if len(c) < 2:
        problems.append(f"dimension {d} has a single value")

if problems:
    print("\nPROBLEMS:\n- " + "\n- ".join(problems))
    sys.exit(1)
print("\nOK")
