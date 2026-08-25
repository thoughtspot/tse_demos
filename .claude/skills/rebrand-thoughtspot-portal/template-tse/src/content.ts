// ---------------------------------------------------------------------------
// content.ts — the SINGLE source of truth for every human-readable string in
// the portal. A reskin edits this file (or the codemod `scripts/apply-spec.mjs`
// writes it from a spec.json); nothing else under src/ hard-codes brand or
// domain copy. IDs / GUIDs / host / columns / theme live in config.ts.
//
// Defaults below are the neutral "Northwind" freight-brokerage template.
// ---------------------------------------------------------------------------

export interface LoginStat {
  value: string;
  label: string;
}

export const CONTENT = {
  // ---- identity ----------------------------------------------------------
  company: 'Northwind',
  aiName: 'Northwind AI', // shown as the fancy-chat brand + "Ask <aiName>" tab
  website: 'https://www.northwind.com',

  // ---- login hero --------------------------------------------------------
  // loginTitleHtml may contain a single <br /> for the line break.
  loginTitleHtml: 'Where freight<br />meets finance.',
  loginSubtitle:
    'Your brokerage command center — carrier capacity, freight corridors, and loads-on-time, with AI-powered answers on live data. Built on Northwind, powered by ThoughtSpot.',
  loginStats: [
    { value: '1.4M+', label: 'Loads Analyzed' },
    { value: '98%', label: 'On-Time Visibility' },
    { value: 'Real-time', label: 'Capacity Intel' },
  ] as LoginStat[],
  loginCardSubtitle: 'Enter any username and password to continue',
  // {host} is substituted with THOUGHTSPOT_HOST's bare hostname at render time.
  loginDemoNoteHtml:
    "<strong>Sign in</strong> with your ThoughtSpot username &amp; password for <code>{host}</code>. This origin must be CORS-allowlisted on that cluster for the embeds to load.",

  // ---- decorative platform nav (product-context words, non-interactive) ---
  platformNav: ['Broker', 'Shipper'], // max 2 render (see TopBar)

  // ---- tab labels --------------------------------------------------------
  tabs: {
    myReports: 'My Reports',
    analytics: 'Analytics',
    inline: 'Carriers', // the inline-insights list tab
    action: 'Capacity', // the custom-action tab
    ask: 'Ask Northwind AI',
    spotter: 'Spotter',
  },

  // ---- page subtitles / states ------------------------------------------
  analyticsSubtitle: 'Your live freight & capacity performance dashboard',
  spotterSubtitle: 'Ask questions of your Northwind data in natural language.',
  inline: {
    subtitleReady:
      'Carrier activity for your organization — select a carrier to view its insights',
    subtitleIdle: 'Your carriers and their activity records',
    loading: 'Loading carriers…',
    errorTitle: "Couldn't load carriers",
    errorMsg: 'Unable to load carrier data.',
    moreLabel: 'View insights',
    hideLabel: 'Hide insights',
  },

  // ---- analytics host filters -------------------------------------------
  filters: { primaryLabel: 'Region', secondaryLabel: 'Freight corridor' },

  // ---- Ask-AI (fancy chat) ----------------------------------------------
  sampleQuestions: [
    'Loads delivered by corridor',
    'Top carriers by on-time rate',
    'Capacity by region',
    'Loads per carrier over time',
  ],
  askWelcome:
    'Ask me anything about Northwind — freight, carriers, capacity, best practices — or ask about your own data and I will chart it live.',
  askEmptySub:
    'Ask any analytical question about your freight, carriers, capacity, and coverage. Answers come straight from your live data with an interactive chart you can drill into.',

  // ---- custom-action tab + modal ----------------------------------------
  action: {
    label: 'Request Bid', // the context-menu action name
    subtitlePrefix: 'Lane capacity & carrier opportunities. Right-click a row and choose',
    subtitleSuffix: 'to launch a request pre-filled from that row.',
    modalTitle: 'Request Bid',
    modalLead: 'Pre-filled from the selected row. Review and submit through Northwind.',
    submitLabel: 'Submit',
    successTitle: 'Request submitted',
  },

  // ---- floating chatbot + fallback brain --------------------------------
  chatbot: {
    welcome:
      "Hi! I'm Northwind AI. Ask me about freight, carriers and capacity, or ask a question about your data.",
    overview:
      'Northwind is an AI-powered logistics platform that helps brokerages manage carrier capacity, freight corridors, and on-time delivery, with answers on live data.',
    greetingExample: 'loads delivered by corridor',
    examples: ['loads delivered by corridor', 'top carriers by on-time rate'],
  },

  // ---- monetization ------------------------------------------------------
  // The paywall fires once, on the Nth Ask-AI question.
  trialQuestionTrigger: 3,
  upgradeReason:
    'Upgrade to Northwind Premium to unlock drill-down, Ask AI and downloads.',

  // Extra domain terms that mark a chat message as a DATA question. Folded into
  // the chatbot's analytics router alongside the generic "by X" / "top N" / metric
  // patterns, so a client's own vocabulary routes to Spotter instead of the FAQ.
  analyticsKeywords: ['loads', 'carriers', 'capacity', 'corridor', 'lane', 'on-time', 'delivered', 'freight'],
} as const;

export type Content = typeof CONTENT;
