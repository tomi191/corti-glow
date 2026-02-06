import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = await request.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Номер на поръчка и имейл са задължителни" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        order_number,
        created_at,
        status,
        payment_status,
        payment_method,
        shipping_method,
        shipping_address,
        items,
        subtotal,
        shipping_price,
        discount_amount,
        total,
        econt_tracking_number,
        shipped_at,
        delivered_at,
        estimated_delivery_date,
        customer_first_name,
        customer_last_name
      `
      )
      .eq("order_number", orderNumber.toUpperCase())
      .eq("customer_email", email.toLowerCase())
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: "Поръчката не е намерена. Проверете номера и имейла." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      { error: "Грешка при търсене на поръчката" },
      { status: 500 }
    );
  }
}
