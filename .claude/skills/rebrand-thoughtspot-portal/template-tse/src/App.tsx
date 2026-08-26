import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import { useTier } from './context/TierContext';
import Login from './pages/Login';
import TopBar, { TabId, PREMIUM_ONLY_TABS } from './components/TopBar';
import ChatBot from './components/ChatBot';
import MyAnalytics from './tabs/MyAnalytics';
import Analytics from './tabs/Analytics';
import Carriers from './tabs/Carriers';
import Capacity from './tabs/Capacity';
import AskNorthwind from './tabs/AskNorthwind';
import SpotterTab from './tabs/Spotter';
import {
  WORKSHEET_ID,
  CADENCE_WORKSHEET_ID,
  CHATBOT_WELCOME,
  CHATBOT_CADENCES_WELCOME,
} from './config';

// Persist the active tab so a reload restores it instead of resetting to default.
const TAB_KEY = 'northwind.tab';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { tier } = useTier();
  const [tab, setTab] = useState<TabId>(
    () => (sessionStorage.getItem(TAB_KEY) as TabId) || 'analytics',
  );

  const changeTab = (next: TabId) => {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_KEY, next);
    } catch {
      /* storage unavailable */
    }
  };

  // Ask / Spotter are Premium-only. Downgrading to Basic while one of them is
  // open leaves the app on a tab no longer in the nav, so bounce to Analytics.
  useEffect(() => {
    if (tier === 'basic' && PREMIUM_ONLY_TABS.includes(tab)) {
      changeTab('analytics');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, tab]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <TopBar active={tab} onChange={changeTab} />
      <main className="app-main">
        {tab === 'my-analytics' && <MyAnalytics />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'carriers' && <Carriers />}
        {tab === 'capacity' && <Capacity />}
        {tab === 'ask' && tier === 'premium' && <AskNorthwind />}
        {tab === 'spotter' && tier === 'premium' && <SpotterTab />}
      </main>
      <ChatBot
        worksheetId={tab === 'carriers' ? CADENCE_WORKSHEET_ID : WORKSHEET_ID}
        greeting={tab === 'carriers' ? CHATBOT_CADENCES_WELCOME : CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
