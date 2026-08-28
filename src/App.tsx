import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import { useTier } from './context/TierContext';
import Login from './pages/Login';
import TopBar, { TabId, PREMIUM_ONLY_TABS } from './components/TopBar';
import ChatBot from './components/ChatBot';
import Home from './tabs/Home';
import MyAnalytics from './tabs/MyAnalytics';
import Analytics from './tabs/Analytics';
import Cadences from './tabs/Cadences';
import Signals from './tabs/Signals';
import AskSalesSpot from './tabs/AskSalesSpot';
import {
  WORKSHEET_ID,
  CADENCE_WORKSHEET_ID,
  CHATBOT_WELCOME,
  CHATBOT_CADENCES_WELCOME,
} from './config';

const TAB_KEY = 'salesspot.tab';

export default function App() {
  const { isAuthenticated } = useAuth();
  const { tier } = useTier();
  const [tab, setTab] = useState<TabId>(
    () => (sessionStorage.getItem(TAB_KEY) as TabId) || 'home'
  );

  const changeTab = (next: TabId) => {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Ask SalesSpot is Premium-only. Downgrading to Basic while it's open leaves
  // the app on a tab no longer in the nav, so bounce to Analytics.
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
        {tab === 'home' && <Home onNavigate={changeTab} />}
        {tab === 'my-analytics' && <MyAnalytics />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'cadences' && <Cadences />}
        {tab === 'signals' && <Signals />}
        {tab === 'ask' && tier === 'premium' && <AskSalesSpot />}
      </main>
      <ChatBot
        worksheetId={tab === 'cadences' ? CADENCE_WORKSHEET_ID : WORKSHEET_ID}
        greeting={tab === 'cadences' ? CHATBOT_CADENCES_WELCOME : CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
