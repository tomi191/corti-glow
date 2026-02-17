"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

interface ProductBundlesProps {
  variants: ProductVariant[];
  productSlug: string;
  productName: string;
  outOfStock?: boolean;
}

export function ProductBundles({ variants, productSlug, productName, outOfStock }: ProductBundlesProps) {
  const { openWaitlist } = useWaitlist();
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.isBestSeller)?.id || variants[0].id
  );
  const [showSticky, setShowSticky] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const selectedVariant = variants.find((v) => v.id === selectedId)!;

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm font-medium text-stone-700">Избери пакет:</p>

        <div className="space-y-3">
          {variants.map((variant) => {
            const perServing = variant.quantity > 0
              ? (variant.price / (variant.quantity * 30)).toFixed(2)
              : null;
            const variantImage = variant.image || "/images/product-hero-box.webp";

            return (
              <label
                key={variant.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
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

                {/* Product thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 relative">
                  <Image
                    src={variantImage}
                    alt={variant.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedId === variant.id
                      ? "border-[#2D4A3E]"
                      : "border-stone-300"
                  }`}
                >
                  {selectedId === variant.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2D4A3E]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">
                      {variant.name}
                    </span>
                    {variant.isBestSeller && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D4A3E] bg-[#B2D8C6]/30 px-2.5 py-1 rounded-full">
                        Най-популярен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{variant.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[#2D4A3E]">
                    {formatPrice(variant.price)}
                  </p>
                  {variant.compareAtPrice && (
                    <p className="text-xs text-stone-400 line-through">
                      {formatPrice(variant.compareAtPrice)}
                    </p>
                  )}
                  {perServing && (
                    <p className="text-[10px] text-[#B2D8C6] font-medium">
                      {perServing} €/доза
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div ref={buttonRef}>
          {IS_PRELAUNCH ? (
            <button
              onClick={openWaitlist}
              className="w-full py-4 text-base rounded-xl font-medium bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:bg-[#1f352c] transition"
            >
              Запиши се Първа
            </button>
          ) : outOfStock ? (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-4 text-base rounded-xl font-medium bg-stone-300 text-stone-500 cursor-not-allowed"
              >
                Изчерпан
              </button>
              <p className="text-center text-sm text-stone-500">
                Очаквайте скоро — този продукт временно не е наличен.
              </p>
            </div>
          ) : (
            <AddToCartButton
              id={selectedVariant.id}
              productId={productSlug}
              variantId={selectedVariant.id}
              title={`${productName} (${selectedVariant.name})`}
              price={selectedVariant.price}
              image={selectedVariant.image || "/images/product-hero-box.webp"}
              variant="primary"
              className="py-4 text-base"
            />
          )}
        </div>

        {!IS_PRELAUNCH && !outOfStock && selectedVariant.savings && (
          <p className="text-center text-xs text-[#2D4A3E]">
            Спестяваш {selectedVariant.savings} € + Безплатна Доставка
          </p>
        )}
      </div>

      {/* Sticky mobile add-to-cart bar — hidden in prelaunch */}
      {showSticky && !outOfStock && !IS_PRELAUNCH && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-stone-100 p-3 md:hidden">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2D4A3E] truncate">
                {selectedVariant.name}
              </p>
              <p className="text-lg font-bold text-[#2D4A3E]">
                {formatPrice(selectedVariant.price)}
              </p>
            </div>
            <AddToCartButton
              id={selectedVariant.id}
              productId={productSlug}
              variantId={selectedVariant.id}
              title={`${productName} (${selectedVariant.name})`}
              price={selectedVariant.price}
              image={selectedVariant.image || "/images/product-hero-box.webp"}
              variant="primary"
              className="py-3 px-6 text-sm !w-auto flex-shrink-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
