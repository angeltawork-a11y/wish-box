"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatAmountRub } from "@/lib/amounts";

type Answer = {
  id: number;
  name: string;
  telegram: string;
  text: string;
  amount: number | null;
  link: string;
  hasImage: boolean;
  createdAt: string;
};

export function AdminApp() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    const data = (await res.json()) as {
      authenticated: boolean;
      configured?: boolean;
    };
    setAuthenticated(data.authenticated);
    setConfigured(data.configured !== false);
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
      const data = (await res.json()) as { answers: Answer[] };
      setAnswers(data.answers ?? []);
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
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      if (res.status === 503) {
        setConfigured(false);
      }
      setError(data.error || "Ошибка входа");
      return;
    }
    setPassword("");
    setAuthenticated(true);
    setConfigured(true);
    await loadWishes();
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setAnswers([]);
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
            Ответы видны только с паролем руководителя.
          </p>
          {!configured ? (
            <p className="mt-4 border border-dashed border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)]/70">
              Админ-панель не настроена: задайте переменную окружения{" "}
              <code>ADMIN_PASSWORD</code>.
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

  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="brand text-xs uppercase tracking-[0.16em] text-[var(--orange-deep)]">
              Волшебная коробка желаний
            </p>
            <h1 className="display mt-1 text-2xl sm:text-3xl">Ответы</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/answers" className="btn-ghost">
              Ответы
            </Link>
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
        {loadingWishes ? <p>Загружаем…</p> : null}

        {!loadingWishes && answers.length === 0 ? (
          <p className="border border-[var(--line)] bg-[var(--surface)] p-8 text-[var(--ink)]/70">
            Пока нет ответов. Когда кто-нибудь заполнит форму, запись появится здесь.
          </p>
        ) : null}

        <div className="space-y-4">
          {answers.map((answer) => (
            <article
              key={answer.id}
              className="border-l-4 border-[var(--orange)] bg-[var(--surface)] px-5 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">{answer.name}</h2>
                {answer.telegram ? (
                  <a
                    href={
                      /^[A-Za-z0-9_]{3,32}$/.test(answer.telegram)
                        ? `https://t.me/${answer.telegram}`
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--orange-deep)]"
                  >
                    @{answer.telegram}
                  </a>
                ) : null}
              </div>
              {answer.amount != null ? (
                <p className="mt-2 text-sm font-semibold text-[var(--orange-deep)]">
                  {formatAmountRub(answer.amount)}
                </p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{answer.text}</p>
              {answer.link ? (
                <a
                  href={answer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block break-all text-sm text-[var(--orange-deep)] underline"
                >
                  {answer.link}
                </a>
              ) : null}
              {answer.hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/wishes/${answer.id}/image`}
                  alt="Вложение к желанию"
                  className="mt-3 max-h-48 border border-[var(--line)] object-contain"
                />
              ) : null}
              <time className="mt-2 block text-xs text-[var(--ink)]/45">
                {new Date(answer.createdAt).toLocaleString("ru-RU")}
              </time>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
