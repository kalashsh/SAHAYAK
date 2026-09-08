import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Home, SlidersHorizontal, Users } from 'lucide-react';
import { SectionLabel, Wordmark, Pill } from '../lib/ui';
import { useHouseholds } from '../lib/api';
import { indiaStates } from '../lib/citizen';

export const ARCHE_TYPE_LABELS: Record<string, string> = {
  farmer: 'Farmer',
  'agricultural-worker': 'Agricultural worker',
  student: 'Student',
  salaried: 'Salaried employee',
  'government-employee': 'Government employee',
  business: 'Business owner',
  'street-vendor': 'Street vendor',
  'daily-wage': 'Daily wage worker',
  unemployed: 'Unemployed / seeking work',
  homemaker: 'Homemaker',
  senior: 'Senior citizen',
  disability: 'Person with disability',
  widow: 'Widow',
};

export const ARCHE_TYPES = Object.keys(ARCHE_TYPE_LABELS);

const states = indiaStates.map((item) => item.name);
const districtsFor = (state: string) => {
  const found = indiaStates.find((item) => item.name === state);
  if (found) return found.districts.map((item) => item.name);
  return Array.from(new Set(indiaStates.flatMap((item) => item.districts.map((district) => district.name))));
};

const SCENARIOS = ['All scenarios', 'synthetic'];

const emptyFilters = { search: '', state: 'All states', district: 'All districts', archetype: 'All archetypes', scenario: 'All scenarios', page: 1, limit: 25 };

export function HouseholdsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const { response, loading, error } = useHouseholds(filters);
  const items = response?.items ?? [];
  const pagination = response?.pagination;

  const setFilter = (key: keyof typeof filters, value: string | number) => {
    setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? Number(value) : 1 }));
  };

  const districtOptions = districtsFor(filters.state);

  if (loading && items.length === 0) {
    return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-muted-foreground">Loading households…</div>;
  }
  if (error) {
    return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-terracotta-fg">{error}</div>;
  }

  return (
    <>
      <SectionLabel
        kicker="Household intelligence · synthetic"
        title="Welfare coverage, one household at a time."
        description="Every synthetic household is evaluated against all 40 tracked schemes to surface potential gaps and overlapping coverage for a responsible follow-up."
      />
      <div className="mb-6 flex items-center justify-between gap-4 rounded-[1.2rem] border border-border bg-secondary/70 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-sage text-primary"><Users size={16} /></div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Dataset</div>
            <div className="text-sm font-medium">{response?.dataset ?? 'Synthetic · Prototype Data'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="hidden sm:inline">{pagination ? `${pagination.total} households` : '—'}</span>
          <span className="hidden rounded-full bg-sage px-2.5 py-1 text-sage-fg md:inline">40 schemes evaluated</span>
        </div>
      </div>

      <div className="mb-6 rounded-[1.2rem] border border-border bg-secondary/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-primary" /><span className="font-mono text-[10px] uppercase tracking-[0.14em]">Filters · {items.length} households shown</span></div>
          <button onClick={() => setFilters(emptyFilters)} className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-indigo">Reset</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            aria-label="Search household"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
            placeholder="Search HH code, head label, locality…"
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs outline-none placeholder:text-muted-foreground"
          />
          <select aria-label="State" value={filters.state} onChange={(event) => setFilter('state', event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
            <option>All states</option>
            {states.map((state) => <option key={state}>{state}</option>)}
          </select>
          <select aria-label="District" value={filters.district} onChange={(event) => setFilter('district', event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
            <option>All districts</option>
            {districtOptions.map((district) => <option key={district}>{district}</option>)}
          </select>
          <select aria-label="Archetype" value={filters.archetype} onChange={(event) => setFilter('archetype', event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
            <option>All archetypes</option>
            {ARCHE_TYPES.map((key) => <option key={key} value={key}>{ARCHE_TYPE_LABELS[key]}</option>)}
          </select>
          <select aria-label="Scenario" value={filters.scenario} onChange={(event) => setFilter('scenario', event.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-xs">
            {SCENARIOS.map((scenario) => <option key={scenario}>{scenario}</option>)}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="grid min-h-[30vh] place-items-center border-y border-border text-sm text-muted-foreground">No households match the current filters.</div>
      ) : (
        <div className="border-y border-border">
          {items.map((item) => (
            <Link key={item.id} href={`/households/${item.id}`} className="group flex w-full items-center gap-4 border-b border-border p-5 text-left transition last:border-0 hover:bg-secondary/55">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta text-brand-terracotta"><Home size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-terracotta">{item.householdRef}</span>
                  <Pill tone="indigo">{ARCHE_TYPE_LABELS[item.archetype] ?? item.archetype}</Pill>
                  <span className="text-xs text-muted-foreground">Synthetic</span>
                </div>
                <div className="mt-1 font-display text-2xl tracking-[-0.02em]">{item.headLabel}</div>
                <div className="mt-1 truncate text-xs text-muted-foreground">{item.locality}, {item.district}, {item.state}</div>
              </div>
              <div className="hidden items-center gap-5 md:flex">
                <Metric label="Coverage" value={item.coverageCount} tone="sage" />
                <Metric label="Potential gaps" value={item.gapCount} tone="terracotta" />
                <Metric label="Overlaps" value={item.overlapCount} tone="saffron" />
              </div>
              <ChevronRight size={16} className="text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} households
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilter('page', pagination.page - 1)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition hover:border-primary disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilter('page', pagination.page + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition hover:border-primary disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center gap-2 border-t border-border pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <Wordmark tone="indigo">Prototype</Wordmark>
        <span>Household profiles, coverage and gap signals are synthetic demonstration data — never real beneficiary or personal records.</span>
      </div>
    </>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'sage' | 'terracotta' | 'saffron' }) {
  return (
    <div className="border-l border-border pl-4">
      <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl ${tone === 'sage' ? 'text-primary' : tone === 'terracotta' ? 'text-brand-terracotta' : 'text-brand-saffron'}`}>{value}</div>
    </div>
  );
}