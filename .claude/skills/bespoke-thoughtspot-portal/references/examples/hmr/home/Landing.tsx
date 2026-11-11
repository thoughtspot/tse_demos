// Home landing page, modelled on hmr.co.com: the dark "Intelligence for life" hero with the chrome HMR artwork,
// the four "Turning data into strategic decisions" statements, the Services & Solutions lines (HMR data, PMR,
// consulting, tech), the four data panels and the Pharmacy Market Watch band. Deliberately NO analytics or embeds;
// the stats strip quotes headline numbers from the demo dataset as static copy.
import { ArrowRight, Database, Microscope, Lightbulb, Cpu, LineChart, Network, HeartHandshake, BrainCircuit, Pill, PackageX, Store, ShoppingBasket, Building2, Users } from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG = 'https://hmr.co.com/wp-content/uploads/2026/06/HMR_Homepage_Banner1.jpg';

const STATS = [
  { value: '900', label: 'Pharmacies in the demo panel' },
  { value: '373K', label: 'Sell-out lines, last 2 years' },
  { value: '96%', label: 'Prescription fill rate' },
  { value: '84%', label: 'Statin generic share, from 40%' },
];

const PILLARS = [
  { icon: LineChart, title: 'Turning data into strategic decisions', text: 'The best data, advanced analytics and deep market knowledge, with a real impact on performance and innovation in healthcare.' },
  { icon: Network, title: 'Deepening ecosystem understanding', text: 'Ongoing proximity to every stakeholder gives an increasingly integrated and relevant market perspective.' },
  { icon: HeartHandshake, title: 'Proximity that drives actionable insight', text: 'Close ties to decision-makers turn real-world challenges into practical, action-oriented recommendations.' },
  { icon: BrainCircuit, title: 'Human intelligence enhanced by technology', text: 'Advanced tools turn fast, complex information into clear, differentiated, future-oriented solutions.' },
];

const SERVICES: { icon: typeof Database; name: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Database, name: 'data', text: 'Pharmacy, mass market and hospital data from the largest pharmacy panel in the market.', cta: 'Open market analytics', tab: 'analytics' },
  { icon: Microscope, name: 'PMR', text: 'Quantitative, qualitative and hybrid research turned into actionable intelligence.', cta: 'See district insights', tab: 'carriers' },
  { icon: Lightbulb, name: 'consulting', text: 'RWE, pricing and market access, product strategy and commercial effectiveness.', cta: 'Work the stock alerts', tab: 'capacity' },
  { icon: Cpu, name: 'tech', text: 'HAIA: search-driven analytics with AI, for fast, scalable access to insight.', cta: `Ask ${CONTENT.aiName}`, tab: 'ask' },
];

const PANELS = [
  { icon: Store, title: 'Pharmacy', cover: '2,650 pharmacies, 91% of the Portuguese universe', mon: 'Daily, from segment to pack, ATC and HMR class' },
  { icon: ShoppingBasket, title: 'Mass Market', cover: '100% of mass-market retail channels', mon: 'Consumer Health sales across mass market and pharmacy' },
  { icon: Building2, title: 'Hospital', cover: 'Comprehensive NHS hospital panel', mon: 'Monthly, from segment to pack, ATC and INN' },
  { icon: Users, title: 'Patient Dynamics', cover: 'NHS hospital and retail panel', mon: 'Adherence, switching and drop-out patterns' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="hmr-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="hmr-home-hero">
        <img className="hmr-home-hero-img" src={HERO_IMG} alt="" loading="lazy" />
        <div className="hmr-home-hero-shade" aria-hidden="true" />
        <div className="hmr-home-hero-copy">
          <span className="hmr-home-eyebrow">{CONTENT.company} Pharmacy Market Watch</span>
          <h1 className="hmr-home-h1">
            Intelligence <span className="hmr-home-accent">for life</span>
          </h1>
          <p className="hmr-home-sub">
            We go far beyond data, insights, knowledge and technology. We bring intelligence. We bring life. Your pharmacy
            sell-out, generics and supply health, with AI answers on live data.
          </p>
          <div className="hmr-home-ctas">
            <button className="hmr-home-btn hmr-home-btn-primary" onClick={() => onNavigate('analytics')}>
              Explore market analytics <ArrowRight size={18} />
            </button>
            <button className="hmr-home-btn hmr-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              Open stock alerts
            </button>
          </div>
        </div>
        <div className="hmr-home-float hmr-home-float-a" aria-hidden="true">
          <Pill size={18} />
          <div>
            <b>Generic share 84%</b>
            <span>C10 statins, after loss of exclusivity</span>
          </div>
        </div>
        <div className="hmr-home-float hmr-home-float-b" aria-hidden="true">
          <PackageX size={18} />
          <div>
            <b>Stock alert raised</b>
            <span>Norte, asthma &amp; COPD inhaler</span>
          </div>
        </div>
      </div>

      <div className="hmr-home-stats">
        {STATS.map((s) => (
          <div className="hmr-home-stat" key={s.label}>
            <span className="hmr-home-stat-v">{s.value}</span>
            <span className="hmr-home-stat-l">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="hmr-home-section">
        <h2 className="hmr-home-h2">When technology amplifies human thinking, intelligence becomes life.</h2>
        <div className="hmr-home-grid4">
          {PILLARS.map((p) => (
            <div className="hmr-home-card" key={p.title}>
              <span className="hmr-home-icon"><p.icon size={22} /></span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="hmr-home-section">
        <h2 className="hmr-home-h2">Services &amp; Solutions</h2>
        <div className="hmr-home-grid4">
          {SERVICES.map((s) => (
            <button className="hmr-home-card hmr-home-svc" key={s.name} onClick={() => onNavigate(s.tab)}>
              <span className="hmr-home-svc-name"><b>HMR</b> {s.name}</span>
              <p>{s.text}</p>
              <span className="hmr-home-more">{s.cta} <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="hmr-home-section">
        <h2 className="hmr-home-h2">HMR data panels</h2>
        <div className="hmr-home-grid4">
          {PANELS.map((p) => (
            <div className="hmr-home-card hmr-home-panel" key={p.title}>
              <span className="hmr-home-icon hmr-home-icon-alt"><p.icon size={20} /></span>
              <h3>{p.title}</h3>
              <p><strong>Coverage:</strong> {p.cover}</p>
              <p><strong>Monitoring:</strong> {p.mon}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="hmr-home-band">
        <div>
          <span className="hmr-home-band-kicker">Pharmacy Market Watch · Monthly report</span>
          <h2>Unlock insights on the Portuguese pharmacy market</h2>
          <p>Ask any question about sell-out, generics, reimbursement and stock-outs and get an answer from live data.</p>
        </div>
        <button className="hmr-home-btn hmr-home-btn-primary" onClick={() => onNavigate('ask')}>
          Ask {CONTENT.aiName} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
