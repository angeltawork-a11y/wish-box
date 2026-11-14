"use client";

import { useRef, useState, type PointerEvent } from "react";

type Props = {
  label?: string;
  onOpen?: () => void;
  size?: "hero" | "compact";
  interactive?: boolean;
};

const OPEN_MS = 850;

export function GiftBox3D({
  label = "Написать желание",
  onOpen,
  size = "hero",
  interactive = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: -22, y: 28 });
  const [hovered, setHovered] = useState(false);
  const [opening, setOpening] = useState(false);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!interactive || opening || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -22 - py * 10,
      y: 28 + px * 16,
    });
  }

  function onPointerLeave() {
    setHovered(false);
    if (!opening) setTilt({ x: -22, y: 28 });
  }

  function handleActivate() {
    if (!interactive || opening) return;
    setOpening(true);
    setHovered(false);
    window.setTimeout(() => {
      onOpen?.();
    }, OPEN_MS);
  }

  const dim = size === "hero" ? "gift3d--hero" : "gift3d--compact";
  const stateClass = [
    hovered && !opening ? "is-hovered" : "",
    opening ? "is-opening" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rootRef}
      className={`gift3d ${dim} ${stateClass}`}
      style={{
        ["--tilt-x" as string]: `${tilt.x}deg`,
        ["--tilt-y" as string]: `${tilt.y}deg`,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => !opening && setHovered(true)}
      onPointerLeave={onPointerLeave}
    >
      <div className="gift3d__stage">
        <div className="gift3d__glow" aria-hidden="true" />
        <div className="gift3d__sparkles" aria-hidden="true">
          <span className="gift3d__spark gift3d__spark--1" />
          <span className="gift3d__spark gift3d__spark--2" />
          <span className="gift3d__spark gift3d__spark--3" />
          <span className="gift3d__spark gift3d__spark--4" />
          <span className="gift3d__spark gift3d__spark--5" />
          <span className="gift3d__spark gift3d__spark--6" />
        </div>

        <div className="gift3d__scene" aria-hidden="true">
          <div className="gift3d__lid">
            <div className="gift3d__face gift3d__lid-top">
              <span className="gift3d__ribbon gift3d__ribbon--lid-v" />
              <span className="gift3d__ribbon gift3d__ribbon--lid-h" />
            </div>
            <div className="gift3d__face gift3d__lid-front" />
            <div className="gift3d__face gift3d__lid-back" />
            <div className="gift3d__face gift3d__lid-left" />
            <div className="gift3d__face gift3d__lid-right" />
            <div className="gift3d__bow">
              <span className="gift3d__bow-loop gift3d__bow-loop--l" />
              <span className="gift3d__bow-loop gift3d__bow-loop--r" />
              <span className="gift3d__bow-loop gift3d__bow-loop--li" />
              <span className="gift3d__bow-loop gift3d__bow-loop--ri" />
              <span className="gift3d__bow-knot" />
              <span className="gift3d__bow-tail gift3d__bow-tail--l" />
              <span className="gift3d__bow-tail gift3d__bow-tail--r" />
            </div>
          </div>

          <div className="gift3d__body">
            <div className="gift3d__face gift3d__front">
              <span className="gift3d__ribbon gift3d__ribbon--face-v" />
            </div>
            <div className="gift3d__face gift3d__back" />
            <div className="gift3d__face gift3d__left">
              <span className="gift3d__ribbon gift3d__ribbon--face-v" />
            </div>
            <div className="gift3d__face gift3d__right">
              <span className="gift3d__ribbon gift3d__ribbon--face-v" />
            </div>
            <div className="gift3d__face gift3d__top" />
            <div className="gift3d__face gift3d__bottom" />
            <div className="gift3d__inner" />
          </div>
        </div>

        <div className="gift3d__shadow" aria-hidden="true" />
      </div>

      {interactive ? (
        <button
          type="button"
          className="gift3d__hit"
          onClick={handleActivate}
          disabled={opening}
          aria-label={label}
        >
          <span className="sr-only">{label}</span>
        </button>
      ) : null}

      <span className={`gift3d__cta ${interactive ? "" : "gift3d__cta--static"}`.trim()}>
        {label}
      </span>
    </div>
  );
}
