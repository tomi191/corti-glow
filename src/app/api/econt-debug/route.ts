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
    // 1. Check env vars (show actual API URL to debug routing issues)
    const envCheck = {
      ECONT_API_URL: process.env.ECONT_API_URL || "(missing)",
      ECONT_USERNAME: process.env.ECONT_USERNAME ? `${process.env.ECONT_USERNAME.slice(0, 5)}...` : "(missing)",
      ECONT_PASSWORD: !!process.env.ECONT_PASSWORD,
      ECONT_CONNECTION_CODE: !!process.env.ECONT_CONNECTION_CODE,
      ECONT_SENDER_OFFICE: process.env.ECONT_SENDER_OFFICE || "(default: 1127)",
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

    // 5. Call Econt API via our client
    const client = getEcontClient();
    const clientResponse = await client.request(
      "Shipments/LabelService.createLabel.json",
      fullBody
    );

    // 6. Also do a RAW fetch for comparison (bypass our client)
    const apiUrl = process.env.ECONT_API_URL || "";
    const baseUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
    const rawUrl = `${baseUrl}Shipments/LabelService.createLabel.json`;
    const creds = Buffer.from(
      `${process.env.ECONT_USERNAME}:${process.env.ECONT_PASSWORD}`
    ).toString("base64");

    let rawResponse: { status: number; body: unknown } | { error: string };
    try {
      const rawResp = await fetch(rawUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${creds}`,
        },
        body: JSON.stringify(fullBody),
      });
      const rawBody = await rawResp.json().catch(() => null);
      rawResponse = { status: rawResp.status, body: rawBody };
    } catch (e) {
      rawResponse = { error: e instanceof Error ? e.message : String(e) };
    }

    return NextResponse.json({
      envCheck,
      orderNumber: order.order_number,
      shipmentParams: params,
      mode: doCreate ? "create" : "validate",
      fullRequestBody: fullBody,
      clientResponse,
      rawFetch: { url: rawUrl, response: rawResponse },
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }, { status: 500 });
  }
}
