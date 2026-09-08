import { Link } from 'wouter';
import { Wordmark, Pill, PrimaryButton, toneStyles } from '../lib/ui';
import { CitizenShell, useCitizenProfile, useCitizenSavedSchemes, useCitizenRecommendations } from '../components/Citizen';
import { citizenSchemes } from '../lib/citizen';
import { buildOverlaps, documentReadiness, docStatusLabelKey, docStatusTone, purposeLabelKey } from '../lib/citizenAnalysis';
import { format, useLanguage } from '../lib/i18n';
import { ArrowRight, BookOpen, Info } from 'lucide-react';

export function CitizenSaved() {
  const { t, tv } = useLanguage();
  const { saved, loading, remove } = useCitizenSavedSchemes();
  const { profile, loading: profileLoading } = useCitizenProfile();
  const { recommendations, loading: recLoading } = useCitizenRecommendations(profile, !profileLoading);
  const list = citizenSchemes.filter((scheme) => saved.includes(scheme.id));
  const recMap = new Map(recommendations.map((r) => [r.id, r]));
  const savedRecs = recommendations.filter((r) => saved.includes(r.id));
  const overlaps = buildOverlaps(savedRecs);

  if (loading) return <CitizenShell><div className="mx-auto max-w-5xl px-6 py-12 md:py-20"><div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">{t('citizen.savedLoading')}</div></div></CitizenShell>;

  return (
    <CitizenShell>
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <Wordmark tone="sage">{t('citizen.shortlist')}</Wordmark>
        <h1 className="mt-4 font-display text-5xl tracking-[-0.05em] md:text-7xl">{t('citizen.savedTitle')}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{t('citizen.savedIntro')}</p>

        {!profileLoading && !recLoading && overlaps.length > 0 && (
          <div className="mt-8 rounded-[1.4rem] border border-brand-indigo/30 bg-indigo text-indigo-fg p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <Info size={16} className="mt-0.5 shrink-0 text-indigo-fg" />
              <div className="min-w-0 flex-1">
                <strong className="font-medium text-foreground">{t('citizen.overlapTitle')}.</strong>{' '}
                {format(t('citizen.overlapMessage'), { purpose: t(purposeLabelKey(overlaps[0].purpose)) })}
                <div className="mt-2 flex flex-wrap gap-2">
                  {overlaps.map((group) => (
                    <span key={group.schemeIds.join('-')} className="flex flex-wrap items-center gap-1.5">
                      {group.schemeIds.map((id, i) => (
                        <span key={id} className="flex items-center gap-1.5">
                          {i > 0 && <span className="opacity-70">+</span>}
                          <Link href={`/citizen/scheme/${id}`} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
                            {recMap.get(id)?.name ?? citizenSchemes.find((s) => s.id === id)?.name ?? id}
                          </Link>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
                <Link href="/citizen/compare" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-background transition hover:bg-primary">
                  {t('citizen.reviewSchemes')} <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {list.length ? (
          <div className="mt-10 grid gap-4">
            {list.map((scheme) => {
              const rec = recMap.get(scheme.id);
              const readiness = rec ? documentReadiness(rec.documents ?? [], profile) : null;
              return (
                <div key={scheme.id} className="flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-center">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${toneStyles[scheme.tone]}`}><BookOpen size={16} /></div>
                  <div className="flex-1">
                    <Link href={`/citizen/scheme/${scheme.id}`} className="font-display text-2xl [overflow-wrap:anywhere] hover:text-brand-terracotta">{scheme.name}</Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{tv(scheme.category)}</span>
                      <span className="opacity-70">{t(purposeLabelKey(scheme.purpose))}</span>
                      {!profileLoading && !recLoading && rec && (
                        <>
                          <Pill tone="sage">{Math.round(rec.score)}% {t('citizen.savedMatch')}</Pill>
                          {readiness && readiness.total > 0 && (
                            <Pill tone={docStatusTone(readiness.status)}>{t(docStatusLabelKey(readiness.status))}</Pill>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={() => remove(scheme.id)} className="rounded-full border border-border px-3 py-2 text-xs transition hover:bg-secondary">{t('citizen.remove')}</button>
                </div>
              );
            })}
            <div className="mt-3">
              <Link href="/citizen/compare" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background">{t('citizen.compareSaved')} <ArrowRight size={14} /></Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-[1.4rem] border border-dashed border-border bg-secondary/60 p-10 text-center">
            <div className="font-display text-3xl">{t('citizen.savedEmptyTitle')}</div>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{t('citizen.savedEmptyBody')}</p>
            <div className="mt-6"><PrimaryButton href="/citizen/results">{t('citizen.seeRecommendations')}</PrimaryButton></div>
          </div>
        )}
      </div>
    </CitizenShell>
  );
}