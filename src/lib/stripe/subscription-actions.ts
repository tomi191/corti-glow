"use server";

import { getStripe } from "./client";
import { getSubscriptionVariant } from "./subscription-prices";

interface CreateSubscriptionParams {
  stripeCustomerId: string;
  variantId: string;
  metadata?: Record<string, string>;
}

interface SubscriptionResult {
  subscriptionId: string;
  clientSecret: string;
  status: string;
}

/**
 * Create a Stripe subscription.
 * Uses `payment_behavior: 'default_incomplete'` so the first
 * PaymentIntent is returned for client-side confirmation.
 */
export async function createStripeSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionResult> {
  const stripe = getStripe();

  const variant = getSubscriptionVariant(params.variantId);
  if (!variant || !variant.stripePriceId) {
    throw new Error(`Invalid subscription variant: ${params.variantId}`);
  }

  const subscription = await stripe.subscriptions.create({
    customer: params.stripeCustomerId,
    items: [{ price: variant.stripePriceId }],
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      variantId: params.variantId,
      variantName: variant.name,
      ...params.metadata,
    },
  });

  // Extract client secret from the first invoice's payment intent
  const invoice = subscription.latest_invoice as any;
  const paymentIntent = invoice?.payment_intent;

  if (!paymentIntent?.client_secret) {
    throw new Error("Failed to get payment intent for subscription");
  }

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
    status: subscription.status,
  };
}

/**
 * Create or retrieve a Stripe Customer by email.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string
): Promise<string> {
  const stripe = getStripe();

  // Check if customer already exists
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
  });

  return customer.id;
}

/**
 * Pause a subscription (by setting pause_collection).
 */
export async function pauseStripeSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: { behavior: "void" },
  });
}

/**
 * Resume a paused subscription.
 */
export async function resumeStripeSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: "",
  } as any);
}

/**
 * Cancel a subscription at period end.
 */
export async function cancelStripeSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Skip next billing cycle by pushing the billing anchor forward.
 * Implementation: pause until next period end, then auto-resume.
 */
export async function skipNextCycle(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe();
  const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;

  // Pause until end of next period
  const periodEnd = sub.current_period_end as number;
  const periodStart = (sub.current_period_start || 0) as number;
  const resumeAt = periodEnd + (periodEnd - periodStart);

  await stripe.subscriptions.update(subscriptionId, {
    pause_collection: {
      behavior: "void",
      resumes_at: resumeAt,
    },
  });
}
