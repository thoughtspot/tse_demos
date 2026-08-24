---
name: rebrand-thoughtspot-portal
description: Guided builder that turns the reusable Vite + React + @thoughtspot/visual-embed-sdk portal template into a fully-skinned client app — brand, theme, data, tabs, custom actions, monetization and user tiers — from a plain-language interview. Use when someone wants to build / skin / white-label / clone a ThoughtSpot embedded analytics portal for a company (e.g. "build the portal for Acme", "skin the app for <client>", "make a ThoughtSpot demo app for X"). Walks a branching question tree (no coding required from the user), then clones the template and wires everything up, building and verifying at each step. Not for building a brand-new app architecture from scratch, or non-ThoughtSpot apps.
---

# Build a client ThoughtSpot portal (guided)

You are running a **non-technical intake**: the user answers plain-language
questions, you do all the code. Flow: **interview → build → verify → (ask before) deploy.**
Never make the user touch code or GUIDs beyond pasting the values you ask for.

## The base template

**Prereq (for a teammate):** run this inside a clone of the `tse_demos` repo, which
ships this skill *and* `template-tse/`. First-time setup: `git clone` the repo,
`npm install` at the root, open the folder in Claude Code, then start this skill.

Clone from **`template-tse/`** at the repo root — a brand-neutral ("Northwind")
build that already contains every feature toggleable: Analytics liveboard,
inline-insights list tab, custom-action viz tab, standalone Spotter tab, "fancy"
Ask-AI chat, monetization paywall, Premium/Basic tiers, host filters, light+dark
theme. You keep what the answers ask for and strip the rest.

Copy it to `<client>-tse/` (kebab-case), excluding `node_modules dist .vercel .env.local`.

## Step 1 — Run the interview (the question tree)

Ask with `AskUserQuestion`, **one section per round**, offering sensible defaults
and only expanding a branch when its gate is "yes". Collect answers into the
**spec** (schema at the bottom). Free-text values (GUIDs, column names, a pasted
screenshot) you request in a normal message.

**Sequencing rule (important):** never fire `AskUserQuestion` in the *same turn* as
a free-text request — the popup blocks the text box, so the user can't paste. When a
section has both, **ask the free-text first, wait for the reply, then** pop the
choice(s). Batch multiple choices of the same section into one popup. If a section is
purely choices, popup directly; if purely free-text, just ask in the message.

Walk the tree in this order. **Section 0 comes first — it prunes the tree:**

0. **Basic or Advanced demo?** — *Basic* = a quick demo (Analytics dashboards +
   Spotter + Ask-AI + theme). *Advanced* = the full build. **If Basic, skip
   sections 3, 4 and 6 entirely** (no inline tab, no custom-action tab, no
   Add-Report). Record as `mode`.
1. **Brand** — company name; AI assistant name (default "Ask <Company> AI");
   one-line "what they do"; website URL; **ask them to attach the logo**
   (SVG preferred, PNG fine) — or offer to generate a wordmark if they have none.
2. **Data & filters** — ThoughtSpot host URL; main liveboard GUID; model/worksheet
   GUID; **auth** (None = rides existing session · Basic = typed creds · Trusted =
   advanced); and **which columns filter the main liveboard** (multiselect) + an
   optional **date column**.
3. **Inline-insights tab?** *(advanced only)* → if yes: inline **liveboard** GUID
   (confirm it's a *liveboard*, not a viz/answer), tab name, the list's **name
   column**, and up to 3 **metric columns**.
4. **Custom-action workflow?** *(advanced only; optional — ask first, skip entirely
   if no.)* Only if yes: **viz** GUID + its **liveboard** GUID, action label, tab name, and
   **— required —** a description of the workflow: what screen/modal opens on click, which
   row fields pre-fill which inputs, and what "Submit" does. **You build exactly that screen**
   (rebuilding the scaffold modal); do NOT fall back to the generic "Request Bid" form.
   A screenshot of the target screen is ideal — ask for one. If the user can't describe a
   workflow, ask whether a simple labeled form is acceptable or the action should be dropped.
5. **Ask-AI** — Normal Spotter (standalone), Fancy chat, or both.
   - **Floating chatbot in the bottom-right corner?** (yes/no)
   - **Monetization?** → if yes: which question number triggers the paywall.
   - **Feature gating (tiers)?** → if yes: which actions Basic loses (drill-down,
     Ask AI, downloads, …).
6. **Pinning / "Add Report"?** *(advanced only)* — the Analytics "Add Report"
   split-panel that lets a user build an answer (Report Builder / Spotter) and **pin
   it to the dashboard**. If yes, **warn**: the Report Builder (`SearchEmbed`) renders
   poorly in **dark** theme — suggest defaulting to light, or accepting the caveat. If
   no, strip the Add-Report menu, the pin flow, and `PinModal`.
7. **Theme** — **REQUIRED FIRST: explicitly ask the user to UPLOAD a screenshot for
   color reference — and WAIT for it before anything else in this section.** Say it in
   plain words, e.g. *"Please upload a screenshot for reference (your website, product UI,
   a marketing shot, or your logo) and I'll derive the palette from it."* Do NOT jump to a
   color-picker or "what's your primary color?" — the screenshot is the reference. A pasted
   **URL** is an acceptable substitute; a **named color** is a last resort only when the
   user genuinely has no image at all (and even then, ask). Derive the whole palette from
   the uploaded image. Then: light / dark / both (+ default); font(s) for titles vs body;
   confirm the primary/accent you read from the image; any specific asks (gradients, hues,
   "make titles/KPIs pop").

There is **no deploy question** — always **build + run locally** by default. Only
deploy to Vercel if the user explicitly asks for it afterward.

### Completeness gate — do NOT skip, do NOT fabricate

Before you build, you MUST have an explicit answer for **every section 0–7**, including the
free-text ones. Never invent or silently default a value the user could provide.

- **Section 2 (Data) is REQUIRED free-text — actually ask for it and wait.** You must
  collect the host URL, the Analytics liveboard GUID, the model/worksheet GUID, (if inline
  enabled) the inline liveboard GUID, (if action enabled) the action viz + its liveboard
  GUID, the filter columns, and the date column. **Do NOT invent GUIDs or a host.** If the
  user is building a fictitious/demo app, ask explicitly "want me to make these up?" — get
  a yes per-value; don't assume it.
- **Section 7 (Theme) — ask for BOTH the screenshot/URL AND the font** (a Google font by
  name, or an attached file). Never pick a font yourself without asking.
- Batching choice-questions into one `AskUserQuestion` popup is fine, but it must **not
  drop the free-text asks** that belong to the same section (Data GUIDs, font, columns).

Then **echo the COMPLETE spec back in plain language** — every field, section by section,
flagging anything the user let you make up — and get an explicit **"go"** before building.
If you catch yourself about to fabricate a value or skip a section, stop and ask instead.

## Step 2 — Build (spec-driven: interview → spec.json → codemod → hand-finish)

The interview becomes a **`spec.json`**; a codemod does the mechanical ~90% in under a
second; you hand-finish the few things a script can't.

1. **Write `spec.json`.** Copy **`references/spec.example.json`** (a complete working
   example) and edit every value per the interview. Field-by-field mapping + the swap-array
   rules are in **`references/spec-schema.md`**. Derive the `theme.light`/`theme.dark` token
   dicts from the brand screenshot/URL; in the `embedSwaps`/`greenSwaps`/`cssSwaps` arrays
   change only the **right-hand** (brand) values — the left-hand hexes are fixed template
   constants.
2. **Run the codemod** from the repo root:
   ```bash
   node .claude/skills/rebrand-thoughtspot-portal/scripts/apply-spec.mjs spec.json
   ```
   It clones `template-tse` → `<slug>-tse/`, renames the brand, writes `content.ts`, patches
   `config.ts` (host/GUIDs/columns/embed theme), switches auth, regenerates the `globals.css`
   theme tokens + `@font-face`, drops in logo/favicon/font, and prunes the tabs `features`
   turns off.
3. **Hand-finish what the codemod can't** (it prints reminders):
   - **Custom-action modal** — if a workflow was described, **MANDATORY**: rebuild the
     scaffold modal to match it (build-playbook §5). Never leave the generic Request Bid form.
   - Any bespoke UI the user flagged (custom tables, live lookups).
   (Tabs and the monetize/tiers/pinning toggles are handled by the codemod — nothing to do.)
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
