// Diagnostic endpoint — test Econt shipment creation
// DELETE this after debugging is complete

import { NextResponse } from "next/server";
import { createShipment, validateShipment, buildShipmentParamsFromOrder } from "@/lib/econt/shipments";
import { getOrderByNumber } from "@/lib/actions/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order") || "LL-1004";

  try {
    // 1. Check env vars
    const envCheck = {
      ECONT_API_URL: !!process.env.ECONT_API_URL,
      ECONT_USERNAME: !!process.env.ECONT_USERNAME,
      ECONT_PASSWORD: !!process.env.ECONT_PASSWORD,
      ECONT_CONNECTION_CODE: !!process.env.ECONT_CONNECTION_CODE,
    };

    // 2. Fetch order
    const { order, error: orderError } = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found", orderError, envCheck }, { status: 404 });
    }

    // 3. Build shipment params
    const params = buildShipmentParamsFromOrder(order);

    // 4. Validate (don't create)
    const validation = await validateShipment(params);

    return NextResponse.json({
      envCheck,
      orderNumber: order.order_number,
      shipmentParams: params,
      validation,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
