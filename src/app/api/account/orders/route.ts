import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Имейл адресът е задължителен" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        order_number,
        created_at,
        status,
        payment_status,
        payment_method,
        items,
        total,
        econt_tracking_number
      `
      )
      .eq("customer_email", email.toLowerCase())
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на поръчките" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Error in account orders:", error);
    return NextResponse.json(
      { error: "Грешка при обработка на заявката" },
      { status: 500 }
    );
  }
}
