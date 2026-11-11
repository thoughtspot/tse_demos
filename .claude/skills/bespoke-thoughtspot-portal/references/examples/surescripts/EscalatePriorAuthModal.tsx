import { useEffect, useState } from 'react';
import { X, Check, Send, Siren, PhoneCall, FileUp, Zap, Clock } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

// Prior-auth escalation screen, pre-filled from the pending-PA row the user right-clicked.
type Decision = 'expedite' | 'peer' | 'clinicals' | 'touchless';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'expedite', label: 'Request expedited review', hint: 'Ask the PBM for an urgent (72-hour or faster) determination', icon: <Siren size={16} /> },
  { id: 'peer', label: 'Schedule peer-to-peer', hint: 'Book a prescriber call with the PBM clinical reviewer', icon: <PhoneCall size={16} /> },
  { id: 'clinicals', label: 'Attach clinicals', hint: 'Send chart notes, labs and step-therapy history through ePA', icon: <FileUp size={16} /> },
  { id: 'touchless', label: 'Resubmit as touchless ePA', hint: 'Move a fax/phone request onto Surescripts electronic PA', icon: <Zap size={16} /> },
];

const URGENCY = ['Urgent: patient is without therapy', 'High: therapy start this week', 'Standard: follow up within 24 hours'];
const PEER = ['Today, 4:00 PM ET', 'Tomorrow, 9:30 AM ET', 'Tomorrow, 1:00 PM ET', 'Next business day, first available'];
const CLINICALS = ['Chart notes + diagnosis codes', 'Lab results + chart notes', 'Step-therapy history (prior drugs tried)', 'Letter of medical necessity'];
const ROUTES = ['Surescripts ePA (prospective, in EHR workflow)', 'Surescripts Prior Authorization Portal', 'Touchless PA with auto-answered questions'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function EscalatePriorAuthModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('expedite');
  const [choice, setChoice] = useState('');
  const [urgency, setUrgency] = useState(URGENCY[1]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const txId = pick(context, /transaction id|^transaction$/i);
  const org = pick(context, /prescriber|organization/i);
  const pbm = pick(context, /pbm/i);
  const drugClass = pick(context, /therapeutic|class/i);
  const channel = pick(context, /channel/i);
  const pending = pick(context, /pending/i);
  const pendingNum = Number(String(pending).replace(/[^0-9.]/g, ''));
  const isFax = /fax|phone/i.test(channel);
  const isSpecialty = /specialty/i.test(drugClass);

  const optionsFor = (d: Decision) => (d === 'expedite' ? URGENCY : d === 'peer' ? PEER : d === 'clinicals' ? CLINICALS : ROUTES);

  // Suggest a step from the row: fax/phone requests move onto ePA, long waits get an expedited review,
  // specialty drugs get a peer-to-peer.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = isFax && pendingNum < 14 ? 'touchless' : pendingNum >= 7 ? 'expedite' : isSpecialty ? 'peer' : 'clinicals';
    setDecision(suggested);
    setChoice(optionsFor(suggested)[0]);
    setUrgency(pendingNum >= 14 ? URGENCY[0] : URGENCY[1]);
    setComment('');
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if (!open || !context) return null;

  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const label = decision === 'expedite' ? 'Urgency' : decision === 'peer' ? 'Peer-to-peer slot' : decision === 'clinicals' ? 'Documents to attach' : 'Resubmission route';
  const outcome =
    decision === 'expedite'
      ? 'is escalated to ' + (pbm || 'the PBM') + ' as "' + choice + '". The prescriber and pharmacy are notified and the request is flagged in the Prior Auth Queue.'
      : decision === 'peer'
        ? 'has a peer-to-peer review booked with ' + (pbm || 'the PBM') + ' clinical team (' + choice + '). The prescriber gets a calendar invite in the EHR inbox.'
        : decision === 'clinicals'
          ? 'now carries "' + choice + '" through Surescripts ePA. ' + (pbm || 'The PBM') + ' is asked to re-review with the new documentation.'
          : 'is resubmitted via ' + choice + '. Electronic PAs on this network are decided in about 6 hours on average versus about a day by fax.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Siren size={18} />
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
            <h3>{decision === 'expedite' ? CONTENT.action.successTitle : decision === 'peer' ? 'Peer-to-peer scheduled' : decision === 'clinicals' ? 'Clinicals sent' : 'Resubmitted electronically'}</h3>
            <p>
              <strong>{txId || 'This prior authorization'}</strong>{org ? ' (' + org + ') ' : ' '}{outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">{txId || 'Selected prior auth'}{org ? ' · ' + org : ''}</span>
              <div className="bid-chips">
                {[
                  ['PBM', pbm],
                  ['Therapeutic class', drugClass],
                  ['Channel', channel],
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

            <div className="review-decisions" role="radiogroup" aria-label="Escalation path">
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

            {decision !== 'expedite' && (
              <label className="bid-field">
                <span>
                  <Clock size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  Urgency
                </span>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  {URGENCY.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="bid-field">
              <span>Note to PBM reviewer (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Clinical rationale, prior therapies tried, contraindications… (no patient identifiers)" />
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
