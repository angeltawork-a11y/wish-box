"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmountBox } from "@/components/AmountBox";
import { PageFrame } from "@/components/PageFrame";
import { WISH_AMOUNTS } from "@/lib/amounts";
import { readVisitor, type Visitor } from "@/lib/visitor";

export default function AmountsPage() {
  const router = useRouter();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = readVisitor();
    if (!saved) {
      router.replace("/employee");
      return;
    }
    setVisitor(saved);
    setReady(true);
  }, [router]);

  if (!ready || !visitor) {
    return (
      <main className="min-h-[100svh]">
        <PageFrame tone="light">
          <div className="mx-auto max-w-lg px-5 py-16">
            <p className="text-[var(--ink)]/60">Загрузка…</p>
          </div>
        </PageFrame>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh]">
      <PageFrame tone="light">
        <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[var(--line)]/80 bg-white/75 px-5 py-5 backdrop-blur-sm sm:px-10">
          <Link
            href="/employee?edit=1"
            className="text-sm text-[var(--ink)]/60 transition hover:text-[var(--orange-deep)]"
          >
            ← Имя и ник
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
            Волшебная коробка желаний
          </p>
          <h1 className="display mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Выберите сумму
          </h1>
          <p className="mt-3 max-w-lg text-[var(--ink)]/80">
            {visitor.name} · @{visitor.telegram}. Чем больше сумма — тем больше коробка.
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
