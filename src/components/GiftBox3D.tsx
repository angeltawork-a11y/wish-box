"use client";

import { useRef, useState, type PointerEvent } from "react";

type Props = {
  label?: string;
  onOpen?: () => void;
  size?: "hero" | "compact";
  interactive?: boolean;
};

export function GiftBox3D({
  label = "Написать желание",
  onOpen,
  size = "hero",
  interactive = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: -18, y: 32 });
  const [hovered, setHovered] = useState(false);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!interactive || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -18 - py * 14,
      y: 32 + px * 20,
    });
  }

  function onPointerLeave() {
    setHovered(false);
    setTilt({ x: -18, y: 32 });
  }

  const dim = size === "hero" ? "gift3d--hero" : "gift3d--compact";

  return (
    <div
      ref={rootRef}
      className={`gift3d ${dim} ${hovered ? "is-hovered" : ""}`}
      style={{
        ["--tilt-x" as string]: `${tilt.x}deg`,
        ["--tilt-y" as string]: `${tilt.y}deg`,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={onPointerLeave}
    >
      <div className="gift3d__stage" aria-hidden={!interactive}>
        <div className="gift3d__glow" />
        <div className="gift3d__scene">
          <div className="gift3d__lid">
            <div className="gift3d__face gift3d__lid-top" />
            <div className="gift3d__face gift3d__lid-front" />
            <div className="gift3d__face gift3d__lid-back" />
            <div className="gift3d__face gift3d__lid-left" />
            <div className="gift3d__face gift3d__lid-right" />
            <div className="gift3d__bow">
              <span className="gift3d__bow-loop gift3d__bow-loop--l" />
              <span className="gift3d__bow-loop gift3d__bow-loop--r" />
              <span className="gift3d__bow-knot" />
            </div>
          </div>

          <div className="gift3d__body">
            <div className="gift3d__face gift3d__front">
              {interactive ? (
                <button
                  type="button"
                  className="gift3d__cta"
                  onClick={onOpen}
                  aria-label={label}
                >
                  <span>{label}</span>
                </button>
              ) : (
                <span className="gift3d__cta gift3d__cta--static">
                  <span>{label}</span>
                </span>
              )}
            </div>
            <div className="gift3d__face gift3d__back" />
            <div className="gift3d__face gift3d__left" />
            <div className="gift3d__face gift3d__right" />
            <div className="gift3d__face gift3d__top" />
            <div className="gift3d__face gift3d__bottom" />
            <div className="gift3d__ribbon gift3d__ribbon--v" aria-hidden="true" />
            <div className="gift3d__ribbon gift3d__ribbon--h" aria-hidden="true" />
          </div>
        </div>
        <div className="gift3d__shadow" />
      </div>
    </div>
  );
}
