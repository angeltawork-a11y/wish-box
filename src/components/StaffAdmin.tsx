"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Employee = { id: number; name: string; title: string; email: string };
type Department = { id: number; name: string; employees: Employee[] };

export function StaffAdmin() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDept, setNewDept] = useState("");
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState<
    Record<number, { name: string; title: string; email: string }>
  >({});

  const loadStaff = useCallback(async () => {
    const res = await fetch("/api/staff");
    const data = (await res.json()) as { departments: Department[] };
    setDepartments(data.departments ?? []);
  }, []);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then(async (data: { authenticated: boolean }) => {
        setAuthenticated(data.authenticated);
        setChecking(false);
        if (data.authenticated) await loadStaff();
      })
      .catch(() => setChecking(false));
  }, [loadStaff]);

  async function addDepartment(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDept }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error || "Не удалось добавить отдел");
      return;
    }
    setNewDept("");
    await loadStaff();
  }

  async function renameDepartment(id: number, name: string) {
    setError("");
    const res = await fetch("/api/admin/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Не удалось переименовать");
      return;
    }
    await loadStaff();
  }

  async function deleteDepartment(id: number) {
    if (!confirm("Удалить отдел и всех его сотрудников?")) return;
    await fetch(`/api/admin/departments?id=${id}`, { method: "DELETE" });
    await loadStaff();
  }

  async function addEmployee(departmentId: number) {
    const draft = drafts[departmentId] ?? { name: "", title: "", email: "" };
    if (!draft.name.trim()) return;
    setError("");
    const res = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        departmentId,
        name: draft.name,
        title: draft.title,
        email: draft.email,
      }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Не удалось добавить");
      return;
    }
    setDrafts((prev) => ({
      ...prev,
      [departmentId]: { name: "", title: "", email: "" },
    }));
    await loadStaff();
  }

  async function saveEmployee(
    id: number,
    departmentId: number,
    name: string,
    title: string,
    email: string,
  ) {
    setError("");
    const res = await fetch("/api/admin/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, departmentId, name, title, email }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Не удалось сохранить");
      return;
    }
    await loadStaff();
  }

  async function deleteEmployee(id: number) {
    if (!confirm("Удалить сотрудника из справочника?")) return;
    await fetch(`/api/admin/employees?id=${id}`, { method: "DELETE" });
    await loadStaff();
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p>Проверяем сессию…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="display text-3xl">Нужен вход</h1>
        <p className="mt-3 text-[var(--ink)]/70">
          Справочник сотрудников доступен после входа администратора.
        </p>
        <Link href="/admin" className="btn-primary mt-6 inline-flex">
          Перейти ко входу
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="brand text-xs uppercase tracking-[0.16em] text-[var(--orange-deep)]">
              Волшебный ящик желаний
            </p>
            <h1 className="display mt-1 text-2xl sm:text-3xl">
              Справочник сотрудников
            </h1>
          </div>
          <Link href="/admin" className="btn-ghost">
            К желаниям
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-5 py-10 sm:px-10">
        {error ? (
          <p className="text-sm text-[var(--orange-deep)]" role="alert">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={addDepartment}
          className="flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row"
        >
          <input
            className="field"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="Новый отдел"
            required
          />
          <button type="submit" className="btn-primary shrink-0">
            Добавить отдел
          </button>
        </form>

        {departments.map((dept) => (
          <section key={dept.id} className="border border-[var(--line)]">
            <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center">
              <input
                className="field"
                defaultValue={dept.name}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next && next !== dept.name) {
                    void renameDepartment(dept.id, next);
                  }
                }}
                aria-label={`Название отдела ${dept.name}`}
              />
              <button
                type="button"
                className="btn-danger shrink-0"
                onClick={() => void deleteDepartment(dept.id)}
              >
                Удалить отдел
              </button>
            </div>

            <ul className="divide-y divide-[var(--line)]">
              {dept.employees.map((emp) => (
                <li
                  key={emp.id}
                  className="grid gap-3 p-4 md:grid-cols-[1fr_0.8fr_1.2fr_auto]"
                >
                  <input
                    className="field"
                    defaultValue={emp.name}
                    id={`name-${emp.id}`}
                    aria-label="Имя"
                  />
                  <input
                    className="field"
                    defaultValue={emp.title}
                    id={`title-${emp.id}`}
                    aria-label="Должность"
                  />
                  <input
                    className="field"
                    defaultValue={emp.email}
                    id={`email-${emp.id}`}
                    aria-label="Почта"
                    type="email"
                    placeholder="name@company.ru"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => {
                        const nameEl = document.getElementById(
                          `name-${emp.id}`,
                        ) as HTMLInputElement | null;
                        const titleEl = document.getElementById(
                          `title-${emp.id}`,
                        ) as HTMLInputElement | null;
                        const emailEl = document.getElementById(
                          `email-${emp.id}`,
                        ) as HTMLInputElement | null;
                        void saveEmployee(
                          emp.id,
                          dept.id,
                          nameEl?.value ?? emp.name,
                          titleEl?.value ?? emp.title,
                          emailEl?.value ?? emp.email,
                        );
                      }}
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => void deleteEmployee(emp.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid gap-3 border-t border-[var(--line)] p-4 md:grid-cols-[1fr_0.8fr_1.2fr_auto]">
              <input
                className="field"
                placeholder="Имя сотрудника"
                value={drafts[dept.id]?.name ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [dept.id]: {
                      name: e.target.value,
                      title: prev[dept.id]?.title ?? "",
                      email: prev[dept.id]?.email ?? "",
                    },
                  }))
                }
              />
              <input
                className="field"
                placeholder="Должность"
                value={drafts[dept.id]?.title ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [dept.id]: {
                      name: prev[dept.id]?.name ?? "",
                      title: e.target.value,
                      email: prev[dept.id]?.email ?? "",
                    },
                  }))
                }
              />
              <input
                className="field"
                type="email"
                placeholder="Почта"
                value={drafts[dept.id]?.email ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [dept.id]: {
                      name: prev[dept.id]?.name ?? "",
                      title: prev[dept.id]?.title ?? "",
                      email: e.target.value,
                    },
                  }))
                }
              />
              <button
                type="button"
                className="btn-primary"
                onClick={() => void addEmployee(dept.id)}
              >
                Добавить
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
