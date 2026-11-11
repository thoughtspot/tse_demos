import { useEffect, useState } from 'react';
import { X, PhoneCall, Check, Send, UserPlus, CalendarClock, ListPlus, Ban } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'schedule' | 'assign' | 'sequence' | 'dismiss';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'schedule', label: 'Book callback', hint: 'Put a time on the rep\'s calendar and dial queue', icon: <CalendarClock size={16} /> },
  { id: 'assign', label: 'Reassign rep', hint: 'Hand the callback to a rep with capacity', icon: <UserPlus size={16} /> },
  { id: 'sequence', label: 'Add to Nooks sequence', hint: 'Queue the prospect in a parallel-dial session', icon: <ListPlus size={16} /> },
  { id: 'dismiss', label: 'Close callback', hint: 'Prospect no longer interested', icon: <Ban size={16} /> },
];

const REPS = ['Aisha Garcia', 'Amara Silva', 'Benjamin Kim', 'Clara Moreau', 'Clara Sato', 'Emily Haddad', 'Ethan Evans', 'Grace Khan', 'Leah Fischer', 'Lucas Wright'];
const SLOTS = ['Today, 10:30 AM (best connect window)', 'Today, 3:30 PM (best connect window)', 'Tomorrow, 10:00 AM', 'Tomorrow, 4:00 PM', 'Next week, same time'];
const SEQUENCES = ['Inbound Speed to Lead', 'Signal: Hiring Sales Team', 'Competitor Renewal Play', 'Job Change Play', 'Closed Lost Revival'];
const DISMISS_REASONS = ['Not interested', 'Using a competitor', 'Not the right person', 'Asked not to be called', 'Bad number'];

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ScheduleCallbackModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('schedule');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const company = pick(context, /^prospect$|prospect/i);
  const industry = pick(context, /account/i);
  const rep = pick(context, /^rep$|rep/i);
  const page = pick(context, /persona/i);
  const score = pick(context, /due date|callback due/i);
  const waiting = pick(context, /overdue/i);
  const waitingNum = Number(String(waiting).replace(/[^0-9.]/g, ''));

  const defaultFor = (d: Decision) =>
    d === 'assign' ? (REPS.find((r) => r !== rep) || REPS[0]) : d === 'schedule' ? SLOTS[0] : d === 'sequence' ? (/revops|sales/i.test(page) ? SEQUENCES[1] : SEQUENCES[0]) : DISMISS_REASONS[0];

  // Suggest a step from the row: long-overdue callbacks get reassigned, the rest get booked.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = waitingNum >= 6 ? 'assign' : 'schedule';
    setDecision(suggested);
    setReason(defaultFor(suggested));
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = decision === 'assign' ? REPS.filter((r) => r !== rep) : decision === 'schedule' ? SLOTS : decision === 'sequence' ? SEQUENCES : DISMISS_REASONS;
  const reasonLabel = decision === 'assign' ? 'New rep' : decision === 'schedule' ? 'Callback slot' : decision === 'sequence' ? 'Sequence' : 'Reason';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const outcome =
    decision === 'assign'
      ? 'is now with ' + reason + ', who has the callback at the top of their dial queue.'
      : decision === 'schedule'
        ? 'has a callback booked for ' + reason.replace(/ \(.*\)$/, '') + ' and is synced to the rep\'s calendar and CRM.'
        : decision === 'sequence'
          ? 'is queued in the Nooks sequence "' + reason + '" for the next parallel-dial session.'
          : 'has been closed (' + reason.toLowerCase() + ') and removed from the callback list.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <PhoneCall size={18} />
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
              <strong>{company || 'This prospect'}</strong> {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">{company || 'Selected callback'}</span>
              <div className="bid-chips">
                {[
                  ['Account', industry],
                  ['Rep', rep],
                  ['Persona', page],
                  ['Due', score],
                  ['Days overdue', waiting],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <span className="bid-chip" key={k}>
                      <em>{k}</em> {v}
                    </span>
                  ))}
              </div>
            </div>

            <div className="review-decisions" role="radiogroup" aria-label="Next step">
              {DECISIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={decision === d.id}
                  className={'review-decision' + (decision === d.id ? ' is-on' : '')}
                  onClick={() => {
                    setDecision(d.id);
                    setReason(defaultFor(d.id));
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
              <span>{reasonLabel}</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                {reasons.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="bid-field">
              <span>Note (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Context for the rep: what the prospect asked for, objection heard, best time to call…" />
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
