// ---------------------------------------------------------------------------
// Turns a ThoughtSpot CustomAction payload (fired from the Signals answer's
// context menu) into a structured context for the Win-Back modal.
//
// Context-menu payload shape (from the SDK):
//   payload.data.clickedPoint = {
//     selectedAttributes: [{ column: { name }, value }],
//     selectedMeasures:   [{ column: { name }, value }],
//   }
//   payload.data.selectedPoints = [ ...same shape ]
// ---------------------------------------------------------------------------

export interface SignalField {
  name: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
}

export interface SignalContext {
  fields: SignalField[];
  cadence?: string;
  account?: string;
  contacts: Contact[];
}

function fmt(v: unknown): string {
  if (v == null || v === '') return '—';
  if (Array.isArray(v)) return v.map(fmt).join(', ');
  // ColumnValue.value can be an object like { v: { s, e } } (date ranges).
  if (typeof v === 'object') {
    const o: any = v;
    if (o.v?.s != null) return String(o.v.s);
    return '—';
  }
  return String(v);
}

function fieldsFromPoint(point: any): SignalField[] {
  if (!point) return [];
  const out: SignalField[] = [];
  const collect = (arr: any[] | undefined) =>
    (arr ?? []).forEach((it) => {
      const name = it?.column?.name ?? it?.columnName ?? it?.column?.column_name;
      if (name != null) out.push({ name: String(name), value: fmt(it?.value) });
    });
  collect(point.selectedAttributes);
  collect(point.selectedMeasures);
  return out;
}

// Fallback: pull row-0 values from the answer data (columns + columnDataLite).
function fieldsFromAnswerData(data: any): SignalField[] {
  const ead = data?.embedAnswerData;
  const cols: any[] | undefined = ead?.columns;
  const cdl: any[] | undefined =
    data?.data?.columnDataLite ??
    ead?.data?.[0]?.columnDataLite ??
    ead?.columnDataLite;
  if (!Array.isArray(cols) || !Array.isArray(cdl)) return [];
  return cols
    .map((c, i) => {
      const name =
        c?.column?.name ?? c?.name ?? c?.referencedColumns?.[0]?.displayName;
      const value = cdl[i]?.dataValue?.[0];
      return name != null ? { name: String(name), value: fmt(value) } : null;
    })
    .filter((x): x is SignalField => x != null);
}

function findValue(fields: SignalField[], re: RegExp, exclude?: RegExp): string | undefined {
  const f = fields.find((x) => re.test(x.name) && !(exclude && exclude.test(x.name)));
  return f && f.value !== '—' ? f.value : undefined;
}

// --- deterministic demo contacts (seeded from the account) -----------------

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'account';
}

const FIRSTS = ['Jordan', 'Taylor', 'Morgan', 'Avery', 'Riley', 'Casey', 'Quinn'];
const LASTS = ['Patel', 'Nguyen', 'Garcia', 'Okafor', 'Kim', 'Rossi', 'Hayes'];
const TITLES = ['VP of Sales', 'Director of Ops', 'Procurement Lead', 'Account Director', 'Head of RevOps'];

function synthesizeContacts(seed: string): Contact[] {
  const h = hash(seed);
  const domain = slug(seed);
  const n = 3 + (h % 2); // 3–4 contacts
  const out: Contact[] = [];
  for (let i = 0; i < n; i++) {
    const first = FIRSTS[(h + i * 3) % FIRSTS.length];
    const last = LASTS[(h + i * 5) % LASTS.length];
    out.push({
      id: `c${i}`,
      name: `${first} ${last}`,
      title: TITLES[(h + i) % TITLES.length],
      email: `${first}.${last}@${domain}.com`.toLowerCase(),
    });
  }
  return out;
}

function deriveContacts(fields: SignalField[], account: string | undefined): Contact[] {
  // Prefer real person/email columns if the answer exposes them.
  const people = fields.filter(
    (f) =>
      /(contact|person|owner|rep|prospect)\s*(name)?$/i.test(f.name) &&
      !/account|company|cadence/i.test(f.name) &&
      f.value !== '—',
  );
  const emails = fields.filter((f) => /email/i.test(f.name) && f.value !== '—');
  if (people.length || emails.length) {
    const count = Math.max(people.length, emails.length, 1);
    return Array.from({ length: count }, (_, i) => ({
      id: `c${i}`,
      name: people[i]?.value ?? `Contact ${i + 1}`,
      title: 'Key contact',
      email: emails[i]?.value ?? '',
    }));
  }
  return synthesizeContacts(account || 'account');
}

export function buildSignalContext(data: any): SignalContext {
  // Context-menu actions deliver the clicked row under `contextMenuPoints`;
  // some events use top-level clickedPoint/selectedPoints instead.
  const cmp = data?.contextMenuPoints;
  const point =
    cmp?.clickedPoint ??
    data?.clickedPoint ??
    cmp?.selectedPoints?.[0] ??
    data?.selectedPoints?.[0];

  let fields = fieldsFromPoint(point);
  if (!fields.length) fields = fieldsFromAnswerData(data);

  const cadence = findValue(fields, /cadence/i);
  const account =
    findValue(fields, /account|company|organization|\borg\b/i) ??
    findValue(fields, /\bname\b/i, /cadence|contact|user|owner|rep/i);

  return {
    fields,
    cadence,
    account,
    contacts: deriveContacts(fields, account),
  };
}
