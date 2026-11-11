import { useEffect, useState } from 'react';
import { X, Siren, Check, Send, UserPlus, CalendarClock, ArrowUpRight, Unlock } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'escalate' | 'reassign' | 'replan' | 'unblock';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'escalate', label: 'Escalate project', hint: 'Flag to the delivery lead and the customer sponsor', icon: <ArrowUpRight size={16} /> },
  { id: 'reassign', label: 'Reassign task', hint: 'Move it to a resource with capacity this week', icon: <UserPlus size={16} /> },
  { id: 'replan', label: 'Set new due date', hint: 'Re-baseline the task and its dependants', icon: <CalendarClock size={16} /> },
  { id: 'unblock', label: 'Request customer input', hint: 'Send a customer-portal nudge for the blocker', icon: <Unlock size={16} /> },
];

const ESCALATE_TO = ['Delivery lead, Enterprise Onboarding', 'Delivery lead, Mid-Market Launch', 'Head of Professional Services', 'Customer executive sponsor'];
const RESOURCES = ['Hannah Kim (Implementation, 62% booked)', 'Yuki Yamada (Data Migration, 70% booked)', 'Elena Petrov (Solutions Architect, 58% booked)', 'Tara Hall (QA, 55% booked)', 'Kavya Mehta (Technical, 66% booked)', 'Felix Wright (Implementation, 71% booked)'];
const DUE = ['In 2 business days', 'In 5 business days', 'End of next week', 'Align to next phase gate'];
const NUDGES = ['Data extract still pending', 'UAT sign-off awaiting customer', 'SSO / IT access not granted', 'Stakeholder decision needed'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function EscalateTaskModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('escalate');
  const [choice, setChoice] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const taskId = pick(context, /task id/i);
  const taskName = pick(context, /task name/i);
  const project = pick(context, /project name|project/i);
  const assignee = pick(context, /assignee/i);
  const phase = pick(context, /phase/i);
  const overdue = pick(context, /overdue/i);
  const overdueNum = Number(String(overdue).replace(/[^0-9.]/g, ''));

  const optionsFor = (d: Decision) => (d === 'escalate' ? ESCALATE_TO : d === 'reassign' ? RESOURCES.filter((r) => !r.startsWith(assignee)) : d === 'replan' ? DUE : NUDGES);
  const defaultFor = (d: Decision) => {
    const o = optionsFor(d);
    if (d === 'reassign' && /migration/i.test(phase)) return o.find((r) => /Data Migration/.test(r)) || o[0];
    if (d === 'unblock' && /uat|testing/i.test(phase)) return NUDGES[1];
    return o[0];
  };

  // Suggest a step from the row: long-overdue tasks get escalated, blocked migration/UAT work gets a customer nudge.
  useEffect(() => {
    if (!context) return;
    const blocked = /blocked/i.test(pick(context, /status/i));
    const suggested: Decision = overdueNum >= 14 ? 'escalate' : blocked ? 'unblock' : 'reassign';
    setDecision(suggested);
    setChoice(defaultFor(suggested));
    setComment('');
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if (!open || !context) return null;

  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const label = decision === 'escalate' ? 'Escalate to' : decision === 'reassign' ? 'New assignee' : decision === 'replan' ? 'New due date' : 'Blocker';
  const outcome =
    decision === 'escalate'
      ? 'has been escalated to ' + choice + '. The project is flagged At Risk and the sponsor gets a status update in the customer portal.'
      : decision === 'reassign'
        ? 'is now assigned to ' + choice.replace(/ \(.*\)$/, '') + ' and moved to the top of their task list.'
        : decision === 'replan'
          ? 'is re-baselined (' + choice.toLowerCase() + '); dependent tasks in ' + (phase || 'this phase') + ' shift with it.'
          : 'triggered a customer-portal request: "' + choice + '". The task stays blocked until the customer responds.';

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
            <h3>{CONTENT.action.successTitle}</h3>
            <p>
              <strong>{taskName || 'This task'}</strong> {taskId ? '(' + taskId + ') ' : ''}{outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">{taskName || 'Selected task'}{taskId ? ' · ' + taskId : ''}</span>
              <div className="bid-chips">
                {[
                  ['Project', project],
                  ['Phase', phase],
                  ['Assignee', assignee],
                  ['Days overdue', overdue],
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
                    setChoice(defaultFor(d.id));
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

            <label className="bid-field">
              <span>Note (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What is blocking it, what the customer committed to, impact on go-live…" />
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
