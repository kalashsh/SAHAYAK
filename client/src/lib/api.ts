import { useEffect, useState } from 'react';
import axios from 'axios';

type State = 'Delhi' | 'Haryana' | 'Uttar Pradesh' | 'Rajasthan' | 'Punjab' | 'Uttarakhand';
type Region = 'Delhi NCR' | 'North India';
type Severity = 'High' | 'Medium' | 'Watch';
type Freshness = 'Fresh' | 'Aging' | 'Stale';

export type District = {
  id: number;
  name: string;
  state: State;
  region: Region;
  potential: number;
  recorded: number;
  gap: number;
  priority: number;
  status: Severity;
  freshness: Freshness;
  signal: string;
  locality: string;
  households: number;
  scheme: string;
  verification: 'Verified' | 'Needs review' | 'Freshness warning';
  x: number;
  y: number;
};

export type Scheme = {
  id: string;
  name: string;
  category: string;
  short: string;
  tone: string;
  households: number;
  record: string;
  rule: string;
  description: string;
  beneficiaries: string;
  availability: string;
  occupation: string;
  benefit: string;
  officialSource: string;
  updated: string;
  active: boolean;
};

export type AdminOverview = {
  totalPotential: number;
  totalRecorded: number;
  totalGap: number;
  highPriorityCount: number;
  monitoredAreas: number;
  schemesTracked: number;
  verificationCases: number;
};

export type AdminSignal = {
  id: string;
  time: string;
  label: string;
  meta: string;
  tone: string;
};

export type VerificationCase = {
  id: string;
  location: string;
  scheme: string;
  score: number;
  confidence: string;
  status: string;
  signal: string;
};

export type AuditEvent = {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  object: string;
  previous: string;
  next: string;
};

export type HouseholdSummary = {
  id: string;
  householdRef: string;
  state: string;
  district: string;
  locality: string;
  headLabel: string;
  archetype: string;
  scenario: string;
  dataset: string;
  coverageCount: number;
  gapCount: number;
  overlapCount: number;
};

export type HouseholdListResponse = {
  dataset: string;
  items: HouseholdSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type HouseholdCoverage = {
  schemeId: string;
  schemeName: string;
  purpose: string;
  status: string;
  source: string;
};

export type HouseholdDetail = {
  dataset: string;
  household: {
    id: string;
    householdRef: string;
    state: string;
    district: string;
    locality: string;
    headLabel: string;
    archetype: string;
    scenario: string;
    dataset: string;
    createdAt: string;
    updatedAt: string;
    profile: Record<string, string> | null;
  };
  coverage: HouseholdCoverage[];
};

export type HouseholdGap = {
  schemeId: string;
  schemeName: string;
  purpose: string;
  category: string;
  tier: string;
  score: number;
  confidence: string;
  matches: string[];
  missing: string[];
  notMatched: string[];
  potentialBenefit: string;
  nextStep: string;
  signalText: string;
};

export type HouseholdGapResponse = {
  dataset: string;
  evaluatedTotal: number;
  gaps: HouseholdGap[];
};

export type HouseholdOverlap = {
  existingSchemeId: string;
  existingSchemeName: string;
  potentialSchemeId: string;
  potentialSchemeName: string;
  purpose: string;
  relationship: 'both currently covered' | 'profile suggests eligibility';
  reason: string;
  priorityScore: number;
  status: string;
  verification: string;
};

export type HouseholdOverlapResponse = {
  dataset: string;
  evaluatedTotal: number;
  overlaps: HouseholdOverlap[];
};

type ResourceState<T> = { data: T; loading: boolean; error: string | null };

function useApiResource<T>(url: string, withCredentials = false): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({
    data: [] as unknown as T,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));
    axios
      .get<T>(url, { withCredentials })
      .then((res) => {
        if (!cancelled) setState({ data: res.data, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) setState((current) => ({ ...current, loading: false, error: 'Unable to load data.' }));
      });
    return () => {
      cancelled = true;
    };
  }, [url, withCredentials]);

  return state;
}

export function useDistricts() {
  const { data, loading, error } = useApiResource<District[]>('/api/districts');
  return { districts: data, loading, error };
}

export function useSchemes() {
  const { data, loading, error } = useApiResource<Scheme[]>('/api/schemes');
  return { schemes: data, loading, error };
}

export function useAdminOverview() {
  const { data, loading, error } = useApiResource<AdminOverview>('/api/admin/overview', true);
  return { overview: data, loading, error };
}

export function useAdminSignals() {
  const { data, loading, error } = useApiResource<AdminSignal[]>('/api/admin/signals/latest', true);
  return { signals: data, loading, error };
}

export function useVerificationCases() {
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get<VerificationCase[]>('/api/admin/verification-cases', { withCredentials: true })
      .then((res) => {
        if (!cancelled) setCases(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load verification cases.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const verify = async (id: string) => {
    const res = await axios.post<VerificationCase>(
      `/api/admin/verification-cases/${encodeURIComponent(id)}/verify`,
      {},
      { withCredentials: true },
    );
    setCases((current) => current.map((item) => (item.id === id ? res.data : item)));
  };

  const reject = async (id: string) => {
    const res = await axios.post<VerificationCase>(
      `/api/admin/verification-cases/${encodeURIComponent(id)}/reject`,
      {},
      { withCredentials: true },
    );
    setCases((current) => current.map((item) => (item.id === id ? res.data : item)));
  };

  return { cases, loading, error, verify, reject };
}

export function useAuditTrail() {
  const { data, loading, error } = useApiResource<AuditEvent[]>('/api/admin/audit-trail', true);
  return { events: data, loading, error };
}

export type HouseholdFilters = {
  search: string;
  state: string;
  district: string;
  archetype: string;
  scenario: string;
  page: number;
  limit: number;
};

export function useHouseholds(filters: HouseholdFilters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.state && filters.state !== 'All states') params.set('state', filters.state);
  if (filters.district && filters.district !== 'All districts') params.set('district', filters.district);
  if (filters.archetype && filters.archetype !== 'All archetypes') params.set('archetype', filters.archetype);
  if (filters.scenario && filters.scenario !== 'All scenarios') params.set('scenario', filters.scenario);
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));
  const query = params.toString();
  const { data, loading, error } = useApiResource<HouseholdListResponse>(
    `/api/admin/households${query ? `?${query}` : ''}`,
    true,
  );
  return { response: data, loading, error };
}

export function useHousehold(id: string | undefined) {
  const { data, loading, error } = useApiResource<HouseholdDetail>(
    id ? `/api/admin/households/${encodeURIComponent(id)}` : '',
    true,
  );
  return { detail: data, loading, error };
}

export function useHouseholdGaps(id: string | undefined) {
  const { data, loading, error } = useApiResource<HouseholdGapResponse>(
    id ? `/api/admin/households/${encodeURIComponent(id)}/gaps` : '',
    true,
  );
  return { gaps: data, loading, error };
}

export function useHouseholdOverlaps(id: string | undefined) {
  const { data, loading, error } = useApiResource<HouseholdOverlapResponse>(
    id ? `/api/admin/households/${encodeURIComponent(id)}/overlaps` : '',
    true,
  );
  return { overlaps: data, loading, error };
}

export function useCreateHouseholdVerificationCase() {
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<VerificationCase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = async (id: string, kind: 'gap' | 'overlap', schemeId: string, linkedSchemeId?: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await axios.post<VerificationCase>(
        `/api/admin/households/${encodeURIComponent(id)}/verification-cases`,
        { kind, schemeId, linkedSchemeId: linkedSchemeId ?? null },
        { withCredentials: true },
      );
      setCreated(res.data);
      return res.data;
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'Unable to create verification case.';
      setError(message);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCreated(null);
    setError(null);
  };

  return { busy, created, error, create, reset };
}
