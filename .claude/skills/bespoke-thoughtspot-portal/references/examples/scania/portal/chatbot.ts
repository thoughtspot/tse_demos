import { CONTENT } from '../content';
// ---------------------------------------------------------------------------
// Scania Assistant chatbot brain (host-owned).
//
// Uses Claude to either (a) answer general questions about Scania connected
// services (Fleet Management, driver evaluation, environmental reports,
// maintenance plans, battery-electric trucks) as text, or (b) route a fleet
// data question to ThoughtSpot Spotter, rendered by a BodylessConversation embed.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + a small Scania FAQ is used.
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

/** Canonical Scania resources the assistant can point users to. */
export const Scania_DOCS: Record<string, DocLink> = {
  home: { label: 'scania.com', url: 'https://www.scania.com/group/en/' },
  help: { label: 'Contact Scania', url: 'https://www.scania.com/group/en/home/about-scania/contact-us.html' },
  fleet: { label: 'Scania Fleet Management', url: 'https://www.scania.com/ie/en/home/services/data-driven-services/fleet-management.html' },
  monitor: { label: 'Monitoring Report (Monitor package)', url: 'https://www.scania.com/uk/en/home/services/connected-services/monitor-package.html' },
  driver: { label: 'Driver evaluation', url: 'https://www.scania.com/uk/en/driver-evaluation.html' },
  environment: { label: 'Environmental report', url: 'https://www.scania.com/content/dam/www/market/bg/bochures/Scania_ENVIRONMENTAL_REPORT.pdf' },
  maintenance: { label: 'Flexible maintenance', url: 'https://scania.com/content/dam/www/market/master/pdf/services/vehicle-services/Scania_Services360_Flexible_maintenance_Leaflet.pdf' },
  bev: { label: 'Battery-electric trucks (range tool)', url: 'https://www.scania.com/group/en/home/products-and-services/trucks/battery-electric-truck/range-tool.html' },
  sustainability: { label: 'Sustainable transport', url: 'https://www.scania.com/group/en/home/sustainable-transport/sustainability-at-scania.html' },
  products: { label: 'Products and services', url: 'https://www.scania.com/group/en/home/products-and-services.html' },
  myscania: { label: 'My Scania portal', url: 'https://my.scania.com/#/home' },
  developers: { label: 'Data Access (rFMS API)', url: 'https://developer.scania.com' },
};

/** True when an LLM key is configured (drives a small UI hint). */
export const hasLLM = !!ANTHROPIC_KEY;

const SYSTEM_PROMPT = `You are the "Scania Assistant", the in-app assistant for Scania connected fleet analytics, used by hauliers, distribution fleets and bus and coach operators.

You handle two kinds of questions:
1. General Scania questions: Scania trucks (L, P, G, R, S series), buses and coaches, battery-electric vehicles, connected services (Monitor, Control and Data Access packages in My Scania / Scania Fleet Management), driver evaluation (anticipation, braking, hill driving, idling, coasting, cruise control, A-E grades), environmental reports (CO2), flexible maintenance plans and workshop services. Answer these yourself, concisely (2-5 sentences), in a friendly, professional tone.
2. Questions about the user's OWN fleet data: distance, fuel per 100 km, energy per 100 km, CO2 per km, idle share, driver scores, maintenance adherence, unplanned stops, overdue services, "how many", "show me", "top N", comparisons and trends by fleet, depot, country, application, powertrain, vehicle model or driver. For these you MUST NOT invent numbers. Instead call the show_analytics tool with a concise natural-language query for a BI engine (ThoughtSpot Spotter), stripping greetings and pleasantries.

If a request is ambiguous, prefer a short text answer. Never fabricate specific data values.

When you answer a general Scania question, point the user to the single most relevant resource by including its plain URL at the end of your answer. Available resources:
- Scania: https://www.scania.com/group/en/
- Scania Fleet Management: https://www.scania.com/ie/en/home/services/data-driven-services/fleet-management.html
- Monitoring Report: https://www.scania.com/uk/en/home/services/connected-services/monitor-package.html
- Driver evaluation: https://www.scania.com/uk/en/driver-evaluation.html
- Flexible maintenance: https://scania.com/content/dam/www/market/master/pdf/services/vehicle-services/Scania_Services360_Flexible_maintenance_Leaflet.pdf
- Battery-electric trucks: https://www.scania.com/group/en/home/products-and-services/trucks/battery-electric-truck/range-tool.html
- Sustainable transport: https://www.scania.com/group/en/home/sustainable-transport/sustainability-at-scania.html
- My Scania portal: https://my.scania.com/#/home
- Contact Scania: https://www.scania.com/group/en/home/about-scania/contact-us.html`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live data and a visualization. Use for any question about actual fleet metrics: distance, fuel or energy per 100 km, CO2, idle share, driver scores, maintenance adherence, unplanned stops, counts, trends, comparisons or time series.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "idle share by country by month" or "top 5 depots by CO2 per km".',
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

const Scania_OVERVIEW = CONTENT.chatbot.overview;

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
    // Value prop / "why" must come BEFORE the general overview entry.
    re: /value ?prop|value proposition|why (use|choose|scania|would i|do i need)|benefits?\b|roi|what makes .*(different|special|better)|differentiat|why should/i,
    text: 'Scania connected services turn every truck, bus and coach into a source of insight: lower fuel and energy use, fewer unplanned stops, better drivers and documented CO2 cuts. Operators typically use them to save fuel through driver coaching, plan maintenance from real usage and track the move to battery-electric and renewable fuels.',
    links: [Scania_DOCS.fleet, Scania_DOCS.home],
  },
  {
    re: /(what|tell me|explain|describe|who).*(scania)|scania.*(do|about|is|platform|used for)|^scania\b/i,
    text: Scania_OVERVIEW,
    links: [Scania_DOCS.home, Scania_DOCS.products],
  },
  {
    re: /fleet management|my scania|connected service|monitor(ing)? (report|package)|control package|data access|packages?\b/i,
    text: 'Scania Fleet Management (in My Scania) comes in three packages: Monitor (free with a connectivity agreement, with a weekly Monitoring Report), Control (adds driver evaluation, vehicle performance and the environmental report) and Data Access (rFMS API feeds into your own systems).',
    links: [Scania_DOCS.fleet, Scania_DOCS.monitor],
  },
  {
    re: /driver (evaluation|support|score|grade)|anticipation|hill driving|coasting|harsh brak|grade [a-e]\b|eco.?driv|coach(ing)? (a )?driver/i,
    text: 'Driver evaluation grades each driver from A (best) to E overall and on each factor: anticipation, hill driving, powertrain coasting, cruise control, speeding and idling. In this portal the Driver Evaluation tab shows score, idle share and distance by driver, and you can book coaching from the Workshop Queue.',
    links: [Scania_DOCS.driver],
  },
  {
    re: /idl(e|ing)/i,
    text: 'Idling burns roughly 2.5-3 litres an hour without moving the load. Idle share (engine time stationary) is a key driver-evaluation factor: long-haul fleets aim for under 8%. Ask me "idle share by country by month" to see where it is rising.',
    links: [Scania_DOCS.driver],
  },
  {
    re: /co2|emission|carbon|environment(al)? report|sustainab|hvo|biogas|decarbon/i,
    text: 'The Scania environmental report calculates CO2 per vehicle or for the whole fleet for any period, and exports to Excel or PDF. CO2 per km falls as you move to HVO100, biogas or battery-electric vehicles; in this portal compare CO2 per km by region and powertrain.',
    links: [Scania_DOCS.environment, Scania_DOCS.sustainability],
  },
  {
    re: /\bbev\b|electric|battery|charg|kwh|range/i,
    text: 'Scania battery-electric trucks (for example the 25 P BEV and 40 R BEV) and the Citywide BEV bus run on roughly 100-140 kWh per 100 km, more in Nordic winters. Use the range tool to match a BEV to your routes, and track energy per 100 km and BEV share here.',
    links: [Scania_DOCS.bev],
  },
  {
    re: /maintenance|service plan|workshop|flexible|uptime|breakdown|unplanned|overdue/i,
    text: 'Scania Maintenance with Flexible plans schedules workshop visits from each vehicle\'s real usage instead of fixed intervals, giving up to a day of extra uptime a year. The Workshop Queue in this portal lists vehicles past their service date; right-click one to book a workshop visit.',
    links: [Scania_DOCS.maintenance],
  },
  {
    re: /\b(api|developer|rfms|integration|webhook|sdk)\b/i,
    text: 'The Data Access package exposes vehicle, position and status data through the standard rFMS API, so you can feed transport management, payroll or BI systems directly.',
    links: [Scania_DOCS.developers],
  },
  {
    re: /truck|bus|coach|series|model|engine|r 450|s 500/i,
    text: 'Scania builds heavy trucks in the L, P, G, R and S cab series, city and intercity buses and coaches (Citywide, Interlink, Touring), and industrial and marine engines, all modular so each vehicle is configured for its application.',
    links: [Scania_DOCS.products],
  },
  {
    re: /reporting|analytics(?!\?)|insights|dashboard/i,
    text: 'This portal gives you fleet analytics on live data: the Fleet Performance Liveboard (fuel, CO2, idling, driver scores, uptime), Driver Evaluation, the Workshop Queue and a Report Builder. You can also ask me a data question here.',
    links: [Scania_DOCS.fleet],
  },
  {
    re: /\b(hi|hello|hey|hej|yo)\b/i,
    text: 'Hej! I\'m the Scania Assistant. Ask me about Scania connected services, or ask a data question like "idle share by country by month".',
  },
  {
    re: /help|what can (you|i)|how do you work|what should i ask|examples?|what can i ask/i,
    text: 'I can explain Scania connected services, driver evaluation, maintenance plans and battery-electric vehicles (with links), and pull live analytics from your fleet data: try "CO2 per km by region by quarter" or "top 10 drivers by driver score".',
    links: [Scania_DOCS.help],
  },
  {
    re: /who are you|what are you|your name|are you (a )?(bot|ai|human|real)|who am i (talking|speaking)/i,
    text: 'I\'m the Scania Assistant, built into your fleet portal. I can explain Scania services and answer live questions about your vehicles, drivers, fuel, CO2 and workshop planning.',
    links: [Scania_DOCS.help],
  },
  {
    re: /thank|thanks|thx|tack|appreciate|cheers|awesome|great|perfect/i,
    text: 'Happy to help! Ask me anything else, or try a data question like "fuel per 100 km by vehicle model".',
  },
  {
    re: /\b(bye|goodbye|hej da|see ya|later|that'?s all|done)\b/i,
    text: 'Anytime. Drive safe!',
  },
  {
    re: /(secure|security|privacy|safe|gdpr|compliance|encrypt|my data safe)/i,
    text: 'Vehicle and driver data in Scania connected services is processed under GDPR with role-based access; fleet owners control which users and third parties can see it.',
    links: [Scania_DOCS.help],
  },
  {
    re: /(contact|support|talk to|reach|sales|get in touch|email|phone|dealer)/i,
    text: 'Reach Scania through your local dealer or workshop, or the contact page. In here, I can answer product questions and pull live fleet analytics.',
    links: [Scania_DOCS.help, Scania_DOCS.myscania],
  },
];

// Definition-style openers ("what is driver evaluation", "explain flexible maintenance") are
// knowledge questions even though they contain words like idling/maintenance.
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
  // even if it mentions "idling", "CO2", "maintenance", etc.
  if (isData && !isDefinition) return analyticsResult(msg);

  // Knowledge / non-data questions. Test each FAQ pattern against the raw text,
  // the normalized text, AND the de-spaced text — so spacing typos and
  // punctuation still match.
  for (const entry of FAQ)
    if (entry.re.test(msg) || entry.re.test(n) || entry.re.test(deSpaced))
      return { kind: 'text', text: entry.text, links: entry.links };

  // Mentions the brand — even misspelled — but nothing matched: give the overview.
  if (mentionsBrand(n))
    return { kind: 'text', text: Scania_OVERVIEW, links: [Scania_DOCS.home, Scania_DOCS.help] };

  // Data-ish but definition-phrased and unmatched by FAQ → still try Spotter.
  if (isData) return analyticsResult(msg);

  // Non-data and unmatched: answer helpfully, never a hard failure.
  return {
    kind: 'text',
    text: `I’m ${CONTENT.aiName}, here to help with anything about ${CONTENT.company} — connected services, driver evaluation, maintenance and battery-electric vehicles, plus live analytics on your fleet data. Try “what does ${CONTENT.company} Fleet Management include?”, “how is idling scored?”, or “CO2 per km by region by quarter.”`,
    links: [Scania_DOCS.help],
  };
}
