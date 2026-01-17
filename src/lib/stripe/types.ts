// Stripe Payment Types

export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata?: Record<string, string>;
      customer_email?: string;
      receipt_email?: string;
      payment_method?: string;
      last_payment_error?: {
        message: string;
        code: string;
      };
    };
  };
}

export interface PaymentStatus {
  status: "pending" | "processing" | "succeeded" | "failed" | "canceled";
  message?: string;
}

// Currency helpers for Bulgaria (EUR from 2026)
export const SUPPORTED_CURRENCIES = ["EUR", "BGN"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "EUR";

// EUR/BGN fixed exchange rate
export const EUR_TO_BGN_RATE = 1.95583;

export function convertToEur(amountBgn: number): number {
  return Math.round((amountBgn / EUR_TO_BGN_RATE) * 100) / 100;
}

export function convertToBgn(amountEur: number): number {
  return Math.round(amountEur * EUR_TO_BGN_RATE * 100) / 100;
}

// Convert amount to cents for Stripe
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

// Convert cents to amount
export function centsToAmount(cents: number): number {
  return cents / 100;
}
