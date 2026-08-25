import { CONTENT } from './content';
// ---------------------------------------------------------------------------
// Central configuration for the HP Analytics mockup.
// IDs + ThoughtSpot styling are sourced from hp_fin.json so that every
// embedded ThoughtSpot component shares the exact same look & feel.
// ---------------------------------------------------------------------------

/** ThoughtSpot cluster (from appConfig.thoughtspotUrl) */
export const THOUGHTSPOT_HOST = 'https://sebe.thoughtspotstaging.cloud';

/** The Analytics liveboard embedded in Tab 2 (Analytics). */
export const ANALYTICS_LIVEBOARD_ID = 'c635ce48-5fa9-49e9-a640-e862b710bcf0';

/** Liveboard embedded inline by "View insights" on a process, filtered by the
 *  process name (no vizId — the whole liveboard is shown, stripped of chrome). */
export const INLINE_INSIGHTS_LIVEBOARD_ID =
  '';

/** Worksheet/model the Processes tab queries for process names + metrics. */
export const CADENCE_WORKSHEET_ID = 'b404a085-7717-4aee-85c8-5e63a5c9b6e8';

/**
 * Capacity tab embeds a single VISUALIZATION (LiveboardEmbed + liveboardId +
 * vizId) with a code-based custom action.
 */
export const CAPACITY_LIVEBOARD_ID = '';
export const CAPACITY_VIZ_ID = '';

/** Code-based custom action ("Request Bid") on the Capacity viz context menu. */
export const REQUEST_BID_ACTION_ID = 'hp-action';
export const REQUEST_BID_ACTION_NAME = 'HP Action';

/**
 * Candidate column names for "cadence" on the worksheet. The first one that
 * returns data is used both to list cadence names and as the runtime-filter
 * column name on the inline liveboard.
 */
export const CADENCE_COLUMN_CANDIDATES = [
  'Product Name',
  'Product',
];

/**
 * Candidate column names for the per-cadence detail metrics shown next to each
 * cadence in the Inline Insights UI. The first candidate that returns data for
 * each metric is used; metrics with no match are simply omitted.
 */
export const CADENCE_DETAIL_COLUMNS: Record<
  'metric1',
  { label: string; format: 'text' | 'date' | 'number' | 'currency'; candidates: string[] }
> = {
  metric1: {
    label: 'Value',
    format: 'number',
    candidates: ['Value', 'Amount', 'Total'],
  },
};

/**
 * Worksheet / model used everywhere Spotter runs — the "HP AI" Spotter
 * modal (Analytics tab), the Ask HP Spotter embed, and the host chatbot.
 */
export const WORKSHEET_ID = 'b404a085-7717-4aee-85c8-5e63a5c9b6e8';

/** Carriers list is not org-scoped for HP. */
export const HP_ORG_ID = '';
export const ORG_COLUMN_CANDIDATES: string[] = [];

/** Analytics-tab filters — Region + Freight corridor (multiselect), both empty
 *  by default (= no runtime filter / show all). Load Date is a date-range filter
 *  driven by DATE_COLUMN below. Candidate column names, first match wins. */
export const REGION_COLUMN_CANDIDATES = [
  'Product Name',
  'Product',
];
export const CORRIDOR_COLUMN_CANDIDATES = [
  'Region',
  'Sales Region',
];

// ---------------------------------------------------------------------------
// ThoughtSpot embed styling — taken verbatim from
// hp_fin.json > stylingConfig.embeddedContent
// ---------------------------------------------------------------------------

/** CSS variables applied to every embedded ThoughtSpot surface. */
// Embed font — the family the ThoughtSpot iframes request. Overwritten by the
// codemod from spec.appFont; pair it with TS_FONT_URL (below), which loads that
// font INTO the iframe (a Google-Fonts URL, or a self-hosted /embed-font.css).
export const EMBED_FONT_FAMILY = "'Questrial', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const TS_CSS_VARIABLES: Record<string, string> = {
  '--ts-var-root-background': '#f9fcfe',
  '--ts-var-root-color': '#182338',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#26324e',
  '--ts-var-nav-background': '#FFFFFF',
  '--ts-var-nav-color': '#26324e',
  '--ts-var-search-data-button-background': '#0096D6',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#f5fbfd',
  '--ts-var-search-bar-text-font-color': '#26324e',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  '--ts-var-button--primary-background': '#0096D6',
  '--ts-var-button--primary-color': '#FFFFFF',
  '--ts-var-button--primary--hover-background': '#0077B5',
  '--ts-var-button--primary--active-background': '#005A8C',
  '--ts-var-button--secondary-background': '#ebf7fc',
  '--ts-var-button--secondary-color': '#26324e',
  // See dark-theme note: the SDK reads the typo'd "--hovers-background".
  '--ts-var-button--secondary--hover-background': '#dbf0f9',
  '--ts-var-button--secondary--hovers-background': '#dbf0f9',
  '--ts-var-button--secondary--active-background': '#cceaf7',
  '--ts-var-viz-title-color': '#182338',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#3a4a6b',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow': '0 1px 2px rgba(7, 59, 58, 0.06), 0 16px 44px rgba(7, 59, 58, 0.16)',
  '--ts-var-viz-background': '#FFFFFF',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#ebf7fc',
  '--ts-var-chip-color': '#26324e',
  '--ts-var-chip--hover-background': '#dbf0f9',
  '--ts-var-chip--hover-color': '#182338',
  '--ts-var-chip--active-background': '#0096D6',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#FFFFFF',
  '--ts-var-menu-color': '#26324e',
  '--ts-var-menu--hover-background': '#f1f9fd',
  '--ts-var-dialog-body-background': '#FFFFFF',
  '--ts-var-dialog-body-color': '#26324e',
  '--ts-var-dialog-header-background': '#FFFFFF',
  '--ts-var-dialog-header-color': '#182338',
  '--ts-var-list-hover-background': '#f1f9fd',
  '--ts-var-list-selected-background': '#e6f5fb',
  '--ts-var-liveboard-layout-background': '#f9fcfe',
  '--ts-var-liveboard-header-background': '#FFFFFF',
  '--ts-var-liveboard-header-font-color': '#182338',
  '--ts-var-liveboard-tile-background': '#FFFFFF',
  '--ts-var-liveboard-tile-border-color': '#e0f2fa',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#f5fbfd',
  '--ts-var-liveboard-tab-active-border-color': '#0096D6',
  '--ts-var-liveboard-tab-hover-color': '#0096D6',
  '--ts-var-liveboard-header-action-button-background': '#ebf7fc',
  '--ts-var-liveboard-header-action-button-font-color': '#26324e',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is dark here, so keep the hover background LIGHT for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#dbf0f9',
  '--ts-var-liveboard-header-action-button-active-color': '#cceaf7',
  '--ts-var-parameter-chip-background': '#ebf7fc',
  '--ts-var-parameter-chip-text-color': '#26324e',
  '--ts-var-parameter-chip-hover-background': '#dbf0f9',
  '--ts-var-parameter-chip-hover-text-color': '#182338',
  '--ts-var-parameter-chip-active-background': '#0096D6',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#3a4a6b',
  '--ts-var-axis-data-label-color': '#5A6A7E',
  '--ts-var-kpi-hero-color': '#182338',
  '--ts-var-kpi-comparison-color': '#3a4a6b',
  '--ts-var-kpi-positive-change-color': '#1E8E5A',
  '--ts-var-kpi-negative-change-color': '#C84B3A',
};

export type ThemeName = 'light' | 'dark';

/**
 * Dark counterpart to TS_CSS_VARIABLES — a deep-evergreen dark theme that keeps
 * HP's green/coral accents. Passed per-embed for the active theme so the
 * embedded Liveboard / Search / Spotter track the host app's light/dark toggle.
 *   CSS variables: https://developers.thoughtspot.com/docs/css-variables-reference
 */
export const TS_VARS_DARK: Record<string, string> = {
  '--ts-var-root-background': '#0a1520',
  '--ts-var-root-color': '#e7ecf2',
  '--ts-var-root-secondary-color': '#93a0b4',
  '--ts-var-root-font-family': EMBED_FONT_FAMILY,
  '--ts-var-application-color': '#e7ecf2',
  '--ts-var-nav-background': '#0a1520',
  '--ts-var-nav-color': '#e7ecf2',
  '--ts-var-search-data-button-background': '#0096D6',
  '--ts-var-search-data-button-font-color': '#FFFFFF',
  '--ts-var-search-bar-background': '#0f1e2d',
  '--ts-var-search-bar-text-font-color': '#e7ecf2',
  '--ts-var-search-auto-complete-background': '#0f1e2d',
  '--ts-var-search-auto-complete-font-color': '#e7ecf2',
  '--ts-var-button-border-radius': '10px',
  '--ts-var-button--icon-border-radius': '8px',
  // Deeper green + white text so labels stay readable (incl. on hover).
  '--ts-var-button--primary-background': '#0096D6',
  '--ts-var-button--primary-color': '#ffffff',
  '--ts-var-button--primary--hover-background': '#0077B5',
  '--ts-var-button--primary--active-background': '#005A8C',
  '--ts-var-button--secondary-background': '#152535',
  '--ts-var-button--secondary-color': '#e7ecf2',
  // NOTE: the SDK's *effective* var name is the typo'd "--hovers-background"
  // (default #aac2f8, a light blue) — the clean "--hover-background" is only in
  // the docs. Set both so the label stays readable on hover.
  '--ts-var-button--secondary--hover-background': '#0096D6',
  '--ts-var-button--secondary--hovers-background': '#0096D6',
  '--ts-var-button--secondary--active-background': '#0077B5',
  '--ts-var-button--tertiary-background': 'transparent',
  '--ts-var-button--tertiary-color': '#c3cbd6',
  '--ts-var-button--tertiary--hover-background': '#152535',
  '--ts-var-viz-title-color': '#e7ecf2',
  '--ts-var-viz-title-font-family': EMBED_FONT_FAMILY,
  '--ts-var-viz-description-color': '#93a0b4',
  '--ts-var-viz-border-radius': '18px',
  '--ts-var-viz-box-shadow':
    '0 1px 0 rgba(255,255,255,0.05) inset, 0 14px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,150,214,0.16)',
  '--ts-var-viz-background': '#0f1e2d',
  '--ts-var-viz-legend-hover-background': '#152535',
  '--ts-var-chip-border-radius': '999px',
  '--ts-var-chip-background': '#152535',
  '--ts-var-chip-color': '#c3cbd6',
  '--ts-var-chip--hover-background': '#1e3550',
  '--ts-var-chip--hover-color': '#e7ecf2',
  '--ts-var-chip--active-background': '#0096D6',
  '--ts-var-chip--active-color': '#FFFFFF',
  '--ts-var-menu-background': '#0f1e2d',
  '--ts-var-menu-color': '#e7ecf2',
  '--ts-var-menu--hover-background': '#152535',
  '--ts-var-menu-selected-text-color': '#0096D6',
  '--ts-var-menu-separator-background': '#1e3550',
  '--ts-var-dialog-body-background': '#0f1e2d',
  '--ts-var-dialog-body-color': '#e7ecf2',
  '--ts-var-dialog-header-background': '#0f1e2d',
  '--ts-var-dialog-header-color': '#e7ecf2',
  '--ts-var-dialog-footer-background': '#0f1e2d',
  '--ts-var-list-hover-background': '#152535',
  '--ts-var-list-selected-background': '#1e3550',
  '--ts-var-liveboard-layout-background': '#0a1520',
  '--ts-var-liveboard-header-background': '#0a1520',
  '--ts-var-liveboard-header-font-color': '#e7ecf2',
  '--ts-var-liveboard-edit-bar-background': '#0f1e2d',
  '--ts-var-liveboard-cross-filter-layout-background': '#0f1e2d',
  '--ts-var-liveboard-tile-background': '#0f1e2d',
  '--ts-var-liveboard-tile-border-color': '#1e3550',
  '--ts-var-liveboard-tile-border-radius': '18px',
  '--ts-var-liveboard-tile-padding': '12px',
  '--ts-var-liveboard-tile-table-header-background': '#152535',
  '--ts-var-liveboard-tab-active-border-color': '#0096D6',
  '--ts-var-liveboard-tab-hover-color': '#0096D6',
  '--ts-var-liveboard-header-action-button-background': '#152535',
  '--ts-var-liveboard-header-action-button-font-color': '#e7ecf2',
  // NOTE: despite "-color", these are the button's hover/active BACKGROUND.
  // Label is light here, so keep the hover background DARK green for contrast.
  '--ts-var-liveboard-header-action-button-hover-color': '#0096D6',
  '--ts-var-liveboard-header-action-button-active-color': '#0077B5',
  // Masterpieces grouping/styling (active because isLiveboardMasterpiecesEnabled)
  '--ts-var-liveboard-group-background': '#0a1520',
  '--ts-var-liveboard-group-title-font-color': '#e7ecf2',
  '--ts-var-liveboard-group-border-color': '#1e3550',
  '--ts-var-liveboard-group-description-font-color': '#93a0b4',
  '--ts-var-liveboard-group-tile-title-font-color': '#e7ecf2',
  '--ts-var-liveboard-group-tile-description-font-color': '#93a0b4',
  '--ts-var-parameter-chip-background': '#152535',
  '--ts-var-parameter-chip-text-color': '#e7ecf2',
  '--ts-var-parameter-chip-hover-background': '#1e3550',
  '--ts-var-parameter-chip-hover-text-color': '#ffffff',
  '--ts-var-parameter-chip-active-background': '#0096D6',
  '--ts-var-parameter-chip-active-text-color': '#FFFFFF',
  '--ts-var-axis-title-color': '#93a0b4',
  '--ts-var-axis-data-label-color': '#93a0b4',
  '--ts-var-answer-data-panel-background-color': '#0a1520',
  '--ts-var-answer-edit-panel-background-color': '#0a1520',
  '--ts-var-kpi-hero-color': '#e7ecf2',
  '--ts-var-kpi-comparison-color': '#93a0b4',
  '--ts-var-kpi-positive-change-color': '#35c98a',
  '--ts-var-kpi-negative-change-color': '#ff7a6b',
  // Spotter / Sage conversational surfaces
  '--ts-var-spotter-input-background': '#0f1e2d',
  '--ts-var-spotter-prompt-background': '#152535',
  '--ts-var-sage-embed-background-color': '#0a1520',
  '--ts-var-sage-bar-header-background-color': '#0a1520',
  '--ts-var-sage-search-box-background-color': '#0f1e2d',
  '--ts-var-sage-search-box-font-color': '#e7ecf2',
  '--ts-var-source-selector-background-color': '#0f1e2d',
  '--ts-var-sage-seed-questions-background': '#0f1e2d',
  '--ts-var-sage-seed-questions-font-color': '#c3cbd6',
  '--ts-var-sage-seed-questions-hover-background': '#152535',
};

/** Return the CSS-variable set for the active theme. */
export function tsVarsFor(theme: ThemeName): Record<string, string> {
  return theme === 'dark' ? TS_VARS_DARK : TS_CSS_VARIABLES;
}

/**
 * Dark-only color overrides for surfaces with no dedicated CSS variable (answer
 * cards, floating chrome), plus the KPI headline in the HP green. Applied
 * via rules_UNSTABLE only in dark mode.
 *   Docs: https://developers.thoughtspot.com/docs/css-rules
 */
const DARK_SURFACE = '#0f1e2d';
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
  ].join(',')]: { 'background-color': '#0d2030 !important', color: `${DARK_INK} !important` },
  // Segmented controls / toggles / switchers (e.g. Quick Search | Deep Analysis).
  [[
    '[class*="toggle" i]',
    '[class*="switch" i]',
    '[class*="switcher" i]',
    '[class*="segment" i]',
  ].join(',')]: surfaceRule,
  // Dropdown / select header (dimension & filter pickers).
  '[data-testid="select-dropdown-header"]': { 'background-color': '#0d2030 !important', color: `${DARK_INK} !important` },
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
};

/**
 * Welcome message for the host-owned HP AI chatbot
 * (from hp_fin.json > appConfig.chatbot.welcomeMessage, lightly adapted).
 */
export const CHATBOT_WELCOME = CONTENT.chatbot.welcome;

/** Greeting + data model used when the chatbot is opened on the Carriers tab. */
export const CHATBOT_CADENCES_WELCOME =
  'What would you like to know about the carriers shown here?';

/** Spotter icon sprite (magician/spotter icon) from hp_fin.json. */
export const TS_ICON_SPRITE_URL =
  'https://cdn.jsdelivr.net/gh/thoughtspot/tse-demo-builders-pre-built/icons/spotter/generic-02.svg';

/**
 * String customizations — replace "Spotter" with "HP AI" everywhere,
 * plus the landing-page description override (from
 * hp_fin.json > stylingConfig.embeddedContent.strings / stringIDs).
 */
export const TS_STRINGS: Record<string, string> = {
  Spotter: CONTENT.aiName,
};

export const TS_STRING_IDS: Record<string, string> = {
  'convAssist.landingpage.description2': 'Ask a question about sales.',
};

// ---------------------------------------------------------------------------
// Embed flags — from hp_fin.json > stylingConfig.embedFlags
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
 * carry the HP blue↔green gradient and the KPI (headline) tiles pop with the
 * brand gradient. ThoughtSpot class names are version-dependent — these use
 * broad candidate selectors; if a surface isn't picked up, Inspect the iframe
 * and tighten the selector to the real class name.
 */
export const HP_EMBED_RULES: Record<string, Record<string, string>> = {
  // No gradient on KPI tiles / viz titles by default — embeds use ThoughtSpot's
  // native styling, which already follows the theme via the CSS variables above.
  // Only brand the AI / Spotter header button (an off-brand green pill on some
  // clusters) with a SOLID color. To opt into brand gradients on KPIs/titles,
  // add background linear-gradient rules here (buttons must stay solid).
  '[class*="aiHighlight" i], [class*="ai-highlight" i], [class*="AIHighlights" i], [data-testid*="AIHighlight" i], [class*="spotterLaunch" i], [class*="spotter-button" i], [class*="spotter" i][class*="btn" i], [class*="spotter" i][class*="button" i], [class*="spotter" i][class*="pill" i], [class*="spotter" i][class*="nudge" i], [class*="sage-button" i], [class*="sage" i][class*="btn" i], [class*="sage" i][class*="button" i], [class*="sage" i][class*="pill" i], [class*="askSage" i], [class*="ask-sage" i], [class*="nudge" i]':
    {
      background: '#0096D6 !important',
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

/** "Watch video" link shown in the HP AI pane. */
export const HP_VIDEO_URL = 'https://www.hp.com/platform/conversations';

/** Sample questions shown on the custom HP AI landing pane. */
export const HP_SAMPLE_QUESTIONS = [...CONTENT.sampleQuestions];

/** Trial / upgrade prompt shown in the HP AI pane after the 2nd query. */
export const HP_TRIAL_QUESTIONS = 20;
export const TRIAL_TRIGGER = CONTENT.trialQuestionTrigger;
export const HP_UPGRADE_URL = CONTENT.website + '/pricing';

/**
 * Hide the Spotter embed's own composer / input bar on the HP AI screen
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
export const SEGMENT_COLUMN = 'Product Name';
export const REP_COLUMN = 'Region';
export const CADENCE_NAME_COLUMN = 'Product Name';
export const DATE_COLUMN = 'Fact Collection Date';

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

