"use client";

import { useState } from "react";
import { GiftBoxArt } from "@/components/GiftBoxArt";

type Props = {
  label?: string;
  onOpen?: () => void;
  size?: "hero" | "compact";
  interactive?: boolean;
};

const OPEN_MS = 900;

export function GiftBox3D({
  label = "Написать желание",
  onOpen,
  size = "hero",
  interactive = true,
}: Props) {
  const [opening, setOpening] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleActivate() {
    if (!interactive || opening) return;
    setOpening(true);
    setHovered(false);
    window.setTimeout(() => {
      onOpen?.();
    }, OPEN_MS);
  }

  const dim = size === "hero" ? "gift-box--hero" : "gift-box--compact";
  const state = [
    hovered && !opening ? "is-hovered" : "",
    opening ? "is-opening" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`gift-box ${dim} ${state}`}>
      <div
        className="gift-box__stage"
        onPointerEnter={() => !opening && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <GiftBoxArt open={opening} />
      </div>

      {interactive ? (
        <button
          type="button"
          className="gift-box__hit"
          onClick={handleActivate}
          disabled={opening}
          aria-label={label}
        >
          <span className="sr-only">{label}</span>
        </button>
      ) : null}

      <span className={`gift-box__cta ${interactive ? "" : "gift-box__cta--static"}`.trim()}>
        {label}
      </span>
    </div>
  );
}
