"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatAmountRub, type WishAmount } from "@/lib/amounts";

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
  const [name, setName] = useState("");
  const [telegram, setTelegram] = useState("");
  const [wish, setWish] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const form = new FormData();
      form.set("name", name);
      form.set("telegram", telegram);
      form.set("wish", wish);
      form.set("amount", String(amount));
      form.set("link", link);
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

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Имя
        </label>
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как вас зовут"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Ник в Telegram
        </label>
        <input
          className="field"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          placeholder="@username"
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold tracking-wide">
          Я хочу
        </label>
        <textarea
          className="field min-h-[140px] resize-y"
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Напишите свое желание на выбранную сумму, прикрепите ссылку и/или картинку, чтобы получить именно то, что вы хотите)"
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
        {loading ? "Отправляем…" : "Положить в коробку"}
      </button>
    </form>
  );
}
