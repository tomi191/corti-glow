// Econt Shipping Calculation Service

import { getEcontClient } from "./client";
import type { EcontCalculateResponse, ShippingCalculation } from "./types";

// LuraLab sender office in Sofia (update with real office code)
const SENDER_OFFICE_CODE = process.env.ECONT_SENDER_OFFICE || "1127";
const SENDER_CITY = "София";

export interface CalculateShippingParams {
  receiverCity: string;
  receiverOfficeCode?: string; // If delivery to office
  receiverAddress?: string; // If delivery to address
  weight?: number; // Default 0.5kg for supplements
  codAmount?: number; // Cash on delivery amount
  declaredValue?: number; // Insurance value
}

// Calculate shipping price for office delivery
export async function calculateOfficeDelivery(
  params: CalculateShippingParams
): Promise<ShippingCalculation | null> {
  const client = getEcontClient();

  const requestBody = {
    label: {
      senderOfficeCode: SENDER_OFFICE_CODE,
      receiverOfficeCode: params.receiverOfficeCode,
      packCount: 1,
      shipmentType: "PACK" as const,
      weight: params.weight || 0.5,
      ...(params.codAmount && {
        services: {
          cdAmount: params.codAmount,
          cdType: "GET" as const,
          cdCurrency: "EUR",
        },
      }),
    },
    mode: "calculate" as const,
  };

  const response = await client.request<EcontCalculateResponse>(
    "Shipments/LabelService.createLabel.json",
    requestBody
  );

  if (response.error || !response.data) {
    console.error("Failed to calculate shipping:", response.error);
    return null;
  }

  return {
    price: response.data.label.totalPrice,
    currency: response.data.label.currency || "EUR",
    deliveryDays: 1, // Econt typically delivers in 1-2 days
    method: "econt_office",
  };
}

// Calculate shipping price for address delivery
export async function calculateAddressDelivery(
  params: CalculateShippingParams
): Promise<ShippingCalculation | null> {
  const client = getEcontClient();

  const requestBody = {
    label: {
      senderOfficeCode: SENDER_OFFICE_CODE,
      receiverAddress: {
        city: {
          country: {
            code3: "BGR",
          },
          name: params.receiverCity,
        },
        fullAddress: params.receiverAddress || "",
      },
      packCount: 1,
      shipmentType: "PACK" as const,
      weight: params.weight || 0.5,
      ...(params.codAmount && {
        services: {
          cdAmount: params.codAmount,
          cdType: "GET" as const,
          cdCurrency: "EUR",
        },
      }),
    },
    mode: "calculate" as const,
  };

  const response = await client.request<EcontCalculateResponse>(
    "Shipments/LabelService.createLabel.json",
    requestBody
  );

  if (response.error || !response.data) {
    console.error("Failed to calculate address shipping:", response.error);
    return null;
  }

  return {
    price: response.data.label.totalPrice,
    currency: response.data.label.currency || "EUR",
    deliveryDays: 2, // Address delivery might take slightly longer
    method: "econt_address",
  };
}

// Get estimated shipping prices (without calling API - for display)
export function getEstimatedShippingPrices(): {
  office: { price: number; currency: string };
  address: { price: number; currency: string };
  freeThreshold: number;
} {
  return {
    office: { price: 4.99, currency: "EUR" },
    address: { price: 6.99, currency: "EUR" },
    freeThreshold: 80, // Free shipping over 80 EUR
  };
}

// Check if order qualifies for free shipping
export function isFreeShipping(subtotal: number): boolean {
  const { freeThreshold } = getEstimatedShippingPrices();
  return subtotal >= freeThreshold;
}

// Get shipping price based on method and subtotal
export function getShippingPrice(
  method: "econt_office" | "econt_address",
  subtotal: number
): number {
  if (isFreeShipping(subtotal)) {
    return 0;
  }

  const prices = getEstimatedShippingPrices();
  return method === "econt_office" ? prices.office.price : prices.address.price;
}
