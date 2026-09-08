import { useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { Wordmark, Pill, type Tone } from '../lib/ui';
import { CitizenShell, useCitizenProfile, useCitizenRecommendations } from '../components/Citizen';
import { citizenSchemes, type ProfileFactor } from '../lib/citizen';
import { beforeYouApply, documentReadiness, docStatusLabelKey, docStatusTone, isDocumentConfirmed, nextActionSteps, relevanceHeadline } from '../lib/citizenAnalysis';
import { useLanguage, format, type TranslationKey } from '../lib/i18n';
import { ArrowLeft, Check, FileText, Info, Sparkles, TriangleAlert, X } from 'lucide-react';

const relevanceTone: Record<string, Tone> = {
  'High relevance': 'terracotta',
  Relevant: 'saffron',
  'May be relevant': 'indigo',
  'Low relevance': 'lavender',
  'Needs more information': 'sage',
};

function FactorLine({ item }: { item: ProfileFactor }) {
  const { tv, td } = useLanguage();
  if (item.status === 'matched')
    return <div className="flex gap-3 text-sm text-muted-foreground"><Check size={15} className="mt-0.5 shrink-0 text-primary" /><span><strong className="font-medium text-foreground">{tv(item.factor)}.</strong> {td(item.detail)}</span></div>;
  if (item.status === 'partial')
    return <div className="flex gap-3 text-sm text-muted-foreground"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-saffron text-[10px] text-saffron-fg">~</span><span><strong className="font-medium text-foreground">{tv(item.factor)}.</strong> {td(item.detail)}</span></div>;
  if (item.status === 'missing')
    return <div className="flex gap-3 text-sm text-muted-foreground"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-saffron" /><span>{td(item.detail)}</span></div>;
  return <div className="flex gap-3 text-sm text-muted-foreground"><X size={15} className="mt-0.5 shrink-0 text-muted-foreground" /><span><strong className="font-medium text-foreground">{tv(item.factor)}.</strong> {td(item.detail)}</span></div>;
}

export function CitizenSchemeDetail() {
  const { t, tv, td } = useLanguage();
  const [, params] = useRoute('/citizen/scheme/:id');
  const scheme = useMemo(
    () => (params?.id ? citizenSchemes.find((item) => item.id === params.id) : undefined),
    [params],
  );

  const { profile, loading: profileLoading } = useCitizenProfile();
  const { recommendations, loading: recLoading } = useCitizenRecommendations(profile, !profileLoading);
  const rec = useMemo(
    () => (scheme ? recommendations.find((r) => r.id === scheme.id) : undefined),
    [recommendations, scheme],
  );
  const loading = profileLoading || recLoading;

  if (!scheme) {
    return (
      <CitizenShell>
        <div className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-6 py-20 text-center">
          <div>
            <h1 className="font-display text-5xl tracking-[-0.05em] md:text-6xl">{t('citizen.notFoundTitle')}</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">{t('citizen.notFoundBody')}</p>
            <Link href="/citizen/results" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">
              <ArrowLeft size={14} /> {t('citizen.backToSchemes')}
            </Link>
          </div>
        </div>
      </CitizenShell>
    );
  }

  const relevance = rec?.relevance ?? scheme.relevance;
  const confidence = rec?.confidence;
  const score = rec?.score;
  const matchList = rec?.match?.filter((m) => m.status === 'matched' || m.status === 'partial') ?? [];
  const missingFactors = rec?.match?.filter((m) => m.status === 'missing') ?? [];
  const notMatched = rec?.notMatched ?? [];
  const missing = rec?.missing ?? [];
  const potentialBenefit = rec?.potentialBenefit ?? scheme.benefit;
  const nextStep = rec?.nextStep ?? scheme.next;
  const documents = rec?.documents ?? scheme.documents ?? [];
  const headline = rec ? relevanceHeadline(rec) : null;
  const actionSteps = rec ? nextActionSteps(rec) : [];
  const readiness = rec ? documentReadiness(documents, profile) : null;
  const checklist = rec ? beforeYouApply(rec, profile) : [];

  const overlapSchemeIds = rec?.overlap ?? [];
  const overlaps = overlapSchemeIds
    .map((oid) => citizenSchemes.find((s) => s.id === oid)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <CitizenShell>
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        <Link href="/citizen/results" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><ArrowLeft size={14} /> {t('citizen.backToSchemes')}</Link>

        <div className="mt-10 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={relevanceTone[relevance] ?? 'sage'}>{tv(relevance)}</Pill>
            {confidence && <Pill tone="sage">{tv(confidence)}</Pill>}
            {typeof score === 'number' && !loading && <Pill tone="indigo">{Math.round(score)}% {t('citizen.match')}</Pill>}
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-[-0.05em] [overflow-wrap:anywhere] md:text-7xl">{scheme.name}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">{tv(scheme.description)}</p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_0.75fr]">
          <div className="space-y-8">
            <div>
              <Wordmark tone="sage">{t('citizen.relevanceToYou')}</Wordmark>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {!loading
                  ? relevance === 'High relevance'
                    ? format(t('citizen.relevanceHigh'), { score: Math.round(score ?? 0) })
                    : relevance === 'Relevant'
                      ? format(t('citizen.relevanceRelevant'), { score: Math.round(score ?? 0) })
                      : relevance === 'May be relevant'
                        ? format(t('citizen.relevanceMaybe'), { score: Math.round(score ?? 0) })
                        : relevance === 'Needs more information'
                          ? t('citizen.relevanceMoreInfo')
                          : format(t('citizen.relevanceLow'), { score: Math.round(score ?? 0) })
                  : t('citizen.relevanceChecking')}
              </p>
              {!loading && headline && (
                <div className="mt-4 rounded-xl bg-secondary px-4 py-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">{t(headline.titleKey as TranslationKey)}</div>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t(headline.bodyKey as TranslationKey)}</p>
                  {notMatched.length > 0 && (
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      {t('citizen.notMatchedReason')} <span className="font-medium text-foreground">{td(notMatched[0].detail)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Wordmark tone="terracotta">{t('citizen.whyMatchedYou')}</Wordmark>
              {matchList.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {matchList.map((item) => <FactorLine key={item.factor} item={item} />)}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{t('citizen.noStrongFactors')}</p>
              )}
              {missingFactors.length > 0 && (
                <div className="mt-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.unknownSection')}</div>
                  <div className="mt-2 space-y-3">
                    {missingFactors.map((item) => <FactorLine key={item.factor} item={item} />)}
                  </div>
                </div>
              )}
              {notMatched.length > 0 && (
                <div className="mt-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.notMatchedSection')}</div>
                  <div className="mt-2 space-y-3">
                    {notMatched.map((item) => <FactorLine key={item.factor} item={item} />)}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Wordmark tone="saffron">{t('citizen.benefit')}</Wordmark>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{td(potentialBenefit)}</p>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{tv(scheme.generalInfo)}</p>
            </div>

            <div>
              <Wordmark tone="indigo">{t('citizen.eligibilitySignals')}</Wordmark>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tv(scheme.description)} {t('citizen.eligibilitySignalsNote')}</p>
              {missing.length > 0 && (
                <div className="mt-4 rounded-xl bg-secondary p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.mayBeMissing')}</div>
                  <div className="mt-3 space-y-2">
                    {missing.map((item) => (
                      <div key={item} className="flex gap-3 text-sm text-muted-foreground"><TriangleAlert size={14} className="mt-0.5 shrink-0 text-brand-saffron" />{tv(item)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Wordmark tone="indigo">{t('citizen.documents')}</Wordmark>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t('citizen.documentsIntro')}</p>
              <div className="mt-4 space-y-3">
                {documents.map((doc) => {
                  const confirmed = isDocumentConfirmed(doc, profile);
                  return (
                    <div key={doc.label} className="flex gap-3 text-sm text-muted-foreground">
                      <FileText size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 [overflow-wrap:anywhere]">
                        {tv(doc.label)}
                        {confirmed ? <span className="ml-2 rounded-full bg-sage px-2 py-0.5 text-[10px] font-medium text-primary">{t('citizen.docConfirmed')}</span> : <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{t('citizen.docNotConfirmed')}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!loading && readiness && (
                <div className="mt-5 rounded-xl bg-secondary p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.docReadinessTitle')}</span>
                    <Pill tone={docStatusTone(readiness.status)}>{t(docStatusLabelKey(readiness.status))}</Pill>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {format(t('citizen.docReadinessCount'), { confirmed: readiness.confirmed, total: readiness.total })} · {t('citizen.docReadinessNote')}
                  </p>
                </div>
              )}
            </div>

            {overlaps.length > 0 && (
              <div>
                <Wordmark tone="lavender">{t('citizen.overlapTitle')}</Wordmark>
                <div className="mt-4 rounded-xl bg-secondary p-4">
                  <div className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <Info size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span>{format(t('citizen.overlapDetail'), { schemes: overlaps.join(', ') })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-[1.4rem] bg-secondary p-6">
            <Wordmark tone="terracotta">{t('citizen.whatToDoNext')}</Wordmark>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{td(nextStep)}</p>
            <ol className="mt-5 space-y-3">
              {actionSteps.map((step, index) => (
                <li key={step.titleKey} className="flex gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground font-mono text-[10px] text-background">{index + 1}</span>
                  <span><strong className="font-medium text-foreground">{t(step.titleKey)}.</strong> <span className="text-muted-foreground">{t(step.noteKey)}</span></span>
                </li>
              ))}
            </ol>
            {!loading && checklist.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.beforeYouApply')}</div>
                <ul className="mt-3 space-y-2.5">
                  {checklist.map((item) => (
                    <li key={item.key} className="flex items-start gap-2.5 text-xs leading-5 text-muted-foreground">
                      {item.checked ? (
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sage text-primary"><Check size={12} /></span>
                      ) : (
                        <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-border" />
                      )}
                      <span className="[overflow-wrap:anywhere]">
                        {item.docLabel ? <span className="font-medium text-foreground">{tv(item.docLabel)}</span> : t(item.labelKey)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{t('citizen.bbbNext')}</p>
              </div>
            )}
            <Link href={`/citizen/scheme/${scheme.id}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.checkApplication')}</Link>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{t('citizen.guidanceNote')}</p>
            {missing.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.toConfirm')}</div>
                <ul className="mt-3 space-y-2">
                  {missing.slice(0, 4).map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-saffron" />{tv(item)}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-6 border-t border-border pt-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.officialInfo')}</div>
              <div className="mt-3 text-sm font-medium text-foreground">{scheme.source}</div>
              <div className="mt-2 text-xs leading-5 text-muted-foreground">{t('citizen.officialInfoNote')}</div>
            </div>
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-card p-4 text-xs leading-5 text-muted-foreground">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-primary" />
              <span>{format(t('citizen.potentialRelevantBody'), { strong: t('citizen.potentialRelevantFlag') })}</span>
            </div>
          </aside>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-sm leading-6 text-muted-foreground">
          <strong className="font-medium text-foreground">{t('citizen.important')}</strong> {t('citizen.importantBody')}
        </div>
      </div>
    </CitizenShell>
  );
}