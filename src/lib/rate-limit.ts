/**
 * In-memory rate limiter for API routes.
 * Each limiter instance maintains its own Map of IP → attempt records.
 */

interface AttemptRecord {
  count: number;
  lastAttempt: number;
}

interface RateLimiter {
  /** Returns true if the IP has exceeded the limit */
  isLimited: (ip: string) => boolean;
  /** Records a failed attempt for the IP */
  recordAttempt: (ip: string) => void;
  /** Clears all attempts for the IP (e.g. on success) */
  clearAttempts: (ip: string) => void;
}

export function createRateLimiter(maxAttempts: number, windowMs: number): RateLimiter {
  const attempts = new Map<string, AttemptRecord>();

  return {
    isLimited(ip: string): boolean {
      const now = Date.now();
      const record = attempts.get(ip);

      if (!record) return false;

      // Reset if window has passed
      if (now - record.lastAttempt > windowMs) {
        attempts.delete(ip);
        return false;
      }

      return record.count >= maxAttempts;
    },

    recordAttempt(ip: string): void {
      const now = Date.now();
      const record = attempts.get(ip);

      if (!record || now - record.lastAttempt > windowMs) {
        attempts.set(ip, { count: 1, lastAttempt: now });
      } else {
        record.count += 1;
        record.lastAttempt = now;
      }
    },

    clearAttempts(ip: string): void {
      attempts.delete(ip);
    },
  };
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
