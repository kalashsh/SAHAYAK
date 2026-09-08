import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Wordmark, Pill, type Tone } from '../lib/ui';
import { CitizenShell, useCitizenProfile, useCitizenRecommendations, useCitizenSavedSchemes } from '../components/Citizen';
import { CitizenSchemeCard, CitizenExplain } from '../components/CitizenCards';
import { citizenSchemes, WELFARE_PURPOSES, type CoverageStatus, type Recommendation, type WelfarePurpose } from '../lib/citizen';
import { buildCoverage, buildGaps, buildOverlaps, documentReadiness, improvementFields, purposeLabelKey, schemeCounts } from '../lib/citizenAnalysis';
import { format, useLanguage, type TranslationKey } from '../lib/i18n';
import { AlertTriangle, ArrowRight, Check, CircleHelp, Home, Sparkles } from 'lucide-react';

const coverageTone: Record<string, Tone> = {
  Covered: 'sage',
  'Potential opportunity': 'saffron',
  'Potential gap': 'terracotta',
  'Needs more information': 'indigo',
};

type FilterKey = 'all' | 'high' | 'opportunity' | 'verify';
type SortKey = 'relevance' | 'category' | 'name';

const filterOptions: { key: FilterKey; labelKey: TranslationKey }[] = [
  { key: 'all', labelKey: 'citizen.filterAll' },
  { key: 'high', labelKey: 'citizen.filterHigh' },
  { key: 'opportunity', labelKey: 'citizen.filterOpportunity' },
  { key: 'verify', labelKey: 'citizen.filterVerify' },
];

const sortOptions: { key: SortKey; labelKey: TranslationKey }[] = [
  { key: 'relevance', labelKey: 'citizen.sortRelevance' },
  { key: 'category', labelKey: 'citizen.sortCategory' },
  { key: 'name', labelKey: 'citizen.sortName' },
];

export function CitizenResults() {
  const { t, tv } = useLanguage();
  const [explain, setExplain] = useState<Recommendation | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [category, setCategory] = useState<'all' | WelfarePurpose>('all');
  const [sort, setSort] = useState<SortKey>('relevance');
  const schemesRef = useRef<HTMLDivElement | null>(null);

  const [location] = useLocation();
  const search = location.split('?')[1] ?? '';

  const { profile, loading: profileLoading } = useCitizenProfile();
  const { recommendations, loading: recLoading, error: recError, reload } = useCitizenRecommendations(profile, !profileLoading);
  const { saved, toggleSave, loading: savedLoading } = useCitizenSavedSchemes();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const c = params.get('c');
    if (c && (WELFARE_PURPOSES as readonly string[]).includes(c)) {
      setCategory(c as WelfarePurpose);
      setFilter('all');
      window.setTimeout(() => schemesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }, [search]);

  const analysis = useMemo(() => {
    const coverage = buildCoverage(recommendations, profile);
    const gaps = buildGaps(coverage, recommendations, profile);
    const overlap = buildOverlaps(recommendations);
    const counts = schemeCounts(recommendations);
    return { coverage, gaps, overlap, counts };
  }, [recommendations, profile]);

  const improvements = useMemo(() => improvementFields(profile, recommendations), [profile, recommendations]);
  const couldImprove = improvements.filter((item) => !item.complete && item.helpful);

  const shown = useMemo(() => {
    let list = recommendations;
    if (filter === 'high') list = list.filter((r) => r.tier === 'High relevance' || r.tier === 'Relevant');
    else if (filter === 'opportunity') list = list.filter((r) => r.tier === 'May be relevant');
    else if (filter === 'verify') list = list.filter((r) => r.confidence === 'Needs verification');
    if (category !== 'all') list = list.filter((r) => r.purpose === category);
    const sorted = [...list];
    if (sort === 'relevance') sorted.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    else if (sort === 'category') sorted.sort((a, b) => WELFARE_PURPOSES.indexOf(a.purpose) - WELFARE_PURPOSES.indexOf(b.purpose) || b.score - a.score);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [recommendations, filter, category, sort]);

  if (profileLoading || savedLoading)
    return <CitizenShell><div className="mx-auto max-w-6xl px-6 py-12 md:py-20"><div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">{t('citizen.loading')}</div></div></CitizenShell>;

  if (recError)
    return (
      <CitizenShell>
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
          <div className="mx-auto mt-10 grid min-h-[40vh] max-w-lg place-items-center rounded-[1.5rem] border border-border bg-card p-8 text-center">
            <div>
              <CircleHelp size={24} className="mx-auto text-primary" />
              <div className="mt-4 font-display text-3xl tracking-[-0.04em]">{t('citizen.loadError')}</div>
              <button onClick={reload} className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.retry')}</button>
            </div>
          </div>
        </div>
      </CitizenShell>
    );

  if (recLoading)
    return <CitizenShell><div className="mx-auto max-w-6xl px-6 py-12 md:py-20"><div className="grid min-h-[40vh] place-items-center"><div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="h-2 w-2 animate-pulse rounded-full bg-primary" />{t('citizen.loading')}</div></div></div></CitizenShell>;

  if (recommendations.length === 0)
    return (
      <CitizenShell>
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
          <div className="mx-auto mt-10 grid min-h-[40vh] max-w-lg place-items-center rounded-[1.5rem] border border-border bg-card p-8 text-center">
            <div>
              <Sparkles size={24} className="mx-auto text-primary" />
              <div className="mt-4 font-display text-3xl tracking-[-0.04em]">{t('citizen.emptyRecommendations')}</div>
              <Link href="/citizen/profile/edit" className="mt-6 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.completeProfile')}</Link>
            </div>
          </div>
        </div>
      </CitizenShell>
    );

  const { coverage, gaps, overlap, counts } = analysis;
  const savedOverlap = buildOverlaps(recommendations.filter((r) => saved.includes(r.id)));
  const baseCompleted = ['citizen.fieldLocation', 'citizen.fieldAge', 'citizen.fieldOccupation'] as TranslationKey[];

  const coverageMeta = (status: CoverageStatus) => {
    switch (status) {
      case 'Covered':
        return { copyKey: 'citizen.covCovered' as TranslationKey, ctaKey: 'citizen.viewSchemes' as TranslationKey };
      case 'Potential opportunity':
        return { copyKey: 'citizen.covOpportunity' as TranslationKey, ctaKey: 'citizen.viewOpportunities' as TranslationKey };
      case 'Potential gap':
        return { copyKey: 'citizen.covGap' as TranslationKey, ctaKey: 'citizen.exploreSupport' as TranslationKey };
      default:
        return { copyKey: 'citizen.covMoreInfo' as TranslationKey, ctaKey: 'citizen.completeProfile' as TranslationKey };
    }
  };
  const coverageHref = (item: (typeof coverage)[number]) =>
    item.status === 'Covered' && item.schemeIds.length > 0
      ? `/citizen/scheme/${item.schemeIds[0]}`
      : item.status === 'Needs more information'
        ? '/citizen/profile/edit'
        : `/citizen/results?c=${encodeURIComponent(item.purpose)}`;

  return (
    <CitizenShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <Wordmark tone="terracotta">{t('citizen.welfareRadar')}</Wordmark>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-[-0.05em] md:text-7xl">{t('citizen.schemesForYou')}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              {format(t('citizen.resultsIntro'), { locality: profile.locality, district: profile.district })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="sage">{format(t('citizen.possibleMatches'), { count: recommendations.length })}</Pill>
            <Link href="/citizen/profile/edit" className="rounded-full border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]">{t('citizen.updateProfile')}</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.2rem] border border-border bg-card p-5">
            <div className="font-display text-4xl tracking-[-0.04em]">{counts.high}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{t('citizen.filterHigh')}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('citizen.strongMatch')}</div>
          </div>
          <div className="rounded-[1.2rem] border border-border bg-card p-5">
            <div className="font-display text-4xl tracking-[-0.04em]">{counts.potential}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{t('citizen.filterOpportunity')}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('citizen.mayFitVerify')}</div>
          </div>
          <div className="rounded-[1.2rem] border border-border bg-card p-5">
            <div className="font-display text-4xl tracking-[-0.04em]">{counts.moreInfo}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{t('citizen.filterVerify')}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('citizen.moreDetailsHelp')}</div>
          </div>
          <div className="rounded-[1.2rem] border border-border bg-card p-5">
            <div className="font-display text-4xl tracking-[-0.04em]">{gaps.length}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{t('citizen.radarGaps')}</div>
            <div className="mt-1 text-xs text-muted-foreground">{t('citizen.radarGapsDetail')}</div>
          </div>
        </div>

        {couldImprove.length > 0 && (
          <div className="mt-8 flex flex-col gap-5 rounded-[1.4rem] border border-brand-indigo/25 bg-indigo p-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <Wordmark tone="indigo">{t('citizen.improveTitle')}</Wordmark>
              <p className="mt-3 text-sm leading-6 text-indigo-fg">{t('citizen.improveIntro')}</p>
              <ul className="mt-3 grid gap-x-5 gap-y-1.5 text-sm text-indigo-fg sm:grid-cols-2">
                {baseCompleted.map((key) => (
                  <li key={key} className="flex items-center gap-2"><CheckIcon /> <span>{t(key)}</span></li>
                ))}
                {couldImprove.map((item) => (
                  <li key={item.key} className="flex items-start gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-indigo-fg" /><span>{t(item.labelKey)} <span className="block text-xs opacity-70">— {t(item.reasonKey)}</span></span></li>
                ))}
              </ul>
            </div>
            <Link href="/citizen/profile/edit" className="shrink-0 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.completeProfile')}</Link>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.noteNotFinal')}</div>
          <div className="flex gap-2">
            <Link href="/citizen/saved" className="rounded-full border border-border px-3 py-2 text-xs font-medium">{t('citizen.saved')} ({saved.length})</Link>
            <Link href="/citizen/compare" className="rounded-full border border-border px-3 py-2 text-xs font-medium">{t('citizen.compare')}</Link>
          </div>
        </div>

        {(gaps.length > 0 || savedOverlap.length > 0) && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {gaps.length > 0 && (
              <div className="rounded-[1.4rem] border border-border bg-secondary/50 p-6">
                <Wordmark tone="terracotta">{t('citizen.whatMissing')}</Wordmark>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {t('citizen.potentialGapsNote')}
                </p>
                <div className="mt-4 space-y-3">
                  {gaps.slice(0, 4).map((gap) => (
                    <div key={gap.purpose} className="flex flex-col gap-3 rounded-xl bg-card p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-saffron text-saffron-fg"><AlertTriangle size={14} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">{t(purposeLabelKey(gap.purpose))}</div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-saffron" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{t('citizen.gapDetected')}: {t(gap.traitKey)}</span>
                          </div>
                          <div className="mt-1 text-xs leading-5 text-muted-foreground">{t(gap.whyKey)}</div>
                        </div>
                      </div>
                      <div className="ml-11 flex flex-col items-start gap-2">
                        <div className="text-xs font-medium text-foreground">
                          {gap.count === 1 ? t('citizen.gapSchemeCountOne') : format(t('citizen.gapSchemeCountMany'), { count: gap.count })}.
                        </div>
                        <Link href={`/citizen/results?c=${encodeURIComponent(gap.purpose)}`} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:bg-primary">
                          {t('citizen.exploreSupport')} <ArrowRight size={12} />
                        </Link>
                        <span className="text-[11px] leading-5 text-muted-foreground">{t('citizen.gapNext')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/citizen/profile/edit" className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-secondary">
                  {t('citizen.completeProfile')} <ArrowRight size={12} />
                </Link>
              </div>
            )}
            {savedOverlap.length > 0 && (
              <div className="rounded-[1.4rem] border border-border bg-secondary/50 p-6">
                <Wordmark tone="indigo">{t('citizen.overlapTitle')}</Wordmark>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {format(t('citizen.overlapMessage'), { purpose: t(purposeLabelKey(savedOverlap[0].purpose)) })}
                </p>
                <div className="mt-4 space-y-2">
                  {savedOverlap.map((group) => (
                    <div key={group.schemeIds.join('-')} className="flex flex-wrap items-center gap-2 text-sm">
                      {group.schemeIds.map((id, i) => {
                        const scheme = recommendations.find((r) => r.id === id) ?? citizenSchemes.find((s) => s.id === id);
                        if (!scheme) return null;
                        return (
                          <span key={id} className="flex items-center gap-2">
                            {i > 0 && <span className="text-muted-foreground">+</span>}
                            <Link href={`/citizen/scheme/${id}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">{scheme.name}</Link>
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <Link href="/citizen/compare" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-background transition hover:bg-primary">
                  {t('citizen.reviewSchemes')} <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          <Wordmark tone="sage">{t('citizen.coverageTitle')}</Wordmark>
          <h2 className="mt-3 font-display text-4xl tracking-[-0.04em]">{t('citizen.coverageHeading')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {t('citizen.coverageNote')}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coverage.map((item) => {
              const meta = coverageMeta(item.status);
              const label = t(purposeLabelKey(item.purpose));
              return (
                <div key={item.purpose} className="flex flex-col rounded-[1.2rem] border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Home size={14} className="text-muted-foreground" />
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
                    </div>
                    <Pill tone={coverageTone[item.status] ?? 'sage'}>{tv(item.status)}</Pill>
                  </div>
                  <p className="mt-3 flex-1 text-xs leading-5 text-muted-foreground">{format(t(meta.copyKey), { purpose: label.toLowerCase() })}</p>
                  <Link href={coverageHref(item)} className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-secondary">
                    {t(meta.ctaKey)} <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14" ref={schemesRef}>
          <Wordmark tone="indigo">{t('citizen.potentialMatches')}</Wordmark>
          <h2 className="mt-3 font-display text-4xl tracking-[-0.04em]">{t('citizen.rankedTitle')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {t('citizen.rankedNote')}
          </p>
        </div>

        <div className="mt-6 rounded-[1.4rem] border border-border bg-secondary/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                aria-pressed={filter === option.key}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${filter === option.key ? 'border-primary bg-foreground text-background' : 'border-border hover:bg-secondary'}`}
              >
                {t(option.labelKey)}
              </button>
            ))}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as 'all' | WelfarePurpose)}
              aria-label={t('citizen.category')}
              className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none transition focus:border-primary"
            >
              <option value="all">{t('citizen.category')}: {t('citizen.filterAll')}</option>
              {WELFARE_PURPOSES.map((p) => (
                <option key={p} value={p}>{t(purposeLabelKey(p))}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              aria-label={t('citizen.sortBy')}
              className="h-8 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none transition focus:border-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>{t(option.labelKey)}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">{format(t('citizen.showing'), { shown: shown.length, total: recommendations.length })}</div>
        </div>

        {shown.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {shown.map((scheme) => (
              <CitizenSchemeCard key={scheme.id} scheme={scheme} profile={profile} saved={saved.includes(scheme.id)} onSave={() => toggleSave(scheme.id)} onExplain={() => setExplain(scheme)} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.4rem] border border-dashed border-border bg-secondary/60 p-10 text-center">
            <div className="font-display text-3xl">{t('citizen.emptyResults')}</div>
            <button onClick={() => { setFilter('all'); setCategory('all'); }} className="mt-5 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary">{t('citizen.clearFilters')}</button>
          </div>
        )}

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-border bg-secondary/60 p-5 text-sm leading-6 text-muted-foreground">
          <CircleHelp size={16} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <strong className="font-medium text-foreground">{t('citizen.whyNoteTitle')}</strong> {t('citizen.whyNoteBody')}
          </div>
        </div>
      </div>
      {explain && <CitizenExplain scheme={explain} onClose={() => setExplain(null)} />}
    </CitizenShell>
  );
}

function CheckIcon() {
  return <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage text-primary"><Check size={12} /></span>;
}