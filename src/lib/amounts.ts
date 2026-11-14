export const WISH_AMOUNTS = [
  500, 1000, 1500, 2000, 3000, 5000, 10000, 20000, 25000, 50000, 100000,
] as const;

export type WishAmount = (typeof WISH_AMOUNTS)[number];

export function isWishAmount(value: unknown): value is WishAmount {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (WISH_AMOUNTS as readonly number[]).includes(value)
  );
}

export function formatAmountRub(amount: number): string {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

/** Visual scale 0..1 for amount boxes (larger sum → larger box). */
export function amountVisualScale(amount: number): number {
  const min = WISH_AMOUNTS[0];
  const max = WISH_AMOUNTS[WISH_AMOUNTS.length - 1];
  const t = Math.log(amount / min) / Math.log(max / min);
  return 0.42 + t * 0.58;
}
