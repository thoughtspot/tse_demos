import { useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TopBar, { TabId } from './components/TopBar';
import ChatBot from './components/ChatBot';
import MyAnalytics from './tabs/MyAnalytics';
import Analytics from './tabs/Analytics';
import AskHP from './tabs/AskHP';
import {
  WORKSHEET_ID,
  CADENCE_WORKSHEET_ID,
  CHATBOT_WELCOME,
  CHATBOT_CADENCES_WELCOME,
} from './config';

// Persist the active tab so a reload restores it instead of resetting to default.
const TAB_KEY = 'hp.tab';

export default function App() {
  const { isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-shell">
      <TopBar active={tab} onChange={changeTab} />
      <main className="app-main">
        {tab === 'my-analytics' && <MyAnalytics />}
        {tab === 'analytics' && <Analytics />}
        {tab === 'ask' && <AskHP />}
      </main>
      <ChatBot
        worksheetId={tab === 'carriers' ? CADENCE_WORKSHEET_ID : WORKSHEET_ID}
        greeting={tab === 'carriers' ? CHATBOT_CADENCES_WELCOME : CHATBOT_WELCOME}
      />
      <VercelAnalytics />
    </div>
  );
}
