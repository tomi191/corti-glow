"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// DB types for subscriptions
export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "past_due"
  | "incomplete";

export interface SubscriptionInsert {
  customer_id: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  product_id?: string;
  variant_id: string;
  variant_name: string;
  quantity?: number;
  price_per_cycle: number;
  original_price: number;
  currency?: string;
  shipping_method?: string;
  shipping_address?: Record<string, unknown>;
  status?: SubscriptionStatus;
  billing_interval?: string;
  current_period_start?: string;
  current_period_end?: string;
  next_billing_date?: string;
}

export interface SubscriptionRow extends SubscriptionInsert {
  id: string;
  created_at: string;
  updated_at: string;
  paused_at?: string;
  cancelled_at?: string;
  cancel_at_period_end: boolean;
}

// ================================
// Customer operations
// ================================

export async function getOrCreateCustomer(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  stripeCustomerId?: string;
}): Promise<{ customerId: string; error: string | null }> {
  const supabase = createServerClient();

  // Check if customer exists
  const { data: existing } = await (supabase
    .from("customers") as any)
    .select("id")
    .eq("email", data.email)
    .single();

  if (existing) {
    // Update stripe_customer_id if provided and missing
    if (data.stripeCustomerId) {
      await (supabase.from("customers") as any)
        .update({ stripe_customer_id: data.stripeCustomerId })
        .eq("id", existing.id);
    }
    return { customerId: existing.id, error: null };
  }

  // Create new customer
  const { data: newCustomer, error } = await (supabase
    .from("customers") as any)
    .insert({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || null,
      stripe_customer_id: data.stripeCustomerId || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create customer error:", error);
    return { customerId: "", error: error.message };
  }

  return { customerId: newCustomer.id, error: null };
}

// ================================
// Subscription CRUD
// ================================

export async function createSubscription(
  data: SubscriptionInsert
): Promise<{ subscription: SubscriptionRow | null; error: string | null }> {
  const supabase = createServerClient();

  const { data: sub, error } = await (supabase
    .from("glow_subscriptions") as any)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Create subscription error:", error);
    return { subscription: null, error: error.message };
  }

  return { subscription: sub, error: null };
}

export async function getSubscription(
  id: string
): Promise<{ subscription: SubscriptionRow | null; error: string | null }> {
  const supabase = createServerClient();

  const { data: sub, error } = await (supabase
    .from("glow_subscriptions") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { subscription: null, error: error.message };
  }

  return { subscription: sub as SubscriptionRow, error: null };
}

export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<{ subscription: SubscriptionRow | null; error: string | null }> {
  const supabase = createServerClient();

  const { data: sub, error } = await (supabase
    .from("glow_subscriptions") as any)
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (error) {
    return { subscription: null, error: error.message };
  }

  return { subscription: sub as SubscriptionRow, error: null };
}

export async function updateSubscription(
  id: string,
  data: Partial<SubscriptionInsert> & {
    paused_at?: string | null;
    cancelled_at?: string | null;
    cancel_at_period_end?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerClient();

  const { error } = await (supabase
    .from("glow_subscriptions") as any)
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Update subscription error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/akount/abonamenti");
  return { success: true, error: null };
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<SubscriptionInsert> & {
    paused_at?: string | null;
    cancelled_at?: string | null;
    cancel_at_period_end?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerClient();

  const { error } = await (supabase
    .from("glow_subscriptions") as any)
    .update(data)
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("Update subscription by stripe ID error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function listCustomerSubscriptions(
  customerEmail: string
): Promise<{ subscriptions: SubscriptionRow[]; error: string | null }> {
  const supabase = createServerClient();

  // First find the customer
  const { data: customer } = await (supabase
    .from("customers") as any)
    .select("id")
    .eq("email", customerEmail)
    .single();

  if (!customer) {
    return { subscriptions: [], error: null };
  }

  const { data: subs, error } = await (supabase
    .from("glow_subscriptions") as any)
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { subscriptions: [], error: error.message };
  }

  return { subscriptions: (subs || []) as SubscriptionRow[], error: null };
}

// ================================
// Subscription order linking
// ================================

export async function createSubscriptionOrder(data: {
  subscriptionId: string;
  orderId: string;
  stripeInvoiceId?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerClient();

  const { error } = await (supabase
    .from("glow_subscription_orders") as any)
    .insert({
      subscription_id: data.subscriptionId,
      order_id: data.orderId,
      stripe_invoice_id: data.stripeInvoiceId || null,
      billing_period_start: data.billingPeriodStart || null,
      billing_period_end: data.billingPeriodEnd || null,
    });

  if (error) {
    console.error("Create subscription order error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
