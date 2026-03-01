"use client";

import { useState, useEffect, useCallback, useRef, type PointerEvent, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePwaStore } from "@/stores/pwa-store";
import { trackPwaEvent } from "@/lib/pwa-analytics";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { getPhaseRecommendation, getConcernRecommendations, type CyclePhase, type ConcernOption } from "@/lib/pwa-logic";
import { haptic } from "@/lib/haptics";
import { staggerContainer, staggerItem } from "@/lib/framer-variants";
import {
  Sparkles,
  Check,
  Bell,
  Star,
  Tag,
  Package,
  Crown,
  Heart,
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


export default function ShopPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const concerns = usePwaStore((s) => s.concerns);

  const productTilt = useTilt(5);

  const source = searchParams.get("src");
  useEffect(() => {
    setMounted(true);
    trackPwaEvent("shop_viewed", { source: source ?? "direct" });
  }, [source]);

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
  const concernRecs = getConcernRecommendations(concerns);

  function handleWaitlist() {
    haptic.medium();
    setWaitlistOpen(true);
    trackPwaEvent("shop_waitlist_clicked", { source: source ?? "direct" });
  }

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-5 py-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="font-display text-xl font-bold text-brand-forest">
          {concernRecs.length > 0 ? "Точно за теб" : "Препоръки за теб"}
        </h1>
        {hasSetup && (
          <p className="text-sm text-stone-500 mt-1">
            Базирано на:{" "}
            <span className="font-semibold text-brand-forest">
              {PHASE_LABELS[phase]}
            </span>
            {concernRecs.length > 0 && " + твоите нужди"}
          </p>
        )}
      </motion.div>

      {/* Concern-based personalized recommendations */}
      {concernRecs.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="glass rounded-[2rem] p-5 space-y-3 border border-brand-sage/20"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-brand-forest" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
              За твоите нужди
            </span>
          </div>
          <div className="space-y-2.5">
            {concernRecs.slice(0, 3).map((rec) => (
              <div key={rec.ingredient} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-brand-forest" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {rec.ingredient} <span className="text-xs font-normal text-stone-400">({rec.dosage})</span>
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {rec.claim}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 pt-1">
            Базирано на: {concerns.map((c) => {
              const labels: Record<ConcernOption, string> = {
                stress: "Стрес", sleep: "Лош сън", skin: "Кожа", pms: "ПМС",
                bloating: "Подуване", fatigue: "Умора", anxiety: "Тревожност", irregular: "Нередовен цикъл",
              };
              return labels[c];
            }).join(", ")}
          </p>
        </motion.div>
      )}

      {/* Phase-based recommendation card */}
      {hasSetup && (
        <motion.div
          variants={staggerItem}
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
      <motion.div variants={staggerItem}>
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
                onClick={handleWaitlist}
                className="flex items-center gap-2 px-5 py-3.5 bg-brand-forest text-white rounded-2xl text-base font-semibold shadow-lg shadow-brand-forest/20 active:scale-[0.96] transition-transform"
              >
                <Bell className="w-4 h-4" />
                Запиши ме първа
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bundle Offers */}
      <motion.section variants={staggerItem} className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 px-1 flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          Пакетни оферти
        </h3>

        {productVariants
          .filter((v) => v.quantity > 1)
          .map((variant, i) => (
            <motion.div
              key={variant.id}
              variants={staggerItem}
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
                  onClick={handleWaitlist}
                  className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-brand-forest text-white rounded-xl text-[11px] font-semibold active:scale-[0.96] transition-transform shadow-sm"
                >
                  <Bell className="w-3 h-3" />
                  Запиши ме
                </button>
              </div>
            </motion.div>
          ))}
      </motion.section>

      {/* Social proof */}
      <motion.div
        variants={staggerItem}
        className="glass rounded-[2rem] p-5 space-y-3"
      >
        <div className="text-center">
          <p className="text-2xl font-display font-bold text-brand-forest">1,200+</p>
          <p className="text-xs text-stone-500">жени вече следят цикъла си с LURA</p>
        </div>
        <div className="space-y-2">
          <div className="bg-white/60 rounded-xl px-4 py-3">
            <p className="text-xs text-stone-600 leading-relaxed italic">
              &ldquo;Най-после разбирам защо се чувствам така в определени дни. Спрях да се обвинявам.&rdquo;
            </p>
            <p className="text-[11px] text-stone-400 mt-1 font-semibold">— Мария, 29</p>
          </div>
          <div className="bg-white/60 rounded-xl px-4 py-3">
            <p className="text-xs text-stone-600 leading-relaxed italic">
              &ldquo;Дихателното упражнение ми помага повече от колкото очаквах. 4 минути и стресът спада.&rdquo;
            </p>
            <p className="text-[11px] text-stone-400 mt-1 font-semibold">— Елена, 32</p>
          </div>
        </div>
      </motion.div>

      {/* Pre-launch info */}
      <motion.div
        variants={staggerItem}
        className="glass rounded-[2rem] p-5 text-center space-y-2"
      >
        <p className="text-sm font-semibold text-brand-forest">
          Corti-Glow се произвежда в момента
        </p>
        <p className="text-xs text-stone-500 leading-relaxed">
          Запиши се в списъка и бъди първата с <span className="font-bold text-brand-forest">20% отстъпка</span> при старта.
        </p>
      </motion.div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        source="pwa-shop"
      />
    </motion.div>
  );
}
