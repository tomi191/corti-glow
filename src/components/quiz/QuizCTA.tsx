"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";

interface QuizCTAProps {
  variant: {
    id: string;
    name: string;
    price: number;
    tagline: string;
  };
}

export function QuizCTA({ variant }: QuizCTAProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: variant.id,
      productId: "corti-glow",
      variantId: variant.id,
      title: `Corti-Glow (${variant.name})`,
      price: variant.price,
      image: "/images/product-hero-box.webp",
    });
    setAdded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="text-center mb-4">
          <p className="text-sm text-stone-500 mb-1">Препоръчан за теб</p>
          <h3 className="text-xl font-semibold text-[#2D4A3E]">
            {variant.name}
          </h3>
          <p className="text-sm text-stone-600 mt-1">{variant.tagline}</p>
        </div>

        <div className="text-center mb-5">
          <span className="text-3xl font-bold text-[#2D4A3E]">
            €{variant.price.toFixed(2)}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={added}
          className={`
            w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full text-base font-medium transition-all
            ${
              added
                ? "bg-[#B2D8C6] text-[#2D4A3E]"
                : "bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:shadow-xl"
            }
          `}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              Добавено в Количката
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              Добави в Количката
            </>
          )}
        </motion.button>

        <p className="text-xs text-stone-400 text-center mt-3">
          Безплатна доставка над €80 · Отказ до 14 дни
        </p>
      </div>
    </motion.div>
  );
}
