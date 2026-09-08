// ---------------------------------------------------------------------------
// SAHAYAK · Manual (admin-entered) prototype household support
// ---------------------------------------------------------------------------
// Households entered by an administrator for the SIH prototype are kept fully
// apart from the synthetic dataset: they carry their own `dataset` label and a
// `scenario` that is user-entered, never synthetic. These helpers build a
// valid CitizenProfile, a PII-safe household label and the refresh code. No
// real names, Aadhaar numbers, phone numbers or other identifiers are ever
// collected or generated here.
// ---------------------------------------------------------------------------

import {
  AGE_GROUP_OPTIONS,
  defaultCitizenProfile,
  summarizeSituation,
  type CitizenProfile,
} from './citizen';

export const USER_ENTERED_DATASET_LABEL = 'User-entered · Prototype Data';
export const USER_ENTERED_SCENARIO = 'user-entered';

// Occupation → existing household archetype key (mirrors the synthetic set).
export const OCCUPATION_ARCHETYPE: Record<string, string> = {
  Farmer: 'farmer',
  'Agricultural worker': 'agricultural-worker',
  'Business owner': 'business',
  'Self-employed': 'business',
  'Salaried employee': 'salaried',
  'Government employee': 'government-employee',
  'Private employee': 'salaried',
  Student: 'student',
  'Unemployed / seeking work': 'unemployed',
  Homemaker: 'homemaker',
  'Daily wage worker': 'daily-wage',
  'Street vendor': 'street-vendor',
  Retired: 'senior',
  Pensioner: 'senior',
  Other: 'other',
};

export function archetypeOfOccupation(occupation: string): string {
  return OCCUPATION_ARCHETYPE[occupation] ?? 'other';
}

// Representative age for a label (an age group becomes one number).
const ageNumOf = (ageGroup: string): number => {
  if (ageGroup === AGE_GROUP_OPTIONS[0]) return 24;
  if (ageGroup === AGE_GROUP_OPTIONS[1]) return 37;
  if (ageGroup === AGE_GROUP_OPTIONS[2]) return 53;
  return 66;
};

// Descriptive, PII-free household label derived from occupation + age.
export function headLabelOf(occupation: string, ageGroup: string): string {
  return `${occupation}, ${ageNumOf(ageGroup)}`;
}

// Coherent default for the citizen `employment` field based on the main
// activity the administrator chose. The form does not expose this field; the
// value is derived so the stored profile always satisfies the engine.
export function derivedEmployment(occupation: string): string {
  switch (occupation) {
    case 'Farmer':
    case 'Agricultural worker':
    case 'Business owner':
    case 'Self-employed':
    case 'Street vendor':
      return 'Self-employed';
    case 'Salaried employee':
    case 'Government employee':
    case 'Private employee':
    case 'Daily wage worker':
      return 'Employed';
    case 'Student':
      return 'Studying';
    case 'Unemployed / seeking work':
      return 'Looking for work';
    default:
      return 'Not currently working';
  }
}

// Convenient field presets applied when an occupation is picked, so the
// adaptive sections start from plausible values the administrator can adjust.
export function occupationPresets(occupation: string): Partial<CitizenProfile> {
  switch (occupation) {
    case 'Farmer':
      return {
        agriculturalActivity: 'Farmer / cultivator',
        agriculturalLand: 'Yes, I own farmland',
        landholding: 'Up to 1 hectare',
        cultivation: 'Growing crops',
        irrigation: 'Rain-fed',
      };
    case 'Agricultural worker':
      return {
        agriculturalActivity: 'Agricultural worker',
        agriculturalLand: 'I lease or share farmland',
        landholding: 'I do not own land',
        cultivation: 'Growing crops',
        irrigation: 'Rain-fed',
      };
    case 'Business owner':
      return {
        businessStatus: 'Running a business',
        businessSize: 'Micro (under 10 people)',
        formalBusiness: 'Not registered',
      };
    case 'Self-employed':
      return {
        businessStatus: 'Self-employed freelance',
        businessSize: 'Just me / family only',
        formalBusiness: 'Not registered',
      };
    case 'Street vendor':
      return {
        businessStatus: 'Street vending',
        vendorStatus: 'Unregistered vendor',
        businessSize: 'Just me / family only',
      };
    case 'Student':
      return {
        studying: 'Full-time',
        courseField: 'Arts / humanities',
        skillTraining: 'Interested',
        lookingForEmployment: 'No',
        apprenticeshipInterest: 'Not sure',
      };
    case 'Retired':
    case 'Pensioner':
      return {
        pensionStatus: 'Receiving a pension',
        pensionSource: 'Government social pension',
        pensionRange: 'Below ₹10,000 / month',
        stillWorking: 'No',
        existingPension: 'Government / social pension',
      };
    default:
      return {};
  }
}

// Refresh code (e.g. "HH-7QK2") encoded from entropy bytes. Uses an
// unambiguous uppercase alphabet so codes stay readable in a demo.
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function householdRefFrom(bytes: number[] | Uint8Array): string {
  return Array.from(bytes, (byte) => REF_ALPHABET[byte % REF_ALPHABET.length]).join('');
}

// Builds a complete, valid CitizenProfile from whatever the form provided,
// falling back to the citizen defaults for anything missing so the stored
// profile always parses and drives the existing recommendation engine.
export function buildProfile(provided: Record<string, string>): CitizenProfile {
  const profile: CitizenProfile = { ...defaultCitizenProfile };
  for (const field of Object.keys(defaultCitizenProfile) as (keyof CitizenProfile)[]) {
    const value = provided[field];
    if (typeof value === 'string' && value.trim() && value.trim().length <= 200) {
      profile[field] = value.trim();
    }
  }
  profile.employment = derivedEmployment(profile.occupation);
  profile.situation = summarizeSituation(profile);
  return profile;
}