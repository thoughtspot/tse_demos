# Designing a realistic demo dataset from a company's website

Worked example: `examples/emburse/dataset-config.json`, run by `scripts/generate_dataset.py` (about 8 s for 350k rows).
Write a config, not a generator script. The engine's docstring is the config reference.
(`examples/emburse/generate_expense_lines.py` is the original hand-written generator, kept only for reference.)

## 1. Research (one background subagent, about 2 minutes)

Brief a `general-purpose` subagent to find **the analytics the company gives its own customers**, not the company's
financials:
- WebSearch: `"<company> analytics"`, `"<company> reporting"`, `"<company> dashboards"`, `"<company> KPIs"`,
  `"<company> help center reports"`.
- WebFetch: the product's analytics or reporting page, help-center report lists, release notes, press releases about
  analytics launches.
- Help centers often return 403. Search-result snippets are fine; say which facts came from snippets.

Ask it to return:
- product lines and the industries they serve
- named dashboards and KPIs, each with its source URL
- the dimensions customers slice by
- a recommended single wide fact table: grain, 12–20 dimensions with example values and cardinalities, 8–12 measures
  with realistic ranges and relationships
- seasonality for that industry
- 2 or 3 custom chart ideas
- a 6-column actionable table with 3 or 4 custom actions

## 2. Smart defaults (don't ask; state them)

- **Grain:** the most atomic business event the company's product records: one expense line, one order line, one
  shipment, one claim, one ticket. A row-level grain keeps averages honest and gives the action table a real ID to act on.
- **Window:** `history_days` (730) ending **yesterday**; nothing dated after yesterday.
- **Volume:** `target_rows` (about 350k). Hit it by scaling the **entity count** (employees, stores, accounts), not by
  making each entity unrealistically busy.
- **Shape:** one wide table. The model builder, Spotter and the dashboard designer are most reliable on a single table.
- **Entities:** realistic names (real merchant or brand names are fine as dimension values), fictional customers or
  clients, a seeded random generator, and consistent hierarchies (region > country > city, department > cost center).
- **Columns:** UPPER_SNAKE in Snowflake; friendly names and synonyms live in the model spec. Amounts are NUMBER(12,2), counts NUMBER(p,0).

## 3. Realism checklist (build each in)

- Trend: +8–12% YoY.
- Seasonality: monthly factors for the industry, holidays, and weekday vs weekend share (85–90% weekday for B2B).
- Workflow timing: submission or approval spikes at month-end and quarter-end; statuses that depend on age relative
  to the as-of date (old work closed, recent work pending, a few stuck items for the action table).
- Correlated measures: totals made from parts, rates within believable bands, risk scores rising with violations.
- Skewed mixes: a few big departments, regions or merchants and a long tail.
- **Two planted stories** the Liveboard and the custom chart can dramatize, for example "hotel rates in 2 cities
  drifting 20% above the negotiated rate over the last 9 months" or "one department's violation rate climbing over
  the last 2 quarters". Make them end in the latest full period so they show on "now".

## 4. Verify before loading

`scripts/profile_dataset.py <csv> --date <col> --amount <col> --dims <a,b,c>` must print OK. Then a 10-line check that
prints each planted story by period (see `check_patterns.py` for the idea). Tune `actors.rate`, weights and story
expressions, then regenerate; each cycle takes seconds.

## 5. Model spec

Write `model-spec.json` next to the data. For each column give: db name, friendly name, ATTRIBUTE or MEASURE,
aggregation (SUM for amounts and counts, AVERAGE for durations, scores and rates), currency, a description and 2–4
synonyms. Add 3–5 formulas the Liveboard needs (ratio KPIs like `sum(a)/sum(b)` with `format: "0.0%"`, unique counts of the
ID). Keep `theme_parameter: true`. No AI context or Spotter instructions: the user doesn't want them.
