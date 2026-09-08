import {
  citizenSchemes,
  schemeOverlapMap,
  purposeLabel,
  type CitizenProfile,
  type WelfarePurpose,
} from "../client/src/lib/citizen.ts";
import { recommend, type Recommendation } from "./recommendations.ts";

export const DATASET_LABEL = "Synthetic · Prototype Data";

export type AdminGap = {
  schemeId: string;
  schemeName: string;
  purpose: WelfarePurpose;
  category: string;
  tier: string;
  score: number;
  confidence: string;
  matches: string[];
  missing: string[];
  notMatched: string[];
  potentialBenefit: string;
  nextStep: string;
  signalText: string;
};

export type AdminOverlap = {
  existingSchemeId: string;
  existingSchemeName: string;
  potentialSchemeId: string;
  potentialSchemeName: string;
  purpose: WelfarePurpose;
  relationship: "both currently covered" | "profile suggests eligibility";
  reason: string;
  priorityScore: number;
  status: "Potential overlapping welfare coverage";
  verification: "Requires verification";
};

export type HouseholdAnalysis = {
  evaluatedTotal: number;
  gaps: AdminGap[];
  overlaps: AdminOverlap[];
};

const ELIGIBLE_TIERS = new Set<string>(["High relevance", "Relevant", "May be relevant"]);

function gapFrom(rec: Recommendation): AdminGap {
  const matches = rec.match
    .filter((item) => item.status === "matched" || item.status === "partial")
    .map((item) => item.detail);
  return {
    schemeId: rec.id,
    schemeName: rec.name,
    purpose: rec.purpose,
    category: rec.category,
    tier: rec.tier,
    score: rec.score,
    confidence: rec.confidence,
    matches,
    missing: [...rec.missing],
    notMatched: rec.notMatched.map((item) => item.detail),
    potentialBenefit: rec.potentialBenefit,
    nextStep: rec.nextStep,
    signalText:
      matches.slice(0, 2).join(" ") || `Profile match score ${rec.score} out of 98 for this synthetic household.`,
  };
}

export function analyzeHousehold(profile: CitizenProfile, coveredSchemeIds: string[]): HouseholdAnalysis {
  const covered = new Set(coveredSchemeIds);
  const recommendations = recommend(profile);
  const byId = new Map(recommendations.map((rec) => [rec.id, rec] as const));

  const gaps = recommendations
    .filter((rec) => ELIGIBLE_TIERS.has(rec.tier) && !covered.has(rec.id))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map(gapFrom);

  const overlaps: AdminOverlap[] = [];
  const seenPairs = new Set<string>();

  for (const scheme of citizenSchemes) {
    if (!covered.has(scheme.id)) continue;
    const linked = schemeOverlapMap[scheme.id] ?? [];
    for (const linkedId of linked) {
      const pairKey = [scheme.id, linkedId].sort().join("::");
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const linkedRec = byId.get(linkedId);
      if (!linkedRec) continue;
      const linkedCovered = covered.has(linkedId);
      const linkedEligible = ELIGIBLE_TIERS.has(linkedRec.tier);
      if (!linkedCovered && !linkedEligible) continue;

      const relationship: AdminOverlap["relationship"] = linkedCovered
        ? "both currently covered"
        : "profile suggests eligibility";

      const purpose = scheme.purpose;
      const objective = purposeLabel[purpose] ?? purpose;

      let priorityScore: number;
      if (linkedEligible) priorityScore = linkedRec.score;
      else {
        const existingRec = byId.get(scheme.id);
        priorityScore = existingRec ? existingRec.score : 50;
      }
      priorityScore = Math.max(5, Math.min(98, Math.round(priorityScore)));

      const reason =
        relationship === "both currently covered"
          ? `${scheme.name} and ${linkedRec.name} are both recorded as current coverage for this household and serve overlapping purposes under “${objective}”. A responsible check confirms each benefit reaches the household it was designed for.`
          : `The household already receives ${scheme.name}, while ${linkedRec.name} serves a similar welfare objective (“${objective}”). The household profile also signals potential eligibility to ${linkedRec.name}. A responsible check confirms which outcome to follow up.`;

      overlaps.push({
        existingSchemeId: scheme.id,
        existingSchemeName: scheme.name,
        potentialSchemeId: linkedRec.id,
        potentialSchemeName: linkedRec.name,
        purpose,
        relationship,
        reason,
        priorityScore,
        status: "Potential overlapping welfare coverage",
        verification: "Requires verification",
      });
    }
  }

  overlaps.sort((a, b) => b.priorityScore - a.priorityScore || a.existingSchemeName.localeCompare(b.existingSchemeName));

  return { evaluatedTotal: citizenSchemes.length, gaps, overlaps };
}

export type VerificationCaseInput = {
  household: { householdRef: string; locality: string; district: string; state: string };
  kind: "gap" | "overlap";
  schemeName: string;
  purpose: string;
  score: number;
  confidence: string;
  signal: string;
};

export type VerificationCaseRow = {
  id: string;
  location: string;
  scheme: string;
  score: number;
  confidence: string;
  status: string;
  signal: string;
  createdAt: Date;
  updatedAt: Date;
  householdRef: string;
  kind: "gap" | "overlap";
  purpose: string;
};

function caseId(): string {
  const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `HHVC-${out}`;
}

export function buildVerificationCaseRow(input: VerificationCaseInput): VerificationCaseRow {
  const location = `${input.household.locality}, ${input.household.district}, ${input.household.state}`;
  const when = new Date();
  return {
    id: caseId(),
    location,
    scheme: input.schemeName,
    score: input.score,
    confidence: input.confidence,
    status: "Needs review",
    signal: `Synthetic prototype finding — ${input.signal}`,
    createdAt: when,
    updatedAt: when,
    householdRef: input.household.householdRef,
    kind: input.kind,
    purpose: input.purpose,
  };
}