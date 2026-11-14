"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { EmployeeContext } from "@/lib/employee-types";

export function EmployeeForm() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedEmployee, setSavedEmployee] = useState<EmployeeContext | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/employee")
      .then((r) => r.json())
      .then(
        (data: { saved?: boolean; employee?: EmployeeContext | null }) => {
          if (cancelled) return;
          if (data.saved && data.employee) {
            setName(data.employee.name);
            setTitle(data.employee.title);
            setDepartment(data.employee.department);
            setEmployeeId(data.employee.employeeId);
            setSavedEmployee(data.employee);
            setSaved(true);
          }
        },
      )
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (saved) return;
    const qName = name.trim();
    const qTitle = title.trim();
    if (qName.length < 2) {
      setDepartment("");
      setEmployeeId(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      fetch("/api/staff/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: qName, title: qTitle }),
      })
        .then((r) => r.json())
        .then(
          (data: {
            found?: boolean;
            employeeId?: number | null;
            department?: string;
          }) => {
            if (cancelled) return;
            if (data.found) {
              setDepartment(data.department ?? "");
              setEmployeeId(
                typeof data.employeeId === "number" ? data.employeeId : null,
              );
            } else {
              setDepartment("");
              setEmployeeId(null);
            }
          },
        )
        .catch(() => {
          if (!cancelled) {
            setDepartment("");
            setEmployeeId(null);
          }
        });
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, title, saved]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title }),
      });
      const data = (await res.json()) as {
        error?: string;
        employee?: EmployeeContext;
      };
      if (!res.ok || !data.employee) {
        setError(data.error || "Не удалось сохранить");
        return;
      }
      setSavedEmployee(data.employee);
      setDepartment(data.employee.department);
      setEmployeeId(data.employee.employeeId);
      setSaved(true);
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return <p className="text-[var(--ink)]/60">Загрузка…</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold tracking-wide">
            Имя
          </label>
          <input
            className="field"
            value={name}
            onChange={(e) => {
              setSaved(false);
              setName(e.target.value);
            }}
            placeholder="Как вас зовут"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold tracking-wide">
            Должность
          </label>
          <input
            className="field"
            value={title}
            onChange={(e) => {
              setSaved(false);
              setTitle(e.target.value);
            }}
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

        {error ? (
          <p
            className="text-sm font-medium text-[var(--orange-deep)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>

      {saved && savedEmployee ? (
        <div
          className="animate-rise space-y-4 border border-[var(--line)] bg-[var(--orange-mist)] p-5"
          role="status"
        >
          <p className="text-sm text-[var(--ink)]/80">
            Данные сохранены
            {savedEmployee.department
              ? `: ${savedEmployee.name}, ${savedEmployee.department}`
              : `: ${savedEmployee.name}`}
            . Можно переходить к wish list.
          </p>
          <Link href="/amounts" className="btn-primary inline-flex">
            Заполнить Wish List
          </Link>
          {employeeId == null ? (
            <p className="text-xs text-[var(--ink)]/55">
              Имя не найдено в справочнике — отдел можно уточнить позже, желание
              всё равно примут.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
