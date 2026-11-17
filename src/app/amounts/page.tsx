import Link from "next/link";
import { AmountBox } from "@/components/AmountBox";
import { PageFrame } from "@/components/PageFrame";
import { WISH_AMOUNTS } from "@/lib/amounts";

export default function AmountsPage() {
  return (
    <main className="min-h-[100svh]">
      <PageFrame tone="light">
        <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[var(--line)]/80 bg-white/75 px-5 py-5 backdrop-blur-sm sm:px-10">
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

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
          <p className="brand text-xs uppercase tracking-[0.18em] text-[var(--orange-deep)]">
            Волшебный ящик желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Выберите сумму
          </h1>
          <p className="mt-3 max-w-lg text-[var(--ink)]/80">
            Чем больше сумма — тем больше коробка.
          </p>

          <section className="mt-12">
            <div className="amounts-grid">
              {WISH_AMOUNTS.map((amount) => (
                <AmountBox key={amount} amount={amount} />
              ))}
            </div>
          </section>
        </div>
      </PageFrame>
    </main>
  );
}
