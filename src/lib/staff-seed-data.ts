import "server-only";

export type SeedEmployee = { name: string; title: string; email?: string };
export type SeedDepartment = { name: string; employees: SeedEmployee[] };

/**
 * Server-only staff seed for empty DB.
 * Prefer STAFF_SEED_JSON (Cursor Secret) with the real roster — never put real PII in shipped source.
 * Local without the secret: fictional demo rows below so lookup/admin still work in PGlite.
 */
const DEMO_STAFF_SEED: { departments: SeedDepartment[] } = {
  departments: [
    {
      name: "Руководство",
      employees: [
        {
          name: "Пример Руководитель",
          title: "CEO",
          email: "primer.ceo@example.com",
        },
      ],
    },
    {
      name: "Админ",
      employees: [
        {
          name: "Пример Администратор",
          title: "админ-рук.",
          email: "primer.admin@example.com",
        },
        {
          name: "Пример Документовед",
          title: "Администратор по документообороту",
          email: "primer.docs@example.com",
        },
      ],
    },
    {
      name: "IT",
      employees: [
        {
          name: "Пример IT",
          title: "IT специалист",
          email: "primer.it@example.com",
        },
      ],
    },
    {
      name: "HR",
      employees: [
        { name: "Пример HR", title: "рекрутер", email: "primer.hr@example.com" },
      ],
    },
    {
      name: "Продажи",
      employees: [
        { name: "Пример РОП", title: "РОП", email: "primer.rop@example.com" },
        { name: "Пример МОП", title: "МОП", email: "primer.mop@example.com" },
      ],
    },
    {
      name: "Маркетинг",
      employees: [
        {
          name: "Пример Маркетолог",
          title: "маркетолог",
          email: "primer.market@example.com",
        },
      ],
    },
    {
      name: "Производство",
      employees: [
        {
          name: "Пример Куратор",
          title: "куратор",
          email: "primer.curator@example.com",
        },
        {
          name: "Пример Наставник",
          title: "наставник",
          email: "primer.mentor@example.com",
        },
      ],
    },
  ],
};

function parseStaffSeedJson(raw: string): { departments: SeedDepartment[] } | null {
  try {
    const data = JSON.parse(raw) as { departments?: SeedDepartment[] };
    if (!data || !Array.isArray(data.departments) || data.departments.length === 0) {
      return null;
    }
    for (const dept of data.departments) {
      if (!dept || typeof dept.name !== "string" || !Array.isArray(dept.employees)) {
        return null;
      }
      for (const emp of dept.employees) {
        if (!emp || typeof emp.name !== "string" || typeof emp.title !== "string") {
          return null;
        }
        if (emp.email != null && typeof emp.email !== "string") {
          return null;
        }
      }
    }
    return { departments: data.departments };
  } catch {
    return null;
  }
}

/** Resolve seed: env secret first, else fictional demo (never a real roster in source). */
export function getStaffSeed(): { departments: SeedDepartment[] } {
  const fromEnv = process.env.STAFF_SEED_JSON?.trim() ?? "";
  if (fromEnv !== "") {
    const parsed = parseStaffSeedJson(fromEnv);
    if (parsed) return parsed;
  }
  return DEMO_STAFF_SEED;
}
