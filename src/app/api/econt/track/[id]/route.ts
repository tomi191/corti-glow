// Econt Shipment Tracking API

import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/econt";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 5 tracking requests per minute per IP
const limiter = createRateLimiter(5, 60 * 1000);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много заявки. Опитайте отново след 1 минута." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const { id: shipmentNumber } = await params;

    if (!shipmentNumber || !/^[A-Za-z0-9]{5,30}$/.test(shipmentNumber)) {
      return NextResponse.json(
        { error: "Shipment number required" },
        { status: 400 }
      );
    }

    const tracking = await trackShipment(shipmentNumber);

    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking info not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tracking);
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Failed to get tracking info" },
      { status: 500 }
    );
  }
}
