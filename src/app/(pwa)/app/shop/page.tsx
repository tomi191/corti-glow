"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePwaStore } from "@/stores/pwa-store";
import { getPhaseRecommendation, type CyclePhase } from "@/lib/pwa-logic";
import { Sparkles, Check, ShoppingBag } from "lucide-react";
import { productInfo, ingredients } from "@/data/products";

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Менструална фаза",
  follicular: "Фоликуларна фаза",
  ovulation: "Овулация",
  luteal: "Лутеална фаза",
};

export default function ShopPage() {
  const [mounted, setMounted] = useState(false);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-6">
        <div className="h-8 w-48 bg-white/40 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/30 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const phase = getCurrentPhase();
  const hasSetup = !!lastPeriodDate;
  const recommendation = getPhaseRecommendation(phase);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold text-brand-forest">
          Препоръки за теб
        </h1>
        {hasSetup && (
          <p className="text-sm text-stone-500 mt-1">
            Базирано на: <span className="font-semibold text-brand-forest">{PHASE_LABELS[phase]}</span>
          </p>
        )}
      </motion.div>

      {/* Phase-based recommendation card */}
      {hasSetup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-brand-forest rounded-[2rem] p-6 text-white space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              Защо точно сега
            </span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            {recommendation.benefit}
          </p>
          <div className="space-y-1.5 pt-1">
            {recommendation.ingredients.map((ing) => (
              <div key={ing} className="flex items-center gap-2 text-xs opacity-80">
                <Check className="w-3.5 h-3.5" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Product Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-[2rem] overflow-hidden"
      >
        <div className="relative h-48 bg-gradient-to-br from-brand-sage/20 to-brand-blush/20">
          <Image
            src={productInfo.image}
            alt={productInfo.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 512px) 100vw, 512px"
          />
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

          {/* Key ingredients */}
          <div className="flex flex-wrap gap-2">
            {ingredients.slice(0, 3).map((ing) => (
              <span
                key={ing.symbol}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-stone-200 text-stone-600"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: ing.color }}
                />
                {ing.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold text-brand-forest">49.99 лв.</span>
            <Link
              href="/produkt/corti-glow"
              className="flex items-center gap-2 px-5 py-3 bg-brand-forest text-white rounded-2xl text-sm font-semibold shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
            >
              <ShoppingBag className="w-4 h-4" />
              Виж повече
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Bundles */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 px-1">
          Пакетни оферти
        </h3>

        <Link
          href="/produkt/corti-glow"
          className="glass p-4 rounded-3xl flex items-center justify-between group"
        >
          <div>
            <p className="text-sm font-semibold text-stone-800">Glow Пакет (2 бр.)</p>
            <p className="text-xs text-stone-500">Спестяваш 14 лв.</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-brand-forest">85.99 лв.</span>
            <span className="block text-[10px] text-stone-400 line-through">99.98 лв.</span>
          </div>
        </Link>

        <Link
          href="/produkt/corti-glow"
          className="glass p-4 rounded-3xl flex items-center justify-between group"
        >
          <div>
            <p className="text-sm font-semibold text-stone-800">Пълен Рестарт (3 бр.)</p>
            <p className="text-xs text-stone-500">Спестяваш 30 лв.</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-brand-forest">119.99 лв.</span>
            <span className="block text-[10px] text-stone-400 line-through">149.97 лв.</span>
          </div>
        </Link>
      </motion.section>
    </div>
  );
}
