import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Wordmark, PrimaryButton } from '../lib/ui';
import { CitizenShell, CitizenProgress, Field, useCitizenProfile } from '../components/Citizen';
import { indiaStates, wizardSections, type WizardSection, type CitizenProfile } from '../lib/citizen';
import { useLanguage, type TranslationKey } from '../lib/i18n';
import { ArrowLeft, ArrowRight, Check, Sparkles, TriangleAlert } from 'lucide-react';

type FlowStep = {
  key: string;
  label: string;
  title: string;
  blurb: string;
  tone: 'sage' | 'lavender';
  sections: WizardSection[];
};

function buildFlow(profile: CitizenProfile, t: (key: TranslationKey) => string): FlowStep[] {
  const byKey = Object.fromEntries(wizardSections(profile).map(section => [section.key, section]));
  const flow: FlowStep[] = [
    {
      key: 'location',
      label: t('citizen.stepLocation'),
      title: t('citizen.stepLocationTitle'),
      blurb: t('citizen.stepLocationBlurb'),
      tone: 'sage',
      sections: [],
    },
    {
      key: 'about',
      label: t('citizen.stepAbout'),
      title: t('citizen.stepAboutTitle'),
      blurb: t('citizen.stepAboutBlurb'),
      tone: 'sage',
      sections: [byKey['about-you']],
    },
    {
      key: 'household',
      label: t('citizen.stepHousehold'),
      title: t('citizen.stepHouseholdTitle'),
      blurb: t('citizen.stepHouseholdBlurb'),
      tone: 'sage',
      sections: [byKey['household']],
    },
    {
      key: 'work',
      label: t('citizen.stepWork'),
      title: t('citizen.stepWorkTitle'),
      blurb: t('citizen.stepWorkBlurb'),
      tone: 'sage',
      sections: [byKey['work']],
    },
    {
      key: 'followups',
      label: t('citizen.stepDetails'),
      title: t('citizen.stepDetailsTitle'),
      blurb: t('citizen.stepDetailsBlurb'),
      tone: 'sage',
      sections: ['agriculture', 'education', 'business'].map(key => byKey[key]).filter(Boolean) as WizardSection[],
    },
    {
      key: 'support',
      label: t('citizen.stepSupport'),
      title: t('citizen.stepSupportTitle'),
      blurb: t('citizen.stepSupportBlurb'),
      tone: 'lavender',
      sections: [byKey['welfare']],
    },
  ];
  return flow.filter(step => step.key === 'location' || step.sections.length > 0);
}

export function CitizenWizard() {
  const { t, tv } = useLanguage();
  const [, navigate] = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [matching, setMatching] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { profile, setProfile, loading: profileLoading, save } = useCitizenProfile();
  const update = (key: keyof CitizenProfile, value: string) => setProfile(current => ({ ...current, [key]: value }));

  const flow = buildFlow(profile, t);
  const step = Math.min(stepIndex, flow.length - 1);
  const current = flow[step];
  const isLast = step === flow.length - 1;

  const stateData = indiaStates.find(state => state.name === profile.state) ?? indiaStates[0];
  const districtData = stateData.districts.find(district => district.name === profile.district) ?? stateData.districts[0];

  const changeState = (value: string) => {
    const next = indiaStates.find(state => state.name === value) ?? indiaStates[0];
    setProfile(currentProf => ({ ...currentProf, state: next.name, district: next.districts[0].name, locality: next.districts[0].localities[0] }));
  };

  const changeDistrict = (value: string) => {
    const next = stateData.districts.find(district => district.name === value) ?? stateData.districts[0];
    setProfile(currentProf => ({ ...currentProf, district: next.name, locality: next.localities[0] }));
  };

  const goNext = () => {
    if (isLast) {
      setSaveError(false);
      save().then(() => {
        setMatching(true);
        window.setTimeout(() => navigate('/citizen/results'), 1200);
      }).catch(() => {
        setSaveError(true);
      });
    } else {
      setStepIndex(index => Math.min(index + 1, flow.length - 1));
    }
  };

  if (profileLoading)
    return (
      <CitizenShell>
        <div className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-6 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.loadingProfile')}</div>
        </div>
      </CitizenShell>
    );

  if (matching)
    return (
      <CitizenShell>
        <div className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-6 py-20 text-center">
          <div>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-primary/30 bg-sage text-primary">
              <Sparkles size={24} className="motion-safe:animate-pulse" />
            </div>
            <Wordmark tone="sage">{t('citizen.matchingWordmark')}</Wordmark>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.05em] md:text-6xl">{t('citizen.matchingHeadline')}</h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              {t('citizen.matchingBody')}
            </p>
            <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </CitizenShell>
    );

  return (
    <CitizenShell>
      <CitizenProgress step={step} total={flow.length} label={current.label} />
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-10 md:px-0 md:pt-14">
        <div className="mb-10 flex items-center gap-3">
          <Link href="/citizen" className="grid h-9 w-9 place-items-center rounded-full border border-border transition hover:bg-secondary">
            <ArrowLeft size={15} />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{t('citizen.backAnytime')}</span>
        </div>
        <div className="max-w-xl">
          <Wordmark tone={current.tone}>{current.sections.length > 0 && tv(current.sections[0].short)}</Wordmark>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-[-0.05em] md:text-6xl">{current.title}</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{current.blurb}</p>
        </div>

        <div className="mt-10 grid gap-4 rounded-[1.5rem] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(67,55,34,0.06)] md:grid-cols-2 md:p-8">
          {step === 0 && (
            <>
              <Field label="State" value={profile.state} onChange={changeState} options={indiaStates.map(state => state.name)} />
              <Field label="District" value={profile.district} onChange={changeDistrict} options={stateData.districts.map(district => district.name)} />
              <Field label="City / block / locality" value={profile.locality} onChange={value => update('locality', value)} options={districtData.localities} />
              <div className="md:col-span-2 rounded-xl bg-sage p-4 text-sm leading-6 text-sage-fg">
                <strong>{t('citizen.demoEnvironment')}</strong> {t('citizen.demoEnvironmentNote')}
              </div>
            </>
          )}
          {current.key === 'about' && (
            <>
              {current.sections[0].fields.map(field => (
                <Field key={field.key} label={field.label} hint={field.hint} value={profile[field.key]} onChange={value => update(field.key, value)} options={[...field.options]} />
              ))}
            </>
          )}
          {current.key === 'household' && (
            <>
              {current.sections[0].fields.map(field => (
                <Field key={field.key} label={field.label} hint={field.hint} value={profile[field.key]} onChange={value => update(field.key, value)} options={[...field.options]} />
              ))}
            </>
          )}
          {current.key === 'work' && (
            <>
              {current.sections[0].markdown && (
                <div className="md:col-span-2 rounded-xl border border-brand-lavender/25 bg-lavender p-4 text-sm leading-6 text-lavender-fg">{tv(current.sections[0].markdown)}</div>
              )}
              {current.sections[0].fields.map(field => (
                <Field key={field.key} label={field.label} hint={field.hint} value={profile[field.key]} onChange={value => update(field.key, value)} options={[...field.options]} />
              ))}
            </>
          )}
          {current.key === 'followups' &&
            current.sections.map(section => (
              <div key={section.key} className="md:col-span-2">
                <div className="mb-2 border-b border-border pb-2 text-sm font-medium">{tv(section.label)}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map(field => (
                    <Field key={field.key} label={field.label} hint={field.hint} value={profile[field.key]} onChange={value => update(field.key, value)} options={[...field.options]} />
                  ))}
                </div>
              </div>
            ))}
          {current.key === 'support' && (
            <>
              <div className="md:col-span-2 rounded-xl border border-brand-lavender/25 bg-lavender p-4 text-sm leading-6 text-lavender-fg">
                <strong>{t('citizen.inControl')}</strong> {t('citizen.inControlNote')}
              </div>
              {current.sections[0].fields.map(field => (
                <Field key={field.key} label={field.label} hint={field.hint} value={profile[field.key]} onChange={value => update(field.key, value)} options={[...field.options]} />
              ))}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => (stepIndex > 0 ? setStepIndex(index => Math.max(0, index - 1)) : navigate('/citizen'))} className="rounded-full px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary">
            {stepIndex === 0 ? t('common.cancel') : t('common.back')}
          </button>
          <PrimaryButton onClick={goNext} tone={isLast ? 'terracotta' : 'sage'} icon={isLast ? Check : ArrowRight}>
            {isLast ? t('citizen.seeMatches') : t('common.continue')}
          </PrimaryButton>
        </div>
        {saveError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-xs leading-5 text-muted-foreground">
            <TriangleAlert size={14} className="mt-0.5 shrink-0 text-brand-saffron" />
            <span>{t('citizen.saveError')}</span>
          </div>
        )}
      </div>
    </CitizenShell>
  );
}