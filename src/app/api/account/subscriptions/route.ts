import { NextRequest, NextResponse } from "next/server";
import { listCustomerSubscriptions } from "@/lib/actions/subscriptions";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 5 lookups per minute per IP — prevents email enumeration
const limiter = createRateLimiter(5, 60 * 1000);

// GET: List customer's subscriptions by email
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много заявки. Опитайте отново след 1 минута." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Имейл адресът е задължителен" },
        { status: 400 }
      );
    }

    const { subscriptions, error } = await listCustomerSubscriptions(email);

    if (error) {
      return NextResponse.json(
        { error: "Грешка при зареждане на абонаментите" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("List subscriptions error:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на абонаментите" },
      { status: 500 }
    );
  }
}
