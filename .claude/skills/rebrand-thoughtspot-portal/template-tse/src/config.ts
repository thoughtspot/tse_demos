import { CONTENT } from './content';
import type { ChangeSpec } from './lib/thoughtspot';
// ---------------------------------------------------------------------------
// Central configuration for the Northwind Analytics mockup.
// IDs + ThoughtSpot styling are sourced from northwind_fin.json so that every
// embedded ThoughtSpot component shares the exact same look & feel.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster (from appConfig.thoughtspotUrl) */
export const THOUGHTSPOT_HOST = 'https://YOUR-CLUSTER.thoughtspot.cloud';

/** The Analytics liveboard embedded in Tab 2 (Analytics). */
export const ANALYTICS_LIVEBOARD_ID = 'REPLACE_MAIN_LIVEBOARD_GUID';

/** Liveboard embedded inline by "View insights" on a process, filtered by the
 *  process name (no vizId — the whole liveboard is shown, stripped of chrome). */
export const INLINE_INSIGHTS_LIVEBOARD_ID =
  'REPLACE_INLINE_LIVEBOARD_GUID';

/** Worksheet/model the Processes tab queries for process names + metrics. */
export const CADENCE_WORKSHEET_ID = 'REPLACE_MODEL_GUID';

/**
 * Capacity tab embeds a single VISUALIZATION (LiveboardEmbed + liveboardId +
 * vizId) with a code-based custom action.
 */
export const CAPACITY_LIVEBOARD_ID = 'REPLACE_ACTION_LIVEBOARD_GUID';
export const CAPACITY_VIZ_ID = 'REPLACE_ACTION_VIZ_GUID';

/** Code-based custom action ("Request Bid") on the Capacity viz context menu. */
export const REQUEST_BID_ACTION_ID = 'request-bid';
export const REQUEST_BID_ACTION_NAME = 'Request Bid';

/**
 * Candidate column names for "cadence" on the worksheet. The first one that
 * returns data is used both to list cadence names and as the runtime-filter
 * column name on the inline liveboard.
 */
export const CADENCE_COLUMN_CANDIDATES = [
  'Dim Carrier Name',
  'Carrier Name',
  'Carrier',
  'Dim Carrier',
];

/**
 * Candidate column names for the per-cadence detail metrics shown next to each
 * cadence in the Inline Insights UI. The first candidate that returns data for
 * each metric is used; metrics with no match are simply omitted.
 */
export const CADENCE_DETAIL_COLUMNS: Record<
  'loadsDelivered' | 'loadsOnTime' | 'carrierSize',
  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }
> = {
  loadsDelivered: {
    label: 'Loads Delivered',
    format: 'number',
    candidates: ['Loads Delivered', 'Delivered Loads', 'Total Loads Delivered', 'Loads'],
  },
  loadsOnTime: {
    label: 'Loads On Time',
    format: 'number',
    candidates: ['Loads On Time', 'On-Time Loads', 'On Time Loads', 'On Time Deliveries'],
  },
  carrierSize: {
    label: 'Carrier Size',
    format: 'text',
    candidates: ['Carrier Size', 'Fleet Size', 'Size', 'Carrier Tier'],
  },
};

/**
 * Worksheet / model used everywhere Spotter runs — the "Northwind AI" Spotter
 * modal (Analytics tab), the Ask Northwind Spotter embed, and the host chatbot.
 */
export const WORKSHEET_ID = 'REPLACE_MODEL_GUID';

/** Carriers list is not org-scoped for Northwind. */
export const Northwind_ORG_ID = '';
export const ORG_COLUMN_CANDIDATES: string[] = [];

/** Analytics-tab filters — Region + Freight corridor (multiselect), both empty
 *  by default (= no runtime filter / show all). Load Date is a date-range filter
 *  driven by DATE_COLUMN below. Candidate column names, first match wins. */
export const REGION_COLUMN_CANDIDATES = [
  'Region',
  'Dim Region',
  'Sales Region',
  'Geo Region',
];
export const CORRIDOR_COLUMN_CANDIDATES = [
  'Freight Corridor',
  'Corridor',
  'Lane',
  'Freight Lane',
];

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — taken verbatim from
// northwind_fin.json > stylingConfig.embeddedContent
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface. */
// Embed font — the family the ThoughtSpot iframes request. Overwritten by the
// codemod from spec.appFont; pair it with TS_FONT_URL (below), which loads that
// font INTO the iframe (a Google-Fonts URL, or a self-hosted /embed-font.css).
export const EMBED_FONT_FAMILY = '"Inter", system-ui, "Segoe UI", sans-serif';

export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#FCFCFD',
  '--ts-var-root-color': '#182338',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#26324e',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#26324e',
  '--ts-var-search-data-button-background': '#4F5BD5',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#F5F6F8',
  '--ts-var-search-bar-text-font-color': '#26324e',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#4F5BD5',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#3F49B8',
  '--ts-var-button--primary--active-background': '#333C99',
  '--ts-var-button--secondary-background': '#EEF0F4',
  '--ts-var-button--secondary-color': '#26324e',
  // See dark-theme note: the SDK reads the typo'd "--hovers-background".
  '--ts-var-button--secondary--hover-background': '#E3E6EC',
  '--ts-var-button--secondary--hovers-background': '#E3E6EC',
  '--ts-var-button--secondary--active-background': '#D7DBE3',
  '--ts-var-viz-title-color': '#182338',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#3a4a6b',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(7, 59, 58, 0.06), 0 16px 44px rgba(7, 59, 58, 0.16)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#EEF0F5',
  '--ts-var-chip-color': '#26324e',
  '--ts-var-chip--hover-background': '#E3E6EC',
  '--ts-var-chip--hover-color': '#182338',
  '--ts-var-chip--active-background': '#4F5BD5',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#26324e',
  '--ts-var-menu--hover-background': '#F1F2F6',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#26324e',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#182338',
  '--ts-var-list-hover-background': '#F1F2F6',
  '--ts-var-list-selected-background': '#E8EAF1',
  '--ts-var-liveboard-layout-background': '#FCFCFD',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#182338',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#E2E4EC',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#F5F6F9',
  '--ts-var-liveboard-tab-active-border-color': '#4F5BD5',
  '--ts-var-liveboard-tab-hover-color': '#4F5BD5',
  '--ts-var-liveboard-header-action-button-background': '#EEF0F5',
  '--ts-var-liveboard-header-action-button-font-color': '#26324e',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is dark here, so keep the hover background LIGHT for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#E3E6EC',
  '--ts-var-liveboard-header-action-button-active-color': '#D7DBE3',
  '--ts-var-parameter-chip-background': '#EEF0F5',
  '--ts-var-parameter-chip-text-color': '#26324e',
  '--ts-var-parameter-chip-hover-background': '#E3E6EC',
  '--ts-var-parameter-chip-hover-text-color': '#182338',
  '--ts-var-parameter-chip-active-background': '#4F5BD5',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#3a4a6b',
  '--ts-var-axis-data-label-color': '#5A6A7E',
  '--ts-var-kpi-hero-color': '#182338',
  '--ts-var-kpi-comparison-color': '#3a4a6b',
  '--ts-var-kpi-positive-change-color': '#1E8E5A',
  '--ts-var-kpi-negative-change-color': '#C84B3A',
  // Spotter landing page "flashlight" — the shipped CSS paints a radial-gradient
  // haze behind the greeting/composer via these two variables (quick search vs
  // deep analysis). Set them to `none` so the landing page renders flat.
  //   .spotter-landing-page-background-module__backgroundSearch  { background: var(--ts-var-spotter-landing-bg-quicksearch, radial-gradient(...)) }
  //   .spotter-landing-page-background-module__backgroundResearch { background: var(--ts-var-spotter-landing-bg-deepanalysis, radial-gradient(...)) }
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  // "Change analysis" modal (Analyze change on a KPI). Both have dedicated
  // variables; the defaults are ThoughtSpot's blue-grey (#f6f8fa / #dee8fa),
  // a foreign hue next to the brand palette.
  '--ts-var-cca-modal-summary-header-background': '#f6f7fb',
  '--ts-var-change-analysis-insights-background': '#eef0fa',
  // Spotter / SpotterViz "Show work" tool cards. Their built-in defaults are a
  // dark slate (#323946 card, #1d232f JSON, white text) meant for the SpotterViz
  // panel, so they look foreign in a themed embed until set here.
  '--ts-var-spotterviz-tool-call-background': '#f6f7fb',
  '--ts-var-spotterviz-tool-border-color': '#e2e5ee',
  '--ts-var-spotterviz-tool-title-color': '#26324e',
  '--ts-var-spotterviz-tool-json-input-background': '#eef0fa',
  '--ts-var-spotterviz-tool-json-input-color': '#2f3b60',
  '--ts-var-spotterviz-text-primary': '#182338',
  '--ts-var-spotterviz-text-secondary': '#5A6A7E',
  '--ts-var-spotterviz-message-background': '#FFFFFF',
  '--ts-var-spotterviz-panel-background': '#FCFCFD',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#4F5BD5',
  '--ts-var-spotterviz-thinking-completed-header-color': '#3a4a6b',
};

export type ThemeName = 'light' | 'dark';

/**
 * Dark counterpart to TS_CSS_VARIABLES — a deep-evergreen dark theme that keeps
 * Northwind's green/coral accents. Passed per-embed for the active theme so the
 * embedded Liveboard / Search / Spotter track the host app's light/dark toggle.
 *   CSS variables: https://developers.thoughtspot.com/docs/css-variables-reference
 */
export const TS_VARS_DARK: Record<string, string> = {
  '--ts-var-root-background': '#0b0d10',
  '--ts-var-root-color': '#e7ecf2',
  '--ts-var-root-secondary-color': '#93a0b4',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#e7ecf2',
  '--ts-var-nav-background': '#0b0d10',
  '--ts-var-nav-color': '#e7ecf2',
  '--ts-var-search-data-button-background': '#4F5BD5',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#14181f',
  '--ts-var-search-bar-text-font-color': '#e7ecf2',
  '--ts-var-search-auto-complete-background': '#14181f',
  '--ts-var-search-auto-complete-font-color': '#e7ecf2',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  // Deeper green + white text so labels stay readable (incl. on hover).
  '--ts-var-button--primary-background': '#4F5BD5',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#3F49B8',
  '--ts-var-button--primary--active-background': '#333C99',
  '--ts-var-button--secondary-background': '#1a212b',
  '--ts-var-button--secondary-color': '#e7ecf2',
  // NOTE: the SDK's *effective* var name is the typo'd "--hovers-background"
  // (default #aac2f8, a light blue) — the clean "--hover-background" is only in
  // the docs. Set both so the label stays readable on hover.
  '--ts-var-button--secondary--hover-background': '#4F5BD5',
  '--ts-var-button--secondary--hovers-background': '#4F5BD5',
  '--ts-var-button--secondary--active-background': '#3F49B8',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#c3cbd6',
  '--ts-var-button--tertiary--hover-background': '#1a212b',
  '--ts-var-viz-title-color': '#e7ecf2',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#93a0b4',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow':
    '0 1px 0 rgba(255,255,255,0.05) inset, 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(45,164,191,0.14)',
  '--ts-var-viz-background': '#14181f',
  '--ts-var-viz-legend-hover-background': '#1a212b',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#1a212b',
  '--ts-var-chip-color': '#c3cbd6',
  '--ts-var-chip--hover-background': '#232a34',
  '--ts-var-chip--hover-color': '#e7ecf2',
  '--ts-var-chip--active-background': '#4F5BD5',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#14181f',
  '--ts-var-menu-color': '#e7ecf2',
  '--ts-var-menu--hover-background': '#1a212b',
  '--ts-var-menu-selected-text-color': '#4F5BD5',
  '--ts-var-menu-separator-background': '#232a34',
  '--ts-var-dialog-body-background': '#14181f',
  '--ts-var-dialog-body-color': '#e7ecf2',
  '--ts-var-dialog-header-background': '#14181f',
  '--ts-var-dialog-header-color': '#e7ecf2',
  '--ts-var-dialog-footer-background': '#14181f',
  '--ts-var-list-hover-background': '#1a212b',
  '--ts-var-list-selected-background': '#232a34',
  '--ts-var-liveboard-layout-background': '#0b0d10',
  '--ts-var-liveboard-header-background': '#0b0d10',
  '--ts-var-liveboard-header-font-color': '#e7ecf2',
  '--ts-var-liveboard-edit-bar-background': '#14181f',
  '--ts-var-liveboard-cross-filter-layout-background': '#14181f',
  '--ts-var-liveboard-tile-background': '#14181f',
  '--ts-var-liveboard-tile-border-color': '#232a34',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#1a212b',
  '--ts-var-liveboard-tab-active-border-color': '#4F5BD5',
  '--ts-var-liveboard-tab-hover-color': '#4F5BD5',
  '--ts-var-liveboard-header-action-button-background': '#1a212b',
  '--ts-var-liveboard-header-action-button-font-color': '#e7ecf2',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is light here, so keep the hover background DARK green for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#4F5BD5',
  '--ts-var-liveboard-header-action-button-active-color': '#3F49B8',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0b0d10',
  '--ts-var-liveboard-group-title-font-color': '#e7ecf2',
  '--ts-var-liveboard-group-border-color': '#232a34',
  '--ts-var-liveboard-group-description-font-color': '#93a0b4',
  '--ts-var-liveboard-group-tile-title-font-color': '#e7ecf2',
  '--ts-var-liveboard-group-tile-description-font-color': '#93a0b4',
  '--ts-var-parameter-chip-background': '#1a212b',
  '--ts-var-parameter-chip-text-color': '#e7ecf2',
  '--ts-var-parameter-chip-hover-background': '#232a34',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#4F5BD5',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#93a0b4',
  '--ts-var-axis-data-label-color': '#93a0b4',
  '--ts-var-answer-data-panel-background-color': '#0b0d10',
  '--ts-var-answer-edit-panel-background-color': '#0b0d10',
  '--ts-var-kpi-hero-color': '#e7ecf2',
  '--ts-var-kpi-comparison-color': '#93a0b4',
  '--ts-var-kpi-positive-change-color': '#35c98a',
  '--ts-var-kpi-negative-change-color': '#ff7a6b',
  // Spotter / Sage conversational surfaces
  '--ts-var-spotter-input-background': '#14181f',
  '--ts-var-spotter-prompt-background': '#1a212b',
  '--ts-var-sage-embed-background-color': '#0b0d10',
  '--ts-var-sage-bar-header-background-color': '#0b0d10',
  '--ts-var-sage-search-box-background-color': '#14181f',
  '--ts-var-sage-search-box-font-color': '#e7ecf2',
  '--ts-var-source-selector-background-color': '#14181f',
  '--ts-var-sage-seed-questions-background': '#14181f',
  '--ts-var-sage-seed-questions-font-color': '#c3cbd6',
  '--ts-var-sage-seed-questions-hover-background': '#1a212b',
  // Spotter landing page "flashlight" — the shipped CSS paints a radial-gradient
  // haze behind the greeting/composer via these two variables (quick search vs
  // deep analysis). Set them to `none` so the landing page renders flat.
  //   .spotter-landing-page-background-module__backgroundSearch  { background: var(--ts-var-spotter-landing-bg-quicksearch, radial-gradient(...)) }
  //   .spotter-landing-page-background-module__backgroundResearch { background: var(--ts-var-spotter-landing-bg-deepanalysis, radial-gradient(...)) }
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  // "Change analysis" modal — see the light-theme note. Without these its
  // summary-table header renders as a white bar inside the dark modal.
  '--ts-var-cca-modal-summary-header-background': '#0f1319',
  '--ts-var-change-analysis-insights-background': '#14181f',
  // Spotter / SpotterViz "Show work" tool cards — see the light-theme note.
  '--ts-var-spotterviz-tool-call-background': '#14181f',
  '--ts-var-spotterviz-tool-border-color': '#232a34',
  '--ts-var-spotterviz-tool-title-color': '#e7ecf2',
  '--ts-var-spotterviz-tool-json-input-background': '#0b0d10',
  '--ts-var-spotterviz-tool-json-input-color': '#9aa5f0',
  '--ts-var-spotterviz-text-primary': '#e7ecf2',
  '--ts-var-spotterviz-text-secondary': '#93a0b4',
  '--ts-var-spotterviz-message-background': '#14181f',
  '--ts-var-spotterviz-panel-background': '#0b0d10',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#9aa5f0',
  '--ts-var-spotterviz-thinking-completed-header-color': '#93a0b4',
  '--ts-var-spotterviz-tool-feedback-button-background': '#1a212b',
  '--ts-var-spotterviz-tool-feedback-button-hover': '#232a34',
};

/** Return the CSS-variable set for the active theme. */
export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_CSS_VARIABLES;
}

/**
 * Dark-only color overrides for surfaces with no dedicated CSS variable (answer
 * cards, floating chrome), plus the KPI headline in the Northwind green. Applied
 * via rules_UNSTABLE only in dark mode.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const DARK_SURFACE = '#14181f';
const DARK_INK = '#e7ecf2';
const surfaceRule = { 'background-color': `${DARK_SURFACE} !important`, color: `${DARK_INK} !important` };
export const TS_RULES_DARK: Record<string, Record<string, string>> = {
  // Text inputs / textareas / field wrappers.
  [[
    'input:not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[class*="input" i]',
    '[class*="field" i]',
    '[class*="searchbox" i]',
  ].join(',')]: { 'background-color': '#0b1f19 !important', color: `${DARK_INK} !important` },
  // Segmented controls / toggles / switchers (e.g. Quick Search | Deep Analysis).
  [[
    '[class*="toggle" i]',
    '[class*="switch" i]',
    '[class*="switcher" i]',
    '[class*="segment" i]',
  ].join(',')]: surfaceRule,
  // Dropdown / select header (dimension & filter pickers).
  '[data-testid="select-dropdown-header"]': { 'background-color': '#0b1f19 !important', color: `${DARK_INK} !important` },
  // Answer / conversation / Spotter / Sage surfaces + the conversations sidebar.
  // NOTE: `[class*="message"]` is scoped to chat containers only — a bare match
  // also hit the "Highlights are ready!" toast text wrapper and painted a
  // dark-surface box behind it. Chat bubbles live inside conversation/spotter/
  // sage/chat, so they still get the surface; the standalone toast does not.
  [[
    '[class*="answer" i]',
    '[class*="conversation" i]',
    '[class*="conversation" i] [class*="message" i]',
    '[class*="spotter" i] [class*="message" i]',
    '[class*="sage" i] [class*="message" i]',
    '[class*="chat" i] [class*="message" i]',
    '[class*="spotter" i]',
    '[class*="sage" i]',
    '[class*="sidebar" i]',
    '[class*="history" i]',
  ].join(',')]: surfaceRule,
  // Floating chrome — panels / modals / menus / footers.
  [[
    '[class*="modal" i]',
    '[class*="dialog" i]',
    '[class*="popover" i]',
    '[class*="flyout" i]',
    '[class*="drawer" i]',
    '[class*="data-panel" i]',
    '[class*="dataPanel" i]',
    '[class*="footer" i]',
  ].join(',')]: surfaceRule,
  // AI "Key insights" / KPI change-analysis narrative callouts (the sparkle text
  // tile) have no dedicated CSS variable and fall back to a dark default text
  // colour — unreadable on the dark tile. Force light text in dark mode. COLOUR
  // ONLY (no background) so KPI semantic up/down values stay green/coral and the
  // tile background from the variables is untouched.
  [[
    '[class*="insight" i]',
    '[class*="insight" i] *',
    '[class*="callout" i]',
    '[class*="callout" i] *',
    '[class*="narrative" i]',
    '[class*="narrative" i] *',
    '[class*="takeaway" i]',
    '[class*="takeaway" i] *',
    '[class*="analysis" i]',
    '[class*="analysis" i] *',
    '[class*="spotiq" i]',
    '[class*="spotiq" i] *',
  ].join(',')]: { color: `${DARK_INK} !important` },
  // ---- "AI Highlights" modal (Liveboard) ---------------------------------
  // This modal ignores the theme almost entirely: the shipped CSS hardcodes a
  // #f6f8fa list pane, #fff cards with #c0c6cf borders and a
  // `color:#323946!important` on the category headings, while the card copy
  // reads from `--ts-var-dialog-body-color` — near-white in the dark theme.
  // Result: light-grey text on white cards. Repaint the panes/cards and
  // recolor the two hardcoded text bits. Class names come from the cluster
  // bundle (`liveboard-highlights-module__*`) and are version-fragile.
  '[class*="liveboard-highlights-module__highlightsListWrapper" i]': {
    'background-color': '#0f1319 !important',
    'border-color': '#232a34 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#232a34 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]:hover': {
    'border-color': '#7c88e6 !important',
  },
  '[class*="liveboard-highlights-module__cardActive" i]': {
    'border-color': '#7c88e6 !important',
    'box-shadow': '0 0 0 1px #7c88e6 !important',
  },
  // Card titles are a light-mode blue (#2770ef) and the section headings are
  // pinned to #323946 !important — both illegible on a dark card.
  [[
    '[class*="liveboard-highlights-module__cardTitleWrapper" i]',
    '[class*="liveboard-highlights-module__cardTitleWrapper" i] *',
    '[class*="liveboard-highlights-module__categoryTitle" i]',
  ].join(',')]: { color: '#9aa5f0 !important' },
  // Detail pane + the "Is this useful?" strip under it.
  [[
    '[class*="liveboard-highlights-module__highlightDetailsWrapper" i]',
    '[class*="liveboard-highlights-module__highlightFeedback" i]',
    '[class*="liveboard-highlights-module__aiAnswerFooterExpanded" i]',
  ].join(',')]: {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#232a34 !important',
    color: `${DARK_INK} !important`,
  },
  // Scrollbars in both panes are painted for a white background.
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-track',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-track',
  ].join(',')]: { 'background-color': '#0f1319 !important' },
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-thumb',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-thumb',
  ].join(',')]: { 'background-color': '#232a34 !important' },
  // ---- "Change analysis" modal (Analyze change on a KPI) -----------------
  // Most of this modal already darkens via the `[class*="modal"]` surfaceRule
  // above, since every class is `change-analysis-modal-module__*`. What escapes
  // it is the summary table (ag-grid here, unlike the DevExtreme viz table) plus
  // a few chips/links that hardcode light-mode colours or ThoughtSpot blue.
  [[
    '[class*="summaryTabModal" i] .ag-header-row',
    '[class*="summaryTabModal" i] .ag-header',
    '[class*="summaryTabModal" i] .ag-header-viewport',
    '[class*="summaryTabModal" i] .ag-header-cell',
  ].join(',')]: {
    'background-color': '#0f1319 !important',
    'border-bottom-color': '#232a34 !important',
  },
  '[class*="summaryTabModal" i] .ag-row': { 'border-color': '#232a34 !important' },
  '[class*="summaryTableHeaderText" i]': { color: '#c3cbd6 !important' },
  // The grey pill beside the viz name and the history buttons both hardcode
  // `--rd-sys-color-background-secondary-action` (#eaedf2) with !important.
  [[
    '[class*="change-analysis-modal-module__customChip" i]',
    '[class*="historyControllerWrapper" i] button',
  ].join(',')]: {
    'background-color': '#1a212b !important',
    color: `${DARK_INK} !important`,
  },
  '[class*="change-analysis-modal-module__selectedAttribute" i]': {
    background: '#1a212b !important',
    color: `${DARK_INK} !important`,
  },
  [[
    '[class*="change-analysis-modal-module__attributeList" i]',
    '[class*="change-analysis-modal-module__loadingSection" i]',
  ].join(',')]: { 'border-color': '#232a34 !important' },
  // "View details" / "Analyze further" links and the insight bullets ship in
  // ThoughtSpot blue (#2770ef) — bring them onto the brand accent.
  [[
    '[class*="viewDetails" i]',
    '[class*="analyzeFurtherText" i]',
  ].join(',')]: { color: '#9aa5f0 !important' },
  '[class*="additionalInsightSquare" i]': { 'background-color': '#9aa5f0 !important' },
  '[class*="legendContainer__nonOutliersIndicator" i]': {
    'background-color': '#232a34 !important',
  },
  // ---- Spotter "Show work" / thinking panel ------------------------------
  // Two different components render here and they behave differently:
  //
  // 1. SpotterViz (the agent inside Liveboards) uses `tool-call-common-module__*`,
  //    which IS variable-driven — see the `--ts-var-spotterviz-tool-*` values in
  //    the theme above. Only its hardcoded slate bits need rules.
  // 2. SpotterEmbed's chat steps use `collapsible-item-response-module__*`, which
  //    exposes NO variables at all — it reads ThoughtSpot's design tokens
  //    straight (`--rd-sys-color-background-base` #ffffff for the card,
  //    `--rd-sys-color-background-on-base` #f6f8fa for the JSON boxes), so it
  //    renders as a white panel inside the dark embed. Rules are the only hook.
  '[class*="collapsible-item-response-module__collapsibleItemContainer" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#232a34 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxWrapper" i]',
    '[class*="collapsible-item-response-module__inputCopyButton" i]',
  ].join(',')]: {
    'background-color': '#0b0d10 !important',
    'border-color': '#232a34 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBox" i]',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] code',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] pre',
  ].join(',')]: { color: '#9aa5f0 !important' },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxHeader" i]',
    '[class*="collapsible-item-response-module__sectionLabel" i]',
  ].join(',')]: { color: '#93a0b4 !important' },
  [[
    '[class*="collapsible-item-response-module__header" i]',
    '[class*="collapsible-item-response-module__title" i]',
    '[class*="collapsible-item-response-module__expandButton" i]',
    '[class*="collapsible-item-response-module__content" i]',
    '[class*="collapsible-item-response-module__sectionContent" i]',
    '[class*="collapsible-item-response-module__inputSection" i]',
    '[class*="collapsible-item-response-module__outputSection" i]',
  ].join(',')]: {
    'background-color': 'transparent !important',
    color: `${DARK_INK} !important`,
  },
  // The code card in Spotter answers has no variable either: it hardcodes
  // `--rd-sys-color-background-sunken` (#f6f8fa). Two-class selectors to
  // out-specify ThoughtSpot's own nested rules.
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockWrapper" i]',
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockLines" i]',
    '[class*="spotter-code-block-module__codeBlockWrapper" i]',
  ].join(',')]: {
    'background-color': '#0b0d10 !important',
    'border-color': '#232a34 !important',
  },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlock" i]',
    '[class*="spotter-code-block-module__codeBlock" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="languageLabel" i]',
    '[class*="spotter-code-block-module__codeBlockHeader" i]',
  ].join(',')]: { color: '#93a0b4 !important' },
  // SpotterViz card bits that hardcode slate rather than read a variable.
  '[class*="tool-call-common-module__separator" i]': {
    'background-color': '#232a34 !important',
  },
  [[
    '[class*="tool-call-common-module__datasetName" i]',
    '[class*="tool-call-common-module__action" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="tool-call-common-module__confidence" i]',
    '[class*="tool-call-common-module__vizId" i]',
  ].join(',')]: { color: '#93a0b4 !important' },
};

/**
 * Welcome message for the host-owned Northwind AI chatbot
 * (from northwind_fin.json > appConfig.chatbot.welcomeMessage, lightly adapted).
 */
export const CHATBOT_WELCOME = CONTENT.chatbot.welcome;

/** Greeting + data model used when the chatbot is opened on the Carriers tab. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the carriers shown here?';

/** Spotter icon sprite (magician/spotter icon) from northwind_fin.json. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "Northwind AI" everywhere,
 * plus the landing-page description override (from
 * northwind_fin.json > stylingConfig.embeddedContent.strings / stringIDs).
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: CONTENT.aiName,
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about sales.',
};

// ---------------------------------------------------------------------------
// Embed flags — from northwind_fin.json > stylingConfig.embedFlags
// ---------------------------------------------------------------------------

export const LIVEBOARD_EMBED_FLAGS = {
  enable2ColumnLayout: true,
  isLiveboardStylingAndGroupingEnabled: true,
  // Masterpiece layout — richer KPI/headline tile styling & grouping.
  // https://developers.thoughtspot.com/docs/Interface_LiveboardViewConfig#_isliveboardmasterpiecesenabled
  isLiveboardMasterpiecesEnabled: true,
};

export const SPOTTER_EMBED_FLAGS = {
  updatedSpotterChatPrompt: true,
  spotterSidebarConfig: {
    enablePastConversationsSidebar: true,
    spotterSidebarTitle: 'My Conversations',
    // Start collapsed so the answer canvas gets full width when Spotter opens.
    spotterSidebarDefaultExpanded: false,
  },
};

/**
 * Extra customCSS rules injected into every embed so ThoughtSpot's own buttons
 * carry the Northwind blue↔green gradient and the KPI (headline) tiles pop with the
 * brand gradient. ThoughtSpot class names are version-dependent — these use
 * broad candidate selectors; if a surface isn't picked up, Inspect the iframe
 * and tighten the selector to the real class name.
 */
export const Northwind_EMBED_RULES: Record<string, Record<string, string>> = {
  // No gradient on KPI tiles / viz titles by default — embeds use ThoughtSpot's
  // native styling, which already follows the theme via the CSS variables above.
  // Only brand the AI / Spotter header button (an off-brand green pill on some
  // clusters) with a SOLID color. To opt into brand gradients on KPIs/titles,
  // add background linear-gradient rules here (buttons must stay solid).
  '[class*="aiHighlight" i], [class*="ai-highlight" i], [class*="AIHighlights" i], [data-testid*="AIHighlight" i], [class*="spotterLaunch" i], [class*="spotter-button" i], [class*="spotter" i][class*="btn" i]:not([class*="spotterButtonStyles" i]), [class*="spotter" i][class*="button" i]:not([class*="spotterButtonStyles" i]), [class*="spotter" i][class*="pill" i], [class*="spotter" i][class*="nudge" i], [class*="sage-button" i], [class*="sage" i][class*="btn" i], [class*="sage" i][class*="button" i], [class*="sage" i][class*="pill" i], [class*="askSage" i], [class*="ask-sage" i], [class*="nudge" i]':
    {
      background: '#4F5BD5 !important',
      'background-image': 'none !important',
      color: '#ffffff !important',
      'border-color': 'transparent !important',
    },
};

/** Google-Fonts stylesheet loaded INTO embed iframes so embedded ThoughtSpot
 * surfaces render in the same faces as the host UI (Plus Jakarta Sans for text,
 * Fraunces for titles) — iframes can't see the host page's fonts. customCSSUrl.
 */
export const TS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

/** "Watch video" link shown in the Northwind AI pane. */
export const Northwind_VIDEO_URL = 'https://www.northwind.com/platform/conversations';

/** Sample questions shown on the custom Northwind AI landing pane. */
export const Northwind_SAMPLE_QUESTIONS = [...CONTENT.sampleQuestions];

/** Trial / upgrade prompt shown in the Northwind AI pane after the 2nd query. */
export const Northwind_TRIAL_QUESTIONS = 20;
export const TRIAL_TRIGGER = CONTENT.trialQuestionTrigger;
export const Northwind_UPGRADE_URL = CONTENT.website + '/pricing';

/**
 * Hide the Spotter embed's own composer / input bar on the Northwind AI screen
 * — questions are driven from the host-side pane on the right, so the in-embed
 * "Enter your question" box (and its Quick/Deep toggle) is redundant. Injected
 * via rules_UNSTABLE. Class names are version-fragile; verify via Inspect if a
 * release renames them.
 */
/**
 * Spotter answer-action buttons — Pin / Save / Edit / Add to memory.
 *
 * These are NOT primary buttons, despite what the CSS-variables reference
 * implies. In the shipped stylesheet they are tertiary-styled: transparent
 * background, label + icon coloured from `--ts-var-button--tertiary-color`,
 * e.g.
 *   .conv-assist-answer-module__caAnswerAction.conv-assist-answer-module__spotterButtonStyles p
 *   .conv-assist-edit-button-module__editActionsButton.conv-assist-edit-button-module__spotterButtonStyles
 *
 * They turn brand-coloured because ThoughtSpot's CSS modules name these classes
 * `…spotterButtonStyles`, so the branding rule's
 * `[class*="spotter"][class*="button"]` selector matches them and fills them
 * `!important` — which no CSS variable can beat. `spotterCustomizations` drops
 * that rule inside the Spotter embeds; these rules then clear the dark surface
 * fill that TS_RULES_DARK puts on anything matching `[class*="answer"]`, so the
 * actions sit flat next to Download and the "…" menu.
 */
const TRANSPARENT = {
  background: 'transparent !important',
  'background-color': 'transparent !important',
  'border-color': 'transparent !important',
  'box-shadow': 'none !important',
};
export const SPOTTER_ANSWER_ACTION_RULES: Record<string, Record<string, string>> = {
  [[
    '[class*="spotterButtonStyles" i]',
    '[class*="caAnswerAction" i]',
    '[class*="convAssistPinnerContainer" i]',
    '[class*="editActionsButton" i]',
    '[class*="spotterButtonStyles" i] button',
    '[class*="caAnswerAction" i] button',
  ].join(',')]: TRANSPARENT,
};

/**
 * Spotter landing page — kill the radial "flashlight" wrapper outright, in
 * addition to blanking the two `--ts-var-spotter-landing-bg-*` variables, so
 * the greeting + composer sit on a flat background.
 *   .spotter-landing-page-background-module__backgroundWrapper
 */
export const SPOTTER_LANDING_FLAT_RULES: Record<string, Record<string, string>> = {
  '[class*="spotter-landing-page-background" i]': {
    background: 'none !important',
    'background-image': 'none !important',
    opacity: '0 !important',
  },
};

const HIDE = { display: 'none !important' };
export const HIDE_SPOTTER_INPUT_RULES: Record<string, Record<string, string>> = {
  '[class*="composer" i]': HIDE,
  '[class*="promptInput" i]': HIDE,
  '[class*="prompt-input" i]': HIDE,
  '[class*="chatInput" i]': HIDE,
  '[class*="chat-input" i]': HIDE,
  '[class*="conversationInput" i]': HIDE,
  '[class*="conversation-input" i]': HIDE,
  '[class*="conversationFooter" i]': HIDE,
  '[class*="conversation-footer" i]': HIDE,
  '[class*="bottomBar" i]': HIDE,
  '[class*="searchInputContainer" i]': HIDE,
  '[data-testid*="conversation-input" i]': HIDE,
  '[data-testid*="spotter-input" i]': HIDE,
};

// ---------------------------------------------------------------------------
// Host-side filters on the Analytics liveboard.
//   Hierarchy: OWNER_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
// Option lists are fetched from FILTER_SOURCE_ID via the searchdata REST API;
// selections are pushed to the liveboard as runtime filters. Column names must
// match the data source's column display names for the runtime filter to bind.
//   Runtime filters: https://developers.thoughtspot.com/docs/runtime-filters
// ---------------------------------------------------------------------------

/**
 * Model queried for the filter option lists (same model the liveboard uses).
 * Hierarchy: SEGMENT_COLUMN → REP_COLUMN → CADENCE_NAME_COLUMN. Date: DATE_COLUMN.
 */
export const FILTER_SOURCE_ID = WORKSHEET_ID;
export const SEGMENT_COLUMN = 'Rep Segment';
export const REP_COLUMN = 'Rep Name';
export const CADENCE_NAME_COLUMN = 'Cadence Name';
export const DATE_COLUMN = 'Load Date';

/**
 * Hide the native runtime-filter pills / filter bar ThoughtSpot renders on the
 * liveboard header — we drive filters from the host UI instead. Injected into
 * the liveboard iframe via rules_UNSTABLE. Class names are version-fragile;
 * verify/adjust via right-click → Inspect if a release renames them.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const PILL_HIDE = { display: 'none !important' };
export const HIDE_FILTER_PILL_RULES: Record<string, Record<string, string>> = {
  '[class*="filterChip" i]': PILL_HIDE,
  '[class*="filter-chip" i]': PILL_HIDE,
  '[class*="appliedFilter" i]': PILL_HIDE,
  '[class*="applied-filter" i]': PILL_HIDE,
  '[class*="pinboardFilter" i]': PILL_HIDE,
  '[class*="pinboard-filter" i]': PILL_HIDE,
  '[class*="filterBar" i]': PILL_HIDE,
  '[class*="filter-bar" i]': PILL_HIDE,
  '[data-testid*="filter-chip" i]': PILL_HIDE,
  '[data-testid*="pinboard-filters" i]': PILL_HIDE,
};


// ---------------------------------------------------------------------------
// Host-rendered liveboard chrome + chart recolour (portable treatment).
//   Ported from the per-client demos so the base template produces the same
//   "embedded content reads as part of the portal" look the custom builds have:
//   the liveboard's own header + tab strip are hidden with CSS and the host app
//   re-renders them, and native Highcharts series are recoloured to the brand.
//   All of this is layout-neutral — it renders identically under the top-bar and
//   the sidebar nav. Rebrand codemod: swap the right-hand values of
//   CHART_COLOR_PALETTE (and the KPI colour in chartPaletteRules) per client.
// ---------------------------------------------------------------------------

/**
 * Hide the embedded liveboard's OWN header bar + tab strip with CSS (not the
 * SDK's `hideLiveboardHeader` flag — that unmounts the header and with it the AI
 * Highlights flow: HostEvent.AIHighlights still generates, but "View" never
 * opens the panel). Hidden this way the header stays mounted (so the highlights
 * modal, a body-level portal, still works) but is invisible — the host app
 * re-renders the page title, the liveboard tabs and a white-labelled AI
 * Highlights button itself.
 *   Class names come from the cluster bundle — version-fragile.
 */
export const HIDE_LIVEBOARD_CHROME_RULES: Record<string, Record<string, string>> = {
  '[class*="pinboard-header-module__pinboardHeaderContainer" i]': { display: 'none !important' },
  '[class*="pinboard-tab-panel-module__tabPanelContainer" i]': { display: 'none !important' },
};

/**
 * Brand categorical palette for native ThoughtSpot charts. The rebrand codemod
 * rewrites these per client (same mechanism as the theme-token swaps). The
 * default is a neutral multi-hue ramp led by the template green.
 */
export const CHART_COLOR_PALETTE = [
  '#15ae6e', '#2f7fb8', '#4fb3a9', '#f2a541', '#ea6f5a', '#8e7cc3', '#c8304a', '#7d8a96',
];
export const VIZ_OVERRIDES = {
  chart: { legend: { colorPalette: { colors: CHART_COLOR_PALETTE } } },
};

const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// ThoughtSpot's default categorical palette, remapped value-by-value onto the
// brand palette (belt-and-braces alongside the by-index recolour below).
const CHART_PALETTE_REMAP: [from: string, to: string][] = [
  ['#2770EF', CHART_COLOR_PALETTE[0]],
  ['#A67F31', CHART_COLOR_PALETTE[3]],
  ['#06BF7F', CHART_COLOR_PALETTE[2]],
  ['#8C62F5', CHART_COLOR_PALETTE[5]],
  ['#FF8142', CHART_COLOR_PALETTE[4]],
  ['#48D1E0', CHART_COLOR_PALETTE[1]],
  ['#FCC838', CHART_COLOR_PALETTE[6]],
];

/**
 * Chart colours for native ThoughtSpot charts (Highcharts SVG). Series colours
 * are SVG `stroke`/`fill` ATTRIBUTES, which a stylesheet rule overrides — so this
 * recolours even a single-measure bar chart (whose colour is the cluster's chart
 * "primary"), which `visualOverrides.legend.colorPalette` alone does NOT touch.
 * (a) recolours BY structural `highcharts-color-{n}` class (robust to any source
 * palette), (b) remaps the default categorical hexes, and (c) forces KPI
 * sparklines to the brand colour. Applied on every embed via rules_UNSTABLE.
 *   NOTE: MUZE_STUDIO vizzes + Spotter answer bars read the shared *cluster*
 *   chart palette, which portal CSS cannot reach — recolour those via a TML
 *   re-import. https://developers.thoughtspot.com/docs/css-rules
 */
export function chartPaletteRules(theme: ThemeName): Record<string, Record<string, string>> {
  const kpi = theme === 'dark' ? '#1bb978' : CHART_COLOR_PALETTE[0];
  const [kr, kg, kb] = rgbOf(kpi);
  const SP = '[data-testid="kpi_sparkline" i]';
  return {
    ...Object.fromEntries(
      CHART_COLOR_PALETTE.flatMap((c, i) => {
        const [r, g, b] = rgbOf(c);
        const CN = `highcharts-color-${i}`;
        return [
          [`.highcharts-graph.${CN}`, { stroke: `${c} !important` }],
          [
            `.highcharts-point.${CN}, .${CN}.highcharts-point, .highcharts-markers.${CN} path, .highcharts-data-labels .${CN}`,
            { fill: `${c} !important`, stroke: `${c} !important` },
          ],
          [`.highcharts-area.${CN}`, { fill: `rgba(${r}, ${g}, ${b}, 0.18) !important` }],
          [`.highcharts-legend-item .${CN}, .highcharts-legend-item.${CN} .highcharts-point`, { fill: `${c} !important`, stroke: `${c} !important` }],
        ];
      }),
    ),
    ...Object.fromEntries(
      CHART_PALETTE_REMAP.flatMap(([from, to]) => {
        const [r, g, b] = rgbOf(from);
        const [tr, tg, tb] = rgbOf(to);
        return [
          [`[stroke="${from}" i]`, { stroke: `${to} !important` }],
          [`[fill="${from}" i]`, { fill: `${to} !important` }],
          [
            `[fill="rgba(${r},${g},${b},0.2)"], [fill="rgba(${r}, ${g}, ${b}, 0.2)"]`,
            { fill: `rgba(${tr}, ${tg}, ${tb}, 0.2) !important` },
          ],
        ];
      }),
    ),
    [`${SP} .highcharts-graph, ${SP} path:not([class])`]: { stroke: `${kpi} !important` },
    [`${SP} .highcharts-area`]: { fill: `rgba(${kr}, ${kg}, ${kb}, 0.12) !important` },
    [`${SP} .highcharts-markers *, ${SP} .highcharts-point`]: { fill: `${kpi} !important`, stroke: `${kpi} !important` },
  };
}

/**
 * Paint Spotter's own root surfaces the page colour so the embedded chat reads as
 * part of the portal (no "box in a box"). Pass as extraRules to
 * spotterCustomizations on the standalone Ask tab.
 */
export function spotterSurfaceRules(
  theme: ThemeName,
  light = '#f7f8f9',
  dark = '#0b1015',
): Record<string, Record<string, string>> {
  const bg = theme === 'dark' ? dark : light;
  return {
    [['html', 'body', '#root', '[class*="embed-module" i]', '[class*="authenticated-app-view-module" i]', '[class*="chat-module" i]'].join(', ')]: {
      background: `${bg} !important`,
      'background-color': `${bg} !important`,
    },
  };
}

/** Hide Spotter's past-conversations sidebar + the "Powered by ThoughtSpot"
 *  footer on the standalone Ask tab. */
export const SPOTTER_CHROME_RULES: Record<string, Record<string, string>> = {
  '[class*="chat-history-sidebar-module__chatHistorySidebar" i]': { display: 'none !important' },
  '[class*="embed-module__footerWrapper" i]': { visibility: 'hidden !important' },
};

/** Let Spotter's user-command bubble use the full panel width. */
export const SPOTTER_FIT_RULES: Record<string, Record<string, string>> = {
  '[class*="convex-user-command-module__userCmd" i]': {
    width: 'auto !important',
    'max-width': '100% !important',
    'min-width': '0 !important',
    'box-sizing': 'border-box !important',
  },
};

// ---------------------------------------------------------------------------
// Firework-style Overview (the data-driven home page).
//   KPI + chart cards embed individual liveboard vizzes (by id) so the host
//   controls the layout; an in-flow "what changed" answer is queried over REST;
//   an ask bar drives a Spotter pane. Rebrand codemod fills DASHBOARD_KPIS /
//   DASHBOARD_CHARTS / WHAT_CHANGED (ids, labels, measures) from spec.overview,
//   and swaps the accent (--sl-green token + the send-button blue) per client.
// ---------------------------------------------------------------------------

/** KPI cards on the Overview — one liveboard viz each (id from the liveboard's
 *  TML / metadata). Placeholders until spec.overview fills them; only rendered
 *  when FLAGS.homeStyle === 'overview'. */
export const DASHBOARD_KPIS: { id: string; label: string; note: string }[] = [
  { id: 'REPLACE_KPI_VIZ_1', label: 'Revenue', note: 'Latest period' },
  { id: 'REPLACE_KPI_VIZ_2', label: 'Conversion rate', note: 'Latest period' },
  { id: 'REPLACE_KPI_VIZ_3', label: 'Orders', note: 'Latest period' },
  { id: 'REPLACE_KPI_VIZ_4', label: 'Avg order value', note: 'Latest period' },
];
/** Chart cards on the Overview — one liveboard viz each. `reportTabId` is unused
 *  by default (Explore just opens the Analytics tab). */
export const DASHBOARD_CHARTS: { id: string; title: string; subtitle: string; reportTabId?: string }[] = [
  { id: 'REPLACE_CHART_VIZ_1', title: 'Trend', subtitle: 'Over time' },
  { id: 'REPLACE_CHART_VIZ_2', title: 'By segment', subtitle: 'Across the business' },
  { id: 'REPLACE_CHART_VIZ_3', title: 'By category', subtitle: 'Breakdown' },
  { id: 'REPLACE_CHART_VIZ_4', title: 'Top performers', subtitle: 'Leaders' },
];

/** The in-flow "what changed" answer: latest period vs the one before, per
 *  measure, with the dimension value that drove the move. Codemod fills from
 *  spec.overview.whatChanged. */
export const WHAT_CHANGED: ChangeSpec[] = [
  { label: 'Revenue', measure: 'REPLACE_MEASURE', dimension: 'REPLACE_DIMENSION', format: 'currency' },
];
/** Date column every WHAT_CHANGED measure is bucketed on (monthly). */
export const CHANGE_DATE_COLUMN = DATE_COLUMN;

/** Suggestion chips under the Overview ask bar. Codemod may replace per domain. */
export const OVERVIEW_SUGGESTIONS = [
  'Top 5 by revenue last month',
  'Which segment has the best conversion rate?',
  'How did orders trend this quarter?',
];

const VIZ_BARE_RULES: Record<string, Record<string, string>> = {
  '[class*="answer-title-module__titleContainer" i]': { display: 'none !important' },
  'html, body, #root': { background: 'transparent !important' },
  '[class*="embed-module__footerWrapper" i]': { display: 'none !important' },
  '[class*="embed-module__tsEmbedContainer" i]': {
    height: '100vh !important',
    'min-height': '0 !important',
    overflow: 'hidden !important',
  },
  '[class*="embed-module__tsEmbedContainer" i] div:has(iframe), [class*="chart-module__chartIframe" i] iframe': {
    height: '100% !important',
    'min-height': '0 !important',
    'max-height': '100% !important',
  },
};

/** KPI card — one KPI viz inside a white host card; host prints the label, the
 *  embed shows the hero figure + change, sparkline/sublabel hidden. */
export function dashboardKpiStyle(theme: ThemeName): { vars: Record<string, string>; rules: Record<string, Record<string, string>> } {
  const dark = theme === 'dark';
  const hero = dark ? '#F2F3F5' : '#2A2F35';
  const muted = dark ? '#C6C8CD' : '#5F6470';
  return {
    vars: {
      '--ts-var-root-background': 'transparent',
      '--ts-var-viz-background': 'transparent',
      '--ts-var-liveboard-layout-background': 'transparent',
      '--ts-var-liveboard-tile-background': 'transparent',
      '--ts-var-viz-box-shadow': 'none',
      '--ts-var-kpi-hero-color': hero,
      '--ts-var-kpi-comparison-color': muted,
      '--ts-var-kpi-positive-change-color': dark ? '#7DD3A0' : '#17663D',
      '--ts-var-kpi-negative-change-color': dark ? '#FF9A8F' : '#A5281B',
    },
    rules: {
      ...VIZ_BARE_RULES,
      '[data-testid="kpi_sparkline" i], [class*="kpi-module__analyzeBtn" i], [class*="kpi-module__sublabel" i]': {
        display: 'none !important',
      },
      '*': { 'background-color': 'transparent !important', 'box-shadow': 'none !important', 'border-color': 'transparent !important' },
      '[class*="embed-module__tsEmbedContainer" i] div:has([class*="kpi-module__kpi" i]), [class*="kpi-module__kpi" i]': {
        height: '100% !important',
        'min-height': '0 !important',
        'max-height': '100% !important',
        margin: '0 !important',
        padding: '0 !important',
      },
      '[class*="kpi-module__kpi" i], [class*="kpi-module__heroDataContainer" i], [class*="kpi-module__comparison" i]': {
        display: 'flex !important',
        'flex-direction': 'column !important',
        'align-items': 'flex-start !important',
        'justify-content': 'center !important',
        'text-align': 'left !important',
        width: '100% !important',
        padding: '0 !important',
      },
      '[class*="kpi-module__hero" i], [class*="kpi-module__hero" i] *': {
        'font-size': '32px !important',
        'font-weight': '500 !important',
        'letter-spacing': '-0.01em !important',
        'line-height': '1.1 !important',
        color: `${hero} !important`,
      },
      '[class*="kpi-module__comparisonText" i]': {
        display: 'flex !important',
        'flex-direction': 'row !important',
        'align-items': 'center !important',
        gap: '6px !important',
        'font-size': '12px !important',
        color: `${muted} !important`,
      },
      '[class*="kpi-module__comparisonText" i] *': { color: `${muted} !important`, 'font-size': '12px !important' },
      '[class*="kpi-module__difflabel" i]': {
        'background-color': `${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(42, 47, 53, 0.06)'} !important`,
        'border-radius': '999px !important',
        padding: '1px 8px !important',
      },
      '[class*="kpi-module__difflabel" i] *': { 'font-weight': '700 !important' },
    },
  };
}

/** Chart card — one chart viz inside a white host card, no tile chrome. */
export function dashboardChartStyle(theme: ThemeName): { vars: Record<string, string>; rules: Record<string, Record<string, string>> } {
  const card = theme === 'dark' ? '#1A1D24' : '#FFFFFF';
  return {
    vars: {
      '--ts-var-root-background': card,
      '--ts-var-viz-background': card,
      '--ts-var-liveboard-layout-background': card,
      '--ts-var-liveboard-tile-background': card,
      '--ts-var-viz-box-shadow': 'none',
      '--ts-var-viz-border-radius': '0',
    },
    rules: {
      ...VIZ_BARE_RULES,
      '[data-testid="layout-item"], [class*="vizContainer" i], [class*="answerVizContainer" i]': {
        'box-shadow': 'none !important',
        'border-color': 'transparent !important',
        'background-color': `${card} !important`,
      },
    },
  };
}

// Overview Spotter pane: hide the past-conversations sidebar and fit the narrow
// (~420px) pane; simple prompt box (send button only).
const SIMPLE_SPOTTER_INPUT_RULES: Record<string, Record<string, string>> = {
  [[
    '[data-testid="chat-input-controls"]',
    '[class*="spotter-prompt-bar-module__leftCluster" i]',
    '[class*="chat-connectors-module__spotterToolsButtonWrapper" i]',
    '[data-testid="spotter-starter-pill-container"]',
  ].join(',')]: { display: 'none !important' },
  '[class*="spotter-prompt-bar-module__barInner" i]': {
    display: 'flex !important',
    'flex-direction': 'row !important',
    'align-items': 'center !important',
    gap: '6px !important',
    'padding-right': '8px !important',
  },
  '[class*="spotter-prompt-bar-module__composerRow" i]': { flex: '1 1 auto !important', 'min-width': '0 !important' },
  '[class*="spotter-prompt-bar-module__actions" i]': { flex: 'none !important', width: 'auto !important', margin: '0 !important', padding: '0 !important' },
};

export const SPOTTER_PANE_RULES: Record<string, Record<string, string>> = {
  ...SIMPLE_SPOTTER_INPUT_RULES,
  [[
    '[class*="past-conversation" i]',
    '[class*="conversation-sidebar" i]',
    '[class*="conversation-history" i]',
    '[class*="chat-history" i]',
    '[data-testid*="past-conversation" i]',
    '[data-testid*="spotter-sidebar" i]',
  ].join(',')]: { display: 'none !important' },
  '[class*="embed-module__tsEmbedContainer" i], [class*="chat-module__chatContainerWrapper" i]': { 'min-width': '0 !important' },
  '[class*="chat-module__chatContentArea" i]': { 'overflow-x': 'hidden !important' },
  '[class*="chat-module__chatContentArea" i] [class*="module__" i]': { 'min-width': '0 !important' },
  '[class*="chat-input-module__chatInputContainer" i]': {
    'min-width': '0 !important',
    width: '100% !important',
    'max-width': '100% !important',
    padding: '0 10px 10px !important',
  },
  '[class*="query-suggestions-module__querySuggestionsContainer" i]': { width: '100% !important', 'max-width': '100% !important' },
  '[class*="landing-page-module__landingPageWrapper" i]': { padding: '0 14px !important' },
  '[class*="embed-module__footerWrapper" i]': { display: 'none !important' },
};

/** A plain Spotter prompt box (text area + round send button). The accent blue
 *  below (#2f7fb8 family) is swapped to the brand by the codemod. */
export function spotterInputStyle(theme: ThemeName): Record<string, Record<string, string>> {
  const dark = theme === 'dark';
  const accent = '#2f7fb8';
  const accentHover = '#276a9c';
  const card = {
    position: 'relative !important',
    background: `${dark ? '#1A1D24' : '#FFFFFF'} !important`,
    'background-image': 'none !important',
    border: `1px solid ${dark ? '#2E333D' : '#E3E6EB'} !important`,
    'border-radius': '16px !important',
    'box-shadow': `${dark ? '0 10px 28px rgba(0, 0, 0, 0.35)' : '0 1px 2px rgba(10, 10, 10, 0.04), 0 8px 24px rgba(47, 127, 184, 0.08)'} !important`,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };
  const focus = { 'border-color': `${accent} !important`, 'box-shadow': `0 0 0 3px rgba(47, 127, 184, 0.18) !important` };
  const CARD = '[class*="updated-chat-input-module__chatInputContainerWrapper" i]:not([class*="ForBorder" i])';
  return {
    '[class*="chat-input-module__" i]': { background: 'transparent !important', 'box-shadow': 'none !important', 'border-color': 'transparent !important' },
    [CARD]: card,
    [`${CARD}:focus-within`]: focus,
    '[data-testid="spotter-prompt-bar"]': card,
    '[data-testid="spotter-prompt-bar"]:focus-within': focus,
    [[
      '[class*="chatInputContainerWrapperForBorder" i] [class*="segment-control-module" i]',
      '[data-testid="conv-assist-data-source-selection-btn"]',
      '[data-testid="chat-connectors-button"]',
    ].join(',')]: { display: 'none !important' },
    '[data-testid="chat-input-container-id"]': { padding: '0 14px !important' },
    [`${CARD} [data-testid="conv-assist-send-btn"]`]: {
      position: 'absolute !important',
      right: '9px !important',
      top: '50% !important',
      transform: 'translateY(-50%) !important',
    },
    '[data-testid="conv-assist-chat-input"]': {
      display: 'block !important',
      width: '100% !important',
      height: 'auto !important',
      'min-height': '22px !important',
      'max-height': '140px !important',
      padding: '17px 52px 9px 2px !important',
      'font-size': '14.5px !important',
      'line-height': '1.4 !important',
      color: `${dark ? '#F3F4F6' : '#0A0A0A'} !important`,
      background: 'transparent !important',
    },
    '[data-testid="conv-assist-send-btn"]': {
      display: 'grid !important',
      'place-items': 'center !important',
      width: '36px !important',
      height: '36px !important',
      'min-width': '36px !important',
      'border-radius': '50% !important',
      border: '0 !important',
      background: `${accent} !important`,
      color: '#FFFFFF !important',
      cursor: 'pointer !important',
    },
    '[data-testid="conv-assist-send-btn"]:hover': { background: `${accentHover} !important` },
    '[data-testid="conv-assist-send-btn"] svg, [data-testid="conv-assist-send-btn"] path': { color: '#FFFFFF !important', fill: '#FFFFFF !important' },
  };
}
