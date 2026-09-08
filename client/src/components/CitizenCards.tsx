import { Link } from 'wouter';
import { Wordmark, Pill, type Tone } from '../lib/ui';
import { useLanguage, format, type TranslationKey } from '../lib/i18n';
import type { Recommendation } from '../lib/citizen';
import { documentReadiness, docStatusLabelKey, docStatusTone, isDocumentConfirmed, nextActionSteps, relevanceHeadline } from '../lib/citizenAnalysis';
import { Check, FileText, Plus, Sparkles, TriangleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';

const relevanceTone: Record<string, Tone> = {
  'High relevance': 'terracotta',
  Relevant: 'saffron',
  'May be relevant': 'indigo',
  'Low relevance': 'lavender',
  'Needs more information': 'sage',
};

const tierLabel = (rec: Pick<Recommendation, 'relevance'>, t: (key: TranslationKey) => string, language: string): string => {
  const map: Record<string, TranslationKey> = {
    'High relevance': 'citizen.high',
    Relevant: 'citizen.relevant',
    'May be relevant': 'citizen.maybe',
    'Low relevance': 'citizen.low',
    'Needs more information': 'citizen.moreInfo',
  };
  return language === 'en' ? rec.relevance : t(map[rec.relevance] ?? 'citizen.maybe');
};

const confidenceText = (rec: Pick<Recommendation, 'confidence'>, t: (key: TranslationKey) => string): string => {
  if (rec.confidence === 'High') return t('citizen.highConfidence');
  if (rec.confidence === 'Medium') return t('citizen.mediumConfidence');
  return t('citizen.needsVerification');
};

function ActionSteps({ scheme }: { scheme: Recommendation }) {
  const { t, td } = useLanguage();
  const steps = nextActionSteps(scheme);
  return (
    <div>
      <Wordmark tone="terracotta">{t('citizen.whatToDoNext')}</Wordmark>
      <ol className="mt-3 space-y-3">
        {steps.map((step, index) => (
          <li key={step.titleKey} className="flex gap-3 text-sm">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground font-mono text-[10px] text-background">{index + 1}</span>
            <span>
              <strong className="font-medium text-foreground">{t(step.titleKey)}.</strong>{' '}
              <span className="text-muted-foreground">{t(step.noteKey)}</span>
            </span>
          </li>
        ))}
      </ol>
      {scheme.next && (
        <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-xs leading-5 text-muted-foreground">
          <strong className="font-medium text-foreground">{t('citizen.specificToScheme')}:</strong> {td(scheme.next)}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/citizen/scheme/${scheme.id}`} className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.checkApplication')}</Link>
        <span className="flex-1 self-center text-xs leading-5 text-muted-foreground">{t('citizen.guidanceNote')}</span>
      </div>
    </div>
  );
}

function Headline({ scheme }: { scheme: Recommendation }) {
  const { t, td } = useLanguage();
  const headline = relevanceHeadline(scheme);
  const notMatched = scheme.notMatched ?? [];
  return (
    <div className="rounded-xl bg-secondary px-4 py-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">{t(headline.titleKey)}</div>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t(headline.bodyKey)}</p>
      {notMatched.length > 0 && (
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {t('citizen.notMatchedReason')} <span className="font-medium text-foreground">{td(notMatched[0].detail)}</span>
        </p>
      )}
    </div>
  );
}

function FactorRow({ status, children }: { status: 'matched' | 'partial' | 'missing' | 'not-matched'; children: ReactNode }) {
  const icon =
    status === 'matched' ? (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage text-primary"><Check size={13} /></span>
    ) : status === 'partial' ? (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-saffron text-saffron-fg"><span className="text-[10px]">~</span></span>
    ) : status === 'missing' ? (
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-saffron" />
    ) : (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border"><X size={12} className="text-muted-foreground" /></span>
    );
  return (
    <div className="flex gap-3 text-sm text-muted-foreground">
      {icon}
      <span>{children}</span>
    </div>
  );
}

export function CitizenExplain({ scheme, onClose }: { scheme: Recommendation; onClose: () => void }) {
  const { t, language, td, tv } = useLanguage();
  const matched = scheme.match?.filter((m) => m.status === 'matched' || m.status === 'partial') ?? [];
  const unknown = (scheme.match ?? []).filter((m) => m.status === 'missing');
  const notMatched = scheme.notMatched ?? [];
  const unconfirmedDocs = (scheme.documents ?? []).slice(0, 3).filter((d) => !d.confirmedBy);
  const confidence = confidenceText(scheme, t);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#18231f]/25 p-4 backdrop-blur-sm md:items-center">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] bg-card p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={relevanceTone[scheme.relevance] ?? 'sage'}>{tierLabel(scheme, t, language)}</Pill>
              <Pill tone="sage">{confidence}</Pill>
            </div>
            <h2 className="mt-3 font-display text-3xl tracking-[-0.035em] [overflow-wrap:anywhere]">{scheme.name}</h2>
            <div className="mt-1 text-xs text-muted-foreground">{tv(scheme.category)}</div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border"><X size={14} /></button>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 text-sm">
          <Sparkles size={15} className="shrink-0 text-primary" />
          <span className="flex-1">
            {Math.round(scheme.score)}% {t('citizen.match')}
            {scheme.confidence !== 'High' && ` \u00b7 ${t('citizen.needsVerification')}`}
          </span>
        </div>

        <div className="mt-6">
          <Headline scheme={scheme} />
        </div>

        <div className="mt-6">
          <ActionSteps scheme={scheme} />
        </div>

        {matched.length > 0 && (
          <div className="mt-6">
            <Wordmark tone="sage">{t('citizen.matchedSection')}</Wordmark>
            <div className="mt-3 space-y-3">
              {matched.map((item) => (
                <FactorRow key={item.factor} status={item.status}>
                  <span><strong className="font-medium text-foreground">{tv(item.factor)}.</strong> {td(item.detail)}</span>
                </FactorRow>
              ))}
            </div>
          </div>
        )}

        {(unknown.length > 0 || unconfirmedDocs.length > 0) && (
          <div className="mt-6">
            <Wordmark tone="saffron">{t('citizen.unknownSection')}</Wordmark>
            <div className="mt-3 space-y-3">
              {unknown.map((item) => (
                <FactorRow key={item.factor} status="missing">
                  <span>{td(item.detail)}</span>
                </FactorRow>
              ))}
              {unconfirmedDocs.map((d) => (
                <div key={`doc-${d.label}`} className="flex gap-3 text-sm text-muted-foreground">
                  <FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span>{tv(d.label)} · {t('citizen.docNotConfirmed')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {notMatched.length > 0 && (
          <div className="mt-6">
            <Wordmark tone="lavender">{t('citizen.notMatchedSection')}</Wordmark>
            <div className="mt-3 space-y-3">
              {notMatched.map((item) => (
                <FactorRow key={item.factor} status="not-matched">
                  <span><strong className="font-medium text-foreground">{tv(item.factor)}.</strong> {td(item.detail)}</span>
                </FactorRow>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-secondary p-4">
          <Wordmark tone="indigo">{t('citizen.benefit')}</Wordmark>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{td(scheme.potentialBenefit ?? scheme.benefit)}</p>
        </div>

        <p className="mt-6 border-l-2 border-brand-terracotta pl-4 text-sm leading-6 text-muted-foreground">
          {t('citizen.explainFooter')}
        </p>
      </div>
    </div>
  );
}

export function CitizenSchemeCard({
  scheme,
  profile,
  saved,
  onSave,
  onExplain,
}: {
  scheme: Recommendation;
  profile: import('../lib/citizen').CitizenProfile;
  saved: boolean;
  onSave: () => void;
  onExplain: () => void;
}) {
  const { t, language, td, tv } = useLanguage();
  const relevance = tierLabel(scheme, t, language);
  const matched = (scheme.match ?? []).filter((m) => m.status === 'matched' || m.status === 'partial');
  const notMatched = scheme.notMatched ?? [];
  const readiness = documentReadiness(scheme.documents ?? [], profile);
  const matchReasons = matched.length > 0
    ? matched.slice(0, 3).map((m) => ({ detail: td(m.detail), matched: m.status === 'matched' }))
    : notMatched.length > 0
      ? [{ detail: `${t('citizen.whyNotPriorityBody')} ${td(notMatched[0].detail)}`, matched: false }]
      : [{ detail: t('citizen.noFactorsYet'), matched: false }];
  const docs = (scheme.documents ?? []).slice(0, 2);
  const matchPct = `${Math.round(scheme.score)}%`;
  const isActionable = scheme.tier === 'High relevance' || scheme.tier === 'Relevant';
  const headline = relevanceHeadline(scheme);

  return (
    <article className="flex flex-col rounded-[1.4rem] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(67,55,34,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(67,55,34,0.09)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={relevanceTone[scheme.relevance] ?? 'sage'}>{relevance}</Pill>
            <Pill tone="sage">{matchPct} {t('citizen.match')}</Pill>
          </div>
          <h2 className="mt-4 font-display text-3xl leading-[1.05] tracking-[-0.035em] [overflow-wrap:anywhere]">{scheme.name}</h2>
          <div className="mt-1 text-xs text-muted-foreground">{tv(scheme.category)}</div>
        </div>
        <button
          onClick={onSave}
          aria-label={saved ? t('citizen.removeSaved') : t('citizen.saveScheme')}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${
            saved ? 'border-primary bg-sage text-primary' : 'border-border text-muted-foreground hover:bg-secondary'
          }`}
        >
          {saved ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">{tv(scheme.description)}</p>

      {isActionable && (
        <div className="mt-6 rounded-xl bg-secondary p-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-primary">{t(headline.titleKey)}</div>
          <div className="mt-3 space-y-2">
            {matched.slice(0, 3).map((item) => (
              <div key={item.factor} className="flex gap-2 text-sm text-muted-foreground">
                <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                {td(item.detail)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex-1 border-t border-border pt-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.whyMatch')}</div>
        <div className="mt-3 space-y-2">
          {matchReasons.map((reason) => (
            <div key={reason.detail} className="flex gap-2 text-sm text-muted-foreground">
              {reason.matched ? <Check size={14} className="mt-0.5 shrink-0 text-primary" /> : <TriangleAlert size={14} className="mt-0.5 shrink-0 text-brand-saffron" />}
              <span className="[overflow-wrap:anywhere]">{reason.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-secondary p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.benefit')}</div>
        <div className="mt-2 text-sm leading-5 text-muted-foreground">{td(scheme.potentialBenefit)}</div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.cardReadiness')}</div>
          {readiness.total > 0 && (
            <Pill tone={docStatusTone(readiness.status)}>{t(docStatusLabelKey(readiness.status))}</Pill>
          )}
        </div>
        {docs.length > 0 && (
          <>
            <div className="mt-3 space-y-1.5">
              {docs.map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                  <FileText size={12} className="shrink-0" />
                  <span className="[overflow-wrap:anywhere]">{tv(d.label)}</span>
                  <span className="ml-auto shrink-0 text-[10px] opacity-70">{isDocumentConfirmed(d, profile) ? t('citizen.docConfirmed') : t('citizen.docNotConfirmed')}</span>
                </div>
              ))}
            </div>
            {readiness.confirmed > 0 && (
              <div className="mt-2 text-[11px] leading-5 text-muted-foreground">{format(t('citizen.docReadinessCount'), { confirmed: readiness.confirmed, total: readiness.total })}</div>
            )}
          </>
        )}
        {isActionable ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <Link href={`/citizen/scheme/${scheme.id}`} className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">{t('citizen.whatToDoNext')}</Link>
            <span className="text-[11px] leading-5 text-muted-foreground">{t('citizen.guidanceNote')}</span>
          </div>
        ) : (
          <>
            <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.nextStep')}</div>
            <div className="mt-2 text-sm leading-5 text-muted-foreground">{td(scheme.nextStep ?? scheme.next)}</div>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/citizen/scheme/${scheme.id}`} className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-primary">{t('common.viewDetails')}</Link>
        <button onClick={onExplain} className="rounded-full border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary">{t('common.why')}</button>
      </div>
    </article>
  );
}