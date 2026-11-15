"use client";

import { useId } from "react";

/** Volumetric static gift box (SVG) — hero only, no animation. */
type Props = {
  className?: string;
};

export function GiftBoxHeroArt({ className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const p = (name: string) => `${uid}-${name}`;

  return (
    <svg
      viewBox="0 0 480 480"
      className={`gift-hero-art ${className}`.trim()}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={p("body-l")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3a3d" />
          <stop offset="50%" stopColor="#161618" />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={p("body-r")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#48484b" />
          <stop offset="40%" stopColor="#1e1e21" />
          <stop offset="100%" stopColor="#080809" />
        </linearGradient>
        <linearGradient id={p("body-front")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a2c" />
          <stop offset="100%" stopColor="#0c0c0d" />
        </linearGradient>
        <linearGradient id={p("copper")} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#fde8d0" />
          <stop offset="28%" stopColor="#e8b48a" />
          <stop offset="55%" stopColor="#c9825a" />
          <stop offset="82%" stopColor="#a25e3a" />
          <stop offset="100%" stopColor="#6f3818" />
        </linearGradient>
        <linearGradient id={p("copper-side")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dba67c" />
          <stop offset="100%" stopColor="#5c2a14" />
        </linearGradient>
        <linearGradient id={p("ribbon")} x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#7a3a1c" />
          <stop offset="35%" stopColor="#f2d4b4" />
          <stop offset="65%" stopColor="#e0a67a" />
          <stop offset="100%" stopColor="#8e4e2c" />
        </linearGradient>
        <radialGradient id={p("glow")} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#ffb06b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
        </radialGradient>
        <filter id={p("spark")} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="240"
        cy="268"
        rx="168"
        ry="118"
        fill={`url(#${p("glow")})`}
      />
      <ellipse cx="240" cy="398" rx="132" ry="22" fill="rgba(0,0,0,0.5)" />

      <g>
        <path
          d="M88 198 L88 328 L240 398 L240 268 Z"
          fill={`url(#${p("body-l")})`}
          stroke="#2e2e30"
          strokeWidth="1.2"
        />
        <path
          d="M240 268 L240 398 L392 328 L392 198 Z"
          fill={`url(#${p("body-r")})`}
          stroke="#3a3a3c"
          strokeWidth="1.2"
        />
        <path
          d="M88 198 L240 268 L392 198 L240 132 Z"
          fill="#0a0a0b"
          stroke="#252528"
          strokeWidth="1"
        />

        <path
          d="M148 218 L148 352 L164 362 L164 226 Z"
          fill={`url(#${p("ribbon")})`}
        />
        <path
          d="M316 248 L316 372 L332 362 L332 240 Z"
          fill={`url(#${p("ribbon")})`}
          opacity="0.92"
        />
        <path
          d="M228 218 L228 388 L252 388 L252 218 Z"
          fill={`url(#${p("ribbon")})`}
          opacity="0.88"
        />

        <path
          d="M88 198 L240 268 L392 198"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />
        <path
          d="M240 268 L240 398"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
      </g>

      <g>
        <path
          d="M78 188 L240 108 L402 188 L240 268 Z"
          fill={`url(#${p("copper")})`}
          stroke="#f8dcc0"
          strokeWidth="2"
        />
        <path
          d="M78 188 L78 212 L240 292 L240 268 Z"
          fill={`url(#${p("copper-side")})`}
        />
        <path
          d="M402 188 L402 212 L240 292 L240 268 Z"
          fill="#6f3818"
          opacity="0.9"
        />
        <path
          d="M224 128 L256 128 L256 248 L224 248 Z"
          fill={`url(#${p("ribbon")})`}
        />
        <path
          d="M138 178 L342 178 L342 206 L138 206 Z"
          fill={`url(#${p("ribbon")})`}
        />

        <ellipse
          cx="186"
          cy="158"
          rx="42"
          ry="26"
          fill={`url(#${p("copper")})`}
          stroke="#fce5cc"
          strokeWidth="1.6"
          transform="rotate(-16 186 158)"
        />
        <ellipse
          cx="294"
          cy="158"
          rx="42"
          ry="26"
          fill={`url(#${p("copper")})`}
          stroke="#fce5cc"
          strokeWidth="1.6"
          transform="rotate(16 294 158)"
        />
        <ellipse cx="206" cy="162" rx="22" ry="14" fill="#d89a72" transform="rotate(-8 206 162)" />
        <ellipse cx="274" cy="162" rx="22" ry="14" fill="#d89a72" transform="rotate(8 274 162)" />
        <ellipse cx="240" cy="166" rx="18" ry="16" fill={`url(#${p("copper-side")})`} />
        <ellipse cx="240" cy="164" rx="9" ry="8" fill="#fff0e0" opacity="0.75" />
        <path
          d="M226 188 Q210 228 194 252 Q218 232 230 204 Z"
          fill={`url(#${p("copper")})`}
        />
        <path
          d="M254 188 Q270 228 286 252 Q262 232 250 204 Z"
          fill="#8b4a28"
          opacity="0.95"
        />
        <path
          d="M130 118 L350 118"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      <g filter={`url(#${p("spark")})`}>
        {[
          [58, 148, "#fff8f0"],
          [418, 128, "#ffb06b"],
          [108, 308, "#ffffff"],
          [378, 298, "#ff9a4d"],
          [240, 72, "#fff8f0"],
          [52, 248, "#ffc88a"],
          [428, 230, "#ffffff"],
        ].map(([x, y, fill], i) => (
          <path
            key={i}
            d={`M${x} ${y} l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z`}
            fill={fill as string}
          />
        ))}
      </g>
    </svg>
  );
}