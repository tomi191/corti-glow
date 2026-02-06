import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { DiscountInsert } from "@/lib/supabase/types";

// GET /api/admin/discounts - List all discounts
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status"); // active, inactive, all
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("discounts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === "active") {
      query = query.eq("active", true);
    } else if (status === "inactive") {
      query = query.eq("active", false);
    }

    if (search) {
      const sanitizedSearch = search
        .replace(/[%_,()]/g, '')
        .trim()
        .slice(0, 100);
      if (sanitizedSearch) {
        query = query.ilike("code", `%${sanitizedSearch}%`);
      }
    }

    const { data: discounts, error, count } = await query;

    if (error) {
      console.error("Error fetching discounts:", error);
      return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }

    return NextResponse.json({
      discounts: discounts || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Discounts API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/discounts - Create a new discount
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const discount: DiscountInsert = {
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      min_order_value: body.min_order_value || null,
      max_uses: body.max_uses || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      active: body.active ?? true,
      applies_to: body.applies_to || "all",
      product_ids: body.product_ids || null,
      variant_ids: body.variant_ids || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("discounts")
      .insert(discount)
      .select()
      .single();

    if (error) {
      console.error("Error creating discount:", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "Discount code already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
    }

    return NextResponse.json({ discount: data }, { status: 201 });
  } catch (error) {
    console.error("Create discount error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
