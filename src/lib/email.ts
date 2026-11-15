const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length < 5 || email.length > 200 || !EMAIL_RE.test(email)) {
    return null;
  }
  return email;
}
