// Shared date utilities for the PWA.
// All functions work with "YYYY-MM-DD" date strings to avoid timezone issues.

/**
 * Returns today's date as "YYYY-MM-DD" in the user's local timezone.
 */
export function getToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Validates a "YYYY-MM-DD" date string.
 * Returns true only if the format is correct AND it represents a real date.
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/**
 * Calculates the number of whole days between two "YYYY-MM-DD" strings.
 * Uses date-only arithmetic (no time components) to avoid DST issues.
 * Returns a positive number if `to` is after `from`, negative if before.
 */
export function getDiffDays(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date object as "YYYY-MM-DD" in local timezone.
 */
export function formatDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats year/month/day numbers as "YYYY-MM-DD".
 * Month is 0-based (January = 0) to match Date constructor convention.
 */
export function formatYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
