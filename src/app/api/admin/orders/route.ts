// Admin Orders API

import { NextRequest, NextResponse } from "next/server";
import { listOrders, updateOrderStatus } from "@/lib/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await listOrders({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      search,
      limit,
      offset,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders: result.orders,
      count: result.count,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Update order status (single or bulk)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk update: { orderIds: string[], status: string }
    if (Array.isArray(body.orderIds)) {
      const { orderIds, status } = body;
      if (!orderIds.length || !status) {
        return NextResponse.json(
          { error: "orderIds array and status required" },
          { status: 400 }
        );
      }
      if (orderIds.length > 100) {
        return NextResponse.json(
          { error: "Maximum 100 orders per bulk operation" },
          { status: 400 }
        );
      }

      let successCount = 0;
      const errors: string[] = [];
      for (const id of orderIds) {
        const result = await updateOrderStatus(id, status);
        if (result.success) {
          successCount++;
        } else {
          errors.push(`${id}: ${result.error}`);
        }
      }

      return NextResponse.json({
        success: true,
        updated: successCount,
        total: orderIds.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    // Single update: { orderId: string, status: string }
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status required" },
        { status: 400 }
      );
    }

    const result = await updateOrderStatus(orderId, status);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
