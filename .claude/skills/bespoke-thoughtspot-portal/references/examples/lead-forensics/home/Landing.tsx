// Home landing page, modelled on leadforensics.com's own homepage: the "Turn anonymous B2B website
// traffic into revenue" hero with its two CTAs and review-score proof row, the five "what you can do"
// pillars, the three audience cards (B2B sales, B2B marketing, Account management) and the closing
// "Stop leaking leads from your website" band. Deliberately NO analytics or embeds; the stats strip
// quotes headline numbers from the demo dataset as static copy.
import {
  ArrowRight, Star, Flame, CalendarCheck, Cloud, UserPlus, Rocket, TrendingUp, RotateCcw, Target,
  Briefcase, Megaphone, Users,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const RATINGS = [
  { score: '4.4', site: 'G2' },
  { score: '4.5', site: 'Capterra' },
  { score: '4.6', site: 'Trustpilot' },
];

const STATS = [
  { value: '356K', label: 'Identified business visits' },
  { value: '16%', label: 'Scored as hot leads' },
  { value: '1.9%', label: 'Visit-to-meeting rate' },
  { value: '£95M', label: 'Pipeline sourced' },
  { value: '9.5%', label: 'Of visits now from AI assistants' },
];

const PILLARS = [
  { icon: UserPlus, title: 'Get new leads', text: 'Reveal the companies on your website and the decision makers behind them.' },
  { icon: Rocket, title: 'Accelerate sales pipeline', text: 'Act on buying intent in real time, before your competitors do.' },
  { icon: TrendingUp, title: 'Grow share of wallet', text: 'Expand existing accounts when they research new products.' },
  { icon: RotateCcw, title: 'Win back customers', text: 'Reconnect with lapsed accounts the moment they return.' },
  { icon: Target, title: 'Land dream accounts', text: 'Target valuable accounts and know when they are in market.' },
];

const AUDIENCES: { icon: typeof Briefcase; tag: string; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Briefcase, tag: 'B2B sales', title: 'Ignite your B2B sales', text: 'Prioritise the hottest visitors and reach out while they are still on your site.', cta: 'Open the hot lead queue', tab: 'capacity' },
  { icon: Megaphone, tag: 'B2B marketing', title: 'Capture more demand', text: 'See which campaigns, channels and AI assistants bring in-market companies.', cta: 'See visitor analytics', tab: 'analytics' },
  { icon: Users, tag: 'Account management', title: 'Grow customer value', text: 'Spot customers researching new products and industries ready to expand.', cta: 'See industry insights', tab: 'carriers' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="lead-forensics-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="lead-forensics-home-hero">
        <div className="lead-forensics-home-hero-copy">
          <span className="lead-forensics-home-eyebrow">#1 in B2B website visitor identification</span>
          <h1 className="lead-forensics-home-h1">
            Turn anonymous B2B website traffic into <span className="lead-forensics-home-grad">revenue</span>
          </h1>
          <p className="lead-forensics-home-sub">Discover which companies are researching you and convert them before your competitors.</p>
          <div className="lead-forensics-home-ctas">
            <button className="lead-forensics-home-btn lead-forensics-home-btn-primary" onClick={() => onNavigate('analytics')}>
              Book a demo <ArrowRight size={18} />
            </button>
            <button className="lead-forensics-home-btn lead-forensics-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              Request a call back
            </button>
          </div>
          <div className="lead-forensics-home-ratings">
            {RATINGS.map((r) => (
              <div className="lead-forensics-home-rating" key={r.site}>
                <span className="lead-forensics-home-stars" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" />)}
                </span>
                <b>{r.score}</b>
                <span>{r.site}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lead-forensics-home-hero-art" aria-hidden="true">
          <div className="lead-forensics-home-photo">
            <img src="https://www.leadforensics.com/wp-content/uploads/2026/04/TOP-PAGE-PHOTO-scaled-1.jpg" alt="" loading="lazy" />
          </div>
          <div className="lead-forensics-home-float lead-forensics-home-float-a">
            <span className="lead-forensics-home-float-ico lead-forensics-home-float-hot"><Flame size={16} /></span>
            <div>
              <b>Hot lead: Bluepeak Manufacturing</b>
              <span>Viewed /pricing x3 today</span>
            </div>
          </div>
          <div className="lead-forensics-home-float lead-forensics-home-float-b">
            <span className="lead-forensics-home-float-ico"><CalendarCheck size={16} /></span>
            <div>
              <b>Meeting booked</b>
              <span>6 hours after the alert</span>
            </div>
          </div>
          <div className="lead-forensics-home-float lead-forensics-home-float-c">
            <span className="lead-forensics-home-float-ico lead-forensics-home-float-sf"><Cloud size={16} /></span>
            <div>
              <b>Synced to Salesforce</b>
            </div>
          </div>
        </div>
      </div>

      <div className="lead-forensics-home-stats">
        {STATS.map((s) => (
          <div className="lead-forensics-home-stat" key={s.label}>
            <span className="lead-forensics-home-stat-v">{s.value}</span>
            <span className="lead-forensics-home-stat-l">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="lead-forensics-home-leak">
        <span className="lead-forensics-home-leak-v">98%</span>
        <p>
          <b>of your traffic never converts.</b> {CONTENT.company} shows you who those visitors are, what they looked at and
          how to reach them.
        </p>
      </div>

      <div className="lead-forensics-home-section">
        <h2 className="lead-forensics-home-h2">What you can do with {CONTENT.company}</h2>
        <div className="lead-forensics-home-grid5">
          {PILLARS.map((p) => (
            <div className="lead-forensics-home-card" key={p.title}>
              <span className="lead-forensics-home-icon"><p.icon size={22} /></span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="lead-forensics-home-section">
        <h2 className="lead-forensics-home-h2">Built for revenue teams</h2>
        <div className="lead-forensics-home-grid3">
          {AUDIENCES.map((a) => (
            <button className="lead-forensics-home-card lead-forensics-home-aud" key={a.tag} onClick={() => onNavigate(a.tab)}>
              <span className="lead-forensics-home-tag"><a.icon size={14} /> {a.tag}</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <span className="lead-forensics-home-more">{a.cta} <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="lead-forensics-home-band">
        <div>
          <h2>Stop leaking leads from your website</h2>
          <p>Fill your pipeline with warm leads. Ask any question about your visitors, leads and pipeline.</p>
        </div>
        <button className="lead-forensics-home-btn lead-forensics-home-btn-light" onClick={() => onNavigate('ask')}>
          Ask {CONTENT.aiName} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
