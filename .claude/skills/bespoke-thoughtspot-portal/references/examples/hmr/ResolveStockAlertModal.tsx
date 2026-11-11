import { useEffect, useState } from 'react';
import { X, ClipboardCheck, Check, Send, Truck, ArrowRightLeft, Pill, ShieldAlert } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'expedite' | 'transfer' | 'substitute' | 'shortage';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'expedite', label: 'Expedite delivery', hint: 'Priority order from a wholesaler', icon: <Truck size={16} /> },
  { id: 'transfer', label: 'Transfer stock', hint: 'Move packs from a nearby pharmacy', icon: <ArrowRightLeft size={16} /> },
  { id: 'substitute', label: 'Suggest substitute', hint: 'Same molecule or therapeutic alternative', icon: <Pill size={16} /> },
  { id: 'shortage', label: 'Report shortage', hint: 'Flag to the manufacturer and Infarmed', icon: <ShieldAlert size={16} /> },
];

const WHOLESALERS = ['Grossista Norte', 'Lusodistri', 'FarmaLink Ibérica', 'Alvesmed Distribuição', 'Direct from Manufacturer'];
const SHORTAGE_REASONS = ['Manufacturer supply disruption', 'Wholesaler allocation limit', 'Seasonal demand spike', 'Recall or quality hold'];
const SUBSTITUTES = ['Generic of the same molecule', 'Same ATC class alternative', 'Different pack size', 'Refer back to prescriber'];

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function ResolveStockAlertModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('expedite');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const alertId = pick(context, /alert id/i);
  const product = pick(context, /^product/i);
  const pharmacy = pick(context, /pharmacy/i);
  const district = pick(context, /district/i);
  const wholesaler = pick(context, /wholesaler/i);
  const open_ = pick(context, /days open/i);
  const openNum = Number(String(open_).replace(/[^0-9.]/g, ''));
  const firstFor = (d: Decision) => (d === 'expedite' ? (WHOLESALERS.find((w) => w !== wholesaler) || WHOLESALERS[0]) : d === 'shortage' ? SHORTAGE_REASONS[0] : d === 'substitute' ? SUBSTITUTES[0] : '');

  // Suggest an action from the row: long-open alerts are reported as shortages, respiratory gaps get a substitute,
  // fresh alerts get an expedited order.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = openNum >= 14 ? 'shortage' : /inhaler|ellipta|salbutamol/i.test(product) ? 'substitute' : openNum >= 5 ? 'transfer' : 'expedite';
    setDecision(suggested);
    setReason(firstFor(suggested));
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = decision === 'expedite' ? WHOLESALERS.filter((w) => w !== wholesaler) : decision === 'shortage' ? SHORTAGE_REASONS : decision === 'substitute' ? SUBSTITUTES : [];
  const reasonLabel = decision === 'expedite' ? 'Order from' : decision === 'shortage' ? 'Root cause' : 'Substitution';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const outcome =
    decision === 'expedite'
      ? 'has a priority order placed with ' + reason + ' for next-day delivery.'
      : decision === 'transfer'
        ? 'will be covered by a stock transfer from a pharmacy near ' + (district || 'the requesting pharmacy') + '.'
        : decision === 'substitute'
          ? 'has a substitution suggested to the pharmacist: ' + reason.toLowerCase() + '.'
          : 'has been reported as a shortage (' + reason.toLowerCase() + ') to the manufacturer and Infarmed.';

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
              Alert <strong>{alertId || 'selected'}</strong>
              {product ? <> for <strong>{product}</strong></> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Stock alert {alertId}</span>
              <div className="bid-chips">
                {[
                  ['Product', product],
                  ['Pharmacy', pharmacy],
                  ['District', district],
                  ['Wholesaler', wholesaler],
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
                    setReason(firstFor(d.id));
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
              <span>Note (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add context for the pharmacy, wholesaler or manufacturer…" />
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
