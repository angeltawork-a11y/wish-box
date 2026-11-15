import { NextResponse } from "next/server";
import { readEmployeeSession } from "@/lib/employee-session";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await readEmployeeSession();
  if (!ctx) {
    return NextResponse.json({ saved: false, employee: null });
  }
  return NextResponse.json({ saved: true, employee: ctx });
}

export async function POST() {
  return NextResponse.json(
    { error: "Войдите по рабочей почте — код придёт на письмо." },
    { status: 405 },
  );
}
