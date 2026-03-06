// Admin Subscription Management API

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const sb = supabase as any;
    const { searchParams } = request.nextUrl;

    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = sb
      .from("glow_subscriptions")
      .select("*, customers!inner(email, first_name, last_name, phone)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      const sanitized = search.replace(/[%_,()]/g, "").trim().slice(0, 100);
      if (sanitized) {
        query = query.or(
          `customers.email.ilike.%${sanitized}%,customers.first_name.ilike.%${sanitized}%,customers.last_name.ilike.%${sanitized}%`
        );
      }
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("List subscriptions error:", error);
      return NextResponse.json(
        { error: "Грешка при зареждане на абонаментите" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptions: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Admin subscriptions error:", error);
    return NextResponse.json(
      { error: "Грешка при обработка" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Липсват id и action" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const sb = supabase as any;

    if (action === "cancel") {
      const { error } = await sb
        .from("glow_subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // TODO: Cancel Stripe subscription if stripe_subscription_id exists

      return NextResponse.json({ success: true, message: "Абонаментът е отменен" });
    }

    if (action === "pause") {
      const { error } = await sb
        .from("glow_subscriptions")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Абонаментът е паузиран" });
    }

    if (action === "resume") {
      const { error } = await sb
        .from("glow_subscriptions")
        .update({
          status: "active",
          paused_at: null,
        })
        .eq("id", id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Абонаментът е подновен" });
    }

    return NextResponse.json({ error: "Невалидно действие" }, { status: 400 });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Грешка при обработка" },
      { status: 500 }
    );
  }
}
