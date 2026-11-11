---
name: bespoke-thoughtspot-portal
description: One-shot builder for a bespoke ThoughtSpot demo portal for a named company, from just its website. Researches the analytics that company gives its own customers, generates a realistic 2-year daily dataset with planted stories, loads it to Snowflake, registers it in ThoughtSpot, builds a Spotter-enabled Model, a brand-coloured Liveboard (KPIs, sankey, heatmap, action table, KPIs tab with themed insights), an animated theme-aware custom chart, and a white-labelled portal app via rebrand-thoughtspot-portal. Use when someone says "build a bespoke portal for <company>", "/bespoke-thoughtspot-portal acme.com", "make a custom demo with real-looking data for <company>", or wants the whole data-to-portal pipeline. Not for skinning a portal on existing content (use rebrand-thoughtspot-portal) or one-off charts.
---

# Bespoke ThoughtSpot portal: company website in, working demo portal out

**Input:** a company website (or name). Optional plain-language overrides after it:
`/bespoke-thoughtspot-portal emburse.com`, or `... emburse.com, dark theme, top nav, no paywall`.

**Run the whole pipeline without stopping.** Don't ask for approvals, plan confirmations, validate-only passes or
"shall I continue". State choices in short status lines and keep going. The only allowed stops are listed in
**When to stop** at the end. Read `references/lessons.md` first, every run.

**Speed is a feature.** Everything below is ordered so slow steps overlap. Target: about 15–20 minutes of wall time.
Don't serialise steps the flow marks as parallel. Don't loop on things the scripts already verify.

## Phase 0: defaults (no questions unless something is missing)

Read `~/.claude/bespoke-portal-defaults.json` (first run on a new machine: copy `bespoke-portal-defaults.example.json` from this skill there and fill it in):
- **thoughtspot:** host, org, connection_name
- **snowflake:** profile, database, schema
- **workspace**
- **portal:** auth, navLayout, askMode, monetize, tiers, pinning, home, themeDefault, devPort
- **data:** history_days, target_rows

If something is missing, ask for only that, in **one** message, then save it. Apply invocation overrides for this run only.

Derive and state in one line:
- `slug`, table `<SLUG>_<GRAIN>`
- run folder `<workspace>/<slug>/`, portal `<workspace>/<slug>-tse/`
- as-of = yesterday

## Phase 1: kick-off (ONE turn, all in parallel)

1. **Research subagent** (background `general-purpose`), briefed per `references/data-design.md` §1.
2. **Brand pull** (Bash, with a full browser User-Agent; plain curl hits Cloudflare): homepage HTML and CSS → palette (primary = the brand colour that **visually dominates** the site: CTAs, headings, hero accents; not just the most frequent hex in the CSS. Moxie's was gold, not the sage that appears more often; navy, a light tint,
   a 4-step ramp light → primary → dark), font (Google font, or the nearest one), header logo SVG (change icon fills to
   `fill:rgb(...)` so only the wordmark follows the theme).
3. **SpotterCode preflight** (recipe "Preflight"): the cluster is awake (if idle, tell the user now to open the host URL,
   so it's up by Phase 3), the Org matches, the connection resolves **by name** to a GUID and account. Also check
   `thoughtspot-spotter` `list_orgs` shows the same active Org.
4. **Snowflake check:** Keychain password → env, then `SELECT CURRENT_ACCOUNT()` via the ts CLI's Python
   (`~/.local/share/uv/tools/thoughtspot-cli/bin/python`). The account must equal the connection's.
5. **Tooling:** `export PATH="$HOME/.node/bin:$HOME/.local/bin:$PATH"`; run the chart skill doctor and, if needed, its
   `fix:` line, without asking.

## Phase 2: data, by config not code (about 2 minutes)

When the research lands, write `<run>/dataset-config.json` for `scripts/generate_dataset.py`. Copy the structure of
`references/examples/emburse/dataset-config.json` and change the domain (actors, hierarchies, categories, amounts,
workflow, statuses). Put the **two planted stories** in expressions with `ramp(days)`.

```
python3 scripts/generate_dataset.py <run>/dataset-config.json <run>/out          # seconds, not minutes
python3 scripts/profile_dataset.py <run>/out/<TABLE>.csv --date <col> --amount <col> --dims <a,b,c>   # must print OK
```

Tune `actors.rate` toward `target_rows`. Check both stories with a 10-line pandas-free script, by period. Re-run until
OK; each run takes seconds. Write `<run>/model-spec.json` (format: `examples/emburse/model-spec.json`). Post a
6-line design summary as status and **continue**.

## Phase 3: load, register, model (about 3 minutes)

1. `ts load snowflake --source <run>/out/manifest.json --profile <p> --database <db> --schema <s> --if-exists replace`.
2. `scripts/build_table_tml.py` → `scripts/make_import_js.py` → Read → paste into `execute-thoughtspot-code`
   (`confirm_write_operations: true`).
   - "Database ... does not exist in connection" is the one setup stop: the user adds `<db>.<schema>` to the connection
     in the UI once, then you re-import.
   - Never use `ts connections add-tables`.
3. Poll until searchable (recipe), then `scripts/build_model_tml.py` → `make_import_js.py` → paste. The model gets
   friendly names, synonyms, formulas with % formats, Spotter enabled, and the `App Theme` / `Theme Mode` theme pair.
   **No AI-context or Spotter-instruction step**: the user doesn't want it, so skip the Spotter model tool entirely.
4. Poll until the model is searchable. Check the formulas and both stories through `searchdata` in **one** call.

## Phase 4: three tracks in parallel (the big time saver)

As soon as the model is searchable, start all three in the **same turn**.

**Track A: core Liveboard from the template (about 1 minute), then Spotter extras (about 5 minutes, in the background)**
1. Write `<run>/liveboard-spec.json` (format: `examples/emburse/liveboard-spec.json`), with the brand palette and
   ramp, and these tabs:
   - **Overview:** 4 KPI charts (weekly), a sankey (3 attributes), a heatmap (a rate by 2 attributes), the 6-column
     action TABLE (`"action": true`, filtered to the actionable status, sorted by age), and one BAR or LINE per
     planted story.
   - **KPIs:** 2 KPI charts with `"kpi_layout": true`. This is the user's standard KPIs tab, from their reference TML:
     bespoke chart at x0 y0 w5 h6, KPI group at x5 y0 w7 h4, insights strip at x5 y4 w7 h2. The tab is 6 rows tall in total.
2. `scripts/build_liveboard_js.py <spec> <run>/liveboard.js` → Read → paste. It returns the Liveboard guid, the tab
   ids and the `actionViz` GUID. The template uses only tested tile shapes, so no TML audit is needed for these tiles.
3. Immediately call `modify_dashboard` on it (background; poll `get_dashboard_status` between other work):
   ```
   Keep every existing tile exactly as it is. Add: (1) on the KPIs tab, one compact insights tile (a 2-row strip, at
   most two one-line findings with numbers about <story 1> and <story 2>) placed at x 5, y 4, width 7, height 2, directly
   under the KPI group; set its background to the brand tint <tint> with headings in <primary> and body text <navy> to
   match the theme. Do not let it grow taller than 2 rows. (2) On the Overview tab,
   3 more charts that fit <industry>: <3 ideas from research>. Use the brand palette <primary>, <c2>, <c3>, ... on them.
   ```
   If it returns `needs_input`, answer on the user's behalf. If it fails (e.g. `createAuroraSession failed (401)`),
   retry once, then use the **designer fallback** recipe: the insights strip from `examples/unite-us/insights-strip/`
   (`make_tile_patch.py --x 5 --y 4 --w 7 --h 2 --font "<portal font.family>"`) plus 3 native charts appended by TML patch. Never leave the KPIs tab without its insights tile.

**Track B: bespoke showpiece (about 10 minutes)** (fork subagent, or do it inline if forking isn't available)
- **Design a new visualization for this company's industry and use case.** Follow `references/bespoke-viz.md`: name the
  core object and workflow, then pick the metaphor (shift calendar for time tracking, closed-loop ring for referrals,
  receipt pipeline for expenses, and so on). Don't reuse `showpieces/` or a previous run's chart. They're references only.
- Hand-write SVG or Canvas JS per the contract in that file. It must:
  - be theme-aware via `[Theme Mode]`, with the measure detected by schema type
  - use dropdown filters and hover on every mark
  - include one motion or drill that tells planted story 1
  - fit 520 × 460 px
  - use **the portal's font** (the portal spec's `font.family`) in every text element. Write it into the chart, and
    always ship with `make_tile_patch.py --font "<family>"`. It **embeds** the font inline (subset base64 woff2 via
    `embed_font.py`, about 25 KB), strips any Google Fonts `<link>`, and forces `font-family` plus MayaCharts `--maya-font`.
    Never rely on a Google Fonts link: the cluster CSP blocks it inside tiles, so the tile silently falls back to the
    system font even though the local preview looks right. To fix the font on tiles already on a Liveboard:
    `make_font_patch.py --liveboard <guid> --tiles "<name>,<name>" --font "<family>"` → paste (it checks its own length).
- Fixture from the CSV (or `searchdata`). Check light and dark snaps, absent, wrapped and empty data, 420 × 380 and
  900 × 500, and hover.
- When Track A has the Liveboard guid: `scripts/make_tile_patch.py --tab KPIs --x 0 --y 0 --w 5 --h 6 --font "<portal font.family>" ...` → paste.
  It must return `codeOk: true`. Save the chart under `references/examples/<slug>/bespoke-<name>/`.

**Track C: portal (about 3 minutes)** (starts when Track A returns its ids)
1. Copy `examples/emburse/portal-spec.json` to `<workspace>/<slug>-spec.json` and replace (set `client` to a
   **code-safe PascalCase** name such as `UniteUs`; the display name lives in `content.company`):
   - client, slug, host, ids (all Liveboard slots = our Liveboard; actionViz; model), action, columns
   - font and logo, theme tokens (light and dark), the RHS of the swap arrays
   - features from defaults, and all `content` in the company's voice (landing stats from real data)
2. `node ~/.claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs <spec>`.
3. `scripts/portal_finish.py <app> --analytics-tab <Overview id> --inline-tab <KPIs id> --row-noun "<plural>" --premium-feature "<...>" --currency "<symbol>"` (omit for USD).
4. Replace `BidModal.tsx` with an industry review screen adapted from `examples/emburse/ReviewReportModal.tsx`, wire it
   in `tabs/Capacity.tsx`, and append its `.review-decision*` CSS.
   **Home page: rebuild `tabs/Landing.tsx` from the company's own website** per `references/home-page.md`, as a
   parallel worker. Use the site's hero copy, image, sections and audience cards, check light and dark screenshots,
   and never reuse the previous client's Landing.
   Fix leftover template words (carrier, lane, freight, bid, Northwind). If the display name differs from `client`,
   restore it in visible strings: `re.sub(r"(?<![A-Za-z<])(?<!Ask)<Client>(?=[ \u2019'.,!?:])", "<Display Name>", ...)` over
   `src/**/*.ts*` and `index.html`. **Rewrite `src/lib/chatbot.ts`** (`<Client>_DOCS`, `SYSTEM_PROMPT`, `FAQ`) for the
   company: it ships with a sales-engagement Q&A.
   **Spotter icon: ON HOLD, skip this step.** Serving the sprite from the portal's localhost origin returned 403 inside
   the embed (2026-10-22); the hosting approach is still to be worked out. When resumed: replace the dog with a mini mark of the client's logo:
   `scripts/make_spotter_icon.py <app> <logo.svg> --color "<primary>" [--xmax <x of the monogram's right edge>]`.
   Render the sprite once and check it reads as the brand mark.
   **Optional extras** (`references/portal-extras.md`): when the user gives a product screenshot with an icon rail,
   or asks for credits/consumption metering or a standalone report builder, drop in the icon-rail nav
   (`navLayout: 'rail'`, dark hover flyouts, breadcrumb strip), the credits store with the Consumption Stats modal
   (avatar menu + Liveboard-level custom action) and the Report Builder tab with its credit meter, from
   `examples/rocketlane/portal/`.
   **Reference dashboard metrics:** when the user shares a screenshot of the client's own dashboard, reproduce its
   tiles by name (KPI titles, table columns, comparison charts) with sane data, never the screenshot's broken numbers.
5. **Build once**, after all edits: `npm run build` (fix and rebuild only on errors). Then `npm run dev -- --port <devPort>`
   in the background, and one Playwright screenshot of the login page.

## Phase 5: verify (one pass)

- **Screenshot the Liveboard:** `node ~/.claude/skills/ts-object-answer-chart-builder/helpers/cluster-shot.mjs --url "https://<host>/#/pinboard/<lb>" --name <slug> --out <run>/shots --wait 12`.
  It uses a persistent sign-in profile, so after the first ever run there's no sign-in. Read each tab's PNG, plus the
  `rendered=N of M` and `problems` lines. Fix only failing tiles with the recipes. Check the insights tile looks
  themed. If the designer extras are still running, shoot once they finish.
- **Share with the person running the build:** SpotterCode signs in as a service user (`debug`), which owns every
  object it creates, so the user sees "Request access" until it's shared. Share the table(s), the model and the
  Liveboard with the user's own login (`MODIFY`) in one call, `confirm_write_operations: true`:
  `POST /api/rest/2.0/security/metadata/share` with `metadata_type`, `metadata_identifiers`,
  `permissions: [{ principal: { identifier: '<user email>', type: 'USER' }, share_mode: 'MODIFY' }]`,
  `notify_on_share: false` and a non-empty `message` (the call 400s without it). Check with `fetch-permissions`.
- **Org CORS:** merge `localhost:<port>` into the Org CORS list if it isn't already covered. List the CSP values for
  a cluster admin.

## Report

Links first (Liveboard, portal), then:
- the dataset (rows, window, the two stories with numbers)
- what was verified, and what the user must do (sign in, CSP)
- anything that didn't work, plainly

## When to stop (the only reasons)

1. A Phase 0 default is missing (one message).
2. The database isn't on the connection (Phase 3).
3. The cluster is idle after the data phases are done.
4. A credential is needed (Keychain password, or a ThoughtSpot sign-in for screenshots). Give the step; never ask for
   the secret.

## Files

- **`scripts/`:**
  - `generate_dataset.py`: config-driven data engine (about 8 s for 350k rows)
  - `profile_dataset.py`: data checks
  - `build_table_tml.py`, `build_model_tml.py`: table and model definitions
  - `make_import_js.py`: packages a definition for a SpotterCode import
  - `build_liveboard_js.py`: core Liveboard in one call
  - `make_tile_patch.py`: adds or updates the custom chart tile (`--font` embeds the portal font)
  - `embed_font.py`: inline subset `@font-face` for a Google font (CSP-safe)
  - `make_font_patch.py`: embeds the portal font into existing custom tiles on a Liveboard
  - `portal_finish.py`: portal fixes
  - `make_spotter_icon.py`: replaces the Spotter (dog) icon with the client's mini logo
- **`showpieces/`:** 4 generic theme-aware charts. **Reference and fallback only**; every run designs a bespoke chart
  (`references/bespoke-viz.md`).
- **`references/`:**
  - `lessons.md`: read first
  - `bespoke-viz.md`: industry metaphors and the custom-chart contract
  - `home-page.md`: rebuilding Home from the company's site
  - `thoughtspot-recipes.md`
  - `data-design.md`
  - `examples/emburse/`: dataset config, model spec, Liveboard spec, portal spec, review modal, and the original
    generator for reference
  - `examples/unite-us/`: dataset config, specs, the bespoke closed-loop chart, the site-matched Home page, the
    insights strip, and the Manage Referral modal
  - `examples/lineal/`: eDiscovery run: dataset config, specs, the bespoke cull-cascade chart, the site-matched Home page, the
    insights strip, and the Privilege Review modal
  - `examples/nooks/`: sales-dialer run from user-supplied use cases: config builder (`make_config.py`), specs, the bespoke
    persona dial-lanes chart, the site-matched Home page, the insights strip, and the Schedule Callback modal
  - `examples/rocketlane/`: PSA / customer-onboarding run from a product screenshot: dataset config (task grain, project
    lifecycle from an actor offset, hidden `_` helper columns), specs, the bespoke onboarding-runway chart, the site-matched
    Home page, the insights strip, the Escalate Task modal, and `portal/` (icon-rail nav, credits + Consumption Stats,
    Report Builder, CSS, Playwright verify script)
  - `references/portal-extras.md`: optional icon-rail nav, credits / Consumption Stats, Report Builder tab
  - `examples/scania/`: fleet / connected-vehicle run (vehicle-shift grain, BEV switch over time, EUR cost formula), specs,
    the bespoke route-ribbon chart, the site-matched Home page, the insights strip, the Book Workshop Visit modal, and the
    sidebar-layout credits + Report Builder wiring with its Playwright `verify.mjs`
  - `examples/ecosurety/`: UK/GBP run: dataset config, specs, the bespoke RAM sorting-line chart, the site-matched
    Home page, the insights strip, and the Resolve Data Issue modal
  - `examples/surescripts/`: health-information-network run (network-transaction grain, actor names from an expr, ePA and RTPB
    stories), specs, the bespoke prior-auth relay chart, the site-matched Home page, the insights strip + one-call fallback, the
    Escalate Prior Auth modal, `portal/credits-reports.css` (append whole for credits + Report Builder) and `verify.mjs`
