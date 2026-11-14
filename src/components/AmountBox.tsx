"use client";

import Link from "next/link";
import { GiftBoxArt } from "@/components/GiftBoxArt";
import { amountVisualScale, formatAmountRub } from "@/lib/amounts";

type Props = {
  amount: number;
};

export function AmountBox({ amount }: Props) {
  const scale = amountVisualScale(amount);
  const sizePx = Math.round(96 + scale * 140);

  return (
    <Link
      href={`/wish?amount=${amount}`}
      className="amount-box"
      style={{ width: `${sizePx}px` }}
      aria-label={`Выбрать сумму ${formatAmountRub(amount)}`}
    >
      <span className="amount-box__stage" aria-hidden="true">
        <GiftBoxArt className="amount-box__art" />
      </span>
      <span className="amount-box__value">{formatAmountRub(amount)}</span>
    </Link>
  );
}
