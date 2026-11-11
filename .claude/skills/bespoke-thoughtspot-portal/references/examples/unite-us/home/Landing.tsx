// Home landing page, modelled on uniteus.com's own homepage: the "Predict Needs. Deliver Services.
// Prove Impact." hero, the four platform pillars, the audiences it serves (Government, Providers,
// Payers, Community) and a closing CTA band. Deliberately NO analytics or embeds; the stats strip
// quotes headline numbers from the demo dataset as static copy.
import { ArrowRight, Landmark, Stethoscope, ShieldCheck, HeartHandshake, Radar, Network, Wallet, BarChart3, CheckCircle2 } from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const PILLARS = [
  { icon: Radar, title: 'Predict Needs', text: 'Use real-world data to identify risk, surface unmet needs and close the gaps that prevent better health.' },
  { icon: Network, title: 'Deliver Services', text: 'Coordinate care across health, government and community partners with closed-loop referrals and real-time tracking.' },
  { icon: Wallet, title: 'Pay for Services', text: 'Simplify the revenue cycle and automate payments to community-based organizations.' },
  { icon: BarChart3, title: 'Prove Impact', text: 'Save resources, reach more people faster and demonstrate ROI for every dollar spent.' },
];

const AUDIENCES = [
  { icon: Landmark, title: 'Government', text: 'Run statewide social care networks and Medicaid transformation programs.' },
  { icon: Stethoscope, title: 'Providers', text: 'Screen for social needs and close the loop from the point of care.' },
  { icon: ShieldCheck, title: 'Payers', text: 'Connect members to services and measure the impact on cost and outcomes.' },
  { icon: HeartHandshake, title: 'Community', text: 'Receive referrals, get paid for services and grow your capacity.' },
];

const STATS = [
  { value: '350K', label: 'Referrals tracked in your network' },
  { value: '87%', label: 'Accepted by a community partner' },
  { value: '1.7 days', label: 'Average time to accept' },
  { value: '5', label: 'State social care networks' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="uu-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="uu-home-hero">
        <div className="uu-home-hero-copy">
          <h1 className="uu-home-h1">
            Predict Needs. Deliver Services. <span className="uu-home-grad">Prove Impact.</span> All with {CONTENT.company}.
          </h1>
          <p className="uu-home-sub">
            The only end-to-end platform that helps identify needs earlier, target the right interventions, and coordinate and
            track real results, so you can invest smarter, serve better, and measure what matters, all in one place.
          </p>
          <div className="uu-home-ctas">
            <button className="uu-home-btn uu-home-btn-primary" onClick={() => onNavigate('analytics')}>
              Explore Network Analytics <ArrowRight size={18} />
            </button>
            <button className="uu-home-btn uu-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              Open Referral Queue
            </button>
          </div>
        </div>
        <div className="uu-home-hero-art" aria-hidden="true">
          <div className="uu-home-photo">
            <img src="https://uniteus.com/wp-content/uploads/2024/01/bg-hero-mother-children.jpg" alt="" loading="lazy" />
          </div>
          <div className="uu-home-float uu-home-float-a">
            <CheckCircle2 size={18} />
            <div>
              <b>Referral accepted</b>
              <span>Food Assistance, 1.2 days</span>
            </div>
          </div>
          <div className="uu-home-float uu-home-float-b">
            <span className="uu-home-dot" />
            <div>
              <b>Loop closed</b>
              <span>Client received services</span>
            </div>
          </div>
        </div>
      </div>

      <div className="uu-home-stats">
        {STATS.map((s) => (
          <div className="uu-home-stat" key={s.label}>
            <span className="uu-home-stat-v">{s.value}</span>
            <span className="uu-home-stat-l">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="uu-home-section">
        <h2 className="uu-home-h2">Get to Know {CONTENT.company}</h2>
        <div className="uu-home-grid4">
          {PILLARS.map((p) => (
            <div className="uu-home-card" key={p.title}>
              <span className="uu-home-icon"><p.icon size={22} /></span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="uu-home-section">
        <h2 className="uu-home-h2">Built for every partner in the network</h2>
        <div className="uu-home-grid4">
          {AUDIENCES.map((a) => (
            <button className="uu-home-card uu-home-aud" key={a.title} onClick={() => onNavigate('carriers')}>
              <span className="uu-home-icon uu-home-icon-alt"><a.icon size={22} /></span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <span className="uu-home-more">See county insights <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="uu-home-band">
        <div>
          <h2>{CONTENT.company} Solutions: Trusted by Thousands to Serve Millions</h2>
          <p>Ask any question about your referrals, partners and outcomes and get an answer from your live data.</p>
        </div>
        <button className="uu-home-btn uu-home-btn-light" onClick={() => onNavigate('ask')}>
          Ask {CONTENT.aiName} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
