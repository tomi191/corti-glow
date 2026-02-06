"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Sparkles, Truck, Shield } from "lucide-react";
import { productVariants } from "@/data/products";
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

  const handleAddToCart = (variant: (typeof productVariants)[0]) => {
    addItem({
      id: variant.id,
      productId: "corti-glow",
      variantId: variant.id,
      title: `Corti-Glow (${variant.name})`,
      price: variant.price,
      image: "/images/product-hero-box.webp",
    });
  };

  return (
    <section ref={ref} id="bundles" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FFC1CC]/5 to-white" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full border border-[#B2D8C6]/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] rounded-full border border-[#FFC1CC]/10"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Започни Своята
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D4A3E] via-[#B2D8C6] to-[#FFC1CC]">
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
                  <motion.div
                    animate={
                      hoveredId === variant.id
                        ? { scale: 1.1, rotate: 3 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex gap-2"
                  >
                    {[...Array(variant.quantity)].map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-20 rounded-lg bg-gradient-to-b from-[#FFC1CC] to-[#FFC1CC]/80 shadow-lg"
                        style={{
                          transform: `rotate(${(i - 1) * 5}deg)`,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Price */}
                <div className="mb-6">
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
