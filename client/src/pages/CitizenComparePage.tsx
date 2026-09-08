import { Link } from 'wouter';
import { Wordmark, Pill, type Tone } from '../lib/ui';
import { CitizenShell, useCitizenProfile, useCitizenRecommendations, useCitizenSavedSchemes } from '../components/Citizen';
import { citizenSchemes } from '../lib/citizen';
import { documentReadiness, docStatusLabelKey, docStatusTone, purposeLabelKey } from '../lib/citizenAnalysis';
import { useLanguage } from '../lib/i18n';
import { ArrowLeft } from 'lucide-react';

const relevanceTone: Record<string, Tone> = {
  'High relevance': 'terracotta',
  Relevant: 'saffron',
  'May be relevant': 'indigo',
  'Low relevance': 'lavender',
  'Needs more information': 'sage',
};

export function CitizenCompare() {
  const { t, tv, td } = useLanguage();
  const { saved, loading } = useCitizenSavedSchemes();
  const { profile, loading: profileLoading } = useCitizenProfile();
  const { recommendations, loading: recLoading } = useCitizenRecommendations(profile, !profileLoading);

  const list = citizenSchemes.filter((scheme) => saved.includes(scheme.id));
  const items = list.length ? list : citizenSchemes.slice(0, 2);
  const recMap = new Map(recommendations.map((r) => [r.id, r]));

  if (loading)
    return (
      <CitizenShell>
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
          <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">{t('citizen.compareLoading')}</div>
        </div>
      </CitizenShell>
    );

  return (
    <CitizenShell>
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <Link href="/citizen/results" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><ArrowLeft size={14} /> {t('citizen.backToSchemes')}</Link>
        <div className="mt-10">
          <Wordmark tone="indigo">{t('citizen.compareTitle')}</Wordmark>
          <h1 className="mt-4 font-display text-5xl tracking-[-0.05em] md:text-7xl">{t('citizen.compareHeading')}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{t('citizen.compareIntro')}</p>
        </div>
        <div className="mt-10 overflow-x-auto rounded-[1.4rem] border border-border bg-card">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColScheme')}</th>
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColPurpose')}</th>
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColRelevance')}</th>
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColReadiness')}</th>
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColWhy')}</th>
                <th className="px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.compareColNeeded')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((scheme) => {
                const rec = recMap.get(scheme.id);
                const tone: Tone = rec ? relevanceTone[rec.tier] ?? 'sage' : scheme.tone;
                const relevanceLabel = rec ? rec.tier : scheme.relevance;
                const matchedWhy = rec?.match?.find((m) => m.status === 'matched' || m.status === 'partial');
                const why = rec ? matchedWhy?.detail ?? rec.why?.[0] ?? scheme.why[0] : scheme.why[0];
                const needed = rec ? rec.missing?.[0] ?? scheme.needed[0] : scheme.needed[0];
                const readiness = rec ? documentReadiness(rec.documents ?? [], profile) : null;
                return (
                  <tr key={scheme.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-6 align-top">
                      <Link href={`/citizen/scheme/${scheme.id}`} className="font-display text-2xl [overflow-wrap:anywhere] hover:text-brand-terracotta">{scheme.name}</Link>
                      <div className="mt-1 text-xs text-muted-foreground">{tv(scheme.category)}</div>
                      {rec && <div className="mt-2 text-xs font-medium text-foreground">{Math.round(rec.score)}% {t('citizen.savedMatch')}</div>}
                    </td>
                    <td className="px-5 py-6 align-top text-muted-foreground"><Pill tone="indigo">{t(purposeLabelKey(scheme.purpose))}</Pill></td>
                    <td className="px-5 py-6 align-top"><Pill tone={tone}>{tv(relevanceLabel)}</Pill></td>
                    <td className="px-5 py-6 align-top">{readiness && readiness.total > 0 ? <Pill tone={docStatusTone(readiness.status)}>{t(docStatusLabelKey(readiness.status))}</Pill> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    <td className="px-5 py-6 align-top text-muted-foreground [overflow-wrap:anywhere]">{td(why)}</td>
                    <td className="px-5 py-6 align-top text-muted-foreground [overflow-wrap:anywhere]">{td(needed)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!profileLoading && !recLoading && (
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{t('citizen.compareNote')}</p>
        )}
      </div>
    </CitizenShell>
  );
}