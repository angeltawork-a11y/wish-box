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

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!email) {
    return NextResponse.json(
      { error: "Укажите рабочую почту" },
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

  if (!isMailConfigured()) {
    return NextResponse.json(
      {
        error:
          "Отправка писем не настроена. Добавьте RESEND_API_KEY и MAIL_FROM.",
      },
      { status: 503 },
    );
  }

  await ensureSeeded();

  const found = await sql<{ id: number }>(
    `SELECT id FROM employees WHERE LOWER(email) = $1 LIMIT 1`,
    [email],
  );

  if (found[0]) {
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
      return NextResponse.json(
        {
          error:
            "Отправка писем не настроена. Добавьте RESEND_API_KEY и MAIL_FROM.",
        },
        { status: 503 },
      );
    }
    await sql(`DELETE FROM email_login_codes WHERE LOWER(email) = $1`, [email]);
    await sql(
      `INSERT INTO email_login_codes (email, code_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [email, codeHash, new Date(Date.now() + CODE_TTL_MS).toISOString()],
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      "Если эта почта есть в справочнике, код уже отправлен. Он действует 10 минут.",
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

  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const code = (body.code ?? "").trim();
  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Укажите почту и код из 6 цифр" },
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
     WHERE LOWER(e.email) = $1
     LIMIT 1`,
    [email],
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
