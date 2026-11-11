"""Sanity-check the generated data: volumes, ratios and the two planted stories."""
import csv, sys
from collections import defaultdict, Counter
from datetime import date

rows = list(csv.DictReader(open(sys.argv[1])))
f = lambda r, c: float(r[c]) if r[c] else None
amt = sum(f(r, "EXPENSE_AMOUNT_USD") for r in rows)
oop = sum(f(r, "OUT_OF_POLICY_AMOUNT_USD") for r in rows)
print(f"rows {len(rows):,}  spend ${amt/1e6:,.1f}M  out-of-policy {oop/amt:.1%}  avg risk {sum(f(r,'AUDIT_RISK_SCORE') for r in rows)/len(rows):.1f}")
ap = [f(r, "APPROVAL_DAYS") for r in rows if r["APPROVAL_DAYS"]]
print(f"avg approval days {sum(ap)/len(ap):.2f}   missing receipt {sum(int(r['RECEIPT_MISSING_FLAG']) for r in rows)/len(rows):.1%}")
wk = sum(f(r, "EXPENSE_AMOUNT_USD") for r in rows if date.fromisoformat(r["TRANSACTION_DATE"]).weekday() < 5)
print(f"weekday share of spend {wk/amt:.1%}")

def by(key, val="EXPENSE_AMOUNT_USD"):
    d = defaultdict(float)
    for r in rows: d[key(r)] += f(r, val) or 0
    return d

ym = by(lambda r: r["TRANSACTION_DATE"][:7])
print("\nmonthly spend ($K):", "  ".join(f"{k[2:]}:{v/1e3:.0f}" for k, v in sorted(ym.items())))
yoy = lambda y1, y2: sum(v for k, v in ym.items() if k[:4] == y2 and k[5:] <= "09") / sum(v for k, v in ym.items() if k[:4] == y1 and k[5:] <= "09")
print(f"YoY Jan-Sep 2026 vs 2025: {yoy('2025','2026')-1:+.1%}")

sub = Counter()
for r in rows:
    if r["SUBMITTED_DATE"]:
        d = date.fromisoformat(r["SUBMITTED_DATE"]); sub["month-end (day>=26)" if d.day >= 26 else "other"] += 1
print("submissions by line:", dict(sub), "(last ~6 days hold", f"{sub['month-end (day>=26)']/sum(sub.values()):.0%})")
print("status:", Counter(r["REPORT_STATUS"] for r in rows).most_common())
print("policy flags:", Counter(r["POLICY_FLAG"] for r in rows).most_common())
print("category spend share:", {k: f"{v/amt:.0%}" for k, v in sorted(by(lambda r: r["EXPENSE_CATEGORY"]).items(), key=lambda x: -x[1])})

print("\nStory 1 - avg hotel rate / negotiated, by half-year:")
for city in ["New York", "London", "Chicago"]:
    h = defaultdict(lambda: [0, 0])
    for r in rows:
        if r["EXPENSE_CATEGORY"] == "Lodging" and r["CITY"] == city:
            k = r["TRANSACTION_DATE"][:4] + ("H1" if r["TRANSACTION_DATE"][5:7] <= "06" else "H2")
            h[k][0] += f(r, "EXPENSE_AMOUNT_USD"); h[k][1] += f(r, "NEGOTIATED_RATE_USD")
    print(f"  {city:10}", "  ".join(f"{k}:{a/n:.2f}" for k, (a, n) in sorted(h.items())))

print("Story 2 - violation rate by quarter, Sales vs everyone else:")
q = defaultdict(lambda: [0, 0, 0, 0])
for r in rows:
    k = r["TRANSACTION_DATE"][:4] + "Q" + str((int(r["TRANSACTION_DATE"][5:7]) - 1) // 3 + 1)
    i = 0 if r["DEPARTMENT"] == "Sales" else 2
    q[k][i] += int(r["VIOLATION_COUNT"]); q[k][i + 1] += 1
print("  ", "  ".join(f"{k}: {v[0]/v[1]:.1%} vs {v[2]/v[3]:.1%}" for k, v in sorted(q.items())))
pend = [int(r["DAYS_PENDING"]) for r in rows if r["DAYS_PENDING"]]
print(f"\npending lines {len(pend):,}, reports {len({r['REPORT_ID'] for r in rows if r['DAYS_PENDING']}):,}, max days pending {max(pend)}")
print("cardinalities:", {c: len({r[c] for r in rows}) for c in ["EMPLOYEE_NAME","APPROVER_NAME","COST_CENTER","CITY","MERCHANT","PROJECT_CLIENT","REPORT_ID"]})
