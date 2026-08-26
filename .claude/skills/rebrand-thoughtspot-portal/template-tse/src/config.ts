import { CONTENT } from './content';
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
  [[
    '[class*="answer" i]',
    '[class*="conversation" i]',
    '[class*="message" i]',
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

