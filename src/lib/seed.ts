import "server-only";

import { normalizeEmail } from "./email";
import { sql } from "./db";
import { getStaffSeed } from "./staff-seed-data";

let seeding: Promise<void> | undefined;

export async function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = runSeed().catch((error: unknown) => {
      seeding = undefined;
      throw error;
    });
  }
  await seeding;
}

async function runSeed(): Promise<void> {
  const rows = await sql<{ count: string | number }>(
    "SELECT COUNT(*)::int AS count FROM departments",
  );
  const count = Number(rows[0]?.count ?? 0);
  if (count === 0) {
    await insertStaff();
  }
  await fillMissingEmails();
}

async function insertStaff(): Promise<void> {
  const staffSeed = getStaffSeed();
  for (const dept of staffSeed.departments) {
    const inserted = await sql<{ id: number }>(
      "INSERT INTO departments (name) VALUES ($1) RETURNING id",
      [dept.name],
    );
    const departmentId = inserted[0]?.id;
    if (!departmentId) continue;
    for (const employee of dept.employees) {
      await sql(
        "INSERT INTO employees (department_id, name, title, email) VALUES ($1, $2, $3, $4)",
        [
          departmentId,
          employee.name,
          employee.title,
          normalizeEmail(employee.email ?? ""),
        ],
      );
    }
  }
}

/** Fill empty emails from the seed without overwriting addresses set in admin. */
async function fillMissingEmails(): Promise<void> {
  const staffSeed = getStaffSeed();
  for (const dept of staffSeed.departments) {
    for (const employee of dept.employees) {
      const email = normalizeEmail(employee.email ?? "");
      if (!email) continue;
      await sql(
        `UPDATE employees e
         SET email = $1
         FROM departments d
         WHERE e.department_id = d.id
           AND d.name = $2
           AND LOWER(e.name) = LOWER($3)
           AND LOWER(e.title) = LOWER($4)
           AND (e.email IS NULL OR e.email = '')`,
        [email, dept.name, employee.name, employee.title],
      );
    }
  }
}
