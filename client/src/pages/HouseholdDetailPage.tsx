import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, CheckCircle2, CircleHelp, ClipboardList, ExternalLink, Home, ScrollText, ShieldCheck } from 'lucide-react';
import { SectionLabel, Wordmark, Pill, type Tone } from '../lib/ui';
import { useCreateHouseholdVerificationCase, useHousehold, useHouseholdGaps, useHouseholdOverlaps } from '../lib/api';
import { ARCHE_TYPE_LABELS } from './HouseholdsPage';

const tierTone: Record<string, Tone> = {
  'High relevance': 'terracotta',
  Relevant: 'saffron',
  'May be relevant': 'indigo',
  'Low relevance': 'lavender',
  'Needs more information': 'sage',
};

const purposeTone: Record<string, Tone> = {
  Agriculture: 'terracotta',
  Housing: 'lavender',
  Livelihood: 'saffron',
  Education: 'indigo',
  Healthcare: 'sage',
  Pension: 'indigo',
  'Food security': 'saffron',
  'Women & Child': 'terracotta',
  Disability: 'lavender',
  'Financial inclusion': 'sage',
};

export function HouseholdDetailPage() {
  const [, params] = useRoute('/households/:id');
  const id = params?.id;
  const { detail, loading, error } = useHousehold(id);
  const { gaps, loading: gapsLoading, error: gapsError } = useHouseholdGaps(id);
  const { overlaps, loading: overlapsLoading, error: overlapsError } = useHouseholdOverlaps(id);
  const create = useCreateHouseholdVerificationCase();
  const [requested, setRequested] = useState<Record<string, string>>({});
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const pairKeyOf = (existingId: string, potentialId: string) => `${existingId}::${potentialId}`;

  if (!id) {
    return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-muted-foreground">No household selected.</div>;
  }
  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-muted-foreground">Loading household…</div>;
  }
  const household = detail?.household;
  if (error || !household) {
    return <div className="grid min-h-[50vh] place-items-center bg-background text-sm text-terracotta-fg">{error ?? 'Household not found.'}</div>;
  }

  const gapsList = gaps?.gaps ?? [];
  const overlapsList = overlaps?.overlaps ?? [];
  const evaluated = gaps?.evaluatedTotal ?? overlaps?.evaluatedTotal ?? 40;

  const requestGap = async (schemeId: string) => {
    const result = await create.create(id, 'gap', schemeId);
    if (result) {
      setRequested((prev) => ({ ...prev, [schemeId]: result.id }));
      setRequestErrors((prev) => ({ ...prev, [schemeId]: '' }));
    } else {
      setRequestErrors((prev) => ({ ...prev, [schemeId]: create.error ?? 'Unable to create verification case.' }));
    }
  };
  const requestOverlap = async (existingId: string, potentialId: string) => {
    const pairKey = pairKeyOf(existingId, potentialId);
    const result = await create.create(id, 'overlap', existingId, potentialId);
    if (result) {
      setRequested((prev) => ({ ...prev, [pairKey]: result.id }));
      setRequestErrors((prev) => ({ ...prev, [pairKey]: '' }));
    } else {
      setRequestErrors((prev) => ({ ...prev, [pairKey]: create.error ?? 'Unable to create verification case.' }));
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/households" className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={13} /> Households
        </Link>
        <SectionLabel
          kicker="Household intelligence · synthetic"
          title={`${household.householdRef} — ${household.headLabel}`}
          description={`${household.locality}, ${household.district}, ${household.state}. Welfare analysis is derived from the same recommendation engine used on the citizen portal.`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="indigo">{ARCHE_TYPE_LABELS[household.archetype] ?? household.archetype}</Pill>
          <Pill tone="sage"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {household.dataset}</Pill>
          <Pill tone="lavender">{household.scenario}</Pill>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Profile v{household.profile ? 'complete' : 'unavailable'}</span>
        </div>
      </div>

      <div className="mb-10 grid gap-6 border-y border-border py-7 md:grid-cols-4">
        <Estimate value={String(detail.coverage.length)} label="Recorded coverage" detail="current synthetic coverage" tone="sage" />
        <Estimate value={String(gapsList.length)} label="Potential gaps" detail={`across ${evaluated} schemes`} tone="terracotta" />
        <Estimate value={String(overlapsList.length)} label="Potential overlaps" detail="requires verification" tone="saffron" />
        <Estimate value={evaluated >= 40 ? String(evaluated) : '40'} label="Schemes evaluated" detail="full catalogue" tone="indigo" />
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <Wordmark tone="sage">Current coverage</Wordmark>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Synthetic records</span>
          </div>
          {detail.coverage.length === 0 ? (
            <div className="border-y border-border py-8 text-center">
              <div className="font-display text-2xl text-foreground">No recorded coverage</div>
              <p className="mt-2 text-sm text-muted-foreground">This synthetic household has no current scheme records.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {detail.coverage.map((item) => (
                <div key={item.schemeId} className="flex items-center gap-4 border-b border-border py-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-primary"><ShieldCheck size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.schemeName}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{item.schemeId} · {item.source}</div>
                  </div>
                  <Pill tone={purposeTone[item.purpose] ?? 'sage'}>{item.purpose}</Pill>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <Wordmark tone="terracotta">Potential welfare gaps</Wordmark>
            <Pill tone="indigo">{evaluated} schemes evaluated</Pill>
          </div>
          {gapsLoading ? (
            <div className="border-y border-border py-8 text-center text-sm text-muted-foreground">Evaluating all schemes…</div>
          ) : gapsError ? (
            <div className="border-y border-border py-8 text-center text-sm text-terracotta-fg">{gapsError}</div>
          ) : gapsList.length === 0 ? (
            <EmptyState title="No potential gaps surfaced" note="Every tracked scheme that the profile reasonably matches is already recorded as coverage, or sits below the relevance threshold." />
          ) : (
            <div className="space-y-3">
              {gapsList.map((gap) => (
                <div key={gap.schemeId} className="rounded-[1.2rem] border border-border bg-secondary/45 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-xl tracking-[-0.02em]">{gap.schemeName}</div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{gap.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={purposeTone[gap.purpose] ?? 'sage'}>{gap.purpose}</Pill>
                      <Pill tone={tierTone[gap.tier] ?? 'sage'}>{gap.tier}</Pill>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span>Match {gap.score}</span>
                    <span>·</span>
                    <span>{gap.confidence} confidence</span>
                  </div>
                  {gap.matches.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {gap.matches.slice(0, 3).map((match, index) => (
                        <li key={index} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-sage-fg" /><span>{match}</span></li>
                      ))}
                    </ul>
                  )}
                  {gap.missing.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em]">Needs verification · </span>{gap.missing[0]}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{gap.nextStep}</span>
                    <button
                      onClick={() => requestGap(gap.schemeId)}
                      disabled={create.busy || Boolean(requested[gap.schemeId])}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                        requested[gap.schemeId]
                          ? 'cursor-default border-sage bg-sage text-primary'
                          : 'border-brand-terracotta/40 text-brand-terracotta hover:bg-terracotta'
                      }`}
                    >
                      {requested[gap.schemeId] ? (
                        <>
                          <CheckCircle2 size={13} /> Verification requested · {requested[gap.schemeId]}
                        </>
                      ) : (
                        <>
                          <ClipboardList size={13} /> Request verification
                        </>
                      )}
                    </button>
                  </div>
                  {requestErrors[gap.schemeId] && (
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm text-terracotta-fg">
                      <CircleHelp size={14} className="shrink-0" />
                      {requestErrors[gap.schemeId]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <Wordmark tone="saffron">Potential overlapping coverage</Wordmark>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Only from the official overlap map</span>
        </div>
        {overlapsLoading ? (
          <div className="border-y border-border py-8 text-center text-sm text-muted-foreground">Checking recorded coverage…</div>
        ) : overlapsError ? (
          <div className="border-y border-border py-8 text-center text-sm text-terracotta-fg">{overlapsError}</div>
        ) : overlapsList.length === 0 ? (
          <EmptyState title="No overlapping coverage pairs surfaced" note="No pair of recorded or profile-eligible schemes in the overlap map overlaps for this household." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overlapsList.map((overlap) => (
              <div key={`${overlap.existingSchemeId}-${overlap.potentialSchemeId}`} className="flex flex-col rounded-[1.2rem] border border-border bg-secondary/45 p-5">
                <div className="flex items-center justify-between gap-2">
                  <Pill tone="saffron">{overlap.status}</Pill>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Match {overlap.priorityScore}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="min-w-0 truncate font-medium">{overlap.existingSchemeName}</span>
                  <span className="font-mono text-[10px] text-brand-saffron">↔</span>
                  <span className="min-w-0 truncate font-medium">{overlap.potentialSchemeName}</span>
                </div>
                <div className="mt-2"><Pill tone={purposeTone[overlap.purpose] ?? 'sage'}>{overlap.purpose}</Pill></div>
                <p className="mt-3 flex-1 text-xs leading-5 text-muted-foreground">{overlap.reason}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand-terracotta">{overlap.verification}</span>
                  <button
                    onClick={() => requestOverlap(overlap.existingSchemeId, overlap.potentialSchemeId)}
                    disabled={create.busy || Boolean(requested[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)])}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                      requested[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)]
                        ? 'cursor-default border-sage bg-sage text-primary'
                        : 'border-brand-saffron/40 text-brand-saffron hover:bg-saffron'
                    }`}
                  >
                    {requested[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)] ? (
                      <>
                        <CheckCircle2 size={13} /> Verification requested · {requested[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)]}
                      </>
                    ) : (
                      <>
                        <ClipboardList size={13} /> Request verification
                      </>
                    )}
                  </button>
                </div>
                {requestErrors[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)] && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm text-terracotta-fg">
                    <CircleHelp size={14} className="shrink-0" />
                    {requestErrors[pairKeyOf(overlap.existingSchemeId, overlap.potentialSchemeId)]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-border pt-6">
        <div className="mb-3 flex items-center gap-2"><Wordmark tone="indigo">Verification pipeline</Wordmark><CircleHelp size={14} className="text-muted-foreground" /></div>
        {create.error ? (
          <div className="border-y border-border py-5 text-sm text-terracotta-fg">{create.error}</div>
        ) : create.created ? (
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-sage text-primary"><CheckCircle2 size={16} /></div>
              <div>
                <div className="text-sm font-medium">Verification case created — {create.created.id}</div>
                <div className="text-xs text-muted-foreground">{create.created.scheme} · {create.created.status} · {create.created.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/verification" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">
                Open verification queue <ExternalLink size={13} />
              </Link>
              <button onClick={create.reset} className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground transition hover:text-foreground">Dismiss</button>
            </div>
          </div>
        ) : (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            A gap or overlap becomes an action only after an administrator asks for verification. The case lands in the
            Verification Queue marked <span className="font-medium text-foreground">Needs review</span>, is traceable back to
            this synthetic household, and every Verify / Reject decision is written to the Audit Trail.
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
          <Home size={12} /> {household.householdRef} · {household.locality}, {household.district}, {household.state} · <ScrollText size={12} /> {household.dataset}
        </div>
      </section>
    </>
  );
}

function Estimate({ value, label, detail, tone }: { value: string; label: string; detail: string; tone: Tone }) {
  const toneClass = tone === 'sage' ? 'text-primary' : tone === 'terracotta' ? 'text-brand-terracotta' : tone === 'saffron' ? 'text-brand-saffron' : 'text-brand-indigo';
  return (
    <div className="border-l border-border pl-5">
      <div className={`font-display text-4xl tracking-[-0.04em] ${toneClass}`}>{value}</div>
      <div className="mt-2 text-sm font-medium text-foreground">{label}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{detail}</div>
    </div>
  );
}

function EmptyState({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-[1.2rem] border border-border bg-secondary/45 p-8 text-left">
      <div className="font-display text-xl">{title}</div>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{note}</p>
      <div className="mt-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"><ShieldCheck size={13} /> Synthetic prototype analysis only</div>
    </div>
  );
}