// Diagnostic endpoint — test Econt shipment creation
// DELETE this after debugging is complete

import { NextResponse } from "next/server";
import { buildShipmentParamsFromOrder } from "@/lib/econt/shipments";
import { getEcontClient } from "@/lib/econt/client";
import { getOrderByNumber } from "@/lib/actions/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order") || "LL-1004";
  const doCreate = searchParams.get("create") === "1"; // ?create=1 to actually create

  try {
    // 1. Check env vars
    const envCheck = {
      ECONT_API_URL: !!process.env.ECONT_API_URL,
      ECONT_USERNAME: !!process.env.ECONT_USERNAME,
      ECONT_PASSWORD: !!process.env.ECONT_PASSWORD,
      ECONT_CONNECTION_CODE: !!process.env.ECONT_CONNECTION_CODE,
      ECONT_SENDER_OFFICE: process.env.ECONT_SENDER_OFFICE || "(default: 1127)",
      VERCEL_REGION: process.env.VERCEL_REGION || "unknown",
    };

    // 2. Fetch order
    const { order, error: orderError } = await getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found", orderError, envCheck }, { status: 404 });
    }

    // 3. Build shipment params (same as webhook)
    const params = buildShipmentParamsFromOrder(order);

    // 4. Build the FULL request body (identical to createShipment function)
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
          clientObject: {
            name: senderInfo.companyName,
          },
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
                city: {
                  country: { code3: "BGR" },
                  name: params.address?.city,
                  postCode: params.address?.postCode,
                },
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
            ...(params.codAmount && {
              cdAmount: params.codAmount,
              cdType: "GET",
              cdCurrency: "EUR",
              cdPayOptionsToReceiver: "CASH",
            }),
            ...(params.declaredValue && {
              declaredValueAmount: params.declaredValue,
              declaredValueCurrency: "EUR",
            }),
          },
        }),
        paymentSenderMethod: "CONTRACT",
      },
      mode: doCreate ? "create" : "validate",
    };

    // 5. Call Econt API directly with full body
    const client = getEcontClient();
    const response = await client.request(
      "Shipments/LabelService.createLabel.json",
      fullBody
    );

    return NextResponse.json({
      envCheck,
      orderNumber: order.order_number,
      shipmentParams: params,
      mode: doCreate ? "create" : "validate",
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
