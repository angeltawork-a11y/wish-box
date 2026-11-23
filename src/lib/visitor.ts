const STORAGE_KEY = "wishbox-visitor";

export type Visitor = {
  name: string;
  telegram: string;
};

export function normalizeName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) return null;
  return name;
}

export function normalizeTelegram(raw: string): string | null {
  let value = raw.trim();
  value = value.replace(/^https?:\/\/(?:t\.me|telegram\.me)\//i, "");
  value = value.replace(/^t\.me\//i, "");
  value = value.replace(/^@/, "");
  value = value.split(/[/?#]/)[0] ?? "";
  if (!/^[\p{L}\p{N}_]{3,32}$/u.test(value)) return null;
  return value;
}

export function readVisitor(): Visitor | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Visitor>;
    const name = normalizeName(String(data.name ?? ""));
    const telegram = normalizeTelegram(String(data.telegram ?? ""));
    if (!name || !telegram) return null;
    return { name, telegram };
  } catch {
    return null;
  }
}

export function saveVisitor(visitor: Visitor) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visitor));
}
