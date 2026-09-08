import {
  citizenSchemes,
  incomeLevelOf,
  isAgriculturalProfile,
  isStudentProfile,
  isSeekingWorkProfile,
  SALARIED_OCCUPATIONS,
  schemeOverlapMap,
  type CitizenProfile,
  type ConfidenceLabel,
  type MatchStatus,
  type RelevanceLabel,
  type SchemeEligibility,
} from "../client/src/lib/citizen.ts";

export type RecomRelevance = RelevanceLabel;

export type Recommendation = Omit<(typeof citizenSchemes)[number], "relevance"> & {
  relevance: RelevanceLabel;
  tier: RelevanceLabel;
  score: number;
  confidence: ConfidenceLabel;
  why: string[];
  match: Array<{ factor: string; status: MatchStatus; detail: string }>;
  notMatched: Array<{ factor: string; status: MatchStatus; detail: string }>;
  missing: string[];
  overlap: string[];
  potentialBenefit: string;
  nextStep: string;
};

// ---------------------------------------------------------------------------
// Recommendation hierarchy (larger = more important):
//   1. HARD ELIGIBILITY / DISQUALIFIERS  → blocking, caps score at Low relevance
//   2. PRIMARY TARGET GROUP              → occupation match, very high weight
//   3. PROFILE RELEVANCE                 → scheme-specific conditions, high weight
//   4. SECONDARY CONDITIONS              → supportive conditions, medium weight
//   5. GENERAL WELFARE RELEVANCE         → universal applicability, low weight
//
// The final score is a *profile-match score*, NOT a probability of eligibility.
// ---------------------------------------------------------------------------

const W = {
  PRIMARY: 42, // primary target-group membership
  STRONG: 18, // strong eligibility-condition match
  MATCH: 12, // secondary / supportive condition match
  GENERAL: 10, // universal welfare relevance
  NONBLOCK: 16, // penalty for a condition that does not match (non-blocking)
  BLOCK_MAX: 30, // any hard disqualifier caps the score here (Low relevance)
  BASE: 28,
  CAP: 98,
} as const;

type SignalStatement = {
  label: string;
  status: MatchStatus;
  detail: string;
  weight: number;
  blocking?: boolean;
};

type RuleResult = {
  signals: SignalStatement[];
};

const matched = (label: string, detail: string, weight: number): SignalStatement => ({ label, status: "matched", detail, weight });
const partial = (label: string, detail: string, weight: number): SignalStatement => ({ label, status: "partial", detail, weight });
const missingInfo = (label: string, detail: string): SignalStatement => ({ label, status: "missing", detail, weight: 0 });
const noMatch = (label: string, detail: string, weight = W.NONBLOCK, blocking = false): SignalStatement => ({ label, status: "not-matched", detail, weight, blocking });
const block = (label: string, detail: string): SignalStatement => ({ label, status: "not-matched", detail, weight: W.NONBLOCK, blocking: true });

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

type AgeBounds = { low: number; high: number };

function ageBounds(p: CitizenProfile): AgeBounds {
  const text = (p.ageGroup ?? "").trim();
  if (text === "60+") return { low: 60, high: 120 };
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length === 0) return { low: 0, high: 120 };
  const low = Number(numbers[0]);
  const high = numbers.length > 1 ? Number(numbers[1]) : low;
  return { low, high };
}

const ageInRange = (p: CitizenProfile, low: number, high: number): boolean => {
  const { low: l } = ageBounds(p);
  return l >= low && l <= high;
};

const hasFarmland = (p: CitizenProfile): boolean | null => {
  const land = p.agriculturalLand ?? "";
  if (land === "Yes, I own farmland" || land === "I lease or share farmland") return true;
  if (land === "No farmland" || land === "Prefer not to say") return land === "No farmland" ? false : null;
  const holding = p.landholding ?? "";
  if (holding === "Up to 1 hectare" || holding === "1–4 hectares" || holding === "Above 4 hectares") return true;
  if (holding === "I do not own land") return false;
  return null;
};

const womanOrUnknown = (p: CitizenProfile): boolean | null => {
  if (p.gender === "Female") return true;
  if (p.gender === "Male" || p.gender === "Other") return false;
  return null;
};

const studentOrUnknown = (p: CitizenProfile): boolean | null => {
  if (isStudentProfile(p)) return true;
  if (p.occupation === "Student") return true;
  const nonStudentRoles = ["Farmer", "Agricultural worker", "Homemaker", "Retired", "Pensioner", "Salaried employee", "Government employee", "Private employee", "Business owner"];
  if (nonStudentRoles.includes(p.occupation)) return false;
  if (p.employment === "Employed" || p.employment === "Self-employed") return false;
  return null;
};

const disabledOrUnknown = (p: CitizenProfile): boolean | null => {
  if (p.disability === "Yes") return true;
  if (p.disability === "No") return false;
  return null;
};

const seekingOrKnown = (p: CitizenProfile): boolean | null => {
  if (isSeekingWorkProfile(p)) return true;
  if (p.occupation === "Student" || p.occupation === "Homemaker" || p.occupation === "Retired" || p.occupation === "Pensioner") return false;
  if ((SALARIED_OCCUPATIONS as readonly string[]).includes(p.occupation)) return false;
  if (p.employment === "Employed" || p.employment === "Self-employed") return false;
  return null;
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreFrom(signals: SignalStatement[]) {
  let score: number = W.BASE;
  let blocked = false;
  for (const s of signals) {
    if (s.blocking && s.status === "not-matched") {
      blocked = true;
      continue;
    }
    if (s.status === "matched") score += s.weight;
    else if (s.status === "partial") score += Math.round(s.weight * 0.5);
    else if (s.status === "not-matched") score -= s.weight;
  }
  if (blocked) score = Math.max(10, Math.min(W.BLOCK_MAX, score));
  return { score: Math.max(5, Math.min(W.CAP, Math.round(score))), blocked };
}

function tierFromScore(score: number, blocked: boolean): RelevanceLabel {
  if (blocked) return "Low relevance";
  if (score >= 78) return "High relevance";
  if (score >= 58) return "Relevant";
  if (score >= 34) return "May be relevant";
  return "Low relevance";
}

function confidenceFrom(signals: SignalStatement[], blocked: boolean): ConfidenceLabel {
  if (blocked) return "Needs verification";
  const strong = signals.some((s) => s.status === "matched" && s.weight >= W.STRONG);
  const hasMissing = signals.some((s) => s.status === "missing");
  const hasPartial = signals.some((s) => s.status === "partial");
  const hasNoMatch = signals.some((s) => s.status === "not-matched" && !s.blocking);
  if (strong && !hasMissing && !hasPartial && !hasNoMatch) return "High";
  if (strong) return "Medium";
  return "Needs verification";
}

// ---------------------------------------------------------------------------
// Eligibility → signals. One function consumes the structured metadata so that
// individual schemes do not need hand-written if/else sprawl.
// ---------------------------------------------------------------------------

function occupationSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  const occ = profile.occupation;
  if (e.occupations.includes(occ)) {
    const group = e.targetGroups[0] ?? "the intended group";
    return [matched("Main activity", `Your main activity (${occ}) matches ${group.toLowerCase()}.`, W.PRIMARY)];
  }
  if (e.general) {
    return [matched("Broad eligibility", e.summary, W.GENERAL)];
  }
  if (e.blockedOccupations.includes(occ)) {
    return [
      block(
        "Main activity",
        `This opportunity is intended for ${e.targetGroups.join(" or ").toLowerCase()}, which your main activity (${occ}) does not fit.`,
      ),
    ];
  }
  return [
    missingInfo(
      "Main activity",
      `We could not confirm ${e.targetGroups[0]?.toLowerCase() ?? "the intended group"} from your profile yet — you can complete this in “About you”.`,
    ),
  ];
}

function ageSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.ageRange) return [];
  const [low, high] = e.ageRange;
  if (ageInRange(profile, low, high)) {
    return [matched("Age", `Your age group matches the ${low}-${high}` + (high >= 120 ? "+" : "") + ` range for this opportunity.`, W.STRONG)];
  }
  const { low: l } = ageBounds(profile);
  if (e.ageEssential) {
    return [block("Age", `This opportunity is meant for ages ${low}-${high >= 120 ? "60+" : high}, and your age group is outside that range.`)];
  }
  return [noMatch("Age", `This opportunity is aimed at ages ${low}-${high >= 120 ? "60+" : high}; your age group falls outside.`)];
}

function incomeSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (e.general || e.incomeMax === undefined) return [];
  const level = incomeLevelOf(profile.income);
  if (level === -1) {
    return [missingInfo("Income", "Household income was not shared, so this condition cannot be assessed.")];
  }
  if (level <= e.incomeMax) {
    return [matched("Income", "Your household income range fits the income condition for this opportunity.", W.STRONG)];
  }
  if (e.incomeRetained !== undefined && level <= e.incomeRetained) {
    return [partial("Income", "Your income range is moderate; the official verification decides this condition.", W.STRONG)];
  }
  if (e.incomeEssential) {
    return [block("Income", "Your household income range is above the limit this opportunity targets.")];
  }
  return [noMatch("Income", "Your household income range does not fit the income condition for this opportunity.")];
}

function agricultureSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  const signals: SignalStatement[] = [];
  if (e.requiresAgriculture) {
    if (isAgriculturalProfile(profile)) {
      signals.push(matched("Agricultural activity", "Your profile indicates active farming or agricultural activity.", W.STRONG));
    } else {
      signals.push(
        block(
          "Agricultural activity",
          "Not a high-priority match because this opportunity is intended for agricultural households and your profile does not indicate agricultural activity.",
        ),
      );
    }
  }
  if (e.requiresLand) {
    const land = hasFarmland(profile);
    if (land === true) {
      signals.push(matched("Landholding", "Your farmland / cultivation details match the landholding condition.", W.STRONG));
    } else if (land === false) {
      signals.push(block("Landholding", "This opportunity requires farmland or cultivation, and your profile indicates you do not currently hold farmland."));
    } else {
      signals.push(missingInfo("Landholding", "Landholding details were not shared, so this condition cannot be assessed."));
    }
  }
  return signals;
}

function genderSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.femaleOnly) return [];
  const result = womanOrUnknown(profile);
  if (result === true) return [matched("Gender", "You identified as a woman, which matches the target group for this opportunity.", W.STRONG)];
  if (result === false) return [block("Gender", "This opportunity targets women, and your profile does not match that condition.")];
  return [missingInfo("Gender", "Gender was not shared, so this condition cannot be assessed.")];
}

function disabilitySignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.requiresDisabled) return [];
  const result = disabledOrUnknown(profile);
  if (result === true) return [matched("Disability", "Your disability status matches the target group for this opportunity.", W.PRIMARY)];
  if (result === false) return [block("Disability", "This opportunity is for persons with disabilities, which your profile does not indicate.")];
  return [missingInfo("Disability", "Disability status was not answered; completing it would refine this recommendation.")];
}

function studentSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.requiresStudent) return [];
  const result = studentOrUnknown(profile);
  if (result === true) return [matched("Student status", "Your student status matches the target group for this opportunity.", W.STRONG)];
  if (result === false) return [block("Student status", "This opportunity is aimed at students, which your profile does not indicate.")];
  return [missingInfo("Student status", "Study status was not answered; completing it would refine this recommendation.")];
}

function seekingSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.requiresSeekingWork) return [];
  if (isSeekingWorkProfile(profile)) {
    return [matched("Employment status", "Looking for work is a direct signal for this opportunity.", W.STRONG)];
  }
  if (e.occupations.includes(profile.occupation)) {
    // Already a primary target even without actively seeking.
    return [];
  }
  const result = seekingOrKnown(profile);
  if (result === false) {
    return [noMatch("Employment status", "This opportunity is aimed at people seeking work, which your profile does not indicate.")];
  }
  if (result === null) {
    return [missingInfo("Employment status", "Your work-seeking status was not answered; completing it would refine this recommendation.")];
  }
  return [];
}

function employmentMatchesSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.employmentMatches || e.employmentMatches.length === 0) return [];
  if (e.employmentMatches.includes(profile.employment)) {
    return [matched("Employment", "Your employment status strengthens this match.", W.MATCH)];
  }
  return [];
}

function housingSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  const signals: SignalStatement[] = [];
  if (e.housingMatches?.includes(profile.housing)) {
    signals.push(matched("Housing", "Your housing situation fits the condition for this opportunity.", W.MATCH));
  }
  if (e.housingBlocks?.includes(profile.housing)) {
    signals.push(noMatch("Housing", "Your housing situation does not fit the condition for this opportunity."));
  }
  return signals;
}

function householdSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.householdMatches || e.householdMatches.length === 0) return [];
  const size = profile.householdSize ?? '';
  const kids = profile.children ?? '';
  if (e.householdMatches.includes(size) || e.householdMatches.includes(kids)) {
    return [matched("Family", "Your household composition fits the intended group for this opportunity.", W.MATCH)];
  }
  return [];
}

function categorySignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.categoryMatches || e.categoryMatches.length === 0) return [];
  if (e.categoryMatches.includes(profile.socialCategory)) {
    return [matched("Social category", "Your social category matches the target group for this opportunity.", W.MATCH)];
  }
  if (profile.socialCategory === "Prefer not to say") {
    return [missingInfo("Social category", "Social category was not shared; some schemes depend on it.")];
  }
  return [];
}

function pensionSignal(profile: CitizenProfile, e: SchemeEligibility): SignalStatement[] {
  if (!e.existingPensionBlocked) return [];
  const receiving = profile.pensionStatus === "Receiving a pension" || profile.existingPension === "Government / social pension" || profile.existingPension === "Employer / EPFO pension" || profile.existingPension === "Private pension";
  if (receiving) {
    return [block("Pension status", "This opportunity is for senior citizens who are not already receiving a pension, and you indicated you receive one.")];
  }
  if (profile.pensionStatus === "Not receiving a pension" || profile.existingPension === "None") {
    return [matched("Pension status", "You indicated you do not currently receive a pension, which matches this opportunity.", W.STRONG)];
  }
  return [missingInfo("Pension status", "Pension status was not answered; completing it would refine this recommendation.")];
}

function requiredInfoSignals(e: SchemeEligibility): SignalStatement[] {
  return (e.needed ?? []).map((n) => missingInfo("Documentation", n));
}

function evaluate(profile: CitizenProfile, e: SchemeEligibility): RuleResult {
  const signals: SignalStatement[] = [
    ...occupationSignal(profile, e),
    ...ageSignal(profile, e),
    ...incomeSignal(profile, e),
    ...agricultureSignal(profile, e),
    ...genderSignal(profile, e),
    ...disabilitySignal(profile, e),
    ...studentSignal(profile, e),
    ...seekingSignal(profile, e),
    ...employmentMatchesSignal(profile, e),
    ...housingSignal(profile, e),
    ...householdSignal(profile, e),
    ...categorySignal(profile, e),
    ...pensionSignal(profile, e),
    ...requiredInfoSignals(e),
  ];
  return { signals };
}

// ---------------------------------------------------------------------------
// Recommendation pipeline
// ---------------------------------------------------------------------------

export function recommend(profile: CitizenProfile): Recommendation[] {
  const byId = new Map<string, Recommendation>();

  const results = citizenSchemes.map((scheme) => {
    const result = evaluate(profile, scheme.eligibility);
    const { score, blocked } = scoreFrom(result.signals);
    const tier: RelevanceLabel = tierFromScore(score, blocked);
    const confidence = confidenceFrom(result.signals, blocked);

    const match = result.signals
      .filter((s) => s.status === "matched" || s.status === "partial" || s.status === "missing")
      .map((s) => ({ factor: s.label, status: s.status, detail: s.detail }));

    const notMatched = result.signals
      .filter((s) => s.status === "not-matched")
      .map((s) => ({ factor: s.label, status: s.status, detail: s.detail }));

    const why = result.signals
      .filter((s) => s.status !== "not-matched")
      .map((s) => s.detail);

    const missing = result.signals.filter((s) => s.status === "missing").map((s) => s.detail);

    const recommendation: Recommendation = {
      ...scheme,
      relevance: tier,
      tier,
      score,
      confidence,
      why,
      match,
      notMatched,
      missing,
      overlap: [],
      potentialBenefit: scheme.benefit,
      nextStep: scheme.next,
    };
    byId.set(scheme.id, recommendation);
    return recommendation;
  });

  const relevantIds = new Set(
    results.filter((r) => r.tier === "High relevance" || r.tier === "Relevant" || r.tier === "May be relevant").map((r) => r.id),
  );

  for (const recommendation of results) {
    const linked = schemeOverlapMap[recommendation.id] ?? [];
    recommendation.overlap = linked.filter((id) => relevantIds.has(id));
  }

  results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return results;
}