import type { ReactNode } from "react";
import { PrizeBackdrop } from "@/components/PrizeBackdrop";

type Props = {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
};

/** Full-height page shell with prize collage behind content. */
export function PageFrame({ children, tone = "light", className = "" }: Props) {
  return (
    <div className={`page-frame page-frame--${tone} ${className}`.trim()}>
      <PrizeBackdrop tone={tone} />
      <div className="page-frame__content">{children}</div>
    </div>
  );
}