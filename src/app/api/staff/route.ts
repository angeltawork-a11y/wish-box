import { NextResponse } from "next/server";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import type { Employee, StaffTree } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  await ensureSeeded();
  const departments = await sql<{ id: number; name: string }>(
    "SELECT id, name FROM departments ORDER BY name ASC",
  );
  const employees = await sql<Employee>(
    `SELECT e.id, e.department_id, e.name, e.title, d.name AS department_name
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     ORDER BY d.name ASC, e.name ASC`,
  );

  const tree: StaffTree[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    employees: employees
      .filter((e) => e.department_id === d.id)
      .map((e) => ({ id: e.id, name: e.name, title: e.title })),
  }));

  return NextResponse.json({ departments: tree, employees });
}
