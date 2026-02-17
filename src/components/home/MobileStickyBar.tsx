"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Package, Sparkles, Mail } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

export function MobileStickyBar() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { openWaitlist } = useWaitlist();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const isFreeShipping = useCartStore((state) => state.isFreeShipping);

  const hasItems = items.length > 0;
  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 md:hidden z-40"
        >
          {/* Gradient blur backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-white/80 backdrop-blur-xl" />

          <div className="relative px-4 py-3 border-t border-stone-100">
            <AnimatePresence mode="wait">
              {IS_PRELAUNCH ? (
                // Prelaunch mode - show waitlist CTA
                <motion.div
                  key="waitlist-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC1CC]/30 to-[#B2D8C6]/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#2D4A3E]" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">VIP Списък</p>
                      <p className="text-sm font-semibold text-[#2D4A3E]">Ранен достъп + PDF</p>
                    </div>
                  </div>

                  <button
                    onClick={openWaitlist}
                    className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2D4A3E] to-[#3D5A4E] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#2D4A3E]/25 hover:shadow-xl hover:shadow-[#2D4A3E]/30 transition-all duration-300"
                  >
                    Запиши се Първа
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
              ) : hasItems ? (
                // Cart has items - show checkout prompt
                <motion.div
                  key="cart-mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B2D8C6] to-[#2D4A3E] flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </motion.div>
                      <motion.span
                        key={itemCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFC1CC] rounded-full flex items-center justify-center text-xs font-bold text-[#2D4A3E]"
                      >
                        {itemCount}
                      </motion.span>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">
                        {isFreeShipping() ? (
                          <span className="text-[#2D4A3E] font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Безплатна доставка
                          </span>
                        ) : (
                          "В количката"
                        )}
                      </p>
                      <motion.p
                        key={subtotal}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-lg font-bold text-[#2D4A3E]"
                      >
                        {subtotal.toFixed(2)} €
                      </motion.p>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2D4A3E] to-[#3D5A4E] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#2D4A3E]/25 hover:shadow-xl hover:shadow-[#2D4A3E]/30 transition-all duration-300"
                  >
                    Поръчай
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </Link>
                </motion.div>
              ) : (
                // Cart is empty - show bundle prompt
                <motion.div
                  key="browse-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC1CC]/30 to-[#B2D8C6]/30 flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#2D4A3E]" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Glow Пакет</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold text-[#2D4A3E]">85.99 €</p>
                        <span className="text-xs text-stone-400 line-through">119.99 €</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/produkt/corti-glow#bundles"
                    className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#B2D8C6] to-[#9AC8B6] text-[#2D4A3E] rounded-xl text-sm font-semibold shadow-lg shadow-[#B2D8C6]/25 hover:shadow-xl hover:shadow-[#B2D8C6]/30 transition-all duration-300"
                  >
                    Виж Пакетите
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Free shipping progress indicator */}
            {!IS_PRELAUNCH && hasItems && !isFreeShipping() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 pt-2 border-t border-stone-100"
              >
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Остават {(80 - subtotal).toFixed(0)} € за безплатна доставка</span>
                  <span className="text-[#B2D8C6] font-medium">80 €</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((subtotal / 80) * 100, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Safe area spacer for notched devices */}
          <div className="pb-[env(safe-area-inset-bottom)] bg-white" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
