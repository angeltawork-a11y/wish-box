import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/email";
import {
  createEmployeeToken,
  employeeCookieOptions,
  EMPLOYEE_COOKIE,
  getSessionSecret,
} from "@/lib/employee-session";
import type { EmployeeContext } from "@/lib/employee-types";
import { isMailConfigured, sendLoginCode } from "@/lib/mail";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(email: string, code: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  return createHash("sha256").update(`${secret}:${email}:${code}`).digest("hex");
}

function hashesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalizeName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) return null;
  return name;
}

type StaffPerson = {
  id: number;
  name: string;
  title: string;
  department_name: string;
  email: string;
};

function sessionFor(person: StaffPerson, email: string): EmployeeContext {
  return {
    name: person.name,
    title: person.title,
    department: person.department_name,
    employeeId: person.id,
    email,
  };
}

function signedIn(person: StaffPerson, email: string) {
  const employee = sessionFor(person, email);
  const res = NextResponse.json({ ok: true, employee });
  res.cookies.set(
    EMPLOYEE_COOKIE,
    createEmployeeToken(employee),
    employeeCookieOptions(),
  );
  return res;
}

function samePersonName(left: string, right: string): boolean {
  const words = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(Boolean)
      .sort()
      .join(" ");
  return words(left) === words(right);
}

async function findByNameAndEmail(
  name: string,
  email: string,
): Promise<StaffPerson | null> {
  const rows = await sql<StaffPerson>(
    `SELECT e.id, e.name, e.title, COALESCE(e.email, '') AS email, d.name AS department_name
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     WHERE LOWER(TRIM(e.name)) = LOWER($1)
        OR LOWER(e.name) LIKE '%' || LOWER($1) || '%'
        OR LOWER($1) LIKE '%' || LOWER(TRIM(e.name)) || '%'`,
    [name],
  );
  const named = rows.filter((row) => samePersonName(row.name, name));
  const open = named.filter((row) => row.email === "" || row.email.toLowerCase() === email);
  if (open.length !== 1) return null;
  const person = open[0];
  if (person.email === "") {
    try {
      await sql(
        `UPDATE employees
         SET email = $1
         WHERE id = $2 AND (email IS NULL OR email = '')`,
        [email, person.id],
      );
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string }).code
          : "";
      if (code === "23505") return null;
      throw error;
    }
  }
  return { ...person, email };
}

export async function POST(request: Request) {
  const limited = rateLimit(`email-code:${clientIp(request)}`, 8, 10 * 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много запросов кода. Подождите немного.",
      limited.retryAfterSec,
    );
  }

  if (!getSessionSecret()) {
    return NextResponse.json(
      { error: "Вход не настроен: задайте SESSION_SECRET." },
      { status: 503 },
    );
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const name = normalizeName(body.name ?? "");
  if (!email || !name) {
    return NextResponse.json(
      { error: "Укажите имя и рабочую почту" },
      { status: 400 },
    );
  }

  const perEmail = rateLimit(`email-code-addr:${email}`, 5, 10 * 60_000);
  if (!perEmail.ok) {
    return rateLimitedResponse(
      "Код для этой почты уже запрашивали. Подождите 10 минут.",
      perEmail.retryAfterSec,
    );
  }

  await ensureSeeded();

  const person = await findByNameAndEmail(name, email);
  if (!person) {
    return NextResponse.json(
      { error: "Имя и почта не совпали со справочником." },
      { status: 401 },
    );
  }

  if (!isMailConfigured()) {
    return signedIn(person, email);
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const codeHash = hashCode(email, code);
  if (!codeHash) {
    return NextResponse.json(
      { error: "Вход не настроен: задайте SESSION_SECRET." },
      { status: 503 },
    );
  }
  let mailState: "sent" | "unconfigured";
  try {
    mailState = await sendLoginCode(email, code);
  } catch {
    return NextResponse.json(
      { error: "Не удалось отправить письмо. Попробуйте ещё раз." },
      { status: 502 },
    );
  }
  if (mailState === "unconfigured") {
    return signedIn(person, email);
  }
  await sql(`DELETE FROM email_login_codes WHERE LOWER(email) = $1`, [email]);
  await sql(
    `INSERT INTO email_login_codes (email, code_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [email, codeHash, new Date(Date.now() + CODE_TTL_MS).toISOString()],
  );

  return NextResponse.json({
    ok: true,
    message:
      "Если имя и почта есть в справочнике, код уже отправлен. Он действует 10 минут.",
  });
}

export async function PUT(request: Request) {
  const limited = rateLimit(`email-verify:${clientIp(request)}`, 12, 10 * 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много попыток. Подождите немного.",
      limited.retryAfterSec,
    );
  }

  let body: { email?: string; name?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const name = normalizeName(body.name ?? "");
  const code = (body.code ?? "").trim();
  if (!email || !name || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Укажите имя, почту и код из 6 цифр" },
      { status: 400 },
    );
  }

  const codeHash = hashCode(email, code);
  if (!codeHash) {
    return NextResponse.json(
      { error: "Вход не настроен: задайте SESSION_SECRET." },
      { status: 503 },
    );
  }

  await ensureSeeded();

  const rows = await sql<{ id: number; code_hash: string; attempts: number }>(
    `UPDATE email_login_codes
     SET attempts = attempts + 1
     WHERE id = (
       SELECT id FROM email_login_codes
       WHERE LOWER(email) = $1 AND expires_at > NOW() AND attempts < $2
       ORDER BY created_at DESC
       LIMIT 1
     )
     RETURNING id, code_hash, attempts`,
    [email, MAX_ATTEMPTS],
  );
  const pending = rows[0];
  if (!pending || !hashesMatch(pending.code_hash, codeHash)) {
    return NextResponse.json(
      { error: "Неверный или просроченный код" },
      { status: 401 },
    );
  }

  const people = await sql<{
    id: number;
    name: string;
    title: string;
    department_name: string;
    email: string;
  }>(
    `SELECT e.id, e.name, e.title, e.email, d.name AS department_name
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     WHERE LOWER(e.email) = $1 AND LOWER(TRIM(e.name)) = LOWER($2)
     LIMIT 1`,
    [email, name],
  );
  const person = people[0];
  if (!person) {
    return NextResponse.json(
      { error: "Неверный или просроченный код" },
      { status: 401 },
    );
  }

  await sql(`DELETE FROM email_login_codes WHERE LOWER(email) = $1`, [email]);

  const employee: EmployeeContext = {
    name: person.name,
    title: person.title,
    department: person.department_name,
    employeeId: person.id,
    email: person.email,
  };
  const res = NextResponse.json({ ok: true, employee });
  res.cookies.set(
    EMPLOYEE_COOKIE,
    createEmployeeToken(employee),
    employeeCookieOptions(),
  );
  return res;
}
