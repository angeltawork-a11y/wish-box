/** Detailed isometric 2.5D gift box (SVG) — not CSS 3D cubes. */
type Props = {
  className?: string;
  open?: boolean;
};

export function GiftBoxArt({ className = "", open = false }: Props) {
  return (
    <svg
      viewBox="0 0 420 420"
      className={`gift-art ${open ? "is-open" : ""} ${className}`.trim()}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ga-body-l" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2c2c2e" />
          <stop offset="55%" stopColor="#141416" />
          <stop offset="100%" stopColor="#070708" />
        </linearGradient>
        <linearGradient id="ga-body-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3c" />
          <stop offset="45%" stopColor="#1a1a1c" />
          <stop offset="100%" stopColor="#0a0a0b" />
        </linearGradient>
        <linearGradient id="ga-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6d7b8" />
          <stop offset="35%" stopColor="#d4926a" />
          <stop offset="70%" stopColor="#b86b45" />
          <stop offset="100%" stopColor="#8a4528" />
        </linearGradient>
        <linearGradient id="ga-copper-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8b896" />
          <stop offset="100%" stopColor="#7a3a20" />
        </linearGradient>
        <linearGradient id="ga-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a4528" />
          <stop offset="45%" stopColor="#f0c9a0" />
          <stop offset="100%" stopColor="#b86b45" />
        </linearGradient>
        <linearGradient id="ga-inner" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fff4e8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#ff9a4d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ga-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#ffb06b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
        </radialGradient>
        <filter id="ga-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* ambient glow */}
      <ellipse
        className="gift-art__glow"
        cx="210"
        cy="250"
        rx="150"
        ry="110"
        fill="url(#ga-glow)"
      />

      {/* ground shadow */}
      <ellipse
        className="gift-art__shadow"
        cx="210"
        cy="352"
        rx="118"
        ry="20"
        fill="rgba(0,0,0,0.42)"
      />

      {/* body */}
      <g className="gift-art__body">
        {/* left face */}
        <path
          d="M95 175 L95 300 L210 360 L210 235 Z"
          fill="url(#ga-body-l)"
          stroke="#3a3a3c"
          strokeWidth="1.5"
        />
        {/* right face */}
        <path
          d="M210 235 L210 360 L325 300 L325 175 Z"
          fill="url(#ga-body-r)"
          stroke="#4a4a4c"
          strokeWidth="1.5"
        />
        {/* top rim / interior */}
        <path
          d="M95 175 L210 235 L325 175 L210 120 Z"
          fill="#0d0a08"
          stroke="#2a221c"
          strokeWidth="1.2"
        />
        <path
          className="gift-art__inner"
          d="M130 185 L210 225 L290 185 L210 150 Z"
          fill="url(#ga-inner)"
          opacity="0"
        />

        {/* copper ribbons on faces */}
        <path
          d="M152 205 L152 318 L168 328 L168 214 Z"
          fill="url(#ga-ribbon)"
          opacity="0.95"
        />
        <path
          d="M252 250 L252 348 L268 338 L268 242 Z"
          fill="url(#ga-ribbon)"
          opacity="0.95"
        />

        {/* edge highlights */}
        <path
          d="M95 175 L210 235 L325 175"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
        />
        <path
          d="M210 235 L210 360"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.2"
        />
      </g>

      {/* lid + bow (opens together) */}
      <g className="gift-art__lid">
        {/* lid top diamond */}
        <path
          d="M88 168 L210 102 L332 168 L210 232 Z"
          fill="url(#ga-copper)"
          stroke="#f6d7b8"
          strokeWidth="1.8"
        />
        {/* lid side thickness */}
        <path
          d="M88 168 L88 188 L210 252 L210 232 Z"
          fill="url(#ga-copper-deep)"
          opacity="0.92"
        />
        <path
          d="M332 168 L332 188 L210 252 L210 232 Z"
          fill="#8a4528"
          opacity="0.85"
        />

        {/* cross ribbon on lid */}
        <path
          d="M198 118 L222 118 L222 214 L198 214 Z"
          fill="url(#ga-ribbon)"
        />
        <path
          d="M130 160 L290 160 L290 182 L130 182 Z"
          fill="url(#ga-ribbon)"
        />

        {/* bow loops */}
        <g className="gift-art__bow">
          <ellipse
            cx="168"
            cy="148"
            rx="36"
            ry="22"
            fill="url(#ga-copper)"
            stroke="#f6d7b8"
            strokeWidth="1.4"
            transform="rotate(-18 168 148)"
          />
          <ellipse
            cx="252"
            cy="148"
            rx="36"
            ry="22"
            fill="url(#ga-copper)"
            stroke="#f6d7b8"
            strokeWidth="1.4"
            transform="rotate(18 252 148)"
          />
          <ellipse
            cx="186"
            cy="152"
            rx="20"
            ry="13"
            fill="#d4926a"
            transform="rotate(-10 186 152)"
          />
          <ellipse
            cx="234"
            cy="152"
            rx="20"
            ry="13"
            fill="#d4926a"
            transform="rotate(10 234 152)"
          />
          <ellipse cx="210" cy="156" rx="16" ry="14" fill="url(#ga-copper-deep)" />
          <ellipse cx="210" cy="154" rx="8" ry="7" fill="#f6d7b8" opacity="0.7" />
          {/* tails */}
          <path
            d="M200 168 Q188 200 176 218 Q196 200 204 178 Z"
            fill="url(#ga-copper)"
            opacity="0.9"
          />
          <path
            d="M220 168 Q232 200 244 218 Q224 200 216 178 Z"
            fill="url(#ga-copper-deep)"
            opacity="0.9"
          />
        </g>
      </g>

      {/* sparkles */}
      <g className="gift-art__sparks" filter="url(#ga-soft)">
        <path className="gift-art__spark gift-art__spark--1" d="M70 150 L74 160 L84 164 L74 168 L70 178 L66 168 L56 164 L66 160 Z" fill="#fff7f0" />
        <path className="gift-art__spark gift-art__spark--2" d="M340 130 L343 138 L351 141 L343 144 L340 152 L337 144 L329 141 L337 138 Z" fill="#ffb06b" />
        <path className="gift-art__spark gift-art__spark--3" d="M120 280 L123 286 L129 288 L123 290 L120 296 L117 290 L111 288 L117 286 Z" fill="#fff" />
        <path className="gift-art__spark gift-art__spark--4" d="M310 270 L313 277 L320 280 L313 283 L310 290 L307 283 L300 280 L307 277 Z" fill="#ff9a4d" />
        <path className="gift-art__spark gift-art__spark--5" d="M210 78 L213 86 L221 89 L213 92 L210 100 L207 92 L199 89 L207 86 Z" fill="#fff7f0" />
      </g>
    </svg>
  );
}
