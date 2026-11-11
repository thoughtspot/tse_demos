import { useEffect, useState } from 'react';
import { X, CalendarHeart, Check, Send, MessageSquareText, Crown, PhoneCall, CircleSlash } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'text' | 'membership' | 'call' | 'close';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'text', label: 'Text rebook link (Maia)', hint: 'Maia texts a one-tap booking link for the next neurotoxin visit', icon: <MessageSquareText size={16} /> },
  { id: 'membership', label: 'Offer membership', hint: 'Invite them to a membership with toxin included each quarter', icon: <Crown size={16} /> },
  { id: 'call', label: "Assign to provider's call list", hint: 'A personal call from the injector who treated them', icon: <PhoneCall size={16} /> },
  { id: 'close', label: 'Close recall', hint: 'Patient moved, switched practice or opted out', icon: <CircleSlash size={16} /> },
];

const TEXT_OFFERS = ['Standard rebook link', 'Rebook link + $50 off this visit', 'Rebook link + free lip flip add-on'];
const MEMBERSHIPS = ['Glow Member ($99/mo)', 'Radiance Member ($179/mo)', 'VIP Member ($299/mo)'];
const CALL_WHEN = ['Today', 'Within 2 days', 'This week'];
const CLOSE_REASONS = ['Moved away', 'Switched practice', 'Opted out of reminders', 'Medical reason'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function BookRecallModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('text');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const recallId = pick(context, /recall id/i);
  const patient = pick(context, /^patient$|patient(?! id)/i);
  const provider = pick(context, /provider/i);
  const practice = pick(context, /practice/i);
  const service = pick(context, /service/i);
  const days = pick(context, /days since/i);
  const daysNum = Number(String(days).replace(/[^0-9.]/g, ''));

  const optionsFor = (d: Decision) => (d === 'text' ? TEXT_OFFERS : d === 'membership' ? MEMBERSHIPS : d === 'call' ? CALL_WHEN : CLOSE_REASONS);
  const reasonFor = (d: Decision) => {
    const o = optionsFor(d);
    if (d === 'text') return daysNum >= 105 ? o[1] : o[0];
    if (d === 'membership') return o[1];
    return o[0];
  };

  // Suggest from the row: long-overdue patients get a personal call, the rest get a Maia text.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = daysNum >= 112 ? 'call' : 'text';
    setDecision(suggested);
    setReason(reasonFor(suggested));
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = optionsFor(decision);
  const reasonLabel = decision === 'text' ? 'Offer' : decision === 'membership' ? 'Membership tier' : decision === 'call' ? 'Call by' : 'Reason';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const who = patient || 'The patient';
  const outcome =
    decision === 'text'
      ? 'will get a Maia text with a booking link (' + reason.toLowerCase() + ').'
      : decision === 'membership'
        ? 'has been offered the ' + reason + ' with toxin included.'
        : decision === 'call'
          ? 'is on ' + (provider || "the provider") + "'s call list (" + reason.toLowerCase() + ').'
          : 'recall was closed: ' + reason.toLowerCase() + '.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <CalendarHeart size={18} />
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
              <strong>{who}</strong>
              {recallId ? <> (recall {recallId})</> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Recall {recallId}</span>
              <div className="bid-chips">
                {[
                  ['Patient', patient],
                  ['Provider', provider],
                  ['Practice', practice],
                  ['Service', service],
                  ['Days since visit', days],
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
                    setReason(reasonFor(d.id));
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
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add context for the front desk or the provider…" />
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
