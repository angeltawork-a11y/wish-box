import Link from "next/link";
import { EmployeeForm } from "@/components/EmployeeForm";

export default function EmployeePage() {
  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <div className="amounts-atmosphere relative overflow-hidden border-b border-[var(--line)]">
        <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-5 py-5 sm:px-10">
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

        <div className="relative z-10 mx-auto max-w-3xl px-5 pb-10 pt-4 sm:px-10">
          <p className="brand text-xs uppercase tracking-[0.18em] text-[var(--orange-deep)]">
            Волшебный ящик желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl">Кто вы?</h1>
          <p className="mt-3 max-w-md text-[var(--ink)]/70">
            Сохраните имя и должность — отдел подставится из справочника. Потом
            можно заполнить Wish List.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-10">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
          <EmployeeForm />
        </div>
      </section>
    </main>
  );
}
