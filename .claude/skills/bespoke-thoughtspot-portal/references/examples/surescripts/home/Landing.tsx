// Home landing page, modelled on surescripts.com: the "Let's inform & accelerate decisions to keep patient care on
// track" hero with the photo and sky-blue swoosh, the two floating proof-point cards (2.32 million professionals,
// 30.5 billion transactions), the featured row (Annual Impact Report, case study, insights), "Who we serve"
// (Life sciences, Payers, Care delivery, Pharmacy), the dark-blue network statistics band, "Why Surescripts"
// (99.998% uptime, Network Alliance) and the orange closing band.
// Deliberately NO analytics or embeds; the "your network" strip quotes headline numbers from the demo dataset.
import {
  ArrowRight,
  ChevronRight,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Pill,
  BookOpen,
  FileSearch,
  Lightbulb,
  CheckCircle2,
  BadgeDollarSign,
  TrendingDown,
  Network,
  Users,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG = '/surescripts-hero.jpg';

const FEATURED: { icon: typeof Pill; kicker: string; title: string; cta: string; tab: TabId }[] = [
  { icon: BookOpen, kicker: 'Annual Impact Report 2025', title: 'Nationwide insights on trusted health intelligence sharing', cta: 'See your network report', tab: 'analytics' },
  { icon: FileSearch, kicker: 'Case study', title: 'How electronic prior authorization cut turnaround from a day to hours', cta: 'Open the prior auth queue', tab: 'capacity' },
  { icon: Lightbulb, kicker: 'Insights', title: 'Price transparency at the point of prescribing: what RTPB does to abandonment', cta: 'Ask about RTPB', tab: 'ask' },
];

const SERVE: { icon: typeof Pill; title: string; text: string; links: string[]; tab: TabId; cta: string }[] = [
  { icon: FlaskConical, title: 'Life sciences', text: 'Together, we find and fix access barriers so patients have a faster, simpler path to treatment.', links: ['Life sciences companies', 'Patient access vendors'], tab: 'reports', cta: 'Build an access report' },
  { icon: ShieldCheck, title: 'Payers', text: 'Together, we use patient and benefit insights to enable informed care decisions, improve adherence and contain costs.', links: ['Health plans', 'PBMs', 'Payer technology vendors'], tab: 'carriers', cta: 'PBM insights' },
  { icon: Stethoscope, title: 'Care delivery', text: 'Together, we power care with up-to-date insights that fuel better, quicker care decisions.', links: ['Health systems', 'EHR vendors', 'Long-term & post-acute care'], tab: 'analytics', cta: 'Network intelligence' },
  { icon: Pill, title: 'Pharmacy', text: 'Together, we support pharmacy teams with accurate, timely data and collaboration tools to enable faster fulfillment and better patient care.', links: ['Pharmacies', 'Pharmacy technology vendors', 'Specialty pharmacies'], tab: 'capacity', cta: 'Prior auth queue' },
];

const NETWORK_STATS = [
  { value: '5.97 billion', label: 'clinical documents linked in 2025' },
  { value: '2.64 billion', label: 'e-prescriptions filled in 2025' },
  { value: '1 billion', label: 'Real-Time Prescription Benefit responses delivered to prescribers in 2025' },
  { value: '3.79 billion', label: 'medication histories delivered in 2025' },
];

const YOUR_STATS = [
  { value: '351K', label: 'Network transactions', note: 'Nov 2024 to Nov 2026' },
  { value: '1,070', label: 'Prescriber organizations', note: 'across 23 states' },
  { value: '5.4 h', label: 'Texas PA turnaround', note: 'down from 21.7 h after ePA rollout' },
  { value: '6.9%', label: 'Navitus abandonment', note: 'from 17.0% as RTPB use hit 73%' },
  { value: '34.7%', label: 'RTPB adoption', note: 'new prescriptions with a price check' },
  { value: '1.74%', label: 'Reject rate', note: 'messages rejected by receivers' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="surescripts-home" aria-label={`Welcome to ${CONTENT.company}`}>
      {/* Hero: copy left, photo right with the sky-blue swoosh, proof-point cards overlapping the curve */}
      <div className="surescripts-home-hero">
        <div className="surescripts-home-hero-photo" style={{ backgroundImage: `url(${HERO_IMG})` }} aria-hidden="true" />
        <svg className="surescripts-home-swoosh" viewBox="0 0 1440 360" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 C 360 300, 900 330, 1440 40 L1440 360 L0 360 Z" className="surescripts-home-swoosh-fill" />
          <path d="M0 150 C 380 320, 920 350, 1440 70 L1440 360 L0 360 Z" className="surescripts-home-swoosh-base" />
        </svg>
        <div className="surescripts-home-wrap surescripts-home-hero-inner">
          <div className="surescripts-home-hero-copy">
            <h1 className="surescripts-home-h1">
              Let&rsquo;s inform &amp; accelerate decisions to keep <span className="surescripts-home-accent">patient care on track</span>
            </h1>
            <p className="surescripts-home-hero-sub">
              Trusted health intelligence for every participant on the Surescripts network: e-prescribing, price
              transparency, electronic prior authorization and medication history, in one portal.
            </p>
            <div className="surescripts-home-ctas">
              <button className="surescripts-home-btn surescripts-home-btn-orange" onClick={() => onNavigate('analytics')}>
                Open network intelligence <ArrowRight size={16} />
              </button>
              <button className="surescripts-home-btn surescripts-home-btn-outline" onClick={() => onNavigate('capacity')}>
                Prior auth queue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="surescripts-home-float surescripts-home-float-a" aria-hidden="true">
          <CheckCircle2 size={18} />
          <div>
            <strong>Prior auth approved in 4.8 h</strong>
            <span>Touchless ePA, Texas health system</span>
          </div>
        </div>
        <div className="surescripts-home-float surescripts-home-float-b" aria-hidden="true">
          <BadgeDollarSign size={18} />
          <div>
            <strong>Lower-cost alternative chosen</strong>
            <span>RTPB check, patient saves $64</span>
          </div>
        </div>
        <div className="surescripts-home-wrap surescripts-home-proof">
          <div className="surescripts-home-proof-card">
            <strong>2.32 million</strong>
            <span>healthcare professionals &amp; provider organizations connected</span>
          </div>
          <div className="surescripts-home-proof-card">
            <strong>30.5 billion</strong>
            <span>network transactions in 2025</span>
          </div>
        </div>
      </div>

      {/* Featured row */}
      <div className="surescripts-home-wrap surescripts-home-featured">
        {FEATURED.map((f) => (
          <button key={f.kicker} className="surescripts-home-feature" onClick={() => onNavigate(f.tab)}>
            <span className="surescripts-home-feature-icon"><f.icon size={22} /></span>
            <span className="surescripts-home-kicker">{f.kicker}</span>
            <span className="surescripts-home-feature-title">{f.title}</span>
            <span className="surescripts-home-link">{f.cta} <ChevronRight size={15} /></span>
          </button>
        ))}
      </div>

      {/* Your network at a glance (demo data) */}
      <div className="surescripts-home-glance">
        <div className="surescripts-home-wrap">
          <span className="surescripts-home-kicker">Your network at a glance</span>
          <div className="surescripts-home-glance-row">
            {YOUR_STATS.map((s) => (
              <div className="surescripts-home-glance-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span className="surescripts-home-glance-label">{s.label}</span>
                <span className="surescripts-home-glance-note">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Who we serve */}
      <div className="surescripts-home-serve">
        <div className="surescripts-home-wrap">
          <span className="surescripts-home-kicker">Who we serve</span>
          <h2 className="surescripts-home-h2">Bringing healthcare together to help keep care on track</h2>
          <div className="surescripts-home-serve-grid">
            {SERVE.map((s) => (
              <div className="surescripts-home-serve-card" key={s.title}>
                <span className="surescripts-home-serve-icon"><s.icon size={22} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul>
                  {s.links.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <button className="surescripts-home-link" onClick={() => onNavigate(s.tab)}>
                  {s.cta} <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network statistics band (the site's dark-blue four-column statistics) */}
      <div className="surescripts-home-band">
        <div className="surescripts-home-wrap surescripts-home-band-row">
          {NETWORK_STATS.map((s) => (
            <div className="surescripts-home-band-stat" key={s.value}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Surescripts */}
      <div className="surescripts-home-wrap surescripts-home-why">
        <div className="surescripts-home-why-head">
          <span className="surescripts-home-kicker">Why Surescripts</span>
          <h2 className="surescripts-home-h2">Powering trusted health intelligence sharing nationwide</h2>
        </div>
        <div className="surescripts-home-why-grid">
          <div className="surescripts-home-why-card">
            <Network size={22} />
            <h3>The Surescripts network</h3>
            <p>Delivering industry-leading reliability, security and scalability.</p>
            <div className="surescripts-home-why-figure"><strong>99.998%</strong><span>average network uptime</span></div>
            <button className="surescripts-home-link" onClick={() => onNavigate('analytics')}>See response time and rejects <ChevronRight size={15} /></button>
          </div>
          <div className="surescripts-home-why-card">
            <Users size={22} />
            <h3>Network Alliance</h3>
            <p>Bringing changemakers from across the industry together to collaborate and solve some of the biggest challenges in healthcare.</p>
            <div className="surescripts-home-why-figure"><strong>2.32 million</strong><span>healthcare professionals &amp; provider organizations connected</span></div>
            <button className="surescripts-home-link" onClick={() => onNavigate('reports')}>Build your own report <ChevronRight size={15} /></button>
          </div>
          <div className="surescripts-home-why-card">
            <TrendingDown size={22} />
            <h3>Fewer abandoned prescriptions</h3>
            <p>Price transparency at the point of prescribing helps patients start therapy. See which PBMs and prescribers are getting there.</p>
            <div className="surescripts-home-why-figure"><strong>-59%</strong><span>Navitus abandonment since RTPB rollout (demo data)</span></div>
            <button className="surescripts-home-link" onClick={() => onNavigate('carriers')}>PBM insights <ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Closing band: the site's orange semicircle CTA */}
      <div className="surescripts-home-close">
        <div className="surescripts-home-close-arc" aria-hidden="true" />
        <div className="surescripts-home-wrap surescripts-home-close-inner">
          <h2>Let&rsquo;s keep patient care on track, together.</h2>
          <p>Ask the Surescripts Assistant about e-prescribing, RTPB or prior authorization, or ask a question of your own network data.</p>
          <button className="surescripts-home-btn surescripts-home-btn-white" onClick={() => onNavigate('ask')}>
            Ask Surescripts <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
