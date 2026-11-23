"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageFrame } from "@/components/PageFrame";
import {
  normalizeName,
  normalizeTelegram,
  readVisitor,
  saveVisitor,
} from "@/lib/visitor";

function VisitorForm() {
  const router = useRouter();
  const editing = useSearchParams().get("edit") === "1";
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readVisitor();
    if (saved && !editing) {
      router.replace("/amounts");
      return;
    }
    if (saved) {
      setName(saved.name);
      setTelegram(`@${saved.telegram}`);
    }
    setReady(true);
  }, [editing, router]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextName = normalizeName(name);
    const nextTelegram = normalizeTelegram(telegram);
    if (!nextName) {
      setError("Укажите имя");
      return;
    }
    if (!nextTelegram) {
      setError("Укажите ник в Telegram, например @name");
      return;
    }
    saveVisitor({ name: nextName, telegram: nextTelegram });
    router.push("/amounts");
  }

  if (!ready) {
    return <p className="text-[var(--ink)]/60">Загрузка…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide" htmlFor="visitor-name">
          Имя
        </label>
        <input
          id="visitor-name"
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как вас зовут"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide" htmlFor="visitor-tg">
          Ник в Telegram
        </label>
        <input
          id="visitor-tg"
          className="field"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@username"
          autoComplete="off"
          required
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-[var(--orange-deep)]" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary">
        К коробкам
      </button>
    </form>
  );
}

export default function EmployeePage() {
  return (
    <main className="min-h-[100svh]">
      <PageFrame tone="light">
        <header className="mx-auto flex max-w-3xl items-center justify-between border-b border-[var(--line)]/80 bg-white/75 px-5 py-5 backdrop-blur-sm sm:px-10">
          <Link
            href="/"
            className="text-sm text-[var(--ink)]/60 transition hover:text-[var(--orange-deep)]"
          >
            ← На главную
          </Link>
          <Link
            href="/admin/answers"
            className="text-sm text-[var(--ink)]/60 transition hover:text-[var(--orange-deep)]"
          >
            Админ
          </Link>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-10">
          <p className="brand text-xs uppercase tracking-[0.18em] text-[var(--orange-deep)]">
            Волшебная коробка желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">Имя и ник</h1>
          <p className="mt-3 max-w-md text-[var(--ink)]/80">
            Укажите один раз. Дальше выберите коробку и заполните список желаний.
          </p>
          <div className="mt-10 border border-[var(--line)] bg-white/92 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <Suspense fallback={<p className="text-[var(--ink)]/60">Загрузка…</p>}>
              <VisitorForm />
            </Suspense>
          </div>
        </div>
      </PageFrame>
    </main>
  );
}
