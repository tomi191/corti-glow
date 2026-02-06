import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createPaymentIntent } from "@/lib/stripe/actions";
import { createOrder, updateOrder, checkStock, deductStock } from "@/lib/actions/orders";
import { z } from "zod";
import type { CartItem } from "@/types";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendOrderConfirmationEmail } from "@/lib/email";

// 10 attempts per 5 minutes
const limiter = createRateLimiter(10, 5 * 60 * 1000);

const paymentSchema = z.object({
  customerFirstName: z.string().min(2).max(50),
  customerLastName: z.string().min(2).max(50),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^(\+359|0)[0-9]{9}$/, "Невалиден телефон"),
  shippingMethod: z.enum(["econt_office", "econt_address"]),
  shippingAddress: z.object({}).passthrough(),
  shippingPrice: z.number().nonnegative(),
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.number().int().positive().max(20),
    price: z.number().optional(),
    title: z.string().optional(),
  })).min(1),
  paymentMethod: z.enum(["card", "cod"]),
  currency: z.enum(["EUR", "BGN"]).default("EUR"),
  discountCode: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Опитайте отново по-късно." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const body = await request.json();

    // 1. Validate with Zod
    const validated = paymentSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Невалидни данни", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      shippingMethod,
      shippingAddress,
      shippingPrice: clientShippingPrice,
      items: clientItems,
      currency,
      paymentMethod,
      discountCode,
    } = validated.data;

    // 2. Server-side Price Verification
    const supabase = createServerClient();
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of clientItems as CartItem[]) {
      // Fetch product to get real price
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId)
        .single();

      if (!data) {
        return NextResponse.json(
          { error: "Невалиден продукт в количката" },
          { status: 400 }
        );
      }

      const product = data as any; // Cast to any to avoid complex Json typing issues for now

      // Find the variant to get the specific price
      // Casting JSONB to ProductVariant[] (rough mapping)
      const variants = product.variants || [];
      const variant = variants.find((v: any) => v.id === item.variantId);

      if (!variant) {
        return NextResponse.json(
          { error: "Невалиден вариант в количката" },
          { status: 400 }
        );
      }

      const price = Number(variant.price);
      calculatedSubtotal += price * item.quantity;

      verifiedItems.push({
        ...item,
        price: price, // Enforce server price
        title: `${product.name} (${variant.name})`,
      });
    }

    // 2b. Stock Verification
    const stockItems = verifiedItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const stockCheck = await checkStock(stockItems);
    if (!stockCheck.available) {
      const outOfStock = stockCheck.insufficientItems.map(i =>
        `Наличност: ${i.available}, поръчани: ${i.requested}`
      ).join(", ");
      return NextResponse.json(
        { error: `Недостатъчна наличност. ${outOfStock}` },
        { status: 400 }
      );
    }

    // 3. Shipping Validation (Simple Rule: > 160 BGN = Free)
    // Note: Assuming currency is BGN for calculation logic parity with constants
    // If currency is EUR, we might need conversion or logic adjustment.
    // For now taking clientShippingPrice but ideally re-calculate.
    // Let's re-calculate simple threshold rule:
    const SHIPPING_THRESHOLD = 160;
    const isFreeShipping = calculatedSubtotal >= SHIPPING_THRESHOLD;
    const verifiedShippingPrice = isFreeShipping ? 0 : Number(clientShippingPrice);

    // 3b. Discount Validation (server-side re-validation)
    let verifiedDiscountCode: string | null = null;
    let verifiedDiscountAmount = 0;

    if (discountCode) {
      const { data: discount, error: discountError } = await (supabase as any)
        .from("discounts")
        .select("*")
        .eq("code", discountCode.toUpperCase())
        .single();

      if (!discountError && discount && discount.active) {
        const now = new Date();
        const isValid =
          (!discount.start_date || new Date(discount.start_date) <= now) &&
          (!discount.end_date || new Date(discount.end_date) >= now) &&
          (!discount.max_uses || discount.used_count < discount.max_uses) &&
          (!discount.min_order_value || calculatedSubtotal >= discount.min_order_value);

        if (isValid) {
          verifiedDiscountCode = discount.code;
          verifiedDiscountAmount =
            discount.type === "percentage"
              ? calculatedSubtotal * (discount.value / 100)
              : Math.min(discount.value, calculatedSubtotal);
        }
      }
      // If discount is invalid, silently ignore — don't block the order
    }

    const calculatedTotal = calculatedSubtotal + verifiedShippingPrice - verifiedDiscountAmount;

    // 4. Create Pending Order
    const { order, error: orderError } = await createOrder({
      customer_first_name: customerFirstName,
      customer_last_name: customerLastName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_method: shippingMethod,
      shipping_address: shippingAddress as Record<string, string>,
      shipping_price: verifiedShippingPrice,
      payment_method: paymentMethod,
      payment_status: "pending",
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      discount_code: verifiedDiscountCode,
      discount_amount: verifiedDiscountAmount,
      total: calculatedTotal,
      currency: currency,
      status: "new"
    });

    if (orderError || !order) {
      console.error("Failed to create order:", orderError);
      return NextResponse.json(
        { error: "Грешка при създаване на поръчката" },
        { status: 500 }
      );
    }

    // 5. Handle Payment Method
    if (paymentMethod === "cod") {
      // Deduct stock immediately for COD orders
      await deductStock(stockItems);

      // Increment discount used_count
      if (verifiedDiscountCode) {
        const { data: disc } = await (supabase as any)
          .from("discounts")
          .select("used_count")
          .eq("code", verifiedDiscountCode)
          .single();
        if (disc) {
          await (supabase as any)
            .from("discounts")
            .update({ used_count: disc.used_count + 1 })
            .eq("code", verifiedDiscountCode);
        }
      }

      // Send confirmation email (fire-and-forget)
      sendOrderConfirmationEmail(order).catch(err =>
        console.error("Failed to send COD confirmation email:", err)
      );

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        paymentMethod: "cod",
      });
    }

    // 6. Create Stripe Payment Intent (for Card)
    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      amount: calculatedTotal,
      currency: currency,
      customerEmail: customerEmail,
      customerName: `${customerFirstName} ${customerLastName}`,
      orderId: order.id,
      description: `Order ${order.order_number}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number
      }
    });

    // 7. Update Order with Payment Intent
    await updateOrder(order.id, {
      stripe_payment_intent_id: paymentIntentId
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      clientSecret,
      paymentIntentId,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Грешка при обработка на плащането" },
      { status: 500 }
    );
  }
}
