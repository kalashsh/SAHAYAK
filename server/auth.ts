import type { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "./db/index.ts";
import { sessions, users, type User } from "./db/schema.ts";

export const SESSION_COOKIE = "sahayak_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function createSession(userId: number) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ id, userId, expiresAt });
  return { id, expiresAt };
}

export async function destroySession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

async function resolveSession(sessionId: string): Promise<User | null> {
  if (!sessionId) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export interface AuthedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  resolveSession(token)
    .then((user) => {
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      req.user = user;
      next();
    })
    .catch((err) => {
      console.error("Session resolution failed:", err);
      res.status(500).json({ error: "Authentication error" });
    });
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
