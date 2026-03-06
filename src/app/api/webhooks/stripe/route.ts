// Stripe Webhook Handler

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";
import {
  getOrderByPaymentIntent,
  updatePaymentStatus,
  updateOrderStatus,
  updateEcontTracking,
  deductStock,
  createOrder,
} from "@/lib/actions/orders";
import {
  updateSubscriptionByStripeId,
  getSubscriptionByStripeId,
  createSubscriptionOrder,
} from "@/lib/actions/subscriptions";
import { getSubscriptionVariant } from "@/lib/stripe/subscription-prices";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createShipment, buildShipmentParamsFromOrder } from "@/lib/econt/shipments";
import { updateContact } from "@/lib/resend/audiences";

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

          // Atomically increment discount used_count for card payments
          if (order.discount_code) {
            const supabase = createServerClient();
            const { data: discountOk, error: discountErr } = await (supabase as any).rpc("increment_discount_usage", {
              p_code: order.discount_code,
            });
            if (discountErr) {
              console.error("Failed to increment discount usage (card):", discountErr);
            } else if (discountOk === false) {
              console.warn(`Discount ${order.discount_code} max_uses reached (race, card)`);
            }
          }

          // Auto-create Econt shipment (don't block webhook if it fails)
          let updatedOrder = order;
          try {
            const shipmentParams = buildShipmentParamsFromOrder(order);
            console.log("[Webhook] Creating Econt shipment for", order.order_number, JSON.stringify(shipmentParams));
            const label = await createShipment(shipmentParams);
            if (label) {
              console.log("[Webhook] Econt shipment created:", label.shipmentNumber);
              await updateEcontTracking(order.id, label.shipmentNumber, label.shipmentNumber, "shipped", label.pdfURL || undefined);
              updatedOrder = { ...order, econt_tracking_number: label.shipmentNumber };
            } else {
              console.warn("[Webhook] Econt createShipment returned null for", order.order_number);
            }
          } catch (err) {
            console.error("Auto-create shipment failed (card):", err);
          }

          // Send confirmation email (async, don't await)
          sendOrderConfirmationEmail(updatedOrder).catch(err =>
            console.error("Failed to send confirmation email:", err)
          );

          // Sync customer to Resend audience (fire-and-forget)
          updateContact({
            email: order.customer_email,
            firstName: order.customer_first_name,
            lastName: order.customer_last_name,
          }).catch(err =>
            console.error("Failed to sync contact to Resend:", err)
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

      case "charge.dispute.created": {
        const dispute = event.data.object;
        const disputePaymentIntentId =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id;

        if (disputePaymentIntentId) {
          const { order } = await getOrderByPaymentIntent(disputePaymentIntentId);

          if (order) {
            // Mark as failed + cancelled since DB doesn't have "disputed"/"on_hold"
            await updatePaymentStatus(order.id, "failed");
            await updateOrderStatus(order.id, "cancelled");
            console.error(
              `[Webhook] DISPUTE created for order ${order.order_number}, amount: ${dispute.amount}, reason: ${dispute.reason}. Order marked as cancelled. Review in Stripe Dashboard.`
            );
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

        // Only handle subscription renewal invoices (not the initial creation)
        if (invoice.subscription && invoice.billing_reason !== "subscription_create") {
          try {
            console.log(
              `[Webhook] Subscription renewal invoice paid: ${invoice.id} for sub ${invoice.subscription}`
            );

            // 1. Look up subscription
            const { subscription: sub } = await getSubscriptionByStripeId(
              invoice.subscription
            );

            if (!sub) {
              console.error(
                `[Webhook] No subscription found for stripe ID: ${invoice.subscription}`
              );
              break;
            }

            // 2. Look up customer info for the order
            const supabase = createServerClient();
            const { data: customer } = await (supabase
              .from("customers") as any)
              .select("*")
              .eq("id", sub.customer_id)
              .single();

            if (!customer) {
              console.error(
                `[Webhook] No customer found for subscription ${sub.id}, customer_id: ${sub.customer_id}`
              );
              break;
            }

            // 3. Get verified variant price
            const variant = getSubscriptionVariant(sub.variant_id);
            const verifiedPrice = variant
              ? variant.subscriptionPrice
              : Number(sub.price_per_cycle);

            // 4. Build order items (same structure as payment route)
            const variantName = variant?.name || sub.variant_name;
            const orderItems = [
              {
                productId: "corti-glow",
                variantId: sub.variant_id,
                quantity: sub.quantity || 1,
                price: verifiedPrice,
                title: `Corti-Glow (${variantName}) - Абонамент`,
              },
            ];

            const subtotal = verifiedPrice * (sub.quantity || 1);
            // Subscription renewals include shipping from the original subscription
            const shippingPrice = 0; // Shipping is baked into subscription price
            const total = subtotal + shippingPrice;

            // 5. Create the renewal order
            const { order: renewalOrder, error: orderError } = await createOrder({
              customer_first_name: customer.first_name,
              customer_last_name: customer.last_name,
              customer_email: customer.email,
              customer_phone: customer.phone || "",
              shipping_method: (sub.shipping_method as "econt_office" | "econt_address") || "econt_office",
              shipping_address: (sub.shipping_address || {}) as Record<string, string>,
              shipping_price: shippingPrice,
              payment_method: "card",
              payment_status: "paid",
              items: orderItems,
              subtotal,
              discount_code: null,
              discount_amount: 0,
              total,
              currency: sub.currency || "EUR",
              status: "processing",
              notes: `Автоматично подновяване на абонамент ${sub.id}`,
            });

            if (orderError || !renewalOrder) {
              console.error(
                `[Webhook] Failed to create renewal order for sub ${sub.id}:`,
                orderError
              );
              break;
            }

            console.log(
              `[Webhook] Created renewal order ${renewalOrder.order_number} for sub ${sub.id}`
            );

            // 6. Deduct stock
            await deductStock(
              orderItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              }))
            ).catch((err) =>
              console.error(`[Webhook] Stock deduction failed for renewal ${renewalOrder.order_number}:`, err)
            );

            // 7. Link order to subscription
            await createSubscriptionOrder({
              subscriptionId: sub.id,
              orderId: renewalOrder.id,
              stripeInvoiceId: invoice.id,
              billingPeriodStart: invoice.period_start
                ? new Date(invoice.period_start * 1000).toISOString()
                : undefined,
              billingPeriodEnd: invoice.period_end
                ? new Date(invoice.period_end * 1000).toISOString()
                : undefined,
            }).catch((err) =>
              console.error(`[Webhook] Failed to link renewal order to subscription:`, err)
            );

            // 8. Send confirmation email (fire-and-forget)
            sendOrderConfirmationEmail(renewalOrder).catch((err) =>
              console.error(
                `[Webhook] Failed to send renewal confirmation email:`,
                err
              )
            );
          } catch (err) {
            // Don't let renewal processing crash the webhook
            console.error(
              `[Webhook] Subscription renewal processing failed for invoice ${invoice.id}:`,
              err
            );
          }
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
