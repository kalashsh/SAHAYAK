// ---------------------------------------------------------------------------
// SAHAYAK · Synthetic household welfare dataset (PS-3 demonstration only)
// ---------------------------------------------------------------------------
// This module generates clearly labelled SYNTHETIC / PROTOTYPE households for
// the admin household-welfare workspace. It is NOT real government beneficiary
// data. No real names, Aadhaar numbers, ration card numbers, phone numbers or
// real beneficiary records are used.
//
// Every household:
//   - is stored with `scenario = 'synthetic'`
//   - carries `dataset = 'Synthetic · Prototype Data'`
//   - has a full structured CitizenProfile (the exact shape consumed by the
//     EXISTING recommendation engine in server/recommendations.ts)
//   - has a set of current welfare coverage records (demo_coverage)
//
// Generation is DETERMINISTIC (fixed PRNG seed) so that seeding is idempotent:
// re-running db:seed produces the exact same rows and never mounts duplicates.
// ---------------------------------------------------------------------------

import {
  AGE_GROUP_OPTIONS,
  AGRICULTURAL_ACTIVITY_OPTIONS,
  AGRICULTURAL_LAND_OPTIONS,
  APPRENTICESHIP_INTEREST_OPTIONS,
  BUSINESS_SIZE_OPTIONS,
  BUSINESS_STATUS_OPTIONS,
  CHILDREN_OPTIONS,
  COURSE_FIELD_OPTIONS,
  CULTIVATION_OPTIONS,
  DEPENDENTS_OPTIONS,
  DISABLED_MEMBERS_OPTIONS,
  DISABILITY_OPTIONS,
  EDUCATION_OPTIONS,
  ELDERLY_MEMBERS_OPTIONS,
  EMPLOYMENT_OPTIONS,
  EXISTING_PENSION_OPTIONS,
  EXISTING_WELFARE_OPTIONS,
  FORMAL_BUSINESS_OPTIONS,
  GENDER_OPTIONS,
  HEALTH_COVERAGE_OPTIONS,
  HOUSEHOLD_SIZE_OPTIONS,
  HOUSING_OPTIONS,
  INCOME_OPTIONS,
  INFORMAL_WORKER_OPTIONS,
  INTERESTED_IN_BUSINESS_OPTIONS,
  IRRIGATION_OPTIONS,
  LANDHOLDING_OPTIONS,
  LOOKING_FOR_EMPLOYMENT_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NEW_BUSINESS_OPTIONS,
  OCCUPATION_OPTIONS,
  PENSION_RANGE_OPTIONS,
  PENSION_SOURCE_OPTIONS,
  PENSION_STATUS_OPTIONS,
  PREVIOUS_OCCUPATION_OPTIONS,
  SEEKING_WORK_OPTIONS,
  SKILL_TRAINING_OPTIONS,
  SOCIAL_CATEGORY_OPTIONS,
  STILL_WORKING_OPTIONS,
  STUDYING_OPTIONS,
  VENDOR_STATUS_OPTIONS,
  defaultCitizenProfile,
  indiaStates,
  type CitizenProfile,
} from "../../client/src/lib/citizen.ts";
import type { NewDemoCoverage, NewDemoHousehold } from "./schema";

// ---------------------------------------------------------------------------
// Deterministic PRNG
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

const pick = <T>(rng: Rng, options: readonly T[]): T => options[Math.floor(rng() * options.length)];

function shuffled<T>(rng: Rng, input: readonly T[]): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Geography pool (weighted towards the Delhi NCR pilot region already shown
// in the existing district data; still spans every state in the catalogue)
// ---------------------------------------------------------------------------

type Geo = { state: string; district: string; locality: string };

function buildGeoPool(): Geo[] {
  const pool: Geo[] = [];
  const pilotStates = new Set(["Delhi", "Haryana", "Uttar Pradesh"]);
  for (const state of indiaStates) {
    const weight = pilotStates.has(state.name) ? 4 : 1;
    for (let w = 0; w < weight; w++) {
      for (const district of state.districts) {
        for (const locality of district.localities) {
          pool.push({ state: state.name, district: district.name, locality });
        }
      }
    }
  }
  return pool;
}

// ---------------------------------------------------------------------------
// Scheme → purpose mapping (mirrors the citizen scheme catalogue purposes)
// ---------------------------------------------------------------------------

export const SCHEME_PURPOSE: Record<string, string> = {
  "pm-kisan": "Agriculture",
  kcc: "Agriculture",
  "fasal-bima": "Agriculture",
  "pm-kusum": "Agriculture",
  "soil-health": "Agriculture",
  pmksy: "Agriculture",
  "pmay-g": "Housing",
  "pmay-u": "Housing",
  mgnrega: "Livelihood",
  svanidhi: "Livelihood",
  pmegp: "Livelihood",
  "day-nrlm": "Livelihood",
  "lakhpati-didi": "Livelihood",
  "e-shram": "Livelihood",
  "pm-viswakarma": "Livelihood",
  "pm-yuva": "Livelihood",
  cgtmse: "Financial inclusion",
  mudra: "Financial inclusion",
  "stand-up-india": "Financial inclusion",
  "pm-surya-ghar": "Financial inclusion",
  "jan-dhan": "Financial inclusion",
  pmjjby: "Financial inclusion",
  pmsby: "Financial inclusion",
  scholarship: "Education",
  pmkvy: "Education",
  apprenticeship: "Education",
  "mid-day-meal": "Education",
  nsap: "Pension",
  "pm-vaya-vandana": "Pension",
  apy: "Pension",
  "pm-sym": "Pension",
  "epf-esic": "Pension",
  "pm-jay": "Healthcare",
  janaushadhi: "Healthcare",
  "antodaya-anna": "Food security",
  annapurna: "Food security",
  "sukanya-samriddhi": "Women & Child",
  pmmvy: "Women & Child",
  adip: "Disability",
  nishtha: "Disability",
};

// ---------------------------------------------------------------------------
// Representative age for a label (an age group becomes one number)
// ---------------------------------------------------------------------------

const ageNumOf = (group: string): number => {
  if (group === AGE_GROUP_OPTIONS[0]) return 24;
  if (group === AGE_GROUP_OPTIONS[1]) return 37;
  if (group === AGE_GROUP_OPTIONS[2]) return 53;
  return 66;
};

// ---------------------------------------------------------------------------
// Archetype builders. Each returns a full CitizenProfile patch, a coverage
// pool (plausible current-welfare records), and a human title for the label.
// All values come from the exported option lists so they are always valid.
// ---------------------------------------------------------------------------

type Spec = { patch: Partial<CitizenProfile>; pool: string[]; title: string };

const LOW_INCOME: readonly string[] = [INCOME_OPTIONS[1], INCOME_OPTIONS[2]];
const MID_INCOME: readonly string[] = [INCOME_OPTIONS[2], INCOME_OPTIONS[3]];

const buildFarmer = (rng: Rng): Spec => {
  const holding = pick(rng, [LANDHOLDING_OPTIONS[1], LANDHOLDING_OPTIONS[1], LANDHOLDING_OPTIONS[1], LANDHOLDING_OPTIONS[2], LANDHOLDING_OPTIONS[2], LANDHOLDING_OPTIONS[3]]);
  const title = holding === LANDHOLDING_OPTIONS[1] ? "Smallholder farmer" : holding === LANDHOLDING_OPTIONS[2] ? "Farmer" : "Large-landholding farmer";
  const ageGroup = pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[3]]);
  return {
    title,
    patch: {
      ageGroup,
      gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
      maritalStatus: MARITAL_STATUS_OPTIONS[0],
      socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
      occupation: OCCUPATION_OPTIONS[0],
      education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[3]]),
      householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[5]]),
      children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2], CHILDREN_OPTIONS[3]]),
      dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2], DEPENDENTS_OPTIONS[0]]),
      elderlyMembers: pick(rng, [ELDERLY_MEMBERS_OPTIONS[0], ELDERLY_MEMBERS_OPTIONS[0], ELDERLY_MEMBERS_OPTIONS[1]]),
      income: holding === LANDHOLDING_OPTIONS[1] ? pick(rng, LOW_INCOME) : pick(rng, [...LOW_INCOME, INCOME_OPTIONS[3]]),
      housing: HOUSING_OPTIONS[0],
      employment: EMPLOYMENT_OPTIONS[1],
      agriculturalActivity: AGRICULTURAL_ACTIVITY_OPTIONS[0],
      agriculturalLand: AGRICULTURAL_LAND_OPTIONS[0],
      landholding: holding,
      cultivation: pick(rng, [CULTIVATION_OPTIONS[0], CULTIVATION_OPTIONS[2], CULTIVATION_OPTIONS[1]]),
      irrigation: pick(rng, [IRRIGATION_OPTIONS[0], IRRIGATION_OPTIONS[1], IRRIGATION_OPTIONS[2]]),
      informalWorker: INFORMAL_WORKER_OPTIONS[1],
      existingPension: EXISTING_PENSION_OPTIONS[0],
      pensionStatus: PENSION_STATUS_OPTIONS[0],
    },
    pool: ["pm-kisan", "kcc", "soil-health", "fasal-bima", "pmksy", "antodaya-anna", "pm-jay", "jan-dhan"],
  };
};

const buildAgriWorker = (rng: Rng): Spec => {
  const ageGroup = pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[0]]);
  return {
    title: "Agricultural worker",
    patch: {
      ageGroup,
      gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
      maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[1]]),
      socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
      occupation: OCCUPATION_OPTIONS[1],
      education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1]]),
      householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4]]),
      children: pick(rng, [CHILDREN_OPTIONS[0], CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2]]),
      dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
      elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
      income: INCOME_OPTIONS[1],
      housing: pick(rng, [HOUSING_OPTIONS[2], HOUSING_OPTIONS[1], HOUSING_OPTIONS[3]]),
      employment: pick(rng, [EMPLOYMENT_OPTIONS[1], EMPLOYMENT_OPTIONS[2]]),
      agriculturalActivity: AGRICULTURAL_ACTIVITY_OPTIONS[1],
      agriculturalLand: pick(rng, [AGRICULTURAL_LAND_OPTIONS[2], AGRICULTURAL_LAND_OPTIONS[2], AGRICULTURAL_LAND_OPTIONS[3]]),
      landholding: LANDHOLDING_OPTIONS[4],
      cultivation: CULTIVATION_OPTIONS[5],
      informalWorker: INFORMAL_WORKER_OPTIONS[1],
      seekingWork: pick(rng, [SEEKING_WORK_OPTIONS[0], SEEKING_WORK_OPTIONS[1]]),
    },
    pool: ["e-shram", "mgnrega", "pm-jay", "antodaya-anna", "jan-dhan", "pm-sym", "pmsby"],
  };
};

const buildStudent = (rng: Rng): Spec => {
  const course = pick(rng, [COURSE_FIELD_OPTIONS[0], COURSE_FIELD_OPTIONS[1], COURSE_FIELD_OPTIONS[2], COURSE_FIELD_OPTIONS[3], COURSE_FIELD_OPTIONS[5]]);
  return {
    title: `Student (${course})`,
    patch: {
      ageGroup: AGE_GROUP_OPTIONS[0],
      gender: pick(rng, [GENDER_OPTIONS[0], GENDER_OPTIONS[1]]),
      maritalStatus: MARITAL_STATUS_OPTIONS[1],
      socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
      occupation: OCCUPATION_OPTIONS[7],
      education: pick(rng, [EDUCATION_OPTIONS[2], EDUCATION_OPTIONS[2], EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[3]]),
      householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[2]]),
      children: CHILDREN_OPTIONS[0],
      dependents: pick(rng, [DEPENDENTS_OPTIONS[0], DEPENDENTS_OPTIONS[1]]),
      elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
      income: pick(rng, LOW_INCOME),
      housing: HOUSING_OPTIONS[2],
      employment: EMPLOYMENT_OPTIONS[3],
      previousOccupation: PREVIOUS_OCCUPATION_OPTIONS[0],
      studying: pick(rng, [STUDYING_OPTIONS[0], STUDYING_OPTIONS[0], STUDYING_OPTIONS[1]]),
      courseField: course,
      skillTraining: pick(rng, [SKILL_TRAINING_OPTIONS[0], SKILL_TRAINING_OPTIONS[2], SKILL_TRAINING_OPTIONS[1]]),
      lookingForEmployment: pick(rng, [LOOKING_FOR_EMPLOYMENT_OPTIONS[0], LOOKING_FOR_EMPLOYMENT_OPTIONS[1]]),
      apprenticeshipInterest: pick(rng, [APPRENTICESHIP_INTEREST_OPTIONS[0], APPRENTICESHIP_INTEREST_OPTIONS[1], APPRENTICESHIP_INTEREST_OPTIONS[2]]),
    },
    pool: ["scholarship", "mid-day-meal", "pmkvy", "apprenticeship", "pm-yuva", "jan-dhan"],
  };
};

const buildSalaried = (rng: Rng): Spec => ({
  title: "Private employee",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: MARITAL_STATUS_OPTIONS[0],
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0], SOCIAL_CATEGORY_OPTIONS[4]]),
    occupation: pick(rng, [OCCUPATION_OPTIONS[4], OCCUPATION_OPTIONS[6]]),
    education: pick(rng, [EDUCATION_OPTIONS[2], EDUCATION_OPTIONS[3]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4]]),
    children: pick(rng, [CHILDREN_OPTIONS[0], CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[0], DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: pick(rng, [INCOME_OPTIONS[2], INCOME_OPTIONS[3], INCOME_OPTIONS[3]]),
    housing: pick(rng, [HOUSING_OPTIONS[0], HOUSING_OPTIONS[1]]),
    employment: EMPLOYMENT_OPTIONS[0],
    pensionStatus: PENSION_STATUS_OPTIONS[0],
    existingPension: EXISTING_PENSION_OPTIONS[0],
    informalWorker: INFORMAL_WORKER_OPTIONS[0],
  },
  pool: ["epf-esic", "pm-jay", "jan-dhan", "pmjjby", "pmsby", "pm-sym"],
});

const buildGovt = (rng: Rng): Spec => ({
  title: "Government employee",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: MARITAL_STATUS_OPTIONS[0],
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
    occupation: OCCUPATION_OPTIONS[5],
    education: EDUCATION_OPTIONS[2],
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3]]),
    children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[0], DEPENDENTS_OPTIONS[1]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: pick(rng, [INCOME_OPTIONS[3], INCOME_OPTIONS[4]]),
    housing: HOUSING_OPTIONS[0],
    employment: EMPLOYMENT_OPTIONS[0],
    pensionStatus: PENSION_STATUS_OPTIONS[0],
    existingPension: EXISTING_PENSION_OPTIONS[0],
    informalWorker: INFORMAL_WORKER_OPTIONS[0],
  },
  pool: ["epf-esic", "pm-jay", "jan-dhan", "pmjjby"],
});

const buildBusiness = (rng: Rng): Spec => ({
  title: "Business owner",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[1]]),
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0], SOCIAL_CATEGORY_OPTIONS[2]]),
    occupation: pick(rng, [OCCUPATION_OPTIONS[2], OCCUPATION_OPTIONS[3]]),
    education: pick(rng, [EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[2], EDUCATION_OPTIONS[3]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4]]),
    children: pick(rng, [CHILDREN_OPTIONS[0], CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[0], DEPENDENTS_OPTIONS[1]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: pick(rng, MID_INCOME),
    housing: pick(rng, [HOUSING_OPTIONS[0], HOUSING_OPTIONS[1]]),
    employment: EMPLOYMENT_OPTIONS[1],
    businessStatus: pick(rng, [BUSINESS_STATUS_OPTIONS[0], BUSINESS_STATUS_OPTIONS[0], BUSINESS_STATUS_OPTIONS[2]]),
    newBusiness: pick(rng, NEW_BUSINESS_OPTIONS),
    businessSize: pick(rng, [BUSINESS_SIZE_OPTIONS[0], BUSINESS_SIZE_OPTIONS[1], BUSINESS_SIZE_OPTIONS[2]]),
    formalBusiness: pick(rng, [FORMAL_BUSINESS_OPTIONS[0], FORMAL_BUSINESS_OPTIONS[1]]),
    interestedInBusiness: pick(rng, [INTERESTED_IN_BUSINESS_OPTIONS[0], INTERESTED_IN_BUSINESS_OPTIONS[1]]),
    informalWorker: INFORMAL_WORKER_OPTIONS[0],
  },
  pool: ["mudra", "pmegp", "cgtmse", "jan-dhan", "pmjjby", "pmsby", "pm-viswakarma", "stand-up-india"],
});

const buildVendor = (rng: Rng): Spec => ({
  title: "Street vendor",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[0]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[1]]),
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
    occupation: OCCUPATION_OPTIONS[11],
    education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4]]),
    children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2], CHILDREN_OPTIONS[0]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: pick(rng, LOW_INCOME),
    housing: pick(rng, [HOUSING_OPTIONS[1], HOUSING_OPTIONS[2], HOUSING_OPTIONS[3]]),
    employment: EMPLOYMENT_OPTIONS[1],
    businessStatus: BUSINESS_STATUS_OPTIONS[3],
    vendorStatus: pick(rng, [VENDOR_STATUS_OPTIONS[0], VENDOR_STATUS_OPTIONS[1]]),
    informalWorker: INFORMAL_WORKER_OPTIONS[1],
  },
  pool: ["svanidhi", "jan-dhan", "pm-jay", "pmsby", "pm-sym", "pmegp"],
});

const buildWageWorker = (rng: Rng): Spec => ({
  title: "Daily wage worker",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[0]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[1]]),
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1]]),
    occupation: OCCUPATION_OPTIONS[10],
    education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[5]]),
    children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2], CHILDREN_OPTIONS[3]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: INCOME_OPTIONS[1],
    housing: pick(rng, [HOUSING_OPTIONS[1], HOUSING_OPTIONS[2], HOUSING_OPTIONS[3]]),
    employment: pick(rng, [EMPLOYMENT_OPTIONS[0], EMPLOYMENT_OPTIONS[2], EMPLOYMENT_OPTIONS[4]]),
    informalWorker: INFORMAL_WORKER_OPTIONS[1],
    seekingWork: pick(rng, [SEEKING_WORK_OPTIONS[0], SEEKING_WORK_OPTIONS[1]]),
    previousOccupation: pick(rng, [PREVIOUS_OCCUPATION_OPTIONS[1], PREVIOUS_OCCUPATION_OPTIONS[7], PREVIOUS_OCCUPATION_OPTIONS[0]]),
  },
  pool: ["e-shram", "pm-sym", "mgnrega", "pm-jay", "jan-dhan", "pmsby", "antodaya-anna", "pmkvy"],
});

const buildUnemployed = (rng: Rng): Spec => ({
  title: "Seeking work",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[0], AGE_GROUP_OPTIONS[1]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[1], MARITAL_STATUS_OPTIONS[0]]),
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
    occupation: OCCUPATION_OPTIONS[8],
    education: pick(rng, [EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[2], EDUCATION_OPTIONS[3]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[4]]),
    children: pick(rng, [CHILDREN_OPTIONS[0], CHILDREN_OPTIONS[1]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    income: pick(rng, [INCOME_OPTIONS[1], INCOME_OPTIONS[4]]),
    housing: pick(rng, [HOUSING_OPTIONS[2], HOUSING_OPTIONS[1], HOUSING_OPTIONS[3]]),
    employment: EMPLOYMENT_OPTIONS[2],
    seekingWork: SEEKING_WORK_OPTIONS[0],
    previousOccupation: pick(rng, [PREVIOUS_OCCUPATION_OPTIONS[7], PREVIOUS_OCCUPATION_OPTIONS[6], PREVIOUS_OCCUPATION_OPTIONS[4], PREVIOUS_OCCUPATION_OPTIONS[0]]),
    skillTraining: pick(rng, [SKILL_TRAINING_OPTIONS[0], SKILL_TRAINING_OPTIONS[2]]),
    apprenticeshipInterest: pick(rng, [APPRENTICESHIP_INTEREST_OPTIONS[0], APPRENTICESHIP_INTEREST_OPTIONS[1]]),
  },
  pool: ["pmkvy", "pm-yuva", "apprenticeship", "e-shram", "pm-sym", "jan-dhan", "mgnrega"],
});

const buildHomemaker = (rng: Rng): Spec => ({
  title: "Homemaker",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2]]),
    gender: GENDER_OPTIONS[0],
    maritalStatus: MARITAL_STATUS_OPTIONS[0],
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1]]),
    occupation: OCCUPATION_OPTIONS[9],
    education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[5]]),
    children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2], CHILDREN_OPTIONS[3]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: pick(rng, [ELDERLY_MEMBERS_OPTIONS[0], ELDERLY_MEMBERS_OPTIONS[1]]),
    income: pick(rng, LOW_INCOME),
    housing: pick(rng, [HOUSING_OPTIONS[0], HOUSING_OPTIONS[2]]),
    employment: EMPLOYMENT_OPTIONS[4],
    informalWorker: INFORMAL_WORKER_OPTIONS[1],
    interestedInBusiness: pick(rng, [INTERESTED_IN_BUSINESS_OPTIONS[1], INTERESTED_IN_BUSINESS_OPTIONS[2]]),
  },
  pool: ["pm-jay", "jan-dhan", "pmmvy", "antodaya-anna", "day-nrlm", "lakhpati-didi", "sukanya-samriddhi"],
});

const buildSenior = (rng: Rng): Spec => {
  const receiving = pick(rng, [true, false]);
  return {
    title: "Senior citizen",
    patch: {
      ageGroup: AGE_GROUP_OPTIONS[3],
      gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
      maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[2]]),
      socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[1], SOCIAL_CATEGORY_OPTIONS[0]]),
      occupation: pick(rng, [OCCUPATION_OPTIONS[12], OCCUPATION_OPTIONS[13]]),
      education: pick(rng, [EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[3]]),
      householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[1], HOUSEHOLD_SIZE_OPTIONS[2], HOUSEHOLD_SIZE_OPTIONS[3]]),
      children: CHILDREN_OPTIONS[0],
      dependents: CHILDREN_OPTIONS[0],
      elderlyMembers: pick(rng, [ELDERLY_MEMBERS_OPTIONS[1], ELDERLY_MEMBERS_OPTIONS[2]]),
      income: pick(rng, LOW_INCOME),
      housing: HOUSING_OPTIONS[0],
      employment: EMPLOYMENT_OPTIONS[4],
      previousOccupation: pick(rng, [PREVIOUS_OCCUPATION_OPTIONS[1], PREVIOUS_OCCUPATION_OPTIONS[2], PREVIOUS_OCCUPATION_OPTIONS[0]]),
      pensionStatus: receiving ? PENSION_STATUS_OPTIONS[1] : PENSION_STATUS_OPTIONS[0],
      pensionSource: receiving ? pick(rng, [PENSION_SOURCE_OPTIONS[0], PENSION_SOURCE_OPTIONS[1]]) : PENSION_SOURCE_OPTIONS[4],
      pensionRange: receiving ? pick(rng, [PENSION_RANGE_OPTIONS[1], PENSION_RANGE_OPTIONS[2]]) : PENSION_RANGE_OPTIONS[0],
      existingPension: receiving ? pick(rng, [EXISTING_PENSION_OPTIONS[1], EXISTING_PENSION_OPTIONS[2]]) : EXISTING_PENSION_OPTIONS[0],
      stillWorking: STILL_WORKING_OPTIONS[2],
    },
    pool: ["nsap", "annapurna", "pm-jay", "jan-dhan", "pm-vaya-vandana", "pmsby", "janaushadhi"],
  };
};

const buildDisabled = (rng: Rng): Spec => ({
  title: "Household with disability",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[1], AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[0]]),
    gender: pick(rng, [GENDER_OPTIONS[1], GENDER_OPTIONS[0]]),
    maritalStatus: pick(rng, [MARITAL_STATUS_OPTIONS[0], MARITAL_STATUS_OPTIONS[1], MARITAL_STATUS_OPTIONS[2]]),
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1]]),
    occupation: pick(rng, [OCCUPATION_OPTIONS[1], OCCUPATION_OPTIONS[9], OCCUPATION_OPTIONS[10], OCCUPATION_OPTIONS[3]]),
    education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1], EDUCATION_OPTIONS[3]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[2]]),
    children: pick(rng, [CHILDREN_OPTIONS[0], CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: ELDERLY_MEMBERS_OPTIONS[0],
    disabledMembers: pick(rng, [DISABLED_MEMBERS_OPTIONS[1], DISABLED_MEMBERS_OPTIONS[2]]),
    disability: DISABILITY_OPTIONS[1],
    income: pick(rng, [INCOME_OPTIONS[1], INCOME_OPTIONS[2]]),
    housing: pick(rng, [HOUSING_OPTIONS[2], HOUSING_OPTIONS[1], HOUSING_OPTIONS[3]]),
    employment: pick(rng, [EMPLOYMENT_OPTIONS[1], EMPLOYMENT_OPTIONS[4]]),
    informalWorker: INFORMAL_WORKER_OPTIONS[1],
  },
  pool: ["adip", "nishtha", "pm-jay", "jan-dhan", "pm-sym", "antodaya-anna", "nsap", "e-shram"],
});

const buildWidow = (rng: Rng): Spec => ({
  title: "Widowed head of household",
  patch: {
    ageGroup: pick(rng, [AGE_GROUP_OPTIONS[2], AGE_GROUP_OPTIONS[3], AGE_GROUP_OPTIONS[1]]),
    gender: GENDER_OPTIONS[0],
    maritalStatus: MARITAL_STATUS_OPTIONS[2],
    socialCategory: pick(rng, [SOCIAL_CATEGORY_OPTIONS[2], SOCIAL_CATEGORY_OPTIONS[3], SOCIAL_CATEGORY_OPTIONS[1]]),
    occupation: pick(rng, [OCCUPATION_OPTIONS[9], OCCUPATION_OPTIONS[10], OCCUPATION_OPTIONS[12]]),
    education: pick(rng, [EDUCATION_OPTIONS[0], EDUCATION_OPTIONS[1]]),
    householdSize: pick(rng, [HOUSEHOLD_SIZE_OPTIONS[3], HOUSEHOLD_SIZE_OPTIONS[4], HOUSEHOLD_SIZE_OPTIONS[2]]),
    children: pick(rng, [CHILDREN_OPTIONS[1], CHILDREN_OPTIONS[2], CHILDREN_OPTIONS[0]]),
    dependents: pick(rng, [DEPENDENTS_OPTIONS[1], DEPENDENTS_OPTIONS[2]]),
    elderlyMembers: pick(rng, [ELDERLY_MEMBERS_OPTIONS[0], ELDERLY_MEMBERS_OPTIONS[1]]),
    income: INCOME_OPTIONS[1],
    housing: pick(rng, [HOUSING_OPTIONS[2], HOUSING_OPTIONS[3], HOUSING_OPTIONS[1]]),
    employment: pick(rng, [EMPLOYMENT_OPTIONS[4], EMPLOYMENT_OPTIONS[2]]),
    pensionStatus: PENSION_STATUS_OPTIONS[0],
    existingPension: EXISTING_PENSION_OPTIONS[0],
  },
  pool: ["nsap", "pmay-g", "jan-dhan", "pm-jay", "pmmvy", "antodaya-anna"],
});

// ---------------------------------------------------------------------------
// Coverage sampling
// ---------------------------------------------------------------------------

function sampleCoverage(rng: Rng, pool: string[]): string[] {
  const roll = rng();
  let count: number;
  if (roll < 0.14) count = 0;
  else if (roll < 0.34) count = 1;
  else if (roll < 0.64) count = 2;
  else if (roll < 0.88) count = 3;
  else count = 4;
  if (count === 0) return [];
  const clamped = Math.min(count, pool.length);
  return shuffled(rng, pool).slice(0, clamped);
}

// ---------------------------------------------------------------------------
// Keep the profile's self-reported welfare fields consistent with the
// household's recorded coverage where possible.
// ---------------------------------------------------------------------------

function applyCoverageToProfile(profile: CitizenProfile, schemeIds: string[]): CitizenProfile {
  const p = { ...profile };
  const has = (id: string) => schemeIds.includes(id);

  if (has("pm-jay")) p.healthCoverage = HEALTH_COVERAGE_OPTIONS[1];
  else if (has("epf-esic")) p.healthCoverage = HEALTH_COVERAGE_OPTIONS[3];
  else p.healthCoverage = HEALTH_COVERAGE_OPTIONS[0];

  p.rationSupport = has("antodaya-anna") || has("annapurna") ? RATION_SUPPORT_YES : RATION_SUPPORT_NO;
  p.housingSupport = has("pmay-g") || has("pmay-u") ? HOUSING_SUPPORT_RECEIVING : HOUSING_SUPPORT_NONE;
  p.educationSupport = has("scholarship") ? EDUCATION_SUPPORT_SCHOLARSHIP : has("mid-day-meal") ? EDUCATION_SUPPORT_MIDDAY : EDUCATION_SUPPORT_NONE;
  p.livelihoodSupport = has("day-nrlm") ? LIVELIHOOD_SUPPORT_SHG : has("pmkvy") ? LIVELIHOOD_SUPPORT_SKILL : LIVELIHOOD_SUPPORT_NONE;

  const welfareParts: string[] = [];
  if (has("antodaya-anna") || has("annapurna")) welfareParts.push(EXISTING_WELFARE_OPTIONS[1]);
  if (has("pmay-g") || has("pmay-u")) welfareParts.push(EXISTING_WELFARE_OPTIONS[2]);
  if (has("pm-jay")) welfareParts.push(EXISTING_WELFARE_OPTIONS[3]);
  if (has("nsap") || has("pm-vaya-vandana") || has("apy") || has("pm-sym") || has("epf-esic")) welfareParts.push(EXISTING_WELFARE_OPTIONS[4]);
  if (has("pmkvy") || has("day-nrlm") || has("pm-yuva") || has("apprenticeship")) welfareParts.push(EXISTING_WELFARE_OPTIONS[5]);
  p.existingWelfare = welfareParts.length > 0 ? welfareParts[0] : EXISTING_WELFARE_OPTIONS[0];

  return p;
}

const RATION_SUPPORT_YES = "Yes, my household gets ration";
const RATION_SUPPORT_NO = "Not on the ration list";
const HOUSING_SUPPORT_RECEIVING = "Receiving housing support";
const HOUSING_SUPPORT_NONE = "None";
const EDUCATION_SUPPORT_SCHOLARSHIP = "Receiving a scholarship";
const EDUCATION_SUPPORT_MIDDAY = "Free education / midday meal";
const EDUCATION_SUPPORT_NONE = "None";
const LIVELIHOOD_SUPPORT_SHG = "Self-help group / livelihood support";
const LIVELIHOOD_SUPPORT_SKILL = "Skill training";
const LIVELIHOOD_SUPPORT_NONE = "None";

// ---------------------------------------------------------------------------
// Archetype table (counts sum to 200) with builders
// ---------------------------------------------------------------------------

type Archetype = { key: string; count: number; build: (rng: Rng) => Spec };

const ARCHETYPES: readonly Archetype[] = [
  { key: "farmer", count: 40, build: buildFarmer },
  { key: "agricultural-worker", count: 16, build: buildAgriWorker },
  { key: "student", count: 22, build: buildStudent },
  { key: "salaried", count: 18, build: buildSalaried },
  { key: "government-employee", count: 6, build: buildGovt },
  { key: "business", count: 20, build: buildBusiness },
  { key: "street-vendor", count: 10, build: buildVendor },
  { key: "daily-wage", count: 12, build: buildWageWorker },
  { key: "unemployed", count: 14, build: buildUnemployed },
  { key: "homemaker", count: 8, build: buildHomemaker },
  { key: "senior", count: 18, build: buildSenior },
  { key: "disability", count: 10, build: buildDisabled },
  { key: "widow", count: 6, build: buildWidow },
];

export const SYNTHETIC_DATASET_TOTAL = ARCHETYPES.reduce((sum, a) => sum + a.count, 0);

// ---------------------------------------------------------------------------
// Entry point: build the full deterministic synthetic dataset
// ---------------------------------------------------------------------------

export const SYNTHETIC_DATASET_LABEL = "Synthetic · Prototype Data";

export function buildSyntheticHouseholds(): { households: NewDemoHousehold[]; coverageRecords: NewDemoCoverage[] } {
  const rng = mulberry32(0x5e8a7c21);
  const geoPool = shuffled(rng, buildGeoPool());

  const households: NewDemoHousehold[] = [];
  const coverageRecords: NewDemoCoverage[] = [];

  let index = 0;
  let geoIndex = 0;

  for (const archetype of ARCHETYPES) {
    for (let i = 0; i < archetype.count; i++) {
      index += 1;
      const id = `HH-${String(index).padStart(4, "0")}`;
      const spec = archetype.build(rng);
      const geo = geoPool[geoIndex % geoPool.length];
      geoIndex += 1;

      let profile: CitizenProfile = {
        ...defaultCitizenProfile,
        ...spec.patch,
        state: geo.state,
        district: geo.district,
        locality: geo.locality,
      };

      const schemeIds = sampleCoverage(rng, spec.pool);
      profile = applyCoverageToProfile(profile, schemeIds);

      households.push({
        id,
        householdRef: id,
        state: geo.state,
        district: geo.district,
        locality: geo.locality,
        headLabel: `${spec.title}, ${ageNumOf(profile.ageGroup)}`,
        archetype: archetype.key,
        scenario: "synthetic",
        dataset: SYNTHETIC_DATASET_LABEL,
        profileJson: JSON.stringify(profile),
      });

      for (const schemeId of schemeIds) {
        coverageRecords.push({
          householdId: id,
          schemeId,
          purpose: SCHEME_PURPOSE[schemeId] ?? "Other",
          status: "active",
          source: "synthetic",
        });
      }
    }
  }

  return { households, coverageRecords };
}