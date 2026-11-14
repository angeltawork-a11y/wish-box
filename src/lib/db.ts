import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

type GlobalDb = {
  pool?: pg.Pool;
  local?: Promise<PGlite>;
};

const g = globalThis as typeof globalThis & { __wishboxDb?: GlobalDb };
g.__wishboxDb ??= {};

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    g.__wishboxDb!.pool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
    });
    return (await g.__wishboxDb!.pool.query(text, params)).rows as T[];
  }
  g.__wishboxDb!.local ??= startLocal().catch((error: unknown) => {
    g.__wishboxDb!.local = undefined;
    throw error;
  });
  return (await (await g.__wishboxDb!.local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
