import { NextResponse } from "next/server";
import { getAdminPasswordConfig, requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await requireAdminSession();
  const { isSample } = getAdminPasswordConfig();
  return NextResponse.json({
    authenticated,
    isSample,
    samplePasswordHint: isSample ? "wishbox-admin" : null,
  });
}
