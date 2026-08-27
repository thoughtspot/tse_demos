// ---------------------------------------------------------------------------
// Central configuration for the SalesSpot Analytics mockup.
// IDs + ThoughtSpot styling are sourced from salesspot_fin.json so that every
// embedded ThoughtSpot component shares the exact same look & feel.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster (from appConfig.thoughtspotUrl) */
export const THOUGHTSPOT_HOST = 'https://se-thoughtspot-cloud.thoughtspot.cloud';

/** The Analytics liveboard embedded in Tab 2 (Analytics). */
export const ANALYTICS_LIVEBOARD_ID = '431cb7d1-7551-48ca-ab04-2261bb40a6e8';

/** Liveboard shown inline (per-cadence) on the Inline Insights tab. */
export const INLINE_INSIGHTS_LIVEBOARD_ID =
  'd57c9aeb-2c50-4afe-857a-327fad94c7cc';

/** Worksheet/model the Inline Insights tab queries for cadence names. */
export const CADENCE_WORKSHEET_ID = '06f92f41-00e5-4d81-8213-8a6616f83f49';

/** Saved Answer previously embedded on the Signals tab (kept for reference). */
export const SIGNALS_ANSWER_ID = 'cd7bd15c-a207-4bde-aef1-ed0a6e3dad06';

/**
 * Signals tab now embeds a single VISUALIZATION from the Analytics liveboard
 * (LiveboardEmbed + liveboardId + vizId), not a saved Answer.
 */
export const SIGNALS_VIZ_ID = 'ab68d5d8-6cf0-43bc-bccd-4f5caca665a2';

/** Code-based custom action ("Re-engage cadence") on the Signals answer. */
export const REENGAGE_ACTION_ID = 'reengage-cadence';
export const REENGAGE_ACTION_NAME = 'Re-engage cadence';

/**
 * Candidate column names for "cadence" on the worksheet. The first one that
 * returns data is used both to list cadence names and as the runtime-filter
 * column name on the inline liveboard.
 */
export const CADENCE_COLUMN_CANDIDATES = [
  'Cadence Name',
  'Cadence',
  'Cadence Step Name',
  'Cadence Step',
];

/**
 * Candidate column names for the per-cadence detail metrics shown next to each
 * cadence in the Inline Insights UI. The first candidate that returns data for
 * each metric is used; metrics with no match are simply omitted.
 */
export const CADENCE_DETAIL_COLUMNS: Record<
  'owner' | 'created' | 'emailsReplied' | 'influencedPipeline',
  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }
> = {
  owner: {
    label: 'Owner',
    format: 'text',
    candidates: ['Cadence Owner', 'Owner', 'Cadence Creator', 'Created By', 'Owner Name'],
  },
  created: {
    label: 'Created',
    format: 'date',
    candidates: ['Cadence Create Date', 'Create Date', 'Created Date', 'Cadence Created Date', 'Created'],
  },
  emailsReplied: {
    label: 'Emails Replied',
    format: 'number',
    candidates: ['Emails Replied', 'Email Replies', 'Replies', 'Total Emails Replied', 'Reply Count'],
  },
  influencedPipeline: {
    label: 'Influenced Pipeline',
    format: 'currency',
    candidates: ['Influenced Pipeline', 'Pipeline Influenced', 'Influenced Pipeline Amount', 'Pipeline'],
  },
};

/**
 * Worksheet / model used everywhere Spotter runs — the "SalesSpot AI" Spotter
 * modal (Analytics tab), the Ask SalesSpot Spotter embed, and the host chatbot.
 */
export const WORKSHEET_ID = '06f92f41-00e5-4d81-8213-8a6616f83f49';

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — taken verbatim from
// salesspot_fin.json > stylingConfig.embeddedContent
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface. */
export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#FDFEFE',
  '--ts-var-root-color': '#073B3A',
  '--ts-var-root-font-family': '"Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif',
  '--ts-var-application-color': '#0A4A4A',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#0A4A4A',
  '--ts-var-search-data-button-background': '#0C6E6C',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#F6FAFA',
  '--ts-var-search-bar-text-font-color': '#0A4A4A',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#0C6E6C',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#0A5C5A',
  '--ts-var-button--primary--active-background': '#084B49',
  '--ts-var-button--secondary-background': '#E9F3F2',
  '--ts-var-button--secondary-color': '#0A4A4A',
  // See dark-theme note: the SDK reads the typo'd "--hovers-background".
  '--ts-var-button--secondary--hover-background': '#DDECEC',
  '--ts-var-button--secondary--hovers-background': '#DDECEC',
  '--ts-var-button--secondary--active-background': '#CFE3E2',
  '--ts-var-viz-title-color': '#073B3A',
  '--ts-var-viz-title-font-family': '"Fraunces", "Iowan Old Style", "Georgia", serif',
  '--ts-var-viz-description-color': '#1D5A59',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(7, 59, 58, 0.06), 0 16px 44px rgba(7, 59, 58, 0.16)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#E8F4F3',
  '--ts-var-chip-color': '#0A4A4A',
  '--ts-var-chip--hover-background': '#D9ECEA',
  '--ts-var-chip--hover-color': '#073B3A',
  '--ts-var-chip--active-background': '#0C6E6C',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#0A4A4A',
  '--ts-var-menu--hover-background': '#F1F7F7',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#0A4A4A',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#073B3A',
  '--ts-var-list-hover-background': '#F1F7F7',
  '--ts-var-list-selected-background': '#E4F0EF',
  '--ts-var-liveboard-layout-background': '#FDFEFE',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#073B3A',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#D7E7E6',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#F4FAF9',
  '--ts-var-liveboard-tab-active-border-color': '#15AE6E',
  '--ts-var-liveboard-tab-hover-color': '#0C6E6C',
  '--ts-var-liveboard-header-action-button-background': '#E8F4F3',
  '--ts-var-liveboard-header-action-button-font-color': '#0A4A4A',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is dark here, so keep the hover background LIGHT for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#D9ECEA',
  '--ts-var-liveboard-header-action-button-active-color': '#CFE3E2',
  '--ts-var-parameter-chip-background': '#E8F4F3',
  '--ts-var-parameter-chip-text-color': '#0A4A4A',
  '--ts-var-parameter-chip-hover-background': '#D9ECEA',
  '--ts-var-parameter-chip-hover-text-color': '#073B3A',
  '--ts-var-parameter-chip-active-background': '#0C6E6C',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#1D5A59',
  '--ts-var-axis-data-label-color': '#2C6A69',
  '--ts-var-kpi-hero-color': '#073B3A',
  '--ts-var-kpi-comparison-color': '#1D5A59',
  '--ts-var-kpi-positive-change-color': '#1E8E5A',
  '--ts-var-kpi-negative-change-color': '#C84B3A',
  // Spotter landing "flashlight" radials off, + change-analysis modal and the
  // Spotter "Show work" tool cards (ThoughtSpot ships dark-slate defaults for
  // these even in light mode). Neutral light-green surfaces.
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  '--ts-var-cca-modal-summary-header-background': '#f2f7f5',
  '--ts-var-change-analysis-insights-background': '#eaf3ee',
  '--ts-var-spotterviz-tool-call-background': '#f2f7f5',
  '--ts-var-spotterviz-tool-border-color': '#dae7e1',
  '--ts-var-spotterviz-tool-title-color': '#073B3A',
  '--ts-var-spotterviz-tool-json-input-background': '#eaf3ee',
  '--ts-var-spotterviz-tool-json-input-color': '#2f5d50',
  '--ts-var-spotterviz-text-primary': '#073B3A',
  '--ts-var-spotterviz-text-secondary': '#5a6a63',
  '--ts-var-spotterviz-message-background': '#ffffff',
  '--ts-var-spotterviz-panel-background': '#fbfdfc',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#0f9a63',
  '--ts-var-spotterviz-thinking-completed-header-color': '#5a6a63',
  '--ts-var-spotterviz-tool-feedback-button-background': '#eaf3ee',
  '--ts-var-spotterviz-tool-feedback-button-hover': '#dae7e1',
};

export type ThemeName = 'light' | 'dark';

/**
 * Dark counterpart to TS_CSS_VARIABLES — a deep-evergreen dark theme that keeps
 * SalesSpot's green/coral accents. Passed per-embed for the active theme so the
 * embedded Liveboard / Search / Spotter track the host app's light/dark toggle.
 *   CSS variables: https://developers.thoughtspot.com/docs/css-variables-reference
 */
export const TS_VARS_DARK: Record<string, string> = {
  '--ts-var-root-background': '#0c1f1a',
  '--ts-var-root-color': '#e8f0ec',
  '--ts-var-root-secondary-color': '#93a89f',
  '--ts-var-root-font-family': '"Plus Jakarta Sans", "Avenir Next", "Segoe UI", sans-serif',
  '--ts-var-application-color': '#e8f0ec',
  '--ts-var-nav-background': '#0a1a15',
  '--ts-var-nav-color': '#e8f0ec',
  '--ts-var-search-data-button-background': '#1bb978',
  '--ts-var-search-data-button-font-color': '#06120e',
  '--ts-var-search-bar-background': '#102a23',
  '--ts-var-search-bar-text-font-color': '#e8f0ec',
  '--ts-var-search-auto-complete-background': '#102a23',
  '--ts-var-search-auto-complete-font-color': '#e8f0ec',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  // Deeper green + white text so labels stay readable (incl. on hover).
  '--ts-var-button--primary-background': '#0f9a63',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#0c8554',
  '--ts-var-button--primary--active-background': '#0a744a',
  '--ts-var-button--secondary-background': '#183a30',
  '--ts-var-button--secondary-color': '#e8f0ec',
  // NOTE: the SDK's *effective* var name is the typo'd "--hovers-background"
  // (default #aac2f8, a light blue) — the clean "--hover-background" is only in
  // the docs. Set both so the label stays readable on hover.
  '--ts-var-button--secondary--hover-background': '#0f9a63',
  '--ts-var-button--secondary--hovers-background': '#0f9a63',
  '--ts-var-button--secondary--active-background': '#0c8554',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#c2d3cb',
  '--ts-var-button--tertiary--hover-background': '#183a30',
  '--ts-var-viz-title-color': '#e8f0ec',
  '--ts-var-viz-title-font-family': '"Fraunces", "Iowan Old Style", "Georgia", serif',
  '--ts-var-viz-description-color': '#93a89f',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow':
    '0 1px 0 rgba(255,255,255,0.05) inset, 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(27,185,120,0.10)',
  '--ts-var-viz-background': '#102a23',
  '--ts-var-viz-legend-hover-background': '#183a30',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#183a30',
  '--ts-var-chip-color': '#c2d3cb',
  '--ts-var-chip--hover-background': '#204438',
  '--ts-var-chip--hover-color': '#e8f0ec',
  '--ts-var-chip--active-background': '#1bb978',
  '--ts-var-chip--active-color': '#06120e',
  '--ts-var-menu-background': '#102a23',
  '--ts-var-menu-color': '#e8f0ec',
  '--ts-var-menu--hover-background': '#183a30',
  '--ts-var-menu-selected-text-color': '#1bb978',
  '--ts-var-menu-separator-background': '#204438',
  '--ts-var-dialog-body-background': '#102a23',
  '--ts-var-dialog-body-color': '#e8f0ec',
  '--ts-var-dialog-header-background': '#102a23',
  '--ts-var-dialog-header-color': '#e8f0ec',
  '--ts-var-dialog-footer-background': '#102a23',
  '--ts-var-list-hover-background': '#183a30',
  '--ts-var-list-selected-background': '#204438',
  '--ts-var-liveboard-layout-background': '#0a1a15',
  '--ts-var-liveboard-header-background': '#0c1f1a',
  '--ts-var-liveboard-header-font-color': '#e8f0ec',
  '--ts-var-liveboard-edit-bar-background': '#102a23',
  '--ts-var-liveboard-cross-filter-layout-background': '#102a23',
  '--ts-var-liveboard-tile-background': '#102a23',
  '--ts-var-liveboard-tile-border-color': '#204438',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#143329',
  '--ts-var-liveboard-tab-active-border-color': '#1bb978',
  '--ts-var-liveboard-tab-hover-color': '#1bb978',
  '--ts-var-liveboard-header-action-button-background': '#183a30',
  '--ts-var-liveboard-header-action-button-font-color': '#e8f0ec',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is light here, so keep the hover background DARK green for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#0f9a63',
  '--ts-var-liveboard-header-action-button-active-color': '#0c8554',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0a1a15',
  '--ts-var-liveboard-group-title-font-color': '#e8f0ec',
  '--ts-var-liveboard-group-border-color': '#204438',
  '--ts-var-liveboard-group-description-font-color': '#93a89f',
  '--ts-var-liveboard-group-tile-title-font-color': '#e8f0ec',
  '--ts-var-liveboard-group-tile-description-font-color': '#93a89f',
  '--ts-var-parameter-chip-background': '#183a30',
  '--ts-var-parameter-chip-text-color': '#e8f0ec',
  '--ts-var-parameter-chip-hover-background': '#204438',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#1bb978',
  '--ts-var-parameter-chip-active-text-color': '#06120e',
  '--ts-var-axis-title-color': '#93a89f',
  '--ts-var-axis-data-label-color': '#a9bdb4',
  '--ts-var-answer-data-panel-background-color': '#0a1a15',
  '--ts-var-answer-edit-panel-background-color': '#0a1a15',
  '--ts-var-kpi-hero-color': '#e8f0ec',
  '--ts-var-kpi-comparison-color': '#93a89f',
  '--ts-var-kpi-positive-change-color': '#35c98a',
  '--ts-var-kpi-negative-change-color': '#ff7a6b',
  // Spotter / Sage conversational surfaces
  '--ts-var-spotter-input-background': '#102a23',
  '--ts-var-spotter-prompt-background': '#183a30',
  '--ts-var-sage-embed-background-color': '#0c1f1a',
  '--ts-var-sage-bar-header-background-color': '#0c1f1a',
  '--ts-var-sage-search-box-background-color': '#102a23',
  '--ts-var-sage-search-box-font-color': '#e8f0ec',
  '--ts-var-source-selector-background-color': '#102a23',
  '--ts-var-sage-seed-questions-background': '#102a23',
  '--ts-var-sage-seed-questions-font-color': '#c2d3cb',
  '--ts-var-sage-seed-questions-hover-background': '#183a30',
  // Spotter landing "flashlight" radials off, + change-analysis modal and the
  // Spotter "Show work" tool cards, remapped to the evergreen dark palette.
  '--ts-var-spotter-landing-bg-quicksearch': 'none',
  '--ts-var-spotter-landing-bg-deepanalysis': 'none',
  '--ts-var-cca-modal-summary-header-background': '#0a1a15',
  '--ts-var-change-analysis-insights-background': '#102a23',
  '--ts-var-spotterviz-tool-call-background': '#102a23',
  '--ts-var-spotterviz-tool-border-color': '#1e4034',
  '--ts-var-spotterviz-tool-title-color': '#e8f0ec',
  '--ts-var-spotterviz-tool-json-input-background': '#071410',
  '--ts-var-spotterviz-tool-json-input-color': '#6fd0a8',
  '--ts-var-spotterviz-text-primary': '#e8f0ec',
  '--ts-var-spotterviz-text-secondary': '#93a89f',
  '--ts-var-spotterviz-message-background': '#102a23',
  '--ts-var-spotterviz-panel-background': '#0a1a15',
  '--ts-var-spotterviz-thinking-inprogress-header-color': '#4fd1a1',
  '--ts-var-spotterviz-thinking-completed-header-color': '#93a89f',
  '--ts-var-spotterviz-tool-feedback-button-background': '#143028',
  '--ts-var-spotterviz-tool-feedback-button-hover': '#1e4034',
};

/** Return the CSS-variable set for the active theme. */
export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_CSS_VARIABLES;
}

/**
 * Dark-only color overrides for surfaces with no dedicated CSS variable (answer
 * cards, floating chrome), plus the KPI headline in the SalesSpot green. Applied
 * via rules_UNSTABLE only in dark mode.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const DARK_SURFACE = '#102a23';
const DARK_INK = '#e8f0ec';
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
  // ---- "AI Highlights" modal (Liveboard) ---------------------------------
  // The shipped CSS hardcodes a light-grey list pane, white cards and #323946
  // headings, while the card copy reads --ts-var-dialog-body-color (near-white
  // in dark) — so it renders light-grey text on white cards. Repaint the panes/
  // cards/titles to the evergreen dark theme. Class names come from the cluster
  // bundle (`liveboard-highlights-module__*`) and are version-fragile.
  '[class*="liveboard-highlights-module__highlightsListWrapper" i]': {
    'background-color': '#0a1a15 !important',
    'border-color': '#1e4034 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#1e4034 !important',
  },
  '[class*="liveboard-highlights-module__cardWrapper" i]:hover': {
    'border-color': '#4fd1a1 !important',
  },
  '[class*="liveboard-highlights-module__cardActive" i]': {
    'border-color': '#4fd1a1 !important',
    'box-shadow': '0 0 0 1px #4fd1a1 !important',
  },
  // Card titles are a light-mode blue (#2770ef); section headings are pinned to
  // #323946 !important — both illegible on a dark card. Recolor to brand green.
  [[
    '[class*="liveboard-highlights-module__cardTitleWrapper" i]',
    '[class*="liveboard-highlights-module__cardTitleWrapper" i] *',
    '[class*="liveboard-highlights-module__categoryTitle" i]',
  ].join(',')]: { color: '#6fd0a8 !important' },
  // Detail pane + the "Is this useful?" strip.
  [[
    '[class*="liveboard-highlights-module__highlightDetailsWrapper" i]',
    '[class*="liveboard-highlights-module__highlightFeedback" i]',
    '[class*="liveboard-highlights-module__aiAnswerFooterExpanded" i]',
  ].join(',')]: {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#1e4034 !important',
    color: `${DARK_INK} !important`,
  },
  // Scrollbars in both panes are painted for a white background.
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-track',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-track',
  ].join(',')]: { 'background-color': '#0a1a15 !important' },
  [[
    '[class*="liveboard-highlights-module__highlightsListWrapper" i]::-webkit-scrollbar-thumb',
    '[class*="liveboard-highlights-module__highlightDetailContent" i]::-webkit-scrollbar-thumb',
  ].join(',')]: { 'background-color': '#1e4034 !important' },
  // ---- Spotter "Show work" / thinking panel ------------------------------
  // SpotterEmbed's chat steps use `collapsible-item-response-module__*`, which
  // exposes NO variables — it reads ThoughtSpot's design tokens straight (white
  // card, #f6f8fa JSON boxes), so it renders as a white panel inside the dark
  // embed. Rules are the only hook (plus a few hardcoded SpotterViz slate bits).
  '[class*="collapsible-item-response-module__collapsibleItemContainer" i]': {
    'background-color': `${DARK_SURFACE} !important`,
    'border-color': '#1e4034 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxWrapper" i]',
    '[class*="collapsible-item-response-module__inputCopyButton" i]',
  ].join(',')]: {
    'background-color': '#071410 !important',
    'border-color': '#1e4034 !important',
  },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBox" i]',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] code',
    '[class*="collapsible-item-response-module__jsonCodeBox" i] pre',
  ].join(',')]: { color: '#6fd0a8 !important' },
  [[
    '[class*="collapsible-item-response-module__jsonCodeBoxHeader" i]',
    '[class*="collapsible-item-response-module__sectionLabel" i]',
  ].join(',')]: { color: '#93a89f !important' },
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
  // Spotter answer code card — hardcodes #f6f8fa; two-class selectors to
  // out-specify ThoughtSpot's nested rules.
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockWrapper" i]',
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlockLines" i]',
    '[class*="spotter-code-block-module__codeBlockWrapper" i]',
  ].join(',')]: {
    'background-color': '#071410 !important',
    'border-color': '#1e4034 !important',
  },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="codeBlock" i]',
    '[class*="spotter-code-block-module__codeBlock" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="spotterCodeCardWrapper" i] [class*="languageLabel" i]',
    '[class*="spotter-code-block-module__codeBlockHeader" i]',
  ].join(',')]: { color: '#93a89f !important' },
  // SpotterViz card bits that hardcode slate rather than read a variable.
  '[class*="tool-call-common-module__separator" i]': {
    'background-color': '#1e4034 !important',
  },
  [[
    '[class*="tool-call-common-module__datasetName" i]',
    '[class*="tool-call-common-module__action" i]',
  ].join(',')]: { color: `${DARK_INK} !important` },
  [[
    '[class*="tool-call-common-module__confidence" i]',
    '[class*="tool-call-common-module__vizId" i]',
  ].join(',')]: { color: '#93a89f !important' },
};

/**
 * Welcome message for the host-owned SalesSpot AI chatbot
 * (from salesspot_fin.json > appConfig.chatbot.welcomeMessage, lightly adapted).
 */
export const CHATBOT_WELCOME =
  "Hi! I'm SalesSpot AI. Ask me about SalesSpot, or ask a question about your data — like “show meetings booked by week” or “top cadences by influenced pipeline.”";

/** Greeting + data model used when the chatbot is opened on the Cadences tab. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the cadences shown here?';

/** Spotter icon sprite (magician/spotter icon) from salesspot_fin.json. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "SalesSpot AI" everywhere,
 * plus the landing-page description override (from
 * salesspot_fin.json > stylingConfig.embeddedContent.strings / stringIDs).
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: 'SalesSpot AI',
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about sales.',
};

// ---------------------------------------------------------------------------
// Embed flags — from salesspot_fin.json > stylingConfig.embedFlags
// ---------------------------------------------------------------------------

export const LIVEBOARD_EMBED_FLAGS = {
  enable2ColumnLayout: true,
  isLiveboardStylingAndGroupingEnabled: true,
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

/** Google-Fonts stylesheet loaded INTO embed iframes so embedded ThoughtSpot
 * surfaces render in the same faces as the host UI (Plus Jakarta Sans for text,
 * Fraunces for titles) — iframes can't see the host page's fonts. customCSSUrl.
 */
export const TS_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap';

/** "Watch video" link shown in the SalesSpot AI pane. */
export const SALESSPOT_VIDEO_URL = 'https://www.salesspot.com/platform/conversations';

/** Sample questions shown on the custom SalesSpot AI landing pane. */
export const SALESSPOT_SAMPLE_QUESTIONS = [
  'Revenue generated by week',
  'Top cadences by influenced pipeline',
  'Meetings booked by rep',
  'Reply rate by cadence',
];

/** Trial / upgrade prompt shown in the SalesSpot AI pane after the 2nd query. */
export const SALESSPOT_TRIAL_QUESTIONS = 20;
export const SALESSPOT_UPGRADE_URL = 'https://www.salesspot.com/pricing';

/**
 * Hide the Spotter embed's own composer / input bar on the SalesSpot AI screen
 * — questions are driven from the host-side pane on the right, so the in-embed
 * "Enter your question" box (and its Quick/Deep toggle) is redundant. Injected
 * via rules_UNSTABLE. Class names are version-fragile; verify via Inspect if a
 * release renames them.
 */
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
export const DATE_COLUMN = 'Cadence Create Date';

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

