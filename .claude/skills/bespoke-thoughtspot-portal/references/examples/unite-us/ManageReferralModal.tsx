import { useEffect, useState } from 'react';
import { X, ClipboardCheck, Check, Send, ArrowRightLeft, ShieldAlert, PhoneCall, BellRing } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'reassign' | 'escalate' | 'followup' | 'remind';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'reassign', label: 'Reassign partner', hint: 'Send to another partner with capacity', icon: <ArrowRightLeft size={16} /> },
  { id: 'escalate', label: 'Escalate', hint: 'Flag to the network manager', icon: <ShieldAlert size={16} /> },
  { id: 'followup', label: 'Follow up with client', hint: 'Log outreach and keep the client warm', icon: <PhoneCall size={16} /> },
  { id: 'remind', label: 'Remind partner', hint: 'Nudge the receiving organization to respond', icon: <BellRing size={16} /> },
];

const PARTNERS = ['Open Door Housing Partners', 'HomeFirst Collaborative', 'Bridgeway Housing Services', 'Safe Harbor Shelter', 'Piedmont Community Pantry', 'Good Shepherd Food Bank', 'Queen City Food Collective', 'RideWell Medical Transport', 'Community Action Utility Fund', 'Benefits Access Center'];
const ESCALATE_REASONS = ['Past SLA, no partner response', 'Emergency need', 'Partner at capacity', 'Client safety concern'];
const FOLLOWUP_CHANNELS = ['SMS', 'Phone call', 'Email', 'In person'];

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ManageReferralModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('remind');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportId = pick(context, /referral id/i);
  const service = pick(context, /service/i);
  const partner = pick(context, /receiving|organization/i);
  const county = pick(context, /county/i);
  const urgency = pick(context, /urgency/i);
  const pending = pick(context, /days pending|pending/i);
  const pendingNum = Number(String(pending).replace(/[^0-9.]/g, ''));

  // Suggest an action from the row: emergencies escalate, long waits reassign, short waits get a reminder.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = /emergency/i.test(urgency) ? 'escalate' : pendingNum >= 7 ? 'reassign' : pendingNum >= 3 ? 'followup' : 'remind';
    setDecision(suggested);
    setReason(suggested === 'reassign' ? (PARTNERS.find((p) => p !== partner) || PARTNERS[0]) : suggested === 'escalate' ? (/emergency/i.test(urgency) ? 'Emergency need' : ESCALATE_REASONS[0]) : suggested === 'followup' ? 'SMS' : '');
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = decision === 'reassign' ? PARTNERS.filter((p) => p !== partner) : decision === 'escalate' ? ESCALATE_REASONS : decision === 'followup' ? FOLLOWUP_CHANNELS : [];
  const reasonLabel = decision === 'reassign' ? 'New partner' : decision === 'escalate' ? 'Reason' : 'Channel';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const outcome =
    decision === 'reassign'
      ? 'has been reassigned to ' + reason + ' and the client has been notified.'
      : decision === 'escalate'
        ? 'has been escalated to the ' + (county ? county + ' ' : '') + 'network manager.'
        : decision === 'followup'
          ? 'has a client follow-up logged by ' + reason + '.'
          : 'triggered a reminder to ' + (partner || 'the receiving partner') + '.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <ClipboardCheck size={18} />
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
            <h3>{CONTENT.action.successTitle}</h3>
            <p>
              Referral <strong>{reportId || 'selected'}</strong>
              {service ? <> for <strong>{service}</strong></> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Referral {reportId}</span>
              <div className="bid-chips">
                {[
                  ['Service', service],
                  ['Partner', partner],
                  ['County', county],
                  ['Urgency', urgency],
                  ['Days pending', pending],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <span className="bid-chip" key={k}>
                      <em>{k}</em> {v}
                    </span>
                  ))}
              </div>
            </div>

            <div className="review-decisions" role="radiogroup" aria-label="Decision">
              {DECISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={decision === d.id}
                  className={'review-decision' + (decision === d.id ? ' is-on' : '')}
                  onClick={() => {
                    setDecision(d.id);
                    setReason(d.id === 'reassign' ? (PARTNERS.find((p) => p !== partner) || PARTNERS[0]) : d.id === 'escalate' ? ESCALATE_REASONS[0] : d.id === 'followup' ? 'SMS' : '');
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

            {reasons.length > 0 && (
              <label className="bid-field">
                <span>{reasonLabel}</span>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                  {reasons.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="bid-field">
              <span>{decision === 'followup' ? 'Outreach notes' : 'Note (optional)'}</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={decision === 'followup' ? 'What the client said, next steps…' : 'Add context for the partner or network manager…'} />
            </label>

            <div className="bid-actions">
              <button className="winback-close-text" onClick={onClose}>Cancel</button>
              <button className="sl-hfilter-apply bid-submit" onClick={() => setSubmitted(true)}>
                <Send size={15} /> {CONTENT.action.submitLabel}: {chosen.label}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
