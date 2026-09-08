import { describe, expect, it } from 'vitest';
import { recommend } from '../../../server/recommendations';
import { defaultCitizenProfile, type CitizenProfile, type Recommendation } from './citizen';

const base: CitizenProfile = { ...defaultCitizenProfile };

function rank(profile: CitizenProfile) {
  return recommend(profile);
}

function byId(recs: Recommendation[], id: string): Recommendation {
  const found = recs.find((r) => r.id === id);
  if (!found) throw new Error(`Missing scheme ${id}`);
  return found;
}

describe('recommendation hierarchy by persona', () => {
  it('farmer: agriculture schemes rank high, business schemes do not outrank them', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Farmer',
      agriculturalActivity: 'Farmer / cultivator',
      agriculturalLand: 'Yes, I own farmland',
      landholding: '1–4 hectares',
      income: '₹1–3 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'pm-kisan').tier).toBe('High relevance');
    expect(byId(recs, 'kcc').tier).toBe('High relevance');
    expect(byId(recs, 'pm-kisan').score).toBeGreaterThan(byId(recs, 'mudra').score);
  });

  it('business owner: business schemes rank high, farmer schemes do not rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Business owner',
      businessStatus: 'Running a business',
      formalBusiness: 'Registered (Udyam / GST)',
      income: '₹3–6 lakh / year',
      ageGroup: '30–45',
    };
    const recs = rank(profile);
    expect(byId(recs, 'mudra').tier).toBe('High relevance');
    expect(byId(recs, 'pmegp').tier).toBe('High relevance');
    const pmKisan = byId(recs, 'pm-kisan');
    expect(['High relevance', 'Relevant']).not.toContain(pmKisan.tier);
  });

  it('student: education and skill schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Student',
      studying: 'Full-time',
      courseField: 'Engineering / technical',
      ageGroup: '18–29',
      income: 'Below ₹1 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'scholarship').tier).toBe('High relevance');
    expect(byId(recs, 'apprenticeship').tier).toBe('High relevance');
  });

  it('unemployed person: workfare and skilling schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Unemployed / seeking work',
      seekingWork: 'Yes',
      employment: 'Looking for work',
      ageGroup: '18–29',
      income: 'Below ₹1 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'mgnrega').tier).toBe('High relevance');
    expect(byId(recs, 'pm-yuva').tier).toBe('High relevance');
    expect(byId(recs, 'pmkvy').tier).toBe('High relevance');
  });

  it('salaried private employee: employment-linked schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Private employee',
      employment: 'Employed',
      ageGroup: '30–45',
      income: '₹3–6 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'epf-esic').tier).toBe('High relevance');
  });

  it('government employee: employment-linked schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Government employee',
      employment: 'Employed',
      ageGroup: '30–45',
      income: '₹3–6 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'epf-esic').tier).toBe('High relevance');
  });

  it('homemaker: self-help and women-focused schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Homemaker',
      gender: 'Female',
      ageGroup: '30–45',
      income: 'Below ₹1 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'lakhpati-didi').tier).toBe('High relevance');
    expect(byId(recs, 'day-nrlm').tier).toBe('High relevance');
  });

  it('retired salaried person: pension ranks high and agriculture does NOT rank strongly', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Retired',
      previousOccupation: 'Salaried',
      pensionStatus: 'Receiving a pension',
      ageGroup: '60+',
      income: '₹1–3 lakh / year',
    };
    const recs = rank(profile);
    const nsap = byId(recs, 'nsap');
    const pmKisan = byId(recs, 'pm-kisan');
    expect(nsap.tier).toBe('High relevance');
    expect(pmKisan.tier).toBe('Low relevance');
    expect(nsap.score).toBeGreaterThan(pmKisan.score);
  });

  it('senior citizen without pension: pension and food-security schemes rank high', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Retired',
      pensionStatus: 'Not receiving a pension',
      ageGroup: '60+',
      income: '₹1–3 lakh / year',
    };
    const recs = rank(profile);
    expect(byId(recs, 'annapurna').tier).toBe('High relevance');
    expect(byId(recs, 'nsap').tier).toBe('High relevance');
  });

  it('person with disability: disability schemes rank higher than non-disability schemes', () => {
    const profile: CitizenProfile = {
      ...base,
      occupation: 'Other',
      disability: 'Yes',
      ageGroup: '30–45',
      income: '₹1–3 lakh / year',
    };
    const recs = rank(profile);
    const adip = byId(recs, 'adip');
    const pmKisan = byId(recs, 'pm-kisan');
    expect(adip.score).toBeGreaterThanOrEqual(58);
    expect(adip.score).toBeGreaterThan(pmKisan.score);
  });

  it('incomplete profile: never claims high confidence, leaves verification open', () => {
    const profile: CitizenProfile = {
      ...base,
      income: 'Prefer not to say',
      gender: 'Prefer not to say',
      disability: 'Prefer not to say',
      occupation: 'Other',
      education: '',
      landholding: 'Prefer not to say',
      pensionStatus: 'Prefer not to say',
      housing: 'Prefer not to say',
      children: 'Prefer not to say',
    };
    const recs = rank(profile);
    expect(recs.some((r) => r.confidence === 'High')).toBe(false);
    expect(recs.some((r) => r.confidence === 'Needs verification')).toBe(true);
  });
});