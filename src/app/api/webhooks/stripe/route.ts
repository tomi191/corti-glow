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
