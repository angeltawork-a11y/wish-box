import { NextResponse } from "next/server";
import { isWishAmount } from "@/lib/amounts";
import { sql } from "@/lib/db";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isSafeHttpUrl(value: string): boolean {
  if (value === "") return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeTelegram(raw: string): string | null {
  let value = raw.trim();
  value = value.replace(/^https?:\/\/(?:t\.me|telegram\.me)\//i, "");
  value = value.replace(/^t\.me\//i, "");
  value = value.replace(/^@/, "");
  value = value.split(/[/?#]/)[0] ?? "";
  if (!/^[\p{L}\p{N}_]{3,32}$/u.test(value)) return null;
  return value;
}

export async function POST(request: Request) {
  const limited = rateLimit(`wish-submit:${clientIp(request)}`, 10, 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много отправок. Подождите минуту и попробуйте снова.",
      limited.retryAfterSec,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  const telegram = normalizeTelegram(String(form.get("telegram") ?? ""));
  const wish = String(form.get("wish") ?? "").trim();
  const link = String(form.get("link") ?? "").trim();
  const amountRaw = Number(form.get("amount"));

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
  }
  if (!telegram) {
    return NextResponse.json(
      { error: "Укажите ник в Telegram, например @name" },
      { status: 400 },
    );
  }
  if (!isWishAmount(amountRaw)) {
    return NextResponse.json(
      { error: "Выберите допустимую сумму" },
      { status: 400 },
    );
  }
  const amount = amountRaw;

  if (wish.length < 3) {
    return NextResponse.json(
      { error: "Напишите желание (не меньше 3 символов)" },
      { status: 400 },
    );
  }
  if (wish.length > 4000) {
    return NextResponse.json(
      { error: "Слишком длинный текст желания" },
      { status: 400 },
    );
  }
  if (link.length > 2000 || !isSafeHttpUrl(link)) {
    return NextResponse.json(
      { error: "Укажите корректную ссылку http(s)" },
      { status: 400 },
    );
  }

  let imageData: Buffer | null = null;
  let imageMime: string | null = null;
  let imageName: string | null = null;
  const imageEntry = form.get("image");
  if (imageEntry instanceof File && imageEntry.size > 0) {
    if (!ALLOWED_TYPES.has(imageEntry.type)) {
      return NextResponse.json(
        { error: "Допустимы только JPEG, PNG, WebP или GIF" },
        { status: 400 },
      );
    }
    if (imageEntry.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Изображение не больше 5 МБ" },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await imageEntry.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Изображение не больше 5 МБ" },
        { status: 400 },
      );
    }
    imageData = buf;
    imageMime = imageEntry.type;
    imageName = imageEntry.name.slice(0, 200) || "image";
  }

  const inserted = await sql<{ id: number }>(
    `INSERT INTO wishes (
       employee_id, employee_name, employee_title, department_name, telegram,
       wish_text, amount, wish_link, image_data, image_mime, image_name
     )
     VALUES (NULL, $1, '', '', $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [name, telegram, wish, amount, link, imageData, imageMime, imageName],
  );

  return NextResponse.json({ ok: true, id: inserted[0]?.id });
}
