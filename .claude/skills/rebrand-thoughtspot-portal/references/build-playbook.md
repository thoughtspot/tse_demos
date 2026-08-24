# Build playbook — spec → edits

Deterministic steps to turn the interview **spec** into a working `<client>-tse/`.
Run `npm run build` (with `export PATH="$HOME/.node/bin:$PATH"`) after each stage.
The template brand token is **`Northwind`** (casings: `Northwind` / `NORTHWIND` /
`northwind`); the placeholder data tokens are `YOUR-CLUSTER.thoughtspot.cloud` and
`REPLACE_*_GUID`.

**Mode:** `basic` = strip the inline tab, the custom-action tab, and Add-Report
(keep My Reports · Analytics · Ask-AI · Spotter · theme). `advanced` = per the
answers. Deploy is always **local** (`npm run dev`) unless the user later asks for Vercel.

## 0. Clone
```bash
rsync -a --exclude node_modules --exclude dist --exclude .vercel --exclude .env.local \
  template-tse/ <client>-tse/
```
Build locally by symlinking deps: `ln -s ../node_modules node_modules` (remove before any commit).

## 1. Rebrand (Northwind → <Client>)
Replace in all casings, then rename the two brand-named files. **zsh does not
word-split an unquoted `$var`** — always use `find -exec … {} +`, never
`perl … $(find …)`.
```bash
PERL='s/Northwind/<Client>/g; s/NORTHWIND/<CLIENT>/g; s/northwind/<client>/g;'
find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' \) -exec perl -0pi -e "$PERL" {} +
perl -0pi -e "$PERL" index.html
perl -0pi -e 's/northwind-thoughtspot-portal/<client>-thoughtspot-portal/g' package.json
mv src/components/NorthwindLogo.tsx src/components/<Client>Logo.tsx
mv src/tabs/AskNorthwind.tsx src/tabs/Ask<Client>.tsx
```
Display casing: use title-case for the visible brand and "Ask <Client> AI". If the
client brand is stylized ALL-CAPS, do a targeted follow-up replace on visible
strings only (not const names). Re-grep for `northwind` — nothing should remain.

**Logo:** if the user attached one, write it to `src/assets/<client>-logo.svg`
(make the wordmark `fill="currentColor"` so it flips with the theme; keep one
accent color fixed) and a 32×32 `public/<client>-icon.svg` favicon. Otherwise keep
the generated wordmark. The import paths were already rewritten by the rename pass.

## 2. Data (`src/config.ts`)
Replace the placeholders with the spec:
- `THOUGHTSPOT_HOST` ← host
- `ANALYTICS_LIVEBOARD_ID` ← main liveboard GUID
- `CADENCE_WORKSHEET_ID` **and** `WORKSHEET_ID` ← model/worksheet GUID
- `INLINE_INSIGHTS_LIVEBOARD_ID` ← inline liveboard GUID (only if inline enabled)
- `CAPACITY_LIVEBOARD_ID` / `CAPACITY_VIZ_ID` ← the action viz's liveboard + viz (only if action enabled)

**Confirm each ID's type.** A whole-liveboard GUID passed as `vizId` renders the
liveboard-empty "Nothing to see yet" state. Inline tab = `liveboardId` only (no
vizId), filtered by the name column. Action tab = `liveboardId` + `vizId`.

**Auth** (`src/lib/thoughtspot.ts` `init`): `none` → `AuthType.None` (rides the
existing browser session; the login screen is a demo gate — keep the note telling
users to be signed in to the cluster in another tab). `basic` → `AuthType.Basic`
with the login form's username/password. `trusted` → wire a token endpoint (advanced).

## 3. Columns (candidate lists in `config.ts`)
Every column the app reads is a **candidate list** (first that returns data wins;
graceful fallback). Set the user's real names as the first entry, keep sensible fallbacks:
- `CADENCE_COLUMN_CANDIDATES` ← inline list's **name column** (e.g. carrier/process name)
- `CADENCE_DETAIL_COLUMNS` ← the inline **metric columns** (label + format `number|text|currency|date` + candidates); keys are arbitrary, up to 3
- `REGION_COLUMN_CANDIDATES` / `CORRIDOR_COLUMN_CANDIDATES` → rename to the spec's filter columns
- `DATE_COLUMN` ← the date filter column
- Org scoping is off by default (`ORG_COLUMN_CANDIDATES = []`); populate only if the client wants a tenant filter.

## 4. Tabs / nav (`src/components/TopBar.tsx` + `src/App.tsx`)
Template tabs: My Reports · Analytics · **Carriers** (inline) · **Capacity** (action) ·
**Ask <Client> AI** · **Spotter** (standalone). Keep/rename/remove per spec:
- Left platform nav (`PLATFORM_NAV`) → the client's context words.
- Rename the inline tab (`carriers`→spec tabName) and action tab (`capacity`→spec tabName).
- **Inline disabled** → remove the Carriers tab + route + delete `tabs/Carriers.tsx`.
- **Action disabled** → remove the Capacity tab + route + delete `tabs/Capacity.tsx` + `components/BidModal.tsx`.
- **Ask-AI mode**: `fancy` keeps `Ask<Client>` chat; `normal` keeps only the `Spotter` tab; `both` keeps both.
Update `TabId`, the `TABS` array, and the `{tab === …}` routes together; `tsc` catches mismatches.

## 5. Custom-action workflow (only if enabled) — `tabs/Capacity.tsx` + `components/BidModal.tsx`
- `REQUEST_BID_ACTION_ID/NAME` ← the action label.
- Custom action: `position: CustomActionsPosition.CONTEXTMENU`, `target: CustomActionTarget.VIZ`, scoped via `metadataIds`.
- `onCustomAction` builds context from the clicked row (`buildSignalContext` in `lib/signalContext.ts` reads `contextMenuPoints.clickedPoint`).
- **MANDATORY: rebuild the modal to match the workflow the user described — never ship the
  generic "Request Bid" form for a client who described a workflow.** `BidModal.tsx` is a
  *scaffold*, not the deliverable. Rename it to the workflow (e.g. `LeaveRequestModal.tsx`),
  rebuild its fields to match the description (what opens on click, which row fields pre-fill
  which inputs, what "Submit" confirms), and update the action label + tab name. The generic
  bid form is only acceptable when the user explicitly said "any simple form is fine" or
  declined to describe one. If a `spec.json`/codemod scaffolds the app, this modal is the
  one step you STILL implement by hand afterward — the codemod prints a NOTE reminding you.
- Verify at the end: right-click the viz → the action appears with the user's label → it opens
  *their* described screen (not the bid form), pre-filled from the clicked row.

## 6. Ask-AI, chatbot, monetization, tiers
- **Floating chatbot** (`components/ChatBot.tsx`, mounted in `App.tsx`): keep if the user wants the bottom-right bot; otherwise remove the `<ChatBot …/>` mount.
- **Fancy Ask tab** copy: welcome, subtitle, and `<Client>_SAMPLE_QUESTIONS` → the client's domain.
- **Monetization**: paywall is `components/TrialModal.tsx`, shown once on the Nth question (trigger in `tabs/Ask<Client>.tsx`, `if (nextCount === N)`). Set N from spec. The template's modal is already the professional version.
- **Add Report / pinning** (Analytics tab, `tabs/Analytics.tsx`): the "Add Report"
  split-panel = a Report Builder (`SearchEmbed`) + Spotter answer that pins to the
  dashboard (`HostEvent.Pin`), via `components/PinModal.tsx`. If **not** wanted,
  remove the Add-Report menu button, the `panel` split, the Search/Spotter report
  column, the pin flow, and the `PinModal` import/mount. **Caveat to surface if
  wanted:** `SearchEmbed` (Report Builder) renders poorly in **dark** theme — advise
  defaulting to light, or accept it.
- **Tiers**: `context/TierContext.tsx` (Premium/Basic switch in TopBar) + `lib/tierActions.ts` `BASIC_DISABLED_ACTIONS`. Map requested features to `Action` enum members — **verify names in the installed SDK** (`grep "enum Action" node_modules/@thoughtspot/visual-embed-sdk/dist/*.d.ts`): it's `Action.AskAi` (not `AISearch`), `Action.DrillDown`, `Action.Download` / `DownloadAsCsv` / `DownloadAsPdf` / `DownloadAsXlsx`, `Action.SpotIQAnalyze`. Pass `disabledActions` + `disabledActionReason` on each liveboard embed. If tiers not wanted, remove the switcher + the disabledActions props.

## 7. Theme (`src/styles/globals.css` tokens + `config.ts` embed vars)
Derive the palette from the **screenshot/URL**. Set:
- Host tokens on `:root` (light) and `:root[data-theme='dark']`: `--sl-cream`,
  `--sl-white`, `--sl-evergreen` (logo/ink), `--sl-green` (**primary**),
  `--sl-green-dark`, `--sl-mint`, `--sl-coral` (alert), `--sl-ink`, `--sl-muted`, borders.
- `--<client>-grad` gradient for titles; `.page-title` already clips it.
- Fonts: swap the Google-Fonts `<link>` in `index.html` and `--font-serif`/`--font-sans`
  + `TS_FONT_URL`. Titles vs body weights per spec.
- **Theme mode**: default in `context/ThemeContext.tsx` (`'dark'` or `'light'`); if
  the client is single-theme, still keep both palettes defined.
- **Dark base is ANY color** (black, navy, red, green…): it's fully token-driven — the
  template has no hardcoded hues. Set the `:root[data-theme='dark']` block
  (`--sl-cream` page bg, `--sl-white` cards, `--sl-ink`/`--sl-muted` text,
  `--sl-green`/`--sl-green-dark` primary, borders) **and `--sl-primary-rgb`** (the
  primary as `r,g,b`) — every glow/rim uses `rgba(var(--sl-primary-rgb), a)` and every
  shadow is neutral slate, so changing those tokens re-themes the whole dark mode.
- **Embed vars**: retint `TS_CSS_VARIABLES` (light) and `TS_VARS_DARK` (dark).

**Embed gotchas (these bit us — do not repeat):**
- **Buttons must be a SOLID color, never a gradient**, on `--ts-var-*-button-*-background`
  — the SDK applies them as `background-color`, so a gradient renders as invisible/white.
  Put gradients only on host CSS and on customCSS **rules** (`Triumph_EMBED_RULES` →
  rename to `<Client>_EMBED_RULES`), e.g. KPI-tile background and viz-title text.
- **Dark embed must blend**: set `--ts-var-liveboard-layout-background` / nav / group to
  the app's page background, tiles one step lighter. Purge any leftover green
  (`rgba(27,185,120,…)` ring in `--ts-var-viz-box-shadow`, `#143329` table header).
- **`isLiveboardMasterpiecesEnabled: true`** must be on **every** LiveboardEmbed
  (it's in `LIVEBOARD_EMBED_FLAGS` — spread it everywhere, incl. the inline tab) or
  custom/BYOC vizzes throw "features disabled by your admin".
- CustomCSS selectors for KPI tiles / viz titles / the AI-Highlights button are
  version-dependent — they're best-effort; tell the user to Inspect and share a class
  if a surface is missed.

## 8. Copy
Login hero tagline + subtitle (`pages/Login.tsx`), the demo-access note (host name),
chatbot FAQ/system prompt (`lib/chatbot.ts`), and sample questions — all to the
client's domain, derived from "what they do".

## 9. Verify + deploy
- `npm run build` clean, then `npm run dev` → give the localhost URL.
- Recap the spec; list the resolved column names, the **CSP/CORS allowlist** step for
  the deploy domain, and the auth/session requirement.
- **Deploy only if asked.** Vercel CLI is cached (`npx vercel@latest`, scope
  `koushik426s-projects` — personal can't be passed as `--scope <name>`):
  `vercel project add <name>` → `vercel link --yes --project <name> --scope …` →
  `vercel deploy --prod --yes --scope …`. A project named `<name>` serves
  `<name>.vercel.app`. Remove the `node_modules` symlink before any git commit.
