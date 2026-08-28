// Post-login landing hero for SalesSpot — a bold revenue-intelligence statement
// over a live, oscillating evergreen gradient, with an animated "revenue radar"
// visual on the right. Committed dark futuristic look regardless of app theme
// (mirrors the PharmaSpot landing). Edit HEADLINE / SUBLINE to change the copy;
// each headline segment renders white by default, or brand-emerald when accent.
import { ArrowRight, Sparkles } from 'lucide-react';
import type { TabId } from '../components/TopBar';

const HEADLINE: { text: string; accent?: boolean }[] = [
  { text: 'Turn every ' },
  { text: 'conversation, cadence, and signal', accent: true },
  { text: ' into ' },
  { text: 'revenue you can see coming.', accent: true },
];

const SUBLINE =
  'Real-time pipeline, cadence, and signal intelligence across every rep and deal — with AI answers on your live data, so your team always knows the next best move.';

const STATS: { value: string; label: string }[] = [
  { value: 'Real-time', label: 'Pipeline & cadence signals' },
  { value: 'AI-native', label: 'Answers on live data' },
  { value: 'Every deal', label: 'One revenue command center' },
];

interface Props {
  onNavigate: (tab: TabId) => void;
}

export default function Home({ onNavigate }: Props) {
  return (
    <section className="landing" aria-label="Welcome to SalesSpot">
      {/* live oscillating evergreen background */}
      <div className="landing-bg" aria-hidden="true">
        <span className="landing-blob b1" />
        <span className="landing-blob b2" />
        <span className="landing-blob b3" />
        <span className="landing-blob b4" />
      </div>

      <div className="landing-inner">
        <div className="landing-copy">
          <span className="landing-eyebrow">SalesSpot · Revenue Intelligence</span>
          <h1 className="landing-headline">
            {HEADLINE.map((seg, i) => (
              <span key={i} className={seg.accent ? 'accent' : undefined}>
                {seg.text}
              </span>
            ))}
          </h1>
          <p className="landing-sub">{SUBLINE}</p>

          <div className="landing-actions">
            <button className="landing-cta" onClick={() => onNavigate('analytics')}>
              Explore analytics <ArrowRight size={18} />
            </button>
            <button className="landing-cta ghost" onClick={() => onNavigate('ask')}>
              <Sparkles size={16} /> Ask SalesSpot AI
            </button>
          </div>

          <div className="landing-stats">
            {STATS.map((s) => (
              <div className="landing-stat" key={s.label}>
                <span className="landing-stat-value">{s.value}</span>
                <span className="landing-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* futuristic revenue-radar visual (fills the right side) */}
        <div className="landing-viz" aria-hidden="true">
          <svg className="orbit-svg" viewBox="0 0 400 400" fill="none">
            <defs>
              <radialGradient id="rv-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#34d399" stopOpacity=".42" />
                <stop offset="55%" stopColor="#15ae6e" stopOpacity=".12" />
                <stop offset="100%" stopColor="#15ae6e" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rv-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#15ae6e" />
              </linearGradient>
              <linearGradient id="rv-sweep" x1="0.5" y1="0.5" x2="0.5" y2="0">
                <stop offset="0" stopColor="#34d399" stopOpacity="0" />
                <stop offset="100%" stopColor="#34d399" stopOpacity=".5" />
              </linearGradient>
              <filter id="rv-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* ambient glow + outer ring */}
            <circle cx="200" cy="200" r="182" fill="url(#rv-glow)" />
            <circle cx="200" cy="200" r="176" stroke="#6ee7b7" strokeOpacity=".16" strokeWidth="1.5" />

            {/* radar sweep — a rotating luminous wedge */}
            <g className="rv-sweep">
              <path d="M200 200 L200 22 A178 178 0 0 1 326 74 Z" fill="url(#rv-sweep)" />
              <line x1="200" y1="200" x2="200" y2="22" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round" filter="url(#rv-soft)" />
            </g>

            {/* concentric radar rings + faint axes */}
            <circle cx="200" cy="200" r="165" stroke="#34d399" strokeOpacity=".14" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="110" stroke="#34d399" strokeOpacity=".18" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="55" stroke="#34d399" strokeOpacity=".22" strokeWidth="1.5" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="#34d399" strokeOpacity=".08" strokeWidth="1" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="#34d399" strokeOpacity=".08" strokeWidth="1" />

            {/* bright leading arc on the outer ring */}
            <path className="rv-orbit-a" d="M200 24 a176 176 0 0 1 150 88" stroke="url(#rv-arc)" strokeWidth="2.5" strokeLinecap="round" filter="url(#rv-soft)" style={{ transformOrigin: '200px 200px' }} />

            {/* orbiting signal nodes (deals / cadences / signals) */}
            <g className="rv-orbit-a">
              <circle cx="365" cy="200" r="5" fill="#34d399" />
              <circle cx="35" cy="200" r="3.5" fill="#6ee7b7" />
            </g>
            <g className="rv-orbit-b">
              <circle cx="310" cy="200" r="4.5" fill="#f26b5e" />
              <circle cx="90" cy="200" r="3" fill="#34d399" />
            </g>
            <g className="rv-orbit-c">
              <circle cx="255" cy="200" r="4" fill="#6ee7b7" />
            </g>

            {/* twinkles */}
            <circle className="rv-tw" cx="118" cy="98" r="2" fill="#6ee7b7" />
            <circle className="rv-tw b" cx="300" cy="300" r="2" fill="#f26b5e" />
            <circle className="rv-tw" cx="96" cy="292" r="1.6" fill="#34d399" />

            {/* pulsing core with a rising-revenue spark */}
            <g className="rv-core">
              <circle cx="200" cy="200" r="34" fill="#08241d" stroke="#34d399" strokeOpacity=".5" />
              <polyline points="184,212 192,205 200,208 208,197 216,189" fill="none" stroke="#6ee7b7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="216" cy="189" r="2.6" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
