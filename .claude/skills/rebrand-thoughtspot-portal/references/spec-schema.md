# spec.json — schema + interview mapping

The interview produces a **`spec.json`**; the codemod `scripts/apply-spec.mjs` turns it
into a working `<slug>-tse/` app in well under a second. **Copy
`references/spec.example.json`** (a complete, working InTime example) and edit every
value per the interview — do not hand-write from scratch.

Run from the project root (the codemod finds its bundled `template-tse/` relative to
itself, and resolves your `spec.json` asset paths against the current directory):

```bash
node .claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json
```

## Top-level fields

| Field | From interview | Notes |
|---|---|---|
| `client` | Brand name, Title-case | e.g. `"InTime"`. Renames the `Northwind` token in all casings. |
| `slug` | derived, kebab/lower | output dir `<slug>-tse/`; also namespaces storage keys. |
| `host` | Data section | bare host, e.g. `team2.thoughtspot.cloud` (script adds `https://`). |
| `auth` | Data section | `none` \| `basic` \| `trusted`. `basic` wires `AuthType.Basic` + login creds. |
| `ids` | Data section | `analyticsLiveboard`, `model`, `inlineLiveboard`, `actionLiveboard`, `actionViz`. **Confirm each by TYPE** (liveboard vs viz) — a viz GUID in a liveboard slot = blank embed. |
| `action` | Custom-action section | `{ id, name }` — the context-menu action label. |
| `columns` | Data / inline / filters | `inlineName[]` (candidate list), `inlineMetrics[]` (`{label,format,candidates[]}`, ≤3), `filterPrimary[]`, `filterSecondary[]`, `date`, `hierarchy{segment,rep,cadence}`. Candidate lists = first that returns data wins. |
| `appFont` | — | **Ignored.** The embed font is now derived automatically from `font.family` (see below). Safe to omit. |
| `font` | Theme | the brand font. Two forms, both handled: **(1) Self-hosted** `{ family, file, srcPath }` — copied to `public/<file>` and `@font-face`'d in `globals.css` (host UI = real font); embeds get the nearest Google font (below). **(2) Google font by name** `{ family }` (optionally `{ googleUrl }`) — host loads it via `index.html`'s `<link>` (host UI = real font, no `@font-face`); embeds load it too (it's on a CDN → real font in embeds as well). **(3) Licensed font by name** `{ family }` where `family` is NOT a Google face (Proxima Nova, Circular, Gotham…) — nothing is fetchable for it, so **host and embeds both load its `FONT_FALLBACKS` stand-in** and the real face appears only where it is installed locally or uploaded to the cluster. The host `<link>` must always load a family that is actually IN the token stack — loading Inter while the tokens name `Proxima Nova, Montserrat` silently drops the host to system-ui. Set `--font-serif`/`--font-sans` in `theme.light/dark` to `family`. **Embeds** always request `family` first, then the **nearest free Google font** as the reachable fallback (`FONT_FALLBACKS` in `apply-spec.mjs`: Larsseit→DM Sans, Gilroy→Poppins, Futura→Jost, Google faces→themselves, unknown→Inter); the real font renders in embeds only if it's a Google font or the cluster admin uploaded it. **Never self-host a font into the embeds** — it fails in the sandboxed iframe and blanks the theme. Omit `font` to keep Inter everywhere. |
| `logo` | Brand | `{ svgPath }` (repo-relative). Script rewrites `fill:#hex`→`currentColor` so it flips with theme. |
| `favicon` | Brand | inline SVG string → `public/<slug>-icon.svg`. |
| `theme` | Theme | see below. |
| `features` | multiple | see below — controls **tab pruning**. |
| `content` | all copy | the entire `content.ts` object (every human string). |
| `embedSwaps` / `greenSwaps` / `cssSwaps` | Theme | hex remaps — **fixed left side, brand right side** (see below). |

## `theme`

- `default`: `"light"` | `"dark"`.
- `light` / `dark`: the **full** `:root` token dictionaries (the codemod replaces the whole
  block, so include every token — colors, fonts, `--topbar-h`, shadows). Derive the palette
  from the brand screenshot/URL. Must include `--brand-navy` and `--brand-accent` (fixed
  brand colors, **same value in light and dark** — they drive the chatbot, which is a light
  card with a dark header in both themes).

## `features` (tab pruning the codemod performs)

- `askMode`: `"both"` (Ask + Spotter) · `"fancy"` (removes Spotter tab) · `"normal"` (removes Ask tab).
- `inline`: `false` removes the inline (Carriers/Shifts) tab + file.
- `action`: `false` removes the action (Capacity/Leaves) tab + BidModal.
- `monetize` / `tiers` / `pinning`: **automated** — the codemod writes `src/flags.ts` and the
  template gates these in place (`{FLAGS.tiers && …}` etc.). `false` hides the paywall, the
  tier switcher (tier stays Premium → everything unlocked), and the Add-Report panel. No hand-step.

## The swap arrays — fixed LHS, brand RHS

Each is `[from, to]`. The **left-hand values are constants** (the template's neutral
palette); change only the **right-hand** values to the brand equivalents. This is how the
embed CSS variables (indigo `config.ts`), the liveboard tab/button accents (green
`thoughtspot.ts`), and a few leftover dark-override rules (`globals.css`) get rebranded.

- **`embedSwaps`** (config.ts) LHS: `#4F5BD5` (primary), `#3F49B8` (hover), `#333C99` (active),
  `#22B8CF` (gradient end), `#0b0d10` `#14181f` `#1a212b` `#232a34` (dark embed bg family),
  `#0b1f19` (dark input), `rgba(45,164,191,0.14)` (ring).
- **`greenSwaps`** (thoughtspot.ts liveboard accents) LHS: `#0f9a63` `#0c8554` `#d9ecea`
  `#cfe3e2` `#1bb978` `#15ae6e`.
- **`cssSwaps`** (globals.css dark-override rules) LHS: `#0e1116` `#10222a` `#123047`.

> The chatbot palette is **token-driven** (`--brand-navy`/`--brand-accent`), so it needs
> **no** swaps — just set those two theme tokens.

## After the codemod — hand-steps (what a script can't do)

1. **Custom-action modal** (if a workflow was described): **MANDATORY** — rebuild
   `BidModal.tsx` to match the described screen (rename it, e.g. `LeaveRequestModal.tsx`),
   per `build-playbook.md` §5. **Never ship the generic Request Bid form** for a described
   workflow.
2. Any bespoke UI the user flagged (custom tables, live lookups).

Then: `npm run build` (fix TS errors), `npm run dev`, and print the spec recap + the
"verify on your cluster" list (resolved column names, CORS/CSP allowlist, auth requirement).
