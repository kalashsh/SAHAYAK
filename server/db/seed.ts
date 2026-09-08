import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import { verificationCases as verificationCaseSchema, districts as districtSchema, schemes as schemeSchema, users } from "./schema";
import { districts as seedDistricts, schemes as seedSchemes, verificationCases as seedVerificationCases } from "../../client/src/lib/data";

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
  const schemeRows = seedSchemes.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    short: s.short,
    tone: s.tone,
    households: s.households,
    record: s.record,
    rule: s.rule,
    description: s.description,
    beneficiaries: s.beneficiaries,
    availability: s.availability,
    occupation: s.occupation,
    benefit: s.benefit,
    officialSource: s.officialSource,
    updated: s.updated,
    active: true,
  }));
  await db
    .insert(schemeSchema)
    .values(schemeRows)
    .onConflictDoNothing({ target: schemeSchema.id });

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

  console.log(`Seeded ${seedUsers.length} users, ${districtRows.length} districts, ${schemeRows.length} schemes, ${caseRows.length} verification cases.`);
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
