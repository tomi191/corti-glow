import type { Order } from "@/lib/supabase/types";
import { getResendClient, EMAIL_FROM, SUPPORT_EMAIL, APP_URL } from "@/lib/resend/client";
import { OrderConfirmation } from "@/emails/order-confirmation";
import { ShippingNotification } from "@/emails/shipping-notification";
import { DeliveryConfirmation } from "@/emails/delivery-confirmation";
import { WaitlistWelcome } from "@/emails/waitlist-welcome";
import { ContactNotification } from "@/emails/contact-notification";
import { createElement } from "react";

// Check if email service is configured
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// Generic send email function (now uses Resend SDK)
async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  idempotencyKey,
}: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  idempotencyKey?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Email] RESEND_API_KEY is missing in production! Email not sent to:", to);
      return { success: false, error: "Email service not configured" };
    }
    console.log("[Email] Resend not configured (dev). Would send:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return { success: true };
  }

  try {
    // Build the email payload
    const emailPayload: Record<string, unknown> = {
      from: EMAIL_FROM,
      to,
      subject,
    };

    // Prefer React component over raw HTML
    if (react) {
      emailPayload.react = react;
    } else if (html) {
      emailPayload.html = html;
      if (text) emailPayload.text = text;
    }

    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await resend.emails.send(emailPayload as any, { headers });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", data?.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Waitlist welcome email (auto-sent on PWA signup)
export async function sendWaitlistWelcomeEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: email,
    subject: "✨ Добре дошла в LURA! Твоят PDF гайд е тук",
    react: createElement(WaitlistWelcome, {
      pdfUrl: `${APP_URL}/pdf/3-sutreshni-navika.pdf`,
      pwaUrl: `${APP_URL}/app`,
    }),
  });
}

// Contact form email
export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Контактна форма: ${name}`,
    react: createElement(ContactNotification, { name, email, message }),
  });
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  const items = order.items as Array<{
    title: string;
    price: number;
    quantity: number;
  }>;

  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Потвърждение`,
    react: createElement(OrderConfirmation, {
      orderNumber: order.order_number,
      createdAt: order.created_at,
      items,
      subtotal: order.subtotal,
      shippingPrice: order.shipping_price,
      discountAmount: order.discount_amount,
      total: order.total,
      econtTrackingNumber: order.econt_tracking_number,
      supportEmail: SUPPORT_EMAIL,
    }),
    // Prevent duplicate sends on webhook retries
    idempotencyKey: `order-confirmation-${order.id}`,
  });
}

// Shipping notification email
export async function sendShippingNotificationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Изпратена!`,
    react: createElement(ShippingNotification, {
      orderNumber: order.order_number,
      econtTrackingNumber: order.econt_tracking_number,
      supportEmail: SUPPORT_EMAIL,
    }),
  });
}

// Delivery confirmation email
export async function sendDeliveryConfirmationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Доставена!`,
    react: createElement(DeliveryConfirmation, {
      orderNumber: order.order_number,
      supportEmail: SUPPORT_EMAIL,
    }),
  });
}
