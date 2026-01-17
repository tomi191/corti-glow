import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { DiscountUpdate } from "@/lib/supabase/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/discounts/[id] - Get a single discount
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: discount, error } = await (supabase as any)
      .from("discounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Discount not found" }, { status: 404 });
      }
      console.error("Error fetching discount:", error);
      return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 });
    }

    return NextResponse.json({ discount });
  } catch (error) {
    console.error("Get discount error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/discounts/[id] - Update a discount
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const body = await request.json();

    const updates: DiscountUpdate = {};

    // Only include fields that are explicitly provided
    if (body.code !== undefined) updates.code = body.code.toUpperCase();
    if (body.type !== undefined) updates.type = body.type;
    if (body.value !== undefined) updates.value = body.value;
    if (body.min_order_value !== undefined) updates.min_order_value = body.min_order_value;
    if (body.max_uses !== undefined) updates.max_uses = body.max_uses;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.active !== undefined) updates.active = body.active;
    if (body.applies_to !== undefined) updates.applies_to = body.applies_to;
    if (body.product_ids !== undefined) updates.product_ids = body.product_ids;
    if (body.variant_ids !== undefined) updates.variant_ids = body.variant_ids;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: discount, error } = await (supabase as any)
      .from("discounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Discount not found" }, { status: 404 });
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Discount code already exists" }, { status: 400 });
      }
      console.error("Error updating discount:", error);
      return NextResponse.json({ error: "Failed to update discount" }, { status: 500 });
    }

    return NextResponse.json({ discount });
  } catch (error) {
    console.error("Update discount error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/discounts/[id] - Delete a discount
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("discounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting discount:", error);
      return NextResponse.json({ error: "Failed to delete discount" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete discount error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
