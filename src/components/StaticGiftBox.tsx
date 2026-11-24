"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV_DELAY_MS = 400;

type Props = {
  label?: string;
  href?: string;
  size?: "hero" | "compact";
  widthPx?: number;
};

export function StaticGiftBox({
  label = "Написать желание",
  href = "/employee",
  size = "hero",
  widthPx,
}: Props) {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  const isHero = size === "hero";
  const stageClass = isHero
    ? "static-gift-box__stage static-gift-box__stage--hero"
    : "static-gift-box__stage static-gift-box__stage--compact";

  const stageStyle =
    widthPx != null ? { width: `${widthPx}px`, maxWidth: "100%" } : undefined;

  function handleClick() {
    if (!isHero || fading) return;
    setFading(true);
    window.setTimeout(() => {
      router.push(href);
    }, NAV_DELAY_MS);
  }

  const content = (
    <>
      <Image
        src="/hero-box-ribbon.png"
        alt=""
        width={848}
        height={894}
        className="static-gift-box__img"
        priority={isHero}
        sizes={isHero ? "40vw" : "140px"}
      />
      {isHero ? <span className="static-gift-box__cta">{label}</span> : null}
    </>
  );

  if (isHero) {
    return (
      <div
        className={`static-gift-box static-gift-box--hero${fading ? " static-gift-box--fade" : ""}`}
      >
        <button
          type="button"
          className={stageClass}
          style={stageStyle}
          onClick={handleClick}
          disabled={fading}
          aria-label={label}
        >
          {content}
        </button>
      </div>
    );
  }

  return (
    <div className="static-gift-box static-gift-box--compact">
      <span className={stageClass} style={stageStyle} aria-hidden="true">
        {content}
      </span>
    </div>
  );
}