import Image from "next/image";
import { PRIZE_IMAGES } from "@/lib/prizes";

type Tone = "dark" | "light";

type Props = {
  tone?: Tone;
  className?: string;
};

/** Even photo grid behind the page. Opacity is set in CSS (50%). */
export function PrizeBackdrop({ tone = "light", className = "" }: Props) {
  const toneClass = tone === "dark" ? "prize-backdrop--dark" : "prize-backdrop--light";

  return (
    <div
      className={`prize-backdrop ${toneClass} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="prize-backdrop__mosaic">
        {PRIZE_IMAGES.map((prize) => (
          <div key={prize.src} className="prize-backdrop__tile">
            <Image
              src={prize.src}
              alt=""
              width={1200}
              height={800}
              quality={90}
              className="prize-backdrop__img"
              sizes="(max-width: 700px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
      <div className="prize-backdrop__scrim" />
      <div className="prize-backdrop__center-dim" />
    </div>
  );
}