import { useEffect, useState } from 'react';
import { X, Gavel, Check, Send } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

// One input in the request form. Supplied by `content.action.fields`, so a demo
// whose workflow is not freight can describe its own form instead of this file
// being rewritten. `match` is a regex source matched against the clicked row's
// column names to pre-fill the input — the thing that makes the modal feel like
// it belongs to the data rather than sitting on top of it.
export interface ActionField {
  label: string;
  placeholder?: string;
  type?: 'text' | 'select' | 'textarea';
  options?: readonly string[];
  match?: string;
  numeric?: boolean;
}

// The freight form this template ships with. Overriding `content.action.fields`
// replaces it wholesale; omitting the key leaves exactly what was here before.
const DEFAULT_FIELDS: readonly ActionField[] = [
  { label: 'Freight corridor / lane', placeholder: 'e.g. Dallas, TX → Atlanta, GA',
    match: 'corridor|lane|origin|destination' },
  { label: 'Carrier', placeholder: 'Carrier name', match: 'carrier' },
  { label: 'Equipment', type: 'select',
    options: ['Dry Van', 'Reefer', 'Flatbed', 'Power Only'] },
  { label: 'Target rate ($)', placeholder: '2,300.00', numeric: true,
    match: 'rate|price|\\$|cost|spend' },
];

const DEFAULT_NOTES: ActionField = {
  label: 'Notes for the capacity desk', type: 'textarea',
  placeholder: 'Any constraints, timing, or commitments…',
};

// The strings this file used to hardcode. They stay the defaults so a build that
// overrides nothing renders exactly as it did before this change: these are the
// template's own words, not a generic rewrite of them.
const DEFAULT_SUCCESS_TITLE = 'Bid request submitted';
const DEFAULT_LEAD =
  'Pre-filled from the selected lane. Review and submit to request a carrier bid through Northwind.';
const DEFAULT_SUBMIT = 'Submit bid request';
const DEFAULT_CONTEXT_LABEL = 'From this lane';

// Pull a value out of the clicked-row fields by matching the column name.
function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function BidModal({ open, context, onClose }: Props) {
  const action = CONTENT.action as typeof CONTENT.action & {
    fields?: readonly ActionField[];
    notesField?: ActionField;
    contextLabel?: string;
    successTitle?: string;
    successBody?: string;
    modalLead?: string;
    submitLabel?: string;
  };
  const fields = action.fields?.length ? action.fields : DEFAULT_FIELDS;
  const notesField = action.notesField ?? DEFAULT_NOTES;

  // Keyed by label rather than five named useState calls, so the form is
  // whatever the content says it is.
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (label: string, value: string) =>
    setValues((v) => ({ ...v, [label]: value }));

  // Pre-fill from the row the user right-clicked whenever the form is opened.
  useEffect(() => {
    if (!context) return;
    const next: Record<string, string> = {};
    for (const f of fields) {
      // A select without a match keeps its first option; a text field starts empty.
      const fallback = f.type === 'select' ? (f.options?.[0] ?? '') : '';
      if (!f.match) {
        next[f.label] = fallback;
        continue;
      }
      const found = pick(context, new RegExp(f.match, 'i'));
      next[f.label] = found
        ? (f.numeric ? found.replace(/[^0-9.]/g, '') : found)
        : fallback;
    }
    setValues(next);
    setNotes('');
    setSubmitted(false);
  }, [context, fields]);

  if (!open || !context) return null;

  // Everything the form did not claim, shown as read-only context chips. Built
  // from the fields' own match patterns so it stays correct for any form.
  const claimed = fields
    .map((f) => f.match)
    .filter(Boolean)
    .join('|');
  const claimedRe = claimed ? new RegExp(claimed, 'i') : null;
  const otherFields = context.fields.filter(
    (f) => (!claimedRe || !claimedRe.test(f.name)) && f.value !== '—',
  );

  const primary = values[fields[0]?.label ?? ''] || '';
  const secondary = values[fields[1]?.label ?? ''] || '';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Gavel size={18} />
            <span>{action.modalTitle}</span>
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
            <h3>{action.successTitle ?? DEFAULT_SUCCESS_TITLE}</h3>
            <p>
              {action.successBody ?? (
                <>
                  Your bid for <strong>{primary || 'this lane'}</strong>
                  {secondary ? <> to <strong>{secondary}</strong></> : null} has been
                  sent to the {CONTENT.company} capacity desk.
                </>
              )}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{action.modalLead ?? DEFAULT_LEAD}</p>

            <div className="bid-grid">
              {fields.map((f) => (
                <label className="bid-field" key={f.label}>
                  <span>{f.label}</span>
                  {f.type === 'select' ? (
                    <select
                      value={values[f.label] ?? ''}
                      onChange={(e) => set(f.label, e.target.value)}
                    >
                      {(f.options ?? []).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={values[f.label] ?? ''}
                      onChange={(e) => set(f.label, e.target.value)}
                      placeholder={f.placeholder}
                      inputMode={f.numeric ? 'decimal' : undefined}
                    />
                  )}
                </label>
              ))}
            </div>

            {otherFields.length > 0 && (
              <div className="bid-context">
                <span className="bid-context-label">
                  {action.contextLabel ?? DEFAULT_CONTEXT_LABEL}
                </span>
                <div className="bid-chips">
                  {otherFields.slice(0, 6).map((f) => (
                    <span className="bid-chip" key={f.name}>
                      <em>{f.name}</em> {f.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <label className="bid-field">
              <span>{notesField.label}</span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={notesField.placeholder}
              />
            </label>

            <div className="bid-actions">
              <button className="winback-close-text" onClick={onClose}>Cancel</button>
              <button className="sl-hfilter-apply bid-submit" onClick={() => setSubmitted(true)}>
                <Send size={15} /> {action.submitLabel ?? DEFAULT_SUBMIT}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
