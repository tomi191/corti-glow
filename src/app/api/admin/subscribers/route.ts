import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServerClient();

    let query = (supabase as any)
      .from("newsletter_subscribers")
      .select("id, email, active, source, subscribed_at", { count: "exact" })
      .order("subscribed_at", { ascending: false });

    if (search) {
      const sanitizedSearch = search
        .replace(/[%_,()]/g, "")
        .trim()
        .slice(0, 100);

      if (sanitizedSearch) {
        query = query.ilike("email", `%${sanitizedSearch}%`);
      }
    }

    query = query.range(offset, offset + limit - 1);

    const { data: subscribers, count, error } = await query;

    if (error) {
      console.error("Subscribers query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      subscribers: subscribers || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Subscribers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
