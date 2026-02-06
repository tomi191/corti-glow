"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, MAX_CART_QUANTITY, type CartItem as CartItemType } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-stone-100 last:border-0">
      {/* Product Image */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-20 h-20 bg-gradient-to-br from-[#FFC1CC]/20 to-[#B2D8C6]/20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={item.image}
          alt={item.title}
          width={80}
          height={80}
          className="w-full h-full object-contain p-2"
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-[#2D4A3E] leading-tight mb-1 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-lg font-bold text-[#2D4A3E]">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity & Remove */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => updateQuantity(item.id, -1)}
              className="w-9 h-9 rounded-md flex items-center justify-center text-stone-500 hover:bg-white hover:text-[#2D4A3E] transition-colors"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-sm font-semibold w-8 text-center text-[#2D4A3E]"
            >
              {item.quantity}
            </motion.span>
            <motion.button
              whileHover={item.quantity < MAX_CART_QUANTITY ? { scale: 1.1 } : {}}
              whileTap={item.quantity < MAX_CART_QUANTITY ? { scale: 0.9 } : {}}
              onClick={() => updateQuantity(item.id, 1)}
              disabled={item.quantity >= MAX_CART_QUANTITY}
              className="w-9 h-9 rounded-md flex items-center justify-center text-stone-500 hover:bg-white hover:text-[#2D4A3E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-stone-500"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Remove Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => removeItem(item.id)}
            className="flex items-center gap-1 px-3 py-2 text-xs text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Премахни
          </motion.button>
        </div>
      </div>
    </div>
  );
}
