// Home landing page, modelled on ecosurety.com's own homepage: the sky-blue swirl hero "Managing packaging data is
// complex. We make it simple.", the "Essential packaging services" cards, the navy "Efficient packaging data
// management" flow and the purpose-led closing band. Deliberately NO analytics or embeds; the stats strip quotes
// headline numbers from the demo dataset as static copy.
import {
  ArrowRight,
  Globe2,
  Database,
  LineChart,
  Lightbulb,
  Sprout,
  GraduationCap,
  UploadCloud,
  ShieldCheck,
  Calculator,
  Send,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const STATS = [
  { value: '588K t', label: 'Packaging placed on the UK market' },
  { value: '£92M', label: 'Modulated EPR fees calculated' },
  { value: '220+', label: 'Automated checks on every data line' },
  { value: '520', label: 'Member producers reporting' },
];

const SERVICES: { icon: typeof Globe2; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Globe2, title: 'International compliance', text: 'Flexible support for regulations internationally, including the PPWR, batteries, WEEE and textiles.', cta: 'Ask about your obligations', tab: 'ask' },
  { icon: Database, title: 'Global packaging data management', text: 'Ingest, check, calculate and submit your EPR obligations, with in-depth insights to guide decisions.', cta: 'Open data issues', tab: 'capacity' },
  { icon: LineChart, title: 'Actionable packaging insights', text: "Smart review tools show what's driving your EPR costs, what data is missing and what to improve next.", cta: 'Explore insights', tab: 'carriers' },
  { icon: Lightbulb, title: 'Packaging advisory', text: 'See how changing materials, formats or suppliers shapes your obligations with scenario modelling.', cta: 'Model a scenario', tab: 'spotter' },
  { icon: Sprout, title: 'Packaging innovation', text: 'Programmes that unite stakeholders to design, test and scale solutions to packaging challenges.', cta: 'Track recyclability', tab: 'analytics' },
  { icon: GraduationCap, title: 'Training and events', text: 'Boost your knowledge of packaging EPR, RAM and PRNs, and build your own reports.', cta: 'My reports', tab: 'my-analytics' },
];

const FLOW = [
  { icon: UploadCloud, title: 'Frictionless data ingestion', text: 'Supplier uploads, raw files and data synchronisations.' },
  { icon: ShieldCheck, title: 'Trusted data validation', text: 'Over 220 automated checks, checked by our team.' },
  { icon: Calculator, title: 'Efficient compliance calculations', text: 'Automated processing of packaging obligations.' },
  { icon: Send, title: 'Accurate data submissions', text: 'Submitted to regulators on your behalf.' },
  { icon: Lightbulb, title: 'Expert scenario modelling', text: 'Data, technical and policy analysis for future decisions.' },
  { icon: Sparkles, title: 'Actionable packaging insights', text: 'Improve data accuracy and mitigate costs.' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="eco-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="eco-home-hero">
        <div className="eco-home-swirl" aria-hidden="true">
          <span className="eco-home-arc eco-home-arc-a" />
          <span className="eco-home-arc eco-home-arc-b" />
          <span className="eco-home-arc eco-home-arc-c" />
        </div>
        <div className="eco-home-hero-copy">
          <h1 className="eco-home-h1">
            Managing packaging data
            <br />
            is complex.
          </h1>
          <p className="eco-home-h1 eco-home-h1-b">We make it simple.</p>
          <p className="eco-home-sub">
            We transform complex, raw packaging data into accurate EPR submissions with actionable insights and guided
            improvements, trusted by over 500 major brands and retailers.
          </p>
          <div className="eco-home-ctas">
            <button className="eco-home-pill eco-home-pill-white" onClick={() => onNavigate('analytics')}>
              Explore EPR analytics <ArrowRight size={16} />
            </button>
            <button className="eco-home-pill eco-home-pill-navy" onClick={() => onNavigate('capacity')}>
              Resolve data issues <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="eco-home-float eco-home-float-a" aria-hidden="true">
          <CheckCircle2 size={18} />
          <div>
            <strong>Data line validated</strong>
            <span>220 checks passed</span>
          </div>
        </div>
        <div className="eco-home-float eco-home-float-b" aria-hidden="true">
          <TrendingDown size={18} />
          <div>
            <strong>Red-rated plastic 34% to 11%</strong>
            <span>Health &amp; Beauty redesigns</span>
          </div>
        </div>
        <div className="eco-home-float eco-home-float-c" aria-hidden="true">
          <TrendingUp size={18} />
          <div>
            <strong>Plastic PRN £235/t</strong>
            <span>up from £88 in April</span>
          </div>
        </div>
      </div>

      <div className="eco-home-stats">
        <p className="eco-home-stats-title">The packaging EPR scheme trusted by major brands and retailers</p>
        <div className="eco-home-stats-row">
          {STATS.map((s) => (
            <div className="eco-home-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-home-services">
        <h2 className="eco-home-h2">Essential packaging services</h2>
        <p className="eco-home-lead">We deliver the services you need to be compliant, improve your packaging and deliver real-world change.</p>
        <div className="eco-home-feature">
          <img src="/ecosurety-compliance.jpg" alt="" loading="lazy" />
          <div className="eco-home-feature-copy">
            <ShieldCheck size={26} className="eco-home-icon" />
            <h3>Packaging compliance</h3>
            <p>Comprehensive support for UK packaging EPR, the nation of sale requirement, the plastic packaging tax and deposit return schemes.</p>
            <button className="eco-home-pill eco-home-pill-navy eco-home-pill-sm" onClick={() => onNavigate('analytics')}>
              See your EPR dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div className="eco-home-cards">
          {SERVICES.map((s) => (
            <div className="eco-home-card" key={s.title}>
              <s.icon size={26} className="eco-home-icon" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <button className="eco-home-pill eco-home-pill-navy eco-home-pill-sm" onClick={() => onNavigate(s.tab)}>
                {s.cta} <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-home-flow">
        <h2 className="eco-home-h2">Efficient packaging data management</h2>
        <p className="eco-home-lead">
          From data collection, validation and calculation to submission, with deep insights to drive better packaging
          decisions. Powered by efficient technology and expert support.
        </p>
        <div className="eco-home-flow-grid">
          {FLOW.map((f) => (
            <div className="eco-home-flow-card" key={f.title}>
              <f.icon size={22} />
              <h4>{f.title}</h4>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="eco-home-band">
        <div>
          <h2>We are purpose-led</h2>
          <p>Our purpose is to rid the world of unnecessary packaging. B Corp since 2020 and a Carbon Literate Organisation with an ambitious Net Zero commitment.</p>
        </div>
        <button className="eco-home-pill eco-home-pill-white" onClick={() => onNavigate('ask')}>
          Ask {CONTENT.aiName} <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
