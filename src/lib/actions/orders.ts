"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  OrderInsert,
  OrderUpdate,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/supabase/types";

// Stock Management Types
interface StockItem {
  productId: string;
  variantId: string;
  quantity: number;
}

interface StockCheckResult {
  available: boolean;
  insufficientItems: Array<{
    productId: string;
    variantId: string;
    requested: number;
    available: number;
  }>;
}

// Generate unique order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL${year}${month}${day}-${random}`;
}

// Create a new order
export async function createOrder(
  data: Omit<OrderInsert, "order_number">
): Promise<{ order: Order | null; error: string | null }> {
  try {
    const supabase = createServerClient();
    const orderNumber = generateOrderNumber();

    const insertData: OrderInsert = {
      ...data,
      order_number: orderNumber,
    };

    const { data: order, error } = await (supabase
      .from("orders") as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase create order error:", error);
      return { order: null, error: error.message };
    }

    revalidatePath("/admin/porachki");
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
  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    return { order: null, error: error.message };
  }
  return { order, error: null };
}

// Get order by order number
export async function getOrderByNumber(
  orderNumber: string
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (error) {
    return { order: null, error: error.message };
  }
  return { order, error: null };
}

// Get order by Stripe payment intent
export async function getOrderByPaymentIntent(
  paymentIntentId: string
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .single();

  if (error) {
    return { order: null, error: "Order not found" };
  }
  return { order, error: null };
}

// Update order
export async function updateOrder(
  orderId: string,
  data: OrderUpdate
): Promise<{ order: Order | null; error: string | null }> {
  const supabase = createServerClient();
  const { data: order, error } = await (supabase
    .from("orders") as any)
    .update(data)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    return { order: null, error: error.message };
  }

  revalidatePath("/admin/porachki");
  return { order, error: null };
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
  const updateData: OrderUpdate = {
    payment_status: paymentStatus,
  };
  if (paymentIntentId) {
    updateData.stripe_payment_intent_id = paymentIntentId;
  }
  const { error } = await updateOrder(orderId, updateData);
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
  const supabase = createServerClient();
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters?.search) {
    // Sanitize search input to prevent SQL/PostgREST injection
    // Remove special characters that could manipulate the query
    const sanitizedSearch = filters.search
      .replace(/[%_,()]/g, '') // Remove wildcards and special PostgREST chars
      .trim()
      .slice(0, 100); // Limit length

    if (sanitizedSearch) {
      query = query.or(`order_number.ilike.%${sanitizedSearch}%,customer_email.ilike.%${sanitizedSearch}%`);
    }
  }

  // Sorting
  query = query.order("created_at", { ascending: false });

  // Pagination
  if (filters?.limit) {
    const from = filters.offset || 0;
    const to = from + filters.limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("List orders error:", error);
    return { orders: [], count: 0, error: error.message };
  }

  return { orders: data as Order[], count: count || 0, error: null };
}

// Get order statistics
export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  error: string | null;
}> {
  // This is expensive to do on client, but for now we aggregate.
  // Better to use RCP (Remote Procedure Call) or specific queries.
  // We'll run separate queries for strict correctness.

  const supabase = createServerClient();

  // Total Orders
  const { count: totalOrders, error: err1 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  // Pending Orders
  const { count: pendingOrders, error: err2 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["new", "processing"]);

  // Shipped Orders
  const { count: shippedOrders, error: err3 } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["shipped", "delivered"]);

  // Revenue (requires summing 'total')
  // Supabase JS doesn't do sum() directly unless we use .rpc() or fetch all.
  // For safety and performance, let's fetch only the 'total' column.
  const { data: revenueData, error: err4 } = await supabase
    .from("orders")
    .select("total");

  if (err1 || err2 || err3 || err4) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      error: "Failed to fetch stats",
    };
  }

  const totalRevenue = revenueData?.reduce((sum, row: any) => sum + row.total, 0) || 0;

  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    pendingOrders: pendingOrders || 0,
    shippedOrders: shippedOrders || 0,
    error: null,
  };
}

// ============================================
// Stock Management Functions
// ============================================

// Check if requested quantities are available
export async function checkStock(
  items: StockItem[]
): Promise<StockCheckResult> {
  const supabase = createServerClient();
  const insufficientItems: StockCheckResult["insufficientItems"] = [];

  // Group items by productId since stock is per-product
  const productQuantities = new Map<string, number>();
  for (const item of items) {
    const current = productQuantities.get(item.productId) || 0;
    productQuantities.set(item.productId, current + item.quantity);
  }

  // Check each product's stock
  for (const [productId, requestedQty] of productQuantities) {
    const { data: product, error } = await supabase
      .from("products")
      .select("stock, track_inventory")
      .eq("id", productId)
      .single() as { data: { stock: number; track_inventory: boolean } | null; error: any };

    if (error || !product) {
      insufficientItems.push({
        productId,
        variantId: "",
        requested: requestedQty,
        available: 0,
      });
      continue;
    }

    // Skip check if inventory tracking is disabled
    if (!product.track_inventory) {
      continue;
    }

    if (product.stock < requestedQty) {
      insufficientItems.push({
        productId,
        variantId: "",
        requested: requestedQty,
        available: product.stock,
      });
    }
  }

  return {
    available: insufficientItems.length === 0,
    insufficientItems,
  };
}

// Deduct stock when order is confirmed
export async function deductStock(
  items: StockItem[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerClient();

  // Group items by productId
  const productQuantities = new Map<string, number>();
  for (const item of items) {
    const current = productQuantities.get(item.productId) || 0;
    productQuantities.set(item.productId, current + item.quantity);
  }

  // Deduct stock for each product
  for (const [productId, quantity] of productQuantities) {
    // First get current stock
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock, track_inventory")
      .eq("id", productId)
      .single() as { data: { stock: number; track_inventory: boolean } | null; error: any };

    if (fetchError || !product) {
      console.error(`Failed to fetch product ${productId}:`, fetchError);
      continue;
    }

    // Skip if inventory tracking is disabled
    if (!product.track_inventory) {
      continue;
    }

    const newStock = Math.max(0, product.stock - quantity);

    const { error: updateError } = await (supabase
      .from("products") as any)
      .update({ stock: newStock })
      .eq("id", productId);

    if (updateError) {
      console.error(`Failed to update stock for ${productId}:`, updateError);
      return { success: false, error: `Failed to update stock for product` };
    }
  }

  revalidatePath("/admin/produkti");
  return { success: true, error: null };
}

// Restore stock when order is cancelled
export async function restoreStock(
  items: StockItem[]
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerClient();

  // Group items by productId
  const productQuantities = new Map<string, number>();
  for (const item of items) {
    const current = productQuantities.get(item.productId) || 0;
    productQuantities.set(item.productId, current + item.quantity);
  }

  // Restore stock for each product
  for (const [productId, quantity] of productQuantities) {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("stock, track_inventory")
      .eq("id", productId)
      .single() as { data: { stock: number; track_inventory: boolean } | null; error: any };

    if (fetchError || !product) {
      console.error(`Failed to fetch product ${productId}:`, fetchError);
      continue;
    }

    if (!product.track_inventory) {
      continue;
    }

    const newStock = product.stock + quantity;

    const { error: updateError } = await (supabase
      .from("products") as any)
      .update({ stock: newStock })
      .eq("id", productId);

    if (updateError) {
      console.error(`Failed to restore stock for ${productId}:`, updateError);
      return { success: false, error: `Failed to restore stock` };
    }
  }

  revalidatePath("/admin/produkti");
  return { success: true, error: null };
}
