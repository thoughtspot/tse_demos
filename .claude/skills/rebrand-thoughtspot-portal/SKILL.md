---
name: rebrand-thoughtspot-portal
description: Guided builder that turns the reusable Vite + React + @thoughtspot/visual-embed-sdk portal template into a fully-skinned client app — brand, theme, data, tabs, custom actions, monetization and user tiers — from a plain-language interview. Use when someone wants to build / skin / white-label / clone a ThoughtSpot embedded analytics portal for a company (e.g. "build the portal for Acme", "skin the app for <client>", "make a ThoughtSpot demo app for X"). Walks a branching question tree (no coding required from the user), then clones the template and wires everything up, building and verifying at each step. Not for building a brand-new app architecture from scratch, or non-ThoughtSpot apps.
---

# Build a client ThoughtSpot portal (guided)

You are running a **non-technical intake**: the user answers plain-language
questions, you do all the code. Flow: **interview → build → verify → (ask before) deploy.**
Never make the user touch code or GUIDs beyond pasting the values you ask for.

## The base template

The base app is **bundled inside this skill** at `template-tse/` (next to this
`SKILL.md`) — a brand-neutral ("Northwind") build that already contains every
feature toggleable: Analytics liveboard, inline-insights list tab, custom-action
viz tab, standalone Spotter tab, "fancy" Ask-AI chat, monetization paywall,
Premium/Basic tiers, host filters, light+dark theme. You keep what the answers ask
for and strip the rest.

**First-time setup: none needed.** The bundled template's deps are installed
**automatically** by the codemod on the first build (it detects a missing
`node_modules` and runs `npm install` once, looking in `~/.node/bin` if npm isn't on
PATH). The codemod resolves the template relative to itself, so the skill works from
any project directory. Each generated `<slug>-tse/` app symlinks its `node_modules` to
the bundled template's, so nothing to install per app.

The codemod copies the template to `<client>-tse/` (kebab-case) in the current project,
excluding `node_modules dist .vercel .env.local`.

## Step 0 — Show the "gather-first" card (before any question)

People stall mid-interview when a question asks for a GUID they don't have open. So
**before** asking anything, post this checklist in one plain-language message and let
them collect it all at once. Keep it short — don't explain fields yet, just list what
to have ready:

> **Before we start, grab these — you'll paste them as we go (takes ~2 min):**
> 1. **Your ThoughtSpot host URL** (e.g. `https://your-co.thoughtspot.cloud`)
> 2. **The main dashboard's Liveboard ID** — open the liveboard; it's the long ID in
>    the URL after `/pinboard/` or `/liveboard/`.
> 3. **Your data model / worksheet ID** — the source the dashboard is built on.
> 4. **A brand screenshot** — your website, product UI, or logo. I'll pull the colors
>    from it. (A hex color works too if you have no image.)
> 5. *(optional)* Any extra Liveboard/viz IDs if you want more than one tab.
> 6. Your **logo** file (SVG or PNG), or say the word and I'll generate a wordmark.
>
> Building a demo with no real cluster? Just say so — I'll make up realistic values.

Wait for a "ready" (or their first pastes), then start the interview. Don't block on
it — if they'd rather answer as they go, proceed; the card just prevents the ambush.

## Step 1 — Run the interview (LOCKED SCRIPT — ask verbatim)

This interview is a **fixed script**, not a topic list. Run the rounds below **in this
exact order**, using the **exact wording** given:

- **Ask each question exactly as written.** Do NOT reword, rephrase, summarize, merge,
  reorder, add, or drop questions. The `AskUserQuestion` `question`/`header`/`option`
  text and the free-text messages are canonical — copy them.
- **The only permitted variation is skipping an entire round** when its mode/gate says
  to (Basic mode skips Rounds 3, 4, 6; a "No" gate skips that round's follow-up). You
  never skip a round for any other reason, and you never invent extra questions.
- **Sequencing rule:** never fire `AskUserQuestion` in the *same turn* as a free-text
  request — the popup blocks the text box. When a round has both, send the **free-text
  message first, wait for the reply, then** fire the popup.
- Collect answers into the **spec** (schema at the bottom).

Rounds marked **[ADVANCED ONLY]** are skipped entirely in Basic mode.

**Feature reference (Advanced only):** images can't render inside the `AskUserQuestion`
popup, so right **before Round 3**, publish `references/feature-reference.html` with the
Artifact tool and share the link once. It shows illustrative mockups of the four optional
features (Inline insights, Custom action, Monetization paywall, Add Report). Say, e.g.,
*"Here's a visual reference for the optional features as we go: <link>."* Each feature
round below points the user to its section. In **Basic** mode, skip this (those rounds are
skipped anyway).

---

**ROUND 0 — Build scope** · `AskUserQuestion`
- question: `Should this be a Basic demo or the full Advanced build?`
- header: `Build scope` · multiSelect: false
- options:
  - `Advanced (full build)` — All tabs: Analytics, inline insights, a custom-action workflow, Add-Report pinning, Ask-AI + Spotter, tiers/monetization.
  - `Basic demo` — Analytics dashboards + Spotter + Ask-AI + theme only. Skips inline, custom-action, and Add-Report.

Record as `mode`. **If Basic → skip Rounds 3, 4, 6.**

**ROUND 1 — Brand** · free-text message (verbatim):
> Tell me about the brand — answer in one message:
> 1. Company name
> 2. AI assistant name (or I'll default to "Ask <Company> AI")
> 3. One line on what they do
> 4. Website URL
>
> Then attach your **logo** (SVG preferred, PNG fine) — or say "generate one" and I'll make a wordmark.

**ROUND 2 — Data & filters** · free-text FIRST (verbatim):
> Now the data — paste in one message:
> 1. ThoughtSpot host URL (e.g. `https://your-co.thoughtspot.cloud`)
> 2. Main Analytics **Liveboard ID**
> 3. Data **model / worksheet ID**
> 4. Which columns do you want to filter the main dashboard (runtime filters)? List them
> 5. A **date column** to filter by, if any (optional)
>
> No real cluster? Say "make it up" and I'll generate realistic values.

…then `AskUserQuestion`:
- question: `How should the embedded ThoughtSpot content authenticate?`
- header: `Auth` · multiSelect: false
- options:
  - `Basic – typed credentials (Recommended)` — A username/password login gate in the app.
  - `None – ride existing session` — Embeds use whatever ThoughtSpot session is already signed in. Simplest for demos.
  - `Trusted – advanced` — Token-based trusted auth; needs backend setup.

**ROUND 3 — Inline-insights tab** · **[ADVANCED ONLY]** · *(point them to the "Inline insights" mockup in the feature reference)* · `AskUserQuestion` gate:
- question: `Add an inline-insights tab? (List where each row of the Client App expands to reveal a ThoughtSpot Liveboard / component filtered to the list item)`
- header: `Inline insights` · multiSelect: false
- options: `Yes, add it` · `No, skip it`

If **Yes**, free-text — **fill the bracketed examples yourself** from the company (Round 1)
and the model/worksheet; don't print the literal brackets:
> Inline-insights details — paste in one message:
> 1. The inline **Liveboard ID** (must be a liveboard, not a viz/answer)
> 2. **What do you want to name this tab?** (some examples: <2–3 tab-name ideas fitting the company>)
> 3. **Which attribute / dimension should label each row?** (some examples: <2–3 dimensions that fit this model>)
> 4. **Up to 3 metric columns to show per row** (some examples: <2–3 measures that fit this model>)

For 2–4, generate the example suggestions from the company's domain and the
model/worksheet — concrete, plausible names, not placeholders like "x/y".

**ROUND 4 — Custom-action workflow** · **[ADVANCED ONLY]** · *(point them to the "Custom action" mockup in the feature reference)* · `AskUserQuestion` gate:
- question: `Add a custom-action workflow? (a button on a viz row that opens your own screen/modal)`
- header: `Custom action` · multiSelect: false
- options: `Yes, add it` · `No, skip it`

If **Yes**, free-text — **fill the bracketed examples yourself** from the company (Round 1);
don't print the literal brackets:
> Custom-action details — paste in one message:
> 1. The **viz ID** the action lives on, and its parent **Liveboard ID**
> 2. The action's **button label** (some examples: <2–3 action labels fitting the company>)
> 3. The **tab name** (some examples: <2–3 tab-name ideas fitting the company>)
> 4. Describe the workflow exactly: what screen/modal opens on click, which row fields pre-fill which inputs, and what "Submit" does. (A screenshot of the target screen is **optional** but helps — attach one if you have it.)
>
> I'll build exactly that screen — not a generic form.

For 2–3, generate the example suggestions from the company's domain — concrete, plausible names.

You then build **exactly that screen** (rebuilding the scaffold modal); never fall back
to the generic "Request Bid" form. If the user can't describe a workflow, ask whether a
simple labeled form is acceptable or the action should be dropped.

**ROUND 5 — Ask-AI & tiers** · *(for the Monetize question, point them to the "Monetization paywall" mockup in the feature reference)* · `AskUserQuestion` (batch all four in one call):
- Q1 — question: `How should Ask-AI work?` · header: `Ask-AI` · options: `Both` · `Standalone Spotter only` · `Fancy chat only`
- Q2 — question: `Floating chatbot in the bottom-right corner?` · header: `Chatbot` · options: `Yes` · `No`
- Q3 — question: `Add a monetization paywall?` · header: `Monetize` · options: `No` · `Yes`
- Q4 — question: `Feature gating by tier (Premium vs Basic)?` · header: `Tiers` · options: `No` · `Yes`

If **Monetize = Yes**, free-text: `Which AI question should trigger the paywall? (e.g. the 3rd)`
If **Tiers = Yes** — ask the monetize free-text first (if any), wait, then `AskUserQuestion`:
- question: `Which actions should the Basic tier lose?`
- header: `Basic loses` · multiSelect: true
- options: `Drill-down` · `Ask AI` · `Downloads`
- If the user says "defaults" / "pick the defaults", use all three.

**ROUND 6 — Add Report (custom report building / addition flow)** · **[ADVANCED ONLY]** · *(point them to the "Add Report" mockup in the feature reference)* · `AskUserQuestion`:
- question: `Add Report (custom report building / addition flow)?`
- header: `Add Report` · multiSelect: false
- options:
  - `No, skip it` — No Add-Report menu, pin flow, or PinModal.
  - `Yes — Ask-AI (Spotter) only` — Include the flow but only the Spotter/Ask-AI builder; skip the SearchEmbed Report Builder (which renders poorly in dark theme).
  - `Yes — with both Ask AI & Report Builder (Search Data)` — Include the full flow: both the Spotter/Ask-AI builder and the SearchEmbed Report Builder. Caveat: SearchEmbed renders poorly in dark — demo in Light theme.

**Caveat to surface with this round:** the Report Builder uses `SearchEmbed`, which
renders poorly in **dark** theme. So the user can either (a) include only the Ask-AI
(Spotter) builder and drop SearchEmbed, or (b) keep SearchEmbed and demo in **Light**.
If **No**, strip the Add-Report menu, the pin flow, and `PinModal`. If **Ask-AI only**,
keep the pin flow + Spotter builder but strip the SearchEmbed Report Builder.

**ROUND 7 — Theme** · **one free-text message — ask for everything at once** (verbatim):
> Last part — the look. Answer in one message (attach what you have):
> 1. **Screenshot** — upload one I can pull your palette from (your website, product UI, a marketing shot, or your logo). A live URL works too; a named hex color only if you have no image at all.
> 2. **Font** — name a specific font (a Google font like "Poppins" is easiest) or attach the file; name separate title vs body fonts if you want. No preference? Say so and I'll match the brand.
> 3. **Theme mode** — light, dark, or both? (and which is the default)
> 4. **Any specific customizations?** — e.g. gradients on titles, particular hues, "make the KPIs pop", rounded cards. Or "none".
> 5. **Home page?** — do you want a brand **Home landing page** as the first thing users see after login (no dashboards — just your headline, a tagline, a call-to-action, and a few highlight stats)? If yes, can I model it on the screenshot you uploaded, or do you have any specific requirements? (Say "no home page" to skip.)

The **screenshot is the palette reference** — derive the whole palette from it; don't jump
to a color-picker. The screenshot is still REQUIRED (a URL or, last resort, a named color
substitutes). After they reply, **confirm the primary/accent you read from the image**
before moving on.

**Home page (item 5):** record as `features.home`. If yes, also fill `content.landing`
(eyebrow, headline segments with `accent`, subline, ctaLabel, stats) derived from the
screenshot / their requirements — the codemod ships a scaffold `Landing.tsx` that you then
tailor to match (a hand-finish step, like the custom-action modal). It must **not** show
analytics or embeds. If no, leave `features.home` off and the tab is never generated.

There is **no deploy question** — always **build + run locally** by default. Only
deploy to Vercel if the user explicitly asks for it afterward.

### Completeness gate — do NOT skip, do NOT fabricate

Before you build, you MUST have run **every non-skipped round 0–7** and have an explicit
answer for each, including the free-text ones. Never invent or silently default a value
the user could provide. (Skipping a round is only allowed per the Round's mode/gate.)

- **Round 2 (Data) is REQUIRED free-text — actually ask for it and wait.** You must
  collect the host URL, the Analytics liveboard GUID, the model/worksheet GUID, (if inline
  enabled) the inline liveboard GUID, (if action enabled) the action viz + its liveboard
  GUID, the filter columns, and the date column. **Do NOT invent GUIDs or a host.** If the
  user is building a fictitious/demo app, ask explicitly "want me to make these up?" — get
  a yes per-value; don't assume it.
- **Round 7 (Theme) — ask for BOTH the screenshot/URL AND the font** (a Google font by
  name, or an attached file). Never pick a font yourself without asking.
- The Round 5 batched popup must **not drop the free-text follow-ups** it triggers
  (paywall trigger, tier-disabled actions), nor the free-text asks in other rounds.

Then **echo the COMPLETE spec back in plain language** — every field, round by round,
flagging anything the user let you make up — and get an explicit **"go"** before building.
If you catch yourself about to fabricate a value or skip a round, stop and ask instead.

## Step 2 — Build (spec-driven: interview → spec.json → codemod → hand-finish)

The interview becomes a **`spec.json`**; a codemod does the mechanical ~90% in under a
second; you hand-finish the few things a script can't.

1. **Write `spec.json`.** Copy **`references/spec.example.json`** (a complete working
   example) and edit every value per the interview. Field-by-field mapping + the swap-array
   rules are in **`references/spec-schema.md`**. Derive the `theme.light`/`theme.dark` token
   dicts from the brand screenshot/URL; in the `embedSwaps`/`greenSwaps`/`cssSwaps` arrays
   change only the **right-hand** (brand) values — the left-hand hexes are fixed template
   constants.
2. **Run the codemod** from the project root (where you want the app written):
   ```bash
   node .claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json
   ```
   It clones the bundled `template-tse` → `<slug>-tse/`, renames the brand, writes `content.ts`, patches
   `config.ts` (host/GUIDs/columns/embed theme), switches auth, regenerates the `globals.css`
   theme tokens + `@font-face`, drops in logo/favicon/font, and prunes the tabs `features`
   turns off.
3. **Hand-finish what the codemod can't** (it prints reminders):
   - **Custom-action modal** — if a workflow was described, **MANDATORY**: rebuild the
     scaffold modal to match it (build-playbook §5). Never leave the generic Request Bid form.
   - **Home page** — if `features.home` is on, tailor `src/tabs/Landing.tsx` (and its
     `content.landing` copy) to the screenshot / requirements. Keep it brand/marketing —
     **no analytics or embeds**. The codemod only flips the flag + ships a scaffold.
   - Any bespoke UI the user flagged (custom tables, live lookups).
   (Tabs and the monetize/tiers/pinning/home toggles are handled by the codemod — nothing to do.)
4. **Build:** `export PATH="$HOME/.node/bin:$PATH" && (cd <slug>-tse && npm run build)`.
   Fix any `tsc` errors and rebuild until clean.

**`references/build-playbook.md`** is the reference for WHAT each field maps to and the
non-obvious rules (host protection, solid-color embed buttons, masterpieces flag,
liveboard-vs-viz, `Action` enum names, candidate-column fallback) — consult it when a
codemod result looks off or when hand-editing. (The playbook's per-file manual steps still
work as a fallback if the codemod can't run.)

## Step 3 — Verify, run, (ask to) deploy

- `npm run dev` and give the user the localhost URL.
- Print a **spec recap** + a **"verify on your cluster"** list: exact column names
  the candidate-lists resolved, the CSP/CORS **allowlist** step for the domain, and
  the auth/session requirement.
- Deploy to Vercel only if the user asked (see the playbook's deploy section).

## Spec schema

The interview's answers are written to a **`spec.json`** consumed by the codemod. The full
field-by-field schema, the interview→field mapping, and the fixed-LHS swap rules live in
**`references/spec-schema.md`**; **`references/spec.example.json`** is a complete worked
example to copy and edit. (Deploy is always LOCAL by default — not interviewed; Vercel only
on an explicit later ask.)

## Rules of engagement
- Confirm ambiguous ThoughtSpot IDs by **type** (liveboard / viz / saved answer) — the
  #1 source of blank embeds.
- Prefer **candidate-column lists** over a single guessed name; the app falls back gracefully.
- Keep the user in plain language; you own the terminal, the build, and the fixes.
