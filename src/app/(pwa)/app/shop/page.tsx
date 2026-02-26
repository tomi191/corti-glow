"use client";

import { useState, useEffect, useCallback, useRef, type PointerEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePwaStore } from "@/stores/pwa-store";
import { useCartStore } from "@/stores/cart-store";
import { trackPwaEvent } from "@/lib/pwa-analytics";
import { getPhaseRecommendation, type CyclePhase } from "@/lib/pwa-logic";
import { haptic } from "@/lib/haptics";
import {
  Sparkles,
  Check,
  ShoppingBag,
  Star,
  Tag,
  Package,
  Crown,
} from "lucide-react";
import { productInfo, productVariants, ingredients } from "@/data/products";

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Менструална фаза",
  follicular: "Фоликуларна фаза",
  ovulation: "Овулация",
  luteal: "Лутеална фаза",
};

// --- 3D Tilt Hook ---
function useTilt(maxDeg = 5) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: "perspective(600px) rotateX(0deg) rotateY(0deg)" });

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * maxDeg * 2;
      const rotateX = (0.5 - y) * maxDeg * 2;
      setStyle({ transform: `perspective(600px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)` });
    },
    [maxDeg]
  );

  const handlePointerLeave = useCallback(() => {
    setStyle({ transform: "perspective(600px) rotateX(0deg) rotateY(0deg)" });
  }, []);

  return { ref, style, handlePointerMove, handlePointerLeave };
}

// --- Shimmer Skeleton ---
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[2rem] overflow-hidden ${className ?? ""}`}
      style={{
        background: "linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// --- Stagger animation variants ---
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function ShopPage() {
  const [mounted, setMounted] = useState(false);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const addItem = useCartStore((s) => s.addItem);

  const productTilt = useTilt(5);

  useEffect(() => {
    setMounted(true);
    trackPwaEvent("shop_viewed");
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-5 py-6">
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <ShimmerSkeleton className="h-8 w-48" />
        <ShimmerSkeleton className="h-28" />
        <ShimmerSkeleton className="h-[380px]" />
        <ShimmerSkeleton className="h-20" />
        <ShimmerSkeleton className="h-20" />
      </div>
    );
  }

  const phase = getCurrentPhase();
  const hasSetup = !!lastPeriodDate;
  const recommendation = getPhaseRecommendation(phase);

  function handleAddToCart(variantId: string, name: string, price: number, image: string) {
    haptic.medium();
    addItem({
      id: `corti-glow-${variantId}`,
      productId: "corti-glow",
      variantId,
      title: `Corti-Glow — ${name}`,
      price,
      image,
    });
    trackPwaEvent("shop_add_to_cart", {
      variant_id: variantId,
      price,
    });
  }

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-5 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-2xl font-bold text-brand-forest">
          Препоръки за теб
        </h1>
        {hasSetup && (
          <p className="text-sm text-stone-500 mt-1">
            Базирано на:{" "}
            <span className="font-semibold text-brand-forest">
              {PHASE_LABELS[phase]}
            </span>
          </p>
        )}
      </motion.div>

      {/* Phase-based recommendation card */}
      {hasSetup && (
        <motion.div
          variants={itemVariants}
          className="relative bg-brand-forest rounded-[2rem] p-6 text-white space-y-3 overflow-hidden"
        >
          {/* Organic decorative shape */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 blur-sm" />

          <div className="relative flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              Защо точно сега
            </span>
          </div>
          <p className="relative text-sm leading-relaxed opacity-90">
            {recommendation.benefit}
          </p>
          <div className="relative space-y-1.5 pt-1">
            {recommendation.ingredients.map((ing) => (
              <div key={ing} className="flex items-center gap-2 text-xs opacity-80">
                <Check className="w-3.5 h-3.5" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Premium Product Card with 3D Tilt */}
      <motion.div variants={itemVariants}>
        <div
          ref={productTilt.ref}
          onPointerMove={productTilt.handlePointerMove}
          onPointerLeave={productTilt.handlePointerLeave}
          style={{ ...productTilt.style, transition: "transform 0.15s ease-out", willChange: "transform" }}
          className="glass rounded-[2rem] overflow-hidden shadow-xl shadow-brand-forest/5"
        >
          {/* Product image with gradient overlay */}
          <div className="relative h-56 bg-gradient-to-br from-brand-sage/20 via-brand-blush/10 to-brand-cream/20">
            <Image
              src={productInfo.image}
              alt={productInfo.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 512px) 100vw, 512px"
              priority
            />
            {/* Bottom gradient for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/80 to-transparent" />
            {/* Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-forest/90 text-white text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm">
              <Star className="w-3 h-3 fill-brand-cream text-brand-cream" />
              Бестселър
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div>
              <h3 className="text-lg font-display font-bold text-brand-forest">
                {productInfo.name}
              </h3>
              <p className="text-sm text-stone-500">{productInfo.tagline}</p>
            </div>

            <p className="text-xs text-stone-400">
              {productInfo.flavor} &middot; {productInfo.servings} саше
            </p>

            {/* Key ingredients chips */}
            <div className="flex flex-wrap gap-2">
              {ingredients.slice(0, 3).map((ing) => (
                <span
                  key={ing.symbol}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/60 border border-white/40 text-stone-600 backdrop-blur-sm"
                >
                  <span
                    className="w-2 h-2 rounded-full ring-1 ring-white/50"
                    style={{ background: ing.color }}
                  />
                  {ing.name}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-2xl font-bold text-brand-forest">
                  49.99
                </span>
                <span className="text-sm font-semibold text-brand-forest/70 ml-1">
                  лв.
                </span>
              </div>
              <button
                onClick={() =>
                  handleAddToCart(
                    "starter-box",
                    "Старт (1 бр.)",
                    49.99,
                    productInfo.image
                  )
                }
                className="flex items-center gap-2 px-5 py-3 bg-brand-forest text-white rounded-2xl text-sm font-semibold shadow-lg shadow-brand-forest/20 active:scale-[0.96] transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                Добави в кошницата
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bundle Offers */}
      <motion.section variants={itemVariants} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 px-1 flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          Пакетни оферти
        </h3>

        {productVariants
          .filter((v) => v.quantity > 1)
          .map((variant, i) => (
            <motion.div
              key={variant.id}
              variants={itemVariants}
              className="glass rounded-[2rem] p-4 flex items-center justify-between group shadow-md shadow-brand-forest/5 hover:shadow-lg hover:shadow-brand-forest/10 transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Mini product image */}
                {variant.image && (
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-brand-sage/10 to-brand-blush/10">
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {variant.name}
                    </p>
                    {variant.isBestSeller && (
                      <span className="flex-shrink-0 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-brand-cream/60 text-[10px] font-bold text-brand-forest uppercase">
                        <Crown className="w-2.5 h-2.5" />
                        Хит
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{variant.description}</p>
                  {variant.savings && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span className="text-[11px] font-semibold text-emerald-600">
                        Спестяваш {variant.savings} лв.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                <span className="text-sm font-bold text-brand-forest">
                  {variant.price.toFixed(2)} лв.
                </span>
                {variant.compareAtPrice && (
                  <span className="text-[10px] text-stone-400 line-through">
                    {variant.compareAtPrice.toFixed(2)} лв.
                  </span>
                )}
                <button
                  onClick={() =>
                    handleAddToCart(
                      variant.id,
                      `${variant.name} (${variant.quantity} бр.)`,
                      variant.price,
                      variant.image || productInfo.image
                    )
                  }
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-brand-forest text-white rounded-xl text-[11px] font-semibold active:scale-[0.96] transition-transform shadow-sm"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Добави
                </button>
              </div>
            </motion.div>
          ))}
      </motion.section>
    </motion.div>
  );
}
