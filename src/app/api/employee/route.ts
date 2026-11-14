import { NextResponse } from "next/server";
import {
  createEmployeeToken,
  employeeCookieOptions,
  EMPLOYEE_COOKIE,
  readEmployeeSession,
} from "@/lib/employee-session";
import type { EmployeeContext } from "@/lib/employee-types";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await readEmployeeSession();
  if (!ctx) {
    return NextResponse.json({ saved: false, employee: null });
  }
  return NextResponse.json({ saved: true, employee: ctx });
}

export async function POST(request: Request) {
  const limited = rateLimit(`employee-save:${clientIp(request)}`, 20, 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много сохранений. Подождите немного.",
      limited.retryAfterSec,
    );
  }

  await ensureSeeded();

  let body: { name?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Укажите имя (не меньше 2 символов)" },
      { status: 400 },
    );
  }
  if (name.length > 120 || title.length > 160) {
    return NextResponse.json(
      { error: "Слишком длинные поля" },
      { status: 400 },
    );
  }

  let department = "";
  let employeeId: number | null = null;

  const found = await sql<{
    id: number;
    department_name: string;
    title: string;
  }>(
    `SELECT e.id, e.title, d.name AS department_name
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     WHERE LOWER(e.name) = LOWER($1)
       AND ($2 = '' OR LOWER(e.title) = LOWER($2))
     ORDER BY
       CASE WHEN LOWER(e.title) = LOWER($2) AND $2 <> '' THEN 0 ELSE 1 END
     LIMIT 1`,
    [name, title],
  );

  if (found[0]) {
    employeeId = found[0].id;
    department = found[0].department_name;
  }

  const employee: EmployeeContext = {
    name,
    title,
    department,
    employeeId,
  };

  const token = createEmployeeToken(employee);
  const res = NextResponse.json({ ok: true, employee });
  res.cookies.set(EMPLOYEE_COOKIE, token, employeeCookieOptions());
  return res;
}
