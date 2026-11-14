import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { EmployeeContext } from "@/lib/employee-types";

export type { EmployeeContext } from "@/lib/employee-types";

export const EMPLOYEE_COOKIE = "wishbox_employee";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

type StoredPayload = EmployeeContext & { exp: number };

function signingKey(): string {
  const fromEnv =
    process.env.EMPLOYEE_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "";
  const material = fromEnv !== "" ? fromEnv : "wishbox-employee-public-v1";
  return createHmac("sha256", "wishbox-employee-session-v1")
    .update(material)
    .digest("hex");
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

function encode(ctx: EmployeeContext): string {
  const stored: StoredPayload = {
    ...ctx,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(stored), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined | null): EmployeeContext | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const raw = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as StoredPayload;
    if (!raw || typeof raw !== "object") return null;
    if (!Number.isFinite(raw.exp) || Date.now() > raw.exp) return null;
    const name = String(raw.name ?? "").trim();
    if (name.length < 2) return null;
    const title = String(raw.title ?? "").trim();
    const department = String(raw.department ?? "").trim();
    let employeeId: number | null = null;
    if (typeof raw.employeeId === "number" && Number.isFinite(raw.employeeId)) {
      employeeId = raw.employeeId;
    }
    return { name, title, department, employeeId };
  } catch {
    return null;
  }
}

export function createEmployeeToken(ctx: EmployeeContext): string {
  return encode({
    name: ctx.name.trim(),
    title: ctx.title.trim(),
    department: ctx.department.trim(),
    employeeId: ctx.employeeId,
  });
}

export function parseEmployeeToken(
  token: string | undefined | null,
): EmployeeContext | null {
  return decode(token);
}

export async function readEmployeeSession(): Promise<EmployeeContext | null> {
  const jar = await cookies();
  return parseEmployeeToken(jar.get(EMPLOYEE_COOKIE)?.value);
}

export function employeeCookieOptions(maxAgeSec = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(maxAgeSec),
  };
}
