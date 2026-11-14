type Bucket = { count: number; resetAt: number };

const g = globalThis as typeof globalThis & {
  __wishboxRateLimit?: Map<string, Bucket>;
};
g.__wishboxRateLimit ??= new Map();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);
  return "unknown";
}

/** Fixed-window limiter. Fail closed when over limit. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const store = g.__wishboxRateLimit!;
  const current = store.get(key);

  if (!current || now >= current.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true };
}

export function rateLimitedResponse(message: string, retryAfterSec: number) {
  return Response.json(
    { error: message },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}
