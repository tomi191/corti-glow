"use server";

// Stripe Server Actions

import { getStripe } from "./client";
import {
  type CreatePaymentIntentParams,
  type PaymentIntentResponse,
  amountToCents,
  DEFAULT_CURRENCY,
} from "./types";

// Create a payment intent for checkout
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  const stripe = getStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToCents(params.amount),
      currency: params.currency.toLowerCase() || DEFAULT_CURRENCY.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: params.customerEmail,
      description: params.description || `Order ${params.orderId}`,
      metadata: {
        orderId: params.orderId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        ...params.metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    throw new Error(
      error instanceof Error ? error.message : "Payment initialization failed"
    );
  }
}

// Update payment intent (e.g., if cart changes)
export async function updatePaymentIntent(
  paymentIntentId: string,
  amount: number,
  metadata?: Record<string, string>
): Promise<void> {
  const stripe = getStripe();

  try {
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: amountToCents(amount),
      ...(metadata && { metadata }),
    });
  } catch (error) {
    console.error("Failed to update payment intent:", error);
    throw new Error("Failed to update payment");
  }
}

// Cancel a payment intent
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<void> {
  const stripe = getStripe();

  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error("Failed to cancel payment intent:", error);
    // Ignore errors - payment might already be processed
  }
}

// Retrieve payment intent status
export async function getPaymentIntentStatus(
  paymentIntentId: string
): Promise<{
  status: string;
  amount: number;
  currency: string;
}> {
  const stripe = getStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    };
  } catch (error) {
    console.error("Failed to get payment intent:", error);
    throw new Error("Failed to retrieve payment status");
  }
}

// Create a refund
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Partial refund if specified
  reason?: "duplicate" | "fraudulent" | "requested_by_customer"
): Promise<{ refundId: string; status: string }> {
  const stripe = getStripe();

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount: amountToCents(amount) }),
      reason,
    });

    return {
      refundId: refund.id,
      status: refund.status || "succeeded",
    };
  } catch (error) {
    console.error("Failed to create refund:", error);
    throw new Error(
      error instanceof Error ? error.message : "Refund failed"
    );
  }
}

// Get Stripe publishable key for client
export async function getStripeConfig(): Promise<{
  publishableKey: string;
}> {
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  };
}
