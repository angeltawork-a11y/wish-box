import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Email login is off. Visitors submit a name and Telegram nick with the wish. */
function gone() {
  return NextResponse.json({ error: "Вход по почте отключён" }, { status: 410 });
}

export function POST() {
  return gone();
}

export function PUT() {
  return gone();
}
