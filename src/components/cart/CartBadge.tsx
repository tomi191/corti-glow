"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function CartBadge() {
  const { openCart, getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const count = getItemCount();
  const [prevCount, setPrevCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (count !== prevCount && count > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    setPrevCount(count);
  }, [count, prevCount, mounted]);

  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative p-2.5 rounded-full hover:bg-[#2D4A3E]/5 transition-colors"
      aria-label="Количка"
    >
      <motion.div animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}>
        <ShoppingBag className="w-5 h-5 text-[#2D4A3E]" />
      </motion.div>

      <AnimatePresence>
        {mounted && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FFC1CC] to-[#B2D8C6] text-[#2D4A3E] text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold shadow-lg"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
