"use client";

import Link from "next/link";
import { amountVisualScale, formatAmountRub } from "@/lib/amounts";

type Props = {
  amount: number;
};

export function AmountBox({ amount }: Props) {
  const scale = amountVisualScale(amount);
  const sizePx = Math.round(72 + scale * 108);

  return (
    <Link
      href={`/wish?amount=${amount}`}
      className="amount-box"
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        ["--box-scale" as string]: String(scale),
      }}
      aria-label={`Выбрать сумму ${formatAmountRub(amount)}`}
    >
      <span className="amount-box__cube" aria-hidden="true">
        <span className="amount-box__face amount-box__front" />
        <span className="amount-box__face amount-box__side" />
        <span className="amount-box__face amount-box__top" />
        <span className="amount-box__lid" />
        <span className="amount-box__ribbon" />
      </span>
      <span className="amount-box__value">{formatAmountRub(amount)}</span>
    </Link>
  );
}
