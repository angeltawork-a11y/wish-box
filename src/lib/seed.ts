import { sql } from "./db";
import { STAFF_SEED } from "./staff-seed-data";

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
  if (count > 0) return;

  for (const dept of STAFF_SEED.departments) {
    const inserted = await sql<{ id: number }>(
      "INSERT INTO departments (name) VALUES ($1) RETURNING id",
      [dept.name],
    );
    const departmentId = inserted[0]?.id;
    if (!departmentId) continue;
    for (const employee of dept.employees) {
      await sql(
        "INSERT INTO employees (department_id, name, title) VALUES ($1, $2, $3)",
        [departmentId, employee.name, employee.title],
      );
    }
  }
}
