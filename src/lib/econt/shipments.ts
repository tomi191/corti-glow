// Econt Shipment Creation and Tracking Service

import { getEcontClient } from "./client";
import type {
  EcontShippingLabel,
  EcontTrackingResponse,
  EcontTrackingEvent,
} from "./types";
import type { Order } from "@/lib/supabase/types";

// LuraLab sender info (update with real data)
const SENDER_INFO = {
  personName: process.env.ECONT_SENDER_PERSON || "Служител",
  companyName: process.env.ECONT_SENDER_COMPANY || "Лура Лаб ЕООД",
  phone: process.env.ECONT_SENDER_PHONE || "+359888123456",
  email: process.env.ECONT_SENDER_EMAIL || "orders@luralab.eu",
  officeCode: process.env.ECONT_SENDER_OFFICE || "1127",
};

export interface CreateShipmentParams {
  // Receiver info
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;

  // Delivery method
  deliveryMethod: "office" | "address";
  officeCode?: string; // If office delivery
  address?: {
    city: string;
    postCode?: string;
    fullAddress: string;
  };

  // Package info
  weight?: number;
  description?: string;
  orderNumber: string;

  // Payment
  codAmount?: number; // Cash on delivery
  declaredValue?: number;
}

interface LabelResponse {
  label: {
    shipmentNumber: string;
    pdfURL?: string;
  };
}

// Create a shipment and get label
export async function createShipment(
  params: CreateShipmentParams
): Promise<EcontShippingLabel | null> {
  const client = getEcontClient();

  const requestBody = {
    label: {
      // Sender (legal entity with authorized person)
      senderClient: {
        name: SENDER_INFO.personName,
        phones: [SENDER_INFO.phone],
        email: SENDER_INFO.email,
        clientObject: {
          name: SENDER_INFO.companyName,
        },
      },
      senderOfficeCode: SENDER_INFO.officeCode,

      // Receiver
      receiverClient: {
        name: params.receiverName,
        phones: [params.receiverPhone],
        ...(params.receiverEmail && { email: params.receiverEmail }),
      },

      // Delivery location
      ...(params.deliveryMethod === "office"
        ? {
            receiverOfficeCode: params.officeCode,
          }
        : {
            receiverAddress: {
              city: {
                country: { code3: "BGR" },
                name: params.address?.city,
                postCode: params.address?.postCode,
              },
              fullAddress: params.address?.fullAddress,
            },
          }),

      // Package
      packCount: 1,
      shipmentType: "PACK" as const,
      weight: params.weight || 0.5,
      shipmentDescription: params.description || "Хранителни добавки",
      orderNumber: params.orderNumber,

      // Services (merged to avoid overwrite)
      ...((params.codAmount || params.declaredValue) && {
        services: {
          ...(params.codAmount && {
            cdAmount: params.codAmount,
            cdType: "GET" as const,
            cdCurrency: "EUR",
            cdPayOptionsToReceiver: "CASH" as const,
          }),
          ...(params.declaredValue && {
            declaredValueAmount: params.declaredValue,
            declaredValueCurrency: "EUR",
          }),
        },
      }),

      // Payment - sender ALWAYS pays Econt transport fee via contract
      // Customer pays only the COD amount (which includes our shipping markup)
      paymentSenderMethod: "CONTRACT",
    },
    mode: "create" as const,
  };

  const response = await client.request<LabelResponse>(
    "Shipments/LabelService.createLabel.json",
    requestBody
  );

  if (response.error || !response.data) {
    console.error("Failed to create shipment:", response.error);
    return null;
  }

  return {
    shipmentNumber: response.data.label.shipmentNumber,
    pdfURL: response.data.label.pdfURL || "",
  };
}

// Validate shipment data without creating
export async function validateShipment(
  params: CreateShipmentParams
): Promise<{ valid: boolean; errors?: string[] }> {
  const client = getEcontClient();

  const requestBody = {
    label: {
      senderClient: {
        name: SENDER_INFO.personName,
        phones: [SENDER_INFO.phone],
        clientObject: {
          name: SENDER_INFO.companyName,
        },
      },
      senderOfficeCode: SENDER_INFO.officeCode,
      receiverClient: {
        name: params.receiverName,
        phones: [params.receiverPhone],
      },
      ...(params.deliveryMethod === "office"
        ? { receiverOfficeCode: params.officeCode }
        : {
            receiverAddress: {
              city: {
                country: { code3: "BGR" },
                name: params.address?.city,
              },
              fullAddress: params.address?.fullAddress,
            },
          }),
      packCount: 1,
      shipmentType: "PACK" as const,
      weight: params.weight || 0.5,
      shipmentDescription: params.description || "Хранителни добавки",
    },
    mode: "validate" as const,
  };

  const response = await client.request<LabelResponse>(
    "Shipments/LabelService.createLabel.json",
    requestBody
  );

  if (response.error) {
    return {
      valid: false,
      errors: [response.error],
    };
  }

  return { valid: true };
}

// Actual Econt API response structure for getShipmentStatuses
interface TrackingResponse {
  shipmentStatuses: Array<{
    status: {
      shipmentNumber: string;
      shortDeliveryStatus: string;
      trackingEvents: Array<{
        time: number; // millisecond timestamp
        destinationDetails: string;
        destinationType: string;
        officeName: string | null;
        cityName: string | null;
      }>;
      deliveryTime: number | null; // millisecond timestamp
      expectedDeliveryDate: number | null; // millisecond timestamp
    };
    error: string | null;
  }>;
}

// Track a shipment
export async function trackShipment(
  shipmentNumber: string
): Promise<EcontTrackingResponse | null> {
  const client = getEcontClient();

  const response = await client.trackShipment<TrackingResponse>([
    shipmentNumber,
  ]);

  const shipmentStatus = response.data?.shipmentStatuses?.[0];
  if (response.error || !shipmentStatus?.status) {
    console.error("Failed to track shipment:", response.error);
    return null;
  }

  const s = shipmentStatus.status;

  const events: EcontTrackingEvent[] = (s.trackingEvents || []).map(
    (event) => ({
      time: new Date(event.time).toISOString(),
      event: event.destinationDetails,
      details: event.destinationType || "",
      office: event.officeName || event.cityName || undefined,
    })
  );

  return {
    shipmentNumber: s.shipmentNumber,
    status: s.shortDeliveryStatus || "Unknown",
    events,
    deliveredDate: s.deliveryTime
      ? new Date(s.deliveryTime).toISOString()
      : undefined,
    expectedDeliveryDate: s.expectedDeliveryDate
      ? new Date(s.expectedDeliveryDate).toISOString()
      : undefined,
  };
}

// Get printable label PDF URL
export async function getShipmentLabel(
  shipmentNumber: string
): Promise<string | null> {
  const client = getEcontClient();

  const response = await client.request<{ pdfURL: string }>(
    "Shipments/LabelService.getLabel.json",
    {
      shipmentNumber,
      mode: "pdf",
    }
  );

  if (response.error || !response.data) {
    return null;
  }

  return response.data.pdfURL;
}

// Cancel a shipment (if not yet shipped)
export async function cancelShipment(
  shipmentNumber: string
): Promise<boolean> {
  const client = getEcontClient();

  const response = await client.request(
    "Shipments/LabelService.deleteLabel.json",
    {
      shipmentNumber,
    }
  );

  return !response.error;
}

// Sync order to "Deliver with Econt" dashboard (delivery.econt.com)
// Uses the connection code (ECONT_CONNECTION_CODE env var)
export async function syncOrderToDelivery(params: {
  orderNumber: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  deliveryMethod: "office" | "address";
  officeCode?: string;
  address?: { city: string; postCode?: string; fullAddress: string };
  codAmount?: number;
  shipmentNumber?: string;
}): Promise<boolean> {
  const connectionCode = process.env.ECONT_CONNECTION_CODE;
  if (!connectionCode) {
    console.log("[Econt Delivery] No ECONT_CONNECTION_CODE, skipping sync");
    return false;
  }

  const deliveryUrl = (process.env.ECONT_API_URL || "")
    .replace("ee.econt.com", "delivery.econt.com");
  const baseUrl = deliveryUrl || "https://delivery.econt.com/services/";

  try {
    const orderData: Record<string, unknown> = {
      id: params.orderNumber,
      shipmentNumber: params.shipmentNumber || undefined,
      receiverClient: {
        name: params.receiverName,
        phones: [params.receiverPhone],
        ...(params.receiverEmail && { email: params.receiverEmail }),
      },
      ...(params.deliveryMethod === "office"
        ? { receiverOfficeCode: params.officeCode }
        : {
            receiverAddress: {
              city: {
                country: { code3: "BGR" },
                name: params.address?.city,
                postCode: params.address?.postCode,
              },
              fullAddress: params.address?.fullAddress,
            },
          }),
      ...(params.codAmount && {
        services: {
          cdAmount: params.codAmount,
          cdType: "GET",
          cdCurrency: "EUR",
        },
      }),
    };

    const response = await fetch(
      `${baseUrl}OrdersService.updateOrder.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: connectionCode,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("[Econt Delivery] Sync failed:", text);
      return false;
    }

    console.log("[Econt Delivery] Order synced:", params.orderNumber);
    return true;
  } catch (error) {
    console.error("[Econt Delivery] Sync error:", error);
    return false;
  }
}

// Build CreateShipmentParams from an Order object
// Used for auto-creating shipments on order creation
export function buildShipmentParamsFromOrder(order: Order): CreateShipmentParams {
  const addr = order.shipping_address as Record<string, string>;
  const isOffice = order.shipping_method === "econt_office";

  return {
    receiverName: `${order.customer_first_name} ${order.customer_last_name}`,
    receiverPhone: order.customer_phone,
    receiverEmail: order.customer_email,
    deliveryMethod: isOffice ? "office" : "address",
    officeCode: isOffice ? addr?.officeCode : undefined,
    address: !isOffice
      ? {
          city: addr?.city || "",
          postCode: addr?.postCode,
          fullAddress: addr?.fullAddress || "",
        }
      : undefined,
    orderNumber: order.order_number,
    codAmount: order.payment_method === "cod" ? order.total : undefined,
    declaredValue: order.total,
  };
}
