"use client";

import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { StaticGiftBox } from "@/components/StaticGiftBox";

export default function HomePage() {
  return (
    <main>
      <PageFrame tone="dark" className="min-h-[100svh] text-white">
        <header className="flex items-center justify-end px-5 py-5 sm:px-10">
          <Link
            href="/admin"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Админ
          </Link>
        </header>

        <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-5xl flex-col items-center justify-center gap-8 px-5 pb-16 pt-2 text-center sm:px-10">
          <div className="animate-rise space-y-4">
            <h1 className="display text-[clamp(2rem,7vw,4.25rem)] leading-[1.05] text-white drop-shadow-sm">
              Волшебный ящик желаний
            </h1>
            <p className="mx-auto max-w-md text-base text-white/88 sm:text-lg drop-shadow-sm">
              Откройте ящик, сохраните данные и заполните Wish List.
            </p>
          </div>

          <div className="w-full max-w-[480px]">
            <StaticGiftBox label="Написать желание" />
          </div>
        </div>
      </PageFrame>
    </main>
  );
}