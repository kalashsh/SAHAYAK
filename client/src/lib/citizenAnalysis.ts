import {
  WELFARE_PURPOSES,
  incomeLevelOf,
  isAgriculturalProfile,
  isBusinessProfile,
  isRetiredProfile,
  isSeekingWorkProfile,
  isSeniorProfile,
  isStudentProfile,
  isYouthProfile,
  profilePurposeInterest,
  purposeLabel,
  type CitizenProfile,
  type CoverageStatus,
  type Recommendation,
  type WelfareCoverage,
  type WelfarePurpose,
} from './citizen';
import { type TranslationKey } from './i18n';

export type WelfareGap = {
  purpose: WelfarePurpose;
  title: string;
  summary: string;
  why: string;
  whyKey: TranslationKey;
  nextKey: TranslationKey;
  traitKey: TranslationKey;
  schemeIds: string[];
  count: number;
};

export type OverlapGroup = {
  schemeIds: string[];
  purpose: WelfarePurpose;
  message: string;
};

export type ActionStep = {
  titleKey: TranslationKey;
  noteKey: TranslationKey;
};

export type ProfileImprovementField = {
  key: string;
  labelKey: TranslationKey;
  complete: boolean;
  helpful: boolean;
  reasonKey: TranslationKey;
};

export function purposeLabelKey(purpose: WelfarePurpose): TranslationKey {
  const map: Record<WelfarePurpose, TranslationKey> = {
    Housing: 'citizen.purpose.Housing',
    Livelihood: 'citizen.purpose.Livelihood',
    Education: 'citizen.purpose.Education',
    Healthcare: 'citizen.purpose.Healthcare',
    Pension: 'citizen.purpose.Pension',
    'Food security': 'citizen.purpose.FoodSecurity',
    Agriculture: 'citizen.purpose.Agriculture',
    'Women & Child': 'citizen.purpose.WomenChild',
    Disability: 'citizen.purpose.Disability',
    'Financial inclusion': 'citizen.purpose.FinancialInclusion',
  };
  return map[purpose];
}

// ---------------------------------------------------------------------------
// Document readiness
//
// A document is treated as "likely available from your profile" when the scheme
// catalogue names a profile field that would confirm it (e.g. a landholding
// document from `landholding`) AND that field has actually been answered in the
// profile. This is preparation guidance — never document verification.
// ---------------------------------------------------------------------------

export type DocReadinessStatus = 'ready' | 'mostly' | 'more-info' | 'not-enough';

export type DocumentReadiness = {
  status: DocReadinessStatus;
  confirmed: number;
  unconfirmed: number;
  total: number;
};

export type WelfareDocumentLike = { label: string; confirmedBy: string };

export function profileValue(profile: CitizenProfile, field: string): string {
  return (profile as unknown as Record<string, string>)[field] ?? '';
}

export function isProfileValueAnswered(value: string): boolean {
  return value.trim() !== '' && value !== 'Prefer not to say';
}

export function isDocumentConfirmed(document: WelfareDocumentLike, profile: CitizenProfile): boolean {
  if (!document.confirmedBy) return false;
  return isProfileValueAnswered(profileValue(profile, document.confirmedBy));
}

export function documentReadiness(
  documents: WelfareDocumentLike[],
  profile: CitizenProfile,
): DocumentReadiness {
  if (documents.length === 0) {
    return { status: 'not-enough', confirmed: 0, unconfirmed: 0, total: 0 };
  }
  const confirmed = documents.filter((d) => isDocumentConfirmed(d, profile)).length;
  const ratio = confirmed / documents.length;
  let status: DocReadinessStatus;
  if (ratio >= 0.75 && documents.length - confirmed <= 1) status = 'ready';
  else if (ratio >= 0.5) status = 'mostly';
  else if (ratio >= 0.25) status = 'more-info';
  else status = 'not-enough';
  return { status, confirmed, unconfirmed: documents.length - confirmed, total: documents.length };
}

export function docStatusLabelKey(status: DocReadinessStatus): TranslationKey {
  const map: Record<DocReadinessStatus, TranslationKey> = {
    ready: 'citizen.docStatus.ready',
    mostly: 'citizen.docStatus.mostly',
    'more-info': 'citizen.docStatus.moreInfo',
    'not-enough': 'citizen.docStatus.notEnough',
  };
  return map[status];
}

export function docStatusTone(status: DocReadinessStatus): 'sage' | 'saffron' | 'indigo' | 'lavender' {
  const map: Record<DocReadinessStatus, 'sage' | 'saffron' | 'indigo' | 'lavender'> = {
    ready: 'sage',
    mostly: 'saffron',
    'more-info': 'indigo',
    'not-enough': 'lavender',
  };
  return map[status];
}

// ---------------------------------------------------------------------------
// "Before you apply" checklist — a practical pre-application recap drawn from
// the profile, the scheme documents and the still-missing signals. It is a
// preparation aid for the user, not an official application checklist.
// ---------------------------------------------------------------------------

export type BeforeYouApplyItem = {
  key: string;
  labelKey: TranslationKey;
  docLabel?: string;
  checked: boolean;
};

export function beforeYouApply(rec: Recommendation, profile: CitizenProfile): BeforeYouApplyItem[] {
  const baseComplete =
    isProfileValueAnswered(profileValue(profile, 'district')) &&
    isProfileValueAnswered(profileValue(profile, 'locality')) &&
    isProfileValueAnswered(profileValue(profile, 'ageGroup')) &&
    isProfileValueAnswered(profileValue(profile, 'occupation'));
  const incomeComplete = isProfileValueAnswered(profileValue(profile, 'income'));

  const mentions = (term: string) =>
    (rec.match ?? []).some((m) => m.factor.toLowerCase().includes(term)) ||
    (rec.notMatched ?? []).some((m) => m.factor.toLowerCase().includes(term) || m.detail.toLowerCase().includes(term)) ||
    (rec.missing ?? []).some((m) => m.toLowerCase().includes(term));

  const items: BeforeYouApplyItem[] = [{ key: 'basic', labelKey: 'citizen.bbbBasic', checked: baseComplete }];
  if (mentions('income')) items.push({ key: 'income', labelKey: 'citizen.bbbIncome', checked: incomeComplete });
  for (const doc of rec.documents ?? []) {
    if (!isDocumentConfirmed(doc, profile)) {
      items.push({ key: `doc-${doc.label}`, labelKey: 'citizen.bbbDoc', docLabel: doc.label, checked: false });
      if (items.length >= 4) break;
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Profile completeness — how much of the profile info that would sharpen the
// current matches has actually been shared.
// ---------------------------------------------------------------------------

export type ProfileCompleteness = {
  completed: number;
  total: number;
  missing: ProfileImprovementField[];
};

export function profileCompleteness(profile: CitizenProfile, recommendations: Recommendation[]): ProfileCompleteness {
  const helpful = improvementFields(profile, recommendations).filter((item) => item.helpful);
  const completed = helpful.filter((item) => item.complete).length;
  return { completed, total: helpful.length, missing: helpful.filter((item) => !item.complete) };
}

const tierRank: Record<string, number> = {
  'High relevance': 3,
  Relevant: 2,
  'May be relevant': 1,
  'Low relevance': 0,
  'Needs more information': 0,
};

export function buildCoverage(
  recommendations: Recommendation[],
  profile: CitizenProfile,
): WelfareCoverage[] {
  const interest = profilePurposeInterest(profile);
  const list: WelfareCoverage[] = [];

  for (const purpose of WELFARE_PURPOSES) {
    const recs = recommendations
      .filter((r) => r.purpose === purpose)
      .sort((a, b) => tierRank[b.tier] - tierRank[a.tier] || b.score - a.score);
    const best = recs[0];

    if (!best) {
      list.push({
        purpose,
        status: 'Needs more information',
        note: 'Based on the information you provided, no scheme in this area was matched yet.',
        schemeIds: [],
      });
      continue;
    }

    const strong = recs.filter((r) => r.tier === 'High relevance' || r.tier === 'Relevant');
    const decent = recs.find((r) => r.tier === 'May be relevant');
    const interestLevel = interest[purpose];

    let status: CoverageStatus;
    let note: string;
    const schemeIds = strong.length ? strong.map((r) => r.id) : decent ? [decent.id] : [best.id];

    if (strong.length > 0) {
      const hasVerification = strong.some((r) => r.confidence !== 'High');
      status = hasVerification ? 'Potential opportunity' : 'Covered';
      note = hasVerification
        ? 'A relevant benefit was found, but some details still need verification.'
        : 'A relevant benefit was found based on the information you provided.';
    } else if (decent) {
      status = 'Potential opportunity';
      note = 'A potentially relevant benefit was found; confirming details would narrow this.';
    } else if (interestLevel === 'high' || interestLevel === 'medium') {
      status = 'Potential gap';
      note = 'No matching benefit is currently reflected in your Sahayak profile based on the information you provided.';
    } else {
      status = 'Needs more information';
      note = 'No clear benefit was found in this area based on the information you provided.';
    }

    list.push({ purpose, status, note, schemeIds });
  }

  return list;
}

const gapSignalKey: Record<WelfarePurpose, TranslationKey> = {
  Agriculture: 'citizen.gapSignal.Agriculture',
  Livelihood: 'citizen.gapSignal.Livelihood',
  Education: 'citizen.gapSignal.Education',
  Housing: 'citizen.gapSignal.Housing',
  Healthcare: 'citizen.gapSignal.Healthcare',
  Pension: 'citizen.gapSignal.Pension',
  'Food security': 'citizen.gapSignal.FoodSecurity',
  'Women & Child': 'citizen.gapSignal.WomenChild',
  Disability: 'citizen.gapSignal.Disability',
  'Financial inclusion': 'citizen.gapSignal.FinancialInclusion',
};

// A short, human description of the profile signal that drew SAHAYAK's
// attention to this purpose area. Used inside the "What you might be missing"
// list so each gap is explainable, not just a category label.
export function gapSignalLabelKey(purpose: WelfarePurpose): TranslationKey {
  return gapSignalKey[purpose];
}

export function buildGaps(coverage: WelfareCoverage[], recommendations: Recommendation[], profile: CitizenProfile): WelfareGap[] {
  return coverage
    .filter((c) => c.status === 'Potential gap')
    .map((c) => {
      const candidates = recommendations.filter(
        (r) => r.purpose === c.purpose && r.tier !== 'Low relevance' && r.tier !== 'Needs more information',
      );
      const traitReasons: TranslationKey[] = [];
      const farmer = isAgriculturalProfile(profile);
      const biz = isBusinessProfile(profile);
      const student = isStudentProfile(profile) || isYouthProfile(profile);
      const seeking = isSeekingWorkProfile(profile);
      const retired = isRetiredProfile(profile);
      const senior = isSeniorProfile(profile);
      const woman = profile.gender === 'Female';
      const disabled = profile.disability === 'Yes';
      const low = incomeLevelOf(profile.income) === 0 || incomeLevelOf(profile.income) === 1;
      const children = profile.children === '1' || profile.children === '2' || profile.children === '3 or more';

      switch (c.purpose) {
        case 'Agriculture':
          if (farmer) traitReasons.push('citizen.gapTrait.Farmer');
          break;
        case 'Livelihood':
          if (seeking) traitReasons.push('citizen.gapTrait.SeekingWork');
          else if (farmer) traitReasons.push('citizen.gapTrait.Farmer');
          else if (biz) traitReasons.push('citizen.gapTrait.Business');
          else if (profile.occupation === 'Homemaker') traitReasons.push('citizen.gapTrait.Homemaker');
          if (low) traitReasons.push('citizen.gapTrait.LowIncome');
          break;
        case 'Education':
          if (student) traitReasons.push('citizen.gapTrait.Student');
          break;
        case 'Housing':
          if (profile.housing === 'No permanent house') traitReasons.push('citizen.gapTrait.NoHousing');
          else if (profile.housing === 'Renting' || profile.housing === 'Shared / family home') traitReasons.push('citizen.gapTrait.PrecariousHousing');
          if (low) traitReasons.push('citizen.gapTrait.LowIncome');
          break;
        case 'Healthcare':
          if (disabled) traitReasons.push('citizen.gapTrait.Disabled');
          if (senior) traitReasons.push('citizen.gapTrait.Senior');
          if (low) traitReasons.push('citizen.gapTrait.LowIncome');
          break;
        case 'Pension':
          if (senior || retired) traitReasons.push('citizen.gapTrait.Senior');
          break;
        case 'Food security':
          if (low) traitReasons.push('citizen.gapTrait.LowIncome');
          break;
        case 'Women & Child':
          if (woman) traitReasons.push('citizen.gapTrait.Woman');
          if (children) traitReasons.push('citizen.gapTrait.Children');
          break;
        case 'Disability':
          if (disabled) traitReasons.push('citizen.gapTrait.Disabled');
          break;
        case 'Financial inclusion':
          if (low) traitReasons.push('citizen.gapTrait.LowIncome');
          break;
      }

      const trait = traitReasons.length > 0 ? traitReasons[0] : 'citizen.gapTrait.General';
      return {
        purpose: c.purpose,
        title: c.purpose,
        summary: `No matching ${c.purpose.toLowerCase()} benefit is currently reflected in your Sahayak profile based on the information you provided.`,
        why: 'This area relates to your situation, but no scheme reached a strong match yet. Sharing more details may improve the match.',
        whyKey: gapSignalKey[c.purpose],
        nextKey: 'citizen.gapNext',
        traitKey: trait,
        schemeIds: candidates.map((r) => r.id),
        count: candidates.length,
      };
    });
}

export function buildOverlaps(items: Recommendation[]): OverlapGroup[] {
  const selected = new Set(items.map((r) => r.id));
  const seen = new Set<string>();
  const groups: OverlapGroup[] = [];

  for (const rec of items) {
    const linked = rec.overlap.filter((id) => selected.has(id));
    if (linked.length === 0) continue;
    const key = [rec.id, ...linked].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    groups.push({
      schemeIds: [rec.id, ...linked],
      purpose: rec.purpose,
      message: `These schemes may serve a similar welfare purpose (${purposeLabel[rec.purpose]}). Applicable rules may determine whether both can be received. This is a potential overlap — a verification aid — not confirmation of duplication or ineligibility.`,
    });
  }

  return groups;
}

export function schemeCounts(recommendations: Recommendation[]) {
  const counts = { high: 0, potential: 0, moreInfo: 0 };
  for (const rec of recommendations) {
    if (rec.tier === 'High relevance' || rec.tier === 'Relevant') counts.high += 1;
    else if (rec.tier === 'May be relevant') counts.potential += 1;
    else counts.moreInfo += 1;
  }
  return counts;
}

export function nextActionSteps(_rec: Recommendation): ActionStep[] {
  return [
    { titleKey: 'citizen.step1Title', noteKey: 'citizen.step1Note' },
    { titleKey: 'citizen.step2Title', noteKey: 'citizen.step2Note' },
    { titleKey: 'citizen.step3Title', noteKey: 'citizen.step3Note' },
    { titleKey: 'citizen.step4Title', noteKey: 'citizen.step4Note' },
  ];
}

export function relevanceHeadline(rec: Recommendation): { titleKey: TranslationKey; bodyKey: TranslationKey } {
  if (rec.tier === 'High relevance') return { titleKey: 'citizen.whyHigh', bodyKey: 'citizen.whyHighBody' };
  if (rec.tier === 'Relevant') return { titleKey: 'citizen.whyRelevant', bodyKey: 'citizen.whyRelevantBody' };
  if (rec.tier === 'May be relevant') return { titleKey: 'citizen.whyMaybe', bodyKey: 'citizen.whyMaybeBody' };
  return { titleKey: 'citizen.whyNotPriority', bodyKey: 'citizen.whyNotPriorityBody' };
}

export function improvementFields(
  profile: CitizenProfile,
  recommendations: Recommendation[],
): ProfileImprovementField[] {
  const missingLabels = new Set<string>();
  for (const rec of recommendations) {
    for (const m of rec.match ?? []) {
      if (m.status === 'missing') missingLabels.add(m.factor.toLowerCase());
    }
  }
  const has = (keys: string[]) => keys.some((k) => missingLabels.has(k));

  return [
    {
      key: 'occupation',
      labelKey: 'citizen.fieldOccupation',
      complete: profile.occupation !== 'Other' && profile.occupation !== '',
      helpful: has(['main activity', 'occupation', 'status', 'student status']),
      reasonKey: 'citizen.reasonOccupation',
    },
    {
      key: 'income',
      labelKey: 'citizen.fieldIncome',
      complete: profile.income !== 'Prefer not to say',
      helpful: has(['income']),
      reasonKey: 'citizen.reasonIncome',
    },
    {
      key: 'housing',
      labelKey: 'citizen.fieldHousing',
      complete: profile.housing !== 'Prefer not to say' && profile.housing !== '',
      helpful: has(['housing']),
      reasonKey: 'citizen.reasonHousing',
    },
    {
      key: 'landholding',
      labelKey: 'citizen.fieldLandholding',
      complete: profile.landholding !== 'Prefer not to say' && profile.landholding !== '',
      helpful: has(['landholding', 'agricultural activity']),
      reasonKey: 'citizen.reasonLandholding',
    },
    {
      key: 'gender',
      labelKey: 'citizen.fieldGender',
      complete: profile.gender !== 'Prefer not to say',
      helpful: has(['gender']),
      reasonKey: 'citizen.reasonGender',
    },
    {
      key: 'disability',
      labelKey: 'citizen.fieldDisability',
      complete: profile.disability !== 'Prefer not to say',
      helpful: has(['disability']),
      reasonKey: 'citizen.reasonDisability',
    },
    {
      key: 'pension',
      labelKey: 'citizen.fieldPension',
      complete: profile.pensionStatus !== 'Prefer not to say' && profile.pensionStatus !== '' && profile.pensionStatus !== 'Applying for a pension' && profile.pensionStatus !== 'Not receiving a pension',
      helpful: has(['pension status', 'age']),
      reasonKey: 'citizen.reasonPension',
    },
  ];
}