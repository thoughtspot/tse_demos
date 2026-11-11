// Icon-only navigation rail (FLAGS.navLayout === 'rail'), modelled on Rocketlane's product UI:
// a ~48px light rail with the logo mark on top, icon buttons with dark tooltips, dark hover
// flyouts for items with sub-pages (Dashboards, Tasks, More), a notifications bell with a red dot,
// and a gift + round avatar at the bottom. The avatar opens a small menu (Consumption Stats,
// theme, sign out). Tabs come from TopBar's TABS so tier gating stays in one place.
import {
  Search, Bell, Home, MonitorDot, FileBarChart, ClipboardList, Sparkles, UserCog, LayoutGrid,
  Gift, ListChecks, KanbanSquare, Gauge, LogOut, Sun, Moon, Crown, Check, LayoutDashboard, FolderKanban,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import markRaw from '../assets/rocketlane-mark.svg?raw';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTier } from '../context/TierContext';
import { useCredits, fmt } from '../lib/credits';
import { FLAGS } from '../flags';
import { CONTENT } from '../content';
import { PREMIUM_ONLY_TABS, TabId } from './TopBar';

type Icon = typeof Home;
interface SubItem { label: string; tab?: TabId; icon?: Icon; onClick?: () => void; active?: boolean }
interface RailItem { key: string; label: string; icon: Icon; tab?: TabId; dot?: boolean; items?: SubItem[]; note?: string[] }

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function NavRail({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { tier, setTier } = useTier();
  const credits = useCredits();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const initial = (username || 'U').slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!avatarOpen) return;
    const h = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [avatarOpen]);

  const premium = tier === 'premium';
  const allowed = (t?: TabId) => !t || premium || !PREMIUM_ONLY_TABS.includes(t);

  const RAIL: RailItem[] = [
    { key: 'search', label: 'Search with ' + CONTENT.tabs.spotter, icon: Search, tab: 'spotter' },
    { key: 'notif', label: 'Notifications', icon: Bell, dot: true, note: [
      'Enterprise overdue rate hit 36% in October',
      '41 tasks blocked in Data Migration',
      "Priya Raman's time to value: 53 days",
    ] },
    ...(FLAGS.home ? [{ key: 'home', label: CONTENT.tabs.home ?? 'Home', icon: Home, tab: 'home' as TabId }] : []),
    { key: 'dash', label: CONTENT.tabs.analytics, icon: MonitorDot, tab: 'analytics', items: [
      { label: 'Project Performance & Analytics', icon: LayoutDashboard, tab: 'analytics' },
      { label: CONTENT.tabs.myReports, icon: FolderKanban, tab: 'my-analytics' },
    ] },
    { key: 'reports', label: 'Report Builder', icon: FileBarChart, tab: 'reports' },
    { key: 'tasks', label: CONTENT.tabs.action, icon: ClipboardList, tab: 'capacity', items: [
      { label: 'All tasks', icon: ListChecks, tab: 'capacity' },
      { label: 'Sprint planning', icon: KanbanSquare, tab: 'capacity' },
    ] },
    { key: 'ask', label: CONTENT.tabs.ask, icon: Sparkles, tab: 'ask' },
    { key: 'people', label: CONTENT.tabs.inline, icon: UserCog, tab: 'carriers' },
    { key: 'apps', label: 'More', icon: LayoutGrid, items: [
      { label: theme === 'dark' ? 'Light mode' : 'Dark mode', icon: theme === 'dark' ? Sun : Moon, onClick: toggle },
      ...(FLAGS.tiers ? [
        { label: 'Premium plan', icon: Crown, onClick: () => setTier('premium'), active: tier === 'premium' },
        { label: 'Basic plan', icon: Crown, onClick: () => setTier('basic'), active: tier === 'basic' },
      ] : []),
    ] },
  ];

  const isActive = (it: RailItem) =>
    (it.tab && it.tab === active) || !!it.items?.some((s) => s.tab && s.tab === active);

  return (
    <aside className="navrail" aria-label="Main navigation">
      <button className="navrail-logo" onClick={() => onChange(FLAGS.home ? 'home' : 'analytics')} aria-label="Rocketlane home"
        dangerouslySetInnerHTML={{ __html: markRaw }} />

      <nav className="navrail-items">
        {RAIL.filter((it) => allowed(it.tab)).map((it) => {
          const I = it.icon;
          const subs = (it.items || []).filter((s) => allowed(s.tab));
          return (
            <div key={it.key} className={'navrail-slot' + (subs.length || it.note ? ' has-flyout' : '')}>
              <button
                className={'navrail-btn' + (isActive(it) ? ' is-active' : '')}
                onClick={() => it.tab && onChange(it.tab)}
                aria-label={it.label}
              >
                <I size={17} strokeWidth={1.9} />
                {it.dot && <span className="navrail-dot" />}
              </button>
              {subs.length || it.note ? (
                <div className="navrail-flyout" role="menu">
                  <div className="navrail-flyout-title">{it.label}</div>
                  {subs.map((s) => {
                    const SI = s.icon;
                    return (
                      <button key={s.label} role="menuitem"
                        className={'navrail-flyout-item' + ((s.tab && s.tab === active && s.label !== 'Sprint planning') || s.active ? ' is-on' : '')}
                        onClick={() => (s.onClick ? s.onClick() : s.tab && onChange(s.tab))}>
                        {SI && <SI size={15} />}
                        <span>{s.label}</span>
                        {s.active && <Check size={13} className="navrail-check" />}
                      </button>
                    );
                  })}
                  {it.note?.map((n) => (
                    <div key={n} className="navrail-flyout-note">{n}</div>
                  ))}
                </div>
              ) : (
                <span className="navrail-tip" role="tooltip">{it.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="navrail-bottom">
        <div className="navrail-slot has-flyout">
          <button className="navrail-btn" aria-label="What's new"><Gift size={17} strokeWidth={1.9} /></button>
          <div className="navrail-flyout">
            <div className="navrail-flyout-title">What's new</div>
            <div className="navrail-flyout-note">Report Builder: build reports by searching your project data</div>
            <div className="navrail-flyout-note">Ask Nitro: AI answers on live delivery data</div>
          </div>
        </div>
        <div className="navrail-slot navrail-avatar-slot" ref={avatarRef}>
          <button className="navrail-avatar" onClick={() => setAvatarOpen((o) => !o)} aria-label="Profile menu" aria-expanded={avatarOpen}>
            {initial}
          </button>
          {avatarOpen && (
            <div className="navrail-flyout navrail-avatar-menu is-open" role="menu">
              <div className="navrail-flyout-title">{username || 'User'} · {credits.plan} plan</div>
              <button role="menuitem" className="navrail-flyout-item" data-testid="menu-consumption"
                onClick={() => { setAvatarOpen(false); credits.openModal(); }}>
                <Gauge size={15} /> <span>Consumption Stats</span>
                <em className="navrail-credit-mini">{fmt(credits.used)} / {fmt(credits.allowance)}</em>
              </button>
              <button role="menuitem" className="navrail-flyout-item" onClick={toggle}>
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button role="menuitem" className="navrail-flyout-item" onClick={logout}>
                <LogOut size={15} /> <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
