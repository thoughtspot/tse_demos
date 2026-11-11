// Shared "credits" consumption model for the host app (optional bespoke-portal feature).
// One store, read by the avatar-menu "Consumption Stats" item, the Liveboard-level custom
// action on the Analytics embed, and the Report Builder's thin credit meter.
// Persisted per user in localStorage (every access wrapped in try/catch; the app works without it).
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type Plan = 'Starter' | 'Growth' | 'Enterprise';
export const PLAN_ORDER: Plan[] = ['Starter', 'Growth', 'Enterprise'];
export const PLAN_CREDITS: Record<Plan, number> = { Starter: 1000, Growth: 2000, Enterprise: 5000 };

export type UsageKind = 'search' | 'view';
export const USAGE_LABEL: Record<UsageKind, string> = {
  search: 'Custom report builds',
  view: 'Report runs',
};
/** Credits charged per event. */
export const CREDIT_COST: Record<UsageKind, number> = { search: 4, view: 2 };

export type ModalSource = 'menu' | 'liveboard';

interface Stored {
  month: string;
  plan: Plan;
  counts: Record<UsageKind, number>;
}

interface CreditsCtx {
  plan: Plan;
  allowance: number;
  used: number;
  pct: number;
  counts: Record<UsageKind, number>;
  resetDate: Date;
  nextPlan: Plan | null;
  addUsage: (kind: UsageKind, n?: number) => void;
  upgrade: () => Plan | null;
  modalOpen: boolean;
  /** Where the modal was opened from; the Liveboard action hides custom report builds. */
  modalSource: ModalSource;
  openModal: (source?: ModalSource) => void;
  closeModal: () => void;
}

const monthKey = (d = new Date()) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

// Plausible mid-month seed: 1,240 of 2,000 Growth credits (220 custom report builds x4, 180 report runs x2).
function seed(): Stored {
  return { month: monthKey(), plan: 'Growth', counts: { search: 220, view: 180 } };
}

function load(key: string): Stored {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const s = JSON.parse(raw) as Stored;
      if (s && s.month === monthKey() && PLAN_ORDER.includes(s.plan) && s.counts && Object.keys(s.counts).every((k) => k in CREDIT_COST)) return s;
      if (s && PLAN_ORDER.includes(s.plan)) return { ...seed(), plan: s.plan }; // new month: keep plan, reseed usage
    }
  } catch {
    /* storage blocked: fall through to the seed */
  }
  return seed();
}

const Ctx = createContext<CreditsCtx | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { username } = useAuth();
  const key = 'scania.credits.' + (username || 'demo');
  const [state, setState] = useState<Stored>(() => load(key));
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<ModalSource>('menu');

  // Re-load when the signed-in user changes.
  useEffect(() => setState(load(key)), [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage blocked: state still works for this session */
    }
  }, [key, state]);

  const addUsage = useCallback((kind: UsageKind, n = 1) => {
    setState((s) => ({ ...s, counts: { ...s.counts, [kind]: (s.counts[kind] || 0) + n } }));
  }, []);

  const value = useMemo<CreditsCtx>(() => {
    const allowance = PLAN_CREDITS[state.plan];
    const used = (Object.keys(CREDIT_COST) as UsageKind[]).reduce((a, k) => a + (state.counts[k] || 0) * CREDIT_COST[k], 0);
    const idx = PLAN_ORDER.indexOf(state.plan);
    const nextPlan = idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : null;
    const now = new Date();
    return {
      plan: state.plan,
      allowance,
      used,
      pct: Math.min(100, (used / allowance) * 100),
      counts: state.counts,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      nextPlan,
      addUsage,
      upgrade: () => {
        if (!nextPlan) return null;
        setState((s) => ({ ...s, plan: nextPlan }));
        return nextPlan;
      },
      modalOpen,
      modalSource,
      openModal: (source: ModalSource = 'menu') => {
        setModalSource(source);
        setModalOpen(true);
      },
      closeModal: () => setModalOpen(false),
    };
  }, [state, addUsage, modalOpen, modalSource]);

  // Dev-only test hook (Playwright opens the Liveboard-action view without a ThoughtSpot sign-in).
  if ((import.meta as any).env?.DEV) (window as any).__credits = value;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCredits(): CreditsCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCredits must be used inside <CreditsProvider>');
  return c;
}

export const fmt = (n: number) => n.toLocaleString('en-US');
