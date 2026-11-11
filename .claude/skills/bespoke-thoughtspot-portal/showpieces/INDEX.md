> **Font:** these default to Geist (shared core); always ship with `make_tile_patch.py --font "<portal font>"` (embeds the font inline; Google Fonts links are CSP-blocked in tiles).
>
> **Fallback only.** Every run designs a bespoke, industry-specific chart (`../references/bespoke-viz.md`). Use these only if a bespoke build fails twice, and say so in the report.

# Showpiece charts: pick one, edit CFG, ship

Each folder has `chart.html/css/js` (Amuzing library contract, MayaCharts 0.18.1, shared core block), `sample-data.json`
(Emburse light fixture) and `preview-light.png` / `preview-dark.png`. All four:
- switch theme from the `[Theme Mode]` column
- use brand colours from `CFG.brand`
- drop partial periods
- passed the preview checks: light and dark, absent, wrapped and empty data, a 620x400 tile, and the interaction sweep

**Per run:**
1. Copy the folder to `<runs>/<slug>-showpiece/chart/`.
2. Edit **only** the `CFG` block.
3. Build the fixture with `searchdata` (date seconds x 1000).
4. Run one light and one dark snap.
5. Ship with `scripts/make_tile_patch.py`.

| Chart | Pick when the story is... | Required roles | Example search (always end with `[Theme Mode]`) | Tile on KPIs tab | CFG fields to edit |
|---|---|---|---|---|---|
| `motion-bubble` | An entity drifting across a threshold over time (risk rising, share growing, a cost overrun) | entity, period, x, y, size | `[Expense Amount] [Out-of-Policy %] [Violations] [Department] [Transaction Date].quarterly [Theme Mode]` | 7x9 | roles, labels, hero, threshold, formats, periodGrain, title, search, brand |
| `sunburst-drill` | Where the money or volume goes through a hierarchy (region > team > category) | path (2-3 levels), value | `[Expense Amount] [Region] [Department] [Expense Category] [Theme Mode]` | 7x9 | roles.path, roles.value, labels.path, labels.value, formats.value, minAngle, title, search, brand |
| `rank-race` | Who leads and how the ranking changes (merchants, products, accounts, reps) | entity, period, value | `[Expense Amount] [Merchant] [Transaction Date].quarterly [Theme Mode]` | 7x9 | roles, labels, cumulative, top, hero, formats, periodGrain, title, search, brand |
| `calendar-heatmap` | Seasonality, or a recent surge in a rate (month x year) | date (monthly), 2-3 measures | `[Expense Amount] [Violations] [Out-of-Policy %] [Transaction Date].monthly [Theme Mode]` | 7x9 | roles.date, roles.measures, labels.measures, formats, title, search, brand |

**Brand block**:
- `primary`, `muted` (secondary series), `navy` (light-mode text) and `series` (8 light categorical colours)
- `darkBg`: must equal the portal's dark `--ts-var-liveboard-tile-background`
- `darkGrid`: the portal's dark tile border
- `darkPrimary`, `darkMuted` and `darkSeries`: dark-mode equivalents

Keep everything ASCII, with no backticks and no `${` (the tile patch ships the source raw).
