import Image from "next/image";
import { PRIZE_IMAGES } from "@/lib/prizes";

type Tone = "dark" | "light";

const LAYOUT: { col: number; row: number; w: number; rot: number }[] = [
  { col: 0, row: 0, w: 1.15, rot: -6 },
  { col: 1, row: 0, w: 1.05, rot: 4 },
  { col: 2, row: 0, w: 1.1, rot: -3 },
  { col: 3, row: 0, w: 1, rot: 8 },
  { col: 0, row: 1, w: 1.08, rot: 5 },
  { col: 1, row: 1, w: 1.12, rot: -8 },
  { col: 2, row: 1, w: 1.06, rot: 3 },
  { col: 3, row: 1, w: 1.14, rot: -5 },
  { col: 0, row: 2, w: 1.1, rot: 7 },
  { col: 1, row: 2, w: 1.04, rot: -4 },
  { col: 2, row: 2, w: 1.16, rot: 2 },
  { col: 3, row: 2, w: 1.08, rot: -7 },
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
          const slot = LAYOUT[i % LAYOUT.length];
          return (
            <PrizeTile key={prize.src} prize={prize} slot={slot} />
          );
        })}
      </div>
      <div className="prize-backdrop__scrim" />
      <div className="prize-backdrop__vignette" />
    </div>
  );
}

function PrizeTile({
  prize,
  slot,
}: {
  prize: (typeof PRIZE_IMAGES)[number];
  slot: (typeof LAYOUT)[number];
}) {
  const left = `${slot.col * 25 + 2}%`;
  const top = `${slot.row * 33 + 2}%`;

  return (
    <div
      className="prize-backdrop__tile"
      style={{
        left,
        top,
        width: `${22 * slot.w}%`,
        transform: `rotate(${slot.rot}deg)`,
      }}
    >
      <Image
        src={prize.src}
        alt=""
        width={400}
        height={280}
        className="prize-backdrop__img"
        sizes="25vw"
        priority={false}
      />
    </div>
  );
}