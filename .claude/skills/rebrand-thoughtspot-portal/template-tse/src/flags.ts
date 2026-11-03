// Feature toggles. The codemod (scripts/apply-spec.mjs) overwrites this from
// spec.features; defaults are all-on so the template runs fully-featured.
//   monetize — paywall on the Nth Ask-AI question (TrialModal)
//   tiers    — Premium/Basic switcher in the top bar + disabledActions gating
//   pinning  — the Analytics "Add Report" -> pin-to-dashboard split panel
//   home     — a Home tab as the default landing (see homeStyle)
//   homeStyle — 'overview' = data-driven firework-style home (KPI + chart viz
//               cards, "what changed" answer, Spotter ask pane); 'landing' = a
//               static brand/marketing hero (no embeds)
//   navLayout — 'top' = horizontal top bar (default); 'sidebar' = left nav panel
//   home     — a brand Home landing page (no analytics) as the default tab
//   navLayout — 'top' (horizontal top bar) or 'sidebar' (left panel)
export const FLAGS = {
  monetize: true,
  tiers: true,
  pinning: true,
  home: true,
  homeStyle: 'landing',
  navLayout: 'top',
} as const;
