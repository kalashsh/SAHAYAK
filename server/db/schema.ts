import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
  ],
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("user"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_role_idx").on(table.role),
  ],
);

export const districts = pgTable(
  "districts",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    state: text("state").notNull(),
    region: text("region").notNull(),
    potential: integer("potential").notNull(),
    recorded: integer("recorded").notNull(),
    gap: integer("gap").notNull(),
    priority: integer("priority").notNull(),
    status: text("status").notNull(),
    freshness: text("freshness").notNull(),
    signal: text("signal").notNull(),
    locality: text("locality").notNull(),
    households: integer("households").notNull(),
    scheme: text("scheme").notNull(),
    verification: text("verification").notNull(),
    x: integer("x").notNull(),
    y: integer("y").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("districts_name_unique").on(table.name),
    index("districts_state_idx").on(table.state),
    index("districts_region_idx").on(table.region),
    index("districts_scheme_idx").on(table.scheme),
  ],
);

export const schemes = pgTable(
  "schemes",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    short: text("short").notNull(),
    tone: text("tone").notNull(),
    households: integer("households").notNull(),
    record: text("record").notNull(),
    rule: text("rule").notNull(),
    description: text("description").notNull(),
    beneficiaries: text("beneficiaries").notNull(),
    availability: text("availability").notNull(),
    occupation: text("occupation").notNull(),
    benefit: text("benefit").notNull(),
    officialSource: text("official_source").notNull(),
    updated: text("updated").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("schemes_category_idx").on(table.category),
  ],
);

export const citizenProfiles = pgTable(
  "citizen_profiles",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    // Location
    state: text("state").notNull(),
    district: text("district").notNull(),
    locality: text("locality").notNull(),
    // A. About you
    ageGroup: text("age_group").notNull(),
    gender: text("gender").notNull().default("Prefer not to say"),
    maritalStatus: text("marital_status").notNull().default(""),
    disability: text("disability").notNull().default("Prefer not to say"),
    socialCategory: text("social_category").notNull().default(""),
    occupation: text("occupation").notNull(),
    education: text("education").notNull(),
    // B. Household
    householdSize: text("household_size").notNull(),
    children: text("children").notNull().default(""),
    dependents: text("dependents").notNull(),
    elderlyMembers: text("elderly_members").notNull().default(""),
    disabledMembers: text("disabled_members").notNull().default(""),
    income: text("income").notNull(),
    housing: text("housing").notNull(),
    // C. Employment / livelihood
    employment: text("employment").notNull(),
    previousOccupation: text("previous_occupation").notNull().default(""),
    pensionStatus: text("pension_status").notNull().default(""),
    pensionSource: text("pension_source").notNull().default(""),
    pensionRange: text("pension_range").notNull().default(""),
    stillWorking: text("still_working").notNull().default(""),
    seekingWork: text("seeking_work").notNull().default(""),
    informalWorker: text("informal_worker").notNull().default(""),
    // D. Agriculture
    agriculturalActivity: text("agricultural_activity").notNull().default(""),
    agriculturalLand: text("agricultural_land").notNull().default(""),
    landholding: text("landholding").notNull().default(""),
    cultivation: text("cultivation").notNull().default(""),
    irrigation: text("irrigation").notNull().default(""),
    // E. Education
    studying: text("studying").notNull().default(""),
    courseField: text("course_field").notNull().default(""),
    skillTraining: text("skill_training").notNull().default(""),
    lookingForEmployment: text("looking_for_employment").notNull().default(""),
    apprenticeshipInterest: text("apprenticeship_interest").notNull().default(""),
    // F. Business / self-employment
    businessStatus: text("business_status").notNull().default(""),
    newBusiness: text("new_business").notNull().default(""),
    businessSize: text("business_size").notNull().default(""),
    formalBusiness: text("formal_business").notNull().default(""),
    vendorStatus: text("vendor_status").notNull().default(""),
    interestedInBusiness: text("interested_in_business").notNull().default(""),
    // G. Social / welfare situation (self-reported, optional)
    existingPension: text("existing_pension").notNull().default(""),
    existingWelfare: text("existing_welfare").notNull().default(""),
    healthCoverage: text("health_coverage").notNull().default(""),
    rationSupport: text("ration_support").notNull().default(""),
    housingSupport: text("housing_support").notNull().default(""),
    educationSupport: text("education_support").notNull().default(""),
    livelihoodSupport: text("livelihood_support").notNull().default(""),
    // Legacy free-text summary, kept for compatibility
    situation: text("situation").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("citizen_profiles_session_unique").on(table.sessionId),
  ],
);

export const citizenSavedSchemes = pgTable(
  "citizen_saved_schemes",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    schemeId: text("scheme_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("citizen_saved_schemes_session_scheme_unique").on(table.sessionId, table.schemeId),
    index("citizen_saved_schemes_session_idx").on(table.sessionId),
  ],
);

export const verificationCases = pgTable(
  "verification_cases",
  {
    id: text("id").primaryKey(),
    location: text("location").notNull(),
    scheme: text("scheme").notNull(),
    score: integer("score").notNull(),
    confidence: text("confidence").notNull(),
    status: text("status").notNull(),
    signal: text("signal").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("verification_cases_status_idx").on(table.status),
  ],
);

export const verificationActions = pgTable(
  "verification_actions",
  {
    id: serial("id").primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => verificationCases.id, { onDelete: "cascade" }),
    actorId: integer("actor_id").references(() => users.id),
    action: text("action").notNull(),
    previousStatus: text("previous_status").notNull(),
    nextStatus: text("next_status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("verification_actions_case_idx").on(table.caseId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CitizenProfile = typeof citizenProfiles.$inferSelect;
export type NewCitizenProfile = typeof citizenProfiles.$inferInsert;
export type CitizenSavedScheme = typeof citizenSavedSchemes.$inferSelect;
export type NewCitizenSavedScheme = typeof citizenSavedSchemes.$inferInsert;
export type VerificationCase = typeof verificationCases.$inferSelect;
export type NewVerificationCase = typeof verificationCases.$inferInsert;
export type VerificationAction = typeof verificationActions.$inferSelect;
export type NewVerificationAction = typeof verificationActions.$inferInsert;
export type District = typeof districts.$inferSelect;
export type NewDistrict = typeof districts.$inferInsert;
export type Scheme = typeof schemes.$inferSelect;
export type NewScheme = typeof schemes.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
