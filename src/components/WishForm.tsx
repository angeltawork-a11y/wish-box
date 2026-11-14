"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  department_id: number;
  name: string;
  title: string;
  department_name?: string;
};

type Props = {
  onSuccess: () => void;
};

export function WishForm({ onSuccess }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [wish, setWish] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data: { employees?: Employee[] }) => {
        if (!cancelled) setEmployees(data.employees ?? []);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 1) return [];
    return employees
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [employees, name]);

  function pickEmployee(e: Employee) {
    setName(e.name);
    setTitle(e.title);
    setDepartment(e.department_name ?? "");
    setEmployeeId(e.id);
  }

  function onNameChange(value: string) {
    setName(value);
    setEmployeeId(null);
    const exact = employees.find(
      (e) => e.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (exact) {
      setTitle(exact.title);
      setDepartment(exact.department_name ?? "");
      setEmployeeId(exact.id);
      return;
    }
    const byTitle = employees.find(
      (e) =>
        e.title.toLowerCase() === title.trim().toLowerCase() &&
        title.trim() !== "",
    );
    if (byTitle && value.trim()) {
      setDepartment(byTitle.department_name ?? "");
    } else {
      setDepartment("");
    }
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (employeeId != null) return;
    const match = employees.find(
      (e) =>
        e.name.toLowerCase() === name.trim().toLowerCase() ||
        (value.trim() !== "" &&
          e.title.toLowerCase() === value.trim().toLowerCase() &&
          e.name.toLowerCase().includes(name.trim().toLowerCase())),
    );
    if (match) {
      setDepartment(match.department_name ?? "");
      if (match.name.toLowerCase() === name.trim().toLowerCase()) {
        setEmployeeId(match.id);
      }
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          department,
          wish,
          employeeId,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Не удалось отправить");
        return;
      }
      onSuccess();
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="relative">
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Имя
        </label>
        <input
          className="field"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Как вас зовут"
          autoComplete="name"
          required
        />
        {suggestions.length > 0 && employeeId == null && (
          <ul className="absolute z-20 mt-1 w-full border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-[var(--orange-mist)]"
                  onClick={() => pickEmployee(s)}
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-sm opacity-70">
                    {s.title}
                    {s.department_name ? ` · ${s.department_name}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Должность
        </label>
        <input
          className="field"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ваша должность"
          autoComplete="organization-title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Отдел
        </label>
        <input
          className="field bg-[var(--surface)]"
          value={department || "Определится по справочнику"}
          readOnly
          aria-live="polite"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          И желания на будущее
        </label>
        <textarea
          className="field min-h-[140px] resize-y"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Чего хотите для себя, команды или компании…"
          required
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-[var(--orange-deep)]" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? "Отправляем…" : "Положить в ящик"}
      </button>
    </form>
  );
}
