// Stripe Webhook Handler

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import {
  getOrderByPaymentIntent,
  updatePaymentStatus,
  updateOrderStatus,
  deductStock,
} from "@/lib/actions/orders";
import {
  updateSubscriptionByStripeId,
} from "@/lib/actions/subscriptions";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Find order by payment intent ID
        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          // Idempotency guard: skip if already processed
          if (order.payment_status === "paid") {
            console.log(`Order ${order.order_number} already paid, skipping duplicate webhook`);
            break;
          }

          // Update payment status to paid
          await updatePaymentStatus(order.id, "paid", paymentIntent.id);
          // Update order status to processing
          await updateOrderStatus(order.id, "processing");

          // Deduct stock for card payment orders
          const items = (order.items as Array<{ productId: string; variantId: string; quantity: number }>) || [];
          if (items.length > 0) {
            await deductStock(items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })));
          }

          // Send confirmation email (async, don't await)
          sendOrderConfirmationEmail(order).catch(err =>
            console.error("Failed to send confirmation email:", err)
          );
        } else {
          console.warn(
            `No order found for payment intent: ${paymentIntent.id}`
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          await updatePaymentStatus(order.id, "failed");
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;

        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          await updateOrderStatus(order.id, "cancelled");
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;

        if (paymentIntentId) {
          const { order } = await getOrderByPaymentIntent(paymentIntentId);

          if (order) {
            await updatePaymentStatus(order.id, "refunded");
          }
        }
        break;
      }

      // ================================
      // Subscription Events
      // ================================

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const stripeSubId = subscription.id;
        const status = subscription.status;

        // Map Stripe status to local status
        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "cancelled",
          incomplete: "incomplete",
          trialing: "active",
          paused: "paused",
        };

        const localStatus = statusMap[status] || "incomplete";

        await updateSubscriptionByStripeId(stripeSubId, {
          status: localStatus as any,
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : undefined,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : undefined,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
          cancelled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await updateSubscriptionByStripeId(subscription.id, {
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        // Only handle subscription invoices
        if (invoice.subscription) {
          console.log(
            `Subscription invoice paid: ${invoice.id} for sub ${invoice.subscription}`
          );
          // Subscription renewal orders will be created by a separate cron
          // or handled in a more detailed webhook handler later
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await updateSubscriptionByStripeId(invoice.subscription, {
            status: "past_due",
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Note: Next.js App Router automatically handles raw body
// when using request.text() - no additional config needed
