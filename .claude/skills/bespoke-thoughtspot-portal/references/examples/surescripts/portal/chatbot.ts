import { CONTENT } from '../content';
// ---------------------------------------------------------------------------
// Surescripts Assistant chatbot brain (host-owned).
//
// Uses Claude to either (a) answer general questions about the Surescripts network
// (e-prescribing, RTPB, electronic prior authorization, medication history, EPCS,
// Clinical Direct Messaging) as text, or (b) route a network-data question to
// ThoughtSpot Spotter, rendered by a BodylessConversation embed.
//
// Set VITE_ANTHROPIC_API_KEY (and optionally VITE_ANTHROPIC_MODEL) to enable
// the LLM. Without a key, a keyword router + a small Surescripts FAQ is used.
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

/** Canonical Surescripts resources the assistant can point users to. */
export const Surescripts_DOCS: Record<string, DocLink> = {
  home: { label: 'surescripts.com', url: 'https://surescripts.com/' },
  help: { label: 'Support', url: 'https://surescripts.com/support' },
  eprescribing: { label: 'E-Prescribing', url: 'https://surescripts.com/products/e-prescribing' },
  epcs: { label: 'E-Prescribing for Controlled Substances', url: 'https://surescripts.com/products/e-prescribing-for-controlled-substances' },
  rtpb: { label: 'Real-Time Prescription Benefit', url: 'https://surescripts.com/products/real-time-prescription-benefit' },
  epa: { label: 'Electronic Prior Authorization', url: 'https://surescripts.com/products/electronic-prior-authorization' },
  paAutomation: { label: 'Prior Authorization Automation', url: 'https://surescripts.com/products/prior-authorization-automation' },
  medhistory: { label: 'Medication History', url: 'https://surescripts.com/products/medication-history-for-ambulatory' },
  abandonment: { label: 'First-Fill Abandonment', url: 'https://surescripts.com/products/first-fill-abandonment' },
  cdm: { label: 'Clinical Direct Messaging', url: 'https://surescripts.com/products/clinical-direct-messaging' },
  network: { label: 'The Surescripts network', url: 'https://surescripts.com/why-surescripts/network' },
  impact: { label: 'Annual Impact Report', url: 'https://surescripts.com/why-surescripts/our-impact/annual-impact-report' },
  training: { label: 'Training', url: 'https://surescripts.com/support/training' },
  contact: { label: 'Contact sales', url: 'https://surescripts.com/contact-sales' },
  privacy: { label: 'Privacy Office', url: 'https://surescripts.com/privacy-office' },
};

/** True when an LLM key is configured (drives a small UI hint). */
export const hasLLM = !!ANTHROPIC_KEY;

const SYSTEM_PROMPT = `You are the "Surescripts Assistant", the in-app assistant for Surescripts Network Intelligence, used by health systems, EHR vendors, pharmacies and PBMs on the Surescripts Health Information Network.

You handle two kinds of questions:
1. General Surescripts questions: e-prescribing (NewRx, RxRenewal, CancelRx, RxChange), E-Prescribing for Controlled Substances (EPCS), Real-Time Prescription Benefit (price transparency and lower-cost alternatives), Electronic Prior Authorization and Prior Authorization Automation (touchless PA), Medication History, First-Fill Abandonment, Clinical Direct Messaging, network reliability and certification. Answer these yourself, concisely (2-5 sentences), in a friendly, professional tone.
2. Questions about the user's OWN network data: transactions, response time, reject and error rates, RTPB adoption, patient savings, prescription abandonment, EPCS share, prior authorization volume, turnaround and approval rate, by state, EHR vendor, PBM, pharmacy, therapeutic class or prescriber organization. For these you MUST NOT invent numbers. Instead call the show_analytics tool with a concise natural-language query for a BI engine (ThoughtSpot Spotter), stripping greetings and pleasantries.

All data here is synthetic and contains no patient information. Never ask for or repeat patient identifiers. If a request is ambiguous, prefer a short text answer. Never fabricate specific data values.

When you answer a general question, point the user to the single most relevant resource by including its plain URL at the end of your answer. Available resources:
- surescripts.com: https://surescripts.com/
- Support: https://surescripts.com/support
- E-Prescribing: https://surescripts.com/products/e-prescribing
- E-Prescribing for Controlled Substances: https://surescripts.com/products/e-prescribing-for-controlled-substances
- Real-Time Prescription Benefit: https://surescripts.com/products/real-time-prescription-benefit
- Electronic Prior Authorization: https://surescripts.com/products/electronic-prior-authorization
- Prior Authorization Automation: https://surescripts.com/products/prior-authorization-automation
- Medication History: https://surescripts.com/products/medication-history-for-ambulatory
- First-Fill Abandonment: https://surescripts.com/products/first-fill-abandonment
- Clinical Direct Messaging: https://surescripts.com/products/clinical-direct-messaging
- The Surescripts network: https://surescripts.com/why-surescripts/network
- Annual Impact Report: https://surescripts.com/why-surescripts/our-impact/annual-impact-report
- Training: https://surescripts.com/support/training
- Contact sales: https://surescripts.com/contact-sales
- Privacy Office: https://surescripts.com/privacy-office`;

const TOOL = {
  name: 'show_analytics',
  description:
    "Route a data/analytics question to ThoughtSpot Spotter, which answers it with the user's live data and a visualization. Use for any question about actual network metrics: transactions, response time, rejects, RTPB adoption, patient savings, abandonment, EPCS, prior authorization volume, turnaround or approval rate, counts, trends, comparisons or time series.",
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'A concise natural-language analytics question for Spotter, e.g. "PA turnaround hours by state by month" or "abandonment rate by PBM".',
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

const Surescripts_OVERVIEW = CONTENT.chatbot.overview;

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
    re: /value ?prop|value proposition|why (use|choose|surescripts|would i|do i need)|benefits?\b|roi|what makes .*(different|special|better)|differentiat|why should/i,
    text: 'Surescripts connects virtually every EHR, pharmacy and PBM in the US on one trusted network, so the right medication and benefit intelligence reaches the point of care. Participants get faster prior authorizations, lower out-of-pocket costs through price transparency, fewer abandoned prescriptions and safer prescribing.',
    links: [Surescripts_DOCS.home, Surescripts_DOCS.impact],
  },
  {
    re: /(what|tell me|explain|describe|who).*(surescripts)|surescripts.*(do|about|is|platform|network|used for)|^surescripts\b/i,
    text: Surescripts_OVERVIEW,
    links: [Surescripts_DOCS.home, Surescripts_DOCS.network],
  },
  {
    re: /real.?time prescription benefit|\brtpb\b|price transparen|lower.?cost alternative|patient savings/i,
    text: 'Real-Time Prescription Benefit shows the prescriber the patient\u2019s actual out-of-pocket cost and lower-cost covered alternatives inside the EHR, before the prescription is sent. Choosing an alternative saves patients money and lowers abandonment. Track RTPB adoption and patient savings on the Network Intelligence tab.',
    links: [Surescripts_DOCS.rtpb],
  },
  {
    re: /prior auth|\bepa\b|\bpa\b|touchless|turnaround|time to decision/i,
    text: 'Electronic Prior Authorization moves PA requests from fax and phone into the EHR workflow: the PBM\u2019s questions come back electronically and many requests are approved touchlessly in minutes. Network-wide, electronic PAs reach a decision in about 6 hours versus about a day by fax. Pending requests are in the Prior Auth Queue tab.',
    links: [Surescripts_DOCS.epa, Surescripts_DOCS.paAutomation],
  },
  {
    re: /\bepcs\b|controlled substance|schedule ii|opioid/i,
    text: 'E-Prescribing for Controlled Substances (EPCS) lets prescribers send Schedule II-V prescriptions electronically with two-factor authentication, meeting DEA rules and state mandates while reducing fraud and diversion.',
    links: [Surescripts_DOCS.epcs],
  },
  {
    re: /newrx|e.?prescri|renewal|cancelrx|rxchange|reject|error rate/i,
    text: 'Surescripts E-Prescribing carries NewRx, RxRenewal, CancelRx and RxChange messages between prescribers and pharmacies. Reject and error rates measure messages the receiving system could not accept; fewer rejects mean fewer pharmacy callbacks and faster fills.',
    links: [Surescripts_DOCS.eprescribing],
  },
  {
    re: /medication history|med history|reconcil/i,
    text: 'Medication History returns a patient\u2019s fill and claims history from pharmacies and PBMs at the point of care, supporting medication reconciliation and safer prescribing.',
    links: [Surescripts_DOCS.medhistory],
  },
  {
    re: /abandon|not picked up|pickup|first.?fill/i,
    text: 'Prescription abandonment is a new prescription the patient never picks up, often because of cost. Surescripts First-Fill Abandonment alerts and RTPB price checks help prescribers and pharmacies close that gap.',
    links: [Surescripts_DOCS.abandonment, Surescripts_DOCS.rtpb],
  },
  {
    re: /clinical direct messag|direct messag|care coordination/i,
    text: 'Clinical Direct Messaging is a secure, HIPAA-compliant way for care teams to exchange clinical documents and referrals across organizations and EHRs.',
    links: [Surescripts_DOCS.cdm],
  },
  {
    re: /\b(api|developer|certif|integration|interconnect)\b/i,
    text: 'EHR, pharmacy and PBM technology vendors certify on the Surescripts network and connect through standard NCPDP SCRIPT and related transactions. Your account team can help with certification and connectivity.',
    links: [Surescripts_DOCS.network, Surescripts_DOCS.help],
  },
  {
    re: /train|learn|onboard|course/i,
    text: 'Surescripts offers training and learning resources for participants and their staff through the support site.',
    links: [Surescripts_DOCS.training],
  },
  {
    re: /pric|plan|tier|subscription|how much (is|does)/i,
    text: 'Surescripts Network Intelligence comes in tiers with different analytics allowances. To discuss packaging for your organization, contact sales.',
    links: [Surescripts_DOCS.contact],
  },
  {
    re: /reporting|analytics(?!\?)|insights|dashboard/i,
    text: 'Network Intelligence gives participants visibility into transaction volume, response time, rejects, RTPB adoption and savings, abandonment, EPCS and prior authorization turnaround. Explore it on the Network Intelligence and PBM Insights tabs, or ask me a data question here.',
    links: [Surescripts_DOCS.network],
  },
  {
    re: /\b(hi|hello|hey|yo|sup)\b/i,
    text: 'Hi! I\u2019m the Surescripts Assistant. Ask me about the Surescripts network, or ask a data question like \u201cPA turnaround hours by state by month.\u201d',
  },
  {
    re: /help|what can (you|i)|how do you work|what should i ask|examples?|what can i ask/i,
    text: 'I can answer questions about Surescripts products (with links), and pull live analytics from your network data \u2014 try \u201cabandonment rate by PBM by month\u201d or \u201cRTPB adoption by EHR vendor.\u201d',
    links: [Surescripts_DOCS.help],
  },
  {
    re: /who are you|what are you|your name|are you (a )?(bot|ai|human|real)|who am i (talking|speaking)/i,
    text: 'I\u2019m the Surescripts Assistant. I can explain how the Surescripts network works and answer live questions about your transactions, prior authorizations and price transparency.',
    links: [Surescripts_DOCS.help],
  },
  {
    re: /thank|thanks|thx|appreciate|cheers|awesome|great|nice one|perfect/i,
    text: 'Happy to help! Ask me anything else about Surescripts, or try a data question like \u201creject rate by EHR vendor last 90 days.\u201d',
  },
  {
    re: /\b(bye|goodbye|see ya|later|that'?s all|done)\b/i,
    text: 'Anytime \u2014 I\u2019m here whenever you need Surescripts answers or a quick data pull.',
  },
  {
    re: /(secure|security|privacy|safe|hipaa|hitrust|soc ?2|compliance|encrypt|phi|my data safe)/i,
    text: 'Surescripts protects health information with HITRUST-certified security and strict privacy controls. The data in this demo portal is synthetic and contains no patient information.',
    links: [Surescripts_DOCS.privacy],
  },
  {
    re: /(contact|support|talk to|reach|sales team|get in touch|email you|phone|help me)/i,
    text: 'You can reach Surescripts through the support site, or contact sales for anything account-specific. In here, I can answer product questions and pull live analytics.',
    links: [Surescripts_DOCS.help, Surescripts_DOCS.contact],
  },
];

// Definition-style openers ("what is RTPB", "explain ePA") are
// knowledge questions even though they contain words like RTPB/ePA.
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
  // even if it mentions "prior auth", "RTPB", "EPCS", etc.
  if (isData && !isDefinition) return analyticsResult(msg);

  // Knowledge / non-data questions. Test each FAQ pattern against the raw text,
  // the normalized text, AND the de-spaced text — so spacing typos and
  // punctuation still match.
  for (const entry of FAQ)
    if (entry.re.test(msg) || entry.re.test(n) || entry.re.test(deSpaced))
      return { kind: 'text', text: entry.text, links: entry.links };

  // Mentions the brand — even misspelled — but nothing matched: give the overview.
  if (mentionsBrand(n))
    return { kind: 'text', text: Surescripts_OVERVIEW, links: [Surescripts_DOCS.home, Surescripts_DOCS.help] };

  // Data-ish but definition-phrased and unmatched by FAQ → still try Spotter.
  if (isData) return analyticsResult(msg);

  // Non-data and unmatched: answer helpfully, never a hard failure.
  return {
    kind: 'text',
    text: `I’m ${CONTENT.aiName}, here to help with anything about ${CONTENT.company} — what it does, how e-prescribing, RTPB and electronic prior authorization work, plus live analytics on your network data. Try “what does ${CONTENT.company} do?”, “how does ePA work?”, or “abandonment rate by PBM by month.”`,
    links: [Surescripts_DOCS.help],
  };
}
