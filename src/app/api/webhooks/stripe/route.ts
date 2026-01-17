// Stripe Webhook Handler

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import {
  getOrderByPaymentIntent,
  updatePaymentStatus,
  updateOrderStatus,
} from "@/lib/actions/orders";

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
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Find order by payment intent ID
        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          // Update payment status to paid
          await updatePaymentStatus(order.id, "paid", paymentIntent.id);
          // Update order status to processing
          await updateOrderStatus(order.id, "processing");

          console.log(`Order ${order.order_number} marked as paid`);

          // TODO: Send confirmation email
          // TODO: Create Econt shipment automatically (if desired)
        } else {
          console.warn(
            `No order found for payment intent: ${paymentIntent.id}`
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log(`Payment failed: ${paymentIntent.id}`);

        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          await updatePaymentStatus(order.id, "failed");
          console.log(`Order ${order.order_number} payment failed`);

          // TODO: Send failure notification email
        }
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        console.log(`Payment canceled: ${paymentIntent.id}`);

        const { order } = await getOrderByPaymentIntent(paymentIntent.id);

        if (order) {
          await updateOrderStatus(order.id, "cancelled");
          console.log(`Order ${order.order_number} cancelled`);
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
            console.log(`Order ${order.order_number} refunded`);

            // TODO: Send refund confirmation email
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
