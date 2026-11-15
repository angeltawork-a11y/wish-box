import Link from "next/link";
import { EmployeeForm } from "@/components/EmployeeForm";
import { PageFrame } from "@/components/PageFrame";

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
            href="/admin"
            className="text-sm text-[var(--ink)]/60 transition hover:text-[var(--orange-deep)]"
          >
            Админ
          </Link>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-10 pt-8 sm:px-10">
          <p className="brand text-xs uppercase tracking-[0.18em] text-[var(--orange-deep)]">
            Волшебный ящик желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">Вход по почте</h1>
          <p className="mt-3 max-w-md text-[var(--ink)]/80">
            Укажите рабочую почту из справочника. Код придёт на письмо, после
            него можно заполнить Wish List.
          </p>

          <div className="mt-10 border border-[var(--line)] bg-white/92 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <EmployeeForm />
          </div>
        </div>
      </PageFrame>
    </main>
  );
}