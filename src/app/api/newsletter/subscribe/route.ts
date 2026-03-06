import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { sendWaitlistWelcomeEmail } from "@/lib/email";
import { addContact } from "@/lib/resend/audiences";

// 5 attempts per 5 minutes
const limiter = createRateLimiter(5, 5 * 60 * 1000);

const subscribeSchema = z.object({
  email: z.string().email("Невалиден имейл адрес"),
  source: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    limiter.recordAttempt(ip);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Опитайте отново по-късно." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validated = subscribeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Моля, въведете валиден имейл адрес." },
        { status: 400 }
      );
    }

    const { email, source } = validated.data;
    const normalizedEmail = email.toLowerCase();
    const supabase = createServerClient();

    // Check if subscriber already exists (to detect new vs re-subscription)
    const { data: existing } = await (supabase as any)
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    const isNewSubscriber = !existing;

    // Upsert — re-subscribe if previously unsubscribed
    const { error } = await (supabase as any)
      .from("newsletter_subscribers")
      .upsert(
        {
          email: normalizedEmail,
          active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
          ...(source && { source }),
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

    // Add to Resend audience (fire-and-forget)
    addContact({ email: normalizedEmail, source: source || "website" }).catch(
      (err) => console.error("Resend contact error:", err)
    );

    // Send welcome email for new PWA subscribers (fire-and-forget)
    if (isNewSubscriber && source?.includes("pwa")) {
      sendWaitlistWelcomeEmail(normalizedEmail).catch((err) =>
        console.error("Welcome email error:", err)
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
