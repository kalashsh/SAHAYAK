import { describe, expect, it } from 'vitest';
import { defaultCitizenProfile, type CitizenProfile, type WelfareCoverage } from './citizen';
import { beforeYouApply, buildGaps, documentReadiness } from './citizenAnalysis';
import type { Recommendation } from './citizen';

const base: CitizenProfile = { ...defaultCitizenProfile };

describe('documentReadiness', () => {
  it('marks documents confirmed when the profile field is answered', () => {
    const profile: CitizenProfile = { ...base, landholding: '1–4 hectares' };
    const docs = [
      { label: 'Aadhaar / identity proof', confirmedBy: '' },
      { label: 'Land record or equivalent proof', confirmedBy: 'landholding' },
    ];
    const readiness = documentReadiness(docs, profile);
    expect(readiness.confirmed).toBe(1);
    expect(readiness.unconfirmed).toBe(1);
    expect(readiness.status).toBe('mostly');
  });

  it('returns "ready" when every document is confirmed by the profile', () => {
    const profile: CitizenProfile = { ...base, landholding: '1–4 hectares' };
    const docs = [{ label: 'Land record or equivalent proof', confirmedBy: 'landholding' }];
    expect(documentReadiness(docs, profile).status).toBe('ready');
  });

  it('returns "not-enough" when no document maps to an answered profile field', () => {
    const profile: CitizenProfile = { ...base, landholding: 'Prefer not to say' };
    const docs = [
      { label: 'Aadhaar / identity proof', confirmedBy: '' },
      { label: 'Bank account details', confirmedBy: '' },
    ];
    expect(documentReadiness(docs, profile).status).toBe('not-enough');
  });

  it('does not treat "Prefer not to say" as confirmed', () => {
    const profile: CitizenProfile = { ...base, education: 'Prefer not to say' };
    const docs = [{ label: 'Education / enrolment certificate', confirmedBy: 'education' }];
    expect(documentReadiness(docs, profile).confirmed).toBe(0);
  });
});

describe('buildGaps', () => {
  it('produces a single profile-aware gap with explainable why/next keys', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Student',
      studying: 'Full-time',
      courseField: 'Engineering / technical',
      ageGroup: '18–29',
      income: 'Below ₹1 lakh / year',
    };
    const coverage: WelfareCoverage[] = [
      { purpose: 'Education', status: 'Potential gap', note: '', schemeIds: [] },
      { purpose: 'Agriculture', status: 'Covered', note: '', schemeIds: ['pm-kisan'] },
    ];
    const recs = [
      { id: 'scholarship', purpose: 'Education', tier: 'High relevance', score: 90 } as Recommendation,
    ];
    const gaps = buildGaps(coverage, recs, profile);
    expect(gaps.length).toBe(1);
    expect(gaps[0].purpose).toBe('Education');
    expect(gaps[0].whyKey).toBe('citizen.gapSignal.Education');
    expect(gaps[0].nextKey).toBe('citizen.gapNext');
    expect(gaps[0].count).toBe(1);
  });
});

describe('beforeYouApply', () => {
  it('includes income when the scheme mentions income and the profile has none', () => {
    const profile: CitizenProfile = { ...base, income: 'Prefer not to say' };
    const rec = {
      id: 'handler',
      documents: [{ label: 'Aadhaar / identity proof', confirmedBy: '' }],
      match: [{ factor: 'Income', status: 'missing', detail: 'Household income was not shared.' }],
      missing: ['Household income was not shared.'],
      notMatched: [],
    } as unknown as Recommendation;
    const items = beforeYouApply(rec, profile);
    expect(items.some((i) => i.labelKey === 'citizen.bbbIncome' && !i.checked)).toBe(true);
  });

  it('marks the basic profile item checked when essentials are present', () => {
    const profile: CitizenProfile = { ...base };
    const rec = {
      id: 'handler',
      documents: [],
      match: [],
      missing: [],
      notMatched: [],
    } as unknown as Recommendation;
    const items = beforeYouApply(rec, profile);
    expect(items.find((i) => i.labelKey === 'citizen.bbbBasic')?.checked).toBe(true);
  });
});