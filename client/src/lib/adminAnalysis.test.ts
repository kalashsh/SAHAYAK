import { describe, expect, it } from 'vitest';
import { analyzeHousehold, buildVerificationCaseRow } from '../../../server/adminAnalysis';
import { recommend } from '../../../server/recommendations';
import { citizenSchemes, defaultCitizenProfile, schemeOverlapMap, type CitizenProfile } from './citizen';

const base: CitizenProfile = { ...defaultCitizenProfile };

const personas: Record<string, CitizenProfile> = {
  farmer: {
    ...base,
    occupation: 'Farmer',
    agriculturalActivity: 'Farmer / cultivator',
    agriculturalLand: 'Yes, I own farmland',
    landholding: '1–4 hectares',
    income: '₹1–3 lakh / year',
    ageGroup: '30–45',
  },
  student: {
    ...base,
    occupation: 'Student',
    studying: 'Full-time',
    courseField: 'Engineering / technical',
    ageGroup: '18–29',
    income: 'Below ₹1 lakh / year',
    employment: 'Studying',
  },
  business: {
    ...base,
    occupation: 'Business owner',
    businessStatus: 'Running a business',
    formalBusiness: 'Registered (Udyam / GST)',
    income: '₹3–6 lakh / year',
    ageGroup: '30–45',
  },
  salaried: {
    ...base,
    occupation: 'Private employee',
    employment: 'Employed',
    ageGroup: '30–45',
    income: '₹3–6 lakh / year',
  },
  unemployed: {
    ...base,
    occupation: 'Unemployed / seeking work',
    seekingWork: 'Yes',
    employment: 'Looking for work',
    ageGroup: '18–29',
    income: 'Below ₹1 lakh / year',
  },
  senior: {
    ...base,
    occupation: 'Retired',
    pensionStatus: 'Not receiving a pension',
    ageGroup: '60+',
    income: '₹1–3 lakh / year',
  },
  disability: {
    ...base,
    occupation: 'Other',
    disability: 'Yes',
    ageGroup: '30–45',
    income: '₹1–3 lakh / year',
  },
  homemaker: {
    ...base,
    occupation: 'Homemaker',
    gender: 'Female',
    ageGroup: '30–45',
    income: 'Below ₹1 lakh / year',
  },
};

describe('analyzeHousehold — full catalogue, single engine', () => {
  it('evaluates every scheme in the 40-scheme catalogue', () => {
    const analysis = analyzeHousehold(personas.farmer, []);
    expect(analysis.evaluatedTotal).toBe(40);
    expect(analysis.evaluatedTotal).toBe(citizenSchemes.length);
  });

  it('gaps are a subset of the eligible recommendations from the shared engine', () => {
    const analysis = analyzeHousehold(personas.farmer, []);
    const eligible = new Set(
      recommend(personas.farmer)
        .filter((r) => r.tier === 'High relevance' || r.tier === 'Relevant' || r.tier === 'May be relevant')
        .map((r) => r.id),
    );
    expect(analysis.gaps.length).toBeGreaterThan(0);
    for (const gap of analysis.gaps) {
      expect(eligible.has(gap.schemeId)).toBe(true);
    }
  });

  it('gaps exclude schemes already recorded as coverage', () => {
    const analysis = analyzeHousehold(personas.farmer, ['pm-kisan', 'kcc']);
    const ids = analysis.gaps.map((gap) => gap.schemeId);
    expect(ids).not.toContain('pm-kisan');
    expect(ids).not.toContain('kcc');
  });

  it('gaps are returned strongest-first', () => {
    const analysis = analyzeHousehold(personas.farmer, []);
    const scores = analysis.gaps.map((gap) => gap.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});

describe('analyzeHousehold — persona sane scheme surfaces', () => {
  it('farmer: agriculture schemes are potential gaps, and every other persona is free of agriculture dominance unless relevant', () => {
    const farmerGaps = analyzeHousehold(personas.farmer, []).gaps.map((gap) => gap.schemeId);
    expect(farmerGaps).toContain('pm-kisan');
    expect(farmerGaps).toContain('kcc');
  });

  it('student: education and skill schemes rank as gaps, agriculture is not surfaced', () => {
    const gaps = analyzeHousehold(personas.student, []).gaps;
    const ids = gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('scholarship');
    expect(ids).toContain('apprenticeship');
    expect(ids).toContain('pmkvy');
    expect(ids).not.toContain('pm-kisan');
  });

  it('business owner: business / micro-credit schemes are potential gaps, PM-KISAN is not', () => {
    const gaps = analyzeHousehold(personas.business, []).gaps;
    const ids = gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('mudra');
    expect(ids).toContain('pmegp');
    expect(ids).not.toContain('pm-kisan');
  });

  it('salaried employee: employment-linked schemes are potential gaps', () => {
    const ids = analyzeHousehold(personas.salaried, []).gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('epf-esic');
    expect(ids).not.toContain('mgnrega');
  });

  it('unemployed person: workfare and skilling schemes are potential gaps', () => {
    const ids = analyzeHousehold(personas.unemployed, []).gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('mgnrega');
    expect(ids).toContain('pm-yuva');
    expect(ids).toContain('pmkvy');
  });

  it('senior without pension: pension and food-security schemes are potential gaps', () => {
    const ids = analyzeHousehold(personas.senior, []).gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('nsap');
    expect(ids).toContain('annapurna');
    expect(ids).not.toContain('pm-kisan');
  });

  it('person with disability: disability scheme is a potential gap above agriculture', () => {
    const gaps = analyzeHousehold(personas.disability, []).gaps;
    const adip = gaps.find((gap) => gap.schemeId === 'adip');
    const pmKisan = gaps.find((gap) => gap.schemeId === 'pm-kisan');
    expect(adip).toBeDefined();
    expect(adip?.score).toBeGreaterThanOrEqual(58);
    if (pmKisan) expect(adip ? adip.score : 0).toBeGreaterThan(pmKisan.score);
  });

  it('homemaker / women-focused: self-help and women schemes are potential gaps', () => {
    const ids = analyzeHousehold(personas.homemaker, []).gaps.map((gap) => gap.schemeId);
    expect(ids).toContain('lakhpati-didi');
    expect(ids).toContain('day-nrlm');
  });
});

describe('analyzeHousehold — overlap map only', () => {
  it('overlap pairs reference only relationships declared in schemeOverlapMap', () => {
    const validIds = new Set(citizenSchemes.map((scheme) => scheme.id));
    for (const key of Object.keys(schemeOverlapMap)) {
      expect(validIds.has(key)).toBe(true);
      for (const linked of schemeOverlapMap[key]) {
        expect(validIds.has(linked)).toBe(true);
      }
    }
  });

  it('both-currently-covered relationship surfaces a single deduplicated overlap', () => {
    const analysis = analyzeHousehold(personas.business, ['mudra', 'svanidhi']);
    const overlaps = analysis.overlaps.filter(
      (item) =>
        (item.existingSchemeId === 'mudra' && item.potentialSchemeId === 'svanidhi') ||
        (item.existingSchemeId === 'svanidhi' && item.potentialSchemeId === 'mudra'),
    );
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].relationship).toBe('both currently covered');
    expect(overlaps[0].status).toBe('Potential overlapping welfare coverage');
    expect(overlaps[0].verification).toBe('Requires verification');
  });

  it('profile-eligible overlap between a covered scheme and an eligible linked scheme', () => {
    const analysis = analyzeHousehold(personas.student, ['scholarship']);
    const overlap = analysis.overlaps.find(
      (item) => item.existingSchemeId === 'scholarship' && item.potentialSchemeId === 'pmkvy',
    );
    expect(overlap).toBeDefined();
    expect(overlap?.relationship).toBe('profile suggests eligibility');
  });

  it('does not invent overlaps when the linked scheme is neither covered nor eligible', () => {
    const analysis = analyzeHousehold(personas.student, ['pmay-u']);
    expect(analysis.overlaps).toHaveLength(0);
  });
});

describe('analyzeHousehold — careful wording', () => {
  it('never claims fraud, duplicate beneficiaries or definite eligibility', () => {
    for (const profile of Object.values(personas)) {
      const { gaps, overlaps } = analyzeHousehold(profile, ['pm-jay']);
      const text = [...gaps, ...overlaps]
        .map((item) => {
          if ('schemeName' in item) return [item.schemeName, item.signalText, ...item.matches, ...item.missing].join(' ');
          return [item.reason, item.status, item.verification].join(' ');
        })
        .join(' ')
        .toLowerCase();
      expect(text).not.toMatch(/fraud/);
      expect(text).not.toMatch(/duplicate beneficiary/);
      expect(text).not.toMatch(/definitely eligible/);
      expect(text).not.toMatch(/definitely missing/);
    }
  });
});

describe('buildVerificationCaseRow — verification pipeline integration', () => {
  it('builds a synthetic, clearly-labelled Needing-review case with household traceability', () => {
    const row = buildVerificationCaseRow({
      household: { householdRef: 'HH-0042', locality: 'Sohna', district: 'Sohna', state: 'Haryana' },
      kind: 'gap',
      schemeName: 'PM-KISAN',
      purpose: 'Agriculture',
      score: 92,
      confidence: 'High',
      signal: 'Potential welfare gap for PM-KISAN. Your main activity (Farmer) matches.',
    });
    expect(row.id).toMatch(/^HHVC-[0-9A-HJ-NP-Z]{6}$/);
    expect(row.status).toBe('Needs review');
    expect(row.scheme).toBe('PM-KISAN');
    expect(row.location).toBe('Sohna, Sohna, Haryana');
    expect(row.signal).toContain('Synthetic prototype finding');
    expect(row.householdRef).toBe('HH-0042');
    expect(row.kind).toBe('gap');
    expect(row.purpose).toBe('Agriculture');
    expect(row.score).toBe(92);
  });
});