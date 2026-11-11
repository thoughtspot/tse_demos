// Home landing page, modelled on scania.com/group/en: the "Welcome to Scania" hero with the purpose line "drive the
// shift towards a sustainable transport system", the "In focus" teasers (Scania Dynamic, the new generation Scania
// Touring, the Irizar i6S Efficient PHEV award), the Euro NCAP five-star truck range (L, P, G and R series) plus
// buses & coaches, engines and services, the sustainable transport / science-based targets band, the
// "We drive real change" careers and Scania in brief block, and a closing purpose band.
// Deliberately NO analytics or embeds; the stats strip quotes headline numbers from the demo dataset as static copy.
import {
  ArrowRight,
  Truck,
  Bus,
  Cog,
  Wrench,
  Leaf,
  Users,
  UserCheck,
  Gauge,
  Zap,
  AlertTriangle,
  CalendarCheck,
  ShieldCheck,
  Route,
  Star,
  Sparkles,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const IMG = (p: string) => `https://www.scania.com${p}`;
const HERO_IMG = IMG('/content/dam/www/market/master/campaigns/touring/hero-touring-16-7.jpg');

const STATS = [
  { value: '359K', label: 'Vehicle shifts analysed', note: 'Nov 2024 - Nov 2026' },
  { value: '633', label: 'Connected vehicles', note: 'trucks, buses and coaches' },
  { value: '-37%', label: 'Nordic CO2 per km', note: '0.70 to 0.44 kg as BEV share hit 50%' },
  { value: '90.8%', label: 'Maintenance adherence', note: 'planned visits kept on time' },
  { value: '6', label: 'Applications', note: 'long haul to city bus' },
  { value: '15', label: 'Countries', note: 'across the European network' },
];

const FOCUS: { img: string; kicker: string; title: string; text: string; cta: string; tab: TabId }[] = [
  {
    img: IMG('/content/dam/www/market/master/campaigns/dynamic/scania-dynamic-youtube-video.jpg'),
    kicker: 'Scania Dynamic',
    title: "So good it's hard to describe",
    text: 'The next generation of long-haul transport: advanced aerodynamics, premium cab comfort and intelligent safety systems.',
    cta: 'See long-haul fuel and idle',
    tab: 'analytics',
  },
  {
    img: IMG('/content/dam/group/startpage/teasers/scania-irizar-phev-16-7.jpg'),
    kicker: 'Sustainable Bus Award 2027',
    title: 'Scania Irizar i6S Efficient PHEV',
    text: 'Electric driving with long-distance capability wins the coach category. Track how your electrified fleet performs.',
    cta: 'Ask about electrification',
    tab: 'ask',
  },
  {
    img: IMG('/content/dam/group/startpage/in-focus/scania-next-mile-oslo-sustainable-transport-forum.jpg'),
    kicker: 'From frontrunner to scale',
    title: "Lessons from Norway's transport transition",
    text: 'Electric trucks, renewable fuels and charging infrastructure: the Nordics show what scaling the shift looks like.',
    cta: 'Open sustainability reports',
    tab: 'reports',
  },
];

const SERIES: { img: string; name: string; text: string }[] = [
  { img: IMG('/content/dam/www/market/master/products/trucks/l-series/scania-l-cab-awarded-five-stars-in-euro-ncap-safer-trucks.jpg'), name: 'L-series', text: 'Utility operations: superior visibility, easy entry and exit.' },
  { img: IMG('/content/dam/www/market/master/products/trucks/p-series/euroncap-scania-p-serie.jpg'), name: 'P-series', text: 'Distribution: a high driving position and strong all-round view.' },
  { img: IMG('/content/dam/www/market/master/products/trucks/g-series/euroncap-scania-g-series.jpg'), name: 'G-series', text: 'Regional and long haulage with a five-star Euro NCAP cab.' },
  { img: IMG('/content/dam/www/market/master/products/trucks/r-series/euroncap-scania-r-series.jpg'), name: 'R-series', text: 'Premium long haulage, 96 percent for crash avoidance.' },
];

const RANGE: { icon: typeof Truck; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Truck, title: 'Trucks', text: 'L, P, G, R and S series for every haul, from city utility to premium long distance.', cta: 'Fleet performance', tab: 'analytics' },
  { icon: Bus, title: 'Buses & coaches', text: 'City buses and the new generation Scania Touring, electric, hybrid and renewable-fuel ready.', cta: 'Compare applications', tab: 'analytics' },
  { icon: Cog, title: 'Engines', text: 'Industrial, marine and power-generation engines plus electric machines like the EM 505A.', cta: 'Build a report', tab: 'reports' },
  { icon: Wrench, title: 'Services', text: 'Connected services, maintenance plans and workshops that keep uptime high.', cta: 'Workshop queue', tab: 'capacity' },
];

const AUDIENCES: { icon: typeof Truck; title: string; text: string; cta: string; tab: TabId }[] = [
  { icon: Route, title: 'Hauliers', text: 'Fuel, utilisation and cost per km across every route and application.', cta: 'Fleet performance', tab: 'analytics' },
  { icon: UserCheck, title: 'Drivers', text: 'Driver evaluation scores on anticipation, braking, idling and speed.', cta: 'Driver evaluation', tab: 'carriers' },
  { icon: Wrench, title: 'Workshop & maintenance', text: 'Planned visits, overdue services and the next vehicles to book in.', cta: 'Workshop queue', tab: 'capacity' },
  { icon: Bus, title: 'Bus & coach operators', text: 'Energy use, punctuality and uptime for city and intercity lines.', cta: 'Operator view', tab: 'analytics' },
  { icon: Leaf, title: 'Sustainability teams', text: 'CO2 per km, BEV share and progress against science-based targets.', cta: 'Sustainability reports', tab: 'reports' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="scania-home" aria-label={`Welcome to ${CONTENT.company}`}>
      {/* Hero */}
      <div className="scania-home-hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="scania-home-hero-shade" aria-hidden="true" />
        <div className="scania-home-wrap scania-home-hero-inner">
          <div className="scania-home-hero-copy">
            <span className="scania-home-eyebrow">Scania Group</span>
            <h1 className="scania-home-h1">Welcome to Scania</h1>
            <p className="scania-home-hero-sub">
              Our purpose is to drive the shift towards a{' '}
              <span className="scania-home-accent">sustainable transport system</span>, creating a world of mobility
              that is better for business, society and the environment.
            </p>
            <div className="scania-home-ctas">
              <button className="scania-home-btn scania-home-btn-primary" onClick={() => onNavigate('analytics')}>
                Explore fleet performance <ArrowRight size={16} />
              </button>
              <button className="scania-home-btn scania-home-btn-ghost" onClick={() => onNavigate('capacity')}>
                Open the workshop queue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="scania-home-float scania-home-float-a" aria-hidden="true">
          <Zap size={18} />
          <div>
            <strong>BEV share, Nordics: 50%</strong>
            <span>CO2 per km down to 0.44 kg</span>
          </div>
        </div>
        <div className="scania-home-float scania-home-float-b" aria-hidden="true">
          <AlertTriangle size={18} className="scania-home-float-alert" />
          <div>
            <strong>Idle alert: Poland long haul 23%</strong>
            <span>idle time share, flagged for coaching</span>
          </div>
        </div>
        <div className="scania-home-float scania-home-float-c" aria-hidden="true">
          <CalendarCheck size={18} />
          <div>
            <strong>Workshop visit booked</strong>
            <span>R-series planned service, on schedule</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="scania-home-stats">
        <div className="scania-home-wrap">
          <p className="scania-home-stats-title">Your connected fleet at a glance</p>
          <div className="scania-home-stats-row">
            {STATS.map((s) => (
              <div className="scania-home-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span className="scania-home-stat-label">{s.label}</span>
                <span className="scania-home-stat-note">{s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* In focus */}
      <div className="scania-home-band">
        <div className="scania-home-wrap">
          <div className="scania-home-head">
            <h2 className="scania-home-h2">In focus</h2>
            <p className="scania-home-lead">
              The new generation Scania Touring is being updated for the road ahead, with new powertrain options and
              enhanced safety. Here is what is moving the business right now.
            </p>
          </div>
          <div className="scania-home-focus">
            {FOCUS.map((f) => (
              <article className="scania-home-focus-card" key={f.title}>
                <div className="scania-home-focus-img" style={{ backgroundImage: `url(${f.img})` }} />
                <div className="scania-home-focus-body">
                  <span className="scania-home-kicker">{f.kicker}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  <button className="scania-home-link" onClick={() => onNavigate(f.tab)}>
                    {f.cta} <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Products and services */}
      <div className="scania-home-band scania-home-band-alt">
        <div className="scania-home-wrap">
          <div className="scania-home-head">
            <h2 className="scania-home-h2">Products &amp; services</h2>
            <p className="scania-home-lead">
              Five-star Euro NCAP safety across the truck range, with the G- and R-series scoring 96 percent for crash
              avoidance.
            </p>
          </div>
          <div className="scania-home-series">
            {SERIES.map((s) => (
              <div className="scania-home-series-card" key={s.name}>
                <div className="scania-home-series-img" style={{ backgroundImage: `url(${s.img})` }}>
                  <span className="scania-home-stars">
                    <Star size={12} /> Euro NCAP 5 stars
                  </span>
                </div>
                <div className="scania-home-series-body">
                  <h4>{s.name}</h4>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="scania-home-range">
            {RANGE.map((r) => (
              <div className="scania-home-range-card" key={r.title}>
                <r.icon size={26} className="scania-home-icon" />
                <h3>{r.title}</h3>
                <p>{r.text}</p>
                <button className="scania-home-link" onClick={() => onNavigate(r.tab)}>
                  {r.cta} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sustainable transport */}
      <div className="scania-home-sustain">
        <div
          className="scania-home-sustain-img"
          style={{ backgroundImage: `url(${IMG('/content/dam/group/startpage/science-based_startpage.jpg')})` }}
        />
        <div className="scania-home-sustain-copy">
          <span className="scania-home-eyebrow">Our commitments</span>
          <h2 className="scania-home-h2">Making sustainable transport a reality</h2>
          <p>
            Our science-based decarbonisation targets commit us to reduce emissions and work towards limiting global
            warming, by combining smart transport solutions, technological innovation and partnerships.
          </p>
          <div className="scania-home-sustain-kpis">
            <div>
              <strong>0.70 to 0.44 kg</strong>
              <span>Nordic CO2 per km, down 37%</span>
            </div>
            <div>
              <strong>50%</strong>
              <span>BEV share in the Nordic fleet</span>
            </div>
          </div>
          <div className="scania-home-ctas">
            <button className="scania-home-btn scania-home-btn-primary" onClick={() => onNavigate('reports')}>
              Track decarbonisation <ArrowRight size={16} />
            </button>
            <button className="scania-home-btn scania-home-btn-ghost" onClick={() => onNavigate('ask')}>
              Ask about road safety <ShieldCheck size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Audiences */}
      <div className="scania-home-band">
        <div className="scania-home-wrap">
          <div className="scania-home-head">
            <h2 className="scania-home-h2">Built for everyone who keeps transport moving</h2>
            <p className="scania-home-lead">One connected view of vehicles, drivers and workshops, shaped for each role.</p>
          </div>
          <div className="scania-home-aud">
            {AUDIENCES.map((a) => (
              <button className="scania-home-aud-card" key={a.title} onClick={() => onNavigate(a.tab)}>
                <span className="scania-home-aud-icon">
                  <a.icon size={22} />
                </span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <span className="scania-home-link">
                  {a.cta} <ArrowRight size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scania in brief + careers */}
      <div className="scania-home-band scania-home-band-alt">
        <div className="scania-home-wrap scania-home-split">
          <div
            className="scania-home-split-card"
            style={{ backgroundImage: `url(${IMG('/content/dam/group/scania-in-brief.jpg')})` }}
          >
            <div className="scania-home-split-shade" />
            <div className="scania-home-split-copy">
              <span className="scania-home-eyebrow">Scania in brief</span>
              <h3>130 years of innovation</h3>
              <p>Trucks, buses and coaches, engines and services, from Sodertalje to more than 100 countries.</p>
              <button className="scania-home-btn scania-home-btn-light" onClick={() => onNavigate('my-analytics')}>
                My analytics <Gauge size={16} />
              </button>
            </div>
          </div>
          <div
            className="scania-home-split-card"
            style={{
              backgroundImage: `url(${IMG('/adobe/dynamicmedia/deliver/dm-aid--872260be-68f8-4fc2-aecf-420abf4248bc/join-scania-22060-035.jpg')})`,
            }}
          >
            <div className="scania-home-split-shade" />
            <div className="scania-home-split-copy">
              <span className="scania-home-eyebrow">Careers</span>
              <h3>We drive real change</h3>
              <p>Over 50,000 employees in more than 100 countries. Coach the people behind the wheel.</p>
              <button className="scania-home-btn scania-home-btn-light" onClick={() => onNavigate('carriers')}>
                Driver evaluation <Users size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Closing band */}
      <div className="scania-home-close">
        <div className="scania-home-wrap scania-home-close-inner">
          <div>
            <h2>Driving the shift towards a sustainable transport system</h2>
            <p>Ask {CONTENT.aiName} anything about your fleet: fuel, emissions, drivers or the next workshop slot.</p>
          </div>
          <button className="scania-home-btn scania-home-btn-red" onClick={() => onNavigate('ask')}>
            <Sparkles size={16} /> Ask {CONTENT.aiName}
          </button>
        </div>
      </div>
    </section>
  );
}
