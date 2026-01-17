// Econt Shipment Creation and Tracking Service

import { getEcontClient } from "./client";
import type {
  EcontShippingLabel,
  EcontTrackingResponse,
  EcontTrackingEvent,
} from "./types";

// LuraLab sender info (update with real data)
const SENDER_INFO = {
  name: process.env.ECONT_SENDER_NAME || "LuraLab EOOD",
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
      // Sender
      senderClient: {
        name: SENDER_INFO.name,
        phones: [SENDER_INFO.phone],
        email: SENDER_INFO.email,
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

      // Services
      ...(params.codAmount && {
        services: {
          cdAmount: params.codAmount,
          cdType: "GET" as const,
          cdCurrency: "EUR",
          cdPayOptionsToReceiver: "CASH" as const,
        },
      }),
      ...(params.declaredValue && {
        services: {
          declaredValueAmount: params.declaredValue,
          declaredValueCurrency: "EUR",
        },
      }),

      // Payment - sender pays shipping for card payments, receiver for COD
      paymentReceiverMethod: params.codAmount ? "CASH" : undefined,
      paymentSenderMethod: params.codAmount ? undefined : "CONTRACT",
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
        name: SENDER_INFO.name,
        phones: [SENDER_INFO.phone],
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

interface TrackingResponse {
  shipments: Array<{
    shipmentNumber: string;
    status: {
      status: string;
      statusDescription: string;
    };
    trackingEvents: Array<{
      eventTime: string;
      eventDescription: string;
      eventDetails?: string;
      officeName?: string;
    }>;
    deliveryDate?: string;
    expectedDeliveryDate?: string;
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

  if (response.error || !response.data?.shipments?.[0]) {
    console.error("Failed to track shipment:", response.error);
    return null;
  }

  const shipment = response.data.shipments[0];

  const events: EcontTrackingEvent[] = (shipment.trackingEvents || []).map(
    (event) => ({
      time: event.eventTime,
      event: event.eventDescription,
      details: event.eventDetails || "",
      office: event.officeName,
    })
  );

  return {
    shipmentNumber: shipment.shipmentNumber,
    status: shipment.status?.statusDescription || "Unknown",
    events,
    deliveredDate: shipment.deliveryDate,
    expectedDeliveryDate: shipment.expectedDeliveryDate,
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
