// Admin Customers API

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServerClient();

    // Query the customers view
    let query = supabase
      .from("customers")
      .select("email, first_name, last_name, phone, order_count, total_spent", { count: "exact" })
      .order("total_spent", { ascending: false });

    if (search) {
      // Sanitize search input to prevent PostgREST injection
      const sanitizedSearch = search
        .replace(/[%_,()]/g, '')
        .trim()
        .slice(0, 100);

      if (sanitizedSearch) {
        query = query.or(
          `email.ilike.%${sanitizedSearch}%,first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%`
        );
      }
    }

    query = query.range(offset, offset + limit - 1);

    const { data: customers, count, error } = await query;

    if (error) {
      console.error("Customers query error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customers: customers || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
