// Home landing page, modelled on nooks.ai's own homepage: the "Revenue infrastructure for reps and agents"
// hero with its review score and "Book a demo" CTA, the "Run agents across the entire revenue lifecycle"
// motions (Outbound, Inbound, Deal Management, Expansion, Coaching & Performance), the four products, the
// "Outcomes speak loudest" proof section and the closing "Revenue agents that actually work." band.
// Deliberately NO analytics or embeds; the stats strip quotes headline numbers from the demo dataset as static copy.
import {
  ArrowRight, Star, PhoneCall, CalendarCheck, BellRing, Send, Zap, Briefcase, TrendingUp, GraduationCap,
  PhoneOutgoing, ListChecks, Radar, Sparkles,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/nooks-home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG =
  'https://cdn.prod.website-files.com/697107c16c913fd77cf0aacd/6aa7bbd5e5143ea322510776_Home%20-%20header%201-p-1600.webp';

const STATS = [
  { value: '344K', label: 'Dials placed' },
  { value: '10.8%', label: 'Connect rate' },
  { value: '59.5%', label: 'Connects that became conversations' },
  { value: '4.1K', label: 'Meetings booked' },
  { value: '36 reps', label: '10 sequences across Nooks, Outreach, Salesloft and HubSpot' },
];

const MOTIONS = [
  { icon: Send, tag: 'Outbound', title: 'Accelerate pipeline growth.', text: 'Research, prioritize, personalize and execute multi-channel outreach that turns more activity into conversations.' },
  { icon: Zap, tag: 'Inbound', title: 'Turn interest into action.', text: 'Identify buying signals, prioritize the right accounts and engage prospects while intent is high.' },
  { icon: Briefcase, tag: 'Deal Management', title: 'Keep every deal moving.', text: 'Automatic follow-up, next steps and stakeholder intelligence that keep opportunities on track.' },
  { icon: TrendingUp, tag: 'Expansion', title: 'Find your next opportunity.', text: 'Surface signals across your customer base and act on expansion plays before they are missed.' },
  { icon: GraduationCap, tag: 'Coaching & Performance', title: 'Turn every rep into a top performer.', text: 'See what your best reps do differently and coach every seller against real conversations.' },
];

const PRODUCTS: { icon: typeof PhoneOutgoing; tag: string; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: PhoneOutgoing, tag: 'AI Dialer', title: 'Skip the noise and connect with 3x more prospects', text: 'Dials, connects, conversations and meetings for the whole team, by sequence, account and persona.', cta: 'See call analytics', tab: 'analytics' },
  { icon: GraduationCap, tag: 'AI Coaching', title: 'Level up reps with AI-powered coaching', text: 'Key metrics for every rep, plus how each one handles the objections your team hears most.', cta: 'Open rep insights', tab: 'carriers' },
  { icon: ListChecks, tag: 'AI Sequencing', title: 'Multi-channel engagement with AI agents', text: 'Never drop a callback: prospects who asked to be called back, due today or overdue.', cta: 'Work the callback list', tab: 'capacity' },
  { icon: Radar, tag: 'Signals and Intelligence', title: 'The insight engine for your GTM motion', text: 'Ask which signals, personas and accounts are connecting, and get a live chart back.', cta: `Ask ${CONTENT.aiName}`, tab: 'ask' },
];

const PROOF = [
  { value: '+31%', label: 'meetings' },
  { value: '100%', label: 'reps at quota' },
  { value: '30%', label: 'faster ramp' },
  { value: '90%', label: 'SDR time savings' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="nooks-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="nooks-home-hero">
        <div className="nooks-home-hero-copy">
          <div className="nooks-home-rating">
            <span className="nooks-home-stars" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="currentColor" />)}
            </span>
            <b>4.8</b> / 1,700+ reviews
          </div>
          <h1 className="nooks-home-h1">
            Revenue infrastructure for <span className="nooks-home-grad">reps and agents</span>
          </h1>
          <p className="nooks-home-sub">
            One execution layer across every motion. Every lead worked, every deal moved, every account covered.
          </p>
          <div className="nooks-home-ctas">
            <button className="nooks-home-btn nooks-home-btn-primary" onClick={() => onNavigate('analytics')}>
              Explore call analytics <ArrowRight size={18} />
            </button>
            <button className="nooks-home-btn nooks-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              Open the callback list
            </button>
          </div>
        </div>
        <div className="nooks-home-hero-art" aria-hidden="true">
          <div className="nooks-home-photo">
            <img src={HERO_IMG} alt="" loading="lazy" />
          </div>
          <div className="nooks-home-float nooks-home-float-a">
            <span className="nooks-home-float-ico"><PhoneCall size={16} /></span>
            <div>
              <b>RevOps Leader connect rate 21.7%</b>
              <span>+13 pts with Signal-Based Dialing</span>
            </div>
          </div>
          <div className="nooks-home-float nooks-home-float-b">
            <span className="nooks-home-float-ico nooks-home-float-alt"><BellRing size={16} /></span>
            <div>
              <b>Callbacks due today: 19</b>
              <span>Overdue first</span>
            </div>
          </div>
          <div className="nooks-home-float nooks-home-float-c">
            <span className="nooks-home-float-ico"><CalendarCheck size={16} /></span>
            <div>
              <b>Meeting booked</b>
              <span>from a parallel dial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="nooks-home-stats">
        {STATS.map((s) => (
          <div className="nooks-home-stat" key={s.label}>
            <span className="nooks-home-stat-v">{s.value}</span>
            <span className="nooks-home-stat-l">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="nooks-home-section">
        <span className="nooks-home-kicker">/ The revenue agent platform</span>
        <h2 className="nooks-home-h2">Run agents across the entire revenue lifecycle</h2>
        <div className="nooks-home-grid5">
          {MOTIONS.map((m) => (
            <div className="nooks-home-card" key={m.tag}>
              <span className="nooks-home-icon"><m.icon size={20} /></span>
              <span className="nooks-home-tag">{m.tag}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="nooks-home-section">
        <span className="nooks-home-kicker">/ Products</span>
        <h2 className="nooks-home-h2">Technology that makes it easy to exceed quota</h2>
        <div className="nooks-home-grid4">
          {PRODUCTS.map((p) => (
            <button className="nooks-home-card nooks-home-aud" key={p.tag} onClick={() => onNavigate(p.tab)}>
              <span className="nooks-home-tag"><p.icon size={14} /> {p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span className="nooks-home-more">{p.cta} <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="nooks-home-proof">
        <div className="nooks-home-proof-head">
          <span className="nooks-home-kicker">/ Outcomes speak loudest</span>
          <h2 className="nooks-home-h2">Agents that deliver. Numbers that prove it.</h2>
          <blockquote>
            "The proof is in the pudding of being able to see a 31% increase in meetings, which is huge. I could
            consolidate three different vendors and just use Nooks."
            <cite>Head of Sales Development (Americas)</cite>
          </blockquote>
        </div>
        <div className="nooks-home-proof-grid">
          {PROOF.map((p) => (
            <div className="nooks-home-proof-item" key={p.label}>
              <span className="nooks-home-proof-v">{p.value}</span>
              <span className="nooks-home-proof-l">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nooks-home-band">
        <div>
          <h2>Revenue agents that actually work.</h2>
          <p>The agent platform for modern GTM teams. Ask any question about your dials, connects, objections and meetings.</p>
        </div>
        <button className="nooks-home-btn nooks-home-btn-light" onClick={() => onNavigate('ask')}>
          <Sparkles size={16} /> Ask {CONTENT.aiName} <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
