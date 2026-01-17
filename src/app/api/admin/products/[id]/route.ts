import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ProductUpdate } from "@/lib/supabase/types";
import { demoProducts } from "@/data/products";

// Check if we're in demo mode (no Supabase connection)
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Demo mode - find in mock data
    if (isDemoMode) {
      const product = demoProducts.find((p) => p.id === id || p.slug === id);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product, demo: true });
    }

    // Production mode
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: product, error } = await (supabase as any)
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      console.error("Error fetching product:", error);
      // Fallback to demo
      const demoProduct = demoProducts.find((p) => p.id === id || p.slug === id);
      if (demoProduct) {
        return NextResponse.json({ product: demoProduct, demo: true });
      }
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: ProductUpdate = {};

    // Only include fields that are explicitly provided
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.barcode !== undefined) updates.barcode = body.barcode;
    if (body.name !== undefined) updates.name = body.name;
    if (body.tagline !== undefined) updates.tagline = body.tagline;
    if (body.description !== undefined) updates.description = body.description;
    if (body.flavor !== undefined) updates.flavor = body.flavor;
    if (body.servings !== undefined) updates.servings = body.servings;
    if (body.price !== undefined) updates.price = body.price;
    if (body.compare_at_price !== undefined) updates.compare_at_price = body.compare_at_price;
    if (body.cost_price !== undefined) updates.cost_price = body.cost_price;
    if (body.image !== undefined) updates.image = body.image;
    if (body.images !== undefined) updates.images = body.images;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.low_stock_threshold !== undefined) updates.low_stock_threshold = body.low_stock_threshold;
    if (body.track_inventory !== undefined) updates.track_inventory = body.track_inventory;
    if (body.status !== undefined) updates.status = body.status;
    if (body.badge !== undefined) updates.badge = body.badge;
    if (body.features !== undefined) updates.features = body.features;
    if (body.ingredients !== undefined) updates.ingredients = body.ingredients;
    if (body.variants !== undefined) updates.variants = body.variants;
    if (body.how_to_use !== undefined) updates.how_to_use = body.how_to_use;
    if (body.meta_title !== undefined) updates.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description;
    if (body.weight !== undefined) updates.weight = body.weight;
    if (body.dimensions !== undefined) updates.dimensions = body.dimensions;
    if (body.published !== undefined) updates.published = body.published;

    // Demo mode - return mock updated product
    if (isDemoMode) {
      const existingProduct = demoProducts.find((p) => p.id === id || p.slug === id);
      if (!existingProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      const updatedProduct = {
        ...existingProduct,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ product: updatedProduct, demo: true });
    }

    // Production mode
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: product, error } = await (supabase as any)
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
      }
      console.error("Error updating product:", error);
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Demo mode - simulate deletion
    if (isDemoMode) {
      return NextResponse.json({ success: true, demo: true });
    }

    // Production mode
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
