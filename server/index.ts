import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { randomBytes } from "crypto";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import { citizenProfiles, citizenSavedSchemes, demoCoverage, demoHouseholds, districts, schemes, sessions, users, verificationActions, verificationCases } from "./db/schema.ts";
import { recommend } from "./recommendations.ts";
import { analyzeHousehold, buildVerificationCaseRow, DATASET_LABEL, type VerificationCaseInput } from "./adminAnalysis.ts";
import { citizenSchemes, defaultCitizenProfile, type CitizenProfile as CitizenProfileModel } from "../client/src/lib/citizen.ts";
import {
  USER_ENTERED_DATASET_LABEL,
  USER_ENTERED_SCENARIO,
  archetypeOfOccupation,
  buildProfile,
  headLabelOf,
  householdRefFrom,
} from "../client/src/lib/manualHousehold.ts";
import { SCHEME_PURPOSE } from "./db/syntheticHouseholds.ts";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  createSession,
  destroySession,
  publicUser,
  requireAuth,
  requireRole,
  setSessionCookie,
  type AuthedRequest,
} from "./auth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());
  app.use(cookieParser());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // ---- Auth routes ----

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const rows = await db.select().from(users).where(eq(users.email, String(email).toLowerCase().trim()));
      const user = rows[0];
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(String(password), user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const session = await createSession(user.id);
      setSessionCookie(res, session.id, session.expiresAt);
      res.json({ user: publicUser(user) });
    } catch (err) {
      console.error("Login failed:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, (req: AuthedRequest, res) => {
    res.json({ user: publicUser(req.user!) });
  });

  app.post("/api/auth/logout", async (req: AuthedRequest, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      await destroySession(token);
    }
    clearSessionCookie(res);
    res.json({ success: true });
  });

  // ---- API routes ----

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/districts", async (_req, res) => {
    try {
      const rows = await db.select().from(districts);
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch districts:", err);
      res.status(500).json({ error: "Failed to fetch districts" });
    }
  });

  app.get("/api/districts/:name", async (req, res) => {
    try {
      const rows = await db.select().from(districts).where(eq(districts.name, req.params.name));
      if (rows.length === 0) {
        return res.status(404).json({ error: "District not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("Failed to fetch district:", err);
      res.status(500).json({ error: "Failed to fetch district" });
    }
  });

  app.get("/api/schemes", async (_req, res) => {
    try {
      const rows = await db.select().from(schemes);
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch schemes:", err);
      res.status(500).json({ error: "Failed to fetch schemes" });
    }
  });

  app.get("/api/schemes/:id", async (req, res) => {
    try {
      const rows = await db.select().from(schemes).where(eq(schemes.id, req.params.id));
      if (rows.length === 0) {
        return res.status(404).json({ error: "Scheme not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("Failed to fetch scheme:", err);
      res.status(500).json({ error: "Failed to fetch scheme" });
    }
  });

  // Protected: only admin can list users
  app.get("/api/users", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const rows = await db.select().from(users);
      res.json(rows.map(publicUser));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // ---- Admin dashboard routes (authenticated, admin-only) ----

  app.get("/api/admin/overview", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const [totals] = await db
        .select({
          totalPotential: sql<number>`coalesce(sum(${districts.potential}), 0)::int`,
          totalRecorded: sql<number>`coalesce(sum(${districts.recorded}), 0)::int`,
          totalGap: sql<number>`coalesce(sum(${districts.gap}), 0)::int`,
          highPriorityCount: sql<number>`coalesce(count(*) filter (where ${districts.status} = 'High'), 0)::int`,
        })
        .from(districts);
      const [areaCount] = await db
        .select({ monitoredAreas: sql<number>`count(*)::int` })
        .from(districts);
      const [schemeCount] = await db
        .select({ schemesTracked: sql<number>`count(*)::int` })
        .from(schemes);
      const [verificationCount] = await db
        .select({
          verificationCases: sql<number>`coalesce(count(*) filter (where ${districts.verification} <> 'Verified'), 0)::int`,
        })
        .from(districts);
      res.json({ ...totals, ...areaCount, ...schemeCount, ...verificationCount });
    } catch (err) {
      console.error("Failed to fetch admin overview:", err);
      res.status(500).json({ error: "Failed to fetch admin overview" });
    }
  });

  function formatFeedTime(date: Date) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function formatAuditTime(date: Date) {
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  app.get("/api/admin/signals/latest", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const topDistricts = await db
        .select({
          id: districts.id,
          name: districts.name,
          scheme: districts.scheme,
          status: districts.status,
          updatedAt: districts.updatedAt,
        })
        .from(districts)
        .orderBy(desc(districts.priority))
        .limit(3);
      const [citizenTotals] = await db
        .select({
          profiles: sql<number>`count(*)::int`,
          latest: sql<Date | null>`max(${citizenProfiles.createdAt})`,
        })
        .from(citizenProfiles);
      const [schemeCount] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(schemes);
      const [districtRefresh] = await db
        .select({ latest: sql<Date | null>`max(${districts.updatedAt})` })
        .from(districts);

      const signals = [] as Array<{ id: string; time: string; label: string; meta: string; tone: string }>;

      topDistricts.forEach((district) => {
        signals.push({
          id: `district-${district.id}`,
          time: formatFeedTime(district.updatedAt),
          label:
            district.status === "High"
              ? "High-priority area flagged"
              : district.status === "Medium"
                ? "New welfare signal detected"
                : "Signal under watch",
          meta: `${district.name} · ${district.scheme}`,
          tone: district.status === "High" ? "terracotta" : district.status === "Medium" ? "saffron" : "indigo",
        });
      });

      if (citizenTotals.profiles > 0) {
        signals.push({
          id: "citizen-profiles",
          time: citizenTotals.latest ? formatFeedTime(citizenTotals.latest) : "--:--",
          label: "Citizen profile captured",
          meta: `${citizenTotals.profiles} anonymous profile${citizenTotals.profiles === 1 ? "" : "s"} recorded`,
          tone: "sage",
        });
      }

      signals.push({
        id: "dataset-refresh",
        time: districtRefresh.latest ? formatFeedTime(districtRefresh.latest) : "--:--",
        label: "Dataset refreshed",
        meta: `${schemeCount.total} schemes tracked across the region`,
        tone: "indigo",
      });

      res.json({ signals });
    } catch (err) {
      console.error("Failed to fetch admin signals:", err);
      res.status(500).json({ error: "Failed to fetch admin signals" });
    }
  });

  // ---- Admin verification routes (authenticated, admin-only) ----

  app.get("/api/admin/verification-cases", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const rows = await db.select().from(verificationCases).orderBy(asc(verificationCases.createdAt));
      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch verification cases:", err);
      res.status(500).json({ error: "Failed to fetch verification cases" });
    }
  });

  app.get("/api/admin/verification-cases/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const rows = await db
        .select()
        .from(verificationCases)
        .where(eq(verificationCases.id, req.params.id))
        .limit(1);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Verification case not found" });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("Failed to fetch verification case:", err);
      res.status(500).json({ error: "Failed to fetch verification case" });
    }
  });

  async function recordVerificationAction(
    req: AuthedRequest,
    res: express.Response,
    caseId: string,
    action: "verify" | "reject",
  ) {
    const existing = await db
      .select()
      .from(verificationCases)
      .where(eq(verificationCases.id, caseId))
      .limit(1);
    if (existing.length === 0) {
      res.status(404).json({ error: "Verification case not found" });
      return null;
    }
    const updatedRows = await db
      .update(verificationCases)
      .set({
        status: action === "verify" ? "Verified" : "Rejected",
        updatedAt: new Date(),
      })
      .where(eq(verificationCases.id, caseId))
      .returning();
    await db.insert(verificationActions).values({
      caseId,
      actorId: req.user!.id,
      action,
      previousStatus: existing[0].status,
      nextStatus: action === "verify" ? "Verified" : "Rejected",
    });
    return updatedRows[0];
  }

  app.post("/api/admin/verification-cases/:id/verify", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
    try {
      const updated = await recordVerificationAction(req, res, req.params.id, "verify");
      if (updated) res.json(updated);
    } catch (err) {
      console.error("Failed to verify case:", err);
      res.status(500).json({ error: "Failed to verify case" });
    }
  });

  app.post("/api/admin/verification-cases/:id/reject", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
    try {
      const updated = await recordVerificationAction(req, res, req.params.id, "reject");
      if (updated) res.json(updated);
    } catch (err) {
      console.error("Failed to reject case:", err);
      res.status(500).json({ error: "Failed to reject case" });
    }
  });

  // ---- Admin household intelligence (authenticated, admin-only) ----

  const SCHEME_NAME_BY_ID = new Map(citizenSchemes.map((scheme) => [scheme.id, scheme.name]));

  function parseStoredProfile(json: string): CitizenProfileModel | null {
    try {
      const value = JSON.parse(json) as Record<string, unknown>;
      if (!value || typeof value !== "object" || typeof value.occupation !== "string") return null;
      return value as unknown as CitizenProfileModel;
    } catch {
      return null;
    }
  }

  async function loadHouseholdContext(id: string) {
    const rows = await db.select().from(demoHouseholds).where(eq(demoHouseholds.id, id)).limit(1);
    const household = rows[0];
    if (!household) return null;
    const coverage = await db
      .select()
      .from(demoCoverage)
      .where(eq(demoCoverage.householdId, id))
      .orderBy(asc(demoCoverage.schemeId));
    return { household, coverage, profile: parseStoredProfile(household.profileJson) };
  }

  app.get("/api/admin/households", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const requestedPage = Number.parseInt(String(req.query.page ?? "1"), 10);
      const requestedLimit = Number.parseInt(String(req.query.limit ?? "25"), 10);
      const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 25;
      const offset = (page - 1) * limit;

      const state = typeof req.query.state === "string" && req.query.state.trim() ? req.query.state.trim() : null;
      const district = typeof req.query.district === "string" && req.query.district.trim() ? req.query.district.trim() : null;
      const archetype = typeof req.query.archetype === "string" && req.query.archetype.trim() ? req.query.archetype.trim() : null;
      const scenario = typeof req.query.scenario === "string" && req.query.scenario.trim() ? req.query.scenario.trim() : null;
      const search = typeof req.query.search === "string" && req.query.search.trim() ? req.query.search.trim().toLowerCase() : null;

      const clauses = [];
      if (state) clauses.push(eq(demoHouseholds.state, state));
      if (district) clauses.push(eq(demoHouseholds.district, district));
      if (archetype) clauses.push(eq(demoHouseholds.archetype, archetype));
      if (scenario) clauses.push(eq(demoHouseholds.scenario, scenario));
      if (search) {
        clauses.push(
          or(
            ilike(demoHouseholds.householdRef, `%${search}%`),
            ilike(demoHouseholds.headLabel, `%${search}%`),
            ilike(demoHouseholds.locality, `%${search}%`),
          ),
        );
      }
      const where = clauses.length > 0 ? and(...clauses) : undefined;

      const [totalRow] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(demoHouseholds)
        .where(where);
      const total = totalRow?.total ?? 0;

      const rows = await db
        .select()
        .from(demoHouseholds)
        .where(where)
        .orderBy(asc(demoHouseholds.id))
        .limit(limit)
        .offset(offset);

      const ids = rows.map((row) => row.id);
      const coverageRows = ids.length
        ? await db
            .select({ householdId: demoCoverage.householdId, schemeId: demoCoverage.schemeId })
            .from(demoCoverage)
            .where(inArray(demoCoverage.householdId, ids))
        : [];

      const perHousehold = new Map<string, { covered: Set<string>; count: number }>();
      for (const row of rows) perHousehold.set(row.id, { covered: new Set<string>(), count: 0 });
      for (const c of coverageRows) {
        const entry = perHousehold.get(c.householdId);
        if (entry) {
          entry.covered.add(c.schemeId);
          entry.count += 1;
        }
      }

      const items = rows.map((row) => {
        const entry = perHousehold.get(row.id);
        const covered = entry ? Array.from(entry.covered) : [];
        const profile = parseStoredProfile(row.profileJson);
        const analysis = profile ? analyzeHousehold(profile, covered) : { gaps: [], overlaps: [] };
        return {
          id: row.id,
          householdRef: row.householdRef,
          state: row.state,
          district: row.district,
          locality: row.locality,
          headLabel: row.headLabel,
          archetype: row.archetype,
          scenario: row.scenario,
          dataset: row.dataset,
          coverageCount: entry?.count ?? 0,
          gapCount: analysis.gaps.length,
          overlapCount: analysis.overlaps.length,
        };
      });

      res.json({
        dataset: DATASET_LABEL,
        items,
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      });
    } catch (err) {
      console.error("Failed to fetch households:", err);
      res.status(500).json({ error: "Failed to fetch households" });
    }
  });

  app.post("/api/admin/households", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const body = req.body ?? {};
      const state = typeof body.state === "string" ? body.state.trim() : "";
      const district = typeof body.district === "string" ? body.district.trim() : "";
      const locality = typeof body.locality === "string" ? body.locality.trim() : "";

      if (!state || !district || !locality) {
        return res.status(400).json({ error: "state, district and locality are required" });
      }
      if (state.length > 200 || district.length > 200 || locality.length > 200) {
        return res.status(400).json({ error: "Location values are too long" });
      }

      const rawProfile =
        body.profile && typeof body.profile === "object" && !Array.isArray(body.profile)
          ? (body.profile as Record<string, unknown>)
          : {};
      const provided: Record<string, string> = {};
      for (const field of Object.keys(defaultCitizenProfile) as (keyof CitizenProfileModel)[]) {
        const value = rawProfile[field];
        if (typeof value === "string") {
          provided[field] = value;
        }
      }

      const profile = buildProfile({ ...provided, state, district, locality });
      const occupation = profile.occupation;

      const validSchemeIds = new Set(citizenSchemes.map((scheme) => scheme.id));
      const rawCoverage: unknown = body.coverage;
      const schemeIds = Array.from(
        new Set(
          (Array.isArray(rawCoverage) ? rawCoverage : [])
            .map((item: unknown): string => {
              if (typeof item === 'string') return item.trim();
              if (item && typeof item === 'object') {
                const id = (item as { schemeId?: unknown }).schemeId;
                return typeof id === 'string' ? id.trim() : '';
              }
              return '';
            })
            .filter((id) => id !== '' && validSchemeIds.has(id)),
        ),
      );

      const archetype = archetypeOfOccupation(occupation);

      // Generate a unique public household reference such as "HH-7QK2".
      let householdRef = "";
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const candidate = `HH-${householdRefFrom(randomBytes(4))}`;
        const existing = await db
          .select({ id: demoHouseholds.id })
          .from(demoHouseholds)
          .where(eq(demoHouseholds.householdRef, candidate))
          .limit(1);
        if (existing.length === 0) {
          householdRef = candidate;
          break;
        }
      }
      if (!householdRef) {
        return res.status(500).json({ error: "Could not allocate a unique household reference" });
      }

      const householdRow = {
        id: householdRef,
        householdRef,
        state,
        district,
        locality,
        headLabel: headLabelOf(occupation, profile.ageGroup),
        archetype,
        scenario: USER_ENTERED_SCENARIO,
        dataset: USER_ENTERED_DATASET_LABEL,
        profileJson: JSON.stringify(profile),
      };

      await db.transaction(async (tx) => {
        await tx.insert(demoHouseholds).values(householdRow);
        if (schemeIds.length > 0) {
          await tx
            .insert(demoCoverage)
            .values(
              schemeIds.map((schemeId) => ({
                householdId: householdRef,
                schemeId,
                purpose: SCHEME_PURPOSE[schemeId] ?? "Other",
                status: "active",
                source: "prototype",
              })),
            );
        }
      });

      res.status(201).json({
        household: {
          id: householdRef,
          householdRef,
          state,
          district,
          locality,
          headLabel: householdRow.headLabel,
          archetype,
          scenario: USER_ENTERED_SCENARIO,
          dataset: USER_ENTERED_DATASET_LABEL,
        },
      });
    } catch (err) {
      console.error("Failed to create household:", err);
      res.status(500).json({ error: "Failed to create household" });
    }
  });

  app.get("/api/admin/households/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const context = await loadHouseholdContext(req.params.id);
      if (!context) {
        return res.status(404).json({ error: "Household not found" });
      }
      const { household, coverage } = context;
      res.json({
        dataset: DATASET_LABEL,
        household: {
          id: household.id,
          householdRef: household.householdRef,
          state: household.state,
          district: household.district,
          locality: household.locality,
          headLabel: household.headLabel,
          archetype: household.archetype,
          scenario: household.scenario,
          dataset: household.dataset,
          createdAt: household.createdAt,
          updatedAt: household.updatedAt,
          profile: context.profile,
        },
        coverage: coverage.map((item) => ({
          schemeId: item.schemeId,
          schemeName: SCHEME_NAME_BY_ID.get(item.schemeId) ?? item.schemeId,
          purpose: item.purpose,
          status: item.status,
          source: item.source,
        })),
      });
    } catch (err) {
      console.error("Failed to fetch household:", err);
      res.status(500).json({ error: "Failed to fetch household" });
    }
  });

  app.get("/api/admin/households/:id/gaps", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const context = await loadHouseholdContext(req.params.id);
      if (!context) {
        return res.status(404).json({ error: "Household not found" });
      }
      if (!context.profile) {
        return res.status(422).json({ error: "Stored household profile could not be parsed" });
      }
      const analysis = analyzeHousehold(
        context.profile,
        context.coverage.map((item) => item.schemeId),
      );
      res.json({ dataset: DATASET_LABEL, evaluatedTotal: analysis.evaluatedTotal, gaps: analysis.gaps });
    } catch (err) {
      console.error("Failed to fetch household gaps:", err);
      res.status(500).json({ error: "Failed to fetch household gaps" });
    }
  });

  app.get("/api/admin/households/:id/overlaps", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const context = await loadHouseholdContext(req.params.id);
      if (!context) {
        return res.status(404).json({ error: "Household not found" });
      }
      if (!context.profile) {
        return res.status(422).json({ error: "Stored household profile could not be parsed" });
      }
      const analysis = analyzeHousehold(
        context.profile,
        context.coverage.map((item) => item.schemeId),
      );
      res.json({ dataset: DATASET_LABEL, evaluatedTotal: analysis.evaluatedTotal, overlaps: analysis.overlaps });
    } catch (err) {
      console.error("Failed to fetch household overlaps:", err);
      res.status(500).json({ error: "Failed to fetch household overlaps" });
    }
  });

  app.post("/api/admin/households/:id/verification-cases", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
    try {
      const body = req.body ?? {};
      const kind = body.kind;
      const schemeId = typeof body.schemeId === "string" ? body.schemeId.trim() : "";
      const linkedSchemeId = typeof body.linkedSchemeId === "string" ? body.linkedSchemeId.trim() : "";
      if (kind !== "gap" && kind !== "overlap") {
        return res.status(400).json({ error: "kind must be 'gap' or 'overlap'" });
      }
      if (!schemeId) {
        return res.status(400).json({ error: "schemeId is required" });
      }
      if (kind === "overlap" && !linkedSchemeId) {
        return res.status(400).json({ error: "linkedSchemeId is required for overlap cases" });
      }

      const context = await loadHouseholdContext(req.params.id);
      if (!context) {
        return res.status(404).json({ error: "Household not found" });
      }
      if (!context.profile) {
        return res.status(422).json({ error: "Stored household profile could not be parsed" });
      }

      const analysis = analyzeHousehold(
        context.profile,
        context.coverage.map((item) => item.schemeId),
      );

      const source = {
        householdRef: context.household.householdRef,
        locality: context.household.locality,
        district: context.household.district,
        state: context.household.state,
      };

      let input: VerificationCaseInput | null = null;

      if (kind === "gap") {
        const gap = analysis.gaps.find((item) => item.schemeId === schemeId);
        if (!gap) {
          return res.status(400).json({ error: "No potential gap recorded for this scheme" });
        }
        input = {
          household: source,
          kind,
          schemeName: gap.schemeName,
          purpose: gap.purpose,
          score: gap.score,
          confidence: gap.confidence,
          signal: `Potential welfare gap for ${gap.schemeName}. ${gap.signalText}`,
        };
      } else {
        const overlap = analysis.overlaps.find(
          (item) => item.existingSchemeId === schemeId && item.potentialSchemeId === linkedSchemeId,
        );
        if (!overlap) {
          return res.status(400).json({ error: "No potential overlap recorded for this pair of schemes" });
        }
        input = {
          household: source,
          kind,
          schemeName: overlap.existingSchemeName,
          purpose: overlap.purpose,
          score: overlap.priorityScore,
          confidence: overlap.verification,
          signal: `Potential overlapping welfare coverage between ${overlap.existingSchemeName} and ${overlap.potentialSchemeName}. ${overlap.reason}`,
        };
      }

      const row = buildVerificationCaseRow(input);
      const [created] = await db.insert(verificationCases).values(row).returning();
      res.status(201).json(created);
    } catch (err) {
      console.error("Failed to create verification case:", err);
      res.status(500).json({ error: "Failed to create verification case" });
    }
  });

  // ---- Admin audit trail (authenticated, admin-only) ----

  app.get("/api/admin/audit-trail", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const rows = await db
        .select({
          id: verificationActions.id,
          timestamp: verificationActions.createdAt,
          actor: users.name,
          action: verificationActions.action,
          caseId: verificationActions.caseId,
          caseLocation: verificationCases.location,
          previousStatus: verificationActions.previousStatus,
          nextStatus: verificationActions.nextStatus,
        })
        .from(verificationActions)
        .leftJoin(users, eq(verificationActions.actorId, users.id))
        .leftJoin(verificationCases, eq(verificationActions.caseId, verificationCases.id))
        .orderBy(desc(verificationActions.createdAt));
      res.json(
        rows.map((row) => ({
          id: row.id,
          timestamp: formatAuditTime(row.timestamp),
          user: row.actor ?? "System",
          action: row.action === "verify" ? "Verified case" : row.action === "reject" ? "Rejected case" : row.action,
          object: row.caseLocation ? `${row.caseId} · ${row.caseLocation}` : row.caseId,
          previous: row.previousStatus ?? "Pending",
          next: row.nextStatus ?? (row.action === "verify" ? "Verified" : "Rejected"),
        })),
      );
    } catch (err) {
      console.error("Failed to fetch audit trail:", err);
      res.status(500).json({ error: "Failed to fetch audit trail" });
    }
  });

  // ---- Citizen profile routes (anonymous, cookie-bound) ----

  const CITIZEN_COOKIE = "sahayak_citizen";
  const CITIZEN_FIELDS = Object.keys(defaultCitizenProfile) as (keyof CitizenProfileModel)[];

  type CitizenProfileFields = Record<keyof CitizenProfileModel, string>;

  function getOrCreateCitizenId(req: express.Request, res: express.Response) {
    const existing = req.cookies?.[CITIZEN_COOKIE];
    if (existing && typeof existing === "string" && existing.length >= 16) {
      return existing;
    }
    const id = randomBytes(32).toString("hex");
    res.cookie(CITIZEN_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: "/",
    });
    return id;
  }

  function validateCitizenProfile(body: unknown): CitizenProfileFields | null {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }
    const record = body as Record<string, unknown>;
    const profile: Record<string, string> = {};
    for (const field of CITIZEN_FIELDS) {
      const value = record[field];
      if (typeof value !== "string" || value.length === 0) {
        return null;
      }
      const trimmed = value.trim();
      if (trimmed.length === 0 || trimmed.length > 200) {
        return null;
      }
      profile[field] = trimmed;
    }
    return profile as CitizenProfileFields;
  }

  function loadCitizenProfile(row: Record<string, unknown> | undefined): Record<string, string> | null {
    if (!row) return null;
    const profile: Record<string, string> = {};
    for (const field of CITIZEN_FIELDS) {
      const value = row[field];
      if (typeof value === "string" && value.trim().length > 0) {
        profile[field] = value;
      }
    }
    return profile;
  }

  app.get("/api/citizen/profile", async (req, res) => {
    const sessionId = req.cookies?.[CITIZEN_COOKIE];
    if (typeof sessionId !== "string" || sessionId.length < 16) {
      return res.json({});
    }
    try {
      const rows = await db
        .select()
        .from(citizenProfiles)
        .where(eq(citizenProfiles.sessionId, sessionId))
        .limit(1);
      res.json(loadCitizenProfile(rows?.[0] as Record<string, unknown> | undefined) ?? {});
    } catch (err) {
      console.error("Failed to fetch citizen profile:", err);
      res.status(500).json({ error: "Failed to fetch citizen profile" });
    }
  });

  app.post("/api/citizen/profile", async (req, res) => {
    const profile = validateCitizenProfile(req.body);
    if (!profile) {
      return res.status(400).json({ error: "Invalid profile data" });
    }
    try {
      const sessionId = getOrCreateCitizenId(req, res);
      const rows = await db
        .insert(citizenProfiles)
        .values({ sessionId, ...profile })
        .onConflictDoUpdate({
          target: citizenProfiles.sessionId,
          set: { ...profile, updatedAt: new Date() },
        })
        .returning();
      res.json(rows[0]);
    } catch (err) {
      console.error("Failed to save citizen profile:", err);
      res.status(500).json({ error: "Failed to save citizen profile" });
    }
  });

  app.post("/api/citizen/recommendations", async (req, res) => {
    const profile = validateCitizenProfile(req.body);
    if (!profile) {
      return res.status(400).json({ error: "Invalid profile data" });
    }
    try {
      const sessionId = getOrCreateCitizenId(req, res);
      await db
        .insert(citizenProfiles)
        .values({ sessionId, ...profile })
        .onConflictDoUpdate({
          target: citizenProfiles.sessionId,
          set: { ...profile, updatedAt: new Date() },
        });
      res.json(recommend(profile));
    } catch (err) {
      console.error("Failed to build recommendations:", err);
      res.status(500).json({ error: "Failed to build recommendations" });
    }
  });

  // ---- Citizen saved-scheme routes (anonymous, cookie-bound) ----

  function readCitizenId(req: express.Request) {
    const existing = req.cookies?.[CITIZEN_COOKIE];
    return existing && typeof existing === "string" && existing.length >= 16 ? existing : null;
  }

  app.get("/api/citizen/saved-schemes", async (req, res) => {
    const sessionId = readCitizenId(req);
    if (!sessionId) {
      return res.json([]);
    }
    try {
      const rows = await db
        .select({ schemeId: citizenSavedSchemes.schemeId })
        .from(citizenSavedSchemes)
        .where(eq(citizenSavedSchemes.sessionId, sessionId))
        .orderBy(citizenSavedSchemes.createdAt);
      res.json(rows.map((row) => row.schemeId));
    } catch (err) {
      console.error("Failed to fetch saved schemes:", err);
      res.status(500).json({ error: "Failed to fetch saved schemes" });
    }
  });

  app.post("/api/citizen/saved-schemes", async (req, res) => {
    const schemeId =
      typeof req.body?.schemeId === "string" ? req.body.schemeId.trim() : "";
    if (!schemeId || schemeId.length > 200) {
      return res.status(400).json({ error: "Invalid scheme id" });
    }
    try {
      const sessionId = getOrCreateCitizenId(req, res);
      await db
        .insert(citizenSavedSchemes)
        .values({ sessionId, schemeId })
        .onConflictDoNothing({
          target: [citizenSavedSchemes.sessionId, citizenSavedSchemes.schemeId],
        });
      res.json({ success: true, schemeId });
    } catch (err) {
      console.error("Failed to save scheme:", err);
      res.status(500).json({ error: "Failed to save scheme" });
    }
  });

  app.delete("/api/citizen/saved-schemes/:id", async (req, res) => {
    const sessionId = readCitizenId(req);
    if (!sessionId) {
      return res.json({ success: true });
    }
    try {
      await db
        .delete(citizenSavedSchemes)
        .where(
          and(
            eq(citizenSavedSchemes.sessionId, sessionId),
            eq(citizenSavedSchemes.schemeId, req.params.id),
          ),
        );
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to remove saved scheme:", err);
      res.status(500).json({ error: "Failed to remove saved scheme" });
    }
  });

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
