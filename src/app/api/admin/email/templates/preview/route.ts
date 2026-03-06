import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createElement } from "react";
import { OrderConfirmation } from "@/emails/order-confirmation";
import { ShippingNotification } from "@/emails/shipping-notification";
import { DeliveryConfirmation } from "@/emails/delivery-confirmation";
import { WaitlistWelcome } from "@/emails/waitlist-welcome";
import { Welcome } from "@/emails/welcome";
import { ContactNotification } from "@/emails/contact-notification";
import { DripDay0 } from "@/emails/drip-day0";
import { DripDay2 } from "@/emails/drip-day2";
import { DripDay5 } from "@/emails/drip-day5";

// Sample data for template previews
const sampleProps: Record<string, object> = {
  "order-confirmation": {
    orderNumber: "LR-20260305-0001",
    createdAt: new Date().toISOString(),
    items: [
      { title: "Corti-Glow — Starter Box (30 саше)", price: 49.99, quantity: 1 },
    ],
    subtotal: 49.99,
    shippingPrice: 5.99,
    discountAmount: 0,
    total: 55.98,
    econtTrackingNumber: "1234567890",
  },
  "shipping-notification": {
    orderNumber: "LR-20260305-0001",
    econtTrackingNumber: "1234567890",
  },
  "delivery-confirmation": {
    orderNumber: "LR-20260305-0001",
  },
  "waitlist-welcome": {
    pdfUrl: "https://luralab.eu/pdf/3-sutreshni-navika.pdf",
    pwaUrl: "https://luralab.eu/app",
  },
  welcome: {
    shopUrl: "https://luralab.eu/magazin",
  },
  "contact-notification": {
    name: "Елена Георгиева",
    email: "elena@example.com",
    message: "Здравейте, кога ще пуснете нов вкус?",
  },
  "drip-day0": { firstName: "Елена" },
  "drip-day2": { firstName: "Елена" },
  "drip-day5": { firstName: "Елена" },
};

const componentMap: Record<string, React.ComponentType<any>> = {
  "order-confirmation": OrderConfirmation,
  "shipping-notification": ShippingNotification,
  "delivery-confirmation": DeliveryConfirmation,
  "waitlist-welcome": WaitlistWelcome,
  welcome: Welcome,
  "contact-notification": ContactNotification,
  "drip-day0": DripDay0,
  "drip-day2": DripDay2,
  "drip-day5": DripDay5,
};

export async function POST(request: NextRequest) {
  try {
    const { templateId } = await request.json();

    const Component = componentMap[templateId];
    if (!Component) {
      return NextResponse.json(
        { error: `Unknown template: ${templateId}` },
        { status: 400 }
      );
    }

    const props = sampleProps[templateId] || {};
    const html = await render(createElement(Component, props));

    return NextResponse.json({ html, templateId });
  } catch (err) {
    console.error("[Admin Email] Preview error:", err);
    return NextResponse.json(
      { error: "Failed to render preview" },
      { status: 500 }
    );
  }
}
