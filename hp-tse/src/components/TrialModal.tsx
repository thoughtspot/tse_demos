// Professional upgrade prompt shown once (on the 3rd Ask HP AI question).
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { HP_UPGRADE_URL } from '../config';

interface Props {
  open: boolean;
  remaining: number;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  'Unlimited Ask HP AI questions',
  'Drill-down & underlying-data access',
  'CSV, Excel & PDF exports',
  'Priority capacity & lane insights',
  'Dedicated onboarding & support',
];

export default function TrialModal({ open, remaining, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="sl-trial-overlay" onClick={onClose}>
      <div className="sl-trial-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="sl-trial-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="sl-trial-body">
          <div className="sl-trial-icon">
            <Sparkles size={24} />
          </div>
          <div className="sl-trial-eyebrow">HP Premium</div>
          <h2 className="sl-trial-title">Unlock unlimited HP AI</h2>
          <p className="sl-trial-sub">
            {remaining > 0 ? (
              <>You have <strong>{remaining}</strong> free question{remaining === 1 ? '' : 's'} left on the trial. </>
            ) : (
              <>You&rsquo;ve reached your free-trial limit. </>
            )}
            Upgrade to Premium for unlimited access across your brokerage.
          </p>

          <ul className="sl-trial-features">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f}>
                <span className="sl-trial-check"><Check size={14} /></span>
                {f}
              </li>
            ))}
          </ul>

          <a className="sl-trial-cta" href={HP_UPGRADE_URL} target="_blank" rel="noopener noreferrer">
            Upgrade to Premium <ArrowRight size={18} />
          </a>
          <button className="sl-trial-dismiss" onClick={onClose}>
            Maybe later
          </button>
          <p className="sl-trial-fine">
            Demo experience — no payment is taken. Talk to your HP account team for
            production pricing.
          </p>
        </div>
      </div>
    </div>
  );
}
