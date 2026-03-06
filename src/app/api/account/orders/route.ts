import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 5 lookups per minute per IP — prevents email enumeration
const limiter = createRateLimiter(5, 60 * 1000);

const accountOrdersSchema = z.object({
  email: z.string().email("Невалиден имейл").max(255),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много заявки. Опитайте отново след 1 минута." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const body = await request.json();
    const validated = accountOrdersSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Валиден имейл адрес е задължителен" },
        { status: 400 }
      );
    }

    const { email } = validated.data;

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
