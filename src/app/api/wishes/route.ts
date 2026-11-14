import { NextResponse } from "next/server";
import { isWishAmount } from "@/lib/amounts";
import { ensureSeeded } from "@/lib/seed";
import { sql } from "@/lib/db";

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
  await ensureSeeded();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const wish = String(form.get("wish") ?? "").trim();
  let department = String(form.get("department") ?? "").trim();
  const link = String(form.get("link") ?? "").trim();
  const amountRaw = Number(form.get("amount"));
  const employeeRaw = form.get("employeeId");
  let employeeId =
    employeeRaw != null && String(employeeRaw) !== ""
      ? Number(employeeRaw)
      : null;
  if (employeeId != null && !Number.isFinite(employeeId)) {
    employeeId = null;
  }

  if (!isWishAmount(amountRaw)) {
    return NextResponse.json(
      { error: "Выберите допустимую сумму" },
      { status: 400 },
    );
  }
  const amount = amountRaw;

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Укажите имя (не меньше 2 символов)" },
      { status: 400 },
    );
  }
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
      title: string;
      department_name: string;
    }>(
      `SELECT e.id, e.name, e.title, d.name AS department_name
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       WHERE e.id = $1`,
      [employeeId],
    );
    if (match[0]) {
      department = match[0].department_name;
    } else {
      employeeId = null;
    }
  }

  if (!department && (name || title)) {
    const found = await sql<{
      id: number;
      department_name: string;
      title: string;
    }>(
      `SELECT e.id, e.title, d.name AS department_name
       FROM employees e
       JOIN departments d ON d.id = e.department_id
       WHERE LOWER(e.name) = LOWER($1)
          OR (LOWER(e.name) = LOWER($1) AND LOWER(e.title) = LOWER($2))
          OR (LOWER(e.title) = LOWER($2) AND $2 <> '')
       ORDER BY
         CASE WHEN LOWER(e.name) = LOWER($1) AND LOWER(e.title) = LOWER($2) THEN 0
              WHEN LOWER(e.name) = LOWER($1) THEN 1
              ELSE 2 END
       LIMIT 1`,
      [name, title],
    );
    if (found[0]) {
      employeeId = found[0].id;
      department = found[0].department_name;
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
