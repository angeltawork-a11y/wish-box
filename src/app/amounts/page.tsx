import Link from "next/link";
import { AmountBox } from "@/components/AmountBox";
import { WISH_AMOUNTS } from "@/lib/amounts";

export default function AmountsPage() {
  return (
    <main className="min-h-[100svh] bg-[var(--white)]">
      <div className="amounts-atmosphere relative overflow-hidden border-b border-[var(--line)]">
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-10">
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

        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-10">
          <p className="brand text-xs uppercase tracking-[0.18em] text-[var(--orange-deep)]">
            Волшебный ящик желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Выберите сумму
          </h1>
          <p className="mt-3 max-w-lg text-[var(--ink)]/70">
            Чем больше сумма — тем больше коробка. Нажмите, чтобы написать желание.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-10">
        <div className="amounts-grid">
          {WISH_AMOUNTS.map((amount) => (
            <AmountBox key={amount} amount={amount} />
          ))}
        </div>
      </section>
    </main>
  );
}
