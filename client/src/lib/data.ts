export type Region = 'Delhi NCR' | 'North India';
export type State = 'Delhi' | 'Haryana' | 'Uttar Pradesh' | 'Rajasthan' | 'Punjab' | 'Uttarakhand';
export type Severity = 'High' | 'Medium' | 'Watch';
export type Freshness = 'Fresh' | 'Aging' | 'Stale';

export type District = {
  name: string;
  state: State;
  region: Region;
  potential: number;
  recorded: number;
  gap: number;
  priority: number;
  status: Severity;
  freshness: Freshness;
  signal: string;
  locality: string;
  households: number;
  scheme: string;
  verification: 'Verified' | 'Needs review' | 'Freshness warning';
  x: number;
  y: number;
};

const locality = (name: string, state: State, region: Region, scheme: string, potential: number, recorded: number, priority: number, status: Severity, freshness: Freshness, verification: District['verification'], x: number, y: number): District => ({
  name,
  state,
  region,
  potential,
  recorded,
  gap: potential - recorded,
  priority,
  status,
  freshness,
  verification,
  scheme,
  locality: name,
  households: potential,
  signal: status === 'High' ? 'Potentially eligible households without a recent benefit record.' : status === 'Medium' ? 'Coverage is trailing the local eligibility pattern.' : 'Freshness warning limits confidence in this signal.',
  x,
  y,
});

export const districts: District[] = [
  locality('Najafgarh', 'Delhi', 'Delhi NCR', 'PM-KISAN', 1240, 876, 91, 'High', 'Fresh', 'Needs review', 27, 48),
  locality('Narela', 'Delhi', 'Delhi NCR', 'PM Fasal Bima Yojana', 1120, 794, 78, 'High', 'Fresh', 'Needs review', 34, 29),
  locality('Bawana', 'Delhi', 'Delhi NCR', 'PM SVANidhi', 804, 631, 71, 'High', 'Fresh', 'Needs review', 33, 27),
  locality('Sohna', 'Haryana', 'Delhi NCR', 'PM-KISAN', 1082, 691, 84, 'High', 'Fresh', 'Needs review', 48, 66),
  locality('Pataudi', 'Haryana', 'Delhi NCR', 'PM-KUSUM', 760, 526, 69, 'High', 'Aging', 'Needs review', 52, 57),
  locality('Farrukhnagar', 'Haryana', 'Delhi NCR', 'MGNREGA', 688, 514, 62, 'Medium', 'Fresh', 'Verified', 44, 53),
  locality('Ballabhgarh', 'Haryana', 'Delhi NCR', 'PM Fasal Bima Yojana', 918, 600, 79, 'High', 'Aging', 'Needs review', 62, 52),
  locality('Faridabad', 'Haryana', 'Delhi NCR', 'Ayushman Bharat / PM-JAY', 1360, 1024, 67, 'Medium', 'Fresh', 'Verified', 65, 43),
  locality('Dadri', 'Uttar Pradesh', 'Delhi NCR', 'Kisan Credit Card', 712, 594, 56, 'Medium', 'Aging', 'Freshness warning', 79, 39),
  locality('Jewar', 'Uttar Pradesh', 'Delhi NCR', 'PMAY-Gramin', 872, 641, 73, 'High', 'Fresh', 'Needs review', 83, 58),
  locality('Loni', 'Uttar Pradesh', 'Delhi NCR', 'Kisan Credit Card', 678, 563, 49, 'Watch', 'Stale', 'Freshness warning', 76, 22),
  locality('Ghaziabad', 'Uttar Pradesh', 'Delhi NCR', 'PM-JAY', 1510, 1244, 61, 'Medium', 'Fresh', 'Verified', 72, 31),
  locality('Noida', 'Uttar Pradesh', 'Delhi NCR', 'PM SVANidhi', 1180, 934, 54, 'Medium', 'Fresh', 'Verified', 68, 20),
  locality('Greater Noida', 'Uttar Pradesh', 'Delhi NCR', 'PMEGP', 924, 684, 58, 'Medium', 'Aging', 'Needs review', 75, 51),
  locality('Sonipat', 'Haryana', 'Delhi NCR', 'PMKVY', 1034, 812, 52, 'Medium', 'Fresh', 'Verified', 31, 12),
  locality('Panipat', 'Haryana', 'North India', 'PMEGP', 1188, 908, 63, 'Medium', 'Fresh', 'Needs review', 22, 8),
  locality('Rohtak', 'Haryana', 'North India', 'DAY-NRLM', 960, 748, 47, 'Watch', 'Aging', 'Verified', 18, 24),
  locality('Alwar', 'Rajasthan', 'North India', 'PMAY-Gramin', 1420, 1014, 66, 'Medium', 'Fresh', 'Needs review', 8, 73),
  locality('Bharatpur', 'Rajasthan', 'North India', 'NSAP', 1130, 846, 59, 'Medium', 'Aging', 'Verified', 12, 86),
  locality('Meerut', 'Uttar Pradesh', 'North India', 'Atal Pension Yojana', 1660, 1282, 55, 'Medium', 'Fresh', 'Verified', 90, 18),
  locality('Muzaffarnagar', 'Uttar Pradesh', 'North India', 'Soil Health Card', 1320, 1004, 51, 'Watch', 'Aging', 'Verified', 93, 6),
  locality('Amritsar', 'Punjab', 'North India', 'PM-KISAN', 1440, 1112, 48, 'Watch', 'Fresh', 'Verified', 4, 23),
  locality('Haridwar', 'Uttarakhand', 'North India', 'PMKVY', 980, 716, 45, 'Watch', 'Fresh', 'Verified', 56, 6),
];

export type Scheme = {
  id: string;
  name: string;
  category: string;
  short: string;
  tone: 'saffron' | 'sage' | 'indigo' | 'terracotta' | 'lavender';
  households: number;
  record: string;
  rule: string;
  description: string;
  beneficiaries: string;
  availability: string;
  occupation: string;
  benefit: string;
  officialSource: string;
  updated: string;
};

export const schemes: Scheme[] = [
  { id: 'pm-kisan', name: 'PM-KISAN', short: 'PMK', tone: 'saffron', category: 'Agriculture', households: 1240, record: '08 Jun 2026', rule: 'Version 3.2', description: 'Income support for eligible landholding farmer families.', beneficiaries: 'Landholding farmer families', availability: 'India · pilot display: Delhi NCR', occupation: 'Farmer, agricultural worker', benefit: 'Income support subject to official conditions', officialSource: 'Department of Agriculture & Farmers Welfare', updated: 'Demo update · 08 Jun 2026' },
  { id: 'fasal-bima', name: 'PM Fasal Bima Yojana', short: 'PFBY', tone: 'sage', category: 'Agriculture', households: 804, record: '05 Jun 2026', rule: 'Version 2.7', description: 'Crop insurance support for eligible crop loss and seasonal risk.', beneficiaries: 'Farmers with insurable crops', availability: 'India · state crop notifications apply', occupation: 'Farmer, cultivator', benefit: 'Crop risk protection subject to notified terms', officialSource: 'Ministry of Agriculture & Farmers Welfare', updated: 'Demo update · 05 Jun 2026' },
  { id: 'kcc', name: 'Kisan Credit Card', short: 'KCC', tone: 'indigo', category: 'Agriculture', households: 612, record: '29 May 2026', rule: 'Version 4.1', description: 'Credit access for farmers and allied agricultural activities.', beneficiaries: 'Farmers and allied activity households', availability: 'India · lending institution processes apply', occupation: 'Farmer, agricultural worker', benefit: 'Agricultural credit access subject to lender review', officialSource: 'Department of Financial Services', updated: 'Demo update · 29 May 2026' },
  { id: 'pm-kusum', name: 'PM-KUSUM', short: 'KUS', tone: 'terracotta', category: 'Agriculture', households: 488, record: '24 May 2026', rule: 'Prototype logic 1.4', description: 'Support for solar pumps and renewable energy for agriculture.', beneficiaries: 'Farmers and farmer groups', availability: 'State implementation varies', occupation: 'Farmer, cultivator', benefit: 'Renewable energy support under approved components', officialSource: 'Ministry of New and Renewable Energy', updated: 'Demo update · 24 May 2026' },
  { id: 'soil-health', name: 'Soil Health Card', short: 'SHC', tone: 'sage', category: 'Agriculture', households: 734, record: '18 May 2026', rule: 'Prototype logic 1.1', description: 'Soil testing and nutrient guidance for cultivators.', beneficiaries: 'Farmers and cultivators', availability: 'India · local testing availability varies', occupation: 'Farmer, agricultural worker', benefit: 'Soil nutrient information and advisory', officialSource: 'Department of Agriculture & Farmers Welfare', updated: 'Demo update · 18 May 2026' },
  { id: 'pmay-g', name: 'PMAY-Gramin', short: 'PMGR', tone: 'terracotta', category: 'Housing', households: 1032, record: '02 Jun 2026', rule: 'Prototype logic 2.1', description: 'Rural housing assistance for eligible households.', beneficiaries: 'Eligible rural households', availability: 'Rural areas · state lists apply', occupation: 'All occupations', benefit: 'Housing assistance subject to approved lists', officialSource: 'Ministry of Rural Development', updated: 'Demo update · 02 Jun 2026' },
  { id: 'pmay-u', name: 'PMAY-Urban', short: 'PMUR', tone: 'lavender', category: 'Housing', households: 884, record: '30 May 2026', rule: 'Prototype logic 2.0', description: 'Housing support pathways for eligible urban households.', beneficiaries: 'Eligible urban households', availability: 'Urban areas · local body process applies', occupation: 'All occupations', benefit: 'Housing assistance subject to official component rules', officialSource: 'Ministry of Housing and Urban Affairs', updated: 'Demo update · 30 May 2026' },
  { id: 'mgnrega', name: 'MGNREGA', short: 'NREGA', tone: 'saffron', category: 'Livelihood / Employment', households: 1368, record: '06 Jun 2026', rule: 'Prototype logic 3.2', description: 'Demand-driven rural wage employment support.', beneficiaries: 'Rural households seeking wage work', availability: 'Rural areas · local registration applies', occupation: 'Workers seeking rural employment', benefit: 'Employment opportunity under program conditions', officialSource: 'Ministry of Rural Development', updated: 'Demo update · 06 Jun 2026' },
  { id: 'svanidhi', name: 'PM SVANidhi', short: 'SVAN', tone: 'terracotta', category: 'Livelihood / Employment', households: 728, record: '01 Jun 2026', rule: 'Prototype logic 2.4', description: 'Working-capital support pathway for street vendors.', beneficiaries: 'Street vendors', availability: 'Urban and peri-urban areas', occupation: 'Street vendor, micro-business owner', benefit: 'Working-capital loan pathway subject to lender review', officialSource: 'Ministry of Housing and Urban Affairs', updated: 'Demo update · 01 Jun 2026' },
  { id: 'pmegp', name: 'PMEGP', short: 'PMEGP', tone: 'indigo', category: 'Livelihood / Employment', households: 516, record: '25 May 2026', rule: 'Prototype logic 1.7', description: 'Credit-linked support for new micro-enterprises.', beneficiaries: 'Aspiring micro-enterprise owners', availability: 'India · implementing agency process applies', occupation: 'Entrepreneur, worker', benefit: 'Enterprise finance pathway subject to appraisal', officialSource: 'Ministry of Micro, Small & Medium Enterprises', updated: 'Demo update · 25 May 2026' },
  { id: 'day-nrlm', name: 'DAY-NRLM', short: 'NRLM', tone: 'sage', category: 'Livelihood / Employment', households: 642, record: '21 May 2026', rule: 'Prototype logic 1.9', description: 'Rural livelihood and self-help group support.', beneficiaries: 'Rural women and households', availability: 'Rural areas · state mission implementation', occupation: 'Self-help group member, worker', benefit: 'Livelihood and group finance support pathways', officialSource: 'Ministry of Rural Development', updated: 'Demo update · 21 May 2026' },
  { id: 'apy', name: 'Atal Pension Yojana', short: 'APY', tone: 'lavender', category: 'Social Security', households: 468, record: '17 May 2026', rule: 'Prototype logic 1.5', description: 'Pension savings pathway for eligible subscribers.', beneficiaries: 'Eligible subscribers in the specified age range', availability: 'India · account opening rules apply', occupation: 'Workers and self-employed people', benefit: 'Pension contribution pathway', officialSource: 'Pension Fund Regulatory and Development Authority', updated: 'Demo update · 17 May 2026' },
  { id: 'pm-sym', name: 'PM Shram Yogi Maandhan', short: 'SYMA', tone: 'saffron', category: 'Social Security', households: 392, record: '12 May 2026', rule: 'Prototype logic 1.2', description: 'Pension support pathway for eligible unorganised workers.', beneficiaries: 'Eligible unorganised workers', availability: 'India · enrollment rules apply', occupation: 'Unorganised worker', benefit: 'Pension contribution support pathway', officialSource: 'Ministry of Labour & Employment', updated: 'Demo update · 12 May 2026' },
  { id: 'nsap', name: 'National Social Assistance Programme', short: 'NSAP', tone: 'lavender', category: 'Social Security', households: 988, record: '03 Jun 2026', rule: 'Prototype logic 2.3', description: 'Social assistance pathways for eligible vulnerable households.', beneficiaries: 'Older people, widows and persons with disabilities', availability: 'India · state verification applies', occupation: 'Not occupation-specific', benefit: 'Social assistance subject to applicable category', officialSource: 'Ministry of Rural Development', updated: 'Demo update · 03 Jun 2026' },
  { id: 'pm-jay', name: 'Ayushman Bharat / PM-JAY', short: 'PMJAY', tone: 'indigo', category: 'Health', households: 1510, record: '07 Jun 2026', rule: 'Prototype logic 2.6', description: 'Health coverage pathway for eligible families.', beneficiaries: 'Eligible low-income and vulnerable families', availability: 'India · state implementation applies', occupation: 'All occupations', benefit: 'Cashless healthcare coverage under approved package', officialSource: 'National Health Authority', updated: 'Demo update · 07 Jun 2026' },
  { id: 'pmkvy', name: 'PMKVY', short: 'PMKVY', tone: 'saffron', category: 'Skill Development', households: 804, record: '27 May 2026', rule: 'Prototype logic 1.8', description: 'Skill training and certification opportunities.', beneficiaries: 'Eligible youth and job seekers', availability: 'India · training center availability varies', occupation: 'Student, job seeker, worker', benefit: 'Training and assessment pathway', officialSource: 'Ministry of Skill Development and Entrepreneurship', updated: 'Demo update · 27 May 2026' },
  { id: 'scholarship', name: 'National Scholarship Portal schemes', short: 'NSP', tone: 'lavender', category: 'Education', households: 476, record: '19 May 2026', rule: 'Prototype logic 1.3', description: 'Scholarship discovery pathway for eligible students.', beneficiaries: 'Students meeting scheme-specific conditions', availability: 'India · institution and category rules apply', occupation: 'Student', benefit: 'Education assistance pathway', officialSource: 'National Scholarship Portal', updated: 'Demo update · 19 May 2026' },
];

export const capabilities = [
  { number: '01', name: 'GAP RADAR', verb: 'Detect', description: 'Spot where eligibility signals and recorded benefits drift apart.', tone: 'terracotta' },
  { number: '02', name: 'WELFARE GRAPH', verb: 'Connect', description: 'Trace households, rules, schemes and geography as one living system.', tone: 'indigo' },
  { number: '03', name: 'OPPORTUNITY RADAR', verb: 'Prioritize', description: 'Focus outreach where a human action could unlock the most value.', tone: 'saffron' },
  { number: '04', name: 'RULE CONSISTENCY', verb: 'Verify', description: 'Keep eligibility logic explainable, auditable and internally coherent.', tone: 'sage' },
  { number: '05', name: 'WHAT-IF SIMULATOR', verb: 'Simulate', description: 'Test an intervention before it becomes a field plan.', tone: 'lavender' },
];

export const verificationCases = districts.slice(0, 8).map((district, index) => ({
  id: `CASE-${1042 - index * 17}`,
  location: district.name,
  scheme: district.scheme,
  score: district.priority,
  confidence: district.status === 'High' ? 'High' : 'Medium',
  status: district.verification,
  signal: district.signal,
}));

export const auditEvents = [
  { timestamp: '14:22', user: 'District Officer', action: 'Verified Case', object: 'CASE-1042', previous: 'Pending', next: 'Verified' },
  { timestamp: '14:18', user: 'System', action: 'Signal detected', object: 'Najafgarh / PM-KISAN', previous: '—', next: 'Needs review' },
  { timestamp: '14:03', user: 'Rules steward', action: 'Rule version updated', object: 'PM-KISAN v3.2', previous: 'v3.1', next: 'v3.2' },
  { timestamp: '13:47', user: 'District Officer', action: 'Outreach plan opened', object: 'Sohna', previous: 'Ranked', next: 'In planning' },
  { timestamp: '13:12', user: 'Data steward', action: 'Dataset refreshed', object: 'Delhi NCR locality layer', previous: 'Aging', next: 'Fresh' },
];

export const activity = [
  { time: '14:32', label: 'New welfare signal detected', meta: 'Najafgarh · PM-KISAN', tone: 'terracotta' },
  { time: '14:28', label: 'Case moved to verification', meta: 'CASE-1042 · District review', tone: 'saffron' },
  { time: '14:21', label: 'Rule version updated', meta: 'PM-KISAN · v3.2', tone: 'sage' },
  { time: '13:12', label: 'Locality dataset refreshed', meta: 'Delhi NCR · 23 areas', tone: 'indigo' },
];

export const ruleChecks = [
  { label: 'Age ≥ 18', status: 'Verified', detail: 'All sampled records meet the threshold.' },
  { label: 'Landholding > threshold', status: 'Verified', detail: '2,914 records match the current landholding rule.' },
  { label: 'Not excluded category', status: 'Review', detail: '12 records need a manual category check.' },
];

export const regionOptions = ['Delhi NCR', 'North India', 'All Demo Regions'] as const;

export const localitiesByDistrict: Record<string, string[]> = {
  Najafgarh: ['Najafgarh', 'Mehrauli', 'Chhatarpur'], Narela: ['Narela', 'Bawana'], Bawana: ['Bawana', 'Karawal Nagar'], Sohna: ['Sohna', 'Pataudi'], Pataudi: ['Pataudi', 'Manesar', 'Farrukhnagar'], Ballabhgarh: ['Ballabhgarh', 'Tigaon', 'NIT region'], Dadri: ['Dadri', 'Dankaur', 'Greater Noida West'], Loni: ['Loni', 'Modinagar', 'Muradnagar'], Noida: ['Noida'], Ghaziabad: ['Ghaziabad', 'Hapur Road region'], Alwar: ['Alwar'], Bharatpur: ['Bharatpur'],
};

export const filterDistricts = (items: District[], filters: { region?: string; state?: string; district?: string; locality?: string; scheme?: string; severity?: string; minGap?: number }) => items.filter(item => (!filters.region || filters.region === 'All Demo Regions' || item.region === filters.region) && (!filters.state || filters.state === 'All states' || item.state === filters.state) && (!filters.district || filters.district === 'All districts' || item.name === filters.district) && (!filters.locality || filters.locality === 'All localities' || item.locality === filters.locality) && (!filters.scheme || filters.scheme === 'All schemes' || item.scheme === filters.scheme) && (!filters.severity || filters.severity === 'All priorities' || item.status === filters.severity) && (!filters.minGap || item.gap >= filters.minGap));

export const simulation = { currentGap: districts.reduce((sum, item) => sum + item.gap, 0), maxGap: districts.reduce((sum, item) => sum + item.gap, 0), baseOutreach: 40, baseConversion: 20 };
export const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(Math.round(value));
export const selectedDistrict = districts[0];
