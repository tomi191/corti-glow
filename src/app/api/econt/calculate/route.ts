// Econt Shipping Calculation API

import { NextRequest, NextResponse } from "next/server";
import {
  calculateOfficeDelivery,
  calculateAddressDelivery,
  getEstimatedShippingPrices,
  isFreeShipping,
} from "@/lib/econt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      method, // "office" | "address"
      cityName,
      officeCode,
      address,
      weight = 0.5,
      subtotal = 0, // For free shipping calculation
      codAmount,
    } = body;

    // Check for free shipping
    if (isFreeShipping(subtotal)) {
      return NextResponse.json({
        price: 0,
        currency: "EUR",
        deliveryDays: method === "office" ? 1 : 2,
        method: method === "office" ? "econt_office" : "econt_address",
        freeShipping: true,
      });
    }

    // Calculate based on method
    if (method === "office" && officeCode) {
      const result = await calculateOfficeDelivery({
        receiverCity: cityName,
        receiverOfficeCode: officeCode,
        weight,
        codAmount,
      });

      if (!result) {
        // Return estimated price if API fails
        const estimates = getEstimatedShippingPrices();
        return NextResponse.json({
          ...estimates.office,
          deliveryDays: 1,
          method: "econt_office",
          estimated: true,
        });
      }

      return NextResponse.json(result);
    }

    if (method === "address" && cityName && address) {
      const result = await calculateAddressDelivery({
        receiverCity: cityName,
        receiverAddress: address,
        weight,
        codAmount,
      });

      if (!result) {
        const estimates = getEstimatedShippingPrices();
        return NextResponse.json({
          ...estimates.address,
          deliveryDays: 2,
          method: "econt_address",
          estimated: true,
        });
      }

      return NextResponse.json(result);
    }

    // Return estimated prices for display
    const estimates = getEstimatedShippingPrices();
    return NextResponse.json({
      estimates,
      freeThreshold: estimates.freeThreshold,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}
