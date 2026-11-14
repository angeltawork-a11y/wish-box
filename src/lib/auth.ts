import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SAMPLE_ADMIN_PASSWORD = "wishbox-admin";
const COOKIE_NAME = "wishbox_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export function getAdminPasswordConfig(): {
  password: string;
  isSample: boolean;
} {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (fromEnv !== "") {
    return { password: fromEnv, isSample: false };
  }
  return { password: SAMPLE_ADMIN_PASSWORD, isSample: true };
}

function signingKey(password: string): string {
  return createHmac("sha256", "wishbox-session-v1").update(password).digest("hex");
}

function sign(payload: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(payload).digest("base64url");
}

export function verifyPassword(candidate: string): boolean {
  const { password } = getAdminPasswordConfig();
  const a = Buffer.from(candidate);
  const b = Buffer.from(password);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const { password } = getAdminPasswordConfig();
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `ok.${exp}`;
  return `${payload}.${sign(payload, password)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ok, expStr, sig] = parts;
  if (ok !== "ok") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const { password } = getAdminPasswordConfig();
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
