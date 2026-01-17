import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Discount } from "@/lib/supabase/types";

// POST /api/discount/validate - Validate a discount code
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { code, subtotal, productIds, variantIds } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Моля, въведете код за отстъпка" },
        { status: 400 }
      );
    }

    // Fetch the discount by code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: discount, error } = await (supabase as any)
      .from("discounts")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !discount) {
      return NextResponse.json(
        { valid: false, error: "Невалиден код за отстъпка" },
        { status: 404 }
      );
    }

    const discountData = discount as Discount;

    // Check if discount is active
    if (!discountData.active) {
      return NextResponse.json(
        { valid: false, error: "Този код вече не е активен" },
        { status: 400 }
      );
    }

    // Check date validity
    const now = new Date();
    if (discountData.start_date && new Date(discountData.start_date) > now) {
      return NextResponse.json(
        { valid: false, error: "Този код все още не е активен" },
        { status: 400 }
      );
    }
    if (discountData.end_date && new Date(discountData.end_date) < now) {
      return NextResponse.json(
        { valid: false, error: "Този код е изтекъл" },
        { status: 400 }
      );
    }

    // Check usage limit
    if (discountData.max_uses && discountData.used_count >= discountData.max_uses) {
      return NextResponse.json(
        { valid: false, error: "Този код е достигнал лимита за използване" },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (discountData.min_order_value && subtotal < discountData.min_order_value) {
      return NextResponse.json(
        {
          valid: false,
          error: `Минимална поръчка за този код: ${discountData.min_order_value.toFixed(2)} €`,
        },
        { status: 400 }
      );
    }

    // Check product/variant applicability (if not "all")
    if (discountData.applies_to === "specific_products" && discountData.product_ids) {
      const hasApplicableProduct = productIds?.some((id: string) =>
        discountData.product_ids?.includes(id)
      );
      if (!hasApplicableProduct) {
        return NextResponse.json(
          { valid: false, error: "Този код не важи за продуктите в количката" },
          { status: 400 }
        );
      }
    }

    if (discountData.applies_to === "specific_variants" && discountData.variant_ids) {
      const hasApplicableVariant = variantIds?.some((id: string) =>
        discountData.variant_ids?.includes(id)
      );
      if (!hasApplicableVariant) {
        return NextResponse.json(
          { valid: false, error: "Този код не важи за вариантите в количката" },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountData.type === "percentage") {
      discountAmount = subtotal * (discountData.value / 100);
    } else {
      discountAmount = Math.min(discountData.value, subtotal); // Fixed amount, max = subtotal
    }

    return NextResponse.json({
      valid: true,
      discount: {
        code: discountData.code,
        type: discountData.type,
        value: discountData.value,
        amount: discountAmount,
        description:
          discountData.type === "percentage"
            ? `${discountData.value}% отстъпка`
            : `${discountData.value.toFixed(2)} € отстъпка`,
      },
    });
  } catch (error) {
    console.error("Validate discount error:", error);
    return NextResponse.json(
      { valid: false, error: "Грешка при проверка на кода" },
      { status: 500 }
    );
  }
}
