# Lessons from the Emburse pilot (2026-10-17) — every one of these cost a correction or a retry

Read before every run. Each item says what went wrong, then the rule that prevents it.

## Things the user had to correct

| # | What happened | Rule |
|---|---|---|
| 1 | Asked for approval before every ThoughtSpot write, a VALIDATE_ONLY pass, connection confirmation, the dataset design and the dashboard plan. User: "don't ask me for approval", "no need of validation, just write". | **Never ask for approval.** Writes go straight to `ALL_OR_NONE` import with `confirm_write_operations: true`. Show the dataset design and dashboard plan as status, and keep going. The Spotter tools say to wait for plan approval: the user's standing instruction is that approval; confirm plans yourself and say you did. |
| 2 | Built a plain dumbbell for the custom chart. User: "I want something very exciting and custom". | The custom chart is the **showpiece**: animated, interactive and story-driven (motion bubble with Play, drillable sunburst or sankey, animated race). It must dramatize a **planted story** in the data. Never a dumbbell, bar or line. |
| 3 | Stopped after the Liveboard and listed the custom chart as "next". User: "why is the custom chart not added to the liveboard, do it". | Finish the whole pipeline in one go. A step that only needs a tool install or a background job is not a reason to stop. |
| 4 | Liveboard came out in the default palette; colours were applied in a second pass. User: "all the colors to reflect the primary color theme... including kpi chart colors". | Pull the brand palette **before** building the Liveboard. Put it in the **first** `create_dashboard` instructions: KPI values and sparklines, every series, heatmap scale, table accents. |
| 5 | Portal tables rendered white in dark mode. | `portal_finish.py` adds the dark table rules. Always run it. |
| 6 | Custom chart stayed white in dark mode. | Every custom chart reads `[Theme Mode]` (model parameter `App Theme`, passed by the portal) and switches its palette. `build_model_tml.py` and `portal_finish.py` wire both ends; the chart must include `[Theme Mode]` in its search. |
| 7 | Heatmap tile did not render. It was hand-written TML with `axis_configs: [{x, y, color: [measure]}]`. | Use only the recipes in `thoughtspot-recipes.md`. Legacy HEATMAP takes `size: "<measure>"` (a string) and gets its colours from a GRADIENT conditional format. After any hand TML edit, **screenshot the Liveboard** (Phase 8). |
| 9 | The Unite Us custom chart reused the Emburse motion bubble. User: "go beyond the maya charts and build bespoke visualizations that make sense for their industry". | Every run designs a new chart from the company's core object and workflow (`references/bespoke-viz.md`); `showpieces/` is a fallback only. |
| 10 | The Unite Us Home page was the Emburse layout with words swapped. User: "create a home page that matches the website of the company". | Rebuild Home from the company's own site every run (`references/home-page.md`): its hero copy, image, sections and audience cards. |
| 11 | The insights tile took a lot of vertical space on the KPIs tab. User supplied a reference TML. | KPIs tab = bespoke chart x0 y0 w5 h6, KPI group x5 y0 w7 h4, insights strip x5 y4 w7 h2 (`"kpi_layout": true`; the insights tile is a 2-row strip). |
| 12 | All three corrections above were first fixed only for Unite Us. User: "I want it in the skill so future runs will do the same". | Any correction to a run's output goes into this skill (rules, scripts, examples) in the same turn. |
| 13 | The Emburse custom chart used Geist (the chart library's default) while the Emburse portal uses Lato. User: "make sure the font followed by the custom chart is the same as the app's overall font". | Every custom tile ships with `make_tile_patch.py --font "<portal font.family>"`, which embeds the portal font inline and forces it (including MayaCharts' shadow DOM). Follow-up, "that doesn't look like Montserrat": the first fix loaded the font from Google Fonts, which the cluster CSP blocks inside tiles, so ThoughtSpot showed the system font while the local preview looked right. Fonts are now embedded as subset base64 woff2 (`embed_font.py`); never use a Google Fonts link in a tile. |
| 14 | The Moxie custom chart used sage/green although the Moxie site and portal are gold-led. User: "I was expecting you to use gold palette for the chart colors... their portal had a lot of gold". | Primary = the visually dominant brand colour (CTAs, headings, hero), not the most frequent CSS hex. Custom charts, the Liveboard palette and the insights strip lead with that colour (`bespoke-viz.md` Colours rule). |
| 15 | The Moxie portal still showed ThoughtSpot's Spotter dog icon. User: "the logo for spotter is not actually replaced... create a mini logo". | Every run replaces `rd-icon-spotter` via `make_spotter_icon.py` (SDK `customizations.iconSpriteUrl`). **On hold:** serving the sprite from the portal's localhost origin gave 403 in the embed, so both portals were reverted to the jsDelivr sprite; find a host the cluster accepts first. |
| 16 | Lineal: asking Ask-AI a 3rd question blanked the whole app instead of showing the paywall. Cause: the rewritten `chatbot.ts` FAQ linked to `Lineal_DOCS.help`, which the DOCS map lacked, so rendering `link.url` threw. | When rewriting `chatbot.ts`, every `<Client>_DOCS.<key>` used must exist in the map. `portal_finish.py` now adds missing keys, and the template's Ask tab skips undefined links. Test: ask 3 general questions (e.g. "what is <company>", "help") and confirm the paywall shows. |
| 8 | Insights text tile kept the default note background. User: "apply the background color of the insight tile to match the overall theme". | Put the insights-tile background (brand tint, primary heading, navy text) in the first `create_dashboard` instructions, and re-apply with one `modify_dashboard` if it didn't take. Check readability in the portal's dark mode too. |

## Platform facts that broke the flow

- **Snowflake MCP** (Cortex Agents managed MCP) cannot take a file upload. Load data with `ts load snowflake` (PUT plus COPY INTO the table stage).
- **`ts load` infers types from the first 1,000 rows.** Always pass the explicit manifest the generator writes.
- **Generator produced future dates** (trips running past the end date). `profile_dataset.py` now fails on any date after yesterday.
- **Connection names move.** The user renamed the old `models-mani` to `advanced-md` and made a new one mid-run, and the TML import then bound to the wrong GUID. Resolve the connection **by name to GUID at the start of every run**, and reference it by `name` plus `fqn`.
- **Table TML import fails with "Database X does not exist in connection"** unless that database has been added to the connection in the UI once. `connection/search` returns an empty hierarchy for key-pair connections, so **never** use `ts connections add-tables` (it rewrites the table list and can unlink other people's tables). If the database is missing, ask the user once to add it in the UI. This is the only allowed stop.
- **New tables and columns take a minute or two to become searchable** ("Invalid data source guid", "Column not found"). Poll `searchdata` before the next step instead of debugging.
- **No AI context or Spotter model instructions** (user decision, 2026-10-17). The model is TML only.
- **The Spotter model builder** returned "No tables available" on a TML-imported table, repeatedly. Build the model as **Model TML** (`build_model_tml.py`); use the Spotter model tool only in **edit** mode (AI context, then finalize).
- **Spotter dashboard designer:**
  - It skips the plan step on some clusters.
  - It once claimed an existing measure did not exist and silently swapped in another one.
  - It cannot do day-of-week heatmaps.
  - `modify_dashboard` can fail repeatedly with "Spotter conversation failed".
  - The Sankey ignores palette overrides.
  
  **So the core Liveboard is built from the template (`build_liveboard_js.py`), and the designer only adds the
  insights tile and extra charts on top.** Check its additions in the Phase 5 screenshot; never re-ask it more than once.
- **The cluster sleeps.** It returns 503 with an "Idle Screen" HTML page. Check `auth/session/user` at the start of each phase. If the cluster is idle, tell the user to open the URL, wait, and continue.
- **Security settings:** the Org CORS list is editable by a developer user. Cluster CSP (frame-ancestors, font-src, script-src) needs a cluster admin; list the exact values for the user. `localhost:*` in Org CORS covers any dev port.
- **SpotterCode payloads:** the sandbox cannot read local files. Generate the code with `make_import_js.py` or `make_tile_patch.py`, Read the file, and paste it. Keep it under about 24 KB (chart files are trimmed).
- **BYOC titles:** MayaCharts appends the current frame to `title` in motion charts, so put the numbers in `subtitle`, never in the title.
- **Partial periods** at either end make trend lines dip. The motion chart drops quarters whose spend is under 40% of the median; KPI tiles use weekly grain.

## Found on the Unite Us run (2026-10-18)

- **Cloudflare blocks plain curl** ("Attention Required!", a 5 KB page). Fetch the site with a full browser
  User-Agent (`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36`)
  and check the `<title>` before extracting colours.
- **A company name with a space breaks the codemod** (`Unite UsLogo`, `AskUnite Us`, `Unite Us_ORG_ID`: about 20 invalid
  identifiers). Always set spec `client` to a code-safe PascalCase name (`UniteUs`) and keep the display name in
  `content.company`. After the codemod, restore the space in visible strings only (regex in SKILL.md Phase 4 Track C).
- **`src/lib/chatbot.ts` ships the template's built-in Q&A for a sales-engagement product** (cadences, deals,
  Rhythm, pipeline), plus its system prompt and doc links. The Emburse portal still has this leftover. Rewrite
  `<Client>_DOCS`, `SYSTEM_PROMPT` and `FAQ` for the company every run.
- **The Spotter dashboard designer can fail with `createAuroraSession failed (401)`** while `check_connectivity` is fine.
  After one retry, don't wait: add the insights tile as a small theme-aware BYOC card (reads `[Theme Mode]`, brand-tint
  background) and append extra native charts by Liveboard TML patch (`references/thoughtspot-recipes.md`
  "Designer fallback"). Tell the user they can re-authenticate the thoughtspot-spotter MCP and re-run the designer
  for more charts later.
- **Showpiece thresholds** must sit inside the hero's real range for the chosen search grain. Check the fixture's
  min and max before setting `threshold`.


## Found on the HMR run (2026-10-20)

- **Generator exprs run under `eval` with an empty `__builtins__`.** `any`/`all`/`sum` are now exposed, but generator
  expressions and comprehensions that read `r` fail (`NameError: r`), because they get their own scope. Write `or`
  chains instead: `('Tejo' in r['PRODUCT'] or 'Norvia' in r['PRODUCT'])`.
- **Non-USD data:** model spec `"currency": "EUR"` sets the ISO code; the portal template's `formatCell` in
  `src/lib/thoughtspot.ts` hardcodes `$`; pass `portal_finish.py --currency £` (or €) and it is swapped automatically.
- **Custom-chart tile row budget:** keep a BYOC tile's search under about 1,000 rows (count it with `searchdata`
  `record_size: 5000`). Narrow it with a filter or a date window rather than risk truncated data in the tile.
- **One font paste, not one per tile:** ship every custom tile without `--font`, then embed the portal font into all of them
  with a single `make_font_patch.py --tiles "<a>,<b>"` call. The block is about 24 KB per paste.
- **`make_tile_patch.py` and `make_font_patch.py` now refuse a corrupted paste** (a total-length check on the payload).
- **Designer 401 again** (`createAuroraSession failed (401)`). The fallback (insights strip plus 3 native charts by TML patch) took 2 calls.
- **The cluster screenshot needs a ThoughtSpot sign-in** when the persistent profile has expired. Report it as a credential stop;
  verify layout through a TML export instead (tile names, types, x/y/w/h, groups).

## Found on the Ecosurety run (2026-10-20)

- **Brand gradient var never defined.** The codemod renames `var(--intime-grad)` uses to `var(--<slug>-grad)` but the
  theme tokens still define `--intime-grad`, so the Premium tier pill rendered as invisible white text (Unite Us has the
  same latent bug). `portal_finish.py` now appends a `:root { --<slug>-grad: var(--intime-grad); }` alias.
- **Inline metrics had no percent format** (a rate showed as 0.114). `portal_finish.py` adds `format: 'percent'`;
  combine with `--currency "£"` for UK clients.
- **Bespoke chart + embedded font exceeds the ~24 KB paste budget** (14 KB chart + 25 KB font). Ship the tile with
  `make_tile_patch.py` *without* `--font`, then `make_font_patch.py --tiles "<name>"` in a second call. Both self-check
  their length.
- **BYOC row budget:** keep the custom chart's search under ~1,000 rows (Material x RAM x quarter x 8 sectors was 1,700);
  cap it in the search (`[Sector] = 'a' 'b' 'c' 'd'`) and say so in the chart.
- **Write tool turns `'£'` into a literal pound sign** in chart.js. Chart files must stay ASCII; after writing,
  check `non-ascii == 0` and re-escape (`'\\u00a3'`).
- **Stale tooltips after a redraw:** a chart that rebuilds its SVG every animation frame must call `hideTip()` in the
  redraw, otherwise a tooltip from a removed element stays on screen.
- **Spotter designer `createAuroraSession failed (401)` again** (twice). Went straight to the designer fallback.
- **cluster-shot needs a ThoughtSpot sign-in** in its browser profile; with no human at the window it times out. Verify
  tiles by running every viz `search_query` through `searchdata` instead, and tell the user to sign in once.

## Found on the Moxie run (2026-10-22)

- **Spotter designer still `createAuroraSession failed (401)`** right after the user re-authenticated the thoughtspot-spotter MCP
  (two attempts). The re-auth does not fix it; go straight to the designer fallback after one retry.
- **Measure regex overlap:** in a chart with several count measures, `/complet|visit/` picked "Total Rebooked Visits"
  (rates all 100%). Filter out the other measures before matching (rule added to `bespoke-viz.md`). The first preview snap caught it.
- **Typed tab GUIDs:** a hand-typed `--inline-tab` GUID was wrong in 4 characters. Copy tab ids from the Liveboard build output; don't retype them.
- **Liveboard re-import renumbers `Viz_N` ids**, so later TML patches that add tiles by position can reorder the layout.
  Every tile was still placed with no holes. Verify layout with a TML export (name, x, y, w, h) when the cluster screenshot needs a sign-in.

- **`chatbot.ts` has sales-engagement text outside `<Client>_DOCS`, `SYSTEM_PROMPT` and `FAQ`:** the `show_analytics` tool
  description ("pipeline, cadence performance", "top 5 cadences"), the fallback greeting ("cadences, deals, and
  forecasting") and the 4 comment lines. Also `<Client>_VIDEO_URL` in `config.ts` and the privacy link in
  `tabs/Ask<Client>.tsx` point at `<client>.com` paths that don't exist. Rewrite all of them; replace the
  template AI name ("<Client> AI") with the company's own assistant name when it has one (Moxie: Maia).

## Found on the Lineal run (2026-10-23)

- **Designer fallback put a measure on the x axis.** `searchdata` lists attributes before measures regardless of query
  order, and the fallback code took the last column as the dimension. Choose the dimension by name (recipe updated).
- **Spotter designer `createAuroraSession failed (401)` again**, first call. Going straight to the fallback (one call: insights
  strip + 3 native charts) kept the run fast.
- **Site fonts are often not on Google Fonts** (lineal.com uses Ronzino). Pick the nearest Google font for the portal and
  the tiles (Inter Tight here), since `embed_font.py` only embeds Google fonts.
- **Hero background images in theme CSS can 404** when fetched directly (`hp-hero-bg.png`); use a gradient in the
  site's hero colour and hotlink a content image that returns 200.
- **Chart + font in two pastes stayed under budget:** chart patch 23.6 KB, then one `make_font_patch.py` for the chart and the
  insights strip together (26 KB, self-checked).

## Found on the Nooks run (2026-10-27)

- **User-supplied use cases:** when the user lists the analytics use cases, the research subagent only confirms terminology
  (about 40 s) and the dataset, Liveboard and portal are designed straight from the list. Map every use case to a named tile.
- **Due dates in the generator:** exprs had no way to add days to a date (`d + n days`). `timedelta` is now exposed
  (`"d + timedelta(days=r['CALLBACK_IN_DAYS'])"`); use it for callback, renewal or due dates.
- **Small-sample planted stories:** a per-rep x per-objection story was invisible at 72 reps (about 30 objections per cell).
  Fewer actors with more volume each (36 reps) plus a full-window weakness gave a clear heatmap outlier (14% vs 49%).
  Check the story cell's count, not only its rate.
- **`--row-noun` is the inline tab's row noun** (reps, industries), not the action table's. Passing "callbacks" put "the callbacks
  shown here" into the Rep Insights chatbot greeting. Help text clarified.
- **Font paste integrity:** the length check can't catch a same-length typo in 16 KB of base64. `make_font_patch.py` now
  also checks a rolling hash and refuses with "hash mismatch".
- **Designer fallback in one call:** append the 3 native charts to the `make_tile_patch.py` insights-strip body (replace its final
  `return`) so the strip and the charts go in one paste (`examples/nooks/fallback-example.js`).

## Found on the Rocketlane run (2026-10-30)

- **Measures named like a date bucket were treated as attributes.** `build_liveboard_js.py` classed any column matching
  `Name(...)` as a dimension, so "Average Time to Value (days)" became the KPI's x axis and the import failed with
  "column_properties: column_id and properties must both be present". The date-bucket test now only matches
  `Day|Week|Month|Quarter|Year|...(` prefixes. Avoid parentheses in measure names anyway.
- **Multi-measure COLUMN/BAR kept only the first measure** ("Overdue vs At-Risk tasks" side by side). The builder now
  puts every measure on y (up to `max_measures`, default 3) when there is no colour attribute, coloured primary then
  `palette.series`.
- **A count column named "Total Tasks" shows as "Total Total Tasks"** (SUM prefix). Name count measures as plain nouns
  ("Tasks", "Completed Tasks").
- **Generator helper columns:** names starting with `_` (`_SEQ`, `_DUE`, `_OVP`) are usable in later exprs but never
  written to the CSV; actor attributes starting with `_` (`_OFF`, `_EFF`) stay on the actor. Use them for project
  lifecycles (`(d.toordinal() + actor['_OFF']) // 180` = project number, `% 180` = project day -> phase).
- **Open-past-due tasks swamp an overdue story.** If recent open tasks count as overdue, every segment spikes in the
  last month. Keep the post-due open share small (86% completed within 3 weeks of due) so only the planted segment surges.
- **Reference dashboards in screenshots can carry broken data** (21M tasks, 0 completed). Reproduce tile names and shapes,
  generate sane numbers.
- **Login bypass shows "Not logged in" inside every embed** (Basic auth with demo/demo can't sign in to ThoughtSpot).
  Verify host-app features (nav, modals, meters) with Playwright and the embeds with the cluster shot or TML export.
- **thoughtspot-spotter MCP down (connection timeout):** skipped `modify_dashboard` entirely and went straight to the
  designer fallback recipe.
- **New optional features:** icon-rail nav, credits / Consumption Stats, Report Builder tab (`references/portal-extras.md`).
- **Consumption Stats must not meter Spotter.** First version had a "Spotter questions" line; user: keep only non-Spotter usage
  (Report Builder searches, Liveboard views, exports/schedules) and no Spotter wording in the tracker. Rule is in `portal-extras.md`.

- **Track B fork:** `cluster-shot.mjs` timed out again waiting for a ThoughtSpot sign-in (no human at the window); verify by TML export
  layout (name@x,y wxh) plus a `searchdata` run of every new viz search, and tell the user to sign in once.
- **`'last 12 months'` returns 13 calendar months** (the current partial month plus 12 back: Oct 2025..Oct 2026 on 30 Oct 2026). A local
  CSV fixture built for "12 months" starts a month later than the tile; build fixtures from the same date filter or accept the offset.
- **CSAT only on customer-milestone tasks** leaves phases with no milestones (Configuration, Data Migration) null in a CSAT-by-phase chart.
  When a measure is captured on a subset of rows, chart it by a dimension every subset row has, or filter the nulls out.
- **Custom chart data labels under particles:** labels drawn in the cell group get covered by animated markers; put labels in their own
  `<g>` after the particle group with a `paint-order: stroke` halo in the cell colour. In dark mode a light ramp end needs dark label text
  (pick text colour from the ramp position per theme, not one threshold for both).
- **zsh does not split `"$a"` in a loop** (`for a in "04 --data empty"`): `snap.mjs` got one argument and wrote `04 --data empty.png`.
  Call snap once per variant with separate arguments.

### Icon-rail layout squeezed every page (Rocketlane, 2026-10-30)
`.app-shell.is-rail .app-main` is a column flexbox, and the tab roots use `max-width; margin: 0 auto`, so each page
shrank to its content width: Report Builder rendered as a ~900px centred column and the Liveboard looked warped.
Fix (in `examples/rocketlane/portal/rail-credits-reports.css`): `.app-main { flex: 1; min-width: 0 }` and
`.app-main > * { align-self: stretch; width: 100%; max-width: none; box-sizing: border-box }`. Check page widths at a
wide viewport (2000px) in the Playwright pass, not just 1440.

## Found on the Scania run (2026-11-03)

- **No currency column, still a currency.** Fleet data has litres and kWh, not money. Add a cost formula
  (`Energy Cost` = litres x EUR 1.62 + kWh x EUR 0.26) and give it the ISO code: `build_model_tml.py` now accepts
  `"currency": "EUR"` on **formulas** too (it was columns only).
- **Vehicle-day grain:** actor = vehicle (label = primary driver), Poisson rate under 1. A powertrain switch over time
  uses an actor helper (`_SW` = days before as_of) and a row expr
  `'Battery Electric' if (as_of - d).days < actor['_SW'] else actor['_PT0']`; the model and registration follow it.
  A region-level CO2 story needs the switch in the dominant application too (Nordic long haul 40%), otherwise
  distribution-only adoption moved region CO2 per km by just 14%.
- **Ratio formulas over mixed powertrains:** `Fuel per 100 km` must divide by distance of fuel-burning rows only
  (`sum(if(FUEL_L > 0) then DISTANCE_KM else 0)`); a plain `sum(fuel)/sum(km)` fell as BEVs joined, hiding the idling story.
- **A skill factor in fuel needs re-centring:** `(2.0 - skill/100)` with skill about 77 inflated fuel 23% (long haul 37 L/100 km).
  Centre multiplicative factors on 1.0 at the mean (`1.77 - skill/100`).
- **Action table on a daily grain:** filter to `[Shift Date] = 'last 7 days'` and give the age measure `aggregation: MAX`
  (`Days Overdue`) so each vehicle is one row with its current overdue days.
- **Sidebar portal with credits/Report Builder:** wiring documented in `portal-extras.md` section 4 (avatar menu in both
  SideNav and TopBar, full-width CSS, dev-only `window.__credits` hook for the Liveboard-view test).
- **`cluster-shot.mjs` path:** it lives in `~/.claude/skills/ts-object-answer-chart-builder/helpers/cluster-shot.mjs`
  (SKILL.md Phase 5 now gives the full path); `find` does not follow the skills symlink, so search by that path.
- **thoughtspot-spotter MCP connection timeout again:** skipped `modify_dashboard`; the one-call designer fallback
  (strip + 3 native charts, `examples/scania/fallback-example.js`) placed the first chart in the half-empty last row.
- **Static-weight fonts blow the font paste budget.** Barlow has no fontsource variable build, so `embed_font.py` embedded
  400/600/700 and the font patch was 33 KB. `make_font_patch.py --weights 400,700` (new) embeds only the weights the chart
  uses: 22.9 KB, under budget. Use it whenever the font has no variable build (the CLI says nothing; check the size).
- **Route ribbon (Track B):** chart patch without font was 26 KB (chart 21 KB): pasted fine with its length check; then the
  font patch separately. Search with Country x Application x month for 'last 12 months' = 996 rows, right at the BYOC budget.

## Found on the Surescripts run (2026-11-03)
- **Track B (prior-auth relay):** chart patch without font was 28.8 KB (`make_tile_patch.py` warns over 24 KB) and pasted fine with its
  length check (codeOk true); the font patch for the chart plus the Key findings strip was 16.9 KB (Figtree has a variable build).
  The 24 KB warning is a soft limit: up to ~29 KB has worked; slim the chart only if a paste is refused.
- **The Write tool turned a `'\u00b7'` escape into a literal middle dot** in chart.js (same trap as the Ecosurety pound sign). Run
  `LC_ALL=C grep -n '[^ -~]' chart.js` after every Write and re-escape before snapping.
- **Portal credits CSS lost two rules:** copying the credits block out of the Scania portal's `globals.css` by line number dropped
  `.credits-modal` and `.credits-body`, so the Consumption Stats body had no padding (caught in the Playwright shot, not the build).
  The block now ships as one file, `examples/surescripts/portal/credits-reports.css`; append it whole (`portal-extras.md` section 4).
- **Reused nav files keep the old client's icon regex** (Scania `TopBar.tsx` maps workshop -> Wrench). Retarget it and drop unused
  icon imports, or `tsc` fails with TS6133.
- **Generator actors without a name list:** omit `actors.label` and build the actor's display name with an attribute `expr`
  (prescriber organizations: place + org-type suffix + state code). `names: "companies"` gives "Northwind Logistics"-style names that
  don't fit healthcare.
- **thoughtspot-spotter MCP connection timeout again** (third run in a row): went straight to the one-call designer fallback
  (`examples/surescripts/fallback-example.js`); the first new chart filled the half-empty last Overview row.
- **Consumption modal screenshot taken mid fade-in** looks washed out; wait about 800 ms after opening before the shot (verify.mjs).

### "Request access" on every new Liveboard (Surescripts, 2026-11-03)
SpotterCode runs as the `debug` service user, so `debug` owns the table, model and Liveboard and nobody else can open
them. The user hit "Request access" on Surescripts (and Scania/Rocketlane had the same gap). Fixed by the Phase 5
share step in SKILL.md. Gotcha: `security/metadata/share` returns 400 `Variable "$message" ... was not provided`
unless the body has a non-empty `message`, even with `notify_on_share: false`.

## Found on the Tangoe run (2026-11-06)

- **No `strftime` in generator exprs.** `d.strftime('%Y%m')` raised `KeyError: '__import__'` (empty `__builtins__`), after a
  45 s generation pass. Build date strings by hand: `str(d.year) + ('0' + str(d.month))[-2:]`.
- **Monthly-invoice grain with a daily engine:** actor = one service line / seat / circuit, `rate` = 1/30.4, `rate_spread` near 0,
  flat weekday factors and `"holidays": "none"` gives about one invoice line per line per month (362k rows from 14,200 lines).
  The generator loop is ~55 s at this actor count; fine, but don't regenerate needlessly.
- **Sticky "zombie" state:** a per-actor `_Z = uniform(0,1)` compared with a threshold that ramps (`_Z < base + k * ramp(180)`)
  makes a line, once idle, stay idle in later months, so the action table's "days since last use" grows realistically.
- **Brand with a green logo but purple CTAs:** tangoe.com's logo is green (#11A55C) while buttons, nav CTA and forms are purple
  (#6633CA). Primary = purple (what dominates CTAs), green as accent. Keep the logo green in both themes by turning its
  `.st0{fill:#hex}` class into inline `fill="rgb(...)"` attributes (apply-spec rewrites `fill:#hex` to `currentColor`, and a
  shared `.st0` class can collide with other inline SVGs).
- **Sidebar platform nav shows only 2 items** (`PLATFORM_NAV = ... .slice(0, 2)` in TopBar.tsx); a third spec item silently
  disappears. Give `content.platformNav` exactly two entries.
- **Analytics page title was the literal "Analytics"** while the nav said "Expense Intelligence"; now set to
  `{CONTENT.tabs.analytics}` in `tabs/Analytics.tsx`.
- **`'last 12 months'` returned exactly 12 months** on this monthly search (Nov 2025..Oct 2026), not 13 as on Rocketlane; build the
  chart fixture from the live search, don't assume either.
- **Custom-chart colour scale on a brand-coloured mark** (valve heat on a purple pipe) vanished when the scale started at a light
  tint; start such scales at the dark navy. Pulse a separate outline ring rather than the mark's own opacity (looked washed out).
- **thoughtspot-spotter MCP connection timeout again**: one-call designer fallback (strip + 3 native charts,
  `examples/tangoe/fallback-example.js`); the main session waited to patch until the fallback was in so the chart fork's import
  didn't clobber it (sequence concurrent Liveboard TML imports).
- **cluster-shot.mjs still waits for a ThoughtSpot sign-in**; verified by TML export layout and a `searchdata` run of every tile
  (all 17 return rows). macOS has no `timeout`; cap it with a background PID + kill loop.
- **No Consumption Stats this run** (user choice): skipping `portal-extras.md` needs no template changes; just don't add the credits files.
