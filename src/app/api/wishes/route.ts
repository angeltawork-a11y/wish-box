import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await ensureSeeded();

  let body: {
    name?: string;
    title?: string;
    department?: string;
    wish?: string;
    employeeId?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  const wish = (body.wish ?? "").trim();
  let department = (body.department ?? "").trim();
  let employeeId =
    typeof body.employeeId === "number" && Number.isFinite(body.employeeId)
      ? body.employeeId
      : null;

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Укажите имя (не меньше 2 символов)" },
      { status: 400 },
    );
  }
  if (wish.length < 3) {
    return NextResponse.json(
      { error: "Напишите желание (не меньше 3 символов)" },
      { status: 400 },
    );
  }
  if (wish.length > 4000) {
    return NextResponse.json(
      { error: "Слишком длинный текст желания" },
      { status: 400 },
    );
  }

  if (employeeId != null) {
    const match = await sql<{
      id: number;
      name: string;
      title: string;
      department_name: string;
    }>(
      `SELECT e.id, e.name, e.title, d.name AS department_name
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       WHERE e.id = $1`,
      [employeeId],
    );
    if (match[0]) {
      department = match[0].department_name;
      if (!title) {
        // keep submitted title if provided
      }
    } else {
      employeeId = null;
    }
  }

  if (!department && (name || title)) {
    const found = await sql<{
      id: number;
      department_name: string;
      title: string;
    }>(
      `SELECT e.id, e.title, d.name AS department_name
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       WHERE LOWER(e.name) = LOWER($1)
          OR (LOWER(e.name) = LOWER($1) AND LOWER(e.title) = LOWER($2))
          OR (LOWER(e.title) = LOWER($2) AND $2 <> '')
       ORDER BY
         CASE WHEN LOWER(e.name) = LOWER($1) AND LOWER(e.title) = LOWER($2) THEN 0
              WHEN LOWER(e.name) = LOWER($1) THEN 1
              ELSE 2 END
       LIMIT 1`,
      [name, title],
    );
    if (found[0]) {
      employeeId = found[0].id;
      department = found[0].department_name;
    }
  }

  const inserted = await sql<{ id: number }>(
    `INSERT INTO wishes (employee_id, employee_name, employee_title, department_name, wish_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [employeeId, name, title, department, wish],
  );

  return NextResponse.json({ ok: true, id: inserted[0]?.id });
}
