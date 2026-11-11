// Home landing page, modelled on joinmoxie.com: the dark evergreen hero "Grow Your Aesthetic Practice with
// Standards - Not Shortcuts" with its "Trusted by 700+ Practices" tagline and practice-owner portrait, the proof-point
// strip, "Meet Moxie" pillars (Clinical-Grade EMR+, Expert-Led Support, Always-On Optimization, Peer Community), the
// five outcomes, the "Who we help" audience cards, the GoodJuju testimonial and the "in business for yourself" band.
// Deliberately NO analytics or embeds; the stats quote headline numbers from the demo dataset as static copy.
import {
  ArrowRight,
  Sparkles,
  Wind,
  TrendingUp,
  ShieldCheck,
  HeartHandshake,
  Building2,
  Rocket,
  UserRound,
  Users,
  TrendingDown,
  Crown,
  Quote,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const CDN = 'https://cdn.prod.website-files.com/62d6530a61ad7106276fd746/';
const HERO_IMG = CDN + '6ab2ea43c0a911a9623b68a6_home-stats_julie-mallon.webp';

const PROOF = [
  { value: '2x', label: 'Higher average order value vs. national average' },
  { value: '$31M', label: 'Saved on supplies across Moxie-supported practices' },
  { value: '65%', label: 'Lower patient acquisition costs vs. top agencies' },
  { value: '+25 hrs', label: 'Time saved weekly, per practice' },
];

const STATS = [
  { value: '376,553', label: 'Service lines booked' },
  { value: '$199.5M', label: 'Net revenue' },
  { value: '58.9%', label: 'Rebook rate' },
  { value: '$604', label: 'Average ticket' },
  { value: '67.9%', label: 'Gross margin' },
  { value: '20', label: 'Practices' },
];

const PILLARS: { title: string; text: string; img: string; cta: string; tab: TabId }[] = [
  { title: 'Clinical-Grade EMR+', text: 'Built for the realities of aesthetic medicine: charting, scheduling, payments and inventory in one system.', img: CDN + '69a9c8a76cb467e7aec3302b_Moxie%20Clinical%20Grade%20EMR%20Image%20(1)-p-500.webp', cta: 'Open practice analytics', tab: 'analytics' },
  { title: 'Expert-Led Support', text: 'Former operators who implement, not just advise: pricing, service mix, compensation and P&L reviews.', img: CDN + '69a9c8c94a1e0bce991f8122_Moxie%20Support%20Image-p-500.png', cta: 'See practice insights', tab: 'carriers' },
  { title: 'Always-On Optimization', text: 'Surfacing risk before growth exposes it: rebooking, no-shows and recalls flagged as they happen.', img: CDN + '69a9c8dbd26d2677edad7cd2_Always%20On%20Optimization%20Image%20from%20Moxie-p-500.webp', cta: 'Work the recall queue', tab: 'capacity' },
  { title: 'Peer Community', text: 'Leaders raising the standard together in Scale Society, with your numbers benchmarked against theirs.', img: CDN + '69aefb8cac9beb1b42051ee8_Moxie%20Peer%20Community%20Image-p-500.webp', cta: 'Build my reports', tab: 'my-analytics' },
];

const OUTCOMES = [
  { icon: Wind, title: 'Calm the Chaos', text: 'Build a practice that runs smoothly, even when you step away.' },
  { icon: TrendingUp, title: 'Increase Profit', text: 'Grow revenue and keep more of what you earn.' },
  { icon: ShieldCheck, title: 'Protect Your Practice', text: 'Grow without risking your license, reputation or standards.' },
  { icon: HeartHandshake, title: 'Grow Loyal Patient Base', text: 'Turn first visits into long-term relationships.' },
  { icon: Building2, title: 'Scale With Confidence', text: 'Add providers. Open locations. Expand intelligently.' },
];

const AUDIENCES: { icon: typeof Rocket; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Rocket, title: 'Aspiring Practice Owners', text: 'Everything you need to open strong, from launch plan to first 90 days of bookings.', cta: 'Ask Maia how to launch', tab: 'ask' },
  { icon: UserRound, title: 'Solo Provider Practices', text: 'Turn your momentum into a machine: rebook every patient before they leave.', cta: 'See my rebook rate', tab: 'analytics' },
  { icon: Users, title: 'Multi-Provider Practices', text: 'Grow profitably with less chaos: compare injectors, locations and memberships side by side.', cta: 'Compare practices', tab: 'carriers' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="moxie-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="moxie-home-hero">
        <div className="moxie-home-hero-copy">
          <span className="moxie-home-tag">Trusted by 700+ Practices</span>
          <h1 className="moxie-home-h1">
            Grow Your Aesthetic Practice with <span className="moxie-home-accent">Standards</span>&mdash;Not Shortcuts
          </h1>
          <p className="moxie-home-sub">
            Moxie combines clinical-grade systems and hands-on operational expertise so you can grow without compromising
            your clinical standards, patient outcomes, or business ambitions. Your practice numbers, live, with Maia on hand.
          </p>
          <div className="moxie-home-ctas">
            <button className="moxie-home-btn moxie-home-btn-gold" onClick={() => onNavigate('analytics')}>
              Explore practice analytics <ArrowRight size={16} />
            </button>
            <button className="moxie-home-btn moxie-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              Open the recall queue
            </button>
          </div>
        </div>
        <div className="moxie-home-hero-media">
          <img src={HERO_IMG} alt="Julie Mallon, owner of GoodJuju" loading="eager" />
          <div className="moxie-home-moment moxie-home-moment-a">
            <TrendingDown size={16} />
            <div>
              <strong>Rebook rate 71% &rarr; 36%</strong>
              <span>Zara Hughes, NP &middot; Desert Bloom</span>
            </div>
          </div>
          <div className="moxie-home-moment moxie-home-moment-b">
            <Crown size={16} />
            <div>
              <strong>Member share 11% &rarr; 31%</strong>
              <span>since the membership launch</span>
            </div>
          </div>
          <blockquote className="moxie-home-quote-chip">
            &ldquo;My first month, I exceeded the sales projection. The next month, I doubled it.&rdquo;
            <cite>Julie Mallon, Owner, GoodJuju</cite>
          </blockquote>
        </div>
      </div>

      <div className="moxie-home-proof">
        {PROOF.map((p) => (
          <div className="moxie-home-proof-item" key={p.label}>
            <strong>{p.value}</strong>
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      <div className="moxie-home-section">
        <p className="moxie-home-eyebrow">Your practice, in numbers</p>
        <div className="moxie-home-stats">
          {STATS.map((s) => (
            <div className="moxie-home-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="moxie-home-section">
        <h2 className="moxie-home-h2">
          Meet Moxie: The Clinical-Grade Operating System for <em>Aesthetic Medicine</em>
        </h2>
        <p className="moxie-home-lead">
          Some companies sell software. Others sell advice. Elite aesthetic practices can&rsquo;t scale without both.
        </p>
        <div className="moxie-home-pillars">
          {PILLARS.map((p) => (
            <button className="moxie-home-pillar" key={p.title} onClick={() => onNavigate(p.tab)}>
              <div className="moxie-home-pillar-img">
                <img src={p.img} alt="" loading="lazy" />
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span className="moxie-home-link">
                {p.cta} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="moxie-home-section moxie-home-outcomes-wrap">
        <h2 className="moxie-home-h2">
          One System. <em>Everything</em> You Need.
        </h2>
        <p className="moxie-home-lead">Moxie replaces 5+ disconnected systems with one integrated solution, designed exclusively for aesthetic medicine.</p>
        <div className="moxie-home-outcomes">
          {OUTCOMES.map((o) => (
            <div className="moxie-home-outcome" key={o.title}>
              <o.icon size={20} />
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="moxie-home-section">
        <p className="moxie-home-eyebrow">Who we help</p>
        <h2 className="moxie-home-h2">Discover how entrepreneurs like you are transforming with us.</h2>
        <div className="moxie-home-audiences">
          {AUDIENCES.map((a) => (
            <button className="moxie-home-audience" key={a.title} onClick={() => onNavigate(a.tab)}>
              <a.icon size={22} />
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <span className="moxie-home-link">
                {a.cta} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="moxie-home-testimonial">
        <Quote size={28} />
        <p>
          &ldquo;Moxie provides stability and peace of mind. Moxie wasn&rsquo;t my first partner, but they&rsquo;re going to be
          my last.&rdquo;
        </p>
        <cite>Dr. Alexandra Palumbo, DNP, APRN, FNP-C &middot; Founder of Blonde Girl Aesthetics</cite>
      </div>

      <div className="moxie-home-band">
        <div>
          <h2>
            You&rsquo;re in business <em>for</em> yourself&mdash;never <em>by</em> yourself.
          </h2>
          <p>Ask Maia anything about your practice: rebooking, memberships, provider performance and recalls, answered from your live data.</p>
        </div>
        <button className="moxie-home-btn moxie-home-btn-gold" onClick={() => onNavigate('ask')}>
          <Sparkles size={16} /> Ask Maia
        </button>
      </div>
    </section>
  );
}
