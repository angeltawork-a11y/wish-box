"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type WishGroup = {
  key: string;
  employeeName: string;
  employeeTitle: string;
  departmentName: string;
  wishes: Array<{ id: number; text: string; createdAt: string }>;
};

export function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [sampleHint, setSampleHint] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [groups, setGroups] = useState<WishGroup[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    const data = (await res.json()) as {
      authenticated: boolean;
      isSample: boolean;
      samplePasswordHint: string | null;
    };
    setAuthenticated(data.authenticated);
    setIsSample(data.isSample);
    setSampleHint(data.samplePasswordHint);
    setChecking(false);
    return data.authenticated;
  }, []);

  const loadWishes = useCallback(async () => {
    setLoadingWishes(true);
    try {
      const res = await fetch("/api/admin/wishes");
      if (!res.ok) {
        setAuthenticated(false);
        return;
      }
      const data = (await res.json()) as { groups: WishGroup[] };
      setGroups(data.groups ?? []);
    } finally {
      setLoadingWishes(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().then((ok) => {
      if (ok) void loadWishes();
    });
  }, [refreshSession, loadWishes]);

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as { error?: string; isSample?: boolean };
    if (!res.ok) {
      setError(data.error || "Ошибка входа");
      return;
    }
    setPassword("");
    setAuthenticated(true);
    setIsSample(Boolean(data.isSample));
    await loadWishes();
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setGroups([]);
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
      <main className="min-h-[100svh] bg-[var(--surface)]">
        <div className="mx-auto max-w-md px-5 py-16">
          <Link href="/" className="text-sm text-[var(--ink)]/60 hover:text-[var(--orange-deep)]">
            ← На главную
          </Link>
          <h1 className="display mt-6 text-3xl">Вход администратора</h1>
          <p className="mt-3 text-[var(--ink)]/70">
            Список желаний доступен только с паролем руководителя.
          </p>
          {isSample && sampleHint ? (
            <p className="mt-4 border border-dashed border-[var(--orange)] bg-white px-4 py-3 text-sm">
              Локально / без секрета используется{" "}
              <strong>образец данных</strong>: пароль{" "}
              <code className="font-semibold text-[var(--orange-deep)]">
                {sampleHint}
              </code>
              . В публикации задайте{" "}
              <code>ADMIN_PASSWORD</code> в Secrets.
            </p>
          ) : null}
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Пароль</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-[var(--orange-deep)]" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn-primary w-full">
              Войти
            </button>
          </form>
        </div>
      </main>
    );
  }

  const byDept = groups.reduce<Record<string, WishGroup[]>>((acc, g) => {
    (acc[g.departmentName] ??= []).push(g);
    return acc;
  }, {});

  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="brand text-xs uppercase tracking-[0.16em] text-[var(--orange-deep)]">
              Волшебный ящик желаний
            </p>
            <h1 className="display mt-1 text-2xl sm:text-3xl">Желания команды</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/staff" className="btn-ghost">
              Справочник
            </Link>
            <button type="button" className="btn-ghost" onClick={() => void onLogout()}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
        {isSample ? (
          <p className="mb-6 text-sm text-[var(--ink)]/60">
            Сейчас активен образец пароля для локальной разработки. В production
            задайте ADMIN_PASSWORD через Secrets.
          </p>
        ) : null}

        {loadingWishes ? <p>Загружаем…</p> : null}

        {!loadingWishes && groups.length === 0 ? (
          <p className="border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--ink)]/70">
            Пока нет желаний. Когда сотрудники отправят форму, они появятся здесь,
            сгруппированные по человеку и отделу.
          </p>
        ) : null}

        <div className="space-y-10">
          {Object.entries(byDept).map(([dept, people]) => (
            <section key={dept}>
              <h2 className="display text-xl text-[var(--orange-deep)]">{dept}</h2>
              <div className="mt-4 space-y-6">
                {people.map((person) => (
                  <article
                    key={person.key}
                    className="border-l-4 border-[var(--orange)] bg-[var(--surface)] px-5 py-4"
                  >
                    <h3 className="text-lg font-bold">{person.employeeName}</h3>
                    {person.employeeTitle ? (
                      <p className="text-sm text-[var(--ink)]/60">
                        {person.employeeTitle}
                      </p>
                    ) : null}
                    <ul className="mt-3 space-y-3">
                      {person.wishes.map((w) => (
                        <li key={w.id} className="border-t border-[var(--line)] pt-3 first:border-0 first:pt-0">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {w.text}
                          </p>
                          <time className="mt-1 block text-xs text-[var(--ink)]/45">
                            {new Date(w.createdAt).toLocaleString("ru-RU")}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
