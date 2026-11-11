"""Synthetic Emburse-style expense-line data for the bespoke ThoughtSpot portal demo.

One row = one expense line on an expense report. Seeded, so re-runs are identical.

Patterns built in:
  * ~10% YoY growth; weekday-heavy spend; Jan sales-kickoff, Mar-Apr / Sep-Oct conference
    peaks, Jul-Aug softness (deeper in EMEA), December dip + early-January catch-up filing.
  * Submissions cluster in the last 3 business days of each month; approvals slow at quarter-end.
  * Story 1: hotel rates in New York and London drift above negotiated rates over the last ~9 months.
  * Story 2: Sales policy violations climb over the last ~6 months.

Usage: python3 generate_expense_lines.py <output_dir>
Writes EMBURSE_EXPENSE_LINES.csv and manifest.json into <output_dir>.
"""
import csv
import json
import math
import random
import sys
from datetime import date, timedelta
from pathlib import Path

SEED = 20261017
START = date(2024, 10, 17)
AS_OF = date(2026, 10, 16)
TABLE = "EMBURSE_EXPENSE_LINES"

rng = random.Random(SEED)

# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

# city -> (country, region, currency, negotiated hotel rate USD, per-diem USD, travel-hub weight)
CITIES = {
    "New York":      ("United States", "North America", "USD", 289, 92, 10),
    "San Francisco": ("United States", "North America", "USD", 269, 90, 8),
    "Chicago":       ("United States", "North America", "USD", 209, 80, 6),
    "Boston":        ("United States", "North America", "USD", 255, 84, 4),
    "Austin":        ("United States", "North America", "USD", 199, 74, 3),
    "Seattle":       ("United States", "North America", "USD", 229, 82, 3),
    "Atlanta":       ("United States", "North America", "USD", 185, 72, 3),
    "Denver":        ("United States", "North America", "USD", 189, 74, 2),
    "Dallas":        ("United States", "North America", "USD", 179, 70, 3),
    "Toronto":       ("Canada",        "North America", "CAD", 199, 70, 3),
    "Vancouver":     ("Canada",        "North America", "CAD", 205, 70, 2),
    "London":        ("United Kingdom", "EMEA", "GBP", 245, 85, 8),
    "Manchester":    ("United Kingdom", "EMEA", "GBP", 159, 65, 2),
    "Berlin":        ("Germany",        "EMEA", "EUR", 169, 68, 3),
    "Munich":        ("Germany",        "EMEA", "EUR", 189, 70, 2),
    "Frankfurt":     ("Germany",        "EMEA", "EUR", 179, 70, 2),
    "Paris":         ("France",         "EMEA", "EUR", 229, 80, 4),
    "Lyon":          ("France",         "EMEA", "EUR", 149, 62, 1),
    "Amsterdam":     ("Netherlands",    "EMEA", "EUR", 215, 76, 3),
    "Sydney":        ("Australia",      "APAC", "AUD", 205, 78, 3),
    "Melbourne":     ("Australia",      "APAC", "AUD", 189, 74, 2),
    "Singapore":     ("Singapore",      "APAC", "SGD", 235, 80, 5),
    "Tokyo":         ("Japan",          "APAC", "JPY", 219, 78, 4),
    "Osaka":         ("Japan",          "APAC", "JPY", 169, 68, 1),
}
OVERSPEND_CITIES = {"New York", "London"}
HOME_REGION_WEIGHTS = {"North America": 55, "EMEA": 30, "APAC": 15}
VAT = {  # reclaimable indirect-tax rate by country
    "United Kingdom": 0.20, "Germany": 0.19, "France": 0.20, "Netherlands": 0.21,
    "Australia": 0.10, "Singapore": 0.09, "Japan": 0.10, "Canada": 0.05,
}

# department -> (headcount, trips per person per year, standalone lines per person per month)
DEPARTMENTS = {
    "Sales":                 (280, 9.0, 7.0),
    "Customer Success":      (120, 4.5, 5.0),
    "Professional Services": (160, 8.0, 5.5),
    "Engineering":           (300, 1.2, 3.0),
    "Marketing":             (110, 3.5, 5.5),
    "Finance & Operations":  (80, 1.0, 3.5),
    "People & HR":           (55, 1.2, 3.5),
    "Legal":                 (40, 1.5, 3.0),
    "Executive":             (25, 10.0, 8.0),
}
DEPT_CODE = {d: 1000 + 100 * i for i, d in enumerate(DEPARTMENTS)}
CLIENT_FACING = {"Sales", "Customer Success", "Professional Services", "Executive"}

CLIENTS = [
    "Northwind Logistics", "Bluepeak Health", "Harborline Bank", "Cobalt Retail Group",
    "Vantage Insurance", "Summit Ridge University", "Ironclad Manufacturing", "Lumen Media",
    "Granite State Utilities", "Orchard Foods", "Pinnacle Legal LLP", "Meridian Airlines",
    "Clearwater Pharma", "Atlas Freight", "Brightline Telecom", "Evergreen Hospitals",
    "Keystone Capital", "Redwood Software", "Silverline Hotels", "Tidewater Energy",
    "Crescent Wealth", "Polaris Robotics", "Juniper Schools", "Falcon Aerospace",
]

FIRST = ["James", "Maria", "Wei", "Aisha", "Daniel", "Sofia", "Liam", "Priya", "Noah", "Elena",
         "Oliver", "Fatima", "Lucas", "Hannah", "Mateo", "Yuki", "Ethan", "Chloe", "Arjun", "Grace",
         "Benjamin", "Amara", "Henry", "Isabel", "Kenji", "Leah", "Omar", "Nina", "Samuel", "Zara",
         "David", "Mei", "Jack", "Ana", "Ryan", "Ingrid", "Marcus", "Lucia", "Tom", "Sara",
         "Felix", "Naomi", "Hugo", "Emily", "Ravi", "Clara", "Owen", "Julia", "Diego", "Ava",
         "Ahmed", "Beatriz", "Connor", "Dana", "Emeka", "Freya", "Gabriel", "Hiro", "Imani", "Jonas",
         "Kavya", "Leon", "Maya", "Nikhil", "Olga", "Pablo", "Rina", "Stefan", "Tara", "Vikram"]
LAST = ["Smith", "Garcia", "Chen", "Khan", "Müller", "Rossi", "Johnson", "Patel", "Brown", "Novak",
        "Williams", "Tanaka", "Martin", "Dubois", "Kim", "Silva", "Taylor", "O'Brien", "Nguyen", "Schmidt",
        "Davies", "Hughes", "Lopez", "Andersen", "Wright", "Sato", "Clarke", "Moreau", "Walker", "Singh",
        "Evans", "Fischer", "Murphy", "Costa", "Reid", "Bauer", "Hall", "Ito", "Lewis", "Jensen"]

AIRLINES = {"North America": ["Delta Air Lines", "United Airlines", "American Airlines", "Alaska Airlines", "Air Canada"],
            "EMEA": ["British Airways", "Lufthansa", "Air France", "KLM", "Virgin Atlantic"],
            "APAC": ["Qantas", "Singapore Airlines", "Japan Airlines", "ANA", "Cathay Pacific"]}
HOTELS = ["Marriott", "Hilton", "Hyatt", "IHG Hotels", "Accor", "Westin", "Courtyard by Marriott", "Hampton Inn"]
GROUND = {"North America": ["Uber", "Lyft", "Hertz", "Enterprise Rent-A-Car", "Avis", "Amtrak"],
          "EMEA": ["Uber", "Bolt", "Hertz", "Sixt", "Eurostar", "Deutsche Bahn"],
          "APAC": ["Uber", "Grab", "Hertz", "JR Rail", "Cabcharge"]}
MEALS = ["Starbucks", "Pret A Manger", "Chipotle", "Sweetgreen", "The Capital Grille", "Ruth's Chris Steak House",
         "Nobu", "Local Restaurant", "Hotel Restaurant", "Uber Eats", "DoorDash", "Airport Dining"]
SOFTWARE = ["Zoom", "Slack", "LinkedIn Sales Navigator", "Adobe Creative Cloud", "Notion", "AWS", "Canva", "Calendly"]
OFFICE = ["Amazon Business", "Staples", "Office Depot", "Best Buy", "IKEA"]
CONFERENCES = ["Dreamforce", "AWS re:Invent", "SaaStr Annual", "Gartner Symposium", "Web Summit",
               "Money20/20", "HR Tech Conference", "Legalweek", "Eventbrite"]
GIFTS = ["Harry & David", "1-800-Flowers", "Edible Arrangements", "Goldbelly", "Etsy"]

MCC = {
    "Airfare": "Airlines", "Lodging": "Hotels & Lodging", "Meals & Entertainment": "Restaurants & Bars",
    "Per Diem": "Per Diem Allowance", "Mileage": "Personal Vehicle", "Conferences & Training": "Events & Education",
    "Software & Subscriptions": "Digital Services", "Office Supplies": "Retail", "Client Gifts": "Retail",
}
CAR_RENTAL = {"Hertz", "Enterprise Rent-A-Car", "Avis", "Sixt"}
RAIL = {"Amtrak", "Eurostar", "Deutsche Bahn", "JR Rail"}

MONTH_FACTOR = {1: 1.20, 2: 1.15, 3: 1.18, 4: 1.15, 5: 1.02, 6: 1.00,
                7: 0.82, 8: 0.78, 9: 1.15, 10: 1.18, 11: 1.00, 12: 0.62}
CONF_MONTH = {3: 2.4, 4: 2.2, 9: 2.5, 10: 2.3, 5: 1.0, 6: 0.8, 11: 0.8}
GIFT_MONTH = {11: 3.0, 12: 4.0}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def daterange(a, b):
    d = a
    while d <= b:
        yield d
        d += timedelta(days=1)


def thanksgiving(y):
    d = date(y, 11, 1)
    while d.weekday() != 3:
        d += timedelta(days=1)
    return d + timedelta(days=21)


HOLIDAYS = set()
for _y in (2024, 2025, 2026):
    tg = thanksgiving(_y)
    HOLIDAYS |= {tg, tg + timedelta(days=1), date(_y, 7, 4), date(_y, 1, 1)}
    HOLIDAYS |= {date(_y, 12, d) for d in range(23, 32)}


def growth(d):
    return 1.0 + 0.10 * (d - START).days / 365.0


def season(d, region):
    f = MONTH_FACTOR[d.month]
    if region == "EMEA" and d.month == 8:
        f *= 0.7
    if d.month == 1 and d.day >= 13:  # sales kickoff window
        f *= 1.15
    return f


def last_business_days(y, m, n=3):
    d = date(y + (m == 12), m % 12 + 1, 1) - timedelta(days=1)
    out = []
    while len(out) < n:
        if d.weekday() < 5:
            out.append(d)
        d -= timedelta(days=1)
    return out


def first_business_days(y, m, n=5):
    d = date(y, m, 1)
    out = []
    while len(out) < n:
        if d.weekday() < 5 and d not in HOLIDAYS:
            out.append(d)
        d += timedelta(days=1)
    return out


def ramp(d, days):
    """0 before the last `days` days of the window, rising linearly to 1 at AS_OF."""
    return max(0.0, min(1.0, 1 - (AS_OF - d).days / days))


def money(x):
    return round(x, 2)


def pick_weighted(items):
    keys = list(items)
    return rng.choices(keys, weights=[items[k] for k in keys])[0]


# ---------------------------------------------------------------------------
# Employees, cost centres, approvers
# ---------------------------------------------------------------------------

def build_people():
    used = set()

    def name():
        while True:
            n = f"{rng.choice(FIRST)} {rng.choice(LAST)}"
            if n not in used:
                used.add(n)
                return n

    employees = []
    cost_centers = {}
    for dept, (head, _, _) in DEPARTMENTS.items():
        regions = ["North America", "EMEA", "APAC"] if head >= 40 else ["North America", "EMEA"]
        for r in regions:
            cost_centers[(dept, r)] = {
                "code": f"CC-{DEPT_CODE[dept] + regions.index(r) * 10} {dept} – {r}",
                "approver": name(),
            }
        for _ in range(head):
            region = pick_weighted({r: HOME_REGION_WEIGHTS[r] for r in regions})
            city = pick_weighted({c: v[5] + 1 for c, v in CITIES.items() if v[1] == region})
            cc = cost_centers[(dept, region)]
            employees.append({
                "name": name(), "dept": dept, "region": region, "city": city,
                "cost_center": cc["code"], "approver": cc["approver"],
                "travel_mult": rng.lognormvariate(0, 0.45),
                "subs": rng.sample(SOFTWARE, k=rng.choice([0, 1, 1, 2])) if dept != "Engineering" else rng.sample(SOFTWARE, k=rng.choice([0, 1])),
                "sub_day": rng.randint(1, 28),
                "clients": rng.sample(CLIENTS, k=3) if dept in CLIENT_FACING else [],
            })
    # department heads approve their managers' reports
    for e in employees:
        if e["name"] == e["approver"]:
            e["approver"] = "Victoria Hale"  # CFO
    return employees


# ---------------------------------------------------------------------------
# Line generation
# ---------------------------------------------------------------------------

def make_line(emp, d, category, merchant, amount, city, trip_id=None, extra=None):
    country, region, currency = CITIES[city][0], CITIES[city][1], CITIES[city][2]
    project = "Internal"
    if emp["clients"] and (trip_id is not None or category in ("Meals & Entertainment", "Client Gifts")):
        if rng.random() < 0.65:
            project = rng.choice(emp["clients"])
    mcc = MCC.get(category)
    if category == "Ground Transport":
        mcc = "Car Rental" if merchant in CAR_RENTAL else ("Rail" if merchant in RAIL else "Rideshare & Taxi")
    line = {
        "TRANSACTION_DATE": d, "EMPLOYEE_NAME": emp["name"], "DEPARTMENT": emp["dept"],
        "COST_CENTER": emp["cost_center"], "APPROVER_NAME": emp["approver"],
        "REGION": region, "COUNTRY": country, "CITY": city, "CURRENCY": currency,
        "EXPENSE_CATEGORY": category, "MERCHANT": merchant, "MCC_GROUP": mcc,
        "PROJECT_CLIENT": project, "EXPENSE_AMOUNT_USD": money(amount),
        "NEGOTIATED_RATE_USD": None, "MILES": None, "_trip": trip_id, "_emp": emp,
    }
    if extra:
        line.update(extra)
    return line


def payment_method(category, amount):
    weights = {
        "Airfare": {"Travel Agency (TMC)": 62, "Corporate Card": 33, "Out-of-Pocket": 5},
        "Lodging": {"Corporate Card": 68, "Travel Agency (TMC)": 17, "Out-of-Pocket": 15},
        "Meals & Entertainment": {"Corporate Card": 64, "Out-of-Pocket": 36},
        "Ground Transport": {"Corporate Card": 56, "Out-of-Pocket": 44},
        "Per Diem": {"Out-of-Pocket": 1}, "Mileage": {"Out-of-Pocket": 1},
        "Conferences & Training": {"Corporate Card": 78, "P-Card": 22},
        "Software & Subscriptions": {"P-Card": 70, "Corporate Card": 30},
        "Office Supplies": {"P-Card": 58, "Out-of-Pocket": 42},
        "Client Gifts": {"Corporate Card": 80, "Out-of-Pocket": 20},
    }[category]
    return pick_weighted(weights)


def meal_amount(client_meal):
    if client_meal:
        return rng.lognormvariate(math.log(140), 0.45)
    return rng.lognormvariate(math.log(28), 0.55)


def gen_trip(emp, start, trip_id):
    lines = []
    home = emp["city"]
    same_region = rng.random() < 0.78
    pool = {c: v[5] for c, v in CITIES.items() if c != home and ((v[1] == emp["region"]) == same_region)}
    dest = pick_weighted(pool)
    nights = rng.choices([1, 2, 3, 4, 5], weights=[22, 30, 26, 14, 8])[0]
    end = start + timedelta(days=nights)
    long_haul = CITIES[dest][1] != emp["region"]

    # airfare: booked on (or just before) departure, outbound + usually a return segment
    fare_base = 1150 if long_haul else 380
    air_region = CITIES[dest][1] if long_haul else emp["region"]
    for seg, d in ((0, start), (1, end)):
        if seg == 1 and rng.random() < 0.35:
            break  # round trip booked as one ticket
        amt = rng.lognormvariate(math.log(fare_base * (1.8 if seg == 0 and rng.random() < 0.35 else 1)), 0.28)
        lines.append(make_line(emp, d, "Airfare", rng.choice(AIRLINES[air_region]), amt, dest, trip_id))

    # lodging: one line per night
    neg = CITIES[dest][3]
    hotel = rng.choice(HOTELS)
    for n in range(nights):
        d = start + timedelta(days=n)
        drift = 1.0
        if dest in OVERSPEND_CITIES:
            drift += 0.24 * ramp(d, 270)
        rate = neg * rng.lognormvariate(math.log(drift * 1.02), 0.10)
        lines.append(make_line(emp, d, "Lodging", hotel, rate, dest, trip_id, {"NEGOTIATED_RATE_USD": neg}))

    # meals or per diem, ground transport
    per_diem = emp["dept"] == "Professional Services" and rng.random() < 0.6
    for n in range(nights + 1):
        d = start + timedelta(days=n)
        if per_diem:
            lines.append(make_line(emp, d, "Per Diem", "Per Diem Allowance", CITIES[dest][4], dest, trip_id))
        else:
            for _ in range(rng.choices([0, 1, 2, 3], weights=[10, 40, 38, 12])[0]):
                client_meal = bool(emp["clients"]) and rng.random() < 0.3
                lines.append(make_line(emp, d, "Meals & Entertainment", rng.choice(MEALS), meal_amount(client_meal), dest, trip_id,
                                       {"_client_meal": client_meal}))
        for _ in range(rng.choices([0, 1, 2], weights=[35, 45, 20])[0]):
            m = rng.choice(GROUND[CITIES[dest][1]])
            amt = rng.lognormvariate(math.log(95 if m in CAR_RENTAL else (120 if m in RAIL else 32)), 0.5)
            lines.append(make_line(emp, d, "Ground Transport", m, amt, dest, trip_id))
    return lines, end


def gen_standalone(emp, d):
    """Non-trip spend for one employee on one day."""
    lines = []
    dept_rate = DEPARTMENTS[emp["dept"]][2]
    dow = [1.0, 1.05, 1.05, 1.0, 0.9, 0.12, 0.08][d.weekday()]
    hol = 0.3 if d in HOLIDAYS else 1.0
    lam = dept_rate / 21.0 * dow * hol * growth(d) * (0.85 + 0.15 * season(d, emp["region"]))
    n = 0
    while rng.random() < lam / (1 + n):
        n += 1
    for _ in range(n):
        cat = pick_weighted({"Meals & Entertainment": 46, "Ground Transport": 16, "Mileage": 12 if emp["region"] != "APAC" else 4,
                             "Office Supplies": 10, "Conferences & Training": 1.1 * CONF_MONTH.get(d.month, 0.4),
                             "Client Gifts": (2 if emp["clients"] else 0.4) * GIFT_MONTH.get(d.month, 0.5)})
        city = emp["city"]
        extra = {}
        if cat == "Meals & Entertainment":
            client_meal = bool(emp["clients"]) and rng.random() < 0.4
            merchant, amt, extra = rng.choice(MEALS), meal_amount(client_meal), {"_client_meal": client_meal}
        elif cat == "Ground Transport":
            merchant = rng.choice(["Uber", "Lyft", "Bolt", "Grab"][: (2 if emp["region"] == "North America" else 3)])
            amt = rng.lognormvariate(math.log(26), 0.5)
        elif cat == "Mileage":
            miles = round(rng.lognormvariate(math.log(48), 0.7), 1)
            per_mile = (0.67 if d.year == 2024 else 0.70) if CITIES[city][0] == "United States" else 0.55
            merchant, amt, extra = "Personal Vehicle", miles * per_mile, {"MILES": miles}
        elif cat == "Office Supplies":
            merchant, amt = rng.choice(OFFICE), rng.lognormvariate(math.log(65), 0.7)
        elif cat == "Conferences & Training":
            merchant, amt = rng.choice(CONFERENCES), rng.lognormvariate(math.log(950), 0.55)
        else:
            merchant, amt = rng.choice(GIFTS), rng.lognormvariate(math.log(110), 0.4)
        lines.append(make_line(emp, d, cat, merchant, amt, city, None, extra))

    # recurring subscriptions on a fixed day of the month
    if d.day == emp["sub_day"]:
        for s in emp["subs"]:
            base = {"Zoom": 16, "Slack": 9, "LinkedIn Sales Navigator": 99, "Adobe Creative Cloud": 60,
                    "Notion": 10, "AWS": 140, "Canva": 15, "Calendly": 12}[s]
            amt = base * (rng.lognormvariate(0, 0.35) if s == "AWS" else 1.0)
            lines.append(make_line(emp, d, "Software & Subscriptions", s, amt, emp["city"]))
    return lines


# ---------------------------------------------------------------------------
# Policy, reports, workflow
# ---------------------------------------------------------------------------

def apply_policy(line, sales_mult):
    cat, amt, d = line["EXPENSE_CATEGORY"], line["EXPENSE_AMOUNT_USD"], line["TRANSACTION_DATE"]
    flag, status, oop = "None", "In Policy", 0.0
    m = sales_mult if line["DEPARTMENT"] == "Sales" else 1.0

    if cat == "Lodging":
        cap = line["NEGOTIATED_RATE_USD"] * 1.10
        if amt > cap:
            flag, status, oop = "Over Hotel Cap", "Soft Violation", amt - cap
    elif cat == "Meals & Entertainment":
        limit = 250 if line.get("_client_meal") else 75
        if amt > limit and rng.random() < min(1.0, 0.75 * m):
            flag, status, oop = "Over Meal Limit", "Soft Violation", amt - limit
        elif rng.random() < 0.05 * m * (1.8 if d.weekday() >= 4 else 1.0):
            flag, status, oop = "Alcohol on Receipt", "Hard Violation", amt * rng.uniform(0.2, 0.45)
    elif cat == "Airfare" and line["PAYMENT_METHOD"] != "Travel Agency (TMC)" and rng.random() < 0.28 * m:
        flag, status, oop = "Non-Preferred Booking Channel", "Soft Violation", amt * rng.uniform(0.08, 0.22)

    if flag == "None" and line["_trip"] is None and d.weekday() >= 5 and cat not in ("Software & Subscriptions",):
        if rng.random() < 0.5 * m:
            flag, status, oop = "Weekend Expense", "Soft Violation", amt
    if flag == "None" and amt > 75 and cat not in ("Per Diem", "Mileage", "Software & Subscriptions") and rng.random() < 0.06 * m:
        flag, status, oop = "Missing Receipt", "Missing Receipt", amt

    line["POLICY_FLAG"], line["POLICY_STATUS"] = flag, status
    line["OUT_OF_POLICY_AMOUNT_USD"] = money(oop)
    line["VIOLATION_COUNT"] = 0 if flag == "None" else 1
    line["RECEIPT_MISSING_FLAG"] = 1 if flag == "Missing Receipt" else 0


def risk_score(line):
    s = rng.betavariate(1.8, 12) * 100
    s += {"In Policy": 0, "Soft Violation": 18, "Hard Violation": 38, "Missing Receipt": 26}[line["POLICY_STATUS"]]
    if line["POLICY_FLAG"] == "Duplicate Suspected":
        s += 30
    if line["EXPENSE_AMOUNT_USD"] > 1000:
        s += 7
    if line["PAYMENT_METHOD"] == "Out-of-Pocket":
        s += 4
    return int(max(1, min(99, round(s))))


def submission_date(last_txn, monthly):
    if monthly:
        y, m = last_txn.year, last_txn.month
        if rng.random() < (0.5 if m == 12 else 0.68):
            return rng.choice(last_business_days(y, m))
        ny, nm = (y + 1, 1) if m == 12 else (y, m + 1)
        return rng.choice(first_business_days(ny, nm))
    s = last_txn + timedelta(days=rng.choices(range(1, 15), weights=[14, 16, 14, 11, 9, 7, 6, 5, 4, 4, 3, 3, 2, 2])[0])
    lbd = last_business_days(s.year, s.month)
    if rng.random() < 0.35 and s < lbd[-1]:
        s = rng.choice(lbd)
    while s.weekday() >= 5:
        s += timedelta(days=1)
    return s


def workflow(report_lines, submitted, report_seq):
    """Assign report id, status and timing measures to every line of a report."""
    first = min(l["TRANSACTION_DATE"] for l in report_lines)
    rid = f"ER-{first.year}-{report_seq:06d}"
    base = {"REPORT_ID": rid, "SUBMITTED_DATE": None, "APPROVAL_DAYS": None, "REIMBURSEMENT_DAYS": None,
            "DAYS_PENDING": None}

    if submitted > AS_OF:
        status = "Draft"
    else:
        base["SUBMITTED_DATE"] = submitted
        q_end = submitted.month in (3, 6, 9, 12) and submitted.day >= 20
        appr = rng.lognormvariate(math.log(2.1), 0.65) * (1.6 if q_end else 1.0)
        if (AS_OF - submitted).days < 70 and rng.random() < 0.06:
            appr = rng.uniform(18, 60)  # stuck in someone's queue
        approved_on = submitted + timedelta(days=appr)
        if (AS_OF - submitted).days < 25 and rng.random() < 0.05:
            status = "Returned"
        elif approved_on > AS_OF:
            status = "Pending Approval"
            base["DAYS_PENDING"] = (AS_OF - submitted).days
        else:
            base["APPROVAL_DAYS"] = round(appr, 1)
            reimb = rng.choice(range(2, 15))
            exported_on = approved_on + timedelta(days=rng.choice([1, 1, 2, 3]))
            has_oop = any(l["PAYMENT_METHOD"] == "Out-of-Pocket" for l in report_lines)
            if has_oop and approved_on + timedelta(days=reimb) <= AS_OF:
                status = "Reimbursed"
            elif exported_on <= AS_OF:
                status = "Exported"
            else:
                status = "Approved"
            if status == "Reimbursed":
                base["_reimb"] = reimb
    for l in report_lines:
        l.update({k: v for k, v in base.items() if k != "_reimb"})
        l["REPORT_STATUS"] = status
        if base.get("_reimb") and l["PAYMENT_METHOD"] == "Out-of-Pocket":
            l["REIMBURSEMENT_DAYS"] = base["_reimb"]


def generate():
    employees = build_people()
    lines = []
    trip_count = 0

    for emp in employees:
        trips_per_year = DEPARTMENTS[emp["dept"]][1] * emp["travel_mult"]
        busy_until = START - timedelta(days=1)
        for d in daterange(START, AS_OF):
            if d > busy_until and d not in HOLIDAYS:
                dow = [1.5, 1.4, 1.1, 0.8, 0.4, 0.05, 0.25][d.weekday()]
                p = trips_per_year / 260.0 * dow * season(d, emp["region"]) * growth(d)
                if rng.random() < p:
                    trip_count += 1
                    t_lines, busy_until = gen_trip(emp, d, trip_count)
                    lines.extend(t_lines)
                    continue
            if d > busy_until:
                lines.extend(gen_standalone(emp, d))

    lines = [l for l in lines if l["TRANSACTION_DATE"] <= AS_OF]  # trips still under way
    for l in lines:
        l["PAYMENT_METHOD"] = payment_method(l["EXPENSE_CATEGORY"], l["EXPENSE_AMOUNT_USD"])
        apply_policy(l, 1.0 + 1.3 * ramp(l["TRANSACTION_DATE"], 180))

    # duplicate submissions (same merchant + amount a day or two later)
    dups = []
    for l in rng.sample(lines, k=int(len(lines) * 0.006)):
        if l["EXPENSE_CATEGORY"] in ("Per Diem", "Lodging", "Software & Subscriptions"):
            continue
        dup = dict(l)
        dup["TRANSACTION_DATE"] = min(AS_OF, l["TRANSACTION_DATE"] + timedelta(days=rng.choice([0, 1, 2])))
        dup.update({"POLICY_FLAG": "Duplicate Suspected", "POLICY_STATUS": "Hard Violation",
                    "OUT_OF_POLICY_AMOUNT_USD": l["EXPENSE_AMOUNT_USD"], "VIOLATION_COUNT": 1, "RECEIPT_MISSING_FLAG": 0})
        dups.append(dup)
    lines.extend(dups)

    # group into reports: one per trip, one per employee-month for everything else
    reports = {}
    for l in lines:
        key = ("T", l["_trip"]) if l["_trip"] is not None else ("M", l["_emp"]["name"], l["TRANSACTION_DATE"].year, l["TRANSACTION_DATE"].month)
        reports.setdefault(key, []).append(l)
    ordered = sorted(reports.items(), key=lambda kv: min(x["TRANSACTION_DATE"] for x in kv[1]))
    for seq, (key, rl) in enumerate(ordered, start=1):
        last = max(x["TRANSACTION_DATE"] for x in rl)
        workflow(rl, submission_date(last, key[0] == "M"), seq)

    for l in lines:
        l["AUDIT_RISK_SCORE"] = risk_score(l)
        rate = VAT.get(l["COUNTRY"], 0.0)
        eligible = l["EXPENSE_CATEGORY"] in ("Lodging", "Meals & Entertainment", "Ground Transport", "Conferences & Training", "Office Supplies")
        l["VAT_RECLAIMABLE_USD"] = money(l["EXPENSE_AMOUNT_USD"] * rate / (1 + rate) * rng.uniform(0.7, 1.0)) if rate and eligible else 0.0

    lines.sort(key=lambda x: (x["TRANSACTION_DATE"], x["REPORT_ID"]))
    for i, l in enumerate(lines, start=1):
        l["EXPENSE_LINE_ID"] = f"EL-{i:07d}"
    return lines, trip_count, len(employees), len(reports)


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

COLUMNS = [  # (name, Snowflake type)
    ("EXPENSE_LINE_ID", "VARCHAR(16)"), ("REPORT_ID", "VARCHAR(20)"),
    ("TRANSACTION_DATE", "DATE"), ("SUBMITTED_DATE", "DATE"), ("REPORT_STATUS", "VARCHAR(32)"),
    ("EMPLOYEE_NAME", "VARCHAR(64)"), ("DEPARTMENT", "VARCHAR(64)"), ("COST_CENTER", "VARCHAR(96)"),
    ("APPROVER_NAME", "VARCHAR(64)"), ("REGION", "VARCHAR(32)"), ("COUNTRY", "VARCHAR(64)"),
    ("CITY", "VARCHAR(64)"), ("CURRENCY", "VARCHAR(8)"), ("EXPENSE_CATEGORY", "VARCHAR(64)"),
    ("MERCHANT", "VARCHAR(96)"), ("MCC_GROUP", "VARCHAR(64)"), ("PAYMENT_METHOD", "VARCHAR(32)"),
    ("POLICY_STATUS", "VARCHAR(32)"), ("POLICY_FLAG", "VARCHAR(64)"), ("PROJECT_CLIENT", "VARCHAR(96)"),
    ("EXPENSE_AMOUNT_USD", "NUMBER(12,2)"), ("OUT_OF_POLICY_AMOUNT_USD", "NUMBER(12,2)"),
    ("VIOLATION_COUNT", "NUMBER(4,0)"), ("RECEIPT_MISSING_FLAG", "NUMBER(1,0)"),
    ("APPROVAL_DAYS", "NUMBER(6,1)"), ("REIMBURSEMENT_DAYS", "NUMBER(4,0)"), ("DAYS_PENDING", "NUMBER(4,0)"),
    ("AUDIT_RISK_SCORE", "NUMBER(3,0)"), ("VAT_RECLAIMABLE_USD", "NUMBER(12,2)"),
    ("NEGOTIATED_RATE_USD", "NUMBER(10,2)"), ("MILES", "NUMBER(8,1)"),
]


def main(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    lines, trips, people, reports = generate()
    csv_path = out / f"{TABLE}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([c for c, _ in COLUMNS])
        for l in lines:
            w.writerow(["" if l.get(c) is None else l[c] for c, _ in COLUMNS])
    manifest = {"tables": [{
        "table_name": TABLE, "data_file": str(csv_path.resolve()),
        "columns": [{"name": c, "db_column_name": c, "type": t} for c, t in COLUMNS],
    }]}
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(json.dumps({"rows": len(lines), "employees": people, "trips": trips, "reports": reports, "csv": str(csv_path)}))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "out")
