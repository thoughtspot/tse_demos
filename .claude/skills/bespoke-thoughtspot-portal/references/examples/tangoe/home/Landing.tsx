// Home landing page, modelled on tangoe.com: the "Leading IT Asset & Expense Management Solution" hero with the
// meeting photo and two floating product moments, the "practical strategies to reduce costs" banner, the four
// "AI-Perfected IT Asset & Expense Management" cards (Experience, Global, Ecosystem, Service), the "AI-Powered
// Platform for Complete Technology Lifecycle Management" band, resource cards, the IT / Finance / Procurement
// audience row and the "Let's Get Started!" closing band.
// Deliberately NO analytics or embeds; the "your Tangoe One" strip quotes headline numbers from the demo dataset.
import {
  ArrowRight,
  Award,
  BadgeDollarSign,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cloud,
  FileSearch,
  Globe,
  Network,
  Play,
  Receipt,
  Server,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG = '/tangoe-hero.webp';

const PILLARS: { icon: typeof Award; title: string; points: string[] }[] = [
  { icon: Award, title: 'Experience', points: ['Pioneered TEM 25+ years ago', 'Visionary, Gartner Magic Quadrant MMS', '370K invoices processed monthly', '$15B in IT spend under management'] },
  { icon: Globe, title: 'Global', points: ['206 countries & territories', '19 languages', '129 currencies', 'Help desk in 9 languages'] },
  { icon: Network, title: 'Ecosystem', points: ['400+ global providers', '300+ SaaS integrations', '4 major IaaS providers', 'ServiceNow integration'] },
  { icon: CheckCircle2, title: 'Service', points: ['Stevie Award for implementation', 'Gartner Peer Insights top provider', 'Industry-leading SLAs', 'Designated customer success manager'] },
];

const LIFECYCLE: { icon: typeof Award; title: string; text: string; tab: TabId; cta: string }[] = [
  { icon: Receipt, title: 'Telecom', text: 'Audit every carrier invoice, dispute billing errors and track credits until they land.', tab: 'analytics', cta: 'Invoice audit' },
  { icon: Smartphone, title: 'Mobile', text: 'See every line and device, spot zero-usage lines and reclaim them before the next bill.', tab: 'capacity', cta: 'Reclaim queue' },
  { icon: Cloud, title: 'Cloud & SaaS', text: 'Right-size licenses and cloud accounts, and find the seats nobody has logged into.', tab: 'carriers', cta: 'Business unit insights' },
  { icon: Sparkles, title: 'AI answers', text: 'Ask any question of your expense data in plain language and get a live chart back.', tab: 'ask', cta: 'Ask Tangoe' },
];

const RESOURCES: { icon: typeof Award; kicker: string; title: string; cta: string; tab: TabId }[] = [
  { icon: TrendingDown, kicker: 'Guide', title: '2026 IT Savings Tips', cta: 'Find your savings', tab: 'analytics' },
  { icon: Cloud, kicker: 'Report', title: 'State of Cloud Study: FinOps Software Critical to Cost Control', cta: 'Explore cloud spend', tab: 'my-analytics' },
  { icon: BookOpen, kicker: 'Buyer’s guide', title: 'Buyer’s Guide to IT Expense Management', cta: 'Ask Tangoe', tab: 'ask' },
];

const AUDIENCES: { icon: typeof Award; title: string; text: string; tab: TabId; cta: string }[] = [
  { icon: Server, title: 'IT leaders', text: 'One inventory of lines, devices, licenses and circuits, with the idle ones flagged for action.', tab: 'capacity', cta: 'Open the reclaim queue' },
  { icon: Wallet, title: 'Finance leaders', text: 'Spend by business unit, cost center and GL code, with audit savings you can book.', tab: 'analytics', cta: 'Open expense intelligence' },
  { icon: ShoppingCart, title: 'Procurement leaders', text: 'Carrier and vendor performance, billing error rates and dispute recovery in one view.', tab: 'carriers', cta: 'Compare business units' },
];

const YOUR_STATS = [
  { value: '$115.8M', label: 'Billed IT spend', note: 'Nov 2024 to Nov 2026' },
  { value: '14,152', label: 'Lines, seats & circuits', note: 'mobile, SaaS, UCaaS, network, cloud' },
  { value: '6.7%', label: 'Zero-usage lines', note: 'billed with no usage for 30+ days' },
  { value: '20.8%', label: 'Field Operations idle', note: 'up from 6.0% in Apr 2026' },
  { value: '26.1%', label: 'Vodafone billing errors', note: 'mobile charges, from 7.3% in May' },
  { value: '$1.0M', label: 'Credits recovered', note: '68.6% of disputed amount' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="tangoe-home" aria-label={`Welcome to ${CONTENT.company}`}>
      {/* Hero */}
      <div className="tangoe-home-hero">
        <div className="tangoe-home-hero-copy">
          <div className="tangoe-home-eyebrow">Tangoe One Expense Intelligence</div>
          <h1 className="tangoe-home-h1">
            Leading IT Asset &amp; <span className="tangoe-home-accent">Expense Management</span> Solution
          </h1>
          <p className="tangoe-home-sub">
            Tangoe created the industry&rsquo;s first comprehensive platform to control your cloud, mobile, and telecom
            costs with guaranteed savings. Now with live analytics on every line, license, invoice and dispute.
          </p>
          <div className="tangoe-home-ctas">
            <button className="tangoe-home-btn tangoe-home-btn-primary" onClick={() => onNavigate('analytics')}>
              Open expense intelligence <ArrowRight size={16} />
            </button>
            <button className="tangoe-home-btn tangoe-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              <Play size={15} /> Start saving
            </button>
          </div>
        </div>
        <div className="tangoe-home-hero-art">
          <div className="tangoe-home-dots" aria-hidden="true" />
          <img className="tangoe-home-hero-img" src={HERO_IMG} alt="IT and finance team reviewing technology spend" />
          <div className="tangoe-home-moment tangoe-home-moment-a">
            <span className="tangoe-home-moment-icon"><Smartphone size={16} /></span>
            <div>
              <strong>Zombie line reclaimed</strong>
              <span>$46/mo saved &middot; Field Operations</span>
            </div>
          </div>
          <div className="tangoe-home-moment tangoe-home-moment-b">
            <span className="tangoe-home-moment-icon tangoe-home-moment-icon-green"><BadgeDollarSign size={16} /></span>
            <div>
              <strong>Vodafone dispute credited</strong>
              <span>Rate mismatch &middot; credit on next invoice</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="tangoe-home-banner">
        <span>Explore practical strategies to reduce costs across mobile, cloud and telecom.</span>
        <button className="tangoe-home-btn tangoe-home-btn-light" onClick={() => onNavigate('capacity')}>
          Start saving <ArrowRight size={15} />
        </button>
      </div>

      {/* Your Tangoe One */}
      <div className="tangoe-home-section">
        <div className="tangoe-home-section-head">
          <div className="tangoe-home-kicker">Your Tangoe One</div>
          <h2 className="tangoe-home-h2">What your invoices are telling you</h2>
        </div>
        <div className="tangoe-home-stats">
          {YOUR_STATS.map((s) => (
            <div key={s.label} className="tangoe-home-stat">
              <div className="tangoe-home-stat-value">{s.value}</div>
              <div className="tangoe-home-stat-label">{s.label}</div>
              <div className="tangoe-home-stat-note">{s.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div className="tangoe-home-section">
        <div className="tangoe-home-section-head tangoe-home-center">
          <h2 className="tangoe-home-h2">
            <span className="tangoe-home-accent">AI-Perfected</span> IT Asset &amp; Expense Management
          </h2>
        </div>
        <div className="tangoe-home-pillars">
          {PILLARS.map((p) => (
            <div key={p.title} className="tangoe-home-pillar">
              <span className="tangoe-home-pillar-icon"><p.icon size={22} /></span>
              <h3>{p.title}</h3>
              <ul>
                {p.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle band */}
      <div className="tangoe-home-band">
        <div className="tangoe-home-band-head">
          <h2>AI-Powered Platform for Complete Technology Lifecycle Management</h2>
          <p>Everything you need, right where you need it.</p>
        </div>
        <div className="tangoe-home-band-grid">
          {LIFECYCLE.map((l) => (
            <button key={l.title} className="tangoe-home-band-card" onClick={() => onNavigate(l.tab)}>
              <l.icon size={22} />
              <h3>{l.title}</h3>
              <p>{l.text}</p>
              <span className="tangoe-home-link">{l.cta} <ChevronRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="tangoe-home-section">
        <div className="tangoe-home-section-head">
          <div className="tangoe-home-kicker">Explore more resources</div>
          <h2 className="tangoe-home-h2">Experience and expertise you can trust</h2>
        </div>
        <div className="tangoe-home-resources">
          {RESOURCES.map((r) => (
            <button key={r.title} className="tangoe-home-resource" onClick={() => onNavigate(r.tab)}>
              <span className="tangoe-home-resource-icon"><r.icon size={20} /></span>
              <span className="tangoe-home-resource-kicker">{r.kicker}</span>
              <span className="tangoe-home-resource-title">{r.title}</span>
              <span className="tangoe-home-link">{r.cta} <ArrowRight size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* Audiences */}
      <div className="tangoe-home-section">
        <div className="tangoe-home-section-head">
          <div className="tangoe-home-kicker">Serving enterprises of all sizes</div>
          <h2 className="tangoe-home-h2">Built for the people who own technology spend</h2>
        </div>
        <div className="tangoe-home-audiences">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="tangoe-home-audience">
              <span className="tangoe-home-pillar-icon"><a.icon size={20} /></span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <button className="tangoe-home-link tangoe-home-link-btn" onClick={() => onNavigate(a.tab)}>
                {a.cta} <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Closing band */}
      <div className="tangoe-home-closing">
        <div>
          <h2>Let&rsquo;s Get Started!</h2>
          <p>Guaranteed savings across mobile, cloud and telecom. Ask Tangoe where your next dollar of savings is.</p>
        </div>
        <div className="tangoe-home-ctas">
          <button className="tangoe-home-btn tangoe-home-btn-green" onClick={() => onNavigate('ask')}>
            <FileSearch size={16} /> Ask Tangoe
          </button>
          <button className="tangoe-home-btn tangoe-home-btn-light" onClick={() => onNavigate('analytics')}>
            Open expense intelligence <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
