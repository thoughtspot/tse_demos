import { useEffect, useState } from 'react';
import { X, Check, Send, PhoneOff, PauseCircle, Repeat, UserCheck, Recycle } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

// Reclaim screen for a zero-usage line or license, pre-filled from the Reclaim Queue row the user right-clicked.
type Decision = 'cancel' | 'suspend' | 'reassign' | 'confirm';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'cancel', label: 'Cancel line', hint: 'Disconnect the service with the carrier and stop billing next cycle', icon: <PhoneOff size={16} /> },
  { id: 'suspend', label: 'Suspend line', hint: 'Keep the number, suspend the plan (reduced rate) for up to 90 days', icon: <PauseCircle size={16} /> },
  { id: 'reassign', label: 'Reassign license or device', hint: 'Move the seat or device to a new hire or a pooled plan', icon: <Repeat size={16} /> },
  { id: 'confirm', label: 'Confirm with owner', hint: 'Ask the cost-center owner to keep or release it within 5 days', icon: <UserCheck size={16} /> },
];

const CANCEL = ['Cancel at end of billing cycle', 'Cancel immediately (early-termination fee may apply)', 'Port number to pooled spare, then cancel'];
const SUSPEND = ['Suspend 30 days', 'Suspend 60 days', 'Suspend 90 days, then auto-cancel'];
const REASSIGN = ['Return to license pool (re-harvest seat)', 'Assign to next new hire in this cost center', 'Downgrade plan / SKU (e.g. E5 to E3, unlimited to 5GB)'];
const CONFIRM = ['Email cost-center owner via ServiceNow', 'Add to monthly optimization review', 'Notify the assigned user and manager'];
const DEVICE = ['Ship-back kit for recycling (Tangoe buyback)', 'Keep device in IT spares', 'Wipe and redeploy (MDM)', 'Not a device (license / seat)'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ReclaimLineModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('cancel');
  const [choice, setChoice] = useState('');
  const [device, setDevice] = useState(DEVICE[0]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const serviceId = pick(context, /service id|^service$|line id/i);
  const user = pick(context, /assigned user|user|employee/i);
  const bu = pick(context, /business unit/i);
  const vendor = pick(context, /vendor|carrier/i);
  const billed = pick(context, /billed/i);
  const idle = pick(context, /last use|idle/i);
  const idleNum = Number(String(idle).replace(/[^0-9.]/g, ''));
  const billedNum = Number(String(billed).replace(/[^0-9.]/g, ''));
  const isLicense = /^SAS|^UCS/i.test(serviceId);

  const optionsFor = (d: Decision) => (d === 'cancel' ? CANCEL : d === 'suspend' ? SUSPEND : d === 'reassign' ? REASSIGN : CONFIRM);

  // Suggest from the row: licenses go back to the pool, 90+ idle days cancel, 45+ suspend, otherwise confirm with the owner.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = isLicense ? 'reassign' : idleNum > 90 ? 'cancel' : idleNum > 45 ? 'suspend' : 'confirm';
    setDecision(suggested);
    setChoice(optionsFor(suggested)[0]);
    setDevice(isLicense ? DEVICE[3] : DEVICE[0]);
    setComment('');
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if (!open || !context) return null;

  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const label = decision === 'cancel' ? 'Cancellation timing' : decision === 'suspend' ? 'Suspension' : decision === 'reassign' ? 'Reassign to' : 'How to confirm';
  const annual = billedNum > 0 ? ' About $' + Math.round(billedNum * 12).toLocaleString() + ' a year stops once it takes effect.' : '';
  const outcome =
    decision === 'cancel'
      ? 'is queued for cancellation with ' + (vendor || 'the carrier') + ' ("' + choice + '"). Tangoe raises the carrier order and confirms the credit on the next invoice audit.' + annual
      : decision === 'suspend'
        ? 'is suspended with ' + (vendor || 'the carrier') + ' ("' + choice + '"). The user keeps the number; billing drops to the suspension rate.'
        : decision === 'reassign'
          ? 'is released: "' + choice + '". ' + (bu || 'The business unit') + ' stops paying for an unused seat or device.' + annual
          : 'is sent to ' + (bu || 'the') + ' cost-center owner ("' + choice + '"). If nobody claims it within 5 days, Tangoe cancels it automatically.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Recycle size={18} />
            <span>{CONTENT.action.modalTitle}</span>
          </div>
          <button className="winback-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="winback-success">
            <div className="winback-success-icon">
              <Check size={30} />
            </div>
            <h3>{decision === 'cancel' ? 'Cancellation submitted' : decision === 'suspend' ? 'Line suspended' : decision === 'reassign' ? 'License released' : CONTENT.action.successTitle}</h3>
            <p>
              <strong>{serviceId || 'This line'}</strong>{user ? ' (' + user + ') ' : ' '}{outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">{serviceId || 'Selected line'}{user ? ' · ' + user : ''}</span>
              <div className="bid-chips">
                {[
                  ['Business unit', bu],
                  ['Vendor', vendor],
                  ['Monthly cost', billed],
                  ['Days since last use', idle],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <span className="bid-chip" key={k}>
                      <em>{k}</em> {v}
                    </span>
                  ))}
              </div>
            </div>

            <div className="review-decisions" role="radiogroup" aria-label="Reclaim action">
              {DECISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={decision === d.id}
                  className={'review-decision' + (decision === d.id ? ' is-on' : '')}
                  onClick={() => {
                    setDecision(d.id);
                    setChoice(optionsFor(d.id)[0]);
                  }}
                >
                  {d.icon}
                  <span>
                    <strong>{d.label}</strong>
                    <small>{d.hint}</small>
                  </span>
                </button>
              ))}
            </div>

            <label className="bid-field">
              <span>{label}</span>
              <select value={choice} onChange={(e) => setChoice(e.target.value)}>
                {optionsFor(decision).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>

            {(decision === 'cancel' || decision === 'reassign') && (
              <label className="bid-field">
                <span>Device</span>
                <select value={device} onChange={(e) => setDevice(e.target.value)}>
                  {DEVICE.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="bid-field">
              <span>Note to cost-center owner (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reason, e.g. employee left, project ended, duplicate device…" />
            </label>

            <div className="bid-actions">
              <button className="winback-close-text" onClick={onClose}>Cancel</button>
              <button className="sl-hfilter-apply bid-submit" onClick={() => setSubmitted(true)}>
                <Send size={15} /> {chosen.label}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
