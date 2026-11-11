# Bespoke showpiece visualization: designed per company, never reused

The user's rule (2026-10-18): the custom chart must be a **bespoke visualization that makes sense for the company's
industry and use case**. Don't reuse a library chart or a previous run's chart. MayaCharts and the `showpieces/`
folder are references and a last-resort fallback only.

## 1. Find the metaphor (5 minutes, from the research)

Ask: what is the **one object** the company's product moves through a **workflow**, and what does their customer
look at every day? Draw that object and workflow, not a generic chart.

| Company / industry | Core object and workflow | Bespoke visual |
|---|---|---|
| InTime (public-safety scheduling, time tracking) | shifts on a roster calendar | **Shift calendar**: month or week grid, each day cell a stacked bar of shifts by rank; overtime glows; click a day to open its officers; coverage gaps hatched |
| Unite Us (social care referrals) | referral moving through a closed loop | **Closed-loop journey ring** (`examples/unite-us/bespoke-closed-loop/`): stages around a ring, losses peel off, particles flow, the outcome loops back to the sender |
| Lead Forensics (B2B website visitor identification) | anonymous visit becoming an identified, scored lead | **Visitor radar** (`examples/lead-forensics/bespoke-visitor-radar/`): sectors are traffic sources sized by share, rings are lead-score bands (Hot innermost), blips are companies; a sweep arm lights them and a month scrubber with Play replays a channel filling up |
| Moxie (medspa operating system) | patients rebooking their next treatment before leaving | **Rebooking recall clock** (`examples/moxie/bespoke-recall-clock/`): a 12-month clock face, one ring per injector at a practice, segments coloured by rebook rate; Play sweeps a gold hand month by month and the slipping injector's ring drains from sage to coral; roster shows first-quarter vs last-quarter rate |
| Nooks (AI parallel dialer for SDR teams) | dials flowing through the call funnel, per buyer persona | **Persona dial lanes** (`examples/nooks/bespoke-dial-lanes/`): one lane per persona with a phone signal-strength meter for connect rate; call dots stream through Dials, Connects, Convos and Meetings gates, non-connects drop at their gate; a month scrubber with Play shows the RevOps lane lighting up after Signal-Based Dialing; Dial Mode dropdown |
| Lineal (eDiscovery, AmplifyAI) | collected documents culled before review | **Cull cascade** (`examples/lineal/bespoke-cull-cascade/`): EDRM funnel of stacked bars (Collected, Promoted, Reviewed, Produced) split by source group on a sqrt width scale; document particles fall and peel off at each sieve; a month scrubber with Play shows the Chat & Mobile stream swelling and the cull rate slipping |
| Rocketlane (PSA, customer onboarding and implementation) | projects taxiing through onboarding phases | **Onboarding runway** (`examples/rocketlane/bespoke-onboarding-runway/`): 7 phase chevrons (Kickoff to Hypercare) as a runway, one lane per customer segment; chevron heat = overdue rate, height = task volume, hatching + orange edge at 25%+ late; project dots taxi along and stall (turning orange) in hot cells; a month scrubber with Play shows Enterprise Configuration/Data Migration/UAT heating from ~11% to ~40% since July; Segment dropdown |
| Scania (trucks, buses, connected fleet services) | vehicles running routes, burning fuel or idling | **Route ribbon** (`examples/scania/bespoke-route-ribbon/`): one road per country, ribbon width = km driven per month, colour = idle share (or L/100 km) on the Scania blue ramp; months 1.6x over the fleet median glow Scania red; a truck drives each road and Play walks the months, revealing Poland long haulage turning red (8% to 23% idling); Application and metric dropdowns |
| Surescripts (health-information network: e-prescribing, ePA, RTPB) | prior authorization relayed prescriber -> network -> PBM -> decision | **Prior-auth relay** (`examples/surescripts/bespoke-pa-relay/`): one relay lane per PA channel (Fax / Phone, ePA, Touchless), lane length = hours to decision (sqrt), thickness = channel share, hops heat on the Surescripts teal ramp and turn orange when they stall (8h+); PA particles crawl through slow hops; a 24h clock dial shows the state's blended turnaround and a state-vs-network sparkline; Play shows Texas falling from 21.7h to 5.4h as ePA share climbs 24% to 93%; State and metric dropdowns |
| Emburse (expense management) | expense report lifecycle | **Receipt-to-reimbursement pipeline**: lanes Submitted, Approved, Exported, Paid; reports as cards drifting right, sized by amount, coloured by policy risk; flagged reports bounce back |
| Logistics / freight | shipments on lanes | **Lane map**: origin-destination arcs on an inline US map, thickness by volume, colour by on-time; trucks animate along arcs |
| Retail / ecommerce | basket and stores | **Store-wall heat grid** or a **basket explosion**: category treemap that drills into products with price-volume bubbles |
| Healthcare provider | patient visit | **Patient-flow swimlane**: arrival, triage, provider, discharge, with wait-time bars and bottleneck pulses |
| SaaS / subscriptions | customer lifecycle | **Cohort retention river**: monthly cohorts as streams narrowing over time; churn drips out |
| Banking / payments | transaction flow | **Money-flow network**: accounts as nodes, flows as animated links, fraud-flagged edges highlighted |
| Education | student journey | **Enrollment-to-graduation funnel ring** by cohort, with drop-off reasons |
| Manufacturing | production line | **Line schematic**: stations in sequence, throughput bars, defect pulses at the bottleneck station |

If the company isn't listed, invent the equivalent. Name it in one sentence before writing code, for example
"Closed-loop referral journey: stages around a ring, losses peel off, resolution in the centre."

## 2. Technical contract (every bespoke chart)

- **Hand-written** SVG or Canvas in plain JS (D3 from jsDelivr is allowed, bounded load with a fallback). Use no
  MayaCharts unless the metaphor truly is a standard chart.
- **Transport:** ASCII only, no backticks, no `${`, no `</script`, no full-line `//` comments that matter
  (`make_tile_patch.py` trims them).
- **Host:** read `viz` as the bare identifier (`try { if (typeof viz !== 'undefined' && viz) return viz } catch`). Unwrap
  object cells. Call `viz.events.emitRenderCompletedEvent()` on success **and** on error. Paint `err.stack` into the tile on
  failure.
- **Columns:** detect the measure by schema type (`/measure/i`) or a `Total|Average` prefix. **Never** by a word that also
  appears in an attribute name ("Referral" matched "Referral Status" and zeroed every count on the Unite Us run). When picking one measure among several, exclude the others first: `/visit/` matched "Total Rebooked Visits" before "Total Completed Visits" on the Moxie run and every rate showed 100%.
- **Theme:** read the `[Theme Mode]` column ('dark'/'light'); set the background on html, body and `#chart` (a
  `--maya-bg`-style variable alone does not paint). Dark background = the portal's dark tile colour. The search
  **must end with `[Theme Mode]`**.
- **Font:** the portal's font (`font.family` from the portal spec) on every element, including SVG text. Ship with
  `make_tile_patch.py --font "<family>"`, which embeds it inline (`embed_font.py`). **No Google Fonts `<link>`**: the
  cluster CSP blocks it inside tiles, and the preview can't show that (it isn't under the CSP). Never use the chart
  library's default font (the shared core uses Geist).
- **Colours = the portal's signature colour, not the metaphor.** The chart's main ramp and hero series use the colour
  that dominates the portal and site visually (buttons, headings, hero accents), e.g. Moxie's gold, not a hue picked
  because it suits the metaphor (the Moxie chart went sage/green and the user had to recolour it gold). If the spec
  has both a primary and a gold/accent and the site is visibly gold-led, lead with gold.
- **Brand:** one `CFG.brand` block (primary, accent, navy, light tint, muted, plus dark variants). Hero series in primary;
  losses and others muted; accent for the "loop-back" or highlight.
- **Filters inside the tile:** compact `<select>` dropdowns (not chip rows, which wrap into three rows on a 5-wide tile).
- **Interaction:** hover tooltips on every mark, plus one motion or drill that explains the story (particles, playback,
  drill). Respect `prefers-reduced-motion`.
- **Layout:** fits the KPIs tab slot **x0 y0 w5 h6**, which is about 520 × 460 px. Check 420 × 380 and 900 × 500 too.
  Labels never clip: reserve about 50 px top and bottom for outer labels and size the drawing from the remaining height.
- **Resize:** use a `ResizeObserver` on `#chart` that re-renders and cancels any running animation frame.
- **Empty state:** names the search to bind.

## 3. Build loop (about 10 minutes)

1. Fixture: aggregate the generated CSV locally into `sample-data.json` with the exact output column names (or use
   `searchdata` when it is under about 24 KB). Include a `Theme Mode` column.
2. Use the chart skill's preview: `start-preview.mjs <slug>`, `snap.mjs <slug> NN --tile 520x460`. Read the PNG and fix the
   worst defect. Then run the dark snap (flip `Theme Mode`), `--data absent|wrapped|empty`, `--tile 420x380`, `--tile 900x500`,
   and a hover probe (`probe.mjs --hover-sel ... --eval "tooltip text"`). The sweep reads UNSTABLE for continuously
   animated charts; that is expected.
3. Ship: `scripts/make_tile_patch.py --tab KPIs --x 0 --y 0 --w 5 --h 6 --name "<chart title>" ...`, which must return `codeOk: true`.
   If the output with `--font` is over about 24 KB (chart plus embedded font), ship in two pastes: `make_tile_patch.py`
   without `--font` first, then `make_font_patch.py --tiles "<chart title>" --font "<family>"`. Each checks its own length.
4. Save the finished chart to `references/examples/<slug>/bespoke-<name>/` so the catalogue above grows.
