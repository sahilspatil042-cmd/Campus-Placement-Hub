import type { Request } from "express";
import jwt from "jsonwebtoken";
import { pool } from "@workspace/db";

export type AuthUser = {
  id: number;
  email: string;
  role: "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER";
};

const secret = process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "campus-placement-dev-secret";

export function tokenFor(user: AuthUser): string {
  return jwt.sign(user, secret, { expiresIn: "24h" });
}

export function currentUser(req: Request): AuthUser | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), secret) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireUser(req: Request, res: { status: (code: number) => { json: (body: unknown) => unknown } }): Promise<AuthUser | null> {
  const user = currentUser(req);
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }
  const result = await pool.query("select id, email, role from users where id = $1 and is_active = true", [user.id]);
  if (!result.rows[0]) {
    res.status(401).json({ message: "Account is inactive or unavailable" });
    return null;
  }
  return result.rows[0] as AuthUser;
}

export function roleAllowed(user: AuthUser | null, roles: AuthUser["role"][]): boolean {
  return user !== null && roles.includes(user.role);
}

export function iso(value: unknown): string | undefined {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function pageParams(query: Record<string, unknown>): { page: number; size: number; offset: number } {
  const page = Math.max(0, Number(query.page ?? 0) || 0);
  const size = Math.min(100, Math.max(1, Number(query.size ?? 10) || 10));
  return { page, size, offset: page * size };
}

export function page<T>(content: T[], totalElements: number, pageNumber: number, size: number) {
  return { content, totalElements, totalPages: Math.ceil(totalElements / size), page: pageNumber, size };
}