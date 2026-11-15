"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { EmployeeContext } from "@/lib/employee-types";

export function EmployeeForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [notice, setNotice] = useState("");
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
            setEmail(data.employee.email);
            setSavedEmployee(data.employee);
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

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || "Не удалось отправить код");
        return;
      }
      setCodeSent(true);
      setNotice(data.message || "Проверьте почту.");
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, code }),
      });
      const data = (await res.json()) as {
        error?: string;
        employee?: EmployeeContext;
      };
      if (!res.ok || !data.employee) {
        setError(data.error || "Не удалось войти");
        return;
      }
      setSavedEmployee(data.employee);
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return <p className="text-[var(--ink)]/60">Загрузка…</p>;
  }

  if (savedEmployee) {
    return (
      <div className="animate-rise space-y-4" role="status">
        <p className="text-sm text-[var(--ink)]/80">
          Вы вошли как {savedEmployee.name}
          {savedEmployee.department ? `, ${savedEmployee.department}` : ""}.
          Можно переходить к wish list.
        </p>
        <Link href="/amounts" className="btn-primary inline-flex">
          Заполнить Wish List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={codeSent ? verifyCode : requestCode} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold tracking-wide">
            Имя
          </label>
          <input
            className="field"
            value={name}
            onChange={(e) => {
              setCodeSent(false);
              setSavedEmployee(null);
              setName(e.target.value);
            }}
            placeholder="Как вас зовут"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold tracking-wide">
            Рабочая почта
          </label>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => {
              setCodeSent(false);
              setSavedEmployee(null);
              setEmail(e.target.value);
            }}
            placeholder="name@company.ru"
            autoComplete="email"
            required
          />
        </div>

        {codeSent ? (
          <div>
            <label className="mb-2 block text-sm font-semibold tracking-wide">
              Код из письма
            </label>
            <input
              className="field"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 цифр"
              required
            />
          </div>
        ) : null}

        {notice ? <p className="text-sm text-[var(--ink)]/75">{notice}</p> : null}

        {error ? (
          <p className="text-sm font-medium text-[var(--orange-deep)]" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="btn-primary w-full sm:w-auto"
          disabled={loading}
        >
          {loading
            ? "Секунду…"
            : codeSent
              ? "Войти"
              : "Получить код"}
        </button>
      </form>
    </div>
  );
}