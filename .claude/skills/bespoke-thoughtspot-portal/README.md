# bespoke-thoughtspot-portal

A Claude Code skill that turns a company website into a working ThoughtSpot demo portal:

1. It researches the company.
2. It generates a realistic 2-year dataset with two planted stories and loads it into Snowflake.
3. It registers the table and builds a Spotter-enabled Model in ThoughtSpot.
4. It builds a brand-coloured Liveboard with an Overview tab and a KPIs tab, plus a bespoke custom chart.
5. It white-labels a portal app with `rebrand-thoughtspot-portal` (the sibling skill in this repo).

```
/bespoke-thoughtspot-portal tangoe.com
/bespoke-thoughtspot-portal emburse.com, dark theme, top nav, no paywall
```

A run takes about 15–20 minutes and does not stop for approvals.

## Install

```bash
# 1. This repo: the bespoke skill plus the portal codemod it uses
git clone https://github.com/thoughtspot/tse_demos.git ~/tse_demos
mkdir -p ~/.claude/skills
ln -s ~/tse_demos/.claude/skills/bespoke-thoughtspot-portal ~/.claude/skills/bespoke-thoughtspot-portal
ln -s ~/tse_demos/.claude/skills/rebrand-thoughtspot-portal ~/.claude/skills/rebrand-thoughtspot-portal

# 2. Custom-chart builder: its Playwright helpers are used for previews and Liveboard screenshots
git clone https://github.com/BibekTS/Thoughtspot-Amuzing-chart-skills.git ~/Thoughtspot-Amuzing-chart-skills
ln -s ~/Thoughtspot-Amuzing-chart-skills/skills/ts-object-answer-chart-builder ~/.claude/skills/ts-object-answer-chart-builder

# 3. ts CLI and the Snowflake profile skill (Python 3.9–3.13)
git clone https://github.com/thoughtspot/thoughtspot-agent-skills.git ~/thoughtspot-agent-skills
pip install -e ~/thoughtspot-agent-skills/tools/ts-cli
ln -s ~/thoughtspot-agent-skills/agents/claude/ts-profile-snowflake ~/.claude/skills/ts-profile-snowflake

# 4. Your defaults (cluster, Org, connection, Snowflake target), then edit the placeholders
cp ~/tse_demos/.claude/skills/bespoke-thoughtspot-portal/bespoke-portal-defaults.example.json ~/.claude/bespoke-portal-defaults.json
```

You also need:

- **Node.js 18 or later.** On PATH, or in `~/.node/bin`. The rebrand skill can install it without sudo.
- **The SpotterCode MCP connector** in Claude, signed in to your cluster and Org. All ThoughtSpot writes go through `execute-thoughtspot-code`.
- **A Snowflake profile** for loading data. Run `/ts-profile-snowflake` once. Keep the password in the Keychain, never in chat.
- **A ThoughtSpot connection** that can see your `<DATABASE>.<SCHEMA>`. Its Snowflake account must match the profile's.
- **CORS/CSP access for localhost on your cluster.** This needs a cluster admin.
- **The `thoughtspot-spotter` MCP (optional).** Without it, the skill uses its designer fallback for the insights strip and extra charts.

Then start Claude Code and run `/bespoke-thoughtspot-portal <company website>`.

## What is in here

- `SKILL.md`: the pipeline.
- `scripts/`: the data generator, TML builders, Liveboard builder, tile and font patchers, and portal finishing.
- `references/lessons.md`: the issues found on every past run. Read this first.
- `references/examples/<company>/`: full past runs (configs, specs, bespoke charts, Home pages, modals) to copy from.
- `showpieces/`: generic theme-aware charts, kept as a fallback reference only.

Generated data, run folders and portals go to the `workspace` in your defaults file (`~/bespoke-portals` by default), outside this repo.
