import { Link } from 'wouter';
import { Wordmark } from '../lib/ui';
import { CitizenShell, useCitizenProfile } from '../components/Citizen';
import { isAgriculturalProfile, isBusinessProfile, isRetiredProfile, isSeniorProfile, isStudentProfile } from '../lib/citizen';
import { useLanguage } from '../lib/i18n';

export function CitizenProfilePage() {
  const { t, tv } = useLanguage();
  const { profile } = useCitizenProfile();
  const farmer = isAgriculturalProfile(profile);
  const retired = isRetiredProfile(profile) || isSeniorProfile(profile);
  const student = isStudentProfile(profile);
  const business = isBusinessProfile(profile);

  const rows: Array<[string, string]> = [
    ['Location', `${profile.locality}, ${profile.district}, ${profile.state}`],
    ['Main status', tv(profile.occupation)],
    ['Age group', tv(profile.ageGroup)],
    ['Gender', tv(profile.gender)],
    ['Education', tv(profile.education)],
    ['Household', `${tv(profile.householdSize)} · ${tv(profile.children)} · ${tv(profile.income)}`],
    ['Housing', tv(profile.housing)],
    ['Work', retired ? `${tv(profile.previousOccupation)} · ${tv(profile.pensionStatus)}` : `${tv(profile.employment)}`],
  ];

  if (farmer) rows.push(['Agriculture', `${tv(profile.agriculturalLand)} · ${tv(profile.landholding)}`]);
  if (student) rows.push(['Study', `${tv(profile.studying)} · ${tv(profile.courseField)}`]);
  if (business) rows.push(['Business', `${tv(profile.businessStatus)} · ${tv(profile.formalBusiness)}`]);

  return (
    <CitizenShell>
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        <div className="flex items-end justify-between border-b border-border pb-8">
          <div>
            <Wordmark tone="sage">{t('citizen.yourInformation')}</Wordmark>
            <h1 className="mt-4 font-display text-5xl tracking-[-0.05em] md:text-7xl">{t('citizen.profileTitle')}</h1>
          </div>
          <Link href="/citizen/profile/edit" className="rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background">
            {t('citizen.updateMyInfo')}
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="border-b border-border py-5">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{tv(label)}</div>
              <div className="mt-2 text-sm">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl bg-lavender p-5 text-sm leading-6 text-lavender-fg">
          <strong className="font-medium">{t('citizen.privacyNote')}</strong> {t('citizen.privacyNoteBody')}
        </div>
      </div>
    </CitizenShell>
  );
}