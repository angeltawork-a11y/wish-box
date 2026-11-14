"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { WishForm } from "@/components/WishForm";
import { isWishAmount } from "@/lib/amounts";

function WishPageInner() {
  const params = useSearchParams();
  const raw = Number(params.get("amount"));
  const [done, setDone] = useState(false);

  if (!isWishAmount(raw)) {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="display text-3xl">Сумма не выбрана</h1>
        <p className="mt-3 text-[var(--ink)]/70">
          Сначала выберите коробку с суммой.
        </p>
        <Link href="/amounts" className="btn-primary mt-8 inline-flex">
          К выбору суммы
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)] px-5 py-5 sm:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link
            href="/amounts"
            className="text-sm text-[var(--ink)]/60 hover:text-[var(--orange-deep)]"
          >
            ← Другая сумма
          </Link>
          <p className="brand text-xs uppercase tracking-[0.16em] text-[var(--orange-deep)]">
            Волшебный ящик желаний
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-10">
        <h1 className="display text-3xl sm:text-4xl">Ваше желание</h1>
        <p className="mt-3 max-w-md text-[var(--ink)]/70">
          Данные сотрудника уже сохранены. Напишите желание — можно приложить
          картинку и ссылку.
        </p>

        <div className="mt-8 border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
          {done ? (
            <div className="animate-rise space-y-4" role="status">
              <p className="display text-2xl text-[var(--orange-deep)]">
                Желание в ящике
              </p>
              <p className="text-[var(--ink)]/75">
                Спасибо. Мы бережно сохранили вашу запись.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setDone(false)}
                >
                  Написать ещё
                </button>
                <Link href="/amounts" className="btn-primary">
                  Другая сумма
                </Link>
              </div>
            </div>
          ) : (
            <WishForm amount={raw} onSuccess={() => setDone(true)} />
          )}
        </div>
      </div>
    </main>
  );
}

export default function WishPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-5 py-16">
          <p>Загрузка…</p>
        </main>
      }
    >
      <WishPageInner />
    </Suspense>
  );
}
