"use client";

import { productVariants } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function BundlesSection() {
  return (
    <section id="bundles" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#2D4A3E] mb-4">
            Започни Своята Трансформация
          </h2>
          <p className="text-stone-500">
            30 дози във всяка кутия. Откажи се по всяко време.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {productVariants.map((variant) => (
            <div
              key={variant.id}
              className={`rounded-3xl p-8 flex flex-col ${
                variant.isBestSeller
                  ? "border-2 border-[#B2D8C6] bg-white relative shadow-xl shadow-[#B2D8C6]/10 transform md:-translate-y-4"
                  : "border border-stone-200 bg-stone-50 hover:shadow-lg transition"
              }`}
            >
              {variant.isBestSeller && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2D4A3E] text-[#B2D8C6] px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Най-Популярен
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-semibold text-stone-900">
                  {variant.name}
                </h3>
                <p className="text-stone-500 text-sm">{variant.description}</p>
              </div>

              {/* Box Visual */}
              <div
                className={`relative w-full aspect-video rounded-xl mb-6 border border-stone-100 flex items-center justify-center ${
                  variant.isBestSeller ? "bg-stone-50" : "bg-white"
                } ${variant.quantity > 2 ? "gap-1" : "gap-2"}`}
              >
                {[...Array(variant.quantity)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-[#FFC1CC] rounded-sm shadow-sm ${
                      variant.quantity > 2 ? "w-10 h-16" : "w-12 h-20"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-auto">
                <div className="flex flex-col mb-6">
                  <div className="flex items-end gap-2">
                    <span
                      className={`font-bold ${
                        variant.isBestSeller
                          ? "text-4xl text-[#2D4A3E]"
                          : "text-3xl text-stone-900"
                      }`}
                    >
                      {formatPrice(variant.price)}
                    </span>
                    {variant.compareAtPrice && (
                      <span className="text-stone-400 text-sm mb-1 line-through">
                        {formatPrice(variant.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  {variant.savings && (
                    <span className="text-[#2D4A3E] text-xs font-medium mt-1">
                      Спестяваш {variant.savings} лв + Безплатна Доставка
                    </span>
                  )}
                </div>

                <AddToCartButton
                  id={variant.id}
                  productId="corti-glow"
                  variantId={variant.id}
                  title={`Corti-Glow (${variant.name})`}
                  price={variant.price}
                  variant={variant.isBestSeller ? "primary" : "secondary"}
                  className={variant.isBestSeller ? "py-4" : "py-3"}
                />

                {variant.isBestSeller && (
                  <p className="text-center text-[10px] text-stone-400 mt-3">
                    100% Гаранция за връщане на парите
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
