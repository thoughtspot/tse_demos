# Portal intake (plain English)

> **Machine-readable twin:** `intake.questions.json` in this directory carries the
> same tree with `specPath` mappings, types, defaults and `when` conditions. The
> AgentQ site worker serves it over MCP (`get_intake_questions`) so a headless
> caller asks exactly what this document asks. **Edit both together** — the prose
> here is what a human reads; the JSON is the contract a caller consumes.

Answer what you can — anything skipped uses a sensible default, and the assistant
will ask follow-ups. No technical knowledge needed; just paste the values.

## 0. How deep?
- **Basic** (quick demo: dashboards + Spotter + Ask-AI + theme) or **Advanced**
  (full build)? If Basic, sections 3, 4 and 6 are skipped.

## 1. Brand
- Company name:
- Name for the AI assistant (default "Ask <Company> AI"):
- One line on what the company does:
- Website URL:
- **Logo** — attach an SVG (preferred) or PNG. No logo? Say "generate one".

## 2. Your ThoughtSpot data & filters
- ThoughtSpot URL (e.g. `your-co.thoughtspot.cloud`):
- Main dashboard (liveboard) — paste its GUID:
- Data model / worksheet — paste its GUID:
- Sign-in: (a) rely on being logged into ThoughtSpot in another tab · (b) type real credentials · (c) advanced/trusted
- Which fields should filter the main dashboard (e.g. Region, Corridor)?
- A date field to filter by?

## 3. Inline-insights list tab?  (a table of items, each opening its own dashboard)
- Want it? yes / no
- If yes → dashboard (liveboard) GUID to open inline · tab name · the column of item
  names (e.g. Carrier, Process) · up to 3 numbers to show per row.

## 4. Custom-action workflow?  (right-click a chart row → run a Triumph-style action)  — OPTIONAL
- Want it? yes / no  (if no, we skip this entirely)
- If yes → visualization GUID + the dashboard it lives on · action label (e.g.
  "Request Bid") · describe what should happen on click and which row details pre-fill it · tab name.

## 5. Ask-AI
- Which style: (a) standalone Spotter · (b) fancy chat experience · (c) both
- Floating chatbot in the bottom-right corner? yes / no
- Paywall/monetization popup? yes / no — if yes, after how many questions?
- Premium vs Basic users? yes / no — if yes, what should Basic NOT be able to do
  (drill-down, Ask AI, downloads, …)?

## 6. Pinning / "Add Report"
- Want the "Add Report" feature — build a chart in-app and pin it to the dashboard? yes / no
  (Heads-up: the Report Builder doesn't render well in **dark** mode — light theme recommended if you enable it.)

## 7. Look & feel
- **Attach a screenshot of the brand's site** and/or its URL (colors are taken from it).
- Light, dark, or both? Which is the default?
- Fonts (title vs body), if specific.
- Primary color, and any specific asks (gradients, hues, "make the titles/KPIs pop").

_The app is built and run **locally** by default — ask afterward if you want it deployed to a public URL._
