// Admin Order Detail API

import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrder, cancelOrder } from "@/lib/actions/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getOrder(id);

    if (result.error || !result.order) {
      return NextResponse.json(
        { error: result.error || "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: result.order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle cancellation via dedicated flow
    if (body.action === "cancel") {
      const result = await cancelOrder(id, body.reason);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        refundId: result.refundId,
        message: result.refundId
          ? "Поръчката е отменена и рефундът е иницииран"
          : "Поръчката е отменена",
      });
    }

    const result = await updateOrder(id, body);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: result.order });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
