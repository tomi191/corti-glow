"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, CheckCircle, Sparkles, Shield, Truck, TrendingUp } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    getSubtotal,
    isFreeShipping,
    getRemainingForFreeShipping,
    hasSubscriptionItem,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const hasSub = hasSubscriptionItem();
  const freeShipping = hasSub || isFreeShipping(); // Subscriptions always get free shipping
  const remaining = getRemainingForFreeShipping();
  const progress = Math.min(100, (subtotal / 80) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
            onClick={closeCart}
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Количка"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-white to-stone-50">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-10 h-10 rounded-xl bg-[#2D4A3E]/10 flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 text-[#2D4A3E]" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold text-[#2D4A3E]">
                    Твоята Количка
                  </h2>
                  <p className="text-xs text-stone-400">
                    {items.length} {items.length === 1 ? "продукт" : "продукта"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-3 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Затвори количката"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#B2D8C6]/10 to-[#FFC1CC]/10">
              {freeShipping ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-[#2D4A3E]"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <span className="font-bold text-sm">БЕЗПЛАТНА ДОСТАВКА АКТИВИРАНА!</span>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">
                      Още <strong className="text-[#2D4A3E]">{formatPrice(remaining)}</strong> за безплатна доставка
                    </span>
                    <span className="text-stone-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#B2D8C6] to-[#2D4A3E] rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-stone-400 space-y-6"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center"
                  >
                    <ShoppingBag className="w-10 h-10 text-stone-300" />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-medium text-stone-600 mb-1">Количката е празна</p>
                    <p className="text-sm text-stone-400">Добави продукти, за да започнеш</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeCart}
                    className="px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium text-sm shadow-lg shadow-[#2D4A3E]/20"
                  >
                    Разгледай Продуктите
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CartItem item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Upsell banner - show when only 1x starter box */}
                  {items.length === 1 &&
                    items[0].variantId === "starter-box" &&
                    items[0].quantity === 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#B2D8C6]/15 to-[#FFC1CC]/15 border border-[#B2D8C6]/30"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-[#2D4A3E] flex-shrink-0" />
                          <p className="text-stone-600">
                            Спести <strong className="text-[#2D4A3E]">58 €</strong> с 3-пакета!{" "}
                            <Link
                              href="/produkt"
                              onClick={closeCart}
                              className="text-[#2D4A3E] font-medium underline underline-offset-2 hover:text-[#1f352c]"
                            >
                              Виж пакетите
                            </Link>
                          </p>
                        </div>
                      </motion.div>
                    )}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="border-t border-stone-100 p-6 bg-gradient-to-t from-stone-50 to-white space-y-4"
              >
                {/* Trust badges */}
                <div className="flex justify-center gap-6 pb-4 border-b border-stone-100">
                  {[
                    { icon: Shield, label: "Сигурно плащане" },
                    { icon: Truck, label: "Бърза доставка" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2 text-xs text-stone-500">
                      <badge.icon className="w-4 h-4 text-[#B2D8C6]" />
                      {badge.label}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-stone-500">Общо</span>
                    <p className="text-2xl font-bold text-[#2D4A3E]">
                      {formatPrice(subtotal)}
                    </p>
                  </div>
                  {freeShipping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#B2D8C6]/20 text-[#2D4A3E]"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Безплатна доставка</span>
                    </motion.div>
                  )}
                </div>

                {/* Checkout Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full py-4 bg-[#2D4A3E] text-white rounded-2xl font-semibold shadow-xl shadow-[#2D4A3E]/30 hover:shadow-[#2D4A3E]/40 transition-shadow text-center relative overflow-hidden group"
                  >
                    <span className="relative z-10">{hasSub ? "Към Абонамент" : "Към Плащане"}</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    />
                  </Link>
                </motion.div>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-stone-500 hover:text-[#2D4A3E] transition-colors py-1"
                >
                  Продължи пазаруването
                </button>

                <p className="text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Защитено с SSL криптиране
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
