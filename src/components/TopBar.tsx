import {
  Home,
  BarChart3,
  LayoutGrid,
  Sparkles,
  Workflow,
  Activity,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Crown,
  Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTier } from '../context/TierContext';
import SalesSpotLogo from './SalesSpotLogo';

export type TabId = 'home' | 'my-analytics' | 'analytics' | 'cadences' | 'signals' | 'ask';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'my-analytics', label: 'My Reports', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'cadences', label: 'Cadences', icon: Workflow },
  { id: 'signals', label: 'Signals', icon: Activity },
  { id: 'ask', label: 'Ask SalesSpot', icon: Sparkles },
];

// Ask SalesSpot is Premium-only. On Basic it's hidden from the nav (App also
// bounces the user to Analytics if the tier is switched while it's open).
export const PREMIUM_ONLY_TABS: TabId[] = ['ask'];

// Decorative SalesSpot platform nav (sets product context, non-interactive).
const PLATFORM_NAV = ['People', 'Deals', 'Conversations'];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TopBar({ active, onChange }: Props) {
  const { username, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { tier, setTier } = useTier();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const initials = (username || 'U').slice(0, 2).toUpperCase();
  const tierRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close either dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen && !tierOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (tierRef.current && !tierRef.current.contains(t)) setTierOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen, tierOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <SalesSpotLogo className="topbar-logo" />
        <nav className="topbar-platform-nav">
          {PLATFORM_NAV.map((item) => (
            <span key={item} className="topbar-platform-link">
              {item}
            </span>
          ))}
        </nav>
      </div>

      <nav className="topbar-tabs">
        {TABS.filter((t) => tier === 'premium' || !PREMIUM_ONLY_TABS.includes(t.id)).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`topbar-tab ${active === tab.id ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar-right">
        <button
          className="topbar-theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Tier switcher — preview Premium vs Basic gating. */}
        <div className="topbar-tier" ref={tierRef} onClick={() => setTierOpen((o) => !o)}>
          <span className={`tier-pill tier-${tier}`}>
            <Crown size={13} />
            {tier === 'premium' ? 'Premium' : 'Basic'}
          </span>
          <ChevronDown size={15} />
          {tierOpen && (
            <div className="topbar-menu tier-menu">
              <button
                className="topbar-menu-item"
                onClick={() => { setTier('premium'); setTierOpen(false); }}
              >
                <Crown size={14} /> Premium
                {tier === 'premium' && <Check size={14} className="tier-check" />}
              </button>
              <button
                className="topbar-menu-item"
                onClick={() => { setTier('basic'); setTierOpen(false); }}
              >
                <span style={{ width: 14 }} /> Basic
                {tier === 'basic' && <Check size={14} className="tier-check" />}
              </button>
            </div>
          )}
        </div>

        <div className="topbar-user" ref={userRef} onClick={() => setMenuOpen((o) => !o)}>
          <span className="topbar-avatar">{initials}</span>
          <span className="topbar-username">{username || 'User'}</span>
          <ChevronDown size={16} />
          {menuOpen && (
            <div className="topbar-menu">
              <button className="topbar-menu-item" onClick={logout}>
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
