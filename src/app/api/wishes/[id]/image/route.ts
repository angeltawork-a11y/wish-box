import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const rows = await sql<{
    image_data: Buffer | Uint8Array | string | null;
    image_mime: string | null;
    image_name: string | null;
  }>(
    `SELECT image_data, image_mime, image_name
     FROM wishes
     WHERE id = $1 AND image_data IS NOT NULL`,
    [id],
  );

  const row = rows[0];
  if (!row?.image_data || !row.image_mime) {
    return NextResponse.json({ error: "Нет изображения" }, { status: 404 });
  }

  let bytes: Buffer;
  if (Buffer.isBuffer(row.image_data)) {
    bytes = row.image_data;
  } else if (row.image_data instanceof Uint8Array) {
    bytes = Buffer.from(row.image_data);
  } else if (typeof row.image_data === "string") {
    // PGlite / some drivers may return hex or base64-ish; prefer hex from pg
    bytes = Buffer.from(row.image_data.replace(/^\\x/, ""), "hex");
  } else {
    return NextResponse.json({ error: "Нет изображения" }, { status: 404 });
  }

  const body = new Uint8Array(bytes);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": row.image_mime,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, max-age=3600",
      ...(row.image_name
        ? {
            "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.image_name)}`,
          }
        : {}),
    },
  });
}
