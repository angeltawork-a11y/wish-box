"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatAmountRub, type WishAmount } from "@/lib/amounts";
import type { EmployeeContext } from "@/lib/employee-types";

type Props = {
  amount: WishAmount;
  onSuccess: () => void;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function WishForm({ amount, onSuccess }: Props) {
  const [employee, setEmployee] = useState<EmployeeContext | null>(null);
  const [booting, setBooting] = useState(true);
  const [wish, setWish] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/employee")
      .then((r) => r.json())
      .then((data: { saved?: boolean; employee?: EmployeeContext | null }) => {
        if (cancelled) return;
        if (data.saved && data.employee) {
          setEmployee(data.employee);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function onImageChange(file: File | null) {
    setError("");
    if (!file) {
      setImage(null);
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Допустимы только JPEG, PNG, WebP или GIF");
      setImage(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Изображение не больше 5 МБ");
      setImage(null);
      return;
    }
    setImage(file);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!employee) {
      setError("Сначала сохраните данные сотрудника");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.set("name", employee.name);
      form.set("title", employee.title);
      form.set("department", employee.department);
      form.set("wish", wish);
      form.set("amount", String(amount));
      form.set("link", link);
      if (employee.employeeId != null) {
        form.set("employeeId", String(employee.employeeId));
      }
      if (image) form.set("image", image);

      const res = await fetch("/api/wishes", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Не удалось отправить");
        return;
      }
      onSuccess();
    } catch {
      setError("Сеть недоступна. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return <p className="text-[var(--ink)]/60">Загрузка…</p>;
  }

  if (!employee) {
    return (
      <div className="space-y-4">
        <p className="text-[var(--ink)]/75">
          Нужно сначала сохранить имя и должность.
        </p>
        <a href="/employee" className="btn-primary inline-flex">
          К данным сотрудника
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="border border-[var(--line)] bg-[var(--orange-mist)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--orange-deep)]">
          Сумма желания
        </p>
        <p className="display mt-1 text-2xl text-[var(--ink)]">
          {formatAmountRub(amount)}
        </p>
      </div>

      <div className="border border-[var(--line)] bg-[var(--white)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink)]/55">
          Сотрудник
        </p>
        <p className="mt-1 font-semibold text-[var(--ink)]">{employee.name}</p>
        <p className="text-sm text-[var(--ink)]/70">
          {[employee.title, employee.department].filter(Boolean).join(" · ") ||
            "Отдел определится при сохранении"}
        </p>
        <a
          href="/employee"
          className="mt-2 inline-block text-sm text-[var(--orange-deep)] hover:underline"
        >
          Изменить данные
        </a>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Я хочу
        </label>
        <textarea
          className="field min-h-[140px] resize-y"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Напишите свое желание на выбранную сумму, прикрепите ссылку и/или картинку, чтобы получить именно то, что мы хотим)"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Ссылка (необязательно)
        </label>
        <input
          className="field"
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Картинка (необязательно)
        </label>
        <input
          className="field"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
        />
        <p className="mt-1 text-xs text-[var(--ink)]/55">
          JPEG, PNG, WebP или GIF · до 5 МБ
        </p>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Превью вложения"
            className="mt-3 max-h-40 border border-[var(--line)] object-contain"
          />
        ) : null}
      </div>

      {error ? (
        <p className="text-sm font-medium text-[var(--orange-deep)]" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? "Отправляем…" : "Положить в ящик"}
      </button>
    </form>
  );
}
