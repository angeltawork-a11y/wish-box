import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "wishbox_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export function getAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim() ?? "";
  return fromEnv !== "" ? fromEnv : null;
}

export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

function signingKey(password: string): string {
  return createHmac("sha256", "wishbox-session-v1").update(password).digest("hex");
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(payload).digest("base64url");
}

export function verifyPassword(candidate: string): boolean {
  const password = getAdminPassword();
  if (password === null) {
    return false;
  }
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const password = getAdminPassword();
  if (password === null) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `ok.${exp}`;
  return `${payload}.${sign(payload, password)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const password = getAdminPassword();
  if (password === null) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ok, expStr, sig] = parts;
  if (ok !== "ok") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${ok}.${expStr}`;
  const expected = sign(payload, password);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function requireAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return isValidSessionToken(jar.get(COOKIE_NAME)?.value);
}

export { COOKIE_NAME };
