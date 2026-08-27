# Deployment topology (read before deploying)

Non-obvious wiring that has bitten us. Keep this current.

| App | Source dir | Vercel project (scope) | Domain | How to deploy |
|---|---|---|---|---|
| **SalesSpot** (root) | `/src` (repo root) | `salesspot` (personal `koushik426`) | `getsalesspot.vercel.app` | CLI: `vercel deploy --prod` from repo root, then `vercel alias set <url> getsalesspot.vercel.app` |
| **PharmaSpot** demo | `pharmaspot-pmm-tse/` (**gitignored**) | `pharmaspot` (team `thoughtspot-site`) | `pharmaspot.vercel.app` | **CLI ONLY** — Git is intentionally disconnected. `cd pharmaspot-pmm-tse && vercel deploy --prod --scope thoughtspot-site`, then `vercel alias set <url> pharmaspot.vercel.app --scope thoughtspot-site` |
| **Rebrand skill template** | `.claude/skills/rebrand-thoughtspot-portal/template-tse` | — (not hosted) | — | Not deployed; consumed by the codemod. Ship changes by committing to `main`. |
| **Coolify mirror** | repo root | Coolify (`coolify.thoughtspot.com`) | `tse_demos.coolify.thoughtspot.com` | Builds the repo-root **SalesSpot** app from `main` (dashboard redeploy / auto-deploy). |

## ⚠️ Do NOT reconnect Git on the `pharmaspot` Vercel project
On 2026-08-27 we **disconnected Git** from the `pharmaspot` project. Why it matters:

- That project had Root Directory `.` and auto-deployed `main`, so **every push to `main` rebuilt the repo-root SalesSpot app and published it to `pharmaspot.vercel.app`** — making PharmaSpot "turn into" SalesSpot.
- The real PharmaSpot app (`pharmaspot-pmm-tse/`) is **gitignored**, so it can **never** be produced by a Git build — it only exists via CLI deploys.
- Therefore `pharmaspot.vercel.app` must be updated by **CLI only**. Reconnecting Git (or pointing any Git build at the repo root for this project) will bring the flip-flop back.

## Notes
- `.vercel.app` login pages get flagged by Google Safe Browsing / Twingate (credential form on a bare vercel.app domain). Durable fix = a real custom domain; interim = allowlist.
- Pushing to `main` updates the repo + skill template; it should **not** trigger any Vercel deploy for `pharmaspot` (Git disconnected). `salesspot`/getsalesspot is CLI-deployed.
