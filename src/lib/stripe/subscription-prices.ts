// Subscription pricing configuration
// Stripe Price IDs must be created in Stripe Dashboard first
// and set as environment variables

export const SUBSCRIPTION_DISCOUNT = 0.20; // 20% off

export interface SubscriptionVariant {
  variantId: string;
  name: string;
  oneTimePrice: number;
  subscriptionPrice: number;
  stripePriceId: string;
}

// Variant → Stripe Price ID mapping
// Price IDs come from env vars (set after creating in Stripe Dashboard)
export const SUBSCRIPTION_VARIANTS: Record<string, SubscriptionVariant> = {
  "starter-box": {
    variantId: "starter-box",
    name: "Старт",
    oneTimePrice: 49.99,
    subscriptionPrice: 39.99,
    stripePriceId: process.env.STRIPE_PRICE_STARTER_SUB || "",
  },
  "glow-bundle": {
    variantId: "glow-bundle",
    name: "Glow Пакет",
    oneTimePrice: 85.99,
    subscriptionPrice: 68.79,
    stripePriceId: process.env.STRIPE_PRICE_GLOW_SUB || "",
  },
  "restart-bundle": {
    variantId: "restart-bundle",
    name: "Пълен Рестарт",
    oneTimePrice: 119.99,
    subscriptionPrice: 95.99,
    stripePriceId: process.env.STRIPE_PRICE_RESTART_SUB || "",
  },
};

/**
 * Get subscription variant by ID with server-verified price.
 */
export function getSubscriptionVariant(
  variantId: string
): SubscriptionVariant | null {
  return SUBSCRIPTION_VARIANTS[variantId] || null;
}

/**
 * Validate that a Stripe Price ID matches the expected variant.
 */
export function validatePriceId(
  variantId: string,
  priceId: string
): boolean {
  const variant = SUBSCRIPTION_VARIANTS[variantId];
  return !!variant && variant.stripePriceId === priceId;
}
