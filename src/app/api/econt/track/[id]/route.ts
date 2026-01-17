// Econt Shipment Tracking API

import { NextRequest, NextResponse } from "next/server";
import { trackShipment } from "@/lib/econt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentNumber } = await params;

    if (!shipmentNumber) {
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
