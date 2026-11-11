# Optional portal extras: icon-rail nav, credits / Consumption Stats, Report Builder tab

First built on the Rocketlane run (2026-10-30). Drop-in files live in `examples/rocketlane/portal/`. Use them when the
user supplies a product screenshot with an icon rail, or asks for usage/credits, consumption metering or a
standalone report builder. They are **optional**: the default portal keeps the template's sidebar/top bar.

## 1. Icon-rail navigation (`navLayout: 'rail'`)

When to use: the company's own product UI uses a narrow icon-only left rail (Rocketlane, Linear, Notion-style apps).
Match their reference screenshot: rail width, icon order, active tile, dark hover flyouts, red notification dot,
bottom gift/help icon and round avatar.

Steps (after `apply-spec.mjs` + `portal_finish.py`):
1. Copy `NavRail.tsx` to `src/components/`. Map the client's rail icons onto portal tabs (Rocketlane mapping:
   Search -> Spotter, Bell -> notifications flyout with story alerts, Home, Dashboards -> Analytics Liveboard with a
   flyout [Liveboard, My Reports], FileBarChart -> Report Builder, Clipboard -> action tab with flyout
   [All tasks, Sprint planning], Sparkles -> Ask AI, UserCog -> inline insights, Grid -> More flyout [theme, plan]).
   Tier gating comes from `PREMIUM_ONLY_TABS` in `TopBar.tsx`, so premium tabs disappear from the rail on Basic.
2. Logo mark: crop the icon paths out of the site logo into `src/assets/<slug>-mark.svg` (`currentColor` for the
   ink part, `rgb(...)` for the brand part) and inline it with `?raw`.
3. `flags.ts`: `navLayout: 'rail'`. `App.tsx`: render `<NavRail>` when rail; add class `is-sidenav is-rail` to the
   shell; render the breadcrumb strip (`.rail-crumbs`: "Back to dashboards | <current page>") at the top of
   `app-main` on every tab except Home.
4. Append `rail-credits-reports.css` to `globals.css` (rail, flyouts, crumbs, credits modal, report meter; mobile
   collapses the rail into a horizontal strip).
5. Verify with Playwright: hover a rail slot with a flyout and assert its `opacity` is 1; check the crumb text.

## 2. Credits store + Consumption Stats

- `src/lib/credits.tsx`: `CreditsProvider` (wrap `<App/>` inside `AuthProvider` in `main.tsx`) + `useCredits()`.
  Plans Starter 1,000 / Growth 2,000 / Enterprise 5,000 credits a month; usage counted per kind, two lines only
  (user wording, 2026-10-30): **"Custom report builds"** (Report Builder searches, x4) and **"Report runs"** (Liveboard
  views, x2); no exports/schedules line. Seeded to a plausible mid-month value (1,240 of 2,000 on Growth: 220 builds,
  180 runs). `openModal('liveboard')` from the Liveboard-level action hides the "Custom report builds" row; the
  avatar-menu entry (`openModal()`) shows both. **No Spotter / AI-question line anywhere in the consumption tracker** (user rule, 2026-10-30): Spotter and
  Ask AI are not metered here, so keep their wording out of the store, the modal and the meter. Stored state from an
  older shape (unknown usage keys) is discarded and reseeded;
  persisted per user in `localStorage['<slug>.credits.<user>']` inside try/catch; reseeds on a new month.
- `ConsumptionModal.tsx` (render once in `App.tsx`): used / allowance and %, brand progress bar, reset date (1st of
  next month), breakdown table, "Upgrade to <next tier> · N credits / month" (upgrades in state, bar re-scales,
  confirmation line); on the top tier: "You're on the highest tier. Contact sales".
- Two entry points open the same modal (`credits.openModal()` from the avatar menu, `credits.openModal('liveboard')` from the Liveboard action):
  - the avatar menu item "Consumption Stats" at the bottom of the rail (shows `used / allowance` inline);
  - a Liveboard-level custom action on the Analytics `LiveboardEmbed`:
    `customActions={[{ id: 'consumption-stats', name: 'Consumption Stats', position: CustomActionsPosition.PRIMARY,
    target: CustomActionTarget.LIVEBOARD, metadataIds: { liveboardIds: [ANALYTICS_LIVEBOARD_ID] } }]}` and
    `onCustomAction` checks `payload.data.id`. `onLiveboardRendered` adds one `view` per mount.

## 3. Report Builder tab

`ReportBuilder.tsx`: `SearchEmbed` with `dataSource = WORKSHEET_ID` (the portal model), `key={theme}`,
`customizations={tsCustomizations(theme, true)}`, and a 3px credit meter with a muted caption underneath
("1,240 / 2,000 credits this month · 4 credits per search"). `onQueryChanged` remembers the query; `onData` charges
one search per distinct query (same query again only after 3 s), animates the fill and flashes "+4". Add
`'reports'` to `TabId` and `TABS` in `TopBar.tsx` and route it in `App.tsx`.

## Verify (Playwright, login bypass via sessionStorage `<slug>.auth` / `<slug>.tab`)

Avatar -> "Consumption Stats" opens `.credits-modal`; clicking `.credits-upgrade` changes the bar width and allowance;
on the top tier `.credits-top` shows. Report Builder: `[data-testid="credit-meter"]` is visible. Embeds show
"Not logged in" under the bypass (Basic auth with demo/demo cannot sign in to ThoughtSpot); sign in for real to see
them. Worked example: `examples/rocketlane/verify.mjs`.

**Report Builder must open on a starter search** (Rocketlane, 2026-10-30): an empty SearchEmbed is a search bar over
a large blank white canvas, which the user called out twice; shrinking the frame only clipped the suggestion dropdown.
Pass `searchOptions={{ searchTokenString: '<2 measures + 1 attribute from the model>', executeSearch: true }}`, keep
the frame full height, and don't charge credits for that first automatic `Data` event. Check the starter string
with `searchdata` first.

## 4. Credits + Report Builder on the default sidebar / top nav (no rail)

Worked examples: the Scania run (`examples/scania/`) and the Surescripts run (`examples/surescripts/`, both 2026-11-03). The extras do not need the rail:
- Copy `credits.tsx`, `ConsumptionModal.tsx`, `ReportBuilder.tsx` from `examples/rocketlane/portal/`; change the
  `'<slug>.credits.'` storage key, the Report Builder subtitle and `STARTER_SEARCH`, and the "Contact sales" link.
- Avatar entry: in **both** `SideNav.tsx` and `TopBar.tsx`, add a first `.topbar-menu` item
  `<button className="topbar-menu-item credits-menu-item" data-testid="menu-consumption" onClick={() => { setMenuOpen(false); credits.openModal(); }}>`
  with a `Gauge` icon, "Consumption Stats" and `<em className="credits-menu-mini">{fmt(used)} / {fmt(allowance)}</em>`.
- `TopBar.tsx`: `'reports'` in `TabId` and `{ id: 'reports', label: 'Report Builder', icon: FileBarChart }` after analytics
  (SideNav reuses `TABS`). `App.tsx`: route `reports`, render `<ConsumptionModal />` once. `main.tsx`: wrap in `CreditsProvider`.
- CSS: append `examples/surescripts/portal/credits-reports.css` whole (credits modal, Report Builder, avatar entry and full-width rules; Surescripts run, 2026-11-03: copying the block out of another portal's `globals.css` by line number dropped `.credits-modal`/`.credits-body` and the modal body rendered with no padding). It is the part of `rail-credits-reports.css` from the credits-modal section down, plus the full-width rules
  (`.app-main { flex: 1; min-width: 0 } .app-main > * { width: 100%; max-width: none !important; box-sizing: border-box }`)
  and `.tab-reports { max-width: none; height: calc(100vh - 24px) }`. Check widths at 2000px.
- Test hook: `credits.tsx` sets `window.__credits` in dev builds only, so Playwright can open the Liveboard-action view
  (`__credits.openModal('liveboard')`) without a ThoughtSpot sign-in and assert "Custom report builds" is hidden.
  `examples/scania/verify.mjs` checks the avatar modal, upgrade, Liveboard view, meter, 2000px widths and the Ask paywall.

**Reusing another run's `TopBar.tsx` / `SideNav.tsx`** (Surescripts run): they carry that client's nav-icon regex
(Scania: `[/workshop|service|.../i, Wrench]`). Retarget the regex to the new action tab's label and drop icons you no
longer use, or `tsc` fails with TS6133 (unused import).
