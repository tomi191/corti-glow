"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Sparkles, Truck, Shield, RefreshCw } from "lucide-react";
import { productVariants } from "@/data/products";
import { SUBSCRIPTION_VARIANTS, SUBSCRIPTION_DISCOUNT } from "@/lib/stripe/subscription-prices";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

export function PremiumBundles() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const addItem = useCartStore((state) => state.addItem);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);

  const handleAddToCart = (variant: (typeof productVariants)[0]) => {
    const subVariant = SUBSCRIPTION_VARIANTS[variant.id];
    addItem({
      id: isSubscription ? `${variant.id}-sub` : variant.id,
      productId: "corti-glow",
      variantId: variant.id,
      title: `Corti-Glow (${variant.name})${isSubscription ? " — Абонамент" : ""}`,
      price: isSubscription && subVariant ? subVariant.subscriptionPrice : variant.price,
      image: "/images/product-hero-box.webp",
      isSubscription,
      subscriptionPrice: subVariant?.subscriptionPrice,
      originalPrice: variant.price,
    });
  };

  return (
    <section ref={ref} id="bundles" className="py-16 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Избери Пакет
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Започни Своята
              <br />
              <span className="text-[#B2D8C6]">
                Трансформация
              </span>
            </h2>
          </AnimatedHeading>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-stone-600 font-light"
          >
            30 саше във всяка кутия. 14-дневна гаранция за връщане.
          </motion.p>
        </div>

        {/* Subscription Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center bg-stone-100 rounded-full p-1">
            <button
              onClick={() => setIsSubscription(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isSubscription
                  ? "bg-white text-[#2D4A3E] shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Еднократна покупка
            </button>
            <button
              onClick={() => setIsSubscription(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                isSubscription
                  ? "bg-[#2D4A3E] text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Абонамент — Спести {SUBSCRIPTION_DISCOUNT * 100}%
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {productVariants.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              onMouseEnter={() => setHoveredId(variant.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative ${variant.isBestSeller ? "md:-mt-8" : ""}`}
            >
              {variant.isBestSeller && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D4A3E] text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Най-Популярен
                  </span>
                </div>
              )}

              <GlassCard
                hover={false}
                className={`p-8 h-full flex flex-col transition-all duration-500 ${
                  variant.isBestSeller
                    ? "ring-2 ring-[#B2D8C6] shadow-[0_20px_60px_rgba(178,216,198,0.3)]"
                    : hoveredId === variant.id
                    ? "shadow-[0_20px_60px_rgba(45,74,62,0.15)]"
                    : ""
                }`}
              >
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[#2D4A3E]">
                    {variant.name}
                  </h3>
                  <p className="text-stone-500 text-sm">{variant.description}</p>
                </div>

                {/* Visual */}
                <div className="relative h-32 mb-6 flex items-center justify-center">
                  <div className="flex gap-2">
                    {[...Array(variant.quantity)].map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-20 rounded-lg bg-[#FFC1CC] shadow-sm"
                        style={{
                          transform: `rotate(${(i - 1) * 5}deg)`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isSubscription ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl font-bold ${
                            variant.isBestSeller ? "text-[#2D4A3E]" : "text-stone-800"
                          }`}
                        >
                          {formatPrice(SUBSCRIPTION_VARIANTS[variant.id]?.subscriptionPrice ?? variant.price)}
                        </span>
                        <span className="text-stone-400 line-through">
                          {formatPrice(variant.price)}
                        </span>
                        <span className="text-xs text-stone-500">/месец</span>
                      </div>
                      <p className="text-[#2D4A3E] text-sm font-medium mt-1">
                        + Безплатна доставка · Отказ по всяко време
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl font-bold ${
                            variant.isBestSeller ? "text-[#2D4A3E]" : "text-stone-800"
                          }`}
                        >
                          {formatPrice(variant.price)}
                        </span>
                        {variant.compareAtPrice && (
                          <span className="text-stone-400 line-through">
                            {formatPrice(variant.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      {variant.savings && (
                        <p className="text-[#2D4A3E] text-sm font-medium mt-1">
                          Спестяваш {variant.savings} €
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-[#B2D8C6]" />
                    {variant.quantity * 30} саше
                  </li>
                  {variant.quantity >= 2 && (
                    <li className="flex items-center gap-2 text-sm text-stone-600">
                      <Truck className="w-4 h-4 text-[#B2D8C6]" />
                      Безплатна доставка
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-sm text-stone-600">
                    <Shield className="w-4 h-4 text-[#B2D8C6]" />
                    14-дневна гаранция
                  </li>
                </ul>

                {/* CTA */}
                <MagneticButton
                  variant={variant.isBestSeller ? "primary" : "secondary"}
                  size="md"
                  className="w-full"
                  onClick={() => handleAddToCart(variant)}
                >
                  Добави в Количката
                </MagneticButton>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
