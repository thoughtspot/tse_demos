import { useEffect, useState } from 'react';
import { X, Scale, Check, Send, PackageCheck, Sparkles, Users, Gavel } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'release' | 'privfinder' | 'overflow' | 'escalate';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'release', label: 'Release to production', hint: 'Privilege calls done: log withheld docs and release the rest', icon: <PackageCheck size={16} /> },
  { id: 'privfinder', label: 'Re-run PrivFinder', hint: 'Re-score with matter-specific counsel and privilege actors', icon: <Sparkles size={16} /> },
  { id: 'overflow', label: 'Add overflow reviewers', hint: 'Assign privilege-trained reviewers from another Lineal center', icon: <Users size={16} /> },
  { id: 'escalate', label: 'Escalate to counsel', hint: 'Send the batch to outside counsel for a final privilege call', icon: <Gavel size={16} /> },
];

const RELEASE = ['Produce with privilege log', 'Produce with redactions', 'Produce, clawback reserved (FRE 502(d))'];
const PRIVFINDER = ['Add new outside counsel firm to actor index', 'Tighten likely-priv threshold', 'Full re-score of the batch'];
const OVERFLOW = ['Frankfurt (German-language)', 'Belfast', 'Nashville', 'Manila'];
const ESCALATE = ['Outside counsel, within 24h', 'In-house legal, within 48h', 'Case team lead, today'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function PrivilegeReviewModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('privfinder');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const recallId = pick(context, /batch id/i);
  const patient = pick(context, /^matter$/i);
  const provider = pick(context, /custodian/i);
  const practice = pick(context, /data source/i);
  const service = pick(context, /privileged/i);
  const days = pick(context, /days in stage/i);
  const daysNum = Number(String(days).replace(/[^0-9.]/g, ''));

  const optionsFor = (d: Decision) => (d === 'release' ? RELEASE : d === 'privfinder' ? PRIVFINDER : d === 'overflow' ? OVERFLOW : ESCALATE);
  const reasonFor = (d: Decision) => {
    const o = optionsFor(d);
    return o[0];
  };

  // Suggest from the row: batches stuck a week or more get overflow reviewers, the rest a PrivFinder re-run.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = daysNum >= 7 ? 'overflow' : 'privfinder';
    setDecision(suggested);
    setReason(reasonFor(suggested));
    setComment('');
    setSubmitted(false);
  }, [context]);

  if (!open || !context) return null;

  const reasons = optionsFor(decision);
  const reasonLabel = decision === 'release' ? 'Production option' : decision === 'privfinder' ? 'PrivFinder run' : decision === 'overflow' ? 'Review center' : 'Escalate to';
  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const who = patient || 'The matter';
  const outcome =
    decision === 'release'
      ? 'batch released to production (' + reason.toLowerCase() + ').'
      : decision === 'privfinder'
        ? 'batch queued for a PrivFinder re-run (' + reason.toLowerCase() + ').'
        : decision === 'overflow'
          ? 'batch assigned to overflow privilege reviewers in ' + reason + '.'
          : 'batch escalated: ' + reason.toLowerCase() + '.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Scale size={18} />
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
              {recallId ? <> ({recallId})</> : null} {outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">Batch {recallId}</span>
              <div className="bid-chips">
                {[
                  ['Matter', patient],
                  ['Custodian', provider],
                  ['Data source', practice],
                  ['Privileged docs', service],
                  ['Days in stage', days],
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
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add context for the case team or the review manager…" />
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
