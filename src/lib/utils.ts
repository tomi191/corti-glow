import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in Bulgarian Lev
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(2)} лв`;
}

/**
 * Generate a random order ID
 */
export function generateOrderId(): string {
  return `#${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Calculate shipping progress percentage
 */
export function calculateShippingProgress(
  total: number,
  threshold: number
): number {
  return Math.min((total / threshold) * 100, 100);
}

/**
 * Check if free shipping is available
 */
export function isFreeShipping(total: number, threshold: number): boolean {
  return total >= threshold;
}

/**
 * Format date to Bulgarian locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}
