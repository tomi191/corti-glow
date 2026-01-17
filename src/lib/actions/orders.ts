"use server";

// Order Management Server Actions
// LOCAL MOCK VERSION - No database required

import type {
  OrderInsert,
  OrderUpdate,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/supabase/types";

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

// Create a new order (LOCAL MOCK)
export async function createOrder(
  data: Omit<OrderInsert, "order_number">
): Promise<{ order: Order | null; error: string | null }> {
  try {
    const orderNumber = generateOrderNumber();
    const orderId = generateUUID();
    const now = new Date().toISOString();

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      created_at: now,
      updated_at: now,
      customer_first_name: data.customer_first_name,
      customer_last_name: data.customer_last_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_method: data.shipping_method,
      shipping_address: data.shipping_address,
      shipping_price: data.shipping_price,
      shipping_weight: data.shipping_weight || null,
      econt_shipment_id: null,
      econt_tracking_number: null,
      econt_label_url: null,
      econt_label_generated_at: null,
      shipped_at: null,
      delivered_at: null,
      estimated_delivery_date: null,
      payment_method: data.payment_method,
      payment_status: data.payment_status || "pending",
      stripe_payment_intent_id: null,
      items: data.items,
      subtotal: data.subtotal,
      discount_code: data.discount_code || null,
      discount_amount: data.discount_amount || 0,
      total: data.total,
      currency: data.currency || "EUR",
      status: data.status || "new",
      notes: data.notes || null,
    };

    // Store locally
    localOrders.set(orderId, order);

    // Log for debugging
    console.log("========================================");
    console.log("NEW ORDER CREATED (LOCAL MOCK)");
    console.log("========================================");
    console.log("Order Number:", orderNumber);
    console.log("Customer:", `${data.customer_first_name} ${data.customer_last_name}`);
    console.log("Email:", data.customer_email);
    console.log("Phone:", data.customer_phone);
    console.log("Total:", data.total, data.currency);
    console.log("Payment Method:", data.payment_method);
    console.log("Items:", JSON.stringify(data.items, null, 2));
    console.log("========================================");

    return { order, error: null };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      order: null,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

// Get order by ID
export async function getOrder(
  orderId: string
): Promise<{ order: Order | null; error: string | null }> {
  const order = localOrders.get(orderId);
  if (!order) {
    return { order: null, error: "Order not found" };
  }
  return { order, error: null };
}

// Get order by order number
export async function getOrderByNumber(
  orderNumber: string
): Promise<{ order: Order | null; error: string | null }> {
  const order = Array.from(localOrders.values()).find(
    (o) => o.order_number === orderNumber
  );
  if (!order) {
    return { order: null, error: "Order not found" };
  }
  return { order, error: null };
}

// Get order by Stripe payment intent
export async function getOrderByPaymentIntent(
  paymentIntentId: string
): Promise<{ order: Order | null; error: string | null }> {
  const order = Array.from(localOrders.values()).find(
    (o) => o.stripe_payment_intent_id === paymentIntentId
  );
  if (!order) {
    return { order: null, error: "Order not found" };
  }
  return { order, error: null };
}

// Update order
export async function updateOrder(
  orderId: string,
  data: OrderUpdate
): Promise<{ order: Order | null; error: string | null }> {
  const existing = localOrders.get(orderId);
  if (!existing) {
    return { order: null, error: "Order not found" };
  }

  const updated: Order = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };

  localOrders.set(orderId, updated);
  return { order: updated, error: null };
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await updateOrder(orderId, { status });
  return { success: !error, error };
}

// Update payment status
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentIntentId?: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await updateOrder(orderId, {
    payment_status: paymentStatus,
    ...(paymentIntentId && { stripe_payment_intent_id: paymentIntentId }),
  });
  return { success: !error, error };
}

// Add Econt tracking info
export async function updateEcontTracking(
  orderId: string,
  shipmentId: string,
  trackingNumber: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await updateOrder(orderId, {
    econt_shipment_id: shipmentId,
    econt_tracking_number: trackingNumber,
    status: "shipped",
  });
  return { success: !error, error };
}

// List orders with filters
export async function listOrders(filters?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: Order[]; count: number; error: string | null }> {
  let orders = Array.from(localOrders.values());

  // Apply filters
  if (filters?.status) {
    orders = orders.filter((o) => o.status === filters.status);
  }

  if (filters?.paymentStatus) {
    orders = orders.filter((o) => o.payment_status === filters.paymentStatus);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(search) ||
        o.customer_email.toLowerCase().includes(search) ||
        o.customer_first_name.toLowerCase().includes(search) ||
        o.customer_last_name.toLowerCase().includes(search)
    );
  }

  // Sort by created_at descending
  orders.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const count = orders.length;

  // Apply pagination
  if (filters?.offset) {
    orders = orders.slice(filters.offset);
  }
  if (filters?.limit) {
    orders = orders.slice(0, filters.limit);
  }

  return { orders, count, error: null };
}

// Get order statistics
export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  error: string | null;
}> {
  const orders = Array.from(localOrders.values());

  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(
      (o) => o.status === "new" || o.status === "processing"
    ).length,
    shippedOrders: orders.filter(
      (o) => o.status === "shipped" || o.status === "delivered"
    ).length,
    error: null,
  };
}
