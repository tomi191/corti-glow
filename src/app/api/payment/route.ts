// Payment Intent Creation API - LOCAL MOCK VERSION

import { NextRequest, NextResponse } from "next/server";
import type { Order } from "@/lib/supabase/types";

// In-memory storage for local testing
const localOrders: Map<string, Order> = new Map();

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL${year}${month}${day}-${random}`;
}

// Generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Customer info
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,

      // Shipping
      shippingMethod,
      shippingAddress,
      shippingPrice,

      // Order
      items,
      subtotal,
      total,
      currency = "EUR",

      // Payment
      paymentMethod, // "card" | "cod"
    } = body;

    // Validate required fields
    if (
      !customerFirstName ||
      !customerLastName ||
      !customerEmail ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: "Missing customer information" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Create order locally (no database)
    const orderNumber = generateOrderNumber();
    const orderId = generateUUID();
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
      customer_first_name: customerFirstName,
      customer_last_name: customerLastName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_method: shippingMethod,
      shipping_address: shippingAddress,
      shipping_price: shippingPrice,
      shipping_weight: null,
      econt_shipment_id: null,
      econt_tracking_number: null,
      econt_label_url: null,
      econt_label_generated_at: null,
      shipped_at: null,
      delivered_at: null,
      estimated_delivery_date: null,
      payment_method: paymentMethod,
      payment_status: "pending",
      stripe_payment_intent_id: null,
      items,
      subtotal,
      discount_code: null,
      discount_amount: 0,
      total,
      currency,
      status: "new",
      notes: null,
    };

    // Store locally
    localOrders.set(orderId, order);

    // Log for debugging
    console.log("========================================");
    console.log("NEW ORDER CREATED (LOCAL MOCK)");
    console.log("========================================");
    console.log("Order Number:", orderNumber);
    console.log("Customer:", `${customerFirstName} ${customerLastName}`);
    console.log("Email:", customerEmail);
    console.log("Phone:", customerPhone);
    console.log("Total:", total, currency);
    console.log("Payment Method:", paymentMethod);
    console.log("Items:", JSON.stringify(items, null, 2));
    console.log("========================================");

    // For COD orders, no payment intent needed
    if (paymentMethod === "cod") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentMethod: "cod",
      });
    }

    // For card payments - return mock data (Stripe not configured)
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      // Mock client secret for testing UI flow
      clientSecret: "mock_pi_" + orderId,
      paymentIntentId: "mock_pi_" + orderId,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed" },
      { status: 500 }
    );
  }
}

// Get payment status (mock for local testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID required" },
        { status: 400 }
      );
    }

    // Mock payment status for local testing
    return NextResponse.json({
      status: "succeeded",
      paymentIntentId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get payment status" },
      { status: 500 }
    );
  }
}

// Get all orders (for testing)
export function getLocalOrders() {
  return Array.from(localOrders.values());
}
