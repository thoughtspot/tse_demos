# rebrand-thoughtspot-portal (Claude Code skill)

Turn a plain-language interview into a fully-branded **ThoughtSpot embedded-analytics
portal** — no coding required. Claude runs the interview (brand, data GUIDs, tabs,
theme screenshot, features), writes a `spec.json`, runs a deterministic codemod, and
hand-finishes any bespoke custom-action modal. A working `<slug>-tse/` app in seconds.

This skill is **self-contained**: the neutral base app (`template-tse/`) ships inside
the skill folder, so you install it by copying one directory.

## Install into your project

```bash
# 1. get the skill
git clone https://github.com/koushik426/tse_demos.git

# 2. copy it into your project's skills folder
mkdir -p /path/to/your-project/.claude/skills
cp -R tse_demos/.claude/skills/rebrand-thoughtspot-portal \
      /path/to/your-project/.claude/skills/

# 3. one-time: install the bundled template's deps
cd /path/to/your-project/.claude/skills/rebrand-thoughtspot-portal/template-tse
npm install
```

Then open your project in Claude Code and say, e.g.,
**"build a ThoughtSpot portal for Acme"** — the skill takes over from there.

> Node/npm not on your PATH? `export PATH="$HOME/.node/bin:$PATH"` first.

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

Each generated app symlinks its `node_modules` to the bundled template's, so there's
nothing to install per app once step 3 above is done.
