import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db, pool } from "./index";
import { verificationCases as verificationCaseSchema, districts as districtSchema, schemes as schemeSchema, users } from "./schema";
import { districts as seedDistricts, schemes as seedLegacySchemes, verificationCases as seedVerificationCases } from "../../client/src/lib/data";
import { citizenSchemes } from "../../client/src/lib/citizen";

async function seed() {
  console.log("Seeding database...");

  console.log("  Seeding users...");
  const seedUsers = [
    {
      name: "Demo Admin",
      email: "admin@sahayak.demo",
      role: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
    },
    {
      name: "District Officer",
      email: "officer@sahayak.demo",
      role: "district_officer",
      passwordHash: await bcrypt.hash("officer123", 10),
    },
  ];
  for (const user of seedUsers) {
    await db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({ target: users.email, set: { passwordHash: user.passwordHash, name: user.name, role: user.role } });
  }

  console.log("  Seeding districts...");
  const districtRows = seedDistricts.map((d) => ({
    name: d.name,
    state: d.state,
    region: d.region,
    potential: d.potential,
    recorded: d.recorded,
    gap: d.gap,
    priority: d.priority,
    status: d.status,
    freshness: d.freshness,
    signal: d.signal,
    locality: d.locality,
    households: d.households,
    scheme: d.scheme,
    verification: d.verification,
    x: d.x,
    y: d.y,
  }));
  await db
    .insert(districtSchema)
    .values(districtRows)
    .onConflictDoNothing({ target: districtSchema.name });

  console.log("  Seeding schemes...");
  const legacySchemesById = new Map(seedLegacySchemes.map((scheme) => [scheme.id, scheme]));
  const deriveShort = (name: string): string =>
    name
      .split(/[\s·/&,.-]+/)
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .slice(0, 6) || name.slice(0, 6).toUpperCase();
  const schemeRows = citizenSchemes.map((s) => {
    const legacy = legacySchemesById.get(s.id);
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      short: legacy?.short ?? deriveShort(s.name),
      tone: s.tone,
      households: legacy?.households ?? 0,
      record: legacy?.record ?? "Demo record",
      rule: legacy?.rule ?? "Prototype logic",
      description: s.description,
      beneficiaries: legacy?.beneficiaries ?? (s.eligibility.targetGroups.join(", ") || "Eligible citizens"),
      availability: legacy?.availability ?? "India · official implementation rules apply",
      occupation: legacy?.occupation ?? (s.eligibility.occupations.join(", ") || "All occupations"),
      benefit: s.benefit,
      officialSource: s.source,
      updated: legacy?.updated ?? "Demo update",
      active: true,
    };
  });
  const schemeIds = new Set(schemeRows.map((row) => row.id));
  const schemeInsertResult = await db.insert(schemeSchema).values(schemeRows).onConflictDoNothing({ target: schemeSchema.id });
  const [schemeCount] = await db.select({ total: sql<number>`count(*)::int` }).from(schemeSchema);
  const [distinctSchemeCount] = await db.select({ total: sql<number>`count(distinct id)::int` }).from(schemeSchema);
  console.log(`  Schemes: catalogue=${citizenSchemes.length} distinct=${schemeIds.size} inserted=${schemeInsertResult.rowCount} available=${schemeCount.total} distinctInDb=${distinctSchemeCount.total}`);

  console.log("  Seeding verification cases...");
  const caseRows = seedVerificationCases.map((c) => ({
    id: c.id,
    location: c.location,
    scheme: c.scheme,
    score: c.score,
    confidence: c.confidence,
    status: c.status,
    signal: c.signal,
  }));
  await db
    .insert(verificationCaseSchema)
    .values(caseRows)
    .onConflictDoNothing({ target: verificationCaseSchema.id });

  console.log(`Seeded ${seedUsers.length} users, ${districtRows.length} districts, ${schemeInsertResult.rowCount} schemes (${schemeCount.total} total available), ${caseRows.length} verification cases.`);
  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
