import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ProductInsert } from "@/lib/supabase/types";
import { demoProducts } from "@/data/products";

// Check if we're in demo mode (no Supabase connection)
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

// GET /api/admin/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Demo mode - return mock data
    if (isDemoMode) {
      let filtered = [...demoProducts];

      if (status && status !== "all") {
        filtered = filtered.filter((p) => p.status === status);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.slug.toLowerCase().includes(searchLower) ||
            p.sku?.toLowerCase().includes(searchLower)
        );
      }

      const paginated = filtered.slice(offset, offset + limit);

      return NextResponse.json({
        products: paginated,
        total: filtered.length,
        limit,
        offset,
        demo: true,
      });
    }

    // Production mode - use Supabase
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      // Sanitize search input to prevent PostgREST injection
      const sanitizedSearch = search
        .replace(/[%_,()]/g, '')
        .trim()
        .slice(0, 100);

      if (sanitizedSearch) {
        query = query.or(`name.ilike.%${sanitizedSearch}%,slug.ilike.%${sanitizedSearch}%,sku.ilike.%${sanitizedSearch}%`);
      }
    }

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      // Fallback to demo data on error
      return NextResponse.json({
        products: demoProducts,
        total: demoProducts.length,
        limit,
        offset,
        demo: true,
      });
    }

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Products API error:", error);
    // Fallback to demo data on error
    return NextResponse.json({
      products: demoProducts,
      total: demoProducts.length,
      limit: 50,
      offset: 0,
      demo: true,
    });
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product: ProductInsert = {
      slug: body.slug,
      sku: body.sku || null,
      barcode: body.barcode || null,
      name: body.name,
      tagline: body.tagline || null,
      description: body.description,
      flavor: body.flavor || null,
      servings: body.servings || null,
      price: body.price,
      compare_at_price: body.compare_at_price || null,
      cost_price: body.cost_price || null,
      image: body.image,
      images: body.images || [],
      stock: body.stock || 100,
      low_stock_threshold: body.low_stock_threshold || 10,
      track_inventory: body.track_inventory ?? true,
      status: body.status || "draft",
      badge: body.badge || null,
      features: body.features || [],
      ingredients: body.ingredients || [],
      variants: body.variants || [],
      how_to_use: body.how_to_use || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      weight: body.weight || 0.5,
      dimensions: body.dimensions || null,
      published: body.published ?? false,
    };

    // Demo mode - return mock created product
    if (isDemoMode) {
      const mockProduct = {
        ...product,
        id: `demo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ product: mockProduct, demo: true }, { status: 201 });
    }

    // Production mode
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    revalidateTag("products", { expire: 0 });
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
