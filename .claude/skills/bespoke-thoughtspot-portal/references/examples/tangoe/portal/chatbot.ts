import { CONTENT } from '../content';
// ---------------------------------------------------------------------------
// Tangoe Assistant chatbot brain (host-owned).
//
// Uses Claude to either (a) answer general questions about Tangoe One (telecom,
// mobile, SaaS and cloud expense management, invoice audit and disputes, managed
// mobility) as text, or (b) route an expense-data question to ThoughtSpot Spotter,
// rendered by a BodylessConversation embed.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + a small Tangoe FAQ is used.
// ---------------------------------------------------------------------------

const env: Record<string, string | undefined> = (import.meta as any).env ?? {};
const ANTHROPIC_KEY = env.VITE_ANTHROPIC_API_KEY;
const MODEL = env.VITE_ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocLink {
  label: string;
  url: string;
}

export type RouteResult =
  | { kind: 'text'; text: string; links?: DocLink[] }
  | { kind: 'analytics'; query: string; preamble: string };

/** Canonical Tangoe resources the assistant can point users to. */
export const Tangoe_DOCS: Record<string, DocLink> = {
  home: { label: 'tangoe.com', url: 'https://www.tangoe.com/' },
  help: { label: 'Customer support', url: 'https://www.tangoe.com/managed-mobility-services/help-desk/' },
  telecom: { label: 'Telecom Expense Management', url: 'https://www.tangoe.com/telecom-expense-management/' },
  mobile: { label: 'Mobile Expense Management', url: 'https://www.tangoe.com/managed-mobility-services/expense-management/' },
  mms: { label: 'Managed Mobility Services', url: 'https://www.tangoe.com/managed-mobility-services/' },
  audit: { label: 'Invoice Audit & Optimization', url: 'https://www.tangoe.com/telecom-expense-management/invoice-audit-optimization/' },
  saas: { label: 'SaaS Optimization', url: 'https://www.tangoe.com/saas-optimization/' },
  cloud: { label: 'Cloud Expense Management', url: 'https://www.tangoe.com/cloud-expense-management/' },
  contact: { label: 'Contact sales', url: 'https://www.tangoe.com/contact-us/' },
  privacy: { label: 'Privacy policy', url: 'https://www.tangoe.com/privacy-policy/' },
};

const SYSTEM_PROMPT = `You are the "Tangoe Assistant", the in-app assistant for Tangoe One Expense Intelligence, used by IT, finance and procurement teams to manage technology spend.

You do two things:
1. General Tangoe questions: telecom expense management (TEM), mobile expense management and managed mobility (device lifecycle, help desk, MDM, buyback), invoice audit and billing disputes, SaaS license optimization, cloud (IaaS) cost management and FinOps, cost allocation to business units, cost centers and GL codes. Answer these yourself, concisely (2-5 sentences), in a friendly, professional tone.
2. Data questions about the user's own expense data (billed spend, cost per line, zero-usage lines and wasted spend, roaming, billing errors, disputes, credits recovered, by vendor, business unit, cost center, service category, device, country): call the show_analytics tool with a concise natural-language question. Never invent numbers.

When useful, point to one of these pages:
- tangoe.com: https://www.tangoe.com/
- Customer support: https://www.tangoe.com/managed-mobility-services/help-desk/
- Telecom Expense Management: https://www.tangoe.com/telecom-expense-management/
- Mobile Expense Management: https://www.tangoe.com/managed-mobility-services/expense-management/
- Managed Mobility Services: https://www.tangoe.com/managed-mobility-services/
- Invoice Audit & Optimization: https://www.tangoe.com/telecom-expense-management/invoice-audit-optimization/
- SaaS Optimization: https://www.tangoe.com/saas-optimization/
- Cloud Expense Management: https://www.tangoe.com/cloud-expense-management/
- Contact sales: https://www.tangoe.com/contact-us/`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live data and a visualization. Use for any question about actual expense metrics: billed spend, cost per line, zero-usage lines, wasted spend, roaming, billing errors, disputed amounts, credits recovered, counts, trends, comparisons or time series by vendor, business unit, cost center or service.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "zero-usage rate by business unit by month" or "billing error rate by vendor".',
      },
    },
    required: ['query'],
  },
};

export async function routeMessage(
  history: ChatTurn[],
  userMessage: string,
): Promise<RouteResult> {
  if (!ANTHROPIC_KEY) return fallbackRoute(userMessage);
  try {
    const messages = [
      ...history.slice(-10).map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: userMessage },
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [TOOL],
        messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const blocks: any[] = data.content ?? [];
    const toolUse = blocks.find(
      (b) => b.type === 'tool_use' && b.name === 'show_analytics',
    );
    const text = blocks
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (toolUse?.input?.query) {
      return {
        kind: 'analytics',
        query: String(toolUse.input.query),
        preamble: text || 'Here’s what I found in your data:',
      };
    }
    return { kind: 'text', text: text || "I'm not sure how to help with that." };
  } catch {
    // Network / CORS / key issue — degrade to the keyword router.
    return fallbackRoute(userMessage);
  }
}

// --- No-LLM fallback --------------------------------------------------------

// Generic analytics phrasing ("by <dim>", "per <dim>", "top N", metric verbs)
// plus the client's own domain terms from content.ts. Domain terms are escaped.
const DOMAIN_TERMS = (CONTENT.analyticsKeywords || [])
  .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const ANALYTICS_RE = new RegExp(
  '\\b(how many|how much|number of|count|total|average|avg|median|sum|trend|trending|' +
  'over time|by \\w+|per \\w+|top \\d*|bottom \\d*|rate|cost|hours|forecast|activity|' +
  'performance|compare|growth' + (DOMAIN_TERMS ? '|' + DOMAIN_TERMS : '') + ')\\b',
  'i',
);

const Tangoe_OVERVIEW = CONTENT.chatbot.overview;

// --- typo / fuzzy tolerance -------------------------------------------------
// Brand token (spaceless, lowercase), derived from the company name so this
// logic ports to any rebrand.
const BRAND = (CONTENT.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Lowercase, strip punctuation, collapse whitespace. */
const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/** Small Levenshtein distance for typo tolerance. */
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** Fuzzy "does this mention the brand?" — tolerant of spaces and misspellings. */
function mentionsBrand(n: string): boolean {
  if (BRAND.length < 4) return false;
  if (n.replace(/\s+/g, '').includes(BRAND)) return true;
  const prefix = BRAND.slice(0, 4);
  const words = n.split(' ');
  for (let i = 0; i < words.length; i++) {
    const cands = [words[i], words[i] + (words[i + 1] || '')];
    for (const c of cands) {
      if (c.length < 4) continue;
      if (c.startsWith(prefix)) return true;
      if (lev(c, BRAND) <= 3) return true;
    }
  }
  return false;
}

interface FaqEntry {
  re: RegExp;
  text: string;
  links?: DocLink[];
}

const FAQ: FaqEntry[] = [
  {
    re: /value ?prop|value proposition|why (use|choose|tangoe|would i|do i need)|benefits?\b|roi|what makes .*(different|special|better)|differentiat|why should/i,
    text: 'Tangoe gives one platform and one team for every technology expense: telecom, mobile, SaaS and cloud. Invoices are audited line by line (about 9% of telecom invoices carry errors), disputes are pursued until credits land, and unused lines and licenses are found and reclaimed, typically cutting 15-30% of overspend.',
    links: [Tangoe_DOCS.home, Tangoe_DOCS.audit],
  },
  {
    re: /(what|tell me|explain|describe|who).*(tangoe)|tangoe.*(do|about|is|platform|one|used for)|^tangoe\b/i,
    text: Tangoe_OVERVIEW,
    links: [Tangoe_DOCS.home, Tangoe_DOCS.telecom],
  },
  {
    re: /zero.?usage|zombie|unused (line|licen|seat|device)|idle line|reclaim|harvest/i,
    text: 'A zero-usage (zombie) line or license is still billed but has had no data, voice or login for 30+ days, often after an employee leaves or a project ends. Tangoe flags them every cycle so you can cancel, suspend or reassign them. Work the list on the Reclaim Queue tab.',
    links: [Tangoe_DOCS.mobile, Tangoe_DOCS.saas],
  },
  {
    re: /invoice audit|billing error|dispute|credit|refund|overcharg|rate mismatch/i,
    text: 'Tangoe audits every carrier and vendor invoice against your contracted rates and inventory, flags errors such as rate mismatches, duplicate charges and billing for inactive lines, then files and pursues disputes until credits or refunds are issued. Track errors, disputes and credits recovered on the Expense Intelligence tab.',
    links: [Tangoe_DOCS.audit],
  },
  {
    re: /roaming|international|travel/i,
    text: 'Roaming charges spike when travellers use lines without an international plan. Tangoe spots roaming outliers by user and region and recommends travel add-ons or plan changes before the next trip.',
    links: [Tangoe_DOCS.mobile],
  },
  {
    re: /saas|licen[cs]e|microsoft 365|m365|salesforce|seat/i,
    text: 'Tangoe SaaS optimization discovers your SaaS apps, tracks last login per user and finds unused, under-used and over-provisioned licenses (about 29% of SaaS licenses go unused), so you can re-harvest seats or downgrade SKUs at renewal.',
    links: [Tangoe_DOCS.saas],
  },
  {
    re: /cloud|iaas|aws|azure|gcp|google cloud|finops/i,
    text: 'Tangoe Cloud Expense Management brings AWS, Azure and Google Cloud bills into the same view as telecom and SaaS, allocates them to business units and supports FinOps practices like rightsizing and reserved-instance planning.',
    links: [Tangoe_DOCS.cloud],
  },
  {
    re: /mobil|device|phone|mdm|help desk|lifecycle|buyback|byod/i,
    text: 'Tangoe Managed Mobility Services runs the device lifecycle end to end: ordering, kitting, help desk, MDM, repair, BYOD and buyback or recycling, with mobile expense management on top.',
    links: [Tangoe_DOCS.mms, Tangoe_DOCS.mobile],
  },
  {
    re: /cost cent|allocat|chargeback|gl code|general ledger/i,
    text: 'Tangoe allocates every charge to business units, cost centers and GL codes, so each owner sees and approves their own technology spend.',
    links: [Tangoe_DOCS.telecom],
  },
  {
    re: /pric|plan|tier|subscription|how much (is|does)/i,
    text: 'Tangoe One Expense Intelligence comes in tiers with different analytics allowances. To discuss packaging for your organization, contact sales.',
    links: [Tangoe_DOCS.contact],
  },
  {
    re: /reporting|analytics(?!\?)|insights|dashboard/i,
    text: 'Expense Intelligence gives you billed spend, cost per line, zero-usage lines and wasted spend, roaming, billing errors, disputes and credits recovered across telecom, mobile, SaaS and cloud. Explore it on the Expense Intelligence and Business Unit Insights tabs, or ask me a data question here.',
    links: [Tangoe_DOCS.telecom],
  },
  {
    re: /\b(hi|hello|hey|yo|sup)\b/i,
    text: 'Hi! I\u2019m the Tangoe Assistant. Ask me about Tangoe One, or ask a data question like \u201czero-usage rate by business unit by month.\u201d',
  },
  {
    re: /help|what can (you|i)|how do you work|what should i ask|examples?|what can i ask/i,
    text: 'I can answer questions about Tangoe products (with links), and pull live analytics from your expense data \u2014 try \u201cbilling error rate by vendor by month\u201d or \u201cwasted spend by cost center.\u201d',
    links: [Tangoe_DOCS.help],
  },
  {
    re: /who are you|what are you|your name|are you (a )?(bot|ai|human|real)|who am i (talking|speaking)/i,
    text: 'I\u2019m the Tangoe Assistant. I can explain how Tangoe One works and answer live questions about your lines, licenses, invoices and disputes.',
    links: [Tangoe_DOCS.help],
  },
  {
    re: /thank|thanks|thx|appreciate|cheers|awesome|great|nice one|perfect/i,
    text: 'Happy to help! Ask me anything else about Tangoe, or try a data question like \u201ccredits recovered by vendor this year.\u201d',
  },
  {
    re: /\b(bye|goodbye|see ya|later|that'?s all|done)\b/i,
    text: 'Anytime \u2014 I\u2019m here whenever you need Tangoe answers or a quick data pull.',
  },
  {
    re: /(secure|security|privacy|safe|soc ?2|iso|compliance|encrypt|gdpr|my data safe)/i,
    text: 'Tangoe hosts its SaaS services in the US and EMEA with enterprise security controls. The data in this demo portal is synthetic.',
    links: [Tangoe_DOCS.privacy],
  },
  {
    re: /(contact|support|talk to|reach|sales team|get in touch|email you|phone number|help me)/i,
    text: 'You can reach Tangoe support (help desk in 9 languages), or contact sales for anything account-specific. In here, I can answer product questions and pull live analytics.',
    links: [Tangoe_DOCS.help, Tangoe_DOCS.contact],
  },
];

// Definition-style openers ("what is a zombie line", "explain invoice audit") are
// knowledge questions even though they contain words like line/audit.
// NOTE: "how many"/"how much" are NOT definitional — they're data questions.
const DEFINITIONAL_RE =
  /^\s*(what(?:'s| is| are| does| do)?\b(?!\s+(?:my|the|our)\b)|who\b|why\b|explain\b|define\b|describe\b|tell me about\b|how (?:do|does|can)\b)/i;

const analyticsResult = (msg: string): RouteResult => ({
  kind: 'analytics',
  query: msg.trim(),
  preamble: 'Here’s what I found in your data:',
});

function fallbackRoute(msg: string): RouteResult {
  const n = norm(msg);
  const deSpaced = n.replace(/\s+/g, '');
  const isData = ANALYTICS_RE.test(msg);
  const isDefinition = DEFINITIONAL_RE.test(msg);

  // A data question that isn't phrased as a definition → route to Spotter,
  // even if it mentions "dispute", "license", "roaming", etc.
  if (isData && !isDefinition) return analyticsResult(msg);

  // Knowledge / non-data questions. Test each FAQ pattern against the raw text,
  // the normalized text, AND the de-spaced text — so spacing typos and
  // punctuation still match.
  for (const entry of FAQ)
    if (entry.re.test(msg) || entry.re.test(n) || entry.re.test(deSpaced))
      return { kind: 'text', text: entry.text, links: entry.links };

  // Mentions the brand — even misspelled — but nothing matched: give the overview.
  if (mentionsBrand(n))
    return { kind: 'text', text: Tangoe_OVERVIEW, links: [Tangoe_DOCS.home, Tangoe_DOCS.help] };

  // Data-ish but definition-phrased and unmatched by FAQ → still try Spotter.
  if (isData) return analyticsResult(msg);

  // Non-data and unmatched: answer helpfully, never a hard failure.
  return {
    kind: 'text',
    text: `I’m ${CONTENT.aiName}, here to help with anything about ${CONTENT.company} — what it does, how invoice audit, disputes and zero-usage line reclaim work, plus live analytics on your expense data. Try “what does ${CONTENT.company} do?”, “how does invoice audit work?”, or “zero-usage rate by business unit by month.”`,
    links: [Tangoe_DOCS.help],
  };
}
