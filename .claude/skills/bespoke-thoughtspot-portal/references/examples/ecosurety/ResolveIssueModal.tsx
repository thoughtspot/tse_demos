import { useEffect, useState } from 'react';
import { X, ClipboardCheck, Check, Send, Wrench, Truck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'correct' | 'supplier' | 'escalate' | 'accept';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'correct', label: 'Correct the data', hint: 'Fix the value and re-run the 220+ checks', icon: <Wrench size={16} /> },
  { id: 'supplier', label: 'Request supplier data', hint: 'Ask the packaging supplier for a new upload', icon: <Truck size={16} /> },
  { id: 'escalate', label: 'Escalate to account manager', hint: 'Get an Ecosurety data specialist on it', icon: <ShieldAlert size={16} /> },
  { id: 'accept', label: 'Accept with justification', hint: 'Confirm the value is correct as submitted', icon: <CheckCircle2 size={16} /> },
];

const FIXES: Record<string, string[]> = {
  'Missing Weight': ['Enter unit weight from spec sheet', 'Use weight from previous submission', 'Weigh a sample of 10 units'],
  'Unit Weight Outlier': ['Correct unit weight (grams vs kg)', 'Correct units placed on market', 'Split into separate components'],
  'Material Not Classified': ['Set material to Plastic', 'Set material to Paper and Card', 'Set material to Fibre-based Composite'],
  'Nation of Sale Missing': ['Allocate by sales split (England 84%)', 'Allocate all to England', 'Request nation split from sales team'],
  'Packaging Type Mismatch': ['Reclassify as Household', 'Reclassify as Non-household', 'Reclassify as Public Bin'],
  'Supplier Data Not Received': ['Use last approved supplier data', 'Enter data manually', 'Request supplier upload'],
};
const ESCALATE_REASONS = ['Submission deadline at risk', 'Supplier unresponsive', 'Unclear regulatory guidance', 'High fee impact'];
const SUPPLIER_DEADLINES = ['Within 3 working days', 'Within 5 working days', 'Before month-end'];

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ResolveIssueModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('correct');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportId = pick(context, /record id/i);
  const producer = pick(context, /producer/i);
  const material = pick(context, /material/i);
  const issue = pick(context, /data issue|issue/i);
  const supplier = pick(context, /supplier/i);
  const open_ = pick(context, /days open/i);
  const openNum = Number(String(open_).replace(/[^0-9.]/g, ''));
  const fixes = FIXES[issue] || FIXES['Unit Weight Outlier'];
  const reasonFor = (d: Decision) => (d === 'correct' ? fixes[0] : d === 'supplier' ? SUPPLIER_DEADLINES[0] : d === 'escalate' ? (openNum >= 20 ? ESCALATE_REASONS[0] : ESCALATE_REASONS[1]) : '');

  // Suggest an action from the row: missing supplier data goes to the supplier, long-open issues escalate, the rest get corrected.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = openNum >= 30 ? 'escalate' : /supplier/i.test(issue) ? 'supplier' : 'correct';
    setDecision(suggested);
    setReason(reasonFor(suggested));
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = decision === 'correct' ? fixes : decision === 'supplier' ? SUPPLIER_DEADLINES : decision === 'escalate' ? ESCALATE_REASONS : [];
  const reasonLabel = decision === 'correct' ? 'Fix' : decision === 'supplier' ? 'Requested by' : 'Reason';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const outcome =
    decision === 'correct'
      ? 'was corrected (' + reason.toLowerCase() + ') and re-queued for validation.'
      : decision === 'supplier'
        ? 'is waiting on ' + (supplier || 'the supplier') + ', who has been asked for new data ' + reason.toLowerCase() + '.'
        : decision === 'escalate'
          ? 'has been escalated to your Ecosurety account manager.'
          : 'was accepted as submitted with your justification on file.';

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
              Data line <strong>{reportId || 'selected'}</strong>
              {producer ? <> for <strong>{producer}</strong></> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Data line {reportId}</span>
              <div className="bid-chips">
                {[
                  ['Producer', producer],
                  ['Material', material],
                  ['Issue', issue],
                  ['Supplier', supplier],
                  ['Days open', open_],
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
              <span>{decision === 'accept' ? 'Justification' : 'Note (optional)'}</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={decision === 'accept' ? 'Why the value is correct (e.g. new heavier glass jar)…' : 'Add context for the supplier or your account manager…'} />
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
