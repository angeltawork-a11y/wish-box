"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { GiftBox3D } from "@/components/GiftBox3D";

export default function HomePage() {
  const router = useRouter();

  return (
    <main>
      <section className="hero-atmosphere relative min-h-[100svh] overflow-x-clip text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--orange)]/30 blur-3xl" />
          <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-[var(--orange-soft)]/25 blur-3xl" />
          <div className="hero-soft-light absolute inset-0" />
        </div>

        <header className="relative z-10 flex items-center justify-end px-5 py-5 sm:px-10">
          <Link
            href="/admin"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Админ
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-5xl flex-col items-center justify-center gap-8 px-5 pb-16 pt-2 text-center sm:px-10">
          <div className="animate-rise space-y-4">
            <h1 className="display text-[clamp(2rem,7vw,4.25rem)] leading-[1.05] text-white">
              Волшебный ящик желаний
            </h1>
            <p className="mx-auto max-w-md text-base text-white/80 sm:text-lg">
              Откройте ящик, выберите сумму и положите мечту внутрь.
            </p>
          </div>

          <div className="w-full max-w-[480px]">
            <GiftBox3D
              label="Написать желание"
              onOpen={() => router.push("/amounts")}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
