import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Public name lookup is closed. It confirmed whether a person was on the
 * roster. The directory is available only in the admin staff screen.
 */
export async function POST() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Поиск по имени отключён. Откройте справочник в админке." },
    { status: 410 },
  );
}
