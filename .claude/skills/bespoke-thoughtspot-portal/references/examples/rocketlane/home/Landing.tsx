// Home landing page, modelled on rocketlane.com: the "Deliver radical efficiency with an agentic, all-in-one PSA"
// hero with its G2 score and Free trial / Book a demo CTAs, the "complete suite" pair (all-in-one PSA + agents),
// "Rocketlane's trifecta for modern service delivery", the platform capabilities grid, the "Rocketlane for"
// audience cards and industries, the customer-story proof points and the closing
// "Enter the agentic world of services with Rocketlane" band.
// Deliberately NO analytics or embeds; the stats strip quotes headline numbers from the demo dataset as static copy.
import {
  ArrowRight, Star, Sparkles, Rocket, Users, Wallet, Clock, Plug, MonitorSmartphone, BarChart3, LayoutDashboard,
  ListChecks, AlertTriangle, TrendingDown, Briefcase, Code2, Workflow, Bot,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG =
  'https://cdn.prod.website-files.com/6360d3edc696260ba2aecbc7/68f5cff27c58f576d070389c_Nitro%20transforms%20project%20management%20to%20project%20execution.webp';
const PSA_IMG = 'https://cdn.prod.website-files.com/6360d3edc696260ba2aecbc7/69ba704b389844a4979d8f1f_psa-bg-imag.webp';

const TRUSTED = ['Worldpay', 'Attentive', 'Darwinbox', 'Fivetran', 'LivePerson', 'Mindtickle', 'Olo', 'Glean', 'Highspot', 'Gong'];

const STATS = [
  { value: '198K', label: 'Tasks tracked' },
  { value: '600+', label: 'Projects delivered' },
  { value: '10.9%', label: 'Overdue rate (2 yrs)' },
  { value: '79%', label: 'Billable utilization' },
  { value: '4.4', label: 'Avg CSAT' },
];

const TRIFECTA: { title: string; body: string; cta: string; tab: TabId; icon: typeof Rocket }[] = [
  {
    title: 'Project delivery and execution',
    body: 'Projects agents convert SOWs into project plans, enforce delivery discipline and keep every phase on track.',
    cta: 'Open dashboards',
    tab: 'analytics',
    icon: Rocket,
  },
  {
    title: 'People and Profits',
    body: 'Sync project plans with resources and financials, and see utilization, cost and margin as work unfolds.',
    cta: 'View resources',
    tab: 'carriers',
    icon: Users,
  },
  {
    title: 'Client Experience & Account Intelligence',
    body: 'Surface risks early: escalations, blockers and overdue tasks, before they reach the customer.',
    cta: 'Review overdue tasks',
    tab: 'capacity',
    icon: AlertTriangle,
  },
];

const CAPABILITIES = [
  { icon: Wallet, title: 'Financial Management', body: 'Turn project delivery into billing as finance agents keep revenue, margins and forecasts accurate.' },
  { icon: LayoutDashboard, title: 'Project Delivery', body: 'Agents convert SOWs into project plans automatically and keep projects on track.' },
  { icon: MonitorSmartphone, title: 'Client Portal', body: 'Give clients full visibility into project progress and keep teams accountable.' },
  { icon: Users, title: 'Resourcing and Staffing', body: 'Resourcing agents recommend the ideal team and keep plans current.' },
  { icon: BarChart3, title: 'Business IQ', body: 'Real-time insights into project bottlenecks, financials, utilization and customer sentiment.' },
  { icon: Clock, title: 'Time Tracking', body: 'Capture time effortlessly with AI governance that keeps hours complete and billing clean.' },
];

const AUDIENCES: { icon: typeof Rocket; title: string; body: string; tab: TabId; cta: string }[] = [
  { icon: Briefcase, title: 'Professional Services', body: 'Run projects, people and profits from one source of truth.', tab: 'analytics', cta: 'Project performance' },
  { icon: Code2, title: 'Forward Deployed Teams', body: 'Ship configuration, migration and validation work faster with agents.', tab: 'capacity', cta: 'Task queue' },
  { icon: Workflow, title: 'Onboarding and Implementation', body: 'Get customers to value faster across every phase of the runway.', tab: 'carriers', cta: 'Time to value by PM' },
];

const INDUSTRIES = ['SaaS', 'Fintech', 'Marketing', 'IT services'];

const STORIES = [
  { company: 'Gamify', value: '30 days', text: 'Slashed implementation timelines from over 6 months to just 30 days.' },
  { company: 'GoCardless', value: '59%', text: 'Scaled services to deliver 59% faster time-to-value.' },
  { company: 'Hapi Cloud', value: '85%', text: "Hit an 85% utilization rate with Rocketlane's automations." },
  { company: 'SupportLogic', value: '60%', text: 'Improved time-to-value by 60% by switching from GuideCX.' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="rocketlane-home" aria-label={`Welcome to ${CONTENT.company}`}>
      {/* Hero */}
      <div className="rocketlane-home-hero">
        <div className="rocketlane-home-hero-copy">
          <div className="rocketlane-home-rating">
            <span className="rocketlane-home-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </span>
            <strong>4.7</strong>/5 <span className="rocketlane-home-muted">(758 reviews on G2)</span>
          </div>
          <h1 className="rocketlane-home-h1">
            Deliver <span className="rocketlane-home-accent">radical efficiency</span> with an agentic, all-in-one PSA
          </h1>
          <p className="rocketlane-home-sub">
            Rocketlane unifies every part of service delivery and powers it with AI agents that execute, govern, and
            learn.
          </p>
          <div className="rocketlane-home-ctas">
            <button className="rocketlane-home-btn primary" onClick={() => onNavigate('analytics')}>
              Open project analytics <ArrowRight size={17} />
            </button>
            <button className="rocketlane-home-btn ghost" onClick={() => onNavigate('capacity')}>
              Review overdue tasks
            </button>
          </div>
        </div>
        <div className="rocketlane-home-hero-art">
          <img src={HERO_IMG} alt="Nitro agents running a customer onboarding project" loading="eager" />
          <div className="rocketlane-home-moment m1">
            <span className="rocketlane-home-moment-icon warn">
              <AlertTriangle size={15} />
            </span>
            <div>
              <div className="rocketlane-home-moment-title">Enterprise overdue rate 36%</div>
              <div className="rocketlane-home-moment-sub">Up from 11% · Data Migration &amp; UAT · Escalate</div>
            </div>
          </div>
          <div className="rocketlane-home-moment m2">
            <span className="rocketlane-home-moment-icon ok">
              <TrendingDown size={15} />
            </span>
            <div>
              <div className="rocketlane-home-moment-title">Time to value 53 days</div>
              <div className="rocketlane-home-moment-sub">Down from 80 · Priya Raman's projects</div>
            </div>
          </div>
          <div className="rocketlane-home-moment m3">
            <span className="rocketlane-home-moment-icon">
              <Sparkles size={15} />
            </span>
            <div>
              <div className="rocketlane-home-moment-title">Nitro: 12 tasks reassigned</div>
              <div className="rocketlane-home-moment-sub">Go-live back on track</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted by */}
      <div className="rocketlane-home-trusted">
        <span className="rocketlane-home-trusted-label">Trusted by modern professional services teams</span>
        <div className="rocketlane-home-trusted-row">
          {TRUSTED.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>

      {/* Stats strip (demo data) */}
      <div className="rocketlane-home-stats">
        {STATS.map((s) => (
          <div className="rocketlane-home-stat" key={s.label}>
            <span className="rocketlane-home-stat-value">{s.value}</span>
            <span className="rocketlane-home-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Complete suite */}
      <div className="rocketlane-home-section">
        <h2 className="rocketlane-home-h2">We’ve built the complete suite to get you there</h2>
        <p className="rocketlane-home-lead">Built for modern, client-obsessed, revenue-responsible delivery teams.</p>
        <div className="rocketlane-home-suite">
          <div className="rocketlane-home-suite-card image">
            <img src={PSA_IMG} alt="" aria-hidden="true" />
            <div className="rocketlane-home-suite-body">
              <h3>AI-powered, all-in-one PSA</h3>
              <p>
                Every workflow, every team. One platform. Built to run projects, people, profits, and customer
                experience from a single source of truth.
              </p>
              <button className="rocketlane-home-link" onClick={() => onNavigate('analytics')}>
                See project performance <ArrowRight size={15} />
              </button>
            </div>
          </div>
          <div className="rocketlane-home-suite-card grad">
            <div className="rocketlane-home-suite-body">
              <Bot size={28} />
              <h3>Agents for radical efficiency</h3>
              <p>
                Your AI-powered digital team. Agents that deliver frontline work, govern processes, and stay ahead of
                customer signals.
              </p>
              <button className="rocketlane-home-link light" onClick={() => onNavigate('ask')}>
                Ask {CONTENT.tabs.ask.replace(/^Ask\s+/i, '')} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trifecta */}
      <div className="rocketlane-home-section">
        <h2 className="rocketlane-home-h2">Rocketlane’s trifecta for modern service delivery</h2>
        <p className="rocketlane-home-lead">
          Delivery execution, business operations, and customer experience in one intelligent platform. Your
          projects, people, profits, and clients move in perfect sync.
        </p>
        <div className="rocketlane-home-trifecta">
          {TRIFECTA.map((t) => (
            <button key={t.title} className="rocketlane-home-tri" onClick={() => onNavigate(t.tab)}>
              <span className="rocketlane-home-tri-icon">
                <t.icon size={20} />
              </span>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
              <span className="rocketlane-home-tri-cta">
                {t.cta} <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="rocketlane-home-section">
        <h2 className="rocketlane-home-h2">Every project runs like your best one</h2>
        <div className="rocketlane-home-caps">
          {CAPABILITIES.map((c) => (
            <div className="rocketlane-home-cap" key={c.title}>
              <c.icon size={20} />
              <div>
                <h4>{c.title}</h4>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
          <div className="rocketlane-home-cap">
            <Plug size={20} />
            <div>
              <h4>Integrations</h4>
              <p>Slack, Salesforce, HubSpot, Jira, Zapier and Workato. Eliminate work around work.</p>
            </div>
          </div>
          <div className="rocketlane-home-cap">
            <ListChecks size={20} />
            <div>
              <h4>Governance</h4>
              <p>Approvals, nudges, escalations and follow-ups automated, so governance is invisible but always on.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audiences */}
      <div className="rocketlane-home-section">
        <h2 className="rocketlane-home-h2">Rocketlane for</h2>
        <div className="rocketlane-home-aud">
          {AUDIENCES.map((a) => (
            <button key={a.title} className="rocketlane-home-aud-card" onClick={() => onNavigate(a.tab)}>
              <a.icon size={22} />
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <span className="rocketlane-home-tri-cta">
                {a.cta} <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
        <div className="rocketlane-home-industries">
          <span className="rocketlane-home-muted">Industries</span>
          {INDUSTRIES.map((i) => (
            <span key={i} className="rocketlane-home-chip">
              {i}
            </span>
          ))}
        </div>
      </div>

      {/* Proof */}
      <div className="rocketlane-home-section">
        <h2 className="rocketlane-home-h2">“Rocketlane fuels ambition and helps PS businesses defy limits.”</h2>
        <div className="rocketlane-home-proof">
          {STORIES.map((s) => (
            <div className="rocketlane-home-proof-card" key={s.company}>
              <span className="rocketlane-home-proof-value">{s.value}</span>
              <p>{s.text}</p>
              <span className="rocketlane-home-proof-co">{s.company}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Closing band */}
      <div className="rocketlane-home-band">
        <div>
          <h2>Enter the agentic world of services with Rocketlane</h2>
          <p>
            Experience how delivery feels when AI agents work beside you: faster timelines, leaner budgets, and scale
            that once felt out of reach.
          </p>
        </div>
        <div className="rocketlane-home-band-ctas">
          <button className="rocketlane-home-btn white" onClick={() => onNavigate('ask')}>
            <Sparkles size={16} /> {CONTENT.tabs.ask}
          </button>
          <button className="rocketlane-home-btn outline" onClick={() => onNavigate('spotter')}>
            {CONTENT.tabs.spotter}
          </button>
        </div>
      </div>
    </section>
  );
}
