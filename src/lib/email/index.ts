import type { Order } from "@/lib/supabase/types";

// Email configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "LURA <noreply@luralab.eu>";
const SUPPORT_EMAIL = process.env.EMAIL_SUPPORT || "support@luralab.eu";

// Check if email service is configured
export function isEmailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

// Generic send email function
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log("[Email] Resend not configured. Would send:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    return { success: true }; // Pretend success for dev
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send:", error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log("[Email] Sent successfully:", data.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2D4A3E;">Ново съобщение от контактната форма</h2>
      <p><strong>Име:</strong> ${name}</p>
      <p><strong>Имейл:</strong> ${email}</p>
      <p><strong>Съобщение:</strong></p>
      <div style="background: #F5F2EF; padding: 16px; border-radius: 8px;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    </div>
  `;

  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `Контактна форма: ${name}`,
    html,
    text: `Ново съобщение от ${name} (${email}):\n\n${message}`,
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

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D4A3E; margin: 0;">LURA</h1>
        <p style="color: #666; margin: 5px 0;">Благодарим за поръчката!</p>
      </div>

      <div style="background: #F5F2EF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #2D4A3E; margin: 0 0 16px;">Поръчка ${order.order_number}</h2>
        <p style="margin: 0; color: #666;">
          ${new Date(order.created_at).toLocaleDateString("bg-BG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #2D4A3E; color: white;">
            <th style="padding: 12px; text-align: left;">Продукт</th>
            <th style="padding: 12px; text-align: center;">Кол.</th>
            <th style="padding: 12px; text-align: right;">Цена</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Междинна сума:</span>
          <span>${order.subtotal.toFixed(2)} €</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Доставка:</span>
          <span>${order.shipping_price === 0 ? "Безплатна" : `${order.shipping_price.toFixed(2)} €`}</span>
        </div>
        ${order.discount_amount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #22c55e;">
          <span>Отстъпка:</span>
          <span>-${order.discount_amount.toFixed(2)} €</span>
        </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; padding-top: 12px; border-top: 2px solid #2D4A3E;">
          <span>Общо:</span>
          <span>${order.total.toFixed(2)} €</span>
        </div>
      </div>

      <div style="background: #B2D8C6; background: linear-gradient(135deg, #B2D8C6 0%, #2D4A3E 100%); color: white; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; font-size: 14px;">Проследи поръчката си:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu"}/prosledi-porachka"
           style="display: inline-block; background: white; color: #2D4A3E; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600;">
          Проследи Поръчката
        </a>
      </div>

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>Въпроси? Пиши ни на ${SUPPORT_EMAIL}</p>
        <p>© ${new Date().getFullYear()} LURA. Всички права запазени.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Благодарим за поръчката!

Поръчка: ${order.order_number}
Дата: ${new Date(order.created_at).toLocaleDateString("bg-BG")}

Продукти:
${items.map((item) => `- ${item.title} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)} €`).join("\n")}

Общо: ${order.total.toFixed(2)} €

Проследи поръчката: ${process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu"}/prosledi-porachka

Въпроси? Пиши ни на ${SUPPORT_EMAIL}
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Потвърждение`,
    html,
    text,
  });
}

// Shipping notification email
export async function sendShippingNotificationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  const trackingUrl = order.econt_tracking_number
    ? `https://www.econt.com/services/track-shipment/${order.econt_tracking_number}`
    : null;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D4A3E; margin: 0;">LURA</h1>
        <p style="color: #666; margin: 5px 0;">Поръчката ти е на път!</p>
      </div>

      <div style="background: #B2D8C6; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
        <h2 style="color: #2D4A3E; margin: 0 0 8px;">Изпратено!</h2>
        <p style="margin: 0; color: #2D4A3E;">Поръчка ${order.order_number}</p>
      </div>

      ${trackingUrl ? `
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${trackingUrl}"
           style="display: inline-block; background: #2D4A3E; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600;">
          Проследи в Еконт
        </a>
        ${order.econt_tracking_number ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;">Номер: ${order.econt_tracking_number}</p>` : ""}
      </div>
      ` : ""}

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>Въпроси? Пиши ни на ${SUPPORT_EMAIL}</p>
        <p>© ${new Date().getFullYear()} LURA. Всички права запазени.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Изпратена!`,
    html,
  });
}

// Delivery confirmation email
export async function sendDeliveryConfirmationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2D4A3E; margin: 0;">LURA</h1>
      </div>

      <div style="background: linear-gradient(135deg, #B2D8C6 0%, #FFC1CC 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 12px;">✨</div>
        <h2 style="color: #2D4A3E; margin: 0 0 8px;">Доставено!</h2>
        <p style="margin: 0; color: #2D4A3E;">Надяваме се да ти хареса!</p>
      </div>

      <div style="background: #F5F2EF; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #2D4A3E; margin: 0 0 12px;">Как да използваш Corti-Glow:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #666;">
          <li style="margin-bottom: 8px;">Изсипи едно саше в 250мл студена вода</li>
          <li style="margin-bottom: 8px;">Разбъркай добре и добави лед</li>
          <li>Отпивай бавно и се наслади на момента</li>
        </ol>
      </div>

      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>Въпроси? Пиши ни на ${SUPPORT_EMAIL}</p>
        <p>© ${new Date().getFullYear()} LURA. Всички права запазени.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.customer_email,
    subject: `Поръчка ${order.order_number} - Доставена!`,
    html,
  });
}
