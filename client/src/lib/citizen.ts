// ---------------------------------------------------------------------------
// SAHAYAK · Citizen welfare recommendation core model
// ---------------------------------------------------------------------------
// The profile below is self-reported by the citizen through the wizard. Every
// field is an explicit answer string. "Prefer not to say" / "Not applicable"
// values represent information the citizen chose not to share.
// ---------------------------------------------------------------------------

export type CitizenProfile = {
  // Location
  state: string;
  district: string;
  locality: string;

  // A. About you
  ageGroup: string;
  gender: string;
  maritalStatus: string;
  disability: string;
  socialCategory: string;
  occupation: string;
  education: string;

  // B. Household
  householdSize: string;
  children: string;
  dependents: string;
  elderlyMembers: string;
  disabledMembers: string;
  income: string;
  housing: string;

  // C. Employment / livelihood
  employment: string;
  previousOccupation: string;
  pensionStatus: string;
  pensionSource: string;
  pensionRange: string;
  stillWorking: string;
  seekingWork: string;
  informalWorker: string;

  // D. Agriculture (asked only when relevant)
  agriculturalActivity: string;
  agriculturalLand: string;
  landholding: string;
  cultivation: string;
  irrigation: string;

  // E. Education (asked only when relevant)
  studying: string;
  courseField: string;
  skillTraining: string;
  lookingForEmployment: string;
  apprenticeshipInterest: string;

  // F. Business / self-employment (asked only when relevant)
  businessStatus: string;
  newBusiness: string;
  businessSize: string;
  formalBusiness: string;
  vendorStatus: string;
  interestedInBusiness: string;

  // G. Social / welfare situation (self-reported, optional)
  existingPension: string;
  existingWelfare: string;
  healthCoverage: string;
  rationSupport: string;
  housingSupport: string;
  educationSupport: string;
  livelihoodSupport: string;

  // Legacy free-text summary, kept for compatibility with stored profiles.
  situation: string;
};

export type IncomeLevel = 0 | 1 | 2 | 3 | -1;

export const incomeLevelOf = (income: string): IncomeLevel => {
  const value = (income ?? '').toLowerCase();
  if (value.includes('below')) return 0;
  if (value.includes('above')) return 3;
  if (value.includes('1\u2013') || value.includes('1-')) return 1;
  if (value.includes('3\u2013') || value.includes('3-')) return 2;
  return -1;
};

// ---------------------------------------------------------------------------
// Option lists used by the wizard (kept together for easy editing)
// ---------------------------------------------------------------------------

export const AGE_GROUP_OPTIONS = ['18–29', '30–45', '46–60', '60+'] as const;
export const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;
export const MARITAL_STATUS_OPTIONS = ['Married', 'Unmarried', 'Widowed', 'Divorced / separated', 'Prefer not to say'] as const;
export const DISABILITY_OPTIONS = ['No', 'Yes', 'Prefer not to say'] as const;
export const SOCIAL_CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Prefer not to say'] as const;
export const OCCUPATION_OPTIONS = [
  'Farmer',
  'Agricultural worker',
  'Business owner',
  'Self-employed',
  'Salaried employee',
  'Government employee',
  'Private employee',
  'Student',
  'Unemployed / seeking work',
  'Homemaker',
  'Daily wage worker',
  'Street vendor',
  'Retired',
  'Pensioner',
  'Other',
] as const;
export const EDUCATION_OPTIONS = ['Up to primary school', 'Secondary school', 'College or above', 'Diploma / vocational', 'Prefer not to say'] as const;

export const HOUSEHOLD_SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6 or more'] as const;
export const CHILDREN_OPTIONS = ['None', '1', '2', '3 or more'] as const;
export const DEPENDENTS_OPTIONS = ['None', '1', '2', '3 or more'] as const;
export const ELDERLY_MEMBERS_OPTIONS = ['None', '1', '2 or more'] as const;
export const DISABLED_MEMBERS_OPTIONS = ['None', '1', '2 or more'] as const;
export const INCOME_OPTIONS = ['Prefer not to say', 'Below ₹1 lakh / year', '₹1–3 lakh / year', '₹3–6 lakh / year', 'Above ₹6 lakh / year'] as const;
export const HOUSING_OPTIONS = ['Own home', 'Renting', 'Shared / family home', 'No permanent house', 'Other'] as const;

export const EMPLOYMENT_OPTIONS = ['Employed', 'Self-employed', 'Looking for work', 'Studying', 'Not currently working'] as const;
export const PREVIOUS_OCCUPATION_OPTIONS = [
  'Not applicable',
  'Agriculture',
  'Salaried',
  'Government service',
  'Private employment',
  'Business',
  'Self-employed',
  'Daily wage',
  'Other',
] as const;
export const PENSION_STATUS_OPTIONS = ['Not receiving a pension', 'Receiving a pension', 'Applying for a pension'] as const;
export const PENSION_SOURCE_OPTIONS = [
  'Government social pension',
  'EPFO / employer pension',
  'Private / LIC pension',
  'Other',
  'Not receiving a pension',
] as const;
export const PENSION_RANGE_OPTIONS = ['Prefer not to say', 'Below ₹10,000 / month', '₹10,000–25,000 / month', 'Above ₹25,000 / month'] as const;
export const STILL_WORKING_OPTIONS = ['Yes, full-time', 'Yes, part-time', 'No'] as const;
export const SEEKING_WORK_OPTIONS = ['Yes', 'No', 'Not applicable'] as const;
export const INFORMAL_WORKER_OPTIONS = ['No', 'Yes', 'Prefer not to say'] as const;

export const AGRICULTURAL_ACTIVITY_OPTIONS = [
  'Farmer / cultivator',
  'Agricultural worker',
  'Fishing / livestock / allied activity',
  'Not applicable',
  'Not disclosed',
] as const;
export const AGRICULTURAL_LAND_OPTIONS = ['Yes, I own farmland', 'I lease or share farmland', 'No farmland', 'Prefer not to say'] as const;
export const LANDHOLDING_OPTIONS = ['Prefer not to say', 'Up to 1 hectare', '1–4 hectares', 'Above 4 hectares', 'I do not own land'] as const;
export const CULTIVATION_OPTIONS = ['Growing crops', 'Raising livestock', 'Both crops and livestock', 'Fishing / aquaculture', 'Allied activity', 'Not disclosed'] as const;
export const IRRIGATION_OPTIONS = ['Irrigated', 'Partly irrigated', 'Rain-fed', 'Prefer not to say'] as const;

export const STUDYING_OPTIONS = ['Full-time', 'Part-time', 'Not currently studying'] as const;
export const COURSE_FIELD_OPTIONS = [
  'Engineering / technical',
  'Medical / health',
  'Science',
  'Commerce / management',
  'Arts / humanities',
  'Vocational / ITI',
  'Other',
  'Prefer not to say',
] as const;
export const SKILL_TRAINING_OPTIONS = ['Yes', 'No', 'Interested'] as const;
export const LOOKING_FOR_EMPLOYMENT_OPTIONS = ['Yes', 'No'] as const;
export const APPRENTICESHIP_INTEREST_OPTIONS = ['Yes', 'Not sure', 'No'] as const;

export const BUSINESS_STATUS_OPTIONS = ['Running a business', 'Starting a new business', 'Self-employed freelance', 'Street vending', 'Prefer not to say'] as const;
export const NEW_BUSINESS_OPTIONS = ['Yes', 'No'] as const;
export const BUSINESS_SIZE_OPTIONS = ['Just me / family only', 'Micro (under 10 people)', 'Small (10–50 people)', 'Prefer not to say'] as const;
export const FORMAL_BUSINESS_OPTIONS = ['Registered (Udyam / GST)', 'Not registered', 'Prefer not to say'] as const;
export const VENDOR_STATUS_OPTIONS = ['Registered vendor', 'Unregistered vendor', 'Not a street vendor'] as const;
export const INTERESTED_IN_BUSINESS_OPTIONS = ['Yes', 'Considering', 'No'] as const;

export const EXISTING_PENSION_OPTIONS = ['None', 'Government / social pension', 'Employer / EPFO pension', 'Private pension', 'Prefer not to say'] as const;
export const EXISTING_WELFARE_OPTIONS = [
  'None',
  'Ration card / PDS',
  'Housing support',
  'Health coverage',
  'Pension',
  'Skill training / livelihood',
  'Other',
  'Prefer not to say',
] as const;
export const HEALTH_COVERAGE_OPTIONS = ['None', 'Government health cover (Ayushman / state)', 'Private health insurance', 'Employer health cover', 'Not sure'] as const;
export const RATION_SUPPORT_OPTIONS = ['Yes, my household gets ration', 'Not on the ration list', 'Not sure'] as const;
export const HOUSING_SUPPORT_OPTIONS = ['None', 'Receiving housing support', 'Applied but not received', 'Not sure'] as const;
export const EDUCATION_SUPPORT_OPTIONS = ['None', 'Receiving a scholarship', 'Free education / midday meal', 'Not sure'] as const;
export const LIVELIHOOD_SUPPORT_OPTIONS = ['None', 'Self-help group / livelihood support', 'Skill training', 'Not sure'] as const;

// ---------------------------------------------------------------------------
// Synthetic location data used by the wizard (demonstration only)
// ---------------------------------------------------------------------------

export type IndianState = { name: string; districts: { name: string; localities: string[] }[] };

export const indiaStates: IndianState[] = [
  {
    name: 'Delhi',
    districts: [
      { name: 'Najafgarh', localities: ['Najafgarh', 'Mitraon', 'Bijwasan'] },
      { name: 'Narela', localities: ['Narela', 'Alipur', 'Bawana'] },
      { name: 'Bawana', localities: ['Bawana', 'Kanjhawala'] },
    ],
  },
  {
    name: 'Haryana',
    districts: [
      { name: 'Sohna', localities: ['Sohna', 'Bhondsi'] },
      { name: 'Faridabad', localities: ['Faridabad', 'Ballabhgarh'] },
      { name: 'Gurugram', localities: ['Gurugram', 'Pataudi'] },
      { name: 'Sonipat', localities: ['Sonipat', 'Panipat', 'Rohtak'] },
    ],
  },
  {
    name: 'Uttar Pradesh',
    districts: [
      { name: 'Ghaziabad', localities: ['Ghaziabad', 'Loni', 'Dadri'] },
      { name: 'Gautam Buddha Nagar', localities: ['Noida', 'Greater Noida', 'Jewar'] },
      { name: 'Meerut', localities: ['Meerut', 'Muzaffarnagar'] },
    ],
  },
  {
    name: 'Rajasthan',
    districts: [
      { name: 'Alwar', localities: ['Alwar', 'Rajgarh'] },
      { name: 'Bharatpur', localities: ['Bharatpur', 'Deeg'] },
    ],
  },
  {
    name: 'Punjab',
    districts: [
      { name: 'Amritsar', localities: ['Amritsar', 'Majitha'] },
      { name: 'Ludhiana', localities: ['Ludhiana', 'Khanna'] },
    ],
  },
  {
    name: 'Uttarakhand',
    districts: [
      { name: 'Haridwar', localities: ['Haridwar', 'Ranipur'] },
      { name: 'Dehradun', localities: ['Dehradun', 'Rishikesh'] },
    ],
  },
  {
    name: 'Maharashtra',
    districts: [
      { name: 'Mumbai Suburban', localities: ['Andheri', 'Borivali', 'Thane'] },
      { name: 'Pune', localities: ['Pune', 'Pimpri-Chinchwad'] },
    ],
  },
  {
    name: 'Karnataka',
    districts: [
      { name: 'Bengaluru Urban', localities: ['Bengaluru', 'Yelahanka', 'Devanahalli'] },
      { name: 'Mysuru', localities: ['Mysuru', 'Mandya'] },
    ],
  },
  {
    name: 'West Bengal',
    districts: [
      { name: 'Kolkata', localities: ['Kolkata', 'Howrah'] },
      { name: '24 Parganas South', localities: ['Baruipur', 'Diamond Harbour'] },
    ],
  },
  {
    name: 'Bihar',
    districts: [
      { name: 'Patna', localities: ['Patna', 'Danapur'] },
      { name: 'Gaya', localities: ['Gaya', 'Bodh Gaya'] },
    ],
  },
];

export const defaultCitizenProfile: CitizenProfile = {
  state: 'Delhi',
  district: 'Delhi',
  locality: 'Najafgarh',
  ageGroup: '30–45',
  gender: 'Prefer not to say',
  maritalStatus: 'Married',
  disability: 'Prefer not to say',
  socialCategory: 'Prefer not to say',
  occupation: 'Other',
  education: 'Secondary school',
  householdSize: '4',
  children: 'None',
  dependents: '1',
  elderlyMembers: 'None',
  disabledMembers: 'None',
  income: '₹1–3 lakh / year',
  housing: 'Own home',
  employment: 'Not currently working',
  previousOccupation: 'Not applicable',
  pensionStatus: 'Not receiving a pension',
  pensionSource: 'Not receiving a pension',
  pensionRange: 'Prefer not to say',
  stillWorking: 'No',
  seekingWork: 'Not applicable',
  informalWorker: 'Prefer not to say',
  agriculturalActivity: 'Not applicable',
  agriculturalLand: 'Prefer not to say',
  landholding: 'Prefer not to say',
  cultivation: 'Not applicable',
  irrigation: 'Prefer not to say',
  studying: 'Not currently studying',
  courseField: 'Prefer not to say',
  skillTraining: 'No',
  lookingForEmployment: 'No',
  apprenticeshipInterest: 'No',
  businessStatus: 'Prefer not to say',
  newBusiness: 'No',
  businessSize: 'Prefer not to say',
  formalBusiness: 'Prefer not to say',
  vendorStatus: 'Not a street vendor',
  interestedInBusiness: 'No',
  existingPension: 'None',
  existingWelfare: 'None',
  healthCoverage: 'Not sure',
  rationSupport: 'Not sure',
  housingSupport: 'None',
  educationSupport: 'None',
  livelihoodSupport: 'None',
  situation: 'My answers were summarised automatically.',
};

// ---------------------------------------------------------------------------
// Occupations that indicate the person is currently working in a role
// ---------------------------------------------------------------------------
export const FARMER_OCCUPATIONS = ['Farmer', 'Agricultural worker'] as const;
export const SALARIED_OCCUPATIONS = ['Salaried employee', 'Government employee', 'Private employee'] as const;
export const BUSINESS_OCCUPATIONS = ['Business owner', 'Self-employed', 'Street vendor'] as const;
export const RETIRED_OCCUPATIONS = ['Retired', 'Pensioner'] as const;
export const WORKER_OCCUPATIONS = ['Daily wage worker', 'Agricultural worker'] as const;

export function summarizeSituation(p: CitizenProfile): string {
  const occ = p.occupation.trim();
  if (occ) return `My main status is ${occ}.`;
  return 'My answers were summarised automatically.';
}

// ---------------------------------------------------------------------------
// Welfare purposes
// ---------------------------------------------------------------------------

export type WelfarePurpose =
  | 'Pension'
  | 'Housing'
  | 'Livelihood'
  | 'Education'
  | 'Healthcare'
  | 'Food security'
  | 'Agriculture'
  | 'Disability'
  | 'Women & Child'
  | 'Financial inclusion';

export const WELFARE_PURPOSES: WelfarePurpose[] = [
  'Housing',
  'Livelihood',
  'Education',
  'Healthcare',
  'Pension',
  'Food security',
  'Agriculture',
  'Women & Child',
  'Disability',
  'Financial inclusion',
];

export const purposeLabel: Record<WelfarePurpose, string> = {
  Housing: 'Housing',
  Livelihood: 'Livelihood',
  Education: 'Education',
  Healthcare: 'Healthcare',
  Pension: 'Pension',
  'Food security': 'Food security',
  Agriculture: 'Agriculture',
  'Women & Child': 'Women & Child',
  Disability: 'Disability',
  'Financial inclusion': 'Financial inclusion',
};

// ---------------------------------------------------------------------------
// Scheme model
// ---------------------------------------------------------------------------

export type WelfareDocument = { label: string; likely: boolean; confirmedBy: string };
export type MatchStatus = 'matched' | 'partial' | 'missing' | 'not-matched';
export type ProfileFactor = { factor: string; status: MatchStatus; detail: string };

export type RelevanceLabel =
  | 'High relevance'
  | 'Relevant'
  | 'May be relevant'
  | 'Low relevance'
  | 'Needs more information';

export type ConfidenceLabel = 'High' | 'Medium' | 'Needs verification';

// ---------------------------------------------------------------------------
// Structured eligibility metadata — consumed by the recommendation engine.
// This is a reusable rule structure: each scheme declares its target group and
// conditions once, and the engine turns it into weighted signals.
// ---------------------------------------------------------------------------

export type SchemeEligibility = {
  summary: string;
  // Broad display groups, e.g. 'Landholding farmer families'
  targetGroups: string[];
  // Current-status values that are the PRIMARY target of this scheme
  occupations: string[];
  // Current-status values that clearly do NOT fit the primary target
  blockedOccupations: string[];
  // Inclusive age range, if the scheme cares about age
  ageRange?: [number, number];
  // If true, being outside ageRange disqualifies the person (large penalty)
  ageEssential?: boolean;
  // Highest income level (0..3) that can produce a strong match
  incomeMax?: number;
  // Income levels up to this value can produce a partial match
  incomeRetained?: number;
  // If true, income above incomeMax disqualifies (large penalty)
  incomeEssential?: boolean;
  // Agriculture-only schemes require an active agricultural signal
  requiresAgriculture?: boolean;
  requiresLand?: boolean;
  requiresStudent?: boolean;
  requiresSeekingWork?: boolean;
  requiresSelfEmployed?: boolean;
  requiresDisabled?: boolean;
  femaleOnly?: boolean;
  // Employment statuses that strengthen a match
  employmentMatches?: string[];
  // Occupations that indicate the primary working mode (business / salaried / worker)
  occupationRole?: ('salaried' | 'business' | 'worker' | 'student')[];
  // Housing situations that strengthen or weaken a match
  housingMatches?: string[];
  housingBlocks?: string[];
  // Household signals that strengthen a match
  householdMatches?: string[];
  // Social categories that strengthen a match (SC / ST / OBC / EWS)
  categoryMatches?: string[];
  // True ⇔ relevant to almost any citizen (universal welfare)
  general?: boolean;
  // If true, citizens who already receive a pension are not a match
  existingPensionBlocked?: boolean;
  // Pension ranges that fit this scheme particularly well
  existingPensionRanges?: string[];
  // Information that is normally needed to move forward
  needed: string[];
};

export type CitizenScheme = {
  id: string;
  name: string;
  category: string;
  description: string;
  relevance: 'High relevance' | 'May be relevant' | 'Needs more information';
  status: string;
  tone: 'terracotta' | 'sage' | 'indigo' | 'saffron' | 'lavender';
  why: string[];
  needed: string[];
  next: string;
  benefit: string;
  source: string;
  purpose: WelfarePurpose;
  documents: WelfareDocument[];
  generalInfo: string;
  eligibility: SchemeEligibility;
};

export type Recommendation = Omit<CitizenScheme, 'relevance'> & {
  relevance: RelevanceLabel;
  tier: RelevanceLabel;
  score: number;
  confidence: ConfidenceLabel;
  why: string[];
  match: ProfileFactor[];
  notMatched: ProfileFactor[];
  missing: string[];
  overlap: string[];
  potentialBenefit: string;
  nextStep: string;
};

export type CoverageStatus = 'Covered' | 'Potential opportunity' | 'Potential gap' | 'Needs more information';

export type WelfareCoverage = {
  purpose: WelfarePurpose;
  status: CoverageStatus;
  note: string;
  schemeIds: string[];
};

const baseWhy = ['The scheme matches the primary purpose of your profile', 'Review the official details before relying on this recommendation'];

const doc = (label: string, confirmedBy = ''): WelfareDocument => ({ label, likely: true, confirmedBy });

// ---------------------------------------------------------------------------
// Scheme catalogue — a curated, representative demo set.
// All eligibility details are demonstration logic for the prototype, not
// authoritative official terms.
// ---------------------------------------------------------------------------

export const citizenSchemes: CitizenScheme[] = [
  // ============================ AGRICULTURE ============================
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    category: 'Agriculture · Income support',
    description: 'Income support for eligible landholding farmer families to help with agricultural and household needs.',
    purpose: 'Agriculture',
    relevance: 'High relevance',
    status: 'Likely relevant',
    tone: 'terracotta',
    why: ['Your profile indicates farming activity', ...baseWhy],
    needed: ['Landholding information', 'Land record or equivalent proof'],
    documents: [doc('Aadhaar / identity proof'), doc('Land record or equivalent proof', 'landholding')],
    generalInfo: 'PM-KISAN provides direct income support to eligible landholding farmer families. Demonstration profile for the prototype.',
    next: 'Review the scheme details and prepare the information listed.',
    benefit: 'Income support subject to official conditions.',
    source: 'Department of Agriculture & Farmers Welfare',
    eligibility: {
      summary: 'Income support for landholding farmer families.',
      targetGroups: ['Landholding farmer families'],
      occupations: ['Farmer'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      requiresLand: true,
      incomeMax: 3,
      needed: ['Land record or equivalent proof'],
    },
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    category: 'Agriculture · Credit access',
    description: 'A credit access pathway for farmers cultivating crops or running allied agricultural activity.',
    purpose: 'Agriculture',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Your work is connected to agriculture', ...baseWhy],
    needed: ['Land or cultivation details', 'Banking and identity information'],
    documents: [doc('Aadhaar / identity proof'), doc('Land or cultivation details', 'landholding'), doc('Bank account details')],
    generalInfo: 'The Kisan Credit Card gives eligible farmers access to credit for cultivation and allied activities. Demonstration profile for the prototype.',
    next: 'Compare this option with PM-KISAN before deciding what to explore first.',
    benefit: 'Agricultural credit access subject to lender review.',
    source: 'Department of Financial Services',
    eligibility: {
      summary: 'Credit access for cultivating farmers and allied activity households.',
      targetGroups: ['Farmers', 'Agricultural workers'],
      occupations: ['Farmer', 'Agricultural worker'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      incomeMax: 3,
      needed: ['Land or cultivation details', 'Bank account details'],
    },
  },
  {
    id: 'fasal-bima',
    name: 'PM Fasal Bima Yojana',
    category: 'Agriculture · Crop protection',
    description: 'Crop insurance support intended to reduce the impact of eligible crop loss and seasonal risk.',
    purpose: 'Agriculture',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Agricultural activity is a relevant signal', ...baseWhy],
    needed: ['Crop and season details', 'Cultivation or landholding information'],
    documents: [doc('Aadhaar / identity proof'), doc('Land or cultivation details', 'landholding')],
    generalInfo: 'PM Fasal Bima Yojana offers crop insurance to reduce the impact of eligible crop loss. Demonstration profile for the prototype.',
    next: 'Add crop details when you are ready to narrow this recommendation.',
    benefit: 'Crop risk protection subject to notified terms.',
    source: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: {
      summary: 'Crop insurance for farmers with insurable crops.',
      targetGroups: ['Cultivating farmers'],
      occupations: ['Farmer'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      requiresLand: true,
      incomeMax: 3,
      needed: ['Crop and season details'],
    },
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM',
    category: 'Agriculture · Renewable energy',
    description: 'A pathway for solar pumps and renewable energy support connected to agriculture.',
    purpose: 'Agriculture',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Your profile indicates agricultural activity', ...baseWhy],
    needed: ['Land and irrigation details', 'State component availability'],
    documents: [doc('Aadhaar / identity proof'), doc('Land and irrigation details', 'landholding')],
    generalInfo: 'PM-KUSUM helps farmers install solar pumps and renewable energy under approved components. Demonstration profile for the prototype.',
    next: 'Check the current state component and local implementing agency.',
    benefit: 'Renewable energy support under approved components.',
    source: 'Ministry of New and Renewable Energy',
    eligibility: {
      summary: 'Solar pumps and renewable-energy support for farmers.',
      targetGroups: ['Farmers', 'Farmer groups'],
      occupations: ['Farmer'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      requiresLand: true,
      incomeMax: 3,
      needed: ['Land and irrigation details'],
    },
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card',
    category: 'Agriculture · Soil health',
    description: 'Soil testing and nutrient guidance for cultivators.',
    purpose: 'Agriculture',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Farming activity is a relevant signal', ...baseWhy],
    needed: ['Land or cultivation details'],
    documents: [doc('Aadhaar / identity proof'), doc('Land or cultivation details', 'landholding')],
    generalInfo: 'The Soil Health Card gives farmers soil nutrient information and fertiliser guidance. Demonstration profile for the prototype.',
    next: 'Ask the local agriculture office about the current soil-testing cycle.',
    benefit: 'Soil nutrient information and advisory.',
    source: 'Department of Agriculture & Farmers Welfare',
    eligibility: {
      summary: 'Soil-testing and nutrient guidance for cultivators.',
      targetGroups: ['Farmers', 'Cultivators'],
      occupations: ['Farmer', 'Agricultural worker'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      incomeMax: 3,
      needed: ['Land or cultivation details'],
    },
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana',
    category: 'Agriculture · Irrigation',
    description: 'Irrigation and water-use efficiency support for cultivating farmers.',
    purpose: 'Agriculture',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Farming and cultivation are relevant signals', ...baseWhy],
    needed: ['Landholding and irrigation details', 'State component availability'],
    documents: [doc('Aadhaar / identity proof'), doc('Land and irrigation details', 'landholding')],
    generalInfo: 'PM Krishi Sinchayee Yojana supports irrigation infrastructure and water efficiency for farmers. Demonstration profile for the prototype.',
    next: 'Ask the local agriculture department about current components.',
    benefit: 'Irrigation support subject to approved components.',
    source: 'Department of Agriculture & Farmers Welfare',
    eligibility: {
      summary: 'Irrigation and water-use support for farmers.',
      targetGroups: ['Cultivating farmers'],
      occupations: ['Farmer'],
      blockedOccupations: ['Student', 'Unemployed / seeking work', 'Homemaker', 'Salaried employee', 'Government employee', 'Private employee', 'Business owner', 'Self-employed', 'Street vendor', 'Retired', 'Pensioner'],
      requiresAgriculture: true,
      requiresLand: true,
      incomeMax: 3,
      needed: ['Landholding and irrigation details'],
    },
  },

  // ============================ HOUSING ============================
  {
    id: 'pmay-g',
    name: 'PMAY-Gramin',
    category: 'Housing · Rural households',
    description: 'A rural housing assistance pathway for eligible households.',
    purpose: 'Housing',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Your location and household profile can be relevant to housing support', ...baseWhy],
    needed: ['Housing status', 'Household listing or local verification'],
    documents: [doc('Aadhaar / identity proof'), doc('Income certificate'), doc('Residence / ration card proof'), doc('Bank account details')],
    generalInfo: 'PMAY-Gramin supports eligible rural households in building or improving a home. Demonstration profile for the prototype.',
    next: 'Ask your local body about the current eligible household list.',
    benefit: 'Housing assistance subject to approved lists.',
    source: 'Ministry of Rural Development',
    eligibility: {
      summary: 'Rural housing assistance for eligible low-income households.',
      targetGroups: ['Rural households without a pucca home'],
      occupations: [],
      blockedOccupations: [],
      incomeMax: 1,
      incomeRetained: 2,
      incomeEssential: true,
      housingMatches: ['Renting', 'Shared / family home', 'No permanent house'],
      housingBlocks: ['Own home'],
      needed: ['Household listing status'],
    },
  },
  {
    id: 'pmay-u',
    name: 'PMAY-Urban',
    category: 'Housing · Urban households',
    description: 'Housing support pathways for eligible urban and peri-urban households.',
    purpose: 'Housing',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Your selected location has urban and peri-urban communities', ...baseWhy],
    needed: ['Current housing situation', 'Urban local body process'],
    documents: [doc('Aadhaar / identity proof'), doc('Income certificate'), doc('Residence proof'), doc('Bank account details')],
    generalInfo: 'PMAY-Urban helps eligible urban households access housing assistance. Demonstration profile for the prototype.',
    next: 'Review the relevant urban housing component for your area.',
    benefit: 'Housing assistance subject to official component rules.',
    source: 'Ministry of Housing and Urban Affairs',
    eligibility: {
      summary: 'Urban housing assistance for eligible households.',
      targetGroups: ['Urban households'],
      occupations: [],
      blockedOccupations: [],
      incomeMax: 2,
      incomeRetained: 3,
      housingMatches: ['Renting', 'Shared / family home', 'No permanent house'],
      housingBlocks: ['Own home'],
      needed: ['Current housing situation'],
    },
  },

  // ============================ LIVELIHOOD / EMPLOYMENT ============================
  {
    id: 'mgnrega',
    name: 'MGNREGA',
    category: 'Livelihood · Rural employment',
    description: 'Demand-driven rural wage employment support for households seeking local work.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Your employment profile may align with local work opportunities', ...baseWhy],
    needed: ['Job card or local registration status', 'Current work demand'],
    documents: [doc('Aadhaar / identity proof'), doc('Local residence / job card proof'), doc('Bank account details')],
    generalInfo: 'MGNREGA provides demand-driven rural wage employment. Demonstration profile for the prototype.',
    next: 'Speak with the local panchayat or employment office about current demand registration.',
    benefit: 'Employment opportunity under program conditions.',
    source: 'Ministry of Rural Development',
    eligibility: {
      summary: 'Rural wage employment for households seeking local work.',
      targetGroups: ['Rural households seeking wage work'],
      occupations: ['Daily wage worker', 'Agricultural worker', 'Unemployed / seeking work'],
      blockedOccupations: ['Salaried employee', 'Government employee', 'Private employee', 'Retired', 'Pensioner', 'Student'],
      requiresSeekingWork: true,
      employmentMatches: ['Looking for work'],
      needed: ['Job card or local registration status'],
    },
  },
  {
    id: 'svanidhi',
    name: 'PM SVANidhi',
    category: 'Livelihood · Street vendors',
    description: 'A working-capital support pathway for eligible street vendors.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'terracotta',
    why: ['Street vending or micro-business activity may be relevant', ...baseWhy],
    needed: ['Vendor status or certificate', 'Local body verification'],
    documents: [doc('Aadhaar / identity proof'), doc('Vendor identity card / certificate'), doc('Bank account details')],
    generalInfo: 'PM SVANidhi gives eligible street vendors access to working-capital loans. Demonstration profile for the prototype.',
    next: 'Check with the urban local body or designated lending partner.',
    benefit: 'Working-capital loan pathway subject to lender review.',
    source: 'Ministry of Housing and Urban Affairs',
    eligibility: {
      summary: 'Working-capital support for street vendors.',
      targetGroups: ['Street vendors'],
      occupations: ['Street vendor'],
      blockedOccupations: ['Student', 'Salaried employee', 'Government employee', 'Private employee', 'Retired', 'Pensioner'],
      occupationRole: ['worker'],
      housingMatches: ['Renting', 'Shared / family home', 'No permanent house'],
      needed: ['Vendor certificate or local verification'],
    },
  },
  {
    id: 'pmegp',
    name: 'PMEGP',
    category: 'Livelihood · Micro-enterprise',
    description: 'A credit-linked subsidy pathway that helps self-employed people and micro-enterprises get started or expand.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'terracotta',
    why: ['Small business or self-employment may be relevant to this pathway', ...baseWhy],
    needed: ['Business idea or existing unit details', 'Project proposal'],
    documents: [doc('Aadhaar / identity proof'), doc('Residence / ration card proof'), doc('Project or business plan'), doc('Education proof', 'education')],
    generalInfo: 'PMEGP provides credit-linked subsidy support to eligible micro-enterprises and self-employed people. Demonstration profile for the prototype.',
    next: 'Compare this with PM SVANidhi and Mudra to see which fits your situation.',
    benefit: 'Credit-linked subsidy subject to scheme conditions.',
    source: 'Ministry of Micro, Small and Medium Enterprises',
    eligibility: {
      summary: 'Credit-linked subsidy for micro-enterprises and the self-employed.',
      targetGroups: ['Self-employed people', 'Micro-enterprises', 'Aspiring entrepreneurs'],
      occupations: ['Business owner', 'Self-employed', 'Street vendor'],
      blockedOccupations: ['Retired', 'Pensioner'],
      occupationRole: ['business'],
      ageRange: [18, 60],
      incomeMax: 3,
      needed: ['Project or business plan'],
    },
  },
  {
    id: 'day-nrlm',
    name: 'DAY-NRLM',
    category: 'Livelihood · Self-help groups',
    description: 'A national livelihood pathway that helps women’s self-help groups access loans, training and community support.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'terracotta',
    why: ['Women’s self-help groups are a central channel of this programme', ...baseWhy],
    needed: ['Self-help group membership status', 'State rural livelihood mission process'],
    documents: [doc('Aadhaar / identity proof'), doc('Self-help group membership status'), doc('Bank account details')],
    generalInfo: 'DAY-NRLM helps women’s self-help groups access loans, training and community support. Demonstration profile for the prototype.',
    next: 'Ask whether there is an active self-help group near you.',
    benefit: 'Community and financial support subject to programme rules.',
    source: 'Ministry of Rural Development',
    eligibility: {
      summary: 'Rural livelihood support through women’s self-help groups.',
      targetGroups: ['Women in rural households'],
      occupations: ['Homemaker', 'Farmer', 'Agricultural worker', 'Daily wage worker'],
      blockedOccupations: ['Salaried employee', 'Government employee', 'Private employee', 'Retired', 'Pensioner', 'Student'],
      femaleOnly: true,
      incomeMax: 2,
      needed: ['Self-help group membership status'],
    },
  },
  {
    id: 'lakhpati-didi',
    name: 'Lakhpati Didi',
    category: 'Livelihood · Women entrepreneurs',
    description: 'Support to help women self-help group members build steady livelihoods and higher household income.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Women-led households are the primary focus of this pathway', ...baseWhy],
    needed: ['Self-help group membership status', 'Local livelihood mission process'],
    documents: [doc('Aadhaar / identity proof'), doc('Self-help group membership status'), doc('Bank account details')],
    generalInfo: 'Lakhpati Didi helps women SHG members reach sustainable livelihoods. Demonstration profile for the prototype.',
    next: 'Speak with the local livelihood mission about current cohorts.',
    benefit: 'Livelihood and training support subject to programme terms.',
    source: 'Ministry of Rural Development',
    eligibility: {
      summary: 'Livelihood pathway helping women SHG members earn steadily.',
      targetGroups: ['Women self-help group members'],
      occupations: ['Homemaker', 'Farmer', 'Agricultural worker', 'Daily wage worker'],
      blockedOccupations: ['Salaried employee', 'Government employee', 'Private employee', 'Retired', 'Pensioner', 'Student'],
      femaleOnly: true,
      incomeMax: 1,
      incomeRetained: 2,
      needed: ['Self-help group membership status'],
    },
  },
  {
    id: 'e-shram',
    name: 'e-Shram Card',
    category: 'Social security · Unorganised workers',
    description: 'A national registration identity for unorganised workers that opens the door to portability and linked benefits.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Unorganised work activity is a relevant signal', ...baseWhy],
    needed: ['Aadhaar and bank details at registration', 'Employment verification'],
    documents: [doc('Aadhaar / identity proof'), doc('Bank account details')],
    generalInfo: 'e-Shram registers workers in the unorganised sector on a national database. Demonstration profile for the prototype.',
    next: 'Register through a CSC centre or the official e-Shram portal.',
    benefit: 'Recognition and access to linked social-security benefits subject to registration.',
    source: 'Ministry of Labour & Employment',
    eligibility: {
      summary: 'National registration for workers in the unorganised sector.',
      targetGroups: ['Unorganised-sector workers'],
      occupations: ['Daily wage worker', 'Street vendor', 'Homemaker', 'Agricultural worker', 'Self-employed'],
      blockedOccupations: ['Salaried employee', 'Government employee', 'Private employee', 'Retired', 'Pensioner', 'Student'],
      occupationRole: ['worker'],
      ageRange: [16, 59],
      ageEssential: true,
      incomeMax: 3,
      needed: ['Aadhaar and bank details'],
    },
  },

  // ============================ BUSINESS ============================
  {
    id: 'cgtmse',
    name: 'CGTMSE',
    category: 'Business · Guarantee support',
    description: 'A credit guarantee pathway that helps eligible micro and small enterprises access collateral-free loans.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Business activity is a relevant signal for guarantee-backed credit', ...baseWhy],
    needed: ['Business registration or unit details', 'Banking and credit information'],
    documents: [doc('Aadhaar / identity proof'), doc('Business registration or unit details'), doc('Bank account and credit details')],
    generalInfo: 'CGTMSE provides guarantee cover that helps micro and small enterprises access collateral-free loans. Demonstration profile for the prototype.',
    next: 'Discuss the guarantee-backed loan option with a partner bank.',
    benefit: 'Guarantee cover on eligible credit facilities.',
    source: 'Ministry of Micro, Small and Medium Enterprises',
    eligibility: {
      summary: 'Collateral-free credit guarantee for micro and small enterprises.',
      targetGroups: ['Micro and small enterprises'],
      occupations: ['Business owner', 'Self-employed'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student', 'Unemployed / seeking work'],
      occupationRole: ['business'],
      incomeMax: 3,
      needed: ['Business registration or unit details'],
    },
  },
  {
    id: 'mudra',
    name: 'PM Mudra Yojana',
    category: 'Business · Micro-credit',
    description: 'Loans that help micro-enterprises and self-employed people get working capital or equipment.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Your business activity aligns with micro-credit support', ...baseWhy],
    needed: ['Business activity details', 'Bank relationship'],
    documents: [doc('Aadhaar / identity proof'), doc('Business activity details'), doc('Bank account details')],
    generalInfo: 'PM Mudra offers loans to micro-enterprises and the self-employed under different loan categories. Demonstration profile for the prototype.',
    next: 'Ask a partner bank about the current Mudra loan categories.',
    benefit: 'Micro-credit subject to lender review.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Micro-credit for small businesses and the self-employed.',
      targetGroups: ['Micro-enterprises', 'Self-employed people'],
      occupations: ['Business owner', 'Self-employed', 'Street vendor'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student'],
      occupationRole: ['business'],
      ageRange: [18, 65],
      incomeMax: 3,
      needed: ['Business activity details'],
    },
  },
  {
    id: 'stand-up-india',
    name: 'Stand-Up India',
    category: 'Business · Women & SC/ST entrepreneurs',
    description: 'Bank loans supporting women and SC/ST entrepreneurs who are starting a greenfield enterprise.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['This pathway targets women and SC/ST entrepreneurs', ...baseWhy],
    needed: ['Entrepreneur category confirmation', 'Business plan'],
    documents: [doc('Aadhaar / identity proof'), doc('Category certificate (SC/ST/Woman)', 'socialCategory'), doc('Business plan')],
    generalInfo: 'Stand-Up India supports women and SC/ST entrepreneurs with bank loans for new enterprises. Demonstration profile for the prototype.',
    next: 'Confirm your eligibility category and approach a partner bank.',
    benefit: 'Enterprise loan pathway subject to lender review.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Enterprise loans for women and SC/ST entrepreneurs.',
      targetGroups: ['Women entrepreneurs', 'SC/ST entrepreneurs'],
      occupations: ['Business owner', 'Self-employed'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student'],
      femaleOnly: true,
      categoryMatches: ['SC', 'ST'],
      occupationRole: ['business'],
      ageRange: [18, 60],
      needed: ['Category confirmation', 'Business plan'],
    },
  },
  {
    id: 'pm-viswakarma',
    name: 'PM Vishwakarma',
    category: 'Business · Traditional artisans',
    description: 'Support for traditional artisans and craftspeople with tools, skill training and credit.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'terracotta',
    why: ['Traditional craftsmanship and micro-business activity align with this pathway', ...baseWhy],
    needed: ['Trade or craft confirmation', 'Local implementing agency process'],
    documents: [doc('Aadhaar / identity proof'), doc('Skill or trade proof'), doc('Bank account details')],
    generalInfo: 'PM Vishwakarma supports traditional artisans with toolkits, training and credit. Demonstration profile for the prototype.',
    next: 'Ask the local industry or skill department about current enrolment windows.',
    benefit: 'Skill, toolkit and credit support subject to programme terms.',
    source: 'Ministry of Micro, Small and Medium Enterprises',
    eligibility: {
      summary: 'Toolkit, skill and credit support for artisans and craftspeople.',
      targetGroups: ['Traditional artisans', 'Craftspeople'],
      occupations: ['Self-employed', 'Business owner'],
      blockedOccupations: ['Retired', 'Pensioner', 'Salaried employee', 'Government employee', 'Private employee', 'Student'],
      occupationRole: ['business'],
      incomeMax: 1,
      incomeRetained: 2,
      needed: ['Trade or craft confirmation'],
    },
  },

  // ============================ EDUCATION / SKILLS ============================
  {
    id: 'scholarship',
    name: 'National Scholarship Portal schemes',
    category: 'Education · Student support',
    description: 'A discovery pathway for scholarships and education assistance.',
    purpose: 'Education',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Student status is a relevant signal for scholarship discovery', ...baseWhy],
    needed: ['Course and institution details', 'Category and income documentation'],
    documents: [doc('Aadhaar / identity proof'), doc('Education / enrolment certificate', 'education'), doc('Income certificate'), doc('Bank account details')],
    generalInfo: 'The National Scholarship Portal is a discovery pathway for scholarships. Demonstration profile for the prototype.',
    next: 'Review the current scholarship window with your institution.',
    benefit: 'Education assistance pathway.',
    source: 'National Scholarship Portal',
    eligibility: {
      summary: 'Scholarships and education assistance for eligible students.',
      targetGroups: ['Students'],
      occupations: ['Student'],
      blockedOccupations: ['Retired', 'Pensioner', 'Salaried employee', 'Government employee', 'Private employee', 'Homemaker', 'Business owner'],
      requiresStudent: true,
      categoryMatches: ['SC', 'ST', 'OBC', 'EWS'],
      ageRange: [6, 35],
      incomeMax: 3,
      needed: ['Course and category documentation'],
    },
  },
  {
    id: 'pmkvy',
    name: 'PMKVY',
    category: 'Skill development · Training',
    description: 'Skill training and certification opportunities for eligible youth and job seekers.',
    purpose: 'Education',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Your age and employment profile may align with training opportunities', ...baseWhy],
    needed: ['Preferred skill area', 'Training center availability'],
    documents: [doc('Aadhaar / identity proof'), doc('Education certificate', 'education')],
    generalInfo: 'PMKVY offers skill training and certification. Demonstration profile for the prototype.',
    next: 'Browse nearby training centers and current courses.',
    benefit: 'Training and assessment pathway.',
    source: 'Ministry of Skill Development and Entrepreneurship',
    eligibility: {
      summary: 'Skill training and certification for youth and job seekers.',
      targetGroups: ['Youth', 'Job seekers'],
      occupations: ['Student', 'Unemployed / seeking work'],
      blockedOccupations: ['Retired', 'Pensioner'],
      ageRange: [15, 45],
      ageEssential: true,
      requiresSeekingWork: true,
      employmentMatches: ['Looking for work', 'Studying'],
      needed: ['Preferred skill area'],
    },
  },
  {
    id: 'pm-yuva',
    name: 'PM-YUVA',
    category: 'Skill development · Young entrepreneurs',
    description: 'A mentoring and training pathway that helps young people start or strengthen a venture.',
    purpose: 'Livelihood',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Young adults and students may align with this entrepreneurship pathway', ...baseWhy],
    needed: ['Age and education details', 'Venture idea or existing activity'],
    documents: [doc('Aadhaar / identity proof'), doc('Education proof', 'education'), doc('Venture idea or existing activity details')],
    generalInfo: 'PM-YUVA offers mentoring and training to help young people start a venture. Demonstration profile for the prototype.',
    next: 'Look for the current admission window and nearby training partners.',
    benefit: 'Training, mentoring and venture support subject to programme terms.',
    source: 'Ministry of Skill Development and Entrepreneurship',
    eligibility: {
      summary: 'Mentoring and training for young entrepreneurs.',
      targetGroups: ['Young people', 'Students'],
      occupations: ['Student', 'Unemployed / seeking work'],
      blockedOccupations: ['Retired', 'Pensioner'],
      ageRange: [16, 29],
      ageEssential: true,
      requiresSeekingWork: true,
      needed: ['Venture idea or existing activity'],
    },
  },
  {
    id: 'apprenticeship',
    name: 'National Apprenticeship Promotion Scheme',
    category: 'Skill development · Apprenticeship',
    description: 'A work-based training pathway that helps eligible young people gain practical skills with a stipend.',
    purpose: 'Education',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Students and young job-seekers may align with apprenticeship roles', ...baseWhy],
    needed: ['Preferred trade or industry', 'Nearby establishment vacancies'],
    documents: [doc('Aadhaar / identity proof'), doc('Education proof', 'education')],
    generalInfo: 'The National Apprenticeship Promotion Scheme combines practical training with a stipend. Demonstration profile for the prototype.',
    next: 'Explore the current list of open apprenticeships in your state.',
    benefit: 'Stipend and practical training subject to programme conditions.',
    source: 'Ministry of Skill Development and Entrepreneurship',
    eligibility: {
      summary: 'Apprenticeship roles with training and stipend.',
      targetGroups: ['Students', 'Young job seekers'],
      occupations: ['Student', 'Unemployed / seeking work'],
      blockedOccupations: ['Retired', 'Pensioner'],
      requiresStudent: true,
      requiresSeekingWork: true,
      ageRange: [14, 35],
      ageEssential: true,
      needed: ['Preferred trade or industry'],
    },
  },
  {
    id: 'mid-day-meal',
    name: 'PM POSHAN (Mid-Day Meal)',
    category: 'Education · School nutrition',
    description: 'A cooked midday meal support for children enrolled in government and aided schools.',
    purpose: 'Education',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Households with school-age children are the intended group', ...baseWhy],
    needed: ['School enrolment details'],
    documents: [doc('Child school enrolment proof', 'children')],
    generalInfo: 'PM POSHAN provides a cooked midday meal to children in government schools. Demonstration profile for the prototype.',
    next: 'Confirm with the child’s school that the meal service is active.',
    benefit: 'Daily nutrition support for school children.',
    source: 'Ministry of Education',
    eligibility: {
      summary: 'Midday meal support for school-going children.',
      targetGroups: ['Families with school-age children'],
      occupations: [],
      blockedOccupations: [],
      householdMatches: ['1', '2', '3 or more'],
      incomeMax: 3,
      needed: ['School enrolment details'],
    },
  },

  // ============================ PENSION / SENIOR / SOCIAL SECURITY ============================
  {
    id: 'nsap',
    name: 'National Social Assistance Programme',
    category: 'Social security · Assistance',
    description: 'Social assistance pathways for eligible older people, widows and persons with disabilities.',
    purpose: 'Pension',
    relevance: 'High relevance',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Senior age, widowhood or disability is a direct signal for social assistance', ...baseWhy],
    needed: ['Age or category confirmation', 'Local verification'],
    documents: [doc('Aadhaar / identity proof'), doc('Age / residence proof', 'ageGroup'), doc('Bank account details'), doc('Disability or category documents', 'disability')],
    generalInfo: 'NSAP provides social assistance to eligible older people, widows and persons with disabilities. Demonstration profile for the prototype.',
    next: 'Ask the local social welfare office which category applies.',
    benefit: 'Social assistance subject to applicable category.',
    source: 'Ministry of Rural Development',
    eligibility: {
      summary: 'Social assistance for older people, widows and persons with disabilities.',
      targetGroups: ['Senior citizens', 'Widows', 'Persons with disabilities'],
      occupations: ['Retired', 'Pensioner'],
      blockedOccupations: ['Student', 'Homemaker'],
      ageRange: [60, 120],
      ageEssential: true,
      incomeMax: 1,
      incomeRetained: 2,
      incomeEssential: true,
      categoryMatches: [],
      needed: ['Local social-welfare office verification'],
    },
  },
  {
    id: 'annapurna',
    name: 'Annapurna Yojana',
    category: 'Food security · Senior citizens',
    description: 'Free monthly food grain for eligible senior citizens who are not covered by a pension.',
    purpose: 'Food security',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Senior citizens without pension cover are the intended group', ...baseWhy],
    needed: ['Age and pension-status confirmation', 'Ration card status'],
    documents: [doc('Aadhaar / identity proof'), doc('Age / residence proof', 'ageGroup'), doc('Ration card status', 'rationSupport')],
    generalInfo: 'Annapurna provides free grain to senior citizens who are eligible but receive no pension. Demonstration profile for the prototype.',
    next: 'Check your ration card status and the local food-civil-supplies office.',
    benefit: 'Free food grain subject to household listing.',
    source: 'Department of Food and Public Distribution',
    eligibility: {
      summary: 'Free monthly grain for senior citizens without a pension.',
      targetGroups: ['Senior citizens without pension cover'],
      occupations: ['Retired', 'Pensioner'],
      blockedOccupations: ['Student'],
      ageRange: [60, 120],
      ageEssential: true,
      incomeMax: 1,
      incomeEssential: true,
      existingPensionBlocked: true,
      needed: ['Ration card status'],
    },
  },
  {
    id: 'pm-vaya-vandana',
    name: 'PM Vaya Vandana Yojana',
    category: 'Social security · Senior citizens',
    description: 'A pension-linked plan offering eligible senior citizens a regular income against a one-time investment.',
    purpose: 'Pension',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Senior citizens are the intended age group for this plan', ...baseWhy],
    needed: ['Age and identity confirmation', 'Investment details'],
    documents: [doc('Aadhaar / identity proof'), doc('Age proof', 'ageGroup'), doc('Bank account details')],
    generalInfo: 'PM Vaya Vandana Yojana is a pension-linked plan for eligible senior citizens. Demonstration profile for the prototype.',
    next: 'Ask your bank or LIC office about the current subscription window.',
    benefit: 'Regular income subject to plan terms.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Pension-linked income plan for senior citizens.',
      targetGroups: ['Senior citizens'],
      occupations: ['Retired', 'Pensioner'],
      blockedOccupations: ['Student'],
      ageRange: [60, 120],
      ageEssential: true,
      existingPensionRanges: [],
      needed: ['Investment details'],
    },
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    category: 'Social security · Retirement savings',
    description: 'A pension-savings pathway for eligible unorganised-sector workers, with government co-contribution in some cases.',
    purpose: 'Pension',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Working-age citizens can build a pension under this savings pathway', ...baseWhy],
    needed: ['Age confirmation', 'Bank relationship'],
    documents: [doc('Aadhaar / identity proof'), doc('Age proof', 'ageGroup'), doc('Bank account details')],
    generalInfo: 'Atal Pension Yojana helps unorganised workers build retirement savings. Demonstration profile for the prototype.',
    next: 'Ask your bank about opening an APY subscription.',
    benefit: 'Pension-savings pathway subject to subscription rules.',
    source: 'PFRDA',
    eligibility: {
      summary: 'Retirement-savings pension for working-age citizens.',
      targetGroups: ['Unorganised-sector workers', 'Working-age citizens'],
      occupations: ['Daily wage worker', 'Street vendor', 'Homemaker', 'Self-employed', 'Agricultural worker'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student'],
      ageRange: [18, 40],
      ageEssential: true,
      incomeMax: 1,
      incomeRetained: 2,
      needed: ['Bank relationship'],
    },
  },
  {
    id: 'pm-sym',
    name: 'PM Shram Yogi Maandhan',
    category: 'Social security · Unorganised workers',
    description: 'A pension scheme for eligible unorganised-sector workers with a modest government co-contribution.',
    purpose: 'Pension',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'terracotta',
    why: ['Unorganised-sector work is the intended signal', ...baseWhy],
    needed: ['Age and identity confirmation', 'Aadhaar-linked bank account'],
    documents: [doc('Aadhaar / identity proof'), doc('Age proof', 'ageGroup'), doc('Bank account details')],
    generalInfo: 'PM Shram Yogi Maandhan provides a monthly pension after retirement age for eligible unorganised workers. Demonstration profile for the prototype.',
    next: 'Check the enrolment window with the labour department or common service centre.',
    benefit: 'Monthly pension after retirement age subject to scheme rules.',
    source: 'Ministry of Labour & Employment',
    eligibility: {
      summary: 'Pension for eligible unorganised-sector workers.',
      targetGroups: ['Unorganised-sector workers'],
      occupations: ['Daily wage worker', 'Street vendor', 'Homemaker', 'Self-employed', 'Agricultural worker'],
      blockedOccupations: ['Retired', 'Pensioner', 'Salaried employee', 'Government employee', 'Private employee', 'Student'],
      occupationRole: ['worker'],
      ageRange: [18, 40],
      ageEssential: true,
      incomeMax: 1,
      incomeEssential: true,
      needed: ['Aadhaar-linked bank account'],
    },
  },
  {
    id: 'epf-esic',
    name: 'EPF & ESIC coverage',
    category: 'Social security · Salaried workers',
    description: 'Employee provident fund and insurance pathways that give organised workers long-term savings and healthcare cover.',
    purpose: 'Pension',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Salaried employment is a relevant signal for employee social security', ...baseWhy],
    needed: ['Employer registration details', 'UAN or ESIC number if already enrolled'],
    documents: [doc('Aadhaar / identity proof'), doc('Bank account details')],
    generalInfo: 'EPF and ESIC give organised workers provident savings and medical cover under official rules. Demonstration profile for the prototype.',
    next: 'Ask your employer which of these benefits currently apply.',
    benefit: 'Provident savings and medical cover under official rules.',
    source: 'Employees’ Provident Fund Organisation',
    eligibility: {
      summary: 'Provident savings and medical cover for organised-sector workers.',
      targetGroups: ['Salaried employees'],
      occupations: ['Salaried employee', 'Government employee', 'Private employee'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student', 'Unemployed / seeking work', 'Homemaker', 'Street vendor', 'Daily wage worker'],
      occupationRole: ['salaried'],
      employmentMatches: ['Employed'],
      needed: ['Employer registration details'],
    },
  },

  // ============================ HEALTHCARE ============================
  {
    id: 'pm-jay',
    name: 'Ayushman Bharat / PM-JAY',
    category: 'Health · Family coverage',
    description: 'A health coverage pathway for eligible low-income and vulnerable families.',
    purpose: 'Healthcare',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Household and income profile can be relevant to health coverage pathways', ...baseWhy],
    needed: ['Eligibility list confirmation', 'Family identity information'],
    documents: [doc('Aadhaar / identity proof'), doc('Residence proof'), doc('Family / ration card or eligibility list status')],
    generalInfo: 'Ayushman Bharat / PM-JAY provides cashless healthcare coverage for eligible families. Demonstration profile for the prototype.',
    next: 'Check eligibility through an official PM-JAY channel or empanelled facility.',
    benefit: 'Cashless healthcare coverage under approved packages.',
    source: 'National Health Authority',
    eligibility: {
      summary: 'Cashless healthcare cover for eligible low-income families.',
      targetGroups: ['Low-income and vulnerable families'],
      occupations: [],
      blockedOccupations: [],
      general: true,
      incomeMax: 1,
      incomeRetained: 2,
      householdMatches: ['3', '4', '5', '6 or more'],
      needed: ['Eligibility-list confirmation'],
    },
  },
  {
    id: 'janaushadhi',
    name: 'PM Bhartiya Janaushadhi Pariyojana',
    category: 'Health · Affordable medicines',
    description: 'A network of affordable generic medicine stores available to all citizens.',
    purpose: 'Healthcare',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Affordable medicines are relevant to most households', ...baseWhy],
    needed: ['Prescription from any doctor'],
    documents: [doc('Prescription / doctor note')],
    generalInfo: 'PM Bhartiya Janaushadhi provides quality generic medicines at affordable prices. Demonstration profile for the prototype.',
    next: 'Locate a nearby Jan Aushadhi Kendra and compare prices.',
    benefit: 'Affordable generic medicines subject to stock.',
    source: 'Department of Pharmaceuticals',
    eligibility: {
      summary: 'Affordable generic medicines for everyone.',
      targetGroups: ['All citizens'],
      occupations: [],
      blockedOccupations: [],
      general: true,
      needed: ['Prescription from any doctor'],
    },
  },

  // ============================ FOOD SECURITY ============================
  {
    id: 'antodaya-anna',
    name: 'Antyodaya Anna Yojana',
    category: 'Food security · Low-income households',
    description: 'Subsidised grain support for the poorest households through the public distribution system.',
    purpose: 'Food security',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Low-income households are the focus of this food-security scheme', ...baseWhy],
    needed: ['Ration card and household listing status', 'Local PDS shop details'],
    documents: [doc('Aadhaar / identity proof'), doc('Ration card / household listing'), doc('Residence proof')],
    generalInfo: 'Antyodaya Anna Yojana provides subsidised grain through the public distribution system. Demonstration profile for the prototype.',
    next: 'Check your ration card status and the current PDS allocation.',
    benefit: 'Subsidised food grain subject to household listing.',
    source: 'Department of Food and Public Distribution',
    eligibility: {
      summary: 'Subsidised grain for the poorest listed households.',
      targetGroups: ['Poorest listed households'],
      occupations: [],
      blockedOccupations: ['Salaried employee', 'Government employee', 'Private employee'],
      incomeMax: 0,
      incomeRetained: 1,
      incomeEssential: true,
      needed: ['Ration card status'],
    },
  },

  // ============================ FINANCIAL INCLUSION ============================
  {
    id: 'jan-dhan',
    name: 'PM Jan Dhan Yojana',
    category: 'Financial inclusion · General citizens',
    description: 'A universal access pathway to a bank account, Rupay debit card and basic insurance for every resident.',
    purpose: 'Financial inclusion',
    relevance: 'High relevance',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['A universal financial-access pathway relevant to a broad range of households', ...baseWhy],
    needed: ['Identity document', 'Address proof or simple self-declaration'],
    documents: [doc('Aadhaar / identity proof'), doc('Residence proof')],
    generalInfo: 'PM Jan Dhan Yojana opens a bank account with a Rupay debit card and basic insurance. Demonstration profile for the prototype.',
    next: 'Any public sector bank can open a zero-balance account under this scheme.',
    benefit: 'Account and basic insurance pathway subject to banking rules.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Universal zero-balance bank account with basic insurance.',
      targetGroups: ['All citizens'],
      occupations: [],
      blockedOccupations: [],
      general: true,
      needed: ['Identity document'],
    },
  },
  {
    id: 'pmjjby',
    name: 'PM Jeevan Jyoti Bima Yojana',
    category: 'Financial inclusion · Life insurance',
    description: 'Low-cost life insurance cover for eligible citizens aged 18 to 50.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Working-age citizens can enrol for low-cost life cover', ...baseWhy],
    needed: ['Bank account', 'Age confirmation'],
    documents: [doc('Aadhaar / identity proof'), doc('Bank account details'), doc('Age proof', 'ageGroup')],
    generalInfo: 'PM Jeevan Jyoti Bima offers life insurance cover with a small annual premium. Demonstration profile for the prototype.',
    next: 'Enrol through your bank with Aadhaar-linked consent.',
    benefit: 'Life insurance cover subject to scheme rules.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Low-cost life insurance for ages 18–50.',
      targetGroups: ['Working-age citizens'],
      occupations: [],
      blockedOccupations: ['Retired', 'Pensioner'],
      ageRange: [18, 50],
      ageEssential: true,
      general: true,
      needed: ['Bank account'],
    },
  },
  {
    id: 'pmsby',
    name: 'PM Suraksha Bima Yojana',
    category: 'Financial inclusion · Accident insurance',
    description: 'Low-cost accidental death and disability cover for eligible citizens aged 18 to 70.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Accidental cover is widely available, including for older adults', ...baseWhy],
    needed: ['Bank account', 'Age confirmation'],
    documents: [doc('Aadhaar / identity proof'), doc('Bank account details'), doc('Age proof', 'ageGroup')],
    generalInfo: 'PM Suraksha Bima offers accidental death and disability cover with a small annual premium. Demonstration profile for the prototype.',
    next: 'Enrol through your bank with Aadhaar-linked consent.',
    benefit: 'Accident insurance cover subject to scheme rules.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Low-cost accident insurance for ages 18–70.',
      targetGroups: ['All banked citizens'],
      occupations: [],
      blockedOccupations: [],
      ageRange: [18, 70],
      ageEssential: true,
      general: true,
      needed: ['Bank account'],
    },
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    category: 'Women & Child · Girl-child savings',
    description: 'A savings account opened for a girl child that helps build a future fund with tax benefits.',
    purpose: 'Women & Child',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'sage',
    why: ['Households with a girl child are the intended group', ...baseWhy],
    needed: ['Girl child proof', 'Bank or post-office relationship'],
    documents: [doc('Child birth proof', 'children'), doc('Identity proof')],
    generalInfo: 'Sukanya Samriddhi is a savings account for a girl child. Demonstration profile for the prototype.',
    next: 'Open the account at a bank or post office for eligible girl children.',
    benefit: 'Tax-advantaged savings subject to scheme rules.',
    source: 'Ministry of Finance',
    eligibility: {
      summary: 'Savings account for a girl child up to age 10.',
      targetGroups: ['Families with a girl child'],
      occupations: [],
      blockedOccupations: [],
      householdMatches: ['1', '2', '3 or more'],
      incomeMax: 3,
      needed: ['Child birth proof'],
    },
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli',
    category: 'Financial inclusion · Household energy',
    description: 'Subsidy support for households that install rooftop solar panels, aimed at lowering electricity bills.',
    purpose: 'Financial inclusion',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'saffron',
    why: ['Homeowners can explore rooftop-solar subsidy support', ...baseWhy],
    needed: ['Roof ownership', 'Electricity connection details'],
    documents: [doc('Aadhaar / identity proof'), doc('Residence / roof proof', 'housing'), doc('Electricity connection details')],
    generalInfo: 'PM Surya Ghar provides a subsidy for household rooftop solar installation. Demonstration profile for the prototype.',
    next: 'Check your eligibility through the national rooftop-solar portal.',
    benefit: 'Solar subsidy support subject to approved components.',
    source: 'Ministry of New and Renewable Energy',
    eligibility: {
      summary: 'Rooftop-solar subsidy for households.',
      targetGroups: ['Homeowners'],
      occupations: [],
      blockedOccupations: [],
      housingMatches: ['Own home'],
      incomeMax: 3,
      general: true,
      needed: ['Roof ownership details'],
    },
  },

  // ============================ WOMEN & CHILD ============================
  {
    id: 'pmmvy',
    name: 'PM Matru Vandana Yojana',
    category: 'Health · Maternal support',
    description: 'Cash support for eligible pregnant women and nursing mothers, intended to help cover early health expenses.',
    purpose: 'Women & Child',
    relevance: 'May be relevant',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Maternity support applies to eligible pregnant and nursing mothers', ...baseWhy],
    needed: ['Relevant identity and health records', 'Anganwadi or health centre registration'],
    documents: [doc('Aadhaar / identity proof'), doc('Health / maternity records'), doc('Bank account details')],
    generalInfo: 'PM Matru Vandana Yojana offers cash support to eligible pregnant women and nursing mothers. Demonstration profile for the prototype.',
    next: 'Check the current guidelines and registration window with an accredited health centre.',
    benefit: 'Cash support subject to official conditions.',
    source: 'Ministry of Women and Child Development',
    eligibility: {
      summary: 'Maternity cash support for eligible mothers.',
      targetGroups: ['Pregnant and nursing mothers'],
      occupations: ['Homemaker', 'Farmer', 'Agricultural worker', 'Daily wage worker'],
      blockedOccupations: ['Retired', 'Pensioner', 'Student'],
      femaleOnly: true,
      ageRange: [18, 49],
      incomeMax: 2,
      householdMatches: ['1', '2', '3 or more'],
      needed: ['Maternity records'],
    },
  },

  // ============================ DISABILITY ============================
  {
    id: 'adip',
    name: 'ADIP (Assistance to Disabled Persons)',
    category: 'Health · Assistive devices',
    description: 'Support that helps eligible persons with disabilities obtain assistive aids and appliances.',
    purpose: 'Disability',
    relevance: 'High relevance',
    status: 'Initial recommendation',
    tone: 'lavender',
    why: ['Persons with disabilities are the intended beneficiaries', ...baseWhy],
    needed: ['Disability certificate or prescribed documents', 'Local district welfare office process'],
    documents: [doc('Aadhaar / identity proof'), doc('Disability certificate', 'disability'), doc('Residence proof')],
    generalInfo: 'ADIP helps eligible persons with disabilities obtain assistive aids and appliances. Demonstration profile for the prototype.',
    next: 'Contact the district social welfare office for the current support catalogue.',
    benefit: 'Assistive devices subject to approved lists.',
    source: 'Department of Empowerment of Persons with Disabilities',
    eligibility: {
      summary: 'Assistive aids and appliances for persons with disabilities.',
      targetGroups: ['Persons with disabilities'],
      occupations: [],
      blockedOccupations: [],
      requiresDisabled: true,
      needed: ['Disability certificate'],
    },
  },
  {
    id: 'nishtha',
    name: 'NISHTHA / Holistic Rehabilitation',
    category: 'Disability · Rehabilitation',
    description: 'A rehabilitation pathway connecting eligible persons with disabilities to therapy, devices and support services.',
    purpose: 'Disability',
    relevance: 'High relevance',
    status: 'Initial recommendation',
    tone: 'indigo',
    why: ['Persons with disabilities are the intended beneficiaries', ...baseWhy],
    needed: ['Disability certificate', 'Local rehabilitation centre'],
    documents: [doc('Aadhaar / identity proof'), doc('Disability certificate', 'disability'), doc('Residence proof')],
    generalInfo: 'NISHTHA connects eligible persons with disabilities to rehabilitation support. Demonstration profile for the prototype.',
    next: 'Ask the district welfare office for the current rehab-service list.',
    benefit: 'Rehabilitation support subject to approved services.',
    source: 'Department of Empowerment of Persons with Disabilities',
    eligibility: {
      summary: 'Rehabilitation and support services for persons with disabilities.',
      targetGroups: ['Persons with disabilities'],
      occupations: [],
      blockedOccupations: [],
      requiresDisabled: true,
      needed: ['Disability certificate'],
    },
  },
];

// ---------------------------------------------------------------------------
// Scheme overlap map — used only as a verification aid.
// ---------------------------------------------------------------------------

export const schemeOverlapMap: Record<string, string[]> = {
  'pm-kisan': ['kcc', 'fasal-bima', 'soil-health', 'pmksy'],
  kcc: ['pm-kisan', 'svanidhi', 'pmegp', 'cgtmse', 'mudra'],
  'fasal-bima': ['pm-kisan', 'pm-kusum'],
  'pm-kusum': ['pm-kisan', 'fasal-bima', 'pmksy'],
  'soil-health': ['pm-kisan', 'pmksy'],
  pmksy: ['pm-kisan', 'soil-health', 'pm-kusum'],
  'pmay-g': ['pmay-u'],
  'pmay-u': ['pmay-g'],
  mgnrega: ['day-nrlm', 'e-shram'],
  svanidhi: ['pmegp', 'cgtmse', 'mudra', 'kcc'],
  pmegp: ['svanidhi', 'cgtmse', 'mudra', 'kcc'],
  cgtmse: ['svanidhi', 'pmegp', 'mudra'],
  mudra: ['svanidhi', 'pmegp', 'cgtmse', 'stand-up-india'],
  'stand-up-india': ['mudra', 'pmegp'],
  'pm-viswakarma': ['pmegp', 'mudra'],
  'day-nrlm': ['lakhpati-didi', 'mgnrega', 'pmegp'],
  'lakhpati-didi': ['day-nrlm'],
  'e-shram': ['pm-sym', 'mgnrega', 'epf-esic'],
  nsap: ['pm-vaya-vandana', 'annapurna', 'antodaya-anna'],
  'pm-vaya-vandana': ['nsap', 'apy'],
  annapurna: ['nsap', 'antodaya-anna'],
  apy: ['pm-sym', 'pm-vaya-vandana'],
  'pm-sym': ['apy', 'mgnrega', 'e-shram'],
  'epf-esic': ['pm-jay', 'janaushadhi', 'pm-sym'],
  'pm-jay': ['epf-esic', 'janaushadhi'],
  janaushadhi: ['pm-jay'],
  'antodaya-anna': ['nsap', 'annapurna', 'pm-jay'],
  'jan-dhan': ['apy', 'pmjjby', 'pmsby'],
  pmjjby: ['jan-dhan', 'pmsby'],
  pmsby: ['jan-dhan', 'pmjjby'],
  'sukanya-samriddhi': ['pmmvy', 'scholarship'],
  pmmvy: ['sukanya-samriddhi', 'mid-day-meal'],
  'mid-day-meal': ['pmmvy', 'scholarship'],
  pmkvy: ['apprenticeship', 'pm-yuva'],
  'pm-yuva': ['pmkvy', 'apprenticeship'],
  apprenticeship: ['pmkvy', 'pm-yuva'],
  adip: ['nishtha', 'nsap'],
  nishtha: ['adip', 'nsap'],
  'pm-surya-ghar': ['jan-dhan'],
  scholarship: ['mid-day-meal', 'pmkvy', 'sukanya-samriddhi'],
};

// ---------------------------------------------------------------------------
// Profile purpose interest — used by coverage analysis (client side).
// ---------------------------------------------------------------------------

export type PurposePriority = 'high' | 'medium' | 'low';

export function isAgriculturalProfile(p: CitizenProfile): boolean {
  if (FARMER_OCCUPATIONS.includes(p.occupation as (typeof FARMER_OCCUPATIONS)[number])) return true;
  const activity = p.agriculturalActivity ?? 'Not applicable';
  if (activity === 'Farmer / cultivator' || activity === 'Agricultural worker' || activity === 'Fishing / livestock / allied activity') return true;
  const land = p.agriculturalLand ?? 'Prefer not to say';
  if (land === 'Yes, I own farmland' || land === 'I lease or share farmland') return true;
  const holding = p.landholding ?? 'Prefer not to say';
  return holding === 'Up to 1 hectare' || holding === '1–4 hectares' || holding === 'Above 4 hectares';
}

export function isBusinessProfile(p: CitizenProfile): boolean {
  return BUSINESS_OCCUPATIONS.includes(p.occupation as (typeof BUSINESS_OCCUPATIONS)[number]);
}

export function isStudentProfile(p: CitizenProfile): boolean {
  if (p.occupation === 'Student') return true;
  return p.studying === 'Full-time' || p.studying === 'Part-time';
}

export function isSeekingWorkProfile(p: CitizenProfile): boolean {
  if (p.occupation === 'Unemployed / seeking work') return true;
  return p.seekingWork === 'Yes' || p.lookingForEmployment === 'Yes' || p.employment === 'Looking for work';
}

export function isRetiredProfile(p: CitizenProfile): boolean {
  return RETIRED_OCCUPATIONS.includes(p.occupation as (typeof RETIRED_OCCUPATIONS)[number]);
}

export function isSeniorProfile(p: CitizenProfile): boolean {
  if (p.ageGroup === '60+') return true;
  const numbers = (p.ageGroup ?? '').match(/\d+/g);
  return numbers !== null && numbers.length > 0 && Number(numbers[0]) >= 60;
}

export function isYouthProfile(p: CitizenProfile): boolean {
  if (p.ageGroup === '18–29') return true;
  const numbers = (p.ageGroup ?? '').match(/\d+/g);
  return numbers !== null && numbers.length > 0 && Number(numbers[0]) >= 15 && Number(numbers[0]) <= 29;
}

export function profilePurposeInterest(p: CitizenProfile): Record<WelfarePurpose, PurposePriority> {
  const farmer = isAgriculturalProfile(p);
  const biz = isBusinessProfile(p);
  const student = isStudentProfile(p);
  const seeking = isSeekingWorkProfile(p);
  const salaried = SALARIED_OCCUPATIONS.includes(p.occupation as (typeof SALARIED_OCCUPATIONS)[number]);
  const retired = isRetiredProfile(p);
  const senior = isSeniorProfile(p);
  const woman = p.gender === 'Female';
  const disabled = p.disability === 'Yes';
  const homemaker = p.occupation === 'Homemaker';
  const low = incomeLevelOf(p.income) === 0 || incomeLevelOf(p.income) === 1;
  const children = p.children === '1' || p.children === '2' || p.children === '3 or more';
  const youth = isYouthProfile(p);

  return {
    Agriculture: farmer ? 'high' : 'low',
    Livelihood: seeking || low ? 'high' : farmer || biz || homemaker ? 'medium' : 'low',
    Education: student ? 'high' : youth ? 'medium' : 'low',
    Housing: low || p.housing === 'No permanent house' ? 'high' : p.housing === 'Renting' || p.housing === 'Shared / family home' ? 'medium' : 'low',
    Healthcare: low || disabled || senior ? 'high' : 'medium',
    Pension: senior || retired ? 'high' : salaried ? 'medium' : 'low',
    'Food security': low ? 'high' : 'medium',
    'Women & Child': woman && (homemaker || farmer || children) ? 'high' : woman ? 'medium' : 'low',
    Disability: disabled ? 'high' : 'low',
    'Financial inclusion': low ? 'high' : 'medium',
  };
}

// ---------------------------------------------------------------------------
// Wizard sections — adaptive. Only sections whose condition matches are shown.
// ---------------------------------------------------------------------------

export type WizardField = {
  key: keyof CitizenProfile;
  label: string;
  options: readonly string[];
  hint?: string;
};

export type WizardSection = {
  key: string;
  label: string;
  short: string;
  fields: WizardField[];
  markdown?: string;
  condition?: (p: CitizenProfile) => boolean;
};

export function isFarmerLike(p: CitizenProfile): boolean {
  return isAgriculturalProfile(p) || FARMER_OCCUPATIONS.includes(p.occupation as (typeof FARMER_OCCUPATIONS)[number]);
}

export function isStudentLike(p: CitizenProfile): boolean {
  return isStudentProfile(p) || isYouthProfile(p) || p.occupation === 'Unemployed / seeking work';
}

export function isBusinessLike(p: CitizenProfile): boolean {
  return isBusinessProfile(p) || p.occupation === 'Unemployed / seeking work' || p.interestedInBusiness === 'Yes';
}

export function isRetiredLike(p: CitizenProfile): boolean {
  return isRetiredProfile(p) || isSeniorProfile(p);
}

export function wizardSections(profile: CitizenProfile): WizardSection[] {
  const sections: WizardSection[] = [
    {
      key: 'about-you',
      label: 'About you',
      short: 'About you',
      fields: [
        { key: 'ageGroup', label: 'Your age group', options: AGE_GROUP_OPTIONS },
        { key: 'gender', label: 'Gender', options: GENDER_OPTIONS },
        { key: 'maritalStatus', label: 'Marital status', options: MARITAL_STATUS_OPTIONS },
        { key: 'disability', label: 'Disability status', options: DISABILITY_OPTIONS },
        { key: 'socialCategory', label: 'Social category', options: SOCIAL_CATEGORY_OPTIONS, hint: 'Used only to match schemes such as scholarships and enterprise loans. You can skip.' },
        { key: 'occupation', label: 'What is your main status right now?', options: OCCUPATION_OPTIONS },
        { key: 'education', label: 'Education level', options: EDUCATION_OPTIONS },
      ],
    },
    {
      key: 'household',
      label: 'Your household',
      short: 'Household',
      fields: [
        { key: 'householdSize', label: 'How many people live with you?', options: HOUSEHOLD_SIZE_OPTIONS },
        { key: 'children', label: 'Children in the household', options: CHILDREN_OPTIONS },
        { key: 'dependents', label: 'People who depend on you', options: DEPENDENTS_OPTIONS },
        { key: 'elderlyMembers', label: 'Elderly members (60+) in your home', options: ELDERLY_MEMBERS_OPTIONS },
        { key: 'disabledMembers', label: 'Members with disability in your home', options: DISABLED_MEMBERS_OPTIONS },
        { key: 'income', label: 'Approximate annual household income', options: INCOME_OPTIONS },
        { key: 'housing', label: 'Your housing situation', options: HOUSING_OPTIONS },
      ],
    },
    {
      key: 'work',
      label: 'Work & livelihood',
      short: 'Work',
      fields:
        isRetiredLike(profile)
          ? [
              { key: 'previousOccupation', label: 'Your previous occupation', options: PREVIOUS_OCCUPATION_OPTIONS },
              { key: 'pensionStatus', label: 'Are you receiving a pension?', options: PENSION_STATUS_OPTIONS },
              { key: 'pensionSource', label: 'Pension type / source', options: PENSION_SOURCE_OPTIONS },
              { key: 'pensionRange', label: 'Approximate pension amount', options: PENSION_RANGE_OPTIONS, hint: 'Helps us suggest relevant support. You can skip.' },
              { key: 'stillWorking', label: 'Are you still working?', options: STILL_WORKING_OPTIONS },
            ]
          : [
              { key: 'employment', label: 'Your current employment status', options: EMPLOYMENT_OPTIONS },
              { key: 'seekingWork', label: 'Are you looking for work?', options: SEEKING_WORK_OPTIONS },
              { key: 'informalWorker', label: 'Do you work in the informal / unorganised sector?', options: INFORMAL_WORKER_OPTIONS },
            ],
    },
    {
      key: 'agriculture',
      label: 'Agriculture',
      short: 'Farming',
      condition: isFarmerLike,
      fields: [
        { key: 'agriculturalActivity', label: 'Your agricultural activity', options: AGRICULTURAL_ACTIVITY_OPTIONS },
        { key: 'agriculturalLand', label: 'Do you own or work farmland?', options: AGRICULTURAL_LAND_OPTIONS },
        { key: 'landholding', label: 'Approximate landholding', options: LANDHOLDING_OPTIONS },
        { key: 'cultivation', label: 'What do you cultivate or raise?', options: CULTIVATION_OPTIONS },
        { key: 'irrigation', label: 'Irrigation situation', options: IRRIGATION_OPTIONS },
      ],
    },
    {
      key: 'education',
      label: 'Education & training',
      short: 'Study',
      condition: isStudentLike,
      fields: [
        { key: 'studying', label: 'Are you currently studying?', options: STUDYING_OPTIONS },
        { key: 'courseField', label: 'Course or field of study', options: COURSE_FIELD_OPTIONS, hint: 'You can skip if you prefer.' },
        { key: 'skillTraining', label: 'Have you done skill / vocational training?', options: SKILL_TRAINING_OPTIONS },
        { key: 'lookingForEmployment', label: 'Looking for employment?', options: LOOKING_FOR_EMPLOYMENT_OPTIONS },
        { key: 'apprenticeshipInterest', label: 'Interested in an apprenticeship?', options: APPRENTICESHIP_INTEREST_OPTIONS },
      ],
    },
    {
      key: 'business',
      label: 'Business & self-employment',
      short: 'Business',
      condition: isBusinessLike,
      fields: [
        { key: 'businessStatus', label: 'Your business status', options: BUSINESS_STATUS_OPTIONS },
        { key: 'newBusiness', label: 'Is this a new or existing business?', options: NEW_BUSINESS_OPTIONS },
        { key: 'businessSize', label: 'Approximate business size', options: BUSINESS_SIZE_OPTIONS, hint: 'You can skip.' },
        { key: 'formalBusiness', label: 'Is the business formally registered?', options: FORMAL_BUSINESS_OPTIONS },
        { key: 'vendorStatus', label: 'Street-vendor status', options: VENDOR_STATUS_OPTIONS },
        { key: 'interestedInBusiness', label: 'Interested in starting a business?', options: INTERESTED_IN_BUSINESS_OPTIONS },
      ],
    },
    {
      key: 'welfare',
      label: 'Existing support',
      short: 'Support',
      markdown: 'These answers are self-reported and stay in this prototype. SAHAYAK does not have access to government beneficiary databases.',
      fields: [
        { key: 'existingPension', label: 'Do you currently receive any pension?', options: EXISTING_PENSION_OPTIONS },
        { key: 'existingWelfare', label: 'Any major welfare support you already receive?', options: EXISTING_WELFARE_OPTIONS },
        { key: 'healthCoverage', label: 'Health coverage status', options: HEALTH_COVERAGE_OPTIONS },
        { key: 'rationSupport', label: 'Do you receive ration / PDS support?', options: RATION_SUPPORT_OPTIONS },
        { key: 'housingSupport', label: 'Housing support status', options: HOUSING_SUPPORT_OPTIONS },
        { key: 'educationSupport', label: 'Education support status', options: EDUCATION_SUPPORT_OPTIONS },
        { key: 'livelihoodSupport', label: 'Livelihood support status', options: LIVELIHOOD_SUPPORT_OPTIONS },
      ],
    },
  ];
  return sections;
}