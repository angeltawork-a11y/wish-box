export function MagicBoxVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] animate-float-box">
      <div
        className="animate-sparkle absolute left-[12%] top-[18%] h-3 w-3 rounded-full bg-[var(--orange-glow)]"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="animate-sparkle absolute right-[18%] top-[28%] h-2 w-2 rounded-full bg-[var(--orange-soft)]"
        style={{ animationDelay: "1.1s" }}
      />
      <div
        className="animate-sparkle absolute bottom-[30%] left-[22%] h-2.5 w-2.5 rounded-full bg-white"
        style={{ animationDelay: "0.7s" }}
      />
      <svg viewBox="0 0 420 420" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="boxFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9a4d" />
            <stop offset="55%" stopColor="#ff6a00" />
            <stop offset="100%" stopColor="#c74300" />
          </linearGradient>
          <linearGradient id="glow" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#fff7f0" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="210" cy="340" rx="120" ry="18" fill="rgba(0,0,0,0.35)" />
        <g className="animate-lid">
          <path
            d="M95 168 L210 110 L325 168 L210 226 Z"
            fill="#1a120e"
            stroke="#ffb06b"
            strokeWidth="3"
          />
          <path
            d="M120 175 L210 130 L300 175 L210 210 Z"
            fill="url(#glow)"
            opacity="0.55"
          />
        </g>
        <path
          d="M95 175 L95 300 L210 360 L210 235 Z"
          fill="#2a160c"
          stroke="#ff9a4d"
          strokeWidth="2.5"
        />
        <path
          d="M210 235 L210 360 L325 300 L325 175 Z"
          fill="url(#boxFace)"
          stroke="#ffe0c2"
          strokeWidth="2.5"
        />
        <path
          d="M95 175 L210 235 L325 175"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          opacity="0.35"
        />
        <circle cx="248" cy="268" r="18" fill="#120d0a" stroke="#ffb06b" strokeWidth="3" />
        <circle cx="248" cy="268" r="6" fill="#ffb06b" />
        <path
          d="M190 120 C200 70, 250 70, 255 105"
          fill="none"
          stroke="#ffb06b"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="255" cy="100" r="7" fill="#fff" />
      </svg>
    </div>
  );
}
