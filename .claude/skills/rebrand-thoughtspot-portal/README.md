# rebrand-thoughtspot-portal (Claude Code skill)

Turn a plain-language interview into a fully-branded **ThoughtSpot embedded-analytics
portal** — no coding required. Claude runs the interview (brand, data GUIDs, tabs,
theme screenshot, features), writes a `spec.json`, runs a deterministic codemod, and
hand-finishes any bespoke custom-action modal. A working `<slug>-tse/` app in seconds.

This skill is **self-contained**: the neutral base app (`template-tse/`) ships inside
the skill folder, so you install it by copying one directory.

## Install into your project

One command — grabs just the skill folder (no full-repo clone). Run it from your
project root:

```bash
npx degit thoughtspot/tse_demos/.claude/skills/rebrand-thoughtspot-portal \
  .claude/skills/rebrand-thoughtspot-portal
```

That's it — nothing else to install.

> **No separate `npm install` step:** the first time you build an app, the skill
> installs the bundled template's dependencies automatically (once). Node/npm not on
> your PATH? It looks in `~/.node/bin` for you.

<details>
<summary>Prefer a git clone (or the repo is private for you)?</summary>

```bash
git clone https://github.com/thoughtspot/tse_demos.git
mkdir -p /path/to/your-project/.claude/skills
cp -R tse_demos/.claude/skills/rebrand-thoughtspot-portal \
      /path/to/your-project/.claude/skills/
```
</details>

## Using it (what actually happens)

You don't run any scripts yourself — Claude does. Your only job is to answer questions
and paste a few values.

**1. Have these ready** (Claude will ask; grabbing them first makes it a 2-minute pass):
- Your ThoughtSpot **host URL** (e.g. `https://your-co.thoughtspot.cloud`)
- The main dashboard's **Liveboard ID** (the long ID in the URL when you open it)
- Your **data model / worksheet ID**
- A **brand screenshot** (website, product UI, or logo) — Claude reads the palette
  from it. *Building a demo with no real cluster? Just say so and Claude makes up
  realistic values.*

**2. Start it.** Open your project in Claude Code (terminal, VS Code, or the desktop
app) and either type `/rebrand-thoughtspot-portal` or just say
**"build a ThoughtSpot portal for `<company>`"**.

**3. Answer the interview.** Claude walks a short branching Q&A — brand, data, tabs,
theme, features — in plain language. You paste GUIDs and upload the screenshot when
asked; there are sensible defaults for everything else. It echoes the full plan back
for a "go" before building.

**4. Get a running app.** Claude writes `spec.json`, runs the codemod, hand-finishes
any custom modal, builds, and starts the dev server. Open the **localhost URL** it
hands you (in the desktop app, the Browser pane previews it automatically). Your app
lives in `<company>-tse/`.

> **Before it works on your cluster:** add your app's domain to the ThoughtSpot
> **CSP/CORS allowlist**, and make sure you have a ThoughtSpot session (or the auth
> mode you chose). Claude prints this checklist at the end.

## What you get

The generated app (Vite + React + `@thoughtspot/visual-embed-sdk`) includes, toggled
per your answers: an Analytics liveboard, an inline-insights list tab, a custom-action
viz tab with a bespoke workflow modal, a standalone Spotter tab, a "fancy" Ask-AI chat
+ floating chatbot, a monetization paywall, Premium/Basic tiers, host filters, an
"Add Report" pin flow, and a light/dark theme derived from your brand screenshot.

## How it works

```
interview  →  spec.json  →  scripts/apply-spec.mjs  →  <slug>-tse/  →  hand-finish modal → build
```

- `SKILL.md` — the interview tree + completeness gate (asks every section, requires a
  screenshot for theme, never fabricates GUIDs).
- `template-tse/` — the neutral base app the codemod clones.
- `scripts/apply-spec.mjs` — the codemod. Resolves `template-tse/` relative to itself,
  so it runs from any project directory. Writes the app into your current directory.
- `references/` — `spec-schema.md` (every field + interview mapping),
  `spec.example.json` (a copy-me worked example), `build-playbook.md` (field → edits).

Each generated app symlinks its `node_modules` to the bundled template's — which the
codemod installs automatically on first run — so there's nothing to install per app.
