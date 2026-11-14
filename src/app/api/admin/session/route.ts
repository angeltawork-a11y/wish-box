import { NextResponse } from "next/server";
import { isAdminConfigured, requireAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await requireAdminSession();
  return NextResponse.json({
    authenticated,
    configured: isAdminConfigured(),
  });
}
