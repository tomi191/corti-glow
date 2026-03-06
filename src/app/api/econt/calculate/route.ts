// Econt Shipping Calculation API

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  calculateOfficeDelivery,
  calculateAddressDelivery,
  getEstimatedShippingPrices,
  isFreeShipping,
} from "@/lib/econt";

const calculateSchema = z.object({
  method: z.enum(["office", "address"]).optional(),
  cityName: z.string().max(100).optional(),
  officeCode: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  weight: z.number().positive().max(50).optional().default(0.5),
  subtotal: z.number().min(0).optional().default(0),
  codAmount: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = calculateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const {
      method,
      cityName,
      officeCode,
      address,
      weight,
      subtotal,
      codAmount,
    } = parsed.data;

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
        receiverCity: cityName || "",
        receiverOfficeCode: officeCode,
        weight,
        codAmount,
      });

      if (!result) {
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
