import { describe, expect, it } from 'vitest';
import {
  OCCUPATION_OPTIONS,
  defaultCitizenProfile,
  type CitizenProfile,
} from './citizen';
import {
  USER_ENTERED_DATASET_LABEL,
  USER_ENTERED_SCENARIO,
  archetypeOfOccupation,
  buildProfile,
  derivedEmployment,
  headLabelOf,
  householdRefFrom,
  occupationPresets,
} from './manualHousehold';

describe('manualHousehold labels', () => {
  it('keeps user-entered households clearly distinct from synthetic data', () => {
    expect(USER_ENTERED_DATASET_LABEL).toBe('User-entered · Prototype Data');
    expect(USER_ENTERED_SCENARIO).toBe('user-entered');
    expect(USER_ENTERED_DATASET_LABEL).not.toContain('Synthetic');
  });

  it('derives an archetype key for every occupation option', () => {
    for (const occupation of OCCUPATION_OPTIONS) {
      expect(archetypeOfOccupation(occupation), occupation).toBeTruthy();
    }
    expect(archetypeOfOccupation('Farmer')).toBe('farmer');
    expect(archetypeOfOccupation('Student')).toBe('student');
    expect(archetypeOfOccupation('Retired')).toBe('senior');
    expect(archetypeOfOccupation('Sandwich artist')).toBe('other');
  });

  it('builds a PII-free household label from occupation and age', () => {
    expect(headLabelOf('Farmer', '30–45')).toBe('Farmer, 37');
    expect(headLabelOf('Retired', '60+')).toBe('Retired, 66');
  });

  it('derives a valid employment value for every occupation', () => {
    const valid = ['Employed', 'Self-employed', 'Looking for work', 'Studying', 'Not currently working'];
    for (const occupation of OCCUPATION_OPTIONS) {
      expect(valid, occupation).toContain(derivedEmployment(occupation));
    }
  });
});

describe('manualHousehold refresh codes', () => {
  it('encodes bytes into a 4-character uppercase code', () => {
    const code = householdRefFrom([1, 2, 3, 4]);
    expect(code).toHaveLength(4);
    expect(code).toMatch(/^[A-Z2-9]{4}$/);
  });

  it('is deterministic for the same bytes', () => {
    const bytes = [13, 27, 8, 5];
    expect(householdRefFrom(bytes)).toBe(householdRefFrom(bytes));
    expect(householdRefFrom(bytes)).not.toBe(householdRefFrom([5, 8, 27, 13]));
  });
});

describe('manualHousehold presets', () => {
  it('returns presets only for occupations with dedicated sections', () => {
    expect(occupationPresets('Farmer')).toHaveProperty('agriculturalActivity', 'Farmer / cultivator');
    expect(occupationPresets('Student')).toHaveProperty('studying', 'Full-time');
    expect(occupationPresets('Street vendor')).toHaveProperty('businessStatus', 'Street vending');
    expect(occupationPresets('Retired')).toHaveProperty('pensionStatus', 'Receiving a pension');
    expect(occupationPresets('Government employee')).toEqual({});
  });
});

describe('manualHousehold buildProfile', () => {
  const required: (keyof CitizenProfile)[] = [
    'state', 'district', 'locality', 'ageGroup', 'gender', 'maritalStatus', 'disability',
    'socialCategory', 'occupation', 'education', 'householdSize', 'children', 'dependents',
    'elderlyMembers', 'disabledMembers', 'income', 'housing', 'employment',
    'previousOccupation', 'pensionStatus', 'pensionSource', 'pensionRange', 'stillWorking',
    'seekingWork', 'informalWorker', 'agriculturalActivity', 'agriculturalLand',
    'landholding', 'cultivation', 'irrigation', 'studying', 'courseField', 'skillTraining',
    'lookingForEmployment', 'apprenticeshipInterest', 'businessStatus', 'newBusiness',
    'businessSize', 'formalBusiness', 'vendorStatus', 'interestedInBusiness',
    'existingPension', 'existingWelfare', 'healthCoverage', 'rationSupport',
    'housingSupport', 'educationSupport', 'livelihoodSupport', 'situation',
  ];

  it('always returns a complete profile with every field populated', () => {
    for (const field of required) {
      const profile = buildProfile({ occupation: 'Farmer' });
      expect(typeof profile[field], field).toBe('string');
      expect(profile[field].length, field).toBeGreaterThan(0);
    }
  });

  it('fills gaps from the citizen defaults', () => {
    const profile = buildProfile({ state: 'Haryana', district: 'Sohna', locality: 'Sohna' });
    expect(profile.state).toBe('Haryana');
    expect(profile.ageGroup).toBe(defaultCitizenProfile.ageGroup);
    expect(profile.housing).toBe(defaultCitizenProfile.housing);
  });

  it('derives employment from occupation and records the situation summary', () => {
    const farmer = buildProfile({ occupation: 'Farmer' });
    expect(farmer.employment).toBe('Self-employed');
    expect(farmer.situation).toContain('Farmer');

    const student = buildProfile({ occupation: 'Student' });
    expect(student.employment).toBe('Studying');
  });

  it('ignores blank or over-length values', () => {
    const profile = buildProfile({ gender: 'Female', locality: '   ', state: 'x'.repeat(300) });
    expect(profile.gender).toBe('Female');
    expect(profile.locality).toBe(defaultCitizenProfile.locality);
    expect(profile.state).toBe(defaultCitizenProfile.state);
  });
});