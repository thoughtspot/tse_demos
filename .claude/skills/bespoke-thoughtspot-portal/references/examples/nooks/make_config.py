import json, os, sys, random
REP = sys.argv[1] if len(sys.argv) > 1 else 'STORYREP'
R = random.Random(11)
accts = ["Brightline Health","Corvana Systems","Northpeak Logistics","Lumen Ledger","Halcyon Bio","Vantera Cloud","Ridgeway Insurance","Quillstone Media","Atlas Freightworks","Cobalt Payroll","Meridian Robotics","Fernwood Retail","Stratus Security","Kinetic Labs","Bluehaven Hotels","Orchard Fintech","Pinecrest Energy","Tidewater Analytics","Granite HR","Nimbus Telecom","Solace Wellness","Ironclad Data","Sparrow Commerce","Evergreen Credit","Helix Diagnostics","Summit Learning","Vector Mobility","Aurora Payments","Copperleaf Foods","Driftwood Travel","Beacon Legal","Polaris Manufacturing","Zephyr Software","Maple & Main Bank","Keystone Realty","Lattice AI","Riverstone Capital","Waypoint Fleet","Crescent Pharma","Tandem Staffing"]
inds = ["Software","Fintech","Healthcare","Logistics","Manufacturing","Financial Services","Retail","Media","Security","Education"]
tiers = {}
ind = {}
for a in accts:
    ind[a] = [R.choice(inds)]
    tiers[a] = [R.choices(["Tier 1","Tier 2","Tier 3"],[25,40,35])[0]]
aw = {a: round(R.uniform(0.5, 3.0), 2) for a in accts}
seqs = {"Signal: Hiring Sales Team":"Nooks","Competitor Renewal Play":"Nooks","Inbound Speed to Lead":"Nooks","Job Change Play":"Nooks",
        "Enterprise Outbound Q4":"Outreach","RevOps Persona Cadence":"Outreach","Mid-Market Cold Call":"Salesloft",
        "Closed Lost Revival":"Salesloft","SMB Nurture Calls":"HubSpot","Webinar Follow-up":"HubSpot"}
seqw = {"Signal: Hiring Sales Team":"8*(0.3+1.4*ramp(150))","Competitor Renewal Play":"6","Inbound Speed to Lead":"8","Job Change Play":"5",
        "Enterprise Outbound Q4":"13","RevOps Persona Cadence":"8","Mid-Market Cold Call":"14","Closed Lost Revival":"7","SMB Nurture Calls":"12","Webinar Follow-up":"7"}
personas = {"Sales Leader":"Sales","RevOps Leader":"Revenue Operations","Marketing Leader":"Marketing","IT & Security":"IT","Finance Leader":"Finance","HR & People":"Human Resources","Founder / CEO":"Executive"}
pbase = {"Sales Leader":0.125,"RevOps Leader":0.08,"Marketing Leader":0.105,"IT & Security":0.07,"Finance Leader":0.09,"HR & People":0.135,"Founder / CEO":0.065}
signals = {"No Signal":60,"Hiring Sales Team":7,"Recent Funding":5,"Competitor Renewal":5,"Leadership Hire":4,"Webinar Attendee":4,"Asset Downloaded":4,"Prior Champion":3,"Timing Objection":2,"Announced Expansion":3,"20% Headcount Jump":3}
objs = {"Not Interested":28,"Send Me an Email":22,"Bad Timing":17,"Using a Competitor":"14*(1+0.6*ramp(240))","No Budget":11,"Not the Right Person":8}
ohand = {"Not Interested":0.42,"Send Me an Email":0.62,"Bad Timing":0.66,"Using a Competitor":0.5,"No Budget":0.45,"Not the Right Person":0.72}
first = ["Ava","Liam","Noah","Mia","Ethan","Zoe","Lucas","Chloe","Mason","Nora","Leo","Ruby","Owen","Ivy","Caleb","Maya","Jude","Lena","Felix","Iris","Theo","Elena","Adrian","Hazel"]
last = ["Patel","Nguyen","Brooks","Kim","Alvarez","Okafor","Schmidt","Rossi","Chen","Walsh","Haddad","Lopez","Turner","Sato","Hughes","Novak","Reyes","Bennett","Khan","Moreau"]
P = lambda d: json.dumps(d)
cfg = {
 "table": "NOOKS_CALLS", "seed": 20261027, "days": 730, "as_of": None,
 "id_column": "CALL_ID", "id_prefix": "CL-", "date_column": "CALL_DATE",
 "actors": {"count": 36, "label": "REP_NAME", "names": "people",
   "attributes": {"TEAM": {"weights": {"Enterprise SDR": 26, "Mid-Market SDR": 34, "SMB SDR": 24, "Inbound SDR": 16}},
                  "REP_TENURE": {"weights": {"0-3 months": 18, "3-12 months": 37, "1-2 years": 30, "2+ years": 15}}},
   "rate": 16.4, "rate_by": {"TEAM": {"Enterprise SDR": 0.8, "SMB SDR": 1.25, "Inbound SDR": 0.7}}, "rate_spread": 0.25},
 "calendar": {"growth_yoy": 0.10, "weekday": [1.12, 1.15, 1.12, 1.08, 0.9, 0.03, 0.02],
   "month": {"1": 1.08, "2": 1.05, "3": 1.06, "4": 1.0, "5": 1.0, "6": 0.95, "7": 0.86, "8": 0.85, "9": 1.06, "10": 1.08, "11": 1.0, "12": 0.72}, "holidays": "us"},
 "columns": [
  {"name": "TEAM_MANAGER", "map_from": "TEAM", "map": {"Enterprise SDR": ["Dana Whitfield"], "Mid-Market SDR": ["Marcus Lee"], "SMB SDR": ["Priya Raman"], "Inbound SDR": ["Jordan Ellis"]}},
  {"name": "CALL_HOUR", "expr": "weighted({8:6,9:12,10:15,11:14,12:7,13:9,14:12,15:12,16:9,17:4})"},
  {"name": "SEQUENCE_NAME", "expr": "weighted({" + ",".join("%r: %s" % (k, v) for k, v in seqw.items()) + "})"},
  {"name": "SEQUENCE_SOURCE", "map_from": "SEQUENCE_NAME", "map": {k: [v] for k, v in seqs.items()}},
  {"name": "ACCOUNT_NAME", "expr": "weighted(" + P(aw) + ")"},
  {"name": "ACCOUNT_INDUSTRY", "map_from": "ACCOUNT_NAME", "map": ind},
  {"name": "ACCOUNT_TIER", "map_from": "ACCOUNT_NAME", "map": tiers},
  {"name": "PROSPECT_PERSONA", "weights": {"Sales Leader": 24, "RevOps Leader": 16, "Marketing Leader": 15, "IT & Security": 12, "Finance Leader": 10, "HR & People": 11, "Founder / CEO": 12}},
  {"name": "PROSPECT_DEPARTMENT", "map_from": "PROSPECT_PERSONA", "map": {k: [v] for k, v in personas.items()}},
  {"name": "PROSPECT_SENIORITY", "expr": "'C-Level' if r['PROSPECT_PERSONA'] == 'Founder / CEO' else weighted({'VP': 22, 'Director': 34, 'Manager': 30, 'Individual Contributor': 14})"},
  {"name": "PROSPECT_TITLE", "expr": "pick(['CEO','Co-Founder','Founder & CEO']) if r['PROSPECT_SENIORITY'] == 'C-Level' else ({'VP':'VP of ','Director':'Director of ','Manager':'Manager, ','Individual Contributor':'Specialist, '}[r['PROSPECT_SENIORITY']] + r['PROSPECT_DEPARTMENT'])"},
  {"name": "PROSPECT_NAME", "expr": "pick(" + P(first) + ") + ' ' + pick(" + P(last) + ")"},
  {"name": "BUYING_SIGNAL", "expr": "weighted(" + P(signals) + ") if r['SEQUENCE_SOURCE'] == 'Nooks' or chance(0.25) else 'No Signal'"},
  {"name": "DIAL_MODE", "expr": "'Signal-Based Dialing' if (r['BUYING_SIGNAL'] != 'No Signal' and chance(0.15 + 0.7 * ramp(150))) else ('Parallel Dialer' if chance(0.72) else 'Single Dial')"},
  {"name": "P_CONNECT", "expr": "min(0.6, " + P(pbase) + "[r['PROSPECT_PERSONA']] * (1 + 1.5 * ramp(150) if r['PROSPECT_PERSONA'] == 'RevOps Leader' else 1) * (1.35 if r['DIAL_MODE'] == 'Signal-Based Dialing' else 1.0) * (1.15 if r['PROSPECT_SENIORITY'] in ('Manager','Individual Contributor') else 0.9 if r['PROSPECT_SENIORITY'] in ('VP','C-Level') else 1) * (1.1 if 10 <= r['CALL_HOUR'] <= 11 or 15 <= r['CALL_HOUR'] <= 16 else 0.95))"},
  {"name": "CONNECTED_FLAG", "expr": "1 if chance(r['P_CONNECT']) else 0"},
  {"name": "CONVERSATION_FLAG", "expr": "1 if r['CONNECTED_FLAG'] and chance(0.58 + (0.06 if r['REP_TENURE'] in ('1-2 years','2+ years') else 0)) else 0"},
  {"name": "OBJECTION_TYPE", "expr": "weighted({" + ",".join("%r: %s" % (k, v) for k, v in objs.items()) + "}) if r['CONVERSATION_FLAG'] and chance(0.72) else 'None'"},
  {"name": "OBJECTION_HANDLED_FLAG", "expr": "(1 if chance((0.17 - 0.1 * ramp(240)) if (r['REP_NAME'] == '" + REP + "' and r['OBJECTION_TYPE'] == 'Using a Competitor') else min(0.95, " + P(ohand) + "[r['OBJECTION_TYPE']] * (1.15 if r['REP_TENURE'] in ('1-2 years','2+ years') else 0.9 if r['REP_TENURE'] == '0-3 months' else 1))) else 0) if r['OBJECTION_TYPE'] != 'None' else None"},
  {"name": "MEETING_BOOKED_FLAG", "expr": "1 if r['CONVERSATION_FLAG'] and chance(0.30 if r['OBJECTION_TYPE'] == 'None' else 0.24 if r['OBJECTION_HANDLED_FLAG'] else 0.03) else 0"},
  {"name": "CALLBACK_REQUESTED_FLAG", "expr": "1 if (r['CONNECTED_FLAG'] and not r['MEETING_BOOKED_FLAG'] and chance(0.75 if r['OBJECTION_TYPE'] in ('Bad Timing','Send Me an Email') else 0.2)) else 0"},
  {"name": "CALLBACK_IN_DAYS", "expr": "int(weighted({1:20,2:18,3:14,5:14,7:14,10:8,14:8,21:4})) if r['CALLBACK_REQUESTED_FLAG'] else None"},
  {"name": "CALL_OUTCOME", "expr": "'Meeting Booked' if r['MEETING_BOOKED_FLAG'] else 'Conversation' if r['CONVERSATION_FLAG'] else 'Connected' if r['CONNECTED_FLAG'] else weighted({'No Answer': 55, 'Voicemail': 38, 'Bad Number': 7})"},
  {"name": "TALK_TIME_SEC", "expr": "int(lognorm(430, 0.35)) if r['MEETING_BOOKED_FLAG'] else int(lognorm(190, 0.5)) if r['CONVERSATION_FLAG'] else int(lognorm(35, 0.4)) if r['CONNECTED_FLAG'] else int(lognorm(24, 0.3)) if r['CALL_OUTCOME'] == 'Voicemail' else 0"},
  {"name": "CALL_SCORE", "expr": "int(min(100, max(20, (55 + (18 if r['MEETING_BOOKED_FLAG'] else 0) + (10 if r['OBJECTION_HANDLED_FLAG'] else -8 if r['OBJECTION_HANDLED_FLAG'] == 0 else 0) + uniform(-12, 14))))) if r['CONVERSATION_FLAG'] else None"}
 ],
 "groups": {"id_column": "TASK_ID", "id_prefix": "TK", "per": "event", "submitted_column": "TASK_DATE", "lag_days": [0, 0], "month_end_share": 0,
   "status_column": "CALLBACK_STATUS",
   "status_rules": [
     {"if": "not r['CALLBACK_REQUESTED_FLAG']", "status": "No Callback"},
     {"if": "r['CALLBACK_IN_DAYS'] - age > 0", "status": "Scheduled"},
     {"if": "r['CALLBACK_IN_DAYS'] - age == 0", "weights": {"Due Today": 80, "Completed": 20}},
     {"if": "r['CALLBACK_IN_DAYS'] - age >= -10", "weights": {"Overdue": 35, "Completed": 65}},
     {"weights": {"Completed": 88, "Missed": 12}}]},
 "post": [
  {"name": "CALLBACK_DUE_DATE", "expr": "(d + timedelta(days=r['CALLBACK_IN_DAYS'])) if r['CALLBACK_REQUESTED_FLAG'] else None"},
  {"name": "DAYS_OVERDUE", "expr": "(age - r['CALLBACK_IN_DAYS']) if r['CALLBACK_STATUS'] in ('Overdue','Due Today') else None"},
  {"name": "DIAL_COUNT", "expr": "1"}
 ],
 "types": {"CALL_ID": "VARCHAR(16)", "TASK_ID": "VARCHAR(20)", "CALL_HOUR": "NUMBER(2,0)", "P_CONNECT": "NUMBER(5,3)", "CONNECTED_FLAG": "NUMBER(1,0)", "CONVERSATION_FLAG": "NUMBER(1,0)", "OBJECTION_HANDLED_FLAG": "NUMBER(1,0)", "MEETING_BOOKED_FLAG": "NUMBER(1,0)", "CALLBACK_REQUESTED_FLAG": "NUMBER(1,0)", "CALLBACK_IN_DAYS": "NUMBER(3,0)", "TALK_TIME_SEC": "NUMBER(6,0)", "CALL_SCORE": "NUMBER(3,0)", "DAYS_OVERDUE": "NUMBER(4,0)", "DIAL_COUNT": "NUMBER(1,0)", "CALLBACK_DUE_DATE": "DATE"}
}
json.dump(cfg, open(os.path.expanduser('~/bespoke-portals/nooks/dataset-config.json'), 'w'), indent=1)
