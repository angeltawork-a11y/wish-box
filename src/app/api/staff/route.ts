import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import type { Employee, StaffTree } from "@/lib/types";

export const runtime = "nodejs";

/** Full staff directory — admin only. */
export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  await ensureSeeded();
  const departments = await sql<{ id: number; name: string }>(
    "SELECT id, name FROM departments ORDER BY name ASC",
  );
  const employees = await sql<Employee>(
    `SELECT e.id, e.department_id, e.name, e.title, COALESCE(e.email, '') AS email, d.name AS department_name
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     ORDER BY d.name ASC, e.name ASC`,
  );

  const tree: StaffTree[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    employees: employees
      .filter((e) => e.department_id === d.id)
      .map((e) => ({
        id: e.id,
        name: e.name,
        title: e.title,
        email: e.email,
      })),
  }));

  return NextResponse.json({ departments: tree, employees });
}
