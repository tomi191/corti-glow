// Econt Shipment Creation API

import { NextRequest, NextResponse } from "next/server";
import { createShipment, validateShipment, getShipmentLabel } from "@/lib/econt";

// Create a new shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Receiver info
      receiverName,
      receiverPhone,
      receiverEmail,

      // Delivery method
      deliveryMethod, // "office" | "address"
      officeCode,
      address, // { city, postCode, fullAddress }

      // Order info
      orderNumber,
      weight = 0.5,
      description,

      // Payment
      codAmount,
      declaredValue,

      // Mode
      validate = false, // Just validate, don't create
    } = body;

    // Validate required fields
    if (!receiverName || !receiverPhone || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required fields: receiverName, receiverPhone, orderNumber" },
        { status: 400 }
      );
    }

    if (deliveryMethod === "office" && !officeCode) {
      return NextResponse.json(
        { error: "Office code required for office delivery" },
        { status: 400 }
      );
    }

    if (deliveryMethod === "address" && (!address?.city || !address?.fullAddress)) {
      return NextResponse.json(
        { error: "Address with city and fullAddress required for address delivery" },
        { status: 400 }
      );
    }

    const params = {
      receiverName,
      receiverPhone,
      receiverEmail,
      deliveryMethod,
      officeCode,
      address,
      orderNumber,
      weight,
      description,
      codAmount,
      declaredValue,
    };

    // Validate only
    if (validate) {
      const validation = await validateShipment(params);
      return NextResponse.json(validation);
    }

    // Create shipment
    const result = await createShipment(params);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create shipment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shipmentNumber: result.shipmentNumber,
      pdfURL: result.pdfURL,
    });
  } catch (error) {
    console.error("Shipment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create shipment" },
      { status: 500 }
    );
  }
}

// Get shipment label PDF
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentNumber = searchParams.get("shipmentNumber");

    if (!shipmentNumber) {
      return NextResponse.json(
        { error: "Shipment number required" },
        { status: 400 }
      );
    }

    const pdfURL = await getShipmentLabel(shipmentNumber);

    if (!pdfURL) {
      return NextResponse.json(
        { error: "Label not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pdfURL });
  } catch (error) {
    console.error("Label fetch error:", error);
    return NextResponse.json(
      { error: "Failed to get label" },
      { status: 500 }
    );
  }
}
