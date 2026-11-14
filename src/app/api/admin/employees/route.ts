import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  await ensureSeeded();

  let body: { departmentId?: number; name?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const departmentId = body.departmentId;
  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  if (!departmentId || name.length < 1) {
    return NextResponse.json(
      { error: "Укажите отдел и имя сотрудника" },
      { status: 400 },
    );
  }

  const rows = await sql<{
    id: number;
    department_id: number;
    name: string;
    title: string;
  }>(
    `INSERT INTO employees (department_id, name, title)
     VALUES ($1, $2, $3)
     RETURNING id, department_id, name, title`,
    [departmentId, name, title],
  );
  return NextResponse.json({ employee: rows[0] });
}

export async function PATCH(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  await ensureSeeded();

  let body: {
    id?: number;
    departmentId?: number;
    name?: string;
    title?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const id = body.id;
  const name = (body.name ?? "").trim();
  const title = (body.title ?? "").trim();
  const departmentId = body.departmentId;
  if (!id || !name || !departmentId) {
    return NextResponse.json(
      { error: "Нужны id, имя и отдел" },
      { status: 400 },
    );
  }

  const rows = await sql<{
    id: number;
    department_id: number;
    name: string;
    title: string;
  }>(
    `UPDATE employees
     SET department_id = $1, name = $2, title = $3
     WHERE id = $4
     RETURNING id, department_id, name, title`,
    [departmentId, name, title, id],
  );
  if (!rows[0]) {
    return NextResponse.json({ error: "Сотрудник не найден" }, { status: 404 });
  }
  return NextResponse.json({ employee: rows[0] });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  await ensureSeeded();

  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Нужен id" }, { status: 400 });
  }

  await sql("DELETE FROM employees WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
