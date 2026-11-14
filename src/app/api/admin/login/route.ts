import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/auth";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimit(`admin-login:${clientIp(request)}`, 5, 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много попыток входа. Попробуйте через минуту.",
      limited.retryAfterSec,
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Админ-панель не настроена: задайте переменную ADMIN_PASSWORD в окружении.",
      },
      { status: 503 },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
