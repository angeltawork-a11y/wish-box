import { NextResponse } from "next/server";
import { readEmployeeSession } from "@/lib/employee-session";

export const runtime = "nodejs";

/** Read the current employee session. Sessions are created only after an email code in /api/auth/email. */
export async function GET() {
  const ctx = await readEmployeeSession();
  if (!ctx) {
    return NextResponse.json({ saved: false, employee: null });
  }
  return NextResponse.json({ saved: true, employee: ctx });
}
