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
