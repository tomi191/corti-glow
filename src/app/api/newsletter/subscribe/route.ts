import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 5 attempts per 5 minutes
const limiter = createRateLimiter(5, 5 * 60 * 1000);

const subscribeSchema = z.object({
  email: z.string().email("Невалиден имейл адрес"),
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

    const validated = subscribeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл адрес." },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const supabase = createServerClient();

    // Upsert — re-subscribe if previously unsubscribed
    const { error } = await (supabase as any)
      .from("newsletter_subscribers")
      .upsert(
        {
          email: email.toLowerCase(),
          active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Newsletter subscribe error:", error);
      return NextResponse.json(
        { error: "Грешка при записване. Опитайте отново." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { error: "Грешка при записване." },
      { status: 500 }
    );
  }
}
