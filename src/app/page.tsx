"use client";

import { useState } from "react";
import Link from "next/link";
import { MagicBoxVisual } from "@/components/MagicBoxVisual";
import { WishForm } from "@/components/WishForm";

export default function HomePage() {
  const [done, setDone] = useState(false);

  return (
    <main>
      <section className="hero-atmosphere relative min-h-[100svh] overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-[var(--orange)] blur-3xl" />
          <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[var(--orange-soft)] blur-3xl" />
        </div>

        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10">
          <p className="brand text-sm font-semibold uppercase tracking-[0.18em] text-[var(--orange-soft)] sm:text-base">
            Волшебный ящик желаний
          </p>
          <Link
            href="/admin"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Админ
          </Link>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-6xl items-center gap-10 px-5 pb-16 pt-6 sm:px-10 lg:grid-cols-2 lg:gap-16">
          <div className="animate-rise max-w-xl">
            <h1 className="display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Положите желание в ящик
            </h1>
            <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
              Тихий ритуал для команды: мечты, идеи и планы на будущее собираются здесь.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#form" className="btn-primary">
                Написать желание
              </a>
            </div>
          </div>
          <div className="animate-rise" style={{ animationDelay: "0.15s" }}>
            <MagicBoxVisual />
          </div>
        </div>
      </section>

      <section
        id="form"
        className="border-t border-[var(--line)] bg-[var(--white)] px-5 py-16 sm:px-10"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Ваше желание</h2>
            <p className="mt-3 max-w-md text-[var(--ink)]/70">
              Укажите имя и должность — отдел подставится из справочника. Можно писать и желания на будущее.
            </p>
          </div>

          <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
            {done ? (
              <div className="animate-rise space-y-4" role="status">
                <p className="display text-2xl text-[var(--orange-deep)]">
                  Желание в ящике
                </p>
                <p className="text-[var(--ink)]/75">
                  Спасибо. Мы бережно сохранили вашу запись.
                </p>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setDone(false)}
                >
                  Написать ещё
                </button>
              </div>
            ) : (
              <WishForm onSuccess={() => setDone(true)} />
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-8 text-sm text-[var(--ink)]/55 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>Волшебный ящик желаний</span>
          <Link href="/admin" className="hover:text-[var(--orange-deep)]">
            Вход для руководителя
          </Link>
        </div>
      </footer>
    </main>
  );
}
