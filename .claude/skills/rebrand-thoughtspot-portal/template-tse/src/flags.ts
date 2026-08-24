// Feature toggles. The codemod (scripts/apply-spec.mjs) overwrites this from
// spec.features; defaults are all-on so the template runs fully-featured.
//   monetize — paywall on the Nth Ask-AI question (TrialModal)
//   tiers    — Premium/Basic switcher in the top bar + disabledActions gating
//   pinning  — the Analytics "Add Report" -> pin-to-dashboard split panel
export const FLAGS = {
  monetize: true,
  tiers: true,
  pinning: true,
} as const;
