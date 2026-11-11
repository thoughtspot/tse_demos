import { useCallback, useRef, useState } from 'react';
import { SearchEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { Action } from '@thoughtspot/visual-embed-sdk';
import { WORKSHEET_ID } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';
import { useCredits, fmt, CREDIT_COST } from '../lib/credits';

const Search = SearchEmbed as unknown as (props: any) => JSX.Element;

// Opens on a ready-made report so the canvas is never an empty white page; the user edits it from there.
// This first, automatic search is not charged.
const STARTER_SEARCH = '[Fuel per 100 km] [Idle Share] [Application]';

// Report Builder: a SearchEmbed on the portal model (WORKSHEET_ID), with a thin credit meter
// underneath that charges CREDIT_COST.search for every search the user runs.
export default function ReportBuilder() {
  const { theme } = useTheme();
  const credits = useCredits();
  const [bump, setBump] = useState(false);
  const lastQuery = useRef('');
  const lastCharged = useRef<{ sig: string; t: number }>({ sig: '', t: 0 });
  const starterShown = useRef(false);

  const onQueryChanged = useCallback((p: any) => {
    const q = p?.data?.search ?? p?.data?.query ?? p?.data?.searchQuery ?? p?.search ?? '';
    if (typeof q === 'string') lastQuery.current = q;
  }, []);

  // EmbedEvent.Data fires once per executed search (and sometimes twice for one result);
  // charge once per distinct query, or again for the same query after 3 s (a deliberate re-run).
  const onData = useCallback((p: any) => {
    const cols = p?.data?.embedAnswerData?.columns || p?.data?.columns || [];
    const sig = lastQuery.current || JSON.stringify(cols.map((c: any) => c?.column?.name || c?.name || '')).slice(0, 400);
    const now = Date.now();
    if (!starterShown.current) {
      starterShown.current = true;
      lastCharged.current = { sig, t: now };
      return;
    }
    if (sig === lastCharged.current.sig && now - lastCharged.current.t < 3000) return;
    lastCharged.current = { sig, t: now };
    credits.addUsage('search');
    setBump(true);
    window.setTimeout(() => setBump(false), 900);
  }, [credits]);

  return (
    <div className="tab-reports">
      <div className="reports-header">
        <h1 className="page-title">Report Builder</h1>
        <p className="page-subtitle">Search your Scania fleet data and build a report: vehicles, drivers, fuel and energy, CO2, idling, maintenance and uptime.</p>
      </div>
      <div className="reports-embed">
        <Search
          key={theme}
          onLoad={() => { starterShown.current = false; }}
          dataSource={WORKSHEET_ID}
          searchOptions={{ searchTokenString: STARTER_SEARCH, executeSearch: true }}
          hiddenActions={[Action.Pin]}
          collapseDataSources
          frameParams={{ width: '100%', height: '100%' }}
          customizations={tsCustomizations(theme, true)}
          onQueryChanged={onQueryChanged}
          onData={onData}
        />
      </div>
      <div className={'reports-meter' + (bump ? ' is-bump' : '')} data-testid="credit-meter">
        <div className="reports-meter-bar">
          <div className="reports-meter-fill" style={{ width: credits.pct + '%' }} />
        </div>
        <span className="reports-meter-caption">
          {fmt(credits.used)} / {fmt(credits.allowance)} credits this month · {CREDIT_COST.search} credits per search
          {bump && <b className="reports-meter-plus"> +{CREDIT_COST.search}</b>}
        </span>
      </div>
    </div>
  );
}
