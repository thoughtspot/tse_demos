import { useEffect, useState } from 'react';
import { X, Gauge, ArrowUpRight, Check, Mail } from 'lucide-react';
import { useCredits, fmt, USAGE_LABEL, CREDIT_COST, PLAN_CREDITS, UsageKind } from '../lib/credits';

// "Consumption Stats": opened from the avatar menu and from the Liveboard-level custom action.
export default function ConsumptionModal() {
  const c = useCredits();
  const [upgradedTo, setUpgradedTo] = useState<string | null>(null);
  useEffect(() => {
    if (!c.modalOpen) setUpgradedTo(null);
  }, [c.modalOpen]);
  if (!c.modalOpen) return null;

  const reset = c.resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  // On the Liveboard's own action, show only report runs (no custom report builds).
  const kinds = (Object.keys(USAGE_LABEL) as UsageKind[]).filter((k) => c.modalSource !== 'liveboard' || k !== 'search');
  const warn = c.pct >= 85;

  return (
    <div className="winback-overlay" onClick={c.closeModal}>
      <div className="winback-modal credits-modal" role="dialog" aria-label="Consumption Stats" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Gauge size={18} />
            <span>Consumption Stats</span>
          </div>
          <button className="winback-close" onClick={c.closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="credits-body">
          <div className="credits-plan-row">
            <span className="credits-plan-pill">{c.plan} plan</span>
            <span className="credits-reset">Resets {reset}</span>
          </div>

          <div className="credits-figure">
            <strong>{fmt(c.used)}</strong>
            <span> / {fmt(c.allowance)} credits used this month</span>
            <em className={warn ? 'is-warn' : ''}>{c.pct.toFixed(0)}%</em>
          </div>
          <div className="credits-bar" aria-label={'Credits used ' + c.pct.toFixed(0) + '%'}>
            <div className={'credits-bar-fill' + (warn ? ' is-warn' : '')} style={{ width: c.pct + '%' }} />
          </div>

          <div className="credits-breakdown">
            {kinds.map((k) => (
              <div className="credits-breakdown-row" key={k}>
                <span>{USAGE_LABEL[k]}</span>
                <span className="credits-breakdown-count">{fmt(c.counts[k] || 0)} × {CREDIT_COST[k]}</span>
                <strong>{fmt((c.counts[k] || 0) * CREDIT_COST[k])}</strong>
              </div>
            ))}
          </div>

          {upgradedTo ? (
            <div className="credits-upgraded">
              <Check size={16} /> You're now on <strong>{upgradedTo}</strong>: {fmt(PLAN_CREDITS[upgradedTo as keyof typeof PLAN_CREDITS])} credits a month, effective today.
            </div>
          ) : null}

          {c.nextPlan ? (
            <button
              className="sl-hfilter-apply credits-upgrade"
              onClick={() => {
                const p = c.upgrade();
                if (p) setUpgradedTo(p);
              }}
            >
              <ArrowUpRight size={15} /> Upgrade to {c.nextPlan} · {fmt(PLAN_CREDITS[c.nextPlan])} credits / month
            </button>
          ) : (
            <div className="credits-top">
              <Mail size={15} /> You're on the highest tier. <a href="https://www.rocketlane.com/contact-sales" target="_blank" rel="noreferrer">Contact sales</a> for a custom allowance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
