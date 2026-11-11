import { useEffect, useState } from 'react';
import { X, Wrench, Check, Send, Truck, GraduationCap, CalendarClock, RefreshCw } from 'lucide-react';
import { SignalContext } from '../lib/signalContext';
import { CONTENT } from '../content';

interface Props {
  open: boolean;
  context: SignalContext | null;
  onClose: () => void;
}

type Decision = 'book' | 'mobile' | 'coach' | 'flex';

const DECISIONS: { id: Decision; label: string; hint: string; icon: JSX.Element }[] = [
  { id: 'book', label: 'Book workshop visit', hint: 'Reserve a bay at the nearest Scania workshop', icon: <Wrench size={16} /> },
  { id: 'mobile', label: 'Send mobile service van', hint: 'Service the vehicle at the depot between shifts', icon: <Truck size={16} /> },
  { id: 'coach', label: 'Coach driver', hint: 'Book a Scania Driver Training session on idling', icon: <GraduationCap size={16} /> },
  { id: 'flex', label: 'Switch to Flexible maintenance', hint: 'Plan services from real usage data, not the calendar', icon: <RefreshCw size={16} /> },
];

const SLOTS = ['Tomorrow, 06:00 (before first shift)', 'Tomorrow, 18:30 (after last shift)', 'In 2 days, 07:00', 'Saturday, 08:00 (weekend bay)'];
const JOBS = ['Scheduled service + brake check', 'Scheduled service + tyre and axle check', 'Scheduled service + battery and charging check (BEV)', 'Service + diagnostic read-out (fault codes)'];
const COACHING = ['Eco-driving: idling and anticipation (2 h, at depot)', 'Scania Driver Training: fuel efficiency (1 day)', 'Remote coaching call with driver evaluation review', 'Driver Support targets: idling under 8%'];
const FLEX = ['Flexible plan from next service', 'Flexible plan + Scania Maintenance contract quote', 'Keep Periodic, add usage alerts'];

function pick(ctx: SignalContext | null, re: RegExp): string {
  const f = ctx?.fields.find((x) => re.test(x.name) && x.value !== '—');
  return f ? f.value : '';
}

export default function BookWorkshopModal({ open, context, onClose }: Props) {
  const [decision, setDecision] = useState<Decision>('book');
  const [choice, setChoice] = useState('');
  const [job, setJob] = useState(JOBS[0]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const vehicle = pick(context, /^vehicle$|vehicle reg|registration/i) || pick(context, /vehicle/i);
  const fleet = pick(context, /fleet/i);
  const depot = pick(context, /depot/i);
  const driver = pick(context, /driver/i);
  const overdue = pick(context, /overdue/i);
  const idle = pick(context, /idle/i);
  const overdueNum = Number(String(overdue).replace(/[^0-9.]/g, ''));
  const idleNum = Number(String(idle).replace(/[^0-9.]/g, ''));
  const isBev = /E$/.test(vehicle.trim());
  const workshops = [
    'Scania Service ' + (depot || 'nearest workshop'),
    'Scania Service ' + (depot || 'regional') + ' North (24/7)',
    'Authorised Scania partner workshop, ' + (depot || 'nearby'),
  ];

  const optionsFor = (d: Decision) => (d === 'book' ? workshops.map((w, i) => w + ' · ' + SLOTS[i % SLOTS.length]) : d === 'mobile' ? SLOTS : d === 'coach' ? COACHING : FLEX);

  // Suggest a step from the row: long-overdue vehicles get a workshop bay, high idling gets driver coaching.
  useEffect(() => {
    if (!context) return;
    const suggested: Decision = idleNum >= 15 && overdueNum < 10 ? 'coach' : overdueNum >= 21 ? 'book' : 'mobile';
    setDecision(suggested);
    setChoice(optionsFor(suggested)[0]);
    setJob(isBev ? JOBS[2] : overdueNum >= 30 ? JOBS[3] : JOBS[0]);
    setComment('');
    setSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if (!open || !context) return null;

  const chosen = DECISIONS.find((d) => d.id === decision)!;
  const label = decision === 'book' ? 'Workshop and slot' : decision === 'mobile' ? 'Service window at the depot' : decision === 'coach' ? 'Coaching session' : 'Maintenance plan';
  const outcome =
    decision === 'book'
      ? 'is booked at ' + choice + ' for "' + job + '". ' + (driver || 'The driver') + ' gets the booking in the Scania Driver app and the vehicle shows as Planned in My Scania.'
      : decision === 'mobile'
        ? 'gets a mobile service van at ' + (depot || 'the depot') + ' (' + choice.toLowerCase() + ') for "' + job + '". No shift is lost.'
        : decision === 'coach'
          ? 'stays on plan; ' + (driver || 'the driver') + ' is booked on "' + choice + '". Idle share is ' + (idle || 'above target') + ' and is tracked weekly in Driver Evaluation.'
          : 'moves to: ' + choice + '. The next service date is now calculated from actual usage.';

  return (
    <div className="winback-overlay" onClick={onClose}>
      <div className="winback-modal bid-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <Wrench size={18} />
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
            <h3>{decision === 'book' ? CONTENT.action.successTitle : decision === 'coach' ? 'Coaching booked' : decision === 'mobile' ? 'Mobile service booked' : 'Maintenance plan updated'}</h3>
            <p>
              <strong>{vehicle || 'This vehicle'}</strong>{fleet ? ' (' + fleet + ') ' : ' '}{outcome}
            </p>
            <button className="sl-hfilter-apply bid-done" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="bid-body">
            <p className="bid-lead">{CONTENT.action.modalLead}</p>

            <div className="bid-context">
              <span className="bid-context-label">{vehicle || 'Selected vehicle'}{fleet ? ' · ' + fleet : ''}</span>
              <div className="bid-chips">
                {[
                  ['Depot', depot],
                  ['Driver', driver],
                  ['Days overdue', overdue],
                  ['Idle share', idle],
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

            {(decision === 'book' || decision === 'mobile') && (
              <label className="bid-field">
                <span>
                  <CalendarClock size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  Job
                </span>
                <select value={job} onChange={(e) => setJob(e.target.value)}>
                  {JOBS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="bid-field">
              <span>Note to workshop (optional)</span>
              <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reported faults, warning lights, preferred technician, trailer swap…" />
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
