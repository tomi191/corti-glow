"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart";

interface ProductBundlesProps {
  variants: ProductVariant[];
}

export function ProductBundles({ variants }: ProductBundlesProps) {
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.isBestSeller)?.id || variants[0].id
  );

  const selectedVariant = variants.find((v) => v.id === selectedId)!;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-stone-700">Избери пакет:</p>

      <div className="space-y-3">
        {variants.map((variant) => (
          <label
            key={variant.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
              selectedId === variant.id
                ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <input
              type="radio"
              name="bundle"
              value={variant.id}
              checked={selectedId === variant.id}
              onChange={() => setSelectedId(variant.id)}
              className="sr-only"
            />

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedId === variant.id
                  ? "border-[#2D4A3E]"
                  : "border-stone-300"
              }`}
            >
              {selectedId === variant.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#2D4A3E]" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900">
                  {variant.name}
                </span>
                {variant.isBestSeller && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D4A3E] bg-[#B2D8C6]/30 px-2 py-0.5 rounded-full">
                    Най-популярен
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">{variant.description}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-[#2D4A3E]">
                {formatPrice(variant.price)}
              </p>
              {variant.compareAtPrice && (
                <p className="text-xs text-stone-400 line-through">
                  {formatPrice(variant.compareAtPrice)}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <AddToCartButton
        id={selectedVariant.id}
        title={`Corti-Glow (${selectedVariant.name})`}
        price={selectedVariant.price}
        variant="primary"
        className="py-4 text-base"
      />

      {selectedVariant.savings && (
        <p className="text-center text-xs text-[#2D4A3E]">
          Спестяваш {selectedVariant.savings} лв + Безплатна Доставка
        </p>
      )}
    </div>
  );
}
