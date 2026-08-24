import { CONTENT } from '../content';
// ---------------------------------------------------------------------------
// Northwind AI chatbot brain (host-owned).
//
// Uses Claude to either (a) answer general Northwind questions as text, or
// (b) route a data/analytics question to ThoughtSpot Spotter. The actual data
// answer is rendered by a BodylessConversation embed in the chat UI — this
// module only decides *what* to do and produces the Spotter query.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + small Northwind FAQ is used so the
// widget still works for demos.
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

/** Canonical Northwind resources the assistant can point users to. */
export const Northwind_DOCS: Record<string, DocLink> = {
  home: { label: 'northwind.com', url: 'https://www.northwind.com' },
  help: { label: 'Help Center', url: 'https://help.northwind.com' },
  cadence: { label: 'Cadence overview', url: 'https://www.northwind.com/platform/cadence' },
  conversations: { label: 'Conversations', url: 'https://www.northwind.com/platform/conversations' },
  deals: { label: 'Deals', url: 'https://www.northwind.com/platform/deals' },
  forecast: { label: 'Forecast', url: 'https://www.northwind.com/platform/forecast' },
  rhythm: { label: 'Rhythm AI', url: 'https://www.northwind.com/platform/rhythm' },
  developers: { label: 'Developer & API docs', url: 'https://developers.northwind.com' },
  university: { label: 'Northwind University', url: 'https://university.northwind.com' },
  pricing: { label: 'Pricing', url: 'https://www.northwind.com/pricing' },
};

/** True when an LLM key is configured (drives a small UI hint). */
export const hasLLM = !!ANTHROPIC_KEY;

const SYSTEM_PROMPT = `You are "Northwind AI", the in-app assistant for the Northwind revenue-orchestration platform.

You handle two kinds of questions:
1. General Northwind / sales-engagement questions — what Northwind is, what cadences/Conversations/Deals are, how-to, definitions, best practices. Answer these yourself, concisely (2–5 sentences), in a friendly, professional tone.
2. Questions about the user's OWN data / analytics — metrics, counts, trends, pipeline, revenue, cadence performance, "how many", "show me", "top N", comparisons, time series, rates. For these you MUST NOT invent numbers. Instead call the show_analytics tool with a concise natural-language query for a BI engine (ThoughtSpot Spotter), stripping greetings and pleasantries.

If a request is ambiguous, prefer a short text answer. Never fabricate specific data values.

When you answer a general Northwind question, point the user to the single most relevant resource by including its plain URL at the end of your answer. Available resources:
- Northwind site: https://www.northwind.com
- Help Center: https://help.northwind.com
- Cadence: https://www.northwind.com/platform/cadence
- Conversations: https://www.northwind.com/platform/conversations
- Deals: https://www.northwind.com/platform/deals
- Forecast: https://www.northwind.com/platform/forecast
- Rhythm AI: https://www.northwind.com/platform/rhythm
- Developer & API docs: https://developers.northwind.com
- Northwind University (training): https://university.northwind.com
- Pricing: https://www.northwind.com/pricing`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live data and a visualization. Use for any question about actual metrics, counts, trends, pipeline, revenue, cadence performance, activity, rates, comparisons, or time series.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "meetings booked by week" or "top 5 cadences by influenced pipeline".',
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

const Northwind_OVERVIEW = CONTENT.chatbot.overview;

interface FaqEntry {
  re: RegExp;
  text: string;
  links?: DocLink[];
}

const FAQ: FaqEntry[] = [
  {
    re: /(what|tell me|explain|describe|who).*(northwind)|northwind.*(do|about|is|platform|used for)|^northwind\b/i,
    text: Northwind_OVERVIEW,
    links: [Northwind_DOCS.home, Northwind_DOCS.help],
  },
  {
    re: /cadence/i,
    text: 'A cadence is a structured, multi-step sequence of touchpoints — emails, calls, LinkedIn steps, and other tasks spaced over days — that reps follow to engage prospects consistently and at scale. You can see each cadence and its performance in the Cadences tab.',
    links: [Northwind_DOCS.cadence, Northwind_DOCS.help],
  },
  {
    re: /conversation|call recording|call intelligence|gong|transcri/i,
    text: 'Conversations is Northwind’s call and meeting intelligence. It records, transcribes, and analyzes sales calls so reps and managers can review talk-time, key moments, and coaching opportunities, and surface insights automatically.',
    links: [Northwind_DOCS.conversations],
  },
  {
    re: /\bdeals?\b|pipeline management|opportunit/i,
    text: 'Deals is Northwind’s pipeline and opportunity workspace. It gives reps a single place to manage open opportunities, track deal health and next steps, and keep CRM data up to date so forecasting stays accurate.',
    links: [Northwind_DOCS.deals],
  },
  {
    re: /forecast/i,
    text: 'Forecast helps revenue teams predict and commit to numbers with confidence — rolling up rep and team projections, comparing them to quota, and highlighting risk so managers can course-correct early.',
    links: [Northwind_DOCS.forecast],
  },
  {
    re: /rhythm|ai engine|prioriti|guided sell/i,
    text: 'Rhythm is Northwind’s AI engine. It turns buyer signals into a prioritized, guided to-do list for reps — telling them who to engage next and what action to take — so the highest-impact work happens first.',
    links: [Northwind_DOCS.rhythm],
  },
  {
    re: /\b(api|developer|integration api|webhook|rest api|sdk)\b/i,
    text: 'Northwind has a full REST API and developer platform for building integrations, syncing data, and automating workflows — including OAuth, people/cadence endpoints, and webhooks.',
    links: [Northwind_DOCS.developers],
  },
  {
    re: /train|learn|university|onboard|certification|course/i,
    text: 'Northwind University offers guided training, courses, and certifications to help reps and admins get the most out of the platform.',
    links: [Northwind_DOCS.university],
  },
  {
    re: /pric|cost|plan|tier|subscription|how much (is|does)/i,
    text: 'Northwind is sold in tiered plans for teams of different sizes and needs. For current packaging and to talk to sales, see the pricing page.',
    links: [Northwind_DOCS.pricing],
  },
  {
    re: /who (uses|is it for)|for sales|sdr|bdr|account exec|\bae\b|sales team/i,
    text: 'Northwind is used by revenue teams — SDRs/BDRs running outbound, Account Executives managing deals, and sales managers coaching and forecasting — to standardize their workflow and engage buyers more effectively.',
    links: [Northwind_DOCS.home],
  },
  {
    re: /\b(crm|salesforce|hubspot|integrat|connect)\b/i,
    text: 'Northwind connects to your CRM (such as Salesforce or HubSpot) and your email/calendar, keeping activity and records in sync automatically so reps work in one place and data stays accurate.',
    links: [Northwind_DOCS.help, Northwind_DOCS.developers],
  },
  {
    re: /reporting|analytics(?!\?)|insights|dashboard/i,
    text: 'Northwind Analytics gives teams visibility into engagement and pipeline — cadence performance, activity, conversion, and revenue trends. In this app you can explore that in the Analytics and Cadences tabs, or just ask me a data question here.',
    links: [Northwind_DOCS.help],
  },
  {
    re: /\b(hi|hello|hey|yo|sup)\b/i,
    text: 'Hi! I’m Northwind AI. Ask me about Northwind, or ask a data question like “meetings booked this quarter.”',
  },
  {
    re: /help|what can you|how do you work/i,
    text: 'I can answer questions about Northwind and sales engagement (with links to the docs), and I can pull live analytics from your data — try “show meetings booked by week” or “top cadences by influenced pipeline.”',
    links: [Northwind_DOCS.help],
  },
];

// Definition-style openers ("what is a cadence", "explain deals") are
// knowledge questions even though they contain words like cadence/deals.
// NOTE: "how many"/"how much" are NOT definitional — they're data questions.
const DEFINITIONAL_RE =
  /^\s*(what(?:'s| is| are| does| do)?\b(?!\s+(?:my|the|our)\b)|who\b|why\b|explain\b|define\b|describe\b|tell me about\b|how (?:do|does|can)\b)/i;

const analyticsResult = (msg: string): RouteResult => ({
  kind: 'analytics',
  query: msg.trim(),
  preamble: 'Here’s what I found in your data:',
});

function fallbackRoute(msg: string): RouteResult {
  const isData = ANALYTICS_RE.test(msg);
  const isDefinition = DEFINITIONAL_RE.test(msg);

  // A data question that isn't phrased as a definition → route to Spotter,
  // even if it mentions "cadence", "deals", "forecast", etc.
  if (isData && !isDefinition) return analyticsResult(msg);

  // Knowledge / definition questions.
  for (const entry of FAQ)
    if (entry.re.test(msg)) return { kind: 'text', text: entry.text, links: entry.links };

  // Data-ish but definition-phrased and unmatched by FAQ → still try Spotter.
  if (isData) return analyticsResult(msg);

  // Anything else mentioning Northwind → overview rather than a deflection.
  if (/northwind|sales|sell|rep\b|prospect|outreach|buyer/i.test(msg)) {
    return { kind: 'text', text: Northwind_OVERVIEW, links: [Northwind_DOCS.home, Northwind_DOCS.help] };
  }
  return {
    kind: 'text',
    text:
      'I can help with questions about Northwind and sales engagement, and I can pull live analytics from your data — try “show meetings booked by week” or “top cadences by influenced pipeline.”',
    links: [Northwind_DOCS.help],
  };
}
