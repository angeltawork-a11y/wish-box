import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "./db";

type SeedEmployee = { name: string; title: string };
type SeedDepartment = { name: string; employees: SeedEmployee[] };
type SeedFile = { departments: SeedDepartment[] };

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

  const seedPath = path.join(process.cwd(), "data", "staff-seed.json");
  const raw = await readFile(seedPath, "utf8");
  const data = JSON.parse(raw) as SeedFile;

  for (const dept of data.departments) {
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
