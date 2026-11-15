import Image from "next/image";
import { PRIZE_IMAGES } from "@/lib/prizes";

type Tone = "dark" | "light";

/** Full-viewport scatter — prizes readable at ~50% opacity. */
const SCATTER: { left: number; top: number; w: number; rot: number }[] = [
  { left: 1, top: 2, w: 30, rot: -7 },
  { left: 68, top: 0, w: 28, rot: 5 },
  { left: 34, top: 1, w: 26, rot: -3 },
  { left: 82, top: 18, w: 24, rot: 9 },
  { left: 0, top: 38, w: 27, rot: 4 },
  { left: 72, top: 42, w: 30, rot: -6 },
  { left: 38, top: 36, w: 32, rot: 2 },
  { left: 12, top: 68, w: 29, rot: -5 },
  { left: 58, top: 62, w: 28, rot: 7 },
  { left: 84, top: 72, w: 26, rot: -4 },
  { left: 22, top: 82, w: 31, rot: 3 },
  { left: 46, top: 78, w: 27, rot: -8 },
];

type Props = {
  tone?: Tone;
  className?: string;
};

export function PrizeBackdrop({ tone = "light", className = "" }: Props) {
  const toneClass = tone === "dark" ? "prize-backdrop--dark" : "prize-backdrop--light";

  return (
    <div
      className={`prize-backdrop ${toneClass} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="prize-backdrop__mosaic">
        {PRIZE_IMAGES.map((prize, i) => {
          const slot = SCATTER[i % SCATTER.length];
          return <PrizeTile key={prize.src} prize={prize} slot={slot} />;
        })}
      </div>
      <div className="prize-backdrop__scrim" />
      <div className="prize-backdrop__vignette" />
      <div className="prize-backdrop__center-dim" />
    </div>
  );
}

function PrizeTile({
  prize,
  slot,
}: {
  prize: (typeof PRIZE_IMAGES)[number];
  slot: (typeof SCATTER)[number];
}) {
  return (
    <div
      className="prize-backdrop__tile"
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.w}%`,
        transform: `rotate(${slot.rot}deg)`,
      }}
    >
      <Image
        src={prize.src}
        alt=""
        width={960}
        height={640}
        quality={92}
        className="prize-backdrop__img"
        sizes="(max-width: 768px) 45vw, 30vw"
        priority={false}
      />
    </div>
  );
}