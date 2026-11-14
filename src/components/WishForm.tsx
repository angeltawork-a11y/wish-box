"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatAmountRub, type WishAmount } from "@/lib/amounts";

type Employee = {
  id: number;
  department_id: number;
  name: string;
  title: string;
  department_name?: string;
};

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [wish, setWish] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data: { employees?: Employee[] }) => {
        if (!cancelled) setEmployees(data.employees ?? []);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
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

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (q.length < 1) return [];
    return employees
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [employees, name]);

  function pickEmployee(e: Employee) {
    setName(e.name);
    setTitle(e.title);
    setDepartment(e.department_name ?? "");
    setEmployeeId(e.id);
  }

  function onNameChange(value: string) {
    setName(value);
    setEmployeeId(null);
    const exact = employees.find(
      (e) => e.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (exact) {
      setTitle(exact.title);
      setDepartment(exact.department_name ?? "");
      setEmployeeId(exact.id);
      return;
    }
    const byTitle = employees.find(
      (e) =>
        e.title.toLowerCase() === title.trim().toLowerCase() &&
        title.trim() !== "",
    );
    if (byTitle && value.trim()) {
      setDepartment(byTitle.department_name ?? "");
    } else {
      setDepartment("");
    }
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (employeeId != null) return;
    const match = employees.find(
      (e) =>
        e.name.toLowerCase() === name.trim().toLowerCase() ||
        (value.trim() !== "" &&
          e.title.toLowerCase() === value.trim().toLowerCase() &&
          e.name.toLowerCase().includes(name.trim().toLowerCase())),
    );
    if (match) {
      setDepartment(match.department_name ?? "");
      if (match.name.toLowerCase() === name.trim().toLowerCase()) {
        setEmployeeId(match.id);
      }
    }
  }

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
    setLoading(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("title", title);
      form.set("department", department);
      form.set("wish", wish);
      form.set("amount", String(amount));
      form.set("link", link);
      if (employeeId != null) form.set("employeeId", String(employeeId));
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

      <div className="relative">
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Имя
        </label>
        <input
          className="field"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Как вас зовут"
          autoComplete="name"
          required
        />
        {suggestions.length > 0 && employeeId == null && (
          <ul className="absolute z-20 mt-1 w-full border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-[var(--orange-mist)]"
                  onClick={() => pickEmployee(s)}
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-sm opacity-70">
                    {s.title}
                    {s.department_name ? ` · ${s.department_name}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Должность
        </label>
        <input
          className="field"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ваша должность"
          autoComplete="organization-title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Отдел
        </label>
        <input
          className="field bg-[var(--surface)]"
          value={department || "Определится по справочнику"}
          readOnly
          aria-live="polite"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          И желания на будущее
        </label>
        <textarea
          className="field min-h-[140px] resize-y"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Чего хотите для себя, команды или компании…"
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
