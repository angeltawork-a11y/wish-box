import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const wishes = await sql<{
    id: number;
    employee_name: string;
    telegram: string;
    wish_text: string;
    amount: number | null;
    wish_link: string;
    has_image: boolean;
    created_at: string;
  }>(
    `SELECT id, employee_name, COALESCE(telegram, '') AS telegram,
            wish_text, amount, wish_link,
            (image_data IS NOT NULL) AS has_image,
            created_at::text AS created_at
     FROM wishes
     ORDER BY created_at DESC`,
  );

  return NextResponse.json({
    answers: wishes.map((w) => ({
      id: w.id,
      name: w.employee_name,
      telegram: w.telegram,
      text: w.wish_text,
      amount: w.amount,
      link: w.wish_link || "",
      hasImage: Boolean(w.has_image),
      createdAt: w.created_at,
    })),
  });
}
