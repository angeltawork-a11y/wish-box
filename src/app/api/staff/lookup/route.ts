import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Resolve department for exact name+title. Never returns the roster. */
export async function POST(request: Request) {
  const limited = rateLimit(`staff-lookup:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много запросов. Подождите немного.",
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
    return NextResponse.json({
      found: false,
      employeeId: null,
      department: "",
    });
  }

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

  if (!found[0]) {
    return NextResponse.json({
      found: false,
      employeeId: null,
      department: "",
    });
  }

  return NextResponse.json({
    found: true,
    employeeId: found[0].id,
    department: found[0].department_name,
  });
}
