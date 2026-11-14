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

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (name.length < 1) {
    return NextResponse.json({ error: "Укажите название отдела" }, { status: 400 });
  }

  try {
    const rows = await sql<{ id: number; name: string }>(
      "INSERT INTO departments (name) VALUES ($1) RETURNING id, name",
      [name],
    );
    return NextResponse.json({ department: rows[0] });
  } catch {
    return NextResponse.json(
      { error: "Отдел с таким названием уже есть" },
      { status: 409 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  await ensureSeeded();

  let body: { id?: number; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const id = body.id;
  const name = (body.name ?? "").trim();
  if (!id || !name) {
    return NextResponse.json({ error: "Нужны id и название" }, { status: 400 });
  }

  const rows = await sql<{ id: number; name: string }>(
    "UPDATE departments SET name = $1 WHERE id = $2 RETURNING id, name",
    [name, id],
  );
  if (!rows[0]) {
    return NextResponse.json({ error: "Отдел не найден" }, { status: 404 });
  }
  return NextResponse.json({ department: rows[0] });
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

  await sql("DELETE FROM departments WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
