import { NextResponse } from "next/server";
import { isWishAmount } from "@/lib/amounts";
import { readEmployeeSession } from "@/lib/employee-session";
import { ensureSeeded } from "@/lib/seed";
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

export async function POST(request: Request) {
  const limited = rateLimit(`wish-submit:${clientIp(request)}`, 10, 60_000);
  if (!limited.ok) {
    return rateLimitedResponse(
      "Слишком много отправок. Подождите минуту и попробуйте снова.",
      limited.retryAfterSec,
    );
  }

  await ensureSeeded();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const session = await readEmployeeSession();
  if (!session) {
    return NextResponse.json(
      { error: "Сначала сохраните данные сотрудника" },
      { status: 401 },
    );
  }

  const name = session.name;
  const title = session.title;
  let department = session.department;
  let employeeId = session.employeeId;
  const wish = String(form.get("wish") ?? "").trim();
  const link = String(form.get("link") ?? "").trim();
  const amountRaw = Number(form.get("amount"));

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

  if (employeeId != null) {
    const match = await sql<{
      id: number;
      name: string;
      department_name: string;
    }>(
      `SELECT e.id, e.name, d.name AS department_name
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       WHERE e.id = $1`,
      [employeeId],
    );
    const row = match[0];
    if (
      row &&
      row.name.trim().toLowerCase() === name.toLowerCase()
    ) {
      department = row.department_name;
    } else {
      employeeId = null;
    }
  }

  const inserted = await sql<{ id: number }>(
    `INSERT INTO wishes (
       employee_id, employee_name, employee_title, department_name,
       wish_text, amount, wish_link, image_data, image_mime, image_name
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      employeeId,
      name,
      title,
      department,
      wish,
      amount,
      link,
      imageData,
      imageMime,
      imageName,
    ],
  );

  return NextResponse.json({ ok: true, id: inserted[0]?.id });
}
