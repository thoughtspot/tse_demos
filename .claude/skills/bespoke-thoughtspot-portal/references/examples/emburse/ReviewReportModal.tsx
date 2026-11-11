import { useEffect, useState } from 'react';
import { X, ClipboardCheck, Check, Send, RotateCcw, ShieldAlert } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'approve' | 'return' | 'audit';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'approve', label: 'Approve', hint: 'Send to finance for export and reimbursement', icon: <Check size={16} /> },
  { id: 'return', label: 'Return to employee', hint: 'Ask the employee to fix and resubmit', icon: <RotateCcw size={16} /> },
  { id: 'audit', label: 'Flag for audit', hint: 'Route to Emburse audit review before approval', icon: <ShieldAlert size={16} /> },
];

const RETURN_REASONS = ['Missing receipt', 'Over policy limit', 'Wrong expense category', 'Needs business purpose', 'Duplicate expense'];
const AUDIT_REASONS = ['Duplicate suspected', 'High audit risk score', 'Alcohol on receipt', 'Hotel rate over cap', 'Unusual merchant'];

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ReviewReportModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('approve');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportId = pick(context, /report id/i);
  const employee = pick(context, /employee/i);
  const amount = pick(context, /expense amount|amount/i);
  const flag = pick(context, /policy flag|flag/i);
  const risk = pick(context, /risk/i);
  const pending = pick(context, /days pending|pending/i);
  const riskNum = Number(String(risk).replace(/[^0-9.]/g, ''));

  // Suggest a decision from the row: risky or duplicate reports go to audit, flagged ones back to the employee.
  useEffect(() => {
    if (!context) return;
    const f = flag.toLowerCase();
    const suggested: Decision = f.includes('duplicate') || riskNum >= 50 ? 'audit' : f && f !== 'none' ? 'return' : 'approve';
    setDecision(suggested);
    setReason(suggested === 'audit' ? (f.includes('duplicate') ? 'Duplicate suspected' : 'High audit risk score') : suggested === 'return' ? (f.includes('receipt') ? 'Missing receipt' : 'Over policy limit') : '');
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = decision === 'return' ? RETURN_REASONS : decision === 'audit' ? AUDIT_REASONS : [];
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const outcome =
    decision === 'approve'
      ? 'has been approved and queued for export to finance.'
      : decision === 'return'
        ? 'has been returned to ' + (employee || 'the employee') + ' with your comments.'
        : 'has been flagged and routed to Emburse audit review.';

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
              Report <strong>{reportId || 'selected'}</strong>
              {employee ? <> for <strong>{employee}</strong></> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Report {reportId}</span>
              <div className="bid-chips">
                {[
                  ['Employee', employee],
                  ['Amount', amount],
                  ['Policy flag', flag || 'None'],
                  ['Audit risk', risk],
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
                    setReason(d.id === 'return' ? RETURN_REASONS[0] : d.id === 'audit' ? AUDIT_REASONS[0] : '');
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
                <span>Reason</span>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                  {reasons.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="bid-field">
              <span>{decision === 'approve' ? 'Note for finance (optional)' : 'Comment for ' + (decision === 'return' ? (employee || 'the employee') : 'the audit team')}</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={decision === 'return' ? 'What needs fixing before resubmitting…' : 'Add context…'} />
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
