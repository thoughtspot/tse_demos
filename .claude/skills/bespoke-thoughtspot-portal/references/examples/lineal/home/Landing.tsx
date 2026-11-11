// Home landing page, modelled on lineal.com: the near-black hero "Empowering legal teams to achieve their outcomes"
// with its red-glow backdrop, the proof-point strip (5 Continents / 300+ Data Types / 2.3 PB / 24/7/365), the
// "Why legal teams choose us" pillars, Our Services, the AmplifyAI tool list, "Who we help" audience cards and the
// "Documents capture moments. Data captures reality." closing band.
// Deliberately NO analytics or embeds; the stats quote headline numbers from the demo dataset as static copy.
import {
  ArrowRight,
  Sparkles,
  ShieldAlert,
  MessagesSquare,
  Database,
  Workflow,
  Eye,
  HeartHandshake,
  Search,
  Layers,
  ShieldCheck,
  MessageSquareText,
  KeyRound,
  Bot,
  Image as ImageIcon,
  Gauge,
  Scale,
  Landmark,
  FlaskConical,
  HardHat,
} from 'lucide-react';
import { CONTENT } from '../content';
import type { TabId } from '../components/TopBar';
import '../styles/lineal-home.css';

interface Props {
  onNavigate: (tab: TabId) => void;
}

const HERO_IMG = 'https://lineal.com/wp-content/uploads/2026/03/Image-31-1.jpg';

const PROOF = [
  { value: '5 Continents', label: 'In-region collection, processing and hosting' },
  { value: '300+', label: 'Data types, from chats to structured systems' },
  { value: '2.3 PB', label: 'Hosted across global Relativity environments' },
  { value: '24/7/365', label: 'Around-the-clock expert support' },
];

const STATS = [
  { value: '2.1B', label: 'Documents collected' },
  { value: '91.0%', label: 'Culled before review' },
  { value: '$1.71', label: 'Cost per doc reviewed' },
  { value: '232', label: 'Active matters' },
  { value: '484 TB', label: 'Data processed' },
];

const PILLARS: { title: string; body: string; icon: typeof Database; tab: TabId }[] = [
  {
    title: 'Data Experts Built for Modern Law',
    body: 'Our experts and AmplifyAI turn the complexity of modern legal evidence into a strategic advantage.',
    icon: Database,
    tab: 'analytics',
  },
  {
    title: 'Leading the Shift From Documents to Data',
    body: 'The data-native partner moving legal teams beyond page-by-page thinking into clarity and speed.',
    icon: Layers,
    tab: 'analytics',
  },
  {
    title: 'Insights at Every Step, Not Just at the End',
    body: 'No black boxes: context, signals and intelligence so you know what is happening and what to do next.',
    icon: Eye,
    tab: 'carriers',
  },
  {
    title: 'Relentless Partners Making Your Life Easier',
    body: 'We finish what we start, innovate like it is oxygen and show up as a committed teammate.',
    icon: HeartHandshake,
    tab: 'capacity',
  },
];

const SERVICES: { title: string; body: string; items: string[]; icon: typeof Search; tab: TabId }[] = [
  {
    title: 'Data Discovery & Review',
    body: 'End-to-end support for complex data and review workflows.',
    items: ['Collection & Forensics', 'Early Case Assessment', 'Managed Review'],
    icon: Search,
    tab: 'analytics',
  },
  {
    title: 'Managed Services',
    body: 'Expert oversight, workflow design and consistent execution for high-volume matters.',
    items: ['Program Management', 'Cost Intelligence', 'RelativityOne Migrations'],
    icon: Workflow,
    tab: 'carriers',
  },
  {
    title: 'Risk & Compliance Support',
    body: 'Privacy, regulatory obligations, breach response and complex data requirements.',
    items: ['Incident Response', 'Legal Hold Programs', 'DSAR Response'],
    icon: ShieldCheck,
    tab: 'capacity',
  },
];

const TOOLS: { name: string; line: string; icon: typeof Bot }[] = [
  { name: 'ChatCraft', line: 'Chat review and tagging, thread by thread.', icon: MessageSquareText },
  { name: 'PrivFinder', line: 'AI privilege detection before the log is due.', icon: KeyRound },
  { name: 'BotDetector', line: 'Filters automated email out of review.', icon: Bot },
  { name: 'Images', line: 'Image review and classification at scale.', icon: ImageIcon },
  { name: 'Command Center', line: 'Real-time case and cost oversight.', icon: Gauge },
];

const AUDIENCES: { title: string; body: string; icon: typeof Scale; tab: TabId; cta: string }[] = [
  { title: 'Law Firms', body: 'Matter volumes, culling and review cost across every client.', icon: Scale, tab: 'analytics', cta: 'Matter Analytics' },
  { title: 'Financial Services', body: 'AML and regulatory investigations with defensible privilege calls.', icon: Landmark, tab: 'capacity', cta: 'Privilege Queue' },
  { title: 'Pharmaceutical', body: 'Product liability and global data rights, client by client.', icon: FlaskConical, tab: 'carriers', cta: 'Client Insights' },
  { title: 'Construction', body: 'Dispute evidence from chats, drawings and field data, on demand.', icon: HardHat, tab: 'ask', cta: 'Ask Pepper' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <section className="lineal-home" aria-label={`Welcome to ${CONTENT.company}`}>
      <div className="lineal-home-hero">
        <div className="lineal-home-hero-copy">
          <span className="lineal-home-tag">eDiscovery &middot; Applied AI &middot; AmplifyAI</span>
          <h1 className="lineal-home-h1">
            Empowering legal teams to achieve their <span className="lineal-home-accent">outcomes</span>
          </h1>
          <p className="lineal-home-sub">
            We turn modern legal data into a strategic advantage with expert-driven eDiscovery and applied AI technology.
          </p>
          <div className="lineal-home-ctas">
            <button className="lineal-home-btn lineal-home-btn-red" onClick={() => onNavigate('analytics')}>
              <i className="lineal-home-sq" aria-hidden="true" /> Explore matter analytics
            </button>
            <button className="lineal-home-btn lineal-home-btn-ghost" onClick={() => onNavigate('capacity')}>
              <i className="lineal-home-sq" aria-hidden="true" /> Open privilege queue
            </button>
          </div>
        </div>
        <div className="lineal-home-hero-media">
          <img src={HERO_IMG} alt="" loading="eager" />
          <div className="lineal-home-moment lineal-home-moment-a">
            <Sparkles size={18} />
            <div>
              <strong>AmplifyAI culled 91%</strong>
              <span>before human review</span>
            </div>
          </div>
          <div className="lineal-home-moment lineal-home-moment-b">
            <ShieldAlert size={18} />
            <div>
              <strong>Privilege SLA 68% in DACH</strong>
              <span>Action needed</span>
            </div>
          </div>
          <div className="lineal-home-moment lineal-home-moment-c">
            <MessagesSquare size={18} />
            <div>
              <strong>Chat data share 38%</strong>
              <span>and rising</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lineal-home-proof">
        {PROOF.map((p) => (
          <div className="lineal-home-proof-item" key={p.value}>
            <strong>{p.value}</strong>
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      <div className="lineal-home-section">
        <p className="lineal-home-eyebrow">Your matters, in numbers</p>
        <div className="lineal-home-stats">
          {STATS.map((s) => (
            <div className="lineal-home-stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lineal-home-section">
        <p className="lineal-home-eyebrow">Why legal teams choose us</p>
        <h2 className="lineal-home-h2">The partner that feels like part of your team</h2>
        <div className="lineal-home-pillars">
          {PILLARS.map((p, i) => (
            <button className="lineal-home-pillar" key={p.title} onClick={() => onNavigate(p.tab)}>
              <span className="lineal-home-num">0{i + 1}</span>
              <p.icon size={22} className="lineal-home-icon" />
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lineal-home-section">
        <p className="lineal-home-eyebrow">Our services</p>
        <h2 className="lineal-home-h2">Expertise, technology and partnership</h2>
        <div className="lineal-home-services">
          {SERVICES.map((s) => (
            <button className="lineal-home-service" key={s.title} onClick={() => onNavigate(s.tab)}>
              <s.icon size={22} className="lineal-home-icon" />
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <ul>
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <span className="lineal-home-link">
                Learn more <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="lineal-home-amplify">
        <div className="lineal-home-amplify-copy">
          <p className="lineal-home-eyebrow lineal-home-eyebrow-light">AmplifyAI</p>
          <h2 className="lineal-home-h2">Proprietary AI that manages data with speed and accuracy</h2>
          <p>From eDiscovery to compliance workflows, every tool feeds the Command Center you see in this portal.</p>
        </div>
        <div className="lineal-home-tools">
          {TOOLS.map((t) => (
            <div className="lineal-home-tool" key={t.name}>
              <t.icon size={18} />
              <div>
                <strong>{t.name}</strong>
                <span>{t.line}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lineal-home-section">
        <p className="lineal-home-eyebrow">Who we help</p>
        <h2 className="lineal-home-h2">Wherever your matters take you</h2>
        <div className="lineal-home-audiences">
          {AUDIENCES.map((a) => (
            <button className="lineal-home-audience" key={a.title} onClick={() => onNavigate(a.tab)}>
              <a.icon size={22} className="lineal-home-icon" />
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <span className="lineal-home-link">
                {a.cta} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="lineal-home-band">
        <h2>
          Documents capture moments. <span className="lineal-home-accent">Data captures reality.</span>
        </h2>
        <button className="lineal-home-btn lineal-home-btn-red" onClick={() => onNavigate('ask')}>
          <i className="lineal-home-sq" aria-hidden="true" /> Ask Pepper
        </button>
      </div>
    </section>
  );
}
