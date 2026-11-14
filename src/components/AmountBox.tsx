"use client";

import Link from "next/link";
import { amountVisualScale, formatAmountRub } from "@/lib/amounts";

type Props = {
  amount: number;
};

export function AmountBox({ amount }: Props) {
  const scale = amountVisualScale(amount);
  const sizePx = Math.round(100 + scale * 150);

  return (
    <Link
      href={`/wish?amount=${amount}`}
      className="amount-box"
      style={{
        width: `${sizePx}px`,
        ["--box" as string]: `${Math.round(54 + scale * 72)}px`,
        ["--depth" as string]: `${Math.round(54 + scale * 72)}px`,
        ["--h" as string]: `${Math.round(40 + scale * 52)}px`,
        ["--lid-h" as string]: `${Math.round(14 + scale * 12)}px`,
      }}
      aria-label={`Выбрать сумму ${formatAmountRub(amount)}`}
    >
      <span className="amount-box__stage" aria-hidden="true">
        <span className="amount-box__glow" />
        <span className="amount-box__spark amount-box__spark--a" />
        <span className="amount-box__spark amount-box__spark--b" />
        <span className="amount-box__scene">
          <span className="amount-box__lid">
            <span className="amount-box__face amount-box__lid-top">
              <span className="amount-box__ribbon-x" />
              <span className="amount-box__ribbon-y" />
            </span>
            <span className="amount-box__face amount-box__lid-front" />
            <span className="amount-box__face amount-box__lid-right" />
            <span className="amount-box__bow" />
          </span>
          <span className="amount-box__body">
            <span className="amount-box__face amount-box__front">
              <span className="amount-box__ribbon-face" />
            </span>
            <span className="amount-box__face amount-box__right">
              <span className="amount-box__ribbon-face" />
            </span>
            <span className="amount-box__face amount-box__top" />
            <span className="amount-box__face amount-box__bottom" />
          </span>
        </span>
        <span className="amount-box__shadow" />
      </span>
      <span className="amount-box__value">{formatAmountRub(amount)}</span>
    </Link>
  );
}
