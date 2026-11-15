"use client";

import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { StaticGiftBox } from "@/components/StaticGiftBox";

export default function HomePage() {
  return (
    <main>
      <PageFrame tone="dark" className="min-h-[100svh] text-white">
        <header className="relative z-10 flex items-center justify-end px-5 py-5 sm:px-10">
          <Link
            href="/admin"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Админ
          </Link>
        </header>

        <div className="hero-home">
          <div className="hero-home__copy animate-rise">
            <h1 className="display text-[clamp(1.65rem,4.5vw,3rem)] leading-[1.08] text-white drop-shadow-md">
              Волшебный ящик желаний
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/90 sm:text-base drop-shadow-sm">
              Нажмите на коробку, войдите по почте и напишите желание.
            </p>
          </div>

          <div className="hero-home__box">
            <StaticGiftBox label="Написать желание" />
          </div>
        </div>
      </PageFrame>
    </main>
  );
}