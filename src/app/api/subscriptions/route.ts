import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createStripeSubscription,
  getOrCreateStripeCustomer,
} from "@/lib/stripe/subscription-actions";
import { getSubscriptionVariant } from "@/lib/stripe/subscription-prices";
import {
  getOrCreateCustomer,
  createSubscription,
} from "@/lib/actions/subscriptions";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const limiter = createRateLimiter(5, 5 * 60 * 1000);

const subscriptionSchema = z.object({
  customerFirstName: z.string().min(2).max(50),
  customerLastName: z.string().min(2).max(50),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^(\+359|0)[0-9]{9}$/, "Невалиден телефон"),
  variantId: z.string().min(1),
  shippingMethod: z.enum(["econt_office", "econt_address"]),
  shippingAddress: z.object({}).passthrough(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Опитайте отново по-късно." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const body = await request.json();

    // 1. Validate
    const validated = subscriptionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Невалидни данни", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      variantId,
      shippingMethod,
      shippingAddress,
    } = validated.data;

    // 2. Verify variant & price server-side
    const variant = getSubscriptionVariant(variantId);
    if (!variant || !variant.stripePriceId) {
      return NextResponse.json(
        { error: "Невалиден абонаментен пакет" },
        { status: 400 }
      );
    }

    // 3. Get or create Stripe customer
    const customerName = `${customerFirstName} ${customerLastName}`;
    const stripeCustomerId = await getOrCreateStripeCustomer(
      customerEmail,
      customerName
    );

    // 4. Get or create local customer
    const { customerId, error: customerError } = await getOrCreateCustomer({
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
      phone: customerPhone,
      stripeCustomerId,
    });

    if (customerError || !customerId) {
      return NextResponse.json(
        { error: "Грешка при създаване на клиент" },
        { status: 500 }
      );
    }

    // 5. Create Stripe subscription
    const { subscriptionId, clientSecret, status } =
      await createStripeSubscription({
        stripeCustomerId,
        variantId,
        metadata: {
          customerId,
          customerEmail,
        },
      });

    // 6. Save subscription locally
    const { subscription, error: subError } = await createSubscription({
      customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: variant.stripePriceId,
      variant_id: variantId,
      variant_name: variant.name,
      quantity: 1,
      price_per_cycle: variant.subscriptionPrice,
      original_price: variant.oneTimePrice,
      currency: "EUR",
      shipping_method: shippingMethod,
      shipping_address: shippingAddress as Record<string, unknown>,
      status: "incomplete",
      billing_interval: "month",
    });

    if (subError) {
      console.error("Failed to save subscription:", subError);
      // Don't block - Stripe sub was created, we can sync later via webhooks
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription?.id || null,
      stripeSubscriptionId: subscriptionId,
      clientSecret,
      status,
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Грешка при създаване на абонамента" },
      { status: 500 }
    );
  }
}
