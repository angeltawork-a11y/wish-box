import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";
import type { Wish } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  await ensureSeeded();

  const wishes = await sql<Wish>(
    `SELECT id, employee_id, employee_name, employee_title, department_name,
            wish_text, created_at::text AS created_at
     FROM wishes
     ORDER BY department_name ASC, employee_name ASC, created_at DESC`,
  );

  type Group = {
    key: string;
    employeeName: string;
    employeeTitle: string;
    departmentName: string;
    wishes: Array<{ id: number; text: string; createdAt: string }>;
  };

  const groups = new Map<string, Group>();
  for (const w of wishes) {
    const key = `${w.department_name}::${w.employee_name}::${w.employee_title}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        employeeName: w.employee_name,
        employeeTitle: w.employee_title,
        departmentName: w.department_name || "Без отдела",
        wishes: [],
      };
      groups.set(key, group);
    }
    group.wishes.push({
      id: w.id,
      text: w.wish_text,
      createdAt: w.created_at,
    });
  }

  return NextResponse.json({ groups: Array.from(groups.values()) });
}
