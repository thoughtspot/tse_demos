// Data-driven Overview — the firework-style signed-in home: an in-flow ask bar
// that drives a Spotter pane, a "what changed" single-number answer queried over
// REST, a row of KPI cards (each an embedded liveboard viz) and chart cards
// underneath. Every number shows where it came from (the semantic model), which
// is the answer to "how do we trust it" — no generated figures. Selected over
// the marketing Landing by FLAGS.homeStyle === 'overview'.
import { useEffect, useState, type FormEvent } from 'react';
import { LiveboardEmbed, SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  ShoppingCart,
  Receipt,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { CONTENT } from '../content';
import { useAuth } from '../context/AuthContext';
import { useTier } from '../context/TierContext';
import { useTheme } from '../context/ThemeContext';
import {
  liveboardCustomizations,
  spotterCustomizations,
  fetchWhatChanged,
  formatChangeValue,
  type ChangeInsight,
} from '../lib/thoughtspot';
import { BASIC_DISABLED_ACTIONS, UPGRADE_REASON } from '../lib/tierActions';
import {
  ANALYTICS_LIVEBOARD_ID,
  LIVEBOARD_EMBED_FLAGS,
  DASHBOARD_KPIS,
  DASHBOARD_CHARTS,
  WHAT_CHANGED,
  CHANGE_DATE_COLUMN,
  WORKSHEET_ID,
  SPOTTER_EMBED_FLAGS,
  SPOTTER_PANE_RULES,
  OVERVIEW_SUGGESTIONS,
  spotterInputStyle,
  spotterSurfaceRules,
  dashboardKpiStyle,
  dashboardChartStyle,
} from '../config';
import type { TabId } from '../components/TopBar';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;
const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

interface Props {
  onNavigate: (tab: TabId) => void;
}

const AI_OPEN_KEY = 'app.aiPane';
const KPI_ICONS = [DollarSign, Percent, ShoppingCart, Receipt];

const pct = (n: number) => `${Math.abs(n * 100).toFixed(1)}%`;
const month = (label: string) => label.split(' ')[0];
const usd = (n: number) => formatChangeValue(n, 'currency');

export default function Overview({ onNavigate }: Props) {
  const { username, password } = useAuth();
  const { tier } = useTier();
  const { theme } = useTheme();
  const premium = tier === 'premium';
  const kpi = dashboardKpiStyle(theme);
  const chart = dashboardChartStyle(theme);
  const aiName = CONTENT.aiName ?? 'AI';
  // Viz embeds must declare the same styling/grouping flags as the liveboard or
  // ThoughtSpot refuses to render them.
  const common = {
    disabledActions: premium ? [] : BASIC_DISABLED_ACTIONS,
    disabledActionReason: UPGRADE_REASON,
    ...LIVEBOARD_EMBED_FLAGS,
  };

  const [changes, setChanges] = useState<ChangeInsight[] | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [draft, setDraft] = useState('');
  // A new id remounts Spotter so the same question can be asked again.
  const [asked, setAsked] = useState<{ q: string; id: number } | null>(null);
  const [aiOpen, setAiOpen] = useState(() => {
    try {
      return sessionStorage.getItem(AI_OPEN_KEY) !== '0';
    } catch {
      return true;
    }
  });
  const setPane = (open: boolean) => {
    try {
      sessionStorage.setItem(AI_OPEN_KEY, open ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    setAiOpen(open);
  };

  useEffect(() => {
    let live = true;
    setChanges(null);
    fetchWhatChanged(username, password, WHAT_CHANGED, CHANGE_DATE_COLUMN)
      .then((c) => live && setChanges(c))
      .catch(() => live && setChanges([]));
    return () => {
      live = false;
    };
  }, [username, password, refresh]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    if (!premium) {
      onNavigate('analytics');
      return;
    }
    setAsked({ q: question, id: Date.now() });
    setPane(true);
    setDraft('');
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  const gmv = changes?.[0];
  const others = changes?.slice(1) ?? [];
  const up = (gmv?.change ?? 0) >= 0;
  const latest = gmv?.currentLabel;

  return (
    <section className={`fwh${aiOpen ? '' : ' is-ai-collapsed'}`} aria-label="Overview">
      <div className="fwh-main">
        <div className="fwh-head">
          <div>
            <h1 className="page-title">Overview</h1>
            <p>{CONTENT.company} performance across the business</p>
          </div>
          <span className="fwh-period">
            <Calendar size={15} /> {latest ?? 'Latest month'}
          </span>
        </div>

        {/* ---- In-flow ask bar ---- */}
        <form className="fwh-ask" onSubmit={onSubmit}>
          <Sparkles size={18} className="fwh-ask-icon" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ask ${aiName} about your data…`}
            aria-label={`Ask ${aiName}`}
          />
          <button type="submit" disabled={!draft.trim()}>
            Ask
          </button>
        </form>
        <div className="fwh-chips">
          {OVERVIEW_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* ---- In-flow "what changed" answer ---- */}
        <div className="fwh-card fwh-number fwh-number-wide">
          <span className="fwh-answer-q">What changed{latest ? ` in ${month(latest)}` : ''}?</span>
          {changes === null && (
            <div className="fwh-skel">
              <span />
              <span />
            </div>
          )}
          {changes && !gmv && <p className="fwh-empty">No data for the latest month yet.</p>}
          {gmv && (
            <>
              <div className="fwh-big">
                <strong>{usd(gmv.current)}</strong>
                <span className={`fwh-delta ${up ? 'is-up' : 'is-down'}`}>
                  {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {pct(gmv.change)} vs {month(gmv.previousLabel)}
                </span>
              </div>
              <p className="fwh-why">
                {gmv.spec.label}
                {gmv.driver ? (
                  <>
                    , led by <em>{gmv.driver.name}</em> ({gmv.driver.delta > 0 ? '+' : '−'}
                    {usd(Math.abs(gmv.driver.delta))})
                  </>
                ) : null}
                .
                {others.map((c) => {
                  const fmt = (n: number) => formatChangeValue(n, c.spec.format);
                  return (
                    <span key={c.spec.label}>
                      {' '}
                      {c.spec.label} {c.change >= 0 ? 'rose' : 'fell'} {pct(c.change)} to {fmt(c.current)}
                      {c.driver ? (
                        <>
                          {' '}
                          (top: <em>{c.driver.name}</em>)
                        </>
                      ) : null}
                      .
                    </span>
                  );
                })}
              </p>
            </>
          )}
          <span className="fwh-source">
            <ShieldCheck size={13} /> {CONTENT.company} model · by {CHANGE_DATE_COLUMN}
            <button onClick={() => setRefresh((r) => r + 1)} aria-label="Refresh answer" title="Refresh">
              <RefreshCw size={12} />
            </button>
          </span>
        </div>

        {/* ---- KPI cards ---- */}
        <div className="fwh-kpis">
          {DASHBOARD_KPIS.map((k, i) => {
            const Icon = KPI_ICONS[i % KPI_ICONS.length];
            return (
              <div className="fwh-kpi" key={k.id}>
                <div className="fwh-kpi-top">
                  <span className="fwh-kpi-label">{k.label}</span>
                  <span className="fwh-kpi-icon">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                </div>
                <div className="fwh-kpi-embed">
                  <Liveboard
                    key={`${theme}-${k.id}`}
                    liveboardId={ANALYTICS_LIVEBOARD_ID}
                    vizId={k.id}
                    frameParams={{ width: '100%', height: '100%' }}
                    customizations={liveboardCustomizations(theme, kpi.rules, kpi.vars)}
                    {...common}
                  />
                </div>
                <span className="fwh-kpi-note">{k.note}</span>
              </div>
            );
          })}
        </div>

        <h2 className="fwh-section">Performance</h2>

        {/* ---- Charts ---- */}
        <div className="fwh-grid">
          {DASHBOARD_CHARTS.map((c) => (
            <div className="fwh-card" key={c.id}>
              <div className="fwh-card-head">
                <div>
                  <h2>{c.title}</h2>
                  <p>{c.subtitle}</p>
                </div>
                <button className="fwh-explore" onClick={() => onNavigate('analytics')}>
                  Explore <ArrowRight size={14} />
                </button>
              </div>
              <div className="fwh-embed">
                <Liveboard
                  key={`${theme}-${c.id}`}
                  liveboardId={ANALYTICS_LIVEBOARD_ID}
                  vizId={c.id}
                  frameParams={{ width: '100%', height: '100%' }}
                  customizations={liveboardCustomizations(theme, chart.rules, chart.vars)}
                  {...common}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- AI pane ---- */}
      <aside className="fwh-ai" aria-label={aiName}>
        <button className="fwh-ai-expand" onClick={() => setPane(true)} aria-label={`Open ${aiName}`} title={`Open ${aiName}`}>
          <PanelRightOpen size={17} />
          <Sparkles size={20} />
          <span>{aiName}</span>
        </button>
        <div className="fwh-ai-top">
          <div className="fwh-ai-title">
            <Sparkles size={20} /> {aiName}
          </div>
          <button className="fwh-ai-collapse" onClick={() => setPane(false)} aria-label={`Collapse ${aiName}`} title="Collapse">
            <PanelRightClose size={17} />
          </button>
        </div>
        {premium ? (
          <div className="fwh-ai-spotter">
            <Spotter
              key={`${theme}-${asked?.id ?? 0}`}
              worksheetId={WORKSHEET_ID}
              frameParams={{ width: '100%', height: '100%' }}
              customizations={spotterCustomizations(theme, { ...SPOTTER_PANE_RULES, ...spotterInputStyle(theme), ...spotterSurfaceRules(theme) })}
              {...(asked ? { searchOptions: { searchQuery: asked.q } } : {})}
              {...SPOTTER_EMBED_FLAGS}
            />
          </div>
        ) : (
          <p className="fwh-ai-locked">{UPGRADE_REASON}.</p>
        )}
        <p className="fwh-ai-foot">Answers come from the {CONTENT.company} semantic model. Verify before sharing.</p>
      </aside>
    </section>
  );
}
