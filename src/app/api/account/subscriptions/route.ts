import { NextRequest, NextResponse } from "next/server";
import { listCustomerSubscriptions } from "@/lib/actions/subscriptions";

// GET: List customer's subscriptions by email
export async function GET(request: NextRequest) {
  try {
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
