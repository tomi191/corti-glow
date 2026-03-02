// Diagnostic endpoint — test Econt shipment creation
// DELETE this after debugging is complete

// Test EU region to see if tariff issue is region-dependent
export const preferredRegion = "fra1";

import { NextResponse } from "next/server";
import { buildShipmentParamsFromOrder } from "@/lib/econt/shipments";
import { getEcontClient } from "@/lib/econt/client";
import { getOrderByNumber } from "@/lib/actions/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order") || "LL-1004";

  try {
    // 1. Check env vars
    const envCheck = {
      ECONT_API_URL: process.env.ECONT_API_URL ? "set" : "missing",
      ECONT_USERNAME: process.env.ECONT_USERNAME ? "set" : "missing",
      ECONT_PASSWORD: process.env.ECONT_PASSWORD ? "set" : "missing",
      VERCEL_REGION: process.env.VERCEL_REGION || "unknown",
    };

    // 2. Fetch order
    const { order, error: orderError } = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found", orderError, envCheck }, { status: 404 });
    }

    // 3. Build shipment params (same as webhook)
    const params = buildShipmentParamsFromOrder(order);

    // 4. Build FULL request body (identical to createShipment in shipments.ts)
    const senderInfo = {
      personName: process.env.ECONT_SENDER_PERSON || "Служител",
      companyName: process.env.ECONT_SENDER_COMPANY || "Лура Лаб ЕООД",
      phone: process.env.ECONT_SENDER_PHONE || "+359888123456",
      email: process.env.ECONT_SENDER_EMAIL || "orders@luralab.eu",
      officeCode: process.env.ECONT_SENDER_OFFICE || "1127",
    };

    const fullBody = {
      label: {
        senderClient: {
          name: senderInfo.personName,
          phones: [senderInfo.phone],
          email: senderInfo.email,
          clientObject: { name: senderInfo.companyName },
        },
        senderOfficeCode: senderInfo.officeCode,
        receiverClient: {
          name: params.receiverName,
          phones: [params.receiverPhone],
          ...(params.receiverEmail && { email: params.receiverEmail }),
        },
        ...(params.deliveryMethod === "office"
          ? { receiverOfficeCode: params.officeCode }
          : {
              receiverAddress: {
                city: { country: { code3: "BGR" }, name: params.address?.city, postCode: params.address?.postCode },
                fullAddress: params.address?.fullAddress,
              },
            }),
        packCount: 1,
        shipmentType: "PACK",
        weight: params.weight || 0.5,
        shipmentDescription: params.description || "Хранителни добавки",
        orderNumber: params.orderNumber,
        ...((params.codAmount || params.declaredValue) && {
          services: {
            ...(params.codAmount && { cdAmount: params.codAmount, cdType: "GET", cdCurrency: "EUR", cdPayOptionsToReceiver: "CASH" }),
            ...(params.declaredValue && { declaredValueAmount: params.declaredValue, declaredValueCurrency: "EUR" }),
          },
        }),
        paymentSenderMethod: "CONTRACT",
      },
      mode: "validate",
    };

    // 5. Call Econt API with full body (via our client)
    const client = getEcontClient();
    const response = await client.request(
      "Shipments/LabelService.createLabel.json",
      fullBody
    );

    return NextResponse.json({
      envCheck,
      orderNumber: order.order_number,
      shipmentParams: params,
      fullRequestBody: fullBody,
      econtResponse: response,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
