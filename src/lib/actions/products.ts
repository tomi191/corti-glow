"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";
import { unstable_cache } from "next/cache";

// Get single product by slug
// Cached for 1 hour to improve performance
export const getProduct = unstable_cache(
    async (slug: string): Promise<{ product: Product | null; error: string | null }> => {
        const supabase = createServerClient();

        try {
            const { data: product, error } = await supabase
                .from("products")
                .select("*")
                .eq("slug", slug)
                .eq("status", "active") // Only active products
                .single();

            if (error) {
                console.error(`Error fetching product ${slug}:`, error);
                return { product: null, error: error.message };
            }

            return { product: product as Product, error: null };
        } catch (err) {
            console.error(`Unexpected error fetching product ${slug}:`, err);
            return { product: null, error: "Failed to fetch product" };
        }
    },
    ["get-product-by-slug"],
    { revalidate: 3600, tags: ["products"] }
);

// List all active products
export const listProducts = unstable_cache(
    async (): Promise<{ products: Product[]; error: string | null }> => {
        const supabase = createServerClient();

        try {
            const { data: products, error } = await supabase
                .from("products")
                .select("*")
                .eq("status", "active")
                .eq("published", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching products:", error);
                return { products: [], error: error.message };
            }

            return { products: products as Product[], error: null };
        } catch (err) {
            console.error("Unexpected error fetching products:", err);
            return { products: [], error: "Failed to fetch products" };
        }
    },
    ["list-products"],
    { revalidate: 3600, tags: ["products"] }
);
