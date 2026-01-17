// Admin Stats API

import { NextResponse } from "next/server";
import { getOrderStats } from "@/lib/actions/orders";

export async function GET() {
  try {
    const stats = await getOrderStats();

    if (stats.error) {
      return NextResponse.json(
        { error: stats.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      pendingOrders: stats.pendingOrders,
      shippedOrders: stats.shippedOrders,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
